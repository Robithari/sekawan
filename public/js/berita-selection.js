// Semua operasi Firebase harus menggunakan window.firebase (CDN v8)
// Pastikan firebase-app.js, firebase-firestore.js, dan firebase-config.js sudah di-load di index.ejs

// Referensi Firestore v8
const db = firebase.firestore();

// References to HTML elements
const beritaCollectionRef = collection(db, "berita");
const addBeritaForm = document.getElementById("addBeritaForm");
const beritaSelection = document.getElementById("berita-selection");
const beritaAddBtn = document.getElementById("berita-add-btn");
const beritaUpdateBtn = document.getElementById("berita-update-btn");
const beritaCancelBtn = document.getElementById("berita-cancel-btn");
const beritaMessage = document.getElementById("berita-message");
let currentBeritaId = null;

// Quill toolbarOptions hanya dideklarasikan sekali di seluruh file JS custom
if (typeof window.toolbarOptionsBerita === 'undefined') {
  window.toolbarOptionsBerita = [
    [{ 'font': [] }],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    [{ 'align': [] }],
    ['link', 'image', 'video'],
    ['clean']
  ];
}

// Function to create a unique slug from title
function createSlug(title) {
    return title.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');
}

// Function to check if slug is unique
async function isSlugUnique(slug, excludeId = null) {
    const q = query(beritaCollectionRef, where("slug", "==", slug));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return true;
    if (excludeId) {
        return querySnapshot.docs.length === 1 && querySnapshot.docs[0].id === excludeId;
    }
    return false;
}

// Function to display messages
function displayBeritaMessage(text, type = "info") {
    beritaMessage.textContent = text;
    beritaMessage.className = "alert alert-" + type;
    beritaMessage.classList.remove("d-none");
    setTimeout(function() { beritaMessage.classList.add("d-none"); }, 5000);
}

// Handle form submission
async function handleBeritaFormSubmit(e) {
    e.preventDefault();
    const title = document.getElementById("beritaTitle").value;
    const titleKeterangan = document.getElementById("beritaTitleKeterangan").value;
    const tanggalPembuatan = document.getElementById("beritaTanggalPembuatan").value;
    const content = document.getElementById("beritaContent").value;
    const photoUrl = document.getElementById("beritaPhotoUrl").value;
    const caption = document.getElementById("beritaCaption").value;

    if (currentBeritaId) {
        await updateBerita(currentBeritaId, title, titleKeterangan, tanggalPembuatan, content, photoUrl, caption);
    } else {
        await addBerita(title, titleKeterangan, tanggalPembuatan, content, photoUrl, caption);
    }
    resetBeritaForm();
}

// Reset form
function resetBeritaForm() {
    addBeritaForm.reset();
    currentBeritaId = null;
    beritaAddBtn.classList.remove("d-none");
    beritaUpdateBtn.classList.add("d-none");
    beritaCancelBtn.classList.add("d-none");
    document.getElementById("form-title-berita").innerText = "Tambah Berita Baru";
}

// Fetch and display berita
async function fetchBerita() {
    beritaSelection.innerHTML = "";
    try {
        // Menggunakan query dengan orderBy untuk mengurutkan berdasarkan tanggalPembuatan secara menurun
        const beritaQuery = query(beritaCollectionRef, orderBy("tanggalPembuatan", "desc"));
        const querySnapshot = await getDocs(beritaQuery);
        if (querySnapshot.empty) {
            beritaSelection.innerHTML = "<p>Tidak ada berita yang tersedia.</p>";
            return;
        }
        querySnapshot.forEach((docSnapshot) => {
            const berita = docSnapshot.data();
            beritaSelection.innerHTML += generateBeritaCard(docSnapshot.id, berita);
        });
        attachBeritaEventListeners();
    } catch (error) {
        console.error("Error loading berita:", error);
        displayBeritaMessage(`Gagal memuat berita: ${error.message}`, "danger");
    }
}

// Generate berita card HTML
function generateBeritaCard(id, berita) {
    const truncatedContent = berita.content.length > 200 ? berita.content.substring(0, 200) + "..." : berita.content;
    return `
        <div class="col-md-4 mb-4">
            <div class="card h-100">
                <img src="${berita.photoUrl}" class="card-img-top" alt="${berita.title}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${berita.title}</h5>
                    <p class="card-text"><strong>${berita.titleKeterangan}</strong></p>
                    <p class="card-text text-muted">${new Date(berita.tanggalPembuatan).toLocaleDateString('id-ID')}</p>
                    <p class="card-text">${truncatedContent}</p>
                    <div class="mt-auto">
                        <a href="/berita-home.html?slug=${berita.slug}" class="btn btn-primary">Buka Berita</a>
                        <button class="btn btn-warning edit-berita-btn mt-2" data-id="${id}">Edit</button>
                        <button class="btn btn-danger delete-berita-btn mt-2" data-id="${id}">Hapus</button>
                    </div>
                </div>
            </div>
        </div>`;
}

// Attach event listeners
function attachBeritaEventListeners() {
    document.querySelectorAll(".edit-berita-btn").forEach((button) => {
        button.addEventListener("click", () => editBeritaById(button.dataset.id));
    });

    document.querySelectorAll(".delete-berita-btn").forEach((button) => {
        button.addEventListener("click", () => deleteBerita(button.dataset.id));
    });
}

// Add new berita
async function addBerita(title, titleKeterangan, tanggalPembuatan, content, photoUrl, caption) {
    try {
        const slug = createSlug(title);
        if (!(await isSlugUnique(slug))) throw new Error("Slug sudah digunakan.");
        await addDoc(beritaCollectionRef, { title, titleKeterangan, tanggalPembuatan, content, photoUrl, caption, slug });
        displayBeritaMessage("Berita berhasil ditambahkan!", "success");
        fetchBerita();
    } catch (error) {
        displayBeritaMessage(`Gagal menambahkan berita: ${error.message}`, "danger");
    }
}

// Update existing berita
async function updateBerita(id, title, titleKeterangan, tanggalPembuatan, content, photoUrl, caption) {
    try {
        const slug = createSlug(title);
        if (!(await isSlugUnique(slug, id))) throw new Error("Slug sudah digunakan.");
        const docRef = doc(db, "berita", id);
        await updateDoc(docRef, { title, titleKeterangan, tanggalPembuatan, content, photoUrl, caption, slug });
        displayBeritaMessage("Berita berhasil diperbarui!", "success");
        fetchBerita();
    } catch (error) {
        displayBeritaMessage(`Gagal memperbarui berita: ${error.message}`, "danger");
    }
}

// Delete berita
async function deleteBerita(id) {
    if (!confirm("Apakah Anda yakin ingin menghapus berita ini?")) return;
    try {
        await deleteDoc(doc(db, "berita", id));
        displayBeritaMessage("Berita berhasil dihapus.", "success");
        fetchBerita();
    } catch (error) {
        displayBeritaMessage(`Gagal menghapus berita: ${error.message}`, "danger");
    }
}

// Edit berita by ID
async function editBeritaById(id) {
    try {
        const docSnap = await getDoc(doc(db, "berita", id));
        if (!docSnap.exists()) throw new Error("Berita tidak ditemukan.");
        const berita = docSnap.data();
        populateBeritaForm(berita);
        currentBeritaId = id;
        beritaAddBtn.classList.add("d-none");
        beritaUpdateBtn.classList.remove("d-none");
        beritaCancelBtn.classList.remove("d-none");
        document.getElementById("form-title-berita").innerText = "Edit Berita";
    } catch (error) {
        displayBeritaMessage(`Gagal memuat berita: ${error.message}`, "danger");
    }
}

// Populate form with berita data
function populateBeritaForm(berita) {
    document.getElementById("beritaTitle").value = berita.title;
    document.getElementById("beritaTitleKeterangan").value = berita.titleKeterangan;
    document.getElementById("beritaTanggalPembuatan").value = berita.tanggalPembuatan;
    document.getElementById("beritaContent").value = berita.content;
    document.getElementById("beritaPhotoUrl").value = berita.photoUrl;
    document.getElementById("beritaCaption").value = berita.caption;
}

// Event listeners
addBeritaForm.addEventListener("submit", handleBeritaFormSubmit);
beritaCancelBtn.addEventListener("click", resetBeritaForm);

// Load berita on DOMContentLoaded
document.addEventListener("DOMContentLoaded", fetchBerita);
