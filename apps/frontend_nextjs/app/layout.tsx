import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Microfinancy Admin",
  description: "Interface de gestion Next.js pour Microfinancy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50 text-slate-900">
        <div className="min-h-full">
          <header className="border-b border-slate-200 bg-white/95 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Microfinancy</p>
                <h1 className="text-xl font-semibold text-slate-900">Interface de gestion</h1>
              </div>
              <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
                <Link className="rounded-full px-3 py-2 transition hover:bg-slate-100" href="/">
                  Accueil
                </Link>
                <Link className="rounded-full px-3 py-2 transition hover:bg-slate-100" href="/societes">
                  Sociétés
                </Link>
                <Link className="rounded-full px-3 py-2 transition hover:bg-slate-100" href="/agences">
                  Agences
                </Link>
                <Link className="rounded-full px-3 py-2 transition hover:bg-slate-100" href="/users">
                  Utilisateurs
                </Link>
                <Link className="rounded-full px-3 py-2 transition hover:bg-slate-100" href="/comptes">
                  Comptes
                </Link>
                <Link className="rounded-full px-3 py-2 transition hover:bg-slate-100" href="/stats">
                  Statistiques
                </Link>
              </nav>
            </div>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
