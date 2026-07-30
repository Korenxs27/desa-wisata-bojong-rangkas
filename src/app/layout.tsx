import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"; 
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Desa Wisata Bojong Rangkas",
  description: "Ekosistem Wisata Unggulan & UMKM Modern",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        {/* 🚀 SCRIPT MIDTRANS SNAP WAJIB ADA DI GLOBAL HEAD LAYOUT */}
        <script 
          src="https://app.midtrans.com/snap/snap.js" 
          data-client-key="Mid-client-q343rAbCQUljWRLn"
          async
        ></script>
      </head>
      <body className="flex flex-col min-h-screen justify-between">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}