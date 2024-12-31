import commentService from '../services/commentService';
import loggerHelpers from '../helpers/loggerHelpers';
import { recordStartTime } from '../utils/loggerFormat';

import * as ApiErrors from '../errors';

export default {
    comment: (req, res, next) => {
        try {
            const userId = req.auth.userId;
            const postId = req.params.id;
            const { content } = req.body;

            // console.log("userId", userId);
            // console.log("postId", postId);
            // console.log("content", content);
            if (!content || content.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Nội dung bình luận không được để trống.'
                });
            };
            const param = { userId, postId, content };
            commentService
                .comment(param)
                .then(result => {
                    if (result && result.success) {
                        const dataOutput = {
                            result: result.data,
                            success: true,
                            errors: [],
                            messages: [result.message]
                        };

                        res.status(200).json(dataOutput);

                        recordStartTime.call(res);

                        loggerHelpers.logCreate(req, res, {
                            dataReqBody: req.body,
                            dataReqQuery: req.query,
                            dataRes: dataOutput
                        });
                    } else {
                        throw new ApiErrors.BaseError({
                            statusCode: 400,
                            type: 'commentError',
                            message: result.message
                        });
                    }
                })
                .catch(error => {
                    error.dataParams = req.params;
                    next(error);
                });


        } catch (error) {
            next(error);
        }
    },
    getListComment: (req, res, next) => {
        try {
            const { range, sort, filter, attributes } = req.query;
            const postId = req.params.id;
            const userId = req.auth.userId;

            console.log("rangee", range);
            console.log("Sort:", sort);
            console.log("Filter:", filter);
            console.log("Attributes:", attributes);

            let filterParsed = {};
            if (filter) {
                filterParsed = JSON.parse(filter);  // Giải mã filter nếu có
            }

            const param = {
                postId,
                userId,
                range: range ? JSON.parse(range) : [0, 9],
                filter: filterParsed,
                sort,
                attributes
            };


            commentService
                .getListComment(param)
                .then(data => {
                    const dataOutput = {
                        result: {
                            list: data.rows,
                            pagination: {
                                current: data.page, // Trang hiện tại
                                pageSize: data.perPage, // Số bản ghi mỗi trang
                                total: data.total[0].total // Tổng số bản ghi
                            }
                        },
                        success: true,
                        errors: [],
                        messages: []
                    };

                    // Trả về header và dữ liệu
                    res.send(dataOutput);

                    // Ghi log
                    recordStartTime.call(res);
                    loggerHelpers.logVIEWED(req, res, {
                        dataReqBody: req.body,
                        dataReqQuery: req.query,
                        dataRes: dataOutput
                    });
                })
        } catch (error) {
            next(error);
        }
    }
};
