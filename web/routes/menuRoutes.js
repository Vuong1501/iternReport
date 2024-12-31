import { Router } from 'express';

import menusController from '../../controllers/menusController';
import menusValidate from '../../validates/menusValidate';

const router = Router();

router.get('/', menusValidate.authenFilter, menusController.get_list);
router.get('/:id', menusController.get_one);
router.get('/find/list/parent-child', menusValidate.authenFilter, menusController.find_list_parentChild);

export default router;
