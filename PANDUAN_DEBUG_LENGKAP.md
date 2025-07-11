# 🔧 PANDUAN LENGKAP: Debug Push Notification Sekawan FC

## 📋 **Langkah 1: Menjalankan Server**

1. Buka Command Prompt atau Terminal
2. Navigasi ke folder proyek:
   ```
   cd c:\SSD\untukpembelajaran\sekawan
   ```
3. Jalankan server:
   ```
   npm start
   ```
   atau
   ```
   node server.js
   ```
4. Tunggu sampai muncul pesan: "Server berjalan di port 3000"

## 🌐 **Langkah 2: Membuka Panel Debug**

1. Buka browser (Chrome/Firefox/Edge)
2. Ketik di address bar:
   ```
   http://localhost:3000/fcm-test.html
   ```
3. Tekan Enter

## 👀 **Langkah 3: Memahami Panel Debug**

Panel debug akan menampilkan halaman dengan beberapa bagian:

### **A. 📱 Client-Side FCM Test**
- **"Test FCM Setup"** - Test setup FCM di browser
- **"Request Permission"** - Minta izin notifikasi
- **"Register Service Worker"** - Daftarkan service worker

### **B. 🖥️ Server-Side FCM Test**
- **"Check Server Status"** - Cek status server FCM
- **"Send Test Notification"** - Kirim notifikasi test

### **C. 📝 Debug Logs**
- Area yang menampilkan semua log/pesan debug
- **"Clear Logs"** - Hapus semua log

## 🔍 **Langkah 4: Menggunakan Panel Debug**

### **Test 1: Setup FCM**
1. Klik tombol **"Test FCM Setup"**
2. Browser akan meminta izin notifikasi - klik **"Allow"/"Izinkan"**
3. Lihat pesan di area "Debug Logs"
4. Status akan berubah menjadi hijau jika berhasil

### **Test 2: Cek Server**
1. Klik tombol **"Check Server Status"**
2. Lihat status Firebase dan database
3. Catat berapa banyak token FCM yang tersimpan

### **Test 3: Kirim Notifikasi Test**
1. Klik tombol **"Send Test Notification"**
2. Notifikasi seharusnya muncul di browser
3. Jika muncul, berarti sistem FCM bekerja!

## 🕵️ **Langkah 5: Debugging Lebih Detail**

### **A. Buka Developer Tools**
1. Tekan **F12** di browser
2. Buka tab **"Console"**
3. Lihat pesan error (jika ada)

### **B. Cek Service Worker**
1. Di Developer Tools, buka tab **"Application"**
2. Klik **"Service Workers"** di sidebar kiri
3. Pastikan `firebase-messaging-sw.js` terdaftar dan "running"

### **C. Cek Local Storage**
1. Di tab "Application", klik **"Local Storage"**
2. Klik **"http://localhost:3000"**
3. Cari item `fcmTokenSentArr` - ini berisi token FCM

## ❗ **Troubleshooting Umum**

### **Jika Tombol Tidak Berfungsi:**
- Refresh halaman (F5)
- Clear cache browser (Ctrl+Shift+Delete)

### **Jika Muncul Error Permission:**
- Klik ikon gembok di address bar
- Aktifkan notifikasi untuk localhost

### **Jika Service Worker Error:**
- Buka: http://localhost:3000/firebase-messaging-sw.js
- Pastikan file bisa diakses

### **Jika Tidak Ada Token:**
- Pastikan permission granted
- Pastikan service worker aktif
- Cek konfigurasi Firebase

## 📸 **Screenshot Area Penting**

Ambil screenshot dari:
1. **Panel debug** - tampilan utama
2. **Browser console** (F12 > Console) - jika ada error
3. **Service worker status** (F12 > Application > Service Workers)
4. **Notification permission** - setting browser

## 🎯 **Hasil yang Diharapkan**

### **✅ Jika Sistem Bekerja Normal:**
- Permission: "granted"
- Service Worker: "running"
- FCM Token: berhasil dibuat (panjang ~150+ karakter)
- Server Status: Firebase connected
- Test Notification: muncul popup notifikasi

### **❌ Jika Ada Masalah:**
- Panel debug akan menampilkan error merah
- Console browser akan menampilkan pesan error
- Status akan menunjukkan tahap mana yang gagal

## 📞 **Langkah Selanjutnya**

Setelah menjalankan semua test di atas:

1. **Catat semua error** yang muncul
2. **Screenshot panel debug** dan console
3. **Laporkan hasil** dengan detail:
   - Apakah permission granted?
   - Apakah service worker running?
   - Apakah FCM token berhasil dibuat?
   - Apakah notifikasi test muncul?
   - Error apa yang muncul?

Dengan informasi ini, kita bisa mengidentifikasi masalah spesifik dan memberikan solusi yang tepat.
