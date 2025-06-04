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

function updatePendingTasks(tasks) {
    const pendingTasksList = document.getElementById('pendingTasksList');
    if (!tasks || tasks.length === 0) {
        pendingTasksList.innerHTML = '<p class="no-tasks">目前沒有待完成的任務</p>';
        return;
    }

    pendingTasksList.innerHTML = tasks.map(task => `
        <div class="task-item" data-task-id="${task.id}">
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
            const taskId = item.getAttribute('data-task-id');
            handleTaskClick(taskId);
        });
    });
}

function handleTaskClick(taskId) {
    // 這裡可以添加任務點擊後的處理邏輯
    // 例如：跳轉到任務頁面或顯示任務詳情
    console.log('Task clicked:', taskId);
} 