interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  return new Response(
    JSON.stringify({
      status: 'operational',
      erp: 'Adalaj Operations ERP',
      brand: 'ADALAJ — Made for Real Moments',
      version: '1.1.0',
      jurisdiction: 'Adalaj, Gujarat, India',
      edgePlatform: 'Cloudflare Pages & Workers Isolates',
      timestamp: new Date().toISOString(),
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    }
  );
};
