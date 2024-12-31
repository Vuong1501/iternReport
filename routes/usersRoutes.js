import { Router } from 'express';

import usersController from '../controllers/usersController';
import usersValidate from '../validates/usersValidate';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

// router.get('/', usersValidate.authenFilter, usersController.get_list);
// router.get("/export", usersValidate.authenFilter, usersController.get_list_export)
router.get('/:id', usersController.get_one); // xong
router.get('/', usersValidate.authenFilter, usersController.get_list); // xong
router.post('/register', usersValidate.authenCreate, usersController.register); // xong
// router.put('/:id', usersValidate.authenUpdate, usersController.update);
// router.put('/changePass/:id', usersController.changePass);
// router.put('/resetPass/:id', usersController.resetPass);
// router.post('/requestForgetPass', usersValidate.authenRequestForgetPass, usersController.requestForgetPass);
// router.post('/changePassByOpt', usersController.changePassByOtp);
// router.post('/accessOtp', usersController.accessOtp);

export default router;
