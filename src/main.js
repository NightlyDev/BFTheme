const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let configPath;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  ipcMain.handle('load-config', loadConfig);
  ipcMain.on('save-config', saveConfig);
  ipcMain.on('backup-config', backupConfig);
  createWindow();
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// node-dependent functions
function readFile(path) {
  try {
    const data = fs.readFileSync(path, 'utf-8');
    return data;
  } catch (err) {
    console.log(err)
  }
}

async function handleFileSave() {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: "Save PROFSAVE_profile backup file",
    defaultPath: ` ${app.getPath("desktop")}/PROFSAVE_profile_backup`,
  });

  if (canceled) {
    return
  } else {
    return filePath;
  }
}

async function backupConfig() {
  let savePath = await handleFileSave();
  let backupData = readFile(configPath);
  fs.writeFileSync(savePath, backupData);
}

async function handleFileOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: "Select PROFSAVE_profile file",
    defaultPath: app.getPath("documents"),
    properties: ['openFile']
  })

  if (canceled) {
    return
  } else {
    return filePaths[0]
  }
}

async function loadConfig() {
  configPath = await handleFileOpen();
  return readFile(configPath);
}

function saveConfig(event, newColors) {
  const configStrings = [
    "GstRender.HUD-Primary", "GstRender.HUD-Accent", "GstRender.HUD-Friendly",
    "GstRender.HUD-Enemy", "GstRender.HUD-Squad", "GstRender.HUD-Neutral"
  ];

  console.log(newColors);
  let newConfig = readFile(configPath);

  for (searchstr of configStrings) {
    let re = new RegExp('^.*' + searchstr + '.*$', 'gm');
    newConfig = newConfig.replace(re, `${searchstr} ${newColors[searchstr]}`);
  }
  fs.writeFile(configPath, newConfig, (err) => {
    if (err) throw err;
  });
}