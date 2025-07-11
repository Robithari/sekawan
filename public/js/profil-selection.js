// profil-selection.js

// Semua operasi Firebase harus menggunakan window.firebase (CDN v8)
// Pastikan firebase-app.js, firebase-auth.js, firebase-firestore.js sudah di-load di index.ejs

// ID Dokumen Profil (gunakan 'main' atau sesuai kebutuhan)
const profilDocId = "main";

// Fungsi untuk memuat konten profil dari Firestore
window.loadProfilContent = async function() {
    console.log("Function loadProfilContent called");
    const profilForm = document.getElementById('profilForm');

    try {
        console.log("Loading profil content from Firestore...");
        const docRef = doc(db, "profil", profilDocId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            if (profilForm) {
                const profilContent = document.getElementById('profilContent');
                const profilPreview = document.getElementById('profil-preview');
                if (profilContent && profilPreview) {
                    profilContent.value = data.content;
                    profilPreview.innerHTML = data.content;
                }
            }
        } else {
            await setDoc(doc(db, "profil", profilDocId), { content: "" });
            if (profilForm) {
                const profilContent = document.getElementById('profilContent');
                const profilPreview = document.getElementById('profil-preview');
                if (profilContent && profilPreview) {
                    profilContent.value = "";
                    profilPreview.innerHTML = "";
                }
            }
        }
    } catch (error) {
        console.error("Error loading profil content:", error);
        const profilMessage = document.getElementById('profilMessage');
        if (profilMessage) {
            profilMessage.innerText = "Terjadi kesalahan saat memuat konten profil.";
            profilMessage.className = "alert alert-danger";
        }
    }
}

// Fungsi untuk menyimpan konten profil ke Firestore
window.saveProfilContent = async function(content) {
    const profilMessage = document.getElementById('profilMessage');
    try {
        const docRef = doc(db, "profil", profilDocId);
        await updateDoc(docRef, { content: content });

        if (profilMessage) {
            profilMessage.innerText = "Profil berhasil diperbarui.";
            profilMessage.className = "alert alert-success";
        }

        const profilPreview = document.getElementById('profil-preview');
        if (profilPreview) {
            profilPreview.innerHTML = content;
        }
    } catch (error) {
        console.error("Error saving profil content:", error);
        if (profilMessage) {
            profilMessage.innerText = "Terjadi kesalahan saat menyimpan konten profil.";
            profilMessage.className = "alert alert-danger";
        }
    }
}

// Event Listener untuk Formulir Profil (hanya di CMS)
window.setupProfilForm = function() {
    const profilForm = document.getElementById('profilForm');
    if (profilForm) {
        profilForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const profilContent = document.getElementById('profilContent');
            const content = profilContent ? profilContent.value : "";
            await saveProfilContent(content);
        });

        const cancelBtn = document.getElementById('cancel-profil-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', async function () {
                await loadProfilContent();
                const profilMessage = document.getElementById('profilMessage');
                if (profilMessage) {
                    profilMessage.innerText = "";
                    profilMessage.className = "";
                }
            });
        }

        const profilContent = document.getElementById('profilContent');
        if (profilContent) {
            profilContent.addEventListener('input', function () {
                const content = this.value;
                const profilPreview = document.getElementById('profil-preview');
                if (profilPreview) {
                    profilPreview.innerHTML = content;
                }
            });
        }
    }
}

// Inisialisasi Profil CMS
window.initializeProfilCMS = async function() {
    await loadProfilContent();
    setupProfilForm();
}

// Inisialisasi Profil Publik
window.initializeProfilPublic = async function() {
    await loadProfilContent();
}

// Listener untuk `DOMContentLoaded`
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM Content Loaded, initializing CMS...");
    initializeProfilCMS();  // Panggil fungsi untuk inisialisasi CMS saat DOM siap
});
