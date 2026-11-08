// Fonction Netlify : reçoit une commande du site, la VÉRIFIE avec le catalogue, puis l'envoie sur Telegram (texte + photos).
// Réglages à faire dans Netlify (Site configuration > Environment variables) : TELEGRAM_BOT_TOKEN et TELEGRAM_CHAT_ID.
// Ne mettez JAMAIS ces valeurs dans le code ni sur GitHub.
import { products } from "../../src/data/products.js";
import { priceInfo, getColor, sizeLabel } from "../../src/utils/product.js";
import {
  validateSelection,
  validateCustomer,
} from "../../src/utils/validation.js";
import { shop } from "../../src/config/shop.js";
import { formatPrice } from "../../src/utils/currency.js";

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

// Limite simple anti-spam (par adresse IP, au mieux : la mémoire est vidée quand la fonction se réinitialise)
const hits = new Map();
function tooMany(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 5;
}

const clip = (s, n) =>
  String(s ?? "")
    .trim()
    .slice(0, n);
const resolve = (l) =>
  products.find((p) => p.id === l.productId) ||
  products.find((p) => p.slug === l.slug) ||
  products.find((p) => p.name === l.name) ||
  null;

async function telegram(token, method, body) {
  const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.ok) throw new Error(d.description || `Telegram ${r.status}`);
  return d;
}

export default async (req) => {
  if (req.method !== "POST")
    return json(405, { error: "Méthode non autorisée." });
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat)
    return json(500, {
      error: "Le serveur de commandes n’est pas encore configuré.",
    });

  const ip =
    req.headers.get("x-nf-client-connection-ip") ||
    req.headers.get("x-forwarded-for") ||
    "inconnue";
  if (tooMany(ip))
    return json(429, {
      error: "Trop de commandes envoyées. Réessayez dans quelques minutes.",
    });

  let data;
  try {
    data = await req.json();
  } catch {
    return json(400, { error: "Requête invalide." });
  }
  if (data?.website) return json(200, { ok: true, ref: "OK" }); // champ caché rempli : robot, on ignore en silence

  // Coordonnées du client
  const customer = {
    name: clip(data?.customer?.name, 80),
    phone: clip(data?.customer?.phone, 30),
    address: clip(data?.customer?.address, 200),
  };
  const cv = validateCustomer(customer);
  if (!cv.ok) return json(400, { error: Object.values(cv.errors)[0] });

  // Articles : on RECALCULE tout depuis le catalogue (prix, noms, disponibilité) sans faire confiance au navigateur
  const raw = Array.isArray(data?.lines) ? data.lines.slice(0, 25) : [];
  if (!raw.length) return json(400, { error: "Aucun article à commander." });
  const items = [];
  for (const l of raw) {
    const p = resolve(l || {});
    if (!p)
      return json(400, {
        error: "Un article n’existe plus dans le catalogue.",
      });
    const colorId =
      clip(l.colorId, 40) ||
      p.colors.find((c) => c.name && c.name === l.colorName)?.id ||
      p.colors[0].id;
    const size = l.size ? clip(l.size, 10) : null;
    const quantity = Number(l.quantity);
    const v = validateSelection(p, { colorId, size, quantity });
    if (!v.ok) return json(400, { error: `${p.name} : ${v.errors[0]}` });
    items.push({
      p,
      color: getColor(p, colorId),
      size,
      quantity,
      price: priceInfo(p, colorId).price,
    });
  }

  // Message pour le vendeur
  const ref =
    "CMD-" +
    Date.now().toString(36).toUpperCase().slice(-5) +
    Math.random().toString(36).slice(2, 4).toUpperCase();
  let subtotal = 0;
  const blocks = items.map((it, i) => {
    const total = it.price * it.quantity;
    subtotal += total;
    const detail = [
      it.color?.name ? `Couleur : ${it.color.name}` : null,
      it.size ? `${sizeLabel(it.p) || "Taille"} : ${it.size}` : null,
      `Quantité : ${it.quantity}`,
    ]
      .filter(Boolean)
      .join(" | ");
    return `Article ${i + 1} : ${it.p.name} (photo ${it.p.photoCode})\n${detail}\n${formatPrice(it.price)} x ${it.quantity} = ${formatPrice(total)}`;
  });
  const fee = shop.delivery?.fee;
  const text = [
    `NOUVELLE COMMANDE ${ref}`,
    "",
    `Client : ${customer.name}`,
    `Téléphone : ${customer.phone}`,
    `Adresse : ${customer.address}`,
    "",
    blocks.join("\n\n"),
    "",
    `Sous-total : ${formatPrice(subtotal)}`,
    fee == null ? "Livraison : à confirmer" : `Livraison : ${formatPrice(fee)}`,
    fee == null
      ? `Total estimé hors livraison : ${formatPrice(subtotal)}`
      : `Total estimé : ${formatPrice(subtotal + fee)}`,
  ]
    .join("\n")
    .slice(0, 4000);

  try {
    await telegram(token, "sendMessage", { chat_id: chat, text });
  } catch (e) {
    return json(502, {
      error:
        "Impossible de transmettre la commande pour le moment. Utilisez WhatsApp.",
    });
  }

  // Photos des articles (au mieux : si une photo échoue, le texte est déjà bien parti)
  const site = (process.env.SITE_URL || process.env.URL || "").replace(
    /\/$/,
    "",
  );
  if (site) {
    const seen = new Set();
    const photos = [];
    items.forEach((it, i) => {
      const src = it.color?.images?.[0];
      if (!src || !/\.(jpe?g|png|webp)$/i.test(src) || seen.has(src)) return;
      seen.add(src);
      photos.push({
        url: /^https?:/.test(src) ? src : site + src,
        caption: `Article ${i + 1} : ${it.p.name}${it.size ? " - " + it.size : ""} x ${it.quantity}`,
      });
    });
    const list = photos.slice(0, 10);
    try {
      if (list.length === 1)
        await telegram(token, "sendPhoto", {
          chat_id: chat,
          photo: list[0].url,
          caption: list[0].caption,
        });
      else if (list.length > 1)
        await telegram(token, "sendMediaGroup", {
          chat_id: chat,
          media: list.map((x) => ({
            type: "photo",
            media: x.url,
            caption: x.caption,
          })),
        });
    } catch {
      for (const x of list) {
        try {
          await telegram(token, "sendPhoto", {
            chat_id: chat,
            photo: x.url,
            caption: x.caption,
          });
        } catch {
          /* photo ignorée */
        }
      }
    }
  }
  return json(200, { ok: true, ref });
};
