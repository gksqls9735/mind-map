import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.DIST = path.join(__dirname, "../dist");
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, "../public");
let win;
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(process.env.DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(createWindow);
ipcMain.on("save-file", (_event, data) => {
  dialog.showSaveDialog({
    title: "마인드맵 저장",
    defaultPath: "my-mindmap.json",
    filters: [
      { name: "JSON Files", extensions: ["json"] }
    ]
  }).then((file) => {
    if (!file.canceled && file.filePath) {
      fs.writeFileSync(file.filePath.toString(), JSON.stringify(data, null, 2));
    }
  }).catch((e) => {
    console.error(e);
  });
});
ipcMain.handle("load-file", async () => {
  const result = await dialog.showOpenDialog({
    title: "마인드맵 불러오기",
    properties: ["openFile"],
    filters: [
      { name: "JSON Files", extensions: ["json"] }
    ]
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  const filePath = result.filePaths[0];
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (e) {
    console.error(e);
    return null;
  }
});
