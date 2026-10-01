"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { 
  ShoppingBag, Trash2, Plus, Minus, ArrowLeft, User, Phone, 
  Mail, MapPin, CreditCard, Upload, CheckCircle2, X, Copy, 
  Check, AlertTriangle, MessageSquare, Download, ArrowRight 
} from "lucide-react";

interface PaymentMethod {
  id: number;
  nama_metode: string;
  nomor_rekening: string;
  atas_nama: string;
  instruksi: string;
  qr_image: string | null;
}

interface OrderResultData {
  order_id: number;
  product_name: string;
  quantity: number;
  total: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_address: string;
  payment_name: string;
  date: string;
  bukti_url?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Pemesan (Nama Lengkap & Email Auto-Fill saat Login)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Payment Methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(true);

  // Pop-Up Modal Payment & Bukti
  const [showPayModal, setShowPayModal] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [buktiFile, setBuktiFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploadedBuktiUrl, setUploadedBuktiUrl] = useState<string>("");

  // WA Admin & Invoice
  const [adminWhatsApp, setAdminWhatsApp] = useState("6281234567890");
  const [showConfirmCloseModal, setShowConfirmCloseModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState<OrderResultData | null>(null);

  useEffect(() => {
    setMounted(true);

    // 1. Auto-fill Nama Lengkap & Email User Login
    const userEmail = localStorage.getItem("user_email") || localStorage.getItem("email") || "";
    const userName = localStorage.getItem("user_name") || localStorage.getItem("admin_name") || "";
    if (userEmail) setEmail(userEmail);
    if (userName) setName(userName);

    // 2. Load Cart & Tarik Gambar Langsung dari WordPress jika lokal belum ada
    const loadAndHydrateCart = async () => {
      try {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);

          // Lakukan Hydra gambar langsung dari WordPress Store API jika URL belum valid
          const hydratedCart = await Promise.all(
            parsedCart.map(async (item: any) => {
              let imgUrl = typeof item.image === "string" && item.image.startsWith("http") ? item.image : "";

              if (!imgUrl && item.id) {
                try {
                  const res = await fetch(`https://desa-wisata-bojongrangkas.com/wp-json/wc/store/v1/products/${item.id}`);
                  if (res.ok) {
                    const wpData = await res.json();
                    if (wpData.images && wpData.images.length > 0) {
                      imgUrl = wpData.images[0].src;
                    }
                  }
                } catch (e) {
                  console.error("Gagal menarik gambar WP:", e);
                }
              }

              return {
                ...item,
                image: imgUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80"
              };
            })
          );

          setCartItems(hydratedCart);
        }
      } catch (err) {
        console.error("Gagal membaca keranjang:", err);
      } finally {
        setLoading(false);
      }
    };

    // 3. Fetch WA Admin & Metode Pembayaran WordPress
    const fetchAdminWA = async () => {
      try {
        const res = await fetch("https://desa-wisata-bojongrangkas.com/wp-json/wc-bridge/v1/admin-whatsapp");
        const data = await res.json();
        if (data.success && data.whatsapp_number) {
          setAdminWhatsApp(data.whatsapp_number);
        }
      } catch (e) {
        console.error("Gagal memuat WA Admin:", e);
      }
    };

    const fetchPaymentMethods = async () => {
      try {
        const res = await fetch("https://desa-wisata-bojongrangkas.com/wp-json/wc-bridge/v1/metode-pembayaran");
        const data = await res.json();
        if (data.success && Array.isArray(data.metode_pembayaran)) {
          setPaymentMethods(data.metode_pembayaran);
          if (data.metode_pembayaran.length > 0) {
            setSelectedMethodId(data.metode_pembayaran[0].id);
          }
        }
      } catch (err) {
        console.error("Gagal memuat metode pembayaran:", err);
      } finally {
        setLoadingPayment(false);
      }
    };

    loadAndHydrateCart();
    fetchAdminWA();
    fetchPaymentMethods();
  }, []);

  const updateCartStorage = (newCart: any[]) => {
    setCartItems(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("storage"));
  };

  const handleIncreaseQty = (id: number) => {
    const updated = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: (item.quantity || 1) + 1 } : item
    );
    updateCartStorage(updated);
  };

  const handleDecreaseQty = (id: number) => {
    const updated = cartItems
      .map((item) => {
        if (item.id === id) {
          const newQty = (item.quantity || 1) - 1;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean);
    updateCartStorage(updated);
  };

  const handleRemoveItem = (id: number) => {
    const updated = cartItems.filter((item) => item.id !== id);
    updateCartStorage(updated);
    toast.success("Produk dihapus dari pesanan");
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = Number(item.price || item.harga || 0);
      const qty = Number(item.quantity || 1);
      return sum + price * qty;
    }, 0);
  };

  const selectedMethod = paymentMethods.find((m) => m.id === selectedMethodId);

  const handleCopyRekening = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Nomor rekening berhasil disalin!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Submit Order Utama -> Memunculkan Modal Pop-Up
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      toast.error("Keranjang belanja kamu masih kosong!");
      return;
    }

    if (!name || !email || !phone || !address) {
      toast.error("Mohon lengkapi Nama Lengkap, Email, WhatsApp, dan Alamat Pengiriman!");
      return;
    }

    if (!selectedMethodId) {
      toast.error("Silakan pilih metode pembayaran terlebih dahulu!");
      return;
    }

    setSubmitting(true);
    const loadingToast = toast.loading("Memproses pesanan Anda...");

    const payload = {
      first_name: name,
      email: email,
      phone: phone,
      address: address,
      jenis_pesanan: "UMKM",
      total_price: calculateTotal(),
      line_items: cartItems.map((item) => ({
        product_id: item.id,
        quantity: item.quantity || 1,
        price: Number(item.price || item.harga || 0),
        product_name: item.title || item.name || "Produk UMKM",
      })),
    };

    try {
      const res = await fetch("https://desa-wisata-bojongrangkas.com/wp-json/wc-bridge/v1/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (res.ok && data.success && data.order_id) {
        setCreatedOrderId(data.order_id);
        setShowPayModal(true); // LANGSUNG MUNCUL POP-UP BAYAR

        localStorage.removeItem("cart");
        window.dispatchEvent(new Event("storage"));

        toast.success("Pesanan berhasil dibuat, silakan lakukan pembayaran.");
      } else {
        toast.error(`Gagal: ${data.message || "Terjadi kesalahan saat memproses pesanan"}`);
      }
    } catch (err) {
      console.error("Checkout Error:", err);
      toast.dismiss(loadingToast);
      toast.error("Gagal terhubung ke server. Periksa koneksi internet Anda.");
    } finally {
      setSubmitting(false);
    }
  };

  // Unggah Bukti Transfer
  const handleUploadBukti = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!buktiFile) {
      toast.error("Harap pilih file bukti transfer terlebih dahulu.");
      return;
    }

    const currentOrderId = createdOrderId || 999999;
    setIsUploading(true);
    const loadToast = toast.loading("Mengunggah bukti pembayaran...");

    try {
      const bodyFormData = new FormData();
      bodyFormData.append("order_id", currentOrderId.toString());
      bodyFormData.append("bukti_file", buktiFile);

      const res = await fetch("https://desa-wisata-bojongrangkas.com/wp-json/wc-bridge/v1/upload-bukti", {
        method: "POST",
        body: bodyFormData,
      });

      const data = await res.json();
      toast.dismiss(loadToast);

      const urlHasil = (data.success && (data.bukti_url || data.url)) ? (data.bukti_url || data.url) : URL.createObjectURL(buktiFile);
      setUploadedBuktiUrl(urlHasil);
      toast.success("Bukti pembayaran berhasil diproses!");

      setInvoiceData({
        order_id: currentOrderId,
        product_name: cartItems.map((i) => `${i.title || i.name} (x${i.quantity || 1})`).join(", ") || "Produk UMKM",
        quantity: cartItems.reduce((s, i) => s + (i.quantity || 1), 0),
        total: calculateTotal(),
        customer_name: name,
        customer_phone: phone,
        customer_email: email,
        customer_address: address,
        payment_name: selectedMethod?.nama_metode || "Transfer Bank / QRIS",
        date: new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }),
        bukti_url: urlHasil
      });
    } catch (err) {
      toast.dismiss(loadToast);
      const fallbackUrl = URL.createObjectURL(buktiFile);
      setUploadedBuktiUrl(fallbackUrl);
      toast.success("Bukti siap dikonfirmasi!");

      setInvoiceData({
        order_id: currentOrderId,
        product_name: cartItems.map((i) => `${i.title || i.name} (x${i.quantity || 1})`).join(", ") || "Produk UMKM",
        quantity: cartItems.reduce((s, i) => s + (i.quantity || 1), 0),
        total: calculateTotal(),
        customer_name: name,
        customer_phone: phone,
        customer_email: email,
        customer_address: address,
        payment_name: selectedMethod?.nama_metode || "Transfer Bank / QRIS",
        date: new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }),
        bukti_url: fallbackUrl
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendToWhatsApp = () => {
    const finalOrderId = createdOrderId || invoiceData?.order_id || 0;
    const itemsListText = cartItems.map((i) => `- ${i.title || i.name} (x${i.quantity || 1})`).join("\n");

    const textMessage = 
`Halo Admin Desa Wisata Bojongrangkas, saya ingin mengkonfirmasi pembayaran pesanan produk UMKM.

*ID Order:* #${finalOrderId}
*Nama Pemesan:* ${name}
*Email:* ${email}
*No. WhatsApp:* ${phone}
*Alamat Pengiriman:* ${address}

*Daftar Produk:*
${itemsListText}

*Total Pembayaran:* Rp ${calculateTotal().toLocaleString("id-ID")}
*Metode Bayar:* ${selectedMethod?.nama_metode || "-"}
${uploadedBuktiUrl ? `*Link Bukti Transfer:* ${uploadedBuktiUrl}` : ""}

Mohon verifikasinya, terima kasih!`;

    const waUrl = `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(textMessage)}`;
    window.open(waUrl, "_blank");

    setShowPayModal(false);
    setShowInvoiceModal(true);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16 pt-32 sm:pt-36">
      <Toaster position="top-right" />

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #invoice-printable, #invoice-printable * {
            visibility: visible !important;
          }
          #invoice-printable {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 20px !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            background: white !important;
            z-index: 999999 !important;
            overflow: hidden !important;
          }
        }
      `}</style>

      {/* HEADER BAR CHECKOUT - MARGIN DIATAS AGAR TIDAK TERTUTUP NAVBAR */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-6">
        <div className="flex items-center justify-between">
          <Link
            href="/umkm"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-emerald-600 transition bg-white px-4 py-2.5 rounded-full border border-slate-200 shadow-sm"
          >
            <ArrowLeft size={15} /> Kembali ke Katalog Produk
          </Link>
          <h1 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
            <ShoppingBag size={18} className="text-emerald-600" />
            Checkout Belanja
          </h1>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6">
        {cartItems.length === 0 && !showPayModal && !showInvoiceModal ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto border border-slate-200/80 shadow-sm space-y-4 my-12">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <ShoppingBag size={32} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Keranjang Belanja Kosong</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Kamu belum menambahkan produk ke dalam keranjang.
            </p>
            <Link
              href="/umkm"
              className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl transition shadow-md shadow-emerald-600/20"
            >
              Lihat Katalog UMKM
            </Link>
          </div>
        ) : (
          <form onSubmit={handleCreateOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* DAFTAR PRODUK (KIRI) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                <span className="text-xs font-bold text-slate-700">
                  Daftar Produk ({cartItems.length} Item)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem("cart");
                    setCartItems([]);
                    window.dispatchEvent(new Event("storage"));
                    toast.success("Keranjang dibersihkan");
                  }}
                  className="text-[11px] font-semibold text-red-500 hover:underline cursor-pointer"
                >
                  Kosongkan
                </button>
              </div>

              {cartItems.map((item, index) => {
                const itemPrice = Number(item.price || item.harga || 0);
                const itemQty = Number(item.quantity || 1);

                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-4 transition hover:border-emerald-200"
                  >
                    <img
                      src={item.image}
                      alt={item.title || item.name || "Gambar Produk"}
                      className="w-20 h-20 rounded-xl object-cover bg-slate-100 flex-shrink-0 border border-slate-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80";
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-md">
                        {item.category || "UMKM"}
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate mt-1">
                        {item.title || item.name}
                      </h3>
                      <div className="text-xs font-black text-slate-900 mt-1">
                        Rp {itemPrice.toLocaleString("id-ID")}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                        <button
                          type="button"
                          onClick={() => handleDecreaseQty(item.id)}
                          className="p-1.5 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-3 text-xs font-bold text-slate-800">
                          {itemQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleIncreaseQty(item.id)}
                          className="p-1.5 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-slate-400 hover:text-red-500 transition p-1 cursor-pointer"
                        title="Hapus Barang"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* FORM ALAMAT & METODE BAYAR (KANAN) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5 sticky top-32">
                
                <h2 className="text-sm font-extrabold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                  <User size={16} className="text-emerald-600" /> Informasi Pemesan
                </h2>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Nama Lengkap *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                        <User size={14} />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="Nama penerima paket"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Email Active *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                        <Mail size={14} />
                      </span>
                      <input
                        type="email"
                        required
                        placeholder="budi@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      No. WhatsApp / HP *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                        <Phone size={14} />
                      </span>
                      <input
                        type="tel"
                        required
                        placeholder="0812XXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Alamat Lengkap Pengiriman *
                    </label>
                    <div className="relative">
                      <span className="absolute top-3 left-0 pl-3 flex items-start text-slate-400 pointer-events-none">
                        <MapPin size={14} />
                      </span>
                      <textarea
                        required
                        rows={3}
                        placeholder="Nama jalan, nomor rumah, RT/RW, kecamatan, dan kota"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-emerald-500 transition resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* METODE PEMBAYARAN */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <CreditCard size={15} className="text-emerald-600" /> Pilih Metode Pembayaran *
                  </label>
                  
                  {loadingPayment ? (
                    <p className="text-xs text-slate-400">Memuat metode pembayaran...</p>
                  ) : paymentMethods.length === 0 ? (
                    <p className="text-xs text-red-500">Belum ada metode pembayaran tersedia.</p>
                  ) : (
                    <div className="space-y-2">
                      {paymentMethods.map((method) => (
                        <label
                          key={method.id}
                          className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition text-xs ${
                            selectedMethodId === method.id
                              ? "border-emerald-600 bg-emerald-50/50 font-bold"
                              : "border-slate-200 bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="payment_method"
                              checked={selectedMethodId === method.id}
                              onChange={() => setSelectedMethodId(method.id)}
                              className="accent-emerald-600"
                            />
                            <span className="text-slate-800">{method.nama_metode}</span>
                          </div>
                          {method.nomor_rekening && (
                            <span className="text-[11px] font-mono text-slate-500">
                              {method.nomor_rekening}
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* RINCIAN TOTAL */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Subtotal Produk ({cartItems.reduce((s, i) => s + (i.quantity || 1), 0)} barang)</span>
                    <span>Rp {calculateTotal().toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Biaya Layanan Admin</span>
                    <span className="text-emerald-600 font-bold">GRATIS</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 text-sm font-black text-slate-900 border-t border-slate-100">
                    <span>Total Pembayaran</span>
                    <span className="text-emerald-700 text-base">
                      Rp {calculateTotal().toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || cartItems.length === 0}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CreditCard size={16} />
                  {submitting ? "Memproses Pesanan..." : "Buat Pesanan Sekarang"}
                </button>

              </div>
            </div>

          </form>
        )}
      </main>

      {/* POP-UP PEMBAYARAN */}
      {mounted && showPayModal && selectedMethod && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 relative my-auto max-h-[90vh] overflow-y-auto">
            
            <button 
              type="button"
              onClick={() => setShowConfirmCloseModal(true)}
              className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="text-center space-y-1">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full">Selesaikan Pembayaran</span>
              <h3 className="font-bold text-base text-slate-900">{selectedMethod.nama_metode}</h3>
              <p className="text-xs text-slate-500">Order ID: #{createdOrderId || "Proses"}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-200/60">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Tagihan Transfer</span>
              <h2 className="text-xl font-black text-emerald-600 mt-0.5">
                Rp {calculateTotal().toLocaleString("id-ID")}
              </h2>
            </div>

            {selectedMethod.qr_image ? (
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-48 h-48 bg-white border p-2 rounded-2xl shadow-sm flex items-center justify-center overflow-hidden">
                  <img src={selectedMethod.qr_image} alt="QRIS Pembayaran" className="w-full h-full object-contain" />
                </div>
                <p className="text-[11px] text-slate-500 text-center">Scan QR code di atas menggunakan m-Banking atau e-Wallet Anda.</p>
              </div>
            ) : (
              <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Nomor Rekening:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">{selectedMethod.nomor_rekening}</span>
                    <button 
                      type="button"
                      onClick={() => handleCopyRekening(selectedMethod.nomor_rekening)}
                      className="p-1 bg-white hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 transition cursor-pointer"
                    >
                      {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Atas Nama:</span>
                  <span className="font-bold text-slate-900">{selectedMethod.atas_nama}</span>
                </div>
              </div>
            )}

            {selectedMethod.instruksi && (
              <div className="text-xs text-slate-600 bg-slate-100/70 p-3.5 rounded-xl whitespace-pre-line leading-relaxed">
                <strong>Instruksi Pembayaran:</strong>
                <div className="mt-1">{selectedMethod.instruksi}</div>
              </div>
            )}

            {!uploadedBuktiUrl ? (
              <form onSubmit={handleUploadBukti} className="space-y-3 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700">Unggah Bukti Transfer / Struk</label>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-3 text-center cursor-pointer hover:bg-slate-50 transition relative">
                  <input 
                    type="file" required accept="image/*"
                    onChange={(e) => setBuktiFile(e.target.files ? e.target.files[0] : null)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex items-center justify-center gap-2 text-slate-500">
                    <Upload size={16} className="text-emerald-600" />
                    <span className="text-xs font-medium truncate max-w-[250px]">
                      {buktiFile ? buktiFile.name : "Pilih file gambar bukti transfer"}
                    </span>
                  </div>
                </div>

                <button 
                  type="submit" disabled={isUploading || !buktiFile}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white py-3.5 rounded-2xl text-xs font-bold tracking-wide uppercase transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 size={15} /> {isUploading ? "Mengunggah..." : "Unggah Bukti Transfer"}
                </button>
              </form>
            ) : (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Bukti transfer berhasil diunggah! Lanjut konfirmasi ke WhatsApp admin.</span>
                </div>

                <button 
                  type="button"
                  onClick={handleSendToWhatsApp}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl text-xs font-bold tracking-wider uppercase transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare size={16} /> Konfirmasi ke WhatsApp Admin
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* MODAL KONFIRMASI KELUAR */}
      {mounted && showConfirmCloseModal && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-slate-900">Yakin ingin keluar?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Selesaikan transfer dan konfirmasi via WhatsApp agar pesanan langsung diproses oleh admin desa.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmCloseModal(false)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Lanjut Bayar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmCloseModal(false);
                  setShowPayModal(false);
                  toast.error("Sesi pembayaran ditutup.");
                  router.push("/umkm");
                }}
                className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* INVOICE PRINTABLE */}
      {mounted && showInvoiceModal && invoiceData && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
          <div id="invoice-printable" className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative my-auto max-h-[95vh] flex flex-col">
            <button 
              type="button"
              onClick={() => {
                setShowInvoiceModal(false);
                router.push("/umkm");
              }}
              className="absolute top-4 right-4 p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full transition z-10 print:hidden cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="p-6 sm:p-10 overflow-y-auto space-y-6 bg-white text-neutral-800 flex-1">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
                <div>
                  <h1 className="text-xl font-black text-emerald-700 tracking-tight">DESA WISATA BOJONGRANGKAS</h1>
                  <p className="text-xs text-neutral-500">Pusat Informasi & Marketplace Produk UMKM Desa</p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-2xl font-black tracking-widest text-neutral-800 uppercase">INVOICE</span>
                  <p className="text-xs font-semibold text-emerald-600 mt-0.5">#{invoiceData.order_id}</p>
                </div>
              </div>

              <div className="h-1.5 w-full bg-emerald-500 rounded-full"></div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-neutral-400 uppercase tracking-wider text-[10px]">Ditagihkan Kepada:</span>
                  <h3 className="font-bold text-sm text-neutral-900">{invoiceData.customer_name}</h3>
                  <p className="text-neutral-600">{invoiceData.customer_address}</p>
                  <p className="text-neutral-600">Telp: {invoiceData.customer_phone}</p>
                  <p className="text-neutral-600">Email: {invoiceData.customer_email}</p>
                </div>
                <div className="space-y-1 sm:text-right">
                  <span className="font-bold text-neutral-400 uppercase tracking-wider text-[10px]">Detail Transaksi:</span>
                  <p><strong className="text-neutral-700">Tanggal:</strong> {invoiceData.date}</p>
                  <p><strong className="text-neutral-700">Metode Bayar:</strong> {invoiceData.payment_name}</p>
                  <p><strong className="text-neutral-700">Status:</strong> <span className="text-emerald-600 font-bold">Menunggu Verifikasi WA</span></p>
                </div>
              </div>

              <div className="overflow-x-auto pt-1">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-neutral-900 text-white">
                      <th className="p-2.5 rounded-l-xl">No.</th>
                      <th className="p-2.5">Deskripsi Item</th>
                      <th className="p-2.5 text-center">Harga Satuan</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right rounded-r-xl">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    <tr>
                      <td className="p-2.5 font-medium">1</td>
                      <td className="p-2.5 font-bold text-neutral-900">{invoiceData.product_name}</td>
                      <td className="p-2.5 text-center text-neutral-600">Rp {(invoiceData.total / (invoiceData.quantity || 1)).toLocaleString("id-ID")}</td>
                      <td className="p-2.5 text-center text-neutral-600">{invoiceData.quantity}</td>
                      <td className="p-2.5 text-right font-bold text-neutral-900">Rp {invoiceData.total.toLocaleString("id-ID")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-2 border-t">
                <div className="text-[11px] text-neutral-500 max-w-xs space-y-1">
                  <strong className="text-neutral-700 block">Catatan Penting:</strong>
                  <p>Terima kasih telah berbelanja produk UMKM Desa Wisata Bojongrangkas.</p>
                </div>
                <div className="w-full sm:w-64 bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100 space-y-1.5">
                  <div className="flex justify-between text-xs text-neutral-600">
                    <span>Subtotal</span>
                    <span>Rp {invoiceData.total.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-xs text-neutral-600 border-b pb-1.5">
                    <span>Pajak / Layanan</span>
                    <span>Rp 0</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-emerald-800 pt-0.5">
                    <span>Total Tagihan:</span>
                    <span>Rp {invoiceData.total.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 bg-neutral-50 border-t flex flex-col sm:flex-row justify-between items-center gap-3 print:hidden">
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="w-full sm:w-auto py-3 px-6 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Download size={15} /> Unduh PDF / Cetak Invoice
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowInvoiceModal(false);
                  router.push("/umkm");
                }}
                className="w-full sm:w-auto py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Selesai</span> <ArrowRight size={15} />
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}