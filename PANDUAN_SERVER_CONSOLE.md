# 🖥️ PANDUAN MELIHAT SERVER CONSOLE

## 📍 **Lokasi Server Console:**
Server console = **Terminal/Command Prompt** tempat Anda menjalankan `node server.js`

## 🎯 **Setup untuk Monitoring:**

### **Langkah 1: Buka 2 Jendela**
```
🪟 Jendela 1: Browser
   └─ http://localhost:3000/debug-fcm-simple.html

🖥️ Jendela 2: Terminal/Command Prompt  
   └─ Menjalankan: node server.js
```

### **Langkah 2: Posisi Jendela**
```
┌─────────────────┬─────────────────┐
│                 │                 │
│    BROWSER      │    TERMINAL     │
│  (Panel Debug)  │ (Server Console)│
│                 │                 │
│ [Kirim Test     │ Waiting for     │
│  Notifikasi]    │ server logs...  │
│                 │                 │
└─────────────────┴─────────────────┘
```

## 📊 **Yang Akan Muncul di Server Console:**

### **✅ Jika TOKEN VALID (Berhasil):**
```bash
[TEST] Found 1 FCM tokens
[sendFCMToToken] ✅ SUCCESS send to token cSkuhphINQ... - messageId: projects/sekawan-fc-427414/messages/abc123
[TEST] FCM Send Result: {
  totalTokens: 1,
  successCount: 1,
  failureCount: 0,
  responses: [{ success: true, messageId: 'abc123' }]
}
```

### **❌ Jika TOKEN INVALID (Gagal):**
```bash
[TEST] Found 1 FCM tokens
[sendFCMToToken] ❌ FAILED send to token cSkuhphINQ...
[sendFCMToToken] Error details: {
  message: 'Requested entity was not found',
  code: 'not-found',
  details: 'The registration token is not a valid FCM registration token'
}
[TEST] FCM Send Result: {
  totalTokens: 1,
  successCount: 0,
  failureCount: 1,
  responses: [{ success: false, errorMessage: 'Requested entity was not found' }]
}
```

## 🔍 **Error Messages yang Mungkin Muncul:**

### **1. Token Expired/Invalid:**
```
Error: Requested entity was not found
Code: not-found
→ SOLUSI: Generate token baru
```

### **2. Token Format Salah:**
```
Error: Invalid registration token
Code: invalid-argument  
→ SOLUSI: Cek VAPID key dan Firebase config
```

### **3. Network/Firebase Error:**
```
Error: Error sending to FCM
Code: internal-error
→ SOLUSI: Cek koneksi internet & Firebase credentials
```

## 🎯 **Cara Praktis:**

### **Test Sekarang:**
1. ✅ **Pastikan server berjalan** (ada output di terminal)
2. ✅ **Buka browser** → panel debug
3. ✅ **Klik "Kirim Test Notifikasi"**  
4. 👀 **LANGSUNG LIHAT TERMINAL** → akan muncul log detail
5. 📝 **Copy paste** pesan error (jika ada) untuk analisis

### **Yang Perlu Dicatat:**
- ✅ Success count: berapa notifikasi berhasil
- ❌ Error message: pesan error spesifik
- 🔑 Token info: apakah token valid/invalid

## 💡 **Tips:**
- Jangan tutup terminal selama testing
- Scroll up di terminal untuk melihat log sebelumnya
- Copy error message lengkap untuk troubleshooting
- Bandingkan success count dengan total tokens

## 📞 **Laporkan Hasil:**
Setelah test, copy paste output dari terminal:
```
"[TEST] Found X FCM tokens
[sendFCMToToken] hasil...
[TEST] FCM Send Result: {...}"
```
