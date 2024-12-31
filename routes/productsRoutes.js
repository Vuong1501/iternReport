import { Router } from 'express';

import productsValidate from '../validates/productsValidate';
import productsController from '../controllers/productController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', productsValidate.authenFilter, productsController.get_list);
router.get('/topProduct', productsController.topProduct);
router.get('/getRevenueByProduct', productsController.getRevenueByProduct);
router.get('/:id', productsController.get_one);
router.delete('/:id', productsController.delete);
router.post('/', productsValidate.authenCreate, productsController.create);
router.put('/:id', productsValidate.authenUpdate, productsController.update);
router.put('/update-status/:id', productsValidate.authenUpdate_status, productsController.update_status);

export default router;
