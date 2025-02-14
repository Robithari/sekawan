document.addEventListener('DOMContentLoaded', function () {
    // Cek status API
    function checkApiStatus() {
        return fetch('https://script.googleusercontent.com/macros/echo?user_content_key=CZfT4ukELTEw74U8y4_OVSdJA0MoRPTnbfrM_pEJnBf_yj0iY0f6c9xlI4u9RgHKuk3zOPedAt89EJiJW5Ng1pQVVtY5QfDsm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnFp8IpH6vIoxlz6z1vHvBGveIMkwE5hxhRZgrX7pPlQO98dtL__CtYPa3KdNnIXbUm9WnqK1sm1dRh5mrQJuQ_bE78tZtLS8jw&lib=MOgvvmbSEQE02bq4Gi45tbleS6DrsjUUV') // Ganti dengan URL API kamu
            .then(response => response.ok) // Jika response ok (status 200), berarti API siap
            .catch(() => false); // Jika terjadi error, anggap API belum siap
    }

    function showMainContent() {
        document.getElementById('main-content').style.display = 'block';
        document.getElementById('loading-screen').style.display = 'none';
    }

    function keepSplashScreen() {
        document.getElementById('main-content').style.display = 'none';
        document.getElementById('loading-screen').style.display = 'block';
    }

    function checkAuthAndApi() {
        firebase.auth().onAuthStateChanged(async function (user) {
            if (user) {
                // Jika pengguna sudah login, cek status API
                keepSplashScreen(); // Tampilkan splash screen saat pengecekan API
                let apiReady = false;

                // Loop untuk terus mengecek status API setiap beberapa detik
                while (!apiReady) {
                    apiReady = await checkApiStatus(); // Tunggu hingga API siap
                    if (apiReady) {
                        showMainContent(); // API siap, tampilkan konten halaman
                    } else {
                        console.log('API belum siap, menunggu...');
                        await new Promise(resolve => setTimeout(resolve, 3000)); // Tunggu 3 detik sebelum cek lagi
                    }
                }
            } else {
                // Jika belum login, arahkan ke halaman login
                window.location.href = 'login.html';
            }
        });
    }

    checkAuthAndApi();
});
