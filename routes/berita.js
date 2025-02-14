import express from 'express';
import { addBerita, getAllBerita, getBeritaBySlug, updateBerita, deleteBerita } from '../controllers/beritaController.js';
import db from '../config/firebase.js';

const router = express.Router();

// Rute API
router.post("/", addBerita);
router.get("/", getAllBerita);
router.get("/:slug", getBeritaBySlug);
router.put("/:id", updateBerita);
router.delete("/:id", deleteBerita);

// Rute untuk tampilan berita berdasarkan slug
router.get("/view/:slug", async (req, res) => {
  try {
    const q = db.collection("berita").where("slug", "==", req.params.slug);
    const snapshot = await q.get();

    if (snapshot.empty) {
      return res.status(404).render("error", { error: { message: "Berita tidak ditemukan!" } });
    }

    const berita = snapshot.docs[0].data();
    res.render("berita", { berita });
  } catch (error) {
    res.status(500).render("error", { error });
  }
});

export default router;
