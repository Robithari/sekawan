document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'https://script.googleusercontent.com/macros/echo?user_content_key=G2HighRNLc-g5LxvOa7i0PgQ3g_HtOeVPMts7ZwxrjWEbFzu-AKz7L3ho4f8kslgPt4K1eFPmQxKuou_r1yFGir6xEtd5XcXm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnG317m3luJSjfbNMgqvpzOxepHJyx84c2_FeiA7UJskzjSVuJvBr9n4PNZRHSLaqbKdDB8a3hDtTDlmrIyfe5rlFmNp2exz8OQ&lib=MzYoBrZdJ1ebCVURGRsyHWw3C713IOBJS';

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

                jadwalData.forEach(record => {
                    // Lewatkan baris yang berisi header kolom
                    if (record.TANGGAL === "TANGGAL" && record.HARI === "HARI") {
                        return;
                    }

                    if (record.TANGGAL || record.PERTANDINGAN || record.KETERANGAN) { // Cek jika data terisi
                        const row = document.createElement('tr');

                        // Daftar kolom yang ingin ditampilkan
                        const columnsToShow = ['TANGGAL', 'HARI', 'PERTANDINGAN', 'KETERANGAN'];

                        columnsToShow.forEach(key => {
                            const cell = document.createElement('td');
                            const value = record[key];

                            cell.textContent = value || '-'; // Jika tidak ada nilai, tampilkan '-'
                            row.appendChild(cell);
                        });

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

// Tambahkan CSS untuk warna ungu (jika diperlukan)
const style = document.createElement('style');
style.textContent = `
    .purple-link {
        color: purple;
    }
`;
document.head.appendChild(style);
