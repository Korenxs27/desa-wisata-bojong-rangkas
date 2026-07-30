import { ObjekWisata } from "@/types/wisata";
import Image from "next/image";
import BackButton from "@/components/BackButton"; 
import { Info, Sparkles, MapPin, Clock, Ticket, CircleCheck, CircleX } from "lucide-react";

export default async function DetailWisataPage({ params }: { params: any }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  const res = await fetch(`https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wp/v2/wisata?slug=${slug}&_embed`, {
    cache: "no-store"
  });
  const data = await res.json();
  
  if (!data || data.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center text-neutral-400 text-xs font-light">
        Destinasi wisata tidak ditemukan.
      </div>
    );
  }

  const wisata: ObjekWisata = data[0];
  const mediaEmbed = wisata._embedded?.["wp:featuredmedia"]?.[0];
  const imageUrl = mediaEmbed?.source_url || "/placeholder-travel.jpg";

  // 🔍 PEMBACA GANDA ACF (Aman dari error TypeScript & mendukung data baru/lama)
  const acf = (wisata as any).acf || {};

  const rawPrice = acf.harga ?? acf.harga_tiket ?? 0;
  const cleanPrice = Number(rawPrice);

  const rawStatus = acf.status_buka || acf.status_operasional || "Buka";
  const statusValue = String(rawStatus).trim();
  const isOpen = statusValue.toLowerCase() === "buka";

  const jamBukaText = acf.durasi || acf.jam_operasional || "08:00 - 17:00 WIB";
  const mapsData = acf.lokasi || acf.lokasi_maps || "";

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-800 antialiased pb-20 selection:bg-emerald-100">
      
      {/* Hero Banner Clean */}
      <div className="relative h-[45vh] md:h-[50vh] w-full bg-neutral-100 overflow-hidden border-b border-neutral-200/50">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/40 z-10" />
        <Image 
          src={imageUrl} 
          alt={wisata.title.rendered}
          fill
          priority
          className="object-cover"
        />
        
        <div className="absolute bottom-8 left-0 right-0 z-20 max-w-6xl mx-auto px-6 space-y-3">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl border border-white/40 shadow-sm">
            <Sparkles size={10} /> {acf.kategori_wisata || "Jelajah Alam"}
          </span>
          <h1 className="text-3xl md:text-4xl font-light font-serif tracking-tight text-white drop-shadow-sm">
            {wisata.title.rendered}
          </h1>
        </div>
      </div>

      {/* Content Layout */}
      <div className="max-w-6xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* Kolom Kiri: Profil & Deskripsi */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="flex justify-start">
            <BackButton text="Kembali" />
          </div>

          {/* Card Utama Deskripsi */}
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
        </div>

        {/* Kolom Kanan: Informasi Operasional & Lokasi Maps */}
        <div className="space-y-6 sticky top-6">
          
          <div className="bg-white/80 backdrop-blur-md border border-neutral-200/60 p-6 rounded-3xl shadow-[0_20px_45px_rgba(0,0,0,0.02)] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-3">Informasi Kunjungan</h3>
            
            <div className="space-y-3 text-xs font-light text-neutral-600">
              <div className="flex items-center gap-2.5">
                <Clock size={14} className="text-emerald-600 shrink-0" />
                <span>Jam Buka: {jamBukaText}</span>
              </div>
              
              <div className="flex items-center gap-2.5">
                <Ticket size={14} className="text-emerald-600 shrink-0" />
                <span>
                  {!isNaN(cleanPrice) && cleanPrice > 0 
                    ? `Rp ${cleanPrice.toLocaleString("id-ID")} /orang`
                    : "Gratis"}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isOpen ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                }`}>
                  {isOpen ? <CircleCheck size={10} /> : <CircleX size={10} />}
                  Status: {statusValue}
                </span>
              </div>
            </div>
          </div>

          {/* Render Peta Navigasi */}
          {/* Render Peta Navigasi */}
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