// === api/index.js ===
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const cache = require("memory-cache"); // Cache untuk mempercepat loading
const { db } = require("../config/firebase");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "../public")));
app.set("view engine", "ejs");

// Import Routes
const indexRoutes = require("../routes/index");
const apiRoutes = require("../routes/api");
const articleRoutes = require("../routes/articles");
const beritaRoutes = require("../routes/berita");

app.use("/", indexRoutes);
app.use("/api", apiRoutes);
app.use("/articles", articleRoutes);
app.use("/berita", beritaRoutes);

// Fungsi untuk mengambil data dengan cache
const getCachedData = async (key, fetchFunction, duration = 60000) => {
  let cachedData = cache.get(key);
  if (cachedData) return cachedData;
  let data = await fetchFunction();
  cache.put(key, data, duration);
  return data;
};

const getHomepageData = async () => {
  const [articles, news, carousel] = await Promise.all([
    db.collection("articles").limit(5).get(),
    db.collection("berita").limit(5).get(),
    db.collection("carousel").get()
  ]);

  return {
    articles: articles.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    news: news.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    carousel: carousel.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  };
};

app.get("/", async (req, res) => {
  try {
    const homepageData = await getCachedData("homepageData", getHomepageData);
    res.render("index", homepageData);
  } catch (error) {
    res.status(500).send("Error loading homepage");
  }
});

module.exports = app;
