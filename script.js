const LIFF_ID = "2011200610-smru4RvI"; // 你的 LIFF ID
const GAS_WEB_APP_URL = "https://script.google.com/u/0/home/projects/10gc-4blw3LX5jbGFy24Md1HgIkVjDHc_rkjYjSQkf59qZW35lwJTaq2U/edit"; 

document.addEventListener("DOMContentLoaded", function () {
    initializeLiff();
    
    const schoolSelect = document.getElementById('school-select');
    const saveBtn = document.getElementById('save-btn');

    // 必填防呆：選了學校才能按儲存
    schoolSelect.addEventListener('change', function () {
        if (schoolSelect.value) {
            saveBtn.removeAttribute('disabled');
        } else {
            saveBtn.setAttribute('disabled', 'true');
        }
    });

    // 表單送出事件
    document.getElementById('preference-form').addEventListener('submit', function (e) {
        e.preventDefault();
        saveBtn.textContent = '儲存中...';
        saveBtn.setAttribute('disabled', 'true');

        let userId = "test_user";
        if (typeof liff !== "undefined" && liff.isLoggedIn()) {
            userId = liff.getContext() ? liff.getContext().userId : "LINE_USER";
        }

        const payload = {
            userId: userId,
            school: schoolSelect.value,
            price: document.getElementById('price-select').value,
            distance: document.getElementById('distance-select').value
        };

        // 使用 fetch 送至 Google Apps Script
        fetch(GAS_WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors', // 避免瀏覽器 CORS 擋下跨域請求
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        })
        .then(() => {
            alert('設定儲存成功！');
            if (typeof liff !== "undefined" && liff.isInClient()) {
                liff.closeWindow();
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