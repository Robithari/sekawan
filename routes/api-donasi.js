// API endpoint untuk donasi (CRUD)
const express = require("express");
const router = express.Router();
const donasiModel = require("../models/donasiModel");
const { body, validationResult } = require('express-validator');

// GET semua donasi (JSON)
router.get("/api/donasi", async (req, res) => {
  try {
    const data = await donasiModel.getAllDonasi();
    res.json({ success: true, data });
  } catch (error) {
    res.json({ success: false, message: "Gagal mengambil data donasi" });
  }
});

// POST tambah donasi
router.post(
  "/api/donasi",
  [
    body("donatur").trim().notEmpty().withMessage("Nama donatur wajib diisi").escape(),
    body("nominal").isNumeric().withMessage("Nominal harus angka").toInt(),
    body("tanggal").isISO8601().withMessage("Tanggal tidak valid"),
    body("keterangan").optional().trim().escape()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { donatur, nominal, tanggal, keterangan, invoiceNumber } = req.body;
      const newDonasi = {
        donatur,
        nominal: parseInt(nominal, 10),
        tanggal,
        invoiceNumber: invoiceNumber || "",
        keterangan: keterangan || ""
      };
      const result = await donasiModel.addDonasi(newDonasi);
      res.json({ success: true, data: result });
    } catch (error) {
      res.json({ success: false, message: "Gagal menambah donasi" });
    }
  }
);

// PUT update donasi
router.put("/api/donasi/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { donatur, nominal, tanggal, keterangan, invoiceNumber } = req.body;
    if (!donatur || !nominal || !tanggal) {
      return res.json({ success: false, message: "Nama Donatur, Nominal, dan Tanggal wajib diisi." });
    }
    const update = {
      donatur,
      nominal: parseInt(nominal, 10),
      tanggal,
      invoiceNumber: invoiceNumber || '',
      keterangan: keterangan || ""
    };
    await donasiModel.updateDonasi(id, update);
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: "Gagal update donasi" });
  }
});

// DELETE donasi
router.delete("/api/donasi/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await donasiModel.deleteDonasi(id);
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: "Gagal hapus donasi" });
  }
});

module.exports = router;
