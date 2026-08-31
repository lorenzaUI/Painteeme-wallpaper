document.querySelectorAll('[data-wallpaper]').forEach((button) => {
  button.addEventListener('click', () => {
    const wallpaper = button.dataset.wallpaper;

    // 第一版先在瀏覽器 Console 留下下載事件。
    // 部署到 Cloudflare 後，可以把這裡改成呼叫 /api/download，
    // 將 wallpaper、時間等資料寫入 D1。
    console.info('[Painteeme download]', {
      wallpaper,
      timestamp: new Date().toISOString()
    });

    // 如果未來有 Cloudflare Functions，可取消下列註解：
    // fetch('/api/download', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ wallpaper })
    // }).catch(() => {});
  });
});
