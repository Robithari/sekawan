// Import Firebase dependencies
import { getFirestore, collection, addDoc, getDocs, deleteDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
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

// For editing articles
let currentArticleId = null;

// Function to add article to Firestore
async function addArticle(title, content, photoUrl, caption, titleKeterangan, tanggalPembuatan) {
    try {
        await addDoc(articleCollectionRef, {
            title,
            content,
            photoUrl,
            caption,
            titleKeterangan,
            tanggalPembuatan // Menyimpan tanggal pembuatan
        });
        message.textContent = "Artikel berhasil ditambahkan.";
        message.classList.remove("d-none");
        fetchArticles();
    } catch (error) {
        message.textContent = `Gagal menambahkan artikel: ${error.message}`;
    }
}

// Function to fetch articles from Firestore
async function fetchArticles() {
    try {
        artikelSelection.innerHTML = "";
        const querySnapshot = await getDocs(articleCollectionRef);
        querySnapshot.forEach((docSnapshot) => {
            const article = docSnapshot.data();
            const articleCard = document.createElement("div");
            articleCard.className = "col-md-4 mb-4";
            articleCard.innerHTML = 
                `<div class="card">
                    <div class="card-body">
                        <h1 class="detail-title">${article.title}</h1>
                        <div class="title-keterangan">
                            <p><strong>${article.titleKeterangan}</strong></p>
                            <p>${article.tanggalPembuatan ? new Date(article.tanggalPembuatan).toLocaleDateString() : "Tanggal tidak tersedia"}</p> <!-- Tampilkan tanggal dengan format -->
                        </div>
                        <div class="container-foto">
                            <img src="${article.photoUrl}" class="custom-foto" alt="${article.title}">
                        </div>
                        <p class="keterangan-foto">
                            ${article.caption}
                        </p>
                        <div class="isi-halaman">
                            <p>${article.content}</p>
                        </div>
                        <button class="btn btn-warning me-2 edit-btn" data-id="${docSnapshot.id}" data-title="${article.title}" data-content="${article.content}" data-photo-url="${article.photoUrl}" data-caption="${article.caption}" data-title-keterangan="${article.titleKeterangan}" data-tanggal-pembuatan="${article.tanggalPembuatan}">Edit</button>
                        <button class="btn btn-danger delete-btn" data-id="${docSnapshot.id}">Hapus</button>
                    </div>
                </div>`;
            artikelSelection.appendChild(articleCard);
        });
        attachEventListeners();
    } catch (error) {
        message.textContent = `Gagal memuat artikel: ${error.message}`;
    }
}

// Function to attach event listeners to dynamically added edit and delete buttons
function attachEventListeners() {
    document.querySelectorAll(".edit-btn").forEach((button) => {
        button.addEventListener("click", () => {
            const articleId = button.getAttribute("data-id");
            const title = button.getAttribute("data-title");
            const content = button.getAttribute("data-content");
            const photoUrl = button.getAttribute("data-photo-url");
            const caption = button.getAttribute("data-caption");
            const titleKeterangan = button.getAttribute("data-title-keterangan");
            const tanggalPembuatan = button.getAttribute("data-tanggal-pembuatan");
            editArticle(articleId, title, content, photoUrl, caption, titleKeterangan, tanggalPembuatan);
        });
    });

    document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", async () => {
            const articleId = button.getAttribute("data-id");
            await deleteArticle(articleId);
        });
    });
}

// Function to delete article from Firestore
async function deleteArticle(articleId) {
    try {
        await deleteDoc(doc(db, "articles", articleId));
        message.textContent = "Artikel berhasil dihapus.";
        fetchArticles();
    } catch (error) {
        message.textContent = `Gagal menghapus artikel: ${error.message}`;
    }
}

// Function to update article
async function updateArticle(articleId, title, content, photoUrl, caption, titleKeterangan, tanggalPembuatan) {
    try {
        await updateDoc(doc(db, "articles", articleId), {
            title,
            content,
            photoUrl,
            caption,
            titleKeterangan,
            tanggalPembuatan // Update tanggal pembuatan
        });
        message.textContent = "Artikel berhasil diupdate.";
        addContentForm.reset();
        updateBtn.classList.add("d-none");
        currentArticleId = null;
        fetchArticles();
    } catch (error) {
        message.textContent = `Gagal mengupdate artikel: ${error.message}`;
    }
}

// Handle form submission
addContentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    const photoUrl = document.getElementById("photoUrl").value;
    const caption = document.getElementById("caption").value;
    const titleKeterangan = document.getElementById("titleKeterangan").value;
    const tanggalPembuatan = document.getElementById("tanggalPembuatan").value; // Ambil nilai tanggal

    if (currentArticleId) {
        await updateArticle(currentArticleId, title, content, photoUrl, caption, titleKeterangan, tanggalPembuatan);
    } else {
        await addArticle(title, content, photoUrl, caption, titleKeterangan, tanggalPembuatan); // Simpan tanggal
    }

    addContentForm.reset();
});

// Function to edit article
function editArticle(articleId, title, content, photoUrl, caption, titleKeterangan, tanggalPembuatan) {
    document.getElementById("title").value = title;
    document.getElementById("content").value = content;
    document.getElementById("photoUrl").value = photoUrl;
    document.getElementById("caption").value = caption;
    document.getElementById("titleKeterangan").value = titleKeterangan;
    document.getElementById("tanggalPembuatan").value = tanggalPembuatan || ""; // Isi nilai tanggal
    currentArticleId = articleId;
    updateBtn.classList.remove("d-none");
}

// Initialize articles on load
document.addEventListener("DOMContentLoaded", () => {
    fetchArticles();
});
