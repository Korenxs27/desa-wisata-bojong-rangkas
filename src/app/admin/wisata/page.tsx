"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Plus, MapPin, RefreshCw, Tag, Clock, 
  Edit3, Trash2, X, Upload, Image as ImageIcon, CircleCheck, CircleX 
} from "lucide-react";
import { WisataCPT } from "@/utils/wp";

export default function AdminWisataPage() {
  const [wisataList, setWisataList] = useState<WisataCPT[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingItem, setEditingItem] = useState<WisataCPT | null>(null);

  const [title, setTitle] = useState("");
  const [harga, setHarga] = useState("");
  const [durasi, setDurasi] = useState("08:00 - 17:00 WIB");
  const [lokasi, setLokasi] = useState("");
  const [statusBuka, setStatusBuka] = useState("Buka"); 
  const [kategoriWisata, setKategoriWisata] = useState("Traking"); 
  const [deskripsi, setDeskripsi] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchWisataData = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wp/v2/wisata?_embed", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) setWisataList(data);
    } catch (err) {
      console.error("Gagal load data CPT Wisata:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWisataData();
  }, []);

  const handleStartEdit = (item: WisataCPT) => {
    setEditingItem(item);
    setTitle(item.title?.rendered || "");
    
    const acf = (item as any).acf || {};
    
    // Ambil harga
    const valHarga = acf.harga ?? acf.harga_tiket ?? (item as any).harga ?? "";
    setHarga(String(valHarga));

    // 🔍 Ambil lokasi maps & decode entitas HTML agar iframe tidak terpotong/hilang
    const rawLokasi = acf.lokasi ?? acf.lokasi_maps ?? acf.google_maps ?? (item as any).lokasi ?? "";
    const decodedLokasi = String(rawLokasi)
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&amp;/g, "&");
      
    setLokasi(decodedLokasi);

    // Ambil durasi, status, dan kategori
    setDurasi(acf.durasi ?? acf.jam_operasional ?? "08:00 - 17:00 WIB");
    setStatusBuka(acf.status_buka ?? acf.status_operasional ?? "Buka");
    setKategoriWisata(acf.kategori_wisata ?? "Traking");

    setDeskripsi(item.content?.rendered?.replace(/<[^>]+>/g, '') || "");
  };

  const resetForm = () => {
    setEditingItem(null);
    setTitle("");
    setHarga("");
    setDurasi("08:00 - 17:00 WIB");
    setLokasi("");
    setStatusBuka("Buka");
    setKategoriWisata("Traking");
    setDeskripsi("");
    setImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      if (editingItem) formData.append("item_id", String(editingItem.id));
      
      formData.append("post_type", "wisata"); 
      formData.append("title", title);
      formData.append("harga", harga);          
      formData.append("durasi", durasi);        
      formData.append("lokasi", lokasi);        
      formData.append("status_buka", statusBuka); 
      formData.append("kategori_wisata", kategoriWisata); 
      formData.append("content", deskripsi);

      if (imageFile) {
        formData.append("image_file", imageFile);
      }

      const res = await fetch("https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wc-bridge/v1/upsert-item", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert(editingItem ? "Objek Wisata Berhasil Diperbarui!" : "Objek Wisata Berhasil Ditambahkan!");
        resetForm();
        fetchWisataData();
      } else {
        alert(`Gagal menyimpan: ${data.message || "Terjadi kesalahan pada server"}`);
      }
    } catch (error) {
      console.error("Submit Error:", error);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus Objek Wisata ini secara permanen?")) return;

    try {
      const res = await fetch("https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wc-bridge/v1/delete-item", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert("Objek Wisata berhasil dihapus!");
        setWisataList((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert(`Gagal Menghapus: ${data.message || "Periksa koneksi backend."}`);
      }
    } catch (error) {
      console.error("Delete Wisata Error:", error);
      alert("Terjadi kesalahan jaringan saat menghapus Objek Wisata.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2.5 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition">
            <ArrowLeft size={18} className="text-slate-700" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Kelola Objek Wisata</h1>
            <p className="text-xs text-slate-500">Full CRUD: Tambah, Edit, dan Hapus Objek Wisata</p>
          </div>
        </div>

        <button onClick={fetchWisataData} className="p-2.5 bg-white rounded-xl text-slate-600 hover:bg-slate-50 transition shadow-sm">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORM */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              {editingItem ? <Edit3 size={18} className="text-amber-600" /> : <Plus size={18} className="text-emerald-600" />}
              {editingItem ? "Edit Objek Wisata" : "Tambah Objek Wisata"}
            </h2>
            {editingItem && (
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Objek Wisata</label>
              <input
                type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Curug Saung Bojong"
                className="w-full px-3.5 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* 🌲 Dropdown Kategori Wisata */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Kategori & Jenis Wisata</label>
              <select 
                value={kategoriWisata} 
                onChange={(e) => setKategoriWisata(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
              >
                <optgroup label="🌲 Wisata Alam">
                  <option value="Traking">Traking</option>
                  <option value="Camping Ground">Camping Ground</option>
                  <option value="Susur Goa">Susur Goa</option>
                  <option value="Tubing Papalidan">Tubing Papalidan</option>
                  <option value="Liwetan di Gunung atau Sungai">Liwetan di Gunung atau Sungai</option>
                </optgroup>

                <optgroup label="🌱 Wisata Agro">
                  <option value="Mancing Ikan">Mancing Ikan</option>
                  <option value="Petik Sayur Hidroponik">Petik Sayur Hidroponik</option>
                  <option value="Liwetan di Kebun Agro">Liwetan di Kebun Agro</option>
                </optgroup>

                <optgroup label="✨ Edukasi">
                  <option value="Edukasi Umum">Edukasi / Pengetahuan Lokal</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Upload Foto Utama</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 text-center cursor-pointer hover:bg-slate-50 transition relative">
                <input
                  type="file" accept="image/*"
                  onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-1 text-slate-500">
                  <Upload size={18} className="text-emerald-600" />
                  <span className="text-[11px] font-medium">
                    {imageFile ? imageFile.name : "Klik untuk pilih/ganti foto"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tiket Masuk (Rp)</label>
                <input
                  type="number" required value={harga} onChange={(e) => setHarga(e.target.value)}
                  placeholder="15000"
                  className="w-full px-3.5 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Status Buka</label>
                <select 
                  value={statusBuka} 
                  onChange={(e) => setStatusBuka(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Buka">Buka (Hijau)</option>
                  <option value="Tutup">Tutup (Merah)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Lokasi / Embed Google Maps (Iframe)</label>
              <input
                type="text" required value={lokasi} onChange={(e) => setLokasi(e.target.value)}
                placeholder="Paste kode iframe maps atau link google maps"
                className="w-full px-3.5 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Jam Operasional / Informasi</label>
              <input
                type="text" required value={durasi} onChange={(e) => setDurasi(e.target.value)}
                placeholder="08:00 - 17:00 WIB"
                className="w-full px-3.5 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Deskripsi Objek Wisata</label>
              <textarea
                rows={3} required value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Detail keindahan dan daya tarik wisata..."
                className="w-full px-3.5 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit" disabled={isSubmitting}
              className={`w-full py-2.5 font-bold text-xs text-white rounded-xl shadow-md transition disabled:opacity-50 ${
                editingItem ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {isSubmitting ? "Sychronizing..." : editingItem ? "Update Objek Wisata" : "+ Simpan Objek Wisata"}
            </button>
          </form>
        </div>

        {/* LIST */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <MapPin size={18} className="text-emerald-600" /> Daftar Objek Wisata ({wisataList.length})
          </h2>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading data...</div>
          ) : wisataList.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">Belum ada Objek Wisata.</div>
          ) : (
            <div className="space-y-3">
              {wisataList.map((item) => {
                const acf = (item as any).acf || {};
                
                const rawHarga = acf.harga ?? acf.harga_tiket ?? (item as any).harga ?? "0";
                const itemHarga = !isNaN(Number(rawHarga)) ? Number(rawHarga) : 0;

                const itemDurasi = acf.durasi ?? acf.jam_operasional ?? "08:00 - 17:00";
                const itemStatus = acf.status_buka ?? acf.status_operasional ?? "Buka";
                const itemKategori = acf.kategori_wisata ?? "Wisata Alam";
                const isItemOpen = String(itemStatus).trim().toLowerCase() === "buka";

                return (
                  <div key={item.id} className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-200 overflow-hidden relative shrink-0">
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

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-slate-800">{item.title?.rendered}</h3>
                          {/* 🟢 Badge Status */}
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isItemOpen ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                          }`}>
                            {isItemOpen ? <CircleCheck size={10} /> : <CircleX size={10} />}
                            {itemStatus}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {itemKategori}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-bold text-neutral-700">
                            <Tag size={12} /> Rp {itemHarga.toLocaleString("id-ID")}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {itemDurasi}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl transition"
                        title="Edit Item"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition"
                        title="Hapus Item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}