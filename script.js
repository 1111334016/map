document.addEventListener('DOMContentLoaded', async () => {
    // 📌 GAS Web App URL
    const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbybPsM6jjhXRMFl0rZ8ntctPtqP1mJz2LXk8CufoQWO5lpjMHMiDjLT7n5DFnvwhjvVxQ/exec';
    
    // 📌 請填入您的 LIFF ID (位於 LINE Developers > LIFF 頁面)
    const MY_LIFF_ID = '2011200610-smru4RvI'; 

    let currentUserId = ''; // 儲存 LINE User ID

    const schoolSelect = document.getElementById('school-select');
    const priceSelect = document.getElementById('price-select');
    const distanceSelect = document.getElementById('distance-select');
    const saveBtn = document.getElementById('save-btn');

    const selects = [schoolSelect, priceSelect, distanceSelect];

    // 0. 初始化 LIFF SDK 並取得 UserID
    async function initLiff() {
        try {
            if (!MY_LIFF_ID || MY_LIFF_ID === 'YOUR_LIFF_ID') {
                console.warn('⚠️ 請務必填入真實的 MY_LIFF_ID');
                return;
            }
            await liff.init({ liffId: MY_LIFF_ID });
            if (liff.isLoggedIn()) {
                const profile = await liff.getProfile();
                currentUserId = profile.userId;
                console.log('成功取得 UserID:', currentUserId);
            } else {
                liff.login();
            }
        } catch (err) {
            console.error('LIFF 初始化失敗:', err);
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
            distance: distanceSelect.value,
            timestamp: new Date().toLocaleString()
        };
    }

    // 3. 檢查變動並切換按鈕顏色（綠色/灰色）
    function updateButtonState() {
        const savedData = JSON.parse(localStorage.getItem('userSettings')) || {
            school: schoolSelect.options[0].value,
            price: priceSelect.options[0].value,
            distance: distanceSelect.options[0].value
        };
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
        alert("診斷訊息：\nUserID=" + currentUserId + "\n學校=" + schoolSelect.options[schoolSelect.selectedIndex].text);
        if (!currentUserId) {
            alert('⚠️ 尚未取得 UserID，請重新開啟頁面或於 LINE 內開啟！');
            return;
        }

        const currentData = getCurrentData();

        // 寫入本地 localStorage
        localStorage.setItem('userSettings', JSON.stringify(currentData));
        updateButtonState();

        // 抓取選單顯示的實際中文文字 (例如: 國立臺中科技大學(三民校區))
        const selectedSchoolText = schoolSelect.options[schoolSelect.selectedIndex].text;
        const selectedPriceText = priceSelect.options[priceSelect.selectedIndex].text;
        const selectedDistanceText = distanceSelect.options[distanceSelect.selectedIndex].text;

        // 打包傳送到 GAS 的 JSON 資料
        const payload = {
            userId: currentUserId,
            school: selectedSchoolText,
            price: selectedPriceText,
            distance: selectedDistanceText
        };

        saveBtn.disabled = true;
        saveBtn.textContent = '儲存中...';

        try {
            const response = await fetch(GAS_WEB_APP_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(payload)
            });

            alert('✅ 設定已成功儲存！');
            
            // 關閉 LIFF 視窗回到 LINE 聊天室
            if (typeof liff !== 'undefined' && liff.isInClient()) {
                liff.closeWindow();
            }
        } catch (error) {
            console.error('GAS 傳送失敗:', error);
            alert('❌ 儲存失敗：' + error.message);
            updateButtonState();
        }
    });

    // 5. 監聽變更
    selects.forEach(select => select.addEventListener('change', updateButtonState));

    // 6. 初始化執行
    await initLiff();
    loadSettings();
});