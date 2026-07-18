"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, User } from "lucide-react";
import SearchModal from "./SearchModal";

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🚀 KONDISI PINTAR: Jika URL saat ini adalah "/login", navbar ngumpet total cukk
  if (pathname === "/login") {
    return null;
  }

  const menuItems = [
    { name: "Beranda", href: "/" },
    { name: "Profil Desa", href: "/profil" },
    { name: "Wisata", href: "/wisata" },
    { name: "Homestay", href: "/homestay" },
    { name: "Paket Wisata", href: "/paket" },
    { name: "UMKM", href: "/umkm" },
    { name: "Gallery", href: "/gallery" },
    { name: "Kontak", href: "/kontak" },
  ];

  return (
    <>
      {/* Spacer pengaman atas agar konten hero tidak tertutup */}
      <div className="h-28 absolute top-0 left-0 w-full pointer-events-none" />

      <header
        className={`fixed left-0 right-0 z-[999] mx-auto transition-all duration-700 [transition-timing-function:cubic-bezier(0.175,0.885,0.32,1.275)] px-6 py-3.5 shadow-[0_10px_35px_rgba(0,0,0,0.05)] rounded-full bg-white/[0.22] backdrop-blur-xl backdrop-saturate-150 border border-white/30 max-w-7xl w-[95%] ${
          isScrolled ? "top-4" : "top-6"
        }`}
      >
        <div className="flex items-center justify-between w-full relative">
          
          {/* 🖼️ LEFT: LOGO BULAT BERSIH */}
          <Link href="/" className="flex items-center shrink-0 transition-transform duration-300 hover:scale-105">
            <div className="w-10 h-10 rounded-full bg-white p-1.5 shadow-sm flex items-center justify-center border border-neutral-200/40 relative">
              <div className="relative w-full h-full">
                <Image
                  src="/images/logo.png" 
                  alt="Logo Desa"
                  fill
                  priority
                  className="object-contain"
                />
              </div>
            </div>
          </Link>

          {/* 🧭 CENTER: NAV MENU (Kunci warna teks selalu gelap solid cukk) */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-3">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-[11px] lg:text-[12px] font-bold tracking-wide px-3.5 py-2 rounded-full transition-all duration-300 text-slate-900 hover:text-emerald-600 hover:bg-slate-900/5 whitespace-nowrap"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* 🛠️ RIGHT: BAR SEARCH KAPSUL & BUTTON LOGIN HIJAU */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Input Bar Palsu Pemicu Modal Search (Selalu warna gelap agar kelihatan jelas) */}
            <div 
              onClick={() => setIsSearchOpen(true)}
              className="hidden sm:flex items-center justify-between w-40 px-4 py-2 bg-slate-900/5 border border-slate-900/10 hover:bg-slate-900/10 rounded-full cursor-pointer transition gap-2 group text-slate-800"
            >
              <span className="text-[11px] font-medium">Cari...</span>
              <Search size={13} className="transition text-slate-600 group-hover:text-emerald-600" />
            </div>

            {/* Tombol Search Versi Mobile */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="sm:hidden p-2 rounded-full bg-slate-900/5 text-slate-800 transition"
            >
              <Search size={13} />
            </button>

            {/* Login Luxury Button */}
            <Link
              href="/login"
              className="text-[11px] font-bold text-white uppercase tracking-wider px-5 py-2.5 rounded-full shadow-sm hover:scale-102 active:scale-98 bg-emerald-600 hover:bg-emerald-700 transition flex items-center gap-1.5"
            >
              <User size={12} /> Login
            </Link>
          </div>

        </div>
      </header>

      {/* Modal Engine Search */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}