
// Semua operasi Firebase harus menggunakan window.firebase (CDN v8)
// Pastikan firebase-app.js, firebase-auth.js, firebase-firestore.js, dan firebase-config.js sudah di-load di cms.ejs
var auth = window.firebase.auth();
var idToken = null;

auth.onAuthStateChanged(function(user) {
    if (user) {
        user.getIdToken().then(function(token) {
            idToken = token;
            var bodyContent = document.getElementById('body-content');
            if (bodyContent) bodyContent.style.display = 'block';
        });
    } else {
        window.location.href = "/login-cms";
    }
});

// Fungsi pembungkus fetch untuk menambahkan header Authorization
window.authFetch = function(url, options) {
    options = options || {};
    options.headers = options.headers || {};
    if (idToken) {
        options.headers['Authorization'] = 'Bearer ' + idToken;
    }
    return fetch(url, options);
};

// Handle Logout
document.addEventListener('DOMContentLoaded', function() {
    var logoutButton = document.querySelector("a[href='/login-cms']");
    if (logoutButton) {
        logoutButton.addEventListener("click", function(e) {
            e.preventDefault();
            auth.signOut().then(function() {
                sessionStorage.clear();
                localStorage.clear();
                if ('caches' in window) {
                    caches.keys().then(function (names) {
                        for (var i = 0; i < names.length; i++) caches.delete(names[i]);
                    });
                }
                alert("Logout berhasil!");
                window.location.href = "/login-cms";
            }).catch(function(error) {
                console.error("Error logging out: ", error);
                alert(error.message);
            });
        });
    }
});
