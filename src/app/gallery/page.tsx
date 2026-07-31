"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, Image as ImageIcon } from "lucide-react";

export default function UserGalleryPage() {
  const [gallery, setGallery] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [categories, setCategories] = useState<string[]>([]);

  const apiEndpoint = "https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wc-bridge/v1/gallery-items";

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch(apiEndpoint, { cache: "no-store" });
        const data = await res.json();
        if (data.success && Array.isArray(data.gallery)) {
          setGallery(data.gallery);
          
          // Ekstrak kategori unik dari data galeri
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

  // Filter galeri berdasarkan kategori yang dipilih
  const filteredGallery = selectedCategory === "Semua" 
    ? gallery 
    : gallery.filter((item) => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30 pt-36 pb-24 px-4 sm:px-6 font-sans text-slate-800 relative overflow-hidden">
      
      {/* Background Soft Glassy Glow Effects */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-teal-300/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* Header Title dengan Sentuhan Serif Klasik & Badge Luxury */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-5xl font-serif font-normal text-slate-900 tracking-tight">
            Galeri & Momen Kegiatan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-light leading-relaxed">
            Jelajahi berbagai potret keindahan alam, aktivitas warga, homestay, serta ragam UMKM di Desa Wisata Bojong Rangkas.
          </p>
        </div>

        {/* Filter Kategori Buttons (Glassy Light Style) */}
        {!loading && categories.length > 1 && (
          <div className="flex items-center justify-center flex-wrap gap-2 pt-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer shadow-sm ${
                  selectedCategory === cat
                    ? "bg-emerald-600 text-white shadow-emerald-600/20 shadow-md scale-105"
                    : "bg-white/80 backdrop-blur-md text-slate-600 hover:bg-white border border-slate-200/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Gallery Content Grid (Glassy Card Luxury) */}
        {loading ? (
          <div className="text-center py-24 text-slate-400 text-sm flex items-center justify-center gap-2 bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/60 shadow-sm">
            <Loader2 className="animate-spin text-emerald-600" size={20} /> Memuat galeri desa...
          </div>
        ) : filteredGallery.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredGallery.map((item) => (
              <div 
                key={item.id} 
                className="bg-white/70 backdrop-blur-xl border border-white/85 rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-500 flex flex-col justify-between group"
              >
                <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                  <Image 
                    src={item.image} 
                    alt={item.title} 
                    fill 
                    className="object-cover group-hover:scale-110 transition duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    {item.category}
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
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white/85 shadow-sm max-w-md mx-auto space-y-3">
            <ImageIcon className="mx-auto text-slate-300" size={40} />
            <p className="text-xs text-slate-500 font-medium">Tidak ada foto dalam kategori &quot;{selectedCategory}&quot;.</p>
          </div>
        )}

      </div>
    </div>
  );
}