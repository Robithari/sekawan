import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import db from './config/firebase.js'; // Pastikan file ini ada dan dengan ekstensi .js

// Load environment variables
dotenv.config();

// Inisialisasi aplikasi Express
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000", // Sesuaikan dengan URL frontend
  credentials: true
}));
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parsing JSON
app.use(express.urlencoded({ extended: false })); // Parsing URL-encoded data

// Mendapatkan direktori saat ini
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Menyajikan file statis dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs'); // Mengatur view engine ke EJS

// Koneksi ke MongoDB
const DB_URI = process.env.DB_URI; // Pastikan DB_URI ada di file .env

mongoose.connect(DB_URI)
  .then(() => {
    console.log("🚀 Successfully connected to MongoDB Atlas");
  })
  .catch((err) => {
    console.error("❌ Error connecting to MongoDB Atlas:", err.message);
  });

// Import Routes
import indexRoutes from './routes/index.js';
import apiRoutes from './routes/api.js';
import articleRoutes from './routes/articles.js'; // Pastikan file ini ada dan dengan ekstensi .js
import beritaRoutes from './routes/berita.js'; // Pastikan file ini ada dan dengan ekstensi .js

// Gunakan Routes
app.use('/', indexRoutes);
app.use('/api', apiRoutes);
app.use('/articles', articleRoutes);
app.use('/berita', beritaRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Jalankan Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
