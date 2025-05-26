const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const postController = require('../controllers/postController');
const loginUserController = require('../controllers/loginUserController');
const loginCmsController = require('../controllers/loginCmsController');

router.get('/users', userController.getUsers);
router.get('/posts', postController.getPosts);

// Route POST login user biasa untuk verifikasi token dan validasi user
router.post('/login', loginUserController.loginUser);

// Route POST signup user baru
router.post('/signup', loginUserController.signupUser);

// Route POST login CMS untuk verifikasi token dan validasi user CMS
router.post('/login-cms', loginCmsController.loginCms);

module.exports = router;
