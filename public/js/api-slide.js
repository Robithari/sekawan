import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from '../firebase-config.js';

// Fungsi untuk memuat gambar carousel dari Firestore
export async function loadCarouselImages() {
  const carouselInner = document.querySelector('.carousel-inner');
  const carouselIndicators = document.querySelector('.carousel-indicators');
  carouselInner.innerHTML = '';  // Kosongkan konten carousel sebelumnya
  carouselIndicators.innerHTML = '';  // Kosongkan indikator sebelumnya

  try {
    const querySnapshot = await getDocs(collection(db, "carousel"));
    let isFirst = true;
    let slideIndex = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const imageUrl = data.imageUrl;

      // Buat item carousel
      const carouselItem = document.createElement('div');
      carouselItem.classList.add('carousel-item');
      if (isFirst) {
        carouselItem.classList.add('active');  // Set item pertama sebagai aktif
        isFirst = false;
      }
      carouselItem.innerHTML = `<img src="${imageUrl}" class="d-block w-100 custom-carousel-image" alt="Slide ${slideIndex + 1}">`;

      // Buat indikator untuk slide
      const indicatorButton = document.createElement('button');
      indicatorButton.type = 'button';
      indicatorButton.setAttribute('data-bs-target', '#carouselExampleDark');
      indicatorButton.setAttribute('data-bs-slide-to', slideIndex);
      indicatorButton.setAttribute('aria-label', `Slide ${slideIndex + 1}`);
      if (slideIndex === 0) {
        indicatorButton.classList.add('active');
        indicatorButton.setAttribute('aria-current', 'true');
      }

      // Tambahkan item ke carousel
      carouselInner.appendChild(carouselItem);
      carouselIndicators.appendChild(indicatorButton);

      slideIndex++;
    });
  } catch (error) {
    console.error("Error loading carousel images:", error);
  }
}

// Panggil fungsi untuk memuat gambar carousel saat halaman dimuat
window.addEventListener('DOMContentLoaded', loadCarouselImages);
