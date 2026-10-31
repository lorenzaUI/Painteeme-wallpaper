const ALLOWED_WALLPAPERS = new Set(['lockscreen', 'homescreen']);
const ALLOWED_DEVICE_TYPES = new Set([
  'mobile',
  'tablet',
  'desktop',
  'unknown'
]);
const ALLOWED_OS = new Set([
  'iOS',
  'Android',
  'Windows',
  'macOS',
  'Linux',
  'unknown'
]);
const ALLOWED_BROWSERS = new Set([
  'Safari',
  'Chrome',
  'Edge',
  'Firefox',
  'other'
]);
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const SOURCE_PATTERN = /^[a-z0-9_-]{1,32}$/;
const INSERT_DOWNLOAD_EVENT_WITH_SOURCE =
  'INSERT INTO download_events (wallpaper, month, device_type, os, browser, source) VALUES (?, ?, ?, ?, ?, ?)';
const INSERT_DOWNLOAD_EVENT =
  'INSERT INTO download_events (wallpaper, month, device_type, os, browser) VALUES (?, ?, ?, ?, ?)';

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
  const deviceType = body?.device_type;
  const os = body?.os;
  const browser = body?.browser;
  const rawSource = body?.source;
  const source = typeof rawSource === 'string' && SOURCE_PATTERN.test(rawSource) ? rawSource : null;

  if (
    !ALLOWED_WALLPAPERS.has(wallpaper) ||
    typeof month !== 'string' ||
    !MONTH_PATTERN.test(month) ||
    !ALLOWED_DEVICE_TYPES.has(deviceType) ||
    !ALLOWED_OS.has(os) ||
    !ALLOWED_BROWSERS.has(browser)
  ) {
    return jsonResponse({ success: false, error: 'Invalid parameters' }, 400);
  }

  try {
    try {
      await env.DB
        .prepare(INSERT_DOWNLOAD_EVENT_WITH_SOURCE)
        .bind(wallpaper, month, deviceType, os, browser, source)
        .run();
    } catch (error) {
      // 還沒執行 docs/channel-analytics.sql 加上 source 欄位時，照舊記錄（只是少了來源）
      if (!/no such column|has no column/i.test(String(error?.message))) {
        throw error;
      }
      await env.DB
        .prepare(INSERT_DOWNLOAD_EVENT)
        .bind(wallpaper, month, deviceType, os, browser)
        .run();
    }

    return jsonResponse({ success: true }, 200);
  } catch (error) {
    console.error('[Painteeme download API]', error);
    return jsonResponse({ success: false, error: 'Database error' }, 500);
  }
}
