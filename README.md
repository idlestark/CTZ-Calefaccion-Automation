# CTZ APP — Procesador de reloj y planilla de presentismo

Aplicación de escritorio (Electron + React + Vite + Bootstrap + SQLite) que lee el CSV del reloj electrónico,
calcula horas y grado de presentismo de cada empleado y genera la planilla mensual en PDF. Funciona 100 % en local.

## Comandos útiles
- **npm install**: instala dependencias y recompila `better-sqlite3` para Electron (`postinstall`).
- **npm run dev**: servidor de Vite (http://localhost:5173).
- **npm run electron:dev**: abre Electron apuntando al servidor de Vite (ejecutar `npm run dev` en otra terminal). *Usa la sintaxis de Windows.*
- **npm run electron**: abre Electron con la versión compilada (`npm run build` antes).
- **npm run electron:build**: genera el instalador (carpeta `release/`).
- **npm test**: pruebas del cálculo, de la API con SQLite real y del servidor de red local.

## Importante
- Hace falta Visual Studio Build Tools con "Desarrollo para el escritorio con C++" (compila `better-sqlite3`).
- Usuarios iniciales: `admin` / `admin` y `subadmin` / `subadmin`. PIN inicial de ajustes: `1234` (se cambia desde Ajustes > Parámetros > Cambiar PIN).
- Cambiar usuarios/contraseñas todavía no tiene pantalla (pendiente).

## Estructura
```
electron.cjs            proceso principal (ventana, IPC, PDF, modo principal/secundaria)
electron/database.cjs   esquema SQLite, usuarios, ajustes, copias de seguridad
electron/api.cjs        todas las operaciones (con control de rol por operación)
electron/server.cjs     servidor HTTP de la PC principal para la PC secundaria
electron/core/          lógica pura y probada: csv.cjs, calc.cjs (horas y grados), planilla.cjs, settings.cjs
src/                    interfaz React (bodyClock = procesador del reloj, bodyJustification, bodyHistory, bodySettings, ...)
test/                   pruebas (node --test)
SUPUESTOS.md            reglas interpretadas y puntos a confirmar con el cliente
```

## Dos computadoras (opción A)
- **PC principal** (modo por defecto): guarda la base de datos y muestra su dirección en *Ajustes > Conexión* (por ejemplo `http://192.168.0.10:3737`).
  Tiene que estar con la aplicación abierta para que la otra PC pueda trabajar.
- **PC secundaria**: en la pantalla de login, enlace *Conexión entre computadoras* > "Computadora secundaria", se pega la dirección y se guarda (la app se reinicia).
- Si Windows pregunta por el firewall, permitir el acceso en redes privadas. No hay cifrado en esa conexión: está pensada solo para la red local de la fábrica.

## Datos y archivos
- Base de datos: carpeta de datos de la aplicación del usuario de Windows (`ctz.sqlite`).
- Copias de seguridad y PDF: `Documentos/CTZ/Copias de seguridad` y `Documentos/CTZ/Planillas`.
