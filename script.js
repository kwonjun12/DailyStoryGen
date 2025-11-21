// 1. 내일 날짜 계산
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);

// 설정 기본값
const config = {
    date: tomorrow,      // 기본값: 내일
    accentColor: '#EF4444', // 기본값: 빨강
    fontScale: 1.0,
    colors: [
        '#EF4444', // Red
        '#F97316', // Orange
        '#FACC15', // Yellow
        '#84CC16', // Lime
        '#22C55E', // Green
        '#14B8A6', // Teal
        '#06B6D4', // Cyan
        '#3B82F6', // Blue
        '#6366F1', // Indigo
        '#A855F7', // Purple
        '#EC4899', // Pink
        '#FFFFFF'  // White
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

// 날짜를 YYYY-MM-DD 문자열로 변환 (Input value용)
function formatDateForInput(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

// 메인 그리기 함수
function draw() {
    // 캔버스 크기 고정 (FHD)
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

    // 3. 날짜 텍스트 생성
    const year = config.date.getFullYear();
    const month = String(config.date.getMonth() + 1).padStart(2, '0');
    const day = String(config.date.getDate()).padStart(2, '0');
    const dateString = `${year}.${month}.${day}`;

    // 4. 텍스트 스타일
    const fontSize = 340 * config.fontScale;
    ctx.font = `900 ${fontSize}px 'Inter', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 5. 텍스트 그리기
    ctx.save();
    
    // 글로우 효과
    ctx.shadowColor = hexToRgba(config.accentColor, 0.6);
    ctx.shadowBlur = 60;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // 글자색
    ctx.fillStyle = config.accentColor;
    ctx.fillText(dateString, width / 2, height / 2);
    
    // 선명도 보강
    ctx.shadowBlur = 10;
    ctx.fillText(dateString, width / 2, height / 2);

    ctx.restore();
}

// 색상 버튼 생성
function createColorPalette() {
    colorGrid.innerHTML = ''; // 초기화
    config.colors.forEach(color => {
        const btn = document.createElement('button');
        // 버튼 스타일 명시적 지정
        btn.className = 'w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 focus:outline-none';
        btn.style.backgroundColor = color;
        btn.style.borderColor = config.accentColor === color ? '#fff' : 'transparent';
        
        if (config.accentColor === color) {
            btn.classList.add('ring-2', 'ring-white/50', 'scale-110');
        }

        btn.addEventListener('click', () => {
            config.accentColor = color;
            updateColorButtons();
            draw();
        });

        colorGrid.appendChild(btn);
    });
}

// 버튼 상태 업데이트
function updateColorButtons() {
    const buttons = colorGrid.children;
    Array.from(buttons).forEach((btn, index) => {
        const color = config.colors[index];
        if (config.accentColor === color) {
            btn.style.borderColor = '#fff';
            btn.classList.add('scale-110', 'ring-2', 'ring-white/50');
        } else {
            btn.style.borderColor = 'transparent';
            btn.classList.remove('scale-110', 'ring-2', 'ring-white/50');
        }
    });
}

// 이벤트 리스너
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

// 초기화 (페이지 로드 시 즉시 실행)
window.addEventListener('load', () => {
    // 1. 날짜 입력창에 내일 날짜 세팅
    dateInput.value = formatDateForInput(tomorrow);
    
    // 2. UI 생성
    createColorPalette();
    addEventListeners();
    
    // 3. 폰트 로딩 확인 후 그리기 (안전장치)
    document.fonts.ready.then(() => {
        draw();
    }).catch(() => {
        // 폰트 로딩 실패해도 일단 그리기
        draw(); 
    });

    // 4. 즉시 그리기 (로딩 기다리지 않고 바로 시도)
    draw();
});

window.addEventListener('resize', draw);
