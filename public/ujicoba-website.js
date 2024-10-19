import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM Loaded: Semua elemen tersedia.");

    try {
        const querySnapshot = await getDocs(collection(db, "articles"));

        querySnapshot.forEach((doc) => {
            const article = doc.data();
            console.log(article);  // Memastikan data dari API sudah benar

            // Tampilkan title di elemen dengan id="title"
            document.getElementById('title').innerText = article.title;

            // Tampilkan titleKeterangan di elemen dengan id="titleKeterangan"
            document.getElementById('titleKeterangan').innerHTML = `<strong>${article.titleKeterangan}</strong>`;

            // Tampilkan tanggalPembuatan di elemen dengan id="tanggalPembuatan"
            const tanggal = new Date(article.tanggalPembuatan).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            document.getElementById('tanggalPembuatan').innerText = tanggal;

            // Tampilkan caption di elemen dengan id="caption"
            document.getElementById('caption').innerText = article.caption;

            // Tampilkan photoUrl di elemen dengan id="photoUrl"
            const photoElement = document.getElementById('photoUrl');
            if (article.photoUrl) {
                photoElement.src = article.photoUrl;
                photoElement.alt = article.caption || 'Foto Artikel';
            } else {
                photoElement.src = 'img/default-image.jpg';  // Default image jika URL kosong
                photoElement.alt = 'Gambar tidak tersedia';
            }

            // Tampilkan content di elemen dengan id="articles"
            document.getElementById('articles').innerHTML = article.content;
        });
    } catch (error) {
        console.error("Error loading articles: ", error);
    }
});
