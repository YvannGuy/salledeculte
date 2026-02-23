/** Accès libre : tout le monde peut consulter et contacter. Fonctions conservées pour compatibilité. */

export async function hasAccessToBrowseOthers(_userId: string | null): Promise<boolean> {
  return !!_userId;
}

export async function hasAccessToContact(userId: string | null): Promise<boolean> {
  return !!userId;
}

export type PassCheckResult = { allowed: true } | { allowed: false; reason: string; message: string };

export async function checkCanCreateDemande(): Promise<PassCheckResult> {
  return { allowed: true };
}
