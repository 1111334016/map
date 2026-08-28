// 請換成你自己的 LIFF ID
const LIFF_ID = "你的LIFF_ID"; 
// 請換成你的 Google Apps Script 部署網址 (Web App URL)
const GAS_WEB_APP_URL = "你的GAS網址";

document.addEventListener("DOMContentLoaded", function () {
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

        // 向 GAS 請求該使用者先前儲存的設定
        await loadUserData(window.currentUserId);

        // 監聽下拉選單變更，解鎖儲存按鈕
        setupEventListeners();

    } catch (error) {
        console.error("LIFF 初始化失敗", error);
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
    if (!selectElem) return;
    for (let option of selectElem.options) {
        if (option.value === value || option.text === value) {
            selectElem.value = option.value;
            break;
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
        saveBtn.disabled = true;
        saveBtn.innerText = "儲存中...";

        const payload = {
            userId: window.currentUserId,
            school: schoolSelect.value,
            price: priceSelect.value,
            distance: distanceSelect.value
        };

        try {
            const response = await fetch(GAS_WEB_APP_URL, {
                method: "POST",
                body: JSON.stringify(payload)
            });
            const resData = await response.json();

            if (resData.status === 'success') {
                saveBtn.innerText = "已是最新設定";
                saveBtn.style.backgroundColor = "#888888";
                alert("設定儲存成功！");
                setTimeout(() => liff.closeWindow(), 1000);
            } else {
                alert("儲存失敗，請稍後再試。");
                saveBtn.disabled = false;
                saveBtn.innerText = "儲存設定";
            }
        } catch (e) {
            console.error(e);
            alert("網路異常，儲存失敗。");
            saveBtn.disabled = false;
            saveBtn.innerText = "儲存設定";
        }
    });
}