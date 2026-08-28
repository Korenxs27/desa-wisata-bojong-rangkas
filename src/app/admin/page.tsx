"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { 
  LayoutDashboard, 
  MapPin, 
  ShoppingBag, 
  Home, 
  Package, 
  Landmark,
  Image as GalleryIcon, 
  LogOut, 
  ExternalLink,
  RefreshCw,
  TrendingUp,
  CreditCard,
  CheckCircle,
  Clock,
  MessageSquare,
  Users,
  Eye,
  X,
  Menu,
  CheckCheck,
  Search,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [adminName, setAdminName] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // State untuk Modal Detail Booking
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // State untuk Filter Kotak Masuk Pesan & Toggle Lihat Semua
  const [messageSearch, setMessageSearch] = useState("");
  const [showAllMessages, setShowAllMessages] = useState(false);
  const [showAllOrders, setShowAllOrders] = useState(false);
  
  // State Statistik Data dari WordPress, WooCommerce, & Galeri
  const [stats, setStats] = useState({
    totalGallery: 0,
    categories: 0,
    users: 0,
    totalOrders: 0,
    revenue: 0,
  });

  // State untuk Daftar Pesanan & Kotak Masuk Pesan
  const [orders, setOrders] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://desa-wisata-bojongrangkas.com/wp-json";

  useEffect(() => {
    const adminToken = localStorage.getItem("admin_token");
    const name = localStorage.getItem("admin_name");
    const userRole = localStorage.getItem("user_role");

    if (!adminToken || userRole !== "admin") {
      router.push("/login");
      return;
    }

    setAdminName(name || "Administrator");
    fetchAllAdminData();
  }, [router]);

  // Fetch Data Komprehensif dari REST API WordPress, WooCommerce, & Galeri
  const fetchAllAdminData = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const [catRes, usersRes] = await Promise.all([
        fetch(`${wpUrl}/wp/v2/categories?per_page=1`),
        fetch(`${wpUrl}/wp/v2/users/count`),
      ]);

      const userCountJson = await usersRes.json();
      const realTotalUsers = typeof userCountJson === 'number' ? userCountJson : 0;

      let totalGalleryCount = 0;
      try {
        const galleryRes = await fetch(`${wpUrl}/wc-bridge/v1/gallery-items`);
        const galleryJson = await galleryRes.json();
        if (galleryJson.success && Array.isArray(galleryJson.gallery)) {
          totalGalleryCount = galleryJson.gallery.length;
        }
      } catch (err) {
        console.error("Gagal menghitung galeri:", err);
      }

      let ordersData = [];
      let realRevenue = 0;
      let realTotalOrders = 0;

      try {
        const orderRes = await fetch(`${wpUrl}/wc-bridge/v1/get-orders`);
        const orderJson = await orderRes.json();
        if (orderJson.success && Array.isArray(orderJson.orders)) {
          // Hanya ambil pesanan yang bukan berstatus trash / cancelled / deleted
          ordersData = orderJson.orders.filter((ord: any) => 
            ord.status !== 'trash' && ord.status !== 'cancelled' && ord.status !== 'failed'
          );
          realTotalOrders = ordersData.length;
          
          // Hitung ulang total pendapatan hanya dari order yang valid (processing/completed)
          realRevenue = ordersData
            .filter((o: any) => o.status === 'completed' || o.status === 'processing')
            .reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);
        }
      } catch (err) {
        console.error("Gagal mengambil orders:", err);
      }

      let messagesData = [];
      try {
        const msgRes = await fetch(`${wpUrl}/wc-bridge/v1/get-messages`);
        const msgJson = await msgRes.json();
        if (msgJson.success && Array.isArray(msgJson.messages)) {
          messagesData = msgJson.messages;
        }
      } catch (err) {
        console.error("Gagal mengambil pesan aspirasi:", err);
      }

      setStats({
        totalGallery: totalGalleryCount,
        categories: parseInt(catRes.headers.get("X-WP-Total") || "0", 10),
        users: realTotalUsers > 0 ? realTotalUsers : parseInt(usersRes.headers.get("X-WP-Total") || "0", 10),
        totalOrders: realTotalOrders,
        revenue: realRevenue,
      });

      setOrders(ordersData);
      setMessages(messagesData);

    } catch (err) {
      console.error("Gagal sinkronisasi data admin:", err);
    } finally {
      setLoading(false);
      setTimeout(() => setRefreshing(false), 600);
    }
  };

  const handleMarkAsPaid = async (orderId: number) => {
    setUpdatingStatus(true);
    const loadingToast = toast.loading("Memperbarui status pembayaran...", {
      style: { borderRadius: '16px', background: '#334155', color: '#fff', fontSize: '12px' }
    });

    try {
      const res = await fetch(`${wpUrl}/wc-bridge/v1/update-order-status`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ order_id: orderId, status: "processing" })
      });
      
      const data = await res.json();
      toast.dismiss(loadingToast);

      if (res.ok && data.success) {
        toast.success(`Pesanan #${orderId} berhasil dikonfirmasi Lunas!`, {
          style: { borderRadius: '16px', background: '#065f46', color: '#fff', fontSize: '12px' },
          iconTheme: { primary: '#34d399', secondary: '#065f46' }
        });
        setSelectedOrder(null);
        fetchAllAdminData(); // Refresh data otomatis
      } else {
        toast.error(`Gagal: ${data.message || "Kesalahan server WordPress"}`, {
          style: { borderRadius: '16px', fontSize: '12px' }
        });
      }
    } catch (err) {
      console.error("Update Status Error:", err);
      toast.dismiss(loadingToast);
      toast.error("Terjadi kesalahan jaringan/koneksi ke server.", {
        style: { borderRadius: '16px', fontSize: '12px' }
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_name");
    localStorage.removeItem("user_role");
    router.push("/login");
    router.refresh();
  };

  // Filter & Batasi Pesan (Maksimal 5 jika belum klik "Lihat Semua")
  const filteredMessages = messages.filter((msg) => {
    const query = messageSearch.toLowerCase();
    const nameMatch = msg.nama?.toLowerCase().includes(query);
    const emailMatch = msg.email?.toLowerCase().includes(query);
    const contentMatch = msg.pesan?.toLowerCase().includes(query);
    return nameMatch || emailMatch || contentMatch;
  });

  const displayedMessages = showAllMessages ? filteredMessages : filteredMessages.slice(0, 5);
  const displayedOrders = showAllOrders ? orders : orders.slice(0, 5);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-100 flex flex-col md:flex-row text-slate-800 font-sans relative ${isMobileSidebarOpen ? 'overflow-hidden h-screen' : ''}`}>
      
      <Toaster position="top-right" reverseOrder={false} />

      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex w-64 bg-white/85 backdrop-blur-xl border-r border-slate-200/85 flex-col justify-between p-5 fixed h-full z-40 shadow-sm">
        <div>
          <div className="pb-6 mb-6 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-emerald-500/20">
              DW
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm leading-tight">Admin Portal</h2>
              <p className="text-[11px] text-emerald-600 font-medium">Bojong Rangkas</p>
            </div>
          </div>

          <nav className="space-y-1.5 text-xs font-semibold">
            <Link 
              href="/admin" 
              className="flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 transition"
            >
              <LayoutDashboard size={16} /> Dashboard
            </Link>
            <div className="pt-4 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
              Kelola Konten Desa
            </div>
            <Link href="/admin/beranda" className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition">
              <Home size={16} /> Beranda
            </Link>
            <Link href="/admin/profil" className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition">
              <Landmark size={16} /> Profil Desa
            </Link>
            <Link href="/admin/wisata" className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition">
              <MapPin size={16} /> Wisata
            </Link>
            <Link href="/admin/umkm" className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition">
              <ShoppingBag size={16} /> UMKM
            </Link>
            <Link href="/admin/homestay" className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition">
              <Home size={16} /> Homestay
            </Link>
            <Link href="/admin/paket" className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition">
              <Package size={16} /> Paket Wisata
            </Link>
            <Link href="/admin/gallery" className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition">
              <GalleryIcon size={16} /> Galeri Foto
            </Link>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={handleAdminLogout}
            className="w-full flex items-center justify-center gap-2 py-3 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl text-xs font-semibold transition cursor-pointer"
          >
            <LogOut size={15} /> Keluar (Logout)
          </button>
        </div>
      </aside>

      {/* SIDEBAR MOBILE DRAWER */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex">
          <div className="w-72 bg-white fixed inset-y-0 left-0 z-50 shadow-2xl p-5 flex flex-col justify-between animate-in slide-in-from-left duration-200 overflow-y-auto">
            <div>
              <div className="flex justify-between items-center pb-6 mb-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold flex items-center justify-center text-sm shadow-md">
                    DW
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-sm leading-tight">Admin Portal</h2>
                    <p className="text-[11px] text-emerald-600 font-medium">Bojong Rangkas</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition"
                >
                  <X size={16} />
                </button>
              </div>

              <nav className="space-y-1.5 text-xs font-semibold">
                <Link href="/admin" onClick={() => setIsMobileSidebarOpen(false)} className="flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md">
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                <div className="pt-4 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                  Kelola Konten Desa
                </div>
                <Link href="/admin/beranda" onClick={() => setIsMobileSidebarOpen(false)} className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-slate-600 hover:bg-emerald-50">
                  <Home size={16} /> Beranda
                </Link>
                <Link href="/admin/profil" onClick={() => setIsMobileSidebarOpen(false)} className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-slate-600 hover:bg-emerald-50">
                  <Landmark size={16} /> Profil Desa
                </Link>
                <Link href="/admin/wisata" onClick={() => setIsMobileSidebarOpen(false)} className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-slate-600 hover:bg-emerald-50">
                  <MapPin size={16} /> Wisata
                </Link>
                <Link href="/admin/umkm" onClick={() => setIsMobileSidebarOpen(false)} className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-slate-600 hover:bg-emerald-50">
                  <ShoppingBag size={16} /> UMKM
                </Link>
                <Link href="/admin/homestay" onClick={() => setIsMobileSidebarOpen(false)} className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-slate-600 hover:bg-emerald-50">
                  <Home size={16} /> Homestay
                </Link>
                <Link href="/admin/paket" onClick={() => setIsMobileSidebarOpen(false)} className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-slate-600 hover:bg-emerald-50">
                  <Package size={16} /> Paket Wisata
                </Link>
                <Link href="/admin/gallery" onClick={() => setIsMobileSidebarOpen(false)} className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-slate-600 hover:bg-emerald-50">
                  <GalleryIcon size={16} /> Galeri Foto
                </Link>
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={handleAdminLogout}
                className="w-full flex items-center justify-center gap-2 py-3 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl text-xs font-semibold transition"
              >
                <LogOut size={15} /> Keluar (Logout)
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMobileSidebarOpen(false)} />
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 md:ml-64 p-4 sm:p-8 space-y-6 md:space-y-8 w-full">
        
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/70 backdrop-blur-md p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-200/60">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">Halo, {adminName}</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Pusat kendali pariwisata dan transaksi pembayaran.
              </p>
            </div>
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
              title="Menu Navigasi"
            >
              <Menu size={20} />
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
            <button 
              onClick={fetchAllAdminData} 
              className="p-2.5 sm:p-3 text-slate-600 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl shadow-sm transition flex items-center gap-2 text-xs font-semibold"
              title="Refresh Data"
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin text-emerald-600" : ""} />
              <span className="hidden sm:inline">Sinkronisasi</span>
            </button>
            <a 
              href="https://desa-wisata-bojongrangkas.com/wp-admin" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 sm:gap-2 bg-slate-900 text-white text-xs font-semibold px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl hover:bg-slate-800 shadow-md shadow-slate-900/10 transition"
            >
              WP Admin <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <a 
            href="https://docs.google.com/spreadsheets/d/11229Bnfkn9Cr8hkxnzz_2XUiGKSOtLXevw9Lu2BYtak/edit?usp=sharing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white/80 backdrop-blur-md p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-200/60 hover:border-emerald-500 hover:shadow-md transition cursor-pointer block group"
            title="Klik untuk membuka Jurnal Buku Besar Pendapatan di Google Spreadsheet"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-emerald-600 transition">Total Pendapatan</span>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition"><CreditCard size={18} /></div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">Rp {stats.revenue.toLocaleString("id-ID")}</div>
          </a>

          <div className="bg-white/80 backdrop-blur-md p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-200/60">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pesanan</span>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><ShoppingBag size={18} /></div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">{loading ? "..." : stats.totalOrders} Transaksi</div>
            <p className="text-[11px] text-blue-600 font-semibold mt-1">Orders</p>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-200/60">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Galeri Desa</span>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><GalleryIcon size={18} /></div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">{loading ? "..." : stats.totalGallery} Foto</div>
            <p className="text-[11px] text-purple-600 font-semibold mt-1">Dokumentasi</p>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-200/60">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Users size={18} /></div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">{loading ? "..." : stats.users} Pengguna</div>
            <p className="text-[11px] text-amber-600 font-semibold mt-1">Terdaftar di WP</p>
          </div>
        </div>

        {/* 🧾 MONITORING ORDERS REAL-TIME (DENGAN BATAS 5 & LIHAT SEMUA) */}
        <div className="bg-white/80 backdrop-blur-md p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-200/60">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Daftar Pesanan & Status Pembayaran</h2>
              <p className="text-[11px] sm:text-xs text-slate-500">Menampilkan daftar transaksi pesanan terbaru dari wisatawan.</p>
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 sm:px-3 py-1.5 rounded-xl">
              Total: {orders.length} Orders
            </span>

          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs whitespace-nowrap sm:whitespace-normal">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-bold">ID Order</th>
                  <th className="pb-3 font-bold">Nama Pemesan</th>
                  <th className="pb-3 font-bold">Item Produk</th>
                  <th className="pb-3 font-bold">Total Harga</th>
                  <th className="pb-3 font-bold">Status Pembayaran</th>
                  <th className="pb-3 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                      Belum ada data transaksi pesanan yang masuk.
                    </td>
                  </tr>
                ) : (
                  displayedOrders.map((order, index) => (
                    <tr key={index} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 font-bold text-slate-900">#{order.id}</td>
                      <td className="py-4 font-semibold text-slate-700">
                        {order.billing?.first_name || order.billing?.last_name ? `${order.billing?.first_name || ''} ${order.billing?.last_name || ''}`.trim() : "Pelanggan"}
                        <div className="text-[11px] text-slate-400 font-normal">{order.billing?.email}</div>
                      </td>
                      <td className="py-4 text-slate-600 font-medium">{order.line_items_name || "Booking Wisata / Homestay"}</td>
                      <td className="py-4 font-bold text-slate-900">Rp {Number(order.total || 0).toLocaleString("id-ID")}</td>
                      <td className="py-4">
                        {order.status === "completed" || order.status === "processing" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full font-bold text-[10px] sm:text-[11px]">
                            <CheckCircle size={12} /> Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full font-bold text-[10px] sm:text-[11px]">
                            <Clock size={12} /> Pending
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 rounded-xl font-semibold transition cursor-pointer"
                        >
                          <Eye size={13} /> Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* TOMBOL LIHAT SEMUA / SEMBUNYIKAN UNTUK TABEL ORDERS */}
          {orders.length > 5 && (
            <div className="pt-4 text-center border-t border-slate-100 mt-2">
              <button
                onClick={() => setShowAllOrders(!showAllOrders)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-2xl text-xs font-bold transition cursor-pointer"
              >
                {showAllOrders ? (
                  <>Sembunyikan Sebagian <ChevronUp size={14} /></>
                ) : (
                  <>Lihat Semua Pesanan ({orders.length - 5} lainnya) <ChevronDown size={14} /></>
                )}
              </button>
            </div>
          )}
        </div>

        {/* 💬 KOTAK MASUK PESAN & ASPIRASI (DENGAN BATAS 5 & FADE TOGGLE) */}
        <div className="bg-white/80 backdrop-blur-md p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-200/60 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl"><MessageSquare size={18} /></div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">Kotak Pesan</h2>
                <p className="text-[11px] sm:text-xs text-slate-500">Pesan dan aspirasi masuk dari pengunjung.</p>
              </div>
            </div>
            
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={14} />
              </span>
              <input 
                type="text"
                placeholder="Cari nama atau isi pesan..."
                value={messageSearch}
                onChange={(e) => setMessageSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div className="overflow-x-auto relative">
            <table className="w-full text-left border-collapse text-xs whitespace-nowrap sm:whitespace-normal">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-bold">Nama Pengirim</th>
                  <th className="pb-3 font-bold">Email</th>
                  <th className="pb-3 font-bold">Isi Pesan</th>
                  <th className="pb-3 font-bold">Waktu Masuk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedMessages.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 italic">
                      {messageSearch ? "Tidak ada pesan yang sesuai dengan kata kunci pencarian." : "Belum ada pesan yang masuk dari halaman kontak."}
                    </td>
                  </tr>
                ) : (
                  displayedMessages.map((msg, index) => (
                    <tr key={index} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 font-bold text-slate-900">{msg.nama}</td>
                      <td className="py-4 text-slate-600">{msg.email || "-"}</td>
                      <td className="py-4 text-slate-700 font-medium">{msg.pesan}</td>
                      <td className="py-4 text-slate-400 text-[11px]">{msg.tanggal}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* TOMBOL LIHAT SEMUA / SEMBUNYIKAN UNTUK TABEL PESAN */}
          {filteredMessages.length > 5 && (
            <div className="pt-4 text-center border-t border-slate-100 mt-2">
              <button
                onClick={() => setShowAllMessages(!showAllMessages)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-2xl text-xs font-bold transition cursor-pointer"
              >
                {showAllMessages ? (
                  <>Sembunyikan Sebagian <ChevronUp size={14} /></>
                ) : (
                  <>Lihat Semua Pesan ({filteredMessages.length - 5} lainnya) <ChevronDown size={14} /></>
                )}
              </button>
            </div>
          )}
        </div>

      </main>

      {/* MODAL POP-UP DETAIL INFORMASI BOOKING USER & KONFIRMASI PEMBAYARAN */}
      {selectedOrder && (
        <div 
          onClick={() => setSelectedOrder(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-5 shadow-2xl border border-slate-100 relative my-8 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-md">
                  Informasi Detail Booking & Transaksi
                </span>
                <h3 className="text-lg font-black text-slate-900 uppercase mt-1">
                  Order #{selectedOrder.id}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-100">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-emerald-700">
                  👤 Data Pemesan & Kontak
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nama Pemesan</span>
                    <strong className="text-slate-800">{selectedOrder.billing?.first_name || "-"} {selectedOrder.billing?.last_name || ""}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">No. HP / WhatsApp</span>
                    <strong className="text-slate-800">{selectedOrder.billing?.phone || "-"}</strong>
                  </div>
                  <div className="col-span-2 pt-1">
                    <span className="text-slate-400 block text-[10px]">Alamat Email</span>
                    <strong className="text-slate-800">{selectedOrder.billing?.email || "-"}</strong>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-100">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-emerald-700">
                  🏷️ Detail Transaksi & Rencana Kunjungan
                </h4>
                <div className="space-y-2 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Kategori</span>
                    <strong className="text-slate-800">{selectedOrder.jenis_pesanan || "Umum"}</strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Nama Paket / Produk</span>
                    <strong className="text-slate-800">{selectedOrder.line_items_name || "-"}</strong>
                  </div>

                  {/* Penyesuaian jadwal berdasarkan jenis pesanan */}
                  {selectedOrder.jenis_pesanan === 'Homestay' ? (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Tanggal Check-in</span>
                        <strong className="text-emerald-700">{selectedOrder.tanggal_mulai || "-"}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Tanggal Check-out</span>
                        <strong className="text-emerald-700">{selectedOrder.tanggal_selesai || "-"}</strong>
                      </div>
                    </div>
                  ) : selectedOrder.jenis_pesanan === 'Paket Wisata' || selectedOrder.jenis_pesanan === 'Paket' ? (
                    <div className="pt-2 border-t border-slate-200/60">
                      <span className="text-slate-400 block text-[10px]">Jadwal Kunjungan</span>
                      <strong className="text-emerald-700">{selectedOrder.tanggal_mulai || selectedOrder.tanggal_reservasi || "-"}</strong>
                    </div>
                  ) : null}

                  <div>
                    <span className="text-slate-400 block text-[10px] mt-1">Waktu Pembuatan Order</span>
                    <strong className="text-slate-800">{selectedOrder.date || "-"}</strong>
                  </div>
                </div>
              </div>

              {/* Tampilan Bukti Transfer jika diunggah user */}
              {selectedOrder.bukti_url && (
                <div className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-100">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-emerald-700">
                    🧾 Bukti Transfer
                  </h4>
                  <a href={selectedOrder.bukti_url} target="_blank" rel="noopener noreferrer" className="block">
                    <img 
                      src={selectedOrder.bukti_url} 
                      alt="Bukti Transfer" 
                      className="w-full max-h-40 object-cover rounded-xl border border-slate-200 hover:opacity-95 transition" 
                    />
                  </a>
                  <p className="text-[10px] text-slate-400 italic">Klik gambar untuk memperbesar.</p>
                </div>
              )}

              <div className="flex justify-between items-center bg-emerald-50/70 border border-emerald-100 p-4 rounded-2xl">
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase block">Total Pembayaran</span>
                  <span className="text-lg font-black text-emerald-900">Rp {Number(selectedOrder.total || 0).toLocaleString("id-ID")}</span>
                </div>
                <div>
                  {selectedOrder.status === "completed" || selectedOrder.status === "processing" ? (
                    <span className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-bold text-[11px] uppercase tracking-wider shadow-sm inline-flex items-center gap-1">
                      <CheckCircle size={12} /> Lunas (Paid)
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 bg-amber-500 text-white rounded-xl font-bold text-[11px] uppercase tracking-wider shadow-sm inline-flex items-center gap-1">
                      <Clock size={12} /> Pending
                    </span>
                  )}
                </div>
              </div>

              {/* Tombol Konfirmasi Admin (Muncul selama status belum completed atau processing) */}
              {selectedOrder.status !== "completed" && selectedOrder.status !== "processing" && (
                <button 
                  onClick={() => handleMarkAsPaid(selectedOrder.id)}
                  disabled={updatingStatus}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCheck size={16} /> Konfirmasi Pembayaran (Ubah Jadi Paid)
                </button>
              )}
            </div>

            <button 
              onClick={() => setSelectedOrder(null)}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
            >
              Tutup Jendela
            </button>
          </div>
        </div>
      )}

    </div>
  );
}