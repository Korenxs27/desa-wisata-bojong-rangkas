import ClientBookingForm from "../ClientBookingForm";
import { HomestayWarga } from "@/types/homestay";
import Script from "next/script";
import Image from "next/image";
import BackButton from "@/components/BackButton"; // 🚀 Impor BackButton Pintar
import { Calendar, Users, Bed, Check, Images, ShieldCheck, Home } from "lucide-react";

export default async function DetailHomestayPage({ params }: { params: any }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  // Ambil data homestay berdasarkan slug ke REST API WordPress
  const res = await fetch(`https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wp/v2/homestay?slug=${slug}&_embed`, {
    cache: "no-store"
  });
  const data = await res.json();
  
  if (!data || data.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center text-neutral-400 text-xs font-light">
        Data homestay warga tidak ditemukan.
      </div>
    );
  }

  const homestay: HomestayWarga = data[0];
  const mediaEmbed = homestay._embedded?.["wp:featuredmedia"]?.[0];
  const imageUrl = mediaEmbed?.source_url || "/placeholder-home.jpg";

  // Parsing data ACF dengan aman menggunakan Type Casting (as any)
  const acfData = (homestay.acf as any) || {};
  const parsedProductId = Number(acfData.produk_woocommerce_terkait || 0);
  const parsedPrice = Number(acfData.harga_per_malam || 0);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-800 antialiased pb-20 selection:bg-emerald-100">
      
      {/* SCRIPT INTEGRASI POPUP MIDTRANS SNAP PRODUCTION */}
      <Script 
        src="https://app.midtrans.com/snap/snap.js" 
        data-client-key="Mid-client-q343rAbCQUljWRLn" 
        strategy="afterInteractive" 
      />

      {/* Hero Banner Bagian Atas */}
      <div className="relative h-[45vh] md:h-[50vh] w-full bg-neutral-100 overflow-hidden border-b border-neutral-200/50">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/40 z-10" />
        <Image 
          src={imageUrl} 
          alt={homestay.title.rendered} 
          fill 
          priority 
          className="object-cover" 
        />
        
        <div className="absolute bottom-8 left-0 right-0 z-20 max-w-6xl mx-auto px-6 space-y-3">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl border border-white/40 shadow-sm">
            <Home size={10} /> Hunian Warga Lokal
          </span>
          <h1 className="text-3xl md:text-4xl font-light font-serif tracking-tight text-white drop-shadow-sm">
            {homestay.title.rendered}
          </h1>
        </div>
      </div>

      {/* Grid Layout Container */}
      <div className="max-w-6xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* Kolom Kiri: Informasi Unit, Galeri & Fasilitas */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* 🚀 TOMBOL KEMBALI PINTAR NATIVE */}
          <div className="flex justify-start">
            <BackButton text="Kembali" />
          </div>

          {/* Info Card Utama */}
          <div className="bg-white/70 backdrop-blur-md border border-neutral-200/60 p-8 rounded-3xl space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
            <div className="flex flex-wrap items-center gap-6 border-b border-neutral-100 pb-5 text-neutral-600 text-xs">
              <div>
                <span className="text-neutral-400 font-light block text-[10px] uppercase tracking-wider">Pemilik</span>
                <span className="font-semibold text-neutral-900">{homestay.acf?.nama_pemilik || "-"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users size={15} className="text-emerald-600" /> Max {homestay.acf?.kapasitas_maksimal || 0} Tamu
              </div>
              <div className="flex items-center gap-1.5">
                <Bed size={15} className="text-emerald-600" /> {homestay.acf?.jumlah_kamar_tersedia || 0} Kamar Tersedia
              </div>
            </div>

            {homestay.content?.rendered ? (
              <div 
                className="prose prose-neutral text-xs text-neutral-500 leading-relaxed max-w-none"
                dangerouslySetInnerHTML={{ __html: homestay.content.rendered }}
              />
            ) : (
              <p className="text-xs text-neutral-400 font-light italic">Deskripsi lengkap homestay belum tersedia.</p>
            )}
          </div>

          {/* Galeri Foto Component */}
          {homestay.acf?.gallery_homestay && homestay.acf.gallery_homestay.length > 0 && (
            <div className="bg-white/70 backdrop-blur-md border border-neutral-200/60 p-8 rounded-3xl space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                <Images size={14} className="text-emerald-600" /> Galeri Penginapan
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {homestay.acf.gallery_homestay.map((urlImage, idx) => (
                  <div key={idx} className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200/40 hover:scale-102 transition duration-300">
                    <Image src={urlImage} alt={`Gallery ${idx + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daftar Fasilitas */}
          {homestay.acf?.fasilitas_homestay && homestay.acf.fasilitas_homestay.length > 0 && (
            <div className="bg-white/70 backdrop-blur-md border border-neutral-200/60 p-8 rounded-3xl space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">Fasilitas yang Tersedia</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {homestay.acf.fasilitas_homestay.map((fasilitas, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-neutral-500 font-light">
                    <div className="bg-emerald-50 text-emerald-600 p-1 rounded-lg border border-emerald-100/60">
                      <Check size={12} />
                    </div>
                    {fasilitas}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Sticky Form Pemesanan */}
        <div className="lg:col-span-1 lg:sticky lg:top-28">
          <div className="bg-white/80 backdrop-blur-md border border-neutral-200/60 p-8 rounded-[2rem] shadow-[0_20px_45px_rgba(0,0,0,0.02)] space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-medium tracking-tight text-neutral-900">Reservasi Penginapan</h3>
              <p className="text-[11px] text-neutral-400 font-light">Lengkapi data pemesan beserta durasi tanggal menginap Anda.</p>
            </div>
            
            <div className="border-t border-neutral-100 pt-4">
              <ClientBookingForm 
                homestay={homestay}
                productId={parsedProductId} 
                pricePerNight={parsedPrice}
              />
            </div>

            <div className="bg-emerald-50/60 border border-emerald-100/70 p-4 rounded-2xl flex gap-3 items-center">
              <ShieldCheck className="text-emerald-600 shrink-0" size={18} />
              <p className="text-[10px] text-neutral-500 leading-normal font-light">
                Pembayaran aman & instan didukung oleh Midtrans gateway. Info reservasi otomatis masuk ke sistem.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}