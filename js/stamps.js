import { auth, db } from './firebase-config.js';
import { doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 印章管理類
class StampManager {
    constructor() {
        this.stamps = {
            france: false,
            japan: false,
            korea: false,
            usa: false,
            india: false,
            taiwan: false
        };
        this.initialized = false;
        console.log('StampManager 初始化');
    }

    // 初始化用戶印章狀態
    async initializeUserStamps(userId) {
        console.log('初始化用戶印章狀態，userId:', userId);
        if (!userId) {
            console.log('沒有 userId，返回');
            return;
        }
        
        try {
            const userRef = doc(db, "users", userId);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                console.log('新用戶，創建初始印章狀態');
                await setDoc(userRef, {
                    stamps: this.stamps
                });
            } else {
                console.log('載入現有用戶印章狀態');
                this.stamps = userDoc.data().stamps;
                console.log('當前印章狀態:', this.stamps);
            }
            
            this.initialized = true;
            this.updateUI();
        } catch (error) {
            console.error('初始化印章狀態時出錯:', error);
        }
    }

    // 更新印章狀態
    async updateStamp(country) {
        console.log('嘗試更新印章狀態，國家:', country);
        const user = auth.currentUser;
        if (!user) {
            console.log('用戶未登入');
            alert('請先登入以獲得印章！');
            return;
        }

        try {
            this.stamps[country] = true;
            console.log('更新本地印章狀態:', this.stamps);
            
            // 更新 Firebase
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                [`stamps.${country}`]: true
            });
            console.log('Firebase 更新成功');

            this.updateUI();
            this.updateProgress();
        } catch (error) {
            console.error('更新印章狀態時出錯:', error);
        }
    }

    // 更新 UI 顯示
    updateUI() {
        console.log('更新 UI 顯示，當前印章狀態:', this.stamps);
        Object.entries(this.stamps).forEach(([country, isStamped]) => {
            const stampElement = document.querySelector(`.stamp-item[data-country="${country}"]`);
            if (stampElement) {
                console.log(`更新 ${country} 印章狀態:`, isStamped);
                if (isStamped) {
                    stampElement.classList.remove('locked');
                } else {
                    stampElement.classList.add('locked');
                }
            } else {
                console.log(`找不到 ${country} 的印章元素`);
            }
        });
    }

    // 更新進度
    updateProgress() {
        const totalStamps = Object.values(this.stamps).filter(Boolean).length;
        console.log('更新進度條，已獲得印章數:', totalStamps);
        
        const progressText = document.querySelector('.progress-text');
        const progressBar = document.querySelector('.progress-bar');
        
        if (progressText && progressBar) {
            progressText.textContent = `探索進度：${totalStamps} / 6`;
            const percentage = (totalStamps / 6) * 100;
            progressBar.style.width = `${percentage}%`;
            progressBar.setAttribute('aria-valuenow', percentage);
        }
    }
}

// 創建印章管理器實例
const stampManager = new StampManager();

// 監聽用戶登入狀態
auth.onAuthStateChanged((user) => {
    console.log('用戶登入狀態改變:', user ? '已登入' : '未登入');
    if (user) {
        stampManager.initializeUserStamps(user.uid);
    } else {
        stampManager.stamps = {
            france: false,
            japan: false,
            korea: false,
            usa: false,
            india: false,
            taiwan: false
        };
        stampManager.updateUI();
        stampManager.updateProgress();
    }
});

export { stampManager }; 