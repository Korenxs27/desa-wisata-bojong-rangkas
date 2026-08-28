"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, Image as ImageIcon, Play, Film, X, ZoomIn, ZoomOut, SlidersHorizontal, Check, RotateCcw } from "lucide-react";

export default function UserGalleryPage() {
  const [gallery, setGallery] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Filter Sementara (yang sedang dipilih di dalam modal)
  const [tempType, setTempType] = useState<"Semua" | "foto" | "video">("Semua");
  const [tempCategory, setTempCategory] = useState("Semua");

  // State Filter Aktif (yang benar-benar diterapkan pada galeri)
  const [appliedType, setAppliedType] = useState<"Semua" | "foto" | "video">("Semua");
  const [appliedCategory, setAppliedCategory] = useState("Semua");

  const [categories, setCategories] = useState<string[]>([]);
  
  // State untuk Kontrol Modal Filter & Modal Zoom Media
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const apiEndpoint = "https://desa-wisata-bojongrangkas.com/wp-json/wc-bridge/v1/gallery-items";

  // Efek untuk menyembunyikan Navbar global saat modal aktif
  useEffect(() => {
    const navbars = document.querySelectorAll('nav, header, [role="navigation"]');
    
    if (selectedMedia || isFilterOpen) {
      document.body.style.overflow = "hidden";
      navbars.forEach((nav) => {
        (nav as HTMLElement).style.setProperty('display', 'none', 'important');
      });
    } else {
      document.body.style.overflow = "auto";
      navbars.forEach((nav) => {
        (nav as HTMLElement).style.removeProperty('display');
      });
      setIsZoomed(false);
    }

    return () => {
      document.body.style.overflow = "auto";
      navbars.forEach((nav) => {
        (nav as HTMLElement).style.removeProperty('display');
      });
    };
  }, [selectedMedia, isFilterOpen]);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch(apiEndpoint, { cache: "no-store" });
        const data = await res.json();
        if (data.success && Array.isArray(data.gallery)) {
          setGallery(data.gallery);
          
          const uniqueCategories = ["Semua", ...Array.from(new Set(data.gallery.map((item: any) => item.category)))];
          setCategories(uniqueCategories as string[]);
        }
      } catch (err) {
        console.error("Gagal memuat galeri:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  const isItemVideo = (item: any) => {
    return item.type === "video" || 
           (item.media_type && item.media_type.includes("video")) || 
           (item.image && item.image.match(/\.(mp4|webm|ogg|mov)$/i));
  };

  // Filter galeri berdasarkan filter yang sudah DITERAPKAN (applied)
  const filteredGallery = gallery.filter((item) => {
    const isVideo = isItemVideo(item);
    
    if (appliedType === "foto" && isVideo) return false;
    if (appliedType === "video" && !isVideo) return false;
    if (appliedCategory !== "Semua" && item.category !== appliedCategory) return false;

    return true;
  });

  // Tombol Terapkan Filter
  const handleApplyFilter = () => {
    setAppliedType(tempType);
    setAppliedCategory(tempCategory);
    setIsFilterOpen(false);
  };

  // Tombol Reset Filter ke Semula
  const handleResetFilter = () => {
    setTempType("Semua");
    setTempCategory("Semua");
    setAppliedType("Semua");
    setAppliedCategory("Semua");
    setIsFilterOpen(false);
  };

  const isSelectedVideo = selectedMedia && isItemVideo(selectedMedia);
  const isFiltered = appliedType !== "Semua" || appliedCategory !== "Semua";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600 mr-2" size={24} />
        <span className="text-xs text-slate-500 font-medium">Memuat galeri desa...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30 pt-36 pb-24 px-4 sm:px-6 font-sans text-slate-800 relative overflow-hidden">
      
      {/* Background Soft Glow Effects */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-teal-300/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        
        {/* Header Title & Tombol Buka Filter */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/85 shadow-sm">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl font-serif font-normal text-slate-900 tracking-tight">
              Galeri & Momen Kegiatan
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-light max-w-xl">
              Jelajahi berbagai potret keindahan alam, aktivitas warga, homestay, serta ragam UMKM di Desa Wisata Bojong Rangkas.
            </p>
          </div>

          {/* Tombol Utama Buka Modal Filter */}
          <button
            onClick={() => {
              setTempType(appliedType);
              setTempCategory(appliedCategory);
              setIsFilterOpen(true);
            }}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-xs font-bold transition-all duration-300 cursor-pointer shadow-lg ${
              isFiltered 
                ? "bg-emerald-600 text-white shadow-emerald-600/20" 
                : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10"
            }`}
          >
            <SlidersHorizontal size={16} />
            {isFiltered ? "Filter Aktif (Diterapkan)" : "Filter Media & Kategori"}
          </button>
        </div>

        {/* Gallery Content Grid */}
        {filteredGallery.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredGallery.map((item) => {
              const isVideo = isItemVideo(item);
              return (
                <div 
                  key={item.id} 
                  onClick={() => {
                    setSelectedMedia(item);
                    setIsZoomed(false);
                  }}
                  className="bg-white/70 backdrop-blur-xl border border-white/85 rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-500 flex flex-col justify-between group cursor-pointer"
                >
                  <div className="relative aspect-[4/3] w-full bg-slate-900 overflow-hidden">
                    {isVideo ? (
                      <>
                        <video src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-80" muted />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 bg-emerald-600/90 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition duration-300">
                            <Play size={18} fill="white" className="ml-0.5" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <Image 
                        src={item.image} 
                        alt={item.title} 
                        fill 
                        sizes="(max-width: 768px) 100vw, 25vw"
                        className="object-cover group-hover:scale-110 transition duration-700" 
                      />
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                      {isVideo ? <Film size={10} /> : <ImageIcon size={10} />} {item.category}
                    </span>
                  </div>

                  <div className="p-5 space-y-1.5 bg-white/40 backdrop-blur-md">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide truncate">
                      {item.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">
                      🕒 {item.date}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white/85 shadow-sm max-w-md mx-auto space-y-4">
            <ImageIcon className="mx-auto text-slate-300" size={40} />
            <p className="text-xs text-slate-500 font-medium">Tidak ada media yang cocok dengan filter yang dipilih.</p>
            <button 
              onClick={handleResetFilter}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        )}

      </div>

      {/* MODAL POPUP FILTER (Pilihan Tipe & Kategori dengan tombol Terapkan & Reset) */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative border border-slate-100">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-emerald-600" /> Filter Galeri & Kegiatan
              </h3>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
              
              {/* 1. Filter Tipe Media */}
              <div className="space-y-2.5">
                <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Tipe Media</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Semua", value: "Semua" },
                    { label: "📸 Foto", value: "foto" },
                    { label: "🎥 Video", value: "video" }
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setTempType(type.value as any)}
                      className={`py-3 px-3 rounded-2xl text-xs font-bold transition-all cursor-pointer border text-center ${
                        tempType === type.value
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Filter Kategori Kegiatan */}
              <div className="space-y-2.5">
                <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Kategori Kegiatan</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setTempCategory(cat)}
                      className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        tempCategory === cat
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Tombol Aksi (Terapkan & Reset) */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={handleResetFilter}
                className="flex-1 py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw size={14} /> Reset
              </button>
              <button
                onClick={handleApplyFilter}
                className="flex-2 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check size={16} /> Terapkan Filter
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL POPUP MEDIA FULLSCREEN (Zoom & Close) */}
      {selectedMedia && (
        <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-between bg-black/95 backdrop-blur-2xl p-4 md:p-6 animate-in fade-in duration-200">
          
          <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
            {!isSelectedVideo && (
              <button 
                onClick={() => setIsZoomed(!isZoomed)}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition cursor-pointer shadow-lg flex items-center justify-center border border-white/10"
                title={isZoomed ? "Perkecil" : "Perbesar (Zoom)"}
              >
                {isZoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
              </button>
            )}
            <button 
              onClick={() => setSelectedMedia(null)}
              className="p-3 rounded-full bg-rose-600/80 hover:bg-rose-600 text-white backdrop-blur-md transition cursor-pointer shadow-lg flex items-center justify-center"
              title="Tutup"
            >
              <X size={20} />
            </button>
          </div>

          <div className="w-full max-w-5xl h-[70vh] my-auto flex items-center justify-center overflow-auto">
            <div 
              className={`relative transition-transform duration-300 ${isZoomed ? 'scale-150 cursor-zoom-out py-20' : 'scale-100 cursor-zoom-in'} w-full h-full flex items-center justify-center`}
              onClick={() => !isSelectedVideo && setIsZoomed(!isZoomed)}
            >
              {isSelectedVideo ? (
                <video 
                  src={selectedMedia.image || selectedMedia.video_url} 
                  controls 
                  autoPlay 
                  className="max-h-[70vh] max-w-full object-contain rounded-2xl shadow-2xl"
                />
              ) : (
                <img 
                  src={selectedMedia.image} 
                  alt={selectedMedia.title} 
                  className="max-h-[70vh] max-w-full object-contain rounded-2xl shadow-2xl transition-all duration-300"
                />
              )}
            </div>
          </div>

          <div className="w-full max-w-3xl bg-white/10 backdrop-blur-md border border-white/15 px-6 py-4 rounded-2xl text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <span className="text-[10px] font-bold bg-emerald-500 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {selectedMedia.category || (isSelectedVideo ? "Video Kegiatan" : "Dokumentasi Foto")}
              </span>
              <h3 className="text-sm md:text-base font-serif font-bold text-white mt-1">{selectedMedia.title}</h3>
            </div>
            <span className="text-xs text-slate-300 font-light">🕒 {selectedMedia.date}</span>
          </div>

        </div>
      )}

    </div>
  );
}