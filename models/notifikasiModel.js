// models/notifikasiModel.js
const fs = require('fs');
const path = require('path');
const DB_PATH = path.join(__dirname, '../logs/notifikasi-user.json');

function loadAll() {
  if (!fs.existsSync(DB_PATH)) return [];
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch {
    return [];
  }
}


function saveAll(arr) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(arr, null, 2));
    console.log('[NotifikasiModel] Sukses menulis histori notifikasi. Jumlah:', arr.length);
  } catch (err) {
    console.error('[NotifikasiModel] Gagal menulis histori notifikasi:', err);
    throw err;
  }
}


// Pastikan histori selalu menyimpan field judul (backward compatible)

function addNotifikasi(data) {
  const arr = loadAll();
  // Patch: jika tidak ada judul, isi dengan string kosong
  if (!('judul' in data)) data.judul = '';
  arr.unshift(data); // terbaru di atas
  try {
    saveAll(arr);
    console.log('[NotifikasiModel] Notifikasi baru ditambahkan:', data);
  } catch (err) {
    console.error('[NotifikasiModel] Error saat menambah notifikasi:', err);
    throw err;
  }
}

module.exports = {
  loadAll,
  addNotifikasi
};
