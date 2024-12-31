/* eslint-disable camelcase */
import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';
import number from '../utils/joi/lib/types/number';
import string from '../utils/joi/lib/types/string';

//  TODO id, provincesName, status, userCreatorsId, dateUpdated, dateCreated
const DEFAULT_SCHEMA = {
    productName: ValidateJoi.createSchemaProp({
        string: noArguments,
        label: viMessage['api.product.productName']
    }),
    price: ValidateJoi.createSchemaProp({
        number: noArguments,
        label: viMessage['api.product.price']
    }),
    quantity: ValidateJoi.createSchemaProp({
        number: noArguments,
        label: viMessage['api.product.quantity']
    }),
    status: ValidateJoi.createSchemaProp({
        number: noArguments,
        label: viMessage.status
    })
};

const list_SCHEMA = ValidateJoi.createArraySchema({
    productName: ValidateJoi.createSchemaProp({
        string: noArguments,
        label: viMessage['api.product.productName'],
        required: noArguments
    }),
    dateUpdated: ValidateJoi.createSchemaProp({
        date: noArguments,
        label: viMessage.dateUpdated,
        allow: ['', null]
    }),
    status: ValidateJoi.createSchemaProp({
        number: noArguments,
        label: viMessage.status,
        required: noArguments
    })
});

export default {
    authenCreate: (req, res, next) => {
        console.log('validate authenCreate');

        const { productName, price, quantity, status } = req.body;

        const product = {
            productName,
            price,
            quantity,
            status
        };

        console.log("product:", typeof (product.price));

        const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
            productName: {
                max: 200,
                min: 1,
                trim: true

            },
            price: {
                min: 0,
                // empty: '',

            },
            quantity: {
                min: 0

            },
            status: {
                valid: [0, 1],
            }
        });

        // console.log('input: ', input);
        ValidateJoi.validate(product, SCHEMA)
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

        const { productName, price, quantity, status } = req.body;
        const product = { productName, price, quantity, status };

        const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
            productName: {
                max: 200,
                min: 1,
                trim: true,
                required: noArguments
            },
            price: {
                min: 1,
                // trim: true,
                // empty: '',
            },
            quantity: {
                min: 1
            },
            status: {
                valid: [0, 1],
            }
        });

        ValidateJoi.validate(product, SCHEMA)
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
        const userCreatorssId = req.auth.userId;

        console.log('validate authenCreate', userCreatorssId);
        const { status } = req.body;
        const userGroup = { status, dateUpdated: new Date(), userCreatorssId };

        const SCHEMA = {
            status: ValidateJoi.createSchemaProp({
                number: noArguments,
                required: noArguments,
                label: viMessage.status
            }),
            dateUpdated: ValidateJoi.createSchemaProp({
                date: noArguments,
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
            .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
    },
    authenFilter: (req, res, next) => {
        console.log('validate authenFilter');
        const { filter, sort, range, attributes } = req.query;

        res.locals.sort = parseSort(sort);
        res.locals.range = range ? JSON.parse(range) : [0, 49];
        res.locals.attributes = attributes;
        if (filter) {
            const { id, provductsName, status, desciption, FromDate, ToDate } = JSON.parse(filter);
            const product = { id, provductsName, status, desciption, FromDate, ToDate };

            console.log(product);
            const SCHEMA = {
                id: ValidateJoi.createSchemaProp({
                    string: noArguments,
                    label: viMessage['api.products.id'],
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
            ValidateJoi.validate(product, SCHEMA)
                .then(data => {
                    if (id) {
                        ValidateJoi.transStringToArray(data, 'id');
                    }
                    // if (userCreatorsId) {
                    //     ValidateJoi.transStringToArray(data, 'userCreatorsId');
                    // }

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
