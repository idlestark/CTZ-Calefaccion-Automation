const Database = require("better-sqlite3");
const path = require("path");
const { app } = require("electron");

const dbPath = path.join(app.getPath("userData"), "database.sqlite");
const db = new Database(dbPath);

db.pragma("foreign_keys = ON");

function initializeDatabase() {
  //Dejo ejemplo por las dudas despues lo cambiamos con lo nuestro

  function initializeDatabase() {
    // Tabla de empleados
    db.exec(`
        CREATE TABLE IF NOT EXISTS employee(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            dni INTEGER NOT NULL
        );
    `);

    // Tabla de registros de horario
    db.exec(`
        CREATE TABLE IF NOT EXISTS time_report(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER NOT NULL,
            time TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (employee_id)
                REFERENCES employee(id)
                ON UPDATE CASCADE
                ON DELETE CASCADE
        );
    `);

    // Tabla de ejemplo
    db.exec(`
        CREATE TABLE IF NOT EXISTS nombre(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER NOT NULL,
            time TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            description TEXT NOT NULL,

            FOREIGN KEY (employee_id)
                REFERENCES employee(id)
                ON UPDATE CASCADE
                ON DELETE CASCADE
        );
    `);
  }
}

initializeDatabase();

module.exports = {
  db,
  dbPath,
  initializeDatabase,
};
