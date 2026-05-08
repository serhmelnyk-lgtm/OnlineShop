import { useEffect, useMemo, useState } from 'react'

export function SearchBar(props: { value: string; onChange: (v: string) => void; isLoading: boolean }) {
  const [local, setLocal] = useState(props.value)

  useEffect(() => setLocal(props.value), [props.value])

  const debounced = useMemo(() => {
    let t: number | undefined
    return (v: string) => {
      if (t) window.clearTimeout(t)
      t = window.setTimeout(() => props.onChange(v), 250)
    }
  }, [props])

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 z-[1] -translate-y-1/2 text-zinc-400 dark:text-zinc-500">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M11 19a8 8 0 100-16 8 8 0 000 16zm10 2l-4.35-4.35"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <input
        className="ui-input motion-safe:transition motion-reduce:transition-none w-full pl-11 pr-11 py-2.5 text-[15px] leading-snug text-zinc-900 dark:text-zinc-100"
        placeholder="Search products (try typos like “iphnoe”, “laptpo”)…"
        value={local}
        aria-busy={props.isLoading}
        onChange={(e) => {
          const v = e.target.value
          setLocal(v)
          debounced(v)
        }}
      />
      <div
        className="pointer-events-none absolute right-3.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-violet-600 dark:text-violet-400"
        aria-live="polite"
      >
        {props.isLoading ? (
          <span className="relative flex h-4 w-4">
            <span className="absolute inset-0 animate-spin rounded-full border-2 border-solid border-zinc-200 border-t-violet-600 dark:border-zinc-700 dark:border-t-violet-400" />
          </span>
        ) : null}
      </div>
    </div>
  )
}
