// Import Firebase dependencies
import { 
    getFirestore, collection, getDocs, deleteDoc, updateDoc, doc, query, getDoc
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
const pertandinganCollectionRef = collection(db, "jadwalPertandingan");
const pertandinganSelection = document.getElementById("pertandingan-selection");
const updateBtn = document.getElementById("pertandingan-update-btn");
const cancelBtn = document.getElementById("pertandingan-cancel-btn");
const message = document.getElementById("pertandingan-message");
const addPertandinganForm = document.getElementById("addPertandinganForm");
let currentPertandinganId = null; // To track edit mode

// Hide the edit form initially
addPertandinganForm.style.display = "none";

// Function to display messages in the UI
function displayMessage(text, type = "info") {
    message.textContent = text;
    message.className = `alert alert-${type}`;
    message.classList.remove("d-none");
    setTimeout(() => message.classList.add("d-none"), 5000);
}

// Function to handle form submission (Update Pertandingan)
async function handleFormSubmit(e) {
    e.preventDefault();
    const timKita = document.getElementById("timA").value;
    const timLawan = document.getElementById("timB").value;
    const hari = document.getElementById("hari").value;
    const tanggal = new Date(document.getElementById("tanggalPertandingan").value).toISOString();
    const waktu = document.getElementById("waktu").value;

    const pertandinganData = {
        timKita: timKita,
        vs: "vs",
        timLawan: timLawan,
        hari: hari,
        tanggal: tanggal,
        waktu: waktu
    };

    if (currentPertandinganId) {
        await updatePertandingan(currentPertandinganId, pertandinganData);
        resetForm(); // Reset form fields after submission
    }
}

// Function to reset the form
function resetForm() {
    addPertandinganForm.reset();
    currentPertandinganId = null;
    updateBtn.classList.add("d-none");
    cancelBtn.classList.add("d-none");
    document.getElementById("form-title-pertandingan").innerText = "Edit Jadwal Pertandingan";
    addPertandinganForm.style.display = "none"; // Hide the edit form after reset
}

// Function to fetch and display the list of pertandingan
async function fetchPertandingan() {
    pertandinganSelection.innerHTML = "";
    try {
        const querySnapshot = await getDocs(pertandinganCollectionRef);
        if (querySnapshot.empty) {
            pertandinganSelection.innerHTML = "<p>Tidak ada jadwal pertandingan yang tersedia.</p>";
            return;
        }
        querySnapshot.forEach((docSnapshot) => {
            const pertandingan = docSnapshot.data();
            pertandinganSelection.innerHTML += generatePertandinganCard(docSnapshot.id, pertandingan);
        });
        attachEventListeners();
    } catch (error) {
        console.error("Error saat memuat daftar pertandingan:", error);
        displayMessage(`Gagal memuat pertandingan: ${error.message}`, "danger");
    }
}

// Helper function to generate pertandingan card HTML
function generatePertandinganCard(id, pertandingan) {
    return `
        <div class="col-md-4 mb-4">
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${pertandingan.timKita} ${pertandingan.vs} ${pertandingan.timLawan}</h5>
                    <p class="card-text text-muted">${pertandingan.hari}, ${new Date(pertandingan.tanggal).toLocaleDateString('id-ID')} Pukul ${pertandingan.waktu}</p>
                    <div class="mt-auto">
                        <button class="btn btn-warning edit-btn mt-2" data-id="${id}">Edit</button>
                    </div>
                </div>
            </div>
        </div>`;
}

// Function to update an existing pertandingan
async function updatePertandingan(id, pertandinganData) {
    try {
        const docRef = doc(db, "jadwalPertandingan", id);
        await updateDoc(docRef, pertandinganData);
        displayMessage("Pertandingan berhasil diperbarui!", "success");
        fetchPertandingan();
    } catch (error) {
        displayMessage(`Gagal memperbarui pertandingan: ${error.message}`, "danger");
    }
}

// Function to edit a pertandingan by ID
async function editPertandinganById(id) {
    try {
        const docSnap = await getDoc(doc(db, "jadwalPertandingan", id));
        if (!docSnap.exists()) throw new Error("Pertandingan tidak ditemukan.");
        const pertandingan = docSnap.data();
        populateForm(pertandingan);
        currentPertandinganId = id;
        updateBtn.classList.remove("d-none");
        cancelBtn.classList.remove("d-none");
        document.getElementById("form-title-pertandingan").innerText = "Edit Jadwal Pertandingan";
        addPertandinganForm.style.display = "block"; // Show the edit form when editing
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to the form
    } catch (error) {
        displayMessage(`Gagal memuat pertandingan: ${error.message}`, "danger");
    }
}

// Helper function to populate the form with pertandingan data
function populateForm(pertandingan) {
    document.getElementById("timA").value = pertandingan.timKita;
    document.getElementById("timB").value = pertandingan.timLawan;
    document.getElementById("hari").value = pertandingan.hari;
    document.getElementById("tanggalPertandingan").value = new Date(pertandingan.tanggal).toISOString().split('T')[0];
    document.getElementById("waktu").value = pertandingan.waktu;
}

// Attach event listeners to Edit and Delete buttons
function attachEventListeners() {
    document.querySelectorAll(".edit-btn").forEach((button) => {
        button.addEventListener("click", () => editPertandinganById(button.dataset.id));
    });
}

// Attach event listeners to form submission and cancel button
addPertandinganForm.addEventListener("submit", handleFormSubmit);
cancelBtn.addEventListener("click", resetForm);

// Load pertandingan when the DOM is ready
document.addEventListener("DOMContentLoaded", fetchPertandingan);