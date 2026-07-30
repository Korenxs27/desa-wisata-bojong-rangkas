"use client";

import Image from "next/image";
import { Images, MessageSquare, Star } from "lucide-react";

export default function HomeMarquee() {
  const dokumentasiList = [
    { id: 1, title: "Gunung Kapur", img: "/images/kapur.jpg" },
    { id: 2, title: "Workshop Kerajinan Tas", img: "/images/tas.png" },
    { id: 3, title: "Edukasi Rumah Kopi", img: "/images/roti.png" },
    { id: 4, title: "Puncak Batu Roti", img: "/images/puncak batu roti.jpg" }
  ];

  const reviewList = [
    { id: 1, name: "Ahmad Faqih", role: "Wisatawan", text: "Tempatnya asri banget cukk, homestay warganya bersih dan pelayanannya ramah pol. Next time pasti bakal ke sini lagi!", rating: 5 },
    { id: 2, name: "Siti Rahma", role: "Pengunjung Edukasi", text: "Paket wisata edukasinya seru dan interaktif. Pas buat bawa anak-anak atau rombongan sekolah belajar alam.", rating: 5 },
    { id: 3, name: "Budi Santoso", role: "Fotografer", text: "Spot foto landscape di Bojongrangkas juara banget. Warga lokalnya juga sangat membantu selama proses hunting foto.", rating: 4 },
    { id: 4, name: "Dika Pratama", role: "Backpacker", text: "Akses pemesanan via web gampang banget. Ditambah tracking wisatanya menantang tapi seru abis!", rating: 5 },
    { id: 5, name: "Laras Utami", role: "Wisatawan Keluarga", text: "Fasilitas penunjangnya lengkap, ada wifi dan keamanannya bikin tenang pas bawa anak kecil liburan.", rating: 5 },
    { id: 6, name: "Hendra Wijaya", role: "Rombongan Kantor", text: "Tempat gathering terbaik! Paket kulinernya juara, produk UMKM kopi desanya bener-bener harum original.", rating: 5 }
  ];

  const doubleDokumentasi = [...dokumentasiList, ...dokumentasiList, ...dokumentasiList];
  const doubleReview = [...reviewList, ...reviewList];

  return (
    <div className="space-y-24 mt-24">

      {/* 💬 REVIEW USER */}
      <section className="space-y-6">
        <div className="max-w-6xl mx-auto px-6 space-y-1">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest block flex items-center gap-1">
            <MessageSquare size={12}/> Testimoni Wisatawan
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900 uppercase">Apa Kata Mereka?</h2>
        </div>

        <div className="w-full overflow-hidden relative py-4">
          <div className="flex gap-6 w-max animate-marquee hover:[animation-play-state:paused] cursor-pointer">
            {doubleReview.map((item, index) => (
              <div key={`rev-${index}`} className="w-[85vw] sm:w-[45vw] lg:w-[28vw] shrink-0">
                <div className="bg-white border border-neutral-200/70 p-6 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex flex-col justify-between h-full space-y-4 hover:border-emerald-500/30 transition duration-300">
                  <div className="flex gap-0.5">
                    {[...Array(item.rating)].map((_, idx) => (
                      <Star key={idx} size={14} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-neutral-500 italic leading-relaxed font-light">"{item.text}"</p>
                  <div className="border-t border-neutral-100 pt-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center font-bold text-xs text-emerald-600">
                      {item.name[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-800">{item.name}</h4>
                      <span className="text-[10px] text-neutral-400 font-light block">{item.role}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}