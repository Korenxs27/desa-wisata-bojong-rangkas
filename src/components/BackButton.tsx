"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton({ text }: { text: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()} // TRIK PINTAR: Otomatis balik ke halaman sebelumnya secara native
      className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500 bg-white border border-neutral-200/60 hover:border-emerald-500/30 hover:text-emerald-600 px-4 py-2 rounded-full transition active:scale-98 shadow-[0_2px_10px_rgba(0,0,0,0.01)] group"
    >
      <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-0.5" />
      {text}
    </button>
  );
}