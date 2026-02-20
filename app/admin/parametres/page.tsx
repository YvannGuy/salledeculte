import { Card, CardContent } from "@/components/ui/card";

export default function AdminParametresPage() {
  return (
    <div className="p-6 md:p-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Paramètres</h1>
      <Card>
        <CardContent className="py-8">
          <p className="text-slate-600">Paramètres administrateur à venir.</p>
        </CardContent>
      </Card>
    </div>
  );
}
