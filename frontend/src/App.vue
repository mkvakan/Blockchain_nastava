<script setup>
import { onMounted } from 'vue'
import { useUiStore } from './stores/ui'
import { useWalletStore } from './stores/wallet'
import HomeView from './views/HomeView.vue'
import AboutView from './views/AboutView.vue'

const ui = useUiStore()
const wallet = useWalletStore()

onMounted(() => {
  wallet.listen()
  wallet.refresh()
})
</script>

<template>
  <div class="app">
    <header class="header">
      <button class="brand" type="button" @click="ui.show('home')">ChainLab</button>
      <nav class="nav">
        <button
          type="button"
          :class="{ active: ui.page === 'home' }"
          @click="ui.show('home')"
        >
          Početna
        </button>
        <button
          type="button"
          :class="{ active: ui.page === 'about' }"
          @click="ui.show('about')"
        >
          O nama
        </button>
      </nav>
      <div class="wallet">
        <button class="connect" type="button" @click="wallet.connect">
          {{ wallet.shortAddress || 'Spoji novčanik' }}
        </button>
        <p v-if="wallet.error" class="wallet-note" role="status">{{ wallet.error }}</p>
      </div>
    </header>
    <main>
      <HomeView v-if="ui.page === 'home'" />
      <AboutView v-else />
    </main>
  </div>
</template>
