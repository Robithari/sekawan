if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/service-worker.js').then(function (registration) {
            // Service Worker registered successfully
            // console.log('Service Worker registered with scope:', registration.scope);
        }, function (error) {
            console.error('Service Worker registration failed:', error);
        });
    });
}
