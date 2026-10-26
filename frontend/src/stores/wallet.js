import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const SEPOLIA_CHAIN_ID = '0xaa36a7'

const SEPOLIA_PARAMS = {
  chainId: SEPOLIA_CHAIN_ID,
  chainName: 'Sepolia',
  nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://rpc.sepolia.org'],
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
}

function getEthereum() {
  const { ethereum } = window
  if (!ethereum) return null
  if (Array.isArray(ethereum.providers) && ethereum.providers.length) {
    return ethereum.providers.find((provider) => provider.isMetaMask) ?? ethereum
  }
  return ethereum
}

function ethToWeiHex(amount) {
  const normalized = amount.trim().replace(',', '.')
  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    throw new Error('Iznos nije ispravan.')
  }
  const [whole, frac = ''] = normalized.split('.')
  if (frac.length > 18) {
    throw new Error('Iznos može imati najviše 18 decimala.')
  }
  const wei = BigInt(whole) * 10n ** 18n + BigInt(frac.padEnd(18, '0'))
  if (wei <= 0n) throw new Error('Iznos mora biti veći od nule.')
  return `0x${wei.toString(16)}`
}

function formatEth(weiHex) {
  const wei = BigInt(weiHex || '0x0')
  const whole = wei / 10n ** 18n
  const frac = (wei % 10n ** 18n)
    .toString()
    .padStart(18, '0')
    .slice(0, 6)
    .replace(/0+$/, '')
  return frac ? `${whole}.${frac}` : String(whole)
}

function readableError(err, fallback) {
  if (err?.code === 4001) return 'Odbio si zahtjev u MetaMasku.'
  if (err?.code === -32002) return 'MetaMask već čeka tvoju potvrdu.'
  const message = typeof err?.message === 'string' ? err.message : ''
  if (/insufficient funds/i.test(message)) return 'Nema dovoljno ETH-a za ovo slanje.'
  return fallback
}

export const useWalletStore = defineStore('wallet', () => {
  const address = ref('')
  const chainId = ref('')
  const error = ref('')
  const balanceWei = ref('0x0')
  const sending = ref(false)
  const sendError = ref('')
  const txHash = ref('')
  let listening = false

  const shortAddress = computed(() => {
    if (!address.value) return ''
    return `${address.value.slice(0, 6)}…${address.value.slice(-4)}`
  })

  const onSepolia = computed(() => chainId.value.toLowerCase() === SEPOLIA_CHAIN_ID)

  const formattedBalance = computed(() => formatEth(balanceWei.value))

  const txUrl = computed(() =>
    txHash.value ? `https://sepolia.etherscan.io/tx/${txHash.value}` : '',
  )

  function syncNetworkWarning() {
    if (address.value && chainId.value && !onSepolia.value) {
      error.value = 'Spojen si, ali mreža nije Sepolia (chainId 11155111).'
      return
    }
    if (error.value.startsWith('Spojen si')) error.value = ''
  }

  async function refreshBalance() {
    const ethereum = getEthereum()
    if (!ethereum || !address.value) {
      balanceWei.value = '0x0'
      return
    }
    const hex = await ethereum.request({
      method: 'eth_getBalance',
      params: [address.value, 'latest'],
    })
    balanceWei.value = hex
  }

  async function refresh() {
    const ethereum = getEthereum()
    if (!ethereum) return
    try {
      const accounts = await ethereum.request({ method: 'eth_accounts' })
      address.value = accounts?.[0] ?? ''
      chainId.value = await ethereum.request({ method: 'eth_chainId' })
      syncNetworkWarning()
      await refreshBalance()
    } catch {
      error.value = 'Novčanik nije moguće pročitati.'
    }
  }

  async function switchToSepolia() {
    const ethereum = getEthereum()
    if (!ethereum) {
      error.value = 'MetaMask nije instaliran.'
      return
    }
    error.value = ''
    try {
      const current = (await ethereum.request({ method: 'eth_chainId' })).toLowerCase()
      chainId.value = current
      if (current !== SEPOLIA_CHAIN_ID) {
        try {
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CHAIN_ID }],
          })
        } catch (err) {
          if (err?.code !== 4902) throw err
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SEPOLIA_PARAMS],
          })
        }
        chainId.value = await ethereum.request({ method: 'eth_chainId' })
      }
      syncNetworkWarning()
      await refreshBalance()
    } catch (err) {
      error.value = readableError(err, 'Prebacivanje na Sepoliju nije uspjelo.')
      syncNetworkWarning()
    }
  }

  async function connect() {
    error.value = ''
    const ethereum = getEthereum()
    if (!ethereum) {
      error.value = 'MetaMask nije instaliran.'
      return
    }
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      address.value = accounts?.[0] ?? ''
      chainId.value = await ethereum.request({ method: 'eth_chainId' })
      if (!onSepolia.value) await switchToSepolia()
      else await refreshBalance()
      syncNetworkWarning()
    } catch (err) {
      error.value = readableError(err, 'Spajanje novčanika nije uspjelo.')
    }
  }

  async function sendEth(to, amount) {
    sendError.value = ''
    txHash.value = ''
    const ethereum = getEthereum()
    if (!ethereum) {
      sendError.value = 'MetaMask nije instaliran.'
      return
    }
    if (!address.value) {
      sendError.value = 'Prvo spoji novčanik.'
      return
    }
    if (!onSepolia.value) {
      sendError.value = 'Prebaci MetaMask na Sepoliju.'
      return
    }
    const recipient = to.trim()
    if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
      sendError.value = 'Adresa primatelja nije ispravna.'
      return
    }
    let value
    try {
      value = ethToWeiHex(amount)
    } catch (err) {
      sendError.value = err.message
      return
    }

    sending.value = true
    try {
      txHash.value = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{ from: address.value, to: recipient, value }],
      })
      await refreshBalance()
    } catch (err) {
      sendError.value = readableError(err, 'Slanje nije uspjelo.')
    } finally {
      sending.value = false
    }
  }

  function listen() {
    const attach = () => {
      const ethereum = getEthereum()
      if (!ethereum?.on || listening) return
      listening = true
      ethereum.on('accountsChanged', (accounts) => {
        address.value = accounts?.[0] ?? ''
        txHash.value = ''
        sendError.value = ''
        syncNetworkWarning()
        refreshBalance()
      })
      ethereum.on('chainChanged', (id) => {
        chainId.value = id
        syncNetworkWarning()
        refreshBalance()
      })
    }

    if (getEthereum()) attach()
    else {
      window.addEventListener(
        'ethereum#initialized',
        () => {
          attach()
          refresh()
        },
        { once: true },
      )
    }
  }

  return {
    address,
    chainId,
    error,
    shortAddress,
    onSepolia,
    formattedBalance,
    sending,
    sendError,
    txHash,
    txUrl,
    connect,
    refresh,
    listen,
    switchToSepolia,
    sendEth,
  }
})
