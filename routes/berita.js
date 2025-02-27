const express = require("express");
const router = express.Router();
const db = require("../config/firebase");
const beritaController = require("../controllers/beritaController");

// Rute API
router.post("/", beritaController.addBerita);
router.get("/", beritaController.getAllBerita);
router.get("/:slug", beritaController.getBeritaBySlug);
router.put("/:id", beritaController.updateBerita);  // Pastikan controller ini ada
router.delete("/:id", beritaController.deleteBerita);

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

module.exports = router;
