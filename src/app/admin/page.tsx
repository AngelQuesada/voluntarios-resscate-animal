"use client";

import { AdminPanel } from "@/components/admin/admin-panel";
import { UserRoles } from "@/lib/constants";
import RoleProtected from "@/components/auth/RoleProtected";

export default function AdminPage() {
  return (
    <RoleProtected requiredRoles={[UserRoles.ADMINISTRADOR]} fallbackUrl="/schedule">
      <main className="flex justify-center items-center h-screen bg-background">
        <AdminPanel />
      </main>
    </RoleProtected>
  );
}
