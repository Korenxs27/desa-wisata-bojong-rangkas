"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ShieldAlert, Lock, User, Loader2, Landmark } from "lucide-react";
import { loginAction } from "./actions";

export default function LoginPage() {
  // Menggunakan hooks useActionState bawaan React 19 / Next.js modern
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-800 antialiased flex items-center justify-center px-6 pt-20 pb-12 relative overflow-hidden selection:bg-emerald-100">
      
      {/* Ornamen Luxury Background Blur */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* 🏛️ CARD LOGIN GLASSMORPHISM */}
      <div className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/60 p-8 md:p-10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] relative z-10 space-y-6 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header Logo & Title */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mx-auto group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-black text-white text-sm shadow-md">
              BR
            </div>
          </Link>
          <h1 className="text-2xl font-light font-serif tracking-tight text-neutral-900 pt-2">
            Pemerintahan Desa
          </h1>
          <p className="text-[11px] text-neutral-400 font-light uppercase tracking-widest">
            Bojong Rangkas Gatekeeper
          </p>
        </div>

        {/* Notifikasi Eror dari Server Action */}
        {state?.error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3.5 rounded-2xl text-xs font-light flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <span>{state.error}</span>
          </div>
        )}

        {/* Form Input Data */}
        <form action={formAction} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Username / Email</label>
            <div className="relative flex items-center">
              <User size={14} className="absolute left-4 text-neutral-400" />
              <input 
                type="text" 
                name="username"
                required
                disabled={isPending}
                className="w-full bg-neutral-50/80 border border-neutral-200/60 rounded-full pl-11 pr-4 py-3 text-xs font-light outline-none focus:border-emerald-500 disabled:opacity-60 transition"
                placeholder="Masukkan username WordPress..."
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Password</label>
            </div>
            <div className="relative flex items-center">
              <Lock size={14} className="absolute left-4 text-neutral-400" />
              <input 
                type="password" 
                name="password"
                required
                disabled={isPending}
                className="w-full bg-neutral-50/80 border border-neutral-200/60 rounded-full pl-11 pr-4 py-3 text-xs font-light outline-none focus:border-emerald-500 disabled:opacity-60 transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Tombol Submit Trigger */}
          <button 
            type="submit"
            disabled={isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/70 text-white text-xs font-bold uppercase tracking-wider py-3.5 rounded-full transition shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Mengautentikasi...
              </>
            ) : (
              <>
                Masuk ke Dasbor <Landmark size={12} />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center pt-2">
          <Link href="/" className="text-[11px] text-neutral-400 hover:text-emerald-600 transition font-light">
            ← Kembali ke Beranda Utama
          </Link>
        </div>

      </div>

    </div>
  );
}