import Link from "next/link";
import Image from "next/image";
import { Compass, Home, ShoppingBag, CheckCircle2, ArrowUpRight, Tag, User } from "lucide-react";
import HomeMarquee from "./HomeMarquee"; // Pastikan path impor mengarah ke komponen marquee lu cukk
import { api as wcApi } from "@/lib/woocommerce";

export default async function HomePage() {
  let paketWisataList = [];
  let homestayList = [];
  let umkmList = [];

  try {
    // 1. Ambil data Wisata & Homestay (Post Biasa/CPT) dan data UMKM (via WooCommerce API) secara paralel
    const [resWisata, resHomestay, responseUmkm] = await Promise.all([
      fetch("https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wp/v2/wisata?_embed&per_page=6", { cache: "no-store" }),
      fetch("https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wp/v2/homestay?_embed&per_page=6", { cache: "no-store" }),
      // Fetch WooCommerce pake category id 70 yang lu punya
      wcApi.get("products", {
        category: "70",
        per_page: 6
      })
    ]);

    paketWisataList = await resWisata.json();
    homestayList = await resHomestay.json();
    
    // Samakan handling data WooCommerce seperti di halaman katalog lu
    umkmList = responseUmkm.data || responseUmkm;
  } catch (error) {
    console.error("Gagal fetching data di beranda utama:", error);
  }

  return (
    <div className="min-h-screen bg-[#F9FBFC] text-neutral-800 antialiased selection:bg-emerald-500 selection:text-white pb-24 overflow-x-hidden">
      
      {/* 🏛️ SECTION 1: HERO SECTION (Split Screen Layout - Anti Mepet & Kontras) */}
      <section className="relative min-h-screen w-full flex items-center justify-center bg-[#FAFAFA] px-6 pt-32 pb-16 md:pt-20 overflow-hidden selection:bg-emerald-100">
        
        {/* Ornamen Luxury Background (Pemanis biar gak sepi) */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />

        {/* 📦 CONTAINER UTAMA GRID RESPONSIF */}
        <div className="max-w-7xl w-full mx-auto flex flex-col-reverse md:flex-row items-center gap-10 md:gap-16 relative z-10">
          
          {/* 📝 SEBELAH KIRI (ATAS PAS DI MOBILE): KONTEN TEKS */}
          <div className="w-full md:w-1/2 space-y-6 text-center md:text-left flex flex-col items-center md:items-start">
            
            {/* Tag Lencana Wonderful */}
            <div className="bg-emerald-50 border border-emerald-100 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider text-emerald-600 uppercase shadow-sm inline-block">
              ✨ Wonderful Bojongrangkas
            </div>

            {/* Judul Utama */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-neutral-900 leading-tight">
              Desa Wisata <br />
              <span className="text-emerald-600">Bojong Rangkas</span>
            </h1>

            {/* Subtitle / Deskripsi */}
            <p className="max-w-xl text-xs md:text-sm text-neutral-500 font-light leading-relaxed">
              Melalui Kemitraan Strategis, kita membangun potensi wisata berkelanjutan serta mendorong ekonomi kreatif demi kesejahteraan masyarakat desa.
            </p>

            {/* Tombol Aksi */}
            <div className="pt-2">
              <Link href="#paket-wisata" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-full shadow-md hover:shadow-emerald-600/20 transition transform hover:scale-102 active:scale-98 inline-block">
                Eksplorasi Destinasi
              </Link>
            </div>

          </div>

          {/* 🖼️ SEBELAH KANAN (ATAS PAS DI MOBILE): BINGKAI GAMBAR PREMIUM */}
          <div className="w-full md:w-1/2 flex justify-center items-center">
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[4/3] rounded-[32px] overflow-hidden bg-neutral-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-neutral-200/50 group">
              <Image 
                src="/images/bg.png"
                alt="Pesona Wisata Bojong Rangkas" 
                fill 
                priority
                className="object-cover object-center group-hover:scale-102 transition duration-750 ease-out"
              />
              {/* Lapisan bayangan halus di sisi bawah gambar biar dapet depth luxury */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

        </div>
      </section>

      {/* ⚡ SECTION 2: FASILITAS PENUNJANG (Dark Glassy Luxury) */}
      <section className="max-w-6xl mx-auto px-6 mt-12">
        <div className="bg-[#0B1220] text-white rounded-3xl p-8 md:p-12 space-y-10 shadow-xl relative overflow-hidden border border-white/[0.05]">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="text-center space-y-2">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Kenyamanan Pengunjung</span>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-wide">Fasilitas Penunjang</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {[
              { title: "Akses Transportasi", desc: "Aksesibilitas jalan utama desa aman & nyaman untuk semua jenis kendaraan keluarga." },
              { title: "Keamanan 24/7", desc: "Keamanan terjamin terpadu dari linmas desa dan karang taruna setempat." },
              { title: "Pusat Informasi", desc: "Pusat bantuan pemandu lokal tersedia sepanjang hari di sekretariat." },
              { title: "Koneksi Wifi", desc: "Fasilitas internet wifi terintegrasi tersedia di semua area berkumpul utama." }
            ].map((f, i) => (
              <div key={i} className="bg-white/[0.03] backdrop-blur-md border border-white/[0.06] p-5 rounded-2xl space-y-2 hover:bg-white/[0.06] transition duration-300">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <h4 className="text-xs font-bold tracking-tight pt-1">{f.title}</h4>
                <p className="text-[11px] text-neutral-400 leading-relaxed font-light">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🧭 SECTION 3: PAKET WISATA (Carousel Native) */}
      <section id="paket-wisata" className="max-w-6xl mx-auto px-6 mt-24 space-y-6">
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest block flex items-center gap-1"><Compass size={12}/> Jelajahi Potensi Alam</span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900 uppercase">Paket Wisata Terpadu</h2>
        </div>
        
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none">
          {Array.isArray(paketWisataList) && paketWisataList.length > 0 ? (
            paketWisataList.map((wisata: any) => {
              const imgUrl = wisata._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "/placeholder-wisata.jpg";
              const harga = (wisata.acf as any)?.harga_tiket || 0;
              return (
                <div key={wisata.id} className="w-[85vw] sm:w-[45vw] lg:w-[28vw] shrink-0 snap-start">
                  <Link href={`/wisata/${wisata.slug}`} className="group bg-white rounded-2xl overflow-hidden border border-neutral-200/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full justify-between">
                    <div className="relative aspect-[4/3] w-full bg-neutral-100 overflow-hidden">
                      <Image src={imgUrl} alt={wisata.title.rendered} fill className="object-cover group-hover:scale-105 transition duration-500" />
                    </div>
                    <div className="p-5 space-y-4">
                      <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-tight line-clamp-1">{wisata.title.rendered}</h3>
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
            <p className="text-xs text-neutral-400 italic font-light">Belum ada paket wisata terdaftar cukk.</p>
          )}
        </div>
      </section>

      {/* 🛍️ SECTION 4: PRODUK UMKM (Carousel Native WooCommerce Resmi) */}
      <section className="max-w-6xl mx-auto px-6 mt-24 space-y-6">
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest block flex items-center gap-1"><ShoppingBag size={12}/> Oleh-Oleh Khas Desa</span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900 uppercase">Produksi UMKM Unggulan</h2>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none">
          {Array.isArray(umkmList) && umkmList.length > 0 ? (
            umkmList.map((product: any) => {
              const imgUrl = product.images && product.images.length > 0 ? product.images[0].src : "/placeholder-wisata.jpg";
              const hasPrice = product.price;

              return (
                <div key={product.id} className="w-[65vw] sm:w-[35vw] lg:w-[22vw] shrink-0 snap-start">
                  <div className="group bg-white rounded-2xl overflow-hidden border border-neutral-200/60 p-4 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between h-full">
                    <div className="relative aspect-square w-full bg-neutral-50 rounded-xl overflow-hidden mb-4">
                      <Image 
                        src={imgUrl} 
                        alt={product.name} 
                        fill 
                        className="object-cover group-hover:scale-105 transition duration-500" 
                      />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-neutral-800 line-clamp-1 uppercase tracking-tight">
                        {product.name}
                      </h3>
                      <div className="flex justify-between items-center text-xs pt-2 border-t border-neutral-100">
                        <span className="text-emerald-600 font-bold">
                          {hasPrice ? `Rp ${parseInt(product.price).toLocaleString("id-ID")}` : "Hubungi Penjual"}
                        </span>
                        <Link 
                          href={`/umkm/${product.slug}`}
                          className="text-[10px] bg-neutral-900 hover:bg-emerald-600 text-white font-bold px-2.5 py-1.5 rounded-lg uppercase tracking-wider transition flex items-center gap-1"
                        >
                          Detail <Tag size={10} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-neutral-400 italic font-light">Belum ada produk UMKM terdaftar cukk.</p>
          )}
        </div>
      </section>

      {/* 🏠 SECTION 5: HOMESTAY WARGA (Carousel Native) */}
      <section className="max-w-6xl mx-auto px-6 mt-24 space-y-6">
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest block flex items-center gap-1"><Home size={12}/> Hunian Autentik Warga</span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900 uppercase">Homestay Nyaman Warga</h2>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none">
          {Array.isArray(homestayList) && homestayList.length > 0 ? (
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
            <p className="text-xs text-neutral-400 italic font-light">Belum ada homestay terdaftar cukk.</p>
          )}
        </div>
      </section>

      {/* 📸 SECTION 6: KELOMPOK BARISAN ANIMASI MARQUEE LOOPING */}
      {/* Di sinilah komponen eksternal HomeMarquee diletakkan agar datanya terisi otomatis & bergerak cukk */}
      <HomeMarquee />

    </div>
  );
}