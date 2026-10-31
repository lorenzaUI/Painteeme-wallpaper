-- 通路來源統計（QR code、IG 個人檔案連結…）
-- 用法：Cloudflare → Storage & Databases → D1 → painteeme-analytics → Console，一次貼一段執行。

-- ===== 第一次設定（只要執行一次） =====
-- ① 下載紀錄加上「來源」欄位
ALTER TABLE download_events ADD COLUMN source TEXT;

-- ② 建立掃碼／進站紀錄表
CREATE TABLE IF NOT EXISTS visit_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page TEXT NOT NULL,          -- wallpaper（桌布頁）或 ig（IG 轉址頁）
  source TEXT NOT NULL,        -- 例如 yulon（誠品新店裕隆城市集）、ig
  device_type TEXT,
  os TEXT,
  browser TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ===== 查詢 =====
-- ③ 各通路：掃碼人次（桌布頁／IG 分開）
SELECT source, page, COUNT(*) AS visits
FROM visit_events
GROUP BY source, page
ORDER BY visits DESC;

-- ④ 各通路：下載按鈕次數
SELECT COALESCE(source, '（無來源）') AS source, month, wallpaper, COUNT(*) AS downloads
FROM download_events
GROUP BY source, month, wallpaper
ORDER BY downloads DESC;

-- ⑤ 裕隆城：台灣時間每小時掃碼人次（看哪個時段人多）
SELECT strftime('%Y-%m-%d %H:00', created_at, '+8 hours') AS taiwan_hour, page, COUNT(*) AS visits
FROM visit_events
WHERE source = 'yulon'
GROUP BY taiwan_hour, page
ORDER BY taiwan_hour;
