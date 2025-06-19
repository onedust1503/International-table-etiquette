import { quizzes } from './quizzes.js';
import { levelStatusManager } from './levelStatus.js';
import { quizStatusManager } from './quizStatus.js';
import { auth, db } from './firebase-config.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export class QuizHandler {
    constructor(country) {
        this.country = country;
        this.questions = quizzes[country];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.answers = [];
        
        // DOM 元素
        this.questionContainer = document.querySelector(`#${country}QuestionContainer`);
        this.nextButton = document.querySelector(`#${country}NextButton`);
        this.currentQuestionSpan = document.querySelector(`#${country}CurrentQuestion`);
        this.resultContainer = document.querySelector(`#${country}ResultContainer`);
        this.scoreDisplay = document.querySelector(`#${country}ScoreDisplay`);
        this.feedbackText = document.querySelector(`#${country}FeedbackText`);
        this.retryButton = document.querySelector(`#${country}RetryButton`);
        this.levelCard = document.querySelector(`.level-card[data-level="${country}"]`);
        
        // 綁定事件
        this.nextButton.addEventListener('click', () => this.handleNext());
        this.retryButton.addEventListener('click', () => this.resetQuiz());
        
        // 初始化第一題
        this.showQuestion();
    }
    
    showQuestion() {
        const question = this.questions[this.currentQuestionIndex];
        
        // 更新問題計數
        this.currentQuestionSpan.textContent = this.currentQuestionIndex + 1;
        
        // 創建問題內容
        const questionHTML = `
            <div class="quiz-question mb-4">
                ${question.question}
            </div>
            <div class="quiz-options">
                ${question.options.map((option, index) => `
                    <div class="quiz-option" data-index="${index}">
                        ${option}
                    </div>
                `).join('')}
            </div>
        `;
        
        console.log('Generated questionHTML:', questionHTML);
        console.log('Question container:', this.questionContainer);

        this.questionContainer.innerHTML = questionHTML;
        
        // 添加選項點擊事件
        const options = this.questionContainer.querySelectorAll('.quiz-option');
        options.forEach(option => {
            option.addEventListener('click', () => {
                options.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                this.nextButton.disabled = false;
            });
        });
        
        // 禁用下一題按鈕，直到選擇答案
        this.nextButton.disabled = true;
    }
    
    handleNext() {
        const selectedOption = this.questionContainer.querySelector('.quiz-option.selected');
        if (!selectedOption) return;
        
        // 記錄答案
        const answer = parseInt(selectedOption.dataset.index);
        this.answers.push(answer);
        
        // 檢查答案
        if (answer === this.questions[this.currentQuestionIndex].correct) {
            this.score++;
        }
        
        // 前進到下一題或顯示結果
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex < this.questions.length) {
            this.showQuestion();
        } else {
            this.showResult();
        }
    }
    
    async showResult() {
        // 隱藏問題容器，顯示結果容器
        this.questionContainer.parentElement.style.display = 'none';
        this.resultContainer.style.display = 'block';

        // 顯示分數
        this.scoreDisplay.textContent = this.score;

        // 根據分數給出反饋
        const percentage = (this.score / this.questions.length) * 100;
        let feedback = '';
        
        if (percentage === 100) {
            feedback = '太棒了！你完全掌握了這個國家的餐桌禮儀文化！';
        } else if (percentage >= 80) {
            feedback = '做得很好！你對這個國家的餐桌禮儀有很好的理解。';
        } else if (percentage >= 60) {
            feedback = '不錯的表現！但還有改進的空間。';
        } else {
            feedback = '建議你再多了解一下這個國家的餐桌禮儀文化。';
        }
        this.feedbackText.textContent = feedback;

        // 記錄測驗完成狀態
        await this.markQuizCompleted();
    }

    getCountryName(country) {
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

    async markQuizCompleted() {
        try {
            const user = auth.currentUser;
            console.log('markQuizCompleted user:', user, 'country:', this.country);
            if (user) {
                // 記錄 quiz 狀態與分數到 quizStatus 子集合
                if (quizStatusManager) {
                    await quizStatusManager.setQuizStatus(user.uid, this.country, {
                        status: 'completed',
                        score: this.score,
                        total: this.questions.length,
                        timestamp: Date.now()
                    });
                    console.log('quizStatus 寫入完成:', user.uid, this.country);
                    // 主動通知 UI 更新
                    window.dispatchEvent(new Event('quizStatusUpdated'));
                }
                // 新增 quiz 活動紀錄
                const activitiesRef = collection(db, 'users', user.uid, 'activities');
                const newActivity = {
                    type: 'quiz',
                    title: `完成${this.getCountryName(this.country)}文化知識測驗（${this.score}/${this.questions.length}分）`,
                    country: this.country,
                    score: this.score,
                    total: this.questions.length,
                    timestamp: Date.now(),
                    createdAt: new Date()
                };
                await addDoc(activitiesRef, newActivity);
                // 關卡狀態設為已完成
                if (levelStatusManager) {
                    await levelStatusManager.updateLevelStatus(user.uid, this.country, 'completed');
                    window.dispatchEvent(new Event('levelStatusUpdated'));
                }
            } else {
                console.warn('markQuizCompleted: user not found');
            }
        } catch (e) {
            console.error('Error marking quiz as completed:', e);
        }
        // 立即更新畫面（即使未登入也更新）
        if (this.levelCard) {
            const statusElement = this.levelCard.querySelector('.level-status');
            if (statusElement) {
                statusElement.textContent = '已完成';
                statusElement.className = 'level-status completed';
            }
        }
    }
    
    resetQuiz() {
        // 重置所有變量
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.answers = [];
        
        // 重置顯示
        this.questionContainer.parentElement.style.display = 'block';
        this.resultContainer.style.display = 'none';
        
        // 顯示第一題
        this.showQuestion();
    }
}

// 保持原本 QuizHandler 實作即可，無需更動
// 當 DOM 加載完成後初始化測驗
document.addEventListener('DOMContentLoaded', () => {
    // 為每個國家的測驗 Modal 添加初始化邏輯
    const countries = ['france', 'japan', 'korea', 'usa', 'india', 'taiwan'];
    
    countries.forEach(country => {
        const modal = document.querySelector(`#${country}QuizModal`);
        if (modal) {
            modal.addEventListener('show.bs.modal', () => {
                console.log(`Initializing quiz for ${country}`);
                const quiz = new QuizHandler(country);
                
                // 當 Modal 關閉時重置測驗
                modal.addEventListener('hidden.bs.modal', () => {
                    quiz.resetQuiz();
                });
            });
        }
    });
});