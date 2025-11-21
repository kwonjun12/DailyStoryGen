// 1. 내일 날짜 계산
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);

// 설정 기본값
const config = {
    date: tomorrow,
    accentColor: '#EF4444', // 텍스트 기본값: 빨강
    backgroundColor: '#000000', // 배경 기본값: 검정
    fontScale: 1.0,
    colors: [
        '#EF4444', '#F97316', '#FACC15', '#84CC16', '#22C55E', '#14B8A6',
        '#06B6D4', '#3B82F6', '#6366F1', '#A855F7', '#EC4899', '#FFFFFF',
        '#000000' // 배경용 검정 추가
    ]
};

// DOM 요소
const canvas = document.getElementById('thumbnailCanvas');
const ctx = canvas.getContext('2d');
const dateInput = document.getElementById('dateInput');
const colorGrid = document.getElementById('colorGrid'); // 텍스트 색상 그리드
const bgColorGrid = document.getElementById('bgColorGrid'); // 배경 색상 그리드
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

    // 1. 배경 그리기 (선택한 색상 기반 그라디언트)
    const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
    
    if (config.backgroundColor === '#000000') {
        // 완전 검정일 때: 고급스러운 다크 그라디언트
        bgGradient.addColorStop(0, '#1a1a1a');
        bgGradient.addColorStop(1, '#000000');
    } else {
        // 다른 색상일 때: 중심은 밝게, 외곽은 어둡게 (고급스러운 느낌 유지)
        bgGradient.addColorStop(0, config.backgroundColor); // 중심: 선택한 색
        bgGradient.addColorStop(1, '#000000'); // 외곽: 검정으로 빠짐
    }
    
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 2. 노이즈 패턴 (질감 추가)
    // 아주 미세하게 노이즈를 추가해 디지털 느낌을 줄임
    ctx.globalAlpha = 0.03;
    ctx.fillStyle = '#ffffff';
    for(let i=0; i<width; i+=4) {
        for(let j=0; j<height; j+=4) {
            if(Math.random() > 0.5) ctx.fillRect(i, j, 2, 2);
        }
    }
    ctx.globalAlpha = 1.0;

    // 3. 비네팅 (가장자리 더 어둡게)
    const vignette = ctx.createRadialGradient(width/2, height/2, width/3, width/2, height/2, width);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(0.8, 'rgba(0,0,0,0.4)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.9)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    // 4. 날짜 텍스트
    const year = config.date.getFullYear();
    const month = String(config.date.getMonth() + 1).padStart(2, '0');
    const day = String(config.date.getDate()).padStart(2, '0');
    const dateString = `${year}.${month}.${day}`;

    // 5. 텍스트 스타일
    const fontSize = 340 * config.fontScale;
    ctx.font = `900 ${fontSize}px 'Inter', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 6. 텍스트 그리기
    ctx.save();
    
    // 배경이 밝으면 그림자를 진하게, 배경이 어두우면 글로우를 밝게
    // (여기서는 일관된 네온 스타일을 위해 글로우 유지)
    ctx.shadowColor = hexToRgba(config.accentColor, 0.8);
    ctx.shadowBlur = 80;
    
    ctx.fillStyle = config.accentColor;
    ctx.fillText(dateString, width / 2, height / 2);
    
    ctx.shadowBlur = 15;
    ctx.fillText(dateString, width / 2, height / 2);

    ctx.restore();
}

// 공통 팔레트 생성 함수 (타입: 'text' 또는 'bg')
function createPalette(type, container) {
    container.innerHTML = '';
    
    const targetConfigKey = type === 'text' ? 'accentColor' : 'backgroundColor';
    
    // 1. 프리셋 버튼
    config.colors.forEach(color => {
        const btn = document.createElement('button');
        btn.className = 'w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 focus:outline-none';
        btn.style.backgroundColor = color;
        
        // 배경색 팔레트인데 색상이 흰색이면 테두리 추가 (잘 보이게)
        if(type === 'bg' && color === '#FFFFFF') {
            btn.style.border = '1px solid #333';
        }

        btn.addEventListener('click', () => {
            config[targetConfigKey] = color;
            updatePaletteUI(type, container);
            draw();
        });
        container.appendChild(btn);
    });

    // 2. 커스텀 피커 (+)
    const customWrapper = document.createElement('div');
    customWrapper.className = 'relative w-8 h-8 rounded-full border-2 border-transparent hover:scale-110 transition-all duration-200 flex items-center justify-center bg-[#222] cursor-pointer overflow-hidden group';
    
    const input = document.createElement('input');
    input.type = 'color';
    input.className = 'absolute inset-0 w-[200%] h-[200%] opacity-0 cursor-pointer top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    input.value = config[targetConfigKey];
    
    const icon = document.createElement('div');
    icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 group-hover:text-white transition-colors"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`;
    icon.className = 'pointer-events-none transition-opacity duration-200';

    input.addEventListener('input', (e) => {
        config[targetConfigKey] = e.target.value;
        updatePaletteUI(type, container);
        draw();
    });

    customWrapper.appendChild(input);
    customWrapper.appendChild(icon);
    container.appendChild(customWrapper);

    updatePaletteUI(type, container);
}

// 팔레트 UI 업데이트
function updatePaletteUI(type, container) {
    const targetColor = type === 'text' ? config.accentColor : config.backgroundColor;
    const buttons = Array.from(container.children);
    const isCustomColor = !config.colors.includes(targetColor);

    buttons.forEach((btn, index) => {
        // 마지막은 커스텀 피커
        if (index === buttons.length - 1) {
            const icon = btn.querySelector('div');
            if (isCustomColor) {
                btn.style.backgroundColor = targetColor;
                btn.style.borderColor = '#fff';
                btn.classList.add('scale-110', 'ring-2', 'ring-white/50');
                if(icon) icon.style.opacity = '0';
            } else {
                btn.style.backgroundColor = '#222';
                btn.style.borderColor = 'transparent';
                btn.classList.remove('scale-110', 'ring-2', 'ring-white/50');
                if(icon) icon.style.opacity = '1';
            }
        } else {
            const color = config.colors[index];
            if (targetColor.toLowerCase() === color.toLowerCase()) {
                btn.style.borderColor = '#fff';
                btn.classList.add('scale-110', 'ring-2', 'ring-white/50');
            } else {
                // 흰색 배경일 때만 테두리 유지, 아니면 투명
                btn.style.borderColor = (type === 'bg' && color === '#FFFFFF') ? '#333' : 'transparent';
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
    
    // 두 개의 팔레트 생성
    createPalette('text', colorGrid);
    createPalette('bg', bgColorGrid);
    
    addEventListeners();
    document.fonts.ready.then(() => draw()).catch(() => draw());
    draw();
});

window.addEventListener('resize', draw);
