const db = require("../config/firebase");

exports.renderProfilPage = async (req, res) => {
  try {
    // Ambil data profil dari Firestore
    const snapshotProfil = await db.collection("profil").get();
    const profil = snapshotProfil.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Ambil data footer dari Firestore
    const snapshotFooter = await db.collection("footer").get();
    const footerData = snapshotFooter.docs.map(doc => doc.data())[0] || {}; // Ambil data footer pertama

    // Periksa apakah data profil tersedia
    if (profil.length > 0) {
      const profilContent = profil[0].content; // Ambil konten profil yang diinginkan
      // Render data profil dan footer menggunakan EJS
      res.render("profil", { profilContent, footerData });
    } else {
      res.status(404).render("error", { error: { pesan: "Profil tidak ditemukan!" } });
    }
  } catch (error) {
    console.error("Kesalahan saat mengambil profil:", error);
    res.status(500).render("error", { error: { pesan: "Kesalahan saat mengambil profil" } });
  }
};
