import { auth, db } from './firebase-config.js';
import { levelStatusManager } from './levelStatus.js';
import { doc, getDoc, collection, query, orderBy, limit, getDocs, addDoc, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 成就管理類
class AchievementManager {
    constructor() {
        this.currentUser = null;
        this.userLevels = {};
        this.userActivities = [];
        this.isInitialized = false;
    }

    // 初始化成就系統
    async initialize() {
        try {
            await this.waitForAuth();
            if (!this.currentUser) {
                this.showGuestMode();
                return;
            }
            await this.loadUserData();
            this.updateUI();
            this.listenForUpdates();
            this.isInitialized = true;
            console.log('成就系統初始化完成');
        } catch (error) {
            console.error('成就系統初始化失敗:', error);
            this.showError('載入成就資料失敗，請重新整理頁面');
        }
    }

    async waitForAuth() {
        return new Promise((resolve) => {
            if (auth.currentUser) {
                this.currentUser = auth.currentUser;
                resolve();
            } else {
                const unsubscribe = auth.onAuthStateChanged((user) => {
                    this.currentUser = user;
                    unsubscribe();
                    resolve();
                });
            }
        });
    }

    async loadUserData() {
        if (!this.currentUser) return;
        try {
            this.userLevels = await levelStatusManager.getAllLevelStatus(this.currentUser.uid);
            await this.loadUserActivities();
        } catch (error) {
            console.error('載入用戶資料失敗:', error);
            throw error;
        }
    }

    // 只從 Firestore 讀取活動，不再補資料
    async loadUserActivities() {
        if (!this.currentUser) return;
        this.userActivities = undefined; // 進入載入中狀態
        this.updateRecentActivities();
        try {
            const activitiesRef = collection(db, 'users', this.currentUser.uid, 'activities');
            const activitiesQuery = query(activitiesRef, orderBy('timestamp', 'desc'), limit(50));
            const activitiesSnapshot = await getDocs(activitiesQuery);
            this.userActivities = [];
            activitiesSnapshot.forEach(doc => {
                this.userActivities.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            this.updateRecentActivities();
        } catch (error) {
            console.error('載入活動記錄失敗:', error);
            this.userActivities = [];
            this.updateRecentActivities();
        }
    }

    // 新增：判斷該國家是否已經有 badge 活動
    async hasBadgeActivity(country) {
        if (!this.currentUser) return false;
        const activitiesRef = collection(db, 'users', this.currentUser.uid, 'activities');
        const q = query(activitiesRef, where('type', '==', 'badge'), where('country', '==', country));
        const snapshot = await getDocs(q);
        return !snapshot.empty;
    }

    // 新增活動後重新讀取 Firestore，確保所有歷史紀錄都保留且時間不變
    async recordActivity(activity) {
        if (!this.currentUser) return;
        try {
            const activitiesRef = collection(db, 'users', this.currentUser.uid, 'activities');
            const newActivity = {
                ...activity,
                timestamp: Date.now(),
                createdAt: new Date()
            };
            await addDoc(activitiesRef, newActivity);
            await this.loadUserActivities();
            this.updateRecentActivities();
        } catch (error) {
            console.error('記錄活動失敗:', error);
        }
    }

    updateBadges() {
        const countries = ['france', 'japan', 'korea', 'usa', 'india', 'taiwan'];
        countries.forEach(country => {
            const badge = document.getElementById(`badge-${country}`);
            if (!badge) return;
            const icon = badge.querySelector('.badge-icon');
            const lock = badge.querySelector('.badge-lock');
            const isUnlocked = this.userLevels[country] === 'completed';
            if (isUnlocked) {
                badge.classList.remove('badge-locked');
                if (icon) icon.classList.remove('badge-locked');
                if (lock) lock.style.display = 'none';
                badge.style.animation = 'badgeUnlock 0.5s ease-in-out';
                setTimeout(() => {
                    badge.style.animation = '';
                }, 500);
            } else {
                badge.classList.add('badge-locked');
                if (icon) icon.classList.add('badge-locked');
                if (lock) lock.style.display = '';
            }
        });
    }

    updateStats() {
        const countries = ['france', 'japan', 'korea', 'usa', 'india', 'taiwan'];
        let unlockedCount = 0;
        countries.forEach(country => {
            if (this.userLevels[country] === 'completed') {
                unlockedCount++;
            }
        });
        const unlockedElement = document.getElementById('unlockedCountryCount');
        const percentElement = document.getElementById('completionPercent');
        if (unlockedElement) {
            unlockedElement.textContent = unlockedCount;
        }
        if (percentElement) {
            const percent = Math.round((unlockedCount / countries.length) * 100);
            percentElement.textContent = percent + '%';
        }
    }

    updateRecentActivities() {
        const recentActivitiesContainer = document.querySelector('.recent-activities');
        if (!recentActivitiesContainer) return;

        // 載入中
        if (this.userActivities === undefined) {
            recentActivitiesContainer.innerHTML = '<div style="text-align:center; color:#888;">載入中...</div>';
            return;
        }
        // 無資料
        if (!this.userActivities || this.userActivities.length === 0) {
            recentActivitiesContainer.innerHTML = '<div style="text-align:center; color:#888;">暫無活動紀錄</div>';
            return;
        }

        const activityIcons = {
            badge: 'fa-star',
            level: 'fa-trophy',
            quiz: 'fa-check',
            start: 'fa-play'
        };
        const activityColors = {
            badge: '#e8f5e9',
            level: '#e8f5e9',
            quiz: '#e8f5e9',
            start: '#e8f5e9'
        };
        const activitiesHTML = this.userActivities.slice(0, 10).map(activity => `
            <div class="activity-item">
                <div class="activity-icon" style="background:${activityColors[activity.type] || '#e8f5e9'}">
                    <i class="fas ${activityIcons[activity.type] || 'fa-star'}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-time">${this.formatDateTime(activity.timestamp)}</div>
                </div>
            </div>
        `).join('');
        recentActivitiesContainer.innerHTML = activitiesHTML;
    }

    formatDateTime(timestamp) {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}/${month}/${day} ${hours}:${minutes}`;
    }

    updateUI() {
        this.updateStats();
        this.updateBadges();
        this.updateRecentActivities();
    }

    // 主要修改：完成關卡時每次都記錄 level，badge 只記錄一次
    listenForUpdates() {
        window.addEventListener('levelStatusUpdated', async (event) => {
            console.log('關卡狀態更新:', event.detail);
            await this.loadUserData();
            this.updateUI();
            const countryNames = {
                france: '法國',
                japan: '日本',
                korea: '韓國',
                usa: '美國',
                india: '印度',
                taiwan: '台灣'
            };
            const badgeNames = {
                france: '法國美食探索者',
                japan: '日本禮儀達人',
                korea: '韓國文化探索者',
                usa: '美式餐桌達人',
                india: '印度文化探索者',
                taiwan: '台灣美食達人'
            };
            // 每次都記錄 level 活動（即時時間）
            await this.recordActivity({
                type: 'level',
                title: `完成${countryNames[event.detail.level]}互動關卡`,
                country: event.detail.level
            });
            // 只有首次完成該國家才記錄 badge 活動
            if (event.detail.status === 'completed') {
                const hasBadge = await this.hasBadgeActivity(event.detail.level);
                if (!hasBadge) {
                    await this.recordActivity({
                        type: 'badge',
                        title: `獲得「${badgeNames[event.detail.level]}」徽章`,
                        country: event.detail.level
                    });
                }
            }
        });
        // 新增 quizStatusUpdated 事件監聽，及時刷新活動
        window.addEventListener('quizStatusUpdated', async () => {
            await this.loadUserActivities();
            this.updateRecentActivities();
        });
        auth.onAuthStateChanged((user) => {
            if (user !== this.currentUser) {
                this.currentUser = user;
                if (user) {
                    this.initialize();
                } else {
                    this.showGuestMode();
                }
            }
        });
    }

    showGuestMode() {
        const countries = ['france', 'japan', 'korea', 'usa', 'india', 'taiwan'];
        countries.forEach(country => {
            const badge = document.getElementById(`badge-${country}`);
            if (badge) {
                badge.classList.add('badge-locked');
                const icon = badge.querySelector('.badge-icon');
                const lock = badge.querySelector('.badge-lock');
                if (icon) icon.classList.add('badge-locked');
                if (lock) lock.style.display = '';
            }
        });
        const unlockedElement = document.getElementById('unlockedCountryCount');
        const percentElement = document.getElementById('completionPercent');
        if (unlockedElement) unlockedElement.textContent = '0';
        if (percentElement) percentElement.textContent = '0%';
        const recentActivities = document.querySelector('.recent-activities');
        if (recentActivities) {
            recentActivities.innerHTML = `
                <div class="activity-item">
                    <div class="activity-icon" style="background:#f0f0f0">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">請登入以查看您的個人成就</div>
                        <div class="activity-time">訪客模式</div>
                    </div>
                </div>
            `;
        }
    }

    showError(message) {
        const recentActivities = document.querySelector('.recent-activities');
        if (recentActivities) {
            recentActivities.innerHTML = `
                <div class="activity-item">
                    <div class="activity-icon" style="background:#ffebee">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">${message}</div>
                        <div class="activity-time">錯誤</div>
                    </div>
                </div>
            `;
        }
    }
}

export { AchievementManager }; 