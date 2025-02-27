const db = require("./config/firebase");
const fs = require("fs");
const xml = require("xml");

async function generateSitemap() {
  try {
    // Ambil semua artikel
    const articlesSnapshot = await db.collection("articles").get();
    const articles = articlesSnapshot.docs.map(doc => {
      const data = doc.data();
      const lastmod = data.tanggalPembuatan || new Date().toISOString(); // Menggunakan tanggalPembuatan
      return {
        url: [
          { loc: `https://sekawanfc.fun/articles/${data.slug}` },
          { lastmod: lastmod.split('T')[0] }, // Ambil hanya tanggal
          { changefreq: 'weekly' },
          { priority: '0.8' }
        ]
      };
    });

    // Ambil semua berita
    const beritaSnapshot = await db.collection("berita").get();
    const berita = beritaSnapshot.docs.map(doc => {
      const data = doc.data();
      const lastmod = data.tanggalPembuatan || new Date().toISOString(); // Menggunakan tanggalPembuatan
      return {
        url: [
          { loc: `https://sekawanfc.fun/berita/${data.slug}` },
          { lastmod: lastmod.split('T')[0] }, // Ambil hanya tanggal
          { changefreq: 'weekly' },
          { priority: '0.8' }
        ]
      };
    });

    // Gabungkan semua URL
    const urls = [
      {
        url: [
          { loc: 'https://sekawanfc.fun/' },
          { lastmod: new Date().toISOString().split('T')[0] },
          { changefreq: 'daily' },
          { priority: '1.0' }
        ]
      },
      {
        url: [
          { loc: 'https://sekawanfc.fun/profil' },
          { lastmod: new Date().toISOString().split('T')[0] },
          { changefreq: 'weekly' },
          { priority: '0.8' }
        ]
      },
      {
        url: [
          { loc: 'https://sekawanfc.fun/berita' },
          { lastmod: new Date().toISOString().split('T')[0] },
          { changefreq: 'daily' },
          { priority: '0.9' }
        ]
      },
      {
        url: [
          { loc: 'https://sekawanfc.fun/artikel' },
          { lastmod: new Date().toISOString().split('T')[0] },
          { changefreq: 'daily' },
          { priority: '0.9' }
        ]
      },
      {
        url: [
          { loc: 'https://sekawanfc.fun/jadwal' },
          { lastmod: new Date().toISOString().split('T')[0] },
          { changefreq: 'weekly' },
          { priority: '0.8' }
        ]
      },
      {
        url: [
          { loc: 'https://sekawanfc.fun/kas' },
          { lastmod: new Date().toISOString().split('T')[0] },
          { changefreq: 'monthly' },
          { priority: '0.7' }
        ]
      },
      {
        url: [
          { loc: 'https://sekawanfc.fun/dokumentasi' },
          { lastmod: new Date().toISOString().split('T')[0] },
          { changefreq: 'weekly' },
          { priority: '0.8' }
        ]
      },
      {
        url: [
          { loc: 'https://sekawanfc.fun/inventaris' },
          { lastmod: new Date().toISOString().split('T')[0] },
          { changefreq: 'monthly' },
          { priority: '0.7' }
        ]
      },
      ...articles,
      ...berita
    ];

    // Generate sitemap XML
    const sitemap = xml({ urlset: [{ _attr: { xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' } }, ...urls] });

    // Simpan ke file
    fs.writeFileSync("public/sitemap.xml", sitemap);
    console.log("Sitemap berhasil diperbarui!");
  } catch (error) {
    console.error("Error generating sitemap:", error);
  }
}

generateSitemap();
