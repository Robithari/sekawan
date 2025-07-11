// Mengimpor modul-modul yang diperlukan
const express = require("express"); // Framework web untuk Node.js
// ...existing code...

// Route untuk histori notifikasi user (public API untuk frontend user)
// (DIPINDAH KE BAWAH SETELAH app dideklarasi)
// ...existing code...
// Setelah semua app.use(middleware) dan sebelum route utama



// ...existing code...
// ...existing code...
// Setelah semua app.use(middleware) dan sebelum route utama
// (PASTIKAN INI DITARUH SETELAH const app = express() DAN SEMUA app.use(middleware) LAIN)
// Akan dipanggil di bawah setelah deklarasi app dan middleware
const dotenv = require("dotenv"); // Untuk memuat variabel lingkungan dari file .env
const cors = require("cors"); // Middleware untuk mengatur akses lintas domain (CORS)
const morgan = require("morgan"); // Middleware untuk logging HTTP request
const path = require("path"); // Modul untuk mengelola path file dan direktori
const xml = require("xml"); // Modul untuk menghasilkan XML (digunakan untuk sitemap)
const cookieParser = require("cookie-parser"); // Middleware untuk parsing cookie
const csurf = require('csurf'); // Middleware untuk proteksi CSRF

// Mengimpor konfigurasi Firebase untuk mengakses Firestore
const db = require("./config/firebase");

// Mengimpor controller untuk berbagai halaman
const kasController = require("./controllers/kasController");
const inventarisController = require("./controllers/inventarisController");
const jadwalController = require("./controllers/jadwalController");
const cmsController = require("./controllers/cmsController");
const indexController = require("./controllers/indexController");
const profilController = require("./controllers/profilController");
const rangkumanBeritaController = require("./controllers/rangkumanBeritaController");
const rangkumanArtikelController = require("./controllers/rangkumanArtikelController");
// const loginCmsController = require("./controllers/loginCmsController");
// const dataIuranController = require("./controllers/dataIuranController");
const loginCmsController = require("./controllers/loginCmsController");

// Middleware autentikasi untuk proteksi route CMS
const authMiddleware = require('./middleware/auth');

// Memuat variabel lingkungan dari file .env
dotenv.config();

// Membuat instance aplikasi Express
const app = express();

// Mengatur trust proxy agar express-rate-limit dapat membaca header X-Forwarded-For dengan benar
app.set('trust proxy', 1);

// Middleware global untuk menangani request
const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

app.use(cors()); // Mengizinkan akses lintas domain
app.use(morgan("dev", {
  skip: function (req, res) {
    return req.path === '/.well-known/appspecific/com.chrome.devtools.json';
  }
})); // Logging request HTTP dengan format 'dev'
app.use(express.json()); // Parsing body request dengan format JSON
app.use(express.urlencoded({ extended: false })); // Parsing body request dengan format URL-encoded
app.use(cookieParser()); // Parsing cookie dari request

// Gunakan rate limiter untuk membatasi request
app.use(rateLimiter);

const cacheControl = require('./middleware/cacheControl');
app.use(cacheControl);

// Setup CSRF protection (gunakan cookie agar mudah integrasi dengan frontend EJS)
const csurfMiddleware = csurf({ cookie: true });
// Kecualikan endpoint FCM agar tidak terkena CSRF
app.use(function(req, res, next) {
  if (req.path === '/api/save-fcm-token' || 
      req.path === '/api/test-fcm-status' || 
      req.path === '/api/test-send-notification') {
    return next();
  } else {
    return csurfMiddleware(req, res, next);
  }
});
// Middleware untuk meng-handle error CSRF agar feedback jelas
app.use(function (err, req, res, next) {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);
  // CSRF token mismatch
  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    return res.status(403).json({ success: false, message: 'CSRF token tidak valid. Silakan refresh halaman.' });
  }
  res.status(403).send('CSRF token tidak valid. Silakan refresh halaman.');
});

// Menetapkan EJS sebagai view engine untuk rendering halaman HTML
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Sitemap dinamis sesuai standar Google
const sitemapRoute = require('./routes/sitemap');
app.use(sitemapRoute);

// Menentukan direktori public untuk file statis (CSS, JS, gambar, dll)
app.use(express.static(path.join(__dirname, "public")));

// Definisi route dengan Server-Side Rendering (SSR)

// Middleware autentikasi untuk user biasa
const authUserMiddleware = require('./middleware/authUser');

// Halaman Kas dengan proteksi autentikasi user biasa
app.get("/kas", /*authUserMiddleware,*/ kasController.renderKasPage);

// Halaman Jadwal Pertandingan
app.get("/jadwal", jadwalController.renderJadwalPage);

// Halaman Profil
app.get("/profil", profilController.renderProfilPage);

// Halaman Login CMS
app.get("/login-cms", loginCmsController.renderLoginPage);

// Halaman Login Pengunjung
app.get("/login", (req, res) => {
    const footerData = {
        email: "admin@sekawanfc.com",
        telephone: "+62 813 363 06253"
    };
    res.render("login", { footerData });
});

// Halaman CMS dengan proteksi autentikasi
app.get("/cms", authMiddleware, cmsController.renderCmsPage);


// Halaman Inventaris
app.get("/inventaris", inventarisController.renderInventarisPage);

// Halaman Utama (Homepage)
app.get("/", indexController.renderHomePage);

// Halaman Rangkuman Berita
app.get("/rangkuman-berita", rangkumanBeritaController.renderRangkumanBeritaPage);



// Halaman Rangkuman Artikel
app.get("/rangkuman-artikel", rangkumanArtikelController.renderRangkumanArtikelPage);

const dataIuranController = require("./controllers/dataIuranController");

const dataDonasiController = require("./controllers/dataDonasiController");

// Halaman Data Iuran
app.get("/data-iuran", dataIuranController.renderDataIuranPage);

// Halaman Data Donasi
app.get("/data-donasi", dataDonasiController.renderDataDonasiPage);

app.get("/pembayaran", (req, res) => {
    const footerData = {
        email: "admin@sekawanfc.com",
        telephone: "+62 813 363 06253"
    };
    res.render("pembayaran", { footerData });
});



// Menggunakan route API
const apiRoutes = require("./routes/api");
const articleRoutes = require("./routes/articles");
const beritaRoutes = require("./routes/berita");

const cmsUserRoutes = require("./routes/cms-user");
const cmsNotifikasiRoutes = require("./routes/cms-notifikasi");

app.use(cmsUserRoutes);
app.use('/cms', cmsNotifikasiRoutes);

const cmsLaporanDonasiRoutes = require("./routes/cms-laporan-donasi");
app.use(cmsLaporanDonasiRoutes);

const apiDonasiRoutes = require("./routes/api-donasi");
app.use(apiDonasiRoutes);

const apiInventarisRoutes = require("./routes/api-inventaris");
app.use(apiInventarisRoutes);

// Aktifkan endpoint dokumentasi Firestore
const apiDokumentasiRouter = require('./routes/api-dokumentasi');
app.use('/api/dokumentasi', apiDokumentasiRouter);

// Aktifkan semua endpoint API utama (termasuk /api/save-fcm-token)
app.use('/api', apiRoutes);

// Debug route untuk development dan testing
try {
  const debugRoutes = require('./routes/debug');
  app.use('/api', debugRoutes);
  console.log('✅ Debug routes loaded');
} catch (err) {
  console.warn('⚠️ Debug routes not loaded:', err.message);
}

try {
  const testFcmRoutes = require('./routes/test-fcm');
  app.use('/api', testFcmRoutes);
  console.log('✅ Test FCM routes loaded');
} catch (err) {
  console.warn('⚠️ Test FCM routes not loaded:', err.message);
}

// Setelah semua app.use(middleware) dan sebelum route utama
// Pilih API histori notifikasi user: Firestore di production/serverless, file JSON di dev/local
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1' || process.env.SERVERLESS === '1';
if (isProduction) {
  const apiUserNotifikasiFirestore = require('./routes/api-user-notifikasi-firestore');
  app.use('/api', apiUserNotifikasiFirestore);
} else {
  const apiUserNotifikasi = require('./routes/api-user-notifikasi');
  app.use('/api', apiUserNotifikasi);
}

// Mengecek koneksi ke Firestore
if (db) {
  console.log("Koneksi ke Firestore berhasil.");
} else {
  console.error("Koneksi ke Firestore gagal.");
}

// Endpoint untuk menyimpan Firebase ID token di cookie __session
app.post('/set-token-cookie', express.json(), (req, res) => {
  res.status(404).send('Not Found');
});

// Endpoint untuk save FCM token
const fcmController = require('./controllers/fcm');
app.post('/api/save-fcm-token', express.json(), fcmController.saveFcmToken);

// Simple test endpoints untuk debugging FCM
app.get('/api/test-fcm-status', async (req, res) => {
  try {
    const admin = require('firebase-admin');
    const status = {
      timestamp: new Date().toISOString(),
      firebaseInitialized: admin.apps.length > 0,
      firestoreConnected: false,
      usersCount: 0,
      tokensCount: 0
    };

    // Test Firestore connection
    try {
      await db.collection('test').doc('status').set({ timestamp: Date.now() }, { merge: true });
      status.firestoreConnected = true;
    } catch (err) {
      status.firestoreError = err.message;
    }

    // Count users and tokens
    try {
      const usersSnapshot = await db.collection('users').get();
      status.usersCount = usersSnapshot.size;
      
      let tokensCount = 0;
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        if (Array.isArray(userData.fcmTokens)) {
          tokensCount += userData.fcmTokens.length;
        } else if (userData.fcmToken) {
          tokensCount += 1;
        }
      });
      status.tokensCount = tokensCount;
    } catch (err) {
      status.userCountError = err.message;
    }

    res.json(status);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/test-send-notification', express.json(), async (req, res) => {
  console.log('🔥🔥🔥 [VERCEL-LOG] TEST-SEND-NOTIFICATION ENDPOINT HIT 🔥🔥🔥');
  console.log('[VERCEL-LOG] Request body:', req.body);
  console.log('[VERCEL-LOG] Timestamp:', new Date().toISOString());
  
  try {
    const { title, body, useCurrentToken, directToken } = req.body;
    
    if (!title || !body) {
      console.log('[VERCEL-LOG] ❌ Missing title or body');
      return res.status(400).json({ 
        success: false, 
        message: 'Title and body required' 
      });
    }

    let allTokens = [];

    // PATCH: Mode test dengan token langsung (tanpa database)
    if (directToken) {
      console.log('[VERCEL-LOG] 🎯 Using direct token mode');
      console.log('[VERCEL-LOG] Direct token preview:', directToken.substring(0, 50) + '...');
      allTokens = [directToken];
    } else if (useCurrentToken) {
      // Gunakan hanya token yang baru dibuat (debugging purpose)
      console.log('[VERCEL-LOG] Using only recently created tokens...');
      const usersSnapshot = await db.collection('users').get();
      
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        if (Array.isArray(userData.fcmTokens)) {
          // Ambil token terakhir (yang paling baru)
          const latestToken = userData.fcmTokens[userData.fcmTokens.length - 1];
          if (latestToken) allTokens.push(latestToken);
        }
      });
    } else {
      // Ambil semua FCM tokens dari database
      console.log('[VERCEL-LOG] Fetching all tokens from database...');
      const usersSnapshot = await db.collection('users').get();
      
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        if (Array.isArray(userData.fcmTokens)) {
          allTokens.push(...userData.fcmTokens);
        } else if (userData.fcmToken) {
          allTokens.push(userData.fcmToken);
        }
      });
    }

    console.log(`[VERCEL-LOG] Found ${allTokens.length} FCM tokens total`);

    if (allTokens.length === 0) {
      console.log('[VERCEL-LOG] ❌ No tokens found');
      return res.json({
        success: false,
        message: 'No FCM tokens found in database'
      });
    }

    console.log('[VERCEL-LOG] 🚀 About to call sendFCMToToken...');
    console.log('[VERCEL-LOG] FCM function start timestamp:', new Date().toISOString());
    
    // Kirim notifikasi menggunakan fcm controller
    const result = await fcmController.sendFCMToToken(allTokens, title, body);
    
    console.log('[VERCEL-LOG] FCM function end timestamp:', new Date().toISOString());
    console.log(`[VERCEL-LOG] 📊 FCM Send Result:`, {
      totalTokens: allTokens.length,
      successCount: result.successCount,
      failureCount: result.failureCount,
      responses: result.responses.map(r => ({
        success: r.success,
        errorMessage: r.errorMessage || null,
        messageId: r.messageId || null
      }))
    });
    
    res.json({
      success: true,
      message: 'Test notification sent',
      result: {
        totalTokens: allTokens.length,
        successCount: result.successCount,
        failureCount: result.failureCount,
        details: result.responses
      }
    });

  } catch (error) {
    console.error('[VERCEL-LOG] ❌ Error in test-send-notification:', error);
    console.error('[VERCEL-LOG] Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack
    });
  }
});

// Menjalankan server pada mode pengembangan
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}


// Route untuk halaman notifikasi user (public, render EJS) -- HARUS sebelum error handler!
app.get('/notifikasi', (req, res) => {
  res.render('notifikasi');
});

// Aktifkan route href agar halaman /dokumentasi dan lain-lain bisa diakses
const hrefRoutes = require('./routes/href');
app.use(hrefRoutes);

// Menangani error global (middleware error handler)
app.use(errorHandler);

// Menangani route yang tidak ditemukan (404)
const { renderNotFoundPage } = require('./controllers/errorController');
app.use(renderNotFoundPage);

// Tambahkan Content Security Policy (CSP) header untuk mencegah XSS dan inline script/style
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' https://cdn.jsdelivr.net https://www.googletagmanager.com 'unsafe-inline'",
      "style-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'",
      "img-src 'self' data: https://cdn.jsdelivr.net https://w7.pngwing.com https://cdn.pixabay.com https://www.googletagmanager.com",
      "font-src 'self' https://cdn.jsdelivr.net",
      "connect-src 'self' https://www.googletagmanager.com https://www.gstatic.com https://firestore.googleapis.com",
      "frame-src 'self'",
      "object-src 'none'",
      "base-uri 'self'"
    ].join('; ')
  );

  next();
});

// Mengekspor aplikasi untuk digunakan pada platform lain (misalnya Vercel)
module.exports = app;
