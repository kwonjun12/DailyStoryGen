// 1. 내일 날짜 계산
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);

// 설정 기본값
const config = {
    date: tomorrow,
    accentColor: '#EF4444', // 기본값: 빨강
    fontScale: 1.0,
    colors: [
        '#EF4444', '#F97316', '#FACC15', '#84CC16', '#22C55E', '#14B8A6',
        '#06B6D4', '#3B82F6', '#6366F1', '#A855F7', '#EC4899', '#FFFFFF'
    ]
};

// DOM 요소
const canvas = document.getElementById('thumbnailCanvas');
const ctx = canvas.getContext('2d');
const dateInput = document.getElementById('dateInput');
const colorGrid = document.getElementById('colorGrid');
const scaleInput = document.getElementById('scaleInput');
const scaleValue = document.getElementById('scaleValue');
const downloadBtn = document.getElementById('downloadBtn');

// Hex -> RGBA 변환
function hexToRgba(hex, alpha) {
    let c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length === 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        c = '0x' + c.join('');
        return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + alpha + ')';
    }
    return hex;
}

function formatDateForInput(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

// 메인 그리기 함수
function draw() {
    canvas.width = 1920;
    canvas.height = 1080;
    const width = canvas.width;
    const height = canvas.height;

    // 1. 배경
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0a0a0a');
    gradient.addColorStop(0.5, '#000000');
    gradient.addColorStop(1, '#050505');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 2. 비네팅
    const vignette = ctx.createRadialGradient(width/2, height/2, width/3, width/2, height/2, width);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.8)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    // 3. 날짜 텍스트
    const year = config.date.getFullYear();
    const month = String(config.date.getMonth() + 1).padStart(2, '0');
    const day = String(config.date.getDate()).padStart(2, '0');
    const dateString = `${year}.${month}.${day}`;

    // 4. 텍스트 스타일
    const fontSize = 340 * config.fontScale;
    ctx.font = `900 ${fontSize}px 'Inter', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 5. 그리기
    ctx.save();
    
    // 글로우 효과
    ctx.shadowColor = hexToRgba(config.accentColor, 0.6);
    ctx.shadowBlur = 60;
    
    // 글자색
    ctx.fillStyle = config.accentColor;
    ctx.fillText(dateString, width / 2, height / 2);
    
    // 선명도 보강
    ctx.shadowBlur = 10;
    ctx.fillText(dateString, width / 2, height / 2);

    ctx.restore();
}

// 색상 팔레트 생성 (커스텀 피커 추가됨)
function createColorPalette() {
    colorGrid.innerHTML = '';
    
    // 1. 기본 프리셋 버튼 생성
    config.colors.forEach(color => {
        const btn = document.createElement('button');
        btn.className = 'w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 focus:outline-none';
        btn.style.backgroundColor = color;
        btn.dataset.color = color; // 색상 값 저장
        
        btn.addEventListener('click', () => {
            config.accentColor = color;
            updateColorButtons();
            draw();
        });
        colorGrid.appendChild(btn);
    });

    // 2. 커스텀 컬러 피커 (+) 버튼 생성
    const customWrapper = document.createElement('div');
    customWrapper.className = 'relative w-8 h-8 rounded-full border-2 border-transparent hover:scale-110 transition-all duration-200 flex items-center justify-center bg-[#222] cursor-pointer overflow-hidden group';
    
    // 실제 컬러 인풋 (투명하게 덮어씌움)
    const input = document.createElement('input');
    input.type = 'color';
    input.className = 'absolute inset-0 w-[200%] h-[200%] opacity-0 cursor-pointer top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    input.value = config.accentColor;
    
    // 플러스 아이콘 (SVG)
    const icon = document.createElement('div');
    icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 group-hover:text-white transition-colors"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`;
    icon.className = 'pointer-events-none transition-opacity duration-200';

    // 이벤트 리스너
    input.addEventListener('input', (e) => {
        const newColor = e.target.value;
        config.accentColor = newColor;
        updateColorButtons();
        draw();
    });

    customWrapper.appendChild(input);
    customWrapper.appendChild(icon);
    colorGrid.appendChild(customWrapper);

    // 초기 상태 반영
    updateColorButtons();
}

// 버튼 상태 업데이트 (프리셋 vs 커스텀 구분)
function updateColorButtons() {
    const buttons = Array.from(colorGrid.children);
    const isCustomColor = !config.colors.includes(config.accentColor); // 현재 색이 프리셋에 없는지 확인

    buttons.forEach((btn, index) => {
        // 마지막 요소는 커스텀 피커
        if (index === buttons.length - 1) {
            const icon = btn.querySelector('div'); // SVG 아이콘 래퍼
            
            if (isCustomColor) {
                // 커스텀 색상이 선택된 경우
                btn.style.backgroundColor = config.accentColor;
                btn.style.borderColor = '#fff';
                btn.classList.add('scale-110', 'ring-2', 'ring-white/50');
                if(icon) icon.style.opacity = '0'; // 플러스 아이콘 숨김
            } else {
                // 프리셋이 선택된 경우 (초기화)
                btn.style.backgroundColor = '#222';
                btn.style.borderColor = 'transparent';
                btn.classList.remove('scale-110', 'ring-2', 'ring-white/50');
                if(icon) icon.style.opacity = '1'; // 플러스 아이콘 보임
            }
        } 
        // 프리셋 버튼들
        else {
            const color = config.colors[index];
            // 현재 선택된 색상인지 확인 (대소문자 무시 비교)
            if (config.accentColor.toLowerCase() === color.toLowerCase()) {
                btn.style.borderColor = '#fff';
                btn.classList.add('scale-110', 'ring-2', 'ring-white/50');
            } else {
                btn.style.borderColor = 'transparent';
                btn.classList.remove('scale-110', 'ring-2', 'ring-white/50');
            }
        }
    });
}

function addEventListeners() {
    dateInput.addEventListener('change', (e) => {
        if(e.target.valueAsDate) {
            config.date = e.target.valueAsDate;
            draw();
        }
    });
    scaleInput.addEventListener('input', (e) => {
        config.fontScale = parseFloat(e.target.value);
        scaleValue.textContent = `${Math.round(config.fontScale * 100)}%`;
        draw();
    });
    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        const dateStr = formatDateForInput(config.date);
        link.download = `thumbnail_${dateStr}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}

window.addEventListener('load', () => {
    dateInput.value = formatDateForInput(tomorrow);
    createColorPalette();
    addEventListeners();
    document.fonts.ready.then(() => draw()).catch(() => draw());
    draw();
});
window.addEventListener('resize', draw);
