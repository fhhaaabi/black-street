<script setup>
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import ToastNotification from './components/ToastNotification.vue'
import OrderModal from './components/OrderModal.vue'
import CursorFollower from './components/CursorFollower.vue'
</script>
<template>
  <a href="#main" class="skip-link">Aller au contenu</a>
  <AppHeader />
  <main id="main" tabindex="-1">
    <RouterView v-slot="{ Component, route }">
      <Transition name="page" mode="out-in"><component :is="Component" :key="route.path" /></Transition>
    </RouterView>
  </main>
  <AppFooter />
  <ToastNotification />
  <OrderModal />
  <CursorFollower />
</template>
