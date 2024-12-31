import friendService from '../services/friendService';
import loggerHelpers from '../helpers/loggerHelpers';
import { recordStartTime } from '../utils/loggerFormat';

import * as ApiErrors from '../errors';

export default {
    get_list: (req, res, next) => {
        recordStartTime.call(req);

        console.log('req.auth2', req.auth)
        // const { userId } = req.params;
        const param = Number(req.auth.userId);
        // console.log("paramparam:", param);

        // console.log('userId', userId);
        // console.log('userId', typeof (userId));

        try {
            // const { sort, range, filter, attributes } = res.locals;
            // const param = {
            //     sort,
            //     range,
            //     filter,
            //     auth: req.auth,
            //     attributes
            // };

            friendService
                .get_list(param)
                .then(data => {
                    res.status(200).json({
                        success: true,
                        message: 'Danh sách bạn bè của người dùng',
                        data: data
                    });
                })
                .catch(error => {
                    next(error);
                });
        } catch (error) {
            // error.dataQuery = req.query;
            next(error);
        }
    },
    get_list_multi: (req, res, next) => {
        recordStartTime.call(req);

        console.log('req.auth=', req.auth);
        console.log('locals', res.locals);
        try {
            const { sort, range, filter, attributes } = res.locals;
            const param = {
                sort,
                range,
                filter,
                auth: req.auth,
                attributes
            };

            provincesService
                .get_list_multi(param)
                .then(data => {
                    const dataOutput = {
                        points: data,
                        success: true,
                        errors: [],
                        messages: []
                    };

                    res.header('Content-Range', `sclSocialAccounts ${range}/${data.count}`);
                    res.send(dataOutput);
                    // write log
                    recordStartTime.call(res);
                    // loggerHelpers.logVIEWED(req, res, {
                    //   dataReqBody: req.body,
                    //   dataReqQuery: req.query,
                    //   dataRes: dataOutput
                    // });
                })
                .catch(error => {
                    error.dataQuery = req.query;
                    next(error);
                });
        } catch (error) {
            error.dataQuery = req.query;
            next(error);
        }
    },
    get_one: (req, res, next) => {
        recordStartTime.call(req);
        try {
            const { id } = req.params;
            const { attributes } = req.query;
            const param = { id, attributes };
            console.log('req.auth1', req.auth)

            // console.log("provinceService param: ", param)
            friendService
                .get_one(param)
                .then(data => {
                    res.send(data);

                    recordStartTime.call(res);
                    loggerHelpers.logVIEWED(req, res, {
                        dataReqBody: req.body,
                        dataReqQuery: req.query,
                        dataRes: data
                    });
                })
                .catch(error => {
                    next(error);
                });
        } catch (error) {
            error.dataParams = req.params;
            next(error);
        }
    },
    create: (req, res, next) => {
        recordStartTime.call(req);
        try {
            console.log('Request-Body:', req.body);
            const entity = res.locals.body;
            const param = { entity };

            provincesService
                .create(param)
                .then(data => {
                    if (data && data.result) {
                        const dataOutput = {
                            result: data.result,
                            success: true,
                            errors: [],
                            messages: []
                        };

                        res.send(dataOutput);
                        recordStartTime.call(res);
                        loggerHelpers.logCreate(req, res, {
                            dataReqBody: req.body,
                            dataReqQuery: req.query,
                            dataRes: dataOutput
                        });
                    }
                    // else {
                    //   throw new ApiErrors.BaseError({
                    //     statusCode: 202,
                    //     type: 'crudNotExisted',
                    //   });
                    // }
                })
                .catch(error => {
                    next(error);
                });
        } catch (error) {
            next(error);
        }
    },
    bulk_create: (req, res, next) => {
        recordStartTime.call(req);
        try {
            console.log('Request-Body create:', res.locals.body);
            const entity = res.locals.body;
            const param = { entity };

            provincesService
                .bulk_create(param)
                .then(data => {
                    if (data && data.result) {
                        const dataOutput = {
                            result: data.result,
                            success: true,
                            errors: [],
                            messages: []
                        };

                        res.send(dataOutput);
                        recordStartTime.call(res);
                        loggerHelpers.logCreate(req, res, {
                            dataReqBody: req.body,
                            dataReqQuery: req.query,
                            dataRes: dataOutput
                        });
                    } else {
                        throw new ApiErrors.BaseError({
                            statusCode: 202,
                            type: 'crudNotExisted'
                        });
                    }
                })
                .catch(error => {
                    next(error);
                });
        } catch (error) {
            next(error);
        }
    },
    update: (req, res, next) => {
        recordStartTime.call(req);
        try {
            const { id } = req.params;
            const entity = res.locals.body;
            // const entity = req.body
            const param = { id, entity };

            provincesService
                .update(param)
                .then(data => {
                    if (data && data.result) {
                        const dataOutput = {
                            result: data.result,
                            success: true,
                            errors: [],
                            messages: []
                        };

                        res.send(dataOutput);

                        recordStartTime.call(res);
                        loggerHelpers.logUpdate(req, res, {
                            dataReqBody: req.body,
                            dataReqQuery: req.query,
                            dataRes: dataOutput
                        });
                    }
                    // else {
                    //   throw new ApiErrors.BaseError({
                    //     statusCode: 202,
                    //     type: 'crudNotExisted',
                    //   });
                    // }
                })
                .catch(error => {
                    error.dataInput = req.body;
                    error.dataParams = req.params;
                    next(error);
                });
        } catch (error) {
            error.dataInput = req.body;
            error.dataParams = req.params;
            next(error);
        }
    },
    delete: (req, res, next) => {
        recordStartTime.call(req);
        try {
            const { id } = req.params;
            // const entity = { Status: 0 }
            const param = { id };

            provincesService
                .delete(param)
                .then(data => {
                    if (data && data.status === 1) {
                        const dataOutput = {
                            result: null,
                            success: true,
                            errors: [],
                            messages: []
                        };

                        res.send(dataOutput);

                        recordStartTime.call(res);
                        loggerHelpers.logDelete(req, res, {
                            dataReqBody: req.body,
                            dataReqQuery: req.query,
                            dataRes: dataOutput
                        });
                    } else {
                        throw new ApiErrors.BaseError({
                            statusCode: 202,
                            type: 'deleteError'
                        });
                    }
                })
                .catch(error => {
                    error.dataParams = req.params;
                    next(error);
                });
        } catch (error) {
            error.dataParams = req.params;
            next(error);
        }
    },
    update_status: (req, res, next) => {
        recordStartTime.call(req);
        try {
            const { id } = req.params;
            const entity = res.locals.body;
            // const entity = req.body
            const param = { id, entity };

            provincesService
                .update_status(param)
                .then(data => {
                    if (data && data.result) {
                        const dataOutput = {
                            result: data.result,
                            success: true,
                            errors: [],
                            messages: []
                        };

                        res.send(dataOutput);

                        recordStartTime.call(res);
                        loggerHelpers.logBLOCKDED(req, res, {
                            dataReqBody: req.body,
                            dataReqQuery: req.query,
                            dataRes: dataOutput
                        });
                    } else {
                        throw new ApiErrors.BaseError({
                            statusCode: 202,
                            type: 'crudNotExisted'
                        });
                    }
                })
                .catch(error => {
                    error.dataInput = req.body;
                    error.dataParams = req.params;
                    next(error);
                });
        } catch (error) {
            error.dataInput = req.body;
            error.dataParams = req.params;
            next(error);
        }
    },
    sendRequest: (req, res, next) => {

        const { userReceiveId } = req.body;
        const userSendId = req.auth.userId/// lấy ra được id của người gửi

        console.log("userReceiveId:", userReceiveId);
        console.log("userSendId:", userSendId);

        const param = { userReceiveId, userSendId };
        console.log("parammm:", param);

        try {
            friendService
                .sendRequestFriend(param)
                .then(data => {
                    res.status(200).json({
                        success: true,
                        message: 'Gửi lời mời kết bạn thành công',
                        data: data
                    });
                })
                .catch(error => {
                    console.error("Errorrrrrrrrrrrrrrrrrr", JSON.stringify(error, null, 2));
                    next(error);
                });

        } catch (error) {
            // console.log("errrrrrrrrrrr", error);
            // console.error("Error in try block:", JSON.stringify(error, null, 2));
            next(error);
        }
    },
    handleRequestFriend: (req, res, next) => {
        try {
            const requestId = req.params.id; // lấy ra id của lời mời được gửi
            const { status } = req.body;
            // const userId = req.auth.userId;

            const param = { requestId, status };

            // console.log("parammmm:", param);

            friendService
                .handleRequestFriend(param)
                .then(data => {
                    res.status(200).json({
                        success: true,
                        message: `Lời mời kết bạn đã được ${status === 'accept' ? 'chấp nhận' : 'từ chối'}.`,
                        data: data
                    });
                })
                .catch(error => {
                    // console.error("Error in handleRequestFriend:", error);
                    next(error);
                });
        } catch (error) {
            console.error("errrrrrr", error);
            next(error);
        }
    },
    deleteFriend: (req, res, next) => {
        try {
            const { userId } = req.auth;
            const friendId = req.params.id;

            console.log("req.params", req.params);

            console.log("userId", userId);
            console.log("friendId", friendId);

            const param = { userId, friendId };

            if (userId === friendId) {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể xóa chính mình khỏi danh sách bạn bè.'
                });
            }

            friendService
                .deleteFriend(param)
                .then(() => {
                    res.status(200).json({
                        success: true,
                        message: 'Xóa bạn bè thành công.'
                    });
                })
                .catch(error => {
                    console.error("er", error);
                    next(error);
                });
        } catch (error) {
            console.error("errrrrr:", error);
            next(error);
        }
    },
    suggestFriend: (req, res, next) => {

        try {

            const { range, filter } = req.query;
            const userId = req.auth.userId;
            const param = {
                range: range ? JSON.parse(range) : [0, 9],
                filter: filter ? JSON.parse(filter) : {},
                userId
            };

            friendService
                .suggestFriend(param)
                .then(data => {
                    const dataOutput = {
                        result: {
                            list: data.rows, // Danh sách bạn bè gợi ý
                            pagination: {
                                current: data.page, // Trang hiện tại
                                pageSize: data.perPage, // Số bản ghi mỗi trang
                                total: data.total[0].total // Tổng số bản ghi
                            }
                        },
                        success: true,
                        errors: [],
                        messages: []
                    };

                    // Trả về header và dữ liệu
                    res.header(
                        'Content-Range',
                        `suggestFriend ${param.range[0]}-${param.range[1]}/${data.total}`
                    );
                    res.send(dataOutput);

                    // Ghi log
                    recordStartTime.call(res);
                    loggerHelpers.logVIEWED(req, res, {
                        dataReqBody: req.body,
                        dataReqQuery: req.query,
                        dataRes: dataOutput
                    });
                })
                .catch(error => {
                    // Xử lý lỗi từ service
                    error.dataQuery = req.query;
                    next(error);
                });
        } catch (error) {
            // console.error("Errorrrrrrrrrrrrrrrrrr", JSON.stringify(error, null, 2));
            next(error);
        }
    },
    // suggestFriend: (req, res, next) => {
    //     recordStartTime.call(req);

    //     console.log('req.auth=', req.auth);
    //     // console.log("iddđ", req.auth);
    //     console.log('locals', res.locals);
    //     try {
    //         const { sort, range, filter, attributes } = res.locals;
    //         const param = {
    //             sort,
    //             range,
    //             filter,
    //             auth: req.auth,
    //             attributes
    //         };

    //         friendService
    //             .suggestFriend(param)
    //             .then(data => {
    //                 const dataOutput = {
    //                     result: {
    //                         list: data.rows,
    //                         pagination: {
    //                             current: data.page,
    //                             pageSize: data.perPage,
    //                             total: data.count
    //                         }
    //                     },
    //                     success: true,
    //                     errors: [],
    //                     messages: []
    //                 };

    //                 res.header('Content-Range', `sclSocialAccounts ${range}/${data.count}`);
    //                 res.send(dataOutput);
    //                 // write log
    //                 recordStartTime.call(res);
    //                 loggerHelpers.logVIEWED(req, res, {
    //                     dataReqBody: req.body,
    //                     dataReqQuery: req.query,
    //                     dataRes: dataOutput
    //                 });
    //             })
    //             .catch(error => {
    //                 error.dataQuery = req.query;
    //                 next(error);
    //             });
    //     } catch (error) {
    //         error.dataQuery = req.query;
    //         next(error);
    //     }
    // },
};
