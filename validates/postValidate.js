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
  visibility: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.post.visibility'],
    allow: null
  }),
};

export default {
  authenCreate: (req, res, next) => {
    console.log('validate authenCreate');

    const {
      content,
      visibility,
    } = req.body;

    const post = {
      content,
      visibility,
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        content: {
          regex: /\w/i,
          max: 500,
          required: true
        },
        visibility: {
          valid: ["public", "friends", "private"],
          required: true,
        },
      })
    );
    ValidateJoi.validate(post, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate: (req, res, next) => {
    console.log('validate authenUpdate');

    const {
      content,
      visibility,
    } = req.body;

    const post = {
      content,
      visibility,
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        content: {
          regex: /\w/i,
          max: 500
        },
        visibility: {
          valid: ["public", "friends", "private"],
          required: true,
        },
      })
    );

    ValidateJoi.validate(post, SCHEMA)
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
        userId,
        content,
        visibility,
        createdAt,
        updatedAt,
        countLike,
        countComment,
      } = JSON.parse(filter);

      const user = {
        id,
        userId,
        content,
        visibility,
        createdAt,
        updatedAt,
        countLike,
        countComment,
      };

      console.log(user);
      const SCHEMA = {
        ...DEFAULT_SCHEMA,
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.users.id'],
          regex: regexPattern.listIds
        }),

        userId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.comments.userId']
        }),
        createdAt: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage['api.comments.createdAt']
        }),
        updatedAt: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage['api.comments.updatedAt']
        }),
        countLike: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: viMessage['api.comments.countLike']
        }),
        countComment: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: viMessage['api.comments.countComment']
        })
      };

      // console.log('input: ', input);
      ValidateJoi.validate(user, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
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
