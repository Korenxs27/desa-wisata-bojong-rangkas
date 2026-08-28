"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Compass, Home, ShoppingBag, MapPin, ChevronLeft, ChevronRight, ArrowUpRight, Tag, User, Image as ImageIcon, Loader2, X, Play, ZoomIn, ZoomOut, Film, Bookmark, CheckCircle2, Trash2 } from "lucide-react";
import HomeMarquee from "./HomeMarquee"; 

// =========================================================================
// KOMPONEN TOMBOL BOOKMARK DENGAN NOTIFIKASI TOAST MODERN & BERANIMASI
// =========================================================================
function BookmarkButton({ item, onNotify }: { item: { id: any, title: string, slug: string, type: string, image: string }, onNotify: (msg: string, type: 'add' | 'remove') => void }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userEmail = localStorage.getItem('user_email');
    if (!userEmail) return;
    
    const saved = localStorage.getItem(`wishlist_${userEmail}`);
    if (saved) {
      try {
        const list = JSON.parse(saved);
        if (list.some((b: any) => b.id == item.id && b.type == item.type)) {
          setIsBookmarked(true);
        }
      } catch (e) {
        console.error("Gagal parsing wishlist lokal:", e);
      }
    }
  }, [item]);

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const userEmail = localStorage.getItem('user_email');
    if (!userEmail) {
      onNotify("Silakan login terlebih dahulu untuk menyimpan ke favorit.", "remove");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("https://desa-wisata-bojongrangkas.com/wp-json/wc-bridge/v1/toggle-bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, item })
      });
      const data = await res.json();

      if (data.success) {
        const newStatus = data.status === 'added';
        setIsBookmarked(newStatus);
        localStorage.setItem(`wishlist_${userEmail}`, JSON.stringify(data.bookmarks));
        
        if (newStatus) {
          onNotify(`"${item.title}" berhasil ditambahkan ke Favorit.`, "add");
        } else {
          onNotify(`"${item.title}" dihapus dari Favorit.`, "remove");
        }
      }
    } catch (err) {
      console.error("Gagal mengubah bookmark:", err);
      onNotify("Terjadi kesalahan jaringan.", "remove");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleToggleBookmark}
      className={`p-2.5 rounded-full backdrop-blur-md transition shadow-md cursor-pointer transform active:scale-90 duration-200 ${
        isBookmarked ? 'bg-rose-500 text-white' : 'bg-white/80 hover:bg-white text-slate-700'
      }`}
      title={isBookmarked ? "Hapus dari Favorit" : "Simpan ke Favorit"}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Bookmark size={14} fill={isBookmarked ? "white" : "none"} />}
    </button>
  );
}

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  
  // State Toast Notifikasi Modern
  const [toast, setToast] = useState<{ show: boolean, message: string, type: 'add' | 'remove' }>({
    show: false,
    message: '',
    type: 'add'
  });

  const triggerNotification = (message: string, type: 'add' | 'remove') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3500);
  };
  
  const [heroData, setHeroData] = useState({
    title_line_1: "DESA WISATA",
    title_line_2: "BOJONG RANGKAS",
    description: "Melalui Kemitraan Strategis, kita membangun potensi wisata berkelanjutan serta mendorong ekonomi kreatif demi kesejahteraan masyarakat desa.",
    button_text: "Eksplorasi Destinasi",
    button_url: "#paket-wisata",
    image_url: "/images/bg.png"
  });

  const [sectionOrder, setSectionOrder] = useState<string[]>([
    'paket', 'wisata', 'umkm', 'homestay', 'gallery'
  ]);

  const [sectionTitles, setSectionTitles] = useState<Record<string, string>>({
    paket: "Paket Wisata Terpadu",
    wisata: "Objek Wisata Desa",
    umkm: "Produksi UMKM Unggulan",
    homestay: "Homestay Nyaman Warga",
    gallery: "Dokumentasi Desa Wisata"
  });

  const [paketWisataList, setPaketWisataList] = useState<any[]>([]);
  const [homestayList, setHomestayList] = useState<any[]>([]);
  const [umkmList, setUmkmList] = useState<any[]>([]);
  const [wisataList, setWisataList] = useState<any[]>([]);
  const [galleryList, setGalleryList] = useState<any[]>([]);

  const [selectedMedia, setSelectedMedia] = useState<any | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const paketRef = useRef<HTMLDivElement>(null);
  const homestayRef = useRef<HTMLDivElement>(null);
  const umkmRef = useRef<HTMLDivElement>(null);
  const wisataRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    if (ref.current) {
      const scrollAmount = direction === "left" ? -350 : 350;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const navbars = document.querySelectorAll('nav, header, [role="navigation"]');
    
    if (selectedMedia) {
      document.body.style.overflow = "hidden"; 
      navbars.forEach((nav) => {
        (nav as HTMLElement).style.setProperty('display', 'none', 'important');
      });
    } else {
      document.body.style.overflow = "auto";
      navbars.forEach((nav) => {
        (nav as HTMLElement).style.removeProperty('display');
      });
      setIsZoomed(false); 
    }

    return () => {
      document.body.style.overflow = "auto";
      navbars.forEach((nav) => {
        (nav as HTMLElement).style.removeProperty('display');
      });
    };
  }, [selectedMedia]);

  useEffect(() => {
    async function fetchHomePageData() {
      try {
        const resSettings = await fetch(`https://desa-wisata-bojongrangkas.com/wp-json/wc-bridge/v1/profil-desa?t=${Date.now()}`, { cache: "no-store" });
        const settingsData = await resSettings.json();
        
        if (settingsData && settingsData.success && settingsData.profil) {
          if (settingsData.profil.hero) {
            setHeroData((prev) => ({ ...prev, ...settingsData.profil.hero }));
          }
          if (Array.isArray(settingsData.profil.section_order) && settingsData.profil.section_order.length > 0) {
            setSectionOrder(settingsData.profil.section_order);
          }
          if (settingsData.profil.section_titles) {
            setSectionTitles((prev) => ({ ...prev, ...settingsData.profil.section_titles }));
          }
        }
      } catch (e) {
        console.error("Gagal memuat pengaturan beranda:", e);
      }

      try {
        const resWisata = await fetch("https://desa-wisata-bojongrangkas.com/wp-json/wp/v2/paket_wisata?_embed&per_page=10", { cache: "no-store" });
        const wisataData = await resWisata.json();
        if (Array.isArray(wisataData)) setPaketWisataList(wisataData);
      } catch (e) { console.error(e); }

      try {
        const resHomestay = await fetch("https://desa-wisata-bojongrangkas.com/wp-json/wp/v2/homestay?_embed&per_page=10", { cache: "no-store" });
        const homestayData = await resHomestay.json();
        if (Array.isArray(homestayData)) setHomestayList(homestayData);
      } catch (e) { console.error(e); }

      try {
        const resUmkm = await fetch("https://desa-wisata-bojongrangkas.com/wp-json/wc/store/v1/products?per_page=15", { cache: "no-store" });
        const umkmData = await resUmkm.json();
        
        if (Array.isArray(umkmData)) {
          const cleanUmkm = umkmData.filter((prod: any) => {
            const name = (prod.name || prod.title?.rendered || "").toLowerCase();
            return !name.includes("[booking]") && !name.includes("[homestay]") && !name.includes("[paket]") && !name.includes("[wisata]");
          });
          setUmkmList(cleanUmkm);
        } else {
          const resFallback = await fetch("https://desa-wisata-bojongrangkas.com/wp-json/wp/v2/product?_embed&per_page=20", { cache: "no-store" });
          const fallbackData = await resFallback.json();
          
          if (Array.isArray(fallbackData)) {
            const cleanFallback = fallbackData.filter((prod: any) => {
              const title = (prod.title?.rendered || "").toLowerCase();
              return !title.includes("[booking]") && !title.includes("[homestay]") && !title.includes("[paket]") && !title.includes("[wisata]");
            });
            setUmkmList(cleanFallback);
          }
        }
      } catch (e) { 
        console.error("Gagal memuat produk UMKM:", e); 
      }

      try {
        const resObjek = await fetch("https://desa-wisata-bojongrangkas.com/wp-json/wp/v2/wisata?_embed&per_page=10", { cache: "no-store" });
        const objekData = await resObjek.json();
        if (Array.isArray(objekData)) setWisataList(objekData);
      } catch (e) { console.error(e); }

      try {
        const resGallery = await fetch("https://desa-wisata-bojongrangkas.com/wp-json/wc-bridge/v1/gallery-items", { cache: "no-store" });
        const galleryData = await resGallery.json();
        if (galleryData.success && Array.isArray(galleryData.gallery)) {
          setGalleryList(galleryData.gallery);
        }
      } catch (e) { console.error(e); }

      setLoading(false);
    }

    fetchHomePageData();
  }, []);

  const renderSection = (type: string) => {
    switch (type) {
      case 'paket':
        return (
          <section key="paket" id="paket-wisata" className="max-w-6xl mx-auto px-6 space-y-6">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1"><Compass size={12}/> Jelajahi Paket Pilihan</span>
                <h2 className="text-2xl md:text-3xl font-serif font-normal tracking-tight text-slate-900">{sectionTitles.paket}</h2>
              </div>
              <div className="flex gap-2">
                <button onClick={() => scrollCarousel(paketRef, "left")} className="p-2.5 rounded-full bg-white/85 backdrop-blur-md border border-slate-200/80 hover:bg-white shadow-sm transition cursor-pointer"><ChevronLeft size={18} /></button>
                <button onClick={() => scrollCarousel(paketRef, "right")} className="p-2.5 rounded-full bg-white/85 backdrop-blur-md border border-slate-200/80 hover:bg-white shadow-sm transition cursor-pointer"><ChevronRight size={18} /></button>
              </div>
            </div>
            
            <div ref={paketRef} className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none scroll-smooth">
              {paketWisataList.length > 0 ? (
                paketWisataList.map((item: any) => {
                  const imgUrl = item._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "/placeholder-wisata.jpg";
                  const harga = (item.acf as any)?.harga_minimal || 0;
                  return (
                    <div key={item.id} className="w-[85vw] sm:w-[45vw] lg:w-[28vw] shrink-0 snap-start">
                      <div className="group bg-white/75 backdrop-blur-xl rounded-[2rem] overflow-hidden border border-white/85 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300 flex flex-col h-full justify-between relative">
                        <div className="absolute top-4 right-4 z-10">
                          <BookmarkButton item={{ id: item.id, title: item.title.rendered, slug: `/paket/${item.slug}`, type: 'paket', image: imgUrl }} onNotify={triggerNotification} />
                        </div>
                        <Link href={`/paket/${item.slug}`} className="flex flex-col h-full justify-between">
                          <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                            <Image src={imgUrl} alt={item.title.rendered} fill className="object-cover group-hover:scale-105 transition duration-500" />
                          </div>
                          <div className="p-6 space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight line-clamp-1">{item.title.rendered}</h3>
                            <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs">
                              <span className="text-emerald-600 font-bold">Mulai Rp. {Number(harga).toLocaleString("id-ID")}</span>
                              <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/60 text-slate-600 group-hover:bg-emerald-600 group-hover:text-white transition duration-300">
                                <ArrowUpRight size={14} />
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 italic font-light">Belum ada paket wisata terdaftar.</p>
              )}
            </div>
          </section>
        );

      case 'wisata':
        return (
          <section key="wisata" className="max-w-6xl mx-auto px-6 space-y-6">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1"><MapPin size={12}/> Destinasi Lokal</span>
                <h2 className="text-2xl md:text-3xl font-serif font-normal tracking-tight text-slate-900">{sectionTitles.wisata}</h2>
              </div>
              <div className="flex gap-2">
                <button onClick={() => scrollCarousel(wisataRef, "left")} className="p-2.5 rounded-full bg-white/85 backdrop-blur-md border border-slate-200/80 hover:bg-white shadow-sm transition cursor-pointer"><ChevronLeft size={18} /></button>
                <button onClick={() => scrollCarousel(wisataRef, "right")} className="p-2.5 rounded-full bg-white/85 backdrop-blur-md border border-slate-200/80 hover:bg-white shadow-sm transition cursor-pointer"><ChevronRight size={18} /></button>
              </div>
            </div>

            <div ref={wisataRef} className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none scroll-smooth">
              {wisataList.length > 0 ? (
                wisataList.map((item: any) => {
                  const imgUrl = item._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "/placeholder-wisata.jpg";
                  const harga = (item.acf as any)?.harga_tiket || 0;
                  return (
                    <div key={item.id} className="w-[85vw] sm:w-[45vw] lg:w-[28vw] shrink-0 snap-start">
                      <div className="group bg-white/75 backdrop-blur-xl rounded-[2rem] overflow-hidden border border-white/85 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300 flex flex-col h-full justify-between relative">
                        <div className="absolute top-4 right-4 z-10">
                          <BookmarkButton item={{ id: item.id, title: item.title.rendered, slug: `/wisata/${item.slug}`, type: 'wisata', image: imgUrl }} onNotify={triggerNotification} />
                        </div>
                        <Link href={`/wisata/${item.slug}`} className="flex flex-col h-full justify-between">
                          <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                            <Image src={imgUrl} alt={item.title.rendered} fill className="object-cover group-hover:scale-105 transition duration-500" />
                          </div>
                          <div className="p-6 space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight line-clamp-1">{item.title.rendered}</h3>
                            <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs">
                              <span className="text-emerald-600 font-bold">Rp. {Number(harga).toLocaleString("id-ID")}</span>
                              <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/60 text-slate-600 group-hover:bg-emerald-600 group-hover:text-white transition duration-300">
                                <ArrowUpRight size={14} />
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 italic font-light">Belum ada objek wisata terdaftar.</p>
              )}
            </div>
          </section>
        );

      case 'umkm':
        return (
          <section key="umkm" className="max-w-6xl mx-auto px-6 space-y-6">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1"><ShoppingBag size={12}/> Oleh-Oleh Khas Desa</span>
                <h2 className="text-2xl md:text-3xl font-serif font-normal tracking-tight text-slate-900">{sectionTitles.umkm}</h2>
              </div>
              <div className="flex gap-2">
                <button onClick={() => scrollCarousel(umkmRef, "left")} className="p-2.5 rounded-full bg-white/85 backdrop-blur-md border border-slate-200/80 hover:bg-white shadow-sm transition cursor-pointer"><ChevronLeft size={18} /></button>
                <button onClick={() => scrollCarousel(umkmRef, "right")} className="p-2.5 rounded-full bg-white/85 backdrop-blur-md border border-slate-200/80 hover:bg-white shadow-sm transition cursor-pointer"><ChevronRight size={18} /></button>
              </div>
            </div>

            <div ref={umkmRef} className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none scroll-smooth">
              {umkmList.length > 0 ? (
                umkmList.map((product: any) => {
                  const imgUrl = product.images?.[0]?.src || product.images?.[0]?.thumbnail || product._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "/placeholder-wisata.jpg";
                  const productName = product.name || product.title?.rendered;
                  const productPrice = product.prices?.price || product.price;
                  return (
                    <div key={product.id} className="w-[65vw] sm:w-[35vw] lg:w-[22vw] shrink-0 snap-start">
                      <div className="group bg-white/75 backdrop-blur-xl rounded-[2rem] overflow-hidden border border-white/85 p-5 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition duration-300 flex flex-col justify-between h-full relative">
                        <div className="absolute top-4 right-4 z-10">
                          <BookmarkButton item={{ id: product.id, title: productName, slug: `/umkm/${product.slug}`, type: 'umkm', image: imgUrl }} onNotify={triggerNotification} />
                        </div>
                        <div className="relative aspect-square w-full bg-slate-100 rounded-2xl overflow-hidden mb-4">
                          <Image src={imgUrl} alt={productName || "UMKM"} fill className="object-cover group-hover:scale-105 transition duration-500" />
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-xs font-bold text-slate-900 line-clamp-1 uppercase tracking-tight">{productName}</h3>
                          <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-100">
                            <span className="text-emerald-600 font-bold">{productPrice ? `Rp. ${parseInt(productPrice).toLocaleString("id-ID")}` : "Hubungi Penjual"}</span>
                            <Link href={`/umkm/${product.slug}`} className="text-[10px] bg-slate-900 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider transition flex items-center gap-1 shadow-sm">
                              Detail <Tag size={10} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 italic font-light">Belum ada produk UMKM terdaftar.</p>
              )}
            </div>
          </section>
        );

      case 'homestay':
        return (
          <section key="homestay" className="max-w-6xl mx-auto px-6 space-y-6">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1"><Home size={12}/> Hunian Autentik Warga</span>
                <h2 className="text-2xl md:text-3xl font-serif font-normal tracking-tight text-slate-900">{sectionTitles.homestay}</h2>
              </div>
              <div className="flex gap-2">
                <button onClick={() => scrollCarousel(homestayRef, "left")} className="p-2.5 rounded-full bg-white/85 backdrop-blur-md border border-slate-200/80 hover:bg-white shadow-sm transition cursor-pointer"><ChevronLeft size={18} /></button>
                <button onClick={() => scrollCarousel(homestayRef, "right")} className="p-2.5 rounded-full bg-white/85 backdrop-blur-md border border-slate-200/80 hover:bg-white shadow-sm transition cursor-pointer"><ChevronRight size={18} /></button>
              </div>
            </div>

            <div ref={homestayRef} className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none scroll-smooth">
              {homestayList.length > 0 ? (
                homestayList.map((homestay: any) => {
                  const imgUrl = homestay._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "/placeholder-wisata.jpg";
                  const harga = (homestay.acf as any)?.harga_per_malam || 0;
                  return (
                    <div key={homestay.id} className="w-[85vw] sm:w-[45vw] lg:w-[28vw] shrink-0 snap-start">
                      <div className="group bg-white/75 backdrop-blur-xl rounded-[2rem] overflow-hidden border border-white/85 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300 flex flex-col h-full justify-between relative">
                        <div className="absolute top-4 right-4 z-10">
                          <BookmarkButton item={{ id: homestay.id, title: homestay.title.rendered, slug: `/homestay/${homestay.slug}`, type: 'homestay', image: imgUrl }} onNotify={triggerNotification} />
                        </div>
                        <Link href={`/homestay/${homestay.slug}`} className="flex flex-col h-full justify-between">
                          <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                            <Image src={imgUrl} alt={homestay.title.rendered} fill className="object-cover group-hover:scale-105 transition duration-500" />
                            <div className="absolute bottom-3 left-3 bg-slate-900/70 backdrop-blur-md border border-white/10 text-white text-[9px] px-3 py-1 rounded-lg flex items-center gap-1">
                              <User size={10} /> Pemilik: {(homestay.acf as any)?.nama_pemilik || "-"}
                            </div>
                          </div>
                          <div className="p-6 space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight line-clamp-1">{homestay.title.rendered}</h3>
                            <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs">
                              <div>
                                <span className="text-slate-400 block text-[9px] font-light">Tarif / Malam</span>
                                <span className="text-emerald-600 font-bold text-sm">Rp. {Number(harga).toLocaleString("id-ID")}</span>
                              </div>
                              <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider border border-emerald-500/20">Sewa</span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 italic font-light">Belum ada homestay terdaftar.</p>
              )}
            </div>
          </section>
        );

      case 'gallery':
        return (
          <section key="gallery" className="max-w-6xl mx-auto px-6 space-y-6">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1"><ImageIcon size={12}/> Potret Kegiatan & Suasana</span>
                <h2 className="text-2xl md:text-3xl font-serif font-normal tracking-tight text-slate-900">{sectionTitles.gallery}</h2>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/gallery" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hidden sm:inline-block">
                  Lihat Semua Galeri &rarr;
                </Link>
                <div className="flex gap-2">
                  <button onClick={() => scrollCarousel(galleryRef, "left")} className="p-2.5 rounded-full bg-white/85 backdrop-blur-md border border-slate-200/80 hover:bg-white shadow-sm transition cursor-pointer"><ChevronLeft size={18} /></button>
                  <button onClick={() => scrollCarousel(galleryRef, "right")} className="p-2.5 rounded-full bg-white/85 backdrop-blur-md border border-slate-200/80 hover:bg-white shadow-sm transition cursor-pointer"><ChevronRight size={18} /></button>
                </div>
              </div>
            </div>

            <div ref={galleryRef} className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none scroll-smooth">
              {galleryList.length > 0 ? (
                galleryList.map((item: any) => {
                  const isVideo = item.type === "video" || (item.media_type && item.media_type.includes("video")) || (item.image && item.image.match(/\.(mp4|webm|ogg|mov)$/i));
                  return (
                    <div key={item.id} className="w-[85vw] sm:w-[45vw] lg:w-[28vw] shrink-0 snap-start">
                      <div 
                        onClick={() => {
                          setSelectedMedia(item);
                          setIsZoomed(false);
                        }}
                        className="group bg-white/75 backdrop-blur-xl rounded-[2rem] overflow-hidden border border-white/85 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300 flex flex-col h-full justify-between cursor-pointer"
                      >
                        <div className="relative aspect-[4/3] w-full bg-slate-900 overflow-hidden">
                          {isVideo ? (
                            <>
                              <video src={item.image || item.video_url} className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-80" muted />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-12 bg-emerald-600/90 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition duration-300">
                                  <Play size={20} fill="white" className="ml-0.5" />
                                </div>
                              </div>
                            </>
                          ) : (
                            <Image src={item.image} alt={item.title} fill className="object-cover group-hover:scale-105 transition duration-500" />
                          )}

                          <span className="absolute top-3 left-3 bg-slate-900/75 backdrop-blur-md text-white text-[9px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1">
                            {isVideo ? <Film size={10} /> : <ImageIcon size={10} />} {item.category || (isVideo ? "Video" : "Foto")}
                          </span>
                        </div>
                        <div className="p-5 space-y-1.5 bg-white/60 backdrop-blur-md">
                          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight line-clamp-1">{item.title}</h3>
                          <p className="text-[10px] text-slate-400 font-light">🕒 {item.date}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 italic font-light">Belum ada dokumentasi galeri yang diunggah.</p>
              )}
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
        <span className="ml-2 text-xs text-slate-500 font-medium">Loading...</span>
      </div>
    );
  }

  const isSelectedVideo = selectedMedia && (
    selectedMedia.type === "video" || 
    (selectedMedia.media_type && selectedMedia.media_type.includes("video")) || 
    (selectedMedia.image && selectedMedia.image.match(/\.(mp4|webm|ogg|mov)$/i))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30 text-slate-800 antialiased selection:bg-emerald-500 selection:text-white pb-24 overflow-x-hidden relative">
      
      {/* BACKGROUND GLOW */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-300/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-teal-300/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* MODERN ANIMATED TOAST NOTIFICATION */}
      <div className={`fixed bottom-8 right-8 z-[999999] transition-all duration-500 transform ${
        toast.show ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95 pointer-events-none'
      }`}>
        <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border ${
          toast.type === 'add' 
            ? 'bg-slate-900/90 border-emerald-500/30 text-white' 
            : 'bg-slate-900/90 border-rose-500/30 text-white'
        }`}>
          {toast.type === 'add' ? (
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <Trash2 size={16} />
            </div>
          )}
          <div className="text-xs font-medium tracking-tight">
            {toast.message}
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] w-full flex items-center justify-center px-6 pt-36 pb-20 md:pt-28 overflow-hidden z-10">
        <div className="max-w-7xl w-full mx-auto flex flex-col-reverse md:flex-row items-center gap-12 md:gap-16">
          
          <div className="w-full md:w-1/2 space-y-6 text-center md:text-left flex flex-col items-center md:items-start">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-normal tracking-tight text-slate-900 leading-tight">
              {heroData.title_line_1} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">{heroData.title_line_2}</span>
            </h1>

            <p className="max-w-xl text-xs md:text-sm text-slate-600 font-light leading-relaxed">
              {heroData.description}
            </p>

            <div className="pt-2">
              <Link href={heroData.button_url} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider px-8 py-4 rounded-2xl shadow-xl shadow-emerald-600/20 transition transform hover:scale-102 active:scale-98 inline-block">
                {heroData.button_text}
              </Link>
            </div>
          </div>

          <div className="w-full md:w-1/2 flex justify-center items-center">
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-white/75 backdrop-blur-xl shadow-2xl border border-white/80 group p-2">
              <div className="relative w-full h-full rounded-[2rem] overflow-hidden">
                <Image 
                  src={heroData.image_url || "/images/bg.png"}
                  alt="Pesona Wisata Bojong Rangkas" 
                  fill 
                  priority
                  className="object-cover object-center group-hover:scale-105 transition duration-750 ease-out"
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* RENDER SECTIONS */}
      <div className="space-y-24 mt-12 relative z-10">
        {sectionOrder.map((sectionType) => renderSection(sectionType))}
      </div>

      {/* <div className="mt-24 relative z-10">
        <HomeMarquee />
      </div> */}

      {/* MODAL POPUP MEDIA FULLSCREEN */}
      {selectedMedia && (
        <div className="fixed inset-0 z-[99999] flex flex-col justify-between bg-black/95 backdrop-blur-2xl p-4 md:p-8 animate-in fade-in duration-200">
          
          <div className="flex items-center justify-between w-full max-w-6xl mx-auto text-white">
            <div>
              <span className="text-[10px] font-bold bg-emerald-500 text-white px-3 py-1 rounded-full uppercase tracking-wider">
                {selectedMedia.category || (isSelectedVideo ? "Video Kegiatan" : "Dokumentasi Foto")}
              </span>
              <h3 className="text-base sm:text-xl font-serif font-bold mt-1 text-white">{selectedMedia.title}</h3>
            </div>

            <div className="flex items-center gap-3">
              {!isSelectedVideo && (
                <button 
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition cursor-pointer shadow-lg flex items-center justify-center border border-white/10"
                  title={isZoomed ? "Perkecil" : "Perbesar (Zoom)"}
                >
                  {isZoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
                </button>
              )}
              <button 
                onClick={() => setSelectedMedia(null)}
                className="p-3 rounded-full bg-rose-600/80 hover:bg-rose-600 text-white backdrop-blur-md transition cursor-pointer shadow-lg flex items-center justify-center"
                title="Tutup"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          <div className="relative w-full max-w-5xl mx-auto flex-1 my-4 flex items-center justify-center overflow-auto">
            <div 
              className={`relative transition-transform duration-300 ${isZoomed ? 'scale-150 cursor-zoom-out py-20' : 'scale-100 cursor-zoom-in'} w-full h-[70vh] flex items-center justify-center`}
              onClick={() => !isSelectedVideo && setIsZoomed(!isZoomed)}
            >
              {isSelectedVideo ? (
                <video 
                  src={selectedMedia.image || selectedMedia.video_url} 
                  controls 
                  autoPlay 
                  className="max-h-[70vh] max-w-full object-contain rounded-2xl shadow-2xl"
                />
              ) : (
                <img 
                  src={selectedMedia.image} 
                  alt={selectedMedia.title} 
                  className="max-h-[70vh] max-w-full object-contain rounded-2xl shadow-2xl transition-all duration-300"
                />
              )}
            </div>
          </div>

          <div className="w-full max-w-6xl mx-auto text-center text-xs text-slate-400 font-light">
            🕒 Dipublikasikan pada {selectedMedia.date}
          </div>

        </div>
      )}

    </div>
  );
}