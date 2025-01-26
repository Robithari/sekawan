import { collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js"; // Import Storage
import { db } from '../../firebase-config.js'; // pastikan file ini sudah benar
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js"; // Import Firebase Auth

const storage = getStorage(); // Inisialisasi Storage
const auth = getAuth(); // Inisialisasi Auth

// Fungsi untuk memuat gambar carousel yang ada
export async function loadCarouselContents() {
    try {
        const querySnapshot = await getDocs(collection(db, "carousel"));
        const carouselSelection = document.getElementById('carousel-selection');
        carouselSelection.innerHTML = ''; // Hapus konten lama

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const imageUrl = data.imageUrl;
            const imageId = doc.id;

            // Tambahkan item carousel
            const carouselItem = `
                <div class="carousel-item-admin" data-id="${imageId}">
                    <img src="${imageUrl}" alt="Carousel Image" class="img-thumbnail" style="max-width: 150px;">
                    <button class="btn btn-danger btn-sm delete-btn">Hapus</button>
                </div>
            `;
            carouselSelection.innerHTML += carouselItem;
        });

        // Event listener untuk setiap tombol hapus
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async function (e) {
                const itemId = e.target.closest('.carousel-item-admin').getAttribute('data-id');
                await deleteCarouselImage(itemId);
            });
        });

    } catch (error) {
        console.error("Error loading carousel contents:", error);
    }
}

// Fungsi untuk menambahkan gambar baru
export async function addCarouselImage(e) {
    e.preventDefault(); // Mencegah reload halaman
    const fileInput = document.getElementById('fileInput'); // Ambil input file
    const file = fileInput.files[0]; // Ambil file dari input

    if (!file) {
        alert('Mohon pilih gambar untuk diunggah.');
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
        await addDoc(collection(db, "carousel"), { imageUrl: downloadURL });

        document.getElementById('carouselForm').reset();
        loadCarouselContents(); // Reload carousel setelah menambahkan gambar baru
    } catch (error) {
        console.error("Error adding carousel image:", error);
    }
}

// Fungsi untuk menghapus gambar dari carousel
export async function deleteCarouselImage(id) {
    try {
        await deleteDoc(doc(db, "carousel", id));
        loadCarouselContents(); // Reload carousel setelah menghapus gambar
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
