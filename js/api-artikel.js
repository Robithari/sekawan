// Fungsi untuk memuat artikel berdasarkan slug
async function loadArticle() {
    if (!slug) {
        document.body.innerHTML = "<h1>Maaf Halaman Yang Anda Tuju Salah</h1>";
        return;
    }

    try {
        const q = query(collection(db, "articles"), where("slug", "==", slug));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const article = querySnapshot.docs[0].data();

            // Tampilkan data artikel ke elemen HTML
            document.getElementById("title").innerText = article.title;
            document.getElementById("titleKeterangan").innerText = article.titleKeterangan;
            document.getElementById("tanggalPembuatan").innerText = 
                new Date(article.tanggalPembuatan).toLocaleDateString('id-ID');
            document.getElementById("photoUrl").src = article.photoUrl;
            document.getElementById("caption").innerText = article.caption;
            document.getElementById("articles").innerHTML = article.content;

            // Memperbarui Meta Tag untuk Link Preview
            document.querySelector('meta[property="og:title"]').setAttribute('content', article.title);
            document.querySelector('meta[property="og:description"]').setAttribute(
                'content', stripHtml(article.content).split('. ')[0] + '.'
            );
            document.querySelector('meta[property="og:image"]').setAttribute('content', article.photoUrl);

            // Tandai bahwa halaman siap di-render oleh bot
            window.prerenderReady = true;

        } else {
            document.body.innerHTML = "<h1>Artikel tidak ditemukan!</h1>";
        }
    } catch (error) {
        console.error("Gagal memuat artikel:", error);
        document.body.innerHTML = "<h1>Terjadi kesalahan saat memuat artikel.</h1>";
    }
}

// Panggil fungsi saat halaman dimuat
document.addEventListener("DOMContentLoaded", loadArticle);
