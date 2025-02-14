class Berita {
  constructor(id, title, content, photoUrl, caption, titleKeterangan, tanggalPembuatan, slug) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.photoUrl = photoUrl;
    this.caption = caption;
    this.titleKeterangan = titleKeterangan;
    this.tanggalPembuatan = tanggalPembuatan || new Date();
    this.slug = slug || this.createSlug(title);
  }

  // Fungsi untuk membuat slug dari title
  createSlug(title) {
    return title.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  }
}

module.exports = Berita;
