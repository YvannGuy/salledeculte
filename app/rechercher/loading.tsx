export default function RechercherLoading() {
  return (
    <main className="container max-w-[1400px] py-6 animate-fade-in">
      {/* Barre de recherche skeleton */}
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="h-10 min-w-[180px] flex-1 rounded-lg bg-slate-200" />
        <div className="h-10 w-[140px] shrink-0 rounded-lg bg-slate-200" />
        <div className="h-10 w-[180px] shrink-0 rounded-lg bg-slate-200" />
        <div className="h-10 w-[120px] shrink-0 rounded-lg bg-slate-200" />
      </div>

      {/* Compteur + tri skeleton */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="h-5 w-48 rounded bg-slate-200" />
        <div className="flex gap-2">
          <div className="h-9 w-20 rounded-lg bg-slate-200" />
          <div className="h-9 w-[160px] rounded-lg bg-slate-200" />
        </div>
      </div>

      {/* Grille : cartes + carte */}
      <div className="grid gap-4 lg:grid-cols-[400px_1fr]">
        <div className="flex flex-col gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4 rounded-xl border-2 border-slate-200 bg-white p-4">
              <div className="h-24 w-24 shrink-0 animate-pulse rounded-lg bg-slate-200" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
                <div className="flex gap-1.5">
                  <div className="h-5 w-12 animate-pulse rounded bg-slate-200" />
                  <div className="h-5 w-14 animate-pulse rounded bg-slate-200" />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
                  <div className="h-8 w-24 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="relative hidden min-h-[400px] min-w-0 overflow-hidden rounded-xl bg-slate-100 lg:block">
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-slate-500">Préparation de la carte...</p>
          </div>
        </div>
      </div>
    </main>
  );
}
