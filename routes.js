import { Router } from 'express';

// NOTE: ADD BY TRINH MINH HIEU

import currentUserRoutes from './routes/currentUserRoutes';

import districtsRoutes from './routes/districtsRoutes';
import menusRoutes from './routes/menusRoutes';

import userGroupRolesRoutes from './routes/userGroupRolesRoutes';

import userGroupsRoutes from './routes/userGroupsRoutes';
import usersRoutes from './routes/usersRoutes';
import provincesRoutes from './routes/provincesRoutes';
import menuPositionsRoutes from './routes/menuPositionsRoutes';

import productsRoutes from './routes/productsRoutes';
import ordersRoutes from './routes/orderRoutes';
import friendRoutes from './routes/friendRoutes';
import postRoutes from './routes/postRoutes';
import likeRoutes from './routes/likeRoutes';
import commentRoutes from './routes/commentRoutes';
import messageRoutes from './routes/messageRoutes';

// TODO

const router = Router();

/**
 * GET /swagger.json
 */

/**
 * GET /api
 */
router.get('/', (req, res) => {
  res.json({
    app: req.app.locals.title,
    apiVersion: req.app.locals.version
  });
});

// MARK ADD BY TRINH MINH HIEU

router.use('/c/districts', districtsRoutes);

router.use('/c/menus', menusRoutes);

router.use('/c/provinces', provincesRoutes);

router.use('/c/userGroups', userGroupsRoutes);
router.use('/c/users', usersRoutes);
router.use('/c/userGroupRoles', userGroupRolesRoutes);
//  END
router.use('/c/currentUser', currentUserRoutes);
router.use('/c/menuPositions', menuPositionsRoutes);

router.use('/c/products', productsRoutes);
router.use('/c/orders', ordersRoutes);
router.use('/c/friend', friendRoutes);
router.use('/c/post', postRoutes);
router.use('/c/like', likeRoutes);
router.use('/c/comment', commentRoutes);
router.use('/c/message', messageRoutes);

export default router;

// api lấy ra bài viết công khai của tất cả các user, nếu kết bạn với những user đó rồi thì lấy ra thêm được cả những bài viết chế độ bạn bè
// lấy theo thứ tự mới nhất

// nhập vào 1 userid bất kì thì lấy ra được danh sách bài viết của userId đó


// lấy ra danh sách cmt của 1 bài viết, có phân trang
// làm chat như bình thường đã rồi với làm socket



// xem phần check token trong socket
// validate nốt phần get list
