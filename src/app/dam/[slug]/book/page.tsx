"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, Users, CreditCard, ShieldCheck, ArrowLeft } from 'lucide-react';
// 1. IMPORT SCRIPT HELPER DARI NEXT.JS
import Script from 'next/script';

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState('');
  const [paxCount, setPaxCount] = useState(1);
  const [isProcessingPay, setIsProcessingPay] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch("https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wp/v2/trip?_embed")
      .then(res => res.json())
      .then(data => {
        const found = data.find((t: any) => t.slug === slug);
        setTrip(found);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F4F4] flex flex-col items-center justify-center antialiased relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-400/10 rounded-full blur-[150px] animate-pulse [animation-delay:1s]" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 bg-white/40 backdrop-blur-2xl border border-white/60 p-12 rounded-[40px] shadow-sm flex flex-col items-center justify-center max-w-sm w-full mx-4"
        >
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 rounded-full border-[6px] border-neutral-200/40 backdrop-blur-sm" />
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              className="absolute inset-0 rounded-full border-[6px] border-transparent border-t-emerald-500 border-r-emerald-400/40 filter drop-shadow-[0_4px_12px_rgba(16,185,129,0.35)]"
            />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-sm font-medium tracking-[0.2em] uppercase text-neutral-800">Booking...</h3>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!trip) return <div className="p-20 text-center">Paket tidak ditemukan.</div>;

  const tripPrice = trip.price || trip.wp_travel_price || 0;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate) {
      alert("Silakan pilih tanggal keberangkatan!");
      return;
    }

    // Proteksi Ekstra: Cek apakah script snap sudah ready di window sebelum submit
    // @ts-ignore
    if (!window.snap || typeof window.snap.pay !== 'function') {
      alert("Midtrans SDK sedang dimuat. Silakan tunggu beberapa detik lalu klik tombol bayar lagi.");
      return;
    }

    setIsProcessingPay(true);
    try {
      const response = await fetch("https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wp-travel/v1/create-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trip_id: trip.id,
          pax: paxCount,
          date: bookingDate,
          total_price: tripPrice * paxCount,
        }),
      });
      
      const result = await response.json();

      if (result.success && result.midtrans_snap_token) {
        // Panggil Snap Pop-up Midtrans langsung tanpa error 'undefined' lagi
        // @ts-ignore
        window.snap.pay(result.midtrans_snap_token, {
          onSuccess: () => { 
            alert("Pembayaran Sukses!"); 
            router.push(`/wisata/${slug}`); 
          },
          onPending: () => { alert("Menunggu Pembayaran QRIS."); },
          onError: () => { alert("Pembayaran gagal."); }
        });
      } else {
        console.error("Gagal mendapat token Midtrans:", result);
        alert(`Gagal memuat QRIS Midtrans: ${result.message || 'Respons API bermasalah. Pastikan Server Key di WordPress sudah benar.'}`);
      }
    } catch (error) {
      console.error("Terjadi masalah koneksi jaringan API:", error);
      alert("Gagal menghubungi server WordPress untuk integrasi Midtrans.");
    } finally {
      setIsProcessingPay(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-800 antialiased p-6 flex flex-col items-center justify-center">
      
      {/* 2. INJEKSI SCRIPTS MIDTRANS SECARA DINAMIS */}
      {/* Gunakan link Sandbox untuk testing. Jika sudah mau live/production, ganti 'sandbox.midtrans.com' menjadi 'app.midtrans.com' */}
      {/* SEKARANG (PRODUCTION LIVE) */}
<Script 
  src="https://app.midtrans.com/snap/snap.js" 
  data-client-key="Mid-client-XXXXX_CLIENT_KEY_PRODUCTION_KAMU" 
  strategy="lazyOnload"
/>

      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="max-w-md w-full bg-white/70 backdrop-blur-xl border border-white/80 p-8 rounded-3xl shadow-xl shadow-neutral-100/40 space-y-6"
      >
        {/* Header Form */}
        <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
          <button type="button" onClick={() => router.back()} className="p-2 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-base font-bold text-neutral-900">Konfirmasi Pemesanan</h2>
            <p className="text-[11px] text-neutral-400 font-light truncate max-w-[260px]">{trip.title?.rendered}</p>
          </div>
        </div>

        <form onSubmit={handlePayment} className="space-y-4">
          {/* Input Tanggal */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
              <Calendar size={12}/> Tanggal Keberangkatan
            </label>
            <input 
              type="date" 
              required
              value={bookingDate} 
              onChange={(e) => setBookingDate(e.target.value)} 
              className="w-full bg-white/80 border border-neutral-200 p-3 rounded-xl text-xs focus:outline-none focus:border-emerald-500" 
            />
          </div>

          {/* Input Jumlah Pax */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
              <Users size={12}/> Jumlah Peserta (Pax)
            </label>
            <input 
              type="number" 
              min="1" 
              required
              value={paxCount} 
              onChange={(e) => setPaxCount(Math.max(1, parseInt(e.target.value) || 1))} 
              className="w-full bg-white/80 border border-neutral-200 p-3 rounded-xl text-xs focus:outline-none focus:border-emerald-500" 
            />
          </div>

          {/* Rincian Harga */}
          <div className="bg-neutral-50/70 p-4 rounded-xl border border-neutral-100 space-y-2 text-xs">
            <div className="flex justify-between text-neutral-400">
              <span>Harga per pax</span>
              <span>Rp {Number(tripPrice).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Jumlah tiket</span>
              <span>{paxCount}x</span>
            </div>
            <div className="flex justify-between items-center border-t border-neutral-200/60 pt-2 font-bold text-neutral-900 text-sm">
              <span>Total Bayar</span>
              <span>Rp {(tripPrice * paxCount).toLocaleString()}</span>
            </div>
          </div>

          {/* Tombol Bayar */}
          <button 
            type="submit" 
            disabled={isProcessingPay} 
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl text-xs font-semibold tracking-widest uppercase hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-md shadow-emerald-100"
          >
            <CreditCard size={14}/> {isProcessingPay ? "Processing..." : "Bayar via Midtrans QRIS"}
          </button>
        </form>

        <div className="flex items-center justify-center gap-1 text-[10px] text-neutral-400 border-t border-neutral-100 pt-4">
          <ShieldCheck size={12} className="text-emerald-500"/> Terintegrasi Aman dengan Sistem Midtrans
        </div>
      </motion.div>
    </div>
  );
}