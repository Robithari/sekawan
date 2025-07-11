// inventaris-selection.js
// Modul manajemen inventaris untuk CMS, mirip iuran/donasi-selection.js

const inventarisApiUrl = "/api/inventaris";
let inventarisSection = document.getElementById("laporan-inventaris-section");

function renderInventarisTable(data) {
    data = [...data].sort((a, b) => (a.namaBarang || '').localeCompare(b.namaBarang || ''));
    let html = `<div class="table-responsive">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <button id="inventaris-bulk-delete-btn" class="btn btn-danger btn-sm d-none"><i class="bi bi-trash"></i> Hapus Terpilih</button>
      </div>
      <table class="table table-bordered table-hover table-striped align-middle inventaris-table">
        <thead class="table-light sticky-top">
          <tr>
            <th style="width:40px;"><input type="checkbox" id="inventaris-check-all" aria-label="Centang Semua Inventaris"></th>
            <th scope="col">No.</th>
            <th scope="col">Nama Barang</th>
            <th scope="col">Merk</th>
            <th scope="col">Jumlah</th>
            <th scope="col">Kode</th>
            <th scope="col">Kondisi Baik</th>
            <th scope="col">Kondisi Buruk</th>
            <th scope="col">Keterangan</th>
            <th scope="col">Tanggal</th>
            <th scope="col">Aksi</th>
          </tr>
        </thead>
        <tbody>`;
    if (!data.length) {
        html += `<tr><td colspan="11" class="text-center">Belum ada data inventaris.</td></tr>`;
    } else {
        data.forEach((item, idx) => {
            html += `<tr>
                <td><input type="checkbox" class="inventaris-row-check" value="${item.id}" aria-label="Centang Inventaris"></td>
                <td>${idx + 1}</td>
                <td>${item.namaBarang || '-'}</td>
                <td>${item.merkBarang || '-'}</td>
                <td>${item.jumlah || '-'}</td>
                <td>${item.kode || '-'}</td>
                <td>${item.kondisiBaik || '-'}</td>
                <td>${item.kondisiBuruk || '-'}</td>
                <td>${item.keterangan || '-'}</td>
                <td>${item.tanggal || '-'}</td>
                <td>
                    <button class="btn btn-warning btn-sm edit-inventaris-btn d-inline-flex align-items-center gap-1" data-id="${item.id}" aria-label="Edit Inventaris"><i class="bi bi-pencil"></i> <span class="d-none d-md-inline">Edit</span></button>
                    <button class="btn btn-danger btn-sm delete-inventaris-btn d-inline-flex align-items-center gap-1" data-id="${item.id}" aria-label="Hapus Inventaris"><i class="bi bi-trash"></i> <span class="d-none d-md-inline">Hapus</span></button>
                </td>
            </tr>`;
        });
    }
    html += `</tbody></table></div>`;
    return html;
}

// Event handler centang & hapus massal
document.addEventListener('DOMContentLoaded', function () {
  const section = document.getElementById('laporan-inventaris-section');
  if (!section) return;
  section.addEventListener('change', function (e) {
    if (e.target && e.target.id === 'inventaris-check-all') {
      const checked = e.target.checked;
      section.querySelectorAll('.inventaris-row-check').forEach(cb => { cb.checked = checked; });
      toggleBulkDeleteBtn();
    } else if (e.target && e.target.classList.contains('inventaris-row-check')) {
      const all = section.querySelectorAll('.inventaris-row-check');
      const checked = section.querySelectorAll('.inventaris-row-check:checked');
      const checkAll = section.querySelector('#inventaris-check-all');
      if (checkAll) checkAll.checked = all.length === checked.length;
      toggleBulkDeleteBtn();
    }
  });

  function toggleBulkDeleteBtn() {
    const btn = section.querySelector('#inventaris-bulk-delete-btn');
    const checked = section.querySelectorAll('.inventaris-row-check:checked');
    if (btn) btn.classList.toggle('d-none', checked.length === 0);
  }

  section.addEventListener('click', async function (e) {
    if (e.target && (e.target.id === 'inventaris-bulk-delete-btn' || e.target.closest('#inventaris-bulk-delete-btn'))) {
      const checked = Array.from(section.querySelectorAll('.inventaris-row-check:checked')).map(cb => cb.value);
      if (!checked.length) return;
      if (!confirm('Yakin ingin menghapus data terpilih?')) return;
      // Spinner
      const btn = section.querySelector('#inventaris-bulk-delete-btn');
      btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Menghapus...';
      try {
        for (const id of checked) {
          await fetch(`${inventarisApiUrl}/${id}`, { method: 'DELETE', headers: { 'X-CSRF-Token': window.CSRF_TOKEN || '' } });
        }
        btn.innerHTML = '<i class="bi bi-trash"></i> Hapus Terpilih';
        btn.disabled = false;
        alert('Data berhasil dihapus!');
        location.reload();
      } catch (err) {
        btn.innerHTML = '<i class="bi bi-trash"></i> Hapus Terpilih';
        btn.disabled = false;
        alert('Gagal menghapus data!');
      }
    }
  });
});

function renderTotalRow(data) {
    const totalJumlah = data.reduce((sum, item) => sum + (parseInt(item.jumlah) || 0), 0);
    const totalBaik = data.reduce((sum, item) => sum + (parseInt(item.kondisiBaik) || 0), 0);
    const totalBuruk = data.reduce((sum, item) => sum + (parseInt(item.kondisiBuruk) || 0), 0);
    return `<tr class="table-success fw-bold">
        <td colspan="3">TOTAL</td>
        <td>${totalJumlah}</td>
        <td></td>
        <td>${totalBaik}</td>
        <td>${totalBuruk}</td>
        <td colspan="3"></td>
    </tr>`;
}

function renderInventarisForm(editData = null) {
    let tanggalValue = '';
    if (editData && editData.tanggal) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(editData.tanggal)) {
            tanggalValue = editData.tanggal;
        } else if (/^\d{2}-\d{2}-\d{4}$/.test(editData.tanggal)) {
            const [d, m, y] = editData.tanggal.split('-');
            tanggalValue = `${y}-${m}-${d}`;
        }
    }
    return `<form id="inventarisForm" class="row g-2 align-items-end mb-3 needs-validation" novalidate>
        <div class="col-md-2 col-12">
            <label class="form-label" for="namaBarang">Nama Barang</label>
            <input type="text" class="form-control" id="namaBarang" value="${editData ? editData.namaBarang : ''}" required placeholder="Nama Barang" aria-label="Nama Barang">
            <div class="invalid-feedback">Nama barang wajib diisi.</div>
        </div>
        <div class="col-md-2 col-6">
            <label class="form-label" for="merkBarang">Merk</label>
            <input type="text" class="form-control" id="merkBarang" value="${editData ? editData.merkBarang : ''}" required placeholder="Merk" aria-label="Merk Barang">
            <div class="invalid-feedback">Merk wajib diisi.</div>
        </div>
        <div class="col-md-1 col-6">
            <label class="form-label" for="jumlah">Jumlah</label>
            <input type="number" class="form-control" id="jumlah" value="${editData ? editData.jumlah : ''}" required min="1" placeholder="Jumlah" aria-label="Jumlah">
            <div class="invalid-feedback">Jumlah wajib diisi dan lebih dari 0.</div>
        </div>
        <div class="col-md-1 col-6">
            <label class="form-label" for="kode">Kode</label>
            <input type="text" class="form-control" id="kode" value="${editData ? editData.kode : ''}" required placeholder="Kode" aria-label="Kode Barang">
            <div class="invalid-feedback">Kode wajib diisi.</div>
        </div>
        <div class="col-md-1 col-6">
            <label class="form-label" for="kondisiBaik">Kondisi Baik</label>
            <input type="number" class="form-control" id="kondisiBaik" value="${editData ? editData.kondisiBaik : ''}" required min="0" placeholder="Baik" aria-label="Kondisi Baik">
            <div class="invalid-feedback">Kondisi baik wajib diisi.</div>
        </div>
        <div class="col-md-1 col-6">
            <label class="form-label" for="kondisiBuruk">Kondisi Buruk</label>
            <input type="number" class="form-control" id="kondisiBuruk" value="${editData ? editData.kondisiBuruk : ''}" required min="0" placeholder="Buruk" aria-label="Kondisi Buruk">
            <div class="invalid-feedback">Kondisi buruk wajib diisi.</div>
        </div>
        <div class="col-md-2 col-12">
            <label class="form-label" for="keterangan">Keterangan</label>
            <input type="text" class="form-control" id="keterangan" value="${editData ? editData.keterangan : ''}" placeholder="Keterangan (opsional)" aria-label="Keterangan">
        </div>
        <div class="col-md-2 col-12">
            <label class="form-label" for="tanggal">Tanggal</label>
            <input type="date" class="form-control" id="tanggal" value="${tanggalValue}" required aria-label="Tanggal">
            <div class="invalid-feedback">Tanggal wajib diisi.</div>
        </div>
        <div class="col-md-1 col-12 d-flex flex-column gap-2">
            <button type="submit" class="btn btn-${editData ? 'success' : 'primary'} w-100 d-flex align-items-center justify-content-center gap-1">${editData ? '<i class="bi bi-check-circle"></i> Update' : '<i class="bi bi-plus-circle"></i> Tambah'}</button>
            ${editData ? '<button type="button" class="btn btn-secondary w-100 d-flex align-items-center justify-content-center gap-1 mt-1" id="inventarisCancelEdit"><i class="bi bi-x-circle"></i> Batal</button>' : ''}
        </div>
    </form>`;
}

function showInventarisMessage(msg, type = 'info') {
    let el = document.getElementById('inventarisMessage');
    if (!el) {
        el = document.createElement('div');
        el.id = 'inventarisMessage';
        document.getElementById('inventarisFormDiv').prepend(el);
    }
    el.className = `alert alert-${type} my-2`;
    el.textContent = msg;
    setTimeout(() => el.textContent = '', 4000);
}

async function fetchInventaris() {
    const listDiv = document.getElementById('inventarisList');
    listDiv.innerHTML = '<div class="text-center py-4"><span class="spinner-border"></span> Memuat data inventaris...</div>';
    try {
        const res = await fetch(inventarisApiUrl);
        const json = await res.json();
        if (json.success) {
            inventarisData = Array.isArray(json.data) ? json.data : [];
            let filtered = inventarisData;
            if (searchKeyword) {
                const q = searchKeyword.toLowerCase();
                filtered = inventarisData.filter(item =>
                    (item.namaBarang || '').toLowerCase().includes(q) ||
                    (item.merkBarang || '').toLowerCase().includes(q) ||
                    (item.kode || '').toLowerCase().includes(q) ||
                    (item.keterangan || '').toLowerCase().includes(q)
                );
            }
            listDiv.innerHTML = renderInventarisTable(filtered);
            attachInventarisEvents();
        } else {
            listDiv.innerHTML = '<div class="alert alert-danger">Gagal memuat data inventaris.</div>';
        }
    } catch (e) {
        listDiv.innerHTML = '<div class="alert alert-danger">Gagal memuat data inventaris.</div>';
    }
}

let inventarisData = [];
let searchKeyword = "";
let editData = null;

function renderInventarisPage() {
    document.getElementById('inventarisFormDiv').innerHTML = renderInventarisForm(editData);
    fetchInventaris();
}

function attachInventarisEvents() {
    document.getElementById('searchInventarisBtn').onclick = function() {
        searchKeyword = document.getElementById('searchInventarisInput').value.trim();
        fetchInventaris();
    };
    document.getElementById('resetInventarisBtn').onclick = function() {
        searchKeyword = "";
        fetchInventaris();
    };
    document.getElementById('inventarisForm').onsubmit = async function(e) {
        e.preventDefault();
        const form = document.getElementById('inventarisForm');
        const namaBarang = form.querySelector('#namaBarang').value.trim();
        const merkBarang = form.querySelector('#merkBarang').value.trim();
        const jumlah = form.querySelector('#jumlah').value.trim();
        const kode = form.querySelector('#kode').value.trim();
        const kondisiBaik = form.querySelector('#kondisiBaik').value.trim();
        const kondisiBuruk = form.querySelector('#kondisiBuruk').value.trim();
        const keterangan = form.querySelector('#keterangan').value.trim();
        const tanggalInput = form.querySelector('#tanggal');
        const tanggal = tanggalInput ? tanggalInput.value : '';
        console.log('[DEBUG] tanggal value:', tanggal, '| typeof:', typeof tanggal);
        // Reset error highlight
        [
            'namaBarang', 'merkBarang', 'jumlah', 'kode', 'kondisiBaik', 'kondisiBuruk', 'tanggal'
        ].forEach(id => {
            const el = form.querySelector('#' + id);
            if (el) el.classList.remove('is-invalid');
        });

        let errorMsg = '';
        if (!namaBarang) {
            errorMsg = 'Nama Barang wajib diisi.';
            form.querySelector('#namaBarang').classList.add('is-invalid');
        } else if (!merkBarang) {
            errorMsg = 'Merk wajib diisi.';
            form.querySelector('#merkBarang').classList.add('is-invalid');
        } else if (jumlah === '' || isNaN(Number(jumlah))) {
            errorMsg = 'Jumlah wajib diisi dan berupa angka.';
            form.querySelector('#jumlah').classList.add('is-invalid');
        } else if (!kode) {
            errorMsg = 'Kode wajib diisi.';
            form.querySelector('#kode').classList.add('is-invalid');
        } else if (kondisiBaik === '' || isNaN(Number(kondisiBaik))) {
            errorMsg = 'Kondisi Baik wajib diisi dan berupa angka.';
            form.querySelector('#kondisiBaik').classList.add('is-invalid');
        } else if (kondisiBuruk === '' || isNaN(Number(kondisiBuruk))) {
            errorMsg = 'Kondisi Buruk wajib diisi dan berupa angka.';
            form.querySelector('#kondisiBuruk').classList.add('is-invalid');
        } else if (!tanggal) {
            errorMsg = 'Tanggal wajib diisi.';
            if (tanggalInput) tanggalInput.classList.add('is-invalid');
        }
        if (errorMsg) {
            showInventarisMessage(errorMsg, 'danger');
            return;
        }
        const payload = {
            namaBarang,
            merkBarang,
            jumlah,
            kode,
            kondisiBaik,
            kondisiBuruk,
            keterangan,
            tanggal
        };
        try {
            let res, json;
            if (editData && editData.id) {
                res = await csrfFetch(`${inventarisApiUrl}/${editData.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                json = await res.json();
                if (json.success) {
                    showInventarisMessage('Data inventaris berhasil diupdate', 'success');
                } else {
                    showInventarisMessage('Gagal update data inventaris', 'danger');
                }
            } else {
                res = await csrfFetch(inventarisApiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                json = await res.json();
                if (json.success) {
                    showInventarisMessage('Data inventaris berhasil ditambahkan', 'success');
                } else {
                    showInventarisMessage('Gagal menambah data inventaris', 'danger');
                }
            }
        } catch {
            showInventarisMessage('Gagal menyimpan data inventaris', 'danger');
        }
        editData = null;
        renderInventarisPage();
    };
    document.querySelectorAll('.edit-inventaris-btn').forEach(btn => {
        btn.onclick = function() {
            const id = btn.getAttribute('data-id');
            editData = inventarisData.find(item => item.id === id);
            renderInventarisPage();
        };
    });
    document.querySelectorAll('.delete-inventaris-btn').forEach(btn => {
        btn.onclick = async function() {
            const id = btn.getAttribute('data-id');
            if (btn.disabled) return;
            if (confirm('Yakin ingin menghapus data inventaris ini? Data yang dihapus tidak dapat dikembalikan.')) {
                btn.disabled = true;
                const oldHtml = btn.innerHTML;
                btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
                try {
                    const res = await csrfFetch(`${inventarisApiUrl}/${id}`, { method: 'DELETE' });
                    const json = await res.json();
                    if (json.success) {
                        showInventarisMessage('Data inventaris berhasil dihapus', 'success');
                        renderInventarisPage();
                    } else {
                        showInventarisMessage('Gagal menghapus data inventaris', 'danger');
                    }
                } catch {
                    showInventarisMessage('Gagal menghapus data inventaris', 'danger');
                }
                btn.disabled = false;
                btn.innerHTML = oldHtml;
            }
        };
    });
    if (document.getElementById('inventarisCancelEdit')) {
        document.getElementById('inventarisCancelEdit').onclick = function() {
            editData = null;
            renderInventarisPage();
        };
    }
}

function renderSearchBarInventaris(keyword = "") {
    return `<div class="search-container mb-3">
        <div class="input-group">
            <input type="text" class="form-control search-input" id="searchInventarisInput" placeholder="Cari Nama Barang, Merk, Kode, Keterangan..." value="${keyword}">
            <button class="btn btn-primary" id="searchInventarisBtn">Cari</button>
            <button class="btn btn-secondary" id="resetInventarisBtn">Batal</button>
        </div>
    </div>`;
}

function initInventarisSection() {
    inventarisSection = document.getElementById("laporan-inventaris-section");
    if (!inventarisSection) {
        console.error("[inventaris-selection.js] laporan-inventaris-section not found in DOM");
        return;
    }
    try {
        inventarisSection.classList.remove('d-none');
        inventarisSection.innerHTML = `
            <h2 class="mb-3">Laporan Inventaris</h2>
            <div class="card mb-4 shadow-sm">
                <div class="card-body">
                    ${renderSearchBarInventaris(searchKeyword)}
                </div>
            </div>
            <div id="inventarisFormDiv" class="mb-4"></div>
            <div class="card shadow-sm">
                <div class="card-header bg-primary text-white fw-bold">Daftar Inventaris</div>
                <div class="card-body p-0">
                    <div id="inventarisList"></div>
                </div>
            </div>
        `;
        renderInventarisPage();
    } catch (err) {
        console.error('[inventaris-selection.js] Error initializing laporan-inventaris-section:', err);
        if (inventarisSection) inventarisSection.innerHTML = '<div class="alert alert-danger">Gagal memuat Laporan Inventaris. Cek konsol untuk detail.</div>';
    }
}

function csrfFetch(url, options = {}) {
    options.headers = options.headers || {};
    if (window.CSRF_TOKEN) {
        options.headers['X-CSRF-Token'] = window.CSRF_TOKEN;
    }
    return fetch(url, options);
}

document.addEventListener('DOMContentLoaded', initInventarisSection);
