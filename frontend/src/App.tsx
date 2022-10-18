import { MantineProvider } from '@mantine/core'
import { Link, Outlet, ReactLocation, Router, Route } from '@tanstack/react-location'
import { WagmiConfig, configureChains, defaultChains, createClient } from 'wagmi'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { infuraProvider } from 'wagmi/providers/infura'

import { theme } from './theme'

const { chains, provider, webSocketProvider } = configureChains(defaultChains, [
  infuraProvider({ apiKey: import.meta.env.infuraKey })
])

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

// Set up a ReactLocation instance
const location = new ReactLocation()

const routeLables: Record<string, string> = {
  '/': 'Home',
  '/create-nft': 'CreateNFT',
  '/my-nfts': 'MyNFT',
  '/dashboard': 'Dashboard'
}

const routes: Route[] = [
  {
    path: '/',
    element: () => import(/* webpackChunkName: "home" */ './containers/Home').then(page => <page.default />)
  },
  {
    path: '/create-nft',
    element: () => import(/* webpackChunkName: "create-nft" */ './containers/CreateNFT').then(page => <page.default />)
  },
  {
    path: '/my-nfts',
    element: () => import(/* webpackChunkName: "my-nfts" */ './containers/MyNFT').then(page => <page.default />)
  },
  {
    path: '/resell-nfts',
    element: () => import(/* webpackChunkName: "resell-nfts" */ './containers/ResellNFT').then(page => <page.default />)
  },
  {
    path: '/dashboard',
    element: () => import(/* webpackChunkName: "dashboard" */ './containers/Dashboard').then(page => <page.default />)
  }
]

export default function App() {
  return (
    <WagmiConfig client={client}>
      <MantineProvider withGlobalStyles withNormalizeCSS theme={theme}>
        <Router location={location} routes={routes}>
          <div>
            <nav className='border-b p-6'>
              <p className='text-4xl font-bold'>Metaverse Marketplace</p>
              <div className='flex gap-x-6 mt-4'>
                {routes.map(route => (
                  <Link
                    key={route.path}
                    to={route.path}
                    getActiveProps={() => ({
                      style: {
                        borderBottom: '1px solid #EB539F'
                      }
                    })}
                    activeOptions={{ exact: true }}
                  >
                    <span className='text-pink-500'>{routeLables[route.path as string]}</span>
                  </Link>
                ))}
              </div>
            </nav>

            <Outlet />
          </div>
        </Router>
      </MantineProvider>
    </WagmiConfig>
  )
}
