const { app, screen, BrowserWindow } = require("electron");
const process = require("process");
const fs = require("fs");

var py;
const VENDOR_IDS = ["11734", "3111"];
var activePorts = [];

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const win = new BrowserWindow({
    width: width,
    height: height,
    fullscreen: true,
    kiosk: true,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  win.loadURL("http://localhost:8000");

  win.webContents.on("did-fail-load", () => {
    setTimeout(() => {
      win.loadURL("http://localhost:8000");
    }, 1000);
  });

  win.webContents.session.on(
    "select-serial-port",
    (event, portList, webContents, callback) => {
      event.preventDefault();
      const selectedPort = portList.find((device) => {
        return (
          VENDOR_IDS.includes(device.vendorId) &&
          !activePorts.includes(device.portId)
        );
      });
      if (!selectedPort) {
        callback("");
      } else {
        activePorts.push(selectedPort.portId);
        callback(selectedPort.portId);
      }
    }
  );
}

app.whenReady().then(() => {
  var appData = app.getPath("userData");
  if (!fs.existsSync(appData + "/media")) {
    fs.mkdirSync(appData + "/media");
  }

  py = require("child_process").spawn(
    process.resourcesPath + "/server/server",
    [appData]
  );

  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  py.kill();
  if (process.platform !== "darwin") app.quit();
});
