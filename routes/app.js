const express = require("express");
const router = express.Router();
const indexController = require("../controllers/indexController");

// Set up route untuk halaman utama dengan SSR
router.get("/", indexController.renderHomePage);

module.exports = router;
