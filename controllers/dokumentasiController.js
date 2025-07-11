
const dokumentasiModel = require('../models/dokumentasiModel');

// Ambil semua dokumentasi
async function getAllDokumentasi(req, res) {
  try {
    const data = await dokumentasiModel.getAllDokumentasi();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Tambah dokumentasi
async function addDokumentasi(req, res) {
  try {
    // Ambil hanya field yang memang ada di form (keterangan, link_foto)
    const { keterangan, link_foto, tanggal } = req.body;
    // Validasi minimal field wajib
    if (!keterangan || !link_foto) {
      return res.status(400).json({ error: 'Keterangan dan Link Foto wajib diisi.' });
    }
    // Isi field tanggal dengan hari ini jika tidak ada
    let tanggalFinal = tanggal;
    if (!tanggalFinal) {
      const now = new Date();
      tanggalFinal = now.toISOString().slice(0, 10); // yyyy-mm-dd
    }
    const data = {
      keterangan: keterangan,
      'LINK FOTO': link_foto,
      tanggal: tanggalFinal,
      createdAt: new Date().toISOString()
    };
    const result = await dokumentasiModel.addDokumentasi(data);
    res.json({ message: 'Dokumentasi berhasil ditambah', ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update dokumentasi
async function updateDokumentasi(req, res) {
  try {
    const { id } = req.params;
    const { keterangan, link_foto } = req.body;
    if (!keterangan || !link_foto) {
      return res.status(400).json({ error: 'Keterangan dan Link Foto wajib diisi.' });
    }
    const data = {
      keterangan: keterangan,
      'LINK FOTO': link_foto,
      updatedAt: new Date().toISOString()
    };
    const result = await dokumentasiModel.updateDokumentasi(id, data);
    res.json({ message: 'Dokumentasi berhasil diupdate', ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Hapus dokumentasi
async function deleteDokumentasi(req, res) {
  try {
    const { id } = req.params;
    await dokumentasiModel.deleteDokumentasi(id);
    res.json({ message: 'Dokumentasi berhasil dihapus', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllDokumentasi,
  addDokumentasi,
  updateDokumentasi,
  deleteDokumentasi
};

