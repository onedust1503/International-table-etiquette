// 測驗狀態管理（記錄每次作答分數與狀態）
import { db } from './firebase-config.js';
import { doc, setDoc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

class QuizStatusManager {
    async setQuizStatus(userId, country, data) {
        // data: { status: 'completed', score: 7, total: 10, timestamp: 1688888888888 }
        await setDoc(doc(db, 'users', userId, 'quizStatus', country), data, { merge: true });
        try {
            // 動態 import，避免循環依賴
            const { levelStatusManager } = await import('./levelStatus.js');
            // Firestore 路徑正確: users/{userId} 文件，levels 為物件欄位
            await levelStatusManager.updateLevelStatus(userId, country, 'completed');
            // 觸發 UI 及時同步
            window.dispatchEvent(new Event('levelStatusUpdated'));
        } catch (e) {
            // ignore
        }
    }
    async getQuizStatus(userId, country) {
        const snap = await getDoc(doc(db, 'users', userId, 'quizStatus', country));
        return snap.exists() ? snap.data() : null;
    }
    async getAllQuizStatus(userId) {
        // 取得所有 quiz 狀態
        const col = collection(db, 'users', userId, 'quizStatus');
        const snap = await getDocs(col);
        const result = {};
        snap.forEach(docSnap => {
            result[docSnap.id] = docSnap.data();
        });
        return result;
    }
}

export const quizStatusManager = new QuizStatusManager();
