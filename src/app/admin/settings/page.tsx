import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { type ActionResult } from "@/lib/action-result";
import { SettingsForm } from "./settings-form";
import { DEFAULT_TEMPLATE } from "@/lib/constants";

const SETTING_KEYS = ["starsender_api_key", "starsender_device_id", "followup_message_template"];

export default async function SettingsPage() {
  const supabase = createClient();

  const { data: settings } = await supabase
    .from("AppSetting")
    .select("key, value")
    .in("key", SETTING_KEYS);

  const settingsMap: Record<string, string> = {};
  settings?.forEach((s: any) => {
    if (s.key && s.value) settingsMap[s.key] = s.value;
  });

  async function saveSettings(
    _prev: ActionResult,
    formData: FormData
  ): Promise<ActionResult> {
    "use server";
    const supabase = createClient();
    const apiKey = (formData.get("starsender_api_key") as string)?.trim() || "";
    const deviceId = (formData.get("starsender_device_id") as string)?.trim() || "";
    const template = (formData.get("followup_message_template") as string) || "";

    const upserts = [
      { key: "starsender_api_key", value: apiKey, updatedAt: new Date().toISOString() },
      { key: "starsender_device_id", value: deviceId, updatedAt: new Date().toISOString() },
      { key: "followup_message_template", value: template, updatedAt: new Date().toISOString() },
    ];

    const { error } = await supabase
      .from("AppSetting")
      .upsert(upserts, { onConflict: "key" });

    if (error) return { ok: false, message: `Gagal menyimpan: ${error.message}` };

    revalidatePath("/admin/settings");
    return { ok: true, message: "Pengaturan berhasil disimpan." };
  }

  async function testConnection(
    _prev: ActionResult,
    formData: FormData
  ): Promise<ActionResult> {
    "use server";
    const supabase = createClient();

    const { data: settings } = await supabase
      .from("AppSetting")
      .select("key, value")
      .in("key", ["starsender_api_key", "starsender_device_id"]);

    const map: Record<string, string> = {};
    settings?.forEach((s: any) => {
      if (s.key && s.value) map[s.key] = s.value;
    });

    const apiKey = map["starsender_api_key"];
    const deviceId = map["starsender_device_id"];

    if (!apiKey || !deviceId) {
      return { ok: false, message: "API Key dan Device ID harus diisi terlebih dahulu." };
    }

    try {
      const res = await fetch("https://api.starsender.online/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": apiKey,
        },
        body: JSON.stringify({
          messageType: "text",
          to: "081334367717",
          body: "\u2705 *Test Koneksi Berhasil!*\n\nPesan ini dikirim otomatis dari sistem TaarufYuk untuk memastikan integrasi StarSender berjalan dengan baik.\n\n_" + new Date().toLocaleString("id-ID") + "_",
        }),
      });

      const data = await res.json();

      if (res.ok && (data.success || data.status === true)) {
        return { ok: true, message: "Pesan test berhasil dikirim ke 081334367717!" };
      }

      return { ok: false, message: `Gagal kirim: ${data.message || JSON.stringify(data)}` };
    } catch (err: any) {
      return { ok: false, message: `Error: ${err.message}` };
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Pengaturan</h2>
        <p className="text-muted-foreground text-sm">
          Konfigurasi integrasi API WhatsApp dan layanan lainnya.
        </p>
      </div>
      <SettingsForm
        settings={settingsMap}
        defaultTemplate={DEFAULT_TEMPLATE}
        saveSettings={saveSettings}
        testConnection={testConnection}
      />
    </div>
  );
}
