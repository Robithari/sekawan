// Semua operasi Firebase harus menggunakan window.firebase (CDN v8)
// Pastikan firebase-app.js, firebase-firestore.js sudah di-load di HTML
var db = window.firebase.firestore();

let currentFooterEditId = null;

// Load all footer data
window.loadFooterContents = async function() {
    try {
        const querySnapshot = await db.collection("footer").get();
        const footerList = document.getElementById('footer-selection');
        footerList.innerHTML = '';
        querySnapshot.forEach(function(documentSnapshot) {
            const data = documentSnapshot.data();
            const footerItem = document.createElement('div');
            footerItem.className = 'col-12 mb-3';
            footerItem.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <p><strong>Facebook:</strong> <a href="${data.facebook}" target="_blank">${data.facebook}</a></p>
                        <p><strong>Instagram:</strong> <a href="${data.instagram}" target="_blank">${data.instagram}</a></p>
                        <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
                        <p><strong>Telepon:</strong> <a href="tel:${data.telephone}">${data.telephone}</a></p>
                        <button class="btn btn-warning btn-sm me-2 edit-footer-btn">
                            <i class="bi bi-pencil-square"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm delete-footer-btn">
                            <i class="bi bi-trash"></i> Hapus
                        </button>
                    </div>
                </div>
            `;
            footerList.appendChild(footerItem);
            // Edit
            footerItem.querySelector('.edit-footer-btn').addEventListener('click', function() {
                window.editFooterContent(documentSnapshot.id, data.facebook, data.instagram, data.email, data.telephone);
            });
            // Delete
            footerItem.querySelector('.delete-footer-btn').addEventListener('click', function() {
                window.deleteFooterContent(documentSnapshot.id);
            });
        });
    } catch (e) {
        alert("Gagal memuat data footer.");
        console.error("Error loading footer contents: ", e);
    }
}

// Edit footer
function editFooterContent(id, facebook, instagram, email, telephone) {
    currentFooterEditId = id;
    document.getElementById('footer-selection').classList.add('d-none');
    document.getElementById('kelola-footer-title').classList.remove('d-none');
    document.getElementById('footerForm').classList.remove('d-none');
    document.getElementById('facebook').value = facebook;
    document.getElementById('instagram').value = instagram;
    document.getElementById('email').value = email;
    document.getElementById('telephone').value = telephone;
    document.getElementById('update-footer-btn').style.display = 'inline-block';
    document.getElementById('cancel-footer-btn').style.display = 'inline-block';
}

// Delete footer
async function deleteFooterContent(id) {
    if (!confirm("Apakah Anda yakin ingin menghapus footer ini?")) return;
    try {
        await deleteDoc(doc(db, "footer", id));
        alert("Footer berhasil dihapus!");
        loadFooterContents();
    } catch (e) {
        alert("Terjadi kesalahan saat menghapus data footer.");
        console.error("Error deleting footer document: ", e);
    }
}

// Update footer
const updateBtn = document.getElementById('update-footer-btn');
if (updateBtn) {
    updateBtn.addEventListener('click', async () => {
        if (currentFooterEditId) {
            try {
                await updateDoc(doc(db, "footer", currentFooterEditId), {
                    facebook: document.getElementById('facebook').value,
                    instagram: document.getElementById('instagram').value,
                    email: document.getElementById('email').value,
                    telephone: document.getElementById('telephone').value
                });
                alert("Data footer berhasil diperbarui!");
                loadFooterContents();
                document.getElementById('footerForm').reset();
                document.getElementById('update-footer-btn').style.display = 'none';
                document.getElementById('footerForm').classList.add('d-none');
                document.getElementById('kelola-footer-title').classList.add('d-none');
                document.getElementById('cancel-footer-btn').style.display = 'none';
                document.getElementById('footer-selection').classList.remove('d-none');
                currentFooterEditId = null;
            } catch (e) {
                alert("Terjadi kesalahan saat memperbarui data footer.");
                console.error("Error updating footer document: ", e);
            }
        }
    });
}

// Cancel edit
const cancelBtn = document.getElementById('cancel-footer-btn');
if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
        document.getElementById('footerForm').classList.add('d-none');
        document.getElementById('kelola-footer-title').classList.add('d-none');
        document.getElementById('update-footer-btn').style.display = 'none';
        document.getElementById('cancel-footer-btn').style.display = 'none';
        document.getElementById('footerForm').reset();
        currentFooterEditId = null;
        document.getElementById('footer-selection').classList.remove('d-none');
    });
}

// Submit form (add or update)
const footerForm = document.getElementById('footerForm');
if (footerForm) {
    footerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const facebook = document.getElementById('facebook').value.trim();
        const instagram = document.getElementById('instagram').value.trim();
        const email = document.getElementById('email').value.trim();
        const telephone = document.getElementById('telephone').value.trim();
        if (!facebook || !instagram || !email || !telephone) {
            alert("Semua field harus diisi.");
            return;
        }
        try {
            if (currentFooterEditId) {
                await updateDoc(doc(db, "footer", currentFooterEditId), { facebook, instagram, email, telephone });
                alert("Data footer berhasil diperbarui!");
            } else {
                await addDoc(collection(db, "footer"), { facebook, instagram, email, telephone });
                alert("Footer berhasil ditambahkan!");
            }
            loadFooterContents();
            document.getElementById('footerForm').reset();
            document.getElementById('footerForm').classList.add('d-none');
            document.getElementById('kelola-footer-title').classList.add('d-none');
            document.getElementById('update-footer-btn').style.display = 'none';
            document.getElementById('cancel-footer-btn').style.display = 'none';
            document.getElementById('footer-selection').classList.remove('d-none');
            currentFooterEditId = null;
        } catch (e) {
            alert("Terjadi kesalahan saat menyimpan data footer.");
            console.error("Error saving footer document: ", e);
        }
    });
}

// Initial load
window.addEventListener('DOMContentLoaded', () => {
    loadFooterContents();
});
