import type { SearchAggregations, SearchDebugInfo } from '../types'

export function StatisticsSummary(props: { aggs?: SearchAggregations; debug: SearchDebugInfo | null }) {
  const a = props.aggs
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-2 text-sm font-semibold">Stats (min/max/avg + cardinality)</div>
      {!a ? (
        <div className="text-sm text-zinc-500 dark:text-zinc-400">—</div>
      ) : (
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Stat label="Avg price" value={`$${a.priceStats.avg.toFixed(2)}`} />
          <Stat label="Min price" value={`$${a.priceStats.min.toFixed(2)}`} />
          <Stat label="Max price" value={`$${a.priceStats.max.toFixed(2)}`} />
          <Stat label="Unique brands" value={String(a.uniqueBrands)} />
        </div>
      )}

      {props.debug && (
        <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
          Query timing: <span className="font-medium">{props.debug.tookMs}ms</span> • Returned:{' '}
          <span className="font-medium">{props.debug.returnedHits}</span>
        </div>
      )}
    </div>
  )
}

function Stat(props: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 p-2 dark:border-zinc-800">
      <div className="text-xs text-zinc-500 dark:text-zinc-400">{props.label}</div>
      <div className="font-semibold">{props.value}</div>
    </div>
  )
}

