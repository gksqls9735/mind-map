import { defineConfig } from 'vite'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron/simple'
import { fileURLToPath } from 'node:url'

// __dirname을 ES Module 방식으로 정의
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(),
  electron({
    main: {
      entry: 'electron/main.ts' // Electron의 메인 프로세스 파일
    },
    preload: {
      input: path.join(__dirname, 'electron/preload.ts')  // Preload 스크립트 파일
    },
    renderer: {},// 렌더러 프로세스에 Node.js API를 사용할 수 있게 설정
  })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
})