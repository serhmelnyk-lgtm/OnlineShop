import type { Product } from '../types'

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating)
  return (
    <div className="flex items-center gap-0.5 text-xs text-amber-600 dark:text-amber-400">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="tabular-nums">
          {i < full ? '★' : '☆'}
        </span>
      ))}
      <span className="ml-1 tabular-nums text-zinc-500 dark:text-zinc-400">{rating.toFixed(1)}</span>
    </div>
  )
}

export function ProductCard({ product }: { product: Product }) {
  const inStock = product.stockQuantity > 0

  return (
    <article className="group ui-surface overflow-hidden motion-safe:transition motion-safe:duration-300 motion-safe:ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[0_12px_36px_-12px_rgb(15_23_42_/_0.18)] dark:motion-safe:hover:shadow-[0_14px_40px_-10px_rgb(0_0_0_/_0.55)] motion-reduce:transition-none">
      <div className="relative flex gap-4 p-4">
        <div className="relative h-[5.25rem] w-[5.25rem] shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200/80 ring-1 ring-zinc-900/[0.05] dark:from-zinc-800 dark:to-zinc-900 dark:ring-white/[0.06]">
          <img
            src={product.imageUrl}
            alt=""
            className="h-full w-full object-cover motion-safe:transition motion-safe:duration-500 motion-safe:group-hover:scale-[1.04] motion-reduce:transition-none"
            loading="lazy"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3
            className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-zinc-900 dark:text-white"
            dangerouslySetInnerHTML={{ __html: product.name }}
          />
          <div className="mt-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {product.brand}
            <span className="mx-1.5 text-zinc-300 dark:text-zinc-600">·</span>
            {product.category}
          </div>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-2">
            <div className="text-lg font-semibold tracking-tight text-zinc-900 tabular-nums dark:text-white">
              ${product.price.toFixed(2)}
            </div>
            <Stars rating={product.rating} />
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-900/[0.06] bg-zinc-50/90 px-4 py-3 text-xs leading-relaxed text-zinc-600 dark:border-white/[0.07] dark:bg-zinc-950/40 dark:text-zinc-300">
        <div className="line-clamp-2" dangerouslySetInnerHTML={{ __html: product.description }} />
        <div className="mt-3 flex flex-wrap items-center gap-1.5 gap-y-2">
          {product.specifications.slice(0, 3).map((s) => (
            <span
              key={`${s.key}:${s.value}`}
              className="rounded-lg border border-zinc-900/[0.06] bg-white px-2 py-1 text-[11px] font-medium text-zinc-700 shadow-sm dark:border-white/[0.08] dark:bg-zinc-900 dark:text-zinc-200"
            >
              {s.key}: {s.value}
            </span>
          ))}
          <span
            className={
              'ml-auto shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ' +
              (inStock
                ? 'bg-emerald-500/12 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300'
                : 'bg-red-500/10 text-red-800 dark:bg-red-400/15 dark:text-red-300')
            }
          >
            {inStock ? `${product.stockQuantity} in stock` : 'Out of stock'}
          </span>
        </div>
      </div>
    </article>
  )
}
