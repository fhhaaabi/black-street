// Tests fonctionnels de la logique (panier, variantes, stock, filtres, WhatsApp, persistance).
// Usage : npm run selftest
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { categories } from "../src/data/categories.js";
import { isColorAvailable, isProductAvailable } from "../src/utils/product.js";
import { createPinia, setActivePinia } from "pinia";
import { shop } from "../src/config/shop.js";
import { products, getProductBySlug } from "../src/data/products.js";
import {
  filterProducts,
  sortProducts,
  defaultFilters,
} from "../src/utils/filters.js";
import { validateSelection } from "../src/utils/validation.js";
import {
  buildOrderMessage,
  buildWhatsAppUrl,
} from "../src/services/whatsapp.js";
import { load } from "../src/services/storage.js";
import { useCartStore } from "../src/stores/cart.js";
import { useFavoritesStore } from "../src/stores/favorites.js";

// LocalStorage simulé
const mem = new Map();
globalThis.localStorage = {
  getItem: (k) => mem.get(k) ?? null,
  setItem: (k, v) => mem.set(k, v),
  removeItem: (k) => mem.delete(k),
};

let n = 0;
const test = (name, fn) => {
  fn();
  console.log(`✓ ${name}`);
  n++;
};
const fresh = (keep = false) => {
  if (!keep) mem.clear();
  setActivePinia(createPinia());
  return useCartStore();
};
const tee = getProductBySlug("t-shirt-premium");
const findVariant = (pred) => {
  for (const p of products)
    for (const c of p.colors)
      for (const sz of c.sizes) if (pred(sz)) return { p, c, s: sz };
};
const lim = findVariant((x) => typeof x.stock === "number" && x.stock > 0);
const off = findVariant((x) => x.stock === 0);

test("catalogue : 56 produits, 5 catégories, au moins une variante disponible chacun", () => {
  assert.equal(products.length, 56);
  assert.equal(categories.length, 5);
  for (const c of categories)
    assert.ok(products.filter((p) => p.category === c.id).length >= 10, c.id);
  assert.ok(products.every(isProductAvailable));
  assert.equal(new Set(products.map((p) => p.slug)).size, 56);
});
test("toutes les images du catalogue existent", () => {
  for (const p of products)
    for (const c of p.colors)
      for (const img of c.images) assert.ok(existsSync("public" + img), img);
  for (const c of categories)
    assert.ok(existsSync("public" + c.image), c.image);
});
test("recherche par nom, catégorie et mot-clé (sans accents)", () => {
  assert.ok(
    filterProducts(products, { ...defaultFilters(), q: "montre" }).length >= 2,
  );
  assert.ok(
    filterProducts(products, { ...defaultFilters(), q: "chaussures" }).length >=
      4,
  );
  assert.ok(
    filterProducts(products, { ...defaultFilters(), q: "DORE" }).length >= 1,
  );
  assert.equal(
    filterProducts(products, { ...defaultFilters(), q: "zzzz" }).length,
    0,
  );
});
test("les filtres fonctionnent ensemble", () => {
  const f = {
    ...defaultFilters(),
    category: "chaussures",
    size: "43",
    color: "noir",
    maxPrice: 30000,
  };
  const r = filterProducts(products, f);
  assert.ok(r.length >= 1);
  for (const p of r) {
    assert.equal(p.category, "chaussures");
    assert.ok(p.price <= 30000);
    assert.ok(
      p.colors.some(
        (c) =>
          c.id === "noir" &&
          c.sizes.some((x) => x.label === "43" && x.stock !== 0),
      ),
    );
  }
});
test("tri par prix", () => {
  const asc = sortProducts(products, "price-asc").map((p) => p.price);
  assert.deepEqual(
    asc,
    [...asc].sort((a, b) => a - b),
  );
});
test("variantes indisponibles refusées", () => {
  assert.equal(
    validateSelection(off.p, {
      colorId: off.c.id,
      size: off.s.label,
      quantity: 1,
    }).ok,
    false,
  );
  assert.equal(
    validateSelection(tee, { colorId: "noir", size: null, quantity: 1 }).ok,
    false,
  );
  const [wp, wc] = products
    .flatMap((p) => p.colors.map((c) => [p, c]))
    .find(([, c]) => !c.sizes.length && c.stock === 0);
  assert.equal(
    validateSelection(wp, { colorId: wc.id, quantity: 1 }).ok,
    false,
  );
  assert.equal(
    validateSelection(tee, { colorId: "noir", size: "M", quantity: 0 }).ok,
    false,
  );
});
test("tailles différentes = lignes distinctes ; même variante = quantité augmentée", () => {
  const cart = fresh();
  assert.ok(cart.addItem(tee, { colorId: "noir", size: "M", quantity: 1 }).ok);
  assert.ok(cart.addItem(tee, { colorId: "noir", size: "L", quantity: 1 }).ok);
  assert.ok(cart.addItem(tee, { colorId: "blanc", size: "M", quantity: 1 }).ok);
  assert.equal(cart.items.length, 3);
  cart.addItem(tee, { colorId: "noir", size: "M", quantity: 2 });
  assert.equal(cart.items.length, 3);
  assert.equal(cart.items[0].quantity, 3);
  assert.equal(cart.count, 5);
});
test("photo de la couleur choisie enregistrée dans le panier", () => {
  const cart = fresh();
  cart.addItem(tee, { colorId: "rouge", size: "M", quantity: 1 });
  assert.match(cart.items[0].image, /t-shirt-premium-rouge-1/);
});
test("totaux et quantités recalculés ; stock respecté", () => {
  const cart = fresh();
  const { p, c, s: sz } = lim;
  assert.ok(cart.addItem(p, { colorId: c.id, size: sz.label, quantity: 1 }).ok);
  assert.equal(cart.subtotal, p.price);
  cart.setQuantity(cart.items[0].key, 500);
  assert.equal(cart.items[0].quantity, sz.stock);
  assert.equal(cart.subtotal, p.price * sz.stock);
  cart.setQuantity(cart.items[0].key, -3);
  assert.equal(cart.items[0].quantity, 1);
  assert.equal(
    cart.addItem(p, { colorId: c.id, size: sz.label, quantity: sz.stock + 1 })
      .ok,
    false,
  );
});
test("suppression et vidage", () => {
  const cart = fresh();
  cart.addItem(tee, { colorId: "noir", size: "M", quantity: 1 });
  cart.removeItem(cart.items[0].key);
  assert.equal(cart.items.length, 0);
});
test('persistance du panier et des favoris après "rechargement"', () => {
  const cart = fresh();
  const fav = useFavoritesStore();
  cart.addItem(tee, { colorId: "noir", size: "XL", quantity: 2 });
  fav.toggle(tee);
  const cart2 = fresh(true);
  assert.equal(cart2.items.length, 1);
  assert.equal(cart2.items[0].quantity, 2);
  assert.ok(useFavoritesStore().has(tee.id));
});
test("données corrompues ou format inconnu → valeurs par défaut", () => {
  mem.set("maison-aurore:cart", "{pas du json");
  assert.deepEqual(
    load("cart", [], (v) => v),
    [],
  );
  mem.set("maison-aurore:cart", JSON.stringify({ v: 99, data: [1] }));
  assert.deepEqual(
    load("cart", [], (v) => v),
    [],
  );
  mem.set(
    "maison-aurore:cart",
    JSON.stringify({
      v: 1,
      data: [{ productId: "p01", quantity: -4, price: "x" }, "bad"],
    }),
  );
  assert.equal(fresh(true).items.length, 0);
});
test("changement de prix du catalogue détecté", () => {
  mem.set(
    "maison-aurore:cart",
    JSON.stringify({
      v: 1,
      data: [
        {
          productId: "p01",
          slug: "t-shirt-premium",
          name: "T-shirt Premium",
          price: 7000,
          image: "",
          colorId: "noir",
          colorName: "Noir",
          size: "M",
          sizeLabel: "Taille",
          quantity: 1,
        },
      ],
    }),
  );
  const cart = fresh(true);
  assert.equal(cart.priceAlerts.length, 1);
  assert.equal(cart.validateForOrder().ok, false);
  cart.syncPrices();
  assert.equal(cart.priceAlerts.length, 0);
  assert.equal(cart.validateForOrder().ok, true);
});
test("message WhatsApp : accents, retours à la ligne, un seul produit ou tout le panier", () => {
  const cart = fresh();
  cart.clear();
  cart.addItem(tee, { colorId: "noir", size: "XL", quantity: 2 });
  cart.addItem(getProductBySlug("montre-classique"), {
    colorId: "argent",
    quantity: 1,
  });
  const msg = buildOrderMessage(cart.lines);
  assert.match(msg, /Article 1/);
  assert.match(msg, /Article 2/);
  assert.match(msg, /- Taille : XL/);
  assert.match(msg, /- Couleur : Argent/);
  assert.match(msg, /Quantité : 2/);
  assert.match(msg, /Sous-total : 61 000 FCFA/);
  assert.match(
    msg,
    /Livraison : à confirmer sous une delai d'environ de 5 jours/,
  );
  const single = buildOrderMessage([cart.lines[0]]);
  assert.doesNotMatch(single, /Montre/);
  shop.whatsappNumber = "221770000000";
  const url = buildWhatsAppUrl(msg);
  assert.ok(url.startsWith("https://wa.me/221777226449?text="));
  assert.ok(url.includes("%0A") && url.includes("%C3%A9"));
  assert.equal(decodeURIComponent(url.split("text=")[1]), msg);
  shop.whatsappNumber = "";
});
test("ouvrir WhatsApp ne vide pas le panier", () => {
  const cart = fresh();
  cart.clear();
  cart.addItem(tee, { colorId: "noir", size: "M", quantity: 1 });
  buildWhatsAppUrl(buildOrderMessage(cart.lines));
  assert.equal(cart.items.length, 1);
});
console.log(`\n${n} scénarios réussis`);
