// donasi-selection.js
// Modul manajemen donasi untuk CMS, mirip iuran-selection.js namun untuk donasi

const donasiApiUrl = "/api/donasi";
let donasiSection = document.getElementById("laporan-donasi-section");

function renderDonasiTable(data) {
    data = [...data].sort((a, b) => (a.donatur || '').localeCompare(b.donatur || ''));
    let html = `<div class="table-responsive">
    <div class="mb-2">
        <button id="hapusTerpilihDonasiBtn" class="btn btn-danger btn-sm d-none align-items-center gap-1"><i class="bi bi-trash"></i> Hapus Terpilih</button>
    </div>
    <table class="table table-bordered table-hover table-striped align-middle donasi-table">
        <thead class="table-light sticky-top">
            <tr>
                <th scope="col"><input type="checkbox" id="centangSemuaDonasi" aria-label="Centang Semua Donasi"></th>
                <th scope="col">No.</th>
                <th scope="col">Tanggal</th>
                <th scope="col">Donatur</th>
                <th scope="col">Invoice Number</th>
                <th scope="col">Nominal</th>
                <th scope="col">Keterangan</th>
                <th scope="col">Aksi</th>
            </tr>
        </thead>
        <tbody>`;
    if (!data.length) {
        html += `<tr><td colspan="8" class="text-center">Belum ada data donasi.</td></tr>`;
    } else {
        let total = 0;
        data.forEach((item, idx) => {
            total += item.nominal || 0;
            html += `<tr>
                <td><input type="checkbox" class="centangDonasi" data-id="${item.id}"></td>
                <td>${idx + 1}</td>
                <td>${item.tanggal || '-'}</td>
                <td>${item.donatur || '-'}</td>
                <td>${item.invoiceNumber || '-'}</td>
                <td class="text-end">${item.nominal ? 'Rp. ' + item.nominal.toLocaleString('id-ID') : '-'}</td>
                <td class="text-center">${item.keterangan || '-'}</td>
                <td>
                    <button class="btn btn-warning btn-sm edit-donasi-btn d-inline-flex align-items-center gap-1" data-id="${item.id}" aria-label="Edit Donasi"><i class="bi bi-pencil"></i> <span class="d-none d-md-inline">Edit</span></button>
                    <button class="btn btn-danger btn-sm delete-donasi-btn d-inline-flex align-items-center gap-1" data-id="${item.id}" aria-label="Hapus Donasi"><i class="bi bi-trash"></i> <span class="d-none d-md-inline">Hapus</span></button>
                </td>
            </tr>`;
        });
        html += `<tr class="table-success fw-bold"><td colspan="5" class="text-end"><b>Jumlah Total</b></td><td class="text-end"><b>Rp. ${total.toLocaleString('id-ID')}</b></td><td colspan="2"></td></tr>`;
    }
    html += `</tbody></table></div>`;
    // Event handler centang & hapus massal (selalu inisialisasi ulang)
    setTimeout(() => {
      const centangSemua = document.getElementById('centangSemuaDonasi');
      const centangList = Array.from(document.querySelectorAll('.centangDonasi'));
      const hapusBtn = document.getElementById('hapusTerpilihDonasiBtn');
      function updateHapusBtn() {
        const anyChecked = centangList.some(cb => cb.checked);
        if (hapusBtn) {
          hapusBtn.classList.toggle('d-none', !anyChecked);
          hapusBtn.disabled = !anyChecked;
        }
      }
      if (centangSemua) {
        centangSemua.onclick = function() {
          centangList.forEach(cb => { cb.checked = centangSemua.checked; });
          updateHapusBtn();
        };
      }
      centangList.forEach(cb => {
        cb.onchange = updateHapusBtn;
      });
      if (hapusBtn) {
        hapusBtn.onclick = async function() {
          const terpilih = centangList.filter(cb => cb.checked).map(cb => cb.dataset.id);
          if (!terpilih.length) return;
          if (!confirm('Yakin ingin menghapus semua data donasi yang dipilih?')) return;
          hapusBtn.disabled = true;
          const oldHtml = hapusBtn.innerHTML;
          hapusBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Menghapus...';
          let sukses = 0, gagal = 0;
          for (const id of terpilih) {
            try {
              const res = await csrfFetch(`${donasiApiUrl}/${id}`, { method: 'DELETE' });
              const json = await res.json();
              if (json.success) sukses++; else gagal++;
            } catch (e) { gagal++; }
          }
          showDonasiMessage(`${sukses} data berhasil dihapus, ${gagal} gagal.`, gagal ? 'danger' : 'success');
          fetchDonasi();
          hapusBtn.disabled = false;
          hapusBtn.innerHTML = oldHtml;
        };
      }
      updateHapusBtn();
    }, 0);
    return html;
}

function renderDonasiForm(editData = null) {
    return `<form id="donasiForm" class="row g-2 align-items-end mb-3 needs-validation" novalidate>
        <div class="col-md-3 col-12">
            <label class="form-label" for="donatur">Nama Donatur</label>
            <input type="text" class="form-control" id="donatur" value="${editData ? editData.donatur : ''}" required placeholder="Nama Donatur" aria-label="Nama Donatur">
            <div class="invalid-feedback">Nama donatur wajib diisi.</div>
        </div>
        <div class="col-md-2 col-6">
            <label class="form-label" for="nominal">Nominal</label>
            <input type="number" class="form-control" id="nominal" value="${editData ? editData.nominal : ''}" required min="1" placeholder="Nominal" aria-label="Nominal Donasi">
            <div class="invalid-feedback">Nominal wajib diisi dan lebih dari 0.</div>
        </div>
        <div class="col-md-2 col-6">
            <label class="form-label" for="tanggal">Tanggal</label>
            <input type="date" class="form-control" id="tanggal" value="${editData ? editData.tanggal : ''}" required aria-label="Tanggal Donasi">
            <div class="invalid-feedback">Tanggal wajib diisi.</div>
        </div>
        <div class="col-md-2 col-6">
            <label class="form-label" for="invoiceNumber">Invoice Number</label>
            <input type="text" class="form-control" id="invoiceNumber" value="${editData ? editData.invoiceNumber || '' : ''}" placeholder="Invoice (opsional)" aria-label="Invoice Number">
        </div>
        <div class="col-md-3 col-12">
            <label class="form-label" for="keterangan">Keterangan</label>
            <input type="text" class="form-control" id="keterangan" value="${editData ? editData.keterangan : ''}" placeholder="Keterangan (opsional)" aria-label="Keterangan">
        </div>
        <div class="col-md-2 col-12 d-flex flex-column gap-2">
            <button type="submit" class="btn btn-${editData ? 'success' : 'primary'} w-100 d-flex align-items-center justify-content-center gap-1">${editData ? '<i class="bi bi-check-circle"></i> Update' : '<i class="bi bi-plus-circle"></i> Tambah'}</button>
            ${editData ? '<button type="button" class="btn btn-secondary w-100 d-flex align-items-center justify-content-center gap-1" id="donasiCancelEdit"><i class="bi bi-x-circle"></i> Batal</button>' : ''}
        </div>
    </form>`;
}

function showDonasiMessage(msg, type = 'info') {
    let el = document.getElementById('donasiMessage');
    if (!el) {
        el = document.createElement('div');
        el.id = 'donasiMessage';
        donasiSection.prepend(el);
    }
    el.className = `alert alert-${type} my-2`;
    el.textContent = msg;
    setTimeout(() => el.textContent = '', 4000);
}

async function fetchDonasi() {
    const listDiv = document.getElementById('donasiList');
    listDiv.innerHTML = '<div class="text-center py-4"><span class="spinner-border"></span> Memuat data donasi...</div>';
    try {
        const res = await fetch(donasiApiUrl);
        const json = await res.json();
        if (json.success) {
            listDiv.innerHTML = renderDonasiTable(json.data);
            attachDonasiEventListeners(json.data);
        } else {
            listDiv.innerHTML = '<div class="alert alert-danger">Gagal memuat data donasi.</div>';
        }
    } catch (e) {
        listDiv.innerHTML = '<div class="alert alert-danger">Gagal memuat data donasi.</div>';
    }
}

function attachDonasiEventListeners(data) {
    document.querySelectorAll('.edit-donasi-btn').forEach(btn => {
        btn.onclick = () => {
            btn.blur();
            showEditDonasiForm(data.find(d => d.id === btn.dataset.id));
        };
    });
    document.querySelectorAll('.delete-donasi-btn').forEach(btn => {
        btn.onclick = async function() {
            btn.blur();
            if (btn.disabled) return;
            if (confirm('Yakin ingin menghapus data donasi ini? Data yang dihapus tidak dapat dikembalikan.')) {
                btn.disabled = true;
                const oldHtml = btn.innerHTML;
                btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
                try {
                    const res = await csrfFetch(`${donasiApiUrl}/${btn.dataset.id}`, { method: 'DELETE' });
                    const json = await res.json();
                    if (json.success) {
                        showDonasiMessage('Data donasi berhasil dihapus', 'success');
                        fetchDonasi();
                    } else {
                        showDonasiMessage('Gagal menghapus data donasi', 'danger');
                    }
                } catch {
                    showDonasiMessage('Gagal menghapus data donasi', 'danger');
                }
                btn.disabled = false;
                btn.innerHTML = oldHtml;
            }
        };
    });
}

function showEditDonasiForm(editData) {
    const formDiv = document.getElementById('donasiFormDiv');
    formDiv.innerHTML = renderDonasiForm(editData);
    document.getElementById('donasiForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const submitBtn = this.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            const oldHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
        }
        const body = {
            donatur: document.getElementById('donatur').value,
            nominal: parseInt(document.getElementById('nominal').value),
            tanggal: document.getElementById('tanggal').value,
            invoiceNumber: document.getElementById('invoiceNumber').value,
            keterangan: document.getElementById('keterangan').value
        };
        try {
            const res = await csrfFetch(`${donasiApiUrl}/${editData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const json = await res.json();
            if (json.success) {
                showDonasiMessage('Data donasi berhasil diupdate', 'success');
                fetchDonasi();
                showAddDonasiForm();
            } else {
                showDonasiMessage('Gagal update data donasi', 'danger');
            }
        } catch {
            showDonasiMessage('Gagal update data donasi', 'danger');
        }
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = editData ? 'Update' : 'Tambah';
        }
    });
    document.getElementById('donasiCancelEdit').addEventListener('click', showAddDonasiForm);
}

function showAddDonasiForm() {
    const formDiv = document.getElementById('donasiFormDiv');
    formDiv.innerHTML = renderDonasiForm();
    document.getElementById('donasiForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const submitBtn = this.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            const oldHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
        }
        const body = {
            donatur: document.getElementById('donatur').value,
            nominal: parseInt(document.getElementById('nominal').value),
            tanggal: document.getElementById('tanggal').value,
            invoiceNumber: document.getElementById('invoiceNumber').value,
            keterangan: document.getElementById('keterangan').value
        };
        try {
            const res = await csrfFetch(donasiApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const json = await res.json();
            if (json.success) {
                showDonasiMessage('Data donasi berhasil ditambahkan', 'success');
                fetchDonasi();
                this.reset();
            } else {
                showDonasiMessage('Gagal menambah data donasi', 'danger');
            }
        } catch {
            showDonasiMessage('Gagal menambah data donasi', 'danger');
        }
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Tambah';
        }
    });
}

function csrfFetch(url, options = {}) {
    options.headers = options.headers || {};
    if (window.CSRF_TOKEN) {
        options.headers['X-CSRF-Token'] = window.CSRF_TOKEN;
    }
    return fetch(url, options);
}

function initDonasiSection() {
    donasiSection = document.getElementById("laporan-donasi-section");
    if (!donasiSection) {
        console.error("[donasi-selection.js] laporan-donasi-section not found in DOM");
        return;
    }
    try {
        donasiSection.classList.remove('d-none');
        donasiSection.innerHTML = `
            <h2 class="mb-3">Laporan Donasi</h2>
            <div class="card mb-4 shadow-sm">
                <div class="card-body">
                    <form id="formCariEditDonasi" class="row g-2 align-items-end mb-2">
                        <div class="col-md-4 col-12">
                            <input type="text" class="form-control" id="inputNamaEditDonasi" placeholder="Cari nama donatur">
                        </div>
                        <div class="col-md-2 col-6">
                            <button type="submit" class="btn btn-primary w-100"><i class="bi bi-search"></i> Cari</button>
                        </div>
                    </form>
                    <div id="notifEditDonasi" class="mb-2"></div>
                    <div class="small text-muted mb-2">Masukkan nama donatur untuk mengedit data. Nama donatur dapat dilihat pada tabel di bawah.</div>
                </div>
            </div>
            <div id="donasiFormDiv" class="mb-4"></div>
            <div class="card shadow-sm">
                <div class="card-header bg-primary text-white fw-bold">Daftar Donasi</div>
                <div class="card-body p-0">
                    <div id="donasiList"></div>
                </div>
            </div>
        `;
        document.getElementById('formCariEditDonasi').addEventListener('submit', async function(e) {
            e.preventDefault();
            const nama = document.getElementById('inputNamaEditDonasi').value.trim().toLowerCase();
            if (!nama) return;
            try {
                const res = await fetch(donasiApiUrl);
                const json = await res.json();
                if (json.success) {
                    const found = json.data.find(donasi => donasi.donatur && donasi.donatur.toLowerCase() === nama);
                    if (found) {
                        showEditDonasiForm(found);
                        document.getElementById('notifEditDonasi').innerText = '';
                    } else {
                        document.getElementById('notifEditDonasi').innerText = 'Data dengan nama tersebut tidak ditemukan.';
                        showAddDonasiForm();
                    }
                } else {
                    document.getElementById('notifEditDonasi').innerText = 'Gagal mencari data donasi.';
                }
            } catch (err) {
                document.getElementById('notifEditDonasi').innerText = 'Gagal mencari data donasi.';
                console.error('[donasi-selection.js] Error searching donasi:', err);
            }
        });
        showAddDonasiForm();
        fetchDonasi();
    } catch (err) {
        console.error('[donasi-selection.js] Error initializing laporan-donasi-section:', err);
        if (donasiSection) donasiSection.innerHTML = '<div class="alert alert-danger">Gagal memuat Laporan Donasi. Cek konsol untuk detail.</div>';
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDonasiSection);
} else {
    initDonasiSection();
}
window.initDonasiSection = initDonasiSection;

if (donasiSection) {
    donasiSection.classList.remove('d-none');
    donasiSection.innerHTML = `
        <h2 class="mb-3">Laporan Donasi</h2>
        <div class="card mb-4 shadow-sm">
            <div class="card-body">
                <form id="formCariEditDonasi" class="row g-2 align-items-end mb-2">
                    <div class="col-md-4 col-12">
                        <input type="text" class="form-control" id="inputNamaEditDonasi" placeholder="Cari nama donatur">
                    </div>
                    <div class="col-md-2 col-6">
                        <button type="submit" class="btn btn-primary w-100"><i class="bi bi-search"></i> Cari</button>
                    </div>
                </form>
                <div id="notifEditDonasi" class="mb-2"></div>
                <div class="small text-muted mb-2">Masukkan nama donatur untuk mengedit data. Nama donatur dapat dilihat pada tabel di bawah.</div>
            </div>
        </div>
        <div id="donasiFormDiv" class="mb-4"></div>
        <div class="card shadow-sm">
            <div class="card-header bg-primary text-white fw-bold">Daftar Donasi</div>
            <div class="card-body p-0">
                <div id="donasiList"></div>
            </div>
        </div>
    `;
    document.getElementById('formCariEditDonasi').addEventListener('submit', async function(e) {
        e.preventDefault();
        const nama = document.getElementById('inputNamaEditDonasi').value.trim().toLowerCase();
        if (!nama) return;
        const res = await fetch(donasiApiUrl);
        const json = await res.json();
        if (json.success) {
            const found = json.data.find(donasi => donasi.donatur && donasi.donatur.toLowerCase() === nama);
            if (found) {
                showEditDonasiForm(found);
                document.getElementById('notifEditDonasi').innerText = '';
            } else {
                document.getElementById('notifEditDonasi').innerText = 'Data dengan nama tersebut tidak ditemukan.';
                showAddDonasiForm();
            }
        } else {
            document.getElementById('notifEditDonasi').innerText = 'Gagal mencari data donasi.';
        }
    });
    showAddDonasiForm();
    fetchDonasi();
}
