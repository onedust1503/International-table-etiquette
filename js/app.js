console.log('app.js loaded');
// 導入模組
import { initWorldMap } from './modules/worldMap.js';
import { initProgress } from './modules/progress.js';
import { fetchAndShowPendingTasks } from './modules/tasks.js';
import { initTourGuide } from './modules/tourGuide.js';
import { initNavigation } from './modules/navigation.js';
import { auth } from './firebase-config.js';
import { initAuth } from './auth.js';

// DOM 載入完成後初始化應用
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('開始初始化應用...');

        // 首先初始化認證系統
        initAuth();
        console.log('認證系統初始化完成');

        // 等待認證狀態確認
        await new Promise(resolve => {
            const unsubscribe = auth.onAuthStateChanged((user) => {
                console.log('初始認證狀態:', user ? '已登入' : '未登入');
                unsubscribe();
                resolve();
            });
        });

        // 初始化其他功能
        initNavigation();
        // initWorldMap(); // 首頁無 world map 區塊時不執行
        // initProgress(); // 首頁無進度圖表時不執行
        // 載入待完成任務
        fetchAndShowPendingTasks();
        // 即時刷新：完成關卡或測驗後自動更新
        window.addEventListener('levelStatusUpdated', fetchAndShowPendingTasks);
        window.addEventListener('quizStatusUpdated', fetchAndShowPendingTasks);

        // 檢查是否為首次登入
        const isFirstLogin = localStorage.getItem('isFirstLogin') !== 'false';
        if (isFirstLogin) {
            initTourGuide();
            localStorage.setItem('isFirstLogin', 'false');
        }

        console.log('應用初始化完成');
    } catch (error) {
        console.error('初始化失敗:', error);
        // 這裡可以添加錯誤處理的UI提示
    }
}); 