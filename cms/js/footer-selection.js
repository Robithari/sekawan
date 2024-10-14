import { collection, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from '../../firebase-config.js';

let currentFooterEditId = null;

// Fungsi untuk memuat konten footer dari Firestore
export async function loadFooterContents() {
    try {
        console.log("Fungsi loadFooterContents dipanggil");
        const querySnapshot = await getDocs(collection(db, "footer"));
        console.log("Data footer diambil:", querySnapshot);
        const footerList = document.getElementById('footer-selection');
        footerList.innerHTML = '';

        querySnapshot.forEach((documentSnapshot) => {
            const data = documentSnapshot.data();
            console.log("Data footer:", data);
            const footerItem = `
                <div class="col-12 mb-3">
                    <div class="card">
                        <div class="card-body">
                            <p><strong>Facebook:</strong> <a href="${data.facebook}" target="_blank">${data.facebook}</a></p>
                            <p><strong>Instagram:</strong> <a href="${data.instagram}" target="_blank">${data.instagram}</a></p>
                            <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
                            <p><strong>Telepon:</strong> <a href="tel:${data.telephone}">${data.telephone}</a></p>
                            <button class="btn btn-warning btn-sm me-2" onclick="editFooterContent('${documentSnapshot.id}', '${data.facebook}', '${data.instagram}', '${data.email}', '${data.telephone}')">
                                <i class="bi bi-pencil-square"></i> Edit
                            </button>
                        </div>
                    </div>
                </div>
            `;
            footerList.innerHTML += footerItem;
        });
    } catch (e) {
        console.error("Error loading footer contents: ", e);
    }
}

// Fungsi untuk mengedit konten footer
window.editFooterContent = function (id, facebook, instagram, email, telephone) {
    currentFooterEditId = id;

    // Menyembunyikan daftar footer
    document.getElementById('footer-selection').classList.add('d-none');

    // Menampilkan judul dan formulir pengeditan
    document.getElementById('kelola-footer-title').classList.remove('d-none');
    document.getElementById('footerForm').classList.remove('d-none');

    // Memasukkan data yang ada ke dalam input form
    document.getElementById('facebook').value = facebook;
    document.getElementById('instagram').value = instagram;
    document.getElementById('email').value = email;
    document.getElementById('telephone').value = telephone;

    // Menampilkan tombol update dan cancel
    document.getElementById('update-footer-btn').style.display = 'inline-block';
    document.getElementById('cancel-footer-btn').style.display = 'inline-block';
}

// Event listener untuk tombol update footer
document.getElementById('update-footer-btn').onclick = async function () {
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

            // Menyembunyikan kembali formulir setelah selesai mengedit
            document.getElementById('footerForm').classList.add('d-none');
            document.getElementById('kelola-footer-title').classList.add('d-none');
            document.getElementById('cancel-footer-btn').style.display = 'none';

            // Menampilkan kembali daftar footer
            document.getElementById('footer-selection').classList.remove('d-none');

            currentFooterEditId = null;
        } catch (e) {
            console.error("Error updating footer document: ", e);
            alert("Terjadi kesalahan saat memperbarui data footer.");
        }
    }
}

// Event listener untuk tombol batal
document.getElementById('cancel-footer-btn').onclick = function () {
    // Menyembunyikan form dan judul tanpa melakukan perubahan
    document.getElementById('footerForm').classList.add('d-none');
    document.getElementById('kelola-footer-title').classList.add('d-none');
    document.getElementById('update-footer-btn').style.display = 'none';
    document.getElementById('cancel-footer-btn').style.display = 'none';

    // Reset form input
    document.getElementById('footerForm').reset();
    currentFooterEditId = null;

    // Menampilkan kembali daftar footer
    document.getElementById('footer-selection').classList.remove('d-none');
}

// Load data footer saat halaman dimuat
window.onload = function () {
    loadFooterContents();
};
