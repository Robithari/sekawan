import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "../firebase-config.js";

// Ambil slug dari URL menggunakan path tanpa query string
let slug = window.location.pathname.split("/").pop();

// Cek apakah slug ditemukan
if (!slug) {
    document.body.innerHTML = "<h1>Slug tidak ditemukan di URL!</h1>";
    throw new Error("Slug tidak ditemukan di URL.");
}

// Fungsi untuk memuat artikel berdasarkan slug
async function loadArticle() {
    try {
        console.log("Mengambil artikel dengan slug:", slug);

        // Buat query untuk mengambil artikel berdasarkan slug
        const q = query(collection(db, "articles"), where("slug", "==", slug));
        const querySnapshot = await getDocs(q);

        // Cek apakah artikel ditemukan
        if (!querySnapshot.empty) {
            const article = querySnapshot.docs[0].data();

            // Pastikan elemen ditemukan sebelum mengubah kontennya
            document.title = article.title || "Artikel tidak tersedia";
            document.querySelector('meta[property="og:title"]').setAttribute("content", article.title || '');
            document.querySelector('meta[property="og:description"]').setAttribute("content", article.titleKeterangan || '');
            document.querySelector('meta[property="og:image"]').setAttribute("content", article.photoUrl || '');

            const titleElem = document.getElementById("title");
            const titleKeteranganElem = document.getElementById("titleKeterangan");
            const tanggalPembuatanElem = document.getElementById("tanggalPembuatan");
            const photoElem = document.getElementById("photoUrl");
            const captionElem = document.getElementById("caption");
            const articleElem = document.getElementById("articles");

            if (titleElem) titleElem.textContent = article.title || "Tidak ada judul";
            if (titleKeteranganElem) titleKeteranganElem.textContent = article.titleKeterangan || "Tidak ada keterangan";
            if (tanggalPembuatanElem) {
                const date = article.tanggalPembuatan 
                    ? new Date(article.tanggalPembuatan.seconds * 1000) // Jika menggunakan Firestore Timestamp
                    : "Tidak ada tanggal";
                tanggalPembuatanElem.textContent = date.toLocaleDateString("id-ID");
            }
            if (photoElem) {
                photoElem.src = article.photoUrl || "placeholder.jpg";
                photoElem.alt = article.caption || "Gambar tidak tersedia";
            }
            if (captionElem) captionElem.textContent = article.caption || "Tidak ada caption";

            // ✅ Gunakan `innerHTML` agar tag HTML di dalam konten ditampilkan dengan benar
            if (articleElem) {
                articleElem.innerHTML = article.content || "<p>Konten tidak tersedia.</p>";
            }

            // Tambahkan delay sebelum mengirim data ke Analytics
            setTimeout(() => {
                window.dataLayer.push({
                    event: "pageDataLoaded",
                    pagePath: `/articles/view/${slug}`,
                    pageTitle: article.title,
                });

                gtag("event", "page_view", {
                    page_title: article.title,
                    page_location: window.location.href,
                });
            }, 5000);

        } else {
            console.error("Artikel tidak ditemukan dengan slug:", slug);
            document.body.innerHTML = "<h1>Artikel tidak ditemukan!</h1>";
        }
    } catch (error) {
        console.error("Gagal memuat artikel:", error);
        document.body.innerHTML = "<h1>Terjadi kesalahan saat memuat artikel.</h1>";
    }
}

// Panggil fungsi saat halaman dimuat
document.addEventListener("DOMContentLoaded", loadArticle);
