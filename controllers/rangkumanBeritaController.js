const db = require("../config/firebase"); // Pastikan Firestore terhubung dengan benar

// Fungsi untuk mengambil data berita dari Firestore
async function getBeritaData() {
  try {
    const snapshot = await db.collection("berita").orderBy("tanggalPembuatan", "desc").get();
    const beritaData = snapshot.docs.map(doc => doc.data()) || [];

    // Format tanggal untuk setiap berita
    beritaData.forEach(berita => {
      if (berita.tanggalPembuatan) {
        berita.tanggalPembuatan = formatTanggal(berita.tanggalPembuatan); // Format tanggal secara konsisten
      }
    });

    return beritaData;
  } catch (error) {
    console.error('Error mengambil data berita:', error);
    throw new Error('Error mengambil data berita');
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

// Endpoint untuk menampilkan halaman Rangkuman Berita
async function renderRangkumanBeritaPage(req, res) {
  try {
    const beritaData = await getBeritaData(); // Ambil data berita dari Firestore
    const footerData = await getFooterData(); // Ambil data footer dari Firestore
    res.render('rangkuman-berita', { beritaData, footerData }); // Kirimkan data berita dan footer ke template EJS
  } catch (error) {
    res.status(500).send("Terjadi kesalahan pada server");
  }
}

module.exports = {
  renderRangkumanBeritaPage
};
