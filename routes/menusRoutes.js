import { Router } from 'express';

import menusController from '../controllers/menusController';
import menusValidate from '../validates/menusValidate';

const router = Router();

router.get('/', menusValidate.authenFilter, menusController.get_list);
router.get('/:id', menusController.get_one);
router.post('/', menusValidate.authenCreate, menusController.create);
router.put('/update/list', menusValidate.authenBulkUpdate, menusController.bulkUpdate);
router.put('/:id', menusValidate.authenUpdate, menusController.update);
router.get('/find/list/parent-child', menusValidate.authenFilter, menusController.find_list_parentChild);
router.get('/find/list/parent-child-one', menusValidate.authenFilter, menusController.find_list_parent_child_one);
router.put('/update/orders', menusValidate.authenUpdateOrder, menusController.updateOrder);
router.put('/update-status/:id', menusValidate.authenUpdate_status, menusController.update_status);
export default router;
