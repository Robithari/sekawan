function deleteAllCookies() {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }
  }

  // Prevent setting new cookies
  Object.defineProperty(document, 'cookie', {
    get: function () { return ''; },
    set: function () { }
  });

  // Call the function to delete cookies
  deleteAllCookies();