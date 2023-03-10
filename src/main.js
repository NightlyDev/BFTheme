const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { DecimalHexTwosComplement } = require('./convert.js');

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
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  ipcMain.handle('load-config', loadConfig);
  ipcMain.on('save-config', saveConfig);
  ipcMain.on('backup-config', backupConfig);
  ipcMain.on('export-theme', exportTheme);
  ipcMain.handle('import-theme', importTheme);
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

async function handleFileSave(title, filename) {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: title,
    defaultPath: ` ${app.getPath("desktop")}/${filename}`,
  });

  if (canceled) {
    throw Error("No file has been saved! - Window closed");
    return;
  } else {
    return filePath;
  }
}

async function backupConfig() {
  let savePath = await handleFileSave("Save PROFSAVE_profile backup file", "PROFSAVE_profile_backup");
  let backupData = readFile(configPath);
  fs.writeFileSync(savePath, backupData);
}

async function handleFileOpen(title, defaultPath) {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: title,
    defaultPath: app.getPath(defaultPath),
    properties: ['openFile']
  })

  if (canceled) {
    throw Error("No file selected! - Window closed")
  } else {
    return filePaths[0]
  }
}

async function loadConfig() {
  configPath = await handleFileOpen("Select PROFSAVE_profile file", "documents");
  if (!configPath.includes("PROFSAVE_profile")) {
    dialog.showErrorBox("Invalid PROFSAVE_profile file", "The selected PROFSAVE_profile file is invalid.\nAre you sure you selected the right file?");
    throw Error("Invalid file")
  }
  let data = readFile(configPath);
  let hudCount = 0;
  let configColors = {};
  for (line of data.split('\n')) {
    if (line.includes("GstRender.HUD")) {
      line = line.split(' ');
      configColors[line[0]] = {
        "signed_int": Number(line[1]),
        "hexadecimal": DecimalHexTwosComplement(Number(line[1]))
      };
      hudCount++;
    }
  }
  if (hudCount === 6) {
    return configColors;
  } else {
    dialog.showErrorBox("Invalid PROFSAVE_profile file", "The selected PROFSAVE_profile file is invalid.\nAre you sure you selected the right file?")
    throw Error("Invalid file")
  }
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

async function exportTheme(event, themeJSON) {
  let savePath = await handleFileSave("Save theme", "bftheme.json");
  fs.writeFileSync(savePath, themeJSON);
}

async function importTheme() {
  let themePath = await handleFileOpen("Import theme", "desktop");
  let data = readFile(themePath);
  try {
    return JSON.parse(data);
  } catch (e) {
    dialog.showErrorBox("Invalid BF Theme JSON FILE", "The imported JSON file seems to be invalid. Did you select the right file?")
    throw Error("Invalid json!");
  }
}