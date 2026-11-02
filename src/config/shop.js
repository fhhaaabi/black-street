// =====================================================================
//  CONFIGURATION DE LA BOUTIQUE — à personnaliser avant la mise en ligne
// =====================================================================
export const shop = {
  name: "BLACK-STREET",
  tagline: "Vêtements, chaussures, montres et accessoires",
  logo: "/logo.jpg",

  // Numéro WhatsApp du vendeur : format international, SANS +, espaces ni tirets.
  // Exemple : '221770000000'. Laissé vide volontairement : à remplacer.
  whatsappNumber: "221777226449",

  currency: { code: "FCFA", locale: "fr-FR" },

  // Informations du vendeur (les champs vides ne sont pas affichés)
  seller: {
    name: "BLACK-STREET",
    address: "Keur Massar/citè firdawsi",
    hours: "",
    phone: "78 478 32 25 / 77 831 82 60",
    email: "layegavi006@gmail.com",
  },

  // Livraison : fee = null → « à confirmer » ; sinon montant fixe en FCFA
  delivery: {
    fee: null,
    note: "dèlais de la livraison sous une durè d'environ de 5 jours.",
  },

  // Un produit est « Nouveau » s'il a été ajouté depuis moins de N jours
  newDays: 60,

  // Barre d'annonce (mettre '' pour la masquer)
  announcement:
    "Commande simple par WhatsApp. Livraison et prix finaux confirmés par le vendeur.",

  // Conditions de vente affichées dans le pied de page
  terms: [
    "Les prix affichés sont indicatifs : le prix final et la disponibilité sont confirmés par le vendeur.",
    "Aucun paiement n\u2019est effectué sur ce site.",
    "La livraison et le mode de paiement sont convenus avec le vendeur par WhatsApp.",
  ],
};
