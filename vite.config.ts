// vite.config.ts 파일 (최종 통합 버전)

import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // 1. 환경 변수 로드
    const env = loadEnv(mode, '.', '');

    return {
      // 2. 🚨 GitHub Pages 배포 경로 설정 (가장 중요!)
      // 이 설정이 없으면 빌드된 자원(JS, CSS)을 찾지 못해 검은 화면이 뜹니다.
      base: '/DailyToryGen/', 
      
      // 3. 개발 서버 설정
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      
      // 4. 플러그인 설정
      plugins: [react()],
      
      // 5. 전역 상수 정의 (API 키 등)
      // 이 코드를 통해 .env 파일의 키를 브라우저 환경에서 사용할 수 있게 됩니다.
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      
      // 6. 경로 별칭 설정 (@/...)
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
      
      // 7. 추가적으로, 빌드 단계에서 TypeScript 에러를 무시하고 싶다면 
      // 다음 줄을 추가할 수 있습니다. (권장하지 않음, 디버깅 후 삭제 권장)
      // build: {
      //   minify: false,
      //   rollupOptions: {
      //     onwarn(warning, warn) {
      //       if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
      //         return;
      //       }
      //       warn(warning);
      //     },
      //   },
      // },

    };
});
