const db = require("../config/firebase");
const iuranModel = require('../models/iuranModel');
const { validationResult } = require('express-validator');

// Fungsi untuk mengambil data footer dari Firestore
async function getFooterData() {
  try {
    const snapshotFooter = await db.collection("footer").get();
    const footerData = snapshotFooter.docs.map(doc => doc.data())[0] || {};
    return footerData;
  } catch (error) {
    console.error("Error mengambil data footer:", error);
    throw new Error('Error mengambil data footer');
  }
}

// Fungsi untuk mapping data iuran agar kolom bulan berisi '✔️' jika sudah dibayar
function mapIuranDataForEjs(iuranData) {
  const bulanList = ['mei','juni','juli','agustus','september','oktober','november','desember'];
  return iuranData.map(item => {
    const mapped = { ...item };
    bulanList.forEach(bulan => {
      if (item[bulan] && typeof item[bulan] === 'object') {
        mapped[bulan] = item[bulan].checked ? '✔️' : '';
      } else if (item[bulan] === true) {
        mapped[bulan] = '✔️';
      } else {
        mapped[bulan] = '';
      }
    });
    return mapped;
  });
}

// Fungsi untuk merender halaman data-iuran dengan data iuran dan footer
async function renderDataIuranPage(req, res) {
  try {
    const iuranDataRaw = await iuranModel.getAllIuran();
    const iuranData = mapIuranDataForEjs(iuranDataRaw);
    const footerData = await getFooterData();
    res.render("data-iuran", { iuranData, footerData });
  } catch (error) {
    res.status(500).send("Terjadi kesalahan pada server");
  }
}

// API endpoint: GET /api/iuran
async function getIuran(req, res) {
  try {
    const data = await iuranModel.getAllIuran();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// API endpoint: POST /api/iuran
async function addIuran(req, res) {
  // Validasi hasil express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const data = req.body;
    const bulanObj = enrichBulanWithTanggal(data);
    const iuran = await iuranModel.addIuran({
      anggota: data.anggota,
      ...bulanObj,
      jumlah: data.jumlah
    });
    res.json({ success: true, data: iuran });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// API endpoint: PUT /api/iuran/:id
async function updateIuran(req, res) {
  try {
    const oldData = await iuranModel.getAllIuran();
    const current = oldData.find(d => d.id === req.params.id) || {};
    const data = req.body;
    const bulanObj = enrichBulanWithTanggal(data, current);
    const iuran = await iuranModel.updateIuran(req.params.id, {
      anggota: data.anggota,
      ...bulanObj,
      jumlah: data.jumlah
    });
    res.json({ success: true, data: iuran });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// API endpoint: DELETE /api/iuran/:id
async function deleteIuran(req, res) {
  try {
    if (!req.params.id) {
      return res.status(400).json({ success: false, message: 'ID iuran tidak valid' });
    }
    await iuranModel.deleteIuran(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Gagal menghapus iuran:', err);
    res.status(500).json({ success: false, message: err.message });
  }
}

function enrichBulanWithTanggal(data, oldData = {}) {
  const bulanList = ['mei','juni','juli','agustus','september','oktober','november','desember'];
  const today = new Date().toISOString().slice(0,10);
  const result = {};
  bulanList.forEach(bulan => {
    let val = data[bulan];
    let prev = oldData[bulan];
    if (typeof val === 'object' && val !== null) {
      // Sudah format baru
      result[bulan] = {
        checked: !!val.checked,
        tanggal: val.checked ? (val.tanggal || today) : ''
      };
    } else if (val === true) {
      // Baru dicentang, isi tanggal hari ini
      result[bulan] = { checked: true, tanggal: today };
    } else if (val === false) {
      // Uncheck, kosongkan tanggal
      result[bulan] = { checked: false, tanggal: '' };
    } else if (prev && prev.checked) {
      // Data lama, tetap pakai tanggal lama
      result[bulan] = { checked: true, tanggal: prev.tanggal || today };
    } else {
      result[bulan] = { checked: false, tanggal: '' };
    }
  });
  return result;
}

module.exports = {
  renderDataIuranPage,
  getFooterData,
  getIuran,
  addIuran,
  updateIuran,
  deleteIuran
};
