const csurf = require('csurf');

// CSRF protection untuk route yang memerlukan autentikasi
const csrfProtection = csurf({ cookie: true });

// Middleware untuk mengecek apakah request memerlukan CSRF
const conditionalCSRF = (req, res, next) => {
  // Skip CSRF untuk GET request ke endpoint publik
  if (req.method === 'GET') {
    // Daftar endpoint publik yang tidak memerlukan CSRF
    const publicEndpoints = [
      '/api/dokumentasi',
      '/api/posts',
      '/api/users',
      '/api/kas',
      '/api/jadwal',
      '/api/profil',
      '/api/berita',
      '/api/artikel',
      '/api/donasi',
      '/api/iuran',
      '/api/inventaris'
    ];
    
    if (publicEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
      return next();
    }
  }
  
  // Gunakan CSRF untuk semua request lainnya (POST, PUT, DELETE)
  return csrfProtection(req, res, next);
};

module.exports = {
  csrfProtection,
  conditionalCSRF
};
