document.getElementById('logout-btn').addEventListener('click', function() {
    firebase.auth().signOut().then(() => {
      alert("You have successfully logged out.");
      window.location.href = 'login.html'; // Arahkan ke halaman login setelah logout
    }).catch((error) => {
      console.error("Error logging out:", error);
    });
  });
  