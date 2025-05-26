const axios = require('axios');
const db = require("../config/firebase"); // Pastikan Firestore terhubung dengan benar

const apiUrl = 'https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLga0neZxigd-Rg2j3auBYTYbRNZLTERGIgIYJxOHbCXneV2SfJ618R-kmae_fYjKjjeFCVbeXtdC5NohjsQ8IyhyuWLIbBAux_8rlUI8S6syJFc6owJpw3eEpGktAuqo9CqyPa0cupJNve0UECI2EKDVLIYBvTWZTete2mTTt0sSDEkmGyZCPpPnIlvKSc3NBqJCOeZaXubq7aLBJrdGc7i47rhEZHb64pKu13aTAaO8htgvMBXRagc-CkZvXzT75gdb04P8f4491PdR24xOg_yhxRpTA&lib=MAI_rgUitCMaNv_S3rIr3yFeS6DrsjUUV';

// Fungsi untuk mengambil data iuran dari API eksternal dan memprosesnya
async function getIuranData() {
  try {
    const response = await axios.get(apiUrl);
    if (response.status !== 200) {
      throw new Error('Gagal mengambil data dari API eksternal');
    }
    const data = response.data; // Data yang diterima dari API
    const anggotaData = data.IURAN.slice(1); // Lewati header API

    // Proses data agar sesuai dengan struktur yang digunakan di view
    const iuranData = anggotaData.map((item, index) => {
      const isLastRow = index === anggotaData.length - 1; // Menandai baris terakhir

      return {
        anggota: item.ANGGOTA,
        mei: item.MEI === true ? '✔' : (item.MEI === false ? '-' : ''),
        juni: item.JUNI === true ? '✔' : (item.JUNI === false ? '-' : ''),
        juli: item.JULI === true ? '✔' : (item.JULI === false ? '-' : ''),
        agustus: item.AGUSTUS === true ? '✔' : (item.AGUSTUS === false ? '-' : ''),
        september: item.SEPTEMBER === true ? '✔' : (item.SEPTEMBER === false ? '-' : ''),
        oktober: item.OKTOBER === true ? '✔' : (item.OKTOBER === false ? '-' : ''),
        november: item.NOVEMBER === true ? '✔' : (item.NOVEMBER === false ? '-' : ''),
        desember: item.DESEMBER === true ? '✔' : (item.DESEMBER === false ? '-' : ''),
        jumlah: item.JUMLAH ? formatRupiah(item.JUMLAH) : '',
        rowClass: index % 2 === 0 ? 'yellow-background' : '', // Menandai baris genap
        isLastRow, // Menambahkan indikator untuk baris terakhir
      };
    });

    // Tambahkan penandaan untuk baris JUMLAH PERBULAN dan JUMLAH TOTAL
    iuranData.forEach((item) => {
      if (item.anggota === 'JUMLAH PERBULAN' || item.anggota === 'JUMLAH TOTAL') {
        item.rowClass = 'green-row'; // Tandai baris dengan kelas 'green-row'
      }
    });

    return iuranData;
  } catch (error) {
    console.error("Error mengambil data iuran dari API eksternal:", error);
    throw new Error("Error mengambil data iuran dari API eksternal");
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

// Fungsi untuk merender halaman data-iuran dengan data iuran dan footer
async function renderDataIuranPage(req, res) {
  try {
    const iuranData = await getIuranData(); // Ambil data iuran dari API
    const footerData = await getFooterData(); // Ambil data footer dari Firestore
    res.render("data-iuran", { iuranData, footerData }); // Kirimkan data iuran dan footer ke template EJS
  } catch (error) {
    res.status(500).send("Terjadi kesalahan pada server");
  }
}

module.exports = {
  renderDataIuranPage,
};
