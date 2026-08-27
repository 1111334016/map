document.addEventListener('DOMContentLoaded', async () => {
    // 📌 GAS Web App URL
    const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbybPsM6jjhXRMFl0rZ8ntctPtqP1mJz2LXk8CufoQWO5lpjMHMiDjLT7n5DFnvwhjvVxQ/exec';
    
    // 📌 LIFF ID
    const MY_LIFF_ID = '2011288416-9QX9xXhz'; 

    let currentUserId = ''; // 儲存 LINE User ID

    const schoolSelect = document.getElementById('school-select');
    const priceSelect = document.getElementById('price-select');
    const distanceSelect = document.getElementById('distance-select');
    const saveBtn = document.getElementById('save-btn');
    const selects = [schoolSelect, priceSelect, distanceSelect];

    // 0. 初始化 LIFF SDK 並取得 UserID
    async function initLiff() {
        // LIFF 載入中先禁用按鈕
        saveBtn.disabled = true;
        saveBtn.textContent = '載入使用者資訊中...';

        try {
            if (!MY_LIFF_ID || MY_LIFF_ID === 'YOUR_LIFF_ID') {
                console.warn('⚠️ 請務必填入真實的 MY_LIFF_ID');
                alert('⚠️ LIFF ID 設定錯誤，請聯繫管理員！');
                return;
            }

            await liff.init({ liffId: MY_LIFF_ID });
            
            if (liff.isLoggedIn()) {
                const profile = await liff.getProfile();
                currentUserId = profile.userId ? profile.userId.trim() : '';
                console.log('✅ 成功取得 UserID:', currentUserId);
            } else {
                // 尚未登入則導向 LINE 授權頁面
                liff.login();
                return;
            }
        } catch (err) {
            console.error('❌ LIFF 初始化失敗:', err);
            alert('❌ 身份驗證失敗，請重新從 LINE 點擊選單開啟頁面！');
        }
    }

    // 1. 載入本地儲存紀錄
    function loadSettings() {
        const savedData = JSON.parse(localStorage.getItem('userSettings'));
        if (savedData) {
            schoolSelect.value = savedData.school || schoolSelect.options[0].value;
            priceSelect.value = savedData.price || priceSelect.options[0].value;
            distanceSelect.value = savedData.distance || distanceSelect.options[0].value;
        }
        updateButtonState();
    }

    // 2. 取得當前選單的值
    function getCurrentData() {
        return {
            school: schoolSelect.value,
            price: priceSelect.value,
            distance: distanceSelect.value
        };
    }

    // 3. 檢查變動並切換按鈕狀態
    function updateButtonState() {
        // 若還沒拿到 User ID，保持禁用
        if (!currentUserId) {
            saveBtn.disabled = true;
            saveBtn.textContent = '無法取得 User ID';
            return;
        }

        const rawSavedData = localStorage.getItem('userSettings');
        
        // 若首次使用（無本地紀錄），預設開放儲存
        if (!rawSavedData) {
            saveBtn.classList.add('active');
            saveBtn.disabled = false;
            saveBtn.textContent = '儲存設定';
            return;
        }

        const savedData = JSON.parse(rawSavedData);
        const currentData = getCurrentData();

        const isChanged = (savedData.school !== currentData.school) ||
                          (savedData.price !== currentData.price) ||
                          (savedData.distance !== currentData.distance);

        if (isChanged) {
            saveBtn.classList.add('active');
            saveBtn.disabled = false;
            saveBtn.textContent = '儲存設定';
        } else {
            saveBtn.classList.remove('active');
            saveBtn.disabled = true;
            saveBtn.textContent = '已是最新設定';
        }
    }

    // 4. 點擊儲存按鈕
    saveBtn.addEventListener('click', async () => {
        if (!currentUserId) {
            alert('⚠️ 尚未取得 UserID，請重新開啟頁面！');
            return;
        }

        // 取得選項顯示文字
        const rawSchool = schoolSelect.options[schoolSelect.selectedIndex].text;
        const rawPrice = priceSelect.options[priceSelect.selectedIndex].text;
        const rawDistance = distanceSelect.options[distanceSelect.selectedIndex].text;

        // 格式化文字（預設提示轉為「不限」）
        const selectedSchoolText = (schoolSelect.value.startsWith('choice') || rawSchool.includes('選擇')) ? '不限' : rawSchool.trim();
        const selectedPriceText = (priceSelect.value.startsWith('choice') || rawPrice.includes('選擇')) ? '不限' : rawPrice.trim();
        const selectedDistanceText = (distanceSelect.value.startsWith('choice') || rawDistance.includes('選擇')) ? '不限' : rawDistance.trim();

        const payload = {
            userId: currentUserId.trim(),
            school: selectedSchoolText,
            price: selectedPriceText,
            distance: selectedDistanceText
        };

        saveBtn.disabled = true;
        saveBtn.textContent = '儲存中...';

        try {
            const response = await fetch(GAS_WEB_APP_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                // 成功寫入後更新 LocalStorage
                localStorage.setItem('userSettings', JSON.stringify(getCurrentData()));
                alert('✅ 設定已成功儲存！');
                updateButtonState();

                if (typeof liff !== 'undefined' && liff.isInClient()) {
                    liff.closeWindow();
                }
            } else {
                throw new Error('伺服器回應異常 (' + response.status + ')');
            }
        } catch (error) {
            console.error('GAS 傳送失敗:', error);
            alert('❌ 儲存失敗：' + error.message);
            updateButtonState();
        }
    });

    // 5. 監聽變更
    selects.forEach(select => select.addEventListener('change', updateButtonState));

    // 6. 初始化執行流程
    await initLiff();
    loadSettings();
});