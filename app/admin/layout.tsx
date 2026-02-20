import { redirect } from "next/navigation";

import { AdminHeader } from "@/components/dashboard/admin-header";
import { AdminSidebar } from "@/components/dashboard/admin-sidebar";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/admin");
  }

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const isAdminByEnv =
    adminEmails.length > 0 && adminEmails.includes(user.email?.toLowerCase() ?? "");

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .maybeSingle();
  const isAdminByProfile = profile?.user_type === "admin";

  if (!isAdminByEnv && !isAdminByProfile) {
    redirect("/auth/admin");
  }

  let pendingCount = 0;
  try {
    const admin = createAdminClient();
    const { count } = await admin
      .from("salles")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");
    pendingCount = count ?? 0;
  } catch {
    // Ignore if admin client fails (e.g. missing SUPABASE_SERVICE_ROLE_KEY)
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar pendingCount={pendingCount} userEmail={user.email} />
      <div className="flex flex-1 flex-col overflow-auto">
        <AdminHeader />
        <main className="flex-1 pl-14 lg:pl-0">{children}</main>
      </div>
    </div>
  );
}
