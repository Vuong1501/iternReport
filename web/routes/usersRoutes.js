import { Router } from 'express';

import userController from '../../controllers/usersController';
import usersValidate from '../../validates/usersValidate';
const router = Router();

router.post('/register', usersValidate.authenCreate, userController.register);
router.post('/registerByOtp', userController.registerByOtp);

router.post('/requestForgetPass', usersValidate.authenRequestForgetPass, userController.requestForgetPass);

export default router;
