import { Router } from 'express';


// import friendValidate from '../validates/provincesValidate';
import messageController from '../controllers/messageController';
import messageValidate from '../validates/messageValidate';


const router = Router();

// router.post('/:id', commentController.comment);
// router.get('/:id', commentController.getListComment);
router.post('/sendMessage', messageValidate.authenSendMessage, messageController.sendMessage);

router.put('/seenMessage/:id', messageController.seenMessage);

router.get('/getListMessage', messageController.getListMessage);





export default router;