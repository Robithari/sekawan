const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const mongoose = require("mongoose");

dotenv.config(); // Memuat variabel dari file .env

const app = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public"))); // Menyajikan file statis
app.set("view engine", "ejs"); // Untuk render halaman dengan EJS

// Koneksi ke MongoDB menggunakan DB_URI dari .env
const DB_URI = process.env.DB_URI; // Pastikan DB_URI ada di file .env

// Menghubungkan ke MongoDB Atlas
mongoose.connect(DB_URI)
  .then(() => {
    console.log("🚀 Successfully connected to MongoDB Atlas");
  })
  .catch((err) => {
    console.error("❌ Error connecting to MongoDB Atlas:", err.message);
  });

// Import Routes
const indexRoutes = require("./routes/index");
const apiRoutes = require("./routes/api");
const articleRoutes = require("./routes/articles");
const beritaRoutes = require("./routes/berita");

// Gunakan Routes
app.use("/", indexRoutes);
app.use("/api", apiRoutes);
app.use("/articles", articleRoutes);
app.use("/berita", beritaRoutes);

// Tangani 404 (Not Found)
app.use((req, res) => {
  res.status(404).render("404", { title: "404 Not Found" });
});

// Jalankan Server
const PORT = process.env.PORT || 3000; // Menggunakan PORT dari environment atau 3000
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));