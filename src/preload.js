// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  loadConfig: () => ipcRenderer.invoke("load-config"),
  saveConfig: (newColors) => ipcRenderer.send('save-config', newColors),
  backupConfig: () => ipcRenderer.send("backup-config"),
})