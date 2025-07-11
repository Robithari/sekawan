const db = require("../config/firebase");
const { generateSitemap } = require("../sitemap"); // Tambahkan import sitemap
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Fungsi untuk mengambil data footer
const getFooterData = async () => {
  try {
    const snapshotFooter = await db.collection("footer").get();
    return snapshotFooter.docs.map(doc => doc.data())[0] || {}; // Ambil data footer pertama
  } catch (error) {
    console.error("Kesalahan saat mengambil footer:", error);
    return {};
  }
};

// Tambah berita baru
exports.addBerita = async (req, res) => {
  try {
    const { title, content, photoUrl, caption, titleKeterangan } = req.body;
    const sanitizedContent = DOMPurify.sanitize(content || '');
    const newBerita = {
      title,
      content: sanitizedContent,
      photoUrl,
      caption,
      titleKeterangan,
      tanggalPembuatan: new Date(),
      slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') // Membuat slug otomatis
    };

    const beritaRef = await db.collection("berita").add(newBerita);
    // Update sitemap setelah tambah berita
    generateSitemap().catch(e => console.error("Gagal update sitemap:", e));

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

    // Ambil data footer
    const footerData = await getFooterData();

    // Menggunakan EJS untuk menampilkan berita beserta footer
    res.render("berita", { berita, footerData });
  } catch (error) {
    res.status(500).render("error", { error });
  }
};

// Perbarui berita berdasarkan ID
exports.updateBerita = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    if (updatedData.content) {
      updatedData.content = DOMPurify.sanitize(updatedData.content);
    }
    const beritaRef = db.collection("berita").doc(id);
    const beritaDoc = await beritaRef.get();

    if (!beritaDoc.exists) {
      return res.status(404).json({ message: "Berita tidak ditemukan!" });
    }

    await beritaRef.update(updatedData);
    // Update sitemap setelah update berita
    generateSitemap().catch(e => console.error("Gagal update sitemap:", e));
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
    // Update sitemap setelah hapus berita
    generateSitemap().catch(e => console.error("Gagal update sitemap:", e));
    res.status(200).json({ message: "Berita berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
