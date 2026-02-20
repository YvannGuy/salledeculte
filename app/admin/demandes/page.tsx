import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminDemandesPage() {
  const supabase = createAdminClient();
  const { data: demandes } = await supabase
    .from("demandes")
    .select("id, date_debut, status, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="p-6 md:p-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Demandes</h1>
      <div className="space-y-3">
        {demandes?.length ? (
          demandes.map((d) => (
            <Card key={d.id}>
              <CardContent className="py-4">
                <p className="text-sm text-slate-600">
                  {new Date(d.date_debut).toLocaleDateString("fr-FR")} · {d.status}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-slate-500">
              Aucune demande
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
