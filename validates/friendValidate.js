import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';

import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';
import number from '../utils/joi/lib/types/number';

// mobile, userGroupsId, address,  status, dateUpdated, dateCreated, dateExpire
const DEFAULT_SCHEMA = {
    userReceiveId: ValidateJoi.createSchemaProp({
        number: noArguments,
        label: viMessage['api.users.id'],
        allow: null
    }),
    status: ValidateJoi.createSchemaProp({
        string: noArguments,
        label: viMessage['api.users.status'],
        allow: null
    })
};

export default {
    authenRequest: (req, res, next) => {
        console.log('validate authenCreate');

        const { userReceiveId } = req.body;

        const friend = { userReceiveId };

        const SCHEMA = Object.assign(
            ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
                userReceiveId: {
                    max: 1000,
                    min: 1,
                    required: true
                }
            })
        );

        // console.log('input: ', input);
        ValidateJoi.validate(friend, SCHEMA)
            .then(data => {
                res.locals.body = data;
                next();
            })
            .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
    },
    authenHandleRequest: (req, res, next) => {
        console.log('validate authenUpdate');

        const { status } = req.body;

        const friend = { status };

        const SCHEMA = Object.assign(
            ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
                status: {
                    valid: ['accept', 'reject'],
                    required: true
                },
            })
        );

        ValidateJoi.validate(friend, SCHEMA)
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
            const { userId, fullname } = JSON.parse(filter);

            const filterData = { userId, fullname };

            console.log('filterData', filterData);
            const SCHEMA = {
                ...DEFAULT_SCHEMA,
                userId: ValidateJoi.createSchemaProp({
                    string: noArguments,
                    label: 'User ID',
                    regex: regexPattern.listIds,
                }),
                fullname: ValidateJoi.createSchemaProp({
                    string: noArguments,
                    label: 'Full Name',
                    regex: regexPattern.name,
                }),
            };

            // console.log('input: ', input);
            ValidateJoi.validate(filterData, SCHEMA)
                .then(data => {
                    if (data.userId) {
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
    // authenFilter: (req, res, next) => {
    //     console.log('validate authenFilter');
    //     const { filter, sort, range, attributes } = req.query;

    //     res.locals.sort = parseSort(sort);
    //     res.locals.range = range ? JSON.parse(range) : [0, 49];
    //     res.locals.attributes = attributes;
    //     if (filter) {
    //         const { id, fullname, status, userCreatorsId, FromDate, ToDate } = JSON.parse(filter);
    //         const province = { id, fullname, status, userCreatorsId, FromDate, ToDate };

    //         console.log(province);
    //         const SCHEMA = {
    //             id: ValidateJoi.createSchemaProp({
    //                 string: noArguments,
    //                 label: viMessage['api.provinces.id'],
    //                 regex: regexPattern.listIds
    //             }),
    //             ...DEFAULT_SCHEMA,
    //             userCreatorsId: ValidateJoi.createSchemaProp({
    //                 string: noArguments,
    //                 label: viMessage.userCreatorsId,
    //                 regex: regexPattern.listIds
    //             }),
    //             FromDate: ValidateJoi.createSchemaProp({
    //                 date: noArguments,
    //                 label: viMessage.FromDate
    //             }),
    //             ToDate: ValidateJoi.createSchemaProp({
    //                 date: noArguments,
    //                 label: viMessage.ToDate
    //             })
    //         };

    //         // console.log('input: ', input);
    //         ValidateJoi.validate(province, SCHEMA)
    //             .then(data => {
    //                 if (id) {
    //                     ValidateJoi.transStringToArray(data, 'id');
    //                 }
    //                 if (userCreatorsId) {
    //                     ValidateJoi.transStringToArray(data, 'userCreatorsId');
    //                 }

    //                 res.locals.filter = data;
    //                 console.log('locals.filter', res.locals.filter);
    //                 next();
    //             })
    //             .catch(error => {
    //                 next({ ...error, message: 'Định dạng gửi đi không đúng' });
    //             });
    //     } else {
    //         res.locals.filter = {};
    //         next();
    //     }
    // },
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
