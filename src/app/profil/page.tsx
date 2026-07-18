import Image from "next/image";
import { Shield, Target, Landmark, Users, MapPin, Award, UserCheck } from "lucide-react";

export default function ProfilDesaPage() {
  // 🚀 DATA STRUKTUR ASLI POKDARWIS BERDASARKAN DATA EXCEL LU CUKK
  const strukturPokdarwis = [
    { 
      jabatan: "Ketua Pokdarwis", 
      nama: "Anita",
      deskripsi: "Penanggung jawab utama dalam merumuskan strategi, memimpin koordinasi pengembangan potensi wisata, serta memperluas kemitraan Desa Wisata Bojong Rangkas." 
    },
    { 
      jabatan: "Wakil Ketua Pokdarwis", 
      nama: "Iwan Firmansyah",
      deskripsi: "Pendamping ketua yang bertanggung jawab mengawasi operasional harian lapangan, pengelolaan kluster destinasi, serta sinkronisasi program kerja warga." 
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-800 antialiased pb-24 pt-32 selection:bg-emerald-100">
      
      {/* 🌟 1. HERO TITLE BLOCK */}
      <div className="max-w-7xl mx-auto px-6 pb-12 text-center space-y-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600 bg-emerald-50/60 px-4 py-1.5 rounded-full border border-emerald-100 inline-flex items-center gap-1.5">
          <Landmark size={12} /> Kelembagaan Resmi Desa
        </span>
        <h1 className="text-4xl md:text-5xl font-light font-serif tracking-tight text-neutral-900">
          Profil Bojong Rangkas
        </h1>
        <p className="max-w-md mx-auto text-xs text-neutral-400 font-light leading-relaxed">
          Mengenal lebih dekat lembar sejarah, visi strategis, serta jajaran Kelompok Sadar Wisata (Pokdarwis) Desa Wisata Bojong Rangkas.
        </p>
      </div>

      {/* 🏛️ 2. SEJARAH SINGKAT (Luxury Card Banner) */}
      <div className="max-w-5xl mx-auto px-6 mb-16">
        <div className="bg-white border border-neutral-200/60 rounded-3xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col md:flex-row gap-8 items-center">
          <div className="w-full md:w-2/5 aspect-[4/3] bg-neutral-100 rounded-2xl overflow-hidden relative border border-neutral-200/30">
            <Image 
              src="/images/bg.png" 
              alt="Sejarah Desa" 
              fill 
              className="object-cover"
            />
          </div>
          <div className="w-full md:w-3/5 space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
              <Award size={14} /> Selayang Pandang
            </div>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-neutral-900">
              Sejarah Singkat Desa
            </h2>
            <p className="text-xs text-neutral-500 font-light leading-relaxed text-justify">
              Desa Bojong Rangkas merupakan wilayah yang kaya akan nilai historis dan pelestarian budaya lokal. Nama Bojong Rangkas diambil dari karakteristik geografis alaminya, yaitu 'Bojong' yang berarti tanjungan atau kelokan sungai, serta pohon 'Rangkas' yang dahulunya tumbuh subur menaungi kawasan ini. Seiring berjalannya waktu, desa ini bertransformasi dari kawasan agraris tradisional menjadi ekosistem desa wisata terpadu yang maju dan mandiri.
            </p>
          </div>
        </div>
      </div>

      {/* 🎯 3. VISI & MISI SECTION */}
      <div className="max-w-5xl mx-auto px-6 mb-20 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Visi */}
        <div className="bg-[#0B1220] text-white rounded-3xl p-8 shadow-xl border border-white/[0.05] space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="text-emerald-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1">
              <Shield size={12} /> Pilar Arah Kebijakan
            </div>
            <h3 className="text-xl font-black uppercase tracking-wide">Visi Utama Desa</h3>
          </div>
          <p className="text-sm font-medium italic text-neutral-200 border-l-2 border-emerald-500 pl-4 py-2 leading-relaxed">
            "Mewujudkan Desa Bojong Rangkas yang Maju, Mandiri, Sejahtera, dan Berkelanjutan Berbasis Potensi Wisata Alam serta Ekonomi Kreatif Melalui Tata Kelola Pemerintahan yang Akuntabel."
          </p>
          <div className="text-[11px] text-neutral-400 font-light">Target Pembangunan Jangka Panjang</div>
        </div>

        {/* Misi */}
        <div className="bg-white border border-neutral-200/60 rounded-3xl p-8 shadow-sm space-y-5">
          <div className="space-y-1">
            <div className="text-emerald-600 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1">
              <Target size={12} /> Langkah Taktis
            </div>
            <h3 className="text-xl font-black uppercase tracking-wide text-neutral-900">Misi Kerja Desa</h3>
          </div>
          <ul className="space-y-3.5 text-xs text-neutral-500 font-light leading-relaxed">
            <li className="flex gap-2.5 items-start">
              <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
              <span>Meningkatkan mutu pelayanan publik berbasis teknologi digital yang cepat, tanggap, dan transparan.</span>
            </li>
            <li className="flex gap-2.5 items-start">
              <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
              <span>Mengoptimalkan tata kelola potensi destinasi wisata alam serta budidaya lokal terpadu.</span>
            </li>
            <li className="flex gap-2.5 items-start">
              <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
              <span>Mendorong pertumbuhan komoditas UMKM lokal menuju pasar digital berskala nasional.</span>
            </li>
            <li className="flex gap-2.5 items-start">
              <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">4</span>
              <span>Membangun sarana dan prasarana umum desa yang ramah lingkungan, aman, dan nyaman untuk warga.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 👔 4. STRUKTUR ORGANISASI POKDARWIS (Data Valid Excel Lu) */}
      <div className="max-w-4xl mx-auto px-6 mb-20 space-y-8">
        <div className="text-center space-y-1">
          <div className="text-emerald-600 font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-1">
            <Users size={12} /> Jajaran Pengelola Utama
          </div>
          <h3 className="text-2xl font-black uppercase tracking-tight text-neutral-900">Struktur Organisasi Pokdarwis</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {strukturPokdarwis.map((staff, i) => (
            <div 
              key={i} 
              className="bg-white border border-neutral-200/60 rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.005)] hover:border-emerald-500/30 transition duration-300 flex flex-col items-center text-center space-y-4 group"
            >
              {/* Profile Avatar Frame Luxury */}
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition duration-500">
                <UserCheck size={26} />
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-black tracking-widest text-emerald-600 uppercase block">
                  {staff.jabatan}
                </span>
                <h4 className="text-base font-black text-neutral-800 uppercase tracking-tight pt-0.5">
                  {staff.nama}
                </h4>
              </div>

              <p className="text-[11px] text-neutral-400 font-light leading-relaxed max-w-xs">
                {staff.deskripsi}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 🗺️ 5. INFORMASI STATISTIK GEOGRAFIS */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-white border border-neutral-200/60 rounded-3xl p-6 md:p-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="space-y-1.5 py-4 border-b sm:border-b-0 sm:border-r border-neutral-100">
            <Users className="text-neutral-400 mx-auto" size={20} />
            <span className="text-2xl font-black text-neutral-900 tracking-tight block">± 4.500</span>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Total Jiwa Penduduk</span>
          </div>
          <div className="space-y-1.5 py-4 border-b sm:border-b-0 sm:border-r border-neutral-100">
            <MapPin className="text-neutral-400 mx-auto" size={20} />
            <span className="text-2xl font-black text-neutral-900 tracking-tight block">320 Ha</span>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Luas Wilayah Desa</span>
          </div>
          <div className="space-y-1.5 py-4">
            <Landmark className="text-neutral-400 mx-auto" size={20} />
            <span className="text-sm font-black text-neutral-800 tracking-tight block uppercase pt-1 px-2 line-clamp-1">Kopi & Anyaman</span>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block pt-1">Komoditas UMKM Utama</span>
          </div>
        </div>
      </div>

    </div>
  );
}