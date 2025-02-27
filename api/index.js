const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const { db } = require("../config/firebase"); // Sesuaikan path ke Firebase config

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "../public"))); // Akses folder public dengan benar
app.set("view engine", "ejs");

// Import Routes
const indexRoutes = require("../routes/index");
const apiRoutes = require("../routes/api");
const articleRoutes = require("../routes/articles");
const beritaRoutes = require("../routes/berita");

// Gunakan Routes
app.use("/", indexRoutes);
app.use("/api", apiRoutes);
app.use("/articles", articleRoutes);
app.use("/berita", beritaRoutes);

// Contoh koneksi ke Firestore
const getUsersFromFirestore = async () => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map((doc) => doc.data());
    console.log("Users: ", users);
  } catch (error) {
    console.error("Error getting users:", error);
  }
};

getUsersFromFirestore(); // Jalankan sekali saat API dipanggil

// ❌ Hapus app.listen(), karena tidak didukung di Vercel

// ✅ Ekspor handler untuk Vercel
module.exports = app;
