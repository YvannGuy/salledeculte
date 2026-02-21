/**
 * Informations juridiques pour les mentions légales et pages légales.
 * À adapter selon la structure juridique de votre société.
 */
export const legalConfig = {
  /** Éditeur du site */
  editeur: {
    nom: "Salledeculte",
    capitalSocial: "1 000 €",
    siegeSocial: {
      adresse: "78 avenue des Champs-Élysées",
      codePostal: "75008",
      ville: "Paris",
      pays: "France",
    },
    tvaIntracommunautaire: "", // ex: "FR XX XXXX XXXXX" si assujetti à la TVA
    email: "contact@salledeculte.com",
  },

  /** Directeur de la publication (obligatoire LCEN) */
  directeurPublication: "À compléter",

  /** Hébergeur (obligatoire LCEN) */
  hebergeur: {
    nom: "Vercel Inc.",
    adresse: "440 N Barranca Ave #4133, Covina, CA 91723, USA",
    site: "https://vercel.com",
  },

  /** Données personnelles - DPO si désigné */
  dpoEmail: "contact@salledeculte.com",
};
