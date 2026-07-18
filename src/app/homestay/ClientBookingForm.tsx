"use client";

import { useState, useEffect } from "react";
import { Calendar, User, Phone, Mail, ShoppingBag } from "lucide-react";
import { HomestayWarga } from "@/types/homestay";

interface BookingFormProps {
  homestay: HomestayWarga;
  productId: number;     
  pricePerNight: number;   
}

export default function ClientBookingForm({ homestay, productId, pricePerNight }: BookingFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Perhitungan Malam Dinamis
  const [totalMalam, setTotalMalam] = useState(0);
  const hargaPerMalam = Number(pricePerNight || 0);

  useEffect(() => {
    if (checkIn && checkOut) {
      const date1 = new Date(checkIn);
      const date2 = new Date(checkOut);
      const timeDiff = date2.getTime() - date1.getTime();
      const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
      setTotalMalam(days > 0 ? days : 0);
    } else {
      setTotalMalam(0);
    }
  }, [checkIn, checkOut]);

  const totalPrice = totalMalam * hargaPerMalam;

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (totalMalam <= 0) {
      alert("Tanggal check-out harus setelah tanggal check-in.");
      return;
    }

    if (!productId || productId === 0) {
      alert("Gagal memproses: ID Produk WooCommerce terkait tidak ditemukan (Bernilai 0). Pastikan field ACF sudah diisi produk di WordPress.");
      return;
    }

    const globalWindow = window as any;
    if (!globalWindow.snap || typeof globalWindow.snap.pay !== "function") {
      alert("Sistem pembayaran Midtrans sedang dimuat, silakan klik ulang dalam 2-3 detik.");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wc-bridge/v1/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId, 
          quantity: totalMalam, 
          total_price: totalPrice,
          first_name: name,
          email: email,
          phone: phone,
          jenis_pesanan: "Homestay",
          nama_homestay: homestay.title.rendered,
          tgl_checkin: checkIn,
          tgl_checkout: checkOut
        }),
      });

      const result = await response.json();
      console.log("Respon API WooCommerce Bridge:", result);

      if (result.success && result.midtrans_snap_token) {
        globalWindow.snap.pay(result.midtrans_snap_token, {
          onSuccess: function (midtransResult: any) {
            alert("Booking Berhasil & Pembayaran Sukses!");
            window.location.reload();
          },
          onPending: function (midtransResult: any) {
            alert("Booking disimpan. Silakan selesaikan pembayaran Anda di jendela Midtrans.");
            window.location.reload();
          },
          onError: function (midtransResult: any) {
            alert("Proses pembayaran booking dibatalkan atau gagal.");
          },
        });
      } else {
        alert(`Gagal memicu pembayaran! \nPesan Server: ${result.message || "Periksa backend."}`);
      }
    } catch (error) {
      console.error("Jaringan Error:", error);
      alert("Terjadi kendala koneksi internet saat memproses transaksi booking.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleBooking} className="space-y-4">
      {/* Input Nama Pemesan */}
      <div className="space-y-1">
        <label className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
          <User size={12}/> Nama Lengkap
        </label>
        <input 
          type="text" required placeholder="Nama lengkap Anda" value={name} 
          onChange={(e) => setName(e.target.value)} 
          className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-neutral-800" 
        />
      </div>

      {/* Input Email Pemesan */}
      <div className="space-y-1">
        <label className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
          <Mail size={12}/> Alamat Email
        </label>
        <input 
          type="email" required placeholder="nama@email.com" value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-neutral-800" 
        />
      </div>

      {/* Input Nomor HP WhatsApp */}
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

      {/* Input Tanggal Menginap */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
            <Calendar size={12}/> Check-in
          </label>
          <input 
            type="date" required value={checkIn} 
            min={new Date().toISOString().split("T")[0]} 
            onChange={(e) => setCheckIn(e.target.value)} 
            className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-neutral-800" 
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
            <Calendar size={12}/> Check-out
          </label>
          <input 
            type="date" required value={checkOut} 
            min={checkIn || new Date().toISOString().split("T")[0]} 
            onChange={(e) => setCheckOut(e.target.value)} 
            className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-neutral-800" 
          />
        </div>
      </div>

      {/* Box Info Kalkulasi Tarif Pembayaran */}
      <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 text-xs text-neutral-500 space-y-1.5">
        <div className="flex justify-between">
          <span>Tarif per malam</span>
          <span>Rp {hargaPerMalam.toLocaleString("id-ID")}</span>
        </div>
        <div className="flex justify-between">
          <span>Durasi Menginap</span>
          <span>{totalMalam} Malam</span>
        </div>
        <div className="flex justify-between items-center border-t border-neutral-200 pt-2 font-bold text-neutral-900 text-sm">
          <span>Total Pembayaran</span>
          <span className="text-emerald-600">Rp {totalPrice.toLocaleString("id-ID")}</span>
        </div>
      </div>

      {/* Tombol Eksekusi Submit Order */}
      <button 
        type="submit" disabled={isProcessing}
        className="w-full bg-neutral-900 hover:bg-emerald-600 disabled:bg-neutral-200 text-white py-4 rounded-2xl text-xs font-semibold tracking-widest uppercase transition flex items-center justify-center gap-2"
      >
        <ShoppingBag size={14}/> {isProcessing ? "Memproses..." : "Reservasi & Bayar Sekarang"}
      </button>
    </form>
  );
}