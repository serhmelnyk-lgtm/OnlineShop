import type { Product } from '../types'

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating)
  return (
    <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-300">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>{i < full ? '★' : '☆'}</span>
      ))}
      <span className="ml-1 text-zinc-500 dark:text-zinc-400">{rating.toFixed(1)}</span>
    </div>
  )
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex gap-3 p-3">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-20 w-20 flex-none rounded-lg object-cover"
          loading="lazy"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold" dangerouslySetInnerHTML={{ __html: product.name }} />
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {product.brand} • {product.category}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="text-sm font-semibold">${product.price.toFixed(2)}</div>
            <Stars rating={product.rating} />
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-100 px-3 py-2 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
        <div className="line-clamp-2" dangerouslySetInnerHTML={{ __html: product.description }} />
        <div className="mt-2 flex flex-wrap gap-1">
          {product.specifications.slice(0, 3).map((s) => (
            <span
              key={`${s.key}:${s.value}`}
              className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 dark:border-zinc-800 dark:bg-zinc-950"
            >
              {s.key}: {s.value}
            </span>
          ))}
          <span className="ml-auto text-zinc-500 dark:text-zinc-400">
            {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
          </span>
        </div>
      </div>
    </div>
  )
}

