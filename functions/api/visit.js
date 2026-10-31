// 通路 QR code 的掃碼人次：/?utm_source=xxx 的桌布頁、/ig/?utm_source=xxx 的 IG 轉址頁都會呼叫這裡。
// 只存頁面、來源、裝置類型、OS、瀏覽器與時間（created_at 由資料庫自動填 UTC），不存 IP、User-Agent 或個資。
// 資料表 visit_events 由 docs/channel-analytics.sql 建立。
const ALLOWED_PAGES = new Set(['wallpaper', 'ig']);
const ALLOWED_DEVICE_TYPES = new Set(['mobile', 'tablet', 'desktop', 'unknown']);
const ALLOWED_OS = new Set(['iOS', 'Android', 'Windows', 'macOS', 'Linux', 'unknown']);
const ALLOWED_BROWSERS = new Set(['Safari', 'Chrome', 'Edge', 'Firefox', 'other']);
const SOURCE_PATTERN = /^[a-z0-9_-]{1,32}$/;
const INSERT_VISIT_EVENT =
  'INSERT INTO visit_events (page, source, device_type, os, browser) VALUES (?, ?, ?, ?, ?)';

function jsonResponse(body, status, additionalHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...additionalHeaders }
  });
}

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') {
    return jsonResponse({ success: false, error: 'Method not allowed' }, 405, { Allow: 'POST' });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON' }, 400);
  }

  const page = body?.page;
  const source = body?.source;
  const deviceType = ALLOWED_DEVICE_TYPES.has(body?.device_type) ? body.device_type : 'unknown';
  const os = ALLOWED_OS.has(body?.os) ? body.os : 'unknown';
  const browser = ALLOWED_BROWSERS.has(body?.browser) ? body.browser : 'other';

  if (!ALLOWED_PAGES.has(page) || typeof source !== 'string' || !SOURCE_PATTERN.test(source)) {
    return jsonResponse({ success: false, error: 'Invalid parameters' }, 400);
  }

  try {
    await env.DB.prepare(INSERT_VISIT_EVENT).bind(page, source, deviceType, os, browser).run();
    return jsonResponse({ success: true }, 200);
  } catch (error) {
    console.error('[Painteeme visit API]', error);
    return jsonResponse({ success: false, error: 'Database error' }, 500);
  }
}
