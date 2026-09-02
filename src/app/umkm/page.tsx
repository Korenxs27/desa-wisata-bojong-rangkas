"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Tag, Scale, Maximize2, Layers, AlertCircle, CheckCircle, Bookmark, Loader2, CheckCircle2, AlertTriangle, X } from "lucide-react";

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

export default function ProdukPage() {
  const [products, setProducts] = useState<ProdukDesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);

  // State Loading Spesifik untuk Interaksi Tombol Bookmark per ID Produk
  const [bookmarkLoadingId, setBookmarkLoadingId] = useState<number | null>(null);

  // State Notifikasi Toast Modern
  const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3500);
  };

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("https://desa-wisata-bojongrangkas.com/wp-json/wc/store/v1/products?per_page=50", { cache: "no-store" });
        const rawProducts = await res.json();

        let finalProducts: ProdukDesa[] = [];

        if (Array.isArray(rawProducts)) {
          // Filter ketat buang [wisata], [booking], tiket, homestay
          const filtered = rawProducts.filter((product: any) => {
            const name = (product.name || product.title?.rendered || "").toLowerCase();
            const isWisata = name.includes("[wisata]") || name.includes("wisata");
            const isBooking = name.includes("[booking]") || name.includes("booking");
            const isTiket = name.includes("tiket") || name.includes("ticket");
            const isHomestay = name.includes("homestay") || name.includes("[homestay]") || name.includes("penginapan");

            return !isWisata && !isBooking && !isTiket && !isHomestay;
          });

          finalProducts = filtered.map((product: any) => {
            const shortDesc = product.short_description || product.description || "";
            const cleanText = shortDesc.replace(/<[^>]+>/g, "");
            const words = cleanText.split(/\s+/);
            const truncated = words.length > 12 ? words.slice(0, 12).join(" ") + "..." : cleanText;

            return {
              id: product.id,
              name: product.name || product.title?.rendered,
              price: product.prices?.price || product.price || "0",
              regular_price: product.prices?.regular_price || product.regular_price || "0",
              sale_price: product.prices?.sale_price || product.sale_price || "0",
              on_sale: product.on_sale || false,
              description: product.description || "",
              short_description: truncated,
              slug: product.slug,
              images: product.images || [],
              categories: product.categories || [],
              weight: product.weight || "",
              dimensions: product.dimensions || { length: "", width: "", height: "" },
              stock_status: product.is_in_stock ? "instock" : "outofstock",
              manage_stock: false,
              stock_quantity: null
            };
          });
        }

        setProducts(finalProducts);
      } catch (err) {
        console.error("Gagal mengambil data produk:", err);
        setErrorMessage("Gagal memuat data");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();

    // Cek status bookmark lokal
    const userEmail = localStorage.getItem('user_email');
    if (userEmail) {
      const saved = localStorage.getItem(`wishlist_${userEmail}`) || localStorage.getItem('user_wishlist');
      if (saved) {
        try {
          const list = JSON.parse(saved);
          setBookmarkedIds(list.filter((b: any) => b.type === 'umkm').map((b: any) => Number(b.id)));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const handleToggleBookmark = async (product: ProdukDesa, imgUrl: string | null) => {
    const userEmail = localStorage.getItem('user_email');
    if (!userEmail) {
      showNotification("Silakan login terlebih dahulu untuk menyimpan ke favorit.", "error");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
      return;
    }

    setBookmarkLoadingId(product.id);

    const item = {
      id: product.id,
      title: product.name,
      slug: `/umkm/${product.slug}`,
      type: 'umkm',
      image: imgUrl || "/placeholder-wisata.jpg"
    };

    try {
      const res = await fetch("https://desa-wisata-bojongrangkas.com/wp-json/wc-bridge/v1/toggle-bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, item })
      });
      const data = await res.json();

      if (data.success) {
        const isAdded = data.status === 'added';
        if (isAdded) {
          setBookmarkedIds(prev => [...prev, product.id]);
          showNotification(`"${product.name}" berhasil ditambahkan ke Favorit.`);
        } else {
          setBookmarkedIds(prev => prev.filter(id => id !== product.id));
          showNotification(`"${product.name}" dihapus dari Favorit.`);
        }
        localStorage.setItem(`wishlist_${userEmail}`, JSON.stringify(data.bookmarks));
        localStorage.setItem('user_wishlist', JSON.stringify(data.bookmarks));
      }
    } catch (err) {
      console.error("Gagal mengubah bookmark:", err);
      showNotification("Terjadi kesalahan jaringan.", "error");
    } finally {
      setBookmarkLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600 mr-2" size={24} />
        <span className="text-xs text-slate-500 font-medium">Memuat produk UMKM...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30 text-neutral-800 antialiased pb-24 pt-36 px-4 sm:px-6 lg:px-8 selection:bg-emerald-100 relative overflow-hidden">
      
      {/* Background Soft Glassy Glow Effects */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-teal-300/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* SISTEM NOTIFIKASI TOAST MODERN & BERANIMASI */}
      <div className={`fixed bottom-8 right-8 z-[999999] transition-all duration-500 transform ${
        toast.show ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95 pointer-events-none'
      }`}>
        <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border ${
          toast.type === 'success' 
            ? 'bg-slate-900/90 border-emerald-500/30 text-white' 
            : 'bg-slate-900/90 border-rose-500/30 text-white'
        }`}>
          {toast.type === 'success' ? (
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} />
            </div>
          )}
          <div className="text-xs font-medium tracking-tight">
            {toast.message}
          </div>
          <button 
            onClick={() => setToast(prev => ({ ...prev, show: false }))}
            className="ml-2 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* Hero Banner */}
        <div className="space-y-3 text-center max-w-xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-serif font-normal tracking-tight text-neutral-900">
            Produk Bojong Rangkas
          </h1>
          <p className="text-xs text-neutral-500 font-light leading-relaxed">
            Eksplorasi produk lokal terverifikasi, lengkap dengan detail dimensi fisik, kategori, dan info stok aktual.
          </p>
        </div>

        {errorMessage && (
          <div className="max-w-md mx-auto bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl text-xs text-center font-light shadow-sm">
            {errorMessage}
          </div>
        )}

        {/* Grid Katalog Advanced */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              const imgUrl = product.images && product.images.length > 0 ? product.images[0].src : null;
              const isSale = product.on_sale || (product.sale_price && product.regular_price);
              const hasPrice = product.price;
              const hasDimensions = product.dimensions?.length || product.dimensions?.width || product.dimensions?.height;
              const isBookmarked = bookmarkedIds.includes(product.id);
              const isThisCardLoading = bookmarkLoadingId === product.id;

              return (
                <div
                  key={product.id}
                  className="group bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white/85 overflow-hidden shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-500 flex flex-col h-full relative"
                >
                  {/* Floating Bookmark Button dengan Indikator Loading */}
                  <div className="absolute top-4 right-4 z-20">
                    <button 
                      onClick={() => !isThisCardLoading && handleToggleBookmark(product, imgUrl)}
                      disabled={isThisCardLoading}
                      className={`p-2.5 rounded-full backdrop-blur-md transition shadow-md cursor-pointer transform active:scale-90 duration-200 flex items-center justify-center ${
                        isBookmarked ? 'bg-rose-500 text-white' : 'bg-white/80 hover:bg-white text-slate-700'
                      }`}
                      title={isBookmarked ? "Hapus dari Favorit" : "Simpan ke Favorit"}
                    >
                      {isThisCardLoading ? (
                        <Loader2 size={14} className="animate-spin text-current" />
                      ) : (
                        <Bookmark size={14} fill={isBookmarked ? "white" : "none"} />
                      )}
                    </button>
                  </div>

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
                        <span className="inline-flex items-center gap-1 bg-emerald-600/90 backdrop-blur-md text-white px-3 py-1 rounded-xl text-[10px] font-bold shadow-sm">
                          <CheckCircle size={10}/> Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-neutral-600/90 backdrop-blur-md text-white px-3 py-1 rounded-xl text-[10px] font-bold shadow-sm">
                          <AlertCircle size={10}/> Habis
                        </span>
                      )}
                    </div>

                    {/* Floating Price Tag */}
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md border border-white/80 p-2.5 px-4 rounded-2xl shadow-sm text-right z-10">
                      {isSale && (
                        <span className="text-[10px] text-neutral-400 line-through block font-light leading-none mb-0.5">
                          Rp. {parseInt(product.regular_price).toLocaleString("id-ID")}
                        </span>
                      )}
                      <span className="text-xs font-bold text-neutral-900 tracking-tight block">
                        {hasPrice ? `Rp. ${parseInt(product.price).toLocaleString("id-ID")}` : "Hubungi Penjual"}
                      </span>
                    </div>
                  </div>

                  {/* Card Main Body */}
                  <div className="p-6 flex flex-col flex-grow space-y-4 bg-white/40 backdrop-blur-md">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                        <Layers size={10} /> 
                        {product.categories && product.categories.length > 0 
                          ? product.categories[0].name 
                          : "Uncategorized"}
                      </div>
                      
                      <Link href={`/umkm/${product.slug}`}>
                        <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-tight group-hover:text-emerald-600 transition truncate pt-0.5">
                          {product.name}
                        </h3>
                      </Link>
                    </div>

                    <div 
                      className="text-xs text-neutral-500 font-light line-clamp-2 leading-relaxed" 
                      dangerouslySetInnerHTML={{ __html: product.short_description || "Tidak ada deskripsi singkat." }} 
                    />

                    {(product.weight || hasDimensions) && (
                      <div className="bg-white/60 backdrop-blur-md border border-neutral-200/60 p-3 rounded-2xl grid grid-cols-2 gap-2 text-[11px] font-light text-neutral-500">
                        {product.weight && (
                          <div className="flex items-center gap-1.5 truncate">
                            <Scale size={12} className="text-emerald-600 shrink-0" />
                            <span>{product.weight} kg</span>
                          </div>
                        )}
                        {hasDimensions && (
                          <div className="flex items-center gap-1.5 truncate">
                            <Maximize2 size={12} className="text-emerald-600 shrink-0" />
                            <span>
                              {product.dimensions.length || 0}x{product.dimensions.width || 0}x{product.dimensions.height || 0} cm
                            </span>
                          </div>
                        )}
                      </div>
                    )}

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
          <div className="text-center py-24 bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white/85 shadow-sm max-w-md mx-auto">
            <p className="text-xs text-neutral-400 italic">Belum ada komoditas UMKM yang terdaftar saat ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}