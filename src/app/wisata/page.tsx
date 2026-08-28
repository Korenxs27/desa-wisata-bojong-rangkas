"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Compass, ArrowRight, CircleCheck, CircleX, Bookmark, CheckCircle2, AlertTriangle, X, Loader2 } from "lucide-react";
import { ObjekWisata } from "@/types/wisata";

export default function KatalogWisataPage() {
  const [wisataList, setWisataList] = useState<ObjekWisata[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  
  // State Loading Spesifik untuk Interaksi Tombol Bookmark per ID
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
    async function fetchWisata() {
      try {
        const res = await fetch("https://desa-wisata-bojongrangkas.com/wp-json/wp/v2/wisata?_embed", {
          cache: "no-store",
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setWisataList(data);
        }
      } catch (err) {
        console.error("Gagal mengambil data objek wisata:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchWisata();

    // Cek status bookmark lokal
    const userEmail = localStorage.getItem('user_email');
    if (userEmail) {
      const saved = localStorage.getItem(`wishlist_${userEmail}`) || localStorage.getItem('user_wishlist');
      if (saved) {
        try {
          const list = JSON.parse(saved);
          setBookmarkedIds(list.filter((b: any) => b.type === 'wisata').map((b: any) => Number(b.id)));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const handleToggleBookmark = async (wisata: ObjekWisata, imageUrl: string) => {
    const userEmail = localStorage.getItem('user_email');
    if (!userEmail) {
      showNotification("Silakan login terlebih dahulu untuk menyimpan ke favorit.", "error");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
      return;
    }

    setBookmarkLoadingId(wisata.id);

    const item = {
      id: wisata.id,
      title: wisata.title.rendered,
      slug: `/wisata/${wisata.slug}`,
      type: 'wisata',
      image: imageUrl
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
          setBookmarkedIds(prev => [...prev, wisata.id]);
          showNotification(`"${wisata.title.rendered}" berhasil ditambahkan ke Favorit.`);
        } else {
          setBookmarkedIds(prev => prev.filter(id => id !== wisata.id));
          showNotification(`"${wisata.title.rendered}" dihapus dari Favorit.`);
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
        <span className="text-xs text-slate-500 font-medium">Memuat objek wisata...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30 text-neutral-800 antialiased py-24 pt-36 px-4 sm:px-6 lg:px-8 selection:bg-emerald-100 relative overflow-hidden">
      
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

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        
        {/* Header (Centered & Luxury Serif) */}
        <div className="space-y-3 text-center max-w-xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-serif font-normal tracking-tight text-neutral-900">
            Objek Wisata Bojong Rangkas
          </h1>
          <p className="text-xs text-neutral-500 font-light leading-relaxed">
            Jelajahi keindahan alam, kekayaan budaya, dan pesona edukasi lokal yang menanti kunjungan Anda.
          </p>
        </div>

        {/* Grid List */}
        {wisataList.length === 0 ? (
          <div className="text-center py-24 bg-white/70 backdrop-blur-xl border border-white/85 rounded-[2.5rem] text-xs text-neutral-400 font-light shadow-sm max-w-md mx-auto">
            Belum ada objek wisata yang terdaftar saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {wisataList.map((wisata: ObjekWisata) => {
              const mediaEmbed = wisata._embedded?.["wp:featuredmedia"]?.[0];
              const imageUrl = mediaEmbed?.source_url || "/placeholder-travel.jpg";

              // 🔍 PEMBACA GANDA ACF (Aman dari error TypeScript)
              const acf = (wisata as any).acf || {};

              const rawPrice = acf.harga ?? acf.harga_tiket ?? 0;
              const cleanPrice = Number(rawPrice);

              const rawStatus = acf.status_buka || acf.status_operasional || "Buka";
              const statusValue = String(rawStatus).trim();
              const isOpen = statusValue.toLowerCase() === "buka";
              const isBookmarked = bookmarkedIds.includes(wisata.id);
              const isThisCardLoading = bookmarkLoadingId === wisata.id;

              return (
                <div 
                  key={wisata.id} 
                  className="group bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white/85 overflow-hidden shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-500 flex flex-col h-full relative hover:-translate-y-1"
                >
                  {/* Floating Bookmark Button dengan Indikator Loading */}
                  <div className="absolute top-4 right-4 z-25">
                    <button 
                      onClick={() => !isThisCardLoading && handleToggleBookmark(wisata, imageUrl)}
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

                  {/* Foto Utama */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-50 border-b border-neutral-100/40">
                    <Image
                      src={imageUrl}
                      alt={wisata.title.rendered}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition duration-700 ease-out"
                    />
                    <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md border border-white/85 px-3.5 py-1.5 rounded-xl text-[10px] font-bold tracking-wider uppercase text-emerald-700 shadow-sm flex items-center gap-1">
                      <Compass size={10} /> {acf.kategori_wisata || "Wisata Alam"}
                    </div>
                  </div>

                  {/* Konten */}
                  <div className="p-6 flex flex-col flex-grow space-y-5 bg-white/40 backdrop-blur-md">
                    <div className="space-y-2 flex-grow">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm ${
                          isOpen ? "bg-emerald-100/80 text-emerald-800 border border-emerald-200/60" : "bg-rose-100/80 text-rose-800 border border-rose-200/60"
                        }`}>
                          {isOpen ? <CircleCheck size={10} /> : <CircleX size={10} />}
                          Status: {statusValue}
                        </span>
                      </div>
                      
                      <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-tight group-hover:text-emerald-600 transition truncate pt-0.5">
                        {wisata.title.rendered}
                      </h2>
                    </div>

                    {/* Harga Tiket & Tombol */}
                    <div className="flex items-center justify-between pt-4 border-t border-neutral-100/60 mt-auto">
                      <div>
                        <p className="text-[9px] text-neutral-400 uppercase font-bold tracking-widest">Tiket Masuk</p>
                        <p className="text-xs font-bold text-neutral-900 tracking-tight">
                          {!isNaN(cleanPrice) && cleanPrice > 0 
                            ? `Rp. ${cleanPrice.toLocaleString("id-ID")} /orang`
                            : "Gratis"}
                        </p>
                      </div>

                      <Link 
                        href={`/wisata/${wisata.slug}`}
                        className="inline-flex items-center gap-1.5 bg-neutral-900 group-hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
                      >
                        Lihat Profil <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}