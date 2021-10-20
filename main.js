const { app, BrowserWindow } = require("electron");
const process = require("process");
const fs = require("fs")

var py;

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });

  win.loadURL("http://localhost:8000");
  win.maximize();
}

app.whenReady().then(() => {
  var appData = app.getPath("userData")
  if (!fs.existsSync(appData + "/media")) {
    fs.mkdirSync(appData + "/media")
  }

  py = require("child_process").spawn(
    process.resourcesPath + "/server/server",
    [appData]
  );

  setTimeout(() => {
    createWindow();

    app.on("activate", function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  }, 1000);
});

app.on("window-all-closed", function () {
  py.kill();
  if (process.platform !== "darwin") app.quit();
});
