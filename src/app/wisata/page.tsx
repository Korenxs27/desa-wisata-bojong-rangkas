import Link from "next/link";
import Image from "next/image";
import { Compass, ArrowRight, CircleCheck, CircleX } from "lucide-react";
import { ObjekWisata } from "@/types/wisata";

export default async function KatalogWisataPage() {
  const res = await fetch("https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wp/v2/wisata?_embed", {
    cache: "no-store",
  });
  const wisataList: ObjekWisata[] = await res.json();

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-800 antialiased py-16 pt-32 px-4 sm:px-6 lg:px-8 selection:bg-emerald-100">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="space-y-4 text-center md:text-left">
          <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600 bg-emerald-50/60 px-4 py-1.5 rounded-full border border-emerald-100">
            Destinasi Desa
          </span>
          <h1 className="text-4xl md:text-5xl font-light font-serif tracking-tight text-neutral-900">
            Objek Wisata Bojong Rangkas
          </h1>
          <p className="max-w-md text-xs text-neutral-400 font-light leading-relaxed">
            Jelajahi keindahan alam, kekayaan budaya, dan pesona edukasi lokal yang menanti kunjungan Anda.
          </p>
        </div>

        {/* Grid List */}
        {wisataList.length === 0 ? (
          <div className="text-center py-20 bg-white/70 backdrop-blur-md border border-white/80 rounded-3xl text-xs text-neutral-400 font-light">
            Belum ada objek wisata yang terdaftar saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {wisataList.map((wisata: ObjekWisata) => {
              const mediaEmbed = wisata._embedded?.["wp:featuredmedia"]?.[0];
              const imageUrl = mediaEmbed?.source_url || "/placeholder-travel.jpg";

              // 🔍 PEMBACA GANDA ACF (Aman dari error TypeScript)
              const acf = (wisata as any).acf || {};

              const rawPrice = acf.harga ?? acf.harga_tiket ?? 0;
              const cleanPrice = Number(rawPrice);

              const rawStatus = acf.status_buka || acf.status_operasional || "Buka";
              const statusValue = String(rawStatus).trim();
              const isOpen = statusValue.toLowerCase() === "buka";

              return (
                <div 
                  key={wisata.id} 
                  className="group bg-white/70 backdrop-blur-md rounded-[2rem] border border-white/80 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.025)] transition duration-500 flex flex-col h-full relative hover:-translate-y-1"
                >
                  {/* Foto Utama */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-50 border-b border-neutral-100/40">
                    <Image
                      src={imageUrl}
                      alt={wisata.title.rendered}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-103 transition duration-700 ease-out"
                    />
                    <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md border border-white/60 px-3 py-1 rounded-xl text-[10px] font-bold tracking-wider uppercase text-emerald-600 shadow-sm flex items-center gap-1">
                      <Compass size={10} /> {acf.kategori_wisata || "Wisata Alam"}
                    </div>
                  </div>

                  {/* Konten */}
                  <div className="p-6 flex flex-col flex-grow space-y-5">
                    <div className="space-y-2 flex-grow">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isOpen ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        }`}>
                          {isOpen ? <CircleCheck size={10} /> : <CircleX size={10} />}
                          Status: {statusValue}
                        </span>
                      </div>
                      
                      <h2 className="font-medium text-base text-neutral-900 tracking-tight group-hover:text-emerald-600 transition truncate pt-0.5">
                        {wisata.title.rendered}
                      </h2>
                    </div>

                    {/* Harga Tiket & Tombol */}
                    <div className="flex items-center justify-between pt-4 border-t border-neutral-100/60 mt-auto">
                      <div>
                        <p className="text-[9px] text-neutral-400 uppercase font-bold tracking-widest">Tiket Masuk</p>
                        <p className="text-xs font-bold text-neutral-900 tracking-tight">
                          {!isNaN(cleanPrice) && cleanPrice > 0 
                            ? `Rp ${cleanPrice.toLocaleString("id-ID")} /orang`
                            : "Gratis"}
                        </p>
                      </div>

                      <Link 
                        href={`/wisata/${wisata.slug}`}
                        className="inline-flex items-center gap-1.5 bg-neutral-900 group-hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-3 rounded-xl transition shadow-sm"
                      >
                        Lihat Profil <ArrowRight size={12} />
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