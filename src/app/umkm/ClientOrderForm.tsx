"use client";
import { useState } from "react";
import { ShoppingBag, User, Phone, Mail, MapPin } from "lucide-react";

interface FormProps {
  productId: number;
  productPrice: number;
  stockStatus: string;
}

export default function ClientOrderForm({ productId, productPrice, stockStatus }: FormProps) {
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (stockStatus !== "instock") {
      alert("Maaf, stok produk ini sedang kosong!");
      return;
    }

    // @ts-ignore
    if (!window.snap || typeof window.snap.pay !== "function") {
      alert("Sistem pembayaran sedang dimuat, silakan tunggu sesaat.");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wc-bridge/v1/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          quantity: quantity,
          total_price: productPrice * quantity,
          first_name: name,
          phone: phone,
          email: email,
          address: address
        }),
      });

      const result = await response.json();

      if (result.success && result.midtrans_snap_token) {
        // @ts-ignore
        window.snap.pay(result.midtrans_snap_token, {
          onSuccess: function (midtransResult: any) {
            alert("Pembayaran Terverifikasi Sukses!");
            window.location.href = `/umkm/invoice/${result.order_id}`;
          },
          onPending: function (midtransResult: any) {
            alert("Menunggu pembayaran Anda diselesaikan.");
            window.location.href = `/umkm/invoice/${result.order_id}`;
          },
          onError: function (midtransResult: any) {
            alert("Proses pembayaran gagal.");
          },
        });
      } else {
        alert(`Gagal memproses transaksi: ${result.message || "Periksa konfigurasi backend."}`);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kendala jaringan saat memproses pesanan.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleCheckout} className="space-y-4">
      {/* Input Nama */}
      <div className="space-y-1">
        <label className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
          <User size={12}/> Nama Lengkap
        </label>
        <input 
          type="text" 
          required
          placeholder="Nama penerima paket"
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-neutral-800" 
        />
      </div>

      {/* Input Email */}
      <div className="space-y-1">
        <label className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
          <Mail size={12}/> Alamat Email
        </label>
        <input 
          type="email" 
          required
          placeholder="Contoh: nama@email.com"
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-neutral-800" 
        />
      </div>

      {/* Input No HP */}
      <div className="space-y-1">
        <label className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
          <Phone size={12}/> No. WhatsApp
        </label>
        <input 
          type="tel" 
          required
          placeholder="Contoh: 0812XXXXXXXX"
          value={phone} 
          onChange={(e) => setPhone(e.target.value)} 
          className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-neutral-800" 
        />
      </div>

      {/* Input Alamat Lengkap */}
      <div className="space-y-1">
        <label className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
          <MapPin size={12}/> Alamat Lengkap Pengiriman
        </label>
        <textarea 
          required
          rows={3}
          placeholder="Nama jalan, nomor rumah, RT/RW, kecamatan, kota, dan kode pos"
          value={address} 
          onChange={(e) => setAddress(e.target.value)} 
          className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-neutral-800 resize-none" 
        />
      </div>

      {/* Kuantitas Beli */}
      <div className="space-y-1">
        <label className="text-[10px] uppercase font-bold text-neutral-400">Kuantitas</label>
        <input 
          type="number" 
          min="1" 
          required
          disabled={stockStatus !== "instock"}
          value={quantity} 
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} 
          className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-neutral-800 disabled:bg-neutral-50" 
        />
      </div>

      {/* Total Tagihan */}
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
        disabled={isProcessing || stockStatus !== "instock"}
        className="w-full bg-neutral-900 hover:bg-emerald-600 disabled:bg-neutral-200 disabled:text-neutral-400 text-white py-4 rounded-2xl text-xs font-semibold tracking-widest uppercase transition flex items-center justify-center gap-2 shadow-md"
      >
        <ShoppingBag size={14}/> {isProcessing ? "Memproses..." : "Beli Sekarang"}
      </button>
    </form>
  );
}