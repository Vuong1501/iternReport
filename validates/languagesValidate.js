import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import regexPattern from '../utils/regexPattern';
import { parseSortVer2 } from '../utils/helper';

//  TODO: id, languagesName, languagesCode, status, userCreatorsId, dateUpdated, dateCreated, icon
const DEFAULT_SCHEMA = {
  languagesName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.languages.languagesName'],
    allow: null
  }),
  languagesCode: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.languages.languagesCode'],
    allow: [null, '']
  }),
  icon: ValidateJoi.createSchemaProp({
    object: noArguments,
    label: viMessage['api.languages.icon']
  }),
  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status
  }),
  dateCreated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage.dateCreated
  }),
  dateUpdated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage.dateUpdated
  }),
  userCreatorsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.userCreatorsId
  })
};

export default {
  authenCreate: (req, res, next) => {
    // console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;

    const { languagesName, languagesCode, status, icon } = req.body;
    const languages = { languagesName, languagesCode, status, userCreatorsId, icon };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      languagesName: {
        max: 100,
        required: noArguments
      },
      languagesCode: {
        max: 10,
        required: noArguments
      }
    });

    // console.log('input: ', input);
    ValidateJoi.validate(languages, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate: (req, res, next) => {
    // console.log("validate authenUpdate")

    const { languagesName, languagesCode, status, userCreatorsId, icon } = req.body;
    const languages = { languagesName, languagesCode, status, userCreatorsId, icon };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      languagesName: {
        max: 100
      },
      languagesCode: {
        max: 10
      }
    });

    ValidateJoi.validate(languages, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenFilter: (req, res, next) => {
    // console.log("validate authenFilter")
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSortVer2(sort, 'languages');
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const { id, languagesName, languagesCode, status, userCreatorsId, icon, sitesId } = JSON.parse(filter);
      const languages = { id, languagesName, languagesCode, status, userCreatorsId, icon, sitesId };

      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.languages.id'],
          regex: regexPattern.listIds
        }),
        sitesId: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: viMessage['api.sites.id']
        }),
        ...DEFAULT_SCHEMA,
        languagesName: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.languages.languagesName'],
          regex: regexPattern.name
        }),
        languagesCode: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.languages.languagesCode'],
          regex: regexPattern.name
        })
      };

      // console.log('input: ', input);
      ValidateJoi.validate(languages, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          res.locals.filter = data;
          // console.log('locals.filter', res.locals.filter);
          next();
        })
        .catch(error => {
          next({ ...error, message: 'Định dạng gửi đi không đúng' });
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
  }
};
