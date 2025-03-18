import { 
    getFirestore, doc, getDoc 
  } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
  import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
  import { db } from "../firebase-config.js"; // Path diperbaiki
  
  async function fetchProfileData() {
    console.log("Memulai pengambilan data profil...");
    const profilContentElement = document.getElementById('profil-content');
  
    // Jika elemen tidak ditemukan, hentikan eksekusi
    if (!profilContentElement) {
      console.error("Elemen dengan ID 'profil-content' tidak ditemukan di halaman.");
      return;
    }
  
    // Buat pesan loading
    const loadingMessage = document.createElement('div');
    loadingMessage.textContent = 'Memuat profil...';
    loadingMessage.style.color = 'gray';
    loadingMessage.style.textAlign = 'center';
    loadingMessage.style.marginTop = '20px';
  
    // Tampilkan pesan loading
    profilContentElement.innerHTML = '';
    profilContentElement.appendChild(loadingMessage);
  
    try {
      console.log("Mengakses dokumen 'main' di koleksi 'profil'...");
  
      // Buat referensi ke dokumen 'main' di koleksi 'profil'
      const docRef = doc(db, "profil", "main");
  
      // Ambil data dari Firestore
      const docSnap = await getDoc(docRef);
  
      // Periksa apakah dokumen ada
      if (docSnap.exists()) {
        console.log("Dokumen ditemukan:", docSnap.data());
  
        // Ambil konten dari dokumen
        const content = docSnap.data().content;
  
        // Tampilkan konten di elemen HTML
        profilContentElement.innerHTML = content;
      } else {
        console.error("Dokumen 'main' tidak ditemukan di koleksi 'profil'.");
        profilContentElement.innerHTML = '<p style="color: red; text-align: center;">Profil belum tersedia.</p>';
      }
    } catch (error) {
      console.error('Kesalahan saat mengambil data profil:', error);
      profilContentElement.innerHTML = '<p style="color: red; text-align: center;">Terjadi kesalahan saat memuat profil.</p>';
    }
  }
  
  // Jalankan fungsi fetchProfileData saat halaman selesai dimuat
  document.addEventListener('DOMContentLoaded', fetchProfileData);