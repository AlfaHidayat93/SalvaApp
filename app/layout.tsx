import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SALVA Residence - Portal Sistem Informasi",
  description: "Aplikasi Terpadu: Daftar Warga per Blok, Iuran Bulanan, Buku Kas & Pengeluaran, dan Pusat Aduan Warga",
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
