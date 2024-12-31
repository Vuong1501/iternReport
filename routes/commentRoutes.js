import { Router } from 'express';


// import friendValidate from '../validates/provincesValidate';
import commentController from '../controllers/commentController';
import commentValidate from '../validates/commentValidate';


const router = Router();

router.post('/:id', commentValidate.authenCreateCmt, commentController.comment);

router.get('/:id', commentValidate.authenFilter, commentController.getListComment);





export default router;