function showSection(sectionId) {
    console.log("showSection dipanggil dengan sectionId:", sectionId);
    const sections = document.querySelectorAll("section");
    sections.forEach(section => section.classList.add("d-none"));
    const sectionToShow = document.getElementById(sectionId);
    if (sectionToShow) {
        sectionToShow.classList.remove("d-none");
        console.log("Menampilkan section:", sectionId);
    } else {
        console.warn("Section dengan id", sectionId, "tidak ditemukan!");
    }

    // Update active menu item
    const menuItems = document.querySelectorAll("#sidebar a.nav-link");
    menuItems.forEach(item => item.classList.remove("active"));
    const activeMenu = document.querySelector(`#menu-${sectionId.replace('-section', '')}`);
    if (activeMenu) {
        activeMenu.classList.add("active");
    }
}

window.showSection = showSection;

document.addEventListener("DOMContentLoaded", function () {
    showSection('berita-section');

    // Pasang event listener click pada menu sidebar
    const menuItems = document.querySelectorAll("#sidebar a.nav-link");
    menuItems.forEach(item => {
        item.addEventListener("click", function(event) {
            event.preventDefault();
            const sectionId = this.id.replace("menu-", "") + "-section";
            console.log("Menu diklik:", this.id, "-> Menampilkan section:", sectionId);
            showSection(sectionId);
            // Jika menu laporan iuran, panggil ulang inisialisasi agar data & form selalu muncul
            if (sectionId === 'iuran-section' && typeof window.initIuranSection === 'function') {
                window.initIuranSection();
            }
            // Jika menu laporan kas, bisa tambahkan juga jika ingin refresh otomatis
            // if (sectionId === 'kas-section' && typeof window.initKasSection === 'function') {
            //     window.initKasSection();
            // }
        });
    });
});
