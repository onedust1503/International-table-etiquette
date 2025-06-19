import { quizStatusManager } from './quizStatus.js';
import { auth } from './firebase-config.js';

// 初始化關卡功能
import { QuizHandler } from './quiz.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 初始化所有測驗 Modal
    const quizModals = document.querySelectorAll('.quiz-modal');
    
    quizModals.forEach(modal => {
        const country = modal.id.replace('QuizModal', '').toLowerCase();
        let quizHandler = null;
        
        // 當 Modal 打開時初始化測驗
        modal.addEventListener('show.bs.modal', () => {
            console.log(`Initializing quiz for ${country}`);
            quizHandler = new QuizHandler(country);
        });
        
        // 當 Modal 關閉時重置測驗
        modal.addEventListener('hidden.bs.modal', () => {
            if (quizHandler) {
                quizHandler.resetQuiz();
            }
        });
    });

    // 標記已完成的 quiz 測驗卡片
    async function updateQuizStatusCards() {
        const user = auth.currentUser;
        // 先全部重設
        document.querySelectorAll('.levels-grid .level-card').forEach(card => {
            card.classList.remove('completed-card');
            const statusEl = card.querySelector('.level-status');
            if (statusEl) {
                statusEl.textContent = '未開始';
                statusEl.classList.remove('completed');
            }
        });
        if (!user) return;
        const quizStatus = await quizStatusManager.getAllQuizStatus(user.uid);
        console.log('quizStatus', quizStatus);
        Object.keys(quizStatus).forEach(country => {
            const status = quizStatus[country]?.status;
            console.log('country', country, 'status', status);
            if (status === 'completed') {
                const card = document.querySelector(`.levels-grid .level-card[data-bs-target='#${country}QuizModal']`);
                console.log('country', country, 'card', card);
                if (card) {
                    card.classList.add('completed-card');
                    const statusEl = card.querySelector('.level-status');
                    if (statusEl) {
                        statusEl.textContent = '已完成';
                        statusEl.classList.add('completed');
                    }
                }
            }
        });
    }

    auth.onAuthStateChanged(updateQuizStatusCards);
    window.addEventListener('quizStatusUpdated', updateQuizStatusCards);
}); 