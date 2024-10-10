import { collection, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from './firebase-config.js';

let currentFooterEditId = null;

export async function loadFooterContents() {
    try {
        console.log("Fungsi loadFooterContents dipanggil");
        const querySnapshot = await getDocs(collection(db, "footer"));
        console.log("Data footer diambil:", querySnapshot);
        const footerList = document.getElementById('footer-selection');
        footerList.innerHTML = '';

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log("Data footer:", data);
            const footerItem = `
                <div class="footer-item">
                    <p>Facebook: ${data.facebook}</p>
                    <p>Instagram: ${data.instagram}</p>
                    <p>Email: ${data.email}</p>
                    <p>Telephone: ${data.telephone}</p>
                    <button class="btn btn-warning" onclick="editFooterContent('${doc.id}', '${data.facebook}', '${data.instagram}', '${data.email}', '${data.telephone}')">Edit</button>
                </div>
                <hr>
            `;
            footerList.innerHTML += footerItem;
        });
    } catch (e) {
        console.error("Error loading footer contents: ", e);
    }
}

window.editFooterContent = function (id, facebook, instagram, email, telephone) {
    currentFooterEditId = id;

    // Menampilkan kembali judul "Kelola Footer" dan formulir pengeditan
    document.getElementById('kelola-footer-title').style.display = 'block'; // Tampilkan judul
    document.getElementById('footerForm').style.display = 'block'; // Tampilkan formulir

    // Memasukkan data yang ada ke dalam input form
    document.getElementById('facebook').value = facebook;
    document.getElementById('instagram').value = instagram;
    document.getElementById('email').value = email;
    document.getElementById('telephone').value = telephone;

    // Menampilkan tombol update dan cancel
    document.getElementById('update-footer-btn').style.display = 'inline-block';
    document.getElementById('cancel-footer-btn').style.display = 'inline-block';
}

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

            // Sembunyikan kembali formulir setelah selesai mengedit
            document.getElementById('footerForm').style.display = 'none';
            document.getElementById('kelola-footer-title').style.display = 'none'; // Sembunyikan judul
            document.getElementById('cancel-footer-btn').style.display = 'none'; // Sembunyikan tombol cancel

            currentFooterEditId = null;
        } catch (e) {
            console.error("Error updating footer document: ", e);
        }
    }
}

document.getElementById('cancel-footer-btn').onclick = function () {
    // Sembunyikan form dan judul tanpa melakukan perubahan
    document.getElementById('footerForm').style.display = 'none';
    document.getElementById('kelola-footer-title').style.display = 'none';
    document.getElementById('update-footer-btn').style.display = 'none';
    document.getElementById('cancel-footer-btn').style.display = 'none';

    // Reset form input
    document.getElementById('footerForm').reset();
    currentFooterEditId = null;
}

// Load data footer saat halaman dimuat
window.onload = function () {
    loadFooterContents();
};
