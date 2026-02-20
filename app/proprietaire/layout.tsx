import { redirect } from "next/navigation";

import { OwnerSidebar } from "@/components/dashboard/owner-sidebar";
import { getEffectiveUserType } from "@/lib/auth-utils";
import { createClient } from "@/lib/supabase/server";

export default async function ProprietaireLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const getProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", userId)
      .maybeSingle();
    return data;
  };
  const userType = await getEffectiveUserType(user, getProfile);
  if (userType === "admin") redirect("/admin");
  if (userType === "seeker") redirect("/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const displayName = profile?.full_name ?? user.user_metadata?.full_name ?? "Utilisateur";

  return (
    <div className="flex min-h-screen bg-slate-50">
      <OwnerSidebar user={{ ...user, displayName }} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
