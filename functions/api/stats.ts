interface Env {
  DB: D1Database;
}

// In-memory cache for table names to eliminate repeated D1 queries (0 row reads on subsequent edge requests)
let cachedTables: string[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 3600 * 1000; // 1 hour edge in-memory TTL

const STATIC_ENTERPRISE_TABLES = [
  'accounts',
  'bills',
  'campaigns',
  'employees',
  'entities_config',
  'export_shipments',
  'inter_entity_settlements',
  'inter_entity_stock_allocations',
  'inter_firm_transfer_items',
  'inter_firm_transfers',
  'items',
  'licence_events',
  'licences',
  'loans',
  'machines',
  'marketplace_settlements',
  'outbox_events',
  'packing_batches',
  'parties',
  'po_items',
  'po_part_payments',
  'purchase_orders',
  'recipes',
  'sister_downstream_invoice_items',
  'sister_downstream_invoices',
  'stock_lots',
  'stock_movements',
  'transactions',
];

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const now = Date.now();

  // 1. If in-memory cache is fresh, return immediately without touching D1 (0 row reads)
  if (cachedTables && now - lastCacheTime < CACHE_TTL_MS) {
    return new Response(
      JSON.stringify({
        status: 'ok',
        d1Connected: true,
        source: 'edge_memory_cache',
        database: 'adalaj-erp-db',
        tables: cachedTables,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
        },
      }
    );
  }

  // 2. If D1 binding is not attached or in preview
  if (!context.env.DB) {
    return new Response(
      JSON.stringify({
        status: 'ok',
        d1Connected: false,
        source: 'static_schema',
        message: 'D1 binding not attached or running in preview mode',
        tables: STATIC_ENTERPRISE_TABLES,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        },
      }
    );
  }

  // 3. Attempt query with try/catch fallback so quota limits never crash the app
  try {
    const tablesQuery = await context.env.DB.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY name;"
    ).all();

    cachedTables = tablesQuery.results?.map((r: any) => r.name) || STATIC_ENTERPRISE_TABLES;
    lastCacheTime = now;

    return new Response(
      JSON.stringify({
        status: 'ok',
        d1Connected: true,
        source: 'd1_query',
        database: 'adalaj-erp-db',
        tables: cachedTables,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
        },
      }
    );
  } catch (error: any) {
    // Graceful degradation: If account D1 row read limit was exceeded by another service,
    // do not throw 500. Return static schema with resilient status.
    return new Response(
      JSON.stringify({
        status: 'ok',
        d1Connected: false,
        d1Status: 'quota_resilient_fallback',
        warning: 'Cloudflare account D1 quota limit reached or database unavailable; falling back to resilient static schema.',
        database: 'adalaj-erp-db',
        tables: STATIC_ENTERPRISE_TABLES,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        },
      }
    );
  }
};
