const axios = require('axios');

const apiUrl = 'https://example.com/api/invoices'; // Ganti dengan URL API yang sesuai

// Fungsi untuk mengambil data invoice dari API eksternal dan memprosesnya
async function getInvoiceData() {
  try {
    const response = await axios.get(apiUrl);
    if (response.status !== 200) {
      throw new Error('Gagal mengambil data dari API eksternal');
    }
    const data = response.data; // Data yang diterima dari API
    const invoiceData = data.invoices.map((item, index) => ({
      no: index + 1,
      tanggal: item.tanggal,
      nama: item.nama,
      invoiceNumber: item.invoiceNumber,
      jumlah: formatRupiah(item.jumlah),
    }));

    return invoiceData;
  } catch (error) {
    console.error("Error mengambil data invoice dari API eksternal:", error);
    throw new Error("Error mengambil data invoice dari API eksternal");
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

// Fungsi untuk merender halaman invoice dengan data invoice
async function renderInvoicePage(req, res) {
  try {
    const invoiceData = await getInvoiceData(); // Ambil data invoice dari API
    res.render("invoice-table", { invoiceData }); // Kirimkan data invoice ke template EJS
  } catch (error) {
    res.status(500).send("Terjadi kesalahan pada server");
  }
}

module.exports = {
  renderInvoicePage,
};