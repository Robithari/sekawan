// profil-selection.js

import { doc, getDoc, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from './firebase-config.js';

// ID Dokumen Profil (gunakan 'main' atau sesuai kebutuhan)
const profilDocId = "main";

// Fungsi untuk memuat konten profil dari Firestore
export async function loadProfilContent() {
    console.log("Function loadProfilContent called");
    const profilForm = document.getElementById('profilForm'); // Mendefinisikan profilForm di awal

    try {
        console.log("Loading profil content from Firestore...");
        const docRef = doc(db, "profil", profilDocId);
        const docSnap = await getDoc(docRef);

        console.log("Document snapshot exists:", docSnap.exists());
        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("Data retrieved:", data);
            // Jika berada di CMS, tampilkan di form dan pratinjau
            if (profilForm) {
                const profilContent = document.getElementById('profilContent');
                const profilPreview = document.getElementById('profil-preview');

                if (profilContent && profilPreview) {
                    profilContent.value = data.content;
                    profilPreview.innerHTML = data.content;
                    console.log("Profil form and preview updated with content");
                } else {
                    console.warn("profilContent atau profil-preview elements tidak ditemukan di CMS");
                }
            }
        } else {
            console.log("Document does not exist. Creating a new one.");
            await setDoc(doc(db, "profil", profilDocId), { content: "" });

            if (profilForm) {
                const profilContent = document.getElementById('profilContent');
                const profilPreview = document.getElementById('profil-preview');

                if (profilContent && profilPreview) {
                    profilContent.value = "";
                    profilPreview.innerHTML = "";
                    console.log("Profil form dan preview cleared");
                } else {
                    console.warn("profilContent atau profil-preview elements tidak ditemukan di CMS");
                }
            }
        }
    } catch (error) {
        console.error("Error loading profil content:", error);
        if (profilForm) {
            const profilMessage = document.getElementById('profilMessage');
            if (profilMessage) {
                profilMessage.innerText = "Terjadi kesalahan saat memuat konten profil.";
                profilMessage.className = "alert alert-danger";
                console.log("Error message displayed in CMS");
            } else {
                console.warn("profilMessage element tidak ditemukan di CMS");
            }
        }
    }
}

// Fungsi untuk menyimpan konten profil ke Firestore
export async function saveProfilContent(content) {
    console.log("Function saveProfilContent called with content:", content);
    const profilMessage = document.getElementById('profilMessage');
    try {
        const docRef = doc(db, "profil", profilDocId);
        await updateDoc(docRef, { content: content });
        console.log("Profil berhasil diperbarui di Firestore");

        if (profilMessage) {
            profilMessage.innerText = "Profil berhasil diperbarui.";
            profilMessage.className = "alert alert-success";
            console.log("Success message displayed in CMS");
        }

        const profilPreview = document.getElementById('profil-preview');
        if (profilPreview) {
            profilPreview.innerHTML = content;
            console.log("Profil preview updated");
        }
    } catch (error) {
        console.error("Error saving profil content:", error);
        if (profilMessage) {
            profilMessage.innerText = "Terjadi kesalahan saat menyimpan konten profil.";
            profilMessage.className = "alert alert-danger";
            console.log("Error message displayed in CMS");
        }
    }
}

// Event Listener untuk Formulir Profil (hanya di CMS)
export function setupProfilForm() {
    console.log("Function setupProfilForm called");
    const profilForm = document.getElementById('profilForm');
    if (profilForm) {
        profilForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const profilContent = document.getElementById('profilContent');
            const content = profilContent ? profilContent.value : "";
            console.log("Form submitted with content:", content);
            await saveProfilContent(content);
        });

        const cancelBtn = document.getElementById('cancel-profil-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', async function () {
                console.log("Cancel button clicked");
                await loadProfilContent();
                const profilMessage = document.getElementById('profilMessage');
                if (profilMessage) {
                    profilMessage.innerText = "";
                    profilMessage.className = "";
                    console.log("Profil message cleared in CMS");
                }
            });
        }

        // Event Listener untuk pratinjau live (optional)
        const profilContent = document.getElementById('profilContent');
        if (profilContent) {
            profilContent.addEventListener('input', function () {
                const content = this.value;
                console.log("Profil content input:", content);
                const profilPreview = document.getElementById('profil-preview');
                if (profilPreview) {
                    profilPreview.innerHTML = content;
                    console.log("Profil preview updated live");
                }
            });
        }
    } else {
        console.warn("profilForm element tidak ditemukan di CMS");
    }
}

// Inisialisasi Profil CMS
export async function initializeProfilCMS() {
    console.log("Function initializeProfilCMS called");
    await loadProfilContent();
    setupProfilForm();
}

// Inisialisasi Profil Publik
export async function initializeProfilPublic() {
    console.log("Function initializeProfilPublic called");
    await loadProfilContent();
}
