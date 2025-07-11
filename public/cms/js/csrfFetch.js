// Helper fetch untuk AJAX dengan CSRF token otomatis
export default async function csrfFetch(url, options = {}) {
  options.headers = options.headers || {};
  // Ambil token dari window atau meta tag
  const csrfToken = window.CSRF_TOKEN || document.querySelector('meta[name="csrf-token"]')?.content;
  if (csrfToken) {
    options.headers['CSRF-Token'] = csrfToken;
  }
  // Pastikan credentials dikirim agar cookie session terbawa
  if (!options.credentials) {
    options.credentials = 'same-origin';
  }
  return fetch(url, options);
}
