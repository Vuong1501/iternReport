import { Router } from 'express';


import postController from '../controllers/postController';
import postValidate from '../validates//postValidate';


const router = Router();

router.post('/', postValidate.authenCreate, postController.create);

router.get('/getAllPost', postController.allPost);

router.get('/', postValidate.authenFilter, postController.get_list);

router.get('/:id', postController.getPublicAndFriendPost);

router.put('/:id', postValidate.authenUpdate, postController.update);

router.delete('/:id', postController.delete);



export default router;