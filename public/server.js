const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware untuk file statis
app.use(express.static('public'));

// Jalankan Server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
