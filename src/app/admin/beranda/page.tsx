"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, Save, Loader2, LayoutTemplate, Image as ImageIcon, Type } from "lucide-react";

export default function AdminBerandaPage() {
  const [hero, setHero] = useState({
    title_line_1: "",
    title_line_2: "",
    description: "",
    button_text: "",
    button_url: "",
    image_url: ""
  });

  const [sectionOrder, setSectionOrder] = useState<string[]>([
    'paket', 'wisata', 'umkm', 'homestay', 'gallery'
  ]);

  // State untuk kustomisasi judul setiap section
  const [sectionTitles, setSectionTitles] = useState<Record<string, string>>({
    paket: "Paket Wisata Terpadu",
    wisata: "Objek Wisata Desa",
    umkm: "Produksi UMKM Unggulan",
    homestay: "Homestay Nyaman Warga",
    gallery: "Dokumentasi Desa Wisata"
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const apiEndpoint = "https://desa-wisata-bojongrangkas.com/wp-json/wc-bridge/v1/profil-desa";

  useEffect(() => {
    const fetchBerandaAdmin = async () => {
      try {
        const res = await fetch(`${apiEndpoint}?t=${Date.now()}`, { cache: "no-store" });
        const data = await res.json();
        if (data.success && data.profil) {
          if (data.profil.hero) {
            setHero(data.profil.hero);
          }
          if (Array.isArray(data.profil.section_order) && data.profil.section_order.length > 0) {
            setSectionOrder(data.profil.section_order);
          }
          if (data.profil.section_titles) {
            setSectionTitles((prev) => ({ ...prev, ...data.profil.section_titles }));
          }
        }
      } catch (err) {
        console.error("Gagal memuat data beranda admin:", err);
        toast.error("Gagal memuat data beranda.");
      } finally {
        setLoading(false);
      }
    };
    fetchBerandaAdmin();
  }, []);

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...sectionOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    
    setSectionOrder(newOrder);
  };

  const handleTitleChange = (key: string, value: string) => {
    setSectionTitles(prev => ({ ...prev, [key]: value }));
  };

  const getDefaultSectionLabel = (key: string) => {
    switch(key) {
      case 'paket': return 'Paket Wisata Terpadu';
      case 'wisata': return 'Objek Wisata Desa';
      case 'umkm': return 'Produksi UMKM Unggulan';
      case 'homestay': return 'Homestay Nyaman Warga';
      case 'gallery': return 'Dokumentasi Desa Wisata';
      default: return key;
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const loadingToast = toast.loading("Menyimpan pengaturan beranda...");

    const formData = new FormData();
    formData.append("hero", JSON.stringify(hero));
    formData.append("section_order", JSON.stringify(sectionOrder));
    formData.append("section_titles", JSON.stringify(sectionTitles));
    
    if (imageFile) {
      formData.append("image_sejarah", imageFile);
    }

    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      toast.dismiss(loadingToast);
      
      if (data.success) {
        toast.success("Pengaturan beranda berhasil diperbarui!");
        if (data.profil?.hero) {
          setHero(data.profil.hero);
        }
        if (data.profil?.section_titles) {
          setSectionTitles(data.profil.section_titles);
        }
        setImageFile(null);
      } else {
        toast.error("Gagal menyimpan pengaturan beranda.");
      }
    } catch (err) {
      console.error(err);
      toast.dismiss(loadingToast);
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8 text-slate-800 font-sans">
      {/* TOASTER MANDIRI KHUSUS HALAMAN BERANDA */}
      <Toaster position="top-right" reverseOrder={false} />

      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-600 transition">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-lg font-black uppercase text-slate-900">Manajemen Beranda</h1>
              <p className="text-xs text-slate-500 font-light">Atur konten Hero Section, ubah judul section, dan atur urutan tampilan beranda.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Hero Section Pengaturan (Badge dihapus) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon size={16} className="text-emerald-600" /> Konten Hero Section Utama
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Judul Baris 1</label>
                <input
  type="text"
  value={hero.title_line_1 ?? ""}
  onChange={(e) => setHero({...hero, title_line_1: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Judul Baris 2 (Warna Hijau)</label>
                <input
  type="text"
  value={hero.title_line_2 ?? ""}
  onChange={(e) => setHero({...hero, title_line_2: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xs font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Deskripsi Singkat</label>
              <textarea 
                rows={3}
                value={hero.description}
                onChange={(e) => setHero({...hero, description: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xs leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Teks Tombol</label>
                <input 
                  type="text"
                  value={hero.button_text}
                  onChange={(e) => setHero({...hero, button_text: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Link Tujuan Tombol</label>
                <input 
                  type="text"
                  value={hero.button_url}
                  onChange={(e) => setHero({...hero, button_url: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Upload Gambar Hero Baru (Opsional)</label>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-2xl text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-emerald-50 file:text-emerald-700 cursor-pointer"
                />
              </div>
              {hero.image_url && (
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 border">
                  <Image src={hero.image_url} alt="Preview Hero" fill className="object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Pengaturan Urutan Section & Kustomisasi Judul Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <LayoutTemplate size={16} className="text-emerald-600" /> Atur Urutan & Judul Section Beranda
            </h2>
            <p className="text-xs text-slate-400">Ubah teks judul sesuai kebutuhan dan gunakan tombol naik/turun untuk mengatur posisi section.</p>

            <div className="space-y-3">
              {sectionOrder.map((sectionKey, idx) => (
                <div key={sectionKey} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide">
                      Posisi ke-{idx + 1} ({getDefaultSectionLabel(sectionKey)})
                    </span>
                    <div className="flex items-center gap-1">
                      <button 
                        type="button" 
                        disabled={idx === 0}
                        onClick={() => moveSection(idx, 'up')}
                        className="px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                      >
                        ▲ Naik
                      </button>
                      <button 
                        type="button" 
                        disabled={idx === sectionOrder.length - 1}
                        onClick={() => moveSection(idx, 'down')}
                        className="px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                      >
                        ▼ Turun
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Judul Section di Beranda</label>
                    <div className="relative flex items-center">
                      <Type size={14} className="absolute left-3 text-slate-400" />
                      <input 
                        type="text"
                        value={sectionTitles[sectionKey] || ""}
                        onChange={(e) => handleTitleChange(sectionKey, e.target.value)}
                        className="w-full bg-white border border-slate-200 pl-9 pr-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
                        placeholder="Masukkan judul section..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : <><Save size={16} /> Simpan & Perbarui Beranda</>}
          </button>

        </form>
      </div>
    </div>
  );
}