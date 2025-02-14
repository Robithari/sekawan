document.getElementById("copyLink").addEventListener("click", function () {
    // Mendapatkan URL halaman saat ini
    const link = window.location.href;

    // Membuat elemen input untuk sementara menyimpan URL
    const tempInput = document.createElement("input");
    document.body.appendChild(tempInput);
    tempInput.value = link;
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);

    // Menampilkan notifikasi bahwa tautan telah disalin
    const notification = document.getElementById("tautan-notification");
    notification.style.display = "block";

    // Menghilangkan notifikasi setelah 3 detik
    setTimeout(function () {
      notification.style.display = "none";
    }, 3000);
  });