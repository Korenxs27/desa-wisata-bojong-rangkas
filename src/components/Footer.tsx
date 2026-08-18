"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Mail, Phone, MapPin, Landmark, Heart } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // 🚀 PROTEKSI OTOMATIS: Jika sedang di halaman login, footer tersembunyi total
 if (pathname === "/login" || pathname.startsWith("/admin")) {
    return null;
  }

  const linksMasyarakat = [
    { name: "Profil Desa", href: "/profil" },
    { name: "Galeri Visual", href: "/gallery" },
    { name: "Hubungi Kami", href: "/kontak" },
  ];

  const linksKonten = [
    { name: "Destinasi Wisata", href: "/wisata" },
    { name: "Homestay Warga", href: "/homestay" },
    { name: "Paket Wisata", href: "/paket" },
    { name: "Katalog UMKM", href: "/umkm" },
  ];

  return (
    <footer className="bg-[#0B1220] text-neutral-400 border-t border-white/[0.05] selection:bg-emerald-800 selection:text-emerald-100">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8 grid grid-cols-1 md:grid-cols-12 gap-10">
        
        {/* Kolom 1: Brand Info (4/12) */}
        <div className="md:col-span-4 space-y-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-white p-1 shadow-sm flex items-center justify-center relative">
              <Image src="/images/logo.png" alt="Logo Desa" fill className="object-contain p-1" />
            </div>
            <span className="font-black uppercase tracking-wider text-xs text-white">
              Bojong Rangkas
            </span>
          </Link>
          <p className="text-[11px] leading-relaxed font-light text-neutral-500 max-w-sm">
            Portal ekosistem digital resmi Desa Wisata Bojong Rangkas. Mengintegrasikan tata kelola pariwisata terpadu, homestay, dan komoditas UMKM lokal menuju panggung ekonomi kreatif berkelanjutan.
          </p>
        </div>

        {/* Kolom 2: Tautan Kelembagaan (2/12) */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-white flex items-center gap-1">
            <Landmark size={12} className="text-emerald-500" /> Informasi
          </h4>
          <ul className="space-y-2 text-[11px] font-light">
            {linksMasyarakat.map((item) => (
              <li key={item.name}>
                <Link href={item.href} className="hover:text-emerald-400 transition duration-200">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Kolom 3: Tautan Fitur (3/12) */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-white">Eksplorasi</h4>
          <ul className="space-y-2 text-[11px] font-light">
            {linksKonten.map((item) => (
              <li key={item.name}>
                <Link href={item.href} className="hover:text-emerald-400 transition duration-200">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Kolom 4: Sekretariat (3/12) */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-white">Informasi</h4>
          <ul className="space-y-2.5 text-[11px] font-light text-neutral-500">
            <li className="flex gap-2 items-start">
              <MapPin size={14} className="text-emerald-500 shrink-0 mt-0.5" />
              <span>Kecamatan Ciampea, Kabupaten Bogor, Jawa Barat.</span>
            </li>
            <li className="flex gap-2 items-center">
              <Phone size={14} className="text-emerald-500 shrink-0" />
              <span>+62 8123456789</span>
            </li>
            <li className="flex gap-2 items-center">
              <Mail size={14} className="text-emerald-500 shrink-0" />
              <span>desawisatabojongrangkas@gmail.com</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Baris Hak Cipta Bawah */}
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-white/[0.03] flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-neutral-600 font-light">
        <p>© {new Date().getFullYear()}Desa Wisata Bojong Rangkas. Hak Cipta Dilindungi.</p>
      </div>
    </footer>
  );
}