const DOWNLOAD_MONTH = '2026-09';

function getDeviceInfo() {
  const userAgent = navigator.userAgent || '';
  const platform = navigator.userAgentData?.platform || navigator.platform || '';
  const maxTouchPoints = navigator.maxTouchPoints || 0;
  const isIPadOS = /Mac/i.test(platform) && maxTouchPoints > 1;

  let deviceType = 'unknown';

  if (
    isIPadOS ||
    /iPad|Tablet|PlayBook|Silk/i.test(userAgent) ||
    (/Android/i.test(userAgent) && !/Mobile/i.test(userAgent))
  ) {
    deviceType = 'tablet';
  } else if (
    navigator.userAgentData?.mobile === true ||
    /Mobi|iPhone|iPod|Android/i.test(userAgent)
  ) {
    deviceType = 'mobile';
  } else if (userAgent || platform) {
    deviceType = 'desktop';
  }

  let os = 'unknown';

  if (isIPadOS || /iPhone|iPad|iPod/i.test(userAgent)) {
    os = 'iOS';
  } else if (/Android/i.test(userAgent)) {
    os = 'Android';
  } else if (/Windows/i.test(userAgent) || /Win/i.test(platform)) {
    os = 'Windows';
  } else if (/Macintosh|Mac OS X/i.test(userAgent) || /Mac/i.test(platform)) {
    os = 'macOS';
  } else if (/Linux/i.test(userAgent) || /Linux/i.test(platform)) {
    os = 'Linux';
  }

  let browser = 'other';

  if (/EdgA|EdgiOS|Edg\//i.test(userAgent)) {
    browser = 'Edge';
  } else if (/FxiOS|Firefox\//i.test(userAgent)) {
    browser = 'Firefox';
  } else if (/OPR\/|Opera|SamsungBrowser|Vivaldi/i.test(userAgent)) {
    browser = 'other';
  } else if (/CriOS|Chromium|Chrome\//i.test(userAgent)) {
    browser = 'Chrome';
  } else if (/Safari\//i.test(userAgent)) {
    browser = 'Safari';
  }

  return {
    device_type: deviceType,
    os,
    browser
  };
}

document.querySelectorAll('[data-wallpaper]').forEach((button) => {
  button.addEventListener('click', () => {
    const wallpaper = button.dataset.wallpaper;
    const deviceInfo = getDeviceInfo();

    console.info('[Painteeme download]', {
      wallpaper,
      month: DOWNLOAD_MONTH,
      ...deviceInfo,
      timestamp: new Date().toISOString()
    });

    // 不等待統計結果，避免 API 錯誤影響原本的圖片下載。
    fetch('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wallpaper,
        month: DOWNLOAD_MONTH,
        ...deviceInfo
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
