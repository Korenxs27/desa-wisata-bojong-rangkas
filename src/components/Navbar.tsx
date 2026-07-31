"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search, User, LogIn, LogOut, Menu, X } from "lucide-react";
import SearchModal from "./SearchModal";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 🔄 STATE STATUS LOGIN & AVATAR
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  useEffect(() => {
    // Scroll Handler
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);

    // 🔍 PENGECEKAN SESSION & AVATAR
    const adminToken = localStorage.getItem("admin_token");
    const userToken = localStorage.getItem("user_token");
    const role = localStorage.getItem("user_role");
    const name = localStorage.getItem("user_name");
    const avatar = localStorage.getItem("user_avatar");

    if (adminToken) {
      setIsLoggedIn(true);
      setUserRole("admin");
      setUserName("Administrator");
      setUserAvatar(null);
    } else if (userToken) {
      setIsLoggedIn(true);
      setUserRole(role || "subscriber");
      setUserName(name || "Pengunjung");
      setUserAvatar(avatar || null);
    } else {
      setIsLoggedIn(false);
      setUserRole("");
      setUserName("");
      setUserAvatar(null);
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // 🚪 FUNGSI LOGOUT AMAN
  const handleLogout = () => {
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_avatar");

    setIsLoggedIn(false);
    setUserRole("");
    setUserName("");
    setUserAvatar(null);
    setIsMobileMenuOpen(false);
    
    router.push("/login");
    router.refresh();
  };

  if (pathname === "/login" || pathname.startsWith("/admin")) {
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
      <div className="h-28 absolute top-0 left-0 w-full pointer-events-none" />

      <header
        className={`fixed left-0 right-0 z-[999] mx-auto transition-all duration-700 [transition-timing-function:cubic-bezier(0.175,0.885,0.32,1.275)] px-4 sm:px-6 py-3.5 shadow-[0_10px_35px_rgba(0,0,0,0.05)] rounded-full bg-white/[0.22] backdrop-blur-xl backdrop-saturate-150 border border-white/30 max-w-7xl w-[95%] ${
          isScrolled ? "top-4" : "top-6"
        }`}
      >
        <div className="flex items-center justify-between w-full relative">
          
          {/* LEFT: LOGO */}
          <Link href="/" className="flex items-center shrink-0 transition-transform duration-300 hover:scale-105">
            <div className="w-10 h-10 rounded-full bg-white p-1.5 shadow-sm flex items-center justify-center border border-neutral-200/40 relative">
              <div className="relative w-full h-full">
               <Image
  src="/images/logo.png" 
  alt="Logo Desa"
  fill
  priority
  sizes="(max-width: 768px) 120px, 150px"
  className="object-contain"
/>
              </div>
            </div>
          </Link>

          {/* CENTER: DESKTOP NAV MENU */}
          <nav className="hidden lg:flex items-center gap-1.5 lg:gap-3">
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

          {/* RIGHT: SEARCH & AUTH BUTTON */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div 
              onClick={() => setIsSearchOpen(true)}
              className="hidden sm:flex items-center justify-between w-32 md:w-40 px-4 py-2 bg-slate-900/5 border border-slate-900/10 hover:bg-slate-900/10 rounded-full cursor-pointer transition gap-2 group text-slate-800"
            >
              <span className="text-[11px] font-medium">Cari...</span>
              <Search size={13} className="transition text-slate-600 group-hover:text-emerald-600" />
            </div>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="sm:hidden p-2 rounded-full bg-slate-900/5 text-slate-800 transition"
              title="Cari"
            >
              <Search size={14} />
            </button>

            {/* DESKTOP AUTH */}
            <div className="hidden sm:flex items-center gap-2">
              {!isLoggedIn ? (
                <Link
                  href="/login"
                  className="text-[11px] font-bold text-white uppercase tracking-wider px-5 py-2.5 rounded-full shadow-sm hover:scale-105 active:scale-95 bg-emerald-600 hover:bg-emerald-700 transition flex items-center gap-1.5"
                >
                  <LogIn size={13} /> Login
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href={userRole === "admin" ? "/admin" : "/user/dashboard"}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 hover:bg-emerald-500/20 transition hover:scale-105 active:scale-95"
                    title={`Dashboard ${userName}`}
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white overflow-hidden flex items-center justify-center text-[10px] shrink-0 border border-emerald-400">
                      {userAvatar ? (
                        <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User size={12} />
                      )}
                    </div>
                    <span className="text-[11px] font-bold max-w-[80px] truncate pr-1">
                      {userName}
                    </span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    title="Keluar"
                    className="p-2 rounded-full bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition"
                  >
                    <LogOut size={13} />
                  </button>
                </div>
              )}
            </div>

            {/* MOBILE HAMBURGER TOGGLE BUTTON */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-full bg-slate-900/5 text-slate-900 hover:bg-slate-900/10 transition"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

        </div>
      </header>

      {/* MOBILE NAVIGATION DRAWER */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-4 top-24 bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-5 z-[998] animate-in fade-in zoom-in-95 duration-200">
          
          {/* Status Akun di Mobile Menu */}
          {isLoggedIn ? (
            <div className="flex items-center justify-between p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
              <Link 
                href={userRole === "admin" ? "/admin" : "/user/dashboard"}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white overflow-hidden flex items-center justify-center font-bold shadow-sm border border-emerald-400">
                  {userAvatar ? (
                    <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={18} />
                  )}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 block">Akun Aktif</span>
                  <span className="text-xs font-black text-slate-900">{userName}</span>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition flex items-center gap-1 text-xs font-bold"
                title="Keluar"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-sm flex items-center justify-center gap-2 transition"
            >
              <LogIn size={15} /> Login / Masuk Akun
            </Link>
          )}

          {/* Daftar Menu Navigasi Mobile */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-xs font-bold text-slate-700 hover:text-emerald-600 hover:bg-slate-50 p-3 rounded-xl transition"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}