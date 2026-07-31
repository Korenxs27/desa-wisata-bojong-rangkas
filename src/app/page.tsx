"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Compass, Home, ShoppingBag, MapPin, ChevronLeft, ChevronRight, ArrowUpRight, Tag, User, Image as ImageIcon, Loader2 } from "lucide-react";
import HomeMarquee from "./HomeMarquee"; 

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  
  // State Hero Section Dinamis
  const [heroData, setHeroData] = useState({
    title_line_1: "DESA WISATA",
    title_line_2: "BOJONG RANGKAS",
    description: "Melalui Kemitraan Strategis, kita membangun potensi wisata berkelanjutan serta mendorong ekonomi kreatif demi kesejahteraan masyarakat desa.",
    button_text: "Eksplorasi Destinasi",
    button_url: "#paket-wisata",
    image_url: "/images/bg.png"
  });

  // State Urutan Section
  const [sectionOrder, setSectionOrder] = useState<string[]>([
    'paket', 'wisata', 'umkm', 'homestay', 'gallery'
  ]);

  // State Kustomisasi Judul Section dari Admin
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

  // Ref untuk carousel
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
    async function fetchHomePageData() {
      try {
        const resSettings = await fetch(`https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wc-bridge/v1/profil-desa?t=${Date.now()}`, { cache: "no-store" });
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

      // 1. Fetch Paket Wisata
      try {
        const resWisata = await fetch("https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wp/v2/paket_wisata?_embed&per_page=10", { cache: "no-store" });
        const wisataData = await resWisata.json();
        if (Array.isArray(wisataData)) setPaketWisataList(wisataData);
      } catch (e) { console.error(e); }

      // 2. Fetch Homestay
      try {
        const resHomestay = await fetch("https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wp/v2/homestay?_embed&per_page=10", { cache: "no-store" });
        const homestayData = await resHomestay.json();
        if (Array.isArray(homestayData)) setHomestayList(homestayData);
      } catch (e) { console.error(e); }

      // 3. Fetch UMKM (Dengan Filter Ketat agar Produk Booking/Homestay tidak ikut nyasar)
      try {
        const resUmkm = await fetch("https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wc/store/v1/products?per_page=15", { cache: "no-store" });
        const umkmData = await resUmkm.json();
        
        if (Array.isArray(umkmData)) {
          const cleanUmkm = umkmData.filter((prod: any) => {
            const name = (prod.name || prod.title?.rendered || "").toLowerCase();
            return !name.includes("[booking]") && !name.includes("[homestay]") && !name.includes("[paket]") && !name.includes("[wisata]");
          });
          setUmkmList(cleanUmkm);
        } else {
          const resFallback = await fetch("https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wp/v2/product?_embed&per_page=20", { cache: "no-store" });
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

      // 4. Fetch Objek Wisata
      try {
        const resObjek = await fetch("https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wp/v2/wisata?_embed&per_page=10", { cache: "no-store" });
        const objekData = await resObjek.json();
        if (Array.isArray(objekData)) setWisataList(objekData);
      } catch (e) { console.error(e); }

      // 5. Fetch Galeri Desa
      try {
        const resGallery = await fetch("https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wc-bridge/v1/gallery-items", { cache: "no-store" });
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
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 uppercase">{sectionTitles.paket}</h2>
              </div>
              <div className="flex gap-2">
                <button onClick={() => scrollCarousel(paketRef, "left")} className="p-2.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/80 hover:bg-white shadow-sm transition cursor-pointer"><ChevronLeft size={18} /></button>
                <button onClick={() => scrollCarousel(paketRef, "right")} className="p-2.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/80 hover:bg-white shadow-sm transition cursor-pointer"><ChevronRight size={18} /></button>
              </div>
            </div>
            
            <div ref={paketRef} className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none scroll-smooth">
              {paketWisataList.length > 0 ? (
                paketWisataList.map((item: any) => {
                  const imgUrl = item._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "/placeholder-wisata.jpg";
                  const harga = (item.acf as any)?.harga_minimal || 0;
                  return (
                    <div key={item.id} className="w-[85vw] sm:w-[45vw] lg:w-[28vw] shrink-0 snap-start">
                      <Link href={`/paket/${item.slug}`} className="group bg-white/70 backdrop-blur-xl rounded-[2rem] overflow-hidden border border-white/85 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300 flex flex-col h-full justify-between">
                        <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                          <Image src={imgUrl} alt={item.title.rendered} fill className="object-cover group-hover:scale-105 transition duration-500" />
                        </div>
                        <div className="p-6 space-y-4">
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight line-clamp-1">{item.title.rendered}</h3>
                          <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs">
                            <span className="text-emerald-600 font-bold">Mulai Rp {Number(harga).toLocaleString("id-ID")}</span>
                            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/60 text-slate-600 group-hover:bg-emerald-600 group-hover:text-white transition duration-300">
                              <ArrowUpRight size={14} />
                            </div>
                          </div>
                        </div>
                      </Link>
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
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 uppercase">{sectionTitles.wisata}</h2>
              </div>
              <div className="flex gap-2">
                <button onClick={() => scrollCarousel(wisataRef, "left")} className="p-2.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/80 hover:bg-white shadow-sm transition cursor-pointer"><ChevronLeft size={18} /></button>
                <button onClick={() => scrollCarousel(wisataRef, "right")} className="p-2.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/80 hover:bg-white shadow-sm transition cursor-pointer"><ChevronRight size={18} /></button>
              </div>
            </div>

            <div ref={wisataRef} className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none scroll-smooth">
              {wisataList.length > 0 ? (
                wisataList.map((item: any) => {
                  const imgUrl = item._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "/placeholder-wisata.jpg";
                  const harga = (item.acf as any)?.harga_tiket || 0;
                  return (
                    <div key={item.id} className="w-[85vw] sm:w-[45vw] lg:w-[28vw] shrink-0 snap-start">
                      <Link href={`/wisata/${item.slug}`} className="group bg-white/70 backdrop-blur-xl rounded-[2rem] overflow-hidden border border-white/85 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300 flex flex-col h-full justify-between">
                        <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                          <Image src={imgUrl} alt={item.title.rendered} fill className="object-cover group-hover:scale-105 transition duration-500" />
                        </div>
                        <div className="p-6 space-y-4">
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight line-clamp-1">{item.title.rendered}</h3>
                          <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs">
                            <span className="text-emerald-600 font-bold">Rp {Number(harga).toLocaleString("id-ID")}</span>
                            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/60 text-slate-600 group-hover:bg-emerald-600 group-hover:text-white transition duration-300">
                              <ArrowUpRight size={14} />
                            </div>
                          </div>
                        </div>
                      </Link>
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
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 uppercase">{sectionTitles.umkm}</h2>
              </div>
              <div className="flex gap-2">
                <button onClick={() => scrollCarousel(umkmRef, "left")} className="p-2.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/80 hover:bg-white shadow-sm transition cursor-pointer"><ChevronLeft size={18} /></button>
                <button onClick={() => scrollCarousel(umkmRef, "right")} className="p-2.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/80 hover:bg-white shadow-sm transition cursor-pointer"><ChevronRight size={18} /></button>
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
                      <div className="group bg-white/70 backdrop-blur-xl rounded-[2rem] overflow-hidden border border-white/85 p-5 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition duration-300 flex flex-col justify-between h-full">
                        <div className="relative aspect-square w-full bg-slate-100 rounded-2xl overflow-hidden mb-4">
                          <Image src={imgUrl} alt={productName || "UMKM"} fill className="object-cover group-hover:scale-105 transition duration-500" />
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-xs font-black text-slate-900 line-clamp-1 uppercase tracking-tight">{productName}</h3>
                          <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-100">
                            <span className="text-emerald-600 font-bold">{productPrice ? `Rp ${parseInt(productPrice).toLocaleString("id-ID")}` : "Hubungi Penjual"}</span>
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
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 uppercase">{sectionTitles.homestay}</h2>
              </div>
              <div className="flex gap-2">
                <button onClick={() => scrollCarousel(homestayRef, "left")} className="p-2.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/80 hover:bg-white shadow-sm transition cursor-pointer"><ChevronLeft size={18} /></button>
                <button onClick={() => scrollCarousel(homestayRef, "right")} className="p-2.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/80 hover:bg-white shadow-sm transition cursor-pointer"><ChevronRight size={18} /></button>
              </div>
            </div>

            <div ref={homestayRef} className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none scroll-smooth">
              {homestayList.length > 0 ? (
                homestayList.map((homestay: any) => {
                  const imgUrl = homestay._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "/placeholder-wisata.jpg";
                  const harga = (homestay.acf as any)?.harga_per_malam || 0;
                  return (
                    <div key={homestay.id} className="w-[85vw] sm:w-[45vw] lg:w-[28vw] shrink-0 snap-start">
                      <Link href={`/homestay/${homestay.slug}`} className="group bg-white/70 backdrop-blur-xl rounded-[2rem] overflow-hidden border border-white/85 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300 flex flex-col h-full justify-between">
                        <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                          <Image src={imgUrl} alt={homestay.title.rendered} fill className="object-cover group-hover:scale-105 transition duration-500" />
                          <div className="absolute bottom-3 left-3 bg-slate-900/70 backdrop-blur-md border border-white/10 text-white text-[9px] px-3 py-1 rounded-lg flex items-center gap-1">
                            <User size={10} /> Pemilik: {(homestay.acf as any)?.nama_pemilik || "-"}
                          </div>
                        </div>
                        <div className="p-6 space-y-4">
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight line-clamp-1">{homestay.title.rendered}</h3>
                          <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs">
                            <div>
                              <span className="text-slate-400 block text-[9px] font-light">Tarif / Malam</span>
                              <span className="text-emerald-600 font-bold text-sm">Rp {Number(harga).toLocaleString("id-ID")}</span>
                            </div>
                            <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider border border-emerald-500/20">Sewa</span>
                          </div>
                        </div>
                      </Link>
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
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 uppercase">{sectionTitles.gallery}</h2>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/gallery" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hidden sm:inline-block">
                  Lihat Semua Galeri &rarr;
                </Link>
                <div className="flex gap-2">
                  <button onClick={() => scrollCarousel(galleryRef, "left")} className="p-2.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/80 hover:bg-white shadow-sm transition cursor-pointer"><ChevronLeft size={18} /></button>
                  <button onClick={() => scrollCarousel(galleryRef, "right")} className="p-2.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/80 hover:bg-white shadow-sm transition cursor-pointer"><ChevronRight size={18} /></button>
                </div>
              </div>
            </div>

            <div ref={galleryRef} className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none scroll-smooth">
              {galleryList.length > 0 ? (
                galleryList.map((item: any) => (
                  <div key={item.id} className="w-[85vw] sm:w-[45vw] lg:w-[28vw] shrink-0 snap-start">
                    <div className="group bg-white/70 backdrop-blur-xl rounded-[2rem] overflow-hidden border border-white/85 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300 flex flex-col h-full justify-between">
                      <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                        <Image src={item.image} alt={item.title} fill className="object-cover group-hover:scale-105 transition duration-500" />
                        <span className="absolute top-3 left-3 bg-slate-900/70 backdrop-blur-md text-white text-[9px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider">
                          {item.category}
                        </span>
                      </div>
                      <div className="p-5 space-y-1.5 bg-white/50">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight line-clamp-1">{item.title}</h3>
                        <p className="text-[10px] text-slate-400 font-light">🕒 {item.date}</p>
                      </div>
                    </div>
                  </div>
                ))
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
        <span className="ml-2 text-xs text-slate-500 font-medium">Memuat Beranda...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30 text-slate-800 antialiased selection:bg-emerald-500 selection:text-white pb-24 overflow-x-hidden relative">
      
      {/* Background Soft Glow Effects (Glassy Luxury Touch) */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-300/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-teal-300/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* HERO SECTION DINAMIS & GLASSY */}
      <section className="relative min-h-[90vh] w-full flex items-center justify-center px-6 pt-36 pb-20 md:pt-28 overflow-hidden z-10">
        <div className="max-w-7xl w-full mx-auto flex flex-col-reverse md:flex-row items-center gap-12 md:gap-16">
          
          <div className="w-full md:w-1/2 space-y-6 text-center md:text-left flex flex-col items-center md:items-start">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-slate-900 leading-tight">
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
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-white/70 backdrop-blur-xl shadow-2xl border border-white/80 group p-2">
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

      {/* RENDER SECTION BERDASARKAN URUTAN & JUDUL DINAMIS DARI ADMIN */}
      <div className="space-y-24 mt-12 relative z-10">
        {sectionOrder.map((sectionType) => renderSection(sectionType))}
      </div>

      <div className="mt-24 relative z-10">
        <HomeMarquee />
      </div>

    </div>
  );
}