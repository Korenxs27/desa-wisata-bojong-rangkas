import Link from "next/link";
import Image from "next/image";
import { Calendar, Users, ArrowRight, MapPin } from "lucide-react";
import { PaketWisata } from "@/types/wisata";

export default async function KatalogPaketPage() {
  const res = await fetch("https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wp/v2/paket_wisata?_embed", {
    cache: "no-store",
  });
  const paketList: PaketWisata[] = await res.json();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30 text-neutral-800 antialiased pt-36 pb-24 px-4 sm:px-6 lg:px-8 selection:bg-emerald-100 relative overflow-hidden">
      
      {/* Background Soft Glassy Glow Effects */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-teal-300/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        
        {/* Header Luxury Light (Centered) */}
        <div className="space-y-3 text-center max-w-xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-serif font-normal tracking-tight text-neutral-900">
            Paket Wisata Eksklusif
          </h1>
          <p className="text-xs text-neutral-500 font-light leading-relaxed">
            Rasakan keasrian budaya dan petualangan menakjubkan di Desa Bojong Rangkas melalui pilihan paket terbaik lokal.
          </p>
        </div>

        {/* Grid List Glassy Light */}
        {paketList.length === 0 ? (
          <div className="text-center py-24 bg-white/70 backdrop-blur-xl border border-white/85 rounded-[2.5rem] text-xs text-neutral-400 font-light shadow-sm max-w-md mx-auto">
            Belum ada paket wisata yang tersedia saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paketList.map((paket: PaketWisata) => {
              const mediaEmbed = paket._embedded?.["wp:featuredmedia"]?.[0];
              const imageUrl = mediaEmbed?.source_url || "/placeholder-travel.jpg";

              return (
                <div 
                  key={paket.id} 
                  className="group bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white/85 overflow-hidden shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-500 flex flex-col h-full relative hover:-translate-y-1"
                >
                  {/* Foto Utama */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-50 border-b border-neutral-100/40">
                    <Image
                      src={imageUrl}
                      alt={paket.title.rendered}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition duration-700 ease-out"
                    />
                    <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md border border-white/80 px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-wider uppercase text-neutral-800 flex items-center gap-1 shadow-sm">
                      <MapPin size={10} className="text-emerald-600" /> Bojong Rangkas
                    </div>
                  </div>

                  {/* Konten Utama */}
                  <div className="p-6 flex flex-col flex-grow space-y-5 bg-white/40 backdrop-blur-md">
                    <div className="space-y-2 flex-grow">
                      {/* Badge Kategori & Durasi */}
                      <div className="flex flex-wrap gap-2 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                        <span className="inline-flex items-center gap-1 bg-white/80 backdrop-blur-md border border-neutral-200/60 px-2.5 py-1 rounded-lg">
                          <Calendar size={11} className="text-emerald-600" /> {paket.acf?.durasi_paket || "-"}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-white/80 backdrop-blur-md border border-neutral-200/60 px-2.5 py-1 rounded-lg">
                          <Users size={11} className="text-emerald-600" /> Min. {paket.acf?.minimal_peserta || 0} Pax
                        </span>
                      </div>

                      <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-tight group-hover:text-emerald-600 transition pt-1 truncate">
                        {paket.title.rendered}
                      </h2>
                    </div>

                    {/* Harga & Tombol */}
                    <div className="flex items-center justify-between pt-4 border-t border-neutral-100/60 mt-auto">
                      <div>
                        <p className="text-[9px] text-neutral-400 uppercase font-bold tracking-widest">Mulai Dari</p>
                        <p className="text-xs font-bold text-neutral-900 tracking-tight">
                          Rp. {Number(paket.acf?.harga_minimal || 0).toLocaleString("id-ID")}
                          <span className="text-[10px] text-neutral-400 font-normal tracking-normal">/pax</span>
                        </p>
                      </div>

                      <Link 
                        href={`/paket/${paket.slug}`}
                        className="inline-flex items-center gap-1.5 bg-neutral-900 group-hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
                      >
                        Detail <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}