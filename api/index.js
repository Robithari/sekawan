const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose'); // Jika menggunakan MongoDB
const db = require('../config/firebase'); // Pastikan file ini ada dan sesuai

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public'))); // Menyajikan file statis dari folder public
app.set('view engine', 'ejs'); // Menggunakan EJS untuk view

// Koneksi ke MongoDB
const DB_URI = process.env.DB_URI; // Pastikan DB_URI ada di file .env
mongoose.connect(DB_URI)
  .then(() => {
    console.log('🚀 Successfully connected to MongoDB');
  })
  .catch((err) => {
    console.error('❌ Error connecting to MongoDB:', err.message);
  });

// Import Routes
const indexRoutes = require('../routes/index');
const apiRoutes = require('../routes/api');
const articleRoutes = require('../routes/articles');
const beritaRoutes = require('../routes/berita');

// Gunakan Routes
app.use('/', indexRoutes);
app.use('/api', apiRoutes);
app.use('/articles', articleRoutes);
app.use('/berita', beritaRoutes);

// Express serverless function handler untuk Vercel
module.exports = (req, res) => {
  return app(req, res); // Menjalankan Express sebagai serverless function
};
