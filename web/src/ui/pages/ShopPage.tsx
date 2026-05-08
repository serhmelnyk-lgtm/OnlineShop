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
    <div className="mx-auto grid max-w-7xl grid-cols-12 gap-4 px-4 py-6">
      <aside className="col-span-12 md:col-span-3">
        <FilterSidebar
          req={req}
          aggs={data?.aggregations}
          onChange={(patch) => setReq((r) => ({ ...r, ...patch, page: 1 }))}
          isLoading={q.isFetching}
        />
      </aside>

      <section className="col-span-12 md:col-span-9">
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <SearchBar value={req.query ?? ''} onChange={setQuery} isLoading={q.isFetching} />
          </div>
          <div className="flex items-center justify-between gap-3 md:justify-end">
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              {data ? (
                <>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{data.total}</span> items
                </>
              ) : (
                '—'
              )}
            </div>
            <select
              className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              value={req.sort}
              onChange={(e) => setSort(e.target.value as ProductSort)}
            >
              <option value="Relevance">Sort: Relevance</option>
              <option value="PriceAsc">Sort: Price ↑</option>
              <option value="PriceDesc">Sort: Price ↓</option>
              <option value="RatingDesc">Sort: Rating</option>
              <option value="Newest">Sort: Newest</option>
            </select>
          </div>
        </div>

        <ProductGrid products={data?.items ?? []} isLoading={q.isLoading} error={q.error as Error | null} />

        {data && (
          <div className="mt-5 flex items-center justify-between">
            <button
              className="rounded-md border border-zinc-200 px-3 py-2 text-sm disabled:opacity-50 dark:border-zinc-800"
              disabled={req.page <= 1 || q.isFetching}
              onClick={() => setReq((r) => ({ ...r, page: Math.max(1, r.page - 1) }))}
            >
              Prev
            </button>
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              Page <span className="font-medium text-zinc-900 dark:text-zinc-100">{req.page}</span>
            </div>
            <button
              className="rounded-md border border-zinc-200 px-3 py-2 text-sm disabled:opacity-50 dark:border-zinc-800"
              disabled={q.isFetching || req.page * req.pageSize >= data.total}
              onClick={() => setReq((r) => ({ ...r, page: r.page + 1 }))}
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

