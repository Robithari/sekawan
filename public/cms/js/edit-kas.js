// Script untuk fitur edit kas pada CMS
// Menangani pencarian kode, menampilkan form edit, dan submit update

document.addEventListener('DOMContentLoaded', function () {
    const formCari = document.getElementById('formCariEditKas');
    const inputKode = document.getElementById('inputKodeEditKas');
    const formEdit = document.getElementById('formEditKas');
    const btnBatal = document.getElementById('btnBatalEditKas');
    const btnSelesai = document.getElementById('btnSelesaiEditKas');
    const notif = document.getElementById('notifEditKas');

    if (formCari) {
        formCari.addEventListener('submit', async function (e) {
            e.preventDefault();
            const kode = inputKode.value.trim();
            if (!kode) return;
            notif.innerText = 'Mencari data...';
            notif.className = 'text-info';
            try {
                const res = await fetch(`/api/kas?kode=${encodeURIComponent(kode)}`);
                const json = await res.json();
                if (json.success && json.data.length > 0) {
                    const kas = json.data[0];
                    // Isi form edit
                    formEdit.kasId.value = kas.id;
                    formEdit.kode.value = kas.kode;
                    formEdit.tanggal.value = kas.tanggal && kas.tanggal._seconds ? new Date(kas.tanggal._seconds * 1000).toISOString().slice(0,10) : '';
                    formEdit.keterangan.value = kas.keterangan || '';
                    formEdit.jenis.value = kas.jenis || '';
                    formEdit.nominal.value = kas.nominal || '';
                    formEdit.style.display = 'block';
                    notif.innerText = '';
                } else {
                    notif.innerText = 'Data dengan kode tersebut tidak ditemukan.';
                    notif.className = 'text-danger';
                    formEdit.style.display = 'none';
                }
            } catch (err) {
                notif.innerText = 'Terjadi kesalahan saat mencari data.';
                notif.className = 'text-danger';
                formEdit.style.display = 'none';
            }
        });
    }

    if (formEdit) {
        formEdit.addEventListener('submit', async function (e) {
            e.preventDefault();
            notif.innerText = 'Menyimpan perubahan...';
            notif.className = 'text-info';
            const id = formEdit.kasId.value;
            const data = {
                kode: formEdit.kode.value,
                tanggal: formEdit.tanggal.value,
                keterangan: formEdit.keterangan.value,
                jenis: formEdit.jenis.value,
                nominal: formEdit.nominal.value
            };
            try {
                const res = await fetch(`/api/kas/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const json = await res.json();
                if (json.success) {
                    notif.innerText = 'Data berhasil diupdate!';
                    notif.className = 'text-success';
                    setTimeout(() => window.location.reload(), 1200);
                } else {
                    notif.innerText = 'Gagal update: ' + (json.message || '');
                    notif.className = 'text-danger';
                }
            } catch (err) {
                notif.innerText = 'Terjadi kesalahan saat update data.';
                notif.className = 'text-danger';
            }
        });
    }

    if (btnBatal) {
        btnBatal.addEventListener('click', function () {
            formEdit.style.display = 'none';
            notif.innerText = '';
        });
    }
});
