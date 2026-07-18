export interface HomestayWarga {
  id: number;
  slug: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  acf: {
    nama_pemilik: string;
    harga_per_malam: string | number;
    kapasitas_maksimal: number;
    jumlah_kamar_tersedia: number;
    fasilitas_homestay: string[];
    produk_woocommerce_terkait: number;
    gallery_homestay?: string[];
  };
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
    }>;
  };
}