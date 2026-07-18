import { getTrips } from "../../utils/wp";
import Link from "next/link";

export const metadata = {
  title: "Destinasi Wisata Bojong Rangkas",
  description: "Temukan paket wisata dan petualangan alam terbaik di Bojong Rangkas.",
};
export default async function WisataPage() {
  const trips = await getTrips();

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-8 md:p-16">
      <header className="mb-20 text-center">
        <span className="text-emerald-700 font-medium tracking-[0.2em] uppercase text-sm mb-4 block">
          Discover Bojong Rangkas
        </span>
        <h1 className="text-5xl md:text-6xl font-serif text-neutral-900 mb-6">
          Nature Luxury Escapes
        </h1>
        <p className="text-neutral-500 max-w-xl mx-auto font-light leading-relaxed">
          Rasakan ketenangan alam yang dipadukan dengan kenyamanan fasilitas premium. Pilihan destinasi terbaik untuk jiwa yang mencari kedamaian.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {trips.map((trip: any) => {
          const imageUrl = trip._embedded?.['wp:featuredmedia']?.[0]?.source_url;
          
          return (
            <Link
              href={`/wisata/${trip.slug}`}
              key={trip.id}
              className="group relative bg-white/70 border border-white/40 rounded-[2rem] overflow-hidden hover:border-emerald-200 transition-all duration-700 hover:shadow-2xl hover:shadow-emerald-900/10 backdrop-blur-2xl"
            >
              {/* Image Container */}
              <div className="relative h-72 w-full overflow-hidden">
                <img 
                  src={imageUrl || '/placeholder-wisata.jpg'} 
                  alt={trip.title?.rendered} 
                  className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                />
                <div className="absolute top-6 left-6">
                  <span className="bg-white/80 backdrop-blur-md text-emerald-900 text-[10px] px-4 py-1.5 rounded-full font-bold tracking-wider uppercase">
                    {trip.duration?.days ? `${trip.duration.days} Days` : 'Trip'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <h2 className="text-2xl font-serif text-neutral-900 mb-4 group-hover:text-emerald-800 transition-colors">
                  {trip.title?.rendered}
                </h2>
                
                <div className="text-neutral-500 text-sm mb-8 font-light leading-relaxed line-clamp-2" 
                     dangerouslySetInnerHTML={{ __html: trip.content?.rendered || "Nikmati keasrian alam Bojong Rangkas dengan fasilitas eksklusif." }} 
                />

                <div className="flex items-center justify-between border-t border-neutral-100 pt-6">
                  <div>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-medium">Mulai dari</p>
                    <p className="text-xl font-medium text-neutral-900">
                      {trip.price ? `${trip.currency?.symbol || 'Rp'} ${trip.price.toLocaleString("id-ID")}` : "Kontak Admin"}
                    </p>
                  </div>
                  
                  <div className="w-12 h-12 rounded-full border border-neutral-200 flex items-center justify-center group-hover:bg-emerald-700 group-hover:border-emerald-700 transition-all">
                    <svg className="w-5 h-5 text-neutral-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}