import { Router } from 'express';

import ordersValidate from '../validates/ordersValidate';
import ordersController from '../controllers/ordersController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();
router.get('/:id', ordersController.get_one)
router.get('/report', ordersController.report);
router.get('/compareMonth', ordersController.compareMonth);
router.get('/compareYear', ordersController.compareYear);
router.get('/', ordersValidate.authenFilter, ordersController.get_list);
router.post('/', ordersValidate.authenCreate, ordersController.create);
router.put('/updateStatusOrder/:id'/*, ordersValidate.authenUpdate_status */, ordersController.updateStatusOrder);
// router.put('/updateStatusOrder/:id', ordersValidate.authenUpdate_status, ordersController.updateStatusOrder);
router.put('/:id', ordersValidate.authenUpdate, ordersController.update);
// router.put('/update-status/:id'/*, provincesValidate.authenUpdate_status*/, ordersController.update_status); //// chưa làm

router.delete('/:id', ordersController.delete);
// báo cáo doanh thu



export default router;
