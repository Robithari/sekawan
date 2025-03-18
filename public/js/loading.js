// File: js/loading.js
document.addEventListener('DOMContentLoaded', function () {
    const loadingSpinner = document.getElementById('loadingSpinner');
    let isSamePageNavigation = false;

    function showSpinner() {
        loadingSpinner.classList.add('active');
    }

    function hideSpinner() {
        loadingSpinner.classList.remove('active');
    }

    window.addEventListener('beforeunload', function() {
        isSamePageNavigation = false;
    });

    document.querySelectorAll('a').forEach(link => {
        // Hanya skip untuk dropdown toggle
        const isDropdownToggle = link.matches('[data-bs-toggle="dropdown"]');
        
        link.addEventListener('click', function (e) {
            // Skip handling untuk dropdown toggle saja
            if (isDropdownToggle) {
                return;
            }

            if (this.href === window.location.href || this.href.startsWith('#')) {
                isSamePageNavigation = true;
                return;
            }
            
            if (this.href && !this.href.startsWith('javascript:')) {
                isSamePageNavigation = false;
                showSpinner();
            }
        });
    });

    window.addEventListener('load', function() {
        hideSpinner();
    });

    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            hideSpinner();
        }
    });

    window.addEventListener('error', function() {
        hideSpinner();
    });

    window.addEventListener('popstate', function() {
        if (!isSamePageNavigation) {
            hideSpinner();
        }
    });
});