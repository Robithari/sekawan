const express = require('express');
const router = express.Router();
const path = require('path');

// Route untuk halaman KAS
router.get('/kas', (req, res) => {
  res.render('kas'); // Merender views/kas.ejs
});

// Route untuk halaman lain (tambahkan sesuai kebutuhan)
router.get('/about', (req, res) => {
  res.render('about'); // Merender views/about.ejs
});

// Route untuk halaman home
router.get('/', (req, res) => {
  res.render('index'); // Merender views/index.ejs
});

// Route untuk halaman cms
router.get('/cms', (req, res) => {
  res.render('cms'); // 
});

// Route untuk halaman cms
router.get('/login-cms', (req, res) => {
  res.render('login-cms');
});

// Route untuk halaman jadwal pertandingan
router.get('/jadwal', (req, res) => {
  res.render('jadwal'); 
});

// Route untuk halaman dokumentasi
router.get('/dokumentasi', (req, res) => {
  res.render('dokumentasi'); 
});

// Route untuk halaman inventaris
router.get('/inventaris', (req, res) => {
  res.render('inventaris'); 
});

// Route untuk halaman profil
router.get('/profil', (req, res) => {
  res.render('profil'); 
});

// Route untuk halaman berita
router.get('/rangkuman-berita', (req, res) => {
  res.render('rangkuman-berita'); 
});

// Route untuk halaman artikel
router.get('/rangkuman-artikel', (req, res) => {
  res.render('rangkuman-artikel'); 
});

// Export router
module.exports = router;