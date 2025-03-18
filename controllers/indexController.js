const db = require("../config/firebase");

exports.renderHomePage = async (req, res) => {
  try {
    // Ambil data carousel dari Firestore
    const carouselSnapshot = await db.collection("carousel").get();
    const carouselImages = carouselSnapshot.docs.map(doc => doc.data());

    // Ambil data artikel dari Firestore
    const articlesSnapshot = await db.collection("articles").limit(5).get();
    const articles = articlesSnapshot.docs.map(doc => doc.data());

    // Ambil data berita dari Firestore
    const beritaSnapshot = await db.collection("berita").orderBy('tanggalPembuatan', 'desc').limit(5).get();
    const berita = beritaSnapshot.docs.map(doc => doc.data());

    // Ambil data footer dari Firestore
    const footerSnapshot = await db.collection("footer").get();
    const footerData = footerSnapshot.docs.map(doc => doc.data())[0];

    // Ambil data pertandingan (match) dari Firestore
    const jadwalSnapshot = await db.collection("jadwalPertandingan").orderBy("tanggal", "desc").limit(1).get();
    let matchData = null;

    // Ambil data pertandingan pertama
    jadwalSnapshot.forEach(doc => {
      matchData = doc.data();  // Mendapatkan data pertandingan terbaru
    });

    // Kirim semua data ke tampilan (index.ejs)
    res.render("index", {
      carouselImages,
      articles,
      berita,  // Mengirimkan berita ke tampilan EJS
      footerData,
      matchData  // Mengirimkan data pertandingan ke tampilan EJS
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error loading homepage");
  }
};
