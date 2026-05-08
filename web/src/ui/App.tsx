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
        'rounded-lg px-3 py-2 text-sm font-medium transition ' +
        (isActive ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100' : 'text-zinc-600 hover:bg-zinc-100/70 dark:text-zinc-300 dark:hover:bg-zinc-900')
      }
    >
      {props.label}
    </NavLink>
  )
}

export function App() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="font-semibold tracking-tight">OnlineShop</div>
            <nav className="hidden items-center gap-1 md:flex">
              <TopNavLink to="/shop" label="Shop" />
              <TopNavLink to="/configuration/aggregations" label="Configuration" />
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
              onClick={() => setDark((d) => !d)}
            >
              {dark ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 pb-3 md:hidden">
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

