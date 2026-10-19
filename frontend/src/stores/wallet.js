import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const SEPOLIA_CHAIN_ID = '0xaa36a7'

export const useWalletStore = defineStore('wallet', () => {
  const address = ref('')
  const chainId = ref('')
  const error = ref('')

  const shortAddress = computed(() => {
    if (!address.value) return ''
    return `${address.value.slice(0, 6)}…${address.value.slice(-4)}`
  })

  const onSepolia = computed(() => chainId.value.toLowerCase() === SEPOLIA_CHAIN_ID)

  function syncNetworkWarning() {
    if (address.value && chainId.value && !onSepolia.value) {
      error.value = 'Spojen si, ali mreža nije Sepolia (chainId 11155111).'
      return
    }
    if (error.value.startsWith('Spojen si')) error.value = ''
  }

  async function refresh() {
    const ethereum = window.ethereum
    if (!ethereum) return
    try {
      const accounts = await ethereum.request({ method: 'eth_accounts' })
      address.value = accounts?.[0] ?? ''
      chainId.value = await ethereum.request({ method: 'eth_chainId' })
      syncNetworkWarning()
    } catch {
      error.value = 'Novčanik nije moguće pročitati.'
    }
  }

  async function connect() {
    error.value = ''
    const ethereum = window.ethereum
    if (!ethereum) {
      error.value = 'MetaMask nije instaliran.'
      return
    }
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      address.value = accounts?.[0] ?? ''
      chainId.value = await ethereum.request({ method: 'eth_chainId' })
      syncNetworkWarning()
    } catch {
      error.value = 'Spajanje novčanika nije uspjelo.'
    }
  }

  function listen() {
    const ethereum = window.ethereum
    if (!ethereum?.on) return
    ethereum.on('accountsChanged', (accounts) => {
      address.value = accounts?.[0] ?? ''
      syncNetworkWarning()
    })
    ethereum.on('chainChanged', (id) => {
      chainId.value = id
      syncNetworkWarning()
    })
  }

  return {
    address,
    chainId,
    error,
    shortAddress,
    onSepolia,
    connect,
    refresh,
    listen,
  }
})
