"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  /**
   * saveFile: 파일 저장 요청하기
   * 웹 페이지에서 window.electronAPI.saveFile({ nodes: [...], edges: [...] 호출
   * ipcRenderer.send('save-file', data) > 'save-file'라는 채널(이름표)로 data를 메인 프로세스에 단방향 전송7
   * 
   * 이 때 메인프로세스는 ipcMain.on('save-file', (event, data) => { ... })로 이 요청을 받고 실제로 파일을 저장하는 로직 수행
   */
  saveFile: (data) => electron.ipcRenderer.send("save-file", data),
  /**
   * loadFile: 파일 불러오기 요청 및 결과 받기
   * 웹 페이지에서 const fileData = await window.electronAPI.loadFile() 호출
   * ipcRenderer.invoke('load-file') 채널로 메인 프로세스에 데이터 요청하고 응답을 기다림(양방향 통신)
   * send와 달리 메인 프로세스가 작업을 완료하고 보내주는 결과값을 Promise 형태로 돌려받을 수 있음
   * 
   * 이 때 메인프로세스는 ipcMain.handle('load-file', async () => { ... })로 요청 처리 
   * 파일을 열고 읽은 데이터를 return 시 이 값이 웹 페이지의 loadFile 함수 호출 결과로 전달
   */
  loadFile: () => electron.ipcRenderer.invoke("load-file"),
  /**
   * onFileLoaded: 메인 프로세스로부터 데이터 수신 대기
   * 웹 페이지에서 특정 이벤트가 발생했을 때 실행할 callback 함수를 등록
   * 휍 페이지가 로드될 때 window.electronAPI.onFileLoaded((data) => { ... })를 실행하면 
   * 메인 프로세스에서 'file-loaded' 채널로 데이터를 보낼 때마다 등록된 callback 함수가 자동으로 실행
   * 
   * 웹 페이지가 아닌 메인 프로세스에서 시작된 파일 열기 동작의 결과를 웹 페이지에 전달할 때 유용
   * mainWindow.webContents.send('file-load', data) 코드를 실행하여 웹 페이지로 데이터를 보낼 수 있음
   */
  onFileLoaded: (callback) => electron.ipcRenderer.on("file-loaded", (_event, data) => callback(data))
});
