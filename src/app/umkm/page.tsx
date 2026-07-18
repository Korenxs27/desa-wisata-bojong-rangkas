import { api as wcApi } from "@/lib/woocommerce";
import Link from "next/link";
import Image from "next/image";
import { Tag, Scale, Maximize2, Layers, AlertCircle, CheckCircle } from "lucide-react";

interface WooCommerceImage {
  id: number;
  src: string;
  name: string;
}

interface ProductCategory {
  id: number;
  name: string;
  slug: string;
}

interface ProductDimensions {
  length: string;
  width: string;
  height: string;
}

interface ProdukDesa {
  id: number;
  name: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  description: string;
  short_description: string;
  slug: string;
  images: WooCommerceImage[];
  categories: ProductCategory[];
  weight: string;
  dimensions: ProductDimensions;
  stock_status: "instock" | "outofstock" | "onbackorder";
  manage_stock: boolean;
  stock_quantity: number | null;
}

export default async function ProdukPage() {
  let products: ProdukDesa[] = [];
  let errorMessage = "";

  try {
  const response = await wcApi.get("products", {
    category: "70", 
    per_page: 20
  });
  
  products = response.data || response; 
} catch (error) {
  console.error("Gagal mengambil data dari WooCommerce:", error);
  errorMessage = "Gagal memuat data komplit dari server WooCommerce.";
}

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-800 antialiased pb-20 pt-20 selection:bg-emerald-100">
      
      {/* Hero Banner */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-12 text-center space-y-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600 bg-emerald-50/60 px-4 py-1.5 rounded-full border border-emerald-100">
          Katalog Ekosistem UMKM
        </span>
        <h1 className="text-4xl md:text-5xl font-light font-serif tracking-tight text-neutral-900">
          Produk Bojong Rangkas
        </h1>
        <p className="max-w-md mx-auto text-xs text-neutral-400 font-light leading-relaxed">
          Eksplorasi produk lokal terverifikasi, lengkap dengan detail dimensi fisik, kategori, dan info stok aktual.
        </p>
      </div>

      {errorMessage && (
        <div className="max-w-md mx-auto bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl mb-8 text-xs text-center font-light">
          {errorMessage}
        </div>
      )}

      {/* Grid Katalog Advanced */}
      <div className="max-w-7xl mx-auto px-6">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              const imgUrl = product.images && product.images.length > 0 ? product.images[0].src : null;
              
              // Cek Harga Diskon
              const isSale = product.on_sale || (product.sale_price && product.regular_price);
              const hasPrice = product.price;

              // Deteksi Dimensi Paket Fisik
              const hasDimensions = product.dimensions?.length || product.dimensions?.width || product.dimensions?.height;

              return (
                <div
                  key={product.id}
                  className="group bg-white/70 backdrop-blur-md rounded-3xl border border-white/80 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.025)] transition duration-500 flex flex-col h-full relative"
                >
                  {/* Image & Badges View */}
                  <div className="relative h-64 w-full overflow-hidden bg-neutral-50 border-b border-neutral-100/40">
                    {imgUrl ? (
                      <Image
                        src={imgUrl}
                        alt={product.images[0].name || product.name}
                        fill
                        sizes="(max-w-7xl) 33vw"
                        className="object-cover group-hover:scale-105 transition duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs font-light italic">
                        Tidak ada gambar produk
                      </div>
                    )}
                    
                    {/* Floating Stock Status Badge */}
                    <div className="absolute top-4 left-4 z-10">
                      {product.stock_status === "instock" ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/80 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-[10px] font-medium shadow-sm">
                          <CheckCircle size={10}/> Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-neutral-500/80 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-[10px] font-medium shadow-sm">
                          <AlertCircle size={10}/> Habis
                        </span>
                      )}
                    </div>

                    {/* Floating Price Tag (Mendukung Coretan Diskon) */}
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md border border-white/60 p-2 px-3.5 rounded-2xl shadow-sm text-right">
                      {isSale && (
                        <span className="text-[10px] text-neutral-400 line-through block font-light leading-none mb-0.5">
                          Rp {parseInt(product.regular_price).toLocaleString("id-ID")}
                        </span>
                      )}
                      <span className="text-xs font-bold text-neutral-900 tracking-tight block">
                        {hasPrice ? `Rp ${parseInt(product.price).toLocaleString("id-ID")}` : "Hubungi Penjual"}
                      </span>
                    </div>
                  </div>

                  {/* Card Main Body */}
                  <div className="p-6 flex flex-col flex-grow space-y-4">
                    <div className="space-y-1">
                      {/* Dynamic Kategori dari WooCommerce */}
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                        <Layers size={10} /> 
                        {product.categories && product.categories.length > 0 
                          ? product.categories[0].name 
                          : "Uncategorized"}
                      </div>
                      
                      <Link href={`/umkm/${product.slug}`}>
                        <h3 className="text-base font-medium text-neutral-900 tracking-tight group-hover:text-emerald-600 transition truncate pt-0.5">
                          {product.name}
                        </h3>
                      </Link>
                    </div>

                    {/* Short Description */}
                    <div 
                      className="text-xs text-neutral-400 font-light line-clamp-2 leading-relaxed" 
                      dangerouslySetInnerHTML={{ __html: product.short_description || "Tidak ada deskripsi singkat." }} 
                    />

                    {/* FITUR BARU: Info Dimensi Logistik & Berat Asli WooCommerce */}
                    {(product.weight || hasDimensions) && (
                      <div className="bg-neutral-50/60 border border-neutral-100/70 p-3 rounded-2xl grid grid-cols-2 gap-2 text-[11px] font-light text-neutral-500">
                        {product.weight && (
                          <div className="flex items-center gap-1.5 truncate">
                            <Scale size={12} className="text-neutral-400 shrink-0" />
                            <span>{product.weight} kg</span>
                          </div>
                        )}
                        {hasDimensions && (
                          <div className="flex items-center gap-1.5 truncate">
                            <Maximize2 size={12} className="text-neutral-400 shrink-0" />
                            <span>
                              {product.dimensions.length || 0}x{product.dimensions.width || 0}x{product.dimensions.height || 0} cm
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Button di Katalog */}
<div className="border-t border-neutral-100/60 pt-4 mt-auto">
  <Link 
    href={`/umkm/${product.slug}`} 
    className="w-full bg-neutral-900 group-hover:bg-emerald-600 text-white py-3 rounded-xl text-xs font-semibold tracking-wider uppercase transition flex items-center justify-center gap-2 shadow-sm"
  >
    Lihat Detail <Tag size={12} />
  </Link>
</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-20 bg-white/40 backdrop-blur-md rounded-3xl border border-white/60">
            <p className="text-xs text-neutral-400 italic">Belum ada komoditas UMKM yang terdaftar saat ini.</p>
          </div>
        )}
      </div>

    </div>
  );
}