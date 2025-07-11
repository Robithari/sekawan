// Dokumentasi Section CMS
// Dokumentasi Section CMS - Perbaikan total render, fetch, dan UX agar selalu sinkron dengan Firestore
document.addEventListener('DOMContentLoaded', function () {
  // Notifikasi sukses
  const notifBox = document.createElement('div');
  notifBox.className = 'alert alert-success d-none';
  notifBox.id = 'dokumentasi-success';
  notifBox.style.position = 'fixed';
  notifBox.style.top = '80px';
  notifBox.style.right = '30px';
  notifBox.style.zIndex = '9999';
  notifBox.style.minWidth = '200px';
  notifBox.innerText = 'Dokumentasi berhasil disimpan!';
  document.body.appendChild(notifBox);
  const section = document.getElementById('dokumentasi-section');
  if (!section) return;

  const form = section.querySelector('#formDokumentasi');
  const tableBody = section.querySelector('#dokumentasi-tbody');
  const errorBox = section.querySelector('#dokumentasi-error');
  const inputId = document.getElementById('dokumentasi-id');
  const inputKeterangan = document.getElementById('dokumentasi-keterangan');
  const inputLinkFoto = document.getElementById('dokumentasi-link-foto');

  // Helper untuk menambah header CSRF ke setiap fetch
  function csrfFetch(url, options = {}) {
    options.headers = options.headers || {};
    if (window.CSRF_TOKEN) {
      options.headers['X-CSRF-Token'] = window.CSRF_TOKEN;
    }
    return fetch(url, options);
  }

  // Loading indicator
  function showLoading(msg = 'Loading...') {
    tableBody.innerHTML = `<tr><td colspan="4" class="text-center">${msg}</td></tr>`;
  }

  // Load data dokumentasi (selalu fresh, urut terbaru)
  // Optimized: cache data in memory for fast search/filter, but always fetch fresh on CRUD
  let dokumentasiCache = null;
  let lastFetchTime = 0;
  const CACHE_TTL = 10000; // 10 detik cache untuk search/filter, fetch fresh on CRUD

  async function loadDokumentasi(force = false) {
    // Gunakan cache jika tidak force dan data masih fresh
    if (!force && dokumentasiCache && (Date.now() - lastFetchTime < CACHE_TTL)) {
      renderDokumentasiTable(dokumentasiCache);
      return;
    }
    showLoading('Memuat data...');
    try {
      const res = await csrfFetch('/api/dokumentasi?_=' + Date.now());
      const data = await res.json();
      // Urutkan data terbaru di atas (by createdAt/updatedAt jika ada)
      data.sort((a, b) => {
        const tA = new Date(b.updatedAt || b.createdAt || b.tanggal || 0).getTime();
        const tB = new Date(a.updatedAt || a.createdAt || a.tanggal || 0).getTime();
        return tA - tB;
      });
      dokumentasiCache = data;
      lastFetchTime = Date.now();
      window._dokumentasiData = data;
      renderDokumentasiTable(data);
    } catch (err) {
      showLoading('Gagal memuat data');
    }
  }

  // Render table dokumentasi (fresh dari data argumen)
  function renderDokumentasiTable(data) {
    tableBody.innerHTML = '';
    if (!data || !data.length) {
      tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Belum ada data dokumentasi</td></tr>';
      return;
    }
    data.forEach((item, idx) => {
      const id = item.id || '';
      const fotoUrl = item['LINK FOTO'] || item['link_foto'] || '';
      const fotoLink = fotoUrl ? `<a href="${fotoUrl}" target="_blank" rel="noopener noreferrer">Klik di sini</a>` : '-';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input type="checkbox" class="dokumentasi-row-check" value="${id}" aria-label="Centang Dokumentasi"></td>
        <td>${idx + 1}</td>
        <td>${item.keterangan || '-'}</td>
        <td>${fotoLink}</td>
        <td>
          <button type="button" class="btn btn-warning btn-sm dokumentasi-edit-btn" data-id="${id}"><i class="bi bi-pencil"></i></button>
          <button type="button" class="btn btn-danger btn-sm dokumentasi-delete-btn" data-id="${id}"><i class="bi bi-trash"></i></button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
    // Tambah event handler centang & hapus massal
    const section = document.getElementById('dokumentasi-section');
    if (!section) return;
    const checkAll = section.querySelector('#dokumentasi-check-all');
    const bulkBtn = section.querySelector('#dokumentasi-bulk-delete-btn');
    if (checkAll) {
      checkAll.onclick = function() {
        const checked = checkAll.checked;
        section.querySelectorAll('.dokumentasi-row-check').forEach(cb => { cb.checked = checked; });
        toggleBulkDeleteBtn();
      };
    }
    section.querySelectorAll('.dokumentasi-row-check').forEach(cb => {
      cb.onchange = function() {
        const all = section.querySelectorAll('.dokumentasi-row-check');
        const checked = section.querySelectorAll('.dokumentasi-row-check:checked');
        if (checkAll) checkAll.checked = all.length === checked.length;
        toggleBulkDeleteBtn();
      };
    });
    function toggleBulkDeleteBtn() {
      if (bulkBtn) bulkBtn.classList.toggle('d-none', section.querySelectorAll('.dokumentasi-row-check:checked').length === 0);
    }
    if (bulkBtn) {
      bulkBtn.onclick = async function() {
        const checked = Array.from(section.querySelectorAll('.dokumentasi-row-check:checked')).map(cb => cb.value);
        if (!checked.length) return;
        if (!confirm('Yakin ingin menghapus data terpilih?')) return;
        bulkBtn.disabled = true; bulkBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Menghapus...';
        try {
          for (const id of checked) {
            await csrfFetch(`/api/dokumentasi/${id}`, { method: 'DELETE' });
          }
          bulkBtn.innerHTML = '<i class="bi bi-trash"></i> Hapus Terpilih';
          bulkBtn.disabled = false;
          alert('Data berhasil dihapus!');
          location.reload();
        } catch (err) {
          bulkBtn.innerHTML = '<i class="bi bi-trash"></i> Hapus Terpilih';
          bulkBtn.disabled = false;
          alert('Gagal menghapus data!');
        }
      };
    }
  }

  // Reset form ke mode tambah
  function resetForm() {
    if (form) form.reset();
    if (inputId) inputId.value = '';
    document.getElementById('dokumentasi-submit-btn').textContent = 'Tambah Dokumentasi';
    document.getElementById('form-title-dokumentasi').textContent = 'Laporan Dokumentasi';
    document.getElementById('dokumentasi-cancel-edit').classList.add('d-none');
    document.getElementById('dokumentasi-foto-preview') && (document.getElementById('dokumentasi-foto-preview').innerHTML = '');
    errorBox.classList.add('d-none');
  }

  // Form submit (tambah/update)
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      errorBox.classList.add('d-none');
      // Validasi manual agar tidak undefined
      const keterangan = inputKeterangan ? inputKeterangan.value.trim() : '';
      const link_foto = inputLinkFoto ? inputLinkFoto.value.trim() : '';
      if (!keterangan || !link_foto) {
        errorBox.textContent = 'Keterangan dan Link Foto wajib diisi.';
        errorBox.classList.remove('d-none');
        return;
      }
      const formData = new FormData();
      formData.append('keterangan', keterangan);
      formData.append('link_foto', link_foto);
      const id = inputId ? inputId.value : '';
      let url = '/api/dokumentasi', method = 'POST';
      if (id) {
        url += '/' + id;
        method = 'PUT';
      }
      try {
        showLoading(id ? 'Menyimpan perubahan...' : 'Menyimpan data...');
        const res = await csrfFetch(url, { method, body: formData });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Gagal menyimpan');
        resetForm();
        notifBox.innerText = result.message || 'Dokumentasi berhasil disimpan!';
        notifBox.classList.remove('d-none');
        setTimeout(() => notifBox.classList.add('d-none'), 2000);
        await loadDokumentasi(true); // force fresh fetch after CRUD
      } catch (err) {
        errorBox.textContent = err.message;
        errorBox.classList.remove('d-none');
        await loadDokumentasi(true);
      }
    });
  }


  // Edit & Delete
  tableBody.addEventListener('click', async function(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    const data = (window._dokumentasiData || []).find(d => d.id == id);
    if (btn.classList.contains('dokumentasi-edit-btn')) {
      if (inputId) inputId.value = data.id;
      if (inputKeterangan) inputKeterangan.value = data.keterangan || '';
      if (inputLinkFoto) inputLinkFoto.value = data['LINK FOTO'] || '';
      document.getElementById('dokumentasi-submit-btn').textContent = 'Update Dokumentasi';
      document.getElementById('form-title-dokumentasi').textContent = 'Edit Dokumentasi';
      document.getElementById('dokumentasi-cancel-edit').classList.remove('d-none');
      errorBox.classList.add('d-none');
    }
    if (btn.classList.contains('dokumentasi-delete-btn')) {
      if (!confirm('Yakin ingin menghapus dokumentasi ini?')) return;
      try {
        showLoading('Menghapus data...');
        const res = await csrfFetch('/api/dokumentasi/' + id, { method: 'DELETE' });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Gagal menghapus');
        resetForm();
        notifBox.innerText = result.message || 'Dokumentasi berhasil dihapus!';
        notifBox.classList.remove('d-none');
        setTimeout(() => notifBox.classList.add('d-none'), 2000);
        await loadDokumentasi(true);
      } catch (err) {
        errorBox.textContent = err.message;
        errorBox.classList.remove('d-none');
        await loadDokumentasi(true);
      }
    }
  });


  // Cancel edit
  document.getElementById('dokumentasi-cancel-edit').addEventListener('click', function() {
    resetForm();
    // Tampilkan data dari cache tanpa reload/fetch ulang, agar UX instan seperti iuran
    if (dokumentasiCache) {
      renderDokumentasiTable(dokumentasiCache);
    } else {
      loadDokumentasi();
    }
  });


  // Search
  // Debounce search agar tidak render tabel setiap ketik karakter
  let searchTimeout = null;
  document.getElementById('dokumentasi-search').addEventListener('input', function() {
    clearTimeout(searchTimeout);
    const q = this.value.trim().toLowerCase();
    searchTimeout = setTimeout(() => {
      const data = dokumentasiCache || window._dokumentasiData || [];
      if (!q) return renderDokumentasiTable(data);
      const filtered = data.filter(item =>
        (item.keterangan || '').toLowerCase().includes(q)
      );
      renderDokumentasiTable(filtered);
    }, 200);
  });


  // Inisialisasi
  resetForm();
  loadDokumentasi();
});
