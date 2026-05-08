import { useMemo, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { searchProducts } from '../api'
import { FilterSidebar } from '../components/FilterSidebar'
import { ProductGrid } from '../components/ProductGrid'
import { SearchBar } from '../components/SearchBar'
import type { ProductSort, SearchRequest, SearchResponse } from '../types'

const defaultReq: SearchRequest = {
  query: '',
  page: 1,
  pageSize: 24,
  sort: 'Relevance',
  brands: [],
  categories: [],
  minPrice: null,
  maxPrice: null,
  minRating: null,
  inStockOnly: null,
  createdFrom: null,
  createdTo: null,
  specs: {},
  includeDebug: false,
  aggregationMode: 'Terms',
}

export function ShopPage() {
  const [req, setReq] = useState<SearchRequest>(defaultReq)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableReq = useMemo(() => req, [JSON.stringify(req)])

  const q = useQuery<SearchResponse>({
    queryKey: ['shop-search', stableReq],
    queryFn: ({ signal }) => searchProducts(stableReq, signal),
    placeholderData: keepPreviousData,
  })

  const data = q.data
  const setQuery = (query: string) => setReq((r) => ({ ...r, query, page: 1 }))
  const setSort = (sort: ProductSort) => setReq((r) => ({ ...r, sort, page: 1 }))

  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 pt-8 md:pt-10">
      <header className="mb-8 max-w-2xl">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-violet-600 dark:text-violet-400">
          Catalog
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white md:text-4xl">
          Shop electronics & gadgets
        </h1>
        <p className="mt-3 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
          Faceted search powered by Elasticsearch — combine brands, categories, price, and specs with typo-friendly
          queries.
        </p>
      </header>

      <div className="grid grid-cols-12 gap-6 lg:gap-8">
        <aside className="col-span-12 lg:col-span-3">
          <FilterSidebar
            req={req}
            aggs={data?.aggregations}
            onChange={(patch) => setReq((r) => ({ ...r, ...patch, page: 1 }))}
            isLoading={q.isFetching}
          />
        </aside>

        <section className="col-span-12 lg:col-span-9">
          <div className="ui-surface mb-6 flex flex-col gap-4 p-4 sm:p-5 md:flex-row md:items-center md:justify-between md:gap-6">
            <div className="min-w-0 flex-1">
              <SearchBar value={req.query ?? ''} onChange={setQuery} isLoading={q.isFetching} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
              <div className="flex items-baseline gap-2 text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">Results</span>
                {data ? (
                  <span className="rounded-lg bg-zinc-900/[0.06] px-2.5 py-1 text-sm font-semibold tabular-nums text-zinc-900 dark:bg-white/[0.08] dark:text-white">
                    {data.total.toLocaleString()}
                  </span>
                ) : (
                  <span className="text-zinc-400">—</span>
                )}
              </div>
              <label className="flex items-center gap-2">
                <span className="sr-only">Sort products</span>
                <select
                  className="ui-select min-w-[11rem] font-medium text-zinc-900 dark:text-zinc-100"
                  value={req.sort}
                  onChange={(e) => setSort(e.target.value as ProductSort)}
                >
                  <option value="Relevance">Sort · Relevance</option>
                  <option value="PriceAsc">Sort · Price ascending</option>
                  <option value="PriceDesc">Sort · Price descending</option>
                  <option value="RatingDesc">Sort · Highest rated</option>
                  <option value="Newest">Sort · Newest</option>
                </select>
              </label>
            </div>
          </div>

          <ProductGrid products={data?.items ?? []} isLoading={q.isLoading} error={q.error as Error | null} />

          {data && (
            <nav
              className="ui-surface mt-8 flex items-center justify-between gap-4 px-4 py-3 sm:px-5"
              aria-label="Pagination"
            >
              <button
                type="button"
                className="ui-btn min-w-[5.5rem] motion-safe:transition motion-reduce:transition-none"
                disabled={req.page <= 1 || q.isFetching}
                onClick={() => setReq((r) => ({ ...r, page: Math.max(1, r.page - 1) }))}
              >
                Previous
              </button>
              <div className="text-sm font-medium tabular-nums text-zinc-600 dark:text-zinc-400">
                Page{' '}
                <span className="text-zinc-900 dark:text-white">{req.page}</span>
                <span className="mx-1 opacity-50">/</span>
                <span>{Math.max(1, Math.ceil(data.total / req.pageSize))}</span>
              </div>
              <button
                type="button"
                className="ui-btn min-w-[5.5rem] motion-safe:transition motion-reduce:transition-none"
                disabled={q.isFetching || req.page * req.pageSize >= data.total}
                onClick={() => setReq((r) => ({ ...r, page: r.page + 1 }))}
              >
                Next
              </button>
            </nav>
          )}
        </section>
      </div>
    </div>
  )
}
