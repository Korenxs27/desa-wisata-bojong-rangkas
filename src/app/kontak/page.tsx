"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare, Loader2, CheckCircle2, AlertTriangle, X } from "lucide-react";

export default function KontakPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  // State Sistem Notifikasi Toast Modern & Beranimasi
  const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://desa-wisata-bojongrangkas.com/wp-json";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${wpUrl}/wc-bridge/v1/send-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama: formData.name,
          email: formData.email,
          pesan: formData.message,
        }),
      });

      const data = await res.json();

      if (data.success) {
        showNotification("Pesan kamu berhasil dikirim!");
        setFormData({ name: "", email: "", message: "" });
      } else {
        showNotification("Gagal mengirim pesan: " + (data.message || "Terjadi kesalahan."), "error");
      }
    } catch (err) {
      console.error("Error submitting contact form:", err);
      showNotification("Koneksi ke server WordPress gagal. Silakan coba beberapa saat lagi.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30 text-neutral-800 antialiased pb-24 pt-36 px-4 sm:px-6 lg:px-8 selection:bg-emerald-100 relative overflow-hidden">
      
      {/* Background Soft Glassy Glow Effects */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-teal-300/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* SISTEM NOTIFIKASI TOAST MODERN & BERANIMASI */}
      <div className={`fixed bottom-8 right-8 z-[999999] transition-all duration-500 transform ${
        toast.show ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95 pointer-events-none'
      }`}>
        <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border ${
          toast.type === 'success' 
            ? 'bg-slate-900/90 border-emerald-500/30 text-white' 
            : 'bg-slate-900/90 border-rose-500/30 text-white'
        }`}>
          {toast.type === 'success' ? (
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} />
            </div>
          )}
          <div className="text-xs font-medium tracking-tight">
            {toast.message}
          </div>
          <button 
            onClick={() => setToast(prev => ({ ...prev, show: false }))}
            className="ml-2 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* 1. HERO TITLE BLOCK (Centered & Luxury Serif) */}
        <div className="space-y-3 text-center max-w-xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-serif font-normal tracking-tight text-neutral-900">
            Hubungi Kami
          </h1>
          <p className="text-xs text-neutral-500 font-light leading-relaxed">
            Punya pertanyaan seputar kemitraan, paket wisata, atau produk UMKM? Silakan hubungi kami kapan saja.
          </p>
        </div>

        {/* 2. MAIN CONTACT & MAPS GRID */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: FORM & INFO DETAILS (5/12) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Card Info Alamat */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/85 rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">Kontak Resmi</h3>
              
              <div className="space-y-3.5 text-xs text-neutral-500 font-light">
                <div className="flex gap-3 items-start">
                  <MapPin size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>BTN Sindangsari. Jl. Kenanga Raya no.3. rt03/RW07, Bojong Rangkas, Kec. Ciampea, Kabupaten Bogor, Jawa Barat 16620</span>
                </div>
                <div className="flex gap-3 items-center">
                  <Phone size={16} className="text-emerald-600 shrink-0" />
                  <span>+62 812-3456-7890</span>
                </div>
                <div className="flex gap-3 items-center">
                  <Mail size={16} className="text-emerald-600 shrink-0" />
                  <span>desawisatabojongrangkas@gmail.com</span>
                </div>
              </div>
            </div>

            {/* Form Kirim Pesan */}
            <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-xl border border-white/85 rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">Kirim Pesan</h3>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Nama Lengkap</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-white/60 border border-neutral-200/80 rounded-xl px-3 py-2.5 text-xs font-light outline-none focus:border-emerald-500 transition"
                  placeholder="Masukkan nama Anda"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Email Aktif</label>
                <input 
                  type="email" 
                  required
                  className="w-full bg-white/60 border border-neutral-200/80 rounded-xl px-3 py-2.5 text-xs font-light outline-none focus:border-emerald-500 transition"
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
                  className="w-full bg-white/60 border border-neutral-200/80 rounded-xl px-3 py-2.5 text-xs font-light outline-none focus:border-emerald-500 transition resize-none"
                  placeholder="Tulis pesan Anda di sini..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-neutral-900 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Mengirim Pesan...
                  </>
                ) : (
                  <>
                    Kirim Pesan <Send size={12} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT COLUMN: GOOGLE MAPS EMBEDDED (7/12) */}
          <div className="lg:col-span-7 w-full h-full min-h-[400px] lg:min-h-[515px] bg-white/70 backdrop-blur-xl border border-white/85 p-3 rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden relative">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.728820080395!2d106.699247!3d-6.5558784!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69db43fda50743%3A0x378d53739ca67ca!2sCafe%20Garden%20Famille!5e0!3m2!1sid!2sid!4v1787947072089!5m2!1sid!2sid"
              className="w-full h-full min-h-[380px] lg:min-h-[490px] rounded-2xl border-0"
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokasi Google Maps Desa Bojong Rangkas"
            />
          </div>

        </div>

      </div>
    </div>
  );
}