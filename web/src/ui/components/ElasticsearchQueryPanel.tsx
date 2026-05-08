import { useState } from 'react'
import type { SearchDebugInfo } from '../types'

function CopyJsonButton(props: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      aria-label={props.label}
      className="ui-btn shrink-0 px-2.5 py-1 text-[11px] font-semibold motion-safe:transition motion-reduce:transition-none"
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

const detailsShell =
  'min-w-0 max-w-full overflow-hidden rounded-xl border border-zinc-900/[0.07] bg-zinc-900/[0.02] p-3 dark:border-white/[0.09] dark:bg-white/[0.03]'

export function ElasticsearchQueryPanel(props: { debug: SearchDebugInfo | null }) {
  const d = props.debug
  if (!d) {
    return (
      <div className="ui-surface p-5 text-sm text-zinc-500 dark:text-zinc-400">Query inspector will appear here.</div>
    )
  }

  const queryJson = d.elasticsearchQueryJson ?? ''
  const responseJson = d.elasticsearchResponseJson ?? ''

  return (
    <div className="ui-surface min-w-0 max-w-full p-5 lg:sticky lg:top-24 lg:self-start">
      <div className="mb-1 text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">Elasticsearch inspector</div>
      <div className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
        Took{' '}
        <span className="font-semibold tabular-nums text-zinc-900 dark:text-white">{d.tookMs}ms</span>
        <span className="mx-1.5 text-zinc-300 dark:text-zinc-600">·</span>
        Total hits{' '}
        <span className="font-semibold tabular-nums text-zinc-900 dark:text-white">{d.totalHits}</span>
      </div>

      <div className="mt-4 grid gap-3">
        <details className={detailsShell} open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">Generated query (JSON)</span>
            <CopyJsonButton text={queryJson} label="Copy generated query JSON" />
          </summary>
          <pre className="mt-3 max-h-56 min-w-0 max-w-full overflow-x-auto overflow-y-auto whitespace-pre-wrap break-all rounded-lg border border-zinc-900/[0.06] bg-zinc-50 p-3 text-[11px] leading-snug text-zinc-800 dark:border-white/[0.08] dark:bg-zinc-950 dark:text-zinc-200">
            {queryJson}
          </pre>
        </details>

        <details className={detailsShell}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">Raw response (JSON)</span>
            <CopyJsonButton text={responseJson} label="Copy raw response JSON" />
          </summary>
          <pre className="mt-3 max-h-56 min-w-0 max-w-full overflow-x-auto overflow-y-auto whitespace-pre-wrap break-all rounded-lg border border-zinc-900/[0.06] bg-zinc-50 p-3 text-[11px] leading-snug text-zinc-800 dark:border-white/[0.08] dark:bg-zinc-950 dark:text-zinc-200">
            {responseJson}
          </pre>
        </details>

        <details className={detailsShell} open>
          <summary className="cursor-pointer text-xs font-semibold text-zinc-800 dark:text-zinc-100">
            Aggregation explanations
          </summary>
          <div className="mt-3 space-y-2 text-xs">
            {d.explanations.map((e) => (
              <div
                key={e.name}
                className="rounded-xl border border-zinc-900/[0.06] bg-white px-3 py-2 dark:border-white/[0.08] dark:bg-zinc-950/40"
              >
                <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {e.name} <span className="font-normal text-zinc-500 dark:text-zinc-400">({e.type})</span>
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
