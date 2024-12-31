import Model from '../models/models';
import models from '../entity/index';
import _ from 'lodash';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import * as ApiErrors from '../errors';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
import treeHelper from '../helpers/treeHelper';

const { sequelize, Op, users, menus, userGroupRoles, menuPositions } = models;

/**
 *
 * @param {Array} array
 * @param {Object} parent
 * @param {Array} tree
 * @param {Number} arrTreeId
 */
const makeTreeArray = (array, parent, tree, arrTreeId) => {
  arrTreeId = typeof arrTreeId !== 'undefined' ? arrTreeId : [];
  tree = typeof tree !== 'undefined' ? tree : [];
  parent = typeof parent !== 'undefined' ? parent : { id: 0 };

  const children = _.filter(array, function (child) {
    // console.log("child.MenuParentID: %o, parent.id", child.MenuParentId, parent.id)
    const ok = Number(child.parentId) === Number(parent.id);

    if (ok) arrTreeId.push(child.id);

    return Number(child.parentId) === Number(parent.id);
  });

  if (!_.isEmpty(children)) {
    if (Number(parent.id) === 0) {
      tree = children;
    } else {
      tree = children;
      // parent['children'] = children;
      parent = _.assign(parent, { dataValues: { ...parent.dataValues, children } });
      // console.log("parent: ", parent.dataValues)
    }
    _.each(children, function (child) {
      makeTreeArray(array, child, tree, arrTreeId);
    });
  }

  return {
    tree,
    arrTreeId
  };
};

export default {
  get_list: param =>
    new Promise((resolve, reject) => {
      try {
        const filter = param.filter;
        const range = param.range;
        const att = filterHelpers.atrributesHelper(param.attributes);

        const perPage = range[1] - range[0] + 1;
        // const page = (range[0] / perPage)
        const sort = param.sort || ['id', 'asc'];

        console.log('get_all filter: ', filter);
        let whereFilter, nameFilter;

        if (filter.menusName) {
          nameFilter = {
            menusName: { $like: sequelize.literal(`CONCAT('%','${filter.menusName}','%')`) }
          };
          whereFilter = _.assign(filter, nameFilter);
        }

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        Model.findAndCountAll(menus, {
          where: whereFilter,
          order: sort,
          offset: range[0],
          attibutes: att,
          limit: perPage,
          distinct: true
          // include: [
          //   {
          //     model: menuPositions, as: 'menuPositions'
          //   }
          // 	// { model: Menu, as: 'MenuParent', required: false },
          // ]
        })
          .then(result => {
            resolve(result);
          })
          .catch(error => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    }),
  get_one: async param => {
    let finnalyResult;

    try {
      // console.log("Menu Model param: %o | id: ", param, param.id)
      const { id, attributes } = param;
      const att = filterHelpers.atrributesHelper(attributes);

      const include = [
        {
          model: users,
          as: 'userCreators',
          attributes: ['id', 'fullname', 'username']
        }
      ];

      include.push({
        model: menuPositions,
        as: 'menuPositions'
      });

      const result = await Promise.all([
        menus.findOne({
          where: { id },
          attributes: att,
          include
        })
        // menus.findOne({
        //   where: { id },
        //   attributes: att,
        //   // include
        // })
      ]).catch(error => {
        throw error;
      });

      if (!result[0]) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }

      // if (!result[1]) {
      //   throw new ApiErrors.BaseError({
      //     statusCode: 202,
      //     type: 'getInfoNoPermision'
      //   });
      // }

      finnalyResult = result[0];
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'getListError', 'MenuService');
    }

    return finnalyResult;
  },
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('MenusService create: ', entity);
      let whereFilter = {
        menusName: entity.menusName,
        menuPositionsId: entity.menuPositionsId
      };

      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['menusName'], whereFilter, 'menus');

      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            Model.findOne(menus, { attributes: ['id'], where: whereFilter }),
            entity.menusName ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.menus.menusName' }
          ),
          preCheckHelpers.createPromiseCheckNew(
            Model.findOne(menus, {
              attributes: ['id'],
              where: {
                id: entity.parentId,

                menuPositionsId: entity.menuPositionsId
              }
            }),
            Number(entity.parentId) ? true : false,
            TYPE_CHECK.CHECK_EXISTS,
            { parent: 'api.menus.parent' }
          )
        ])
      );

      if (!preCheckHelpers.check(infoArr)) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Không xác thực được thông tin gửi lên'
        });
      }

      finnalyResult = await Model.create(menus, entity).catch(error => {
        ErrorHelpers.errorThrow(error, 'crudError', 'MenusService', 202);
      });

      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'MenusService');
    }

    return { result: finnalyResult };
  },

  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('MenusService update: ', entity);

      const foundMenu = await Model.findOne(menus, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw preCheckHelpers.createErrorCheck(
          { typeCheck: TYPE_CHECK.GET_INFO, modelStructure: { parent: 'menus' } },
          error
        );
      });

      if (foundMenu) {
        let whereFilter = {
          id: { $ne: param.id },
          menusName: entity.menusName || foundMenu.menusName,
          menuPositionsId: entity.menuPositionsId || foundMenu.menuPositionsId
        };

        whereFilter = await filterHelpers.makeStringFilterAbsolutely(['menusName'], whereFilter, 'menus');

        const infoArr = Array.from(
          await Promise.all([
            preCheckHelpers.createPromiseCheckNew(
              Model.findOne(menus, { attributes: ['id'], where: whereFilter }),
              entity.menusName ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.menus.menusName' }
            ),
            preCheckHelpers.createPromiseCheckNew(
              Model.findOne(menus, {
                attributes: ['id'],
                where: {
                  id: entity.parentId || foundMenu.parentId,
                  menuPositionsId: entity.menuPositionsId || foundMenu.menuPositionsId
                }
              }),

              Number(entity.parentId) ? true : false,
              TYPE_CHECK.CHECK_EXISTS,
              { parent: 'api.menus.parent' }
            )
          ])
        );

        if (!preCheckHelpers.check(infoArr)) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'getInfoError',
            message: 'Không xác thực được thông tin gửi lên'
          });
        }
        if (entity.hasOwnProperty('status')) {
          const arrTreeId = [];
          const array = [foundMenu];

          if (entity.status === Number(0)) {
            await filterHelpers.makeTreeArrayChildSearch(array, arrTreeId, menus);
          } else if (entity.status === Number(1)) {
            await filterHelpers.makeTreeArrayParentSearch(array, arrTreeId, menus);
          }
          await menus.update(
            { status: entity.status },
            {
              where: {
                id: {
                  [Op.in]: arrTreeId
                }
              }
            }
          );
        }
        await Model.update(menus, entity, { where: { id: parseInt(param.id) } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        finnalyResult = await Model.findOne(menus, { where: { Id: param.id } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            error
          });
        });

        if (!finnalyResult) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo'
          });
        }
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }
    } catch (error) {
      console.log('error: ', error);
      ErrorHelpers.errorThrow(error, 'crudError', 'MenusService');
    }

    return { result: finnalyResult };
  },

  get_tree: async param => {
    let finnalyResult;
    const { filter, range, sort } = param;

    if (param.attributes) {
      if (!param.attributes.includes('id')) {
        param.attributes = param.attributes + ',id';
      }
      if (!param.attributes.includes('parentId')) {
        param.attributes = param.attributes + ',parentId';
      }
    }

    const attributes = param.attributes
      ? param.attributes
      : 'id, menusName, url, icon, parentId, menuPositionsId, orderBy, status, userCreatorsId, dateUpdated, dateCreated, urlSlugs, displayChild';

    console.log('getTree', filter);

    const parentKey = 'parentId';
    const currentKey = 'id';

    if (filter.parentId && Number(filter.parentId) === 0) {
      delete filter.parentId;
    }
    let whereFilter = _.omit(filter, ['status', parentKey]);
    const otherWhere = _.pick(filter, []);
    const whereParent = _.pick(filter, [parentKey]);
    const filterStatus = _.pick(filter, ['status']);
    // const whereSites = {};
    let resultTree = [];
    let result;

    // const includeSties = [];

    const include = [];

    try {
      whereFilter = await filterHelpers.combineFromDateWithToDate(whereFilter);
    } catch (error) {
      throw error;
    }

    whereFilter = await filterHelpers.makeStringFilterRelatively(['menusName', 'menusCode'], whereFilter, 'menus');

    console.log('whereFilter: ', whereFilter);

    const att = filterHelpers.atrributesHelper(attributes);

    try {
      const arrTreeSearchId = typeof arrTreeId !== 'undefined' ? arrTreeSearchId : [];

      result = await Model.findAll(menus, {
        where: { ...whereFilter, ...filterStatus, ...whereParent, ...otherWhere },
        order: sort,
        distinct: true,
        attributes: att,
        include: include
      }).catch(error => {
        throw error;
      });
      //  case 1: có parent Id => chỉ lấy chính nó   => tạo tree lần lượt
      // case 2: không tìm gì , (status = 1 || ! status), (parentId= 0 || !parentId) => lấy tất => tạo cây  1 thể
      //  case 3: có tìm tên || stauts <> 1 => tìm tất theo tên => tạo tree đủ lần lượt

      if (result) {
        result = JSON.parse(JSON.stringify(result));
        if (!_.isEmpty(whereParent) && Number(whereParent[parentKey]) !== 0) {
          console.log('case1');
          // case 1
          resultTree = await treeHelper.getChildren_Tree(
            result,
            menus,
            { attributes: att, include: null, otherWhere: { ...filterStatus } },
            parentKey,
            currentKey
          );
        } else if (_.isEmpty(whereFilter) && (_.isEmpty(filterStatus) || Number(filterStatus.status) === 1)) {
          // case 2
          console.log('case2');
          console.log('ko có filter', whereFilter);

          resultTree = treeHelper.createTree(result, currentKey, parentKey, 0);
        } else {
          // case 3
          console.log('case3');
          resultTree = await treeHelper.getTree_from_many_node(
            result,
            menus,
            { attributes: att, include: include, otherWhere: { ...filterStatus, ...otherWhere } },
            parentKey,
            currentKey,
            0
          );
        }

        // console.log(JSON.stringify(resultTree));

        if (range) {
          const perPage = range[1] - range[0] + 1;
          const page = Math.floor(range[0] / perPage);

          finnalyResult = {
            rows: resultTree.slice(range[0], range[1] + 1),
            count: resultTree.length, // result.count
            page: page + 1,
            perPage: perPage
          };
        } else {
          finnalyResult = {
            rows: resultTree,
            count: resultTree.length // result.count
          };
        }
      } else {
        finnalyResult = {
          rows: [],
          count: 0 // result.count
        };
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'getListError', 'MenuService');
    }

    return finnalyResult;
  },

  get_menu: async param => {
    let finnalyResult;
    const { filter, range, sort, filterChild } = param;
    const perPage = range[1] - range[0] + 1;
    const page = Math.floor(range[0] / perPage);
    let whereFilter = filter,
      nameFilter;
    // const filterStatus = _.pick(filter, ['status', 'sitesId']);

    try {
      whereFilter = await filterHelpers.combineFromDateWithToDate(whereFilter);
    } catch (error) {
      throw error;
    }

    if (filter.menusName) {
      nameFilter = {
        menusName: { $like: sequelize.literal(`CONCAT('%','${filter.menusName}','%')`) }
      };
      whereFilter = _.assign(whereFilter, nameFilter);
    }

    console.log('whereFilter: ', whereFilter);

    // const { placesId } = await filterHelpers.getInfoAuthorization(auth, { placesId: filter.placesId }, true);

    // if (placesId) {
    //   whereSites.placesId = placesId;
    // }

    try {
      const arrTreeSearchId = typeof arrTreeId !== 'undefined' ? arrTreeSearchId : [];

      console.log('whereFilter*****', whereFilter);
      const result = await Model.findAndCountAll(menus, {
        where: whereFilter,
        order: sort,
        // distinct: true,
        logging: true,
        attributes: ['id', 'menusName', 'parentId', 'url', 'urlSlugs', 'orderBy', 'status', 'icon', 'displayChild'],
        include: [
          {
            model: userGroupRoles,
            as: 'userGroupRoles',
            where: filterChild,
            required: true
          }
        ]
      }).catch(error => {
        throw error;
      });

      if (result) {
        const dataTree = makeTreeArray(result.rows, { id: 0 }, []);
        let tree = dataTree.tree;
        const arrTreeId = dataTree.arrTreeId;

        // console.log("dataTree: ", dataTree)
        if (arrTreeId.length > 0) {
          const newResult = result.rows.filter(item => {
            // console.log("arrTreeId.indexOf(item.id): ", arrTreeId.indexOf(item.id))
            if (arrTreeId.indexOf(item.id) === -1) {
              return item;
            }
          });

          newResult.forEach(item => {
            const treeTemp = makeTreeArray(result.rows, { id: item.parentId }, []);

            console.log('treeTemp: ', treeTemp);
            treeTemp.tree.forEach(item => {
              let isCo = false;

              tree.forEach(item1 => {
                if (item.id === item1.id) {
                  isCo = true;
                }
              });
              if (!isCo) tree = [...tree, item];
            });
          });
        } else {
          const arrChild = [];

          result.rows.forEach(item => {
            const treeTemp = makeTreeArray(result.rows, { id: item.id }, []);

            // console.log("treeTemp: ", treeTemp.tree)
            let isCo = false;
            const newItem = {
              ...item.dataValues,
              children: treeTemp.tree
            };

            treeTemp.tree.forEach(c => arrChild.push(c.id));

            tree.forEach(item1 => {
              if (item.id === item1.id) {
                isCo = true;
              }
            });
            if (!isCo) tree = [...tree, newItem];
          });

          // console.log("arrChild: ", arrChild)
          tree = tree.filter(c => arrChild.indexOf(c.id) === -1);
        }
        // console.log("tree: ", tree)
        finnalyResult = {
          rows: tree.slice(range[0], range[1] + 1),
          count: tree.length, // result.count,
          page: page + 1,
          perPage: perPage
        };
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'getListError', 'MenuService');
    }

    return finnalyResult;
  },

  updateOrder: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('MenuService updateOrder: ', entity.orders);

      const updateArr = Array.from(
        await Promise.all(
          entity.orders.map(item =>
            Model.update(
              menus,
              {
                orderBy: item.orderBy
              },
              { where: { id: parseInt(item.id) } }
            )
          )
        ).catch(error => {
          ErrorHelpers.errorThrow(error, 'crudError', 'MenusService');
        })
      );

      console.log('updateArr ', updateArr);
      if (!updateArr[0]) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError'
        });
      } else if (!updateArr[1]) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError'
        });
      }

      return { result: updateArr };
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'MenusService');
    }

    return { result: finnalyResult };
  },

  bulkUpdate: async param => {
    let finnalyResult;
    let transaction;

    try {
      const { filter, entity } = param;
      const whereFilter = _.pick(filter, ['id']);

      transaction = await sequelize.transaction();

      await Model.update(menus, entity, { where: whereFilter, transaction }).then(_result => {
        finnalyResult = _result;
      });

      await transaction.commit();
    } catch (error) {
      if (transaction) await transaction.rollback();
      ErrorHelpers.errorThrow(error, 'crudError', 'MenusService');
    }

    return { result: finnalyResult };
  },
  update_status: param =>
    new Promise(async (resolve, reject) => {
      try {
        console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        await Model.findOne(menus, {
          where: {
            id
          },
          logging: console.log
        })
          .then(async findEntity => {
            // console.log("findPlace: ", findPlace)
            if (!findEntity) {
              reject(
                new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'crudNotExisted'
                })
              );
            } else {
              if (entity.hasOwnProperty('status')) {
                const arrTreeId = [];
                const array = [findEntity];

                console.log('array', array);

                if (entity.status === Number(0)) {
                  await filterHelpers.makeTreeArrayChildSearch(array, arrTreeId, menus);
                } else if (entity.status === Number(1)) {
                  await filterHelpers.makeTreeArrayParentSearch(array, arrTreeId, menus);
                }
                await menus.update(
                  { status: entity.status },
                  {
                    where: {
                      id: {
                        [Op.in]: arrTreeId
                      }
                    }
                  }
                );
              }

              Model.update(menus, entity, {
                where: { id: id }
              })
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  Model.findOne(menus, { where: { id: param.id } })
                    .then(result => {
                      if (!result) {
                        reject(
                          new ApiErrors.BaseError({
                            statusCode: 202,
                            type: 'deleteError'
                          })
                        );
                      } else resolve({ status: 1, result: result });
                    })
                    .catch(err => {
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'menusServices'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'menusServices'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'menusServices'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'menusServices'));
      }
    })
};
