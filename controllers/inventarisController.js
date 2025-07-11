const axios = require('axios'); // Untuk mengambil data dari Google Apps Script API
const db = require("../config/firebase"); // Untuk mengambil data dari Firestore
const inventarisModel = require('../models/inventarisModel');

// Fungsi untuk memformat tanggal ke format yang diinginkan (DD-MM-YYYY)
function formatTanggal(tanggal) {
  if (!tanggal) return '-';
  if (tanggal.includes('-')) {
    // Sudah format yyyy-mm-dd atau dd-mm-yyyy
    const parts = tanggal.split('-');
    if (parts[0].length === 4) {
      // yyyy-mm-dd -> dd-mm-yyyy
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return tanggal;
  }
  const date = new Date(tanggal);
  if (isNaN(date.getTime())) return tanggal;
  return `${("0" + date.getDate()).slice(-2)}-${("0" + (date.getMonth() + 1)).slice(-2)}-${date.getFullYear()}`;
}

// Ambil data inventaris dari Firebase
async function getInventarisData() {
  const data = await inventarisModel.getAllInventaris();
  // Mapping agar konsisten dengan view lama
  return data.map(item => ({
    NAMA_BARANG: item.namaBarang || '-',
    MERK_BARANG: item.merkBarang || '-',
    JUMLAH: item.jumlah || '-',
    KODE: item.kode || '-',
    KONDISI_BAIK: item.kondisiBaik || '-',
    KONDISI_BURUK: item.kondisiBuruk || '-',
    KETERANGAN: item.keterangan || '-',
    TANGGAL: formatTanggal(item.tanggal)
  }));
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

// Endpoint untuk mengirimkan data inventaris dan footer ke view
async function renderInventarisPage(req, res) {
  try {
    const inventarisData = await getInventarisData();
    const footerData = await getFooterData();
    res.render("inventaris", { inventarisData, footerData });
  } catch (error) {
    res.status(500).send("Terjadi kesalahan pada server");
  }
}

module.exports = {
  renderInventarisPage
};
