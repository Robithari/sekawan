// Kas Management Module for CMS
// Professional, clean, and responsive

const kasApiUrl = "/api/kas";
let kasSection = document.getElementById("kas-section");

function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(angka);
}

function renderKasTable(data) {
    // Urutkan data descending tanggal
    data = [...data].sort((a, b) => {
        const ta = a.tanggal && a.tanggal._seconds ? a.tanggal._seconds : (a.tanggal ? new Date(a.tanggal).getTime()/1000 : 0);
        const tb = b.tanggal && b.tanggal._seconds ? b.tanggal._seconds : (b.tanggal ? new Date(b.tanggal).getTime()/1000 : 0);
        return tb - ta;
    });
    let saldo = 0;
    let html = `<div class="table-responsive">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <button id="kas-bulk-delete-btn" class="btn btn-danger btn-sm d-none"><i class="bi bi-trash"></i> Hapus Terpilih</button>
      </div>
      <table class="table table-bordered table-hover align-middle">
        <thead class="table-light">
          <tr>
            <th style="width:40px;"><input type="checkbox" id="kas-check-all" aria-label="Centang Semua Kas"></th>
            <th>Kode</th>
            <th>Tanggal</th>
            <th>Keterangan</th>
            <th>Pemasukan</th>
            <th>Pengeluaran</th>
            <th>Saldo/Sisa</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>`;
    if (!data.length) {
        html += `<tr><td colspan="8" class="text-center">Belum ada data kas.</td></tr>`;
    } else {
        data.forEach(item => {
            const pemasukan = item.jenis === 'masuk' ? item.nominal : 0;
            const pengeluaran = item.jenis === 'keluar' ? item.nominal : 0;
            saldo += pemasukan - pengeluaran;
            let tgl = '-';
            if (item.tanggal && item.tanggal._seconds) {
                tgl = new Date(item.tanggal._seconds * 1000).toLocaleDateString('id-ID');
            } else if (item.tanggal) {
                tgl = new Date(item.tanggal).toLocaleDateString('id-ID');
            }
            html += `<tr>
                <td><input type="checkbox" class="kas-row-check" value="${item.id}" aria-label="Centang Kas"></td>
                <td>${item.kode || '-'}</td>
                <td>${tgl}</td>
                <td>${item.keterangan || ''}</td>
                <td class="text-end">${pemasukan ? formatRupiah(pemasukan) : '-'}</td>
                <td class="text-end">${pengeluaran ? formatRupiah(pengeluaran) : '-'}</td>
                <td class="text-end">${formatRupiah(saldo)}</td>
                <td>
                    <button class="btn btn-warning btn-sm edit-kas-btn" data-id="${item.id}"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-danger btn-sm delete-kas-btn" data-id="${item.id}"><i class="bi bi-trash"></i></button>
                </td>
            </tr>`;
        });
    }
    html += `</tbody></table></div>`;
    return html;
}

// Event handler centang & hapus massal
document.addEventListener('DOMContentLoaded', function () {
  const section = document.getElementById('kas-section');
  if (!section) return;
  section.addEventListener('change', function (e) {
    if (e.target && e.target.id === 'kas-check-all') {
      const checked = e.target.checked;
      section.querySelectorAll('.kas-row-check').forEach(cb => { cb.checked = checked; });
      toggleBulkDeleteBtn();
    } else if (e.target && e.target.classList.contains('kas-row-check')) {
      const all = section.querySelectorAll('.kas-row-check');
      const checked = section.querySelectorAll('.kas-row-check:checked');
      const checkAll = section.querySelector('#kas-check-all');
      if (checkAll) checkAll.checked = all.length === checked.length;
      toggleBulkDeleteBtn();
    }
  });

  function toggleBulkDeleteBtn() {
    const btn = section.querySelector('#kas-bulk-delete-btn');
    const checked = section.querySelectorAll('.kas-row-check:checked');
    if (btn) btn.classList.toggle('d-none', checked.length === 0);
  }

  section.addEventListener('click', async function (e) {
    if (e.target && (e.target.id === 'kas-bulk-delete-btn' || e.target.closest('#kas-bulk-delete-btn'))) {
      const checked = Array.from(section.querySelectorAll('.kas-row-check:checked')).map(cb => cb.value);
      if (!checked.length) return;
      if (!confirm('Yakin ingin menghapus data terpilih?')) return;
      // Spinner
      const btn = section.querySelector('#kas-bulk-delete-btn');
      btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Menghapus...';
      try {
        for (const id of checked) {
          await fetch(`${kasApiUrl}/${id}`, { method: 'DELETE', headers: { 'X-CSRF-Token': window.CSRF_TOKEN || '' } });
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

function renderKasForm(editData = null) {
    return `<form id="kasForm" class="row g-2 align-items-end mb-3">
        <div class="col-md-2">
            <label class="form-label">Kode</label>
            <input type="text" class="form-control" id="kasKode" value="${editData ? editData.kode : ''}" ${editData ? '' : 'readonly placeholder=\'Otomatis\''}>
        </div>
        <div class="col-md-2">
            <label class="form-label">Tanggal</label>
            <input type="date" class="form-control" id="kasTanggal" value="${editData ? new Date(editData.tanggal._seconds * 1000).toISOString().slice(0,10) : ''}" required>
        </div>
        <div class="col-md-3">
            <label class="form-label">Keterangan</label>
            <input type="text" class="form-control" id="kasKeterangan" value="${editData ? editData.keterangan : ''}" required>
        </div>
        <div class="col-md-2">
            <label class="form-label">Jenis</label>
            <select class="form-select" id="kasJenis" required>
                <option value="masuk" ${editData && editData.jenis === 'masuk' ? 'selected' : ''}>Masuk</option>
                <option value="keluar" ${editData && editData.jenis === 'keluar' ? 'selected' : ''}>Keluar</option>
            </select>
        </div>
        <div class="col-md-2">
            <label class="form-label">Nominal</label>
            <input type="number" class="form-control" id="kasNominal" value="${editData ? editData.nominal : ''}" min="0" required>
        </div>
        <div class="col-md-1">
            <button type="submit" class="btn btn-${editData ? 'success' : 'primary'} w-100">${editData ? 'Update' : 'Tambah'}</button>
            ${editData ? '<button type="button" class="btn btn-secondary w-100 mt-1" id="kasCancelEdit">Batal</button>' : ''}
        </div>
    </form>`;
}

function showKasMessage(msg, type = 'info') {
    let el = document.getElementById('kasMessage');
    if (!el) {
        el = document.createElement('div');
        el.id = 'kasMessage';
        kasSection.prepend(el);
    }
    el.className = `alert alert-${type} my-2`;
    el.textContent = msg;
    setTimeout(() => el.textContent = '', 4000);
}

async function fetchKas() {
    const listDiv = document.getElementById('kasList');
    listDiv.innerHTML = '<div class="text-center py-4"><span class="spinner-border"></span> Memuat data kas...</div>';
    try {
        const res = await csrfFetch(kasApiUrl);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
            listDiv.innerHTML = renderKasTable(json.data);
            attachKasEventListeners(json.data);
        } else if (Array.isArray(json)) { // fallback jika API langsung array
            listDiv.innerHTML = renderKasTable(json);
            attachKasEventListeners(json);
        } else {
            listDiv.innerHTML = '<div class="alert alert-danger">Gagal memuat data kas.</div>';
        }
    } catch (e) {
        listDiv.innerHTML = '<div class="alert alert-danger">Gagal memuat data kas.</div>';
    }
}

function attachKasEventListeners(data) {
    document.querySelectorAll('.edit-kas-btn').forEach(btn => {
        btn.onclick = () => showEditKasForm(data.find(d => d.id === btn.dataset.id));
    });
    document.querySelectorAll('.delete-kas-btn').forEach(btn => {
        btn.onclick = async () => {
            if (confirm('Yakin hapus data kas ini?')) {
                try {
                    const res = await fetch(`${kasApiUrl}/${btn.dataset.id}`, { method: 'DELETE', headers: { 'X-CSRF-Token': window.CSRF_TOKEN || '' } });
                    const json = await res.json();
                    if (json.success) {
                        showKasMessage('Data kas berhasil dihapus', 'success');
                        fetchKas();
                    } else {
                        showKasMessage('Gagal menghapus data kas', 'danger');
                    }
                } catch {
                    showKasMessage('Gagal menghapus data kas', 'danger');
                }
            }
        };
    });
}

function showEditKasForm(editData) {
    const formDiv = document.getElementById('kasFormDiv');
    formDiv.innerHTML = renderKasForm(editData);
    document.getElementById('kasForm').onsubmit = async function(e) {
        e.preventDefault();
        const body = {
            tanggal: document.getElementById('kasTanggal').value,
            keterangan: document.getElementById('kasKeterangan').value,
            jenis: document.getElementById('kasJenis').value,
            nominal: parseInt(document.getElementById('kasNominal').value)
        };
        try {
            const res = await csrfFetch(`${kasApiUrl}/${editData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const json = await res.json();
            if (json.success) {
                showKasMessage('Data kas berhasil diupdate', 'success');
                fetchKas();
                showAddKasForm();
            } else {
                showKasMessage('Gagal update data kas', 'danger');
            }
        } catch {
            showKasMessage('Gagal update data kas', 'danger');
        }
    };
    document.getElementById('kasCancelEdit').onclick = showAddKasForm;
}

function showAddKasForm() {
    const formDiv = document.getElementById('kasFormDiv');
    formDiv.innerHTML = renderKasForm();
    document.getElementById('kasForm').onsubmit = async function(e) {
        e.preventDefault();
        const body = {
            tanggal: document.getElementById('kasTanggal').value,
            keterangan: document.getElementById('kasKeterangan').value,
            jenis: document.getElementById('kasJenis').value,
            nominal: parseInt(document.getElementById('kasNominal').value)
        };
        try {
            const res = await csrfFetch(kasApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const json = await res.json();
            if (json.success) {
                showKasMessage('Data kas berhasil ditambahkan', 'success');
                fetchKas();
                this.reset();
            } else {
                showKasMessage('Gagal menambah data kas', 'danger');
            }
        } catch {
            showKasMessage('Gagal menambah data kas', 'danger');
        }
    };
}

function csrfFetch(url, options = {}) {
    options.headers = options.headers || {};
    if (window.CSRF_TOKEN) {
        options.headers['X-CSRF-Token'] = window.CSRF_TOKEN;
    }
    return fetch(url, options);
}

// Robust initialization with error logging and DOMContentLoaded
function initKasSection() {
    kasSection = document.getElementById("kas-section");
    if (!kasSection) {
        console.error("[kas-selection.js] kas-section not found in DOM");
        return;
    }
    try {
        kasSection.classList.remove('d-none');
        kasSection.innerHTML = `
            <h2 class="mb-3">Laporan Kas</h2>
            <div class="card mb-4 shadow-sm">
                <div class="card-body">
                    <form id="formCariEditKas" class="row g-2 align-items-end mb-2">
                        <div class="col-md-4 col-12">
                            <input type="text" class="form-control" id="inputKodeEditKas" placeholder="Cari kode kas untuk edit...">
                        </div>
                        <div class="col-md-2 col-6">
                            <button type="submit" class="btn btn-primary w-100"><i class="bi bi-search"></i> Cari</button>
                        </div>
                    </form>
                    <div id="notifEditKas" class="mb-2"></div>
                    <div class="small text-muted mb-2">Masukkan kode kas untuk mengedit data. Kode kas dapat dilihat pada tabel di bawah.</div>
                </div>
            </div>
            <div id="kasFormDiv" class="mb-4"></div>
            <div class="card shadow-sm">
                <div class="card-header bg-primary text-white fw-bold">Daftar Kas</div>
                <div class="card-body p-0">
                    <div id="kasList"></div>
                </div>
            </div>
        `;
        document.getElementById('formCariEditKas').addEventListener('submit', async function(e) {
            e.preventDefault();
            const kode = document.getElementById('inputKodeEditKas').value.trim().toLowerCase();
            if (!kode) return;
            try {
                const res = await fetch(kasApiUrl);
                const json = await res.json();
                if (json.success) {
                    const found = json.data.find(kas => kas.kode && kas.kode.toLowerCase() === kode);
                    if (found) {
                        showEditKasForm(found);
                        document.getElementById('notifEditKas').innerText = '';
                    } else {
                        document.getElementById('notifEditKas').innerText = 'Data dengan kode tersebut tidak ditemukan.';
                        showAddKasForm();
                    }
                } else {
                    document.getElementById('notifEditKas').innerText = 'Gagal mencari data kas.';
                }
            } catch (err) {
                document.getElementById('notifEditKas').innerText = 'Gagal mencari data kas.';
                console.error('[kas-selection.js] Error searching kas:', err);
            }
        });
        showAddKasForm();
        fetchKas();
    } catch (err) {
        console.error('[kas-selection.js] Error initializing kas-section:', err);
        if (kasSection) kasSection.innerHTML = '<div class="alert alert-danger">Gagal memuat Laporan Kas. Cek konsol untuk detail.</div>';
    }
}

// Listen for DOMContentLoaded and also expose for manual re-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initKasSection);
} else {
    initKasSection();
}
// Allow re-initialization if section is shown again
window.initKasSection = initKasSection;
