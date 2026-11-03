import {
  getColor,
  isVariantAvailable,
  sizeLabel,
  variantStock,
} from "./product.js";

const isPositiveInt = (n) => Number.isInteger(n) && n > 0;

/** Vérifie un choix client (couleur, taille, quantité) avant ajout au panier ou commande. */
export function validateSelection(product, { colorId, size, quantity }) {
  const errors = [];
  const color = getColor(product, colorId);
  if (!color) errors.push("Veuillez choisir une couleur.");

  const label = sizeLabel(product);
  if (color) {
    if (label && !size)
      errors.push(`Veuillez choisir une ${label.toLowerCase()}.`);
    else if (!isVariantAvailable(product, colorId, size))
      errors.push("Cette variante est indisponible.");
  }

  if (!isPositiveInt(quantity))
    errors.push("La quantité doit être au moins 1.");
  else if (color) {
    const stock = variantStock(product, colorId, size);
    if (stock !== null && quantity > stock)
      errors.push(`Stock indiqué : ${stock} article(s) maximum.`);
  }
  return { ok: errors.length === 0, errors };
}

/** Vérifie les lignes d'une commande avant de générer le message WhatsApp. */
export function validateOrderLines(lines) {
  const errors = [];
  if (!Array.isArray(lines) || lines.length === 0)
    errors.push("Aucun article à commander.");
  else {
    lines.forEach((l, i) => {
      const n = `Article ${i + 1}`;
      if (!l.name) errors.push(`${n} : nom manquant.`);
      if (!isPositiveInt(l.quantity)) errors.push(`${n} : quantité invalide.`);
      if (!Number.isFinite(l.price) || l.price < 0)
        errors.push(`${n} : prix invalide.`);
      if (l.sizeLabel && !l.size)
        errors.push(`${n} : ${l.sizeLabel.toLowerCase()} manquante.`);
    });
  }
  return { ok: errors.length === 0, errors };
}

/** Vérifie les coordonnées du client (nom, téléphone, adresse) avant la commande. */
export function validateCustomer(c) {
  const errors = {};
  const name = String(c?.name ?? "").trim();
  const phone = String(c?.phone ?? "").trim();
  const address = String(c?.address ?? "").trim();
  const digits = phone.replace(/\D/g, "");
  if (name.length < 2) errors.name = "Indiquez votre nom.";
  if (
    !/^\+?[\d\s().-]+$/.test(phone) ||
    digits.length < 8 ||
    digits.length > 15
  )
    errors.phone = "Indiquez un numéro valide (8 à 15 chiffres).";
  if (address.length < 3)
    errors.address = "Indiquez votre adresse ou votre quartier.";
  return { ok: Object.keys(errors).length === 0, errors };
}
