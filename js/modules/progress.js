// 使用 Chart.js 創建進度圖表
export function initProgress(progressData) {
    const ctx = document.getElementById('progressChart').getContext('2d');
    
    // 設定圖表數據
    const data = {
        labels: ['亞洲', '歐洲', '美洲', '非洲', '大洋洲'],
        datasets: [{
            label: '學習進度',
            data: [
                progressData.asia || 0,
                progressData.europe || 0,
                progressData.america || 0,
                progressData.africa || 0,
                progressData.oceania || 0
            ],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)'
            ],
            borderWidth: 1
        }]
    };

    // 圖表配置
    const config = {
        type: 'radar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `完成度: ${context.raw}%`;
                        }
                    }
                }
            }
        }
    };

    // 創建圖表
    new Chart(ctx, config);

    // 更新徽章
    updateBadges(progressData.badges || []);
}

function updateBadges(badges) {
    const badgesList = document.getElementById('badgesList');
    const totalBadges = [
        { id: 'asia', name: '亞洲美食大師' },
        { id: 'europe', name: '歐洲禮儀專家' },
        { id: 'america', name: '美洲文化通' },
        { id: 'africa', name: '非洲傳統守護者' },
        { id: 'oceania', name: '大洋洲探索者' }
    ];

    badgesList.innerHTML = totalBadges.map(badge => `
        <div class="badge-item ${badges.includes(badge.id) ? '' : 'locked'}" 
             title="${badge.name}">
            <img src="images/badges/${badge.id}.png" 
                 alt="${badge.name}"
                 ${badges.includes(badge.id) ? '' : 'style="opacity: 0.5;"'}>
        </div>
    `).join('');
} 