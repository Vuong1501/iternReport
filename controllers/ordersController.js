import orderService from '../services/orderService';
import loggerHelpers from '../helpers/loggerHelpers';
import { recordStartTime } from '../utils/loggerFormat';

import * as ApiErrors from '../errors';
import { update } from 'lodash';

export default {
    get_list: (req, res, next) => {
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

            orderService
                .get_list(param)
                .then(data => {
                    const dataOutput = {
                        result: {
                            list: data.rows,
                            pagination: {
                                current: data.page,
                                pageSize: data.perPage,
                                total: data.count
                            }
                        },
                        success: true,
                        errors: [],
                        messages: []
                    };

                    res.header('Content-Range', `sclSocialAccounts ${range}/${data.count}`);
                    res.send(dataOutput);
                    // write log
                    recordStartTime.call(res);
                    loggerHelpers.logVIEWED(req, res, {
                        dataReqBody: req.body,
                        dataReqQuery: req.query,
                        dataRes: dataOutput
                    });
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

            orderService
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

            // const { attributes } = req.query;

            const param = { id /*, attributes */ };

            // console.log("provinceService param: ", param)
            orderService
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
            // console.log("entityyyyyy", entity);
            const param = { entity };
            // console.log("param", param);

            orderService
                .create(param, req.body.orderItems)
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

            orderService
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

            orderService
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
            // console.log(param);

            orderService
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

            orderService
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
                    console.log("lỗi là: ", error);
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
    // report: (req, res, next) => {
    //     recordStartTime.call(req);
    //     try {
    //         const { year, startDate, endDate } = req.query;

    //         if (year) {
    //             const param = { year };

    //             orderService
    //                 .reportByYear(param)
    //                 .then(data => {
    //                     if (data && data.length) {
    //                         const dataOutput = {
    //                             result: data,
    //                             success: true,
    //                             errors: [],
    //                             messages: []
    //                         };

    //                         res.send(dataOutput);

    //                         recordStartTime.call(res);
    //                         loggerHelpers.logBLOCKDED(req, res, {
    //                             dataReqBody: req.body,
    //                             dataReqQuery: req.query,
    //                             dataRes: dataOutput
    //                         });
    //                     } else {
    //                         throw new ApiErrors.BaseError({
    //                             statusCode: 202,
    //                             type: 'crudNotExisted'
    //                         });
    //                     }
    //                 })
    //                 .catch(error => {
    //                     const errorOutput = {
    //                         success: false,
    //                         errors: [error.message],
    //                         messages: ['Lỗi khi lấy báo cáo doanh thu.']
    //                     };

    //                     res.status(500).json(errorOutput);
    //                     next(error);
    //                 });
    //         } else {
    //             // Trường hợp không có year, tính tổng doanh thu
    //             const param = { startDate, endDate };

    //             orderService.reportTotalRevenue(param)
    //                 .then(data => {
    //                     const dataOutput = {
    //                         result: data.totalRevenue,
    //                         success: true,
    //                         errors: [],
    //                         messages: []
    //                     };

    //                     res.send(dataOutput);

    //                     recordStartTime.call(res);
    //                     loggerHelpers.logBLOCKDED(req, res, {
    //                         dataReqBody: req.body,
    //                         dataReqQuery: req.query,
    //                         dataRes: dataOutput
    //                     });
    //                 })
    //                 .catch(error => {
    //                     const errorOutput = {
    //                         success: false,
    //                         errors: [error.message],
    //                         messages: ['Lỗi khi lấy báo cáo doanh thu.']
    //                     };

    //                     res.status(500).json(errorOutput);
    //                     next(error);
    //                 });
    //         }
    //     } catch (error) {
    //         const errorOutput = {
    //             success: false,
    //             errors: [error.message],
    //             messages: ['Lỗi hệ thống.']
    //         };

    //         res.status(500).json(errorOutput);
    //         next(error);
    //     }
    // },

    report: (req, res, next) => {
        recordStartTime.call(req);
        try {
            const { year } = req.query;

            const param = { year, };

            orderService
                .report(param)
                .then(data => {
                    if (data) {
                        const dataOutput = {
                            result: data.totalRevenue,
                            success: true,
                            errors: [],
                            messages: []
                        };

                        // Nếu có year, trả về dữ liệu doanh thu theo tháng
                        if (year) {
                            dataOutput.monthlyRevenue = data.monthlyRevenue;
                        }

                        res.send(dataOutput);

                        recordStartTime.call(res);
                        loggerHelpers.logBLOCKDED(req, res, {
                            dataReqBody: req.body,
                            dataReqQuery: req.query,
                            dataRes: dataOutput
                        });
                    }
                })
                .catch(error => {
                    const errorOutput = {
                        success: false,
                        errors: [error.message],
                        messages: ['Lỗi khi lấy báo cáo doanh thu.']
                    };

                    res.status(500).json(errorOutput);
                    next(error);
                });
        } catch (error) {
            const errorOutput = {
                success: false,
                errors: [error.message],
                messages: ['Lỗi hệ thống.']
            };

            res.status(500).json(errorOutput);
            next(error);
        }
    },

    compareMonth: (req, res, next) => {
        recordStartTime.call(req);
        try {
            orderService.compareMonth()
                .then(data => {
                    if (data) {
                        const dataOutput = {
                            result: data,
                            success: true,
                            errors: [],
                            messages: []
                        };

                        res.status(200).json(dataOutput);
                    } else {
                        throw new ApiErrors.BaseError({
                            statusCode: 202,
                            type: 'crudNotExisted',
                            message: 'Không có dữ liệu chi tiêu'
                        });
                    }
                })
                .catch(error => {
                    const errorOutput = {
                        success: false,
                        errors: [error.message],
                        messages: ['Lỗi khi so sánh chi tiêu tháng này và tháng trước.']
                    };

                    res.status(500).json(errorOutput);
                    next(error);
                });
        } catch (error) {
            const errorOutput = {
                success: false,
                errors: [error.message],
                messages: ['Lỗi hệ thống.']
            };
            res.status(500).json(errorOutput);
            next(error);
        }

    },
    compareYear: (req, res) => {
        recordStartTime.call(req);
        try {
            orderService.compareYear()
                .then(data => {
                    if (data) {
                        const dataOutput = {
                            result: data,
                            success: true,
                            errors: [],
                            messages: []
                        };

                        res.status(200).json(dataOutput);
                    } else {
                        throw new ApiErrors.BaseError({
                            statusCode: 202,
                            type: 'crudNotExisted',
                            message: 'Không có dữ liệu chi tiêu'
                        });
                    }
                })
                .catch(error => {
                    const errorOutput = {
                        success: false,
                        errors: [error.message],
                        messages: ['Lỗi khi so sánh chi tiêu tháng này và tháng trước.']
                    };

                    res.status(500).json(errorOutput);
                    // next(error);
                });
        } catch (error) {
            const errorOutput = {
                success: false,
                errors: [error.message],
                messages: ['Lỗi hệ thống.']
            };
            res.status(500).json(errorOutput);
            // next(error);
        }

    },
    updateStatusOrder: (req, res) => {
        recordStartTime.call(req);

        try {
            const { id } = req.params;
            const { newStatus } = req.body;
            const param = { id, newStatus };
            const status = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
            if (!status.includes(newStatus)) {
                return res.status(400).json({
                    success: false,
                    errors: ['Trạng thái không hợp lệ.'],
                    messages: ['Vui lòng cung cấp trạng thái hợp lệ.']
                });
            }
            orderService.updateStatusOrder(param)
                .then(updatedOrder => {
                    if (updatedOrder) {
                        const dataOutput = {
                            result: updatedOrder,
                            success: true,
                            errors: [],
                            messages: []
                        };

                        res.status(200).json(dataOutput);
                    } else {
                        throw new ApiErrors.BaseError({
                            statusCode: 202,
                            type: 'crudNotExisted',
                            message: 'Không tìm thấy đơn hàng'
                        });
                    }
                })
                .catch(error => {
                    const errorOutput = {
                        success: false,
                        errors: [error.message],
                        messages: ['Lỗi khi cập nhật trạng thái đơn hàng.']
                    };
                    res.status(500).json(errorOutput);
                });
        } catch (error) {
            const errorOutput = {
                success: false,
                errors: [error.message],
                messages: ['Lỗi hệ thống.']
            };

            res.status(500).json(errorOutput);
            // next(error);
        }
    }
};

