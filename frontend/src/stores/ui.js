import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const page = ref('home')

  function show(next) {
    page.value = next
  }

  return { page, show }
})
