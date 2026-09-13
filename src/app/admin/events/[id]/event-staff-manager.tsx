"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Trash2, KeyRound, Eye, EyeOff, Copy, Check } from "lucide-react";
import { ActionForm } from "@/components/admin-panel/action-form";
import { SubmitButton } from "@/components/admin-panel/submit-button";
import { DeleteConfirmButton } from "@/components/admin-panel/delete-confirm-button";
import { type ActionResult } from "@/lib/action-result";

interface EventStaffItem {
  id: string;
  username: string;
  label: string;
  createdAt: string;
}

interface Props {
  eventId: string;
  staffList: EventStaffItem[];
  createAction: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  deleteAction: (staffId: string) => Promise<ActionResult>;
  resetPasswordAction: (staffId: string, prev: ActionResult, formData: FormData) => Promise<ActionResult>;
}

export function EventStaffManager({ eventId, staffList, createAction, deleteAction, resetPasswordAction }: Props) {
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);

  function togglePassword(id: string) {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function copyCredentials(username: string) {
    navigator.clipboard.writeText(username);
    setCopied(username);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <KeyRound className="h-4 w-4" /> Akun Pengurus Event ({staffList.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ActionForm action={createAction} resetOnSuccess className="space-y-3 rounded-xl border border-dashed p-4 bg-muted/30">
          <p className="text-xs font-bold text-muted-foreground uppercase">Tambah Akun Pengurus</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Label / Nama *</label>
              <Input name="label" placeholder="cth: Pengurus Ikhwan" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Username *</label>
              <Input name="username" placeholder="cth: pengurus1" required minLength={3} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Password *</label>
              <Input name="password" type="password" placeholder="Min 6 karakter" required minLength={6} />
            </div>
            <div className="flex items-end">
              <SubmitButton pendingText="Membuat..." className="w-full bg-emerald-700 hover:bg-emerald-800">
                <UserPlus className="mr-2 h-4 w-4" /> Tambah
              </SubmitButton>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Pengurus bisa login di halaman <code>/login</code> dengan username & password ini.
          </p>
        </ActionForm>

        {staffList.length > 0 && (
          <div className="space-y-2">
            {staffList.map((staff) => (
              <div key={staff.id} className="flex items-center justify-between gap-3 rounded-xl border bg-white p-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm">{staff.label}</span>
                    <Badge variant="outline" className="text-[10px] font-mono px-1.5">
                      {staff.username}
                    </Badge>
                    <button
                      type="button"
                      onClick={() => copyCredentials(staff.username)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title="Salin username"
                    >
                      {copied === staff.username ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Dibuat {new Date(staff.createdAt).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <ResetPasswordForm staffId={staff.id} resetAction={resetPasswordAction} />
                  <DeleteConfirmButton
                    title="Hapus Akun Pengurus?"
                    description={`Akun "${staff.username}" akan dihapus permanen.`}
                    action={deleteAction.bind(null, staff.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {staffList.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">
            Belum ada akun pengurus untuk event ini.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ResetPasswordForm({
  staffId,
  resetAction,
}: {
  staffId: string;
  resetAction: (staffId: string, prev: ActionResult, formData: FormData) => Promise<ActionResult>;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border px-2 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors"
        title="Reset Password"
      >
        <KeyRound className="h-3 w-3" />
      </button>
    );
  }

  return (
    <ActionForm
      action={resetAction.bind(null, staffId)}
      onSuccess={() => setOpen(false)}
      className="flex items-center gap-1"
    >
      <Input
        name="password"
        type="password"
        placeholder="Password baru"
        required
        minLength={6}
        className="h-7 w-32 text-xs"
        autoFocus
      />
      <SubmitButton pendingText="..." className="h-7 px-2 text-xs bg-emerald-700 hover:bg-emerald-800">
        OK
      </SubmitButton>
      <button type="button" onClick={() => setOpen(false)} className="h-7 px-1 text-xs text-muted-foreground">
        &times;
      </button>
    </ActionForm>
  );
}
