"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Plus, Home, RefreshCw, User, Tag, 
  Edit3, Trash2, X, Upload, Image as ImageIcon 
} from "lucide-react";
import { HomestayWarga } from "@/types/homestay";

export default function AdminHomestayPage() {
  const [homestays, setHomestays] = useState<HomestayWarga[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingItem, setEditingItem] = useState<HomestayWarga | null>(null);

  const [title, setTitle] = useState("");
  const [namaPemilik, setNamaPemilik] = useState("");
  const [harga, setHarga] = useState("");
  const [kapasitas, setKapasitas] = useState(2);
  const [jumlahKamar, setJumlahKamar] = useState(1);
  const [fasilitasInput, setFasilitasInput] = useState("WiFi, AC, Sarapan Pagi, Kamar Mandi Dalam");
  const [deskripsi, setDeskripsi] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const ck = "ck_3512f4b660cb493791156b8e2a57ed734fe92fe4";
  const cs = "cs_6e530c56ba5fdd875c311c8b24b2429fe5885db3";
  const authHeader = 'Basic ' + btoa(`${ck}:${cs}`);

  const fetchHomestayData = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wp/v2/homestay?_embed", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) setHomestays(data);
    } catch (err) {
      console.error("Gagal load data CPT Homestay:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomestayData();
  }, []);

  const handleStartEdit = (item: HomestayWarga) => {
    setEditingItem(item);
    setTitle(item.title?.rendered || "");
    setNamaPemilik(item.acf?.nama_pemilik || "");
    setHarga(String(item.acf?.harga_per_malam || ""));
    setKapasitas(item.acf?.kapasitas_maksimal || 2);
    setJumlahKamar(item.acf?.jumlah_kamar_tersedia || 1);
    setFasilitasInput(Array.isArray(item.acf?.fasilitas_homestay) ? item.acf.fasilitas_homestay.join(", ") : "");
    setDeskripsi(item.content?.rendered?.replace(/<[^>]+>/g, '') || "");
  };

  const resetForm = () => {
    setEditingItem(null);
    setTitle("");
    setNamaPemilik("");
    setHarga("");
    setKapasitas(2);
    setJumlahKamar(1);
    setFasilitasInput("WiFi, AC, Sarapan Pagi, Kamar Mandi Dalam");
    setDeskripsi("");
    setImageFile(null);
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const formData = new FormData();
    if (editingItem) formData.append("item_id", String(editingItem.id));
    formData.append("post_type", "homestay"); // 👈 Dipastikan masuk CPT Homestay!
    formData.append("title", title);
    formData.append("nama_pemilik", namaPemilik);
    formData.append("harga", harga);
    formData.append("kapasitas", String(kapasitas));
    formData.append("jumlah_kamar", String(jumlahKamar));
    formData.append("fasilitas", fasilitasInput);
    formData.append("content", deskripsi);

    if (imageFile) {
      formData.append("image_file", imageFile); // 👈 File gambar dikirim langsung
    }

    const res = await fetch("https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wc-bridge/v1/upsert-item", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (res.ok && data.success) {
      alert(editingItem ? "Homestay Berhasil Diperbarui!" : "Homestay Warga Berhasil Ditambahkan!");
      resetForm();
      fetchHomestayData();
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

  const handleDelete = async (id: number, wcProductId?: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus Homestay ini secara permanen?")) return;

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

      if (res.ok && data.success) {
        alert("Homestay berhasil dihapus secara permanen!");
        setHomestays((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert(`Gagal Menghapus: ${data.message || "Periksa koneksi backend."}`);
      }
    } catch (error) {
      console.error("Delete Homestay Error:", error);
      alert("Terjadi kesalahan jaringan saat menghapus Homestay.");
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
            <h1 className="text-xl font-bold text-slate-800">Kelola Homestay Warga</h1>
            <p className="text-xs text-slate-500">Full CRUD: Tambah, Edit, dan Hapus Homestay Warga</p>
          </div>
        </div>

        <button onClick={fetchHomestayData} className="p-2.5 bg-white rounded-xl text-slate-600 hover:bg-slate-50 transition shadow-sm">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              {editingItem ? <Edit3 size={18} className="text-amber-600" /> : <Plus size={18} className="text-emerald-600" />}
              {editingItem ? "Edit Homestay Warga" : "Tambah Homestay Baru"}
            </h2>
            {editingItem && (
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Homestay</label>
              <input
                type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Homestay Saung Bojong 01"
                className="w-full px-3.5 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              />
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

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Pemilik (Warga)</label>
              <input
                type="text" required value={namaPemilik} onChange={(e) => setNamaPemilik(e.target.value)}
                placeholder="Pak Haji Ahmad"
                className="w-full px-3.5 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Sewa/Malam</label>
                <input
                  type="number" required value={harga} onChange={(e) => setHarga(e.target.value)}
                  placeholder="250000"
                  className="w-full px-2.5 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Kapasitas</label>
                <input
                  type="number" required value={kapasitas} onChange={(e) => setKapasitas(Number(e.target.value))}
                  placeholder="4"
                  className="w-full px-2.5 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Jml Kamar</label>
                <input
                  type="number" required value={jumlahKamar} onChange={(e) => setJumlahKamar(Number(e.target.value))}
                  placeholder="2"
                  className="w-full px-2.5 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Fasilitas (Pisahkan Koma)</label>
              <input
                type="text" required value={fasilitasInput} onChange={(e) => setFasilitasInput(e.target.value)}
                placeholder="AC, WiFi, Sarapan, Kamar Mandi Dalam"
                className="w-full px-3.5 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Deskripsi</label>
              <textarea
                rows={3} required value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Detail informasi homestay..."
                className="w-full px-3.5 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit" disabled={isSubmitting}
              className={`w-full py-2.5 font-bold text-xs text-white rounded-xl shadow-md transition disabled:opacity-50 ${
                editingItem ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {isSubmitting ? "Sychronizing..." : editingItem ? "Update Homestay Warga" : "+ Simpan Homestay Warga"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Home size={18} className="text-emerald-600" /> Daftar Homestay Aktif ({homestays.length})
          </h2>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading data...</div>
          ) : homestays.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">Belum ada Homestay.</div>
          ) : (
            <div className="space-y-4">
              {homestays.map((item) => (
                <div key={item.id} className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition bg-slate-50/50 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-200 overflow-hidden relative shrink-0 mt-0.5">
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
                      <h3 className="font-bold text-sm text-slate-800">{item.title?.rendered}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <User size={12} className="text-slate-400" /> Pemilik: {item.acf?.nama_pemilik || "-"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-bold text-emerald-600">
                          <Tag size={12} /> Rp {parseInt(String(item.acf?.harga_per_malam || "0")).toLocaleString("id-ID")} / malam
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
                      onClick={() => handleDelete(item.id, item.acf?.produk_woocommerce_terkait)}
                      className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition"
                      title="Hapus Item"
                    >
                      <Trash2 size={15} />
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