## 🔧 Debug FCM Push Notification System

### Langkah Debug yang Perlu Dilakukan:

1. **Jalankan Server**
   ```bash
   cd /c/SSD/untukpembelajaran/sekawan
   npm start
   ```

2. **Buka Halaman Debug**
   - Buka browser dan kunjungi: `http://localhost:3000/fcm-test.html`
   - Atau: `http://localhost:3000/fcm-debug.html`

3. **Test Client-Side FCM**
   - Klik "Test FCM Setup" - akan meminta permission dan mengambil token
   - Pastikan tidak ada error di console browser
   - Catat token FCM yang dihasilkan

4. **Test Server-Side FCM**
   - Klik "Check Server Status" - akan mengecek koneksi Firebase
   - Klik "Send Test Notification" - akan mengirim notifikasi test

5. **Debug di Browser Console**
   - Buka Developer Tools (F12)
   - Lihat tab Console untuk pesan debug
   - Periksa tab Application > Service Workers
   - Periksa tab Application > Storage > Local Storage

6. **Debug di CMS**
   - Login ke CMS
   - Buka section "Notifikasi User"
   - Coba kirim notifikasi test

### ❗ Issues Yang Mungkin Ditemukan:

1. **Permission Denied**
   - Browser memblokir notifikasi
   - Solusi: Aktifkan di browser settings

2. **Service Worker Error**
   - firebase-messaging-sw.js tidak terdaftar
   - Solusi: Refresh browser, clear cache

3. **Token Not Generated**
   - VAPID key salah
   - Firebase config salah
   - Solusi: Periksa konfigurasi

4. **Backend Error**
   - Firebase Admin tidak terinialisasi
   - Firestore connection error
   - Solusi: Periksa service account key

5. **Notification Not Showing**
   - Token tidak valid
   - FCM send error
   - Browser tidak mendukung

### 📋 Checklist Debug:

- [ ] Server berjalan tanpa error
- [ ] Firebase config benar
- [ ] Service worker terdaftar
- [ ] Permission granted
- [ ] FCM token berhasil dibuat
- [ ] Token tersimpan di database
- [ ] Backend dapat mengirim FCM
- [ ] Notifikasi muncul di browser
- [ ] Klik notifikasi redirect ke /notifikasi

### 🔍 Log Files to Check:

1. **Browser Console**: Error frontend
2. **Server Terminal**: Error backend
3. **Firebase Console**: Delivery reports
4. **Debug Endpoint**: `/api/test-fcm-status`

### 📞 Next Steps:

Setelah menjalankan test di atas, laporkan:
1. Error apa yang muncul
2. Status permission browser
3. Apakah token FCM berhasil dibuat
4. Apakah notifikasi muncul
5. Screenshot debug panel jika perlu
