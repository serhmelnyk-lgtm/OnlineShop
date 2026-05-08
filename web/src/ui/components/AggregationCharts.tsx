import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { SearchAggregations } from '../types'

/** Distinct fills for category pie slices (cycles if there are more than six buckets). */
const CATEGORY_SLICE_COLORS = ['#6366f1', '#22c55e', '#f97316', '#ec4899', '#06b6d4', '#eab308']

export function AggregationCharts(props: { aggs?: SearchAggregations }) {
  const aggs = props.aggs
  if (!aggs) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        Aggregations will appear here.
      </div>
    )
  }

  const categoryData = aggs.categories.slice(0, 6).map((b) => ({ name: b.key, value: b.count }))
  const brandData = aggs.brands.slice(0, 8).map((b) => ({ name: b.key, value: b.count }))
  const priceHist = aggs.priceHistogram.slice(0, 20).map((b) => ({ price: b.key, count: b.count }))
  const perMonth = aggs.productsPerMonth.map((b) => ({ date: b.date.slice(0, 7), count: b.count }))

  return (
    <div className="space-y-4">
      <Panel title="Products per category (terms)">
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={60}>
                {categoryData.map((entry, i) => (
                  <Cell key={entry.name} fill={CATEGORY_SLICE_COLORS[i % CATEGORY_SLICE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Products per brand (terms/composite)">
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={brandData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" hide />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Price histogram (histogram)">
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priceHist}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="price" tickFormatter={(v) => `$${v}`} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Products added per month (date_histogram)">
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={perMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  )
}

function Panel(props: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-2 text-sm font-semibold">{props.title}</div>
      {props.children}
    </div>
  )
}

