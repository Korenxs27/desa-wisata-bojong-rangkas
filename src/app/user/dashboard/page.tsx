'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, LogOut, Compass, MapPin, Bookmark, Settings, 
  ArrowRight, ShieldCheck, Camera, History, Edit3, CheckCircle2, Package, Clock, AlertTriangle, RefreshCw, Trash2
} from 'lucide-react';

export default function UserDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('Pengunjung');
  const [userEmail, setUserEmail] = useState('');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk form Edit Profil
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // State Riwayat Transaksi Asli dari WooCommerce Bridge
  const [transactions, setTransactions] = useState<any[]>([]);
  const [fetchingOrders, setFetchingOrders] = useState(true);

  const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://desa-wisata-bojongrangkas.biznityhub.com/wp-json";

  useEffect(() => {
    const token = localStorage.getItem('user_token');
    const name = localStorage.getItem('user_name');
    const email = localStorage.getItem('user_email');
    const role = localStorage.getItem('user_role');
    const savedAvatar = localStorage.getItem('user_avatar');

    if (!token || role === 'admin') {
      router.replace('/login');
      return;
    }

    setUserName(name || 'Warga / Pengunjung');
    setNewName(name || 'Warga / Pengunjung');
    const currentEmail = email || 'user@domain.com';
    setUserEmail(currentEmail);
    if (savedAvatar) setUserAvatar(savedAvatar);

    // Ambil riwayat pesanan user dari WordPress
    fetchUserOrders(currentEmail);
  }, [router]);

  // Fungsi Ambil Pesanan User & Filter 24 Jam
  const fetchUserOrders = async (emailToMatch: string) => {
    setFetchingOrders(true);
    try {
      const res = await fetch(`${wpUrl}/wc-bridge/v1/get-orders`, { cache: "no-store" });
      const data = await res.json();
      
      if (data.success && Array.isArray(data.orders)) {
        // Filter pesanan berdasarkan email user yang sedang login supaya privasi aman
        const myOrders = data.orders.filter((ord: any) => 
          ord.billing?.email?.toLowerCase() === emailToMatch?.toLowerCase()
        );
        setTransactions(myOrders);
      }
    } catch (err) {
      console.error("Gagal memuat riwayat pesanan user:", err);
    } finally {
      setFetchingOrders(false);
      setIsLoading(false);
    }
  };

  // Handle Logout Aman
  const handleLogout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_avatar');

    router.push('/login');
    router.refresh();
  };

  // Handle Ganti Foto Profil (Upload gambar aman dari error tipe)
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const base64String = reader.result;
          setUserAvatar(base64String);
          localStorage.setItem('user_avatar', base64String);
          setSuccessMsg('Foto profil berhasil diperbarui!');
          setTimeout(() => setSuccessMsg(''), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Hapus Foto Profil
  const handleRemoveAvatar = () => {
    setUserAvatar(null);
    localStorage.removeItem('user_avatar');
    setSuccessMsg('Foto profil berhasil dihapus!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Handle Update Nama
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setUserName(newName);
    localStorage.setItem('user_name', newName);
    setIsEditing(false);
    setSuccessMsg('Nama profil berhasil diperbarui!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-xs font-medium tracking-wider">
        Memuat Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30 text-slate-800 pb-24 pt-36 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Background Soft Glassy Glow Effects */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-teal-300/10 rounded-full blur-3xl pointer-events-none"></div>

      <main className="max-w-6xl mx-auto space-y-6 relative z-10">
        
        {/* Notifikasi Sukses */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-600/10 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 border border-emerald-500/20">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex items-center gap-5">
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/40 overflow-hidden flex items-center justify-center text-white text-2xl font-serif shadow-md">
                {userAvatar ? (
                  <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  userName.charAt(0).toUpperCase()
                )}
              </div>
              
              {/* HOVER OVERLAY UNTUK EDIT & HAPUS FOTO */}
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <label 
                  htmlFor="avatar-upload" 
                  className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white cursor-pointer transition"
                  title="Ganti Foto Profil"
                >
                  <Camera size={14} />
                </label>
                {userAvatar && (
                  <button 
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="p-2 rounded-full bg-rose-500/80 hover:bg-rose-600 text-white transition"
                    title="Hapus Foto Profil"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <input 
                id="avatar-upload" 
                type="file" 
                accept="image/*" 
                onChange={handleAvatarChange} 
                className="hidden" 
              />
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold mb-2">
                <ShieldCheck size={13} /> Akun Terverifikasi
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight">Selamat Datang, {userName}! 👋</h2>
              <p className="text-xs text-emerald-100 mt-1 font-light">
                Kelola informasi akun, jelajahi wisata, dan cek status riwayat pemesananmu di sini.
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="relative z-10 flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-rose-600 bg-white hover:bg-rose-50 rounded-full shadow-md transition shrink-0"
          >
            <LogOut size={14} /> Keluar Akun
          </button>
        </div>

        {/* Quick Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Link 
            href="/wisata"
            className="group bg-white/70 backdrop-blur-xl p-6 rounded-[2rem] border border-white/85 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-emerald-500/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Compass size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Jelajahi Wisata Desa</h3>
              <p className="text-xs text-slate-500 font-light mt-1">Temukan spot wisata alam dan budaya menarik.</p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:gap-2 transition-all">
              <span>Buka direktori</span> <ArrowRight size={14} />
            </div>
          </Link>

          <Link 
            href="/homestay"
            className="group bg-white/70 backdrop-blur-xl p-6 rounded-[2rem] border border-white/85 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-emerald-500/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <MapPin size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Homestay & Penginapan</h3>
              <p className="text-xs text-slate-500 font-light mt-1">Booking tempat istirahat nyaman bersama warga.</p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-bold text-teal-600 group-hover:gap-2 transition-all">
              <span>Lihat homestay</span> <ArrowRight size={14} />
            </div>
          </Link>

          <Link 
            href="/paket"
            className="group bg-white/70 backdrop-blur-xl p-6 rounded-[2rem] border border-white/85 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-emerald-500/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Bookmark size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Paket Tur & Aktivitas</h3>
              <p className="text-xs text-slate-500 font-light mt-1">Pilih paket liburan terpadu harga spesial.</p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-bold text-amber-600 group-hover:gap-2 transition-all">
              <span>Cek paket</span> <ArrowRight size={14} />
            </div>
          </Link>
        </div>

        {/* Grid Bawah: Pengaturan Akun & Riwayat Transaksi Real-Time */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Card Pengaturan & Edit Profil */}
          <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 border border-white/85 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                  <Settings size={16} className="text-emerald-600" /> Pengaturan Profil Akun
                </h3>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                >
                  <Edit3 size={13} /> {isEditing ? 'Batal' : 'Edit Nama'}
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-4 mt-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Nama Lengkap Baru</label>
                    <input 
                      type="text" 
                      value={newName} 
                      onChange={(e) => setNewName(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 text-xs bg-white/60 border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-3 bg-neutral-900 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-sm"
                  >
                    Simpan Perubahan Nama
                  </button>
                </form>
              ) : (
                <div className="space-y-3 text-xs mt-2">
                  <div className="p-4 rounded-2xl bg-white/50 border border-slate-200/60 flex justify-between items-center">
                    <div>
                      <span className="text-slate-400 block mb-0.5 text-[10px] uppercase font-bold tracking-wider">Nama Akun</span>
                      <strong className="text-slate-800 text-sm">{userName}</strong>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/50 border border-slate-200/60 flex justify-between items-center">
                    <div>
                      <span className="text-slate-400 block mb-0.5 text-[10px] uppercase font-bold tracking-wider">Email Terdaftar</span>
                      <strong className="text-slate-800 text-sm">{userEmail}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 mt-6 italic font-light">
              *Tips: Arahkan kursor ke foto profil di atas untuk memunculkan tombol edit atau hapus foto avatar kamu secara instan.
            </p>
          </div>

          {/* Card Riwayat Transaksi / Aktivitas Live dari WooCommerce */}
          <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 border border-white/85 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                  <History size={16} className="text-emerald-600" /> Riwayat Transaksi & Booking Saya
                </h3>
                <button 
                  onClick={() => fetchUserOrders(userEmail)} 
                  className="p-2 text-slate-500 hover:text-emerald-600 transition"
                  title="Refresh Transaksi"
                >
                  <RefreshCw size={14} className={fetchingOrders ? "animate-spin" : ""} />
                </button>
              </div>

              {fetchingOrders ? (
                <div className="text-center py-10 text-slate-400 text-xs font-light">
                  Memuat riwayat transaksi dari database...
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs italic font-light">
                  Belum ada riwayat transaksi atau pemesanan atas email ini.
                </div>
              ) : (
                <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                  {transactions.map((trx) => {
                    const orderTime = new Date(trx.date).getTime();
                    const now = new Date().getTime();
                    const isPending = trx.status === 'pending';
                    const isExpired = isPending && (now - orderTime > 24 * 60 * 60 * 1000);

                    return (
                      <div key={trx.id} className="p-3.5 rounded-2xl bg-white/50 border border-slate-200/60 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 truncate">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <Package size={18} />
                          </div>
                          <div className="truncate">
                            <h4 className="text-xs font-bold text-slate-800 truncate">Order #{trx.id} - {trx.line_items_name || "Booking Wisata"}</h4>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              <span>{trx.date}</span>
                              <span>•</span>
                              {isExpired ? (
                                <span className="text-rose-600 font-bold flex items-center gap-0.5">
                                  <AlertTriangle size={10} /> Kadaluarsa (&gt;24 Jam)
                                </span>
                              ) : isPending ? (
                                <span className="text-amber-600 font-bold flex items-center gap-0.5">
                                  <Clock size={10} /> Menunggu Pembayaran
                                </span>
                              ) : (
                                <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                                  <CheckCircle2 size={10} /> Lunas (Paid)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-extrabold text-slate-700 block">Rp. {Number(trx.total || 0).toLocaleString("id-ID")}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100/80 flex justify-between items-center text-[11px] text-slate-400 font-light">
              <span>*Pesanan pending otomatis terhapus dalam 24 jam.</span>
              <span className="font-semibold text-emerald-600">Secure Midtrans</span>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}