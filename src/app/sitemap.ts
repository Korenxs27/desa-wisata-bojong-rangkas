import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://desawisatabojongrangkas.com';

  // 1. Halaman Statis Utama
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/wisata',
    '/paket',
    '/homestay',
    '/umkm',
    '/gallery',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // 2. Fetch Data Dinamis dari Backend WordPress
  let wisataRoutes: MetadataRoute.Sitemap = [];
  let paketRoutes: MetadataRoute.Sitemap = [];
  let homestayRoutes: MetadataRoute.Sitemap = [];

  try {
    // Fetch Objek Wisata
    const resWisata = await fetch('https://desa-wisata-bojongrangkas.com/wp-json/wp/v2/wisata?per_page=100', { cache: 'no-store' });
    const wisatas = await resWisata.json();
    if (Array.isArray(wisatas)) {
      wisataRoutes = wisatas.map((item: any) => ({
        url: `${baseUrl}/wisata/${item.slug}`,
        lastModified: new Date(item.modified || Date.now()),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }));
    }

    // Fetch Paket Wisata
    const resPaket = await fetch('https://desa-wisata-bojongrangkas.com/wp-json/wp/v2/paket_wisata?per_page=100', { cache: 'no-store' });
    const pakets = await resPaket.json();
    if (Array.isArray(pakets)) {
      paketRoutes = pakets.map((item: any) => ({
        url: `${baseUrl}/paket/${item.slug}`,
        lastModified: new Date(item.modified || Date.now()),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }));
    }

    // Fetch Homestay
    const resHomestay = await fetch('https://desa-wisata-bojongrangkas.com/wp-json/wp/v2/homestay?per_page=100', { cache: 'no-store' });
    const homestays = await resHomestay.json();
    if (Array.isArray(homestays)) {
      homestayRoutes = homestays.map((item: any) => ({
        url: `${baseUrl}/homestay/${item.slug}`,
        lastModified: new Date(item.modified || Date.now()),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }));
    }
  } catch (e) {
    console.error('Error fetching data for sitemap:', e);
  }

  return [...staticRoutes, ...wisataRoutes, ...paketRoutes, ...homestayRoutes];
}