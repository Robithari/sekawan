const axios = require('axios'); // Untuk mengambil data dari Google Apps Script API
const db = require("../config/firebase"); // Untuk mengambil data dari Firestore

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

// Fungsi untuk mengambil data inventaris dari Google Apps Script API menggunakan axios
async function getInventarisData() {
  const apiUrl = 'https://script.googleusercontent.com/macros/echo?user_content_key=Yqyq1DhrzBe_pzk0D3UUfGB_sKx2T2TqV2XJYhejgo3WXzBw1IYswWdHQJoyct88kBU6CF9RVRuC3MwlKp4sM9lzXBxDc42dm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnLGVgPpKtvYPUnnNghbhLesi3kyGTxNlq-mqqu6k0bRGx0g3iP6Nsd77ABz2ja6HbwgMdF1gKSmKbkF-zXBdD6hz3abTnINGdA&lib=MRZfPoZa3sDHpg9sMQ6l5IA3C713IOBJS';
  
  try {
    const response = await axios.get(apiUrl); // Menggunakan axios untuk melakukan GET request
    const data = response.data; // Ambil data dari response

    const inventarisData = data["BARANG-INVENTARIS"] || [];

    // Jika data bukan array, pastikan kita mengonversinya menjadi array
    if (!Array.isArray(inventarisData)) {
      console.log("Data inventaris bukan array, memformat data menjadi array.");
      return [inventarisData];
    }

    // Menyesuaikan data agar sesuai dengan format yang diharapkan oleh EJS
    // Filter data untuk menghapus item dengan nilai kosong
    const filteredData = inventarisData.filter(item => {
      return item["JENIS BARANG"] && item["MERK BARANG"] && item["JUMLAH BARANG"] && item["KODE BARANG"];
    });

    // Menyesuaikan nama kolom agar sesuai dengan format yang digunakan di EJS
    filteredData.forEach(item => {
      item.NAMA_BARANG = item["JENIS BARANG"] || '-';
      item.MERK_BARANG = item["MERK BARANG"] || '-';
      item.JUMLAH = item["JUMLAH BARANG"] || '-';
      item.KODE = item["KODE BARANG"] || '-';
      item.KONDISI_BAIK = item["JUMLAH KONDISI BARANG BAIK"] || '-';
      item.KONDISI_BURUK = item["JUMLAH KONDISI BARANG BURUK"] || '-';
      item.KETERANGAN = item["KETERANGAN"] || '-';

      // Pastikan data tanggal ada dan diformat
      if (item.TANGGAL) {
        item.TANGGAL = formatTanggal(item.TANGGAL); // Format tanggal menjadi DD-MM-YYYY
      }
    });

    return filteredData;
  } catch (error) {
    console.error('Error mengambil data inventaris:', error);
    throw new Error('Error mengambil data inventaris');
  }
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
    const inventarisData = await getInventarisData(); // Ambil data inventaris dari API
    const footerData = await getFooterData(); // Ambil data footer dari Firestore
    res.render("inventaris", { inventarisData, footerData }); // Kirimkan data ke template EJS
  } catch (error) {
    res.status(500).send("Terjadi kesalahan pada server");
  }
}

module.exports = {
  renderInventarisPage
};
