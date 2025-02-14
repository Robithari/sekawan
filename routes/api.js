import express from 'express';
import userController from '../controllers/userController.js';
import postController from '../controllers/postController.js';

const router = express.Router();

router.get('/users', userController.getUsers);
router.get('/posts', postController.getPosts);

export default router;
