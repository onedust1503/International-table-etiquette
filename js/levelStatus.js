import { auth, db } from './firebase-config.js';
import { doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 關卡狀態管理類
class LevelStatusManager {
    constructor() {
        this.levels = {
            france: 'not_started',
            japan: 'not_started',
            korea: 'not_started',
            usa: 'not_started',
            india: 'not_started',
            taiwan: 'not_started'
        };
        this.initialized = false;
    }

    // 初始化用戶的關卡狀態
    async initializeUserLevels(userId) {
        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            const defaultLevels = {
                france: 'not_started',
                japan: 'not_started',
                korea: 'not_started',
                usa: 'not_started',
                india: 'not_started',
                taiwan: 'not_started'
            };
            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData.levels) {
                    this.levels = userData.levels;
                } else {
                    this.levels = { ...defaultLevels };
                    await setDoc(doc(db, 'users', userId), { levels: { ...defaultLevels } }, { merge: true });
                }
            } else {
                this.levels = { ...defaultLevels };
                await setDoc(doc(db, 'users', userId), { levels: { ...defaultLevels } });
            }
            this.initialized = true;
        } catch (error) {
            console.error('初始化關卡狀態失敗:', error);
            throw error;
        }
    }

    // 更新關卡狀態
    async updateLevelStatus(userId, level, status) {
        try {
            if (!this.initialized) {
                await this.initializeUserLevels(userId);
            }
            if (!Object.prototype.hasOwnProperty.call(this.levels, level)) {
                throw new Error(`無效的關卡名稱: ${level}`);
            }
            this.levels[level] = status;
            await updateDoc(doc(db, 'users', userId), {
                [`levels.${level}`]: status
            });
            const event = new CustomEvent('levelStatusUpdated', {
                detail: {
                    level,
                    status,
                    allLevels: { ...this.levels }
                }
            });
            window.dispatchEvent(event);
            if (typeof window.updateBadges === 'function') {
                window.updateBadges(this.levels);
            }
            return true;
        } catch (error) {
            console.error('更新關卡狀態失敗:', error);
            throw error;
        }
    }

    // 獲取關卡狀態
    async getLevelStatus(userId, level) {
        try {
            if (!this.initialized) {
                await this.initializeUserLevels(userId);
            }
            return this.levels[level];
        } catch (error) {
            console.error('獲取關卡狀態失敗:', error);
            throw error;
        }
    }

    // 獲取所有關卡狀態
    async getAllLevelStatus(userId) {
        try {
            if (!this.initialized) {
                await this.initializeUserLevels(userId);
            }
            return this.levels;
        } catch (error) {
            console.error('獲取所有關卡狀態失敗:', error);
            throw error;
        }
    }
}

// 導出單例實例
export const levelStatusManager = new LevelStatusManager();