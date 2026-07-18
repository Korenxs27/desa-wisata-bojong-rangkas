export interface PaketWisata {
  id: number;
  slug: string;
  title: {
    rendered: string;
  };
  // TAMBAHKAN INI AGAR TIDAK MERAH
  content?: {
    rendered: string;
    protected: boolean;
  };
  acf: {
    durasi_paket: string;
    harga_minimal: number;
    minimal_peserta: number;
    produk_woocommerce_terkait: number;
  };
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      id: number;
      source_url: string;
      alt_text?: string;
    }>;
    "acf:post"?: Array<{
      id: number;
      excerpt?: {
        rendered: string;
      };
      featured_media?: number;
    }>;
  };
}
export interface ObjekWisata {
  id: number;
  slug: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  acf: {
    kategori_wisata: 'Alam' | 'Budaya' | 'Edukasi' | 'Kuliner';
    harga_tiket: number;          // SINKRON SAMA WP
    lokasi_maps: string;          // SINKRON SAMA WP
    status_operasional: 'Buka' | 'Tutup' | 'Renovasi';
    jam_operasional?: string;
  };
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
    }>;
  };
}
