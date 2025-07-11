document.addEventListener('DOMContentLoaded', function() {
    const loadingIndicator = document.createElement('div');
    loadingIndicator.textContent = 'Loading...';
    loadingIndicator.style.position = 'fixed';
    loadingIndicator.style.top = '50%';
    loadingIndicator.style.left = '50%';
    loadingIndicator.style.transform = 'translate(-50%, -50%)';
    loadingIndicator.style.backgroundColor = 'white';
    loadingIndicator.style.padding = '20px';
    loadingIndicator.style.border = '1px solid #ccc';
    loadingIndicator.style.zIndex = '1000';
    document.body.appendChild(loadingIndicator);
    const apiUrl = '/api/dokumentasi';

    fetch(apiUrl + '?_=' + Date.now())
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            document.body.removeChild(loadingIndicator); // Remove loading indicator
            // Data Firestore: array of object, field: tanggal, keterangan, LINK FOTO
            const dokumentasiData = Array.isArray(data) ? data : [];
            const tableBody = document.querySelector('#data-table tbody');
            tableBody.innerHTML = '';
            dokumentasiData.forEach((record, index) => {
                // Tampilkan hanya jika ada keterangan atau link foto
                if (record.keterangan || record['LINK FOTO']) {
                    const row = document.createElement('tr');
                    // Kolom: No, Tanggal, Keterangan, Link Foto
                    // Tanggal: pakai record.tanggal, jika tidak ada pakai createdAt/updatedAt
                    let tanggal = record.tanggal;
                    if (!tanggal) {
                        tanggal = record.createdAt ? record.createdAt.slice(0, 10) : (record.updatedAt ? record.updatedAt.slice(0, 10) : '-');
                    }
                    // Kolom Link Foto: anchor ke LINK FOTO jika ada
                    const fotoUrl = record['LINK FOTO'] || '';
                    const fotoLink = fotoUrl ? `<a href="${fotoUrl}" target="_blank" rel="noopener noreferrer">Klik di sini</a>` : '-';
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${tanggal || '-'}</td>
                        <td>${record.keterangan || '-'}</td>
                        <td>${fotoLink}</td>
                    `;
                    if (index % 2 === 0) {
                        row.classList.add('gray-background');
                    }
                    tableBody.appendChild(row);
                }
            });
        })
        .catch(error => {
            document.body.removeChild(loadingIndicator);
            console.error('Error fetching data:', error);
        });
});

// Tambahkan CSS untuk warna abu-abu pada baris dan hijau muda pada header
const style = document.createElement('style');
style.textContent = `
    table {
        width: 100%;
        border-collapse: collapse;
        table-layout: auto; /* Biarkan kolom menyesuaikan lebar berdasarkan konten */
    }
    .gray-background {
        background-color: #f0f0f0; /* Warna abu-abu untuk baris data */
    }
    thead th {
        background-color: #90ee90; /* Warna hijau muda untuk header */
        padding: 8px;
        text-align: left;
    }
    td {
        padding: 8px;
        word-wrap: break-word; /* Membungkus teks panjang agar tidak memanjang ke luar kolom */
    }
    a.purple-link {
        color: purple;
    }
`;
document.head.appendChild(style);
