import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Batujai Salva Residence - Portal Informasi Perumahan",
  description: "Aplikasi Terpadu Batujai Salva Residence: Daftar Warga per Blok, Iuran Bulanan, Buku Kas Lingkungan, dan Pusat Aduan Warga",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
