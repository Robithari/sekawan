import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from '../firebase-config.js';  // Naik satu level ke root


// Fungsi untuk memuat data footer
async function loadFooterData() {
    try {
        const querySnapshot = await getDocs(collection(db, "footer"));
        querySnapshot.forEach((doc) => {
            const data = doc.data();

            // Memasukkan data ke dalam elemen footer
            document.getElementById('facebook-link').href = data.facebook;
            document.getElementById('instagram-link').href = data.instagram;
            document.getElementById('email-link').textContent = data.email;
            document.getElementById('email-link').href = `mailto:${data.email}`;
            document.getElementById('telephone').textContent = data.telephone;
        });
    } catch (error) {
        console.error("Error memuat data footer:", error);
    }
}

// Panggil fungsi untuk memuat footer setelah halaman selesai dimuat
window.onload = function () {
    loadFooterData();
};