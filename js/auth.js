import { auth } from './firebase-config.js';
import { 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// 更新用戶名稱顯示
function updateUserName(email) {
    const userNameElements = document.querySelectorAll('#userName');
    const username = email ? email.split('@')[0] : '訪客';
    
    userNameElements.forEach(element => {
        if (element) {
            element.textContent = username;
        }
    });
}

// 更新 UI 顯示
function updateUIForAuthState(user) {
    const loginBtns = document.querySelectorAll('.login-btn');
    const logoutBtns = document.querySelectorAll('.logout-btn');

    if (user) {
        // 用戶已登入
        loginBtns.forEach(btn => btn.style.display = 'none');
        logoutBtns.forEach(btn => btn.style.display = 'inline-block');
        updateUserName(user.email);
        // 儲存登入狀態到 localStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', user.email);
    } else {
        // 用戶未登入（訪客模式）
        loginBtns.forEach(btn => btn.style.display = 'inline-block');
        logoutBtns.forEach(btn => btn.style.display = 'none');
        updateUserName(null);
        // 清除登入狀態
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
    }
}

// 初始化認證系統
function initAuth() {
    // 檢查 localStorage 中的登入狀態
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userEmail = localStorage.getItem('userEmail');

    // 如果有保存的登入狀態，先更新 UI
    if (isLoggedIn && userEmail) {
        updateUIForAuthState({ email: userEmail });
    }

    // 監聽認證狀態變化
    onAuthStateChanged(auth, (user) => {
        console.log('認證狀態變更:', user ? '已登入' : '未登入');
        updateUIForAuthState(user);
    });

    // 添加登出按鈕事件監聽
    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            await logout();
        });
    });
}

// 登入函數
async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        updateUserName(user.email);
        // 登入成功後重新導向到首頁
        window.location.href = 'index.html';
        return true;
    } catch (error) {
        console.error('登入錯誤:', error);
        alert('登入失敗：' + error.message);
        return false;
    }
}

// 註冊函數
async function register(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        updateUserName(user.email);
        // 註冊成功後重新導向到首頁
        window.location.href = 'index.html';
        return true;
    } catch (error) {
        console.error('註冊錯誤:', error);
        alert('註冊失敗：' + error.message);
        return false;
    }
}

// 登出函數
async function logout() {
    try {
        const username = auth.currentUser ? auth.currentUser.email.split('@')[0] : '訪客';
        await signOut(auth);
        updateUserName(null);
        alert(`再見，${username}！已切換至訪客模式`);
        
        // 清除登入狀態
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        
        // 重新載入頁面以重置所有狀態
        window.location.reload();
    } catch (error) {
        console.error('登出錯誤:', error);
        alert('登出失敗：' + error.message);
    }
}

// 立即初始化認證系統
initAuth();

// 導出函數和 auth 物件
export { login, register, logout, initAuth, auth }; 

