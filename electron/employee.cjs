const { ipcMain, dialog, app } = require("electron");

const { db } = require("./database.cjs");

function registerEmployeeHandlers() {
  ipcMain.handle("employee:getAll", () => {
    const result = db
      .prepare(
        `
            SELECT * FROM employee ORDER BY id DESC`,
      )
      .all();
    return result;
  });
}

module.exports = {
  registerEmployeeHandlers,
};
