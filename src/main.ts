/*! *****************************************************************************
Copyright (c) taoyongwen. All rights reserved.

main
***************************************************************************** */
import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import { touchBarEditor, touchBarHub } from "./server/touchBar";
//单一实例
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}
var wId = 1;
var screen_width: number = 600;
var screen_height: number = 1000;
//创建窗口
function createWindow(project: any) {

  var mainWindow: BrowserWindow = new BrowserWindow({
    height: screen_height,
    width: screen_width,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    titleBarStyle: "hidden",
   // transparent: process.platform === "darwin"?true:false,
    show: false,
    minWidth:1000,
    minHeight:600,
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "../index.html"));
  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
  var id = wId + 0;
  setTimeout(() => {
    const ipc = require("./server/ipc");
    ipc.loadIpc(mainWindow, id, project);
    mainWindow.webContents.on("did-finish-load", () => {
      mainWindow.webContents.send("_init", { id: id });
    });

    //清除监听
    mainWindow.on("close", (event: any) => {
      ["readConfig", "saveConfig", "readProjects", "saveProjects", "openFolder", "readProject",
        "readTitleNav", "saveTitle", "saveNav", "newFile", "deleteFile", "copyFile", "renameFile",
        "savePage", "startPreview", "build", "readPageCatalog", "readDataCatolog",
        "saveAs", "save", "insertImage", "saveProject", "openPage", "deletePage", "loadPluginsPanel", "loadMapCatalog",
        "loadMap", "readDatabase", "saveDatabase", "min", "max", "close", "touchbar_colors", "touchbar_default", 
        "desktopCapturer","isSave","show-context-menu","show-notification","importDataExcel","loadPluginsStatus_"].forEach((item: any) => {

          ipcMain.removeAllListeners(item + "_" + id);
        });
      //保存

      // new Promise((resove,reject)=>{

      //   console.log("正在保存项目...");

      //   const storage = require("./server/storage");
      //   var path: string = storage.readProject(project).path;
      //   var l = path.substring(0, path.lastIndexOf("/"));
      //   const work = require("./server/work");
      //   work.saveAs(l, project);
      //   console.log("保存成功");

      // })

      // setTimeout(() => {
      //   const storage = require("./server/storage");
      //   var path: string = storage.readProject(project).path;
      //   var l = path.substring(0, path.lastIndexOf("/"));
      //   const work = require("./server/work");
      //   work.saveAs(l, project);
      // }, 10);

    });

    wId++;
  }, 10);


  if (process.platform === "darwin") {
   // mainWindow.setVibrancy(vib);
    touchBarEditor(mainWindow);
  }

  setTimeout(() => {
    mainWindow.show();
    mainWindow.maximize();

  }, 2000);

}
var vib: ('appearance-based' | 'light' | 'dark' | 'titlebar' | 'selection' | 'menu' | 'popover' | 'sidebar' | 'medium-light' | 'ultra-dark' | 'header' | 'sheet' | 'window' | 'hud' | 'fullscreen-ui' | 'tooltip' | 'content' | 'under-window' | 'under-page') = "sidebar";
var hub: BrowserWindow;
//创建hub窗口
function createHub() {


  var mainWindow: BrowserWindow = new BrowserWindow({
    height: 600,
    minHeight:500,
    minWidth:700,
    webPreferences: {
      preload: path.join(__dirname, "./hub/hubPreload.js"),
    },
    width: 900,
    titleBarStyle: "hidden",
    // transparent: process.platform === "darwin"?true:false,
  });
  hub = mainWindow;
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "../hub.html"));
  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  ipcMain.on("openProject_hub", (event: any, arg: any) => {
    // mainWindow.minimize();
    const work = require("./server/work");
    work.initWork(arg);
    createWindow(arg);
  });
  ipcMain.on("openHub", (event: any, arg: any) => {
    console.log("openHub");
    mainWindow.maximize();
  });

  //touchBar


  setTimeout(() => {
    const ipchub = require("./hub/ipchub");
    ipchub.loadHubIpc(mainWindow);
    touchBarHub(mainWindow);
  }, 10);

  setTimeout(() => {

    const storage = require("./server/storage");
    var config = storage.readConfig();
    if (config != undefined && config.theme != undefined && config.theme == "dark") {
      vib = "ultra-dark";
    }
    /**
     * 
     */

    if (process.platform === "darwin") {
     // mainWindow.setVibrancy(vib);

    }
    ipcMain.on("saveConfig_hub", (event: any, arg: any) => {

      if (arg.theme == "dark") {
        vib = "ultra-dark";
      } else {
        vib = "sidebar";
      }
      if (process.platform === "darwin") {
       // mainWindow.setVibrancy(vib);



      }
      storage.saveConfig(arg);
      mainWindow.webContents.send("_saveConfig", null);
    })

  }, 10);

  setTimeout(() => {
    const { screen } = require('electron');
    // Create a window that fills the screen's available work area.
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    screen_height = height;
    screen_width = width;
  }, 3000);







}



// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createHub();
  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      ipcMain.removeAllListeners(); createHub();
    }

  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});


// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
