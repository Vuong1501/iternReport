import { Router } from 'express';

import provincesValidate from '../validates/provincesValidate';
import provincesController from '../controllers/provincesController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', provincesValidate.authenFilter, provincesController.get_list);
router.get('/:id', provincesController.get_one);
router.post('/', provincesValidate.authenCreate, provincesController.create);
router.put('/:id', provincesValidate.authenUpdate, provincesController.update);
router.put('/update-status/:id', provincesValidate.authenUpdate_status, provincesController.update_status);

export default router;
