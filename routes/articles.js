const express = require("express");
const router = express.Router();
const db = require("../config/firebase");
const articleController = require("../controllers/articleController");
const { body } = require("express-validator");

// Rute API
router.post(
  "/",
  [
    body("judul").trim().notEmpty().withMessage("Judul wajib diisi").escape(),
    body("slug").trim().notEmpty().withMessage("Slug wajib diisi").escape(),
    body("konten").trim().notEmpty().withMessage("Konten wajib diisi"),
    body("tanggalPembuatan").isISO8601().withMessage("Tanggal tidak valid"),
    // Tambahkan validasi field lain sesuai kebutuhan
  ],
  articleController.addArticle
);
router.get("/", articleController.getAllArticles);
router.get("/:slug", articleController.getArticleBySlug); // Menggunakan route ini
router.put("/:id", articleController.updateArticle);
router.delete("/:id", articleController.deleteArticle);

/* Rute untuk tampilan artikel berdasarkan slug (Dihapus, karena sudah digabung ke route utama)
router.get("/view/:slug", async (req, res) => {
  try {
    const q = db.collection("articles").where("slug", "==", req.params.slug);
    const snapshot = await q.get();

    if (snapshot.empty) {
      return res.status(404).render("error", { error: { message: "Artikel tidak ditemukan!" } });
    }

    const article = snapshot.docs[0].data();
    res.render("article", { article });
  } catch (error) {
    res.status(500).render("error", { error });
  }
});
*/

module.exports = router;
