// Semua operasi Firebase harus menggunakan window.firebase (CDN v8)
// Pastikan firebase-app.js, firebase-firestore.js sudah di-load di HTML
var db = window.firebase.firestore();

const PROFILE_DOC_ID = "main";
let quillProfile;

// ========== Quill Editor Setup ==========
const Font = Quill.import('formats/font');
Font.whitelist = [
    'arial', 'comic-sans', 'courier-new', 'georgia', 'helvetica', 'lucida', 'times-new-roman'
];
Quill.register(Font, true);

const toolbarOptions = [
    [{ 'font': Font.whitelist }],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    [{ 'align': [] }],
    ['undo', 'redo'],
    ['link', 'image', 'video', 'formula'],
    ['clean']
];

const icons = Quill.import('ui/icons');
icons['undo'] = '<svg viewBox="0 0 18 18"><polygon class="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10"></polygon><path class="ql-stroke" d="M14,4a6,6,0,0,0-8.5,1.5"></path></svg>';
icons['redo'] = '<svg viewBox="0 0 18 18"><polygon class="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10"></polygon><path class="ql-stroke" d="M4,4a6,6,0,0,1,8.5,1.5"></path></svg>';

// ========== Load Profile Content ==========
window.loadProfileContent = async function() {
    const profileForm = document.getElementById('profilForm');
    try {
        const docRef = db.collection("profil").doc(PROFILE_DOC_ID);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            const data = docSnap.data();
            if (profileForm && quillProfile) {
                quillProfile.root.innerHTML = data.content;
            }
            const profileContent = document.getElementById('profilContent');
            if (profileContent) {
                profileContent.value = data.content;
            }
        } else {
            await db.collection("profil").doc(PROFILE_DOC_ID).set({ content: "" });
            if (profileForm && quillProfile) {
                quillProfile.root.innerHTML = "";
            }
            const profileContent = document.getElementById('profilContent');
            if (profileContent) {
                profileContent.value = "";
            }
        }
    } catch (error) {
        showProfileMessage("Terjadi kesalahan saat memuat konten profil.", "danger");
        console.error("Error loading profile content:", error);
    }
}

// ========== Save Profile Content ==========
async function saveProfileContent(content) {
    try {
        const docRef = doc(db, "profil", PROFILE_DOC_ID);
        await updateDoc(docRef, { content: content });
        showProfileMessage("Profil berhasil diperbarui.", "success");
    } catch (error) {
        showProfileMessage("Terjadi kesalahan saat menyimpan konten profil.", "danger");
        console.error("Error saving profile content:", error);
    }
}

// ========== Setup Profile Form ==========
function setupProfileForm() {
    const profileForm = document.getElementById('profilForm');
    const editBtn = document.getElementById('editProfilBtn');
    const saveBtn = document.getElementById('saveProfilBtn');
    const cancelBtn = document.getElementById('cancel-profil-btn');
    if (profileForm && editBtn && saveBtn && cancelBtn) {
        quillProfile = new Quill('#profilContentEditor', {
            modules: {
                toolbar: {
                    container: toolbarOptions,
                },
                history: {
                    delay: 1000,
                    maxStack: 100,
                    userOnly: true
                }
            },
            theme: 'snow',
            placeholder: 'Tulis konten profil di sini...'
        });
        editBtn.addEventListener('click', () => {
            profileForm.classList.remove('d-none');
            editBtn.classList.add('d-none');
        });
        saveBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const content = quillProfile.root.innerHTML.trim();
            await saveProfileContent(content);
            profileForm.classList.add('d-none');
            editBtn.classList.remove('d-none');
        });
        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            profileForm.classList.add('d-none');
            editBtn.classList.remove('d-none');
            loadProfileContent();
        });
    }
}

// ========== UI Helper ==========
function showProfileMessage(text, type = "info") {
    const profileMessage = document.getElementById('profilMessage');
    if (profileMessage) {
        profileMessage.innerText = text;
        profileMessage.className = `alert alert-${type}`;
    }
}

// Initial load
window.addEventListener('DOMContentLoaded', () => {
    setupProfileForm();
    loadProfileContent();
});
