import React from 'react'
import ReactDOM from 'react-dom/client'
import { WagmiConfig, configureChains, defaultChains, createClient, Chain } from 'wagmi'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { infuraProvider } from 'wagmi/providers/infura'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'

import App from './App'

import './styles/index.css'

const bscTestnet: Chain = {
  name: 'Binance Smart Chain Testnet',
  id: 97,
  network: 'bsc testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Test BNB Chain',
    symbol: 'tBNB'
  },
  rpcUrls: {
    default: 'https://data-seed-prebsc-1-s2.binance.org:8545/'
  },
  blockExplorers: {
    default: { name: 'Testnet BSC Scan', url: 'https://testnet.bscscan.com/' }
  },
  testnet: true
}

const { chains, provider, webSocketProvider } = configureChains(
  [...defaultChains, bscTestnet],
  [
    infuraProvider({ apiKey: import.meta.env.infuraKey }),
    jsonRpcProvider({
      rpc: chain => {
        if (chain.id !== bscTestnet.id) {
          return null
        }
        return {
          http: chain.rpcUrls.default
        }
      }
    })
  ]
)

const client = createClient({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new InjectedConnector({
      chains,
      options: {
        name: 'Injected',
        shimDisconnect: true
      }
    })
  ],
  provider,
  webSocketProvider
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <WagmiConfig client={client}>
      <App />
    </WagmiConfig>
  </React.StrictMode>
)
