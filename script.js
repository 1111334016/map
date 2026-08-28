const LIFF_ID = "你的LIFF_ID"; 
const GAS_WEB_APP_URL = "你的GAS網址";

document.addEventListener("DOMContentLoaded", function () {
    const saveBtn = document.getElementById("save-btn");
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerText = "資料載入中...";
        saveBtn.style.backgroundColor = "#888888";
    }
    initializeApp();
});

async function initializeApp() {
    try {
        await liff.init({ liffId: LIFF_ID });
        if (!liff.isLoggedIn()) {
            liff.login();
            return;
        }

        const profile = await liff.getProfile();
        window.currentUserId = profile.userId;

        await loadUserData(window.currentUserId);
        
        // 載入完成後才解鎖按鈕並轉為綠色
        const saveBtn = document.getElementById("save-btn");
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerText = "儲存設定";
            saveBtn.style.backgroundColor = "#1DB446";
        }

        setupEventListeners();

    } catch (error) {
        console.error("LIFF 初始化失敗", error);
        alert("LIFF 初始化失敗，請重新整理網頁。");
    }
}

async function loadUserData(userId) {
    try {
        const response = await fetch(`${GAS_WEB_APP_URL}?userId=${userId}`);
        const result = await response.json();
        
        if (result.status === 'success' && result.profile) {
            const p = result.profile;
            if (p.school) setDropdownValue("school-select", p.school);
            if (p.price) setDropdownValue("price-select", p.price);
            if (p.distance) setDropdownValue("distance-select", p.distance);
        }
    } catch (err) {
        console.error("載入使用者資料失敗", err);
    }
}

function setDropdownValue(elementId, value) {
    const selectElem = document.getElementById(elementId);
    if (!selectElem || !value) return;

    let targetVal = value.toString().trim();
    let matched = false;

    for (let option of selectElem.options) {
        if (option.value === targetVal || option.text.trim() === targetVal) {
            selectElem.value = option.value;
            matched = true;
            break;
        }
    }

    if (!matched) {
        for (let option of selectElem.options) {
            if (option.value.includes(targetVal) || targetVal.includes(option.value) ||
                option.text.includes(targetVal) || targetVal.includes(option.text.trim())) {
                selectElem.value = option.value;
                matched = true;
                break;
            }
        }
    }
}

function setupEventListeners() {
    const schoolSelect = document.getElementById("school-select");
    const priceSelect = document.getElementById("price-select");
    const distanceSelect = document.getElementById("distance-select");
    const saveBtn = document.getElementById("save-btn");

    const checkChange = () => {
        saveBtn.disabled = false;
        saveBtn.innerText = "儲存設定";
        saveBtn.style.backgroundColor = "#1DB446";
    };

    schoolSelect.addEventListener("change", checkChange);
    priceSelect.addEventListener("change", checkChange);
    distanceSelect.addEventListener("change", checkChange);

    saveBtn.addEventListener("click", async function () {
        if (!window.currentUserId) {
            alert("尚未取得使用者資訊，請稍候再試。");
            return;
        }

        saveBtn.disabled = true;
        saveBtn.innerText = "儲存中...";

        const saveUrl = `${GAS_WEB_APP_URL}?action=save&userId=${encodeURIComponent(window.currentUserId)}&school=${encodeURIComponent(schoolSelect.value)}&price=${encodeURIComponent(priceSelect.value)}&distance=${encodeURIComponent(distanceSelect.value)}`;

        try {
            const response = await fetch(saveUrl);
            const resData = await response.json();

            if (resData.status === 'success') {
                saveBtn.innerText = "已儲存成功";
                saveBtn.style.backgroundColor = "#888888";
                alert("設定儲存成功！");
                setTimeout(() => liff.closeWindow(), 1000);
            } else {
                alert("儲存失敗：" + (resData.message || '未知錯誤'));
                saveBtn.disabled = false;
                saveBtn.innerText = "儲存設定";
                saveBtn.style.backgroundColor = "#1DB446";
            }
        } catch (e) {
            console.error(e);
            alert("網路異常，儲存失敗。");
            saveBtn.disabled = false;
            saveBtn.innerText = "儲存設定";
            saveBtn.style.backgroundColor = "#1DB446";
        }
    });
}