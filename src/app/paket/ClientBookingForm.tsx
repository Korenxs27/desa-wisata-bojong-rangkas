"use client";
import { useState } from "react";
import { Calendar, Users, ShoppingBag, User, Phone, Mail } from "lucide-react";

interface BookingFormProps {
  productId: number;       // ID WooCommerce Virtual yang terikat
  pricePerPerson: number;  // Harga minimal per orang dari ACF
  minParticipants: number; // Minimal kuota dari ACF
}

export default function ClientBookingForm({ productId, pricePerPerson, minParticipants }: BookingFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [participants, setParticipants] = useState(minParticipants);
  const [isProcessing, setIsProcessing] = useState(false);

  const totalPrice = pricePerPerson * participants;

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (participants < minParticipants) {
      alert(`Minimal pemesanan untuk paket ini adalah ${minParticipants} peserta.`);
      return;
    }

    // @ts-ignore
    if (!window.snap || typeof window.snap.pay !== "function") {
      alert("Sistem pembayaran sedang dimuat, silakan tunggu sesaat.");
      return;
    }

    setIsProcessing(true);

    try {
      // Menembak endpoint API bridge kustom di WordPress
      const response = await fetch("https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wc-bridge/v1/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          quantity: participants, // Jumlah peserta masuk ke kuantitas produk WooCommerce
          total_price: totalPrice,
          first_name: name,
          email: email,
          phone: phone,
          // Metadata tambahan khusus booking untuk disimpan ke database WordPress
          tgl_kunjungan: visitDate,
          jenis_pesanan: "Paket"
        }),
      });

      const result = await response.json();

      if (result.success && result.midtrans_snap_token) {
        // @ts-ignore
        window.snap.pay(result.midtrans_snap_token, {
          onSuccess: function (midtransResult: any) {
            alert("Booking Berhasil & Pembayaran Sukses!");
            window.location.href = `/paket/invoice/${result.order_id}`;
          },
          onPending: function (midtransResult: any) {
            alert("Booking disimpan. Silakan selesaikan pembayaran Anda.");
            window.location.href = `/paket/invoice/${result.order_id}`;
          },
          onError: function (midtransResult: any) {
            alert("Proses pembayaran booking gagal.");
          },
        });
      } else {
        alert(`Gagal membuat booking: ${result.message || "Periksa backend."}`);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kendala jaringan saat memproses booking.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleBooking} className="space-y-4">
      {/* Input Nama */}
      <div className="space-y-1">
        <label className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
          <User size={12}/> Nama Pemesan
        </label>
        <input 
          type="text" required placeholder="Nama lengkap" value={name} 
          onChange={(e) => setName(e.target.value)} 
          className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-neutral-800" 
        />
      </div>

      {/* Input Email */}
      <div className="space-y-1">
        <label className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
          <Mail size={12}/> Email
        </label>
        <input 
          type="email" required placeholder="nama@email.com" value={email} 
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
          type="tel" required placeholder="0812XXXXXXXX" value={phone} 
          onChange={(e) => setPhone(e.target.value)} 
          className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-neutral-800" 
        />
      </div>

      {/* Input Tanggal Kunjungan */}
      <div className="space-y-1">
        <label className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
          <Calendar size={12}/> Tanggal Kunjungan
        </label>
        <input 
          type="date" required value={visitDate} 
          min={new Date().toISOString().split("T")[0]} // Mencegah pilih tanggal kemarin
          onChange={(e) => setVisitDate(e.target.value)} 
          className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-neutral-800" 
        />
      </div>

      {/* Input Jumlah Peserta */}
      <div className="space-y-1">
        <label className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
          <Users size={12}/> Jumlah Peserta (Min. {minParticipants} orang)
        </label>
        <input 
          type="number" required min={minParticipants} value={participants} 
          onChange={(e) => setParticipants(Math.max(minParticipants, parseInt(e.target.value) || minParticipants))} 
          className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-neutral-800" 
        />
      </div>

      {/* Kalkulasi Total */}
      <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 text-xs text-neutral-500 space-y-1.5">
        <div className="flex justify-between">
          <span>Harga per orang</span>
          <span>Rp {pricePerPerson.toLocaleString("id-ID")}</span>
        </div>
        <div className="flex justify-between">
          <span>Jumlah Peserta</span>
          <span>{participants} Orang</span>
        </div>
        <div className="flex justify-between items-center border-t border-neutral-200 pt-2 font-bold text-neutral-900 text-sm">
          <span>Total Pembayaran</span>
          <span className="text-emerald-600">Rp {totalPrice.toLocaleString("id-ID")}</span>
        </div>
      </div>

      <button 
        type="submit" disabled={isProcessing}
        className="w-full bg-neutral-900 hover:bg-emerald-600 disabled:bg-neutral-200 text-white py-4 rounded-2xl text-xs font-semibold tracking-widest uppercase transition flex items-center justify-center gap-2"
      >
        <ShoppingBag size={14}/> {isProcessing ? "Memproses Booking..." : "Booking & Bayar Sekarang"}
      </button>
    </form>
  );
}