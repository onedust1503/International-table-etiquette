// 引入第三方庫
import { loadSVGMap } from '../utils/svgLoader.js';
import { culturalData } from '../data/culturalData.js';

let currentCountry = null;
const cultureCard = document.getElementById('cultureCard');
const cardContent = document.querySelector('.card-content');

export function initWorldMap() {
    // 載入世界地圖 SVG
    loadSVGMap('images/world-map.svg', '#worldMap').then(() => {
        // 為所有國家添加事件監聽器
        const countries = document.querySelectorAll('.country');
        countries.forEach(country => {
            country.addEventListener('click', handleCountryClick);
            country.addEventListener('mouseover', handleCountryHover);
        });
    });

    // 關閉按鈕事件
    const closeBtn = cultureCard.querySelector('.close-btn');
    closeBtn.addEventListener('click', closeCultureCard);

    // 點擊卡片外部關閉
    document.addEventListener('click', (e) => {
        if (!cultureCard.contains(e.target) && 
            !e.target.classList.contains('country')) {
            closeCultureCard();
        }
    });
}

function handleCountryClick(e) {
    const countryCode = e.target.getAttribute('data-country');
    const countryData = culturalData[countryCode];

    if (!countryData) return;

    // 更新當前選中的國家
    if (currentCountry) {
        currentCountry.classList.remove('active');
    }
    currentCountry = e.target;
    currentCountry.classList.add('active');

    // 更新文化卡片內容
    updateCultureCard(countryData);

    // 更換背景圖片
    document.body.style.backgroundImage = `url(${countryData.backgroundImage})`;
}

function handleCountryHover(e) {
    const countryCode = e.target.getAttribute('data-country');
    const countryData = culturalData[countryCode];

    if (countryData) {
        e.target.title = countryData.name;
    }
}

function updateCultureCard(data) {
    cardContent.innerHTML = `
        <div class="culture-info">
            <h3>${data.name}餐桌禮儀</h3>
            <img src="${data.image}" alt="${data.name}餐桌文化" class="culture-image">
            <p class="culture-description">${data.description}</p>
            <ul class="etiquette-list">
                ${data.etiquettes.map(item => `<li>${item}</li>`).join('')}
            </ul>
        </div>
    `;

    cultureCard.classList.remove('hidden');
    setTimeout(() => cultureCard.classList.add('show'), 10);
}

function closeCultureCard() {
    cultureCard.classList.remove('show');
    setTimeout(() => cultureCard.classList.add('hidden'), 300);

    if (currentCountry) {
        currentCountry.classList.remove('active');
        currentCountry = null;
    }

    // 恢復默認背景
    document.body.style.backgroundImage = '';
} 