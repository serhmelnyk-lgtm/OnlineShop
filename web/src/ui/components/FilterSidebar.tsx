import type { SearchAggregations, SearchRequest } from '../types'

export function FilterSidebar(props: {
  req: SearchRequest
  aggs?: SearchAggregations
  onChange: (patch: Partial<SearchRequest>) => void
  isLoading: boolean
}) {
  const { req, aggs } = props

  const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex items-center justify-between">
        <div className="font-medium">Filters</div>
        <button
          className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
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

      <div className="space-y-4">
        <section>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Brand
          </div>
          <div className="max-h-40 space-y-1 overflow-auto pr-1">
            {(aggs?.brands ?? []).map((b) => (
              <label key={b.key} className="flex cursor-pointer items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={req.brands.includes(b.key)}
                    onChange={() => props.onChange({ brands: toggle(req.brands, b.key) })}
                  />
                  {b.key}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{b.count}</span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Category
          </div>
          <div className="max-h-40 space-y-1 overflow-auto pr-1">
            {(aggs?.categories ?? []).map((c) => (
              <label key={c.key} className="flex cursor-pointer items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={req.categories.includes(c.key)}
                    onChange={() => props.onChange({ categories: toggle(req.categories, c.key) })}
                  />
                  {c.key}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{c.count}</span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Price
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              placeholder="Min"
              inputMode="numeric"
              value={req.minPrice ?? ''}
              onChange={(e) => props.onChange({ minPrice: e.target.value ? Number(e.target.value) : null })}
            />
            <input
              className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              placeholder="Max"
              inputMode="numeric"
              value={req.maxPrice ?? ''}
              onChange={(e) => props.onChange({ maxPrice: e.target.value ? Number(e.target.value) : null })}
            />
          </div>
          <div className="mt-2 space-y-1">
            {(aggs?.priceRanges ?? []).map((p) => (
              <button
                key={p.key}
                className="flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                onClick={() => props.onChange({ minPrice: p.from ?? null, maxPrice: p.to ?? null })}
              >
                <span>{p.key}</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{p.count}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Rating
          </div>
          <select
            className="w-full rounded-md border border-zinc-200 bg-white px-2 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            value={req.minRating ?? ''}
            onChange={(e) => props.onChange({ minRating: e.target.value ? Number(e.target.value) : null })}
          >
            <option value="">Any</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="4.5">4.5+</option>
          </select>
        </section>

        <section>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Availability
          </div>
          <label className="flex items-center justify-between text-sm">
            <span>In stock only</span>
            <input
              type="checkbox"
              checked={req.inStockOnly === true}
              onChange={(e) => props.onChange({ inStockOnly: e.target.checked ? true : null })}
            />
          </label>
          {aggs && (
            <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              In stock: {aggs.filters.inStock} • Discounted: {aggs.filters.discounted}
            </div>
          )}
        </section>

        <section>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Specs (dynamic)
          </div>
          <div className="space-y-2">
            {(aggs?.specKeys ?? []).slice(0, 4).map((k) => {
              const values = aggs?.specValuesByKey?.[k.key] ?? []
              if (values.length === 0) return null
              return (
                <div key={k.key}>
                  <div className="mb-1 text-xs font-medium text-zinc-700 dark:text-zinc-200">{k.key}</div>
                  <div className="flex flex-wrap gap-1">
                    {values.slice(0, 6).map((v) => {
                      const selected = req.specs?.[k.key]?.includes(v.key) ?? false
                      return (
                        <button
                          key={v.key}
                          className={
                            'rounded-full border px-2 py-1 text-xs ' +
                            (selected
                              ? 'border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-200'
                              : 'border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800')
                          }
                          onClick={() => {
                            const current = req.specs?.[k.key] ?? []
                            const next = toggle(current, v.key)
                            props.onChange({ specs: { ...req.specs, [k.key]: next } })
                          }}
                        >
                          {v.key} <span className="opacity-60">({v.count})</span>
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

