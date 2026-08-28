"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Users, Bed, Bookmark, CheckCircle2, AlertTriangle, X, Loader2 } from "lucide-react";
import { HomestayWarga } from "@/types/homestay";

export default function KatalogHomestayPage() {
  const [homestayList, setHomestayList] = useState<HomestayWarga[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  
  // State Loading Spesifik untuk Interaksi Tombol Bookmark per ID Homestay
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
    async function fetchHomestay() {
      try {
        const res = await fetch("https://desa-wisata-bojongrangkas.com/wp-json/wp/v2/homestay?_embed", {
          cache: "no-store",
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setHomestayList(data);
        }
      } catch (err) {
        console.error("Gagal mengambil data homestay:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchHomestay();

    // Cek status bookmark lokal
    const userEmail = localStorage.getItem('user_email');
    if (userEmail) {
      const saved = localStorage.getItem(`wishlist_${userEmail}`) || localStorage.getItem('user_wishlist');
      if (saved) {
        try {
          const list = JSON.parse(saved);
          setBookmarkedIds(list.filter((b: any) => b.type === 'homestay').map((b: any) => Number(b.id)));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const handleToggleBookmark = async (item: HomestayWarga, imageUrl: string) => {
    const userEmail = localStorage.getItem('user_email');
    if (!userEmail) {
      showNotification("Silakan login terlebih dahulu untuk menyimpan ke favorit.", "error");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
      return;
    }

    setBookmarkLoadingId(item.id);

    const bookmarkItem = {
      id: item.id,
      title: item.title.rendered,
      slug: `/homestay/${item.slug}`,
      type: 'homestay',
      image: imageUrl
    };

    try {
      const res = await fetch("https://desa-wisata-bojongrangkas.com/wp-json/wc-bridge/v1/toggle-bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, item: bookmarkItem })
      });
      const data = await res.json();

      if (data.success) {
        const isAdded = data.status === 'added';
        if (isAdded) {
          setBookmarkedIds(prev => [...prev, item.id]);
          showNotification(`"${item.title.rendered}" berhasil ditambahkan ke Favorit.`);
        } else {
          setBookmarkedIds(prev => prev.filter(id => id !== item.id));
          showNotification(`"${item.title.rendered}" dihapus dari Favorit.`);
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
        <span className="text-xs text-slate-500 font-medium">Memuat homestay...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30 text-neutral-800 antialiased pt-36 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
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
        
        {/* Header (Centered) */}
        <div className="space-y-3 text-center max-w-xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-serif font-normal tracking-tight text-neutral-900">
            Homestay Desa Bojong Rangkas
          </h1>
          <p className="text-xs text-neutral-500 font-light leading-relaxed">
            Merasakan kehangatan dan keramahan warga lokal dengan menginap langsung di hunian asri pedesaan.
          </p>
        </div>

        {/* Grid List */}
        {homestayList.length === 0 ? (
          <div className="text-center py-24 bg-white/70 backdrop-blur-xl border border-white/85 rounded-[2.5rem] text-xs text-neutral-400 font-light shadow-sm max-w-md mx-auto">
            Belum ada homestay yang tersedia saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {homestayList.map((item: HomestayWarga) => {
              const mediaEmbed = item._embedded?.["wp:featuredmedia"]?.[0];
              const imageUrl = mediaEmbed?.source_url || "/placeholder-home.jpg";
              const isBookmarked = bookmarkedIds.includes(item.id);
              const isThisCardLoading = bookmarkLoadingId === item.id;

              return (
                <div 
                  key={item.id} 
                  className="group bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white/85 overflow-hidden shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-500 flex flex-col h-full relative hover:-translate-y-1"
                >
                  {/* Floating Bookmark Button dengan Indikator Loading */}
                  <div className="absolute top-4 right-4 z-20">
                    <button 
                      onClick={() => !isThisCardLoading && handleToggleBookmark(item, imageUrl)}
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

                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-50 border-b border-neutral-100/40">
                    <Image
                      src={imageUrl}
                      alt={item.title.rendered}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition duration-700 ease-out"
                    />
                  </div>

                  <div className="p-6 flex flex-col flex-grow space-y-5 bg-white/40 backdrop-blur-md">
                    <div className="space-y-2 flex-grow">
                      <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-tight group-hover:text-emerald-600 transition truncate">
                        {item.title.rendered}
                      </h2>
                      <p className="text-[11px] text-neutral-400 font-light">
                        Pemilik: {item.acf?.nama_pemilik || "-"}
                      </p>

                      <div className="flex items-center gap-4 pt-2 text-xs text-neutral-500 font-light">
                        <span className="flex items-center gap-1">
                          <Users size={14} className="text-emerald-600" /> Max {item.acf?.kapasitas_maksimal || 0} Tamu
                        </span>
                        <span className="flex items-center gap-1">
                          <Bed size={14} className="text-emerald-600" /> {item.acf?.jumlah_kamar_tersedia || 0} Kamar Tersedia
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-neutral-100/60 mt-auto">
                      <div>
                        <p className="text-[9px] text-neutral-400 uppercase font-bold tracking-widest">Tarif Sewa</p>
                        <p className="text-xs font-bold text-neutral-900 tracking-tight">
                          {typeof item.acf?.harga_per_malam === "string" && isNaN(Number(item.acf.harga_per_malam))
                            ? item.acf.harga_per_malam 
                            : `Rp. ${Number(item.acf?.harga_per_malam || 0).toLocaleString("id-ID")}`}
                          <span className="text-[10px] text-neutral-400 font-normal"> /malam</span>
                        </p>
                      </div>

                      <Link 
                        href={`/homestay/${item.slug}`}
                        className="inline-flex items-center gap-1.5 bg-neutral-900 group-hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
                      >
                        Detail Sewa <ArrowRight size= {12} />
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