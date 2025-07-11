// Semua operasi Firebase harus menggunakan window.firebase (CDN v8)
// Pastikan firebase-app.js, firebase-auth.js, firebase-firestore.js, firebase-storage.js sudah di-load di index.ejs

// Semua akses Firebase via window.firebase (CDN v8)
var storage = window.firebase.storage ? window.firebase.storage() : null;
var auth = window.firebase.auth ? window.firebase.auth() : null;
var db = window.firebase.firestore ? window.firebase.firestore() : null;

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
            const carouselItem = '<div class="carousel-item-admin" data-id="' + imageId + '">' +
                '<img src="' + imageUrl + '" alt="Carousel Image" class="img-thumbnail" style="max-width: 150px;">' +
                '<button class="btn btn-danger btn-sm delete-btn">Hapus</button>' +
                '</div>';
            carouselSelection.innerHTML += carouselItem;
        });
        document.querySelectorAll('.delete-btn').forEach(function(button) {
            button.addEventListener('click', async function (e) {
                const itemId = e.target.closest('.carousel-item-admin').getAttribute('data-id');
                await window.deleteCarouselImage(itemId);
            });
        });
    } catch (error) {
        console.error("Error loading carousel contents:", error);
    }
};

// Fungsi untuk menambahkan gambar baru
window.addCarouselImage = async function(e) {
    e.preventDefault();
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) {
        alert('Mohon pilih gambar untuk diunggah.');
        return;
    }
    const user = auth && auth.currentUser;
    if (!user) {
        alert('Anda perlu login untuk mengupload gambar.');
        return;
    }
    try {
        var storageRef = storage.ref('carousel/' + file.name);
        var uploadTask = storageRef.put(file);
        uploadTask.on('state_changed', null, function(error) {
            console.error("Error uploading image:", error);
        }, async function() {
            var downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
            await db.collection("carousel").add({ imageUrl: downloadURL });
            document.getElementById('carouselForm').reset();
            window.loadCarouselContents();
        });
    } catch (error) {
        console.error("Error adding carousel image:", error);
    }
}

// Fungsi untuk menghapus gambar dari carousel
window.deleteCarouselImage = async function(id) {
    try {
        await db.collection("carousel").doc(id).delete();
        window.loadCarouselContents();
    } catch (error) {
        console.error("Error deleting carousel image:", error);
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
