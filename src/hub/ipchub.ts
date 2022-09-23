/*! *****************************************************************************
Copyright (c) taoyongwen. All rights reserved.

hub 通讯
***************************************************************************** */
import { app, BrowserWindow, dialog, ipcMain, Menu, MenuItemConstructorOptions, shell } from "electron";
import * as fs from "fs";
import { startPreview } from "../server/ipc";
import * as storage from "../server/storage";
import { getDateTime } from "../server/work";
import { GitTools } from "./gitTool";
import * as path from "path";
export function loadHubIpc(bw: BrowserWindow) {

    ipcMain.on("readConfig_hub", (event: any, arg: any) => {
        var config = storage.readConfig();
        bw.webContents.send("_readConfig", config);
    })
    ipcMain.on("readVersion_hub", (event: any, arg: any) => {
    
        bw.webContents.send("_readVersion",require("../../package.json").version);
    })
    ipcMain.on("startPreview_hub", (event: any, arg: any) => {
        startPreview(arg);
    });

    ipcMain.on("readProjects_hub", (event: any, arg: any) => {
        var projects = storage.readProjects();
        bw.webContents.send("_readProjects", projects);
    })
    ipcMain.on("saveProjects_hub", (event: any, arg: any) => {
        storage.saveProjects(arg);
        bw.webContents.send("_saveProjects", arg);
    })
    ipcMain.on("openFolder_hub", (event: any, arg: any) => {

        var list = dialog.showOpenDialogSync(bw, { properties: ['openDirectory'] });
        bw.webContents.send("_openFolder", list);
    })

    ipcMain.on("openPeojectBackpage_hub", (event: any, arg: any) => {

        var list = dialog.showOpenDialogSync(bw, { properties: ['openFile'], filters: [{ name: "*", extensions: ["rpj"] }] });
        console.log(list);
        if (list != undefined && list.length > 0) {

            var time=fs.statSync(list[0]).mtime;
        
            var projects = storage.readProjects();
            var newProject: any = {};
            newProject.name = path.basename(list[0],".rpj");
            newProject.path = list[0];
            newProject.modified = getDateTime(time);
            newProject.version = require("../../package.json").version;
            projects.push(newProject);
            storage.saveProjects(projects);
            bw.webContents.send("_readProjects", projects);

        } else {
            bw.webContents.send("_openPeojectBackpage_hub", undefined);
        }



    })
    ipcMain.on("openPath_hub", (event: any, arg: any) => {
       
        shell.openPath(path.dirname(arg));

    })
    ipcMain.on("loadHtml_hub", (event: any, arg: any) => {
       var html= storage.loadHtml(arg);
        bw.webContents.send("_loadHtml_hub", html);

    })
    ipcMain.on("webTap_hub", (event: any, arg: any) => {

        shell.openExternal("https://www.violetime.com");
 
     })
 
     ipcMain.on("cloneProject_hub", (event: any, arg: any) => {

        var path=arg.path;
        var username=arg.username;
        var password=arg.password;
        //http://taoyongwen@101.43.130.123:18082/r/demo.git
        if(path.indexOf("@")>-1){
            path=path.substring(0,path.indexOf("://")+3)+username+":"+password +path.substring(path.indexOf("@"));
        }else{
            path=path.replace("://","://"+username+":"+password+"@");
        }
        console.log(path);
       var local= storage.getProjectFolderPath(arg);
        var git=new GitTools(local);
        git.clone(path,(code:number,msg?:string)=>{
    
           bw.webContents.send("_cloneProject_hub",{code:code,msg:msg});
    
        });


 
     })
    ipcMain.on("min_hub", (event: any, arg: any) => {
        bw.minimize();
    });
    ipcMain.on("max_hub", (event: any, arg: any) => {
        if(!bw.isMaximized()) bw.maximize();else bw.unmaximize();
    });
    ipcMain.on("close_hub", (event: any, arg: any) => {
        app.exit();
    });

    ipcMain.on("show-context-menu", (event, menuItems: Array<MenuItemConstructorOptions>) => {

        //contextmenu

        menuItems.forEach(item => {


            item.click = () => { event.sender.send('context-menu-command', item.id) };

        });

        const contextmenu: any = Menu.buildFromTemplate(menuItems)
        contextmenu.popup(BrowserWindow.fromWebContents(event.sender))

    })
}

