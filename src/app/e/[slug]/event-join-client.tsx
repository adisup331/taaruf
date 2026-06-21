"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Hash, UserPlus, ArrowLeft, ArrowRight, Calendar, MapPin, Clock, Ticket, Camera, CheckCircle2, Loader2 } from "lucide-react";
import { ActionForm } from "@/components/admin-panel/action-form";
import { SubmitButton } from "@/components/admin-panel/submit-button";
import { type ActionResult } from "@/lib/action-result";
import { createClient } from "@/lib/supabase/client";
import { CascadingWilayah } from "@/components/member/CascadingWilayah";

interface Props {
  event: any;
  hasCompleteProfile: boolean;
  claimNumber: (prev: ActionResult, fd: FormData) => Promise<ActionResult>;
  registerNew: (prev: ActionResult, fd: FormData) => Promise<ActionResult>;
  daerahList: { id: string; nama: string }[];
  desaList: { id: string; nama: string }[];
  kelompokList: { id: string; nama: string }[];
}

type Mode = "choose" | "has_number" | "no_number";

const STEPS = [
  { title: "Data Pribadi", desc: "Nama, tanggal lahir, gender" },
  { title: "Asal & Wilayah", desc: "Daerah, kontak" },
  { title: "Daerah Sambung", desc: "Wilayah sambung saat ini" },
  { title: "Keluarga", desc: "Orang tua, pekerjaan" },
  { title: "Foto Profil", desc: "Wajib upload foto" },
];

const Sel = ({ name, children, ...props }: any) => (
  <select name={name} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...props}>
    {children}
  </select>
);

export function EventJoinClient({ event, hasCompleteProfile, claimNumber, registerNew, daerahList, desaList, kelompokList }: Props) {
  const [mode, setMode] = useState<Mode>("choose");
  const [regStep, setRegStep] = useState(0);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const supabase = createClient();

  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFotoFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setFotoPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  }

  function nextStep() {
    if (regStep === STEPS.length - 1 && !fotoFile && !fotoUrl) {
      alert("Foto profil wajib diupload.");
      return;
    }
    if (regStep < STEPS.length - 1) setRegStep(regStep + 1);
  }
  function prevStep() { if (regStep > 0) setRegStep(regStep - 1); }

  async function handleRegisterSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (regStep < STEPS.length - 1) { nextStep(); return; }
    if (!fotoFile && !fotoUrl) { alert("Foto profil wajib diupload."); return; }

    setUploading(true);
    try {
      let uploadedUrl = fotoUrl;
      if (fotoFile && !fotoUrl) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Sesi habis");
        const form = formRef.current!;
        const fd = new FormData(form);
        const nama = (fd.get("namaLengkap") as string) || "user";
        const safeName = nama.toLowerCase().replace(/[^a-z0-9]/g, "-");
        const ext = fotoFile.name.split(".").pop();
        const fileName = `${safeName}-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("pnkb").upload(fileName, fotoFile);
        if (upErr) throw upErr;
        const { data: pubData } = supabase.storage.from("pnkb").getPublicUrl(fileName);
        uploadedUrl = pubData.publicUrl;
        setFotoUrl(uploadedUrl);
      }

      const fd = new FormData(formRef.current!);
      fd.set("fotoProfilUrl", uploadedUrl || "");
      await registerNew({ ok: false, message: "" }, fd);
    } catch (err: any) {
      alert(err.message || "Gagal mendaftar. Coba lagi.");
    } finally {
      setUploading(false);
    }
  }

  const isLastStep = regStep === STEPS.length - 1;

  return (
    <div className="flex min-h-screen items-center justify-center bg-emerald-50 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">

        {/* === CHOOSE MODE === */}
        {mode === "choose" && (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-emerald-100 p-4"><Ticket className="h-12 w-12 text-emerald-600" /></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
              <p className="mt-1 text-sm text-gray-500">Pilih cara masuk ke event</p>
            </div>
            <div className="space-y-3">
              <button type="button" onClick={() => setMode("has_number")}
                className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-gray-100 hover:border-emerald-400 hover:bg-emerald-50 transition-all text-left group">
                <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-600 transition-colors">
                  <Hash className="h-6 w-6 text-emerald-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Sudah Punya Nomor Peserta</p>
                  <p className="text-xs text-gray-500">Masukkan nomor yang diberikan panitia</p>
                </div>
              </button>
              <button type="button" onClick={() => { setMode("no_number"); setRegStep(0); }}
                className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-gray-100 hover:border-blue-400 hover:bg-blue-50 transition-all text-left group">
                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors">
                  <UserPlus className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Belum Punya Nomor Peserta</p>
                  <p className="text-xs text-gray-500">Isi biodata lengkap, dapat nomor otomatis</p>
                </div>
              </button>
            </div>
            <EventMeta event={event} />
          </div>
        )}

        {/* === HAS NUMBER === */}
        {mode === "has_number" && (
          <div className="space-y-6 text-center">
            <button type="button" onClick={() => setMode("choose")} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-4 w-4" /> Kembali
            </button>
            <div className="flex justify-center">
              <div className="rounded-full bg-emerald-100 p-4"><Hash className="h-10 w-10 text-emerald-600" /></div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Masukkan Nomor Peserta</h2>
              <p className="mt-1 text-sm text-gray-500">Nomor yang diberikan panitia</p>
            </div>
            <ActionForm action={claimNumber} className="space-y-3">
              <Input name="participantNumber" inputMode="numeric" placeholder="cth: 12" className="h-16 text-center text-4xl font-black" autoFocus required />
              <SubmitButton pendingText="Memproses..." className="h-12 w-full rounded-xl bg-emerald-600 font-bold hover:bg-emerald-700">Masuk Event</SubmitButton>
            </ActionForm>
          </div>
        )}

        {/* === NO NUMBER - MULTI-STEP === */}
        {mode === "no_number" && (
          <div className="space-y-4">
            <button type="button" onClick={() => { if (regStep > 0) prevStep(); else setMode("choose"); }} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-4 w-4" /> {regStep > 0 ? "Kembali" : "Pilih Ulang"}
            </button>

            {/* Step indicator */}
            <div>
              <div className="flex items-center justify-between mb-2">
                {STEPS.map((s, i) => (
                  <div key={i} className="flex flex-col items-center flex-1">
                    <button type="button" onClick={() => setRegStep(i)} className={`h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-black transition-all cursor-pointer hover:scale-110 ${
                      i < regStep ? "bg-blue-600 text-white" : i === regStep ? "bg-blue-600 text-white ring-3 ring-blue-100" : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                    }`}>{i < regStep ? <CheckCircle2 className="h-3 w-3" /> : i + 1}</button>
                  </div>
                ))}
              </div>
              <div className="flex gap-1">
                {STEPS.map((_, i) => (<div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= regStep ? "bg-blue-500" : "bg-gray-200"}`} />))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">{STEPS[regStep].title}</h2>
              <p className="text-xs text-gray-500">{STEPS[regStep].desc}</p>
            </div>

            <form ref={formRef} onSubmit={handleRegisterSubmit}>
              {/* Step 1: Data Pribadi */}
              <div className={regStep === 0 ? "space-y-3" : "hidden"}>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Nama Lengkap <span className="text-red-500">*</span></label>
                  <Input name="namaLengkap" required placeholder="Nama sesuai biodata" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Tanggal Lahir <span className="text-red-500">*</span></label>
                    <Input name="tanggalLahir" type="date" required />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Jenis Kelamin <span className="text-red-500">*</span></label>
                    <Sel name="jenisKelamin" required><option value="">Pilih...</option><option value="IKHWAN">Laki-Laki</option><option value="AKHWAT">Perempuan</option></Sel>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Status Pernikahan</label>
                    <Sel name="statusPernikahan"><option value="Lajang">Lajang</option><option value="Duda/Janda">Duda/Janda</option></Sel>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Pendidikan</label>
                    <Input name="pendidikanTerakhir" placeholder="SMA / S1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Pekerjaan</label>
                    <Input name="pekerjaan" placeholder="Wiraswasta" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Mubaligh</label>
                    <Sel name="statusMubaligh"><option value="">—</option><option value="Non Mubaligh">Non Mubaligh</option><option value="Mubaligh">Mubaligh</option></Sel>
                  </div>
                </div>
              </div>

              {/* Step 2: Asal & Wilayah */}
              <div className={regStep === 1 ? "space-y-3" : "hidden"}>
                <CascadingWilayah
                  prefix="asal"
                  labelPrefix="Asal"
                  initialDaerah=""
                  initialDesa=""
                  initialKelompok=""
                  daerahList={daerahList}
                  desaList={desaList}
                  kelompokList={kelompokList}
                />
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">No. HP (WhatsApp) <span className="text-red-500">*</span></label>
                  <Input name="nomorHp" type="tel" required placeholder="081234567890" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Instagram</label>
                  <Input name="instagram" placeholder="tanpa @" />
                </div>
              </div>

              {/* Step 3: Daerah Sambung */}
              <div className={regStep === 2 ? "space-y-3" : "hidden"}>
                <CascadingWilayah
                  prefix="sambung"
                  labelPrefix="Sambung"
                  initialDaerah=""
                  initialDesa=""
                  initialKelompok=""
                  daerahList={daerahList}
                  desaList={desaList}
                  kelompokList={kelompokList}
                />
              </div>

              {/* Step 4: Keluarga */}
              <div className={regStep === 3 ? "space-y-3" : "hidden"}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Anak Ke</label>
                    <Input name="anakKe" type="number" min="1" placeholder="1" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Jumlah Saudara</label>
                    <Input name="jumlahSaudara" type="number" min="0" placeholder="3" />
                  </div>
                </div>
                <div className="border rounded-xl p-3 space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase">Kondisi Ibu</p>
                  <Sel name="kondisiIbu"><option value="">—</option><option value="Masih Hidup">Masih Hidup</option><option value="Almarhum">Almarhum</option></Sel>
                  <Sel name="statusJamaahIbu"><option value="Sudah Jamaah">Sudah Jamaah</option><option value="Belum Jamaah">Belum Jamaah</option></Sel>
                </div>
                <div className="border rounded-xl p-3 space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase">Kondisi Bapak</p>
                  <Sel name="kondisiAyah"><option value="">—</option><option value="Masih Hidup">Masih Hidup</option><option value="Almarhum">Almarhum</option></Sel>
                  <Sel name="statusJamaahAyah"><option value="Sudah Jamaah">Sudah Jamaah</option><option value="Belum Jamaah">Belum Jamaah</option></Sel>
                </div>
              </div>

              {/* Step 5: Foto Profil (WAJIB) */}
              <div className={regStep === 4 ? "space-y-4" : "hidden"}>
                <div className="flex flex-col items-center gap-4">
                  <div
                    className="relative h-52 w-52 rounded-3xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-400 transition-colors flex items-center justify-center"
                    onClick={() => document.getElementById("regFotoInput")?.click()}
                  >
                    {fotoPreview ? (
                      <img src={fotoPreview} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <Camera className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs text-gray-400 font-bold">Tap untuk upload foto</p>
                        <p className="text-[10px] text-red-400 font-bold mt-1">Wajib *</p>
                      </div>
                    )}
                  </div>
                  <input id="regFotoInput" type="file" accept="image/*" className="hidden" onChange={handleFoto} />
                  {fotoPreview && (
                    <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById("regFotoInput")?.click()}>Ganti Foto</Button>
                  )}
                </div>
              </div>

              <input type="hidden" name="fotoProfilUrl" value={fotoUrl || ""} />

              {/* Navigation */}
              <div className="flex gap-3 mt-6">
                {!isLastStep ? (
                  <Button type="button" onClick={nextStep} className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold">
                    Lanjut <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={uploading} className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold">
                    {uploading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Mendaftarkan...</> : <>Daftar & Dapatkan Nomor <CheckCircle2 className="h-4 w-4 ml-2" /></>}
                  </Button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function EventMeta({ event }: { event: any }) {
  return (
    <div className="space-y-2 rounded-2xl bg-gray-50 p-4 text-left">
      <div className="flex items-center text-sm text-gray-600">
        <Calendar className="mr-2 h-4 w-4" />{new Date(event.date).toLocaleDateString("id-ID", { dateStyle: "full" })}
      </div>
      <div className="flex items-center text-sm text-gray-600">
        <Clock className="mr-2 h-4 w-4" />{new Date(event.date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
      </div>
      <div className="flex items-center text-sm text-gray-600">
        <MapPin className="mr-2 h-4 w-4" />{event.location}
      </div>
    </div>
  );
}