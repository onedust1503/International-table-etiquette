// 導覽步驟配置
const tourSteps = [
    {
        element: '.passport-container',
        title: '文化探索護照',
        content: '這是您的文化探索護照，記錄了您的學習進度和成就。'
    },
    {
        element: '.world-map-container',
        title: '世界地圖',
        content: '點擊不同的國家或地區，探索各地的餐桌禮儀文化。'
    },
    {
        element: '.progress-container',
        title: '學習進度',
        content: '這裡顯示您在各個地區的學習進度和獲得的徽章。'
    },
    {
        element: '.daily-challenge',
        title: '每日挑戰',
        content: '完成每日推薦的學習任務，獲得額外獎勵。'
    },
    {
        element: '.pending-tasks',
        title: '待完成任務',
        content: '這裡列出了您尚未完成的學習任務。'
    }
];

let currentStep = 0;
const tourGuide = document.getElementById('tourGuide');
const tourContent = tourGuide.querySelector('.tour-content');
const nextButton = tourGuide.querySelector('.tour-next');
const skipButton = tourGuide.querySelector('.tour-skip');

export function initTourGuide() {
    showTourGuide();
    
    // 添加事件監聽器
    nextButton.addEventListener('click', nextStep);
    skipButton.addEventListener('click', endTour);

    // 點擊外部關閉導覽
    tourGuide.addEventListener('click', (e) => {
        if (e.target === tourGuide) {
            endTour();
        }
    });
}

function showTourGuide() {
    tourGuide.classList.remove('hidden');
    updateTourContent();
    highlightElement();
}

function updateTourContent() {
    const step = tourSteps[currentStep];
    const isLastStep = currentStep === tourSteps.length - 1;

    tourContent.querySelector('.tour-step').innerHTML = `
        <h3>${step.title}</h3>
        <p>${step.content}</p>
        <div class="tour-progress">步驟 ${currentStep + 1}/${tourSteps.length}</div>
    `;

    nextButton.textContent = isLastStep ? '完成' : '下一步';
}

function highlightElement() {
    // 移除之前的高亮
    document.querySelectorAll('.tour-highlight').forEach(el => {
        el.classList.remove('tour-highlight');
    });

    // 添加新的高亮
    const targetElement = document.querySelector(tourSteps[currentStep].element);
    if (targetElement) {
        targetElement.classList.add('tour-highlight');
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function nextStep() {
    if (currentStep < tourSteps.length - 1) {
        currentStep++;
        updateTourContent();
        highlightElement();
    } else {
        endTour();
    }
}

function endTour() {
    tourGuide.classList.add('hidden');
    document.querySelectorAll('.tour-highlight').forEach(el => {
        el.classList.remove('tour-highlight');
    });

    // 記錄導覽完成
    localStorage.setItem('tourCompleted', 'true');
} 