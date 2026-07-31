'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginAction, registerAction, forgotPasswordAction } from './action';
import { ArrowLeft, Lock, Mail, User as UserIcon, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // 👁️ STATE UNTUK TOGGLE LIHAT PASSWORD
  const [showPassword, setShowPassword] = useState(false);

  // Handler Submit Utama (Sign In & Sign Up)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const formData = new FormData(e.currentTarget);

    if (isSignUp) {
      const res = await registerAction(formData);
      if (res.success) {
        setMsg({ type: 'success', text: res.message });
        setIsSignUp(false);
      } else {
        setMsg({ type: 'error', text: res.message });
      }
    } else {
      const res = await loginAction(formData);
      if (res.success && res.token) {
        const role = res.role || 'user';

        // Bersihkan memori lama agar tidak bentrok
        localStorage.clear();

        // Simpan sesi berdasarkan role
        if (role === 'admin') {
          localStorage.setItem('admin_token', res.token);
          localStorage.setItem('admin_name', res.name || 'Administrator');
          localStorage.setItem('user_role', 'admin');
        } else {
          localStorage.setItem('user_token', res.token);
          localStorage.setItem('user_name', res.name || 'Pengunjung');
          localStorage.setItem('user_role', role);
          localStorage.setItem('user_email', res.email || '');
        }

        setMsg({ type: 'success', text: 'Login berhasil! Mengalihkan...' });
        
        setTimeout(() => {
          window.location.href = res.redirectTo || (role === 'admin' ? '/admin' : '/user/dashboard');
        }, 600);

      } else {
        setMsg({ type: 'error', text: res.message || 'Terjadi kesalahan pada sistem.' });
      }
    }

    setLoading(false);
  };

  // Handler Submit Khusus Lupa Password
  const handleForgotPasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const formData = new FormData(e.currentTarget);
    const res = await forgotPasswordAction(formData);

    if (res.success) {
      setMsg({ type: 'success', text: res.message });
    } else {
      setMsg({ type: 'error', text: res.message });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30 overflow-hidden">
      
      {/* Background Soft Glassy Glow Effects */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-300/10 rounded-full blur-3xl pointer-events-none" />

      {/* Tombol Kembali ke Beranda */}
      <div className="absolute top-6 left-6 z-25">
        <Link 
          href="/" 
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/80 text-slate-700 hover:text-emerald-700 hover:bg-white transition text-xs font-bold shadow-sm"
        >
          <ArrowLeft size={14} /> Kembali ke Beranda
        </Link>
      </div>

      {/* Card Container (Glassy Luxury Style) */}
      <div className="relative z-10 max-w-md w-full bg-white/70 backdrop-blur-xl border border-white/85 rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-8">
        
        {/* Toggle Tab (Hanya muncul jika tidak sedang di mode Lupa Password) */}
        {!isForgotPassword && (
          <div className="flex bg-slate-200/50 p-1 rounded-2xl mb-6 border border-slate-200/60">
            <button
              type="button"
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 ${!isSignUp ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              onClick={() => { setIsSignUp(false); setMsg(null); }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 ${isSignUp ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              onClick={() => { setIsSignUp(true); setMsg(null); }}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Heading (Updated to Serif Luxury Font) */}
        <div className="text-center mb-6 space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-serif font-normal text-slate-900 tracking-tight">
            {isForgotPassword ? 'Reset Password' : isSignUp ? 'Buat Akun Baru' : 'Selamat Datang'}
          </h2>
          <p className="text-xs text-slate-500 font-light leading-relaxed">
            {isForgotPassword 
              ? 'Masukkan email terdaftar untuk pemulihan akun' 
              : isSignUp 
              ? 'Daftar untuk akses eksklusif Desa Wisata' 
              : 'Masuk ke dalam panel akun terdaftar'}
          </p>
        </div>

        {/* Alert Notification */}
        {msg && (
          <div className={`p-3 rounded-xl text-xs mb-4 border font-medium ${msg.type === 'error' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
            {msg.text}
          </div>
        )}

        {/* KONDISI TAMPILAN: FORM LUPA PASSWORD VS FORM UTAMA */}
        {isForgotPassword ? (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Email Terdaftar</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={15} />
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="nama@email.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-white/60 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-neutral-900 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {loading ? 'Mengirim...' : 'Kirim Tautan Pemulihan'}
            </button>

            <button
              type="button"
              onClick={() => { setIsForgotPassword(false); setMsg(null); }}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-800 font-medium mt-3 transition"
            >
              &larr; Kembali ke halaman Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Username / Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon size={15} />
                </span>
                <input
                  type="text"
                  name="username"
                  required
                  placeholder="Masukkan username atau email"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-white/60 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition shadow-sm"
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={15} />
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="nama@email.com"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-white/60 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition shadow-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                {/* Ikon Gembok di Kiri */}
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={15} />
                </span>

                {/* Input Password dengan Dynamic Type (password / text) */}
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-white/60 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition shadow-sm"
                />

                {/* Tombol Mata (Show/Hide Password) di Kanan */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                  title={showPassword ? "Sembunyikan password" : "Lihat password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Tombol Lupa Password (Hanya muncul saat tab Sign In aktif) */}
            {!isSignUp && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => { setIsForgotPassword(true); setMsg(null); }}
                  className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold transition"
                >
                  Lupa password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-neutral-900 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Memproses...' : isSignUp ? 'Daftar Akun Baru' : 'Sign In'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}