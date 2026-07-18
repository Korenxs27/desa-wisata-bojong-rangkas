"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, Loader2, ArrowRight } from "lucide-react";

interface SearchResult {
  id: string | number;
  title: string;
  slug: string;
  type: "wisata" | "homestay" | "paket" | "umkm" | "halaman";
  image: string | null;
}

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // 🗺️ DATA HALAMAN STATIS: Untuk memetakan pencarian navigasi internal utama
 // 🗺️ DATA HALAMAN STATIS: Jalur pintas navigasi internal desa
  const staticPages = [
    { id: "p-profil", title: "Profil Desa Bojong Rangkas", slug: "/profil", keywords: ["profil", "desa", "sejarah", "tentang", "about"], image: "/images/bg.png" },
    { id: "p-gallery", title: "Gallery Foto & Dokumentasi", slug: "/gallery", keywords: ["gallery", "galeri", "foto", "dokumentasi", "kegiatan", "gambar"], image: "/images/bg.png" }, 
    { id: "p-kontak", title: "Kontak & Lokasi Sekretariat", slug: "/kontak", keywords: ["kontak", "contact", "hubungi", "telepon", "alamat", "lokasi", "maps"], image: "/images/bg.png" },
    { id: "p-review", title: "Testimoni & Review Wisatawan", slug: "/#testimoni", keywords: ["review", "testimoni", "kata mereka", "komentar", "ulasan"], image: "/images/bg.png" },
    { id: "p-paket-all", title: "Katalog Paket Wisata Terpadu", slug: "/paket", keywords: ["paket", "travel", "katalog paket", "booking"], image: "/images/bg.png" },
    { id: "p-homestay-all", title: "Daftar Penginapan & Homestay", slug: "/homestay", keywords: ["homestay", "penginapan", "sewa", "kamar", "rumah"], image: "/images/bg.png" },
    { id: "p-umkm-all", title: "Katalog Produk UMKM Desa", slug: "/umkm", keywords: ["umkm", "produk", "oleh-oleh", "belanja", "toko", "tas", "kopi"], image: "/images/bg.png" }
  ];

  useEffect(() => {
    if (query.trim().length < 2) { // Gua turunin ke 2 karakter biar pencarian kata pendek kayak 'kb' atau 'tas' langsung responsif cukk
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const lowerQuery = query.toLowerCase().trim();

        // 1. Filter halaman statis lokal dulu secara instan
        const matchedStatic = staticPages
          .filter(page => 
            page.title.toLowerCase().includes(lowerQuery) || 
            page.keywords.some(keyword => keyword.includes(lowerQuery))
          )
          .map(page => ({
            id: page.id,
            title: page.title,
            slug: page.slug,
            type: "halaman" as const,
            image: page.image
          }));

        // 2. Ambil data paralel dari CPT WordPress & WooCommerce API
        const [resWisata, resHomestay, resUmkm] = await Promise.all([
          fetch(`https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wp/v2/wisata?search=${query}&_embed&per_page=3`).then(r => r.json()).catch(() => []),
          fetch(`https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wp/v2/homestay?search=${query}&_embed&per_page=3`).then(r => r.json()).catch(() => []),
          fetch(`/api/search?q=${query}`).then(r => r.json()).catch(() => [])
        ]);

        const formattedResults: SearchResult[] = [...matchedStatic];

        // Parsing Wisata
        if (Array.isArray(resWisata)) {
          resWisata.forEach((item: any) => {
            formattedResults.push({
              id: item.id,
              title: item.title?.rendered,
              slug: `/wisata/${item.slug}`,
              type: "wisata",
              image: item._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null
            });
          });
        }

        // Parsing Homestay
        if (Array.isArray(resHomestay)) {
          resHomestay.forEach((item: any) => {
            formattedResults.push({
              id: item.id,
              title: item.title?.rendered,
              slug: `/homestay/${item.slug}`,
              type: "homestay",
              image: item._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null
            });
          });
        }

        // Parsing UMKM (WooCommerce)
        if (Array.isArray(resUmkm)) {
          resUmkm.forEach((item: any) => {
            formattedResults.push({
              id: item.id,
              title: item.name,
              slug: `/umkm/${item.slug}`,
              type: "umkm",
              image: item.images?.[0]?.src || null
            });
          });
        }

        setResults(formattedResults);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 400); // 400ms biar kerasa lebih instan dan gesit pas ngetik cukk

    return () => clearTimeout(delayDebounce);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-start justify-center pt-[10vh] px-4">
      <div className="bg-white/90 backdrop-blur-xl border border-white/40 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Input Bar */}
        <div className="p-4 flex items-center gap-3 border-b border-neutral-100">
          <Search className="text-neutral-400 shrink-0" size={20} />
          <input
            type="text"
            placeholder="Cari wisata, produk, gallery, profil, atau kontak..."
            className="w-full bg-transparent text-sm text-neutral-800 outline-none placeholder:text-neutral-400 font-light"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button onClick={onClose} className="p-1 rounded-xl bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition">
            <X size={16} />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
          {loading && (
            <div className="flex items-center justify-center py-8 gap-2 text-xs text-neutral-400 font-light">
              <Loader2 className="animate-spin text-emerald-600" size={16} /> Mencari data...
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block px-2">Hasil Pencarian</span>
              {results.map((res) => (
                <Link
                  key={`${res.type}-${res.id}`}
                  href={res.slug}
                  onClick={onClose}
                  className="flex items-center gap-3 p-2 rounded-2xl hover:bg-emerald-50/50 border border-transparent hover:border-emerald-100/60 transition group"
                >
                  <div className="relative w-12 h-12 rounded-xl bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200/40">
                    <Image src={res.image || "/placeholder-wisata.jpg"} alt={res.title} fill className="object-cover" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md inline-block mb-1 text-white ${
                      res.type === 'halaman' ? 'bg-indigo-600' : 'bg-neutral-900'
                    }`}>
                      {res.type}
                    </span>
                    <h4 className="text-xs font-semibold text-neutral-800 truncate group-hover:text-emerald-600 transition">{res.title}</h4>
                  </div>
                  <ArrowRight size={14} className="text-neutral-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition shrink-0" />
                </Link>
              ))}
            </div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <p className="text-center py-8 text-xs text-neutral-400 font-light italic">Data tidak ditemukan cukk.</p>
          )}

          {query.length < 2 && (
            <p className="text-center py-6 text-xs text-neutral-400 font-light">Ketik minimal 2 karakter untuk mulai mencari.</p>
          )}
        </div>
      </div>
    </div>
  );
}