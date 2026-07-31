import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Users, Bed } from "lucide-react";
import { HomestayWarga } from "@/types/homestay";

export default async function KatalogHomestayPage() {
  const res = await fetch("https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wp/v2/homestay?_embed", {
    cache: "no-store",
  });
  const homestayList: HomestayWarga[] = await res.json();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30 text-neutral-800 antialiased pt-36 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Soft Glassy Glow Effects */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-teal-300/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        
        {/* Header (Centered) */}
        <div className="space-y-3 text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-sm text-emerald-700 text-[10px] font-extrabold uppercase tracking-widest">
            <span>🏡</span> Hunian Otentik Warga
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-normal tracking-tight text-neutral-900">
            Homestay Desa Bojong Rangkas
          </h1>
          <p className="text-xs text-neutral-500 font-light leading-relaxed">
            Merasakan kehangatan dan keramahan warga lokal dengan menginap langsung di hunian asri pedesaan.
          </p>
        </div>

        {/* Grid List */}
        {homestayList.length === 0 ? (
          <div className="text-center py-24 bg-white/70 backdrop-blur-xl border border-white/85 rounded-[2.5rem] text-xs text-neutral-400 font-light shadow-sm max-w-md mx-auto">
            Belum ada homestay yang tersedia saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {homestayList.map((item: HomestayWarga) => {
              const mediaEmbed = item._embedded?.["wp:featuredmedia"]?.[0];
              const imageUrl = mediaEmbed?.source_url || "/placeholder-home.jpg";

              return (
                <div 
                  key={item.id} 
                  className="group bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white/85 overflow-hidden shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-500 flex flex-col h-full relative hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-50 border-b border-neutral-100/40">
                    <Image
                      src={imageUrl}
                      alt={item.title.rendered}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition duration-700 ease-out"
                    />
                  </div>

                  <div className="p-6 flex flex-col flex-grow space-y-5 bg-white/40 backdrop-blur-md">
                    <div className="space-y-2 flex-grow">
                      <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-tight group-hover:text-emerald-600 transition truncate">
                        {item.title.rendered}
                      </h2>
                      <p className="text-[11px] text-neutral-400 font-light">
                        Pemilik: {item.acf?.nama_pemilik || "-"}
                      </p>

                      <div className="flex items-center gap-4 pt-2 text-xs text-neutral-500 font-light">
                        <span className="flex items-center gap-1">
                          <Users size={14} className="text-emerald-600" /> Max {item.acf?.kapasitas_maksimal || 0} Tamu
                        </span>
                        <span className="flex items-center gap-1">
                          <Bed size={14} className="text-emerald-600" /> {item.acf?.jumlah_kamar_tersedia || 0} Kamar Tersedia
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-neutral-100/60 mt-auto">
                      <div>
                        <p className="text-[9px] text-neutral-400 uppercase font-bold tracking-widest">Tarif Sewa</p>
                        <p className="text-xs font-bold text-neutral-900 tracking-tight">
                          {typeof item.acf?.harga_per_malam === "string" && isNaN(Number(item.acf.harga_per_malam))
                            ? item.acf.harga_per_malam 
                            : `Rp. ${Number(item.acf?.harga_per_malam || 0).toLocaleString("id-ID")}`}
                          <span className="text-[10px] text-neutral-400 font-normal"> /malam</span>
                        </p>
                      </div>

                      <Link 
                        href={`/homestay/${item.slug}`}
                        className="inline-flex items-center gap-1.5 bg-neutral-900 group-hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
                      >
                        Detail Sewa <ArrowRight size={12} />
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