document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'https://script.googleusercontent.com/macros/echo?user_content_key=2tlFh9Em-8BrR_JjPx3aQ-sDEIKEdwQg10yiCU4zf1Jm29nmzTv4VR3T4bxmPw6fVV-SfjjVjaVaquOJGIwOrRDz7Gy6GvlWm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnDQ3-UM55TGsEMEgUfElc6Of-3K5ZS9UOYTk0rvMmc-MD610LTi-I75zKPOseyOUEg7-xfGCRrZHesQ3EUd0MNPacrY_wOGqBA&lib=MOgvvmbSEQE02bq4Gi45tbleS6DrsjUUV';

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const kasData = data.KAS;
            const tableBody = document.querySelector('#data-table tbody');

            kasData.forEach((record, index) => {
                const row = document.createElement('tr');
                
                Object.keys(record).forEach(key => {
                    const cell = document.createElement('td');
                    const value = record[key];

                    if (key === 'PEMASUKAN' || key === 'PENGELUARAN' || key === 'SALDO') {
                        cell.innerHTML = formatCurrency(value);
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
            });
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });

    // Fungsi untuk format mata uang
    function formatCurrency(num) {
        if (num === null || num === undefined || isNaN(num) || num === '') {
            return '-';
        }
        return `<div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>Rp.</span>
                    <span>${parseInt(num).toLocaleString('id-ID')}</span>
                </div>`;
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
