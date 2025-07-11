const admin = require("firebase-admin");
require("dotenv").config(); // Memuat environment variables

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

const db = admin.firestore();

exports.renderHomePage = async (req, res) => {
  try {
    // Optimasi: limit data untuk homepage agar lebih ringan
    const carouselSnapshot = await db.collection("carousel").limit(5).get();
    const articlesSnapshot = await db.collection("articles").limit(5).get();
    const beritaSnapshot = await db.collection("berita").orderBy('tanggalPembuatan', 'desc').limit(5).get();
    const footerSnapshot = await db.collection("footer").limit(1).get();
    const jadwalSnapshot = await db.collection("jadwalPertandingan").orderBy("tanggal", "desc").limit(1).get();

    const carouselImages = carouselSnapshot.docs.map(doc => doc.data());
    const articles = articlesSnapshot.docs.map(doc => doc.data());
    const berita = beritaSnapshot.docs.map(doc => doc.data());
    const footerData = footerSnapshot.docs.map(doc => doc.data())[0];
    let matchData = null;
    let countdown = null;

    // Helper function to convert 'HH.mm' to 'HH:mm'
    function normalizeTimeFormat(timeStr) {
      if (timeStr.includes('.')) {
        return timeStr.replace('.', ':');
      }
      return timeStr;
    }

    jadwalSnapshot.forEach(doc => {
      matchData = doc.data();

      // console.log("DEBUG matchData:", matchData);

      const matchDate = new Date(matchData.tanggal);
      const formattedDate = `${matchDate.getDate().toString().padStart(2, '0')}-${(matchDate.getMonth() + 1).toString().padStart(2, '0')}-${matchDate.getFullYear()}`;
      matchData.formattedTanggal = formattedDate;

      // Normalize waktu format to 'HH:mm'
      const normalizedWaktu = normalizeTimeFormat(matchData.waktu);

      // Mengambil waktu dari Firestore dan memecah jam dan menit
      const [hours, minutes] = normalizedWaktu.split(':').map(Number);
      // console.log("DEBUG waktu:", hours, minutes);

      const matchDateTime = new Date(matchDate);
      matchDateTime.setHours(hours);
      matchDateTime.setMinutes(minutes);
      matchDateTime.setSeconds(0);
      matchDateTime.setMilliseconds(0);

      const now = new Date();
      const timeDiff = matchDateTime - now;

      // console.log("DEBUG timeDiff:", timeDiff);

      if (timeDiff <= 0) {
        const matchEndTime = matchDateTime.getTime() + 90 * 60 * 1000;  // 90 menit durasi pertandingan
        const timeDiffEnd = matchEndTime - now.getTime();

        if (timeDiffEnd <= 0) {
          countdown = 'Pertandingan Ini Telah Selesai';
        } else {
          countdown = 'Pertandingan Sedang Dimulai';
        }
      } else {
        const hoursLeft = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const secondsLeft = Math.floor((timeDiff % (1000 * 60)) / 1000);
        countdown = `${hoursLeft} jam ${minutesLeft} menit ${secondsLeft} detik`;
      }

      // console.log("DEBUG countdown:", countdown);

      matchData.countdown = countdown;
    });

    res.render("index", {
      carouselImages,
      articles,
      berita,
      footerData,
      matchData,
      countdown
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error loading homepage");
  }
};
