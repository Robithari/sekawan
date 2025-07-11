const axios = require('axios');
const db = require("../config/firebase"); // Pastikan Firestore terhubung dengan benar
const donasiModel = require('../models/donasiModel');

const apiUrlDonasi = 'https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLgV3F7dSIzqXBzgjqoDFNdKAaobNOb4Iy651PFgO0lNQMERlkxh84aIXrywWI1Z30KvxeCZCl4AXDU2R58m7O2uZ71Bju4lrQKYvUuhWtcaGagZt0Hqmnxl6f4DZrW7IhbzWlQZMZVjiS6wzJy23SYHi5QOAYmY9tNcxAjABnPBiQM-BTHcgu4dUw_cOLeD8gv_7BTJJQgfoR9Y0l5QsaJuOQ0oxfodHeIOHgAEoUqvihOFZ0UFE2iZnoZN9ROupin369AYiHQghst8E3OOwW-_sr8Dhw&lib=Mk53llENX0Q97ejWc3CZq_leS6DrsjUUV';

// Fungsi untuk mengambil data donasi dari API eksternal dan memprosesnya
async function getDonasiData() {
  try {
    const response = await axios.get(apiUrlDonasi);
    if (response.status !== 200) {
      throw new Error('Gagal mengambil data dari API donasi');
    }
    const data = response.data; // Data yang diterima dari API
    let donasiList = data.DONASI || []; // Asumsi data donasi ada di properti DONASI

    // Skip baris pertama karena berisi header
    if (donasiList.length > 0) {
      donasiList = donasiList.slice(1);
    }

    // Proses data agar sesuai dengan struktur yang digunakan di view
    const donasiData = donasiList.map((item, index) => {
      // Potong tanggal untuk menghilangkan bagian waktu
      let tanggalFormatted = item.TANGGAL || '';
      if (tanggalFormatted.includes('T')) {
        tanggalFormatted = tanggalFormatted.split('T')[0];
      }
      // Ubah format tanggal dari yyyy-mm-dd ke dd-mm-yyyy
      if (tanggalFormatted) {
        const parts = tanggalFormatted.split('-');
        if (parts.length === 3) {
          tanggalFormatted = parts[2] + '-' + parts[1] + '-' + parts[0];
        }
      }
      const isLastRow = index === donasiList.length - 1;
      return {
        tanggal: tanggalFormatted,
        nama: item.NAMA || '',
        invoiceNumber: item["INVOICE NUMBER"] || '',
        jumlah: item.JUMLAH ? formatRupiah(item.JUMLAH) : '',
        keterangan: item.KETERANGAN || '',
        rowClass: isLastRow ? 'green-row' : (index % 2 === 0 ? 'yellow-background' : ''),
        isLastRow,
      };
    });

    return donasiData;
  } catch (error) {
    console.error("Error mengambil data donasi dari API eksternal:", error);
    throw new Error("Error mengambil data donasi dari API eksternal");
  }
}

// Fungsi format rupiah
function formatRupiah(angka) {
  if (typeof angka !== "number") {
    angka = parseFloat(angka);
  }
  if (isNaN(angka)) {
    return "-";
  }
  return "Rp" + angka.toLocaleString('id-ID');
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

// Fungsi untuk mapping data donasi agar pewarnaan baris dan total otomatis
function mapDonasiDataForEjs(donasiDataRaw) {
  let total = 0;
  const mapped = donasiDataRaw.map((item, index) => {
    if (item.nominal) total += item.nominal;
    return {
      tanggal: item.tanggal || '',
      nama: item.donatur || item.nama || '',
      invoiceNumber: item.invoiceNumber || '-',
      jumlah: item.nominal ? 'Rp. ' + item.nominal.toLocaleString('id-ID') : (item.jumlah || ''),
      keterangan: item.keterangan || '',
      rowClass: '',
      isLastRow: false
    };
  });
  // Pewarnaan baris
  mapped.forEach((item, idx) => {
    if (idx % 2 === 1) item.rowClass = 'yellow-background';
  });
  // Tambahkan baris total di bawah sendiri
  mapped.push({
    tanggal: '',
    nama: '',
    invoiceNumber: '',
    jumlah: 'Rp. ' + total.toLocaleString('id-ID'),
    keterangan: '',
    rowClass: 'green-row',
    isLastRow: true
  });
  return mapped;
}

// Fungsi untuk merender halaman data-donasi dengan data donasi dan footer
async function renderDataDonasiPage(req, res) {
  try {
    const donasiDataRaw = await donasiModel.getAllDonasi();
    const donasiData = mapDonasiDataForEjs(donasiDataRaw);
    const footerData = await getFooterData();
    res.render("data-donasi", { donasiData, footerData });
  } catch (error) {
    res.status(500).send("Terjadi kesalahan pada server");
  }
}

module.exports = {
  renderDataDonasiPage,
};
