"use client";

import { useEffect, useState, use } from "react";
import { ObjekWisata } from "@/types/wisata";
import Image from "next/image";
import BackButton from "@/components/BackButton"; 
import { 
  Info, Sparkles, MapPin, Clock, Ticket, CircleCheck, CircleX, CalendarCheck, Images, X, ZoomIn 
} from "lucide-react";
import ClientWisataOrderForm from "../ClientWisataOrderForm";

export default function DetailWisataPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const identifier = resolvedParams?.slug;

  const [wisata, setWisata] = useState<ObjekWisata | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  // Efek untuk mengunci scroll saat popup lightbox aktif
  useEffect(() => {
    if (activeImage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [activeImage]);

  useEffect(() => {
    async function fetchData() {
      if (!identifier) return;
      try {
        const isId = /^\d+$/.test(identifier);
        const apiUrl = isId 
          ? `https://desa-wisata-bojongrangkas.com/wp-json/wp/v2/wisata/${identifier}?_embed`
          : `https://desa-wisata-bojongrangkas.com/wp-json/wp/v2/wisata?slug=${identifier}&_embed`;

        const res = await fetch(apiUrl, { cache: "no-store" });
        const contentType = res.headers.get("content-type");

        if (!contentType || !contentType.includes("application/json")) {
          console.error("Server WordPress tidak mengembalikan JSON yang valid.");
          setWisata(null);
          setLoading(false);
          return;
        }

        const rawData = await res.json();
        
        const foundWisata = isId 
          ? (rawData?.id ? rawData : null) 
          : (Array.isArray(rawData) && rawData.length > 0 ? rawData[0] : null);

        setWisata(foundWisata);
      } catch (err) {
        console.error("Gagal memuat detail objek wisata", err);
        setWisata(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [identifier]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center text-neutral-400 text-xs font-light">
        Memuat detail objek wisata...
      </div>
    );
  }

  if (!wisata) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center text-neutral-400 text-xs font-light">
        Objek wisata tidak ditemukan.
      </div>
    );
  }

  const mediaEmbed = wisata._embedded?.["wp:featuredmedia"]?.[0];
  const imageUrl = mediaEmbed?.source_url || "/placeholder-travel.jpg";

  // 🔍 Pembaca ganda data ACF
  const acf = (wisata as any).acf || {};

  const rawPrice = acf.harga ?? acf.harga_tiket ?? 0;
  const cleanPrice = Number(rawPrice);

  const rawStatus = acf.status_buka || acf.status_operasional || "Buka";
  const statusValue = String(rawStatus).trim();
  const isOpen = statusValue.toLowerCase() === "buka";

  const jamBukaText = acf.durasi || acf.jam_operasional || "08:00 - 17:00 WIB";
  const mapsData = acf.lokasi || acf.lokasi_maps || "";

  // 📸 BACA DATA GALERI FOTO WISATA DARI ACF
  const rawGallery = acf.gallery_images ?? acf.gallery_paket ?? acf.gallery_wisata ?? [];
  let galleryList: string[] = [];
  if (Array.isArray(rawGallery)) {
    galleryList = rawGallery.filter((item) => typeof item === "string" && item.trim() !== "");
  } else if (typeof rawGallery === "string" && rawGallery.trim() !== "") {
    galleryList = [rawGallery];
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-800 antialiased pb-20 selection:bg-emerald-100 pt-20">
      
      {/* POPUP LIGHTBOX MODAL FOTO (z-[9999]) */}
      {activeImage && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActiveImage(null)}
        >
          <button 
            onClick={() => setActiveImage(null)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition z-[10000]"
          >
            <X size={24} />
          </button>
          <div className="relative w-full max-w-5xl h-[85vh]">
            <Image 
              src={activeImage} 
              alt="Preview Penuh" 
              fill 
              className="object-contain rounded-2xl" 
            />
          </div>
        </div>
      )}

      {/* Hero Banner Bagian Atas */}
      <div className="relative h-[45vh] md:h-[50vh] w-full bg-neutral-100 overflow-hidden border-b border-neutral-200/50">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/40 z-10" />
        <Image 
          src={imageUrl} 
          alt={wisata.title?.rendered || "Objek Wisata"}
          fill
          priority
          className="object-cover cursor-pointer"
          onClick={() => setActiveImage(imageUrl)}
        />
        
        <div className="absolute bottom-8 left-0 right-0 z-20 max-w-6xl mx-auto px-6 space-y-3">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl border border-white/40 shadow-sm">
            <Sparkles size={10} /> {acf.kategori_wisata || "Jelajah Alam"}
          </span>
          <h1 className="text-3xl md:text-4xl font-light font-serif tracking-tight text-white drop-shadow-sm">
            {wisata.title?.rendered}
          </h1>
        </div>
      </div>

      {/* Grid Layout Container */}
      <div className="max-w-6xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* Kolom Kiri: Profil, Deskripsi, & Galeri Foto */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="flex justify-start">
            <BackButton text="Kembali" />
          </div>

          {/* 1. INFORMASI UTAMA & DESKRIPSI */}
          <div className="bg-white/70 backdrop-blur-md border border-neutral-200/60 p-8 rounded-3xl space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
            <h2 className="text-xs font-bold tracking-wider uppercase text-neutral-500 flex items-center gap-2 border-b border-neutral-100 pb-4">
              <Info size={14} className="text-emerald-600" /> Profil Eksplorasi Objek Wisata
            </h2>
            
            {wisata.content?.rendered ? (
              <div 
                className="prose prose-neutral text-xs text-neutral-500 leading-relaxed max-w-none 
                prose-p:mb-4 prose-ul:list-disc prose-ul:pl-5 prose-li:mb-2 prose-strong:text-neutral-900 prose-strong:font-semibold"
                dangerouslySetInnerHTML={{ __html: wisata.content.rendered }}
              />
            ) : (
              <p className="text-xs text-neutral-400 font-light italic">
                Belum ada info deskripsi mendalam mengenai tempat ini.
              </p>
            )}
          </div>

          {/* 2. GALERI DOKUMENTASI WISATA */}
          {galleryList.length > 0 && (
            <div className="bg-white/70 backdrop-blur-md border border-neutral-200/60 p-8 rounded-3xl space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                <Images size={14} className="text-emerald-600" /> Galeri Dokumentasi ({galleryList.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {galleryList.map((urlImage: string, idx: number) => (
                  <div 
                    key={idx} 
                    onClick={() => setActiveImage(urlImage)}
                    className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200/40 cursor-pointer group shadow-sm hover:shadow-md transition duration-300"
                  >
                    <Image src={urlImage} alt={`Galeri ${idx + 1}`} fill className="object-cover group-hover:scale-105 transition duration-500" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                      <ZoomIn size={22} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Kolom Kanan: Ringkasan Informasi, Form Booking, & Maps */}
        <div className="space-y-6 lg:sticky lg:top-28">
          
          {/* Card Form Booking Tiket Terintegrasi */}
          <div className="bg-white/80 backdrop-blur-md border border-neutral-200/60 p-6 rounded-3xl shadow-[0_20px_45px_rgba(0,0,0,0.02)] space-y-5">
            <div className="border-b border-neutral-100 pb-3 flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                <CalendarCheck size={14} className="text-emerald-600" /> Pesan Tiket Wisata
              </h3>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                isOpen ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
              }`}>
                {isOpen ? <CircleCheck size={10} /> : <CircleX size={10} />}
                {statusValue}
              </span>
            </div>

            <div className="space-y-2 text-xs font-light text-neutral-600 bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-neutral-500"><Clock size={13} className="text-emerald-600" /> Jam Buka</span>
                <span className="font-medium text-neutral-800">{jamBukaText}</span>
              </div>
              <div className="flex items-center justify-between border-t border-neutral-200/60 pt-2">
                <span className="flex items-center gap-1.5 text-neutral-500"><Ticket size={13} className="text-emerald-600" /> Tiket Masuk</span>
                <span className="font-bold text-emerald-700 text-sm">
                  {!isNaN(cleanPrice) && cleanPrice > 0 
                    ? `Rp ${cleanPrice.toLocaleString("id-ID")} /orang`
                    : "Gratis Masuk"}
                </span>
              </div>
            </div>

            {/* Component Client Order Form */}
            <ClientWisataOrderForm 
              productId={wisata.id}
              productName={wisata.title?.rendered || ""}
              productPrice={cleanPrice}
              statusBuka={statusValue}
            />
          </div>

          {/* Render Peta Navigasi Google Maps */}
          {String(mapsData).trim() !== "" && (
            <div className="bg-white/80 backdrop-blur-md border border-neutral-200/60 p-6 rounded-3xl shadow-[0_20px_45px_rgba(0,0,0,0.02)] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                <MapPin size={14} className="text-emerald-600" /> Peta Navigasi
              </h3>
              
              {String(mapsData).includes("<iframe") ? (
                <div 
                  className="w-full h-48 rounded-2xl overflow-hidden border border-neutral-200/60 
                  [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
                  dangerouslySetInnerHTML={{ __html: mapsData }}
                />
              ) : (
                <div className="w-full h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-700 border border-neutral-200/60 relative p-6 flex flex-col justify-between text-white shadow-inner">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                  <div className="relative z-10 flex items-center gap-2">
                    <span className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                      <MapPin size={18} className="text-white" />
                    </span>
                    <div>
                      <p className="text-xs font-bold">Lokasi Wisata Tersedia</p>
                      <p className="text-[10px] text-emerald-100 font-light">Navigasi langsung via Google Maps</p>
                    </div>
                  </div>

                  <a 
                    href={String(mapsData).trim()} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="relative z-15 w-full py-2.5 bg-white text-emerald-800 font-bold text-xs rounded-xl shadow-md hover:bg-emerald-50 transition text-center block"
                  >
                    Buka Rute di Google Maps ↗
                  </a>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}