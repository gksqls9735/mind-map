import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs';

// __dirname을 ES Module 방식으로 정의
const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')


let win: BrowserWindow | null
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC!, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(process.env.DIST!, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)

// 저장 요청을 처리하는 리스너
ipcMain.on('save-file', (_event, data) => {
  // 다른 이름으로 저장 대화상자 열기
  dialog.showSaveDialog({
    title: '마인드맵 저장',
    defaultPath: 'my-mindmap.json',
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
    ]
  }).then(file => {
    if (!file.canceled && file.filePath) {
      // 사용자가 경로 선택 시, 데이터를 JSON 문자열로 변환하여 파일에 씀
      fs.writeFileSync(file.filePath.toString(), JSON.stringify(data, null, 2));
    }
  }).catch(e => {
    console.error(e)
  });
})

// 파일 요청(load)을 처리하는 리스너
ipcMain.handle('load-file', async () => {
  // 파일 열기 대화상자 열기
  const result = await dialog.showOpenDialog({
    title: '마인드맵 불러오기',
    properties: ['openFile'],
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
    ]
  });

  if (result.canceled || result.filePaths.length === 0) return null // 사용자가 취소 시 null

  const filePath = result.filePaths[0];
  try {
    // 파일 내용을 읽고, JSON으로 파싱하여 React로 반환
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (e) {
    console.error(e);
    return null;
  }
});