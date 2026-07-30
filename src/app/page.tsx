"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Compass, Home, ShoppingBag, MapPin, ChevronLeft, ChevronRight, ArrowUpRight, Tag, User, Image as ImageIcon } from "lucide-react";
import HomeMarquee from "./HomeMarquee"; 

export default function HomePage() {
  const [paketWisataList, setPaketWisataList] = useState<any[]>([]);
  const [homestayList, setHomestayList] = useState<any[]>([]);
  const [umkmList, setUmkmList] = useState<any[]>([]);
  const [wisataList, setWisataList] = useState<any[]>([]);
  const [galleryList, setGalleryList] = useState<any[]>([]);

  // Ref untuk mengontrol scroll carousel kesamping
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
    async function fetchData() {
      // 1. Paket Wisata
      try {
        const resWisata = await fetch("https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wp/v2/paket_wisata?_embed&per_page=10", { cache: "no-store" });
        const wisataData = await resWisata.json();
        if (Array.isArray(wisataData)) setPaketWisataList(wisataData);
      } catch (e) { console.error(e); }

      // 2. Homestay
      try {
        const resHomestay = await fetch("https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wp/v2/homestay?_embed&per_page=10", { cache: "no-store" });
        const homestayData = await resHomestay.json();
        if (Array.isArray(homestayData)) setHomestayList(homestayData);
      } catch (e) { console.error(e); }

      // 3. UMKM
      try {
        const resUmkm = await fetch("https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wc/store/v1/products?per_page=10", { cache: "no-store" });
        const umkmData = await resUmkm.json();
        if (Array.isArray(umkmData)) setUmkmList(umkmData);
      } catch (e) { 
        try {
          const resFallback = await fetch("https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wp/v2/product?_embed&per_page=10", { cache: "no-store" });
          const fallbackData = await resFallback.json();
          if (Array.isArray(fallbackData)) setUmkmList(fallbackData);
        } catch (err) { console.error(err); }
      }

      // 4. Objek Wisata
      try {
        const resObjek = await fetch("https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wp/v2/wisata?_embed&per_page=10", { cache: "no-store" });
        const objekData = await resObjek.json();
        if (Array.isArray(objekData)) setWisataList(objekData);
      } catch (e) { console.error(e); }

      // 5. Galeri Dokumentasi Desa (Terhubung ke Admin Panel)
      try {
        const resGallery = await fetch("https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wc-bridge/v1/gallery-items", { cache: "no-store" });
        const galleryData = await resGallery.json();
        if (galleryData.success && Array.isArray(galleryData.gallery)) {
          setGalleryList(galleryData.gallery);
        }
      } catch (e) { console.error(e); }
    }

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FBFC] text-neutral-800 antialiased selection:bg-emerald-500 selection:text-white pb-24 overflow-x-hidden">
      
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] w-full flex items-center justify-center bg-[#FAFAFA] px-6 pt-32 pb-16 md:pt-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl w-full mx-auto flex flex-col-reverse md:flex-row items-center gap-10 md:gap-16 relative z-10">
          
          <div className="w-full md:w-1/2 space-y-6 text-center md:text-left flex flex-col items-center md:items-start">
            <div className="bg-emerald-50 border border-emerald-100 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider text-emerald-600 uppercase shadow-sm inline-block">
              ✨ Wonderful Bojongrangkas
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-neutral-900 leading-tight">
              DESA WISATA <br />
              <span className="text-emerald-600">BOJONG RANGKAS</span>
            </h1>

            <p className="max-w-xl text-xs md:text-sm text-neutral-500 font-light leading-relaxed">
              Melalui Kemitraan Strategis, kita membangun potensi wisata berkelanjutan serta mendorong ekonomi kreatif demi kesejahteraan masyarakat desa.
            </p>

            <div className="pt-2">
              <Link href="#paket-wisata" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-full shadow-md hover:shadow-emerald-600/20 transition transform hover:scale-102 active:scale-98 inline-block">
                Eksplorasi Destinasi
              </Link>
            </div>
          </div>

          <div className="w-full md:w-1/2 flex justify-center items-center">
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[4/3] rounded-[32px] overflow-hidden bg-neutral-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-neutral-200/50 group">
              <Image 
                src="/images/bg.png"
                alt="Pesona Wisata Bojong Rangkas" 
                fill 
                priority
                className="object-cover object-center group-hover:scale-102 transition duration-750 ease-out"
              />
            </div>
          </div>

        </div>
      </section>

      {/* 1. PAKET WISATA CAROUSEL */}
      <section id="paket-wisata" className="max-w-6xl mx-auto px-6 mt-20 space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest block flex items-center gap-1"><Compass size={12}/> Jelajahi Paket Pilihan</span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900 uppercase">Paket Wisata Terpadu</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scrollCarousel(paketRef, "left")} className="p-2.5 rounded-full bg-white border border-neutral-200 hover:bg-neutral-100 shadow-sm transition"><ChevronLeft size={18} /></button>
            <button onClick={() => scrollCarousel(paketRef, "right")} className="p-2.5 rounded-full bg-white border border-neutral-200 hover:bg-neutral-100 shadow-sm transition"><ChevronRight size={18} /></button>
          </div>
        </div>
        
        <div ref={paketRef} className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none scroll-smooth">
          {paketWisataList.length > 0 ? (
            paketWisataList.map((item: any) => {
              const imgUrl = item._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "/placeholder-wisata.jpg";
              const harga = (item.acf as any)?.harga_minimal || 0;
              return (
                <div key={item.id} className="w-[85vw] sm:w-[45vw] lg:w-[28vw] shrink-0 snap-start">
                  <Link href={`/paket-wisata/${item.slug}`} className="group bg-white rounded-2xl overflow-hidden border border-neutral-200/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full justify-between">
                    <div className="relative aspect-[4/3] w-full bg-neutral-100 overflow-hidden">
                      <Image src={imgUrl} alt={item.title.rendered} fill className="object-cover group-hover:scale-105 transition duration-500" />
                    </div>
                    <div className="p-5 space-y-4">
                      <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-tight line-clamp-1">{item.title.rendered}</h3>
                      <div className="flex justify-between items-center pt-2 border-t border-neutral-100 text-xs">
                        <span className="text-emerald-600 font-bold">Mulai Rp {Number(harga).toLocaleString("id-ID")}</span>
                        <div className="bg-neutral-50 p-1.5 rounded-lg border border-neutral-200 text-neutral-600 group-hover:bg-emerald-600 group-hover:text-white transition duration-300">
                          <ArrowUpRight size={14} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-neutral-400 italic font-light">Belum ada paket wisata terdaftar.</p>
          )}
        </div>
      </section>

      {/* 2. OBJEK WISATA CAROUSEL */}
      <section className="max-w-6xl mx-auto px-6 mt-20 space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest block flex items-center gap-1"><MapPin size={12}/> Destinasi Lokal</span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900 uppercase">Objek Wisata Desa</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scrollCarousel(wisataRef, "left")} className="p-2.5 rounded-full bg-white border border-neutral-200 hover:bg-neutral-100 shadow-sm transition"><ChevronLeft size={18} /></button>
            <button onClick={() => scrollCarousel(wisataRef, "right")} className="p-2.5 rounded-full bg-white border border-neutral-200 hover:bg-neutral-100 shadow-sm transition"><ChevronRight size={18} /></button>
          </div>
        </div>

        <div ref={wisataRef} className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none scroll-smooth">
          {wisataList.length > 0 ? (
            wisataList.map((item: any) => {
              const imgUrl = item._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "/placeholder-wisata.jpg";
              const harga = (item.acf as any)?.harga_tiket || 0;
              return (
                <div key={item.id} className="w-[85vw] sm:w-[45vw] lg:w-[28vw] shrink-0 snap-start">
                  <Link href={`/wisata/${item.slug}`} className="group bg-white rounded-2xl overflow-hidden border border-neutral-200/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full justify-between">
                    <div className="relative aspect-[4/3] w-full bg-neutral-100 overflow-hidden">
                      <Image src={imgUrl} alt={item.title.rendered} fill className="object-cover group-hover:scale-105 transition duration-500" />
                    </div>
                    <div className="p-5 space-y-4">
                      <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-tight line-clamp-1">{item.title.rendered}</h3>
                      <div className="flex justify-between items-center pt-2 border-t border-neutral-100 text-xs">
                        <span className="text-emerald-600 font-bold">Rp {Number(harga).toLocaleString("id-ID")}</span>
                        <div className="bg-neutral-50 p-1.5 rounded-lg border border-neutral-200 text-neutral-600 group-hover:bg-emerald-600 group-hover:text-white transition duration-300">
                          <ArrowUpRight size={14} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-neutral-400 italic font-light">Belum ada objek wisata terdaftar.</p>
          )}
        </div>
      </section>

      {/* 3. UMKM CAROUSEL */}
      <section className="max-w-6xl mx-auto px-6 mt-20 space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest block flex items-center gap-1"><ShoppingBag size={12}/> Oleh-Oleh Khas Desa</span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900 uppercase">Produksi UMKM Unggulan</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scrollCarousel(umkmRef, "left")} className="p-2.5 rounded-full bg-white border border-neutral-200 hover:bg-neutral-100 shadow-sm transition"><ChevronLeft size={18} /></button>
            <button onClick={() => scrollCarousel(umkmRef, "right")} className="p-2.5 rounded-full bg-white border border-neutral-200 hover:bg-neutral-100 shadow-sm transition"><ChevronRight size={18} /></button>
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
                  <div className="group bg-white rounded-2xl overflow-hidden border border-neutral-200/60 p-4 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between h-full">
                    <div className="relative aspect-square w-full bg-neutral-50 rounded-xl overflow-hidden mb-4">
                      <Image src={imgUrl} alt={productName || "UMKM"} fill className="object-cover group-hover:scale-105 transition duration-500" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-neutral-800 line-clamp-1 uppercase tracking-tight">{productName}</h3>
                      <div className="flex justify-between items-center text-xs pt-2 border-t border-neutral-100">
                        <span className="text-emerald-600 font-bold">{productPrice ? `Rp ${parseInt(productPrice).toLocaleString("id-ID")}` : "Hubungi Penjual"}</span>
                        <Link href={`/umkm/${product.slug}`} className="text-[10px] bg-neutral-900 hover:bg-emerald-600 text-white font-bold px-2.5 py-1.5 rounded-lg uppercase tracking-wider transition flex items-center gap-1">
                          Detail <Tag size={10} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-neutral-400 italic font-light">Belum ada produk UMKM terdaftar.</p>
          )}
        </div>
      </section>

      {/* 4. HOMESTAY CAROUSEL */}
      <section className="max-w-6xl mx-auto px-6 mt-20 space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest block flex items-center gap-1"><Home size={12}/> Hunian Autentik Warga</span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900 uppercase">Homestay Nyaman Warga</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scrollCarousel(homestayRef, "left")} className="p-2.5 rounded-full bg-white border border-neutral-200 hover:bg-neutral-100 shadow-sm transition"><ChevronLeft size={18} /></button>
            <button onClick={() => scrollCarousel(homestayRef, "right")} className="p-2.5 rounded-full bg-white border border-neutral-200 hover:bg-neutral-100 shadow-sm transition"><ChevronRight size={18} /></button>
          </div>
        </div>

        <div ref={homestayRef} className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none scroll-smooth">
          {homestayList.length > 0 ? (
            homestayList.map((homestay: any) => {
              const imgUrl = homestay._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "/placeholder-wisata.jpg";
              const harga = (homestay.acf as any)?.harga_per_malam || 0;
              return (
                <div key={homestay.id} className="w-[85vw] sm:w-[45vw] lg:w-[28vw] shrink-0 snap-start">
                  <Link href={`/homestay/${homestay.slug}`} className="group bg-white rounded-2xl overflow-hidden border border-neutral-200/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full justify-between">
                    <div className="relative aspect-[4/3] w-full bg-neutral-100 overflow-hidden">
                      <Image src={imgUrl} alt={homestay.title.rendered} fill className="object-cover group-hover:scale-105 transition duration-500" />
                      <div className="absolute bottom-2.5 left-2.5 bg-black/50 backdrop-blur-md border border-white/10 text-white text-[9px] px-2.5 py-1 rounded-md flex items-center gap-1">
                        <User size={10} /> Pemilik: {(homestay.acf as any)?.nama_pemilik || "-"}
                      </div>
                    </div>
                    <div className="p-5 space-y-4">
                      <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-tight line-clamp-1">{homestay.title.rendered}</h3>
                      <div className="flex justify-between items-center pt-2 border-t border-neutral-100 text-xs">
                        <div>
                          <span className="text-neutral-400 block text-[9px] font-light">Tarif / Malam</span>
                          <span className="text-emerald-600 font-bold text-sm">Rp {Number(harga).toLocaleString("id-ID")}</span>
                        </div>
                        <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider">Sewa</span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-neutral-400 italic font-light">Belum ada homestay terdaftar.</p>
          )}
        </div>
      </section>

      {/* 5. DOKUMENTASI / GALERI DESA CAROUSEL (TERHUBUNG KE ADMIN PANEL) */}
      <section className="max-w-6xl mx-auto px-6 mt-20 space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest block flex items-center gap-1"><ImageIcon size={12}/> Potret Kegiatan & Suasana</span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900 uppercase">Dokumentasi Desa Wisata</h2>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/gallery" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hidden sm:inline-block">
              Lihat Semua Galeri &rarr;
            </Link>
            <div className="flex gap-2">
              <button onClick={() => scrollCarousel(galleryRef, "left")} className="p-2.5 rounded-full bg-white border border-neutral-200 hover:bg-neutral-100 shadow-sm transition"><ChevronLeft size={18} /></button>
              <button onClick={() => scrollCarousel(galleryRef, "right")} className="p-2.5 rounded-full bg-white border border-neutral-200 hover:bg-neutral-100 shadow-sm transition"><ChevronRight size={18} /></button>
            </div>
          </div>
        </div>

        <div ref={galleryRef} className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none scroll-smooth">
          {galleryList.length > 0 ? (
            galleryList.map((item: any) => (
              <div key={item.id} className="w-[85vw] sm:w-[45vw] lg:w-[28vw] shrink-0 snap-start">
                <div className="group bg-white rounded-2xl overflow-hidden border border-neutral-200/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full justify-between">
                  <div className="relative aspect-[4/3] w-full bg-neutral-100 overflow-hidden">
                    <Image src={item.image} alt={item.title} fill className="object-cover group-hover:scale-105 transition duration-500" />
                    <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                  <div className="p-4 space-y-1.5 bg-white">
                    <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-tight line-clamp-1">{item.title}</h3>
                    <p className="text-[10px] text-neutral-400 font-light">🕒 {item.date}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-neutral-400 italic font-light">Belum ada dokumentasi galeri yang diunggah.</p>
          )}
        </div>
      </section>

      <HomeMarquee />

    </div>
  );
}