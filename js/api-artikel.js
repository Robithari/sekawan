// js/api-artikel.js
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "../firebase-config.js";

// Ambil slug dari URL
const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get('slug');

// Fungsi untuk memuat artikel berdasarkan slug
async function loadArticle() {
    if (!slug) {
        document.body.innerHTML = "<h1>Slug tidak ditemukan di URL!</h1>";
        return;
    }

    try {
        // Buat query untuk mengambil artikel berdasarkan slug
        const q = query(collection(db, "articles"), where("slug", "==", slug));
        const querySnapshot = await getDocs(q);

        // Cek apakah artikel ditemukan
        if (!querySnapshot.empty) {
            const article = querySnapshot.docs[0].data();

            // Mengisi title halaman dan meta Open Graph
            document.title = article.title || "Artikel tidak tersedia"; 
            document.querySelector('meta[property="og:title"]').setAttribute("content", article.title || '');
            document.querySelector('meta[property="og:description"]').setAttribute("content", article.titleKeterangan || '');
            document.querySelector('meta[property="og:image"]').setAttribute("content", article.photoUrl || '');

            // Tampilkan data artikel ke elemen HTML
            document.getElementById("title").innerText = article.title || "Judul tidak tersedia";
            document.getElementById("titleKeterangan").innerText = article.titleKeterangan || '';
            document.getElementById("tanggalPembuatan").innerText = new Date(article.tanggalPembuatan).toLocaleDateString('id-ID');
            document.getElementById("photoUrl").src = article.photoUrl || '';
            document.getElementById("photoUrl").alt = article.caption || '';
            document.getElementById("caption").innerText = article.caption || '';

            // Jika konten disimpan dengan tag yang di-escape, dekode terlebih dahulu
            const parser = new DOMParser();
            const decodedContent = parser.parseFromString(article.content || '', 'text/html').body.innerHTML;

            document.getElementById("articles").innerHTML = decodedContent;

            // Kirim event page_view ke Google Analytics setelah data siap
            gtag('event', 'page_view', {
                'page_title': document.title,
                'page_location': window.location.href
            });
        } else {
            // Jika artikel tidak ditemukan
            document.body.innerHTML = "<h1>Artikel tidak ditemukan!</h1>";
        }
    } catch (error) {
        console.error("Gagal memuat artikel:", error);
        document.body.innerHTML = "<h1>Terjadi kesalahan saat memuat artikel.</h1>";
    }
}

// Panggil fungsi saat halaman dimuat
document.addEventListener("DOMContentLoaded", loadArticle);
