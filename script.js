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

// 通路來源：QR code 或連結帶 ?utm_source=yulon（也接受 #2026-10?utm_source=ig 這種寫法）。
// 只留英數、底線、連字號，存在 sessionStorage，切換月份後下載仍記得來源。
function getSource() {
  const read = (query) => new URLSearchParams(query).get('utm_source') || '';
  let source = read(location.search) || read(location.hash.split('?')[1] || '');
  source = source.trim().toLowerCase();
  if (!/^[a-z0-9_-]{1,32}$/.test(source)) {
    source = '';
  }
  try {
    if (source) {
      sessionStorage.setItem('painteemeSource', source);
    } else {
      source = sessionStorage.getItem('painteemeSource') || '';
    }
  } catch {
    // 無痕模式等情況存不了，就只用網址上的來源
  }
  return source;
}

const pageSource = getSource();

// 帶來源進站時記一筆瀏覽（掃 QR code 的人次），不影響頁面顯示
if (pageSource && new URLSearchParams(location.search).has('utm_source')) {
  fetch('/api/visit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page: 'wallpaper', source: pageSource, ...getDeviceInfo() }),
    keepalive: true
  }).catch((error) => {
    console.warn('[Painteeme visit tracking failed]', error);
  });
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
        source: pageSource,
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
  const requestedMonth = location.hash.slice(1).split('?')[0];
  const month = ['2026-11', '2026-10', '2026-09'].includes(requestedMonth)
    ? requestedMonth : '2026-11';
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
