// import moment from 'moment'
import MODELS from '../models/models';
import models from '../entity/index';
import _, { includes, replace } from 'lodash';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
import { Op, where } from 'sequelize';
// import { io } from '../socketServer';

const { users, friend, sequelize } = models;

export default {
    sendMessage: async param => {

        const { userId, userRecieveId, message } = param;
        // console.log("userId", userId);
        const sequelize = models.sequelize;

        return await sequelize.transaction(async (t) => {
            // kiểm tra xem người nhận có tồn tại không
            const userRecieve = await users.findOne({
                where: { id: userRecieveId },
                transaction: t
            });

            if (!userRecieve) {
                throw new ApiErrors.BaseError({
                    statusCode: 404,
                    type: 'userNotFound',
                    message: 'Người nhận không tồn tại.'
                });
            };

            // kiểm tra bạn bè
            const isFriend = await MODELS.findOne(friend, {
                where: {
                    [Op.or]: [
                        { user1_id: userId, user2_id: userRecieveId },
                        // { user1_id: userRecieveId, user2_id: userId }
                    ]
                },
                transaction: t
            });

            if (!isFriend) {
                throw new ApiErrors.BaseError({
                    statusCode: 400,
                    message: 'Bạn chỉ có thể nhắn tin cho người bạn bè.'
                });
            };

            const newMessage = await models.message.create({
                user_send_id: userId,
                user_receive_id: userRecieveId,
                content: message,
                created_at: new Date()
            }, {
                transaction: t
            });

            // cập nhật tin nhắn mới nhất vào bảng friend
            await friend.update(
                { last_message_at: new Date() },
                {
                    where: {
                        [Op.or]: [
                            { user1_id: userId, user2_id: userRecieveId },
                            { user1_id: userRecieveId, user2_id: userId }
                        ]
                    },
                    transaction: t
                }
            )
            return newMessage;
        })

    },
    seenMessage: async param => {
        const { userSendId, /*userRecieveId,*/ messageId } = param;
        // console.log("userSendId", userSendId);
        // console.log("messageId", messageId);
        // console.log("userRecieveId", userRecieveId);
        const sequelize = models.sequelize;
        // const recordMessage = await models.message.findOne({
        //     where: {
        //         id: messageId
        //     }
        // });
        // console.log("recordMessage.user_receive_id", recordMessage.user_receive_id);
        // console.log("recordMessage:", JSON.stringify(recordMessage, null, 2));

        // kiểm tra tin nhắn có thuộc về người nhận không
        const recordMessage = await models.message.findOne({
            where: {
                id: messageId,
                user_send_id: userSendId
            }
        });

        // console.log("recordMessage", recordMessage);
        // console.log("userRecieveId", recordMessage.user_receive_id);

        if (!recordMessage) {
            throw new ApiErrors.BaseError({
                statusCode: 404,
                message: 'Tin nhắn không tồn tại ',
            });
        };
        // console.log("recordMessage:", JSON.stringify(recordMessage, null, 2));

        if (recordMessage.is_read === true) {
            return { success: true, message: 'Tin nhắn đã được đọc trước đó.' };
        }

        const userRecieveId = recordMessage.user_receive_id;

        return sequelize.transaction((t) => {
            return models.message.update(
                {
                    is_read: 1,
                    read_at: new Date()
                },
                {
                    where: {
                        id: messageId,
                        user_receive_id: userRecieveId,
                        is_read: 0
                    },
                    transaction: t
                }
            )
                .then((updatedMessage) => {
                    if (updatedMessage[0] === 0) {
                        throw new ApiErrors.BaseError({
                            statusCode: 404,
                            message: 'Tin nhắn không tồn tại hoặc không phải của bạn.',
                        });
                    }

                    return { success: true, message: 'đã đọc.' };
                });
        })
    },
    getListMessage: async param => {
        const { userId, user1Id, range } = param;

        const perPage = range[1] - range[0] + 1;
        const offset = range[0];

        const query = `
            select m.id AS message_id, m.user_send_id, m.user_receive_id, m.content, m.created_at, m.is_read, m.read_at
            from message m
            where (m.user_send_id = :userId and m.user_receive_id = :user1Id)
                or (m.user_send_id = :user1Id and m.user_receive_id = :userId)
            order by m.created_at desc
            limit :limit offset :offset
        `;

        const total = `
            select count(m.id) as total
            from message m
            where (m.user_send_id = :userId and m.user_receive_id = :user1Id)
                or (m.user_send_id = :user1Id and m.user_receive_id = :userId)
            order by m.created_at desc
        `;

        const [totalMesage] = await sequelize.query(total, {
            replacements: {
                userId,
                user1Id
            }
        });

        const [listMessage] = await sequelize.query(query, {
            replacements: {
                userId,
                user1Id,
                limit: perPage,
                offset
            },
            logging: true
        });
        return {
            rows: listMessage,
            page: Math.floor(range[0] / perPage) + 1,
            perPage,
            totalMesage
        }
    }
};

// trước khi đọc thì phải xem tin nhắn đó đã được đọc chưa, nếu đọc rồi thì không cập nhật lại thời gian đã đọc ok
// nếu đọc tin nhắn mới nhất thì các tin nhắn cũ đều chuyển thành đã đọc
// cần lấy ra id của người đã nhận tin nhắn sau khi lấy ra được id của tin nhắn đó, sau đó mới so sánh để cập nhật cho đọc hay không


// muốn đọc được tin nhắn có id là ... thì người đăng nhập phải trùng với user_receive_id trong bảng message và trùng với id ...