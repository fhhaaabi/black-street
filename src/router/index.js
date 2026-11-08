import { createRouter, createWebHistory } from "vue-router";
import { shop } from "../config/shop.js";
import HomeView from "../views/HomeView.vue";

// Les autres pages sont chargées à la demande (chargement initial plus rapide)
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: { title: "Accueil" },
    },
    {
      path: "/boutique",
      name: "shop",
      component: () => import("../views/ShopView.vue"),
      meta: { title: "Boutique" },
    },
    {
      path: "/categorie/:id",
      name: "category",
      component: () => import("../views/CategoryView.vue"),
      meta: { title: "Catégorie" },
    },
    {
      path: "/collection/:id",
      name: "collection",
      component: () => import("../views/CollectionView.vue"),
      meta: { title: "Collection" },
    },
    {
      path: "/produit/:slug",
      name: "product",
      component: () => import("../views/ProductDetailView.vue"),
      meta: { title: "Produit" },
    },
    {
      path: "/favoris",
      name: "favorites",
      component: () => import("../views/FavoritesView.vue"),
      meta: { title: "Mes favoris" },
    },
    {
      path: "/panier",
      name: "cart",
      component: () => import("../views/CartView.vue"),
      meta: { title: "Mon panier" },
    },
    // {
    //   path: "/commande",
    //   name: "recap",
    //   component: () => import("../views/RecapView.vue"),
    //   meta: { title: "Récapitulatif de commande" },
    // },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("../views/NotFoundView.vue"),
      meta: { title: "Page introuvable" },
    },
  ],
  scrollBehavior(to, from, saved) {
    if (saved) return saved;
    if (to.path === from.path) return false; // simple changement de filtre : on ne remonte pas
    return { top: 0 };
  },
});

router.afterEach((to) => {
  if (to.name !== "product") document.title = `${to.meta.title} — ${shop.name}`;
});

export default router;
