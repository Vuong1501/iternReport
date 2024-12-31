import productsService from '../services/productService';
import loggerHelpers from '../helpers/loggerHelpers';
import { recordStartTime } from '../utils/loggerFormat';

import * as ApiErrors from '../errors';

export default {
    get_list: (req, res, next) => {
        recordStartTime.call(req);

        console.log('get_list req.auth= ', req.auth);
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
            // console.log("a", param.attributes);

            productsService
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

            productsService
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

            console.log("ID:", id);
            // const { attributes } = req.query;
            const param = { id/*, attributes*/ };

            // console.log("provinceService param: ", param)
            productsService
                .get_one(param)
                .then(data => {
                    res.send(data);

                    // recordStartTime.call(res);
                    // loggerHelpers.logVIEWED(req, res, {
                    //     dataReqBody: req.body,
                    //     dataReqQuery: req.query,
                    //     dataRes: data
                    // });
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

            productsService
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

            productsService
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

            productsService
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

            productsService
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

            productsService
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
    getRevenueByProduct: (req, res, next) => {
        recordStartTime.call(req);

        try {
            const { startDate, endDate } = req.query;
            const param = { startDate, endDate };

            // Gọi hàm tính tổng doanh thu theo sản phẩm
            productsService.tongDoanhThuTheoSanPham(param)
                .then(data => {
                    const dataOutput = {
                        result: data,
                        success: true,
                        errors: [],
                        messages: []
                    };

                    // Trả về kết quả
                    res.send(dataOutput);
                    // Ghi log nếu cần
                    recordStartTime.call(res);
                    // loggerHelpers.logVIEWED(req, res, { dataRes: dataOutput });
                })
                .catch(error => {
                    error.dataQuery = req.query;
                    next(error);  // Xử lý lỗi nếu có
                });
        } catch (error) {
            error.dataQuery = req.query;
            next(error);  // Xử lý lỗi nếu có
        }
    },
    topProduct: (req, res, next) => {
        recordStartTime.call(req);
        try {
            const sortBy = req.query.sortBy || "quantity";
            const param = { sortBy };

            productsService.topProduct(param)
                .then(data => {
                    const dataOutput = {
                        result: data,
                        success: true,
                        errors: [],
                        messages: []
                    };
                    res.send(dataOutput);
                    // Ghi log nếu cần
                    recordStartTime.call(res);
                })
                .catch(error => {
                    error.dataQuery = req.query;
                    next(error);  // Xử lý lỗi nếu có
                });
        } catch (error) {
            error.dataQuery = req.query;
            next(error);  // Xử lý lỗi nếu có
        }
    }
};
