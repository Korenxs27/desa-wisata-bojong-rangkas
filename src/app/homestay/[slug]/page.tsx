"use client";

import { useEffect, useState, use } from "react";
import ClientBookingForm from "../ClientBookingForm";
import { HomestayWarga } from "@/types/homestay";
import Script from "next/script";
import Image from "next/image";
import BackButton from "@/components/BackButton"; 
import { 
  Users, Bed, Images, ShieldCheck, Home, 
  Wifi, AirVent, Coffee, Utensils, Tv, Car, Waves, Bath, Shield, CheckCircle, Fan, Refrigerator, WashingMachine, Trees, X, ZoomIn 
} from "lucide-react";

// Fungsi Pintar: Ikon Dinamis Mengikuti Ketikan Admin
function getDynamicFacilityIcon(facilityName: string) {
  const text = facilityName.toLowerCase().trim();

  if (text.includes("wifi") || text.includes("internet") || text.includes("hotspot")) 
    return <Wifi size={16} className="text-emerald-600" />;
  
  if (text.includes("ac") || text.includes("air conditioner") || text.includes("pendingin")) 
    return <AirVent size={16} className="text-emerald-600" />;
  
  if (text.includes("kipas") || text.includes("fan")) 
    return <Fan size={16} className="text-emerald-600" />;
  
  if (text.includes("kopi") || text.includes("teh") || text.includes("sarapan") || text.includes("breakfast")) 
    return <Coffee size={16} className="text-emerald-600" />;
  
  if (text.includes("dapur") || text.includes("makan") || text.includes("kompor") || text.includes("kitchen")) 
    return <Utensils size={16} className="text-emerald-600" />;
  
  if (text.includes("tv") || text.includes("televisi") || text.includes("netflix") || text.includes("hiburan")) 
    return <Tv size={16} className="text-emerald-600" />;
  
  if (text.includes("parkir") || text.includes("garasi") || text.includes("mobil") || text.includes("motor")) 
    return <Car size={16} className="text-emerald-600" />;
  
  if (text.includes("kolam") || text.includes("renang") || text.includes("pool") || text.includes("water")) 
    return <Waves size={16} className="text-emerald-600" />;
  
  if (text.includes("mandi") || text.includes("bathroom") || text.includes("water heater") || text.includes("toilet") || text.includes("bathtub")) 
    return <Bath size={16} className="text-emerald-600" />;
  
  if (text.includes("lemari") || text.includes("kulkas") || text.includes("refrigerator")) 
    return <Refrigerator size={16} className="text-emerald-600" />;
  
  if (text.includes("cuci") || text.includes("laundry") || text.includes("mesin cuci")) 
    return <WashingMachine size={16} className="text-emerald-600" />;
  
  if (text.includes("pemandangan") || text.includes("view") || text.includes("taman") || text.includes("kebun") || text.includes("alam")) 
    return <Trees size={16} className="text-emerald-600" />;
  
  if (text.includes("keamanan") || text.includes("cctv") || text.includes("satpam") || text.includes("secure")) 
    return <Shield size={16} className="text-emerald-600" />;

  return <CheckCircle size={16} className="text-emerald-600" />;
}

export default function DetailHomestayPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams?.slug;

  const [homestay, setHomestay] = useState<HomestayWarga | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  // Efek untuk mengunci scroll dan menyembunyikan interaksi navbar saat popup aktif
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
      try {
        const res = await fetch(`https://desa-wisata-bojongrangkas.com/wp-json/wp/v2/homestay?slug=${slug}&_embed`, {
          cache: "no-store"
        });
        const data = await res.json();
        if (data && data.length > 0) {
          setHomestay(data[0]);
        }
      } catch (err) {
        console.error("Gagal memuat detail homestay", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center text-neutral-400 text-xs font-light">
        Memuat detail homestay...
      </div>
    );
  }

  if (!homestay) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center text-neutral-400 text-xs font-light">
        Data homestay warga tidak ditemukan.
      </div>
    );
  }

  const mediaEmbed = homestay._embedded?.["wp:featuredmedia"]?.[0];
  const imageUrl = mediaEmbed?.source_url || "/placeholder-home.jpg";

  const acfData = (homestay.acf as any) || {};
  
  // SOLUSI UTAMA: Jika ACF produk WooCommerce kosong/0, gunakan ID pos homestay secara otomatis
  const parsedProductId = Number(acfData.produk_woocommerce_terkait || homestay.id || 0);
  
  const parsedPrice = Number(acfData.harga_per_malam || acfData.harga || 0);
  const galleryList = acfData.gallery_images || acfData.gallery_homestay || [];
  const fasilitasList = acfData.fasilitas_homestay || [];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-800 antialiased pb-20 selection:bg-emerald-100">
      
      <Script 
        src="https://app.midtrans.com/snap/snap.js" 
        data-client-key="Mid-client-q343rAbCQUljWRLn" 
        strategy="afterInteractive" 
      />

      {/* POPUP LIGHTBOX MODAL FOTO */}
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
          alt={homestay.title.rendered} 
          fill 
          priority 
          className="object-cover cursor-pointer" 
          onClick={() => setActiveImage(imageUrl)}
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
        
        {/* Kolom Kiri */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="flex justify-start">
            <BackButton text="Kembali" />
          </div>

          {/* 1. FASILITAS */}
          {fasilitasList.length > 0 && (
            <div className="bg-white/70 backdrop-blur-md border border-neutral-200/60 p-8 rounded-3xl space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">Fasilitas yang Tersedia</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {fasilitasList.map((fasilitas: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2.5 bg-neutral-50/80 p-3 rounded-2xl border border-neutral-100 text-xs text-neutral-700 font-medium">
                    <div className="bg-emerald-50 text-emerald-600 p-1 rounded-xl border border-emerald-100 shrink-0">
                      {getDynamicFacilityIcon(fasilitas)}
                    </div>
                    <span className="truncate">{fasilitas}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. INFO CARD & DESKRIPSI UTAMA */}
          <div className="bg-white/70 backdrop-blur-md border border-neutral-200/60 p-8 rounded-3xl space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
            <div className="flex flex-wrap items-center gap-6 border-b border-neutral-100 pb-5 text-neutral-600 text-xs">
              <div>
                <span className="text-neutral-400 font-light block text-[10px] uppercase tracking-wider">Pemilik</span>
                <span className="font-semibold text-neutral-900">{acfData.nama_pemilik || "-"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users size={15} className="text-emerald-600" /> Max {acfData.kapasitas_maksimal || 0} Tamu
              </div>
              <div className="flex items-center gap-1.5">
                <Bed size={15} className="text-emerald-600" /> {acfData.jumlah_kamar_tersedia || 0} Kamar Tersedia
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

          {/* 3. GALERI FOTO PENGINAPAN DI PALING BAWAH */}
          {galleryList.length > 0 && (
            <div className="bg-white/70 backdrop-blur-md border border-neutral-200/60 p-8 rounded-3xl space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                <Images size={14} className="text-emerald-600" /> Galeri Penginapan ({galleryList.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {galleryList.map((urlImage: string, idx: number) => (
                  <div 
                    key={idx} 
                    onClick={() => setActiveImage(urlImage)}
                    className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200/40 cursor-pointer group shadow-sm hover:shadow-md transition duration-300"
                  >
                    <Image src={urlImage} alt={`Gallery ${idx + 1}`} fill className="object-cover group-hover:scale-105 transition duration-500" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                      <ZoomIn size={22} />
                    </div>
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
                Pembayaran aman & instan didukung oleh sistem gateway desa. Info reservasi otomatis masuk ke sistem.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}