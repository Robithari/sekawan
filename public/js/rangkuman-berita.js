// Semua operasi Firebase harus menggunakan window.firebase (CDN v8)
// Pastikan firebase-app.js, firebase-firestore.js sudah di-load di index.ejs
// Contoh akses:
// const db = firebase.firestore();
// const beritaCollectionRef = db.collection('berita');

// Fungsi untuk memuat dan menampilkan berita
async function loadBerita() {
    const container = document.getElementById('berita-container');
    container.innerHTML = ''; // Bersihkan konten sebelumnya

    // Aktifkan atau nonaktifkan mode debug
    const isDebugMode = false;

    try {
        if (isDebugMode) console.log('Mengambil data berita dari Firestore...');

        // Ambil semua berita dan urutkan berdasarkan tanggalPembuatan secara menurun
        const q = query(beritaCollectionRef, orderBy('tanggalPembuatan', 'desc'));
        const querySnapshot = await getDocs(q);

        if (isDebugMode) console.log('Jumlah berita ditemukan:', querySnapshot.size);

        if (querySnapshot.empty) {
            container.innerHTML = '<p>Tidak ada berita yang tersedia.</p>';
            return;
        }

        querySnapshot.forEach((docSnapshot) => {
            const berita = docSnapshot.data();
            if (isDebugMode) console.log('Berita ditemukan:', berita);

            const beritaHTML = generateBeritaCard(berita);
            container.insertAdjacentHTML('beforeend', beritaHTML);
        });

    } catch (error) {
        console.error('Error saat memuat berita:', error.message);
        container.innerHTML = '<p>Gagal memuat berita. Silakan coba lagi nanti.</p>';
    }
}

// Fungsi untuk membuat HTML card berita sesuai dengan struktur yang diminta
function generateBeritaCard(berita) {
    const beritaDate = new Date(berita.tanggalPembuatan).toLocaleDateString('id-ID');

    return `
        <div class="informasi">
            <!-- Link diubah menjadi sesuai dengan route /berita/:slug -->
            <a href="/berita/${berita.slug}">
                <div class="card no-border">
                    <div class="row g-0 align-items-center">
                        <div class="col-md-4 col-sm-4 col-4" style="width: auto; border-radius: 10px;">
                            <img src="${berita.photoUrl}" class="custom-image" alt="${berita.title}">
                        </div>
                        <div class="col-md-8 col-sm-8 col-8">
                            <div class="card-body">
                                <div class="container-title">
                                    <p class="card-title custom-title text-start mb-0">${berita.title}</p>
                                </div>
                                <p class="card-text">${beritaDate}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </a>
        </div>`;
}

// Panggil fungsi loadBerita saat halaman dimuat
document.addEventListener('DOMContentLoaded', loadBerita);
