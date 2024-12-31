/* eslint-disable camelcase */
import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';
// import { DECIMAL } from 'sequelize';

//  TODO id, provincesName, status, userCreatorsId, dateUpdated, dateCreated

const DEFAULT_SCHEMA = { // DEFAULT_SCHEMA để validate object
    user_id: ValidateJoi.createSchemaProp({
        string: noArguments,
        label: viMessage['api.order.user_id'],
    }),
    order_date: ValidateJoi.createSchemaProp({
        date: noArguments,
        label: viMessage['api.order.order_date'],
    }),
    status: ValidateJoi.createSchemaProp({
        string: noArguments,
        label: viMessage['api.order.status'],
        valid: ['pending', 'processing', 'shipped', 'completed', 'cancelled']
    }),
};

const list_SCHEMA = ValidateJoi.createArraySchema({ // list_schema này để validate mảng
    productId: ValidateJoi.createSchemaProp({
        number: noArguments,
        label: viMessage['api.order.productId'],
        required: noArguments
    }),
    price: ValidateJoi.createSchemaProp({
        number: noArguments,
        min: 1,
        label: viMessage['api.order.price'],
        required: noArguments
    }),
    quantity: ValidateJoi.createSchemaProp({
        number: noArguments,
        min: 1,
        label: viMessage['api.order.quantity'],
        required: noArguments
    }),
});


export default {
    authenCreate: (req, res, next) => {
        console.log('validate authenCreate');

        const { user_id, orderItems, status, price } = req.body;

        const order = {
            user_id,
            order_date: new Date(),
            orderItems,
            status,
            price
        };

        const SCHEMA = Object.assign(ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
            user_id: {
                required: noArguments
            },
            status: {
                required: noArguments
            },
        }), {
            orderItems: list_SCHEMA
        });

        ValidateJoi.validate(order, SCHEMA)
            .then(data => {
                res.locals.body = data;
                next();
            })
            .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
    },
    authenBulkCreateOrUpdate: (req, res, next) => {
        console.log('validate authenBulkCreateOrUpdate');
        const userCreatorsId = req.auth.userId;

        const { provincesName, status } = req.body;

        const ward = {
            provincesName,
            status,
            userCreatorsId
        };

        const SCHEMA = Object.assign(ValidateJoi.assignSchema(DEFAULT_SCHEMA, {}), {
            provinces: list_SCHEMA
        });

        // console.log('input: ', input);
        ValidateJoi.validate(ward, SCHEMA)
            .then(data => {
                res.locals.body = data;
                next();
            })
            .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
    },
    authenUpdate: (req, res, next) => {
        console.log('validate authenUpdate');

        const { user_id } = req.body;
        const order = { user_id };

        const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
            user_id: {
                max: 100,
                required: noArguments
            }
        });

        ValidateJoi.validate(order, SCHEMA)
            .then(data => {
                res.locals.body = data;
                next();
            })
            .catch(error => {
                next({ ...error, message: 'Định dạng gửi đi không đúng' });
            });
    },
    authenUpdate_status: (req, res, next) => {

        // console.log("validate authenCreate")
        // const userCreatorssId = req.auth.userId;

        // console.log('validate authenCreate', userCreatorssId);
        const { newStatus } = req.body;
        const userGroup = { newStatus };

        const SCHEMA = {
            newStatus: ValidateJoi.createSchemaProp({
                string: noArguments,
                // required: noArguments,
                label: viMessage.status
            })
            // userCreatorssId: ValidateJoi.createSchemaProp({
            //     number: noArguments,
            //     required: noArguments,
            //     label: viMessage.userCreatorsId
            // })
        };

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
            const { id, provincesName, status, userCreatorsId, FromDate, ToDate } = JSON.parse(filter);
            const province = { id, provincesName, status, userCreatorsId, FromDate, ToDate };

            console.log(province);
            const SCHEMA = {
                id: ValidateJoi.createSchemaProp({
                    string: noArguments,
                    label: viMessage['api.provinces.id'],
                    regex: regexPattern.listIds
                }),
                ...DEFAULT_SCHEMA,
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
            ValidateJoi.validate(province, SCHEMA)
                .then(data => {
                    if (id) {
                        ValidateJoi.transStringToArray(data, 'id');
                    }
                    if (userCreatorsId) {
                        ValidateJoi.transStringToArray(data, 'userCreatorsId');
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
    }
};
