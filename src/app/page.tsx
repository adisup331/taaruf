import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, ShieldCheck, Zap, Users, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-1.5 rounded-lg text-white">
              <Heart className="h-5 w-5 fill-current" />
            </div>
            <span className="text-xl font-black tracking-tighter text-emerald-950">TaarufYuk</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#fitur" className="hover:text-emerald-600 transition-colors">Fitur</a>
            <a href="#cara-kerja" className="hover:text-emerald-600 transition-colors">Cara Kerja</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="hidden sm:inline-flex text-emerald-900 font-bold">
              <Link href="/login">Masuk</Link>
            </Button>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-100">
              <Link href="/register">Mulai Taaruf</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="container mx-auto px-4 relative z-10 text-center">
            <Badge text="Aplikasi Taaruf Syar'i No. 1" />
            <h1 className="mt-8 text-5xl lg:text-7xl font-black tracking-tight text-emerald-950 leading-[1.1]">
              Cari Jodoh Lebih <span className="text-emerald-600 underline decoration-emerald-200 underline-offset-8">Berkah</span> & Terjaga.
            </h1>
            <p className="mt-8 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Platform pertemuan taaruf yang didesain khusus untuk menjaga privasi dan kesucian proses pencarian jodoh sesuai syariat Islam.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="h-14 px-8 bg-emerald-600 hover:bg-emerald-700 text-lg font-black rounded-2xl shadow-xl shadow-emerald-100 w-full sm:w-auto">
                <Link href="/register">Daftar Sekarang <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-14 px-8 text-lg font-bold border-gray-200 rounded-2xl w-full sm:w-auto">
                <Link href="/login text-emerald-950">Masuk Akun</Link>
              </Button>
            </div>

            {/* Mobile Preview Mockup (Simplified) */}
            <div className="mt-20 relative mx-auto max-w-[280px] sm:max-w-[320px]">
              <div className="absolute -inset-10 bg-emerald-100 blur-3xl opacity-30 rounded-full" />
              <div className="relative border-[8px] border-emerald-950 rounded-[3rem] overflow-hidden shadow-2xl bg-white aspect-[9/19]">
                <div className="h-6 w-1/3 bg-emerald-950 mx-auto rounded-b-2xl mb-4" />
                <div className="px-4 space-y-4">
                  <div className="h-40 w-full bg-emerald-50 rounded-2xl animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 bg-gray-100 rounded" />
                    <div className="h-4 w-1/2 bg-gray-100 rounded" />
                  </div>
                  <div className="h-10 w-full bg-emerald-600 rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="fitur" className="py-24 bg-gray-50/50 border-y border-gray-100">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl lg:text-4xl font-black text-emerald-950">Kenapa Memilih TaarufYuk?</h2>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<ShieldCheck className="h-8 w-8 text-emerald-600" />}
                title="Privasi Terjaga"
                description="Foto profil otomatis di-blur dan hanya bisa dilihat oleh lawan jenis saat sesi taaruf dijadwalkan."
              />
              <FeatureCard
                icon={<Zap className="h-8 w-8 text-emerald-600" />}
                title="Sistem Realtime"
                description="Dapatkan notifikasi instan saat ada permintaan masuk atau saat admin mengatur meja pertemuan."
              />
              <FeatureCard
                icon={<Users className="h-8 w-8 text-emerald-600" />}
                title="Pendampingan Panitia"
                description="Seluruh proses dipantau dan diatur oleh panitia profesional untuk menjaga adab islami."
              />
            </div>
          </div>
        </section>

        {/* Cara Kerja Section */}
        <section id="cara-kerja" className="py-24 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-black text-emerald-950">Cara Kerja TaarufYuk</h2>
              <p className="mt-4 text-gray-500 max-w-xl mx-auto">Proses yang simpel, sistematis, dan tetap menjaga adab kesopanan.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
              {/* Connector line for desktop */}
              <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-emerald-100 -z-10" />

              <StepCard
                number="1"
                title="Daftar Akun"
                description="Lengkapi biodata lengkap dan unggah foto profil terbaikmu."
              />
              <StepCard
                number="2"
                title="Scan QR Event"
                description="Datang ke lokasi acara dan scan QR panitia untuk masuk antrean."
              />
              <StepCard
                number="3"
                title="Klik 'Lancarkan'"
                description="Lihat profil lawan jenis dan ajukan niat taaruf secara digital."
              />
              <StepCard
                number="4"
                title="Duduk di Meja"
                description="Admin atur meja, kamu bisa bertemu langsung didampingi panitia."
              />
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 bg-emerald-900">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl lg:text-5xl font-black text-white leading-tight">
              Siap Menuju Ikatan <br className="hidden md:block" /> yang Halal & Berkah?
            </h2>
            <p className="mt-6 text-emerald-100/60 max-w-xl mx-auto">
              Bergabunglah dengan ratusan peserta lainnya di event taaruf terdekat kami.
            </p>
            <Button size="lg" asChild className="mt-10 h-16 px-12 bg-white text-emerald-900 hover:bg-emerald-50 text-xl font-black rounded-2xl shadow-2xl">
              <Link href="/register text-emerald-900">Mulai Sekarang</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-emerald-600 fill-current" />
            <span className="font-bold text-emerald-950 uppercase tracking-widest text-xs">TaarufYuk © 2026</span>
          </div>
          <div className="flex gap-8 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <a href="#" className="hover:text-emerald-600">Kebijakan Privasi</a>
            <a href="#" className="hover:text-emerald-600">Syarat & Ketentuan</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] bg-emerald-50 text-emerald-700 border border-emerald-100">
      {text}
    </span>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 text-left hover:-translate-y-2 transition-transform duration-300 group">
      <div className="p-4 bg-emerald-50 rounded-2xl inline-block group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
        {icon}
      </div>
      <h3 className="mt-8 text-xl font-black text-emerald-950">{title}</h3>
      <p className="mt-4 text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center text-center group">
      <div className="h-24 w-24 rounded-full bg-white border-4 border-emerald-50 flex items-center justify-center text-3xl font-black text-emerald-600 shadow-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-500 mb-6">
        {number}
      </div>
      <h4 className="text-xl font-black text-emerald-950 mb-2">{title}</h4>
      <p className="text-sm text-gray-400 px-4 leading-relaxed">{description}</p>
    </div>
  );
}
