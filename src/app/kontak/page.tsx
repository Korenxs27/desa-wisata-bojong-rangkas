"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";

export default function KontakPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Pesan dari ${formData.name} berhasil terkirim cukk! (Fungsi backend bisa lu hubungkan ke API WordPress nanti)`);
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-800 antialiased pb-24 pt-32 selection:bg-emerald-100">
      
      {/* 🌟 1. HERO TITLE BLOCK */}
      <div className="max-w-7xl mx-auto px-6 pb-12 text-center space-y-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600 bg-emerald-50/60 px-4 py-1.5 rounded-full border border-emerald-100 inline-flex items-center gap-1.5">
          <MessageSquare size={12} /> Layanan Informasi
        </span>
        <h1 className="text-4xl md:text-5xl font-light font-serif tracking-tight text-neutral-900">
          Hubungi Sekretariat
        </h1>
        <p className="max-w-md mx-auto text-xs text-neutral-400 font-light leading-relaxed">
          Punya pertanyaan seputar kemitraan, paket wisata, atau produk UMKM? Silakan hubungi kami kapan saja.
        </p>
      </div>

      {/* 🗺️ 2. MAIN CONTACT & MAPS GRID */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: FORM & INFO DETAILS (5/12) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card Info Alamat */}
          <div className="bg-white/70 backdrop-blur-sm border border-neutral-200/60 rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.005)] space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">Kontak Resmi</h3>
            
            <div className="space-y-3.5 text-xs text-neutral-500 font-light">
              <div className="flex gap-3 items-start">
                <MapPin size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>Jl. Raya Bojong Rangkas No. 01, Kecamatan Ciampea, Kabupaten Bogor, Jawa Barat.</span>
              </div>
              <div className="flex gap-3 items-center">
                <Phone size={16} className="text-emerald-600 shrink-0" />
                <span>+62 812-3456-7890</span>
              </div>
              <div className="flex gap-3 items-center">
                <Mail size={16} className="text-emerald-600 shrink-0" />
                <span>info@bojongrangkas.desa.id</span>
              </div>
            </div>
          </div>

          {/* Form Kirim Pesan */}
          <form onSubmit={handleSubmit} className="bg-white border border-neutral-200/60 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">Kirim Pesan</h3>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Nama Lengkap</label>
              <input 
                type="text" 
                required
                className="w-full bg-neutral-50 border border-neutral-200/60 rounded-xl px-3 py-2.5 text-xs font-light outline-none focus:border-emerald-500 transition"
                placeholder="Masukkan nama lu cukk..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Email Aktif</label>
              <input 
                type="email" 
                required
                className="w-full bg-neutral-50 border border-neutral-200/60 rounded-xl px-3 py-2.5 text-xs font-light outline-none focus:border-emerald-500 transition"
                placeholder="nama@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Isi Pesan</label>
              <textarea 
                rows={4}
                required
                className="w-full bg-neutral-50 border border-neutral-200/60 rounded-xl px-3 py-2.5 text-xs font-light outline-none focus:border-emerald-500 transition resize-none"
                placeholder="Tulis pertanyaan atau aspirasi lu di sini..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition shadow-sm flex items-center justify-center gap-2"
            >
              Kirim Aspirasi <Send size={12} />
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: GOOGLE MAPS EMBEDDED (7/12) */}
        <div className="lg:col-span-7 w-full h-full min-h-[400px] lg:min-h-[515px] bg-white border border-neutral-200/60 p-3 rounded-3xl shadow-sm overflow-hidden relative">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.702759239217!2d106.6930146!3d-6.559155500000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69db65ef957015%3A0x98c25453b1dc43bf!2sKantor%20Desa%20Bojongrangkas!5e0!3m2!1sid!2sid!4v1784318368633!5m2!1sid!2sid"
            className="w-full h-full min-h-[380px] lg:min-h-[490px] rounded-2xl border-0"
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Lokasi Google Maps Desa Bojong Rangkas"
          />
        </div>

      </div>

    </div>
  );
}