import { useState } from 'react'
import type { SearchDebugInfo } from '../types'

function CopyJsonButton(props: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      aria-label={props.label}
      className="shrink-0 rounded-md border border-zinc-200 bg-white px-2 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void navigator.clipboard.writeText(props.text).then(() => {
          setCopied(true)
          window.setTimeout(() => setCopied(false), 1800)
        })
      }}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export function ElasticsearchQueryPanel(props: { debug: SearchDebugInfo | null }) {
  const d = props.debug
  if (!d) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        Query inspector will appear here.
      </div>
    )
  }

  const queryJson = d.elasticsearchQueryJson ?? ''
  const responseJson = d.elasticsearchResponseJson ?? ''

  return (
    <div className="min-w-0 max-w-full rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-2 text-sm font-semibold">Elasticsearch inspector</div>
      <div className="text-xs text-zinc-500 dark:text-zinc-400">
        Took: <span className="font-medium text-zinc-900 dark:text-zinc-100">{d.tookMs}ms</span> • Total hits:{' '}
        <span className="font-medium text-zinc-900 dark:text-zinc-100">{d.totalHits}</span>
      </div>

      <div className="mt-3 grid gap-3">
        <details className="min-w-0 max-w-full overflow-hidden rounded-lg border border-zinc-200 p-2 dark:border-zinc-800" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
            <span className="text-xs font-semibold">Generated query (JSON)</span>
            <CopyJsonButton text={queryJson} label="Copy generated query JSON" />
          </summary>
          <pre className="mt-2 max-h-56 min-w-0 max-w-full overflow-x-auto overflow-y-auto whitespace-pre-wrap break-all rounded bg-zinc-50 p-2 text-[11px] leading-snug dark:bg-zinc-950">
            {queryJson}
          </pre>
        </details>

        <details className="min-w-0 max-w-full overflow-hidden rounded-lg border border-zinc-200 p-2 dark:border-zinc-800">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
            <span className="text-xs font-semibold">Raw response (JSON)</span>
            <CopyJsonButton text={responseJson} label="Copy raw response JSON" />
          </summary>
          <pre className="mt-2 max-h-56 min-w-0 max-w-full overflow-x-auto overflow-y-auto whitespace-pre-wrap break-all rounded bg-zinc-50 p-2 text-[11px] leading-snug dark:bg-zinc-950">
            {responseJson}
          </pre>
        </details>

        <details className="rounded-lg border border-zinc-200 p-2 dark:border-zinc-800" open>
          <summary className="cursor-pointer text-xs font-semibold">Aggregation explanations</summary>
          <div className="mt-2 space-y-2 text-xs">
            {d.explanations.map((e) => (
              <div key={e.name} className="rounded-md border border-zinc-200 p-2 dark:border-zinc-800">
                <div className="font-semibold">
                  {e.name} <span className="text-zinc-500 dark:text-zinc-400">({e.type})</span>
                </div>
                <div className="mt-1 text-zinc-600 dark:text-zinc-300">{e.why}</div>
                <div className="mt-1 text-zinc-500 dark:text-zinc-400">Expected: {e.expected}</div>
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  )
}

