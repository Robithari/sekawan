const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const inventarisModel = require("../models/inventarisModel");

// GET semua inventaris (JSON)
router.get("/api/inventaris", async (req, res) => {
  try {
    const data = await inventarisModel.getAllInventaris();
    res.json({ success: true, data });
  } catch (error) {
    res.json({ success: false, message: "Gagal mengambil data inventaris" });
  }
});

// POST tambah inventaris
router.post(
  "/api/inventaris",
  [
    body("namaBarang")
      .trim()
      .notEmpty()
      .withMessage("Nama barang wajib diisi")
      .escape(),
    body("jumlah")
      .isInt({ min: 1 })
      .withMessage("Jumlah harus minimal 1")
      .toInt(),
    body("keterangan").optional().trim().escape(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validasi gagal",
          errors: errors.array(),
        });
      }

      const {
        namaBarang,
        merkBarang,
        jumlah,
        kode,
        kondisiBaik,
        kondisiBuruk,
        keterangan,
        tanggal,
      } = req.body;
      const newInventaris = {
        namaBarang,
        merkBarang,
        jumlah: parseInt(jumlah, 10),
        kode,
        kondisiBaik: parseInt(kondisiBaik, 10) || 0,
        kondisiBuruk: parseInt(kondisiBuruk, 10) || 0,
        keterangan: keterangan || "",
        tanggal,
      };
      const result = await inventarisModel.addInventaris(newInventaris);
      res.json({ success: true, data: result });
    } catch (error) {
      res.json({ success: false, message: "Gagal menambah inventaris" });
    }
  }
);

// PUT update inventaris
router.put("/api/inventaris/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      namaBarang,
      merkBarang,
      jumlah,
      kode,
      kondisiBaik,
      kondisiBuruk,
      keterangan,
      tanggal,
    } = req.body;
    if (!namaBarang || !merkBarang || !jumlah || !kode || !tanggal) {
      return res.json({ success: false, message: "Semua field wajib diisi." });
    }
    const update = {
      namaBarang,
      merkBarang,
      jumlah: parseInt(jumlah, 10),
      kode,
      kondisiBaik: parseInt(kondisiBaik, 10) || 0,
      kondisiBuruk: parseInt(kondisiBuruk, 10) || 0,
      keterangan: keterangan || "",
      tanggal,
    };
    await inventarisModel.updateInventaris(id, update);
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: "Gagal update inventaris" });
  }
});

// DELETE inventaris
router.delete("/api/inventaris/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await inventarisModel.deleteInventaris(id);
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: "Gagal hapus inventaris" });
  }
});

module.exports = router;
