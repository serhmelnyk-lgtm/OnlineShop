import type { SearchAggregations, SearchDebugInfo } from '../types'

export function StatisticsSummary(props: { aggs?: SearchAggregations; debug: SearchDebugInfo | null }) {
  const a = props.aggs
  return (
    <div className="ui-surface p-5">
      <div className="mb-4 text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
        Price stats · cardinality
      </div>
      {!a ? (
        <div className="text-sm text-zinc-500 dark:text-zinc-400">—</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Stat label="Avg price" value={`$${a.priceStats.avg.toFixed(2)}`} />
          <Stat label="Min price" value={`$${a.priceStats.min.toFixed(2)}`} />
          <Stat label="Max price" value={`$${a.priceStats.max.toFixed(2)}`} />
          <Stat label="Unique brands" value={String(a.uniqueBrands)} />
        </div>
      )}

      {props.debug && (
        <div className="mt-4 rounded-xl border border-zinc-900/[0.06] bg-zinc-900/[0.03] p-3 text-xs leading-relaxed text-zinc-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-300">
          Query timing: <span className="font-semibold tabular-nums text-zinc-900 dark:text-white">{props.debug.tookMs}ms</span>{' '}
          · Returned{' '}
          <span className="font-semibold tabular-nums text-zinc-900 dark:text-white">{props.debug.returnedHits}</span>
        </div>
      )}
    </div>
  )
}

function Stat(props: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-900/[0.06] bg-zinc-50 px-3 py-2.5 dark:border-white/[0.08] dark:bg-zinc-950/40">
      <div className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{props.label}</div>
      <div className="mt-1 font-semibold tabular-nums text-zinc-900 dark:text-white">{props.value}</div>
    </div>
  )
}
