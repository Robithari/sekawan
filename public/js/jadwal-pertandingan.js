document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'https://script.googleusercontent.com/macros/echo?user_content_key=k3wU5zfK3-DW2Vo34Q6-ewmfpREpWbK0dfljFBd4BPzYkLMkFAR3SJh8mEDulwhwaN--kc1oialmNsXVayUS965zW5owxlZTm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnHDsBA6sOiRdcN-kLg6IjGxorAwSZE5V4kOENSFM87NWhh8eVEm3u2M2zCzCOQYoo7iDpELgRwTmAOBD0Lu6gwQafWUebtRFJA&lib=MzYoBrZdJ1ebCVURGRsyHWw3C713IOBJS';

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Data yang diterima dari API:', data);

            const jadwalData = data["JADWAL PERTANDINGAN"]; // Sesuaikan dengan nama data dalam API

            if (Array.isArray(jadwalData)) {
                const tableBody = document.querySelector('#data-table tbody');
                tableBody.innerHTML = ''; // Bersihkan tabel sebelum menambahkan data

                jadwalData.forEach((record, index) => {
                    // Lewatkan baris yang berisi header kolom dari API (biasanya di baris pertama)
                    if (record.TANGGAL === "TANGGAL" && record.HARI === "HARI") {
                        return; // Tidak menambahkan header kolom dua kali
                    }

                    if (record.TANGGAL || record.PERTANDINGAN || record.KETERANGAN) { // Cek jika data terisi
                        const row = document.createElement('tr');

                        // Daftar kolom yang ingin ditampilkan
                        const columnsToShow = ['TANGGAL', 'HARI', 'PUKUL', 'PERTANDINGAN', 'KETERANGAN', 'LOKASI'];

                        columnsToShow.forEach(key => {
                            const cell = document.createElement('td');
                            const value = record[key];

                            cell.textContent = value || '-'; // Jika tidak ada nilai, tampilkan '-'
                            row.appendChild(cell);
                        });

                        // Tambahkan kelas 'gray-background' setiap baris ganjil (index 1, 3, 5, ...)
                        if (index % 2 === 0) {
                            row.classList.add('gray-background');
                        }

                        tableBody.appendChild(row);
                    }
                });
            } else {
                console.error('Data JADWAL PERTANDINGAN tidak ditemukan atau tidak berbentuk array.');
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
});

// Tambahkan CSS untuk warna abu-abu pada baris dan hijau muda pada header
const style = document.createElement('style');
style.textContent = `
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
    }
`;
document.head.appendChild(style);
