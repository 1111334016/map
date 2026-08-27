document.addEventListener('DOMContentLoaded', async () => {
    // 📌 GAS Web App URL
    const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbybPsM6jjhXRMFl0rZ8ntctPtqP1mJz2LXk8CufoQWO5lpjMHMiDjLT7n5DFnvwhjvVxQ/exec';
    
    // 📌 LIFF ID
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
                // 尚未登入則導向 LINE 授權頁面並中斷執行
                liff.login();
                return;
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
            distance: distanceSelect.value
        };
    }

    // 3. 檢查變動並切換按鈕狀態（修正新使用者無紀錄無法點擊的問題）
    function updateButtonState() {
        const rawSavedData = localStorage.getItem('userSettings');
        
        // 若使用者從未儲存過（首次使用），預設強制開放按鈕
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

        // 取得當前選單值並寫入 localStorage (解決儲存後下次開啟失效的問題)
        const currentData = getCurrentData();
        localStorage.setItem('userSettings', JSON.stringify(currentData));

        // 取得選項顯示文字
        const rawSchool = schoolSelect.options[schoolSelect.selectedIndex].text;
        const rawPrice = priceSelect.options[priceSelect.selectedIndex].text;
        const rawDistance = distanceSelect.options[distanceSelect.selectedIndex].text;

        // 若為預設提示文字（包含「選擇」或 choice），自動轉換為「不限」
        const selectedSchoolText = (schoolSelect.value.startsWith('choice') || rawSchool.includes('選擇')) ? '不限' : rawSchool;
        const selectedPriceText = (priceSelect.value.startsWith('choice') || rawPrice.includes('選擇')) ? '不限' : rawPrice;
        const selectedDistanceText = (distanceSelect.value.startsWith('choice') || rawDistance.includes('選擇')) ? '不限' : rawDistance;

        const payload = {
            userId: currentUserId,
            school: selectedSchoolText,
            price: selectedPriceText,
            distance: selectedDistanceText
        };

        saveBtn.disabled = true;
        saveBtn.textContent = '儲存中...';

        try {
            await fetch(GAS_WEB_APP_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(payload)
            });

            alert('✅ 設定已成功儲存！');
            updateButtonState();

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