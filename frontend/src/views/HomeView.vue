<script setup>
import { ref } from 'vue'
import { useWalletStore } from '../stores/wallet'

const wallet = useWalletStore()
const recipient = ref('')
const amount = ref('')

function submit() {
  wallet.sendEth(recipient.value, amount.value)
}
</script>

<template>
  <section class="panel">
    <p class="eyebrow">Studentska udruga</p>
    <h1>ChainLab</h1>
    <p class="lead">
      Spoji MetaMask i pošalji testni ETH na Sepoliji. MetaMask traži potvrdu
      prije svakog slanja, a privatni ključ ostaje u novčaniku.
    </p>

    <div v-if="!wallet.address" class="send-box">
      <p>Za slanje prvo spoji svoj MetaMask račun.</p>
      <button class="send" type="button" @click="wallet.connect">Spoji MetaMask</button>
    </div>

    <form v-else class="send-box" @submit.prevent="submit">
      <p class="balance">Stanje: {{ wallet.formattedBalance }} ETH</p>
      <p class="account">{{ wallet.address }}</p>

      <label>
        Adresa primatelja
        <input
          v-model="recipient"
          name="recipient"
          autocomplete="off"
          spellcheck="false"
          placeholder="0x..."
          :disabled="wallet.sending"
        />
      </label>
      <label>
        Iznos (ETH)
        <input
          v-model="amount"
          name="amount"
          inputmode="decimal"
          placeholder="0.01"
          :disabled="wallet.sending"
        />
      </label>

      <button
        v-if="!wallet.onSepolia"
        class="send"
        type="button"
        @click="wallet.switchToSepolia"
      >
        Prebaci na Sepoliju
      </button>
      <button v-else class="send" type="submit" :disabled="wallet.sending">
        {{ wallet.sending ? 'Čekam MetaMask…' : 'Pošalji' }}
      </button>

      <p v-if="wallet.sendError" class="form-note warn" role="status">{{ wallet.sendError }}</p>
      <p v-if="wallet.txHash" class="form-note">
        Transakcija je poslana.
        <a :href="wallet.txUrl" target="_blank" rel="noopener noreferrer">Pogledaj na Etherscanu</a>
      </p>
    </form>
  </section>
</template>
