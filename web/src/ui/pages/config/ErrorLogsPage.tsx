import { useQuery } from '@tanstack/react-query'
import { api } from '../../api'

type ErrorLogEntry = {
  id: string
  atUtc: string
  traceId: string
  method: string
  path: string
  message: string
  exceptionType: string
  stack?: string | null
}

async function getErrorLogs(limit: number, signal?: AbortSignal): Promise<ErrorLogEntry[]> {
  const { data } = await api.get<ErrorLogEntry[]>(`/api/admin/errors?limit=${limit}`, { signal })
  return data
}

export function ErrorLogsPage() {
  const limit = 50
  const q = useQuery({
    queryKey: ['error-logs', limit],
    queryFn: ({ signal }) => getErrorLogs(limit, signal),
    refetchInterval: 5000,
  })

  const logs = q.data ?? []

  return (
    <div className="space-y-6">
      <div className="ui-surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-base font-semibold tracking-tight text-zinc-900 dark:text-white">Last error logs</div>
          <div className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            Refreshes every 5s. Showing up to {limit} most recent errors.
          </div>
        </div>
        <button type="button" className="ui-btn shrink-0 font-semibold sm:min-w-[7rem]" onClick={() => q.refetch()}>
          Refresh
        </button>
      </div>

      {q.isLoading ? (
        <div className="ui-surface p-8 text-center text-sm text-zinc-500 dark:text-zinc-400">Loading…</div>
      ) : q.error ? (
        <div
          className="ui-surface border-red-200/90 bg-red-50/95 p-5 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-950/45 dark:text-red-200"
          role="alert"
        >
          {(q.error as Error).message}
        </div>
      ) : logs.length === 0 ? (
        <div className="ui-surface p-8 text-center text-sm text-zinc-500 dark:text-zinc-400">No errors captured yet.</div>
      ) : (
        <div className="space-y-4">
          {logs.map((l) => (
            <details
              key={l.id}
              className="group ui-surface motion-safe:transition open:shadow-lg open:shadow-zinc-900/[0.08] dark:open:shadow-black/50"
            >
              <summary className="cursor-pointer list-none p-4 outline-none marker:content-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500/45 dark:focus-visible:ring-violet-400/45 [&::-webkit-details-marker]:hidden">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                      {l.exceptionType}: {l.message}
                    </div>
                    <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {l.method} {l.path} · trace {l.traceId}
                    </div>
                  </div>
                  <div className="shrink-0 text-xs font-medium tabular-nums text-zinc-500 dark:text-zinc-400">
                    {new Date(l.atUtc).toLocaleString()}
                  </div>
                </div>
              </summary>

              {l.stack && (
                <pre className="mx-4 mb-4 max-h-80 overflow-auto rounded-xl border border-zinc-900/[0.06] bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-800 dark:border-white/[0.08] dark:bg-zinc-950 dark:text-zinc-200">
                  {l.stack}
                </pre>
              )}
            </details>
          ))}
        </div>
      )}
    </div>
  )
}
