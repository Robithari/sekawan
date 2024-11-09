import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from './firebase-config.js';

async function loadCarouselImages() {
    try {
        const querySnapshot = await getDocs(collection(db, "carousel"));
        const carouselInner = document.getElementById('carousel-inner');
        const carouselIndicators = document.getElementById('carousel-indicators');
        
        let index = 0;
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const isActive = index === 0 ? 'active' : '';

            // Tambahkan slide ke dalam carousel-inner
            const slide = `
                <div class="carousel-item ${isActive}">
                    <img src="${data.imageUrl}" class="d-block w-100 custom-carousel-image" alt="Slide ${index + 1}">
                </div>`;
            carouselInner.innerHTML += slide;

            // Tambahkan indikator ke dalam carousel-indicators
            const indicator = `
                <button type="button" data-bs-target="#carouselExampleDark" data-bs-slide-to="${index}" class="${isActive}" aria-current="true" aria-label="Slide ${index + 1}"></button>`;
            carouselIndicators.innerHTML += indicator;

            index++;
        });
    } catch (error) {
        console.error("Error loading carousel images:", error);
    }
}

// Panggil fungsi ini ketika halaman selesai dimuat
window.addEventListener('load', loadCarouselImages);


