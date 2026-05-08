import { useMemo, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { searchProducts } from '../../api'
import { AggregationCharts } from '../../components/AggregationCharts'
import { ElasticsearchQueryPanel } from '../../components/ElasticsearchQueryPanel'
import { FilterSidebar } from '../../components/FilterSidebar'
import { SearchBar } from '../../components/SearchBar'
import { StatisticsSummary } from '../../components/StatisticsSummary'
import type { AggregationMode, ProductSort, SearchRequest, SearchResponse } from '../../types'

const defaultReq: SearchRequest = {
  query: '',
  page: 1,
  pageSize: 12,
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
  includeDebug: true,
  aggregationMode: 'Terms',
}

export function ElasticsearchAggregationsPage() {
  const [req, setReq] = useState<SearchRequest>(defaultReq)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableReq = useMemo(() => req, [JSON.stringify(req)])

  const q = useQuery<SearchResponse>({
    queryKey: ['config-aggs', stableReq],
    queryFn: ({ signal }) => searchProducts(stableReq, signal),
    placeholderData: keepPreviousData,
  })

  const data = q.data
  const setQuery = (query: string) => setReq((r) => ({ ...r, query, page: 1 }))
  const setSort = (sort: ProductSort) => setReq((r) => ({ ...r, sort, page: 1 }))
  const setAggregationMode = (aggregationMode: AggregationMode) =>
    setReq((r) => ({ ...r, aggregationMode, page: 1 }))

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <SearchBar value={req.query ?? ''} onChange={setQuery} isLoading={q.isFetching} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              value={req.sort}
              onChange={(e) => setSort(e.target.value as ProductSort)}
            >
              <option value="Relevance">Relevance</option>
              <option value="PriceAsc">Price ↑</option>
              <option value="PriceDesc">Price ↓</option>
              <option value="RatingDesc">Rating</option>
              <option value="Newest">Newest</option>
            </select>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Agg mode</span>
              <select
                className="rounded-md border border-zinc-200 bg-white px-2 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-950"
                value={req.aggregationMode}
                onChange={(e) => setAggregationMode(e.target.value as AggregationMode)}
              >
                <option value="Terms">terms</option>
                <option value="Composite">composite</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <aside className="col-span-12 lg:col-span-3">
          <FilterSidebar
            req={req}
            aggs={data?.aggregations}
            onChange={(patch) => setReq((r) => ({ ...r, ...patch, page: 1 }))}
            isLoading={q.isFetching}
          />
        </aside>

        <section className="col-span-12 lg:col-span-6 space-y-4">
          <StatisticsSummary aggs={data?.aggregations} debug={data?.debug ?? null} />
          <AggregationCharts aggs={data?.aggregations} />
        </section>

        <section className="col-span-12 min-w-0 lg:col-span-3">
          <ElasticsearchQueryPanel debug={data?.debug ?? null} />
        </section>
      </div>
    </div>
  )
}

