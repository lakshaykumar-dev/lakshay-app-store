// Lakshay App Store - Client Script
document.addEventListener('DOMContentLoaded', () => {
  const GITHUB_REPO = 'lakshaykumar-dev/couple-reminder-app';
  const FALLBACK_DOWNLOAD = `https://github.com/${GITHUB_REPO}/releases/latest/download/CoupleReminder-release.apk`;
  
  const versionTag = document.getElementById('cr-version');
  const sizeTag = document.getElementById('cr-size');
  const downloadBtn = document.getElementById('directDownloadBtn');
  const btnVersionText = document.getElementById('btn-version-text');
  const qrToggleBtn = document.getElementById('qrToggleBtn');
  const qrContainer = document.getElementById('qrContainer');
  const qrImage = document.getElementById('qrImage');
  const searchInput = document.getElementById('searchInput');
  const categoryChips = document.querySelectorAll('.chip');

  let activeDownloadUrl = FALLBACK_DOWNLOAD;

  // 1. Fetch Latest Release Details directly from GitHub API
  async function fetchLatestRelease() {
    try {
      const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
      if (!response.ok) throw new Error('Network response not ok');
      const data = await response.json();

      const tagName = data.tag_name || 'v1.4.0';
      if (versionTag) versionTag.textContent = tagName;

      // Find APK asset
      let apkAsset = null;
      if (data.assets && data.assets.length > 0) {
        apkAsset = data.assets.find(a => a.name.endsWith('.apk') && a.name.includes('release')) ||
                   data.assets.find(a => a.name.endsWith('.apk'));
      }

      if (apkAsset) {
        activeDownloadUrl = apkAsset.browser_download_url;
        downloadBtn.href = activeDownloadUrl;

        // Size in MB
        const sizeMb = (apkAsset.size / (1024 * 1024)).toFixed(1);
        if (sizeTag) sizeTag.textContent = `${sizeMb} MB`;
        if (btnVersionText) btnVersionText.textContent = `Latest ${tagName} • ${sizeMb} MB`;
      } else {
        downloadBtn.href = `https://github.com/${GITHUB_REPO}/releases/latest/download/CoupleReminder-release.apk`;
        if (btnVersionText) btnVersionText.textContent = `Latest ${tagName} • Direct`;
      }
    } catch (err) {
      console.warn('Using fallback release info:', err);
      // Keep static defaults
    }
  }

  fetchLatestRelease();

  // 2. QR Code Generator & Modal Toggle
  if (qrToggleBtn && qrContainer && qrImage) {
    qrToggleBtn.addEventListener('click', () => {
      const isVisible = qrContainer.style.display === 'block';
      if (!isVisible) {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(activeDownloadUrl)}`;
        qrImage.src = qrUrl;
        qrContainer.style.display = 'block';
        qrToggleBtn.textContent = '✕ Close QR';
      } else {
        qrContainer.style.display = 'none';
        qrToggleBtn.textContent = '📱 Scan QR';
      }
    });
  }

  // 3. Category Filter Chips
  categoryChips.forEach(chip => {
    chip.addEventListener('click', () => {
      categoryChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const category = chip.getAttribute('data-category');
      const coupleCard = document.getElementById('couple-reminder-card');
      const moreApps = document.querySelectorAll('.mini-app-card');

      if (category === 'all' || category === 'lifestyle') {
        if (coupleCard) coupleCard.style.display = 'block';
      } else {
        if (coupleCard) coupleCard.style.display = 'none';
      }

      moreApps.forEach(app => {
        if (category === 'all') {
          app.style.display = 'flex';
        } else if (category === 'productivity' && app.textContent.includes('Expense')) {
          app.style.display = 'flex';
        } else if (category === 'utilities' && app.textContent.includes('Health')) {
          app.style.display = 'flex';
        } else {
          app.style.display = 'none';
        }
      });
    });
  });

  // 4. Search Filter
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const coupleCard = document.getElementById('couple-reminder-card');
      const moreApps = document.querySelectorAll('.mini-app-card');

      if (coupleCard) {
        const text = coupleCard.textContent.toLowerCase();
        coupleCard.style.display = text.includes(q) ? 'block' : 'none';
      }

      moreApps.forEach(app => {
        const text = app.textContent.toLowerCase();
        app.style.display = text.includes(q) ? 'flex' : 'none';
      });
    });
  }
});
