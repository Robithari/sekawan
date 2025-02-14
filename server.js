import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Mendapatkan __dirname untuk path yang benar
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set direktori views untuk EJS
app.set('views', path.join(__dirname, 'views')); // Set folder views di Express

// Menyajikan file statis dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine ke EJS
app.set('view engine', 'ejs');

// Jika Anda masih menggunakan database eksternal seperti Firebase, bisa menghapus kode koneksi MongoDB dan tetap menggunakan Firebase
// const DB_URI = process.env.DB_URI;
// mongoose.connect(DB_URI)
//   .then(() => console.log("🚀 Successfully connected to MongoDB Atlas"))
//   .catch((err) => console.error("❌ Error connecting to MongoDB Atlas:", err.message));

// Import Routes (tanpa dependensi MongoDB, pastikan rute tidak mengandalkan MongoDB)
import indexRoutes from './routes/index.js';
import apiRoutes from './routes/api.js';
import articleRoutes from './routes/articles.js';
import beritaRoutes from './routes/berita.js';

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

// Ekspor aplikasi untuk Vercel
export default app;
