document.addEventListener('DOMContentLoaded', async () => {
  const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbybPsM6jjhXRMFl0rZ8ntctPtqP1mJz2LXk8CufoQWO5lpjMHMiDjLT7n5DFnvwhjvVxQ/exec';
  const MY_LIFF_ID = '2011288416-9QX9xXhz'; // 請確認此 ID 與 LINE Developers 設定一致

  let currentUserId = '';
  const schoolSelect = document.getElementById('school-select');
  const priceSelect = document.getElementById('price-select');
  const distanceSelect = document.getElementById('distance-select');
  const saveBtn = document.getElementById('save-btn');

  // LIFF 初始化
  try {
    await liff.init({ liffId: MY_LIFF_ID });
    if (!liff.isLoggedIn()) {
      liff.login();
      return;
    }
    const profile = await liff.getProfile();
    currentUserId = profile.userId.trim();
    saveBtn.disabled = false;
    saveBtn.textContent = '儲存設定';
  } catch (err) {
    console.error('LIFF 初始化失敗:', err);
    alert('身份驗證失敗，請重新開啟頁面');
  }

  // 儲存邏輯
  saveBtn.addEventListener('click', async () => {
    if (!currentUserId) return;

    const rawSchool = schoolSelect.options[schoolSelect.selectedIndex].text;
    const rawPrice = priceSelect.options[priceSelect.selectedIndex].text;
    const rawDistance = distanceSelect.options[distanceSelect.selectedIndex].text;

    const payload = {
      userId: currentUserId,
      school: schoolSelect.value.startsWith('choice') ? '不限' : rawSchool.trim(),
      price: priceSelect.value.startsWith('choice') ? '不限' : rawPrice.trim(),
      distance: distanceSelect.value.startsWith('choice') ? '不限' : rawDistance.trim()
    };

    saveBtn.disabled = true;
    saveBtn.textContent = '儲存中...';

    try {
      const res = await fetch(GAS_WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('✅ 設定已成功更新！');
        if (liff.isInClient()) liff.closeWindow();
      }
    } catch (e) {
      alert('❌ 儲存失敗：' + e.message);
      saveBtn.disabled = false;
    }
  });
});