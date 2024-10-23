// Import Firebase dan Firestore dependencies
import { 
    getFirestore, collection, query, getDocs 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

// Konfigurasi Firebase (update sesuai konfigurasi Anda)
import * as firebaseConfig from "../../firebase-config.js";

// Inisialisasi Firebase
let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}

// Inisialisasi Firestore
const db = getFirestore(app);
const articleCollectionRef = collection(db, "articles"); // Pastikan koleksi bernama 'articles'

// Fungsi untuk memuat dan menampilkan artikel
async function loadArticles() {
    const container = document.getElementById('articles-container');
    container.innerHTML = ''; // Bersihkan konten sebelumnya

    try {
        console.log('Mengambil data artikel dari Firestore...');
        
        // Ambil semua artikel tanpa filter
        const q = query(articleCollectionRef);
        const querySnapshot = await getDocs(q);

        console.log('Jumlah artikel ditemukan:', querySnapshot.size);

        if (querySnapshot.empty) {
            container.innerHTML = '<p>Tidak ada artikel yang tersedia.</p>';
            return;
        }

        querySnapshot.forEach((docSnapshot) => {
            const article = docSnapshot.data();
            console.log('Artikel ditemukan:', article);

            const articleHTML = generateArticleCard(article);
            container.insertAdjacentHTML('beforeend', articleHTML);
        });

    } catch (error) {
        console.error('Error saat memuat artikel:', error.message);
        container.innerHTML = '<p>Gagal memuat artikel. Silakan coba lagi nanti.</p>';
    }
}

// Fungsi untuk membuat HTML card artikel sesuai dengan struktur yang diminta
function generateArticleCard(article) {
    const articleDate = new Date(article.tanggalPembuatan).toLocaleDateString('id-ID');

    return `
        <div class="informasi">
            <a href="/artikel-home.html?slug=${article.slug}">
                <div class="card no-border">
                    <div class="row g-0 align-items-center">
                        <div class="col-md-4 col-sm-4 col-4" style="width: auto; border-radius: 10px;">
                            <img src="${article.photoUrl}" class="custom-image" alt="${article.title}">
                        </div>
                        <div class="col-md-8 col-sm-8 col-8">
                            <div class="card-body">
                                <div class="container-title">
                                    <p class="card-title custom-title text-start mb-0">${article.title}</p>
                                </div>
                                <p class="card-text">${articleDate}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </a>
        </div>`;
}

// Panggil fungsi loadArticles saat halaman dimuat
document.addEventListener('DOMContentLoaded', loadArticles);
