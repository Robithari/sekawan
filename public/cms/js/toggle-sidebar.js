document.addEventListener('DOMContentLoaded', function () {
    var sidebar = document.getElementById('sidebar');
    var menuToggle = document.getElementById('menu-toggle');
    if (sidebar && menuToggle) {
        var bsCollapse = new bootstrap.Collapse(sidebar, { toggle: false });
        menuToggle.addEventListener('click', function () {
            bsCollapse.toggle();
        });

        // Tambahkan event listener untuk semua link menu di sidebar
        var menuLinks = sidebar.querySelectorAll('a.nav-link');
        menuLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                // Jika layar kecil (mobile), sembunyikan sidebar saat menu diklik
                if (window.innerWidth < 768) {
                    bsCollapse.hide();
                }
            });
        });
    }
});
