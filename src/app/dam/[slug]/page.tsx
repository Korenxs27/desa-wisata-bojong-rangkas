"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, Users, CheckCircle2, XCircle, ArrowRight, UserCheck, CalendarDays, ChevronDown } from 'lucide-react';

export default function TripDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    
    fetch("https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/wp/v2/trip?_embed")
      .then(res => res.json())
      .then(data => {
        const found = data.find((t: any) => t.slug === slug);
        setTrip(found);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal memuat API WordPress:", err);
        setLoading(false);
      });
  }, [slug]);

  // UI LOADING STATE 3D GLASSMORPHISM (INTERAKTIF, SMOOTH & MODERN)
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F4F4] flex flex-col items-center justify-center antialiased relative overflow-hidden">
        
        {/* Ornamen Pendaran Cahaya Absktrak di Background (Aura Glow) */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-400/10 rounded-full blur-[150px] animate-pulse [animation-delay:1s]" />

        {/* Kontainer Utama Spinner Kaca */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 bg-white/40 backdrop-blur-2xl border border-white/60 p-12 rounded-[40px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center max-w-sm w-full mx-4"
        >
          {/* Efek Lingkaran Loading 3D / Pseudo-3D Depth Spinner */}
          <div className="relative w-24 h-24 mb-6">
            {/* Layer Cincin Kaca Dasar */}
            <div className="absolute inset-0 rounded-full border-[6px] border-neutral-200/40 backdrop-blur-sm" />
            
            {/* Layer Rotasi Cincin Utama dengan Gradasi Glow */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              className="absolute inset-0 rounded-full border-[6px] border-transparent border-t-emerald-500 border-r-emerald-400/40 filter drop-shadow-[0_4px_12px_rgba(16,185,129,0.35)]"
            />

            {/* Efek Inti Kaca Tengah (Inner Shadow & Depth) */}
            <div className="absolute inset-4 rounded-full bg-white/20 backdrop-blur-md border border-white/40 shadow-inner flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-ping" />
            </div>
          </div>

          {/* Teks Status Loading yang Minimalis & Elegan */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center space-y-2"
          >
            <h3 className="text-sm font-medium tracking-[0.2em] uppercase text-neutral-800 font-sans">
              Menyiapkan Paket Wisata...
            </h3>
          </motion.div>
        </motion.div>
        
      </div>
    );
  }

  if (!trip) return notFound();

  // 1. Aset Media Utama & Destinasi
  const mainImg = trip._embedded?.['wp:featuredmedia']?.[0]?.source_url || "/placeholder.jpg";
  const imgSizes = trip.featured_image?.sizes;
  const destinationName = trip._embedded?.['wp:term']?.[0]?.[0]?.name || "Bojong Rangkas";
  const freeMapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(trip.title?.rendered + " " + destinationName)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  const galleryImages = [
    imgSizes?.large?.source_url || mainImg,
    imgSizes?.medium_large?.source_url || mainImg,
    imgSizes?.['travel-monster-latest-post']?.source_url || mainImg,
    imgSizes?.['travel-monster-withsidebar']?.source_url || mainImg,
  ];

  // 2. Membaca Trip Facts Asli dari API WP Travel
  const tripFacts = [
    { 
      icon: Clock, 
      label: "Duration", 
      val: trip.duration?.days ? `${trip.duration.days} Days` : (trip.trip_duration ? `${trip.trip_duration} Days` : "-")
    },
    { 
      icon: Users, 
      label: "Min & Max Age", 
      val: trip.min_age || trip.max_age 
        ? `${trip.min_age || 0} - ${trip.max_age || 'Any'} Years` 
        : (trip.wp_travel_min_age ? `${trip.wp_travel_min_age} - ${trip.wp_travel_max_age || 'Any'} Years` : "-") 
    },
    { 
      icon: UserCheck, 
      label: "Min Booking", 
      val: trip.min_pax ? `${trip.min_pax} Person` : (trip.min_travelers ? `${trip.min_travelers} Person` : "-")
    },
    { 
      icon: CalendarDays, 
      label: "Tour Type", 
      val: trip.tour_type || "Desa Wisata" 
    },
  ];

  // 3. Mengambil Nilai Harga Tunggal Asli dari WordPress
  const tripPrice = trip.price || trip.wp_travel_price || 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#FAFAFA] pb-20 text-neutral-800 antialiased selection:bg-emerald-100">
      
      {/* Gallery Section */}
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 overflow-hidden rounded-3xl border border-neutral-100 shadow-sm bg-white">
          <img src={mainImg} alt={trip.title?.rendered} className="w-full h-[480px] object-cover hover:scale-[1.01] transition duration-700" />
        </div>
        <div className="grid grid-cols-2 gap-4 h-[480px]">
          {galleryImages.map((img, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-neutral-100 shadow-sm bg-white">
              <img src={img} className="w-full h-full object-cover opacity-90 hover:opacity-100 transition duration-300" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Layout Content */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* Kolom Kiri */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600 bg-emerald-50/60 px-3 py-1 rounded-full border border-emerald-100/50">{destinationName}</span>
            <h1 className="text-4xl md:text-5xl font-light font-serif tracking-tight text-neutral-900 pt-1">{trip.title?.rendered}</h1>
          </div>

          {/* Trip Facts */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tripFacts.map((fact, idx) => (
              <InfoBadge key={idx} icon={fact.icon} label={fact.label} val={fact.val} />
            ))}
          </div>

          {/* Overview */}
          <div className="bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-white/80 shadow-sm">
            <h2 className="text-xl font-medium tracking-tight text-neutral-900 mb-4">Overview</h2>
            <div className="text-neutral-500 text-sm leading-relaxed font-light whitespace-pre-line" dangerouslySetInnerHTML={{ __html: trip.description }} />
          </div>

          {/* Itinerary */}
          <div className="bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-white/80 shadow-sm">
            <h2 className="text-xl font-medium tracking-tight text-neutral-900 mb-6">Jadwal Perjalanan</h2>
            <div className="space-y-6 relative border-l border-neutral-100 ml-3 pl-6">
              {trip.itineraries?.map((it: any, i: number) => (
                <div key={i} className="relative group">
                  <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h4 className="font-semibold text-neutral-800 text-sm">Hari {i + 1}: {it.title}</h4>
                  <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed font-light">{it.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Include & Exclude */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-white/80 shadow-sm">
              <h3 className="font-semibold text-sm text-neutral-900 mb-4 flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500"/> Harga Termasuk</h3>
              <div className="text-xs text-neutral-500 whitespace-pre-line leading-relaxed font-light">{trip.cost_includes}</div>
            </div>
            <div className="bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-white/80 shadow-sm">
              <h3 className="font-semibold text-sm text-neutral-900 mb-4 flex items-center gap-2"><XCircle size={16} className="text-rose-400"/> Tidak Termasuk</h3>
              <div className="text-xs text-neutral-500 whitespace-pre-line leading-relaxed font-light">{trip.cost_excludes}</div>
            </div>
          </div>

          {/* Maps Area */}
          <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/80 shadow-sm">
            <h2 className="text-xl font-medium tracking-tight text-neutral-900 mb-4">Peta Lokasi</h2>
            <div className="w-full h-72 rounded-2xl overflow-hidden border border-neutral-100/60 shadow-inner">
              <iframe src={freeMapsUrl} className="w-full h-full border-0" allowFullScreen loading="lazy"></iframe>
            </div>
          </div>

          {/* FAQs Accordion */}
          <div className="bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-white/80 shadow-sm">
            <h2 className="text-xl font-medium tracking-tight text-neutral-900 mb-6">Pertanyaan Umum (FAQs)</h2>
            <div className="space-y-4">
              {trip.faqs && trip.faqs.length > 0 ? (
                trip.faqs.map((faq: any, i: number) => (
                  <details key={i} className="group border-b border-neutral-100/60 pb-3 cursor-pointer">
                    <summary className="flex justify-between items-center text-sm font-medium text-neutral-800 group-open:text-emerald-600 transition duration-300">
                      {faq.title}
                      <ChevronDown size={16} className="text-neutral-400 group-open:rotate-180 transition duration-300"/>
                    </summary>
                    <p className="text-xs text-neutral-500 mt-2 leading-relaxed font-light whitespace-pre-line bg-neutral-50/50 p-3 rounded-xl border border-neutral-100/40">
                      {faq.content}
                    </p>
                  </details>
                ))
              ) : (
                <p className="text-xs text-neutral-400 font-light italic">Belum ada FAQ untuk paket wisata ini.</p>
              )}
            </div>
          </div>

        </div>

        {/* Kolom Kanan: Sidebar Harga Tunggal */}
        <div className="lg:col-span-1 lg:sticky lg:top-8">
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 p-8 rounded-3xl shadow-xl shadow-neutral-100/40 space-y-6">
            <div>
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold block mb-1">Harga Paket Wisata</span>
              <div className="flex items-baseline gap-1">
                <h3 className="text-4xl font-light tracking-tight text-neutral-900">
                  Rp {Number(tripPrice).toLocaleString()}
                </h3>
                <span className="text-xs text-neutral-400 font-light">/pax</span>
              </div>
            </div>
            
            <Link href={`/wisata/${slug}/book`} className="w-full bg-neutral-900 text-white py-4 rounded-2xl text-xs font-semibold tracking-widest uppercase hover:bg-neutral-800 transition flex items-center justify-center gap-2">
  Check Availability <ArrowRight size={14}/>
</Link>
            
            <div className="space-y-4 border-t border-neutral-100 pt-6 text-[13px] font-light text-neutral-500">
              <div className="flex justify-between"><span>Durasi Tour</span><span className="font-medium text-neutral-800">{trip.duration?.days || 0} Hari</span></div>
              <div className="flex justify-between"><span>Mata Uang</span><span className="font-medium text-neutral-800">{trip.currency?.code || "IDR"}</span></div>
              <div className="flex justify-between"><span>Garansi</span><span className="font-medium text-emerald-600 flex items-center gap-1"><CheckCircle2 size={12}/> Best Price</span></div>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

function InfoBadge({ icon: Icon, label, val }: { icon: any, label: string, val: string }) {
  return (
    <div className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white/80 flex flex-col items-center justify-center text-center shadow-sm">
      <Icon size={18} className="text-emerald-600 mb-2" />
      <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">{label}</span>
      <span className="text-xs font-medium text-neutral-800 mt-1 max-w-full truncate">{val}</span>
    </div>
  );
}