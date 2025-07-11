// Semua operasi Firebase harus menggunakan window.firebase (CDN v8)
// Pastikan firebase-app.js, firebase-auth.js, firebase-firestore.js, firebase-storage.js sudah di-load di HTML
var db = window.firebase.firestore();
var storage = window.firebase.storage();
var auth = window.firebase.auth();

// Fungsi untuk memuat gambar carousel yang ada
window.loadCarouselContents = async function() {
    try {
        const querySnapshot = await db.collection("carousel").get();
        const carouselSelection = document.getElementById('carousel-selection');
        carouselSelection.innerHTML = '';

        querySnapshot.forEach(function(doc) {
            const data = doc.data();
            const imageUrl = data.imageUrl;
            const imageId = doc.id;
            const link = data.link || '';

            // Tambahkan item carousel
            const carouselItem = `
                <div class="carousel-item-admin" data-id="${imageId}">
                    <img src="${imageUrl}" alt="Carousel Image" class="img-thumbnail" style="max-width: 150px;">
                    ${link ? `<div class='mt-2'><span class='badge bg-info text-dark'>${link}</span></div>` : ''}
                    <button class="btn btn-danger btn-sm delete-btn mt-2">Hapus</button>
                </div>
            `;
            carouselSelection.innerHTML += carouselItem;
        });

        // Event listener untuk setiap tombol hapus
        document.querySelectorAll('.delete-btn').forEach(function(button) {
            button.addEventListener('click', async function (e) {
                const itemId = e.target.closest('.carousel-item-admin').getAttribute('data-id');
                await window.deleteCarouselImage(itemId);
            });
        });

    } catch (error) {
        console.error("Error loading carousel contents:", error);
    }
}

// Fungsi untuk menambahkan gambar baru dengan link internal

window.addCarouselImage = async function(e) {
    e.preventDefault(); // Mencegah reload halaman
    const fileInput = document.getElementById('fileInput'); // Ambil input file
    const file = fileInput.files[0]; // Ambil file dari input
    const linkInput = document.getElementById('carouselLink'); // Ambil input link
    const link = linkInput ? linkInput.value.trim() : ''; // Ambil nilai link

    if (!file) {
        alert('Mohon pilih gambar untuk diunggah.');
        return;
    }
    if (!link || !link.startsWith('/')) {
        alert('Mohon masukkan link internal yang valid, awali dengan /.');
        return;
    }

    // Validasi tipe file (hanya gambar)
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        alert('Tipe file tidak valid. Harap unggah file gambar (jpeg, png, gif, webp).');
        return;
    }

    // Validasi ukuran file maksimal 5MB
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        alert('Ukuran file terlalu besar. Maksimal 5MB.');
        return;
    }

    // Cek apakah pengguna terautentikasi
    const user = auth.currentUser;
    if (!user) {
        alert('Anda perlu login untuk mengupload gambar.');
        return;
    }

    try {
        // Upload gambar ke Cloud Storage
        const storageRef = ref(storage, 'carousel/' + file.name);
        await uploadBytes(storageRef, file);

        // Mendapatkan URL download setelah upload
        const downloadURL = await getDownloadURL(storageRef);

        // Menyimpan URL gambar ke Firestore
        await addDoc(collection(db, "carousel"), { imageUrl: downloadURL, link });

        document.getElementById('carouselForm').reset();
        loadCarouselContents(); // Reload carousel setelah menambahkan gambar baru
    } catch (error) {
        console.error("Error adding carousel image:", error);
        alert("Terjadi kesalahan saat mengupload gambar. Silakan coba lagi.");
    }
}

// Fungsi untuk menghapus gambar dari carousel
window.deleteCarouselImage = async function(id) {
    try {
        await deleteDoc(doc(db, "carousel", id));
        loadCarouselContents(); // Reload carousel setelah menghapus gambar
    } catch (error) {
        console.error("Error deleting carousel image:", error);
        alert("Terjadi kesalahan saat menghapus gambar. Silakan coba lagi.");
    }
}

// Event Listener ketika halaman sudah di-load
window.addEventListener('DOMContentLoaded', function () {
    loadCarouselContents(); // Memuat gambar carousel saat halaman terbuka

    // Tambahkan event listener untuk form submit
    const carouselForm = document.getElementById('carouselForm');
    if (carouselForm) {
        carouselForm.addEventListener('submit', addCarouselImage);
    }
});
