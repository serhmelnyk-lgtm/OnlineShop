import type { SearchAggregations, SearchRequest } from '../types'

const sectionTitle =
  'mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500 dark:text-zinc-400'

const rowHover =
  'rounded-xl px-2 py-1.5 motion-safe:transition motion-safe:duration-200 hover:bg-zinc-900/[0.04] dark:hover:bg-white/[0.05]'

export function FilterSidebar(props: {
  req: SearchRequest
  aggs?: SearchAggregations
  onChange: (patch: Partial<SearchRequest>) => void
  isLoading: boolean
}) {
  const { req, aggs } = props

  const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

  return (
    <div
      className={
        'ui-surface p-5 motion-safe:transition motion-reduce:transition-none md:sticky md:top-24 md:max-h-[calc(100vh-7rem)] md:self-start md:overflow-y-auto md:overscroll-contain' +
        (props.isLoading ? ' opacity-95' : '')
      }
    >
      <div className="mb-5 flex items-center justify-between gap-2 border-b border-zinc-900/[0.06] pb-4 dark:border-white/[0.08]">
        <div>
          <div className="text-base font-semibold tracking-tight text-zinc-900 dark:text-white">Filters</div>
          <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">Refine your catalog search</div>
        </div>
        <button
          type="button"
          className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-violet-700 outline-none motion-safe:transition hover:bg-violet-500/10 focus-visible:ring-[3px] focus-visible:ring-violet-500/35 dark:text-violet-300 dark:hover:bg-violet-400/10 dark:focus-visible:ring-violet-400/35"
          onClick={() =>
            props.onChange({
              brands: [],
              categories: [],
              minPrice: null,
              maxPrice: null,
              minRating: null,
              inStockOnly: null,
              specs: {},
            })
          }
        >
          Reset
        </button>
      </div>

      <div className="space-y-6">
        <section>
          <div className={sectionTitle}>Brand</div>
          <div className="max-h-44 space-y-0.5 overflow-auto pr-1 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-600">
            {(aggs?.brands ?? []).map((b) => (
              <label key={b.key} className={`flex cursor-pointer items-center justify-between gap-2 text-sm ${rowHover}`}>
                <span className="flex min-w-0 items-center gap-2.5">
                  <input
                    type="checkbox"
                    className="size-4 shrink-0 rounded border-zinc-300 accent-violet-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 dark:border-zinc-600 dark:accent-violet-500"
                    checked={req.brands.includes(b.key)}
                    onChange={() => props.onChange({ brands: toggle(req.brands, b.key) })}
                  />
                  <span className="truncate font-medium text-zinc-800 dark:text-zinc-100">{b.key}</span>
                </span>
                <span className="shrink-0 rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {b.count}
                </span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <div className={sectionTitle}>Category</div>
          <div className="max-h-44 space-y-0.5 overflow-auto pr-1 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-600">
            {(aggs?.categories ?? []).map((c) => (
              <label key={c.key} className={`flex cursor-pointer items-center justify-between gap-2 text-sm ${rowHover}`}>
                <span className="flex min-w-0 items-center gap-2.5">
                  <input
                    type="checkbox"
                    className="size-4 shrink-0 rounded border-zinc-300 accent-violet-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 dark:border-zinc-600 dark:accent-violet-500"
                    checked={req.categories.includes(c.key)}
                    onChange={() => props.onChange({ categories: toggle(req.categories, c.key) })}
                  />
                  <span className="truncate font-medium text-zinc-800 dark:text-zinc-100">{c.key}</span>
                </span>
                <span className="shrink-0 rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {c.count}
                </span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <div className={sectionTitle}>Price</div>
          <div className="grid grid-cols-2 gap-2">
            <input
              className="ui-input py-2 tabular-nums text-zinc-900 dark:text-zinc-100"
              placeholder="Min"
              inputMode="numeric"
              aria-label="Minimum price"
              value={req.minPrice ?? ''}
              onChange={(e) => props.onChange({ minPrice: e.target.value ? Number(e.target.value) : null })}
            />
            <input
              className="ui-input py-2 tabular-nums text-zinc-900 dark:text-zinc-100"
              placeholder="Max"
              inputMode="numeric"
              aria-label="Maximum price"
              value={req.maxPrice ?? ''}
              onChange={(e) => props.onChange({ maxPrice: e.target.value ? Number(e.target.value) : null })}
            />
          </div>
          <div className="mt-3 space-y-1">
            {(aggs?.priceRanges ?? []).map((p) => (
              <button
                key={p.key}
                type="button"
                className={`flex w-full items-center justify-between rounded-xl px-2 py-2 text-left text-sm font-medium text-zinc-800 outline-none motion-safe:transition motion-safe:duration-200 hover:bg-zinc-900/[0.05] focus-visible:ring-2 focus-visible:ring-violet-500/45 dark:text-zinc-100 dark:hover:bg-white/[0.06] dark:focus-visible:ring-violet-400/45`}
                onClick={() => props.onChange({ minPrice: p.from ?? null, maxPrice: p.to ?? null })}
              >
                <span>{p.key}</span>
                <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {p.count}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className={sectionTitle}>Rating</div>
          <select
            className="ui-select w-full text-zinc-900 dark:text-zinc-100"
            value={req.minRating ?? ''}
            aria-label="Minimum rating"
            onChange={(e) => props.onChange({ minRating: e.target.value ? Number(e.target.value) : null })}
          >
            <option value="">Any rating</option>
            <option value="3">3+ stars</option>
            <option value="4">4+ stars</option>
            <option value="4.5">4.5+ stars</option>
          </select>
        </section>

        <section>
          <div className={sectionTitle}>Availability</div>
          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-zinc-900/[0.06] bg-zinc-50 px-3 py-2.5 text-sm font-medium motion-safe:transition hover:bg-zinc-100/90 dark:border-white/[0.08] dark:bg-zinc-950/50 dark:hover:bg-zinc-800/80">
            <span className="text-zinc-800 dark:text-zinc-100">In stock only</span>
            <input
              type="checkbox"
              className="size-4 rounded border-zinc-300 accent-violet-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 dark:border-zinc-600 dark:accent-violet-500"
              checked={req.inStockOnly === true}
              onChange={(e) => props.onChange({ inStockOnly: e.target.checked ? true : null })}
            />
          </label>
          {aggs && (
            <div className="mt-3 rounded-xl bg-zinc-900/[0.03] px-3 py-2 text-[11px] leading-relaxed text-zinc-500 dark:bg-white/[0.04] dark:text-zinc-400">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">In stock:</span> {aggs.filters.inStock}
              <span className="mx-2 text-zinc-300 dark:text-zinc-600">·</span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">Discounted:</span>{' '}
              {aggs.filters.discounted}
            </div>
          )}
        </section>

        <section>
          <div className={sectionTitle}>Specs</div>
          <div className="space-y-4">
            {(aggs?.specKeys ?? []).slice(0, 4).map((k) => {
              const values = aggs?.specValuesByKey?.[k.key] ?? []
              if (values.length === 0) return null
              return (
                <div key={k.key}>
                  <div className="mb-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200">{k.key}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {values.slice(0, 6).map((v) => {
                      const selected = req.specs?.[k.key]?.includes(v.key) ?? false
                      return (
                        <button
                          key={v.key}
                          type="button"
                          className={
                            'rounded-full border px-2.5 py-1 text-xs font-medium outline-none motion-safe:transition motion-safe:duration-200 focus-visible:ring-2 focus-visible:ring-violet-500/45 dark:focus-visible:ring-violet-400/45 ' +
                            (selected
                              ? 'border-violet-500 bg-violet-500/15 text-violet-900 shadow-sm dark:border-violet-400 dark:bg-violet-400/15 dark:text-violet-100'
                              : 'border-zinc-900/[0.08] bg-white text-zinc-700 hover:border-zinc-900/15 hover:bg-zinc-50 dark:border-white/[0.1] dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800')
                          }
                          onClick={() => {
                            const current = req.specs?.[k.key] ?? []
                            const next = toggle(current, v.key)
                            props.onChange({ specs: { ...req.specs, [k.key]: next } })
                          }}
                        >
                          {v.key}{' '}
                          <span className="font-normal opacity-60 tabular-nums">({v.count})</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
