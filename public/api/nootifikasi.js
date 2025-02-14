messaging.requestPermission()
  .then(() => {
    console.log('Notification permission granted.');
    return messaging.getToken();
  })
  .then((token) => {
    console.log('Token:', token);
    // Simpan token ke server untuk mengirim notifikasi
  })
  .catch((error) => {
    console.log('Unable to get permission to notify.', error);
  });
