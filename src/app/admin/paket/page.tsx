"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { 
  ArrowLeft, Plus, Package, RefreshCw, Clock, Tag, 
  Users, Edit3, Trash2, X, Upload, Image as ImageIcon, Percent, MessageSquare, CreditCard, QrCode, CheckCircle2 
} from "lucide-react";
import { PaketWisata } from "@/types/wisata";

interface PaymentMethod {
  id: number;
  nama_metode: string;
  nomor_rekening: string;
  atas_nama: string;
  instruksi: string;
  qr_image: string | null;
}

export default function AdminPaketPage() {
  const [paketList, setPaketList] = useState<PaketWisata[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [isSavingWa, setIsSavingWa] = useState(false);

  // State Nomor WhatsApp Konfirmasi Admin
  const [adminWhatsApp, setAdminWhatsApp] = useState("6281234567890");

  const [editingItem, setEditingItem] = useState<PaketWisata | null>(null);

  // Form State Paket Wisata
  const [title, setTitle] = useState("");
  const [hargaMinimal, setHargaMinimal] = useState("");
  const [durasiPaket, setDurasiPaket] = useState("2 Hari 1 Malam");
  const [minimalPeserta, setMinimalPeserta] = useState(5);
  const [diskonMinimalPeserta, setDiskonMinimalPeserta] = useState("");
  const [diskonNominal, setDiskonNominal] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // State Multi Galeri Foto Pendukung untuk Paket Wisata
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [existingGallery, setExistingGallery] = useState<string[]>([]);

  // State Dinamis Repeater Fasilitas Paket Wisata (Icon Ceklis)
  const [fasilitasList, setFasilitasList] = useState<string[]>([
    "Pemandu Wisata Profesional", 
    "Konsumsi / Makan Sesuai Jadwal", 
    "Tiket Masuk Destinasi"
  ]);

  // Form State Metode Pembayaran
  const [namaMetode, setNamaMetode] = useState("");
  const [nomorRekening, setNomorRekening] = useState("");
  const [atasNama, setAtasNama] = useState("");
  const [instruksi, setInstruksi] = useState("");
  const [qrFile, setQrFile] = useState<File | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Paket Wisata
      const res = await fetch("https://desa-wisata-bojongrangkas.com/wp-json/wp/v2/paket_wisata?_embed", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) setPaketList(data);

      // 2. Fetch Metode Pembayaran
      const resPay = await fetch("https://desa-wisata-bojongrangkas.com/wp-json/wc-bridge/v1/metode-pembayaran", { cache: "no-store" });
      const dataPay = await resPay.json();
      if (dataPay.success && Array.isArray(dataPay.metode_pembayaran)) {
        setPaymentMethods(dataPay.metode_pembayaran);
      }

      // 3. Fetch Nomor WhatsApp Admin
      const resWa = await fetch("https://desa-wisata-bojongrangkas.com/wp-json/wc-bridge/v1/admin-whatsapp", { cache: "no-store" });
      const dataWa = await resWa.json();
      if (dataWa.success && dataWa.whatsapp_number) {
        setAdminWhatsApp(dataWa.whatsapp_number);
      }
    } catch (err) {
      console.error("Gagal load data:", err);
      toast.error("Gagal memuat data dari server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingWa(true);
    const loadingToast = toast.loading("Menyimpan nomor WhatsApp...");

    try {
      const res = await fetch("https://desa-wisata-bojongrangkas.com/wp-json/wc-bridge/v1/admin-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsapp_number: adminWhatsApp }),
      });
      const data = await res.json();
      toast.dismiss(loadingToast);

      if (data.success) {
        toast.success("Nomor WhatsApp berhasil disimpan!");
      } else {
        toast.error(`Gagal menyimpan: ${data.message || "Kesalahan server"}`);
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setIsSavingWa(false);
    }
  };

  const handleStartEdit = (item: PaketWisata) => {
    setEditingItem(item);
    setTitle(item.title?.rendered || "");
    
    const acf = (item.acf || {}) as any;
    setHargaMinimal(String(acf.harga_minimal ?? acf.harga ?? ""));
    setDurasiPaket(acf.durasi_paket ?? acf.durasi ?? "2 Hari 1 Malam");
    setMinimalPeserta(acf.minimal_peserta ?? 5);
    setDiskonMinimalPeserta(String(acf.diskon_minimal_peserta ?? ""));
    setDiskonNominal(String(acf.diskon_nominal ?? ""));
    setDeskripsi(item.content?.rendered?.replace(/<[^>]+>/g, '') || "");
    
    // Ambil galeri foto pendukung paket jika ada di ACF
    const gallery = acf.gallery_images || acf.gallery_paket || [];
    setExistingGallery(Array.isArray(gallery) ? gallery : []);
    setGalleryFiles([]);

    // Ambil fasilitas khusus paket wisata
    const rawFasilitas = acf.fasilitas_paket || acf.fasilitas || [];
    if (Array.isArray(rawFasilitas) && rawFasilitas.length > 0) {
      setFasilitasList(rawFasilitas);
    } else {
      setFasilitasList(["Pemandu Wisata Profesional", "Konsumsi / Makan Sesuai Jadwal", "Tiket Masuk Destinasi"]);
    }

    setImageFile(null);
  };

  const resetForm = () => {
    setEditingItem(null);
    setTitle("");
    setHargaMinimal("");
    setDurasiPaket("2 Hari 1 Malam");
    setMinimalPeserta(5);
    setDiskonMinimalPeserta("");
    setDiskonNominal("");
    setDeskripsi("");
    setFasilitasList(["Pemandu Wisata Profesional", "Konsumsi / Makan Sesuai Jadwal", "Tiket Masuk Destinasi"]);
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

  const handleSubmitPaket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToast = toast.loading(editingItem ? "Memperbarui paket..." : "Menambahkan paket...");

    try {
      let uploadedImageId = "";
      
      // 1. Upload foto utama jika ada file baru yang dipilih
      if (imageFile) {
        if (imageFile.size > 10 * 1024 * 1024) {
          toast.dismiss(loadingToast);
          toast.error("Ukuran file terlalu besar! Maksimal 10MB.");
          setIsSubmitting(false);
          return;
        }
        const imgFormData = new FormData();
        imgFormData.append("image_file", imageFile);
        const imgRes = await fetch("https://desa-wisata-bojongrangkas.com/wp-json/wc-bridge/v1/upload-image", {
          method: "POST",
          body: imgFormData,
        });
        const imgData = await imgRes.json();
        if (imgData.success) {
          uploadedImageId = imgData.id;
        }
      }

      // 2. Kumpulkan galeri foto (existing + file baru jika ada)
      let allGalleryUrls = [...existingGallery];
      if (galleryFiles.length > 0) {
        for (const file of galleryFiles) {
          const galFormData = new FormData();
          galFormData.append("image_file", file);
          const galRes = await fetch("https://desa-wisata-bojongrangkas.com/wp-json/wc-bridge/v1/upload-image", {
            method: "POST",
            body: galFormData,
          });
          const galData = await galRes.json();
          if (galData.success && galData.source_url) {
            allGalleryUrls.push(galData.source_url);
          }
        }
      }

      // 3. Masukkan seluruh data ke dalam FormData
      const formData = new FormData();
      if (editingItem) formData.append("item_id", String(editingItem.id));
      
      formData.append("post_type", "paket_wisata");
      formData.append("title", title);
      formData.append("harga", hargaMinimal);
      formData.append("durasi_paket", durasiPaket);
      formData.append("kapasitas", String(minimalPeserta));
      formData.append("minimal_peserta", String(minimalPeserta));
      formData.append("diskon_minimal_peserta", diskonMinimalPeserta);
      formData.append("diskon_nominal", diskonNominal);
      
      if (uploadedImageId) {
        formData.append("image_id", uploadedImageId);
      }

      // Filter fasilitas dan galeri agar bersih dari string kosong
      const filteredFasilitas = fasilitasList.map(f => f.trim()).filter(f => f !== "");
      formData.append("fasilitas", JSON.stringify(filteredFasilitas));
      formData.append("gallery_urls", JSON.stringify(allGalleryUrls));
      
      allGalleryUrls.forEach((url) => formData.append("existing_gallery[]", url));
      formData.append("content", deskripsi);

      // 4. Eksekusi Kirim ke Endpoint WordPress
      const res = await fetch("https://desa-wisata-bojongrangkas.com/wp-json/wc-bridge/v1/upsert-item", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (res.ok && data.success) {
        toast.success(editingItem ? "Paket Wisata Berhasil Diperbarui!" : "Paket Wisata Berhasil Ditambahkan!");
        resetForm();
        fetchData();
      } else {
        toast.error(`Gagal menyimpan: ${data.message || "Kesalahan server"}`);
      }
    } catch (error) {
      console.error("Submit Paket Error:", error);
      toast.dismiss(loadingToast);
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePaket = async (id: number, wcProductId?: number) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold text-slate-800">Apakah Anda yakin ingin menghapus Paket Wisata ini?</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const loadingToast = toast.loading("Menghapus paket...");
              try {
                const res = await fetch("https://desa-wisata-bojongrangkas.com/wp-json/wc-bridge/v1/delete-item", {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: id, wc_product_id: wcProductId || 0 }),
                });
                const data = await res.json();
                toast.dismiss(loadingToast);
                if (res.ok && data.success) {
                  toast.success("Paket berhasil dihapus!");
                  setPaketList((prev) => prev.filter((item) => item.id !== id));
                  if (editingItem?.id === id) resetForm();
                } else {
                  toast.error("Gagal menghapus paket.");
                }
              } catch (err) {
                toast.dismiss(loadingToast);
                toast.error("Kesalahan jaringan.");
              }
            }}
            className="px-3 py-1.5 bg-red-600 text-white text-[10px] font-bold rounded-lg"
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
      if (qrFile) formData.append("image_file", qrFile);

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
        fetchData();
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
    const loadingToast = toast.loading("Menghapus metode pembayaran...");
    try {
      const res = await fetch(`https://desa-wisata-bojongrangkas.com/wp-json/wc-bridge/v1/metode-pembayaran?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      toast.dismiss(loadingToast);
      if (data.success) {
        toast.success("Metode pembayaran dihapus!");
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="p-2.5 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition shrink-0">
            <ArrowLeft size={18} className="text-slate-700" />
          </Link>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800">Kelola Paket Wisata & Pembayaran</h1>
            <p className="text-xs text-slate-500">CRUD Paket Wisata, Fasilitas Ceklis, Galeri Foto & Rekening</p>
          </div>
        </div>

        <button onClick={fetchData} className="self-start sm:self-auto p-2.5 bg-white rounded-xl text-slate-600 hover:bg-slate-50 transition shadow-sm flex items-center gap-2 text-xs font-medium">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          <span className="sm:hidden">Refresh Data</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        
        {/* KOLOM KIRI: WHATSAPP, FORM PAKET, & FORM PEMBAYARAN */}
        <div className="space-y-6">
          
          {/* Form WhatsApp Konfirmasi */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/60">
            <h2 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
              <MessageSquare size={18} className="text-emerald-600" /> WhatsApp Konfirmasi
            </h2>
            <p className="text-[11px] text-slate-500 mb-3">Nomor tujuan user untuk konfirmasi pembayaran paket wisata.</p>
            <form onSubmit={handleSaveWhatsApp} className="space-y-3">
              <input
                type="text" required value={adminWhatsApp} onChange={(e) => setAdminWhatsApp(e.target.value)}
                placeholder="6281234567890"
                className="w-full px-3.5 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit" disabled={isSavingWa}
                className="w-full py-2 font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition disabled:opacity-50"
              >
                {isSavingWa ? "Menyimpan..." : "Simpan Nomor WhatsApp"}
              </button>
            </form>
          </div>

          {/* Form Input Paket Wisata */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/60">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                {editingItem ? <Edit3 size={18} className="text-amber-600" /> : <Plus size={18} className="text-emerald-600" />}
                {editingItem ? "Edit Paket Wisata" : "Tambah Paket Wisata"}
              </h2>
              {editingItem && (
                <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
              )}
            </div>

            <form onSubmit={handleSubmitPaket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Paket Wisata</label>
                <input
                  type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Paket Camping Bojong Rangkas"
                  className="w-full px-3.5 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
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
                      {imageFile ? imageFile.name : (editingItem ? "Ganti foto (Opsional)" : "Pilih foto utama")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Multi Galeri Foto Pendukung */}
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

              <div className="bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-2xl space-y-3">
                <label className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <Percent size={14} className="text-emerald-600" /> Pengaturan Diskon Rombongan
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Min. Orang Diskon</label>
                    <input
                      type="number" value={diskonMinimalPeserta} onChange={(e) => setDiskonMinimalPeserta(e.target.value)}
                      placeholder="10"
                      className="w-full px-3.5 py-2 text-xs bg-white border rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Potongan / Orang (Rp)</label>
                    <input
                      type="number" value={diskonNominal} onChange={(e) => setDiskonNominal(e.target.value)}
                      placeholder="25000"
                      className="w-full px-3.5 py-2 text-xs bg-white border rounded-xl outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Fasilitas Paket Khusus dengan Icon Ceklis */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600" /> Fasilitas Paket Wisata
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
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                      <input
                        type="text" value={fasilitas}
                        onChange={(e) => handleFasilitasChange(e.target.value, index)}
                        placeholder="Contoh: Pemandu Wisata"
                        className="w-full px-3 py-1.5 text-xs bg-white border rounded-lg outline-none"
                      />
                      <button type="button" onClick={() => handleRemoveFasilitasRow(index)} className="text-red-600 p-1 hover:bg-red-50 rounded-lg shrink-0">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Durasi Paket</label>
                <input
                  type="text" required value={durasiPaket} onChange={(e) => setDurasiPaket(e.target.value)}
                  placeholder="2 Hari 1 Malam"
                  className="w-full px-3.5 py-2 text-xs border rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Deskripsi Paket</label>
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
                {isSubmitting ? "Menyimpan..." : editingItem ? "Update Paket Wisata" : "+ Simpan Paket Wisata"}
              </button>
            </form>
          </div>

          {/* Form Tambah Metode Pembayaran */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/60">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-blue-600" /> Tambah Metode Pembayaran
            </h2>
            <form onSubmit={handleSubmitPaymentMethod} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Metode / Bank</label>
                <input
                  type="text" required value={namaMetode} onChange={(e) => setNamaMetode(e.target.value)}
                  placeholder="Contoh: SeaBank / QRIS"
                  className="w-full px-3.5 py-2 text-xs border rounded-xl outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">No. Rekening / HP</label>
                  <input
                    type="text" value={nomorRekening} onChange={(e) => setNomorRekening(e.target.value)}
                    placeholder="901976099"
                    className="w-full px-3.5 py-2 text-xs border rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Atas Nama</label>
                  <input
                    type="text" value={atasNama} onChange={(e) => setAtasNama(e.target.value)}
                    placeholder="BUMDes"
                    className="w-full px-3.5 py-2 text-xs border rounded-xl outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Upload QR / Logo (Opsional)</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 text-center cursor-pointer hover:bg-slate-50 relative">
                  <input
                    type="file" accept="image/*"
                    onChange={(e) => setQrFile(e.target.files ? e.target.files[0] : null)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex items-center justify-center gap-2 text-slate-500">
                    <QrCode size={16} className="text-blue-600" />
                    <span className="text-xs truncate max-w-[200px]">{qrFile ? qrFile.name : "Pilih gambar QR"}</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Instruksi Pembayaran</label>
                <textarea
                  rows={2} value={instruksi} onChange={(e) => setInstruksi(e.target.value)}
                  placeholder="Buka aplikasi..."
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

        {/* KOLOM KANAN: DAFTAR PAKET WISATA & METODE PEMBAYARAN */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Daftar Paket Wisata */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/60">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Package size={18} className="text-emerald-600" /> Daftar Paket Wisata ({paketList.length})
            </h2>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading data...</div>
            ) : paketList.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">Belum ada Paket Wisata.</div>
            ) : (
              <div className="space-y-3">
                {paketList.map((item) => {
                  const acf = (item.acf || {}) as any;
                  return (
                    <div key={item.id} className="p-3.5 sm:p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 w-full sm:w-auto overflow-hidden">
                        <div className="w-14 h-14 rounded-xl bg-slate-200 overflow-hidden relative shrink-0">
                          {item._embedded?.["wp:featuredmedia"]?.[0]?.source_url ? (
                            <img src={item._embedded["wp:featuredmedia"][0].source_url} alt="Thumb" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon size={18} /></div>
                          )}
                        </div>
                        <div className="min-w-0 flex-grow">
                          <h3 className="font-bold text-sm text-slate-800 truncate">{item.title?.rendered}</h3>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1 font-bold text-emerald-600">
                              <Tag size={12} /> Rp {parseInt(String(acf.harga_minimal || acf.harga || "0")).toLocaleString("id-ID")}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Clock size={12} /> {acf.durasi_paket || acf.durasi || "1 Hari"}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Users size={12} /> Min {acf.minimal_peserta || 1} Orang</span>
                            {acf.diskon_nominal && Number(acf.diskon_nominal) > 0 && (
                              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold text-[10px]">
                                Diskon Rp {parseInt(acf.diskon_nominal).toLocaleString("id-ID")} (&ge; {acf.diskon_minimal_peserta || 0} org)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 w-full sm:w-auto justify-end">
                        <button onClick={() => handleStartEdit(item)} className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl transition text-xs font-semibold px-3 flex items-center gap-1">
                          <Edit3 size={14} /> Edit
                        </button>
                        <button onClick={() => handleDeletePaket(item.id, acf.produk_woocommerce_terkait)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition text-xs font-semibold px-3 flex items-center gap-1">
                          <Trash2 size={14} /> Hapus
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Daftar Metode Pembayaran Aktif */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/60">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-blue-600" /> Metode Pembayaran Aktif ({paymentMethods.length})
            </h2>

            {paymentMethods.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">Belum ada metode pembayaran.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 flex flex-col justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {method.qr_image && (
                        <div className="w-16 h-16 rounded-lg bg-white border p-1 shrink-0 overflow-hidden">
                          <img src={method.qr_image} alt="QR" className="w-full h-full object-contain" />
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