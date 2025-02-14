document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'https://script.googleusercontent.com/macros/echo?user_content_key=Yqyq1DhrzBe_pzk0D3UUfGB_sKx2T2TqV2XJYhejgo3WXzBw1IYswWdHQJoyct88kBU6CF9RVRuC3MwlKp4sM9lzXBxDc42dm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnLGVgPpKtvYPUnnNghbhLesi3kyGTxNlq-mqqu6k0bRGx0g3iP6Nsd77ABz2ja6HbwgMdF1gKSmKbkF-zXBdD6hz3abTnINGdA&lib=MRZfPoZa3sDHpg9sMQ6l5IA3C713IOBJS';  // Ganti dengan URL Apps Script Anda

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const barangData = data["BARANG-INVENTARIS"];
            const tableBody = document.querySelector('#data-table tbody');

            barangData.forEach((record, index) => {
                // Periksa apakah ada data yang terisi, jika tidak lewati baris ini
                const isEmpty = Object.values(record).every(value => value === '' || value === null || value === undefined);
                if (isEmpty) return;

                const row = document.createElement('tr');

                Object.keys(record).forEach(key => {
                    const cell = document.createElement('td');
                    const value = record[key];

                    // Jika ada kolom yang perlu format khusus, bisa ditambahkan di sini
                    cell.textContent = value || '-'; // Tampilkan '-' jika data kosong
                    row.appendChild(cell);
                });

                // Tambahkan latar belakang abu-abu pada baris ganjil
                if (index % 2 === 0) {
                    row.classList.add('gray-background');
                }

                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });

    // Fungsi untuk format mata uang (jika dibutuhkan)
    function formatCurrency(num) {
        if (num === null || num === undefined || isNaN(num) || num === '') {
            return '-';
        }
        return `Rp. ${parseInt(num).toLocaleString('id-ID')}`;
    }
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
