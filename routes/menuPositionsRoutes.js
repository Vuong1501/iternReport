import { Router } from 'express';

import menuPositionsValidate from '../validates/menuPositionsValidate';
import menuPositionsController from '../controllers/menuPositionsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', menuPositionsValidate.authenFilter, menuPositionsController.get_list);
router.get('/:id', menuPositionsController.get_one);
router.post('/', menuPositionsValidate.authenCreate, menuPositionsController.create);
router.put('/:id', menuPositionsValidate.authenUpdate, menuPositionsController.update);
router.put('/update-status/:id', menuPositionsValidate.authenUpdate_status, menuPositionsController.update_status);
export default router;
