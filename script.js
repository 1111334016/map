document.addEventListener('DOMContentLoaded', () => {
    // 📌 未來完成 Google Apps Script 後，將 Web App URL 貼到單引號內即可
    const GAS_WEB_APP_URL = '';

    const schoolSelect = document.getElementById('school-select');
    const priceSelect = document.getElementById('price-select');
    const distanceSelect = document.getElementById('distance-select');
    const saveBtn = document.getElementById('save-btn');

    const selects = [schoolSelect, priceSelect, distanceSelect];

    // 1. 載入本地儲存紀錄
    function loadSettings() {
        const savedData = JSON.parse(localStorage.getItem('userSettings'));
        if (savedData) {
            schoolSelect.value = savedData.school || 'choice1';
            priceSelect.value = savedData.price || 'choice2';
            distanceSelect.value = savedData.distance || 'choice3';
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
            school: 'choice1',
            price: 'choice2',
            distance: 'choice3'
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
    saveBtn.addEventListener('click', () => {
        const currentData = getCurrentData();

        // 寫入本地 localStorage
        localStorage.setItem('userSettings', JSON.stringify(currentData));
        updateButtonState();

        // 預留 GAS 背景傳送功能
        if (GAS_WEB_APP_URL.trim() !== '') {
            fetch(GAS_WEB_APP_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentData)
            }).catch(error => console.error('GAS 傳送失敗:', error));
        }
    });

    // 5. 監聽變更
    selects.forEach(select => select.addEventListener('change', updateButtonState));

    // 6. 初始化
    loadSettings();
});