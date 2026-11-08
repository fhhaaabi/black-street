// accent = couple de couleurs utilisé pour l'ambiance de chaque catégorie
export const categories = [
  {
    id: "vetements",
    name: "Vêtements",
    icon: "bi-bag",
    description: "T-shirts, polos et sweats pour toutes les humeurs",
    image: "/img/t-shirt-premium-noir-1.svg",
    accent: ["#ff5a1f", "#ff2d95"],
  },
  {
    id: "pantalons",
    name: "Pantalons",
    icon: "bi-layout-sidebar",
    description: "Chinos, jeans, cargos, joggings et shorts",
    image: "/img/pantalon-chino-beige-1.svg",
    accent: ["#8b5cf6", "#2dd4ff"],
  },
  {
    id: "chaussures",
    name: "Chaussures",
    icon: "bi-lightning-charge",
    description: "Baskets, derbies, mocassins et bottines",
    image: "/img/baskets-urbaines-blanc-1.svg",
    accent: ["#ff5a1f", "#8b5cf6"],
  },
  {
    id: "montres",
    name: "Montres",
    icon: "bi-watch",
    description: "Classiques, minimalistes ou sportives",
    image: "/img/montre-classique-argent-1.svg",
    accent: ["#ffb020", "#ff5a1f"],
  },
  {
    id: "accessoires",
    name: "Accessoires",
    icon: "bi-handbag",
    description: "Sacs, lunettes, casquettes et bonnets",
    image: "/img/sac-bandouliere-marron-1.svg",
    accent: ["#ff2d95", "#8b5cf6"],
  },
];

// Catégories cachées : elles n'apparaissent ni dans le menu, ni sur l'accueil, ni dans les filtres.
// Les produits « Femme » y sont rangés ; ils se trouvent dans la page Collection Femme.
export const hiddenCategories = [
  {
    id: "femme",
    name: "Femme",
    icon: "bi-stars",
    description: "Collection Femme",
    image: "",
    accent: ["#ff2d95", "#8b5cf6"],
  },
];

const everyCategory = () => [...categories, ...hiddenCategories];
export const categoryName = (id) =>
  everyCategory().find((c) => c.id === id)?.name || id;
export const getCategory = (id) =>
  everyCategory().find((c) => c.id === id) || null;
