// 導覽列功能
export function initNavigation() {
    // 創建漢堡選單按鈕
    createMobileMenu();
    
    // 添加導覽列事件監聽
    addNavigationListeners();
    
    // 處理登出按鈕
    handleLogout();
}

function createMobileMenu() {
    const navbar = document.querySelector('.navbar');
    const menuButton = document.createElement('button');
    menuButton.className = 'menu-toggle';
    menuButton.innerHTML = '<i class="fas fa-bars"></i>';
    navbar.insertBefore(menuButton, navbar.querySelector('.nav-links'));

    // 漢堡選單點擊事件
    menuButton.addEventListener('click', () => {
        const navLinks = navbar.querySelector('.nav-links');
        navLinks.classList.toggle('active');
        menuButton.innerHTML = navLinks.classList.contains('active') 
            ? '<i class="fas fa-times"></i>' 
            : '<i class="fas fa-bars"></i>';
    });
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
    // 這裡可以添加路由邏輯
    // 例如：使用 History API 或觸發頁面切換
    console.log('Navigating to:', path);
}

function handleLogout() {
    const logoutBtn = document.querySelector('.logout-btn');
    
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        try {
            // 這裡可以添加登出邏輯
            // 例如：清除 session、呼叫登出 API 等
            
            // 導向登入頁
            window.location.href = 'login.html';
        } catch (error) {
            console.error('登出失敗:', error);
        }
    });
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