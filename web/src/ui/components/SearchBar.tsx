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
      <input
        className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900"
        placeholder="Search products (try typos like “iphnoe”, “laptpo”)…"
        value={local}
        onChange={(e) => {
          const v = e.target.value
          setLocal(v)
          debounced(v)
        }}
      />
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 dark:text-zinc-400">
        {props.isLoading ? '…' : ''}
      </div>
    </div>
  )
}

