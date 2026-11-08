// =====================================================================
//  COLLECTIONS : des sélections qui mélangent tout (vêtements, chaussures, montres, accessoires…).
//  Une collection regroupe :
//   - tous les produits de sa `category` (ex : 'femme' → photos f1, f2, f3…)
//   - et/ou les produits dont le CODE PHOTO est dans `codes` (ex : 't1', 'bk5') pour piocher dans les autres rayons.
//  Pour une autre collection (Homme, Enfant) : copiez le bloc et changez id, name, category.
// =====================================================================
import { products } from "./products.js";

export const collections = [
  {
    id: "femme",
    name: "Femme",
    title: "Collection Femme",
    description:
      "Vêtements, chaussures, montres et accessoires, tout au même endroit.",
    accent: ["#ff2d95", "#8b5cf6"],
    category: "femme", // tous les produits « femme » (photos f1, f2…)
    codes: [], // facultatif : ajoutez ici des codes d'autres produits, ex : ['m1', 'ac3']
  },
];

export const getCollection = (id) =>
  collections.find((c) => c.id === id) || null;

/** Produits de la collection (sans doublon). */
export function collectionProducts(c) {
  const byCategory = c.category
    ? products.filter((p) => p.category === c.category)
    : [];
  const byCode = (c.codes || [])
    .map((code) => products.find((p) => p.photoCode === code))
    .filter(Boolean);
  return [
    ...new Map([...byCategory, ...byCode].map((p) => [p.id, p])).values(),
  ];
}
