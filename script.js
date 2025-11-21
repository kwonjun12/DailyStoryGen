// 설정 및 상태 관리
const config = {
    date: new Date(),
    accentColor: '#EF4444', // 기본 Red
    fontScale: 1.0,
    colors: [
        '#EF4444', '#F97316', '#FACC15', '#84CC16', '#22C55E', '#14B8A6',
        '#06B6D4', '#3B82F6', '#6366F1', '#A855F7', '#EC4899', '#FFFFFF'
    ]
};

// DOM 요소 선택
const canvas = document.getElementById('thumbnailCanvas');
const ctx = canvas.getContext('2d');
const dateInput = document.getElementById('dateInput');
const colorGrid = document.getElementById('colorGrid');
const scaleInput = document.getElementById('scaleInput');
const scaleValue = document.getElementById('scaleValue');
const downloadBtn = document.getElementById('downloadBtn');

// 캔버스 초기화
function initCanvas() {
    // 1920x1080 (FHD) 해상도 고정
    canvas.width = 1920;
    canvas.height = 1080;
}

// Helper: Hex -> RGBA 변환 (그림자용)
function hexToRgba(hex, alpha) {
    let c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length === 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + alpha + ')';
    }
    return hex;
}

// 그리기 함수
function draw() {
    const width = canvas.width;
    const height = canvas.height;

    // 1. 배경 (고급스러운 검정 그라디언트)
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0a0a0a'); // 아주 짙은 회색
    gradient.addColorStop(0.5, '#000000'); // 완전 검정
    gradient.addColorStop(1, '#050505'); 
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 2. 비네팅 효과 (가장자리 어둡게)
    const vignette = ctx.createRadialGradient(width/2, height/2, width/3, width/2, height/2, width);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.8)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    // 3. 날짜 텍스트 구성
    const year = config.date.getFullYear();
    const month = String(config.date.getMonth() + 1).padStart(2, '0');
    const day = String(config.date.getDate()).padStart(2, '0');
    const dateString = `${year}.${month}.${day}`;

    // 4. 폰트 설정
    const fontSize = 340 * config.fontScale; // 기본 340px
    ctx.font = `900 ${fontSize}px 'Inter', sans-serif`; // Inter 폰트, Extra Bold
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 5. 텍스트 그리기 (글로우 효과 + 그림자)
    ctx.save();
    
    // 네온 글로우 효과
    ctx.shadowColor = hexToRgba(config.accentColor, 0.6); // 액센트 컬러의 반투명 버전
    ctx.shadowBlur = 60; // 흐림 정도
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // 텍스트 색상
    ctx.fillStyle = config.accentColor;
    ctx.fillText(dateString, width / 2, height / 2);
    
    // 텍스트를 한 번 더 그려서 선명하게 (글로우 중심부 강화)
    ctx.shadowBlur = 10;
    ctx.fillText(dateString, width / 2, height / 2);

    ctx.restore();
}

// 색상 팔레트 생성
function createColorPalette() {
    config.colors.forEach(color => {
        const btn = document.createElement('button');
        btn.className = `w-10 h-10 rounded-full border-2 transition-all duration-200 hover:scale-110 focus:outline-none`;
        btn.style.backgroundColor = color;
        btn.style.borderColor = config.accentColor === color ? '#fff' : 'transparent';
        
        // 선택 효과
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

function updateColorButtons() {
    const buttons = colorGrid.children;
    Array.from(buttons).forEach((btn, index) => {
        const color = config.colors[index];
        if (config.accentColor === color) {
            btn.style.borderColor = '#fff';
            btn.classList.add('scale-110', 'shadow-lg');
        } else {
            btn.style.borderColor = 'transparent';
            btn.classList.remove('scale-110', 'shadow-lg');
        }
    });
}

// 이벤트 리스너 등록
function addEventListeners() {
    // 날짜 변경
    dateInput.addEventListener('change', (e) => {
        if(e.target.valueAsDate) {
            config.date = e.target.valueAsDate;
            draw();
        }
    });

    // 크기 변경
    scaleInput.addEventListener('input', (e) => {
        config.fontScale = parseFloat(e.target.value);
        scaleValue.textContent = `${Math.round(config.fontScale * 100)}%`;
        draw();
    });

    // 다운로드
    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        const dateStr = config.date.toISOString().split('T')[0];
        link.download = `thumbnail_${dateStr}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        // 버튼 클릭 애니메이션
        downloadBtn.classList.add('scale-95');
        setTimeout(() => downloadBtn.classList.remove('scale-95'), 150);
    });
}

// 초기화 실행
window.addEventListener('load', () => {
    initCanvas();
    createColorPalette();
    
    // 날짜 입력창 초기값 (오늘)
    dateInput.valueAsDate = new Date();
    
    addEventListeners();
    
    // 폰트 로딩 대기 후 그리기 (중요)
    document.fonts.ready.then(() => {
        draw();
    });
});

// 화면 리사이즈 시 캔버스 다시 그리기 (반응형 유지)
window.addEventListener('resize', draw);
