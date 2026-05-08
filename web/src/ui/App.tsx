import { useEffect, useState } from 'react'
import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { ShopPage } from './pages/ShopPage'
import { ConfigLayout } from './pages/config/ConfigLayout'
import { ElasticsearchAggregationsPage } from './pages/config/ElasticsearchAggregationsPage'
import { ErrorLogsPage } from './pages/config/ErrorLogsPage'

function TopNavLink(props: { to: string; label: string }) {
  return (
    <NavLink
      to={props.to}
      className={({ isActive }) =>
        [
          'rounded-xl px-3.5 py-2 text-sm font-medium outline-none transition-colors duration-200',
          'focus-visible:ring-[3px] focus-visible:ring-violet-500/35 dark:focus-visible:ring-violet-400/40',
          isActive
            ? 'bg-zinc-900 text-white shadow-md shadow-zinc-900/25 dark:bg-white dark:text-zinc-900 dark:shadow-black/30'
            : 'text-zinc-600 hover:bg-zinc-900/[0.06] hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.08] dark:hover:text-zinc-100',
        ].join(' ')
      }
    >
      {props.label}
    </NavLink>
  )
}

function LogoMark() {
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-lg shadow-violet-600/25 ring-1 ring-white/25 dark:from-violet-500 dark:to-indigo-600 dark:shadow-violet-900/40"
      aria-hidden
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 3L4 8v8l8 5 8-5V8l-8-5z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path d="M12 12l8-4M12 12V22M12 12L4 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export function App() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return (
    <div className="page-shell">
      <header className="sticky top-0 z-30 border-b border-zinc-900/[0.06] bg-white/75 backdrop-blur-xl backdrop-saturate-150 dark:border-white/[0.08] dark:bg-zinc-950/72">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-500/35 to-transparent dark:via-violet-400/25" />
        <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <LogoMark />
            <div className="min-w-0">
              <div className="truncate font-semibold tracking-tight text-zinc-900 dark:text-white">OnlineShop</div>
              <div className="hidden text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500 sm:block">
                Electronics · gadgets
              </div>
            </div>
            <nav className="ml-1 hidden items-center gap-0.5 md:flex" aria-label="Primary">
              <TopNavLink to="/shop" label="Shop" />
              <TopNavLink to="/configuration/aggregations" label="Configuration" />
            </nav>
          </div>
          <button
            type="button"
            className="ui-btn shrink-0 font-medium motion-safe:transition motion-reduce:transition-none"
            onClick={() => setDark((d) => !d)}
            aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {dark ? 'Light' : 'Dark'}
          </button>
        </div>

        <div className="relative mx-auto flex max-w-7xl items-center gap-1 px-4 pb-3 md:hidden">
          <TopNavLink to="/shop" label="Shop" />
          <TopNavLink to="/configuration/aggregations" label="Configuration" />
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Navigate to="/shop" replace />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/configuration" element={<ConfigLayout />}>
          <Route index element={<Navigate to="/configuration/aggregations" replace />} />
          <Route path="aggregations" element={<ElasticsearchAggregationsPage />} />
          <Route path="errors" element={<ErrorLogsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/shop" replace />} />
      </Routes>
    </div>
  )
}
