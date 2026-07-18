import ClientBookingForm from "../ClientBookingForm";
import { PaketWisata } from "@/types/wisata";
import Script from "next/script";
import Image from "next/image";
import BackButton from "@/components/BackButton"; // 🚀 Impor BackButton Pintar
import { Calendar, Users, ShieldCheck, Info, Sparkles } from "lucide-react";

export default async function DetailPaketPage({ params }: { params: any }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  const res = await fetch(`https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wp/v2/paket_wisata?slug=${slug}&_embed`, {
    cache: "no-store"
  });
  const data = await res.json();
  
  if (!data || data.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center text-neutral-400 text-xs font-light">
        Paket wisata tidak ditemukan.
      </div>
    );
  }

  const paket: PaketWisata = data[0];
  const mediaEmbed = paket._embedded?.["wp:featuredmedia"]?.[0];
  const imageUrl = mediaEmbed?.source_url || "/placeholder-travel.jpg";

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-800 antialiased pb-20 selection:bg-emerald-100">
       <Script 
        src="https://app.midtrans.com/snap/snap.js" 
        data-client-key="Mid-client-q343rAbCQUljWRLn" 
        strategy="lazyOnload"
      />
      
      {/* Hero Banner Clean */}
      <div className="relative h-[45vh] md:h-[50vh] w-full bg-neutral-100 overflow-hidden border-b border-neutral-200/50">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/40 z-10" />
        <Image 
          src={imageUrl} 
          alt={paket.title.rendered}
          fill
          priority
          className="object-cover"
        />
        
        <div className="absolute bottom-8 left-0 right-0 z-20 max-w-6xl mx-auto px-6 space-y-3">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl border border-white/40 shadow-sm">
            <Sparkles size={10} /> Premium Experience
          </span>
          <h1 className="text-3xl md:text-4xl font-light font-serif tracking-tight text-white drop-shadow-sm">
            {paket.title.rendered}
          </h1>
        </div>
      </div>

      {/* Grid Layout Container */}
      <div className="max-w-6xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* Kolom Kiri: Deskripsi Detail */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* 🚀 TOMBOL KEMBALI PINTAR NATIVE */}
          <div className="flex justify-start">
            <BackButton text="Kembali" />
          </div>

          {/* Card Utama Konten Deskripsi */}
          <div className="bg-white/70 backdrop-blur-md border border-neutral-200/60 p-8 rounded-3xl space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
            <h2 className="text-xs font-bold tracking-wider uppercase text-neutral-500 flex items-center gap-2 border-b border-neutral-100 pb-4">
              <Info size={14} className="text-emerald-600" /> Detail Perjalanan & Informasi Paket
            </h2>
            
            {paket.content?.rendered ? (
              <div 
                className="prose prose-neutral text-xs text-neutral-500 leading-relaxed max-w-none 
                prose-p:mb-4 prose-ul:list-disc prose-ul:pl-5 prose-li:mb-2 prose-strong:text-neutral-900 prose-strong:font-semibold"
                dangerouslySetInnerHTML={{ __html: paket.content.rendered }}
              />
            ) : (
              <p className="text-xs text-neutral-400 font-light italic">
                Detail susunan acara dan fasilitas belum dimasukkan oleh pengelola.
              </p>
            )}
          </div>

          {/* Highlights Mini Card */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/50 border border-neutral-200/60 p-4 rounded-2xl flex items-center gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.005)]">
              <Calendar className="text-emerald-600 shrink-0" size={16} />
              <div>
                <p className="text-[9px] uppercase text-neutral-400 font-bold tracking-wider">Durasi Waktu</p>
                <p className="text-xs font-medium text-neutral-700">{paket.acf.durasi_paket}</p>
              </div>
            </div>
            <div className="bg-white/50 border border-neutral-200/60 p-4 rounded-2xl flex items-center gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.005)]">
              <Users className="text-emerald-600 shrink-0" size={16} />
              <div>
                <p className="text-[9px] uppercase text-neutral-400 font-bold tracking-wider">Batas Kuota</p>
                <p className="text-xs font-medium text-neutral-700">Min. {paket.acf.minimal_peserta} Orang</p>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Panel Booking Form */}
        <div className="lg:col-span-1 lg:sticky lg:top-28">
          <div className="bg-white/80 backdrop-blur-md border border-neutral-200/60 p-8 rounded-[2rem] shadow-[0_20px_45px_rgba(0,0,0,0.02)] space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-medium tracking-tight text-neutral-900">Reservasi Tiket</h3>
              <p className="text-[11px] text-neutral-400 font-light">Tentukan tanggal kunjungan dan jumlah kuota rombongan Anda.</p>
            </div>
            
            <div className="border-t border-neutral-100 pt-4">
              <ClientBookingForm 
                productId={paket.acf.produk_woocommerce_terkait} 
                pricePerPerson={paket.acf.harga_minimal} 
                minParticipants={paket.acf.minimal_peserta} 
              />
            </div>

            <div className="bg-emerald-50/60 border border-emerald-100/70 p-4 rounded-2xl flex gap-3 items-center">
              <ShieldCheck className="text-emerald-600 shrink-0" size={18} />
              <p className="text-[10px] text-neutral-500 leading-normal font-light">
                Pembayaran aman & instan via Midtrans gateway. E-Tiket otomatis dikirim setelah sukses.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}