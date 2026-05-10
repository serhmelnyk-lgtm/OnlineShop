import { NavLink, Outlet } from 'react-router-dom'

function SubNavLink(props: { to: string; label: string; description: string }) {
  return (
    <NavLink
      to={props.to}
      className={({ isActive }) =>
        [
          'group block min-w-0 flex-1 rounded-2xl border p-4 outline-none motion-safe:transition motion-safe:duration-200',
          'focus-visible:ring-[3px] focus-visible:ring-violet-500/35 dark:focus-visible:ring-violet-400/35',
          isActive
            ? 'border-violet-500/45 bg-gradient-to-br from-violet-500/12 to-indigo-500/10 shadow-md shadow-violet-900/10 dark:from-violet-400/14 dark:to-indigo-500/10 dark:shadow-black/40'
            : 'border-zinc-900/[0.07] bg-white hover:border-zinc-900/12 hover:shadow-md hover:shadow-zinc-900/[0.05] dark:border-white/[0.09] dark:bg-zinc-900 dark:hover:border-white/[0.14]',
        ].join(' ')
      }
    >
      <div className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">{props.label}</div>
      <div className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{props.description}</div>
    </NavLink>
  )
}

export function ConfigLayout() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 pb-12 pt-8 md:pt-10">
      <nav className="ui-surface p-5 sm:p-6">
        <div className="mb-4 border-b border-zinc-900/[0.06] pb-4 dark:border-white/[0.08]">
          <div className="text-[13px] font-semibold uppercase tracking-[0.1em] text-violet-600 dark:text-violet-400">
            Developer
          </div>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">Configuration</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Inspect aggregation payloads, charts, and operational logs for this Elasticsearch-backed demo.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <SubNavLink
            to="/configuration/aggregations"
            label="Elasticsearch aggregations"
            description="Charts plus raw query / response debug panels."
          />
          <SubNavLink to="/configuration/errors" label="Error logs" description="Recent server exceptions and stack traces." />
        </div>
      </nav>

      <section className="min-w-0">
        <Outlet />
      </section>
    </div>
  )
}
