const express = require('express');
const router = express.Router();
const db = require('../config/firebase');
const xml = require('xml');

// Helper: format date to YYYY-MM-DD
function formatDate(date) {
  if (!date) return new Date().toISOString().split('T')[0];
  if (typeof date === 'string' && date.length >= 10) return date.slice(0, 10);
  if (date.toDate) return date.toDate().toISOString().split('T')[0];
  return new Date(date).toISOString().split('T')[0];
}

router.get('/sitemap.xml', async (req, res) => {
  try {
    // Static pages
    const staticUrls = [
      {
        url: [
          { loc: 'https://sekawan.vercel.app/' },
          { lastmod: formatDate() },
          { changefreq: 'daily' },
          { priority: '1.0' }
        ]
      },
      {
        url: [
          { loc: 'https://sekawan.vercel.app/profil' },
          { lastmod: formatDate() },
          { changefreq: 'weekly' },
          { priority: '0.8' }
        ]
      },
      {
        url: [
          { loc: 'https://sekawan.vercel.app/berita' },
          { lastmod: formatDate() },
          { changefreq: 'daily' },
          { priority: '0.9' }
        ]
      },
      {
        url: [
          { loc: 'https://sekawan.vercel.app/artikel' },
          { lastmod: formatDate() },
          { changefreq: 'daily' },
          { priority: '0.9' }
        ]
      },
      {
        url: [
          { loc: 'https://sekawan.vercel.app/jadwal' },
          { lastmod: formatDate() },
          { changefreq: 'weekly' },
          { priority: '0.8' }
        ]
      },
      {
        url: [
          { loc: 'https://sekawan.vercel.app/kas' },
          { lastmod: formatDate() },
          { changefreq: 'monthly' },
          { priority: '0.7' }
        ]
      },
      {
        url: [
          { loc: 'https://sekawan.vercel.app/dokumentasi' },
          { lastmod: formatDate() },
          { changefreq: 'weekly' },
          { priority: '0.8' }
        ]
      },
      {
        url: [
          { loc: 'https://sekawan.vercel.app/inventaris' },
          { lastmod: formatDate() },
          { changefreq: 'monthly' },
          { priority: '0.7' }
        ]
      }
    ];

    // Dynamic: Articles (tanpa filter publish, skip slug kosong)
    const articlesSnapshot = await db.collection('articles').get();
    const articles = articlesSnapshot.docs.map(doc => {
      const data = doc.data();
      if (!data.slug) return null;
      return {
        url: [
          { loc: `https://sekawan.vercel.app/articles/${data.slug}` },
          { lastmod: formatDate(data.tanggalPembuatan || data.updatedAt || data.createdAt) },
          { changefreq: 'weekly' },
          { priority: '0.8' }
        ]
      };
    }).filter(Boolean);

    // Dynamic: Berita (tanpa filter publish, skip slug kosong)
    const beritaSnapshot = await db.collection('berita').get();
    const berita = beritaSnapshot.docs.map(doc => {
      const data = doc.data();
      if (!data.slug) return null;
      return {
        url: [
          { loc: `https://sekawan.vercel.app/berita/${data.slug}` },
          { lastmod: formatDate(data.tanggalPembuatan || data.updatedAt || data.createdAt) },
          { changefreq: 'weekly' },
          { priority: '0.8' }
        ]
      };
    }).filter(Boolean);

    // Debug log
    console.log('Sitemap articles:', articles.length, 'berita:', berita.length);

    // Gabungkan semua URL
    const urls = [...staticUrls, ...articles, ...berita];
    const sitemap = xml({ urlset: [{ _attr: { xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' } }, ...urls] }, { declaration: true });
    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    res.status(500).send('Gagal generate sitemap');
  }
});

module.exports = router;
