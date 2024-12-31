// import moment from 'moment'
import MODELS from '../models/models';
import models from '../entity/index';
import _, { includes } from 'lodash';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
import { Op, where } from 'sequelize';
import order from '../locales/vi-Vn/order';

const { users, friend, sequelize, requestFriend, post, like, comment } = models;

export default {
    comment: async param => {
        const { userId, postId, content } = param;

        // lấy ra bài viết
        const postComment = await post.findOne({
            where: {
                id: postId,
                [Op.or]: [
                    { visibility: 'public' },
                    { visibility: 'friends' }
                ]
            }
        });

        if (!postComment) {
            throw new ApiErrors.BaseError({
                statusCode: 404,
                type: 'crudNotFound',
                message: 'Bài viết không tồn tại.'
            });
        };

        // kiểm tra bạn bè

        const isFriend = await friend.findOne({
            where: {
                [Op.or]: [
                    { user1_id: userId, user2_id: postComment.user_id },
                    { user1_id: postComment.user_id, user2_id: userId }
                ]
            }
        });

        if (!isFriend && postComment.visibility === 'friends') {
            throw new ApiErrors.BaseError({
                statusCode: 400,
                message: 'không thể bình luận bài viết vì không phải là bạn bè'
            });
        };

        const newComment = await comment.create({
            post_id: postId,
            user_id: userId,
            content: content
        });

        // cập nhật tổng số bình luận
        await postComment.update({
            where: { id: postId },
            count_comment: postComment.count_comment + 1
        });
        return {
            success: true,
            data: newComment,
        }
    },
    getListComment: async param => {
        const { postId, userId, range } = param;

        const perPage = range[1] - range[0] + 1; // Số lượng bình luận mỗi trang
        const offset = range[0]; // Vị trí bắt đầu


        // lấy ra bài viết đó
        const getPost = await post.findOne({
            where: {
                id: postId,
                [Op.or]: [
                    { visibility: 'public' },
                    { visibility: 'friends' }
                ]
            }
        });
        //console.log("gettposttt", JSON.stringify(getPost, null, 2));

        if (!getPost) {
            throw new ApiErrors.BaseError({
                statusCode: 404,
                type: 'crudNotFound',
                message: 'Bài viết không tồn tại.'
            });
        };

        const isFriend = await friend.findOne({
            where: {
                [Op.or]: [
                    { user1_id: userId, user2_id: getPost.user_id },
                    { user1_id: getPost.user_id, user2_id: userId }
                ]
            }
        });

        if (!isFriend && getPost.visibility === 'friends') {
            throw new ApiErrors.BaseError({
                statusCode: 400,
                message: 'không thể vì không phải là bạn bè'
            });
        };

        const totalQuery = `
            SELECT COUNT(c.id) AS total
            FROM comments c
            WHERE c.post_id = :postId
        `;

        const query = `
        SELECT 
            c.id AS comment_id,
            c.post_id,
            c.user_id,
            c.content,
            c.created_at
        FROM comments c
        WHERE c.post_id = :postId
        ORDER BY c.created_at DESC
        LIMIT :limit OFFSET :offset
    `;

        const [total] = await sequelize.query(totalQuery, {
            replacements: { postId }
        });


        const [comments] = await sequelize.query(query, {
            replacements: {
                postId,
                limit: perPage,
                offset
            },
            logging: true
        });


        //console.log("listComment", JSON.stringify(listComment, null, 2));

        return {
            rows: comments,
            page: Math.floor(range[0] / perPage) + 1,
            perPage,
            total
        };
    },
};


