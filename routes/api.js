const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const postController = require('../controllers/postController');

router.get('/users', userController.getUsers);
router.get('/posts', postController.getPosts);

module.exports = router;