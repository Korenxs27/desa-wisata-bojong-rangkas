const WP_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://desa-wisata-bojongrangkas.biznityhub.com/wp-json';

// ========================================================
// 1. INTERFACES (Tipe Data ACF & CPT)
// ========================================================
export interface ACFFields {
  harga?: string;
  durasi?: string;
  lokasi?: string;
  id_produk_woocommerce?: string | number;
}

export interface WisataCPT {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  acf?: ACFFields;
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
    }>;
  };
}

// ========================================================
// 2. FETCH FUNCTIONS (NO-STORE CACHE / ALWAYS FRESH)
// ========================================================

// A. Get Objek Wisata
export async function getWisataList(): Promise<WisataCPT[]> {
  try {
    const res = await fetch(`${WP_URL}/wp/v2/wisata?_embed`, { 
      cache: 'no-store' // 🚀 Kunci biar hapus/edit langsung berasa di user page!
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching wisata CPT:", error);
    return [];
  }
}

// B. Get Homestay Warga
export async function getHomestayList() {
  try {
    const res = await fetch(`${WP_URL}/wp/v2/homestay?_embed`, { 
      cache: 'no-store' 
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching homestay CPT:", error);
    return [];
  }
}

// C. Get Paket Wisata
export async function getPaketList() {
  try {
    const res = await fetch(`${WP_URL}/wp/v2/paket_wisata?_embed`, { 
      cache: 'no-store' 
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching paket CPT:", error);
    return [];
  }
}

// ========================================================
// 3. MUTATION HELPER (Create Wisata CPT)
// ========================================================
export async function createWisataCPT(
  title: string, 
  content: string, 
  acfData: ACFFields
) {
  const CONSUMER_KEY = process.env.WC_CONSUMER_KEY || 'ck_3512f4b660cb493791156b8e2a57ed734fe92fe4';
  const CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET || 'cs_6e530c56ba5fdd875c311c8b24b2429fe5885db3';
  const authHeader = 'Basic ' + Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');

  try {
    const res = await fetch(`${WP_URL}/wp/v2/wisata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        title: title,
        content: content,
        status: 'publish',
        fields: acfData,
      }),
    });

    return { success: res.ok, data: await res.json() };
  } catch (error) {
    return { success: false, message: 'Gagal menambah data wisata CPT' };
  }
}