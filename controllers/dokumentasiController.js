const axios = require('axios'); // Untuk mengambil data dari Google Apps Script API
const db = require("../config/firebase"); // Untuk mengambil data dari Firestore

// Fungsi untuk mengambil data dokumentasi dari Google Apps Script API
async function getDokumentasiData() {
  try {
    const response = await axios.get('https://script.googleusercontent.com/macros/echo?user_content_key=CZfT4ukELTEw74U8y4_OVSdJA0MoRPTnbfrM_pEJnBf_yj0iY0f6c9xlI4u9RgHKuk3zOPedAt89EJiJW5Ng1pQVVtY5QfDsm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnFp8IpH6vIoxlz6z1vHvBGveIMkwE5hxhRZgrX7pPlQO98dtL__CtYPa3KdNnIXbUm9WnqK1sm1dRh5mrQJuQ_bE78tZtLS8jw&lib=MOgvvmbSEQE02bq4Gi45tbleS6DrsjUUV');
    const dokumentasiData = response.data.DOKUMENTASI || [];

    // Format data jika diperlukan
    dokumentasiData.forEach(doc => {
      if (doc.TANGGAL) {
        doc.TANGGAL = new Date(doc.TANGGAL).toLocaleDateString(); // Format tanggal menjadi DD-MM-YYYY
      }
    });

    return dokumentasiData;
  } catch (error) {
    console.error('Error mengambil data dokumentasi:', error);
    throw new Error('Error mengambil data dokumentasi');
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

// Endpoint untuk mengirimkan data dokumentasi dan footer ke view
async function renderDokumentasiPage(req, res) {
  try {
    const dokumentasiData = await getDokumentasiData(); // Ambil data dokumentasi dari API
    const footerData = await getFooterData(); // Ambil data footer dari Firestore
    res.render("dokumentasi", { dokumentasiData, footerData }); // Kirimkan data ke template EJS
  } catch (error) {
    res.status(500).send("Terjadi kesalahan pada server");
  }
}

module.exports = {
  renderDokumentasiPage
};
