// 常數配置
const LIFF_ID = "2011200610-smru4RvI";
const GAS_WEB_APP_URL = "https://1111334016.github.io/map/";

let userId = "";

// DOM 元素引用
const schoolSelect = document.getElementById("school-select");
const priceSelect = document.getElementById("price-select");
const distanceSelect = document.getElementById("distance-select");
const saveBtn = document.getElementById("save-btn");
const preferenceForm = document.getElementById("preference-form");

// 頁面初始化
document.addEventListener("DOMContentLoaded", async () => {
    try {
        await liff.init({ liffId: LIFF_ID });

        if (!liff.isLoggedIn()) {
            liff.login();
            return;
        }

        const profile = await liff.getProfile();
        userId = profile.userId;

        // 防呆驗證監聽 (選擇學校後解鎖按鈕)
        schoolSelect.addEventListener("change", validateForm);

        // 自動載入個人既有偏好設定
        await loadUserProfile(userId);

    } catch (err) {
        console.error("LIFF 初始化失敗：", err);
    }
});

function validateForm() {
    if (schoolSelect.value && schoolSelect.value !== "") {
        saveBtn.disabled = false;
        saveBtn.classList.add("active");
    } else {
        saveBtn.disabled = true;
        saveBtn.classList.remove("active");
    }
}

async function loadUserProfile(userId) {
    saveBtn.innerText = "資料載入中...";
    try {
        const response = await fetch(`${GAS_WEB_APP_URL}?action=getProfile&userId=${userId}`);
        const result = await response.json();

        if (result.status === "success" && result.data) {
            if (result.data.school) schoolSelect.value = result.data.school;
            if (result.data.price) priceSelect.value = result.data.price;
            if (result.data.distance) distanceSelect.value = result.data.distance;
            validateForm();
        }
    } catch (err) {
        console.warn("尚未取得歷史設定，將使用預設選單。", err);
    } finally {
        saveBtn.innerText = "儲存設定";
    }
}

preferenceForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!schoolSelect.value) {
        alert("請選擇您就讀的學校！");
        return;
    }

    saveBtn.disabled = true;
    saveBtn.innerText = "儲存中...";

    const payload = {
        action: "save",
        userId: userId,
        school: schoolSelect.value,
        price: priceSelect.value || "不限",
        distance: distanceSelect.value || "不限"
    };

    try {
        // 使用 text/plain 格式發送給 GAS 避開嚴格 CORS 攔截
        await fetch(GAS_WEB_APP_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(payload)
        });

        alert("設定儲存成功！");
        if (liff.isInClient()) {
            liff.closeWindow();
        } else {
            alert("請回到 LINE 對話框開始使用系統！");
        }
    } catch (err) {
        console.error("儲存失敗：", err);
        alert("設定已送出！");
        if (liff.isInClient()) liff.closeWindow();
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerText = "儲存設定";
    }
});