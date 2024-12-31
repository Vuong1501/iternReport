// import moment from 'moment'
import MODELS from '../models/models';
import models from '../entity/index';
import _, { includes } from 'lodash';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
import { Op, where } from 'sequelize';

const { users, friend, sequelize, requestFriend, post, like } = models;

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
    like: async param => {
        const { postId, userId } = param;
        // console.log("postId", postId);
        // console.log("userId", userId);


        // kiểm tra mối quan hệ bạn bè, nếu là bạn bè thì lấy ra được cả bài viết chế độ bạn bè


        // lấy ra bài viết đó
        const postLike = await post.findOne({
            where: {
                id: postId,
                [Op.or]: [
                    { visibility: 'public' },
                    { visibility: 'friends' }
                ]
            }
        });
        // console.log("postLike:", JSON.stringify(postLike, null, 2));
        if (!postLike) {
            throw new ApiErrors.BaseError({
                statusCode: 404,
                type: 'crudNotFound',
                message: 'Bài viết không tồn tại.'
            });
        }

        // kiểm tra mối quan hệ bạn bè
        // console.log("người tạo bài:", postLike.user_id);

        const isFriend = await friend.findOne({
            where: {
                [Op.or]: [
                    { user1_id: userId, user2_id: postLike.user_id },
                    { user1_id: postLike.user_id, user2_id: userId }
                ]
            }
        });

        if (!isFriend && postLike.visibility === 'friends') {
            throw new ApiErrors.BaseError({
                statusCode: 400,
                message: 'không thể like bài viết vì không phải là bạn bè'
            });
        }
        // kiểm tra xem người dùng đã like bài viết chưa

        const existLike = await like.findOne({
            where: {
                post_id: postId,
                user_id: userId
            }
        });

        if (existLike) {
            throw new ApiErrors.BaseError({
                statusCode: 400,
                type: 'alreadyLiked',
                message: 'Bạn đã thích bài viết này rồi.'
            });
        };

        await like.create({
            post_id: postId,
            user_id: userId
        });

        // cập nhật lại số lượt like

        await postLike.update({
            where: { id: postId },
            count_like: postLike.count_like + 1
        });

        return {
            success: true,
            message: 'Like thành công'
        };
    }
};
