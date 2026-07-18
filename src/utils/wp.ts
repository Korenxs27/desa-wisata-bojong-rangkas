// Tambahkan interface ini kembali
export interface WPTravelTrip {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  wp_travel_trip_meta?: {
    trip_price?: string;
    trip_duration?: string;
  };
}

export async function getTrips(): Promise<any[]> {
  const baseUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
  
  try {
    // Ganti endpoint ke yang sudah kamu tes berhasil
    const res = await fetch(`${baseUrl}/wp/v2/trip?_embed`, {
      next: { revalidate: 60 }
    });

    if (!res.ok) return [];
    
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching trips:", error);
    return [];
  }
}