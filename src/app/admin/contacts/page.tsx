import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { type ActionResult } from "@/lib/action-result";
import { ContactList } from "./contact-list";

export default async function ContactsPage() {
  const supabase = createClient();

  const { data: daerahList } = await supabase
    .from("Daerah")
    .select("id, nama, contactName, contactWhatsapp")
    .order("nama");

  async function updateContact(
    id: string,
    _prev: ActionResult,
    formData: FormData
  ): Promise<ActionResult> {
    "use server";
    const supabase = createClient();
    const contactName = (formData.get("contactName") as string)?.trim() || null;
    const contactWhatsapp = (formData.get("contactWhatsapp") as string)?.trim() || null;

    const { error } = await supabase
      .from("Daerah")
      .update({ contactName, contactWhatsapp })
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
          Kelola nama PIC dan nomor WhatsApp untuk setiap daerah.
        </p>
      </div>
      <ContactList daerahList={daerahList || []} updateContact={updateContact} />
    </div>
  );
}