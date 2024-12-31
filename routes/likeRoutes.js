import { Router } from 'express';


// import friendValidate from '../validates/provincesValidate';
import likeController from '../controllers/likeController';
// import friendValidate from '../validates/friendValidate';


const router = Router();

router.post('/:id', likeController.like);





export default router;