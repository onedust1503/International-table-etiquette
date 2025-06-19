// 導覽列功能
export function initNavigation() {
    // 創建漢堡選單按鈕
    createMobileMenu();
    
    // 添加導覽列事件監聽
    addNavigationListeners();
}

function createMobileMenu() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelector('.nav-links');
    
    // 創建漢堡選單按鈕
    const menuToggle = document.createElement('button');
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    
    // 添加點擊事件
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('show');
    });
    
    navbar.appendChild(menuToggle);
}

function addNavigationListeners() {
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // 如果不是登出按鈕
            if (!link.classList.contains('logout-btn')) {
                e.preventDefault();
                
                // 移除所有活動狀態
                navLinks.forEach(l => l.classList.remove('active'));
                
                // 添加活動狀態到當前連結
                link.classList.add('active');
                
                // 處理導航
                handleNavigation(link.getAttribute('href'));
            }
        });
    });
}

function handleNavigation(path) {
    if (path && path !== '#') {
        window.location.href = path;
    }
}

// 監聽視窗大小變化
window.addEventListener('resize', () => {
    const navLinks = document.querySelector('.nav-links');
    const menuButton = document.querySelector('.menu-toggle');
    
    // 如果視窗寬度大於 768px，重置選單狀態
    if (window.innerWidth > 768) {
        navLinks.classList.remove('active');
        menuButton.innerHTML = '<i class="fas fa-bars"></i>';
    }
}); 