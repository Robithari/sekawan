const db = require("../config/firebase"); // Untuk mengambil data dari Firestore
const kasModel = require('../models/kasModel');

// Fungsi untuk memformat tanggal ke format yang diinginkan (DD-MM-YYYY)
function formatTanggal(tanggal) {
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = tanggal.match(regex);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`; // Mengembalikan format tanggal yang sesuai
  }

  const date = new Date(tanggal);

  if (isNaN(date.getTime())) {
    return "Tanggal tidak valid"; // Jika tidak valid, kembalikan pesan ini
  }

  const formattedDate = `${("0" + date.getDate()).slice(-2)}-${("0" + (date.getMonth() + 1)).slice(-2)}-${date.getFullYear()}`;
  return formattedDate;
}

// Fungsi untuk memformat angka menjadi format mata uang (Rp.)
function formatRupiah(angka) {
  if (typeof angka !== "number") {
    angka = parseFloat(angka); // Jika angka bukan tipe number, konversi
  }

  if (isNaN(angka)) {
    return "Rp. -"; // Jika data tidak valid, tampilkan Rp. -
  }

  // Format dengan locale Indonesia (id-ID) dan pastikan Rp. selalu di kiri dan angka diratakan ke kanan
  return `Rp. ${angka.toLocaleString('id-ID')}`; 
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

// Endpoint untuk mengirimkan data kas dan footer ke view
async function renderKasPage(req, res) {
  try {
    let kasData = await kasModel.getAllKas(); // Ambil data kas dari Firestore
    const footerData = await getFooterData(); // Ambil data footer dari Firestore
    const kodeCari = req.query.kode ? req.query.kode.trim().toLowerCase() : '';
    if (kodeCari) {
      kasData = kasData.filter(kas => kas.kode && kas.kode.toLowerCase().includes(kodeCari));
    }
    res.render("kas", { kasData, footerData, kodeCari }); // Kirimkan data ke template EJS
  } catch (error) {
    res.status(500).send("Terjadi kesalahan pada server");
  }
}

// Menambahkan latar belakang abu-abu pada baris ganjil dan mengatur teks rata kanan pada nominal
function applyTableStyles() {
  const rows = document.querySelectorAll("table tbody tr");
  rows.forEach((row, index) => {
    // Menambahkan latar belakang abu-abu pada baris ganjil
    if (index % 2 === 0) {
      row.classList.add('gray-background');
    }

    // Memastikan nominal di kolom Pemasukan, Pengeluaran, Saldo rata kanan
    const pemasukanCell = row.querySelector(".pemasukan");
    const pengeluaranCell = row.querySelector(".pengeluaran");
    const saldoCell = row.querySelector(".saldo");

    if (pemasukanCell) {
      pemasukanCell.style.textAlign = "right";
    }
    if (pengeluaranCell) {
      pengeluaranCell.style.textAlign = "right";
    }
    if (saldoCell) {
      saldoCell.style.textAlign = "right";
    }
  });
}

// API endpoint: GET /api/kas
exports.getKas = async (req, res) => {
  try {
    const data = await kasModel.getAllKas();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// API endpoint: POST /api/kas
exports.addKas = async (req, res) => {
  try {
    const kas = await kasModel.addKas(req.body);
    res.json({ success: true, data: kas });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// API endpoint: PUT /api/kas/:id
exports.updateKas = async (req, res) => {
  try {
    const kas = await kasModel.updateKas(req.params.id, req.body);
    res.json({ success: true, data: kas });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// API endpoint: DELETE /api/kas/:id
exports.deleteKas = async (req, res) => {
  try {
    await kasModel.deleteKas(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  renderKasPage,
  applyTableStyles,
  getKas: exports.getKas,
  addKas: exports.addKas,
  updateKas: exports.updateKas,
  deleteKas: exports.deleteKas
};
