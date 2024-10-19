// Inisialisasi Firebase (ini harus sesuai dengan konfigurasi Firebase Anda)
const db = firebase.firestore(); // Misalkan Anda menggunakan Firestore untuk menyimpan data artikel
const articleList = document.getElementById('article-list');
const addArticleForm = document.getElementById('add-article-form');
const submitBtn = document.getElementById('submit-btn');
let editMode = false;
let editingArticleId = null;

// Fungsi untuk menampilkan artikel yang ada di Firestore ke halaman CMS
function loadArticles() {
  db.collection('articles').get().then((querySnapshot) => {
    articleList.innerHTML = ''; // Kosongkan daftar artikel sebelum ditambahkan
    querySnapshot.forEach((doc) => {
      const article = doc.data();
      const li = document.createElement('li');
      li.innerHTML = `<a href="${article.linkUrl}" target="_blank">${article.title}</a> 
                      <button onclick="editArticle('${doc.id}')">Edit</button>
                      <button onclick="deleteArticle('${doc.id}')">Delete</button>`;
      articleList.appendChild(li);
    });
  });
}

// Fungsi untuk menambahkan artikel baru
addArticleForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const title = document.getElementById('title').value;
  const content = document.getElementById('content').value;
  const imageUrl = document.getElementById('image-url').value;
  const linkUrl = document.getElementById('link-url').value;

  const article = {
    title,
    content,
    imageUrl,
    linkUrl
  };

  if (editMode) {
    // Jika dalam mode edit, perbarui artikel yang ada
    db.collection('articles').doc(editingArticleId).update(article).then(() => {
      resetForm();
      loadArticles();
    });
  } else {
    // Jika dalam mode tambah, tambahkan artikel baru
    db.collection('articles').add(article).then(() => {
      resetForm();
      loadArticles();
    });
  }
});

// Fungsi untuk mengedit artikel
function editArticle(id) {
  editMode = true;
  editingArticleId = id;

  db.collection('articles').doc(id).get().then((doc) => {
    const article = doc.data();
    document.getElementById('title').value = article.title;
    document.getElementById('content').value = article.content;
    document.getElementById('image-url').value = article.imageUrl;
    document.getElementById('link-url').value = article.linkUrl;
    document.getElementById('form-title').innerText = 'Edit Article';
    submitBtn.innerText = 'Update Article';
  });
}

// Fungsi untuk menghapus artikel
function deleteArticle(id) {
  db.collection('articles').doc(id).delete().then(() => {
    loadArticles();
  });
}

// Reset form setelah menambah atau mengedit artikel
function resetForm() {
  editMode = false;
  editingArticleId = null;
  document.getElementById('title').value = '';
  document.getElementById('content').value = '';
  document.getElementById('image-url').value = '';
  document.getElementById('link-url').value = '';
  document.getElementById('form-title').innerText = 'Add New Article';
  submitBtn.innerText = 'Add Article';
}

// Load artikel saat halaman dibuka
loadArticles();
