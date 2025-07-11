const express = require('express');
const router = express.Router();
const { renderInvoicePage } = require('../controllers/invoiceController');

// Route to render the invoice table
router.get('/invoices', renderInvoicePage);

module.exports = router;