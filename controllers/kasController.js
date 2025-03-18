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

// Fungsi untuk mengambil data kas dari Google Apps Script API
async function getKasData() {
  try {
    const response = await axios.get('https://script.googleusercontent.com/macros/echo?user_content_key=2tlFh9Em-8BrR_JjPx3aQ-sDEIKEdwQg10yiCU4zf1Jm29nmzTv4VR3T4bxmPw6fVV-SfjjVjaVaquOJGIwOrRDz7Gy6GvlWm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnDQ3-UM55TGsEMEgUfElc6Of-3K5ZS9UOYTk0rvMmc-MD610LTi-I75zKPOseyOUEg7-xfGCRrZHesQ3EUd0MNPacrY_wOGqBA&lib=MOgvvmbSEQE02bq4Gi45tbleS6DrsjUUV');
    
    const kasData = response.data.KAS || [];
    
    // Jika data bukan array, pastikan kita mengonversinya menjadi array
    if (!Array.isArray(kasData)) {
      console.log("Data kas bukan array, memformat data menjadi array.");
      return [kasData];
    }
    
    // Format tanggal dan nominal sebelum mengirimkan data ke template
    kasData.forEach(kas => {
      if (kas.TANGGAL) {
        kas.TANGGAL = formatTanggal(kas.TANGGAL); // Format tanggal menjadi DD-MM-YYYY
      }
      
      if (kas.PEMASUKAN) {
        kas.PEMASUKAN = formatRupiah(kas.PEMASUKAN); // Format pemasukan menjadi Rp.
      }
      
      if (kas.PENGELUARAN) {
        kas.PENGELUARAN = formatRupiah(kas.PENGELUARAN); // Format pengeluaran menjadi Rp.
      }
      
      if (kas.SALDO) {
        kas.SALDO = formatRupiah(kas.SALDO); // Format saldo menjadi Rp.
      }
    });
    
    return kasData;
  } catch (error) {
    console.error('Error mengambil data kas:', error);
    throw new Error('Error mengambil data kas');
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

// Endpoint untuk mengirimkan data kas dan footer ke view
async function renderKasPage(req, res) {
  try {
    const kasData = await getKasData(); // Ambil data kas dari API
    const footerData = await getFooterData(); // Ambil data footer dari Firestore
    res.render("kas", { kasData, footerData }); // Kirimkan data ke template EJS
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

module.exports = {
  renderKasPage,
  applyTableStyles
};
