import messageService from '../services/messageService';
import loggerHelpers from '../helpers/loggerHelpers';
import { recordStartTime } from '../utils/loggerFormat';

import * as ApiErrors from '../errors';

export default {
    sendMessage: (req, res, next) => {

        try {
            const { userRecieveId, message } = req.body;
            const userId = req.auth.userId;

            // console.log("userId", userId);
            // console.log("userRecieveId", userRecieveId);
            // console.log("message", message);
            if (!userRecieveId || !message) {
                throw new ApiErrors.BaseError({
                    statusCode: 400,
                    message: 'Dữ liệu không hợp lệ.'
                });
            }

            const param = { userId, userRecieveId, message };

            messageService
                .sendMessage(param)
                .then(data => {
                    const dataOutput = {
                        result: data,
                        success: true,
                        errors: [],
                        messages: ['Tin nhắn đã được gửi thành công.']
                    };

                    res.send(dataOutput);
                })
                .catch(error => {
                    error.dataQuery = req.query;
                    next(error);
                });
        } catch (error) {
            next(error);
        }
    },
    seenMessage: (req, res, next) => {
        try {
            const messageId = Number(req.params.id);
            const userSendId = req.auth.userId;


            // console.log("messageId", messageId);
            // console.log("userRecieveId", userRecieveId);

            const param = { userSendId, messageId };
            // console.log("param", param);

            messageService
                .seenMessage(param)
                .then((response) => {
                    res.status(200).json({
                        success: response.success,
                        message: response.message,
                    });
                })
                .catch((error) => {
                    console.log("errrrrrrrrrrr", error);
                    next(error);
                });
        } catch (error) {
            next(error);
        }
    },
    getListMessage: (req, res, next) => {

        try {
            const { user1Id, range } = req.query;
            const userId = req.auth.userId;

            console.log("userId", userId);
            console.log("user1Id", user1Id);
            console.log("range", range);

            const param = {
                userId,
                user1Id,
                range: range ? JSON.parse(range) : [0, 9]
            };

            messageService
                .getListMessage(param)
                .then(data => {
                    const dataOutput = {
                        result: {
                            list: data.rows,
                            pagination: {
                                current: data.page,
                                pageSize: data.perPage,
                                total: data.total
                            }
                        },
                        success: true,
                        errors: [],
                        messages: []
                    };

                    res.header('Content-Range', `messages ${range}/${data.total}`);
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
            next(error);
        }
    }
};
