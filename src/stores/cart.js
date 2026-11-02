import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { shop } from "../config/shop.js";
import { load, save, onExternalChange } from "../services/storage.js";
import { getProductById } from "../data/products.js";
import {
  cartKey,
  getColor,
  isVariantAvailable,
  priceInfo,
  sizeLabel,
  variantStock,
} from "../utils/product.js";
import { validateSelection, validateOrderLines } from "../utils/validation.js";
import { useUiStore } from "./ui.js";

const MAX_QTY = 99;

/** Nettoie les données lues dans LocalStorage (jamais de confiance aveugle). */
function sanitize(raw) {
  if (!Array.isArray(raw)) return null;
  const out = [];
  for (const it of raw) {
    if (!it || typeof it !== "object") continue;
    const quantity = Number(it.quantity);
    const price = Number(it.price);
    if (
      typeof it.productId !== "string" ||
      !Number.isInteger(quantity) ||
      quantity < 1
    )
      continue;
    if (!Number.isFinite(price) || price < 0) continue;
    const colorId = it.colorId ? String(it.colorId) : null;
    const size = it.size ? String(it.size) : null;
    out.push({
      key: cartKey(it.productId, colorId, size),
      productId: it.productId,
      slug: String(it.slug || ""),
      name: String(it.name || "Produit"),
      price,
      image: String(it.image || ""),
      colorId,
      colorName: it.colorName ? String(it.colorName) : null,
      size,
      sizeLabel: it.sizeLabel ? String(it.sizeLabel) : null,
      quantity: Math.min(quantity, MAX_QTY),
    });
  }
  return out;
}

export const useCartStore = defineStore("cart", () => {
  const ui = useUiStore();
  const items = ref(load("cart", [], sanitize));

  // ----- calculs automatiques -----
  const count = computed(() => items.value.reduce((n, i) => n + i.quantity, 0));
  const subtotal = computed(() =>
    items.value.reduce((s, i) => s + i.price * i.quantity, 0),
  );
  const deliveryFee = computed(() => shop.delivery.fee); // null = à confirmer
  const total = computed(() => subtotal.value + (deliveryFee.value ?? 0));

  /** Lignes prêtes pour le message WhatsApp. */
  const lines = computed(() =>
    items.value.map((i) => ({
      name: i.name,
      slug: i.slug,
      image: i.image,
      colorName: i.colorName,
      size: i.size,
      sizeLabel: i.sizeLabel,
      quantity: i.quantity,
      price: i.price,
    })),
  );

  /** Compare le panier au catalogue actuel : prix modifié, article retiré ou indisponible. */
  const alerts = computed(() =>
    items.value.flatMap((i) => {
      const p = getProductById(i.productId);
      if (!p)
        return [
          {
            key: i.key,
            type: "removed",
            message: `« ${i.name} » n\u2019est plus au catalogue.`,
          },
        ];
      if (!isVariantAvailable(p, i.colorId, i.size))
        return [
          {
            key: i.key,
            type: "unavailable",
            message: `« ${i.name} » n\u2019est plus disponible dans cette variante.`,
          },
        ];
      const current = priceInfo(p, i.colorId).price;
      if (current !== i.price)
        return [
          {
            key: i.key,
            type: "price",
            newPrice: current,
            message: `Le prix de « ${i.name} » a changé.`,
          },
        ];
      return [];
    }),
  );
  const priceAlerts = computed(() =>
    alerts.value.filter((a) => a.type === "price"),
  );
  const blockingAlerts = computed(() =>
    alerts.value.filter((a) => a.type !== "price"),
  );
  const alertFor = (key) => alerts.value.find((a) => a.key === key) || null;

  // ----- actions -----
  function addItem(product, { colorId, size, quantity }) {
    const check = validateSelection(product, { colorId, size, quantity });
    if (!check.ok) return check;
    const color = getColor(product, colorId);
    const key = cartKey(product.id, colorId, size || null);
    const existing = items.value.find((i) => i.key === key);
    const newQty = (existing?.quantity || 0) + quantity;
    const stock = variantStock(product, colorId, size);
    if (stock !== null && newQty > stock) {
      return {
        ok: false,
        errors: [
          `Stock indiqué : ${stock}. Vous en avez déjà ${existing?.quantity || 0} dans votre panier.`,
        ],
      };
    }
    if (newQty > MAX_QTY)
      return {
        ok: false,
        errors: [`Quantité maximale par article : ${MAX_QTY}.`],
      };
    if (existing)
      existing.quantity = newQty; // même variante → quantité augmentée
    else {
      items.value.push({
        key,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: priceInfo(product, colorId).price, // prix au moment de l'ajout
        image: color.images[0],
        colorId,
        colorName: color.name || null,
        size: size || null,
        sizeLabel: size ? sizeLabel(product) : null,
        quantity,
      });
    }
    return { ok: true };
  }

  function setQuantity(key, qty) {
    const item = items.value.find((i) => i.key === key);
    if (!item) return;
    const p = getProductById(item.productId);
    const stock = p ? variantStock(p, item.colorId, item.size) : null;
    const max = Math.min(stock ?? MAX_QTY, MAX_QTY);
    item.quantity = Math.max(
      1,
      Math.min(Math.floor(Number(qty)) || 1, Math.max(max, 1)),
    );
  }
  const removeItem = (key) => {
    items.value = items.value.filter((i) => i.key !== key);
  };
  const clear = () => {
    items.value = [];
  };

  /** Accepte les nouveaux prix du catalogue. */
  function syncPrices() {
    for (const a of priceAlerts.value) {
      const item = items.value.find((i) => i.key === a.key);
      if (item) item.price = a.newPrice;
    }
  }

  /** Validation avant d'ouvrir la commande WhatsApp. */
  function validateForOrder() {
    const errors = [];
    if (!items.value.length) errors.push("Votre panier est vide.");
    if (blockingAlerts.value.length)
      errors.push(
        ...blockingAlerts.value.map(
          (a) => a.message + " Retirez-le du panier.",
        ),
      );
    if (priceAlerts.value.length)
      errors.push(
        "Des prix ont changé : acceptez les nouveaux prix pour continuer.",
      );
    const v = validateOrderLines(lines.value);
    errors.push(...v.errors);
    return { ok: errors.length === 0, errors };
  }

  // ----- persistance -----
  let warned = false;
  watch(
    items,
    (v) => {
      if (!save("cart", v) && !warned) {
        warned = true;
        ui.notify(
          "Stockage local indisponible : votre panier ne sera pas conservé.",
          "warning",
          5000,
        );
      }
    },
    { deep: true, flush: "sync" },
  );
  onExternalChange("cart", () => {
    items.value = load("cart", [], sanitize);
  });

  return {
    items,
    count,
    subtotal,
    deliveryFee,
    total,
    lines,
    alerts,
    priceAlerts,
    blockingAlerts,
    alertFor,
    addItem,
    setQuantity,
    removeItem,
    clear,
    syncPrices,
    validateForOrder,
  };
});
