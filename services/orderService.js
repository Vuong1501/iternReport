// import moment from 'moment'
import MODELS from '../models/models';
import models from '../entity/index';
import _, { transform, update } from 'lodash';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import { where } from 'sequelize';
// import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';

const { orders, orderDetail, users, products, sequelize, orderStatusHistory /* tblGatewayEntity, Roles */ } = models;

export default {
    get_list: param =>
        new Promise(async (resolve, reject) => {
            try {
                const { filter, range, sort, attributes } = param;

                console.log(sort);

                let whereFilter = filter;
                const att = filterHelpers.atrributesHelper(attributes);

                try {
                    whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
                } catch (error) {
                    reject(error);
                }

                const perPage = range[1] - range[0] + 1;
                const page = Math.floor(range[0] / perPage);

                whereFilter = await filterHelpers.makeStringFilterRelatively(['id'], whereFilter, 'orders');

                if (!whereFilter) {
                    whereFilter = { ...filter };
                }

                console.log('where', whereFilter);

                MODELS.findAndCountAll(orders, {
                    where: whereFilter,
                    order: sort,
                    attributes: att,
                    offset: range[0],
                    limit: perPage,
                    distinct: true,
                    logging: console.log
                })
                    .then(result => {
                        resolve({
                            ...result,
                            page: page + 1,
                            perPage
                        });
                    })
                    .catch(err => {
                        reject(ErrorHelpers.errorReject(err, 'getListError', 'ProvinceService'));
                    });
            } catch (err) {
                reject(ErrorHelpers.errorReject(err, 'getListError', 'ProvinceService'));
            }
        }),
    get_list_multi: param =>
        new Promise(async (resolve, reject) => {
            try {
                const { filter } = param;
                const whereFilter = filter;

                console.log('where', whereFilter);
                await MODELS.findAndCountAll(orders, {
                    where: whereFilter,
                    attributes: ['id', 'points', 'provincesName'],
                    logging: console.log
                })
                    .then(result => {
                        if (result.count > 0) {
                            let points;

                            _.forEach(result.rows, function (item) {
                                let itemPoints;

                                if (item.dataValues.points.type === 'MultiPolygon') {
                                    itemPoints = item.dataValues.points.coordinates;
                                } else {
                                    itemPoints = [item.dataValues.points.coordinates];
                                }

                                if (points) {
                                    points = _.concat(points, itemPoints);
                                } else {
                                    points = itemPoints;
                                }
                            });
                            // console.log("dffdsfsfsfs 1111")
                            // if( _.size(points) < 2 && typePolygon === 0)
                            // {
                            //   resolve(
                            //     {
                            //       "type": "Polygon",
                            //       "coordinates":points
                            //     }
                            //   )
                            // }
                            // else{
                            resolve({
                                type: 'MultiPolygon',
                                coordinates: points
                            });
                            // }
                        } else {
                            console.log('dffdsfsfsfs');
                            resolve({});
                        }
                    })
                    .catch(err => {
                        reject(ErrorHelpers.errorReject(err, 'getListError', 'ProvinceService'));
                    });
            } catch (err) {
                reject(ErrorHelpers.errorReject(err, 'getListError', 'ProvinceService'));
            }
        }),
    get_one: param =>
        new Promise((resolve, reject) => {
            try {
                const id = param.id;
                MODELS.findOne(orders, {
                    where: { id: id },
                    include: [
                        {
                            model: users,
                            as: 'users',
                            attributes: ['username']
                        },
                        {
                            model: orderStatusHistory,
                            as: 'orderStatusHistory',
                            attributes: ['status']
                        },
                        {
                            model: orderDetail,
                            as: 'orderdetail',
                            attributes: ['order_id', 'product_id', 'quantity'],
                            include: [
                                {
                                    model: products,
                                    attributes: ['productName', 'price'],
                                    as: 'product'
                                }
                            ]
                        }
                    ]
                })
                    .then(result => {
                        if (!result) {
                            reject(
                                new ApiErrors.BaseError({
                                    statusCode: 202,
                                    type: 'crudNotExisted'
                                })
                            );
                        }
                        resolve(result);
                    })
                    .catch(err => {
                        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'OrderService'));
                    });
            } catch (err) {
                reject(ErrorHelpers.errorReject(err, 'getInfoError', 'OrderService'));
            }
        }),
    // create: async (param, orderItems) => {

    //     let finnalyResult;


    //     try {

    //         let entity = param.entity;

    //         // if (entity.points && entity.points !== '' && entity.points !== null) {
    //         //     entity = { ...entity, ...{ points: JSON.parse(entity.points) } };
    //         // }
    //         console.log("entity", entity);
    //         // if (!entity.status) {
    //         //     entity.status = param.status || 'pending';  // Hoặc lấy từ param.status nếu có, nếu không mặc định là "pending"
    //         // }
    //         // console.log('orderModel create: ', entity);
    //         // console.log("entity", entity);
    //         if (orderItems && orderItems.length > 0) {
    //             for (const item of orderItems) {
    //                 const product = await MODELS.findOne(products, {
    //                     where: { id: item.productId }
    //                 })
    //                 if (!product) {
    //                     throw new ApiErrors.BaseError({
    //                         statusCode: 404,
    //                         type: 'productNotFoundError',
    //                         message: `Sản phẩm với ID ${item.productId} không tồn tại.`
    //                     });
    //                 }
    //                 if (product.quantity < item.quantity) {
    //                     throw new ApiErrors.BaseError({
    //                         statusCode: 400,
    //                         type: 'insufficientStockError',
    //                         message: `Không đủ số lượng sản phẩm ${product.productName} trong kho. Chỉ còn ${product.quantity} sản phẩm.`
    //                     });
    //                 }

    //                 // cập nhật số lượng tồn kho
    //                 await MODELS.update(products, {
    //                     quantity: product.quantity - item.quantity
    //                 }, {
    //                     where: { id: item.productId }
    //                 });
    //             }
    //             entity.total_amount = orderItems.reduce((total, item) => {
    //                 return total + item.price * item.quantity;
    //             }, 0);
    //         }
    //         // console.log("entity", entity);
    //         finnalyResult = await MODELS.create(orders, entity).catch(error => {
    //             // console.log("error", error);
    //             throw new ApiErrors.BaseError({
    //                 statusCode: 202,
    //                 type: 'crudError',
    //                 error
    //             });
    //         });

    //         if (!finnalyResult) {
    //             throw new ApiErrors.BaseError({
    //                 statusCode: 202,
    //                 type: 'crudInfo'
    //             });
    //         }

    //         if (orderItems && orderItems.length > 0) {
    //             const orderDetailData = orderItems.map(item => ({
    //                 order_id: finnalyResult.id,
    //                 product_id: item.productId,
    //                 price: item.price,
    //                 quantity: item.quantity
    //             }));

    //             // Tạo các chi tiết đơn hàng
    //             await orderDetail.bulkCreate(orderDetailData)
    //                 .catch((error) => {
    //                     console.error('Error creating OrderDetail:', error);
    //                     throw new ApiErrors.BaseError({
    //                         statusCode: 202,
    //                         type: 'crudError',
    //                         error
    //                     });
    //                 });
    //         }
    //         // thêm trạng thái mặc định của đơn hàng vào OrderStatusHistory
    //         await models.orderStatusHistory.create({
    //             order_id: finnalyResult.id,
    //             status: 'pending',
    //             changed_at: new Date()
    //         }).catch(error => {
    //             throw new ApiErrors.BaseError({
    //                 statusCode: 202,
    //                 type: 'crudError',
    //                 error
    //             });
    //         });
    //     } catch (error) {
    //         console.log("errorrrrrrrrrrrrr", error);
    //         ErrorHelpers.errorThrow(error, 'crudError', 'OrderService');
    //     }

    //     return { result: finnalyResult };
    // },


    create: async (param, orderItems) => {
        let finallyResult;
        const sequelize = models.sequelize;

        try {
            console.log("bắt đầu giao dịch");
            await sequelize.transaction(async (t) => {
                let entity = param.entity;

                console.log("entity", entity);

                if (orderItems && orderItems.length > 0) {
                    for (const item of orderItems) {
                        const product = await MODELS.findOne(products, {
                            where: { id: item.productId },
                            transaction: t,
                        });

                        // console.log("Lấy ra sản phẩm:", product);

                        if (!product) {
                            // console.log("Không có sản phẩm với id này");
                            throw new ApiErrors.BaseError({
                                statusCode: 404,
                                type: 'productNotFoundError',
                                message: `Sản phẩm với ID ${item.productId} không tồn tại.`,
                            });
                        }

                        if (product.quantity < item.quantity) {
                            throw new ApiErrors.BaseError({
                                statusCode: 400,
                                type: 'insufficientStockError',
                                message: `Không đủ số lượng sản phẩm ${product.productName} trong kho. Chỉ còn ${product.quantity} sản phẩm.`,
                            });
                        }

                        // Cập nhật số lượng tồn kho
                        await MODELS.update(
                            products,
                            { quantity: product.quantity - item.quantity },
                            {
                                where: { id: item.productId },
                                transaction: t,
                            }
                        );
                    }

                    entity.total_amount = orderItems.reduce((total, item) => {
                        return total + item.price * item.quantity;
                    }, 0);
                }


                // Tạo đơn hàng
                finallyResult = await MODELS.create(orders, entity, { transaction: t });

                if (!finallyResult) {
                    throw new ApiErrors.BaseError({
                        statusCode: 202,
                        type: 'crudInfo',
                    });
                }

                if (orderItems && orderItems.length > 0) {
                    const orderDetailData = orderItems.map((item) => ({
                        order_id: finallyResult.id,
                        product_id: item.productId,
                        price: item.price,
                        quantity: item.quantity,
                    }));

                    // Tạo các chi tiết đơn hàng
                    await orderDetail.bulkCreate(orderDetailData, { transaction: t });
                }

                // Thêm trạng thái mặc định của đơn hàng vào OrderStatusHistory
                await models.orderStatusHistory.create(
                    {
                        order_id: finallyResult.id,
                        status: 'pending',
                        changed_at: new Date(),
                    },
                    { transaction: t }
                );
            });
        } catch (error) {
            console.log("errorrrrrrrrrrrrr", error);
            ErrorHelpers.errorThrow(error, 'crudError', 'OrderService');
        }

        return { result: finallyResult };
    },

    update: async param => {

        let finnalyResult;
        const sequelize = models.sequelize;

        try {
            await sequelize.transaction(async (t) => {
                let entity = param.entity;

                const foundOrder = await MODELS.findOne(orders, {
                    where: {
                        id: param.id
                    },
                    transaction: t
                }).catch(error => {
                    throw new ApiErrors.BaseError({
                        statusCode: 202,
                        type: 'getInfoError',
                        message: 'Lấy thông tin của đơn hàng thất bại!',
                        error
                    });
                });

                if (foundOrder) {
                    if (param.user_id) {
                        entity.user_id = param.user_id;  // Cập nhật user_id vào entity
                    }

                    await MODELS.update(orders, entity, {
                        where: { id: Number(param.id) },
                        transaction: t
                    }).catch(error => {
                        throw new ApiErrors.BaseError({
                            statusCode: 202,
                            type: 'crudError',
                            error
                        });
                    });

                    finnalyResult = await MODELS.findOne(orders, {
                        where: { id: param.id },
                        transaction: t
                    }).catch(error => {
                        throw new ApiErrors.BaseError({
                            statusCode: 202,
                            type: 'crudInfo',
                            message: 'Lấy thông tin sau khi thay đổi thất bại',
                            error
                        });
                    });

                    if (!finnalyResult) {
                        throw new ApiErrors.BaseError({
                            statusCode: 202,
                            type: 'crudInfo',
                            message: 'Lấy thông tin sau khi thay đổi thất bại'
                        });
                    }
                } else {
                    throw new ApiErrors.BaseError({
                        statusCode: 202,
                        type: 'crudNotExisted'
                    });
                }

            });
        } catch (error) {
            ErrorHelpers.errorThrow(error, 'crudError', 'OrdersService');
        }

        return { result: finnalyResult };
    },
    update_status: param =>
        new Promise((resolve, reject) => {
            try {
                console.log('block id', param.id);
                const id = param.id;
                const entity = param.entity;

                MODELS.findOne(orders, {
                    where: {
                        id
                    },
                    logging: console.log
                })
                    .then(findEntity => {
                        // console.log("findPlace: ", findPlace)
                        if (!findEntity) {
                            reject(
                                new ApiErrors.BaseError({
                                    statusCode: 202,
                                    type: 'crudNotExisted'
                                })
                            );
                        } else {
                            MODELS.update(orders, entity, {
                                where: { id: id }
                            })
                                .then(() => {
                                    // console.log("rowsUpdate: ", rowsUpdate)
                                    MODELS.findOne(orders, { where: { id: param.id } })
                                        .then(result => {
                                            if (!result) {
                                                reject(
                                                    new ApiErrors.BaseError({
                                                        statusCode: 202,
                                                        type: 'deleteError'
                                                    })
                                                );
                                            } else resolve({ status: 1, result: result });
                                        })
                                        .catch(err => {
                                            reject(ErrorHelpers.errorReject(err, 'crudError', 'provincesServices'));
                                        });
                                })
                                .catch(err => {
                                    reject(ErrorHelpers.errorReject(err, 'crudError', 'provincesServices'));
                                });
                        }
                    })
                    .catch(err => {
                        reject(ErrorHelpers.errorReject(err, 'crudError', 'provincesServices'));
                    });
            } catch (err) {
                reject(ErrorHelpers.errorReject(err, 'crudError', 'provincesServices'));
            }
        }),
    delete: async param => {
        const sequelize = models.sequelize;
        try {
            // console.log('delete id', param.id);
            await sequelize.transaction(async (t) => {
                const foundOrder = await MODELS.findOne(orders, {
                    where: { id: param.id },
                    transaction: t
                })

                if (!foundOrder) {
                    throw new ApiErrors.BaseError({
                        statusCode: 202,
                        type: 'crudNotExisted'
                    });
                } else {
                    await MODELS.destroy(orders, {
                        where: { id: parseInt(param.id) },
                        transaction: t
                    });

                    const orderAfterDelete = await MODELS.findOne(orders, {
                        where: { id: param.id },
                        transaction: t
                    })

                    if (orderAfterDelete) {
                        throw new ApiErrors.BaseError({
                            statusCode: 202,
                            type: 'deleteError'
                        });
                    }
                }
            });
        } catch (err) {
            ErrorHelpers.errorThrow(err, 'crudError', 'OrderService');
        }
        return { status: 1 };
    },
    get_all: param =>
        new Promise((resolve, reject) => {
            try {
                // console.log("filter:", JSON.parse(param.filter))
                const { filter, attributes, sort } = param;

                MODELS.findAll(orders, {
                    where: filter,
                    order: sort,
                    attributes: attributes
                })
                    .then(result => {
                        // console.log("result: ", result)
                        resolve(result);
                    })
                    .catch(err => {
                        reject(ErrorHelpers.errorReject(err, 'getListError', 'ProvinceService'));
                    });
            } catch (err) {
                reject(ErrorHelpers.errorReject(err, 'getListError', 'ProvinceService'));
            }
        }),
    // reportByYear: (param) => {
    //     return new Promise((resolve, reject) => {
    //         const { year } = param;

    //         const query = `
    //             SELECT 
    //                 m.month, 
    //                 COALESCE(SUM(od.quantity * od.price), 0) AS totalRevenue
    //             FROM 
    //                 (SELECT 1 AS month UNION ALL SELECT 2 UNION ALL SELECT 3 
    //                  UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 
    //                  UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 
    //                  UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12) AS m
    //             LEFT JOIN Orders o ON MONTH(o.created_at) = m.month AND YEAR(o.created_at) = ?
    //             LEFT JOIN OrderDetail od ON od.order_id = o.id
    //             GROUP BY m.month
    //             ORDER BY m.month
    //         `;

    //         models.sequelize.query(query, {
    //             replacements: [year],
    //         })
    //             .then(([results]) => {
    //                 if (results) {
    //                     resolve(results);
    //                 } else {
    //                     reject(new ApiErrors.BaseError({
    //                         statusCode: 202,
    //                         type: 'crudNotExisted',
    //                         message: 'Không có dữ liệu doanh thu cho năm này'
    //                     }));
    //                 }
    //             })
    //             .catch(err => {
    //                 console.log("Error in reportByYear:", err);
    //                 reject(ErrorHelpers.errorReject(err, 'crudError', 'orderService'));
    //             });
    //     });
    // },
    // reportTotalRevenue: (param) => {
    //     return new Promise((resolve, reject) => {
    //         const { startDate, endDate } = param;

    //         // Query cơ bản để tính tổng doanh thu
    //         let query = `
    //             SELECT SUM(od.quantity * od.price) AS totalRevenue
    //             FROM Orders o
    //             INNER JOIN OrderDetail od ON o.id = od.order_id
    //         `;

    //         // Kiểm tra điều kiện ngày bắt đầu và ngày kết thúc
    //         if (startDate || endDate) {
    //             const conditions = [];

    //             if (startDate) {
    //                 conditions.push(`o.created_at >= '${startDate}'`);
    //             }

    //             if (endDate) {
    //                 conditions.push(`o.created_at <= '${endDate}'`);
    //             }

    //             // Thêm điều kiện WHERE nếu có bất kỳ điều kiện nào
    //             if (conditions.length > 0) {
    //                 query += ' WHERE ' + conditions.join(' AND ');
    //             }
    //         }

    //         // Thực hiện truy vấn để tính tổng doanh thu
    //         models.sequelize.query(query)
    //             .then(([result]) => { // Dùng destructuring để lấy mảng đầu tiên
    //                 if (result && result[0]) {
    //                     resolve({ totalRevenue: result[0].totalRevenue || 0 });
    //                 } else {
    //                     reject(new ApiErrors.BaseError({
    //                         statusCode: 202,
    //                         type: 'crudNotExisted',
    //                         message: 'Không có dữ liệu doanh thu'
    //                     }));
    //                 }
    //             })
    //             .catch(err => {
    //                 reject(ErrorHelpers.errorReject(err, 'crudError', 'orderService'));
    //             });
    //     });
    // },
    report: (param) => {
        return new Promise((resolve, reject) => {
            const { year } = param;

            const query = `CALL report(?)`;

            // Nếu có year, truyền vào tham số year, nếu không truyền null
            models.sequelize.query(query, {
                replacements: [year || null],
            })
                .then((data) => {
                    if (data && data.length) {
                        // Nếu có dữ liệu, trả về
                        resolve({
                            totalRevenue: year ? data : data[0].total || 0, // Nếu có year, trả về theo tháng, nếu không trả về tổng
                            // monthlyRevenue: year ? data : []
                        });
                    } else {
                        reject(new ApiErrors.BaseError({
                            statusCode: 202,
                            type: 'crudNotExisted',
                            message: year ? 'Không có dữ liệu doanh thu cho năm này' : 'Không có dữ liệu doanh thu'
                        }));
                    }
                })
                .catch(err => {
                    reject(ErrorHelpers.errorReject(err, 'crudError', 'orderService'));
                });
        });
    },
    compareMonth: async () => {

        let query = 'CALL compareMonth()';

        const data = await sequelize.query(query, {
            logging: true
        })
        return data;
    },
    compareYear: async () => {
        let query = 'CALL compareYear()';
        const data = await sequelize.query(query, {
            logging: true
        })
        return data;
    },
    // updateStatusOrder: async param => {
    //     const { id, newStatus } = param;
    //     console.log("newStatusnewStatus", newStatus);
    //     try {
    //         const foundOrder = await MODELS.findOne(orders, {
    //             where: {
    //                 id: id
    //             }
    //         })
    //         if (!foundOrder) {
    //             throw new ApiErrors.BaseError({
    //                 statusCode: 404,
    //                 type: 'notFoundError',
    //                 message: 'Đơn hàng không tồn tại.'
    //             });
    //         }
    //         if (newStatus !== "cancelled" && ["completed", "cancelled"].includes(foundOrder.status)) {
    //             throw new ApiErrors.BaseError({
    //                 statusCode: 400,
    //                 type: 'invalidStatusChangeError',
    //                 message: 'Không thể cập nhật trạng thái từ completed hoặc cancelled sang trạng thái khác.'
    //             });
    //         }
    //         // console.log("foundOrderrrrrr:", JSON.stringify(foundOrder, null, 2));
    //         if (foundOrder.status === newStatus) {
    //             throw new ApiErrors.BaseError({
    //                 statusCode: 400,
    //                 type: 'noChangeError',
    //                 message: 'Trạng thái mới phải khác trạng thái hiện tại.'
    //             });
    //         }
    //         // thêm lại tồn kho nếu trạng thái là hủy
    //         if (newStatus === "cancelled") {
    //             const orderItems = await MODELS.findAll(orderDetail, {
    //                 where: { order_id: id }
    //             });
    //             for (const item of orderItems) {
    //                 await MODELS.update(products,
    //                     { quantity: sequelize.literal(`quantity + ${item.quantity}`) },
    //                     { where: { id: item.product_id } }
    //                 );
    //             }

    //         }
    //         // cập nhật trạng thái đơn hàng
    //         await MODELS.update(orders, { status: newStatus }, { where: { id: Number(id) } }).catch(error => {
    //             throw new ApiErrors.BaseError({
    //                 statusCode: 202,
    //                 type: 'crudError',
    //                 error
    //             });
    //         });

    //         // console.log('aaa', {
    //         //     order_id: foundOrder.id,
    //         //     status: newStatus,
    //         //     changed_at: new Date()
    //         // })
    //         await models.orderStatusHistory.create({
    //             order_id: foundOrder.id,
    //             status: newStatus,
    //             changed_at: new Date()
    //         });

    //         const updatedOrder = await MODELS.findOne(orders, { where: { id: id } });

    //         // console.log("updatedOrder", updatedOrder);

    //         return updatedOrder;
    //     } catch (error) {
    //         console.log("errrrrr", error);
    //         throw new ApiErrors.BaseError({
    //             statusCode: 500,
    //             type: 'updateError',
    //             message: 'Lỗi khi cập nhật trạng thái đơn hàng.',
    //             error
    //         });
    //     }
    // },
    // updateStatusOrder: async param => {

    //     const { id, newStatus } = param;
    //     console.log("newStatus:", newStatus);

    //     const sequelize = models.sequelize;

    //     try {
    //         console.log("Bắt đầu giao dịch");

    //         const result = await sequelize.transaction(async (t) => {
    //             const foundOrder = await MODELS.findOne(orders, {
    //                 where: { id: id },
    //                 transaction: t
    //             });
    //             console.log("foundOrderfoundOrder", foundOrder);
    //             console.log("Tìm thấy đơn hàng");

    //             if (!foundOrder) {
    //                 throw new ApiErrors.BaseError({
    //                     statusCode: 404,
    //                     type: 'notFoundError',
    //                     message: 'Đơn hàng không tồn tại.'
    //                 });
    //             }
    //             if (["completed", "cancelled"].includes(foundOrder.status)) {
    //                 throw new ApiErrors.BaseError({
    //                     statusCode: 400,
    //                     type: 'invalidStatusChangeError',
    //                     message: 'Không thể cập nhật trạng thái từ completed hoặc cancelled sang trạng thái khác.'
    //                 });
    //             } else if (foundOrder.status === newStatus) {
    //                 throw new ApiErrors.BaseError({
    //                     statusCode: 400,
    //                     type: 'noChangeError',
    //                     message: 'Trạng thái mới phải khác trạng thái hiện tại.'
    //                 });
    //             }

    //             // Nếu trạng thái mới là "cancelled", cập nhật lại tồn kho
    //             if (newStatus === "cancelled") {
    //                 const orderItems = await MODELS.findAll(orderDetail, {
    //                     where: { order_id: id },
    //                     transaction: t
    //                 });
    //                 for (const item of orderItems) {
    //                     await MODELS.update(products,
    //                         { quantity: sequelize.literal(`quantity + ${item.quantity}`) },
    //                         {
    //                             where: { id: item.product_id },
    //                             transaction: t
    //                         });
    //                 }
    //             }

    //             // Cập nhật trạng thái đơn hàng
    //             await MODELS.update(orders, { status: newStatus }, {
    //                 where: { id: Number(id) },
    //                 transaction: t
    //             })
    //             console.log("đã đến đây");

    //             // Thêm lịch sử thay đổi trạng thái đơn hàng
    //             await models.orderStatusHistory.create(
    //                 {
    //                     order_id: foundOrder.id,
    //                     status: newStatus,
    //                     changed_at: new Date()
    //                 },
    //                 { transaction: t }
    //             );
    //             console.log("đã đến đây1");


    //             const updatedOrder = await MODELS.findOne(orders, {
    //                 where: { id: id },
    //                 transaction: t
    //             });
    //             console.log("updatedOrder", updatedOrder);
    //             return updatedOrder;
    //         });
    //         console.log("resultresult", result);
    //         return result;
    //     } catch (error) {
    //         console.log("err:", error);
    //         throw new ApiErrors.BaseError({
    //             statusCode: 500,
    //             type: 'updateError',
    //             message: 'Lỗi khi cập nhật trạng thái đơn hàng.',
    //             error
    //         });
    //     }
    // },

    // updateStatusOrder: async param => {
    //     const { id, newStatus } = param;
    //     console.log("newStatus:", newStatus);

    //     const sequelize = models.sequelize;

    //     try {
    //         console.log("Bắt đầu giao dịch");
    //         const result = await sequelize.transaction(async (t) => {
    //             const foundOrder = await MODELS.findOne(orders, {
    //                 where: { id: id },
    //                 transaction: t // Tất cả các truy vấn đều nằm trong giao dịch này
    //             });
    //             console.log("foundOrder", foundOrder);

    //             if (!foundOrder) {
    //                 throw new ApiErrors.BaseError({
    //                     statusCode: 404,
    //                     type: 'notFoundError',
    //                     message: 'Đơn hàng không tồn tại.'
    //                 });
    //             }

    //             if (["completed", "cancelled"].includes(foundOrder.status)) {
    //                 throw new ApiErrors.BaseError({
    //                     statusCode: 400,
    //                     type: 'invalidStatusChangeError',
    //                     message: 'Không thể cập nhật trạng thái từ completed hoặc cancelled sang trạng thái khác.'
    //                 });
    //             } else if (foundOrder.status === newStatus) {
    //                 throw new ApiErrors.BaseError({
    //                     statusCode: 400,
    //                     type: 'noChangeError',
    //                     message: 'Trạng thái mới phải khác trạng thái hiện tại.'
    //                 });
    //             }

    //             // Nếu trạng thái mới là "cancelled", cập nhật lại tồn kho
    //             if (newStatus === "cancelled") {
    //                 const orderItems = await MODELS.findAll(orderDetail, {
    //                     where: { order_id: id },
    //                     transaction: t // Đảm bảo query này cũng nằm trong transaction
    //                 });
    //                 for (const item of orderItems) {
    //                     await MODELS.update(products,
    //                         { quantity: sequelize.literal(`quantity + ${item.quantity}`) },
    //                         {
    //                             where: { id: item.product_id },
    //                             transaction: t // Đảm bảo tất cả các thao tác update cũng nằm trong transaction
    //                         });
    //                 }
    //             }

    //             // Cập nhật trạng thái đơn hàng
    //             await MODELS.update(orders, { status: newStatus }, {
    //                 where: { id: Number(id) },
    //                 transaction: t // Đảm bảo update cũng nằm trong transaction
    //             });

    //             // Thêm lịch sử thay đổi trạng thái đơn hàng
    //             await models.orderStatusHistory.create(
    //                 {
    //                     order_id: foundOrder.id,
    //                     status: newStatus,
    //                     changed_at: new Date()
    //                 },
    //                 { transaction: t } // Đảm bảo create nằm trong transaction
    //             );

    //             // Truy vấn lại đơn hàng đã cập nhật
    //             const updatedOrder = await MODELS.findOne(orders, {
    //                 where: { id: id },
    //                 transaction: t // Truy vấn lại cũng phải nằm trong cùng giao dịch
    //             });
    //             return updatedOrder;
    //         });

    //         console.log("result", result);
    //         return result; // Trả về kết quả sau giao dịch thành công
    //     } catch (error) {
    //         console.log("err:", error);
    //         throw new ApiErrors.BaseError({
    //             statusCode: 500,
    //             type: 'updateError',
    //             message: 'Lỗi khi cập nhật trạng thái đơn hàng.',
    //             error
    //         });
    //     }
    // },


    updateStatusOrder: async param => {
        const { id, newStatus } = param;
        console.log("newStatus:", newStatus);

        const sequelize = models.sequelize;

        try {
            console.log("Bắt đầu giao dịch");
            return await sequelize.transaction(async (t) => {
                const foundOrder = await MODELS.findOne(orders, {
                    where: { id: id },
                    transaction: t
                });
                console.log("foundOrder", foundOrder);

                if (!foundOrder) {
                    throw new ApiErrors.BaseError({
                        statusCode: 404,
                        type: 'notFoundError',
                        message: 'Đơn hàng không tồn tại.'
                    });
                }

                if (["completed", "cancelled"].includes(foundOrder.status)) {
                    throw new ApiErrors.BaseError({
                        statusCode: 400,
                        type: 'invalidStatusChangeError',
                        message: 'Không thể cập nhật trạng thái từ completed hoặc cancelled sang trạng thái khác.'
                    });
                } else if (foundOrder.status === newStatus) {
                    throw new ApiErrors.BaseError({
                        statusCode: 400,
                        type: 'noChangeError',
                        message: 'Trạng thái mới phải khác trạng thái hiện tại.'
                    });
                }

                // Nếu trạng thái mới là "cancelled", cập nhật lại tồn kho
                if (newStatus === "cancelled") {
                    const orderItems = await MODELS.findAll(orderDetail, {
                        where: { order_id: id },
                        transaction: t
                    });
                    for (const item of orderItems) {
                        await MODELS.update(products,
                            { quantity: sequelize.literal(`quantity + ${item.quantity}`) },
                            {
                                where: { id: item.product_id },
                                transaction: t
                            });
                    }
                }

                // Cập nhật trạng thái đơn hàng
                await MODELS.update(orders, { status: newStatus }, {
                    where: { id: Number(id) },
                    transaction: t
                });

                // Thêm lịch sử thay đổi trạng thái đơn hàng
                await models.orderStatusHistory.create(
                    {
                        order_id: foundOrder.id,
                        status: newStatus,
                        changed_at: new Date()
                    },
                    { transaction: t }
                );

                // Truy vấn lại đơn hàng đã cập nhật
                const updatedOrder = await MODELS.findOne(orders, {
                    where: { id: id },
                    transaction: t
                });
                return updatedOrder;
            });
        } catch (error) {
            console.log("err:", error);
            throw new ApiErrors.BaseError({
                statusCode: 500,
                type: 'updateError',
                message: 'Lỗi khi cập nhật trạng thái đơn hàng.',
                error
            });
        }
    }



};
