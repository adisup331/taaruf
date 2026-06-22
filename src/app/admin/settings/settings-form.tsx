"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Eye, EyeOff, Wifi, ExternalLink, Save, RotateCcw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionForm } from "@/components/admin-panel/action-form";
import { SubmitButton } from "@/components/admin-panel/submit-button";
import { type ActionResult } from "@/lib/action-result";

const VARIABLES = [
  { key: "{nama_pic}", desc: "Nama PIC daerah" },
  { key: "{daerah}", desc: "Nama daerah sambung tujuan" },
  { key: "{nama_pengirim}", desc: "Nama peserta laki-laki" },
  { key: "{no_pengirim}", desc: "No. peserta laki-laki" },
  { key: "{hp_pengirim}", desc: "No. HP laki-laki" },
  { key: "{daerah_pengirim}", desc: "Daerah sambung laki-laki" },
  { key: "{nama_penerima}", desc: "Nama peserta perempuan" },
  { key: "{no_penerima}", desc: "No. peserta perempuan" },
  { key: "{hp_penerima}", desc: "No. HP perempuan" },
  { key: "{daerah_penerima}", desc: "Daerah sambung perempuan" },
  { key: "{kode}", desc: "Kode pasangan (6 digit)" },
  { key: "{status}", desc: "Status saat ini (Lanjut/Lamaran/dll)" },
  { key: "{nama_event}", desc: "Nama event / acara" },
  { key: "{link_bio}", desc: "Link halaman biodata (perlu PIN)" },
  { key: "{pin}", desc: "PIN akses halaman biodata" },
];

interface Props {
  settings: Record<string, string>;
  defaultTemplate: string;
  saveSettings: (prev: ActionResult, fd: FormData) => Promise<ActionResult>;
  testConnection: (prev: ActionResult, fd: FormData) => Promise<ActionResult>;
}

export function SettingsForm({ settings, defaultTemplate, saveSettings, testConnection }: Props) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [template, setTemplate] = useState(settings.followup_message_template || defaultTemplate);
  const hasConfig = settings.starsender_api_key && settings.starsender_device_id;

  const preview = template
    .replace("{nama_pic}", "Ahmad Fauzi")
    .replace("{daerah}", "Surabaya")
    .replace("{nama_pengirim}", "Muhammad Ali")
    .replace("{no_pengirim}", "012")
    .replace("{hp_pengirim}", "081234567890")
    .replace("{daerah_pengirim}", "Surabaya")
    .replace("{nama_penerima}", "Fatimah Zahra")
    .replace("{no_penerima}", "045")
    .replace("{hp_penerima}", "089876543210")
    .replace("{daerah_penerima}", "Malang")
    .replace("{kode}", "A1B2C3")
    .replace("{nama_event}", "Taaruf Akbar Jatim 2026")
    .replace("{status}", "Lanjut")
    .replace("{link_bio}", "https://taarufyuk.vercel.app/bio/xxx")
    .replace("{pin}", "4821");

  return (
    <div className="space-y-6 max-w-2xl">
      {/* StarSender Config */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-base">StarSender API</CardTitle>
                <CardDescription>Integrasi WhatsApp untuk kirim pesan otomatis.</CardDescription>
              </div>
            </div>
            {hasConfig ? (
              <Badge className="bg-green-100 text-green-700 border-green-200">Terkonfigurasi</Badge>
            ) : (
              <Badge variant="outline" className="text-amber-600 border-amber-200">Belum dikonfigurasi</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ActionForm action={saveSettings} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">API Key</label>
              <div className="relative">
                <Input
                  name="starsender_api_key"
                  type={showApiKey ? "text" : "password"}
                  defaultValue={settings.starsender_api_key || ""}
                  placeholder="Masukkan API Key dari StarSender"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Dapatkan API Key di{" "}
                <a href="https://starsender.online" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline inline-flex items-center gap-0.5">
                  starsender.online <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Device ID</label>
              <Input
                name="starsender_device_id"
                defaultValue={settings.starsender_device_id || ""}
                placeholder="Masukkan Device ID"
              />
              <p className="text-[11px] text-muted-foreground">
                ID perangkat WhatsApp yang terhubung di dashboard StarSender.
              </p>
            </div>

            {/* Message Template */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Template Pesan Followup
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setTemplate(defaultTemplate)}
                >
                  <RotateCcw className="mr-1 h-3 w-3" /> Reset Default
                </Button>
              </div>
              <textarea
                name="followup_message_template"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                rows={14}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="text-[11px] text-muted-foreground">
                <p className="font-medium mb-1">Variabel yang tersedia:</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                  {VARIABLES.map((v) => (
                    <span key={v.key}>
                      <code className="text-emerald-600 font-bold">{v.key}</code> — {v.desc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <SubmitButton className="bg-emerald-600 hover:bg-emerald-700" pendingText="Menyimpan...">
                <Save className="mr-2 h-4 w-4" /> Simpan Semua
              </SubmitButton>
            </div>
          </ActionForm>

          {/* Test Connection */}
          {hasConfig && (
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Test Koneksi</p>
              <ActionForm action={testConnection}>
                <SubmitButton variant="outline" pendingText="Mengirim pesan test...">
                  <Wifi className="mr-2 h-4 w-4" /> Test Kirim Pesan
                </SubmitButton>
              </ActionForm>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preview Pesan</CardTitle>
          <CardDescription>Contoh pesan yang akan dikirim ke pengurus daerah.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl bg-[#e5ddd5] p-4">
            <div className="max-w-sm ml-auto rounded-xl bg-[#dcf8c6] px-3 py-2 shadow-sm">
              <p className="text-sm whitespace-pre-wrap text-gray-800">{preview}</p>
              <p className="text-right text-[10px] text-gray-500 mt-1">10:30 ✓✓</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bantuan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Butuh Bantuan?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 rounded-xl border bg-green-50 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">Ada pertanyaan? Hubungi Mas Alenovan</p>
              <p className="text-xs text-muted-foreground mt-0.5">Siap membantu konfigurasi dan troubleshooting.</p>
            </div>
            <a href="https://wa.me/6281334367717" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700 transition-colors">
              <MessageSquare className="h-4 w-4" /> Chat WA
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tentang Integrasi</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>StarSender digunakan untuk mengirim pesan WhatsApp otomatis ke pengurus daerah saat status pasangan taaruf diubah menjadi <strong>&quot;Diserahkan Pengurus Daerah&quot;</strong>.</p>
          <p>Pastikan:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Akun StarSender aktif dan device WhatsApp terhubung</li>
            <li>Nomor WhatsApp kontak tim daerah sudah diisi di menu <strong>Kontak Tim Daerah</strong></li>
            <li>API Key dan Device ID sudah benar</li>
          </ul>
          <p className="pt-2">
            <a href="https://docs.starsender.online/docs/home/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline inline-flex items-center gap-1">
              Dokumentasi StarSender <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
