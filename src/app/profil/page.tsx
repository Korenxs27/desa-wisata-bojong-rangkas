"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, Landmark, Users } from "lucide-react";

export default function UserProfilPage() {
  const [profil, setProfil] = useState({
    sejarah: "",
    visi: "",
    misi: "",
    struktur: [],
    statistik: [],
    image_sejarah_url: ""
  });
  const [loading, setLoading] = useState(true);

  const apiEndpoint = "https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wc-bridge/v1/profil-desa";

  useEffect(() => {
    const fetchProfil = async () => {
      try {
        const res = await fetch(`${apiEndpoint}?t=${Date.now()}`, { cache: "no-store" });
        const data = await res.json();
        
        if (data && data.success && data.profil) {
          setProfil({
            sejarah: data.profil.sejarah || "",
            visi: data.profil.visi || "",
            misi: data.profil.misi || "",
            struktur: Array.isArray(data.profil.struktur) ? data.profil.struktur : [],
            statistik: Array.isArray(data.profil.statistik) ? data.profil.statistik : [],
            image_sejarah_url: data.profil.image_sejarah_url || ""
          });
        }
      } catch (err) {
        console.error("Gagal memuat profil user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfil();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
        <span className="ml-2 text-xs text-slate-500 font-medium tracking-wider">Memuat profil desa...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/40 pt-36 pb-24 px-4 sm:px-6 font-sans text-slate-800 relative overflow-hidden">
      
      {/* Background Soft Glow Effects (Luxury Touch) */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-20 relative z-10">
        
        {/* Header Title (Centered & Luxury Serif) */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-serif font-normal text-slate-900 tracking-tight">
            Profil Desa Bojong Rangkas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-light leading-relaxed">
            Mengenal lebih dekat lembar sejarah, visi strategis, serta jajaran Kelompok Sadar Wisata (Pokdarwis) Desa Wisata Bojong Rangkas.
          </p>
        </div>

        {/* Sejarah Singkat (Glassy Clean Container) */}
        {profil.sejarah && (
          <div className="bg-white/70 backdrop-blur-xl p-8 sm:p-12 rounded-[2.5rem] border border-white/85 shadow-xl shadow-slate-200/50 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {profil.image_sejarah_url && (
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/60 shadow-inner">
                <Image 
                  src={profil.image_sejarah_url} 
                  alt="Sejarah Desa" 
                  fill 
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover hover:scale-105 transition duration-700" 
                />
              </div>
            )}
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-serif font-normal text-slate-900">Sejarah Singkat Desa</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line font-light">
                {profil.sejarah}
              </p>
            </div>
          </div>
        )}

        {/* Visi & Misi */}
        {(profil.visi || profil.misi) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {profil.visi && (
              <div className="bg-gradient-to-br from-slate-900 to-emerald-950 backdrop-blur-xl border border-slate-800 text-white p-8 sm:p-10 rounded-[2.5rem] space-y-6 shadow-xl flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-2xl font-serif font-normal text-white">Visi Utama Desa</h3>
                  <blockquote className="text-sm text-slate-200 italic leading-relaxed border-l-2 border-emerald-400 pl-4 font-light">
                    &ldquo;{profil.visi}&rdquo;
                  </blockquote>
                </div>
                <p className="text-[10px] text-emerald-400/70 uppercase tracking-widest">Target Pembangunan Jangka Panjang</p>
              </div>
            )}

            {profil.misi && (
              <div className="bg-white/70 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] border border-white/85 space-y-6 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-2xl font-serif font-normal text-slate-900">Misi Kerja Desa</h3>
                  <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line space-y-2 font-light">
                    {profil.misi}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Struktur Organisasi Pokdarwis (Centered) */}
        {Array.isArray(profil.struktur) && profil.struktur.length > 0 && (
          <div className="space-y-10 text-center">
            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Jajaran Pengelola Utama</span>
              <h2 className="text-3xl font-serif font-normal text-slate-900">Struktur Organisasi Pokdarwis</h2>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-6">
              {profil.struktur.map((item: any, idx: number) => (
                <div key={idx} className="w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] max-w-sm bg-white/70 backdrop-blur-xl p-8 rounded-[2rem] border border-white/85 shadow-xl shadow-slate-200/50 space-y-4 flex flex-col justify-between text-center hover:shadow-2xl hover:border-emerald-500/30 transition duration-300">
                  <div className="space-y-3">
                    <div className="w-14 h-14 bg-emerald-50 border border-emerald-500/20 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center font-bold shadow-sm">
                      <Users size={24} />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">{item.jabatan}</span>
                    <h4 className="text-lg font-bold text-slate-900 uppercase tracking-wide">{item.nama}</h4>
                    <p className="text-xs text-slate-500 font-light leading-relaxed">{item.deskripsi}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statistik Desa (Centered Container & Grid) */}
        {Array.isArray(profil.statistik) && profil.statistik.length > 0 && (
          <div className="bg-white/70 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] border border-white/85 shadow-xl shadow-slate-200/50">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center justify-center items-center">
              {profil.statistik.map((stat: any, idx: number) => (
                <div key={idx} className="space-y-2 p-4 border-b sm:border-b-0 sm:border-r border-slate-200/80 last:border-none">
                  <h4 className="text-3xl sm:text-4xl font-black text-emerald-600">{stat.nilai}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}