export type ProductSort = 'Relevance' | 'PriceAsc' | 'PriceDesc' | 'RatingDesc' | 'Newest'

export type AggregationMode = 'Terms' | 'Composite'

export type SearchRequest = {
  query?: string | null
  page: number
  pageSize: number
  sort: ProductSort
  brands: string[]
  categories: string[]
  minPrice?: number | null
  maxPrice?: number | null
  minRating?: number | null
  inStockOnly?: boolean | null
  createdFrom?: string | null
  createdTo?: string | null
  specs: Record<string, string[]>
  includeDebug: boolean
  aggregationMode: AggregationMode
}

export type BucketCount = { key: string; count: number }
export type HistogramBucket = { key: number; count: number }
export type DateHistogramBucket = { date: string; count: number; value?: number | null }
export type RangeBucket = { key: string; from?: number | null; to?: number | null; count: number }

export type StatsSummary = { min: number; max: number; avg: number; sum: number; count: number }
export type FilterCounts = { inStock: number; outOfStock: number; discounted: number }

export type BrandAvgPrice = { brand: string; avgPrice: number }
export type CategoryBrandAvgPrice = { category: string; brands: BrandAvgPrice[] }

export type SearchAggregations = {
  brands: BucketCount[]
  categories: BucketCount[]
  priceRanges: RangeBucket[]
  priceHistogram: HistogramBucket[]
  productsPerMonth: DateHistogramBucket[]
  cumulativeNewProducts: DateHistogramBucket[]
  priceStats: StatsSummary
  uniqueBrands: number
  filters: FilterCounts
  ratingDistribution: BucketCount[]
  specKeys: BucketCount[]
  specValuesByKey: Record<string, BucketCount[]>
  categoryBrandAvgPrice: CategoryBrandAvgPrice[]
}

export type Product = {
  id: number
  name: string
  description: string
  brand: string
  category: string
  price: number
  rating: number
  stockQuantity: number
  createdAt: string
  imageUrl: string
  specifications: { key: string; value: string }[]
}

export type AggregationExplanation = {
  name: string
  type: string
  why: string
  expected: string
}

export type SearchDebugInfo = {
  elasticsearchQueryJson?: string | null
  elasticsearchResponseJson?: string | null
  tookMs: number
  returnedHits: number
  totalHits: number
  explanations: AggregationExplanation[]
}

export type SearchResponse = {
  items: Product[]
  total: number
  page: number
  pageSize: number
  aggregations: SearchAggregations
  debug?: SearchDebugInfo | null
}

