<script setup>
import { watch, nextTick, ref } from 'vue'
const props = defineProps({
  open: Boolean, title: String, text: String, confirmLabel: { type: String, default: 'Confirmer' }
})
const emit = defineEmits(['confirm', 'cancel'])
const cancelBtn = ref(null)
watch(() => props.open, async (o) => { if (o) { await nextTick(); cancelBtn.value?.focus() } })
</script>
<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="modal-back" @click.self="emit('cancel')" @keydown.esc="emit('cancel')">
        <div class="modal-box" role="alertdialog" aria-modal="true" aria-labelledby="cd-title" aria-describedby="cd-text">
          <h2 id="cd-title" class="h4">{{ title }}</h2>
          <p id="cd-text" class="text-secondary">{{ text }}</p>
          <div class="d-flex gap-2 justify-content-end flex-wrap">
            <button ref="cancelBtn" class="btn btn-line" @click="emit('cancel')">Annuler</button>
            <button class="btn btn-ink" @click="emit('confirm')">{{ confirmLabel }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
