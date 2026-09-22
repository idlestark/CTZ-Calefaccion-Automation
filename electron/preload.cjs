const { contextBridge, ipcRenderer } = require("electron");

contextBridge.executeInMainWorld("ctzAPI", {
  //=======================
  //      EMPLOYEE
  //=======================

  getAllEmployee: () => {
    return ipcRenderer.invoke("employee:getAll");
  },
});
