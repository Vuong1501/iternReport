/* eslint-disable camelcase */

import _ from 'lodash';
import Model from '../models/models';

/*
exampTree   :
                            1a                                          1b
                        |       |                                   |       |
                      2a          2b                              2c          2d
                  |       |           |                           |         |      |
                3a       3b            3c                        3d       3e        3f
                         |                                                          |
                         4a                                                         4b

*/

/* getParent_ForOne
input : 3b
output:  3b   --parent--> 2a  --parent--> 1a
         {...3b,3b.parent = 2a,  2a.parent = 1a  }
*/
const getParent_ForOne = (
  current,
  model,
  { attributes = null, include = null, otherWhere = {} },
  parentKey,
  currentKey
) => {
  return new Promise(async (resolve, reject) => {
    try {
      // console.log('getParent_ForOne', model);

      if (current[`${currentKey}`] && Number(current[`${parentKey}`]) !== 0) {
        const whereFillTer = {};

        whereFillTer[`${currentKey}`] = current[`${parentKey}`];
        // console.log('whereFillTer Parent', { ...whereFillTer, ...otherWhere });
        let dataParent = await Model.findOne(model, {
          where: { ...whereFillTer, ...otherWhere },
          attributes: attributes,
          include: include
        }).catch(error => {
          console.log('err', error);
        });

        if (dataParent) {
          dataParent = JSON.parse(JSON.stringify(dataParent));

          dataParent = await getParent_ForOne(
            dataParent,
            model,
            { attributes, include, otherWhere },
            parentKey,
            currentKey
          );
          current.parent = dataParent;
        }
      }

      return resolve(current);
    } catch (error) {
      reject(error);
    }
  });
};

// tương tự getParent_ForOne , thêm 1 bước là kiểm tra đã có parent trong checkObject chưa
// dùng để lấy parent cho nhiều phần tử riêng biêt và tránh gọi lại databse khi đã lấy parent từ lần trước

/* getChildren_ForOne
output:  2d   --children--> 3e
              --children--> 3f  --children--> 4b

         {...2d, 2d.children = [3e,3f],  3f.children = 4b  }
*/
const getChildren_ForOne = (
  current,
  model,
  { attributes = null, include = null, otherWhere = {} },
  parentKey,
  currentKey
) => {
  // console.log('getChildren_ForOne', model);

  return new Promise(async (resolve, reject) => {
    try {
      if (current[`${currentKey}`]) {
        const whereFillTer = {};

        whereFillTer[`${parentKey}`] = current[`${currentKey}`];
        // console.log('attributes1');
        // console.log('attributes1', attributes);
        // console.log('whereFillTer', { ...whereFillTer, ...otherWhere });
        let dataListChild = await Model.findAll(model, {
          where: { ...whereFillTer, ...otherWhere },
          attributes: attributes,
          include: include
        }).catch(error => {
          console.log('err', error);
        });

        dataListChild = JSON.parse(JSON.stringify(dataListChild));
        if (dataListChild.length > 0) {
          current.children = [];
          await Promise.all(
            dataListChild.map(async element => {
              element = await getChildren_ForOne(
                element,
                model,
                { attributes, include, otherWhere },
                parentKey,
                currentKey
              );
              current.children.push(element);
            })
          );
        }
      }

      return resolve(current);
    } catch (error) {
      reject(error);
    }
  });
};

/*  getChildren_notCheck  : đầu vào là các nốt không cùng 1 nhánh => không cần kiểm tra đã tìm thấy chưa
input : [2a,2d ]
output:  2d   --children--> 3e
              --children--> 3f  --children--> 4b

         2a   --children--> 3a
              --children--> 3b  --children--> 4a

        [
          {...2d, 2d.children = [3e,3f],  3f.children = 4b  },
          {...2a, 2a.children = [3a,3b],  3b.children = 4b  }
        ]
*/

/* getParent_Tree_ForOne_check
input : current =4a
        checkObject : 2a              // đã có dữ liệu của 2a
output:  4a --parent--> 3b  --parent--> 2a  (checkObject = true) -> dừng lại
         {...4a,4a.parent = 3b,3b.parent = 2a, ...2a }
*/

const get_parent_Check = async (
  current = {},
  model,
  checkObject = {},
  { attributes = null, include = null, otherWhere = {} },
  result = [],
  parentKey,
  currentKey,
  firtParent = 0
) => {
  // console.log('getParent_Tree', model);

  try {
    if (checkObject[current[parentKey]]) {
      // checkObject[`${current[parentKey]}`].children.push(current);
    } else if (current[`${parentKey}`] && Number(current[`${parentKey}`]) !== Number(firtParent)) {
      checkObject[current[parentKey]] = {
        [currentKey]: current[parentKey],
        children: [current]
      };

      const whereFillTer = {};

      whereFillTer[`${currentKey}`] = current[`${parentKey}`];

      const parentResult = await Model.findOne(model, {
        where: { ...whereFillTer, ...otherWhere },
        attributes: attributes,
        include: include
      }).catch(error => {
        console.log('err', error);
      });

      checkObject[current[parentKey]] = {
        ...JSON.parse(JSON.stringify(parentResult)),
        ...checkObject[current[parentKey]]
      };

      result.push(checkObject[current[parentKey]]);
      await get_parent_Check(
        checkObject[current[parentKey]],
        model,
        checkObject,
        { attributes, include, otherWhere },
        result,
        parentKey,
        currentKey,
        firtParent
      );
    }

    return true;
  } catch (error) {
    console.log('error', error);
  }
};

const get_children_Check = async (
  current = {},
  model,
  checkObject = {},
  { attributes = null, include = null, otherWhere = {} },
  result = [],
  parentKey,
  currentKey
) => {
  // console.log('getParent_Tree', model);

  try {
    const whereFillTer = {};

    whereFillTer[`${parentKey}`] = current[`${currentKey}`];

    let childrenResult = await Model.findAll(model, {
      where: { ...whereFillTer, ...otherWhere },
      attributes: attributes,
      include: include
    }).catch(error => {
      console.log('err', error);
    });

    if (childrenResult && childrenResult.length > 0) {
      childrenResult = JSON.parse(JSON.stringify(childrenResult));
      await Promise.all(
        childrenResult.map(async children => {
          if (!checkObject[children[currentKey]]) {
            children.children = [];
            checkObject[children[currentKey]] = children;
            current.children.push(checkObject[children[currentKey]]);
            await get_children_Check(
              children,
              model,
              checkObject,
              { attributes, include, otherWhere },
              result,
              parentKey,
              currentKey
            );
          } else {
            current.children.push(children);
          }
        })
      );
    }

    return true;
  } catch (error) {
    console.log('error', error);
  }
};

const getChildren_Tree = (
  current = [],
  model,
  { attributes = null, include = null, otherWhere = {} },
  parentKey,
  currentKey
) => {
  // console.log('getChildren_Tree', model);

  return new Promise(async (resolve, reject) => {
    try {
      if (current.length > 0) {
        const result = await Promise.all(
          current.map(async currentElement => {
            await getChildren_ForOne(currentElement, model, { attributes, include, otherWhere }, parentKey, currentKey);

            return currentElement;
          })
        );

        resolve(result);
      } else {
        resolve([]);
      }
      // console.log('arrayChild=======', JSON.stringify(current));
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  get_tree_forOne: async (
    current,
    model,
    { attributes = null, include = null, otherWhere = {} },
    parentKey,
    currentKey
  ) => {
    await Promise.all([
      getParent_ForOne(current, model, { attributes, include, otherWhere }, parentKey, currentKey),
      getChildren_ForOne(current, model, { attributes, include, otherWhere }, parentKey, currentKey)
    ]);

    return current;
  },
  getChildren_ForOne: async (
    current,
    model,
    { attributes = null, include = null, otherWhere = {} },
    parentKey,
    currentKey
  ) => {
    await getChildren_ForOne(current, model, { attributes, include, otherWhere }, parentKey, currentKey);

    return current;
  },

  getParent_ForOne: async (
    current,
    model,
    { attributes = null, include = null, otherWhere = {} },
    parentKey,
    currentKey
  ) => {
    await getParent_ForOne(current, model, { attributes, include, otherWhere }, parentKey, currentKey);

    return current;
  },

  getChildren_Tree,
  createTree: (data = [], currentKey = 'id', parentKey = 'parentId', firstParentValue = 0) => {
    // if (dataFilter.length === 0) {
    const dataObjectResult = {};
    const dataResult = [];

    data.forEach(dataElement => {
      dataElement.children = dataElement.children || [];

      if (
        !dataObjectResult[dataElement[currentKey]] ||
        (dataObjectResult[dataElement[currentKey]] && dataObjectResult[dataElement[currentKey]].created)
      ) {
        if (!dataObjectResult[dataElement[currentKey]]) {
          dataObjectResult[dataElement[currentKey]] = dataElement;
        } else {
          dataElement.children = dataObjectResult[dataElement[currentKey]].children;
          dataObjectResult[dataElement[currentKey]] = dataElement;
        }
        if (Number(dataElement[parentKey]) === firstParentValue) {
          dataResult.push(dataElement);
        } else if (dataObjectResult[dataElement[parentKey]]) {
          dataObjectResult[dataElement[parentKey]].children.push(dataElement);
        } else {
          dataObjectResult[dataElement[parentKey]] = {
            children: [dataElement],
            created: true
          };
        }
      }
    });

    return dataResult;
    // }
  },
  getTree_from_many_node: async (
    listNode,
    model,
    { attributes = null, include = [], otherWhere = {} },
    parentKey,
    currentKey,
    firtParent = 0
  ) => {
    const checkObject = {};
    const result = [];

    listNode.forEach(current => {
      result.push(current);
      current.children = [];
      checkObject[current[currentKey]] = current;
    });

    await Promise.all(
      result.map(async currentElement => {
        await get_parent_Check(
          currentElement,
          model,
          checkObject,
          { attributes, include, otherWhere },
          result,
          parentKey,
          currentKey,
          firtParent
        );

        await get_children_Check(
          currentElement,
          model,
          checkObject,
          { attributes, include, otherWhere },
          result,
          parentKey,
          currentKey
        );
      })
    );

    return result.filter(e => {
      return Number(e.parentId) === Number(firtParent);
    });
  }
};
