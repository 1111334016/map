const LIFF_ID = "2011288416-9QX9xXhz";
const GAS_WEB_APP_URL = "https://script.google.com/u/0/home/projects/10gc-4blw3LX5jbGFy24Md1HgIkVjDHc_rkjYjSQkf59qZW35lwJTaq2U/edit"; 

document.addEventListener("DOMContentLoaded", function () {
    initializeLiff();
    
    const schoolSelect = document.getElementById('school-select');
    const saveBtn = document.getElementById('save-btn');

    schoolSelect.addEventListener('change', function () {
        if (schoolSelect.value) {
            saveBtn.removeAttribute('disabled');
        } else {
            saveBtn.setAttribute('disabled', 'true');
        }
    });

    document.getElementById('preference-form').addEventListener('submit', function (e) {
        e.preventDefault();
        saveBtn.textContent = '儲存中...';
        saveBtn.setAttribute('disabled', 'true');

        let userId = "test_user";
        if (typeof liff !== "undefined" && liff.isLoggedIn()) {
            userId = liff.getContext() ? liff.getContext().userId : "LINE_USER";
        }

        const school = encodeURIComponent(schoolSelect.value);
        const price = encodeURIComponent(document.getElementById('price-select').value);
        const distance = encodeURIComponent(document.getElementById('distance-select').value);
        const encodedUserId = encodeURIComponent(userId);

        // 使用 GET 方式帶參數送出，完美避開跨域擋信問題
        const targetUrl = `${GAS_WEB_APP_URL}?userId=${encodedUserId}&school=${school}&price=${price}&distance=${distance}`;

        fetch(targetUrl)
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                alert('設定儲存成功！');
                if (typeof liff !== "undefined" && liff.isInClient()) {
                    liff.closeWindow();
                }
            } else {
                throw new Error(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('儲存失敗，請稍後再試');
            saveBtn.textContent = '儲存設定';
            saveBtn.removeAttribute('disabled');
        });
    });
});

function initializeLiff() {
    liff.init({
        liffId: LIFF_ID
    }).then(() => {
        if (!liff.isLoggedIn() && !liff.isInClient()) {
            liff.login();
        }
    }).catch((err) => {
        console.log('LIFF Initialization failed', err);
    });
}