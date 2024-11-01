import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "../firebase-config.js";

// Ambil slug dari URL
const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get('slug');

// Fungsi untuk memuat berita berdasarkan slug
async function loadBerita() {
    if (!slug) {
        document.body.innerHTML = "<h1>Slug tidak ditemukan di URL!</h1>";
        return;
    }

    try {
        // Query untuk mendapatkan berita berdasarkan slug
        const q = query(collection(db, "berita"), where("slug", "==", slug));
        const querySnapshot = await getDocs(q);

        // Cek apakah berita ditemukan
        if (!querySnapshot.empty) {
            const berita = querySnapshot.docs[0].data();

            // Mengisi title halaman dan meta Open Graph
            document.title = berita.title || "Berita tidak tersedia"; 
            document.querySelector('meta[property="og:title"]').setAttribute("content", berita.title || '');
            document.querySelector('meta[property="og:description"]').setAttribute("content", berita.titleKeterangan || '');
            document.querySelector('meta[property="og:image"]').setAttribute("content", berita.photoUrl || '');

            // Tampilkan data berita ke elemen HTML
            document.getElementById("title").innerText = berita.title || "Judul tidak tersedia";
            document.getElementById("titleKeterangan").innerText = berita.titleKeterangan || '';
            document.getElementById("tanggalPembuatan").innerText = new Date(berita.tanggalPembuatan).toLocaleDateString('id-ID');
            document.getElementById("photoUrl").src = berita.photoUrl || '';
            document.getElementById("photoUrl").alt = berita.caption || '';
            document.getElementById("caption").innerText = berita.caption || '';

            // Jika konten disimpan dengan tag yang di-escape, dekode terlebih dahulu
            const parser = new DOMParser();
            const decodedContent = parser.parseFromString(berita.content || '', 'text/html').body.innerHTML;

            document.getElementById("articles").innerHTML = decodedContent;

            // Tambahkan delay 5 detik sebelum mengirim data ke Analytics
            setTimeout(() => {
                // Kode dataLayer.push untuk mengirim virtual pageview ke GTM setelah data Firestore berhasil dimuat
                window.dataLayer.push({
                    'event': 'pageDataLoaded',
                    'pagePath': `/berita/${slug}`, // Path atau URL halaman spesifik
                    'pageTitle': berita.title // Judul halaman setelah data dimuat
                });

                // Jika Anda menggunakan gtag.js secara langsung
                gtag('event', 'page_view', {
                    'page_title': berita.title,
                    'page_location': window.location.href
                });
            }, 5000); // Delay 5 detik (5000 ms)

        } else {
            document.body.innerHTML = "<h1>Berita tidak ditemukan!</h1>";
        }
    } catch (error) {
        console.error("Gagal memuat berita:", error);
        document.body.innerHTML = "<h1>Terjadi kesalahan saat memuat berita.</h1>";
    }
}

// Panggil fungsi saat halaman dimuat
document.addEventListener("DOMContentLoaded", loadBerita);
