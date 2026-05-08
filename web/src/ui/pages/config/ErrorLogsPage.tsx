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
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Last error logs</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Refreshes every 5s. Showing up to {limit} most recent errors.
            </div>
          </div>
          <button
            className="rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
            onClick={() => q.refetch()}
          >
            Refresh
          </button>
        </div>
      </div>

      {q.isLoading ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          Loading…
        </div>
      ) : q.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
          {(q.error as Error).message}
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          No errors captured yet.
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((l) => (
            <details
              key={l.id}
              className="group rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <summary className="cursor-pointer list-none">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">
                      {l.exceptionType}: {l.message}
                    </div>
                    <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {l.method} {l.path} • trace {l.traceId}
                    </div>
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">{new Date(l.atUtc).toLocaleString()}</div>
                </div>
              </summary>

              {l.stack && (
                <pre className="mt-3 overflow-auto rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
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

