// Section Toggle Handler for CMS Sidebar
// All menu links must show/hide the correct section and hide others
// All section IDs must match the sidebar menu IDs


(function() {
    // Map menu IDs to section IDs
    const menuToSection = {
        'menu-artikel': 'artikel-section',
        'menu-berita': 'berita-section',
        'menu-jadwal': 'jadwal-section',
        'menu-kas': 'kas-section',
        'menu-dokumentasi': 'dokumentasi-section',
        'menu-inventaris': 'inventaris-section',
        'menu-profil': 'profil-section',
        'menu-data-user': 'data-user-section',
        'menu-carousel': 'carousel-section',
        'menu-footer': 'footer-section',
        'menu-musyawarah': 'musyawarah-section',
        'menu-notifikasi-user': 'notifikasi-user-section',
        // Add more if needed
    };

    function hideAllSections() {
        Object.values(menuToSection).forEach(function(sectionId) {
            var section = document.getElementById(sectionId);
            if (section) {
                section.classList.add('d-none');
            } else {
                console.warn('[SectionToggle] Section not found:', sectionId);
            }
        });
    }

    function setActiveMenu(menuId) {
        Object.keys(menuToSection).forEach(function(id) {
            var menu = document.getElementById(id);
            if (menu) menu.classList.remove('active');
        });
        var activeMenu = document.getElementById(menuId);
        if (activeMenu) activeMenu.classList.add('active');
        else console.warn('[SectionToggle] Menu not found:', menuId);
    }

    function showSectionForMenu(menuId) {
        console.log('[SectionToggle] showSectionForMenu called:', menuId);
        hideAllSections();
        setActiveMenu(menuId);
        var sectionId = menuToSection[menuId];
        if (!sectionId) {
            console.error('[SectionToggle] No section mapped for menu:', menuId);
            return;
        }
        var section = document.getElementById(sectionId);
        if (section) {
            section.classList.remove('d-none');
            console.log('[SectionToggle] Showing section:', sectionId);
        } else {
            console.error('[SectionToggle] Section element not found:', sectionId);
        }
    }

    // Attach click listeners to all sidebar menu items
    Object.keys(menuToSection).forEach(function(menuId) {
        var menu = document.getElementById(menuId);
        if (menu) {
            menu.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('[SectionToggle] Menu clicked:', menuId);
                showSectionForMenu(menuId);
            });
        } else {
            console.warn('[SectionToggle] Menu element not found:', menuId);
        }
    });

    // Optionally, show default section on load (e.g. artikel-section)
    document.addEventListener('DOMContentLoaded', function() {
        showSectionForMenu('menu-artikel');
    });
})();
