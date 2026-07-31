"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Plus, Trash2, ShoppingBag, RefreshCw, PackageCheck, 
  Edit3, X, Upload, Image as ImageIcon, Box, Scale, Hash, Truck, Ruler 
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: string;
  regular_price: string;
  description: string;
  sku?: string;
  manage_stock?: boolean;
  stock_quantity?: number;
  weight?: string;
  dimensions?: {
    length: string;
    width: string;
    height: string;
  };
  images?: Array<{ id: number; src: string }>;
}

export default function AdminUMKMPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit State
  const [editingItem, setEditingItem] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [sku, setSku] = useState("");
  const [stockQuantity, setStockQuantity] = useState<number | "">(10);
  const [manageStock, setManageStock] = useState(true);
  
  // Shipping State
  const [weight, setWeight] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");

  const [desc, setDesc] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const ck = "ck_3512f4b660cb493791156b8e2a57ed734fe92fe4";
  const cs = "cs_6e530c56ba5fdd875c311c8b24b2429fe5885db3";

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // 🚀 Ditambahkan per_page=100 agar semua produk UMKM terpanggil tanpa batasan pagination default (10 item)
      const res = await fetch(
        `https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wc/v3/products?per_page=100&consumer_key=${ck}&consumer_secret=${cs}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      
      if (Array.isArray(data)) {
        // 🚀 Saring ketat: Buang produk [WISATA], [HOMESTAY], [PAKET], atau yang masuk kategori Booking Engine
        const umkmOnly = data.filter((item: any) => {
          const itemName = (item.name || "").toUpperCase();
          const categories = item.categories || [];

          const isBookingPrefix = 
            itemName.startsWith("[WISATA]") || 
            itemName.startsWith("[HOMESTAY]") || 
            itemName.startsWith("[PAKET]") ||
            itemName.startsWith("[BOOKING]");

          const isBookingCategory = categories.some(
            (cat: any) => cat.name.toLowerCase() === "booking engine"
          );

          return !isBookingPrefix && !isBookingCategory;
        });

        setProducts(umkmOnly);
      }
    } catch (err) {
      console.error("Gagal load produk:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleStartEdit = (item: Product) => {
    setEditingItem(item);
    setName(item.name);
    setPrice(item.regular_price || item.price);
    setSku(item.sku || "");
    setStockQuantity(item.stock_quantity ?? 10);
    setManageStock(item.manage_stock ?? true);
    setWeight(item.weight || "");
    setLength(item.dimensions?.length || "");
    setWidth(item.dimensions?.width || "");
    setHeight(item.dimensions?.height || "");
    setDesc(item.description ? item.description.replace(/<[^>]+>/g, '') : "");
    setImageFile(null);
  };

  const resetForm = () => {
    setEditingItem(null);
    setName("");
    setPrice("");
    setSku("");
    setStockQuantity(10);
    setManageStock(true);
    setWeight("");
    setLength("");
    setWidth("");
    setHeight("");
    setDesc("");
    setImageFile(null);
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let mediaId = 0;

      if (imageFile) {
        const formData = new FormData();
        formData.append("image_file", imageFile);

        const uploadRes = await fetch("https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wc-bridge/v1/upload-image", {
          method: "POST",
          body: formData,
        });

        const rawText = await uploadRes.text();
        let mediaData;
        try {
          mediaData = JSON.parse(rawText);
        } catch (e) {
          console.error("Respon Server Bukan JSON:", rawText);
          alert("Gagal upload: Server mengembalikan format yang tidak valid.");
          setIsSubmitting(false);
          return;
        }

        if (uploadRes.ok && mediaData.success && mediaData.id) {
          mediaId = mediaData.id;
        } else {
          console.error("Gagal upload media:", mediaData);
          alert(`Gagal mengunggah foto: ${mediaData.message || "Kesalahan server internal"}`);
          setIsSubmitting(false);
          return;
        }
      }

      const isEdit = !!editingItem;
      const url = isEdit
        ? `https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wc/v3/products/${editingItem.id}?consumer_key=${ck}&consumer_secret=${cs}`
        : `https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wc/v3/products?consumer_key=${ck}&consumer_secret=${cs}`;

      const payload: any = {
        name: name,
        regular_price: price,
        sku: sku,
        manage_stock: manageStock,
        stock_quantity: manageStock ? Number(stockQuantity) : null,
        weight: weight,
        dimensions: {
          length: length,
          width: width,
          height: height,
        },
        description: desc,
      };

      if (mediaId > 0) {
        payload.images = [{ id: mediaId }];
      }

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(isEdit ? "Produk UMKM Berhasil Diperbarui!" : "Produk UMKM Berhasil Ditambahkan!");
        resetForm();
        fetchProducts();
      } else {
        const errData = await res.json();
        alert(`Gagal menyimpan produk: ${errData.message || "Periksa data"}`);
      }
    } catch (error) {
      console.error("Submit Error:", error);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk UMKM ini secara permanen?")) return;

    try {
      const res = await fetch(`https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wc/v3/products/${id}?force=true&consumer_key=${ck}&consumer_secret=${cs}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Produk berhasil dihapus!");
        setProducts((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert("Gagal menghapus produk.");
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
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
            <h1 className="text-xl font-bold text-slate-800">Kelola Produk UMKM Desa</h1>
            <p className="text-xs text-slate-500">Inventory, Stock, Shipping & Dimensions Sync</p>
          </div>
        </div>

        <button onClick={fetchProducts} className="p-2.5 bg-white rounded-xl text-slate-600 hover:bg-slate-50 transition shadow-sm">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FORM CREATE / EDIT */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              {editingItem ? <Edit3 size={18} className="text-amber-600" /> : <Plus size={18} className="text-emerald-600" />}
              {editingItem ? "Edit Produk UMKM" : "Tambah Produk UMKM"}
            </h2>
            {editingItem && (
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmitProduct} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Produk UMKM</label>
              <input
                type="text" required value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Keripik Singkong Bojong"
                className="w-full px-3.5 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* Upload Foto Produk */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Foto Utama Produk</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 text-center cursor-pointer hover:bg-slate-50 transition relative">
                <input
                  type="file" accept="image/*"
                  onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-1 text-slate-500">
                  <Upload size={18} className="text-emerald-600" />
                  <span className="text-[11px] font-medium">
                    {imageFile ? imageFile.name : "Klik untuk unggah foto produk"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Harga (Rp)</label>
                <input
                  type="number" required value={price} onChange={(e) => setPrice(e.target.value)}
                  placeholder="15000"
                  className="w-full px-3.5 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Hash size={12}/> SKU Produk
                </label>
                <input
                  type="text" value={sku} onChange={(e) => setSku(e.target.value)}
                  placeholder="KRP-SNG-01"
                  className="w-full px-3.5 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Section Inventory / Stok */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Box size={14} className="text-emerald-600"/> Kelola Stok (Inventory)
                </label>
                <input
                  type="checkbox"
                  checked={manageStock}
                  onChange={(e) => setManageStock(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 cursor-pointer"
                />
              </div>

              {manageStock && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Jumlah Stok Available</label>
                  <input
                    type="number" required value={stockQuantity} onChange={(e) => setStockQuantity(Number(e.target.value))}
                    placeholder="100"
                    className="w-full px-3 py-1.5 text-xs bg-white border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              )}
            </div>

            {/* Section Shipping / Pengiriman */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-3">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Truck size={14} className="text-emerald-600"/> Pengiriman (Shipping)
              </label>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Scale size={11}/> Berat Paket (Kg / Gram)
                </label>
                <input
                  type="text" value={weight} onChange={(e) => setWeight(e.target.value)}
                  placeholder="Contoh: 0.25 (dalam kg)"
                  className="w-full px-3 py-1.5 text-xs bg-white border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Ruler size={11}/> Dimensi Kemasan (cm)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text" value={length} onChange={(e) => setLength(e.target.value)}
                    placeholder="P (cm)"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <input
                    type="text" value={width} onChange={(e) => setWidth(e.target.value)}
                    placeholder="L (cm)"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <input
                    type="text" value={height} onChange={(e) => setHeight(e.target.value)}
                    placeholder="T (cm)"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Deskripsi Produk</label>
              <textarea
                rows={3} value={desc} onChange={(e) => setDesc(e.target.value)}
                placeholder="Deskripsi bahan, rasa, dan keunggulan..."
                className="w-full px-3.5 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <button
              type="submit" disabled={isSubmitting}
              className={`w-full py-2.5 font-bold text-xs text-white rounded-xl shadow-md transition disabled:opacity-50 ${
                editingItem ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {isSubmitting ? "Sychronizing..." : editingItem ? "Update Produk UMKM" : "+ Simpan Produk"}
            </button>
          </form>
        </div>

        {/* LIST PRODUK */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <PackageCheck size={18} className="text-emerald-600" /> Daftar Produk Aktif ({products.length})
          </h2>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading data...</div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">Belum ada produk.</div>
          ) : (
            <div className="space-y-3">
              {products.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-200 overflow-hidden relative shrink-0">
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={item.images[0].src}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <ImageIcon size={18} />
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-slate-800">{item.name}</h3>
                      <div className="flex flex-wrap items-center gap-2.5 mt-1 text-xs text-slate-500">
                        <span className="font-semibold text-emerald-600">
                          Rp {parseInt(item.price || item.regular_price || "0").toLocaleString("id-ID")}
                        </span>
                        <span>•</span>
                        <span>Stok: {item.manage_stock ? item.stock_quantity ?? "0" : "Tersedia"}</span>
                        {item.weight && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-slate-600">
                              <Scale size={11}/> {item.weight} kg
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartEdit(item)}
                      className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl transition"
                      title="Edit Produk"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(item.id)}
                      className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition"
                      title="Hapus Produk"
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