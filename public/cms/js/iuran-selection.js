
// Iuran Management untuk CMS (non-module, window.firebase v8)
// Mirip kas-selection.js, CRUD data iuran ke Firestore

const iuranApiUrl = "/api/iuran";
let iuranSection = document.getElementById("laporan-iuran-section");

function renderIuranTable(data) {
    // Urutkan data berdasarkan nama anggota
    data = [...data].sort((a, b) => (a.anggota || '').localeCompare(b.anggota || ''));
    let html = `<div class="table-responsive">
    <div class="d-flex justify-content-between align-items-center mb-2">
      <button id="iuran-bulk-delete-btn" class="btn btn-danger btn-sm d-none"><i class="bi bi-trash"></i> Hapus Terpilih</button>
    </div>
    <table class="table table-bordered table-hover table-striped align-middle iuran-table">
        <thead class="table-light sticky-top">
            <tr>
                <th rowspan="2" style="width:40px;">
                  <input type="checkbox" id="iuran-check-all" aria-label="Centang Semua Iuran">
                </th>
                <th rowspan="2" scope="col">Anggota</th>
                <th colspan="2" class="iuran-bulan-group">Mei</th>
                <th colspan="2" class="iuran-bulan-group">Juni</th>
                <th colspan="2" class="iuran-bulan-group">Juli</th>
                <th colspan="2" class="iuran-bulan-group">Agustus</th>
                <th colspan="2" class="iuran-bulan-group">September</th>
                <th colspan="2" class="iuran-bulan-group">Oktober</th>
                <th colspan="2" class="iuran-bulan-group">November</th>
                <th colspan="2" class="iuran-bulan-group">Desember</th>
                <th rowspan="2" scope="col">Jumlah</th>
                <th rowspan="2" scope="col">Aksi</th>
            </tr>
            <tr>
                <th class="iuran-bulan">Tanda</th><th class="iuran-tgl">Tanggal</th>
                <th class="iuran-bulan">Tanda</th><th class="iuran-tgl">Tanggal</th>
                <th class="iuran-bulan">Tanda</th><th class="iuran-tgl">Tanggal</th>
                <th class="iuran-bulan">Tanda</th><th class="iuran-tgl">Tanggal</th>
                <th class="iuran-bulan">Tanda</th><th class="iuran-tgl">Tanggal</th>
                <th class="iuran-bulan">Tanda</th><th class="iuran-tgl">Tanggal</th>
                <th class="iuran-bulan">Tanda</th><th class="iuran-tgl">Tanggal</th>
                <th class="iuran-bulan">Tanda</th><th class="iuran-tgl">Tanggal</th>
            </tr>
        </thead>
        <tbody>`;
    if (!data.length) {
        html += `<tr><td colspan="20" class="text-center">Belum ada data iuran.</td></tr>`;
    } else {
        data.forEach(item => {
            function getBulan(bulan) {
                if (typeof item[bulan] === 'object' && item[bulan] !== null) return item[bulan];
                // fallback lama
                return { checked: !!item[bulan], tanggal: '' };
            }
            html += `<tr>
                <td><input type="checkbox" class="iuran-row-check" value="${item.id}" aria-label="Centang Iuran"></td>
                <td>${item.anggota || '-'}</td>
                <td class="iuran-centang">${getBulan('mei').checked ? '✔️' : ''}</td>
                <td class="iuran-tanggal">${getBulan('mei').checked && getBulan('mei').tanggal ? getBulan('mei').tanggal : ''}</td>
                <td class="iuran-centang">${getBulan('juni').checked ? '✔️' : ''}</td>
                <td class="iuran-tanggal">${getBulan('juni').checked && getBulan('juni').tanggal ? getBulan('juni').tanggal : ''}</td>
                <td class="iuran-centang">${getBulan('juli').checked ? '✔️' : ''}</td>
                <td class="iuran-tanggal">${getBulan('juli').checked && getBulan('juli').tanggal ? getBulan('juli').tanggal : ''}</td>
                <td class="iuran-centang">${getBulan('agustus').checked ? '✔️' : ''}</td>
                <td class="iuran-tanggal">${getBulan('agustus').checked && getBulan('agustus').tanggal ? getBulan('agustus').tanggal : ''}</td>
                <td class="iuran-centang">${getBulan('september').checked ? '✔️' : ''}</td>
                <td class="iuran-tanggal">${getBulan('september').checked && getBulan('september').tanggal ? getBulan('september').tanggal : ''}</td>
                <td class="iuran-centang">${getBulan('oktober').checked ? '✔️' : ''}</td>
                <td class="iuran-tanggal">${getBulan('oktober').checked && getBulan('oktober').tanggal ? getBulan('oktober').tanggal : ''}</td>
                <td class="iuran-centang">${getBulan('november').checked ? '✔️' : ''}</td>
                <td class="iuran-tanggal">${getBulan('november').checked && getBulan('november').tanggal ? getBulan('november').tanggal : ''}</td>
                <td class="iuran-centang">${getBulan('desember').checked ? '✔️' : ''}</td>
                <td class="iuran-tanggal">${getBulan('desember').checked && getBulan('desember').tanggal ? getBulan('desember').tanggal : ''}</td>
                <td class="iuran-jumlah text-end">${item.jumlah ? formatRupiah(item.jumlah) : '-'}</td>
                <td>
                    <button class="btn btn-warning btn-sm edit-iuran-btn d-inline-flex align-items-center gap-1" data-id="${item.id}" aria-label="Edit Iuran"><i class="bi bi-pencil"></i> <span class="d-none d-md-inline">Edit</span></button>
                    <button class="btn btn-danger btn-sm delete-iuran-btn d-inline-flex align-items-center gap-1" data-id="${item.id}" aria-label="Hapus Iuran"><i class="bi bi-trash"></i> <span class="d-none d-md-inline">Hapus</span></button>
                </td>
            </tr>`;
        });
    }
    html += `</tbody></table></div>`;
    return html;
}

// Event handler centang & hapus massal
document.addEventListener('DOMContentLoaded', function () {
  const section = document.getElementById('laporan-iuran-section');
  if (!section) return;
  section.addEventListener('change', function (e) {
    if (e.target && e.target.id === 'iuran-check-all') {
      const checked = e.target.checked;
      section.querySelectorAll('.iuran-row-check').forEach(cb => { cb.checked = checked; });
      toggleBulkDeleteBtn();
    } else if (e.target && e.target.classList.contains('iuran-row-check')) {
      const all = section.querySelectorAll('.iuran-row-check');
      const checked = section.querySelectorAll('.iuran-row-check:checked');
      const checkAll = section.querySelector('#iuran-check-all');
      if (checkAll) checkAll.checked = all.length === checked.length;
      toggleBulkDeleteBtn();
    }
  });

  function toggleBulkDeleteBtn() {
    const btn = section.querySelector('#iuran-bulk-delete-btn');
    const checked = section.querySelectorAll('.iuran-row-check:checked');
    if (btn) btn.classList.toggle('d-none', checked.length === 0);
  }

  section.addEventListener('click', async function (e) {
    if (e.target && (e.target.id === 'iuran-bulk-delete-btn' || e.target.closest('#iuran-bulk-delete-btn'))) {
      const checked = Array.from(section.querySelectorAll('.iuran-row-check:checked')).map(cb => cb.value);
      if (!checked.length) return;
      if (!confirm('Yakin ingin menghapus data terpilih?')) return;
      // Spinner
      const btn = section.querySelector('#iuran-bulk-delete-btn');
      btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Menghapus...';
      try {
        for (const id of checked) {
          await fetch(`${iuranApiUrl}/${id}`, { method: 'DELETE', headers: { 'X-CSRF-Token': window.CSRF_TOKEN || '' } });
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

function renderIuranForm(editData = null) {
    // Helper untuk ambil value dan tanggal
    function getChecked(bulan) {
        if (!editData) return false;
        if (typeof editData[bulan] === 'object' && editData[bulan] !== null) return !!editData[bulan].checked;
        return !!editData[bulan];
    }
    function getTanggal(bulan) {
        if (!editData) return '';
        if (typeof editData[bulan] === 'object' && editData[bulan] !== null) return editData[bulan].tanggal || '';
        return '';
    }
    var anggotaVal = editData && editData.anggota ? editData.anggota : 'baru';
    var html = '';
    html += '<form id="iuranForm" class="row g-2 align-items-end mb-3 needs-validation" aria-label="Form Data Iuran" novalidate>';
    html += '<div class="col-md-3 col-12">';
    html += '<label class="form-label" for="iuranAnggota-' + anggotaVal + '">Nama Anggota</label>';
    html += '<input type="text" class="form-control" id="iuranAnggota-' + anggotaVal + '" aria-label="Nama Anggota" value="' + (editData ? editData.anggota : '') + '" required placeholder="Nama Anggota">';
    html += '<div class="invalid-feedback">Nama anggota wajib diisi.</div>';
    html += '</div>';
    var bulanArr = [
        {id:'Mei', key:'mei'}, {id:'Juni', key:'juni'}, {id:'Juli', key:'juli'}, {id:'Agustus', key:'agustus'},
        {id:'September', key:'september'}, {id:'Oktober', key:'oktober'}, {id:'November', key:'november'}, {id:'Desember', key:'desember'}
    ];
    for(var i=0;i<bulanArr.length;i++){
      html += '<div class="col-md-1 col-6">';
      html += '<label class="form-label" for="iuran' + bulanArr[i].id + '-' + anggotaVal + '">' + bulanArr[i].id + '</label>';
      html += '<div class="d-flex flex-column align-items-center">';
      html += '<input type="checkbox" id="iuran' + bulanArr[i].id + '-' + anggotaVal + '" aria-label="Iuran bulan ' + bulanArr[i].id + '"' + (getChecked(bulanArr[i].key) ? ' checked' : '') + '>';
      html += '<small class="text-muted" id="tgl' + bulanArr[i].id + '">' + getTanggal(bulanArr[i].key) + '</small>';
      html += '</div></div>';
    }
    html += '<div class="col-md-2 col-12">';
    html += '<label class="form-label" for="iuranJumlah-' + anggotaVal + '">Jumlah</label>';
    html += '<input type="number" class="form-control" id="iuranJumlah-' + anggotaVal + '" aria-label="Jumlah Iuran" value="' + (editData ? editData.jumlah : '') + '" min="0" required readonly>';
    html += '<div class="invalid-feedback">Jumlah otomatis dihitung.</div>';
    html += '</div>';
    html += '<div class="col-md-1 col-12 d-flex flex-column gap-2">';
    html += '<button type="submit" class="btn btn-' + (editData ? 'success' : 'primary') + ' w-100 d-flex align-items-center justify-content-center gap-1" aria-label="' + (editData ? 'Update' : 'Tambah') + ' Data Iuran">' + (editData ? '<i class="bi bi-check-circle"></i> Update' : '<i class="bi bi-plus-circle"></i> Tambah') + '</button>';
    if(editData){
      html += '<button type="button" class="btn btn-secondary w-100 d-flex align-items-center justify-content-center gap-1 mt-1" id="iuranCancelEdit" aria-label="Batal Edit Iuran"><i class="bi bi-x-circle"></i> Batal</button>';
    }
    html += '</div>';
    html += '</form>';
    return html;
}

// Tambahkan event listener untuk auto hitung jumlah dan update tanggal
function addIuranJumlahAutoCalc() {
    const anggotaInput = document.querySelector('[id^="iuranAnggota-"]');
    const anggotaVal = anggotaInput ? anggotaInput.value || 'baru' : 'baru';
    const checkIds = [
        'iuranMei','iuranJuni','iuranJuli','iuranAgustus','iuranSeptember','iuranOktober','iuranNovember','iuranDesember'
    ];
    function updateJumlah() {
        let count = 0;
        checkIds.forEach(id => {
            const el = document.getElementById(id + '-' + anggotaVal);
            if(el && el.checked) count++;
        });
        const jumlahInput = document.getElementById('iuranJumlah-' + anggotaVal);
        if(jumlahInput) jumlahInput.value = count * 10000;
    }
    function updateTanggal(e) {
        const id = e.target.id;
        // id format: iuranMei-anggota, ambil bagian bulan
        const bulan = id.split('-')[0].replace('iuran','');
        const tglId = 'tgl' + bulan.charAt(0).toUpperCase() + bulan.slice(1);
        if(e.target.checked) {
            const today = new Date().toISOString().slice(0,10);
            const tglEl = document.getElementById(tglId);
            if(tglEl) tglEl.textContent = today;
        } else {
            const tglEl = document.getElementById(tglId);
            if(tglEl) tglEl.textContent = '';
        }
    }
    checkIds.forEach(id => {
        const el = document.getElementById(id + '-' + anggotaVal);
        if(el) {
            el.addEventListener('change', updateJumlah);
            el.addEventListener('change', updateTanggal);
        }
    });
    // Inisialisasi pertama kali
    updateJumlah();
}

function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(angka);
}

function showIuranMessage(msg, type = 'info') {
    let el = document.getElementById('iuranMessage');
    if (!el) {
        el = document.createElement('div');
        el.id = 'iuranMessage';
        iuranSection.prepend(el);
    }
    el.className = `alert alert-${type} my-2`;
    el.textContent = msg;
    setTimeout(() => el.textContent = '', 4000);
}

async function fetchIuran() {
    const listDiv = document.getElementById('iuranList');
    listDiv.innerHTML = '<div class="text-center py-4"><span class="spinner-border"></span> Memuat data iuran...</div>';
    try {
        const res = await fetch(iuranApiUrl);
        const json = await res.json();
        if (json.success) {
            listDiv.innerHTML = renderIuranTable(json.data);
            attachIuranEventListeners(json.data);
        } else {
            listDiv.innerHTML = '<div class="alert alert-danger">Gagal memuat data iuran.</div>';
        }
    } catch (e) {
        listDiv.innerHTML = '<div class="alert alert-danger">Gagal memuat data iuran.</div>';
    }
}

function attachIuranEventListeners(data) {
    document.querySelectorAll('.edit-iuran-btn').forEach(btn => {
        btn.onclick = () => {
            btn.blur();
            showEditIuranForm(data.find(d => d.id === btn.dataset.id));
        };
    });
    document.querySelectorAll('.delete-iuran-btn').forEach(btn => {
        btn.onclick = async function() {
            btn.blur();
            if (btn.disabled) return;
            if (confirm('Yakin ingin menghapus data iuran ini? Data yang dihapus tidak dapat dikembalikan.')) {
                btn.disabled = true;
                const oldHtml = btn.innerHTML;
                btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
                try {
                    const res = await csrfFetch(`${iuranApiUrl}/${btn.dataset.id}`, { method: 'DELETE' });
                    const json = await res.json();
                    if (json.success) {
                        showIuranMessage('Data iuran berhasil dihapus', 'success');
                        fetchIuran();
                    } else {
                        showIuranMessage('Gagal menghapus data iuran', 'danger');
                    }
                } catch {
                    showIuranMessage('Gagal menghapus data iuran', 'danger');
                }
                btn.disabled = false;
                btn.innerHTML = oldHtml;
            }
        };
    });
}

function showEditIuranForm(editData) {
    const formDiv = document.getElementById('iuranFormDiv');
    formDiv.innerHTML = renderIuranForm(editData);
    addIuranJumlahAutoCalc();
    const anggotaVal = editData && editData.anggota ? editData.anggota : 'baru';
    document.getElementById('iuranForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        function getBulanObj(id, tglId) {
            return {
                checked: document.getElementById(id + '-' + anggotaVal).checked,
                tanggal: document.getElementById(tglId).textContent || ''
            };
        }
        const body = {
            anggota: document.getElementById('iuranAnggota-' + anggotaVal).value,
            mei: getBulanObj('iuranMei','tglMei'),
            juni: getBulanObj('iuranJuni','tglJuni'),
            juli: getBulanObj('iuranJuli','tglJuli'),
            agustus: getBulanObj('iuranAgustus','tglAgustus'),
            september: getBulanObj('iuranSeptember','tglSeptember'),
            oktober: getBulanObj('iuranOktober','tglOktober'),
            november: getBulanObj('iuranNovember','tglNovember'),
            desember: getBulanObj('iuranDesember','tglDesember'),
            jumlah: parseInt(document.getElementById('iuranJumlah-' + anggotaVal).value)
        };
        try {
            const res = await csrfFetch(`${iuranApiUrl}/${editData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const json = await res.json();
            if (json.success) {
                showIuranMessage('Data iuran berhasil diupdate', 'success');
                fetchIuran();
                showAddIuranForm();
            } else {
                showIuranMessage('Gagal update data iuran', 'danger');
            }
        } catch {
            showIuranMessage('Gagal update data iuran', 'danger');
        }
    });
    const cancelBtn = document.getElementById('iuranCancelEdit');
    if(cancelBtn) cancelBtn.addEventListener('click', showAddIuranForm);
}

function showAddIuranForm() {
    const formDiv = document.getElementById('iuranFormDiv');
    formDiv.innerHTML = renderIuranForm();
    addIuranJumlahAutoCalc();
    const anggotaVal = 'baru';
    document.getElementById('iuranForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        function getBulanObj(id, tglId) {
            return {
                checked: document.getElementById(id + '-' + anggotaVal).checked,
                tanggal: document.getElementById(tglId).textContent || ''
            };
        }
        const body = {
            anggota: document.getElementById('iuranAnggota-' + anggotaVal).value,
            mei: getBulanObj('iuranMei','tglMei'),
            juni: getBulanObj('iuranJuni','tglJuni'),
            juli: getBulanObj('iuranJuli','tglJuli'),
            agustus: getBulanObj('iuranAgustus','tglAgustus'),
            september: getBulanObj('iuranSeptember','tglSeptember'),
            oktober: getBulanObj('iuranOktober','tglOktober'),
            november: getBulanObj('iuranNovember','tglNovember'),
            desember: getBulanObj('iuranDesember','tglDesember'),
            jumlah: parseInt(document.getElementById('iuranJumlah-' + anggotaVal).value)
        };
        try {
            const res = await csrfFetch(iuranApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const json = await res.json();
            if (json.success) {
                showIuranMessage('Data iuran berhasil ditambahkan', 'success');
                fetchIuran();
                showAddIuranForm();
            } else {
                showIuranMessage('Gagal menambah data iuran', 'danger');
            }
        } catch {
            showIuranMessage('Gagal menambah data iuran', 'danger');
        }
    });
}

// Helper untuk menambah header CSRF ke setiap fetch
function csrfFetch(url, options = {}) {
    options.headers = options.headers || {};
    // Tambahkan token CSRF jika tersedia
    if (window.CSRF_TOKEN) {
        options.headers['X-CSRF-Token'] = window.CSRF_TOKEN;
    }
    return fetch(url, options);
}

// Robust initialization with error logging and DOMContentLoaded
function initIuranSection() {
    iuranSection = document.getElementById("laporan-iuran-section");
    if (!iuranSection) {
        console.error("[iuran-selection.js] laporan-iuran-section not found in DOM");
        return;
    }
    try {
        iuranSection.classList.remove('d-none');
        iuranSection.innerHTML = `
            <h2 class="mb-3">Laporan Iuran</h2>
            <div class="card mb-4 shadow-sm">
                <div class="card-body">
                    <form id="formCariEditIuran" class="row g-2 align-items-end mb-2">
                        <div class="col-md-4 col-12">
                            <input type="text" class="form-control" id="inputNamaEditIuran" placeholder="Cari nama">
                        </div>
                        <div class="col-md-2 col-6">
                            <button type="submit" class="btn btn-primary w-100"><i class="bi bi-search"></i> Cari</button>
                        </div>
                    </form>
                    <div id="notifEditIuran" class="mb-2"></div>
                    <div class="small text-muted mb-2">Masukkan nama anggota untuk mengedit data. Nama anggota dapat dilihat pada tabel di bawah.</div>
                </div>
            </div>
            <div id="iuranFormDiv" class="mb-4"></div>
            <div class="card shadow-sm">
                <div class="card-header bg-primary text-white fw-bold">Daftar Iuran</div>
                <div class="card-body p-0">
                    <div id="iuranList"></div>
                </div>
            </div>
        `;
        document.getElementById('formCariEditIuran').addEventListener('submit', async function(e) {
            e.preventDefault();
            const nama = document.getElementById('inputNamaEditIuran').value.trim().toLowerCase();
            if (!nama) return;
            try {
                const res = await fetch(iuranApiUrl);
                const json = await res.json();
                if (json.success) {
                    const found = json.data.find(iuran => iuran.anggota && iuran.anggota.toLowerCase() === nama);
                    if (found) {
                        showEditIuranForm(found);
                        document.getElementById('notifEditIuran').innerText = '';
                    } else {
                        document.getElementById('notifEditIuran').innerText = 'Data dengan nama tersebut tidak ditemukan.';
                        showAddIuranForm();
                    }
                } else {
                    document.getElementById('notifEditIuran').innerText = 'Gagal mencari data iuran.';
                }
            } catch (err) {
                document.getElementById('notifEditIuran').innerText = 'Gagal mencari data iuran.';
                console.error('[iuran-selection.js] Error searching iuran:', err);
            }
        });
        showAddIuranForm();
        fetchIuran();
    } catch (err) {
        console.error('[iuran-selection.js] Error initializing laporan-iuran-section:', err);
        if (iuranSection) iuranSection.innerHTML = '<div class="alert alert-danger">Gagal memuat Laporan Iuran. Cek konsol untuk detail.</div>';
    }
}

// Listen for DOMContentLoaded and also expose for manual re-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIuranSection);
} else {
    initIuranSection();
}
// Allow re-initialization if section is shown again
window.initIuranSection = initIuranSection;

// Inisialisasi
if (iuranSection) {
    iuranSection.classList.remove('d-none');
    iuranSection.innerHTML = `
        <h2 class="mb-3">Laporan Iuran</h2>
        <div class="card mb-4 shadow-sm">
            <div class="card-body">
                <form id="formCariEditIuran" class="row g-2 align-items-end mb-2">
                    <div class="col-md-4 col-12">
                        <input type="text" class="form-control" id="inputNamaEditIuran" placeholder="Cari nama">
                    </div>
                    <div class="col-md-2 col-6">
                        <button type="submit" class="btn btn-primary w-100"><i class="bi bi-search"></i> Cari</button>
                    </div>
                </form>
                <div id="notifEditIuran" class="mb-2"></div>
                <div class="small text-muted mb-2">Masukkan nama anggota untuk mengedit data. Nama anggota dapat dilihat pada tabel di bawah.</div>
            </div>
        </div>
        <div id="iuranFormDiv" class="mb-4"></div>
        <div class="card shadow-sm">
            <div class="card-header bg-primary text-white fw-bold">Daftar Iuran</div>
            <div class="card-body p-0">
                <div id="iuranList"></div>
            </div>
        </div>
    `;
    // Fitur pencarian nama anggota untuk edit
    document.getElementById('formCariEditIuran').addEventListener('submit', async function(e) {
        e.preventDefault();
        const nama = document.getElementById('inputNamaEditIuran').value.trim().toLowerCase();
        if (!nama) return;
        const res = await fetch(iuranApiUrl);
        const json = await res.json();
        if (json.success) {
            const found = json.data.find(iuran => iuran.anggota && iuran.anggota.toLowerCase() === nama);
            if (found) {
                showEditIuranForm(found);
                document.getElementById('notifEditIuran').innerText = '';
            } else {
                document.getElementById('notifEditIuran').innerText = 'Data dengan nama tersebut tidak ditemukan.';
                showAddIuranForm();
            }
        } else {
            document.getElementById('notifEditIuran').innerText = 'Gagal mencari data iuran.';
        }
    });
    showAddIuranForm();
    fetchIuran();
}

