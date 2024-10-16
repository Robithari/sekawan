// Import Firebase dependencies
import { 
    getFirestore, collection, addDoc, getDocs, deleteDoc, updateDoc, doc, query, where, getDoc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

// Firebase Configuration
import * as firebaseConfig from "../../firebase-config.js";

// Initialize Firebase if not already initialized
let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}

const db = getFirestore(app);

// References
const articleCollectionRef = collection(db, "articles");
const addContentForm = document.getElementById("addContentForm");
const artikelSelection = document.getElementById("artikel-selection");
const updateBtn = document.getElementById("update-btn");
const message = document.getElementById("message");
let currentArticleId = null; // Untuk tracking mode edit

// Fungsi untuk membuat slug unik dari judul
function createSlug(title) {
    return title.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');
}

// Fungsi untuk mengecek apakah slug unik, kecuali untuk artikel yang sedang diedit
async function isSlugUnique(slug, excludeId = null) {
    let q;
    if (excludeId) {
        // Firestore tidak mendukung penyaringan berdasarkan __name__ dengan operator '!=' secara langsung
        // Jadi, kita perlu mengambil semua artikel dengan slug tersebut dan mengecualikan ID yang diberikan
        q = query(articleCollectionRef, where("slug", "==", slug));
    } else {
        q = query(articleCollectionRef, where("slug", "==", slug));
    }
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return true;

    if (excludeId) {
        // Periksa apakah ada dokumen selain yang ingin diedit
        return querySnapshot.docs.length === 1 && querySnapshot.docs[0].id === excludeId;
    }

    return false;
}

// Fungsi untuk menambah artikel
async function addArticle(title, content, photoUrl, caption, titleKeterangan, tanggalPembuatan) {
    const slug = createSlug(title);

    if (!(await isSlugUnique(slug))) {
        message.textContent = "Artikel dengan judul tersebut sudah ada.";
        message.classList.remove("d-none");
        return;
    }

    try {
        const docRef = await addDoc(articleCollectionRef, {
            title,
            content,
            photoUrl,
            caption,
            titleKeterangan,
            tanggalPembuatan,
            slug
        });

        console.log(`Artikel ditambahkan dengan ID: ${docRef.id} dan slug: ${slug}`);

        message.textContent = "Artikel berhasil ditambahkan!";
        message.classList.remove("d-none");

        // Redirect ke halaman artikel
        window.location.href = `/artikel-home.html?slug=${slug}`;
    } catch (error) {
        console.error("Error saat menambahkan artikel:", error);
        message.textContent = `Gagal menambahkan artikel: ${error.message}`;
        message.classList.remove("d-none");
    }
}

// Fungsi untuk memperbarui artikel
async function updateArticle(articleId, title, content, photoUrl, caption, titleKeterangan, tanggalPembuatan) {
    const docRef = doc(db, "articles", articleId);
    let slug = createSlug(title);

    try {
        // Ambil data artikel saat ini untuk memeriksa apakah slug berubah
        const currentDoc = await getDoc(docRef);
        if (currentDoc.exists()) {
            const currentSlug = currentDoc.data().slug;
            if (slug !== currentSlug) {
                // Cek apakah slug baru unik, kecuali untuk artikel ini sendiri
                if (!(await isSlugUnique(slug, articleId))) {
                    message.textContent = "Slug baru sudah digunakan oleh artikel lain.";
                    message.classList.remove("d-none");
                    return;
                }
            }
        } else {
            message.textContent = "Artikel tidak ditemukan untuk diperbarui.";
            message.classList.remove("d-none");
            return;
        }

        // Update data artikel
        await updateDoc(docRef, {
            title,
            content,
            photoUrl,
            caption,
            titleKeterangan,
            tanggalPembuatan,
            slug
        });

        console.log(`Artikel dengan ID: ${articleId} diperbarui dengan slug: ${slug}`);

        message.textContent = "Artikel berhasil diperbarui!";
        message.classList.remove("d-none");

        // Redirect ke halaman artikel yang diperbarui
        window.location.href = `/artikel-home.html?slug=${slug}`;
    } catch (error) {
        console.error("Error saat memperbarui artikel:", error);
        message.textContent = `Gagal memperbarui artikel: ${error.message}`;
        message.classList.remove("d-none");
    }
}

// Fungsi untuk memuat artikel berdasarkan slug dari URL
async function loadArticleFromSlug() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug'); // Ambil slug dari URL

    console.log("Slug yang diambil dari URL:", slug);

    if (!slug) {
        message.textContent = "Slug tidak ditemukan di URL.";
        message.classList.remove("d-none");
        return;
    }

    try {
        const q = query(articleCollectionRef, where("slug", "==", slug));
        const querySnapshot = await getDocs(q);

        console.log("Jumlah artikel yang ditemukan:", querySnapshot.size);

        if (!querySnapshot.empty) {
            // Pastikan dokumen yang memiliki slug yang sesuai ditemukan
            const articleDoc = querySnapshot.docs[0];
            const article = articleDoc.data();

            console.log("Artikel yang ditemukan:", article);

            // Tampilkan data artikel di elemen HTML
            const titleElement = document.getElementById("title");
            const titleKeteranganElement = document.getElementById("titleKeterangan");
            const tanggalPembuatanElement = document.getElementById("tanggalPembuatan");
            const photoUrlElement = document.getElementById("photoUrl");
            const captionElement = document.getElementById("caption");
            const articlesElement = document.getElementById("articles");
            const slugElement = document.getElementById("slug"); // Untuk debugging

            if (titleElement) titleElement.innerText = article.title;
            if (titleKeteranganElement) titleKeteranganElement.innerText = article.titleKeterangan;
            if (tanggalPembuatanElement) tanggalPembuatanElement.innerText = new Date(article.tanggalPembuatan).toLocaleDateString('id-ID');
            if (photoUrlElement) {
                photoUrlElement.src = article.photoUrl;
                photoUrlElement.alt = article.caption;
            }
            if (captionElement) captionElement.innerText = article.caption;
            if (articlesElement) articlesElement.innerHTML = article.content;
            if (slugElement) slugElement.innerText = article.slug; // Menampilkan slug di UI untuk debugging
        } else {
            message.textContent = "Artikel tidak ditemukan.";
            message.classList.remove("d-none");
        }
    } catch (error) {
        console.error("Error saat memuat artikel:", error);
        message.textContent = `Gagal memuat artikel: ${error.message}`;
        message.classList.remove("d-none");
    }
}

// Fungsi untuk memuat daftar artikel
async function fetchArticles() {
    try {
        artikelSelection.innerHTML = "";
        const querySnapshot = await getDocs(articleCollectionRef);
        console.log("Jumlah artikel yang diambil:", querySnapshot.size);
        querySnapshot.forEach((docSnapshot) => {
            const article = docSnapshot.data();
            console.log("Artikel yang diambil:", article);
            const articleCard = `
                <div class="col-md-4 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <h2 class="detail-title">${article.title}</h2>
                            <div class="title-keterangan">
                                <p><strong>${article.titleKeterangan}</strong></p>
                                <p>${new Date(article.tanggalPembuatan).toLocaleDateString('id-ID')}</p>
                            </div>
                            <div class="container-foto">
                                <img src="${article.photoUrl}" class="custom-foto" alt="${article.title}">
                            </div>
                            <p class="keterangan-foto">${article.caption}</p>
                            <a href="/artikel-home.html?slug=${article.slug}" class="btn btn-primary">Baca Artikel</a>
                            <button class="btn btn-warning edit-btn" data-id="${docSnapshot.id}">Edit</button>
                            <button class="btn btn-danger delete-btn" data-id="${docSnapshot.id}">Hapus</button>
                        </div>
                    </div>
                </div>`;
            artikelSelection.innerHTML += articleCard;
        });

        attachEventListeners(); // Pasang event listener pada tombol
    } catch (error) {
        console.error("Error saat memuat daftar artikel:", error);
        message.textContent = `Gagal memuat artikel: ${error.message}`;
        message.classList.remove("d-none");
    }
}

// Pasang event listener pada tombol edit dan hapus
function attachEventListeners() {
    document.querySelectorAll(".edit-btn").forEach((button) => {
        button.addEventListener("click", () => {
            const articleId = button.getAttribute("data-id");
            editArticleById(articleId);
        });
    });

    document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", async () => {
            const articleId = button.getAttribute("data-id");
            await deleteArticle(articleId);
        });
    });
}

// Fungsi untuk menghapus artikel
async function deleteArticle(articleId) {
    if (!confirm("Apakah Anda yakin ingin menghapus artikel ini?")) {
        return;
    }

    try {
        await deleteDoc(doc(db, "articles", articleId));
        message.textContent = "Artikel berhasil dihapus.";
        message.classList.remove("d-none");
        fetchArticles();
    } catch (error) {
        console.error("Error saat menghapus artikel:", error);
        message.textContent = `Gagal menghapus artikel: ${error.message}`;
        message.classList.remove("d-none");
    }
}

// Fungsi untuk mengambil data artikel berdasarkan ID
async function editArticleById(articleId) {
    const docRef = doc(db, "articles", articleId);
    try {
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const article = docSnap.data();
            console.log("Artikel yang diedit:", article);
            document.getElementById("title").value = article.title;
            document.getElementById("content").value = article.content;
            document.getElementById("photoUrl").value = article.photoUrl;
            document.getElementById("caption").value = article.caption;
            document.getElementById("titleKeterangan").value = article.titleKeterangan;
            document.getElementById("tanggalPembuatan").value = article.tanggalPembuatan;
            currentArticleId = articleId;
            updateBtn.classList.remove("d-none");

            // Scroll ke form untuk edit
            window.scrollTo({ top: addContentForm.offsetTop, behavior: 'smooth' });
        } else {
            message.textContent = "Artikel tidak ditemukan.";
            message.classList.remove("d-none");
        }
    } catch (error) {
        console.error("Error saat mengambil data artikel untuk edit:", error);
        message.textContent = `Gagal mengambil artikel: ${error.message}`;
        message.classList.remove("d-none");
    }
}

// Handle form submission
addContentForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("content").value.trim();
    const photoUrl = document.getElementById("photoUrl").value.trim();
    const caption = document.getElementById("caption").value.trim();
    const titleKeterangan = document.getElementById("titleKeterangan").value.trim();
    const tanggalPembuatan = document.getElementById("tanggalPembuatan").value;

    if (!title || !content || !photoUrl || !caption || !titleKeterangan || !tanggalPembuatan) {
        message.textContent = "Semua field harus diisi.";
        message.classList.remove("d-none");
        return;
    }

    if (currentArticleId) {
        await updateArticle(currentArticleId, title, content, photoUrl, caption, titleKeterangan, tanggalPembuatan);
    } else {
        await addArticle(title, content, photoUrl, caption, titleKeterangan, tanggalPembuatan);
    }

    addContentForm.reset();
    currentArticleId = null;
    updateBtn.classList.add("d-none");
});

// Initialize articles on load
document.addEventListener("DOMContentLoaded", () => {
    fetchArticles();

    // Hanya muat artikel berdasarkan slug jika halaman artikel
    if (window.location.pathname.includes("artikel-home.html")) {
        loadArticleFromSlug();
    }
});
