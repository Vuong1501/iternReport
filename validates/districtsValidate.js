/* eslint-disable camelcase */
import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';

//  TODO: id, districtsName, provincesId, status, userCreatorsId, dateUpdated, dateCreated
const DEFAULT_SCHEMA = {
  districtsName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.districts.districtsName']
  }),
  provincesId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.provincesId
  }),

  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status,
    allow: null
  })
};

export default {
  authenCreate: (req, res, next) => {
    const { districtsName, provincesId, status } = req.body;

    const district = {
      districtsName,
      provincesId,
      status
    };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      districtsName: {
        max: 200,
        required: noArguments
      },
      provincesId: {
        required: noArguments
      },
      status: {
        required: noArguments
      }
    });

    // console.log('input: ', input);
    ValidateJoi.validate(district, SCHEMA)
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
  authenBulkCreateOrUpdate: (req, res, next) => {
    console.log('validate authenCreate');
    const userCreatorsId = req.auth.userId;

    const { districtsName, provincesId, status } = req.body;
    const ward = {
      districtsName,
      provincesId,
      status,
      userCreatorsId
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        provincesId: {
          required: noArguments
        }
      })
    );

    // console.log('input: ', input);
    ValidateJoi.validate(ward, SCHEMA)
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

    const { districtsName, provincesId, status, userCreatorsId } = req.body;
    const district = {
      districtsName,
      provincesId,
      status,
      userCreatorsId
    };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      districtsName: {
        max: 200
      }
    });

    ValidateJoi.validate(district, SCHEMA)
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
  authenUpdate_status: (req, res, next) => {
    // console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;

    console.log('validate authenCreate', userCreatorsId);
    const { districtsName, provincesId, status } = req.body;

    const userGroup = {
      districtsName,
      provincesId,
      status,
      userCreatorsId
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
      userCreatorsId: ValidateJoi.createSchemaProp({
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
  authenFilter: (req, res, next) => {
    // console.log("validate authenFilter")
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSort(sort);
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const { id, districtsName, provincesId, status, userCreatorsId, FromDate, ToDate } = JSON.parse(filter);
      const district = {
        id,
        districtsName,
        provincesId,
        status,
        userCreatorsId,
        FromDate,
        ToDate
      };

      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.districts.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
        provincesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.provincesId,
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
      ValidateJoi.validate(district, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (provincesId) {
            ValidateJoi.transStringToArray(data, 'provincesId');
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
  }
};
