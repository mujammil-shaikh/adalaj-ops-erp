interface Env {
  DB?: D1Database;
  RATE_LIMIT_KV?: KVNamespace;
}

const STATIC_TABLE_FALLBACK = [
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
  'transactions'
];

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const cacheKey = 'adalaj_erp_d1_stats_cache_v1';
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
  };

  // 1. Check Edge KV cache to eliminate 99.9%+ of D1 queries
  if (context.env.RATE_LIMIT_KV) {
    try {
      const cached = await context.env.RATE_LIMIT_KV.get(cacheKey);
      if (cached) {
        return new Response(cached, {
          headers: {
            ...headers,
            'X-Cache': 'HIT-KV',
          },
        });
      }
    } catch {}
  }

  // 2. If D1 is not bound
  if (!context.env.DB) {
    return new Response(
      JSON.stringify({
        status: 'ok',
        d1Connected: false,
        message: 'D1 binding not attached or running in local offline mode',
        tables: STATIC_TABLE_FALLBACK,
      }),
      { headers }
    );
  }

  // 3. Query D1 table metadata safely with quota protection
  try {
    const tablesQuery = await context.env.DB.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY name;"
    ).all();

    const tableNames = tablesQuery.results?.map((r: any) => r.name) || STATIC_TABLE_FALLBACK;
    const payload = JSON.stringify({
      status: 'ok',
      d1Connected: true,
      database: 'adalaj-erp-db',
      tables: tableNames,
      timestamp: new Date().toISOString(),
    });

    // Cache in KV for 24 hours so D1 is queried at most once a day
    if (context.env.RATE_LIMIT_KV) {
      try {
        await context.env.RATE_LIMIT_KV.put(cacheKey, payload, { expirationTtl: 86400 });
      } catch {}
    }

    return new Response(payload, {
      headers: {
        ...headers,
        'X-Cache': 'MISS-D1',
      },
    });
  } catch (error: any) {
    // Graceful fallback if Cloudflare D1 daily quota is exceeded (code 7500)
    const isQuotaError = error?.message?.includes('daily row read limit') || error?.message?.includes('7500');
    return new Response(
      JSON.stringify({
        status: 'ok',
        d1Connected: !isQuotaError,
        database: 'adalaj-erp-db',
        tables: STATIC_TABLE_FALLBACK,
        quotaLimited: isQuotaError,
        warning: isQuotaError ? 'D1 read quota limited; serving static schema fallback' : error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          ...headers,
          'X-Cache': 'FALLBACK',
        },
      }
    );
  }
};
