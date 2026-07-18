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
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-800 antialiased pt-32 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="space-y-4 text-center md:text-left">
          <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600 bg-emerald-50/60 px-4 py-1.5 rounded-full border border-emerald-100">
            Akomodasi Lokal
          </span>
          <h1 className="text-4xl md:text-5xl font-light font-serif tracking-tight text-neutral-900">
            Homestay Desa Bojong Rangkas
          </h1>
          <p className="max-w-md text-xs text-neutral-400 font-light leading-relaxed">
            Merasakan kehangatan dan keramahan warga lokal dengan menginap langsung di hunian asri pedesaan.
          </p>
        </div>

        {/* Grid List */}
        {homestayList.length === 0 ? (
          <div className="text-center py-20 bg-white/70 backdrop-blur-md border border-white/80 rounded-3xl text-xs text-neutral-400 font-light">
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
                  className="group bg-white/70 backdrop-blur-md rounded-[2rem] border border-white/80 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.025)] transition duration-500 flex flex-col h-full relative hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-50 border-b border-neutral-100/40">
                    <Image
                      src={imageUrl}
                      alt={item.title.rendered}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-103 transition duration-700 ease-out"
                    />
                  </div>

                  <div className="p-6 flex flex-col flex-grow space-y-5">
                    <div className="space-y-2 flex-grow">
                      <h2 className="font-medium text-base text-neutral-900 tracking-tight group-hover:text-emerald-600 transition truncate">
                        {item.title.rendered}
                      </h2>
                      <p className="text-[11px] text-neutral-400 font-light">
                        Pemilik: {item.acf?.nama_pemilik || "-"}
                      </p>

                      <div className="flex items-center gap-4 pt-2 text-xs text-neutral-500 font-light">
                        <span className="flex items-center gap-1">
                          <Users size={14} className="text-neutral-400" /> Max {item.acf?.kapasitas_maksimal || 0} Tamu
                        </span>
                        <span className="flex items-center gap-1">
                          <Bed size={14} className="text-neutral-400" /> {item.acf?.jumlah_kamar_tersedia || 0} Kamar Tersedia
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-neutral-100/60 mt-auto">
                      <div>
                        <p className="text-[9px] text-neutral-400 uppercase font-bold tracking-widest">Tarif Sewa</p>
                        <p className="text-xs font-bold text-neutral-900 tracking-tight">
                          {typeof item.acf?.harga_per_malam === "string" 
                            ? item.acf.harga_per_malam 
                            : `Rp ${Number(item.acf?.harga_per_malam || 0).toLocaleString("id-ID")}`}
                          <span className="text-[10px] text-neutral-400 font-normal"> /malam</span>
                        </p>
                      </div>

                      <Link 
                        href={`/homestay/${item.slug}`}
                        className="inline-flex items-center gap-1.5 bg-neutral-900 group-hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-3 rounded-xl transition shadow-sm"
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