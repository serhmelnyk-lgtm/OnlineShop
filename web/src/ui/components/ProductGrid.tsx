import type { Product } from '../types'
import { ProductCard } from './ProductCard'

function SkeletonCard() {
  return (
    <div className="ui-surface overflow-hidden motion-safe:animate-pulse motion-reduce:animate-none">
      <div className="flex gap-4 p-4">
        <div className="h-[5.25rem] w-[5.25rem] shrink-0 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="flex flex-1 flex-col gap-2 pt-1">
          <div className="h-4 w-[85%] rounded-md bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-3 w-1/2 rounded-md bg-zinc-100 dark:bg-zinc-800/70" />
          <div className="mt-auto flex justify-between gap-2">
            <div className="h-6 w-16 rounded-md bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-20 rounded-md bg-zinc-100 dark:bg-zinc-800/70" />
          </div>
        </div>
      </div>
      <div className="border-t border-zinc-900/[0.05] px-4 py-3 dark:border-white/[0.06]">
        <div className="h-3 w-full rounded bg-zinc-100 dark:bg-zinc-800/70" />
        <div className="mt-2 h-3 w-4/5 rounded bg-zinc-100 dark:bg-zinc-800/70" />
      </div>
    </div>
  )
}

export function ProductGrid(props: { products: Product[]; isLoading: boolean; error: Error | null }) {
  if (props.error) {
    return (
      <div
        className="ui-surface border-red-200/80 bg-red-50/95 p-5 text-sm text-red-800 dark:border-red-500/25 dark:bg-red-950/40 dark:text-red-200"
        role="alert"
      >
        {props.error.message}
      </div>
    )
  }

  if (props.isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (props.products.length === 0) {
    return (
      <div className="ui-surface flex flex-col items-center justify-center gap-2 px-8 py-16 text-center">
        <div className="rounded-2xl bg-zinc-100 p-4 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path d="M3.3 7l8.7 5 8.7-5M12 22V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">No products matched</p>
        <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
          Try clearing filters or searching with different keywords.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {props.products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
