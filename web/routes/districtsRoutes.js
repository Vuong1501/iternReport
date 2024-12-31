import { Router } from 'express';

import districtsValidate from '../../validates/districtsValidate';
import districtsController from '../../controllers/districtsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', districtsValidate.authenFilter, districtsController.get_list);
router.get('/:id', districtsController.get_one);

export default router;
