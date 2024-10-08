document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'https://script.googleusercontent.com/macros/echo?user_content_key=CZfT4ukELTEw74U8y4_OVSdJA0MoRPTnbfrM_pEJnBf_yj0iY0f6c9xlI4u9RgHKuk3zOPedAt89EJiJW5Ng1pQVVtY5QfDsm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnFp8IpH6vIoxlz6z1vHvBGveIMkwE5hxhRZgrX7pPlQO98dtL__CtYPa3KdNnIXbUm9WnqK1sm1dRh5mrQJuQ_bE78tZtLS8jw&lib=MOgvvmbSEQE02bq4Gi45tbleS6DrsjUUV';

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Data yang diterima dari API:', data);

            const dokumentasiData = data.DOKUMENTASI;

            if (Array.isArray(dokumentasiData)) {
                const tableBody = document.querySelector('#data-table tbody');

                dokumentasiData.forEach((record, index) => {
                    if (record.TANGGAL || record.PERTANDINGAN || record["LINK FOTO"] || record.KETERANGAN) {
                        const row = document.createElement('tr');

                        // Daftar kolom yang ingin ditampilkan
                        const columnsToShow = ['TANGGAL', 'PERTANDINGAN', 'LINK FOTO', 'KETERANGAN'];

                        columnsToShow.forEach(key => {
                            const cell = document.createElement('td');
                            const value = record[key];

                            // Jika kolom adalah 'LINK FOTO', buat tautan yang mengarah ke 'SUMBER LINK'
                            if (key === 'LINK FOTO' && value && record["SUMBER LINK"]) {
                                const link = document.createElement('a');
                                link.href = record["SUMBER LINK"]; // Tautkan ke 'SUMBER LINK'
                                link.textContent = value; // Tampilkan teks dari 'LINK FOTO'
                                link.target = '_blank'; // Buka link di tab baru
                                link.rel = 'noopener noreferrer'; // Untuk keamanan
                                link.classList.add('purple-link'); // Tambahkan kelas CSS untuk warna ungu
                                cell.appendChild(link);
                            } else {
                                cell.textContent = value || '-';
                            }
                            row.appendChild(cell);
                        });

                        // Tambahkan latar belakang abu-abu pada baris ganjil
                        if (index % 2 === 0) {
                            row.classList.add('gray-background');
                        }

                        tableBody.appendChild(row);
                    }
                });
            } else {
                console.error('Data DOKUMENTASI tidak ditemukan atau tidak berbentuk array.');
            }
        })
        .catch(error => {
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
