import { NavLink, Outlet } from 'react-router-dom'

function SubNavLink(props: { to: string; label: string; description: string }) {
  return (
    <NavLink
      to={props.to}
      className={({ isActive }) =>
        'block min-w-0 flex-1 rounded-xl border p-3 transition ' +
        (isActive
          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-900 dark:text-indigo-100'
          : 'border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800')
      }
    >
      <div className="text-sm font-semibold">{props.label}</div>
      <div className="text-xs text-zinc-500 dark:text-zinc-400">{props.description}</div>
    </NavLink>
  )
}

export function ConfigLayout() {
  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-6">
      <nav className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-3 text-sm font-semibold">Configuration</div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <SubNavLink
            to="/configuration/aggregations"
            label="Elasticsearch aggregations"
            description="Charts + raw query/response debug panel."
          />
          <SubNavLink to="/configuration/errors" label="Error logs" description="See most recent server exceptions." />
        </div>
      </nav>

      <section className="min-w-0">
        <Outlet />
      </section>
    </div>
  )
}

