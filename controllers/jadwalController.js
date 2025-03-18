const axios = require('axios');
const db = require("../config/firebase"); // Pastikan Firestore terhubung dengan benar

// Fungsi untuk mengambil data jadwal pertandingan dari API
async function getJadwalData() {
  try {
    const response = await axios.get('https://script.googleusercontent.com/macros/echo?user_content_key=k3wU5zfK3-DW2Vo34Q6-ewmfpREpWbK0dfljFBd4BPzYkLMkFAR3SJh8mEDulwhwaN--kc1oialmNsXVayUS965zW5owxlZTm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnHDsBA6sOiRdcN-kLg6IjGxorAwSZE5V4kOENSFM87NWhh8eVEm3u2M2zCzCOQYoo7iDpELgRwTmAOBD0Lu6gwQafWUebtRFJA&lib=MzYoBrZdJ1ebCVURGRsyHWw3C713IOBJS');
    const jadwalData = response.data["JADWAL PERTANDINGAN"] || [];

    // Format tanggal dan data yang diterima
    jadwalData.forEach(jadwal => {
      if (jadwal.TANGGAL) {
        jadwal.TANGGAL = formatTanggal(jadwal.TANGGAL); // Format tanggal secara konsisten
      }
    });

    // Hapus baris pertama (header kolom)
    if (jadwalData.length > 0) {
      jadwalData.shift(); // Menghapus baris pertama
    }

    return jadwalData;
  } catch (error) {
    console.error('Error mengambil data jadwal:', error);
    throw new Error('Error mengambil data jadwal');
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

// Endpoint untuk menampilkan halaman Jadwal Pertandingan
async function renderJadwalPage(req, res) {
  try {
    const jadwalData = await getJadwalData(); // Ambil data jadwal dari API
    const footerData = await getFooterData(); // Ambil data footer dari Firestore
    res.render('jadwal', { jadwalData, footerData }); // Kirimkan data jadwal dan footer ke template EJS
  } catch (error) {
    res.status(500).send("Terjadi kesalahan pada server");
  }
}

module.exports = {
  renderJadwalPage
};
