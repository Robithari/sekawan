import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const db = getFirestore();

// Fungsi untuk memuat data footer dari Firestore
async function loadFooter() {
  try {
    const docRef = doc(db, "footer", "footerContent");  // Mengambil referensi dokumen footerContent di dalam collection footer
    const footerDoc = await getDoc(docRef); // Mendapatkan data dokumen

    if (footerDoc.exists()) {
      const footerData = footerDoc.data();  // Mengambil data dari dokumen
      // Menampilkan data pada form CMS
      document.getElementById('facebook-link').value = footerData.facebookLink;
      document.getElementById('instagram-link').value = footerData.instagramLink;
      document.getElementById('email').value = footerData.email;
      document.getElementById('telephone').value = footerData.telephone;
    } else {
      console.error("No such document!");
    }
  } catch (e) {
    console.error("Error loading footer:", e);
  }
}

// Fungsi untuk menyimpan data footer ke Firestore
async function saveFooter() {
  // Mengambil nilai dari form input
  const facebookLink = document.getElementById('facebook-link').value;
  const instagramLink = document.getElementById('instagram-link').value;
  const email = document.getElementById('email').value;
  const telephone = document.getElementById('telephone').value;

  try {
    const docRef = doc(db, "footer", "footerContent"); // Mengambil referensi dokumen footerContent
    await updateDoc(docRef, {
      facebookLink: facebookLink,
      instagramLink: instagramLink,
      email: email,
      telephone: telephone
    });
    alert("Footer berhasil diperbarui!");  // Menampilkan alert jika penyimpanan berhasil
  } catch (e) {
    console.error("Error updating footer:", e);
    alert("Terjadi kesalahan saat memperbarui footer.");  // Menampilkan alert jika terjadi kesalahan
  }
}

// Event Listener untuk tombol simpan footer
document.getElementById('save-footer-btn').addEventListener('click', saveFooter);

// Panggil fungsi loadFooter saat halaman dimuat
window.onload = function () {
  loadFooter(); // Memuat data footer saat halaman admin dibuka
};
