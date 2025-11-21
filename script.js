// 1. 내일 날짜 계산
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);

// 설정 기본값
const config = {
    date: tomorrow,
    accentColor: '#EF4444', // 텍스트: 빨강
    backgroundColor: '#000000', // 배경: 검정
    fontScale: 1.0,
    // 기본 프리셋 색상들
    colors: [
        '#EF4444', '#F97316', '#FACC15', '#84CC16', '#22C55E', '#14B8A6',
        '#06B6D4', '#3B82F6', '#6366F1', '#A855F7', '#EC4899', '#FFFFFF',
        '#000000'
    ]
};

// DOM 요소
const canvas = document.getElementById('thumbnailCanvas');
const ctx = canvas.getContext('2d');
const dateInput = document.getElementById('dateInput');
const colorGrid = document.getElementById('colorGrid');     // 텍스트용 그리드
const bgColorGrid = document.getElementById('bgColorGrid'); // 배경용 그리드
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

    // 1. 배경 그리기 (단색: Solid Color)
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // 2. 노이즈 텍스처 (질감 추가) - 유지
    ctx.save();
    ctx.globalAlpha = 0.03;
    ctx.fillStyle = '#ffffff';
    for(let i=0; i<width; i+=10) { 
        for(let j=0; j<height; j+=10) {
            if(Math.random() > 0.5) ctx.fillRect(i, j, 2, 2);
        }
    }
    ctx.restore();

    // 3. 비네팅 (그라디언트 효과) - 제거됨

    // 4. 날짜 텍스트
    const year = config.date.getFullYear();
    const month = String(config.date.getMonth() + 1).padStart(2, '0');
    const day = String(config.date.getDate()).padStart(2, '0');
    const dateString = `${year}.${month}.${day}`;

    // 5. 폰트 스타일
    const fontSize = 340 * config.fontScale;
    ctx.font = `900 ${fontSize}px 'Inter', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 6. 그리기
    ctx.save();
    ctx.shadowColor = hexToRgba(config.accentColor, 0.6);
    ctx.shadowBlur = 60;
    ctx.fillStyle = config.accentColor;
    ctx.fillText(dateString, width / 2, height / 2);
    ctx.shadowBlur = 10; // 선명도 보강
    ctx.fillText(dateString, width / 2, height / 2);
    ctx.restore();
}

// 팔레트 생성 헬퍼 함수
function renderPalette(container, type) {
    container.innerHTML = ''; 

    // 타겟 설정 (text or bg)
    const isText = type === 'text';
    const currentVal = isText ? config.accentColor : config.backgroundColor;

    // 1. 프리셋 버튼 생성
    config.colors.forEach(color => {
        const btn = document.createElement('button');
        btn.className = 'w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 focus:outline-none';
        btn.style.backgroundColor = color;
        
        // 배경이 흰색이면 테두리 보이게
        if (!isText && color === '#FFFFFF') {
            btn.style.borderColor = '#333';
        } else {
            btn.style.borderColor = 'transparent';
        }

        // 현재 선택된 색상 하이라이트
        if (currentVal.toLowerCase() === color.toLowerCase()) {
            btn.style.borderColor = '#fff';
            btn.classList.add('scale-110', 'ring-2', 'ring-white/50');
        }

        btn.addEventListener('click', () => {
            if (isText) config.accentColor = color;
            else config.backgroundColor = color;
            
            renderPalette(colorGrid, 'text');
            renderPalette(bgColorGrid, 'bg');
            draw();
        });

        container.appendChild(btn);
    });

    // 2. 커스텀 (+) 버튼 생성
    const customWrapper = document.createElement('div');
    customWrapper.className = 'relative w-8 h-8 rounded-full border-2 border-transparent hover:scale-110 transition-all duration-200 flex items-center justify-center bg-[#222] cursor-pointer overflow-hidden group';
    
    // 현재 커스텀 색상인지 확인
    const isCustom = !config.colors.includes(currentVal);
    
    if (isCustom) {
        customWrapper.style.backgroundColor = currentVal;
        customWrapper.style.borderColor = '#fff';
        customWrapper.classList.add('ring-2', 'ring-white/50');
    }

    // Color Input (숨김)
    const input = document.createElement('input');
    input.type = 'color';
    input.className = 'absolute inset-0 w-[200%] h-[200%] opacity-0 cursor-pointer top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    input.value = currentVal;

    // (+) 아이콘
    const icon = document.createElement('div');
    icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 group-hover:text-white transition-colors"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`;
    icon.className = 'pointer-events-none transition-opacity duration-200';
    
    if (isCustom) {
        icon.style.opacity = '0'; 
    }

    input.addEventListener('input', (e) => {
        if (isText) config.accentColor = e.target.value;
        else config.backgroundColor = e.target.value;
        
        renderPalette(colorGrid, 'text');
        renderPalette(bgColorGrid, 'bg');
        draw();
    });

    customWrapper.appendChild(input);
    customWrapper.appendChild(icon);
    container.appendChild(customWrapper);
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

// 초기화
window.addEventListener('load', () => {
    dateInput.value = formatDateForInput(tomorrow);
    
    renderPalette(colorGrid, 'text');
    renderPalette(bgColorGrid, 'bg');
    
    addEventListeners();
    
    document.fonts.ready.then(() => draw()).catch(() => draw());
    draw();
});

window.addEventListener('resize', draw);
