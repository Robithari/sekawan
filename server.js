const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const mongoose = require("mongoose"); // Tambahkan untuk Mongoose
const db = require("./config/firebase"); // Pastikan file ini ada!

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public"))); // Hanya panggil sekali
app.set("view engine", "ejs"); // Untuk render halaman dengan EJS

// Koneksi ke MongoDB
const DB_URI = process.env.DB_URI;  // Pastikan DB_URI ada di file .env

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
const articleRoutes = require("./routes/articles"); // Pastikan file ini ada
const beritaRoutes = require("./routes/berita"); // Pastikan file ini ada

// Gunakan Routes
app.use("/", indexRoutes);
app.use("/api", apiRoutes);
app.use("/articles", articleRoutes); // Pastikan ini sudah ada
app.use("/berita", beritaRoutes); // Pastikan ini sudah ada

// Jalankan Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
