import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const endpoint = searchParams.get("endpoint"); // 'wisata', 'homestay', atau 'paket_wisata'
    const wcProductId = searchParams.get("wcProductId");

    if (!id || !endpoint) {
      return NextResponse.json({ success: false, message: "ID dan Endpoint wajib diisi" }, { status: 400 });
    }

    const WP_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://desa-wisata-bojongrangkas.com/wp-json";
    const CONSUMER_KEY = process.env.WC_CONSUMER_KEY || "ck_a291eafaf1c0e3dc9b1ce17f08deb2649f995acb";
    const CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET || "cs_9c61e3491e0ed34fc00122ac655e729fd6c9d676";

    // Standard Basic Auth Server-to-Server
    const authHeader = "Basic " + Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");

    // 1. HAPUS CPT POST DI WORDPRESS DARI SERVER
    const wpRes = await fetch(`${WP_URL}/wp/v2/${endpoint}/${id}?force=true`, {
      method: "DELETE",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    const wpData = await wpRes.json();

    if (!wpRes.ok) {
      return NextResponse.json({ 
        success: false, 
        message: wpData.message || "Gagal menghapus" 
      }, { status: wpRes.status });
    }

    // 2. HAPUS WOOCOMMERCE PRODUCT TERKAIT (JIKA ADA)
    if (wcProductId && Number(wcProductId) > 0) {
      await fetch(
        `${WP_URL}/wc/v3/products/${wcProductId}?force=true&consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`,
        { method: "DELETE" }
      );
    }

    return NextResponse.json({ success: true, message: "Berhasil dihapus secara permanen" });

  } catch (error) {
    console.error("Delete Server Error:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server internal" }, { status: 500 });
  }
}