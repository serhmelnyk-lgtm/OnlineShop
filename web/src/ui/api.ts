import axios from 'axios'
import type { SearchRequest, SearchResponse } from './types'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
})

export async function searchProducts(req: SearchRequest, signal?: AbortSignal): Promise<SearchResponse> {
  const { data } = await api.post<SearchResponse>('/api/search', req, { signal })
  return data
}

