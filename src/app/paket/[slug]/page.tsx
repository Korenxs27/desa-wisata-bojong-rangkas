"use client";

import { useEffect, useState, use } from "react";
import ClientBookingForm from "../ClientBookingForm"; // Sesuaikan jika letaknya di "@/components/ClientBookingForm" atau "../../ClientBookingForm"
import { PaketWisata } from "@/types/wisata";
import Script from "next/script";
import Image from "next/image";
import BackButton from "@/components/BackButton"; 
import { 
  Calendar, Users, ShieldCheck, Info, Sparkles, CheckCircle2, Images, X, ZoomIn 
} from "lucide-react";

export default function DetailPaketPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const identifier = resolvedParams?.slug;

  const [paket, setPaket] = useState<PaketWisata | null>(null);
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
          ? `https://desa-wisata-bojongrangkas.com/wp-json/wp/v2/paket_wisata/${identifier}?_embed`
          : `https://desa-wisata-bojongrangkas.com/wp-json/wp/v2/paket_wisata?slug=${identifier}&_embed`;

        const res = await fetch(apiUrl, { cache: "no-store" });
        const contentType = res.headers.get("content-type");

        // Pastikan server benar-benar mengembalikan JSON, bukan halaman HTML error
        if (!contentType || !contentType.includes("application/json")) {
          console.error("Server WordPress tidak mengembalikan JSON yang valid.");
          setPaket(null);
          setLoading(false);
          return;
        }

        const rawData = await res.json();
        
        const foundPaket = isId 
          ? (rawData?.id ? rawData : null) 
          : (Array.isArray(rawData) && rawData.length > 0 ? rawData[0] : null);

        setPaket(foundPaket);
      } catch (err) {
        console.error("Gagal memuat detail paket wisata", err);
        setPaket(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [identifier]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center text-neutral-400 text-xs font-light">
        Memuat detail paket wisata...
      </div>
    );
  }

  if (!paket) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center text-neutral-400 text-xs font-light">
        Paket wisata tidak ditemukan.
      </div>
    );
  }

  const mediaEmbed = paket._embedded?.["wp:featuredmedia"]?.[0];
  const imageUrl = mediaEmbed?.source_url || "/placeholder-travel.jpg";

  const acfData = (paket.acf as any) || {};
  const parsedProductId = Number(acfData.produk_woocommerce_terkait || 0);
  const parsedPrice = Number(acfData.harga_minimal || acfData.harga || 0);
  
  const galleryList = Array.isArray(acfData.gallery_images || acfData.gallery_paket) 
    ? (acfData.gallery_images || acfData.gallery_paket) 
    : [];

  const fasilitasList = Array.isArray(acfData.fasilitas_paket || acfData.fasilitas) 
    ? (acfData.fasilitas_paket || acfData.fasilitas) 
    : [];

  const minPeserta = Number(acfData.minimal_peserta || 1);
  const durasiPaket = acfData.durasi_paket || acfData.durasi || "1 Hari";
  const diskonMinimalPeserta = Number(acfData.diskon_minimal_peserta || 0);
  const diskonNominal = Number(acfData.diskon_nominal || 0);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-800 antialiased pb-20 selection:bg-emerald-100">
      
      <Script 
        src="https://app.midtrans.com/snap/snap.js" 
        data-client-key="Mid-client-q343rAbCQUljWRLn" 
        strategy="afterInteractive" 
      />

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
          alt={paket.title?.rendered || "Paket Wisata"} 
          fill 
          priority 
          className="object-cover cursor-pointer" 
          onClick={() => setActiveImage(imageUrl)}
        />
        
        <div className="absolute bottom-8 left-0 right-0 z-20 max-w-6xl mx-auto px-6 space-y-3">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl border border-white/40 shadow-sm">
            <Sparkles size={10} /> Premium Experience
          </span>
          <h1 className="text-3xl md:text-4xl font-light font-serif tracking-tight text-white drop-shadow-sm">
            {paket.title?.rendered}
          </h1>
        </div>
      </div>

      {/* Grid Layout Container */}
      <div className="max-w-6xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* Kolom Kiri */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="flex justify-start">
            <BackButton text="Kembali" />
          </div>

          {/* 1. INFORMASI UTAMA & DESKRIPSI */}
          <div className="bg-white/70 backdrop-blur-md border border-neutral-200/60 p-8 rounded-3xl space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
            <div className="flex flex-wrap items-center gap-6 border-b border-neutral-100 pb-5 text-neutral-600 text-xs">
              <div className="flex items-center gap-1.5">
                <Calendar size={15} className="text-emerald-600" /> Durasi: <span className="font-semibold text-neutral-900">{durasiPaket}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users size={15} className="text-emerald-600" /> Min. Rombongan: <span className="font-semibold text-neutral-900">{minPeserta} Orang</span>
              </div>
            </div>

            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <Info size={14} className="text-emerald-600" /> Detail Perjalanan & Itinerary
            </h2>

            {paket.content?.rendered ? (
              <div 
                className="prose prose-neutral text-xs text-neutral-500 leading-relaxed max-w-none 
                prose-p:mb-4 prose-ul:list-disc prose-ul:pl-5 prose-li:mb-2 prose-strong:text-neutral-900 prose-strong:font-semibold"
                dangerouslySetInnerHTML={{ __html: paket.content.rendered }}
              />
            ) : (
              <p className="text-xs text-neutral-400 font-light italic">Detail susunan acara belum dimasukkan oleh pengelola.</p>
            )}
          </div>

          {/* 2. FASILITAS PAKET */}
          {fasilitasList.length > 0 && (
            <div className="bg-white/70 backdrop-blur-md border border-neutral-200/60 p-8 rounded-3xl space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600" /> Fasilitas yang Didapat
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {fasilitasList.map((fasilitas: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2.5 bg-neutral-50/80 p-3 rounded-2xl border border-neutral-100 text-xs text-neutral-700 font-medium">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>{fasilitas}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. GALERI DOKUMENTASI PAKET */}
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

        {/* Kolom Kanan: Sticky Form Reservasi Tiket */}
        <div className="lg:col-span-1 lg:sticky lg:top-28">
          <div className="bg-white/80 backdrop-blur-md border border-neutral-200/60 p-8 rounded-[2rem] shadow-[0_20px_45px_rgba(0,0,0,0.02)] space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-medium tracking-tight text-neutral-900">Reservasi Tiket</h3>
              <p className="text-[11px] text-neutral-400 font-light">Tentukan tanggal kunjungan dan jumlah kuota rombongan Anda.</p>
            </div>
            
            <div className="border-t border-neutral-100 pt-4">
              <ClientBookingForm 
                productId={parsedProductId} 
                productName={paket.title?.rendered || ""}
                productPrice={parsedPrice} 
                stockStatus="publish"
                minPeserta={minPeserta} 
                diskonMinimalPeserta={diskonMinimalPeserta}
                diskonNominal={diskonNominal}
              />
            </div>

            <div className="bg-emerald-50/60 border border-emerald-100/70 p-4 rounded-2xl flex gap-3 items-center">
              <ShieldCheck className="text-emerald-600 shrink-0" size={18} />
              <p className="text-[10px] text-neutral-500 leading-normal font-light">
                Pembayaran aman & instan via transfer bank / QRIS atau gateway. E-Tiket otomatis dikirim setelah sukses.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}