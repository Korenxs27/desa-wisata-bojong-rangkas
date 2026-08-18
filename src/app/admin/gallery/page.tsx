"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { ArrowLeft, Upload, Trash2, Loader2, Image as ImageIcon } from "lucide-react";

export default function AdminGalleryPage() {
  const [gallery, setGallery] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const apiEndpoint = "https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wc-bridge/v1/gallery-items";

  const fetchGallery = async () => {
    try {
      const res = await fetch(apiEndpoint, { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.gallery)) {
        setGallery(data.gallery);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat daftar galeri.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Pilih foto terlebih dahulu dari device kamu!");
      return;
    }

    setUploading(true);
    const loadingToast = toast.loading("Mengunggah foto ke server...");
    const formData = new FormData();
    formData.append("title", title || "Dokumentasi Desa");
    formData.append("category", category || "Umum");
    formData.append("image_file", file);

    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      toast.dismiss(loadingToast);

      if (data.success) {
        toast.success("Foto berhasil diunggah!");
        setTitle("");
        setCategory("");
        setFile(null);
        fetchGallery();
      } else {
        toast.error("Gagal mengunggah foto.");
      }
    } catch (err) {
      console.error(err);
      toast.dismiss(loadingToast);
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus foto ini dari server?")) return;

    const loadingToast = toast.loading("Menghapus foto...");
    try {
      const res = await fetch(`${apiEndpoint}?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      toast.dismiss(loadingToast);

      if (data.success) {
        toast.success("Foto berhasil dihapus!");
        setGallery((prev) => prev.filter((item) => item.id !== id));
      } else {
        toast.error("Gagal menghapus foto dari server.");
      }
    } catch (err) {
      console.error(err);
      toast.dismiss(loadingToast);
      toast.error("Gagal terhubung ke server WordPress.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8 text-slate-800 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200/85 shadow-sm">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-600 transition">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-lg font-black uppercase text-slate-900">Manajemen Galeri & Foto Publik</h1>
              <p className="text-xs text-slate-500 font-light">Upload foto dengan kategori bebas ciptaanmu sendiri.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpload} className="bg-white p-6 rounded-3xl border border-slate-200/85 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Upload size={16} className="text-emerald-600" /> Upload Foto Baru dari Device
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Judul / Keterangan Foto</label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Spot Foto Jembatan Kayu"
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Kategori (Ketik Sendiri)</label>
              <input 
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Contoh: Event Desa, Alam, Kuliner"
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Pilih File Foto (JPG/PNG)</label>
              <input 
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-2xl text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={uploading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {uploading ? <><Loader2 size={16} className="animate-spin" /> Mengunggah ke Server...</> : <><Upload size={16} /> Unggah Foto ke Database</>}
          </button>
        </form>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/85 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ImageIcon size={16} className="text-emerald-600" /> Daftar Foto Galeri Tersimpan
          </h2>

          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs flex items-center justify-center gap-2">
              <Loader2 className="animate-spin text-emerald-600" size={16} /> Memuat galeri...
            </div>
          ) : gallery.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {gallery.map((item) => (
                <div key={item.id} className="bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden flex flex-col justify-between group">
                  <div className="relative aspect-[4/3] w-full bg-slate-200 overflow-hidden">
                    <Image src={item.image} alt={item.title} fill className="object-cover group-hover:scale-105 transition duration-500" />
                    <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                  <div className="p-4 flex items-center justify-between gap-2 bg-white">
                    <div className="truncate space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-800 uppercase truncate">{item.title}</h4>
                      <p className="text-[10px] text-slate-400">🕒 {item.date}</p>
                    </div>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition cursor-pointer shrink-0"
                      title="Hapus Foto"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic font-light text-center py-12">Belum ada foto galeri yang diunggah.</p>
          )}
        </div>

      </div>
    </div>
  );
}