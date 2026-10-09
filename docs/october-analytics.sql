-- 十月下載按鈕事件；在 D1 Console 每次執行一個 SELECT。
-- 目前包含測試資料。正式發布後，在每個 WHERE 加入：
-- AND datetime(created_at) >= datetime('實際發布時間的 UTC，格式 YYYY-MM-DD HH:MM:SS')
-- 台灣時間減 8 小時即 UTC；不要把本檔製作時間當成正式發布時間。

-- ① 完整明細（UTC + 台灣時間）
SELECT id, wallpaper, month, device_type, os, browser,
       created_at AS utc_time,
       datetime(created_at, '+8 hours') AS taiwan_time
FROM download_events
WHERE month = '2026-10'
ORDER BY datetime(created_at) DESC, id DESC;

-- ② 各桌布 × 裝置
SELECT wallpaper, COALESCE(device_type, 'unknown') AS device_type,
       COUNT(*) AS button_clicks
FROM download_events
WHERE month = '2026-10'
GROUP BY wallpaper, COALESCE(device_type, 'unknown')
ORDER BY button_clicks DESC;

-- ③ 台灣時間每小時觸發量
SELECT strftime('%Y-%m-%d %H:00', created_at, '+8 hours') AS taiwan_hour,
       COUNT(*) AS button_clicks
FROM download_events
WHERE month = '2026-10'
GROUP BY taiwan_hour
ORDER BY taiwan_hour;
