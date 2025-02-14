import express from 'express';

const router = express.Router();

// Route untuk halaman utama
router.get('/', (req, res) => {
  res.render('index', { 
    title: 'Home', 
    message: 'Welcome to My Express App!' 
  });
});

// Route untuk halaman about (contoh tambahan)
router.get('/about', (req, res) => {
  res.render('about', { 
    title: 'About', 
    message: 'This is the about page.' 
  });
});

// Route untuk halaman kontak (contoh tambahan)
router.get('/contact', (req, res) => {
  res.render('contact', { 
    title: 'Contact', 
    message: 'You can reach us at contact@example.com.' 
  });
});

export default router;
