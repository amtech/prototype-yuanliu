/*! *****************************************************************************
Copyright (c) taoyongwen. All rights reserved.

preload
***************************************************************************** */
// All of the Node.js APIs are available in the preload process.

import { ipcRenderer } from "electron";
import { getCurPageKey } from "./render/workbench";
import { renderWorkSpace } from "./render/workspace";
//项目窗口ID
var wId = 0;
// It has the same sandbox as a Chrome extension.
window.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.on("_init", (e, data) => {
    wId = data.id;
    var app = document.getElementById("app");
    if (app != undefined) {
      renderWorkSpace(app);
    }
  })
});
//多项目窗口下，通讯
export function ipcRendererSend(hannel: string, ...args: any[]): void {
  console.log("---SEND---", hannel + "_" + wId);
  if (hannel == "insertCover") {
    ipcRenderer.send(  "insertImage_" + wId);
  } else if (hannel == "insertImage") {
    ipcRenderer.send(hannel + "_" + wId, getCurPageKey());
  } else {
    ipcRenderer.send(hannel + "_" + wId, ...args);
  }

}

export function ipcContextMenu(arg:{type:"tab"|"icon"|"otho"|"component",content:string}): void {
    ipcRenderer.send( "show-context-menu_" + wId, arg);

}