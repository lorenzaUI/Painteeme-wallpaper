const DOWNLOAD_MONTH = '2026-09';

document.querySelectorAll('[data-wallpaper]').forEach((button) => {
  button.addEventListener('click', () => {
    const wallpaper = button.dataset.wallpaper;

    console.info('[Painteeme download]', {
      wallpaper,
      month: DOWNLOAD_MONTH,
      timestamp: new Date().toISOString()
    });

    // 不等待統計結果，避免 API 錯誤影響原本的圖片下載。
    fetch('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wallpaper,
        month: DOWNLOAD_MONTH
      }),
      keepalive: true
    }).catch((error) => {
      console.warn('[Painteeme download tracking failed]', error);
    });
  });
});


document.querySelectorAll('.preview').forEach((image) => {
  image.addEventListener('contextmenu', (event) => {
    event.preventDefault();
  });

  image.addEventListener('dragstart', (event) => {
    event.preventDefault();
  });
});
