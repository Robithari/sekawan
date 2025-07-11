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

const addArticle = async (req, res) => {
  try {
    const { title, slug, content, photoUrl, caption, titleKeterangan } = req.body;

    if (!title || !slug || !content) {
      return res.status(400).json({ error: "Semua field harus diisi!" });
    }
    const sanitizedContent = DOMPurify.sanitize(content);
    await db.collection("articles").add({
      title,
      slug,
      content: sanitizedContent,
      photoUrl,
      caption,
      titleKeterangan,
      createdAt: new Date()
    });
    // Update sitemap setelah tambah artikel
    generateSitemap().catch(e => console.error("Gagal update sitemap:", e));
    res.status(201).json({ message: "Artikel berhasil ditambahkan!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllArticles = async (req, res) => {
  try {
    const snapshot = await db.collection("articles").get();
    let articles = [];
    snapshot.forEach(doc => {
      articles.push({ id: doc.id, ...doc.data() });
    });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getArticleBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;
    const q = db.collection("articles").where("slug", "==", slug);
    const snapshot = await q.get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "Artikel tidak ditemukan!" });
    }

    const article = snapshot.docs[0].data();

    // Ambil data footer
    const footerData = await getFooterData();

    // Render halaman artikel dengan data artikel dan footer
    res.render("article", { article, footerData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, content, photoUrl, caption, titleKeterangan } = req.body;

    if (!title || !slug || !content) {
      return res.status(400).json({ error: "Semua field harus diisi!" });
    }
    const sanitizedContent = DOMPurify.sanitize(content);
    await db.collection("articles").doc(id).update({
      title,
      slug,
      content: sanitizedContent,
      photoUrl,
      caption,
      titleKeterangan,
      updatedAt: new Date()
    });
    // Update sitemap setelah update artikel
    generateSitemap().catch(e => console.error("Gagal update sitemap:", e));
    res.json({ message: "Artikel berhasil diperbarui!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("articles").doc(id).delete();
    // Update sitemap setelah hapus artikel
    generateSitemap().catch(e => console.error("Gagal update sitemap:", e));
    res.json({ message: "Artikel berhasil dihapus!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addArticle, getAllArticles, getArticleBySlug, updateArticle, deleteArticle };
