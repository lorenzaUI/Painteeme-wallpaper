# Painteeme 免費手機桌布

純 HTML / CSS / JavaScript 網站，部署於 Cloudflare Pages。無需建置步驟，部署輸出目錄為專案根目錄。

## 桌布素材

- 十月：`assets/jpg/2026-10/banner.jpg` 與 `assets/jpg/2026-10/lockscreen.jpg`。
- 九月：保留原有 `assets/jpg/lockscreen.jpg` 與 `assets/jpg/homescreen.jpg`。
- 十月僅提供鎖定畫面，橫幅中的主畫面為搭配示意。

新增月份時，每個下載連結必須帶對應的 `data-month="YYYY-MM"` 與 `data-wallpaper="lockscreen"` 或 `homescreen`。勿只更換 JPG 而沿用舊月份。

## D1 下載按鈕事件

Pages Functions 的 `/api/download` 使用 D1 綁定 `DB`（資料庫 `painteeme-analytics`）。正式環境及需要測試的預覽環境應分別確認綁定。已存在的 `download_events` 欄位為 id、wallpaper、month、created_at、device_type、os、browser；本次不需要變更資料表。

點擊下載時，前端非同步傳送月份、桌布種類、裝置類型、OS 及瀏覽器。API 驗證後寫入 D1，created_at 由資料庫以 CURRENT_TIMESTAMP 自動填入 UTC。API 或網路錯誤不阻擋 JPG 下載；前端 Console 會顯示成功或失敗。

紀錄代表下載按鈕觸發次數，並非獨立人數或圖片成功存入相簿的次數。不新增姓名、Email、IP、裝置識別碼或原始 User-Agent 到 D1。長按儲存圖片無法可靠統計。

## 上線驗證

1. 預覽頁確認十月橫幅、單張鎖定畫面及月份導覽中的九月兩款圖片正常。
2. 確認下載取得 921 × 2048 的十月原始 JPG。
3. 在桌機及手機各點一次十月下載，Console 應出現 `[Painteeme download recorded]`。
4. 在 D1 執行 `docs/october-analytics.sql` 的第一個查詢，核對新增列的 month、wallpaper、裝置與台灣時間。
5. 測試完成後記下正式發布時間。正式統計必須排除發布前測試，查詢檔內有添加時間條件的說明。

本機靜態預覽可用 `python -m http.server 8000`，此方式不執行 Pages Functions，API 記錄失敗是預期結果。D1 實際寫入須於有綁定的 Pages 環境核對。

## 月份導覽

桌機（1024px 起）使用左側月份導覽，手機與平板置於內容上方。根網址預設顯示十月；`/#2026-09` 直接開啟九月，`/#2026-10` 開啟十月。九月原有 JPG 路徑保持不變。沒有 JavaScript 時兩月份皆顯示，月份連結以錨點導覽。

目前完成桌布區擴充；角色、商品型錄與完整品牌首頁尚未加入。
