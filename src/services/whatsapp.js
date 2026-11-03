import { shop } from "../config/shop.js";
import { formatPrice } from "../utils/currency.js";

export const isWhatsAppConfigured = () =>
  /^\d{8,15}$/.test(shop.whatsappNumber);

/** Construit le message de commande à partir de lignes {name, colorName, size, sizeLabel, quantity, price}. */
export function buildOrderMessage(lines, customer = null) {
  // Adresse publique du site (shop.siteUrl) : permet d'ajouter un lien vers la photo et la fiche de chaque article.
  // WhatsApp ne peut PAS joindre une image via un lien wa.me : on envoie donc des liens (WhatsApp affiche l'aperçu).
  const base = String(shop.siteUrl || "").replace(/\/+$/, "");
  const out = ["Bonjour, je souhaite passer une commande.", ""];
  if (customer)
    out.push(
      "Mes coordonnées",
      `- Nom : ${customer.name}`,
      `- Téléphone : ${customer.phone}`,
      `- Adresse : ${customer.address}`,
      "",
    );
  let subtotal = 0;
  lines.forEach((l, i) => {
    const lineTotal = l.price * l.quantity;
    subtotal += lineTotal;
    out.push(`Article ${i + 1}`, "");
    out.push(`- Produit : ${l.name}`);
    if (base && l.image)
      out.push(
        `- Photo : ${/^https?:/.test(l.image) ? l.image : base + l.image}`,
      );
    if (base && l.slug) out.push(`- Fiche : ${base}/produit/${l.slug}`);
    if (l.colorName) out.push(`- Couleur : ${l.colorName}`);
    if (l.size) out.push(`- ${l.sizeLabel || "Taille"} : ${l.size}`);
    out.push(`- Quantité : ${l.quantity}`);
    out.push(`- Prix unitaire : ${formatPrice(l.price)}`);
    out.push(`- Sous-total : ${formatPrice(lineTotal)}`, "");
  });
  const fee = shop.delivery.fee;
  out.push(`Sous-total : ${formatPrice(subtotal)}`);
  if (fee == null) {
    out.push("Livraison : à confirmer");
    out.push(`Total estimé hors livraison : ${formatPrice(subtotal)}`);
  } else {
    out.push(`Livraison : ${formatPrice(fee)}`);
    out.push(`Total estimé : ${formatPrice(subtotal + fee)}`);
  }
  const noColor = lines.some((l) => !l.colorName); // couleur non choisie sur le site : à préciser avec le vendeur
  out.push(
    "",
    noColor
      ? "Merci de me confirmer la disponibilité des articles, les couleurs disponibles et les modalités de livraison."
      : "Merci de me confirmer la disponibilité des articles et les modalités de livraison.",
  );
  return out.join("\n");
}

/** WhatsApp Click to Chat : le texte est encodé (accents, retours à la ligne, caractères spéciaux). */
export const buildWhatsAppUrl = (message) =>
  `https://wa.me/${shop.whatsappNumber}?text=${encodeURIComponent(message)}`;

export const buildChatUrl = () => `https://wa.me/${shop.whatsappNumber}`;
