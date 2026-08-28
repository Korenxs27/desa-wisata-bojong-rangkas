'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, LogOut, Compass, MapPin, Bookmark, Settings, 
  ArrowRight, ShieldCheck, Camera, History, Edit3, CheckCircle2, Package, Clock, AlertTriangle, RefreshCw, Trash2, Loader2, MessageCircle, X
} from 'lucide-react';

export default function UserDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('Pengunjung');
  const [userEmail, setUserEmail] = useState('');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // State untuk form Edit Profil
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');

  // State Sistem Notifikasi Toast Modern & Beranimasi
  const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // State Riwayat Transaksi Asli dari WooCommerce Bridge
  const [transactions, setTransactions] = useState<any[]>([]);
  const [fetchingOrders, setFetchingOrders] = useState(true);

  // State Wishlist / Bookmark Lokal
  const [wishlist, setWishlist] = useState<any[]>([]);

  const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://desa-wisata-bojongrangkas.com/wp-json";

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

    // Ambil data wishlist dari localStorage berdasarkan email user
    loadWishlist(currentEmail);
  }, [router]);

  const loadWishlist = (email: string) => {
    const storageKey = `wishlist_${email}`;
    const savedWishlist = localStorage.getItem(storageKey) || localStorage.getItem('user_wishlist');
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error("Gagal parsing wishlist:", e);
      }
    }
  };

  // Fungsi Hapus Bookmark Langsung dari Dashboard
  const handleRemoveBookmark = async (item: any) => {
    try {
      const updatedWishlist = wishlist.filter(b => !(b.id == item.id && b.type == item.type));
      setWishlist(updatedWishlist);
      
      // Sinkronkan ke localStorage
      if (userEmail) {
        localStorage.setItem(`wishlist_${userEmail}`, JSON.stringify(updatedWishlist));
      }
      localStorage.setItem('user_wishlist', JSON.stringify(updatedWishlist));

      // Kirim sinkronisasi ke backend jika diperlukan
      await fetch("https://desa-wisata-bojongrangkas.com/wp-json/wc-bridge/v1/toggle-bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, item })
      });

      showNotification(`"${item.title}" berhasil dihapus dari Favorit.`);
    } catch (err) {
      console.error("Gagal menghapus bookmark:", err);
      showNotification("Gagal menghapus item dari server.", "error");
    }
  };

  // Fungsi Ambil Pesanan User & Filter Berdasarkan Email
  const fetchUserOrders = async (emailToMatch: string) => {
    setFetchingOrders(true);
    try {
      const res = await fetch(`${wpUrl}/wc-bridge/v1/get-orders`, { cache: "no-store" });
      const data = await res.json();
      
      if (data.success && Array.isArray(data.orders)) {
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

  // Handle Ganti Foto Profil (Upload ke WordPress Backend)
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append("image_file", file);

    try {
      const res = await fetch("https://desa-wisata-bojongrangkas.com/wp-json/wc-bridge/v1/upload-image", {
        method: "POST",
        body: formData,
      });

      const rawText = await res.text();
      let mediaData;
      try {
        mediaData = JSON.parse(rawText);
      } catch (err) {
        console.error("Respon Server Bukan JSON:", rawText);
        showNotification("Gagal upload: Format server tidak valid.", "error");
        setIsUploadingAvatar(false);
        return;
      }

      if (res.ok && mediaData.success && (mediaData.url || mediaData.source_url)) {
        const avatarUrl = mediaData.url || mediaData.source_url;
        
        setUserAvatar(avatarUrl);
        localStorage.setItem('user_avatar', avatarUrl);
        showNotification('Foto profil berhasil diperbarui!');
      } else {
        showNotification(`Gagal mengunggah foto: ${mediaData.message || "Kesalahan server"}`, "error");
      }
    } catch (err) {
      console.error("Upload Avatar Error:", err);
      showNotification("Terjadi kesalahan jaringan saat mengunggah foto.", "error");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle Hapus Foto Profil
  const handleRemoveAvatar = () => {
    setUserAvatar(null);
    localStorage.removeItem('user_avatar');
    showNotification('Foto profil berhasil dihapus!');
  };

  // Handle Update Nama
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setUserName(newName);
    localStorage.setItem('user_name', newName);
    setIsEditing(false);
    showNotification('Nama profil berhasil diperbarui!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-xs font-medium tracking-wider">
        <Loader2 className="animate-spin text-emerald-600 mr-2" size={20} /> Memuat Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30 text-slate-800 pb-24 pt-36 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Background Soft Glassy Glow Effects */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-teal-300/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* SISTEM NOTIFIKASI TOAST MODERN & BERANIMASI */}
      <div className={`fixed bottom-8 right-8 z-[999999] transition-all duration-500 transform ${
        toast.show ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95 pointer-events-none'
      }`}>
        <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border ${
          toast.type === 'success' 
            ? 'bg-slate-900/90 border-emerald-500/30 text-white' 
            : 'bg-slate-900/90 border-rose-500/30 text-white'
        }`}>
          {toast.type === 'success' ? (
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} />
            </div>
          )}
          <div className="text-xs font-medium tracking-tight">
            {toast.message}
          </div>
          <button 
            onClick={() => setToast(prev => ({ ...prev, show: false }))}
            className="ml-2 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto space-y-6 relative z-10">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-600/10 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 border border-emerald-500/20">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex items-center gap-5">
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/40 overflow-hidden flex items-center justify-center text-white text-2xl font-serif shadow-md">
                {isUploadingAvatar ? (
                  <Loader2 className="animate-spin text-white" size={24} />
                ) : userAvatar ? (
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
                    className="p-2 rounded-full bg-rose-500/80 hover:bg-rose-600 text-white transition cursor-pointer"
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
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/25 backdrop-blur-md text-[11px] font-bold mb-2">
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
            className="relative z-10 flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-rose-600 bg-white hover:bg-rose-50 rounded-full shadow-md transition shrink-0 cursor-pointer"
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

        {/* Grid Tengah: Pengaturan Akun & Riwayat Transaksi Real-Time */}
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
                  className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
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
                    className="w-full py-3 bg-neutral-900 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-sm cursor-pointer"
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
                  className="p-2 text-slate-500 hover:text-emerald-600 transition cursor-pointer"
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

        {/* Grid Bawah: Wishlist & Pusat Bantuan */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Wishlist / Destinasi Favorit dengan Tombol Hapus Cepat */}
          <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 border border-white/85 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2 mb-4">
                <Bookmark size={16} className="text-emerald-600" /> Destinasi & Produk Favoritmu
              </h3>
              <p className="text-xs text-slate-500 font-light mb-4">
                Simpan tempat wisata dan produk UMKM incaranmu agar lebih mudah ditemukan saat ingin merencanakan liburan.
              </p>
              
              {wishlist.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/60 text-center space-y-2">
                  <p className="text-xs text-slate-400 italic font-light">Belum ada item yang ditandai sebagai favorit.</p>
                  <Link href="/wisata" className="inline-block text-[11px] font-bold text-emerald-600 hover:underline">
                    Cari Destinasi Sekarang &rarr;
                  </Link>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {wishlist.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-white/50 border border-slate-200/60 flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-slate-800 truncate">{item.title}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <Link href={item.slug} className="text-[10px] bg-emerald-600 text-white px-3 py-1 rounded-xl font-bold hover:bg-emerald-700 transition">
                          Lihat
                        </Link>
                        <button 
                          onClick={() => handleRemoveBookmark(item)}
                          className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                          title="Hapus dari Favorit"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pusat Bantuan / Fast Support WhatsApp */}
          <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 border border-white/85 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2 mb-4">
                <ShieldCheck size={16} className="text-emerald-600" /> Bantuan & Layanan Pengelola
              </h3>
              <p className="text-xs text-slate-500 font-light mb-4">
                Mengalami kendala saat booking homestay, pembayaran, atau penjadwalan paket wisata? Hubungi tim admin desa kami.
              </p>
              <a 
                href="https://wa.me/6281234567890?text=Halo%20Admin%20Desa%20Wisata%20Bojong%20Rangkas,%20saya%20butuh%20bantuan%20terkait%20akun%20saya." 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <MessageCircle size={18} fill="white" /> Chat Admin via WhatsApp
              </a>
            </div>
            <span className="text-[10px] text-slate-400 font-light mt-4 block">Respon cepat pada jam kerja (08.00 - 16.00 WIB)</span>
          </div>

        </div>

      </main>
    </div>
  );
}