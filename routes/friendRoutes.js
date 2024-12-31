import { Router } from 'express';


// import friendValidate from '../validates/provincesValidate';
import friendController from '../controllers/friendController';
import friendValidate from '../validates/friendValidate';


const router = Router();


router.get('/getList', friendValidate.authenFilter, friendController.get_list);

router.post('/sendRequest', friendValidate.authenRequest, friendController.sendRequest);

router.post('/handleRequestFriend/:id', friendValidate.authenHandleRequest, friendController.handleRequestFriend);

router.delete('/deleteFriend/:id', friendController.deleteFriend);

router.get('/suggestFriend', friendController.suggestFriend);

export default router;