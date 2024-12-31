// import moment from 'moment'
import MODELS from '../models/models';
import models from '../entity/index';
import _, { includes } from 'lodash';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
import { Op, where } from 'sequelize';

const { users, friend, sequelize, requestFriend } = models;

export default {
    get_list: async param => {
        try {
            const userId = param;
            const friends = await friend.findAll({
                where: {
                    [Op.or]: [
                        { user1_id: userId },
                        { user2_id: userId }
                    ]
                },
                include: [
                    {
                        model: users,
                        as: 'user1',
                        attributes: ['id', 'fullname']
                    },
                    {
                        model: users,
                        as: 'user2',
                        attributes: ['id', 'fullname']
                    }
                ]
            });

            // console.log("friends:", JSON.stringify(friends, null, 2));

            const friendList = friends
                .map(friend => {
                    if (friend.user1_id === userId) {
                        return {
                            id: friend.user2_id,
                            fullName: friend.user2.fullname
                        };
                    }
                    // Kiểm tra nếu userId nằm ở user2_id, lấy user1
                    if (friend.user2_id === userId) {
                        return {
                            id: friend.user1_id,
                            fullName: friend.user1.fullname
                        };
                    }
                    // Trường hợp không liên quan đến userId
                    return null;
                });

            console.log("friendList:", JSON.stringify(friendList, null, 2));
            // console.log("friendList", friendList);

            // Loại bỏ các cặp trùng lặp (dựa trên id)
            const uniqueFriendList = Array.from(
                new Map(friendList.map(friend => [friend.id, friend])).values()
            );

            // console.log("uniqueFriendList:", uniqueFriendList);
            return uniqueFriendList;

        } catch (error) {
            console.log("errrrrrrrr", error);
            throw new Error('Error fetching friends: ' + error.message);
        }

        // return new Promise((resolve, reject) => {
        //     // Câu lệnh SQL để lấy danh sách bạn bè của userId
        //     const sqlQuery = `
        //       SELECT 
        //         f.user1_id AS friend_id, 
        //         u1.userName AS friend_userName,
        //         u1.fullName AS friend_fullName
        //       FROM friend f
        //       JOIN users u1 ON f.user1_id = u1.id
        //       WHERE f.user2_id = 1
        //       UNION
        //       SELECT 
        //         f.user2_id AS friend_id, 
        //         u2.userName AS friend_userName,
        //         u2.fullName AS friend_fullName
        //       FROM friend f
        //       JOIN users u2 ON f.user2_id = u2.id
        //       WHERE f.user1_id = 1;
        //     `;

        //     console.log("sqlQuery:", sqlQuery);

        //     // Thực thi câu lệnh SQL với userId được truyền vào
        //     sequelize.query(sqlQuery, {
        //         replacements: { userId },  // Truyền tham số vào câu lệnh SQL
        //     })
        //         .then(friends => {
        //             if (!friends || friends.length === 0) {
        //                 return reject(new ApiErrors.BaseError({
        //                     statusCode: 404,
        //                     type: 'friendsNotFound',
        //                     message: 'No friends found for this user.'
        //                 }));
        //             }
        //             resolve(friends);
        //         })
        //         .catch(error => {
        //             reject(new ApiErrors.BaseError({
        //                 statusCode: 500,
        //                 type: 'serverError',
        //                 message: 'Error fetching friends: ' + error.message
        //             }));
        //         });
        // });
    },
    get_list_multi: param =>
        new Promise(async (resolve, reject) => {
            try {
                const { filter } = param;
                const whereFilter = filter;

                console.log('where', whereFilter);
                await MODELS.findAndCountAll(provinces, {
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
                const id = param.id;
                const att = filterHelpers.atrributesHelper(param.attributes, ['userCreatorsId']);

                MODELS.findOne(provinces, {
                    where: { id: id },
                    attributes: att
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
                        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'ProvinceService'));
                    });
            } catch (err) {
                reject(ErrorHelpers.errorReject(err, 'getInfoError', 'ProvinceService'));
            }
        }),
    create: async param => {
        let finnalyResult;

        try {
            let entity = param.entity;

            if (entity.points && entity.points !== '' && entity.points !== null) {
                entity = { ...entity, ...{ points: JSON.parse(entity.points) } };
            }
            console.log('provinceModel create: ', entity);
            let whereFilter = {
                provincesName: entity.provincesName
            };
            // api.provinces.identificationCode

            const whereFilterProvinceIdentificationCode = {
                provinceIdentificationCode: entity.provinceIdentificationCode
            };

            whereFilter = await filterHelpers.makeStringFilterAbsolutely(['provincesName'], whereFilter, 'provinces');

            // const dupProvince = await preCheckHelpers.createPromiseCheckNew(MODELS.findOne(provinces,
            //   {
            //     where: whereFilter
            //   }), entity.provincesName ? true : false, TYPE_CHECK.CHECK_DUPLICATE,
            //   { parent: 'api.provinces.name' }
            // );

            // if (!preCheckHelpers.check([dupProvince])) {
            //   throw new ApiErrors.BaseError({
            //     statusCode: 202,
            //     type: 'getInfoError',
            //     message: 'Không xác thực được thông tin gửi lên'
            //   })
            // }

            const infoArr = Array.from(
                await Promise.all([
                    preCheckHelpers.createPromiseCheckNew(
                        MODELS.findOne(provinces, { attributes: ['id'], where: whereFilter }),
                        entity.provincesName ? true : false,
                        TYPE_CHECK.CHECK_DUPLICATE,
                        { parent: 'api.provinces.name' }
                    ),
                    preCheckHelpers.createPromiseCheckNew(
                        MODELS.findOne(provinces, { attributes: ['id'], where: whereFilterProvinceIdentificationCode }),
                        entity.provinceIdentificationCode ? true : false,
                        TYPE_CHECK.CHECK_DUPLICATE,
                        { parent: 'api.provinces.identificationCode' }
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

            finnalyResult = await MODELS.create(provinces, entity).catch(error => {
                throw new ApiErrors.BaseError({
                    statusCode: 202,
                    type: 'crudError',
                    error
                });
            });

            if (!finnalyResult) {
                throw new ApiErrors.BaseError({
                    statusCode: 202,
                    type: 'crudInfo'
                });
            }
        } catch (error) {
            ErrorHelpers.errorThrow(error, 'crudError', 'ProvinceService');
        }

        return { result: finnalyResult };
    },
    update: async param => {
        let finnalyResult;

        try {
            let entity = param.entity;

            console.log('Province update: ', JSON.parse(entity.points));

            if (entity.points && entity.points !== '' && entity.points !== null) {
                entity = { ...entity, ...{ points: JSON.parse(entity.points) } };
            }

            const foundProvince = await MODELS.findOne(provinces, {
                where: {
                    id: param.id
                }
            }).catch(error => {
                throw new ApiErrors.BaseError({
                    statusCode: 202,
                    type: 'getInfoError',
                    message: 'Lấy thông tin của Tỉnh/Thành phố thất bại!',
                    error
                });
            });

            if (foundProvince) {
                let whereFilter = {
                    id: { $ne: param.id },
                    provincesName: entity.provincesName
                };

                whereFilter = await filterHelpers.makeStringFilterAbsolutely(['provincesName'], whereFilter, 'provinces');

                const whereFilterProvinceIdentificationCode = {
                    id: { $ne: param.id },
                    provinceIdentificationCode: entity.provinceIdentificationCode
                };

                /*
                const dupProvince = await preCheckHelpers.createPromiseCheckNew(MODELS.findOne(provinces
                  ,{
                    where: whereFilter
                  })
                  , entity.provincesName ? true : false, TYPE_CHECK.CHECK_DUPLICATE,
                  { parent: 'api.provinces.name' }
                );
        
                if (!preCheckHelpers.check([dupProvince])) {
                  throw new ApiErrors.BaseError({
                    statusCode: 202,
                    type: 'getInfoError',
                    message: 'Không xác thực được thông tin gửi lên'
                  })
                }*/

                const infoArr = Array.from(
                    await Promise.all([
                        preCheckHelpers.createPromiseCheckNew(
                            MODELS.findOne(provinces, { attributes: ['id'], where: whereFilter }),
                            entity.provincesName ? true : false,
                            TYPE_CHECK.CHECK_DUPLICATE,
                            { parent: 'api.provinces.name' }
                        ),
                        preCheckHelpers.createPromiseCheckNew(
                            MODELS.findOne(provinces, { attributes: ['id'], where: whereFilterProvinceIdentificationCode }),
                            entity.provinceIdentificationCode ? true : false,
                            TYPE_CHECK.CHECK_DUPLICATE,
                            { parent: 'api.provinces.identificationCode' }
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

                await MODELS.update(provinces, entity, { where: { id: Number(param.id) } }).catch(error => {
                    throw new ApiErrors.BaseError({
                        statusCode: 202,
                        type: 'crudError',
                        error
                    });
                });

                finnalyResult = await MODELS.findOne(provinces, { where: { id: param.id } }).catch(error => {
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
        } catch (error) {
            ErrorHelpers.errorThrow(error, 'crudError', 'ProvinceService');
        }

        return { result: finnalyResult };
    },
    update_status: param =>
        new Promise((resolve, reject) => {
            try {
                console.log('block id', param.id);
                const id = param.id;
                const entity = param.entity;

                MODELS.findOne(provinces, {
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
                            MODELS.update(provinces, entity, {
                                where: { id: id }
                            })
                                .then(() => {
                                    // console.log("rowsUpdate: ", rowsUpdate)
                                    MODELS.findOne(provinces, { where: { id: param.id } })
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
        try {
            console.log('delete id', param.id);

            const foundProvince = await MODELS.findOne(provinces, {
                where: {
                    id: param.id
                }
            }).catch(error => {
                throw new ApiErrors.BaseError({
                    statusCode: 202,
                    type: 'getInfoError',
                    error
                });
            });

            if (!foundProvince) {
                throw new ApiErrors.BaseError({
                    statusCode: 202,
                    type: 'crudNotExisted'
                });
            } else {
                await MODELS.destroy(provinces, { where: { id: parseInt(param.id) } });

                const provinceAfterDelete = await MODELS.findOne(provinces, { where: { Id: param.id } }).catch(err => {
                    ErrorHelpers.errorThrow(err, 'crudError', 'ProvinceService');
                });

                if (provinceAfterDelete) {
                    throw new ApiErrors.BaseError({
                        statusCode: 202,
                        type: 'deleteError'
                    });
                }
            }
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

                MODELS.findAll(provinces, {
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
                            provinces,
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
    sendRequestFriend: async param => {
        const userReceiveId = param.userReceiveId;
        const userSendId = param.userSendId;
        // không gửi kết bạn cho chính mình
        if (userSendId === userReceiveId) {
            throw new Error('Không gửi kết bạn cho chính mình');
        };

        const existFriend = await friend.findOne({
            where: {
                [Op.or]: [
                    { user1_id: userSendId, user2_id: userReceiveId },
                    { user1_id: userReceiveId, user2_id: userSendId }
                ]
            }
        });

        if (existFriend) {
            throw new Error('Bạn đã là bạn bè, không thể gửi lời mời kết bạn');
        }

        // xem đã gửi lời mời trước đó chưa
        const existRequest = await requestFriend.findOne({
            where: {
                [Op.or]: [
                    { user_send_id: userSendId, user_receive_id: userReceiveId },
                    { user_send_id: userReceiveId, user_receive_id: userSendId }
                ]
            }
        });

        if (existRequest) {
            throw new Error('Lời mời kết bạn đã tồn tại');
        };


        //Tạo lời mời kết bạn
        const newRequest = await requestFriend.create({
            user_send_id: userSendId,
            user_receive_id: userReceiveId,
        })
        return newRequest;
    },
    handleRequestFriend: async param => {
        const { requestId, status } = param;

        // lấy ra bản ghi yêu cầu kết bạn
        const request = await requestFriend.findOne({
            where: {
                id: requestId,
            }
        });

        if (!request) {
            throw new Error("Lời mời kết bạn không tồn tại");
        }

        if (status === 'accept') {
            const { user_send_id, user_receive_id } = request;
            // lưu theo cặp
            const friendPair = [
                { user1_id: user_send_id, user2_id: user_receive_id },
                { user1_id: user_receive_id, user2_id: user_send_id }
            ]
            for (let pair of friendPair) {
                const existingFriendship = await friend.findOne({
                    where: {
                        user1_id: pair.user1_id,
                        user2_id: pair.user2_id
                    }
                });

                if (existingFriendship) {
                    console.log(` ${pair.user1_id} và ${pair.user2_id} đã là bạn bè`);
                } else {
                    // Thêm cặp bạn bè vào bảng friend
                    await friend.create(pair);
                    console.log("Service - Friend relationship created:", pair);
                }
            }
        } else if (status === 'reject') {
            // Từ chối kết bạn: Xóa lời mời kết bạn trong bảng `requestFriend`
            await requestFriend.destroy({
                where: { id: requestId }
            });
            console.log("Service - Friend Request rejected and removed.");
        } else {
            throw new Error("Hành động không hợp lệ.");
        }

        // xóa lời mời kết bạn khỏi bảng requestFriend
        await requestFriend.destroy({
            where: { id: requestId }
        })
        return { requestId, status };
    },
    deleteFriend: async param => {
        const { userId, friendId } = param;
        // kiểm tra xem có phải bạn bè hay không
        const existFriend = await friend.findOne({
            where: {
                [Op.or]: [
                    { user1_id: userId, user2_id: friendId },
                    { user1_id: friendId, user2_id: userId }
                ]
            }
        });

        if (!existFriend) {
            throw new Error('Không phải bạn bè');
        }

        // xóa bạn bè
        await friend.destroy({
            where: {
                [Op.or]: [
                    { user1_id: userId, user2_id: friendId },
                    { user1_id: friendId, user2_id: userId }
                ]
            }
        });
        return true;
    },
    // suggestFriend: async userId => {
    //     // lấy danh sách bạn bè của người dùng
    //     const friendList = await this.get_list.bind(this)(userId);

    //     console.log("friendList", friendList);
    // },

    // suggestFriend: async function (userId) {
    //     // lấy danh sách bạn bè của người đang đăng nhập
    //     const friendList = await this.get_list(userId);
    //     // console.log("friendListttttt", friendList);
    //     const listFriendId = friendList.map(friend => friend.id);
    //     console.log("listFriendId", listFriendId);

    //     //lấy danh sách bạn bè của bạn bè
    //     const friendOfFriend = await friend.findAll({
    //         where: {
    //             [Op.or]: [
    //                 { user1_id: { [Op.in]: listFriendId } },
    //                 { user2_id: { [Op.in]: listFriendId } }
    //             ]
    //         },
    //         include: [
    //             {
    //                 model: users,
    //                 as: 'user1',
    //                 attributes: ['id', 'fullname']
    //             },
    //             {
    //                 model: users,
    //                 as: 'user2',
    //                 attributes: ['id', 'fullname']
    //             }
    //         ],
    //         // raw: true
    //     });

    //     // console.log("friendOfFriend", JSON.stringify(friendOfFriend, null, 2));

    //     const suggestedFriendList = friendOfFriend.map(friend => {
    //         // console.log("friend", friend);
    //         // console.log("friend.user1.fullname", friend['user1.fullname']);
    //         // console.log("friend.user1.fullname", friend.user1.fullname);
    //         if (friend.user1_id !== userId && !listFriendId.includes(friend.user1_id)) {
    //             return {
    //                 id: friend.user1_id,
    //                 fullName: friend.user1.fullname
    //             };
    //         }
    //         if (friend.user2_id !== userId && !listFriendId.includes(friend.user2_id)) {
    //             return {
    //                 id: friend.user2_id,
    //                 fullName: friend.user2.fullname
    //             };
    //         }
    //         return null;
    //     }).filter(Boolean);
    //     console.log("suggestedFriendList", suggestedFriendList);
    //     const finalSuggestedFriendList = [];
    //     for (const friend of suggestedFriendList) {
    //         const existRequest = await requestFriend.findOne({
    //             where: {
    //                 [Op.or]: [
    //                     { user_send_id: userId, user_receive_id: friend.id },
    //                     { user_send_id: friend.id, user_receive_id: userId }
    //                 ]
    //             }
    //         });

    //         if (!existRequest) {
    //             finalSuggestedFriendList.push(friend);
    //         }
    //     }
    //     const uniqueFriendList = Array.from(
    //         new Map(finalSuggestedFriendList.map(friend => [friend.id, friend])).values()
    //     );
    //     console.log("uniqueFriendList", uniqueFriendList);
    //     return uniqueFriendList;
    // },
    // PHÂN TRANG, TÌM KIẾM THEO TÊN, TỐI ƯU THÊM
    suggestFriend: async (param) => {
        try {
            const { range, filter, userId } = param;

            const perPage = range[1] - range[0] + 1; // số lượng bản ghi mỗi trang
            const offset = range[0];

            //Điều kiện tìm kiếm
            const fullnameFilter = filter && filter.fullname ? `%${filter.fullname}%` : '';

            console.log("perPage", perPage);
            console.log("offset", offset);
            console.log("fullnameFilter", perPage);


            const totalQuery = `
                select count(distinct  f1.user2_id) as total
                from friend f1
                inner join friend f2 on f1.user1_id = f2.user2_id
                where f2.user1_id = :userId
                and f1.user2_id != :userId
                and f1.user2_id not in (
                    select f1.user2_id
                    from friend f1
                    where f1.user1_id = :userId
                )
            `;

            const query = `
                select u.fullname
                from users u
                where u.id in (
                    select f1.user2_id
                    from friend f1
                    inner join friend f2 on f1.user1_id = f2.user2_id
                    where f2.user1_id = :userId
                    and f1.user2_id != :userId
                    and f1.user2_id not in (
                        select f1.user2_id
                        from friend f1
                        where f1.user1_id = :userId
                    )
                )
              ${filter.fullname ? `AND u.fullname LIKE :fullname` : ''}
                LIMIT :limit OFFSET :offset
            `;

            // tổng bản ghi
            const [total] = await sequelize.query(totalQuery, {
                replacements: {
                    userId,
                    fullname: fullnameFilter,
                },
                logging: true
            });

            console.log("totalll", total);

            // Thực thi câu truy vấn với Sequelize
            const [suggestedFriends] = await sequelize.query(query, {
                replacements: {
                    userId,
                    fullname: fullnameFilter,
                    limit: perPage,
                    offset
                },
                logging: true
            });

            return {
                rows: suggestedFriends, // Danh sách gợi ý bạn bè
                page: Math.floor(range[0] / perPage) + 1, // Trang hiện tại
                perPage, // Số lượng mỗi trang
                total// Tổng số kết quả // sai
            };
        } catch (error) {
            console.error('Error in getSuggestedFriends:', error);
            throw new Error('Failed to fetch suggested friends');
        }
    },


};
