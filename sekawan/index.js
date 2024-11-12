// index.js

require('dotenv').config(); // Memuat variabel lingkungan dari .env

const app = require('./api/server'); // Mengimpor aplikasi Express dari server.js
const PORT = process.env.PORT || 3000; // Mendefinisikan port yang akan digunakan

// Memulai server dan mendengarkan pada port yang ditentukan
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

