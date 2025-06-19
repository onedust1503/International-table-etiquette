import { auth } from '../firebase-config.js';
import { levelStatusManager } from '../levelStatus.js';
import { quizStatusManager } from '../quizStatus.js';

// 初始化任務系統
export function initTasks(tasksData) {
    updateDailyChallenge(tasksData.dailyChallenge);
    updatePendingTasks(tasksData.pendingTasks);
}

function updateDailyChallenge(challenge) {
    const dailyTask = document.getElementById('dailyTask');
    if (!challenge) return;

    dailyTask.innerHTML = `
        <div class="task-card">
            <h4>
                <i class="fas ${challenge.icon}"></i>
                ${challenge.title}
            </h4>
            <p class="task-description">${challenge.description}</p>
            <div class="task-progress">
                <div class="progress-bar" style="width: ${challenge.progress}%"></div>
            </div>
        </div>
    `;

    // 添加點擊事件
    dailyTask.querySelector('.task-card').addEventListener('click', () => {
        window.location.href = challenge.link;
    });
}

function getLevelPage(country) {
    const map = {
        france: 'French Level.html',
        japan: 'Japan Level.html',
        korea: 'Korea Level.html',
        usa: 'USA Level.html',
        india: 'India Level.html',
        taiwan: 'Taiwan Level.html'
    };
    return map[country] || 'levels.html';
}

export async function fetchAndShowPendingTasks() {
    const pendingTasksList = document.getElementById('pendingTasksList');
    console.log('fetchAndShowPendingTasks called, currentUser:', auth.currentUser);
    if (!auth.currentUser) {
        pendingTasksList.innerHTML = '<p class="no-tasks">請先登入以查看待完成任務</p>';
        return;
    }
    const userId = auth.currentUser.uid;
    const countries = ['france', 'japan', 'korea', 'usa', 'india', 'taiwan'];
    // 取得互動關卡狀態
    const levelStatus = await levelStatusManager.getAllLevelStatus(userId);
    console.log('levelStatus:', levelStatus);
    // 取得 quiz 測驗狀態
    const quizStatus = await quizStatusManager.getAllQuizStatus(userId);
    console.log('quizStatus:', quizStatus);
    const tasks = [];
    countries.forEach(country => {
        // 互動關卡未完成
        if (levelStatus[country] !== 'completed') {
            tasks.push({
                id: `level-${country}`,
                icon: 'fa-trophy',
                title: `完成${getCountryName(country)}互動關卡`,
                description: `體驗${getCountryName(country)}的餐桌文化互動關卡`,
                link: getLevelPage(country)
            });
        }
        // quiz 測驗未完成
        if (!quizStatus[country] || quizStatus[country].status !== 'completed') {
            tasks.push({
                id: `quiz-${country}`,
                icon: 'fa-check',
                title: `完成${getCountryName(country)}文化知識測驗`,
                description: `挑戰${getCountryName(country)}的餐桌文化知識測驗`,
                link: `#${country}QuizModal`
            });
        }
    });
    console.log('pending tasks:', tasks);
    updatePendingTasks(tasks);
}

function getCountryName(country) {
    const names = {
        france: '法國',
        japan: '日本',
        korea: '韓國',
        usa: '美國',
        india: '印度',
        taiwan: '台灣'
    };
    return names[country] || country;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function updatePendingTasks(tasks) {
    const pendingTasksList = document.getElementById('pendingTasksList');
    console.log('updatePendingTasks:', tasks);
    if (!tasks || tasks.length === 0) {
        pendingTasksList.innerHTML = '<p class="no-tasks">目前沒有待完成的任務</p>';
        return;
    }
    pendingTasksList.innerHTML = tasks.map(task => `
        <div class="task-item" data-task-id="${task.id}" data-link="${task.link}">
            <div class="task-icon">
                <i class="fas ${task.icon}"></i>
            </div>
            <div class="task-info">
                <h4>${task.title}</h4>
                <p>${task.description}</p>
            </div>
        </div>
    `).join('');
    // 添加點擊事件
    pendingTasksList.querySelectorAll('.task-item').forEach(item => {
        item.addEventListener('click', () => {
            const taskId = item.dataset.taskId;
            if (taskId && taskId.startsWith('quiz-')) {
                const country = taskId.replace('quiz-', '');
                window.location.href = `levels.html#${country}QuizModal`;
                return;
            }
            const link = item.getAttribute('data-link');
            if (link) {
                if (link.startsWith('#')) {
                    // 開啟 modal（僅限本頁）
                    const modal = document.querySelector(link);
                    if (modal) {
                        const modalInstance = bootstrap.Modal.getOrCreateInstance(modal);
                        modalInstance.show();
                    }
                } else {
                    window.location.href = link;
                }
            }
        });
    });
}

function handleTaskClick(taskId) {
    // 這裡可以添加任務點擊後的處理邏輯
    // 例如：跳轉到任務頁面或顯示任務詳情
    console.log('Task clicked:', taskId);
} 