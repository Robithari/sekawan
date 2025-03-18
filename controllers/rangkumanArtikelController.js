const db = require("../config/firebase"); // Pastikan Firestore terhubung dengan benar

// Fungsi untuk mengambil data artikel dari Firestore
async function getArtikelData() {
  try {
    const snapshot = await db.collection("articles").orderBy("tanggalPembuatan", "desc").get();
    const artikelData = snapshot.docs.map(doc => doc.data()) || [];

    // Format tanggal untuk setiap artikel
    artikelData.forEach(article => {
      if (article.tanggalPembuatan) {
        article.tanggalPembuatan = formatTanggal(article.tanggalPembuatan); // Format tanggal secara konsisten
      }
    });

    return artikelData;
  } catch (error) {
    console.error('Error mengambil data artikel:', error);
    throw new Error('Error mengambil data artikel');
  }
}

// Fungsi untuk format tanggal menjadi format DD-MM-YYYY
function formatTanggal(tanggal) {
  let date;

  // Coba parsing dengan new Date() terlebih dahulu
  if (typeof tanggal === 'string') {
    // Menggunakan regex untuk menangani berbagai format tanggal (misalnya DD/MM/YYYY atau YYYY-MM-DD)
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;  // Format: DD/MM/YYYY
    const match = tanggal.match(dateRegex);

    if (match) {
      // Jika tanggal cocok dengan regex, format ke YYYY-MM-DD
      date = new Date(`${match[3]}-${match[2]}-${match[1]}`);
    } else {
      date = new Date(tanggal); // Coba untuk langsung membuat tanggal
    }
  } else {
    date = new Date(tanggal); // Coba membuat tanggal dari objek langsung
  }

  // Cek apakah tanggal valid
  if (isNaN(date.getTime())) {
    return "Tanggal tidak valid"; // Tanggal tidak valid
  }

  // Format tanggal menjadi DD-MM-YYYY
  return `${("0" + date.getDate()).slice(-2)}-${("0" + (date.getMonth() + 1)).slice(-2)}-${date.getFullYear()}`;
}

// Fungsi untuk mengambil data footer dari Firestore
async function getFooterData() {
  try {
    const snapshotFooter = await db.collection("footer").get();
    const footerData = snapshotFooter.docs.map(doc => doc.data())[0] || {}; // Ambil data footer pertama
    return footerData;
  } catch (error) {
    console.error("Error mengambil data footer:", error);
    throw new Error('Error mengambil data footer');
  }
}

// Fungsi untuk menampilkan halaman rangkuman-artikel
async function renderRangkumanArtikelPage(req, res) {
  try {
    const artikelData = await getArtikelData(); // Ambil data artikel dari Firestore
    const footerData = await getFooterData(); // Ambil data footer dari Firestore
    res.render('rangkuman-artikel', { artikelData, footerData }); // Kirimkan data artikel dan footer ke template EJS
  } catch (error) {
    res.status(500).send("Terjadi kesalahan pada server");
  }
}

module.exports = {
  renderRangkumanArtikelPage
};
