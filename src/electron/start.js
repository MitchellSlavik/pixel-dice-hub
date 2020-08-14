const electron = require("electron");
const { app, ipcMain } = electron;
const path = require("path");
const isDev = require("electron-is-dev");
require("electron-reload");

const websocketServer = require("./websocketServer");
const { ipcRenderer } = require("electron");

const BrowserWindow = electron.BrowserWindow;

let mainWindow;
let wss;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    backgroundColor: "#000",
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
      enableRemoteModule: true,
    },
  });

  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", () => {
  createWindow();
  wss = websocketServer.startServer();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    wss.close();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on("number-roll", (event, arg) => {
  if (wss && wss.clients) {
    console.log("Broadcasting ", arg);
    wss.clients.forEach((client) => {
      client.send(`${arg}`);
      console.log("Sent!");
    });
  }
});
