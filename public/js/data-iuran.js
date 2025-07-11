document.addEventListener('DOMContentLoaded', () => {
    // URL API yang digunakan
    const apiUrl = 'https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLga0neZxigd-Rg2j3auBYTYbRNZLTERGIgIYJxOHbCXneV2SfJ618R-kmae_fYjKjjeFCVbeXtdC5NohjsQ8IyhyuWLIbBAux_8rlUI8S6syJFc6owJpw3eEpGktAuqo9CqyPa0cupJNve0UECI2EKDVLIYBvTWZTete2mTTt0sSDEkmGyZCPpPnIlvKSc3NBqJCOeZaXubq7aLBJrdGc7i47rhEZHb64pKu13aTAaO8htgvMBXRagc-CkZvXzT75gdb04P8f4491PdR24xOg_yhxRpTA&lib=MAI_rgUitCMaNv_S3rIr3yFeS6DrsjUUV';

    // Fungsi format rupiah
    function formatRupiah(angka) {
        if (typeof angka !== "number") {
            angka = parseFloat(angka);
        }
        if (isNaN(angka)) {
            return "-";
        }
        return "Rp" + angka.toLocaleString('id-ID');
    }

    // Hapus/matikan seluruh kode fetch spreadsheet dan manipulasi tabel di sini
    // Karena data sudah diambil dari server (EJS), tidak perlu fetch API spreadsheet lagi

    // fetch(apiUrl)
    //     .then(response => {
    //         console.log('Fetch response status:', response.status);
    //         return response.json();
    //     })
    //     .then(data => {
    //         console.log('Data diterima dari API:', data);
    //         const anggotaData = data.IURAN;
    //         const tableBody = document.querySelector('#data-table tbody');

    //         if (!tableBody) {
    //             console.error('Tabel body dengan id #data-table tbody tidak ditemukan.');
    //             return;
    //         }

    //         // Bersihkan isi tbody sebelum menambahkan data baru
    //         tableBody.innerHTML = '';

    //         // Mulai loop dari index 1 untuk melewati header API
    //         anggotaData.slice(1).forEach((item, index) => {
    //             // Buat baris baru untuk setiap anggota
    //             const row = document.createElement('tr');

    //             // Tandai 2 baris terakhir dengan class black-row
    //             if (index >= anggotaData.slice(1).length - 2) {
    //                 row.classList.add('black-row');
    //             }

    //             // Tandai baris JUMLAH PERBULAN dan JUMLAH TOTAL dengan class green-row
    //             if (item.ANGGOTA === "JUMLAH PERBULAN" || item.ANGGOTA === "JUMLAH TOTAL") {
    //                 row.classList.add('green-row');
    //             }

    //             // Tandai baris genap dengan class yellow-background, kecuali baris JUMLAH PERBULAN dan JUMLAH TOTAL
    //             if (index % 2 === 1 && item.ANGGOTA !== "JUMLAH PERBULAN" && item.ANGGOTA !== "JUMLAH TOTAL") {
    //                 row.classList.add('yellow-background');
    //             }

    //             // Tandai baris genap dengan class yellow-background, kecuali baris JUMLAH PERBULAN dan JUMLAH TOTAL
    //             if (index % 2 === 1 && item.ANGGOTA !== "JUMLAH PERBULAN" && item.ANGGOTA !== "JUMLAH TOTAL") {
    //                 row.classList.add('yellow-background');
    //             }

    //             // Kolom No. urut, kecuali untuk baris JUMLAH PERBULAN dan JUMLAH TOTAL
    //             if (item.ANGGOTA !== "JUMLAH PERBULAN" && item.ANGGOTA !== "JUMLAH TOTAL") {
    //                 const noCell = document.createElement('td');
    //                 noCell.textContent = index + 1;
    //                 noCell.style.textAlign = 'center';
    //                 row.appendChild(noCell);
    //             } else {
    //                 // Buat kolom kosong untuk nomor urut pada baris JUMLAH PERBULAN dan JUMLAH TOTAL
    //                 const noCell = document.createElement('td');
    //                 noCell.textContent = '';
    //                 row.appendChild(noCell);
    //             }

    //             // Kolom Anggota, dibuat rata kiri
    //             const anggotaCell = document.createElement('td');
    //             anggotaCell.textContent = item.ANGGOTA;
    //             anggotaCell.style.textAlign = 'left';
    //             row.appendChild(anggotaCell);

    //             // Loop untuk bulan-bulan dan jumlah
    //             ['MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'].forEach(bulan => {
    //                 const bulanCell = document.createElement('td');
    //                 if (item.ANGGOTA === "JUMLAH PERBULAN" || item.ANGGOTA === "JUMLAH TOTAL") {
    //                     bulanCell.textContent = (item[bulan] === true) ? '✔' : '';
    //                 } else {
    //                     bulanCell.textContent = item[bulan] === true ? '✔' : (item[bulan] === false ? '-' : '-');
    //                 }
    //                 row.appendChild(bulanCell);
    //             });

    //             // Kolom Jumlah dengan format rupiah, jika tidak ada nilai ganti dengan '-'
    //             const jumlahCell = document.createElement('td');
    //             if (item.ANGGOTA === "JUMLAH PERBULAN" || item.ANGGOTA === "JUMLAH TOTAL") {
    //                 jumlahCell.textContent = item.JUMLAH ? formatRupiah(item.JUMLAH) : '';
    //             } else {
    //                 jumlahCell.textContent = item.JUMLAH ? formatRupiah(item.JUMLAH) : '-';
    //             }
    //             jumlahCell.style.textAlign = 'right';
    //             row.appendChild(jumlahCell);

    //             // Masukkan baris ke dalam table
    //             tableBody.appendChild(row);
    //         });
    //     })
    //     .catch(error => console.error('Error fetching data:', error));
});
