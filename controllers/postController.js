import postService from '../services/postService';
import loggerHelpers from '../helpers/loggerHelpers';
import { recordStartTime } from '../utils/loggerFormat';

import * as ApiErrors from '../errors';

export default {
    get_list: (req, res, next) => {
        recordStartTime.call(req);

        // console.log('req.auth2', req.auth)
        // const param = Number(req.auth.userId);


        try {
            const userId = req.auth.userId;
            // const param = { userId };
            const { sort, range, filter, attributes } = res.locals;
            const param = {
                sort,
                range,
                filter,
                userId,
                attributes
            };

            postService
                .get_list(param)
                .then(posts => {
                    if (posts && posts.length > 0) {
                        const dataOutput = {
                            result: posts, // Trả về danh sách bài viết
                            success: true,
                            errors: [],
                            messages: []
                        };

                        res.status(200).json(dataOutput); // Trả về kết quả thành công
                        recordStartTime.call(res);

                        // Log lại thông tin lấy danh sách bài viết
                        loggerHelpers.logGet(req, res, {
                            dataReqBody: req.body,
                            dataReqQuery: req.query,
                            dataRes: dataOutput
                        });
                    } else {
                        res.status(404).json({
                            success: false,
                            message: 'Không có bài viết nào của người dùng này.'
                        });
                    }
                })
                .catch(error => {
                    error.dataParams = req.params;
                    // next(error); // Chuyển lỗi qua middleware xử lý lỗi
                });
        } catch (error) {
            // error.dataQuery = req.query;
            next(error);
        }
    },
    create: (req, res, next) => {
        recordStartTime.call(req);
        try {
            console.log('Request-Body:', req.body);
            const { content, visibility } = req.body;
            const userId = req.auth.userId;

            const param = { userId, content, visibility };

            postService
                .create(param)
                .then(newPost => {
                    if (newPost) {
                        const dataOutput = {
                            result: newPost,
                            success: true,
                            errors: [],
                            messages: ['Bài viết đã được tạo thành công.']
                        };

                        res.status(201).json(dataOutput);
                        recordStartTime.call(res);

                        loggerHelpers.logCreate(req, res, {
                            dataReqBody: req.body,
                            dataReqQuery: req.query,
                            dataRes: dataOutput
                        });
                    } else {
                        throw new ApiErrors.BaseError({
                            statusCode: 202,
                            type: 'crudNotExisted',
                            message: 'Không thể tạo bài viết. Vui lòng thử lại sau.'
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

            const postId = req.params.id;
            const { content, visibility } = req.body;
            const userId = req.auth.userId;

            if (!content && !visibility) {
                return res.status(400).json({
                    success: false,
                    message: 'Không có dữ liệu nào để cập nhật.'
                });
            }

            const param = { postId, userId, content, visibility };

            postService
                .update(param)
                .then(updatedPost => {
                    if (updatedPost) {
                        const dataOutput = {
                            result: updatedPost,
                            success: true,
                            errors: [],
                            messages: ['Bài viết đã được cập nhật thành công.']
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
                            statusCode: 404,
                            type: 'crudNotExisted',
                            message: 'Bài viết không tồn tại hoặc bạn không có quyền cập nhật.'
                        });
                    }
                })
                .catch(error => {
                    console.log("errrr", error);
                    next(error);
                });
        } catch (error) {


            next(error);
        }
    },
    delete: (req, res, next) => {
        recordStartTime.call(req);
        try {
            const postId = req.params.id;
            const userId = req.auth.userId;
            // console.log("postId", postId);
            // console.log("userId", userId);
            // console.log("id", id);

            const param = { userId, postId };

            postService
                .delete(param)
                .then(data => {
                    if (data && data.status === 1) {
                        const dataOutput = {
                            result: null,
                            success: true,
                            errors: [],
                            messages: []
                        };

                        res.status(200).json(dataOutput);

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
    getPublicAndFriendPost: (req, res, next) => {
        try {
            const userId = req.auth.userId;
            const differentUserId = req.params.id;
            const param = { userId, differentUserId };

            postService
                .getPublicAndFriendPosts(param)
                .then(posts => {
                    if (posts && posts.length > 0) {
                        const dataOutput = {
                            result: posts,
                            success: true,
                            errors: [],
                            messages: []
                        };

                        res.status(200).json(dataOutput);
                        recordStartTime.call(res);

                        // Log lại thông tin lấy bài viết
                        loggerHelpers.logGet(req, res, {
                            dataReqBody: req.body,
                            dataReqQuery: req.query,
                            dataRes: dataOutput
                        });
                    } else {
                        // Nếu không có bài viết nào
                        res.status(404).json({
                            success: false,
                            message: 'Không có bài viết nào của người dùng này.'
                        });
                    }
                })
                .catch(error => {
                    error.dataParams = req.params;
                    // next(error);
                });

        } catch (error) {
            next(error);
        }
    },
    allPost: (req, res, next) => {
        try {
            const { range } = req.query;
            const userId = req.auth.userId;
            const param = {
                range: range ? JSON.parse(range) : [0, 9],
                userId
            }
            postService
                .allPost(param)
                .then(data => {
                    const dataOutput = {
                        result: {
                            list: data.rows, // Danh sách bạn bè gợi ý
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
                    res.header(
                        'Content-Range',
                        `suggestFriend ${param.range[0]}-${param.range[1]}/${data.total}`
                    );
                    res.send(dataOutput);

                    // Ghi log
                    recordStartTime.call(res);
                    loggerHelpers.logVIEWED(req, res, {
                        dataReqBody: req.body,
                        dataReqQuery: req.query,
                        dataRes: dataOutput
                    });
                })
                .catch(error => {
                    // Xử lý lỗi từ service
                    error.dataQuery = req.query;
                    next(error);
                });
        } catch (error) {
            next(error);
        }
    }


};
