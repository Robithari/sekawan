import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

// Komponen Dinamis untuk Menampilkan Artikel Berdasarkan Slug
export default function ArticlePage() {
  const router = useRouter();
  const { slug } = router.query;
  const [article, setArticle] = useState(null);

  useEffect(() => {
    // Panggil API untuk mendapatkan data artikel berdasarkan slug
    if (slug) {
      fetch(`/api/preview?slug=${slug}`)
        .then((response) => response.json())
        .then((data) => setArticle(data))
        .catch((error) => console.error('Gagal memuat artikel:', error));
    }
  }, [slug]);

  if (!article) {
    return <h1>Memuat...</h1>;
  }

  return (
    <div>
      <h1>{article.title}</h1>
      <p>{article.description}</p>
      <img src={article.image} alt={article.title} />
      <div dangerouslySetInnerHTML={{ __html: article.content }} />
    </div>
  );
}
