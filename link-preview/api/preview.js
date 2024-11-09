const articles = [
    {
      slug: 'artikel-pertama',
      title: 'Artikel Pertama',
      description: 'Ini adalah artikel pertama kami.',
      image: 'https://example.com/image1.jpg',
      content: '<p>Konten dari artikel pertama.</p>',
    },
    {
      slug: 'artikel-kedua',
      title: 'Artikel Kedua',
      description: 'Ini adalah artikel kedua kami.',
      image: 'https://example.com/image2.jpg',
      content: '<p>Konten dari artikel kedua.</p>',
    },
  ];
  
  export default function handler(req, res) {
    const { slug } = req.query;
    const article = articles.find((article) => article.slug === slug);
  
    if (article) {
      res.status(200).json(article);
    } else {
      res.status(404).json({ message: 'Artikel tidak ditemukan' });
    }
  }
  