import { Router } from 'express';
// import menuRoutes from './web/routes/menuRoutes';
import usersRoutes from './web/routes/usersRoutes';
// import provincesRoutes from './web/routes/provincesRoutes';
// import districtsRoutes from './web/routes/districtsRoutes';

//

/**
/**
 * Contains all API routes for the application.
 */
const router = Router();

// router.use('/c/menus', menuRoutes);
router.use('/c/users', usersRoutes);
//
// router.use('/c/provinces', provincesRoutes);
// router.use('/c/districts', districtsRoutes);

//

//

export default router;
