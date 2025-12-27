import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  Outlet,
  useLocation,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import Header from '../components/Header'
import { ClientOnly } from '../components/ClientOnly'
import { WalletProvider } from '../hooks/useWallet'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ShieldCheck, Wallet } from 'lucide-react'

interface MyRouterContext {
  queryClient: QueryClient
}

// Static header skeleton for SSR - matches the structure of the real header
function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b-0 border-b-white/5">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="size-10 flex items-center justify-center bg-sc-accent-blue/20 rounded-lg border border-sc-accent-blue/30 text-sc-accent-blue group-hover:bg-sc-accent-blue/30 transition-all">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-white text-xl font-black tracking-tight">
              Serti-Chain
            </h2>
          </Link>

          {/* Static Wallet Button for SSR */}
          <div className="flex items-center gap-3">
            <button
              disabled
              className="group flex items-center justify-center gap-2 h-10 px-5 bg-sc-accent-blue hover:bg-blue-700 active:scale-95 transition-all rounded-lg text-white text-sm font-black shadow-[0_0_15px_rgba(19,55,236,0.3)] hover:shadow-[0_0_25px_rgba(19,55,236,0.5)] disabled:opacity-50"
            >
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Serti-Chain | Blockchain Diploma Verification',
      },
      {
        name: 'description',
        content:
          'Issue, manage, and verify digital diplomas instantly with blockchain technology. Tamper-proof credentials for universities and students worldwide.',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/favicon.svg',
      },
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico',
      },
    ],
  }),

  component: RootComponent,
  notFoundComponent: NotFoundComponent,
})

function RootComponent() {
  const location = useLocation()

  // Pages that should show the public header
  const showHeader = location.pathname === '/'

  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-sc-bg-primary">
        <WalletProvider>
          {showHeader && (
            <ClientOnly fallback={<HeaderSkeleton />}>
              <Header />
            </ClientOnly>
          )}
          <Outlet />
        </WalletProvider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}

function NotFoundComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-sc-bg-primary">
      <div className="text-center">
        <h1 className="text-6xl font-black text-white mb-4">404</h1>
        <p className="text-xl text-[#929bc9] mb-8">Page not found</p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-sc-accent-blue text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  )
}
