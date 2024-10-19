const menuToggle = document.getElementById("menu-toggle");
const wrapper = document.getElementById("wrapper");

menuToggle.addEventListener("click", function () {
    wrapper.classList.toggle("toggled");
});

function showSection(sectionId) {
    // Sembunyikan semua section
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.add('d-none');
    });

    // Tampilkan section yang dipilih
    document.getElementById(sectionId).classList.remove('d-none');
}