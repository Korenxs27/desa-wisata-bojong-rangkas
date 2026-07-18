"use client";

import { useState } from "react";
import Image from "next/image";
import { Images, Grid, Camera, Users, Landmark, Maximize2 } from "lucide-react";

export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState("all");

  // Kategori Filter
  const filters = [
    { id: "all", name: "Semua", icon: <Grid size={12} /> },
    { id: "alam", name: "Pesona Alam", icon: <Camera size={12} /> },
    { id: "kegiatan", name: "Kegiatan Warga", icon: <Users size={12} /> },
    { id: "fasilitas", name: "Fasilitas Desa", icon: <Landmark size={12} /> },
  ];

  // Data Item Galeri Mockup Premium
  const galleryItems = [
    { id: 1, category: "alam", title: "Sunrise Bukit Rangkas", img: "/images/kapur.jpg" },
    { id: 2, category: "kegiatan", title: "Workshop Anyaman Tas UMKM", img: "/images/puncak batu roti.jpg" },
    { id: 3, category: "fasilitas", title: "Pusat Informasi Edukasi", img: "/images/wisata.jpg" },
    { id: 4, category: "alam", title: "Aliran Sungai Kelok Bojong", img: "/images/tas.png" },
    { id: 5, category: "kegiatan", title: "Festival Budaya Tahunan", img: "/images/roti.png" },
    { id: 6, category: "fasilitas", title: "Homestay Asri Vibe Kaca", img: "/images/homestay.jpg" },
    { id: 7, category: "alam", title: "Agrowisata Kebun Kopi", img: "/images/homestay sans.jpg" },
    { id: 8, category: "kegiatan", title: "Rapat Karang Taruna Desa", img: "/images/homestay joglo.jpg" },
    { id: 9, category: "fasilitas", title: "Akses Jalan Utama Terintegrasi", img: "/images/kapur.jpg" },
  ];

  const filteredItems = activeFilter === "all" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeFilter);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-800 antialiased pb-24 pt-32 selection:bg-emerald-100">
      
      {/* 🌟 1. HERO TITLE BLOCK */}
      <div className="max-w-7xl mx-auto px-6 pb-8 text-center space-y-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600 bg-emerald-50/60 px-4 py-1.5 rounded-full border border-emerald-100 inline-flex items-center gap-1.5">
          <Images size={12} /> Galeri Visual Desa
        </span>
        <h1 className="text-4xl md:text-5xl font-light font-serif tracking-tight text-neutral-900">
          Dokumentasi Keindahan
        </h1>
        <p className="max-w-md mx-auto text-xs text-neutral-400 font-light leading-relaxed">
          Eksplorasi kumpulan potret lensa keindahan alam, aktivitas kearifan lokal, dan infrastruktur modern Bojong Rangkas.
        </p>
      </div>

      {/* 🧭 2. FILTER TABS (Glassmorphism Pill) */}
      <div className="max-w-5xl mx-auto px-6 mb-12 flex justify-center">
        <div className="flex flex-wrap items-center justify-center gap-1.5 bg-white/70 backdrop-blur-md px-2 py-1.5 rounded-full border border-neutral-200/40 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-full flex items-center gap-1.5 transition duration-300 ${
                activeFilter === filter.id
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100/60"
              }`}
            >
              {filter.icon}
              {filter.name}
            </button>
          ))}
        </div>
      </div>

      {/* 📸 3. MASONRY/GRID ADVANCED GALLERY */}
      <div className="max-w-6xl mx-auto px-6">
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group bg-white/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-neutral-200/40 p-3 shadow-[0_8px_30px_rgba(0,0,0,0.005)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.02)] hover:border-emerald-500/20 transition duration-500 flex flex-col h-full relative"
              >
                {/* Image Wrap */}
                <div className="relative aspect-[4/3] w-full bg-neutral-100 rounded-xl overflow-hidden">
                  <Image
                    src={item.img}
                    alt={item.title}
                    fill
                    sizes="(max-w-7xl) 33vw"
                    className="object-cover group-hover:scale-105 transition duration-700 ease-out"
                  />
                  {/* Glassy Hover Overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition duration-500 flex items-center justify-center z-10">
                    <div className="p-2.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white transform translate-y-2 group-hover:translate-y-0 transition duration-500">
                      <Maximize2 size={14} />
                    </div>
                  </div>
                </div>

                {/* Info Text */}
                <div className="pt-4 pb-2 px-1 flex flex-col justify-between flex-grow">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black tracking-widest text-emerald-600 uppercase block">
                      {item.category}
                    </span>
                    <h3 className="text-xs font-bold text-neutral-800 tracking-tight line-clamp-1 uppercase pt-0.5">
                      {item.title}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/40 backdrop-blur-md rounded-3xl border border-neutral-200/40">
            <p className="text-xs text-neutral-400 italic font-light">Belum ada dokumentasi visual pada kategori ini cukk.</p>
          </div>
        )}
      </div>

    </div>
  );
}