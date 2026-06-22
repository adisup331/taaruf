import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { type ActionResult } from "@/lib/action-result";
import { ContactList } from "./contact-list";

export default async function ContactsPage() {
  const supabase = createClient();

  const [{ data: daerahList }, { data: profiles }] = await Promise.all([
    supabase
      .from("Daerah")
      .select("*")
      .order("nama"),
    supabase
      .from("Profile")
      .select("daerahSambung"),
  ]);

  const memberCounts: Record<string, number> = {};
  profiles?.forEach((p: any) => {
    if (p.daerahSambung) {
      memberCounts[p.daerahSambung] = (memberCounts[p.daerahSambung] || 0) + 1;
    }
  });

  async function updateContact(
    id: string,
    _prev: ActionResult,
    formData: FormData
  ): Promise<ActionResult> {
    "use server";
    const supabase = createClient();
    const contactName = (formData.get("contactName") as string)?.trim() || null;
    const contactWhatsapp = (formData.get("contactWhatsapp") as string)?.trim() || null;
    const contactName2 = (formData.get("contactName2") as string)?.trim() || null;
    const contactWhatsapp2 = (formData.get("contactWhatsapp2") as string)?.trim() || null;

    const { error } = await supabase
      .from("Daerah")
      .update({ contactName, contactWhatsapp, contactName2, contactWhatsapp2 })
      .eq("id", id);

    if (error) return { ok: false, message: `Gagal: ${error.message}` };

    revalidatePath("/admin/contacts");
    return { ok: true, message: "Kontak berhasil diperbarui." };
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Kontak Tim Daerah</h2>
        <p className="text-muted-foreground text-sm">
          Kelola nama PIC dan nomor WhatsApp per daerah sambung (maks. 2 kontak).
        </p>
      </div>
      <ContactList daerahList={daerahList || []} memberCounts={memberCounts} updateContact={updateContact} />
    </div>
  );
}
