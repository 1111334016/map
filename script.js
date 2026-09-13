document.addEventListener('DOMContentLoaded', async () => {

    // =========================================================
    // 1. GAS、LIFF 設定
    // =========================================================

    const GAS_WEB_APP_URL =
        'https://script.google.com/macros/s/AKfycbzvZNkCy0Q-jhgo7yzgMCAjr8ap2ez4R8ZuxFJDYpGuN7Fzghc3ByrnrxAtG6eewnTSnw/exec';

    const MY_LIFF_ID =
        '2011288416-9QX9xXhz';


    let currentUserId = '';

    // 儲存從 GAS 讀取到的原始設定
    let originalSettings = null;

    let isLoading = false;


    // =========================================================
    // 2. 取得 HTML 元件
    // =========================================================

    const schoolSelect =
        document.getElementById('school-select');

    const campusSelect =
        document.getElementById('campus-select');

    const priceSelect =
        document.getElementById('price-select');

    const distanceSelect =
        document.getElementById('distance-select');

    const saveBtn =
        document.getElementById('save-btn');


    // =========================================================
    // 3. 學校 → 校區
    // =========================================================

    const schoolCampusMap = {

        // 1. 國立中興大學
        school1: [
            '校本部',
            '南投校區'
        ],

        // 2. 國立臺中教育大學
        school2: [
            '民生校區',
            '英才校區'
        ],

        // 3. 國立勤益科技大學
        school3: [
            '坪林校區'
        ],

        // 4. 國立臺灣體育運動大學
        school4: [
            '校本部'
        ],

        // 5. 國立臺中科技大學
        school5: [
            '三民校區',
            '民生校區',
            '南屯校區'
        ],

        // 6. 東海大學
        school6: [
            '第一校區',
            '第二校區'
        ],

        // 7. 逢甲大學
        school7: [
            '校本部',
            '福星校區',
            '中科校區',
            '水湳校區'
        ],

        // 8. 靜宜大學
        school8: [
            '校本部'
        ],

        // 9. 朝陽科技大學
        school9: [
            '校本部'
        ],

        // 10. 中山醫學大學
        school10: [
            '校本部'
        ],

        // 11. 弘光科技大學
        school11: [
            '校本部'
        ],

        // 12. 中國醫藥大學
        school12: [
            '水湳校區',
            '英才校區',
            '北港校區'
        ],

        // 13. 嶺東科技大學
        school13: [
            '春安校區',
            '寶文校區'
        ],

        // 14. 中臺科技大學
        school14: [
            '校本部'
        ],

        // 15. 亞洲大學
        school15: [
            '校本部'
        ],

        // 16. 僑光科技大學
        school16: [
            '校本部'
        ]

    };


    // =========================================================
    // 4. 根據學校更新校區
    // =========================================================

    function updateCampusOptions(selectedCampus = '') {

        const school =
            schoolSelect.value;


        // 清空原本校區
        campusSelect.innerHTML = '';


        // -----------------------------------------------------
        // 選擇「現在位置」
        // -----------------------------------------------------

        if (school === 'location') {

            const option =
                document.createElement('option');

            option.value =
                'current_location';

            option.textContent =
                '依目前位置搜尋';

            campusSelect.appendChild(option);

            // 不需要選校區
            campusSelect.disabled = true;

            return;
        }


        // -----------------------------------------------------
        // 尚未選擇學校
        // -----------------------------------------------------

        const campuses =
            schoolCampusMap[school];


        if (!campuses) {

            const option =
                document.createElement('option');

            option.value = '';

            option.textContent =
                '請先選擇學校';

            campusSelect.appendChild(option);

            campusSelect.disabled = true;

            return;
        }


        // -----------------------------------------------------
        // 只有一個校區
        // → 自動選取
        // -----------------------------------------------------

        if (campuses.length === 1) {

            const option =
                document.createElement('option');

            option.value =
                campuses[0];

            option.textContent =
                campuses[0];

            campusSelect.appendChild(option);

            campusSelect.value =
                campuses[0];

            campusSelect.disabled = true;

            return;
        }


        // -----------------------------------------------------
        // 有兩個以上校區
        // → 使用者選擇
        // -----------------------------------------------------

        const placeholder =
            document.createElement('option');

        placeholder.value = '';

        placeholder.textContent =
            '請選擇校區';

        campusSelect.appendChild(
            placeholder
        );


        campuses.forEach(campus => {

            const option =
                document.createElement('option');

            option.value =
                campus;

            option.textContent =
                campus;

            campusSelect.appendChild(
                option
            );

        });


        // -----------------------------------------------------
        // 如果之前有設定校區
        // 就恢復之前的校區
        // -----------------------------------------------------

        if (
            selectedCampus &&
            campuses.includes(selectedCampus)
        ) {

            campusSelect.value =
                selectedCampus;

        }


        campusSelect.disabled = false;

    }


    // =========================================================
    // 5. 初始化 LIFF
    // =========================================================

    async function initLiff() {

        saveBtn.disabled = true;

        saveBtn.textContent =
            '載入使用者資訊中...';


        try {

            if (
                !MY_LIFF_ID ||
                MY_LIFF_ID === 'YOUR_LIFF_ID'
            ) {

                throw new Error(
                    'LIFF ID 尚未設定'
                );

            }


            await liff.init({
                liffId: MY_LIFF_ID
            });


            // 尚未登入
            if (!liff.isLoggedIn()) {

                liff.login();

                return false;

            }


            // 取得 LINE 個人資料
            const profile =
                await liff.getProfile();


            currentUserId =
                profile.userId
                    ? profile.userId.trim()
                    : '';


            if (!currentUserId) {

                throw new Error(
                    '無法取得 LINE User ID'
                );

            }


            console.log(
                '目前使用者 ID:',
                currentUserId
            );


            return true;


        } catch (error) {

            console.error(
                'LIFF 初始化失敗:',
                error
            );


            saveBtn.disabled = true;

            saveBtn.textContent =
                '無法取得使用者資訊';


            alert(
                '❌ 無法取得 LINE 使用者資訊。\n' +
                '請重新從 LINE 官方帳號的「初始設定」開啟此頁面。'
            );


            return false;

        }

    }


    // =========================================================
    // 6. 從 GAS 讀取之前的設定
    // =========================================================

    async function loadSettingsFromGAS() {

        if (!currentUserId) {

            return null;

        }


        try {

            saveBtn.disabled = true;

            saveBtn.textContent =
                '載入之前的設定中...';


            const url =
                GAS_WEB_APP_URL +
                '?action=getUserSettings&userId=' +
                encodeURIComponent(
                    currentUserId
                );


            const response =
                await fetch(url, {
                    method: 'GET'
                });


            if (!response.ok) {

                throw new Error(
                    'GAS 讀取失敗 (' +
                    response.status +
                    ')'
                );

            }


            const data =
                await response.json();


            console.log(
                'GAS 回傳的使用者設定:',
                data
            );


            // 找到使用者資料
            if (
                data &&
                data.success === true &&
                data.exists === true &&
                data.data
            ) {

                return {

                    school:
                        data.data.school || '',

                    campus:
                        data.data.campus || '',

                    price:
                        data.data.price || '',

                    distance:
                        data.data.distance || ''

                };

            }


            // 第一次使用
            return null;


        } catch (error) {

            console.error(
                '讀取 GAS 使用者設定失敗:',
                error
            );


            alert(
                '⚠️ 目前無法讀取之前的設定。\n' +
                '請確認 GAS Web App 是否已經加入「讀取 User 資料」功能。'
            );


            return null;

        }

    }


    // =========================================================
    // 7. 把 GAS 的資料顯示到網頁
    // =========================================================

    function applySettings(settings) {

    // 沒有之前的設定
    if (!settings) {

        schoolSelect.value = '';

        updateCampusOptions();

        priceSelect.value = '';

        distanceSelect.value = '';

        originalSettings = null;

        return;
    }


    // =====================================================
    // 將 GAS 回傳的「文字」
    // 找到網頁下拉選單中對應的 option value
    // =====================================================

    function findOptionValue(selectElement, text) {

        if (!text) {
            return '';
        }

        const targetText = String(text).trim();

        const option = Array.from(
            selectElement.options
        ).find(option => {

            return option.text.trim() === targetText;

        });

        return option ? option.value : '';
    }


    // =====================================================
    // 1. 恢復學校
    // =====================================================

    // GAS 回傳的是：
    // 「國立中興大學」
    //
    // 網頁 option value 可能是：
    // 「school1」
    //
    // 所以先用文字找到正確的 value

    const schoolValue =
        findOptionValue(
            schoolSelect,
            settings.school
        );


    schoolSelect.value =
        schoolValue;


    // =====================================================
    // 2. 根據學校建立校區
    // =====================================================

    updateCampusOptions(
        settings.campus || ''
    );


    // =====================================================
    // 3. 恢復價位
    // =====================================================

    const priceValue =
        findOptionValue(
            priceSelect,
            settings.price
        );


    priceSelect.value =
        priceValue;


    // =====================================================
    // 4. 恢復距離
    // =====================================================

    const distanceValue =
        findOptionValue(
            distanceSelect,
            settings.distance
        );


    distanceSelect.value =
        distanceValue;


    // =====================================================
    // 記錄載入完成後的設定
    // =====================================================

    originalSettings =
        getCurrentData();


    console.log(
        '✅ 已從 GAS 載入之前的設定：',
        settings
    );

    console.log(
        '✅ 網頁目前顯示的設定：',
        originalSettings
    );
}


    // =========================================================
    // 8. 取得目前選擇資料
    // =========================================================

    function getCurrentData() {

        return {

            school:
                schoolSelect.value,

            campus:
                campusSelect.value,

            price:
                priceSelect.value,

            distance:
                distanceSelect.value

        };

    }


    // =========================================================
    // 9. 取得選項文字
    // =========================================================

    function getSelectedText(
        selectElement
    ) {

        if (
            !selectElement ||
            selectElement.selectedIndex < 0
        ) {

            return '';

        }


        return selectElement.options[
            selectElement.selectedIndex
        ].text.trim();

    }


    // =========================================================
    // 10. 判斷是否需要儲存
    // =========================================================

    function updateButtonState() {

        if (
            isLoading ||
            !currentUserId
        ) {

            saveBtn.disabled = true;

            if (
                !isLoading &&
                !currentUserId
            ) {

                saveBtn.textContent =
                    '無法取得 User ID';

            }

            return;

        }


        const currentData =
            getCurrentData();


        // 第一次設定
        if (!originalSettings) {

            saveBtn.disabled = false;

            saveBtn.classList.add(
                'active'
            );

            saveBtn.textContent =
                '儲存設定';

            return;

        }


        // 判斷是否修改
        const isChanged =

            originalSettings.school !==
            currentData.school ||

            originalSettings.campus !==
            currentData.campus ||

            originalSettings.price !==
            currentData.price ||

            originalSettings.distance !==
            currentData.distance;


        if (isChanged) {

            saveBtn.disabled = false;

            saveBtn.classList.add(
                'active'
            );

            saveBtn.textContent =
                '儲存設定';

        } else {

            saveBtn.disabled = true;

            saveBtn.classList.remove(
                'active'
            );

            saveBtn.textContent =
                '已是最新設定';

        }

    }


    // =========================================================
    // 11. 取得使用者目前位置
    // =========================================================

    function getCurrentLocation() {

        return new Promise(
            (resolve, reject) => {

                if (
                    !navigator.geolocation
                ) {

                    reject(
                        new Error(
                            '此裝置或瀏覽器不支援定位功能'
                        )
                    );

                    return;

                }


                navigator.geolocation.getCurrentPosition(

                    position => {

                        resolve({

                            latitude:
                                position.coords.latitude,

                            longitude:
                                position.coords.longitude

                        });

                    },


                    error => {

                        let message =
                            '無法取得目前位置';


                        switch (error.code) {

                            case error.PERMISSION_DENIED:

                                message =
                                    '你拒絕了位置權限，請允許此網頁使用目前位置。';

                                break;


                            case error.POSITION_UNAVAILABLE:

                                message =
                                    '目前無法取得位置資訊，請稍後再試。';

                                break;


                            case error.TIMEOUT:

                                message =
                                    '取得位置逾時，請稍後再試。';

                                break;

                        }


                        reject(
                            new Error(message)
                        );

                    },


                    {

                        enableHighAccuracy: true,

                        timeout: 10000,

                        maximumAge: 0

                    }

                );

            }
        );

    }


    // =========================================================
    // 12. 儲存設定
    // =========================================================

    async function saveSettings() {

        if (!currentUserId) {

            alert(
                '⚠️ 尚未取得 LINE User ID，請重新開啟頁面。'
            );

            return;

        }


        // -----------------------------------------------------
        // 檢查學校
        // -----------------------------------------------------

        if (!schoolSelect.value) {

            alert(
                '請先選擇就讀學校。'
            );

            return;

        }


        // -----------------------------------------------------
        // 檢查校區
        // -----------------------------------------------------

        if (
            schoolSelect.value !==
            'location' &&
            !campusSelect.value
        ) {

            alert(
                '請先選擇校區。'
            );

            return;

        }


        // -----------------------------------------------------
        // 檢查價位
        // -----------------------------------------------------

        if (!priceSelect.value) {

            alert(
                '請先選擇價位偏好。'
            );

            return;

        }


        // -----------------------------------------------------
        // 檢查距離
        // -----------------------------------------------------

        if (!distanceSelect.value) {

            alert(
                '請先選擇偏好移動距離範圍。'
            );

            return;

        }


        // -----------------------------------------------------
        // 取得顯示文字
        // -----------------------------------------------------

        const schoolText =
            getSelectedText(
                schoolSelect
            );

        const campusText =
            getSelectedText(
                campusSelect
            );

        const priceText =
            getSelectedText(
                priceSelect
            );

        const distanceText =
            getSelectedText(
                distanceSelect
            );


        // -----------------------------------------------------
        // 如果選擇「現在位置」
        // → 取得 GPS
        // -----------------------------------------------------

        let locationData = null;


        if (
            schoolSelect.value ===
            'location'
        ) {

            try {

                saveBtn.disabled = true;

                saveBtn.textContent =
                    '取得目前位置中...';


                locationData =
                    await getCurrentLocation();


                console.log(
                    '目前位置:',
                    locationData.latitude,
                    locationData.longitude
                );


            } catch (error) {

                alert(
                    '❌ ' +
                    error.message
                );


                updateButtonState();

                return;

            }

        }


        // -----------------------------------------------------
        // 要傳送給 GAS 的資料
        // -----------------------------------------------------

        const payload = {

            action:
                'saveUserSettings',


            // LINE User ID
            userId:
                currentUserId.trim(),


            // 選項 value
            school:
                schoolSelect.value,

            campus:
                campusSelect.value,

            price:
                priceSelect.value,

            distance:
                distanceSelect.value,


            // 選項顯示文字
            schoolText:
                schoolText,

            campusText:
                campusText,

            priceText:
                priceText,

            distanceText:
                distanceText,


            // GPS
            latitude:
                locationData
                    ? locationData.latitude
                    : '',

            longitude:
                locationData
                    ? locationData.longitude
                    : ''

        };


        console.log(
            '準備傳送 GAS:',
            payload
        );


        saveBtn.disabled = true;

        saveBtn.textContent =
            '儲存中...';


        // -----------------------------------------------------
        // POST 到 GAS
        // -----------------------------------------------------

        try {

            const response =
                await fetch(
                    GAS_WEB_APP_URL,
                    {

                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'text/plain;charset=utf-8'
                        },

                        body:
                            JSON.stringify(
                                payload
                            )

                    }
                );


            if (!response.ok) {

                throw new Error(
                    '伺服器回應異常 (' +
                    response.status +
                    ')'
                );

            }


            // 嘗試解析 GAS JSON
            let result = null;


            try {

                result =
                    await response.json();

            } catch (jsonError) {

                console.warn(
                    'GAS 回應不是 JSON，但 HTTP 已成功。',
                    jsonError
                );

            }


            console.log(
                'GAS 儲存結果:',
                result
            );


            if (
                result &&
                result.success === false
            ) {

                throw new Error(
                    result.message ||
                    'GAS 儲存失敗'
                );

            }


            // 更新原始設定
            originalSettings =
                getCurrentData();


            alert(
                '✅ 設定已成功儲存！'
            );


            updateButtonState();


            // 如果在 LINE 裡面
            // 儲存成功後關閉 LIFF
            if (
                typeof liff !== 'undefined' &&
                liff.isInClient()
            ) {

                liff.closeWindow();

            }


        } catch (error) {

            console.error(
                'GAS 傳送失敗:',
                error
            );


            alert(
                '❌ 儲存失敗：' +
                error.message
            );


            updateButtonState();

        }

    }


    // =========================================================
    // 13. 學校改變
    // =========================================================

    schoolSelect.addEventListener(
        'change',
        () => {

            updateCampusOptions();

            updateButtonState();

        }
    );


    // =========================================================
    // 14. 其他選單改變
    // =========================================================

    campusSelect.addEventListener(
        'change',
        updateButtonState
    );


    priceSelect.addEventListener(
        'change',
        updateButtonState
    );


    distanceSelect.addEventListener(
        'change',
        updateButtonState
    );


    // =========================================================
    // 15. 儲存按鈕
    // =========================================================

    saveBtn.addEventListener(
        'click',
        saveSettings
    );


    // =========================================================
    // 16. 開始執行
    // =========================================================

    isLoading = true;


    const liffReady =
        await initLiff();


    if (!liffReady) {

        isLoading = false;

        return;

    }


    // 每次開啟都從 GAS 讀取
    // 不再使用 localStorage
    const savedSettings =
        await loadSettingsFromGAS();


    // 顯示之前設定
    applySettings(
        savedSettings
    );


    isLoading = false;


    updateButtonState();

});