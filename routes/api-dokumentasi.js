const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const db = require('../config/firebase');
const axios = require('axios');
const authMiddleware = require('../middleware/auth');


const dokumentasiController = require('../controllers/dokumentasiController');

// GET semua dokumentasi
router.get('/', dokumentasiController.getAllDokumentasi);

// POST tambah dokumentasi
router.post('/', upload.single('foto'), dokumentasiController.addDokumentasi);

// PUT update dokumentasi
router.put('/:id', upload.single('foto'), dokumentasiController.updateDokumentasi);

// DELETE dokumentasi
router.delete('/:id', dokumentasiController.deleteDokumentasi);

module.exports = router;
