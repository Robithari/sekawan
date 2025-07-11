function levenshteinDistance(a, b) {
    const matrix = [];

    // increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // increment each column in the first row
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

function search() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toLowerCase();
    const table = document.getElementById('data-table');
    const tr = table.getElementsByTagName('tr');
    let found = false;

    // Array untuk menyimpan kandidat hasil fuzzy
    const candidates = [];

    // Loop melalui semua baris tabel, kecuali header
    for (let i = 1; i < tr.length; i++) {
        const td = tr[i].getElementsByTagName('td')[2]; // Kolom Nama
        if (td) {
            const txtValue = td.textContent || td.innerText;
            const txtValueLower = txtValue.toLowerCase();

            if (txtValueLower.indexOf(filter) > -1) {
                tr[i].style.display = '';
                found = true;
            } else {
                tr[i].style.display = 'none';
                // Hitung jarak Levenshtein untuk kandidat fuzzy
                const distance = levenshteinDistance(filter, txtValueLower);
                candidates.push({row: tr[i], distance: distance, name: txtValue});
            }
        }
    }

    if (!found) {
        // Jika tidak ada hasil tepat, tampilkan maksimal 3 hasil terdekat
        candidates.sort((a, b) => a.distance - b.distance);
        const maxResults = 3;
        let shown = 0;

        // Tampilkan keterangan "Mungkin yang anda maksud..."
        const searchHint = document.getElementById('searchHint');
        if (searchHint) {
            searchHint.style.display = 'block';
        }

        for (let i = 0; i < candidates.length && shown < maxResults; i++) {
            candidates[i].row.style.display = '';
            shown++;
        }

        if (shown === 0) {
            alert('Data tidak ditemukan.');
            if (searchHint) {
                searchHint.style.display = 'none';
            }
        }
    } else {
        // Sembunyikan keterangan jika ada hasil tepat
        const searchHint = document.getElementById('searchHint');
        if (searchHint) {
            searchHint.style.display = 'none';
        }
    }
}

function cancelSearch() {
    const input = document.getElementById('searchInput');
    input.value = '';
    const table = document.getElementById('data-table');
    const tr = table.getElementsByTagName('tr');

    // Tampilkan semua baris tabel
    for (let i = 1; i < tr.length; i++) {
        tr[i].style.display = '';
    }

    // Sembunyikan keterangan pencarian fuzzy
    const searchHint = document.getElementById('searchHint');
    if (searchHint) {
        searchHint.style.display = 'none';
    }
}

// Tambahkan event listener untuk input search agar jika dikosongkan secara manual, tabel kembali ke kondisi semula dan sembunyikan keterangan
document.addEventListener('DOMContentLoaded', function () {
    const input = document.getElementById('searchInput');
    input.addEventListener('input', function () {
        if (this.value === '') {
            const table = document.getElementById('data-table');
            const tr = table.getElementsByTagName('tr');
            for (let i = 1; i < tr.length; i++) {
                tr[i].style.display = '';
            }
            const searchHint = document.getElementById('searchHint');
            if (searchHint) {
                searchHint.style.display = 'none';
            }
        }
    });
});
