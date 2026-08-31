const ALLOWED_WALLPAPERS = new Set(['lockscreen', 'homescreen']);

function jsonResponse(body, status, additionalHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...additionalHeaders
    }
  });
}

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') {
    return jsonResponse(
      { success: false, error: 'Method not allowed' },
      405,
      { Allow: 'POST' }
    );
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON' }, 400);
  }

  const wallpaper = body?.wallpaper;
  const month = body?.month;

  if (
    !ALLOWED_WALLPAPERS.has(wallpaper) ||
    typeof month !== 'string' ||
    month.trim() === ''
  ) {
    return jsonResponse({ success: false, error: 'Invalid parameters' }, 400);
  }

  try {
    await env.DB
      .prepare(
        'INSERT INTO download_events (wallpaper, month) VALUES (?, ?)'
      )
      .bind(wallpaper, month)
      .run();

    return jsonResponse({ success: true }, 200);
  } catch (error) {
    console.error('[Painteeme download API]', error);
    return jsonResponse({ success: false, error: 'Database error' }, 500);
  }
}
