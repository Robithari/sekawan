// utils.js

function formatTanggal(tanggal) {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = tanggal.match(regex);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
  
    const date = new Date(tanggal);
  
    if (isNaN(date.getTime())) {
      return "Tanggal tidak valid";
    }
  
    const formattedDate = `${("0" + date.getDate()).slice(-2)}-${("0" + (date.getMonth() + 1)).slice(-2)}-${date.getFullYear()}`;
    return formattedDate;
  }
  
  function formatRupiah(angka) {
    if (typeof angka !== "number") {
      angka = parseFloat(angka);
    }
  
    if (isNaN(angka)) {
      return "Rp. -";
    }
  
    return `Rp. ${angka.toLocaleString('id-ID')}`;
  }
  
  // Fungsi untuk mendapatkan data footer
  async function getFooterData() {
    try {
      const snapshotFooter = await db.collection("footer").get();
      const footerData = snapshotFooter.docs.map(doc => doc.data())[0] || {};
      return footerData;
    } catch (error) {
      console.error("Error fetching footer data:", error);
      throw new Error("Error fetching footer data");
    }
  }
  
  // Eksport fungsi
  module.exports = {
    formatTanggal,
    formatRupiah,
    getFooterData
  };
  