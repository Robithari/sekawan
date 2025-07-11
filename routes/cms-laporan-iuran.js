const dataIuranController = require("../controllers/dataIuranController");
const express = require("express");
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Halaman laporan iuran di CMS (hanya admin, gunakan middleware auth jika perlu)
router.get("/cms/laporan-iuran", authMiddleware, async (req, res) => {
  try {
    const iuranData = await dataIuranController.getIuranData();
    res.render("cms-laporan-iuran", { iuranData });
  } catch (error) {
    res.status(500).send("Gagal mengambil data iuran");
  }
});

// Laporan Donasi
router.get("/cms/laporan-donasi", authMiddleware, async (req, res) => {
  try {
    const donasiModel = require("../models/donasiModel");
    const donasiDataRaw = await donasiModel.getAllDonasi();
    let total = 0;
    const donasiData = donasiDataRaw.map((item, index) => {
      if (item.nominal) total += item.nominal;
      return {
        ...item,
        rowClass: '',
        isLastRow: false
      };
    });
    donasiData.forEach((item, idx) => {
      if (idx % 2 === 1) item.rowClass = 'yellow-background';
    });
    donasiData.push({
      donatur: '',
      nominal: total,
      tanggal: '',
      keterangan: '',
      rowClass: 'green-row',
      isLastRow: true
    });
    res.render("cms-laporan-donasi", { donasiData });
  } catch (error) {
    res.status(500).send("Gagal mengambil data donasi");
  }
});

module.exports = router;
