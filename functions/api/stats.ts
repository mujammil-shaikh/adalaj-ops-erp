interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    if (!context.env.DB) {
      return new Response(
        JSON.stringify({
          status: 'ok',
          d1Connected: false,
          message: 'D1 binding not attached or running in preview mode',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Query D1 table metadata
    const tablesQuery = await context.env.DB.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY name;"
    ).all();

    return new Response(
      JSON.stringify({
        status: 'ok',
        d1Connected: true,
        database: 'adalaj-erp-db',
        tables: tablesQuery.results?.map((r: any) => r.name) || [],
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        status: 'error',
        error: error.message || 'Failed to query database',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
