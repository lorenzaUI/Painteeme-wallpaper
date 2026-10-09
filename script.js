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
    const month = button.dataset.month;
    const deviceInfo = getDeviceInfo();

    console.info('[Painteeme download]', {
      wallpaper,
      month,
      ...deviceInfo,
      timestamp: new Date().toISOString()
    });

    // 不等待統計結果，避免 API 錯誤影響原本的圖片下載。
    fetch('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wallpaper,
        month,
        ...deviceInfo
      }),
      keepalive: true
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error(`Tracking API returned ${response.status}`);
      }
      const result = await response.json();
      if (result.success !== true) {
        throw new Error('Tracking API did not confirm the record');
      }
      console.info('[Painteeme download recorded]', { month, wallpaper });
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

// 可分享的月份入口；沒有 JavaScript 時仍可用錨點瀏覽兩個月份。
function showCollection() {
  const requestedMonth = location.hash.slice(1);
  const month = ['2026-10', '2026-09'].includes(requestedMonth)
    ? requestedMonth : '2026-10';
  document.querySelectorAll('[data-collection]').forEach((section) => {
    section.hidden = section.dataset.collection !== month;
  });
  document.querySelectorAll('[data-month-link]').forEach((link) => {
    if (link.dataset.monthLink === month) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}
window.addEventListener('hashchange', showCollection);
showCollection();
