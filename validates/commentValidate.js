import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';

import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';

const DEFAULT_SCHEMA = {
  content: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.post.content'],
    allow: null
  }),

};

export default {
  authenCreateCmt: (req, res, next) => {
    console.log('validate authenCreate');

    const { content } = req.body;

    const cmt = { content };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        content: {
          regex: /\w/i,
          max: 500,
          required: true
        },
      })
    );
    ValidateJoi.validate(cmt, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate: (req, res, next) => {
    console.log('validate authenUpdate');

    const {
      username,
      password,
      fullname,
      email,
      mobile,
      userGroupsId,
      address,

      status,
      dateExpire
    } = req.body;

    const user = {
      username,
      image,
      password,
      fullname,
      email,
      mobile,
      userGroupsId,
      address,

      status,
      dateExpire
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        username: {
          regex: /\w/i,
          max: 100
        },
        fullname: {
          max: 100
        },
        email: {
          regex: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i,
          max: 100
        },
        mobile: {
          regex: /^[0-9]+$/i,
          max: 15
        }
      })
    );

    ValidateJoi.validate(user, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate_status: (req, res, next) => {
    // console.log("validate authenCreate")
    // const userCreatorsId = req.auth.userId || 0;

    const { status, dateUpdated } = req.body;
    const userGroup = { status, dateUpdated };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      status: {
        required: noArguments
      }
      // dateUpdated: {
      //   required: noArguments
      // }
    });

    ValidateJoi.validate(userGroup, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenFilter: (req, res, next) => {
    console.log('validate authenFilter');
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSort(sort);
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const {
        id,
        postId,
        userId,
        content,
        createedAt,
      } = JSON.parse(filter);

      const user = {
        id,
        postId,
        userId,
        content,
        createedAt,
      };

      console.log(user);
      const SCHEMA = {
        ...DEFAULT_SCHEMA,
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.users.id'],
          regex: regexPattern.listIds
        }),


        postId: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: 'Post ID',
          required: true
        }),

        content: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: 'Content',
          min: 1,
          max: 500
        }),

        userId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: 'User ID',
          regex: regexPattern.listIds
        }),

        status: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: 'Status',
          valid: ['active', 'inactive']
        }),

        createdAt: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: 'Created At'
        }),

        updatedAt: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: 'Updated At'
        })
      };

      // console.log('input: ', input);
      ValidateJoi.validate(user, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (userId) {
            ValidateJoi.transStringToArray(data, 'userGroupsId');
          }

          res.locals.filter = data;
          console.log('locals.filter', res.locals.filter);
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
  authenRequestForgetPass: (req, res, next) => {
    console.log('validate authenUpdate');

    const { email, mobile } = req.body;
    const user = { email, mobile };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      email: {
        regex: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i,
        max: 200
      },
      mobile: {
        regex: /^[0-9]+$/i,
        max: 15
      }
    });

    ValidateJoi.validate(user, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  }
};
