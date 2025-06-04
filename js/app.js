// 導入模組
import { initWorldMap } from './modules/worldMap.js';
import { initProgress } from './modules/progress.js';
import { initTasks } from './modules/tasks.js';
import { initTourGuide } from './modules/tourGuide.js';
import { initNavigation } from './modules/navigation.js';
import { getUserData } from './modules/userData.js';

// DOM 載入完成後初始化應用
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 初始化導覽列
        initNavigation();

        // 獲取使用者資料
        const userData = await getUserData();
        
        // 更新使用者名稱
        document.getElementById('userName').textContent = userData.name || '訪客';

        // 初始化世界地圖
        initWorldMap();

        // 初始化進度圖表
        initProgress(userData.progress);

        // 初始化任務
        initTasks(userData.tasks);

        // 檢查是否為首次登入
        if (userData.isFirstLogin) {
            initTourGuide();
        }

    } catch (error) {
        console.error('初始化失敗:', error);
        // 這裡可以添加錯誤處理的UI提示
    }
}); 