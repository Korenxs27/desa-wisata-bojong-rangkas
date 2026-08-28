"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { 
  ShoppingBag, User, Phone, Mail, MapPin, CreditCard, 
  Upload, CheckCircle2, X, Download, ArrowRight, Copy, Check, AlertTriangle, MessageSquare 
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface FormProps {
  productId: number;
  productName: string;
  productPrice: number;
  stockStatus: string;
}

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

export default function ClientOrderForm({ productId, productName, productPrice, stockStatus }: FormProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(true);

  // State Pop-up Pembayaran & Upload Bukti
  const [showPayModal, setShowPayModal] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [buktiFile, setBuktiFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploadedBuktiUrl, setUploadedBuktiUrl] = useState<string>("");

  // Nomor WhatsApp Admin (Diambil dari Database WordPress secara real-time)
  const [adminWhatsApp, setAdminWhatsApp] = useState("6281234567890");

  // State Modal Konfirmasi Tutup Modern
  const [showConfirmCloseModal, setShowConfirmCloseModal] = useState(false);

  // State Pop-up Invoice Profesional
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState<OrderResultData | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // 1. CEK STATUS LOGIN & AUTO-FILL DATA AKUN (Mendukung Admin & User Biasa)
    const token = localStorage.getItem("admin_token") || localStorage.getItem("user_token");
    const userEmail = localStorage.getItem("user_email") || localStorage.getItem("email");
    const userName = localStorage.getItem("admin_name") || localStorage.getItem("user_name");

    if (!token) {
      toast.error("Silakan login terlebih dahulu untuk melakukan pemesanan produk.", {
        style: { borderRadius: '16px', fontSize: '12px' }
      });
      router.push("/login");
      return;
    }

    if (userEmail) setEmail(userEmail);
    if (userName) setName(userName);

    // Ambil nomor WhatsApp admin langsung dari Database WordPress
    const fetchAdminWhatsApp = async () => {
      try {
        const resWa = await fetch("https://desa-wisata-bojongrangkas.com/wp-json/wc-bridge/v1/admin-whatsapp");
        const dataWa = await resWa.json();
        if (dataWa.success && dataWa.whatsapp_number) {
          setAdminWhatsApp(dataWa.whatsapp_number);
        }
      } catch (err) {
        console.error("Gagal memuat nomor WhatsApp admin:", err);
      }
    };
    fetchAdminWhatsApp();

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
    fetchPaymentMethods();
  }, [router]);

  const selectedMethod = paymentMethods.find((m) => m.id === selectedMethodId);

  const handleCopyRekening = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Nomor rekening berhasil disalin!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (stockStatus !== "instock") {
      toast.error("Maaf, stok produk ini sedang kosong!");
      return;
    }

    if (!selectedMethodId) {
      toast.error("Silakan pilih metode pembayaran terlebih dahulu.");
      return;
    }

    setIsProcessing(true);
    const loadToast = toast.loading("Memproses pesanan Anda...");

    try {
      const payloadData = {
        product_id: productId,
        quantity: quantity,
        total_price: productPrice * quantity,
        first_name: name,
        phone: phone,
        email: email, // Email otomatis dari akun yang login
        address: address,
        jenis_pesanan: "UMKM",
      };

      const response = await fetch("https://desa-wisata-bojongrangkas.com/wp-json/wc-bridge/v1/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadData),
      });

      const result = await response.json();
      toast.dismiss(loadToast);
      
      if (result.success && result.order_id) {
        setCreatedOrderId(result.order_id);
        setShowPayModal(true);
        toast.success("Pesanan berhasil dibuat, silakan lakukan pembayaran.");
      } else {
        toast.error(`Gagal memproses pesanan: ${result.message || "Kesalahan server."}`);
      }
    } catch (error) {
      toast.dismiss(loadToast);
      console.error("Error Fetch:", error);
      toast.error("Terjadi kendala jaringan saat memproses pesanan.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadBukti = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentOrderIdForUpload = createdOrderId || 999999;

    if (!buktiFile) {
      toast.error("Harap pilih file bukti transfer terlebih dahulu.");
      return;
    }

    setIsUploading(true);
    const loadToast = toast.loading("Mengunggah bukti pembayaran...");

    try {
      const formData = new FormData();
      formData.append("order_id", currentOrderIdForUpload.toString());
      formData.append("bukti_file", buktiFile);

      const res = await fetch("https://desa-wisata-bojongrangkas.com/wp-json/wc-bridge/v1/upload-bukti", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      toast.dismiss(loadToast);

      const buktiUrl = (data.success && (data.bukti_url || data.url)) ? (data.bukti_url || data.url) : URL.createObjectURL(buktiFile);
      setUploadedBuktiUrl(buktiUrl);

      if (!createdOrderId) {
        setCreatedOrderId(currentOrderIdForUpload);
      }

      toast.success("Bukti pembayaran berhasil diproses!");

      setInvoiceData({
        order_id: createdOrderId || currentOrderIdForUpload,
        product_name: productName,
        quantity: quantity,
        total: productPrice * quantity,
        customer_name: name,
        customer_phone: phone,
        customer_email: email,
        customer_address: address,
        payment_name: selectedMethod?.nama_metode || "Transfer Bank / QRIS",
        date: new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }),
        bukti_url: buktiUrl
      });
    } catch (err) {
      toast.dismiss(loadToast);
      console.error(err);
      const fallbackUrl = URL.createObjectURL(buktiFile);
      setUploadedBuktiUrl(fallbackUrl);
      if (!createdOrderId) setCreatedOrderId(999999);
      
      toast.success("Bukti siap dikonfirmasi!");
      setInvoiceData({
        order_id: createdOrderId || 999999,
        product_name: productName,
        quantity: quantity,
        total: productPrice * quantity,
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
    const finalOrderId = createdOrderId || invoiceData?.order_id || Math.floor(Math.random() * 10000); 
    const finalName = name || invoiceData?.customer_name || "Pelanggan UMKM";
    const finalPhone = phone || invoiceData?.customer_phone || "-";
    const finalAddress = address || invoiceData?.customer_address || "-";
    const finalTotal = productPrice * quantity;
    const finalBuktiUrl = uploadedBuktiUrl || invoiceData?.bukti_url || "";

    const textMessage = 
`Halo Admin Desa Wisata Bojongrangkas, saya ingin mengkonfirmasi pembayaran pesanan produk UMKM saya.

*ID Order:* #${finalOrderId}
*Nama Pemesan:* ${finalName}
*Jenis Kategori:* Produk UMKM
*Nama Pesanan:* ${productName}
*Jumlah Order:* ${quantity}
*Total Pembayaran:* Rp ${finalTotal.toLocaleString("id-ID")}
*No. HP / WhatsApp:* ${finalPhone}
*Alamat Pengiriman:* ${finalAddress}
${finalBuktiUrl ? `*Link Bukti Transfer:* ${finalBuktiUrl}` : ""}

Mohon verifikasinya, terima kasih!`;

    const waUrl = `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(textMessage)}`;
    window.open(waUrl, "_blank");

    setShowPayModal(false);
    setShowInvoiceModal(true);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

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

      <form onSubmit={handleCheckout} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
            <User size={12}/> Nama Lengkap
          </label>
          <input 
            type="text" required placeholder="Nama penerima paket"
            value={name} onChange={(e) => setName(e.target.value)} 
            className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-neutral-800" 
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
            <Mail size={12}/> Alamat Email (Otomatis dari Akun)
          </label>
          <input 
            type="email" required readOnly
            value={email} 
            className="w-full bg-neutral-100 border border-neutral-200 p-3 rounded-xl text-xs text-neutral-500 cursor-not-allowed" 
          />
          <span className="text-[10px] text-emerald-600 block mt-0.5">✓ Terisi otomatis sesuai akun yang sedang login.</span>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
            <Phone size={12}/> No. WhatsApp
          </label>
          <input 
            type="tel" required placeholder="Contoh: 0812XXXXXXXX"
            value={phone} onChange={(e) => setPhone(e.target.value)} 
            className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-neutral-800" 
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
            <MapPin size={12}/> Alamat Lengkap Pengiriman
          </label>
          <textarea 
            required rows={3} placeholder="Nama jalan, nomor rumah, RT/RW, kecamatan, kota, dan kode pos"
            value={address} onChange={(e) => setAddress(e.target.value)} 
            className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-neutral-800 resize-none" 
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-neutral-400">Kuantitas</label>
          <input 
            type="number" min="1" required disabled={stockStatus !== "instock"}
            value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} 
            className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-neutral-800 disabled:bg-neutral-50" 
          />
        </div>

        <div className="space-y-2 pt-2">
          <label className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
            <CreditCard size={12}/> Pilih Metode Pembayaran
          </label>
          {loadingPayment ? (
            <p className="text-xs text-neutral-400">Memuat metode pembayaran...</p>
          ) : paymentMethods.length === 0 ? (
            <p className="text-xs text-red-500">Belum ada metode pembayaran tersedia.</p>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {paymentMethods.map((method) => (
                <label 
                  key={method.id} 
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition text-xs ${
                    selectedMethodId === method.id ? 'border-emerald-600 bg-emerald-50/40 font-semibold' : 'border-neutral-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input 
                      type="radio" name="payment_method" 
                      checked={selectedMethodId === method.id}
                      onChange={() => setSelectedMethodId(method.id)}
                      className="accent-emerald-600"
                    />
                    <span>{method.nama_metode}</span>
                  </div>
                  {method.nomor_rekening && <span className="text-[11px] text-neutral-500">{method.nomor_rekening}</span>}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="bg-neutral-50/80 p-4 rounded-2xl border border-neutral-100/60 space-y-1.5 text-xs font-light text-neutral-500">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>Rp {(productPrice * quantity).toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between items-center border-t border-neutral-200/50 pt-2 font-bold text-neutral-900 text-sm">
            <span>Total Bayar</span>
            <span>Rp {(productPrice * quantity).toLocaleString("id-ID")}</span>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isProcessing || stockStatus !== "instock" || paymentMethods.length === 0}
          className="w-full bg-neutral-900 hover:bg-emerald-600 disabled:bg-neutral-200 disabled:text-neutral-400 text-white py-4 rounded-2xl text-xs font-semibold tracking-widest uppercase transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
        >
          <ShoppingBag size={14}/> {isProcessing ? "Memproses Pesanan..." : "Lanjut Pembayaran"}
        </button>
      </form>

      {mounted && showPayModal && selectedMethod && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 relative my-auto max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowConfirmCloseModal(true)}
              className="absolute top-4 right-4 p-2 bg-neutral-100 text-neutral-600 rounded-full hover:bg-neutral-200 transition"
              title="Tutup Halaman Pembayaran"
            >
              <X size={16} />
            </button>

            <div className="text-center space-y-1">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full">Selesaikan Pembayaran</span>
              <h3 className="font-bold text-base text-neutral-900">{selectedMethod.nama_metode}</h3>
              <p className="text-xs text-neutral-500">Order ID: #{createdOrderId || "Proses"}</p>
            </div>

            <div className="bg-neutral-50 p-4 rounded-2xl text-center border border-neutral-200/60">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Total Tagihan Transfer</span>
              <h2 className="text-xl font-black text-emerald-600 mt-0.5">Rp {(productPrice * quantity).toLocaleString("id-ID")}</h2>
            </div>

            {selectedMethod.qr_image ? (
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-48 h-48 bg-white border p-2 rounded-2xl shadow-sm flex items-center justify-center overflow-hidden">
                  <img src={selectedMethod.qr_image} alt="QRIS Pembayaran" className="w-full h-full object-contain" />
                </div>
                <p className="text-[11px] text-neutral-500 text-center">Scan QR code di atas menggunakan m-Banking atau e-Wallet.</p>
              </div>
            ) : (
              <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500">Nomor Rekening:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-neutral-900">{selectedMethod.nomor_rekening}</span>
                    <button 
                      onClick={() => handleCopyRekening(selectedMethod.nomor_rekening)}
                      className="p-1 bg-white hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 transition"
                      title="Salin Nomor Rekening"
                    >
                      {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Atas Nama:</span>
                  <span className="font-bold text-neutral-900">{selectedMethod.atas_nama}</span>
                </div>
              </div>
            )}

            {selectedMethod.instruksi && (
              <div className="text-xs text-neutral-600 bg-neutral-100/70 p-3.5 rounded-xl whitespace-pre-line leading-relaxed">
                <strong>Instruksi Pembayaran:</strong>
                <div className="mt-1">{selectedMethod.instruksi}</div>
              </div>
            )}

            {!uploadedBuktiUrl ? (
              <form onSubmit={handleUploadBukti} className="space-y-3 pt-2 border-t border-neutral-100">
                <label className="block text-xs font-bold text-neutral-700">Unggah Bukti Transfer / Struk</label>
                <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-3 text-center cursor-pointer hover:bg-neutral-50 transition relative">
                  <input 
                    type="file" required accept="image/*"
                    onChange={(e) => setBuktiFile(e.target.files ? e.target.files[0] : null)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex items-center justify-center gap-2 text-neutral-500">
                    <Upload size={16} className="text-emerald-600" />
                    <span className="text-xs font-medium truncate max-w-[250px]">
                      {buktiFile ? buktiFile.name : "Pilih file gambar bukti transfer"}
                    </span>
                  </div>
                </div>

                <button 
                  type="submit" disabled={isUploading || !buktiFile}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-200 text-white py-3.5 rounded-2xl text-xs font-bold tracking-wide uppercase transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 size={15} /> {isUploading ? "Mengunggah..." : "Unggah Bukti Transfer"}
                </button>
              </form>
            ) : (
              <div className="space-y-3 pt-2 border-t border-neutral-100">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Bukti transfer berhasil diunggah! Silakan lanjut konfirmasi ke WhatsApp admin.</span>
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

      {mounted && showConfirmCloseModal && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-neutral-900">Yakin ingin keluar pembayaran?</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Selesaikan transfer dan konfirmasi via WhatsApp agar pesanan langsung diproses oleh admin desa.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowConfirmCloseModal(false)}
                className="py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Lanjut Bayar
              </button>
              <button
                onClick={() => {
                  setShowConfirmCloseModal(false);
                  setShowPayModal(false);
                  toast.error("Sesi pembayaran ditutup.");
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

      {mounted && showInvoiceModal && invoiceData && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
          <div id="invoice-printable" className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative my-auto max-h-[95vh] flex flex-col">
            
            <button 
              onClick={() => {
                setShowInvoiceModal(false);
                window.location.reload();
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
                      <td className="p-2.5 text-center text-neutral-600">Rp {(invoiceData.total / invoiceData.quantity).toLocaleString("id-ID")}</td>
                      <td className="p-2.5 text-center text-neutral-600">{invoiceData.quantity}</td>
                      <td className="p-2.5 text-right font-bold text-neutral-900">Rp {invoiceData.total.toLocaleString("id-ID")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-2 border-t">
                <div className="text-[11px] text-neutral-500 max-w-xs space-y-1">
                  <strong className="text-neutral-700 block">Catatan Penting:</strong>
                  <p>Terima kasih telah berbelanja di BUMDes Desa Wisata Bojongrangkas. Konfirmasi WhatsApp Anda telah terkirim ke admin.</p>
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

              <div className="pt-4 flex justify-between items-end text-xs text-neutral-500 border-t">
                <div>
                  <p className="font-semibold text-neutral-700">Desa Wisata Bojongrangkas</p>
                  <p className="text-[10px]">Dokumen ini sah diterbitkan secara elektronik.</p>
                </div>
                <div className="text-center space-y-6">
                  <p className="text-[10px] text-neutral-400">Authorized Sign</p>
                  <p className="font-bold text-neutral-800 underline">Admin BUMDes</p>
                </div>
              </div>

            </div>

            <div className="p-4 sm:p-5 bg-neutral-50 border-t flex flex-col sm:flex-row justify-between items-center gap-3 print:hidden">
              <button
                onClick={handleDownloadPDF}
                className="w-full sm:w-auto py-3 px-6 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Download size={15} /> Unduh PDF / Cetak Invoice
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setShowInvoiceModal(false);
                    window.location.reload();
                  }}
                  className="w-full sm:w-auto py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Selesai</span> <ArrowRight size={15} />
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
}