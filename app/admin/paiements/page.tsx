import { Card, CardContent } from "@/components/ui/card";

export default function AdminPaiementsPage() {
  return (
    <div className="p-6 md:p-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Paiements</h1>
      <Card>
        <CardContent className="py-12 text-center text-slate-500">
          Intégration Stripe à configurer
        </CardContent>
      </Card>
    </div>
  );
}
