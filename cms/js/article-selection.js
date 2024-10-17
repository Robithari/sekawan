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

// References to HTML elements
const articleCollectionRef = collection(db, "articles");
const addContentForm = document.getElementById("addContentForm");
const artikelSelection = document.getElementById("artikel-selection");
const addBtn = document.getElementById("add-btn");
const updateBtn = document.getElementById("update-btn");
const cancelBtn = document.getElementById("cancel-profil-btn");
const message = document.getElementById("message");
let currentArticleId = null; // To track edit mode

// Function to create a unique slug from title
function createSlug(title) {
    return title.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');
}

// Function to check if slug is unique
async function isSlugUnique(slug, excludeId = null) {
    const q = query(articleCollectionRef, where("slug", "==", slug));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return true;
    if (excludeId) {
        return querySnapshot.docs.length === 1 && querySnapshot.docs[0].id === excludeId;
    }
    return false;
}

// Function to display messages in the UI
function displayMessage(text, type = "info") {
    message.textContent = text;
    message.className = `alert alert-${type}`;
    message.classList.remove("d-none");
    setTimeout(() => message.classList.add("d-none"), 5000);
}

// Function to handle form submission (Add or Update Article)
async function handleFormSubmit(e) {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    const photoUrl = document.getElementById("photoUrl").value;
    const caption = document.getElementById("caption").value;
    const titleKeterangan = document.getElementById("titleKeterangan").value;
    const tanggalPembuatan = document.getElementById("tanggalPembuatan").value;

    if (currentArticleId) {
        await updateArticle(currentArticleId, title, content, photoUrl, caption, titleKeterangan, tanggalPembuatan);
    } else {
        await addArticle(title, content, photoUrl, caption, titleKeterangan, tanggalPembuatan);
    }
    resetForm(); // Reset form fields after submission
}

// Function to reset the form
function resetForm() {
    addContentForm.reset();
    currentArticleId = null;
    addBtn.classList.remove("d-none");
    updateBtn.classList.add("d-none");
    cancelBtn.classList.add("d-none");
    document.getElementById("form-title").innerText = "Tambah Artikel Baru";
}

// Function to fetch and display the list of articles
async function fetchArticles() {
    artikelSelection.innerHTML = "";
    try {
        const querySnapshot = await getDocs(articleCollectionRef);
        if (querySnapshot.empty) {
            artikelSelection.innerHTML = "<p>Tidak ada artikel yang tersedia.</p>";
            return;
        }
        querySnapshot.forEach((docSnapshot) => {
            const article = docSnapshot.data();
            artikelSelection.innerHTML += generateArticleCard(docSnapshot.id, article);
        });
        attachEventListeners();
    } catch (error) {
        console.error("Error saat memuat daftar artikel:", error);
        displayMessage(`Gagal memuat artikel: ${error.message}`, "danger");
    }
}

// Helper function to generate article card HTML
function generateArticleCard(id, article) {
    const truncatedContent = article.content.substring(0, 200) + "...";
    return `
        <div class="col-md-4 mb-4">
            <div class="card h-100">
                <img src="${article.photoUrl}" class="card-img-top" alt="${article.title}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${article.title}</h5>
                    <p class="card-text"><strong>${article.titleKeterangan}</strong></p>
                    <p class="card-text text-muted">${new Date(article.tanggalPembuatan).toLocaleDateString('id-ID')}</p>
                    <p class="card-text">${truncatedContent}</p>
                    <div class="mt-auto">
                        <a href="/artikel-home.html?slug=${article.slug}" class="btn btn-primary">Buka Artikel</a>
                        <button class="btn btn-warning edit-btn mt-2" data-id="${id}">Edit</button>
                        <button class="btn btn-danger delete-btn mt-2" data-id="${id}">Hapus</button>
                    </div>
                </div>
            </div>
        </div>`;
}

// Function to attach event listeners to Edit and Delete buttons
function attachEventListeners() {
    document.querySelectorAll(".edit-btn").forEach((button) => {
        button.addEventListener("click", () => editArticleById(button.dataset.id));
    });

    document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", () => deleteArticle(button.dataset.id));
    });
}

// Function to add a new article
async function addArticle(title, content, photoUrl, caption, titleKeterangan, tanggalPembuatan) {
    try {
        const slug = createSlug(title);
        if (!(await isSlugUnique(slug))) throw new Error("Slug sudah digunakan.");
        await addDoc(articleCollectionRef, { title, content, photoUrl, caption, titleKeterangan, tanggalPembuatan, slug });
        displayMessage("Artikel berhasil ditambahkan!", "success");
        fetchArticles();
    } catch (error) {
        displayMessage(`Gagal menambahkan artikel: ${error.message}`, "danger");
    }
}

// Function to update an existing article
async function updateArticle(id, title, content, photoUrl, caption, titleKeterangan, tanggalPembuatan) {
    try {
        const docRef = doc(db, "articles", id);
        await updateDoc(docRef, { title, content, photoUrl, caption, titleKeterangan, tanggalPembuatan });
        displayMessage("Artikel berhasil diperbarui!", "success");
        fetchArticles();
    } catch (error) {
        displayMessage(`Gagal memperbarui artikel: ${error.message}`, "danger");
    }
}

// Function to delete an article
async function deleteArticle(id) {
    if (!confirm("Apakah Anda yakin ingin menghapus artikel ini?")) return;
    try {
        await deleteDoc(doc(db, "articles", id));
        displayMessage("Artikel berhasil dihapus.", "success");
        fetchArticles();
    } catch (error) {
        displayMessage(`Gagal menghapus artikel: ${error.message}`, "danger");
    }
}

// Function to edit an article by ID
async function editArticleById(id) {
    try {
        const docSnap = await getDoc(doc(db, "articles", id));
        if (!docSnap.exists()) throw new Error("Artikel tidak ditemukan.");
        const article = docSnap.data();
        populateForm(article);
        currentArticleId = id;
        addBtn.classList.add("d-none");
        updateBtn.classList.remove("d-none");
        cancelBtn.classList.remove("d-none");
        document.getElementById("form-title").innerText = "Edit Artikel";
    } catch (error) {
        displayMessage(`Gagal memuat artikel: ${error.message}`, "danger");
    }
}

// Helper function to populate the form with article data
function populateForm(article) {
    document.getElementById("title").value = article.title;
    document.getElementById("content").value = article.content;
    document.getElementById("photoUrl").value = article.photoUrl;
    document.getElementById("caption").value = article.caption;
    document.getElementById("titleKeterangan").value = article.titleKeterangan;
    document.getElementById("tanggalPembuatan").value = article.tanggalPembuatan;
}

// Event listeners for form submission and cancel button
addContentForm.addEventListener("submit", handleFormSubmit);
cancelBtn.addEventListener("click", resetForm);

// Load articles when the DOM is ready
document.addEventListener("DOMContentLoaded", fetchArticles);
