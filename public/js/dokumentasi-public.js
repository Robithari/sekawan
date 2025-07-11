// Dokumentasi publik - fetch data dari API dan render ke tabel
// File ini hanya untuk halaman publik /dokumentasi

document.addEventListener('DOMContentLoaded', function () {
  const tableBody = document.getElementById('dokumentasi-tbody');

  function showLoading(msg = 'Memuat data...') {
    if (tableBody) tableBody.innerHTML = `<tr><td colspan="3" class="text-center">${msg}</td></tr>`;
  }

  async function loadDokumentasi() {
    showLoading();
    try {
      const res = await fetch('/api/dokumentasi?_=' + Date.now());
      if (!res.ok) throw new Error('Gagal memuat data');
      const data = await res.json();
      renderTable(data);
    } catch (err) {
      showLoading('Gagal memuat data');
    }
  }

  function renderTable(data) {
    if (!tableBody) return;
    tableBody.innerHTML = '';
    if (!data || !data.length) {
      tableBody.innerHTML = '<tr><td colspan="3" class="text-center">Belum ada data dokumentasi</td></tr>';
      return;
    }
    data.forEach((item, idx) => {
      const fotoUrl = item['LINK FOTO'] || item['link_foto'] || '';
      const fotoLink = fotoUrl ? `<a href="${fotoUrl}" target="_blank" rel="noopener noreferrer">Klik di sini</a>` : '-';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${item.keterangan || '-'}</td>
        <td>${fotoLink}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  loadDokumentasi();
});
