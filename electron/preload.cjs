const { contextBridge, ipcRenderer } = require("electron");

// Única puerta entre la interfaz y el proceso principal.
contextBridge.exposeInMainWorld("ctzAPI", {
  call: (name, args, token) => ipcRenderer.invoke("api:call", name, args, token),
  local: {
    info: () => ipcRenderer.invoke("local:info"),
    saveConfig: (cfg) => ipcRenderer.invoke("local:saveConfig", cfg),
    testConnection: (url) => ipcRenderer.invoke("local:testConnection", url),
    savePdf: (html, filename) => ipcRenderer.invoke("local:savePdf", html, filename),
    openPath: (p) => ipcRenderer.invoke("local:openPath", p),
    showInFolder: (p) => ipcRenderer.invoke("local:showInFolder", p),
    importBackup: () => ipcRenderer.invoke("local:importBackup"),
  },
});
