# Painteeme Wallpaper — 第一版

這是一個純 HTML / CSS / JavaScript 的手機優先桌布下載頁，可直接放上 GitHub，再部署到 Cloudflare Pages。

## 你只需要先做一件事

把兩張原始 JPG 放進 `assets` 資料夾，並命名為：

- `lockscreen.jpg`
- `homescreen.jpg`

目前若沒有這兩張圖，網站會自動顯示示意 placeholder。

## 本機預覽

直接雙擊 `index.html` 即可看版面。
若瀏覽器限制下載屬性，可用 VS Code Live Server 或任一簡單 localhost 開啟。

## 下一步

1. 上傳整個資料夾到 GitHub repo
2. Cloudflare Pages 連接 GitHub
3. 將下載按鈕事件接到 Cloudflare Functions + D1
4. 再綁定 `wallpaper.painteeme.com` 或其他自訂網域

注意：iPhone 長按圖片儲存無法可靠記錄，因此統計建議以「下載原尺寸」按鈕點擊為準。
