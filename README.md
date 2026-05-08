# OnlineShop (Electronics Store) — Elasticsearch Aggregations Demo

Educational full-stack demo showing **Elasticsearch search + aggregations** (faceted search) with:

- **Backend**: ASP.NET Core Web API (**.NET 9**) + EF Core + MS SQL
- **Search**: Elasticsearch (official .NET client) + Kibana
- **Frontend**: React + TypeScript + Vite + Tailwind + Recharts

## Quick start (Docker)

```bash
docker compose up --build
```

- **API (Swagger)**: `http://localhost:8080/swagger`
- **Web app**: `http://localhost:4173`
- **Elasticsearch**: `http://localhost:9200`
- **Kibana**: `http://localhost:5601`

On API startup, the app will:

- create the SQL schema (demo-friendly `EnsureCreated`)
- seed **200+ products**
- create the Elasticsearch index (mapping + analyzers)
- bulk index products into Elasticsearch

## What to try in the UI

- **Typo tolerance**: search for `iphnoe`, `laptpo`
- **Facets**: select Brand + Category + Price range together and watch counts update
- **Aggregations panel**: open the inspector to see the **raw query JSON** and **raw response JSON**
- **Agg mode toggle**: switch between `terms` and `composite` bucket strategies

## Aggregations demonstrated (backend)

The `/api/search` endpoint returns products plus:

- **terms/composite**: brands, categories
- **range**: predefined price buckets
- **histogram**: price distribution
- **date_histogram**: products added per month
- **stats**: min/max/avg/sum/count of price
- **cardinality**: unique brands
- **filters**: in stock / out of stock / discounted
- **nested**: review ratings distribution
- **nested + multi-level**: spec keys -> spec values
- **multi-level**: category -> brand -> avg price
- **pipeline**: cumulative sum and moving average on monthly “new products”

## Kibana notes

1. Open Kibana: `http://localhost:5601`
2. Create a data view for index: **`products`**
3. Go to **Discover** to explore documents.
4. Go to **Visualize/Lens** and recreate a few aggregations:
   - Top values: `brand`
   - Histogram: `price` (interval 100)
   - Date histogram: `createdAt` (monthly)
   - Nested (advanced): `reviews.rating` (nested path `reviews`)

## Dev (no Docker)

Backend:

```bash
dotnet run --project src/OnlineShop.Api/OnlineShop.Api.csproj
```

Frontend:

```bash
cd web
npm install
npm run dev
```

By default, `dotnet run` starts the API at `http://localhost:5272`, while Docker uses `http://localhost:8080`.

- For local dev (no Docker), the repo includes `web/.env.development` pointing to `http://localhost:5272`.
- If you change ports, set `VITE_API_BASE_URL` accordingly.

