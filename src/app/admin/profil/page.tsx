"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, Save, Loader2, Plus, Trash2, Landmark } from "lucide-react";

export default function AdminProfilPage() {
  const [sejarah, setSejarah] = useState("");
  const [visi, setVisi] = useState("");
  const [misi, setMisi] = useState("");
  const [struktur, setStruktur] = useState<any[]>([]);
  const [statistik, setStatistik] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const apiEndpoint = "https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wc-bridge/v1/profil-desa";

  useEffect(() => {
    const fetchProfil = async () => {
      try {
        const res = await fetch(`${apiEndpoint}?t=${Date.now()}`, { cache: "no-store" });
        const data = await res.json();
        if (data.success && data.profil) {
          setSejarah(data.profil.sejarah ?? "");
          setVisi(data.profil.visi ?? "");
          setMisi(data.profil.misi ?? "");
          setStruktur(Array.isArray(data.profil.struktur) ? data.profil.struktur : []);
          setStatistik(Array.isArray(data.profil.statistik) ? data.profil.statistik : []);
          setImagePreview(data.profil.image_sejarah_url ?? "");
        }
      } catch (err) {
        console.error("Gagal memuat profil admin:", err);
        toast.error("Gagal memuat profil desa.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfil();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const loadingToast = toast.loading("Menyimpan profil desa...");

    const formData = new FormData();
    formData.append("sejarah", sejarah ?? "");
    formData.append("visi", visi ?? "");
    formData.append("misi", misi ?? "");
    formData.append("struktur", JSON.stringify(struktur ?? []));
    formData.append("statistik", JSON.stringify(statistik ?? []));
    
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
        toast.success("Profil desa berhasil disimpan!");
        if (data.profil) {
          setSejarah(data.profil.sejarah ?? "");
          setVisi(data.profil.visi ?? "");
          setMisi(data.profil.misi ?? "");
          setStruktur(Array.isArray(data.profil.struktur) ? data.profil.struktur : []);
          setStatistik(Array.isArray(data.profil.statistik) ? data.profil.statistik : []);
          setImagePreview(data.profil.image_sejarah_url ?? "");
        }
        setImageFile(null);
      } else {
        toast.error("Gagal menyimpan profil.");
      }
    } catch (err) {
      console.error(err);
      toast.dismiss(loadingToast);
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setSaving(false);
    }
  };

  const addStruktur = () => setStruktur([...struktur, { nama: "", jabatan: "", deskripsi: "" }]);
  const removeStruktur = (idx: number) => setStruktur(struktur.filter((_, i) => i !== idx));

  const addStatistik = () => setStatistik([...statistik, { label: "", nilai: "" }]);
  const removeStatistik = (idx: number) => setStatistik(statistik.filter((_, i) => i !== idx));

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8 text-slate-800 font-sans">
      {/* 🟢 TOASTER MANDIRI KHUSUS HALAMAN PROFIL */}
      <Toaster position="top-right" reverseOrder={false} />

      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-600 transition">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-lg font-black uppercase text-slate-900">Manajemen Profil Desa</h1>
              <p className="text-xs text-slate-500 font-light">Perbarui sejarah, visi, misi, struktur pokdarwis, & upload foto device.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Landmark size={16} className="text-emerald-600" /> Sejarah Singkat & Upload Foto dari Device
            </h2>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Teks Sejarah Desa</label>
              <textarea 
                rows={5}
                value={sejarah}
                onChange={(e) => setSejarah(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xs focus:outline-none focus:border-emerald-500 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Pilih File Foto Sejarah (JPG/PNG)</label>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-2xl text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-emerald-50 file:text-emerald-700 cursor-pointer"
                />
              </div>

              {imagePreview && (
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 border">
                  <Image src={imagePreview} alt="Preview Sejarah" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Visi & Misi Desa</h2>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Visi</label>
              <input 
                type="text"
                value={visi}
                onChange={(e) => setVisi(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Misi</label>
              <textarea 
                rows={4}
                value={misi}
                onChange={(e) => setMisi(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xs focus:outline-none focus:border-emerald-500 leading-relaxed"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Struktur Organisasi Pokdarwis</h2>
              <button type="button" onClick={addStruktur} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer">
                <Plus size={14} /> Tambah Anggota
              </button>
            </div>

            <div className="space-y-4">
              {struktur.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input 
                      type="text"
                      placeholder="Nama Lengkap"
                      value={item.nama}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStruktur(struktur.map((s, i) => i === idx ? {...s, nama: val} : s));
                      }}
                      className="bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-semibold"
                    />
                    <input 
                      type="text"
                      placeholder="Jabatan"
                      value={item.jabatan}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStruktur(struktur.map((s, i) => i === idx ? {...s, jabatan: val} : s));
                      }}
                      className="bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-semibold"
                    />
                  </div>
                  <input 
                    type="text"
                    placeholder="Deskripsi Singkat"
                    value={item.deskripsi}
                    onChange={(e) => {
                      const val = e.target.value;
                      setStruktur(struktur.map((s, i) => i === idx ? {...s, deskripsi: val} : s));
                    }}
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs"
                  />
                  <button type="button" onClick={() => removeStruktur(idx)} className="absolute top-4 right-4 text-rose-500 hover:text-rose-700 p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Statistik Desa</h2>
              <button type="button" onClick={addStatistik} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer">
                <Plus size={14} /> Tambah Statistik
              </button>
            </div>

            <div className="space-y-3">
              {statistik.map((stat, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input 
                    type="text"
                    placeholder="Label"
                    value={stat.label}
                    onChange={(e) => {
                      const val = e.target.value;
                      setStatistik(statistik.map((s, i) => i === idx ? {...s, label: val} : s));
                    }}
                    className="flex-1 bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-semibold"
                  />
                  <input 
                    type="text"
                    placeholder="Nilai"
                    value={stat.nilai}
                    onChange={(e) => {
                      const val = e.target.value;
                      setStatistik(statistik.map((s, i) => i === idx ? {...s, nilai: val} : s));
                    }}
                    className="flex-1 bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-semibold"
                  />
                  <button type="button" onClick={() => removeStatistik(idx)} className="text-rose-500 hover:text-rose-700 p-2">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : <><Save size={16} /> Simpan & Perbarui Profil Desa</>}
          </button>
        </form>
      </div>
    </div>
  );
}