"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { 
  ArrowLeft, Plus, Package, RefreshCw, Clock, Tag, 
  Users, Edit3, Trash2, X, Upload, Image as ImageIcon 
} from "lucide-react";
import { PaketWisata } from "@/types/wisata";

export default function AdminPaketPage() {
  const [paketList, setPaketList] = useState<PaketWisata[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingItem, setEditingItem] = useState<PaketWisata | null>(null);

  const [title, setTitle] = useState("");
  const [hargaMinimal, setHargaMinimal] = useState("");
  const [durasiPaket, setDurasiPaket] = useState("2 Hari 1 Malam");
  const [minimalPeserta, setMinimalPeserta] = useState(5);
  const [deskripsi, setDeskripsi] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchPaketData = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wp/v2/paket_wisata?_embed", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) setPaketList(data);
    } catch (err) {
      console.error("Gagal load data Paket Wisata:", err);
      toast.error("Gagal memuat data Paket Wisata.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaketData();
  }, []);

  const handleStartEdit = (item: PaketWisata) => {
    setEditingItem(item);
    setTitle(item.title?.rendered || "");
    
    const acf = (item.acf || {}) as any;
    const hargaVal = acf.harga_minimal ?? acf.harga ?? "";
    const durasiVal = acf.durasi_paket ?? acf.durasi ?? "2 Hari 1 Malam";
    const pesertaVal = acf.minimal_peserta ?? 5;

    setHargaMinimal(String(hargaVal));
    setDurasiPaket(durasiVal);
    setMinimalPeserta(pesertaVal);
    setDeskripsi(item.content?.rendered?.replace(/<[^>]+>/g, '') || "");
  };

  const resetForm = () => {
    setEditingItem(null);
    setTitle("");
    setHargaMinimal("");
    setDurasiPaket("2 Hari 1 Malam");
    setMinimalPeserta(5);
    setDeskripsi("");
    setImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToast = toast.loading(editingItem ? "Memperbarui paket..." : "Menambahkan paket...");

    try {
      const formData = new FormData();
      if (editingItem) formData.append("item_id", String(editingItem.id));
      formData.append("post_type", "paket_wisata");
      formData.append("title", title);
      formData.append("harga", hargaMinimal);
      formData.append("durasi_paket", durasiPaket);
      formData.append("minimal_peserta", String(minimalPeserta));
      formData.append("content", deskripsi);

      if (imageFile) {
        formData.append("image_file", imageFile);
      }

      const res = await fetch("https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wc-bridge/v1/upsert-item", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (res.ok && data.success) {
        toast.success(editingItem ? "Paket Wisata Berhasil Diperbarui!" : "Paket Wisata Berhasil Ditambahkan!");
        resetForm();
        fetchPaketData();
      } else {
        toast.error(`Gagal menyimpan: ${data.message || "Terjadi kesalahan pada server"}`);
      }
    } catch (error) {
      console.error("Submit Error:", error);
      toast.dismiss(loadingToast);
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, wcProductId?: number) => {
  toast((t) => (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold text-slate-800">
        Apakah Anda yakin ingin menghapus Paket Wisata ini secara permanen?
      </p>
      <div className="flex gap-2 justify-end">
        <button
          onClick={async () => {
            toast.dismiss(t.id);
            
            const loadingToast = toast.loading("Menghapus paket wisata...");
            try {
              const res = await fetch("https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wc-bridge/v1/delete-item", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id: id,
                  wc_product_id: wcProductId || 0,
                }),
              });

              const data = await res.json();
              toast.dismiss(loadingToast);

              if (res.ok && data.success) {
                toast.success("Paket Wisata berhasil dihapus!");
                setPaketList((prev) => prev.filter((item) => item.id !== id));
              } else {
                toast.error(`Gagal Menghapus: ${data.message || "Periksa koneksi."}`);
              }
            } catch (error) {
              console.error("Delete Paket Error:", error);
              toast.dismiss(loadingToast);
              toast.error("Terjadi kesalahan jaringan saat menghapus Paket Wisata.");
            }
          }}
          className="px-3 py-1.5 bg-red-600 text-white text-[10px] font-bold rounded-lg hover:bg-red-700 transition"
        >
          Ya, Hapus
        </button>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="px-3 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg hover:bg-slate-200 transition"
        >
          Batal
        </button>
      </div>
    </div>
  ), { duration: 5000 });
};

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      {/* 🟢 TOASTER MANDIRI KHUSUS HALAMAN PAKET WISATA */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* Header Responsif */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="p-2.5 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition shrink-0">
            <ArrowLeft size={18} className="text-slate-700" />
          </Link>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800">Kelola Paket Wisata</h1>
            <p className="text-xs text-slate-500">Full CRUD: Tambah, Edit, dan Hapus Paket Wisata</p>
          </div>
        </div>

        <button onClick={fetchPaketData} className="self-start sm:self-auto p-2.5 bg-white rounded-xl text-slate-600 hover:bg-slate-50 transition shadow-sm flex items-center gap-2 text-xs font-medium">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          <span className="sm:hidden">Refresh Data</span>
        </button>
      </div>

      {/* Grid Layout Utama */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        
        {/* Form Input (Kolom Kiri) */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/60">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              {editingItem ? <Edit3 size={18} className="text-amber-600" /> : <Plus size={18} className="text-emerald-600" />}
              {editingItem ? "Edit Paket Wisata" : "Tambah Paket Wisata"}
            </h2>
            {editingItem && (
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Paket Wisata</label>
              <input
                type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Paket Camping Bojong Rangkas"
                className="w-full px-3.5 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Upload Foto Utama Paket</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 text-center cursor-pointer hover:bg-slate-50 transition relative">
                <input
                  type="file" accept="image/*"
                  onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-1 text-slate-500">
                  <Upload size={18} className="text-emerald-600" />
                  <span className="text-[11px] font-medium truncate max-w-[200px]">
                    {imageFile ? imageFile.name : "Klik untuk pilih/ganti foto"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Harga / Orang (Rp)</label>
                <input
                  type="number" required value={hargaMinimal} onChange={(e) => setHargaMinimal(e.target.value)}
                  placeholder="350000"
                  className="w-full px-3.5 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Min. Peserta</label>
                <input
                  type="number" required value={minimalPeserta} onChange={(e) => setMinimalPeserta(Number(e.target.value))}
                  placeholder="5"
                  className="w-full px-3.5 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Durasi Paket</label>
              <input
                type="text" required value={durasiPaket} onChange={(e) => setDurasiPaket(e.target.value)}
                placeholder="2 Hari 1 Malam"
                className="w-full px-3.5 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Deskripsi Paket</label>
              <textarea
                rows={3} required value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Detail informasi paket..."
                className="w-full px-3.5 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            <button
              type="submit" disabled={isSubmitting}
              className={`w-full py-2.5 font-bold text-xs text-white rounded-xl shadow-md transition disabled:opacity-50 ${
                editingItem ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {isSubmitting ? "Sychronizing..." : editingItem ? "Update Paket Wisata" : "+ Simpan Paket Wisata"}
            </button>
          </form>
        </div>

        {/* Daftar List Card (Kolom Kanan) */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/60">
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Package size={18} className="text-emerald-600" /> Daftar Paket Wisata ({paketList.length})
          </h2>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading data...</div>
          ) : paketList.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">Belum ada Paket Wisata.</div>
          ) : (
            <div className="space-y-3">
              {paketList.map((item) => (
                <div 
                  key={item.id} 
                  className="p-3 sm:p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 w-full sm:w-auto overflow-hidden">
                    <div className="w-14 h-14 sm:w-12 sm:h-12 rounded-xl bg-slate-200 overflow-hidden relative shrink-0">
                      {item._embedded?.["wp:featuredmedia"]?.[0]?.source_url ? (
                        <img
                          src={item._embedded["wp:featuredmedia"][0].source_url}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <ImageIcon size={18} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-grow">
                      <h3 className="font-bold text-sm text-slate-800 truncate">{item.title?.rendered}</h3>
                      
                      {/* Flex info rincian yang aman di layar kecil */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-bold text-emerald-600">
                          <Tag size={12} /> Rp {parseInt(String(item.acf?.harga_minimal || "0")).toLocaleString("id-ID")}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {item.acf?.durasi_paket || "1 Hari"}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center gap-1">
                          <Users size={12} /> Min {item.acf?.minimal_peserta || 1} Orang
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tombol Aksi (Edit & Hapus) */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => handleStartEdit(item)}
                      className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold px-3 sm:px-2"
                      title="Edit Item"
                    >
                      <Edit3 size={15} />
                      <span className="sm:hidden">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.acf?.produk_woocommerce_terkait)}
                      className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold px-3 sm:px-2"
                      title="Hapus Item"
                    >
                      <Trash2 size={15} />
                      <span className="sm:hidden">Hapus</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}