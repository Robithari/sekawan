// Semua operasi Firebase harus menggunakan window.firebase (CDN v8)
// Pastikan firebase-app.js, firebase-firestore.js sudah di-load di index.ejs
import { db } from "../firebase-config.js";

const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get('slug');

async function loadNews() {
    if (!slug) {
        document.body.innerHTML = "<h1>Slug tidak ditemukan di URL!</h1>";
        return;
    }

    try {
        const q = query(collection(db, "berita"), where("slug", "==", slug));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const news = querySnapshot.docs[0].data();
            document.getElementById("title").innerText = news.title;
            document.getElementById("content").innerHTML = news.content;
        } else {
            document.body.innerHTML = "<h1>Berita tidak ditemukan!</h1>";
        }
    } catch (error) {
        console.error("Gagal memuat berita:", error);
    }
}

document.addEventListener("DOMContentLoaded", loadNews);
