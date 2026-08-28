"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { 
  ArrowLeft, Plus, Home, RefreshCw, User, Tag, 
  Edit3, Trash2, X, Upload, Image as ImageIcon, CheckCircle2, 
  CreditCard, QrCode 
} from "lucide-react";
import { HomestayWarga } from "@/types/homestay";

interface PaymentMethod {
  id: number;
  nama_metode: string;
  nomor_rekening: string;
  atas_nama: string;
  instruksi: string;
  qr_image: string | null;
}

export default function AdminHomestayPage() {
  const [homestays, setHomestays] = useState<HomestayWarga[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  const [editingItem, setEditingItem] = useState<HomestayWarga | null>(null);

  const [title, setTitle] = useState("");
  const [namaPemilik, setNamaPemilik] = useState("");
  const [harga, setHarga] = useState("");
  const [kapasitas, setKapasitas] = useState(2);
  const [jumlahKamar, setJumlahKamar] = useState(1);
  const [deskripsi, setDeskripsi] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // State Multi Galeri Foto Pendukung
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [existingGallery, setExistingGallery] = useState<string[]>([]);

  // State Dinamis Repeater Fasilitas
  const [fasilitasList, setFasilitasList] = useState<string[]>(["WiFi Gratis", "AC Pendingin Ruangan", "Sarapan Pagi"]);

  // State Form Metode Pembayaran
  const [namaMetode, setNamaMetode] = useState("");
  const [nomorRekening, setNomorRekening] = useState("");
  const [atasNama, setAtasNama] = useState("");
  const [instruksi, setInstruksi] = useState("");
  const [qrFile, setQrFile] = useState<File | null>(null);

  const fetchHomestayData = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://desa-wisata-bojongrangkas.com/wp-json/wp/v2/homestay?_embed", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) setHomestays(data);

      const resPay = await fetch("https://desa-wisata-bojongrangkas.com/wp-json/wc-bridge/v1/metode-pembayaran", { cache: "no-store" });
      const dataPay = await resPay.json();
      if (dataPay.success && Array.isArray(dataPay.metode_pembayaran)) {
        setPaymentMethods(dataPay.metode_pembayaran);
      }
    } catch (err) {
      console.error("Gagal load data:", err);
      toast.error("Gagal memuat data dari server.");
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
    
    const acf = item.acf as any || {};
    
    setNamaPemilik(acf.nama_pemilik || acf.field_nama_pemilik || "");
    
    const hargaVal = acf.harga_per_malam || acf.harga || acf.field_harga_per_malam || "";
    setHarga(String(hargaVal));
    
    setKapasitas(Number(acf.kapasitas_maksimal || acf.kapasitas || 2));
    setJumlahKamar(Number(acf.jumlah_kamar_tersedia || acf.jumlah_kamar || 1));
    
    setDeskripsi(item.content?.rendered?.replace(/<[^>]+>/g, '') || "");
    
    const gallery = acf.gallery_images || acf.gallery_homestay || [];
    setExistingGallery(Array.isArray(gallery) ? gallery : []);
    setGalleryFiles([]);
    
    const rawFasilitas = acf.fasilitas_homestay || acf.fasilitas || [];
    if (Array.isArray(rawFasilitas) && rawFasilitas.length > 0) {
      setFasilitasList(rawFasilitas);
    } else {
      setFasilitasList(["WiFi Gratis", "AC Pendingin Ruangan", "Sarapan Pagi"]);
    }
    setImageFile(null);
  };

  const resetForm = () => {
    setEditingItem(null);
    setTitle("");
    setNamaPemilik("");
    setHarga("");
    setKapasitas(2);
    setJumlahKamar(1);
    setDeskripsi("");
    setFasilitasList(["WiFi Gratis", "AC Pendingin Ruangan", "Sarapan Pagi"]);
    setImageFile(null);
    setGalleryFiles([]);
    setExistingGallery([]);
  };

  const handleAddFasilitasRow = () => {
    setFasilitasList([...fasilitasList, ""]);
  };

  const handleRemoveFasilitasRow = (index: number) => {
    const list = [...fasilitasList];
    list.splice(index, 1);
    setFasilitasList(list);
  };

  const handleFasilitasChange = (value: string, index: number) => {
    const list = [...fasilitasList];
    list[index] = value;
    setFasilitasList(list);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToast = toast.loading(editingItem ? "Memperbarui homestay..." : "Menambahkan homestay...");

    try {
      const formData = new FormData();
      if (editingItem) formData.append("item_id", String(editingItem.id));
      formData.append("post_type", "homestay"); 
      formData.append("title", title);
      formData.append("nama_pemilik", namaPemilik);
      formData.append("harga", harga);
      formData.append("kapasitas", String(kapasitas));
      formData.append("jumlah_kamar", String(jumlahKamar));
      
      const filteredFasilitas = fasilitasList.map(f => f.trim()).filter(f => f !== "");
      formData.append("fasilitas", JSON.stringify(filteredFasilitas));

      formData.append("content", deskripsi);

      if (imageFile) {
        if (imageFile.size > 10 * 1024 * 1024) {
          toast.dismiss(loadingToast);
          toast.error("Ukuran file terlalu besar! Maksimal 10MB.");
          setIsSubmitting(false);
          return;
        }
        formData.append("image_file", imageFile); 
      }

      existingGallery.forEach((url) => formData.append("existing_gallery[]", url));
      galleryFiles.forEach((file) => formData.append("gallery_files[]", file));

      // CATATAN: Jangan sertakan header Content-Type agar browser menangani boundary FormData secara otomatis.
      const res = await fetch("https://desa-wisata-bojongrangkas.com/wp-json/wc-bridge/v1/upsert-item", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (res.ok && data.success) {
        toast.success(editingItem ? "Homestay Berhasil Diperbarui!" : "Homestay Berhasil Ditambahkan!");
        resetForm();
        fetchHomestayData();
      } else {
        toast.error(`Gagal menyimpan: ${data.message || "Terjadi kesalahan"}`);
      }
    } catch (error) {
      console.error("Submit Error:", error);
      toast.dismiss(loadingToast);
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold text-slate-800">Yakin ingin menghapus homestay ini secara permanen?</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const loadingToast = toast.loading("Menghapus homestay...");
              try {
                const res = await fetch("https://desa-wisata-bojongrangkas.com/wp-json/wc-bridge/v1/delete-item", {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id }),
                });
                const data = await res.json();
                toast.dismiss(loadingToast);
                if (data.success) {
                  toast.success("Homestay berhasil dihapus!");
                  setHomestays(prev => prev.filter(item => item.id !== id));
                } else {
                  toast.error("Gagal menghapus.");
                }
              } catch (err) {
                toast.dismiss(loadingToast);
                toast.error("Kesalahan jaringan.");
              }
            }}
            className="px-3 py-1.5 bg-red-600 text-white text-[10px] font-bold rounded-lg hover:bg-red-700 transition"
          >
            Ya, Hapus
          </button>
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg">
            Batal
          </button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const handleSubmitPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingPayment(true);
    const loadingToast = toast.loading("Menyimpan metode pembayaran...");

    try {
      const formData = new FormData();
      formData.append("nama_metode", namaMetode);
      formData.append("nomor_rekening", nomorRekening);
      formData.append("atas_nama", atasNama);
      formData.append("instruksi", instruksi);
      if (qrFile) {
        if (qrFile.size > 10 * 1024 * 1024) {
          toast.dismiss(loadingToast);
          toast.error("Ukuran file QR maksimal 10MB!");
          setIsSubmittingPayment(false);
          return;
        }
        formData.append("image_file", qrFile);
      }

      const res = await fetch("https://desa-wisata-bojongrangkas.com/wp-json/wc-bridge/v1/metode-pembayaran", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      toast.dismiss(loadingToast);
      if (data.success) {
        toast.success("Metode pembayaran berhasil ditambahkan!");
        setNamaMetode("");
        setNomorRekening("");
        setAtasNama("");
        setInstruksi("");
        setQrFile(null);
        fetchHomestayData();
      } else {
        toast.error(`Gagal: ${data.message || "Kesalahan server"}`);
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleDeletePaymentMethod = async (id: number) => {
    const loadingToast = toast.loading("Menghapus metode...");
    try {
      const res = await fetch(`https://desa-wisata-bojongrangkas.com/wp-json/wc-bridge/v1/metode-pembayaran?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      toast.dismiss(loadingToast);
      if (data.success) {
        toast.success("Metode dihapus!");
        setPaymentMethods((prev) => prev.filter((m) => m.id !== id));
      } else {
        toast.error("Gagal menghapus.");
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Kesalahan jaringan.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/admin" className="p-2.5 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition shrink-0">
            <ArrowLeft size={18} className="text-slate-700" />
          </Link>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800">Kelola Homestay Warga & Metode Pembayaran</h1>
            <p className="text-xs text-slate-500">Full CRUD Homestay, Fasilitas Dinamis, Galeri Foto & Pengaturan Rekening</p>
          </div>
        </div>

        <button onClick={fetchHomestayData} className="p-2.5 bg-white rounded-xl text-slate-600 hover:bg-slate-50 transition shadow-sm shrink-0 flex items-center gap-2 text-xs font-medium">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          <span className="hidden sm:inline">Refresh Data</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        
        {/* KOLOM KIRI: FORM HOMESTAY & FORM PEMBAYARAN */}
        <div className="space-y-6">
          {/* FORM HOMESTAY */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/60">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                {editingItem ? <Edit3 size={18} className="text-amber-600" /> : <Plus size={18} className="text-emerald-600" />}
                {editingItem ? "Edit Homestay" : "Tambah Homestay"}
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
                  placeholder="Homestay Saung Bojong"
                  className="w-full px-3.5 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Foto Utama <span className="text-[10px] text-slate-400 font-normal">(Maks. 10MB)</span></label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 text-center cursor-pointer hover:bg-slate-50 transition relative">
                  <input
                    type="file" accept="image/*"
                    onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center gap-1 text-slate-500">
                    <Upload size={18} className="text-emerald-600" />
                    <span className="text-[11px] font-medium truncate max-w-[200px]">
                      {imageFile ? imageFile.name : "Klik untuk unggah foto utama"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Galeri Foto Pendukung (Multi-Foto)</label>
                <input
                  type="file" accept="image/*" multiple
                  onChange={(e) => { if (e.target.files) setGalleryFiles(Array.from(e.target.files)); }}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
                {existingGallery.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {existingGallery.map((url, idx) => (
                      <div key={idx} className="relative w-12 h-12 rounded-lg overflow-hidden border group">
                        <img src={url} alt="Gallery" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setExistingGallery(existingGallery.filter((_, i) => i !== idx))}
                          className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Pemilik (Warga)</label>
                <input
                  type="text" required value={namaPemilik} onChange={(e) => setNamaPemilik(e.target.value)}
                  placeholder="Pak Ahmad"
                  className="w-full px-3.5 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Sewa/Malam</label>
                  <input
                    type="number" required value={harga} onChange={(e) => setHarga(e.target.value)}
                    placeholder="250000"
                    className="w-full px-2.5 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Kapasitas</label>
                  <input
                    type="number" required value={kapasitas} onChange={(e) => setKapasitas(Number(e.target.value))}
                    className="w-full px-2.5 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Jml Kamar</label>
                  <input
                    type="number" required value={jumlahKamar} onChange={(e) => setJumlahKamar(Number(e.target.value))}
                    className="w-full px-2.5 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600" /> Fasilitas Homestay
                  </label>
                  <button
                    type="button" onClick={handleAddFasilitasRow}
                    className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-700 transition"
                  >
                    + Tambah
                  </button>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {fasilitasList.map((fasilitas, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text" value={fasilitas}
                        onChange={(e) => handleFasilitasChange(e.target.value, index)}
                        placeholder="WiFi / AC"
                        className="w-full px-3 py-1.5 text-xs bg-white border rounded-lg outline-none"
                      />
                      <button type="button" onClick={() => handleRemoveFasilitasRow(index)} className="text-red-600 p-1 hover:bg-red-50 rounded-lg">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Deskripsi</label>
                <textarea
                  rows={3} required value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Detail informasi..."
                  className="w-full px-3.5 py-2 text-xs border rounded-xl outline-none resize-none"
                />
              </div>

              <button
                type="submit" disabled={isSubmitting}
                className={`w-full py-2.5 font-bold text-xs text-white rounded-xl shadow-md transition disabled:opacity-50 ${
                  editingItem ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {isSubmitting ? "Menyimpan..." : editingItem ? "Update Homestay" : "+ Simpan Homestay"}
              </button>
            </form>
          </div>

          {/* FORM TAMBAH METODE PEMBAYARAN */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/60">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-blue-600" /> Tambah Metode Pembayaran
            </h2>
            <form onSubmit={handleSubmitPaymentMethod} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Metode / Bank / E-Wallet</label>
                <input
                  type="text" required value={namaMetode} onChange={(e) => setNamaMetode(e.target.value)}
                  placeholder="Contoh: QRIS Desa / Bank Mandiri"
                  className="w-full px-3.5 py-2 text-xs border rounded-xl outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nomor Rekening / No HP</label>
                  <input
                    type="text" value={nomorRekening} onChange={(e) => setNomorRekening(e.target.value)}
                    placeholder="1234567890"
                    className="w-full px-3.5 py-2 text-xs border rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Atas Nama</label>
                  <input
                    type="text" value={atasNama} onChange={(e) => setAtasNama(e.target.value)}
                    placeholder="BUMDes Bojongrangkas"
                    className="w-full px-3.5 py-2 text-xs border rounded-xl outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Upload QR / Logo <span className="text-[10px] text-slate-400 font-normal">(Maks. 10MB)</span></label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 text-center cursor-pointer hover:bg-slate-50 transition relative">
                  <input
                    type="file" accept="image/*"
                    onChange={(e) => setQrFile(e.target.files ? e.target.files[0] : null)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center gap-1 text-slate-500">
                    <QrCode size={18} className="text-blue-600" />
                    <span className="text-[11px] font-medium truncate max-w-[200px]">
                      {qrFile ? qrFile.name : "Pilih gambar QR / Logo"}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Instruksi Pembayaran</label>
                <textarea
                  rows={2} value={instruksi} onChange={(e) => setInstruksi(e.target.value)}
                  placeholder="Scan QRIS atau transfer..."
                  className="w-full px-3.5 py-2 text-xs border rounded-xl outline-none resize-none"
                />
              </div>
              <button
                type="submit" disabled={isSubmittingPayment}
                className="w-full py-2.5 font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition disabled:opacity-50"
              >
                {isSubmittingPayment ? "Menyimpan..." : "+ Tambah Metode Pembayaran"}
              </button>
            </form>
          </div>
        </div>

        {/* KOLOM KANAN: LIST HOMESTAY & LIST PEMBAYARAN */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Home size={18} className="text-emerald-600" /> Daftar Homestay Aktif ({homestays.length})
            </h2>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading data...</div>
            ) : homestays.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">Belum ada Homestay.</div>
            ) : (
              <div className="space-y-3">
                {homestays.map((item) => {
                  const acf = item.acf as any || {};
                  const ownerName = acf.nama_pemilik || "-";
                  const priceVal = parseInt(String(acf.harga_per_malam || acf.harga || "0"));

                  return (
                    <div key={item.id} className="p-3.5 sm:p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full">
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-slate-200 overflow-hidden relative shrink-0">
                          {item._embedded?.["wp:featuredmedia"]?.[0]?.source_url ? (
                            <img src={item._embedded["wp:featuredmedia"][0].source_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon size={18} /></div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-sm text-slate-800 truncate">{item.title?.rendered}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1 font-semibold text-slate-700">
                              <User size={12} /> Pemilik: {ownerName}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-bold text-emerald-600">
                              <Tag size={12} /> Rp {priceVal.toLocaleString("id-ID")} / malam
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                        <button onClick={() => handleStartEdit(item)} className="p-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition text-xs font-semibold px-2.5 flex items-center gap-1">
                          <Edit3 size={14} /> Edit
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition text-xs font-semibold px-2.5">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/60">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-blue-600" /> Metode Pembayaran Aktif ({paymentMethods.length})
            </h2>

            {paymentMethods.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">Belum ada metode pembayaran ditambahkan.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 flex flex-col justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {method.qr_image && (
                        <div className="w-16 h-16 rounded-lg bg-white border p-1 shrink-0 overflow-hidden">
                          <img src={method.qr_image} alt={method.nama_metode} className="w-full h-full object-contain" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-sm text-slate-800 truncate">{method.nama_metode}</h3>
                        {method.nomor_rekening && <p className="text-xs font-medium text-slate-600 mt-0.5">No: {method.nomor_rekening}</p>}
                        {method.atas_nama && <p className="text-[11px] text-slate-500">A/N: {method.atas_nama}</p>}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                      <span className="text-[10px] text-slate-400 truncate max-w-[180px]">{method.instruksi}</span>
                      <button
                        onClick={() => handleDeletePaymentMethod(method.id)}
                        className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition text-[11px] font-semibold flex items-center gap-1"
                      >
                        <Trash2 size={13} /> Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}