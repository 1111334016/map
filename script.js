document.addEventListener('DOMContentLoaded', async () => {
  const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzvZNkCy0Q-jhgo7yzgMCAjr8ap2ez4R8ZuxFJDYpGuN7Fzghc3ByrnrxAtG6eewnTSnw/exec';
  const MY_LIFF_ID = '2011288416-9QX9xXhz';

  let currentUserId = '';
  const schoolSelect = document.getElementById('school-select');
  const priceSelect = document.getElementById('price-select');
  const distanceSelect = document.getElementById('distance-select');
  const saveBtn = document.getElementById('save-btn');

  // 1. 增強版選單比對函式 (支援 台/臺 轉換、大小寫忽略與 Value/Text 雙向比對)
  function setSelectOption(selectElem, targetText) {
    if (!selectElem || !targetText) return;

    // 將字串統一轉為小寫並將「台」替換為「臺」進行寬鬆比對
    const normalize = (str) => String(str).trim().toLowerCase().replace(/台/g, '臺');
    const target = normalize(targetText);

    for (let i = 0; i < selectElem.options.length; i++) {
      const optText = normalize(selectElem.options[i].text);
      const optValue = normalize(selectElem.options[i].value);

      // 只要選項的顯示文字或 value 與目標值相符即命中
      if (optText === target || optValue === target) {
        selectElem.selectedIndex = i;
        return;
      }
    }
  }

  // 2. 向 GAS 查詢並自動回填歷史偏好
  async function loadUserProfile(userId) {
    try {
      const response = await fetch(`${GAS_WEB_APP_URL}?userId=${encodeURIComponent(userId)}`);
      if (!response.ok) throw new Error(`HTTP Status ${response.status}`);

      const resData = await response.json();

      if (resData.status === 'success' && resData.profile) {
        const { school, price, distance } = resData.profile;

        if (school) setSelectOption(schoolSelect, school);
        if (price) setSelectOption(priceSelect, price);
        if (distance) setSelectOption(distanceSelect, distance);
      }
    } catch (err) {
      console.error('讀取歷史偏好失敗:', err);
    }
  }

  // 3. LIFF 初始化與載入流程
  try {
    saveBtn.disabled = true;
    saveBtn.textContent = '載入偏好中...';

    await liff.init({ liffId: MY_LIFF_ID });

    if (!liff.isLoggedIn()) {
      liff.login();
      return;
    }

    const profile = await liff.getProfile();
    currentUserId = profile.userId.trim();

    // 取得 userId 後，向 GAS 讀取歷史偏好並自動選擇對應選項
    await loadUserProfile(currentUserId);

    saveBtn.disabled = false;
    saveBtn.textContent = '儲存設定';
  } catch (err) {
    console.error('LIFF 初始化失敗:', err);
    alert('身份驗證失敗，請重新開啟頁面');
    saveBtn.textContent = '驗證失敗';
  }

  // 4. 點擊儲存設定邏輯
  saveBtn.addEventListener('click', async () => {
    if (!currentUserId || !schoolSelect || !priceSelect || !distanceSelect) return;

    const rawSchool = schoolSelect.options[schoolSelect.selectedIndex]?.text || '';
    const rawPrice = priceSelect.options[priceSelect.selectedIndex]?.text || '';
    const rawDistance = distanceSelect.options[distanceSelect.selectedIndex]?.text || '';

    const payload = {
      action: 'save',
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
        if (liff.isInClient()) {
          liff.closeWindow();
        } else {
          saveBtn.disabled = false;
          saveBtn.textContent = '儲存設定';
        }
      } else {
        throw new Error(`回應碼 ${res.status}`);
      }
    } catch (e) {
      alert('❌ 儲存失敗：' + e.message);
      saveBtn.disabled = false;
      saveBtn.textContent = '儲存設定';
    }
  });
});
