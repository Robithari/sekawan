const db = require("../config/firebase");

// Tambah berita baru
exports.addBerita = async (req, res) => {
  try {
    const { title, content, photoUrl, caption, titleKeterangan } = req.body;
    const newBerita = {
      title,
      content,
      photoUrl,
      caption,
      titleKeterangan,
      tanggalPembuatan: new Date(),
      slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') // Membuat slug otomatis
    };

    const beritaRef = await db.collection("berita").add(newBerita);

    res.status(201).json({ id: beritaRef.id, message: "Berita berhasil ditambahkan" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Ambil semua berita
exports.getAllBerita = async (req, res) => {
  try {
    const snapshot = await db.collection("berita").orderBy("tanggalPembuatan", "desc").get();
    const berita = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.status(200).json(berita);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Ambil berita berdasarkan slug
exports.getBeritaBySlug = async (req, res) => {
  try {
    const q = db.collection("berita").where("slug", "==", req.params.slug);
    const snapshot = await q.get();

    if (snapshot.empty) {
      return res.status(404).render("error", { error: { message: "Berita tidak ditemukan!" } });
    }

    const berita = snapshot.docs[0].data();
    
    // Menggunakan EJS untuk menampilkan berita
    res.render("berita", { berita });
  } catch (error) {
    res.status(500).render("error", { error });
  }
};

// Perbarui berita berdasarkan ID
exports.updateBerita = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const beritaRef = db.collection("berita").doc(id);
    const beritaDoc = await beritaRef.get();

    if (!beritaDoc.exists) {
      return res.status(404).json({ message: "Berita tidak ditemukan!" });
    }

    await beritaRef.update(updatedData);
    res.status(200).json({ message: "Berita berhasil diperbarui!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Hapus berita berdasarkan ID
exports.deleteBerita = async (req, res) => {
  try {
    const { id } = req.params;

    const beritaRef = db.collection("berita").doc(id);
    const beritaDoc = await beritaRef.get();

    if (!beritaDoc.exists) {
      return res.status(404).json({ message: "Berita tidak ditemukan!" });
    }

    await beritaRef.delete();
    res.status(200).json({ message: "Berita berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
