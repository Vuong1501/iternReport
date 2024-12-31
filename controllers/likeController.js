import likeService from '../services/likeService';
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
    like: (req, res, next) => {
        try {
            const postId = req.params.id;// id bài viết
            const userId = req.auth.userId;// id người like


            // console.log("postIdpostId", postId);
            // console.log("userIduserId", userId);

            const param = { postId, userId };

            // console.log("param", param);

            likeService
                .like(param)
                .then(result => {
                    if (result && result.success) {
                        const dataOutput = {
                            result: null,
                            success: true,
                            errors: [],
                            messages: [result.message]
                        };

                        res.status(200).json(dataOutput);
                        recordStartTime.call(res);
                        loggerHelpers.logUpdate(req, res, {
                            dataReqBody: req.body,
                            dataReqQuery: req.query,
                            dataRes: dataOutput
                        });
                    } else {
                        throw new ApiErrors.BaseError({
                            statusCode: 202,
                            type: 'likeError',
                            message: 'Không thể like bài viết.'
                        });
                    }
                })
                .catch(error => {
                    console.log("errrrrrrrrrrr", error);
                    error.dataParams = req.params; // Ghi nhận thông tin lỗi liên quan đến params
                    next(error);
                });
        } catch (error) {
            next(error);
        }
    }
};
