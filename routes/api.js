const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const postController = require('../controllers/postController');
const loginUserController = require('../controllers/loginUserController');
const loginCmsController = require('../controllers/loginCmsController');
const kasController = require('../controllers/kasController');
const dataIuranController = require('../controllers/dataIuranController');
const { body, validationResult } = require('express-validator');

router.get('/users', userController.getUsers);
router.get('/posts', postController.getPosts);

// Route POST login user biasa untuk verifikasi token dan validasi user
router.post(
  '/login',
  [
    body('idToken').isString().notEmpty().withMessage('Token wajib diisi').trim().escape()
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  loginUserController.loginUser
);

// Route POST signup user baru
router.post(
  '/signup',
  [
    body('email').isEmail().withMessage('Email tidak valid').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
    body('name').trim().notEmpty().withMessage('Nama wajib diisi').escape(),
    body('phoneNumber').trim().notEmpty().withMessage('Nomor HP wajib diisi').escape(),
    body('membershipCode').trim().notEmpty().withMessage('Kode keanggotaan wajib diisi').escape()
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  loginUserController.signupUser
);

// Route POST login CMS untuk verifikasi token dan validasi user CMS
router.post(
  '/login-cms',
  [
    body('idToken').isString().notEmpty().withMessage('Token wajib diisi').trim().escape()
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  loginCmsController.loginCms
);

// Endpoint untuk menyimpan FCM token user
const fcmController = require('../controllers/fcm');
router.post('/save-fcm-token', fcmController.saveFcmToken);

// Kas API
router.get('/kas', kasController.getKas);
router.post(
  '/kas',
  [
    // body('kode').optional(), // kode akan di-generate otomatis di backend
    body('tanggal').isISO8601().withMessage('Tanggal tidak valid'),
    body('keterangan').trim().notEmpty().withMessage('Keterangan wajib diisi').escape(),
    body('jenis').isIn(['masuk', 'keluar']).withMessage('Jenis harus "masuk" atau "keluar"'),
    body('nominal').isNumeric().withMessage('Nominal harus angka').toInt()
  ],
  kasController.addKas
);
router.put('/kas/:id', kasController.updateKas);
router.delete('/kas/:id', kasController.deleteKas);

// Iuran API
router.get('/iuran', dataIuranController.getIuran);
router.post(
  '/iuran',
  [
    body('anggota').trim().notEmpty().withMessage('Nama anggota wajib diisi').escape(),
    body('jumlah').isNumeric().withMessage('Jumlah harus angka').toInt(),
    // Validasi field bulan (mei-desember) jika perlu
  ],
  dataIuranController.addIuran
);
router.put('/iuran/:id', dataIuranController.updateIuran);
router.delete('/iuran/:id', dataIuranController.deleteIuran);

module.exports = router;
