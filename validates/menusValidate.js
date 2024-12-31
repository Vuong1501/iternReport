import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';

//  TODO id, menusName,  url, icon, parentId, menuPositionsId, orderBy,
//  status, userCreatorsId, dateUpdated, dateCreated, urlSlugs,  displayChild
const DEFAULT_SCHEMA = {
  menusName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.menus.menusName']
  }),

  url: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.menus.url'],
    allow: ['', null]
  }),
  icon: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.menus.icon'],
    allow: ['', null]
  }),
  parentId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.menus.parentId']
  }),
  menuPositionsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.menuPositionsId
  }),
  orderBy: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.menus.orderBy']
  }),
  userCreatorsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.userCreatorsId
  }),
  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status
  }),
  urlSlugs: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage.UrlSlugs,
    allow: null
  }),

  displayChild: ValidateJoi.createSchemaProp({
    boolean: noArguments,
    label: viMessage['api.menus.displayChild'],
    allow: [0, 1]
  }),
  dateUpdated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage.dateUpdated
  }),
  dateCreated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage.dateCreated
  })
};

export default {
  authenCreate: (req, res, next) => {
    // console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;

    const {
      menusName,

      url,
      icon,
      parentId,
      menuPositionsId,
      orderBy,
      status,
      urlSlugs,

      displayChild
    } = req.body;

    const menu = {
      menusName,

      url,
      icon,
      parentId,
      menuPositionsId,
      orderBy,
      status,
      userCreatorsId,
      urlSlugs,

      displayChild
    };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      menusName: {
        max: 100,
        required: noArguments
      },
      url: {
        max: 300
      },

      parentId: {
        required: noArguments
      },
      menuPositionsId: {
        required: noArguments
      },
      orderBy: {
        required: noArguments
      },
      userCreatorsId: {
        required: noArguments
      },
      status: {
        required: noArguments
      }
    });

    // console.log('input: ', input);
    ValidateJoi.validate(menu, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error =>
        next({
          ...error,
          message: 'Định dạng gửi đi không đúng'
        })
      );
  },
  authenUpdate: (req, res, next) => {
    // console.log("validate authenUpdate")

    const {
      menusName,

      url,
      icon,
      parentId,
      menuPositionsId,
      orderBy,
      status,
      userCreatorsId,
      urlSlugs,

      displayChild
    } = req.body;

    const menu = {
      menusName,

      url,
      icon,
      parentId,
      menuPositionsId,
      orderBy,
      status,
      userCreatorsId,
      urlSlugs,

      displayChild
    };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      menusName: {
        max: 100
      },
      url: {
        max: 300
      }
    });

    ValidateJoi.validate(menu, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error =>
        next({
          ...error,
          message: 'Định dạng gửi đi không đúng'
        })
      );
  },
  authenFilter: (req, res, next) => {
    // console.log("validate authenFilter")
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSort(sort);
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;

    if (filter) {
      const {
        id,
        menusName,

        url,
        icon,
        parentId,
        menuPositionsId,
        orderBy,
        status,
        userCreatorsId,
        urlSlugs,

        displayChild,
        FromDate,
        ToDate
      } = JSON.parse(filter);

      const menu = {
        id,
        menusName,

        url,
        icon,
        parentId,
        menuPositionsId,
        orderBy,
        status,
        userCreatorsId,

        urlSlugs,

        displayChild,
        FromDate,
        ToDate
      };

      // console.log(menu)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          any: noArguments,
          label: viMessage['api.menus.id']
          // regex: /(^\d+(,\d+)*$)|(^\d*$)/
        }),
        ...DEFAULT_SCHEMA,

        parentId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.menus.parentId'],
          regex: regexPattern.listIds
        }),

        menuPositionsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.menuPositionsId,
          regex: regexPattern.listIds
        }),
        userCreatorsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.userCreatorsId,
          regex: regexPattern.listIds
        }),
        FromDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.FromDate
        }),
        ToDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.ToDate
        })
      };

      // console.log('input: ', input);
      ValidateJoi.validate(menu, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }

          if (parentId) {
            ValidateJoi.transStringToArray(data, 'parentId');
          }
          if (menuPositionsId) {
            ValidateJoi.transStringToArray(data, 'menuPositionsId');
          }
          if (userCreatorsId) {
            ValidateJoi.transStringToArray(data, 'userCreatorsId');
          }

          res.locals.filter = data;
          // console.log('locals.filter', res.locals.filter);
          next();
        })
        .catch(error => {
          next({
            ...error,
            message: 'Định dạng gửi đi không đúng'
          });
        });
    } else {
      res.locals.filter = {};
      next();
    }
  },

  authenUpdate_status: (req, res, next) => {
    // console.log("validate authenCreate")
    const userCreatorssId = req.auth.userId;

    console.log('validate authenCreate', userCreatorssId);
    const { status, dateUpdated } = req.body;
    const userGroup = {
      status,
      dateUpdated,
      userCreatorssId
    };

    const SCHEMA = {
      status: ValidateJoi.createSchemaProp({
        number: noArguments,
        required: noArguments,
        label: viMessage.status
      }),
      dateUpdated: ValidateJoi.createSchemaProp({
        date: noArguments,
        required: noArguments,
        label: viMessage.dateUpdated
      }),
      userCreatorssId: ValidateJoi.createSchemaProp({
        number: noArguments,
        required: noArguments,
        label: viMessage.userCreatorsId
      })
    };

    ValidateJoi.validate(userGroup, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error =>
        next({
          ...error,
          message: 'Định dạng gửi đi không đúng'
        })
      );
  },
  authenBulkUpdate: async (req, res, next) => {
    try {
      console.log('validate authenBulkUpdate', req.query, req.body);
      const { filter } = req.query;
      const { status } = req.body;
      const menu = { status };
      const { id } = JSON.parse(filter);
      const whereFilter = { id };

      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.menus.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA
      };

      if (filter) {
        const { id } = JSON.parse(filter);

        await ValidateJoi.validate(whereFilter, SCHEMA)
          .then(data => {
            if (id) {
              ValidateJoi.transStringToArray(data, 'id');
            }
            res.locals.filter = data;

            console.log('locals.filter', res.locals.filter);
          })

          .catch(error => {
            console.log(error);

            return next({ error, message: 'Định dạng gửi đi không đúng' });
          });
      }

      await ValidateJoi.validate(menu, SCHEMA)
        .then(data => {
          res.locals.body = data;

          console.log('locals.body', res.locals.body);
        })
        .catch(error => {
          console.log(error);

          return next({ error, message: 'Định dạng gửi đi không đúng' });
        });

      return next();
    } catch (error) {
      console.log(error);

      return next({ error });
    }
  },
  authenUpdateOrder: (req, res, next) => {
    // console.log("validate authenUpdateOrder")

    const { orders } = req.body;
    const menu = { orders };

    const SCHEMA = {
      orders: ValidateJoi.createSchemaProp({
        array: noArguments,
        label: viMessage['api.menus.orders']
      })
    };

    ValidateJoi.validate(menu, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  }
};
