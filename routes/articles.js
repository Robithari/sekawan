import express from 'express';
import db from '../config/firebase.js';
import articleController from '../controllers/articleController.js';

const router = express.Router();

// Rute API
router.post("/", articleController.addArticle);
router.get("/", articleController.getAllArticles);
router.get("/:slug", articleController.getArticleBySlug); // Menggunakan route ini
router.put("/:id", articleController.updateArticle);
router.delete("/:id", articleController.deleteArticle);

// Rute untuk tampilan artikel berdasarkan slug
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

export default router;
