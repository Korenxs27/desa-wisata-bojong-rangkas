import { api as wcApi } from "@/lib/woocommerce";
import { notFound } from "next/navigation";
import Image from "next/image";
import Script from "next/script";
import BackButton from "@/components/BackButton"; // 🚀 Impor BackButton Pintar
import { ShieldCheck, Layers, Scale, Maximize2, CheckCircle, AlertCircle } from "lucide-react";

import ClientOrderForm from "../ClientOrderForm";

interface WooCommerceImage {
  id: number;
  src: string;
  name: string;
}

interface ProductCategory {
  id: number;
  name: string;
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
  description: string;
  short_description: string;
  slug: string;
  images: WooCommerceImage[];
  categories: ProductCategory[];
  weight: string;
  dimensions: ProductDimensions;
  stock_status: "instock" | "outofstock" | "onbackorder";
}

export default async function UMKMDetailPage({ params }: { params: Promise<{ slug: string }> | any }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  
  let product: ProdukDesa | null = null;

  try {
    const response = await wcApi.get("products", { slug: slug });
    const products = response.data || response;
    
    if (products && products.length > 0) {
      product = products[0];
    }
  } catch (error) {
    console.error("Gagal memuat detail produk WooCommerce:", error);
  }

  if (!product) return notFound();

  const isSale = product.sale_price && product.regular_price;
  const hasDimensions = product.dimensions?.length || product.dimensions?.width || product.dimensions?.height;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-800 antialiased pb-20 selection:bg-emerald-100 pt-28">
      
      <Script 
        src="https://app.midtrans.com/snap/snap.js" 
        data-client-key="Mid-client-q343rAbCQUljWRLn" 
        strategy="lazyOnload"
      />

      <div className="max-w-7xl mx-auto px-6 pt-6 grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        <div className="lg:col-span-2 space-y-6">
          
          {/* TOMBOL KEMBALI PINTAR NATIVE */}
          <div className="flex justify-start">
            <BackButton text="Kembali" />
          </div>

          <div className="space-y-4">
            <div className="overflow-hidden rounded-[32px] border border-white bg-white shadow-sm relative h-[450px]">
              {product.images && product.images.length > 0 ? (
                <Image 
                  src={product.images[0].src} 
                  alt={product.name}
                  fill
                  priority
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs italic">Tidak ada gambar</div>
              )}
            </div>

            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.slice(1).map((img) => (
                  <div key={img.id} className="relative h-24 overflow-hidden rounded-2xl bg-white border border-neutral-100 shadow-sm">
                    <Image src={img.src} alt={img.name || product.name} fill className="object-cover hover:scale-105 transition duration-300" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600 bg-emerald-50/60 px-3 py-1 rounded-full border border-emerald-100/50">
              <Layers size={10}/> {product.categories && product.categories.length > 0 ? product.categories[0].name : "Produk Desa"}
            </span>
            <h1 className="text-4xl font-light font-serif tracking-tight text-neutral-900 pt-1">{product.name}</h1>
          </div>

          <div className="bg-white/60 backdrop-blur-md p-8 rounded-[28px] border border-neutral-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.005)]">
            <h2 className="text-lg font-medium tracking-tight text-neutral-900 mb-4">Informasi Produk</h2>
            <div 
              className="text-neutral-500 text-sm leading-relaxed font-light prose max-w-none" 
              dangerouslySetInnerHTML={{ __html: product.description || product.short_description || "Tidak ada deskripsi rinci." }} 
            />
          </div>
        </div>

        <div className="lg:col-span-1 lg:sticky lg:top-28">
          <div className="bg-white/70 backdrop-blur-xl border border-neutral-200/60 p-8 rounded-[32px] shadow-xl shadow-neutral-100/30 space-y-6">
            
            <div className="border-b border-neutral-100 pb-4 flex justify-between items-end">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold block mb-1">Harga Resmi</span>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-light tracking-tight text-neutral-900">
                    Rp {product.price ? parseInt(product.price).toLocaleString("id-ID") : "0"}
                  </h3>
                  {isSale && (
                    <span className="text-xs text-neutral-400 line-through font-light">
                      Rp {parseInt(product.regular_price).toLocaleString("id-ID")}
                    </span>
                  )}
                </div>
              </div>

              <div>
                {product.stock_status === "instock" ? (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-xl text-[10px] font-bold">
                    <CheckCircle size={10}/> READY STOK
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-500 border border-neutral-200 px-3 py-1 rounded-xl text-[10px] font-bold">
                    <AlertCircle size={10}/> HABIS
                  </span>
                )}
              </div>
            </div>

            {(product.weight || hasDimensions) && (
              <div className="space-y-3 bg-neutral-50/60 p-4 rounded-2xl border border-neutral-100/80 text-xs font-light text-neutral-500">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Spesifikasi Logistik</span>
                {product.weight && (
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5"><Scale size={13} className="text-neutral-400"/> Berat Barang</span>
                    <span className="font-medium text-neutral-800">{product.weight} kg</span>
                  </div>
                )}
                {hasDimensions && (
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5"><Maximize2 size={13} className="text-neutral-400"/> Ukuran Paket</span>
                    <span className="font-medium text-neutral-800">
                      {product.dimensions.length || 0}x{product.dimensions.width || 0}x{product.dimensions.height || 0} cm
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* PROP productName DIKIRIM SECARA DINAMIS DISINI */}
            <ClientOrderForm 
              productId={product.id} 
              productName={product.name} 
              productPrice={parseInt(product.price || "0")} 
              stockStatus={product.stock_status}
            />

            <div className="flex items-center justify-center gap-1 text-[10px] text-neutral-400 text-center border-t border-neutral-100 pt-4 font-light">
              <ShieldCheck size={12} className="text-emerald-500 shrink-0"/> Gateway Otomatis WooCommerce & Midtrans Live
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}