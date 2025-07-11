const express = require('express');
const router = express.Router();
const cmsUserController = require('../controllers/cmsUserController');
const authMiddleware = require('../middleware/auth');


router.post('/cms/data-user/add', authMiddleware, cmsUserController.addUser);
router.post('/cms/data-user/edit', authMiddleware, cmsUserController.updateUser);
router.post('/cms/data-user/delete', authMiddleware, cmsUserController.deleteUser);
router.post('/cms/data-user/send-fcm', authMiddleware, cmsUserController.sendFcmMessage);
router.get('/cms/data-user', authMiddleware, cmsUserController.renderDataUserPage);

module.exports = router;
