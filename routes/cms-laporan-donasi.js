const express = require("express");
const router = express.Router();
const donasiModel = require("../models/donasiModel");
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');

// POST handler for adding a new donation from the CMS form
router.post(
  "/cms",
  authMiddleware,
  [
    body('donatur').trim().notEmpty().withMessage('Nama Donatur wajib diisi').escape(),
    body('nominal').isNumeric().withMessage('Nominal harus angka').toInt(),
    body('tanggal').isISO8601().withMessage('Tanggal tidak valid'),
    body('keterangan').optional().trim().escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { donatur, nominal, tanggal, keterangan } = req.body;
      const newDonasi = {
        donatur,
        nominal: parseInt(nominal, 10),
        tanggal,
        keterangan: keterangan || ""
      };
      await donasiModel.addDonasi(newDonasi);
      res.redirect("/cms/laporan-donasi");
    } catch (error) {
      console.error("Gagal menambah donasi:", error);
      res.status(500).send("Gagal menambah donasi");
    }
  }
);

// Hapus file ini, semua integrasi donasi sudah di /cms dan api-donasi.js

module.exports = router;
