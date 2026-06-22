"use client";

import { useState } from "react";
import { ActionForm } from "@/components/admin-panel/action-form";
import { SubmitButton } from "@/components/admin-panel/submit-button";

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "PHOTOGRAPHER", label: "Fotografer" },
  { value: "PERANTARA", label: "Perantara" },
];

interface RoleChangeFormProps {
  staffId: string;
  currentRole: string;
  updateStaffRole: (userId: string, role: string) => Promise<any>;
  mobile?: boolean;
}

export function RoleChangeForm({ staffId, currentRole, updateStaffRole, mobile }: RoleChangeFormProps) {
  const [selectedRole, setSelectedRole] = useState("");

  const otherRoles = ROLE_OPTIONS.filter((r) => r.value !== currentRole);

  return (
    <ActionForm action={updateStaffRole.bind(null, staffId, selectedRole || otherRoles[0].value)} className="flex items-center gap-1">
      <select
        value={selectedRole || otherRoles[0].value}
        onChange={(e) => setSelectedRole(e.target.value)}
        className={`rounded-md border bg-background px-2 text-xs ${mobile ? "h-8" : "h-8 w-28"}`}
      >
        {otherRoles.map((r) => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>
      <SubmitButton size="sm" variant="outline" pendingText="..." className={mobile ? "text-xs h-8" : ""}>
        Ubah
      </SubmitButton>
    </ActionForm>
  );
}