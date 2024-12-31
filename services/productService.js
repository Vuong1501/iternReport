// import moment from 'moment'
import MODELS from '../models/models';
import models from '../entity/index';
import _, { transform } from 'lodash';
import * as ApiErrors from '../errors';
// import config from "../config";
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';

const { products /* tblGatewayEntity, Roles */, sequelize } = models;
// const pool = config.sql.pool;

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

                whereFilter = await filterHelpers.makeStringFilterRelatively(['productsName'], whereFilter, 'products');

                if (!whereFilter) {
                    whereFilter = { ...filter };
                }

                console.log('where', whereFilter);

                MODELS.findAndCountAll(products, {
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
                        reject(ErrorHelpers.errorReject(err, 'getListError', 'ProductService'));
                    });
            } catch (err) {
                reject(ErrorHelpers.errorReject(err, 'getListError', 'ProductService'));
            }
        }),
    get_list_multi: param =>
        new Promise(async (resolve, reject) => {
            try {
                console.log('where');

                const { filter } = param;
                const whereFilter = filter;

                console.log('where', whereFilter);
                await MODELS.findAndCountAll(products, {
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
                // console.log("Menu Model param: %o | id: ", param, param.id)
                console.log("ID:", param.id);
                const id = param.id;

                // const att = filterHelpers.atrributesHelper(param.attributes, ['userCreatorsId']);

                MODELS.findOne(products, {
                    where: { id: id },
                    // attributes: att
                    logging: true
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
                        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'ProductService'));
                    });
            } catch (err) {
                reject(ErrorHelpers.errorReject(err, 'getInfoError', 'ProductService'));
            }
        }),
    create: async param => {

        let finnalyResult;
        const sequelize = models.sequelize;

        try {
            await sequelize.transaction(async (t) => {

                let entity = param.entity;

                let whereFilter = {
                    productName: entity.productName
                };

                whereFilter = await filterHelpers.makeStringFilterAbsolutely(['productName'], whereFilter, 'products')

                const infoArr = Array.from(
                    await Promise.all([
                        preCheckHelpers.createPromiseCheckNew(
                            MODELS.findOne(products, { attributes: ['id'], where: whereFilter, transaction: t }),
                            entity.productName ? true : false,
                            TYPE_CHECK.CHECK_DUPLICATE,
                            { parent: 'api.product.name' }
                        ),
                    ])
                );

                if (!preCheckHelpers.check(infoArr)) {
                    throw new ApiErrors.BaseError({
                        statusCode: 202,
                        type: 'getInfoError',
                        message: 'Không xác thực được thông tin gửi lên'
                    });
                }

                finnalyResult = await MODELS.create(products, entity, { transaction: t })

                if (!finnalyResult) {
                    throw new ApiErrors.BaseError({
                        statusCode: 202,
                        type: 'crudInfo'
                    });
                }
            });
        } catch (error) {
            ErrorHelpers.errorThrow(error, 'crudError', 'ProductService');
        }

        return { result: finnalyResult };
    },
    update: async param => {
        let finnalyResult;
        const sequelize = models.sequelize;
        try {

            await sequelize.transaction(async (t) => {
                let entity = param.entity;


                const foundProduct = await MODELS.findOne(products, {
                    where: { id: param.id },
                    transaction: t
                })

                if (foundProduct) {
                    let whereFilter = {
                        id: { $ne: param.id },
                        productName: entity.productName
                    };

                    whereFilter = await filterHelpers.makeStringFilterAbsolutely(['productName'], whereFilter, 'products');

                    const infoArr = Array.from(
                        await Promise.all([
                            preCheckHelpers.createPromiseCheckNew(
                                MODELS.findOne(products, { attributes: ['id'], where: whereFilter, transaction: t }),
                                entity.productName ? true : false,
                                TYPE_CHECK.CHECK_DUPLICATE,
                                { parent: 'api.product.name' }
                            )
                        ])
                    );

                    if (!preCheckHelpers.check(infoArr)) {
                        throw new ApiErrors.BaseError({
                            statusCode: 202,
                            type: 'getInfoError',
                            message: 'Không xác thực được thông tin gửi lên'
                        });
                    }

                    await MODELS.update(products, entity, {
                        where: { id: Number(param.id) },
                        transaction: t
                    })

                    finnalyResult = await MODELS.findOne(products, {
                        where: { id: param.id },
                        transaction: t
                    })

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
            ErrorHelpers.errorThrow(error, 'crudError', 'ProductService');
        }
        return { result: finnalyResult };
    },
    update_status: param =>
        new Promise((resolve, reject) => {
            try {
                console.log('block id', param.id);
                const id = param.id;
                const entity = param.entity;

                MODELS.findOne(products, {
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
                            MODELS.update(products, entity, {
                                where: { id: id }
                            })
                                .then(() => {
                                    // console.log("rowsUpdate: ", rowsUpdate)
                                    MODELS.findOne(products, { where: { id: param.id } })
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
                                            reject(ErrorHelpers.errorReject(err, 'crudError', 'productServices'));
                                        });
                                })
                                .catch(err => {
                                    reject(ErrorHelpers.errorReject(err, 'crudError', 'productServices'));
                                });
                        }
                    })
                    .catch(err => {
                        reject(ErrorHelpers.errorReject(err, 'crudError', 'productServices'));
                    });
            } catch (err) {
                reject(ErrorHelpers.errorReject(err, 'crudError', 'productServices'));
            }
        }),
    delete: async param => {
        const sequelize = models.sequelize;
        try {
            await sequelize.transaction(async (t) => {
                // console.log('delete id', param.id);

                const foundProduct = await MODELS.findOne(products, {
                    where: { id: param.id },
                    transaction: t
                });

                if (!foundProduct) {
                    throw new ApiErrors.BaseError({
                        statusCode: 202,
                        type: 'crudNotExisted'
                    });
                } else {
                    await MODELS.destroy(products, {
                        where: { id: parseInt(param.id) },
                        transaction: t
                    });

                    const productAfterDelete = await MODELS.findOne(products, {
                        where: { Id: param.id },
                        transaction: t
                    });

                    if (productAfterDelete) {
                        throw new ApiErrors.BaseError({
                            statusCode: 202,
                            type: 'deleteError'
                        });
                    }
                }
            });

        } catch (err) {
            ErrorHelpers.errorThrow(err, 'crudError', 'ProvinceService');
        }

        return { status: 1 };
    },
    get_all: param =>
        new Promise((resolve, reject) => {
            try {
                // console.log("filter:", JSON.parse(param.filter))
                const { filter, attributes, sort } = param;

                MODELS.findAll(products, {
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
    bulk_create: async param => {
        let finnalyResult;

        try {
            const entity = param.entity;

            if (entity.provinces) {
                finnalyResult = await Promise.all(
                    entity.provinces.map(element => {
                        return MODELS.createOrUpdate(
                            products,
                            {
                                provincesName: element.provincesName,
                                userCreatorsId: entity.userCreatorsId,
                                status: element.status,
                                provinceIdentificationCode: element.provinceIdentificationCode
                            },
                            {
                                where: {
                                    provinceIdentificationCode: element.provinceIdentificationCode
                                }
                            }
                        ).catch(error => {
                            throw new ApiErrors.BaseError({
                                statusCode: 202,
                                type: 'crudError',
                                error
                            });
                        });
                    })
                );
            }
        } catch (error) {
            ErrorHelpers.errorThrow(error, 'crudError', 'WardService');
        }

        return { result: finnalyResult ? true : false };
    },

    tongDoanhThuTheoSanPham: async param => {

        const { startDate, endDate } = param;
        const formattedStartDate = (startDate === undefined) ? null : startDate;
        const formattedEndDate = (endDate === undefined) ? null : endDate;

        const query = `CALL tongDoanhThuTheoSanPham(${formattedStartDate}, ${formattedEndDate})`;

        const data = await sequelize.query(query, {
            logging: true
        })
        return data

    },

    topProduct: async param => {
        const { sortBy } = param;

        // const query = `CALL topProduct(${sortBy})`;
        const query = 'CALL topProduct(?)';

        const data = await sequelize.query(query, {
            replacements: [sortBy],
            logging: true
        })
        return data;
    }

};
