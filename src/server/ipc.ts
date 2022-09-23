/*! *****************************************************************************
Copyright (c) taoyongwen. All rights reserved.

ipc主窗口 与 子窗口通讯
***************************************************************************** */
import { app, BrowserWindow, desktopCapturer, dialog, ipcMain, Menu, MenuItemConstructorOptions, Notification, shell } from "electron";

import { building, exportHtml, exportReact, exportSql, exportVue, publicProject } from "../build/build";
import { getUUID, ICatalog, IProject } from "../common/interfaceDefine";
import { GitTools } from "../hub/gitTool";
import * as storage from "./storage";

import { touchBarColors, touchBarEditor } from "./touchBar";
import { getNowDateTime, saveAs } from "./work";
export function loadIpc(bw: BrowserWindow, wId: number, wProject: IProject) {


    ipcMain.on("readConfig_" + wId, (event: any, arg: any) => {
        var config = storage.readConfig();
        bw.webContents.send("_readConfig", config);
    })
    ipcMain.on("saveConfig_" + wId, (event: any, arg: any) => {

        if (arg.theme == "dark") {
            bw.setVibrancy("ultra-dark");
        } else {
            bw.setVibrancy("sidebar");
        }

        storage.saveConfig(arg);
        bw.webContents.send("_saveConfig", null);
    })
    ipcMain.on("readProjects_" + wId, (event: any, arg: any) => {
        var projects = storage.readProjects();
        bw.webContents.send("_readProjects", projects);
    })
    ipcMain.on("saveProjects_" + wId, (event: any, arg: any) => {
        storage.saveProjects(arg);
        bw.webContents.send("_saveProjects", arg);
    })
    ipcMain.on("saveProject_" + wId, (event: any, arg: IProject) => {
        storage.saveProject(arg);
        bw.webContents.send("_saveProject", arg);
    })
    ipcMain.on("openFolder_" + wId, (event: any, arg: any) => {

        var list = dialog.showOpenDialogSync(bw, { properties: ['openDirectory'] });
        bw.webContents.send("_openFolder", list);
    })
    ipcMain.on("readProject_" + wId, (event: any, arg: any) => {


        var project = storage.readProject(wProject);

        bw.webContents.send("_readProject", project);
    });

    ipcMain.on("readTitleNav_" + wId, (event: any, arg: any) => {

        var titleJson = storage.readTitleBar(wProject);
        var navJson = storage.readNav(wProject);
        if (navJson.items == undefined) {
            navJson.items = [];
        }

        bw.webContents.send("_readTitleNav", {
            title: titleJson, nav: navJson
        });
    });


    ipcMain.on("saveTitle_" + wId, (event: any, arg: any) => {
        storage.saveTitleBar(arg, wProject);
        bw.webContents.send("_saveTitle", null);
        // dialog.showMessageBox(bw, { message: "保存成功" });
    });



    ipcMain.on("saveNav_" + wId, (event: any, arg: any) => {
        storage.saveNavBar(arg, wProject);
        // dialog.showMessageBox(bw, { message: "保存成功" });
        bw.webContents.send("_saveNav", null);
    });

    ipcMain.on("newFile_" + wId, (event: any, arg: any) => {
        storage.newFile(arg, wProject);
        bw.webContents.send("_newFile", null);
    });

    ipcMain.on("deletePage_" + wId, (event: any, arg: ICatalog) => {
        console.log("deletePage_", arg);
        var logo = app.getAppPath().substring(0, app.getAppPath().length - 4) + "logo.png";

        dialog.showMessageBox(bw, {
            message: "确定删除吗？", buttons: [
                "确定", "取消"
            ], icon: logo
        }).then((res: any) => {

            if (res.response == 0) {
                storage.deletePage(arg, wProject);
                bw.webContents.send("_deletePage", arg);
            }

        });
    });
    ipcMain.on("deleteFile_" + wId, (event: any, arg: any) => {
        var logo = app.getAppPath().substring(0, app.getAppPath().length - 4) + "logo.png";

        dialog.showMessageBox(bw, {
            message: "确定删除吗？", buttons: [
                "确定", "取消"
            ], icon: logo
        }).then((res: any) => {

            if (res.response == 0) {
                storage.deleteFile(arg, wProject);
                bw.webContents.send("_deleteFile", null);
            }

        });

    });

    ipcMain.on("copyFile_" + wId, (event: any, arg: any) => {
        storage.copyFile(arg, wProject);
        bw.webContents.send("_copyFile", null);
    });

    ipcMain.on("renameFile_" + wId, (event: any, arg: any) => {
        storage.renameFile(arg, wProject);

        bw.webContents.send("_renameFile", arg);
    });
    ipcMain.on("openPage_" + wId, (event: any, arg: ICatalog) => {

        var page = storage.openPage(arg, wProject);

        if (page == undefined) {

            storage.newFile(arg, wProject);
            page = storage.openPage(arg, wProject);
        }

        bw.webContents.send("_openPage", page);
    });
    ipcMain.on("savePage_" + wId, (event: any, arg: any) => {
        storage.savePage(arg.page, arg.path, wProject);
        var notification = new Notification({ title: "保存成功" });
        notification.show();
        bw.webContents.send("_savePage", null);
    });
    ipcMain.on("startPreview_" + wId, (event: any, arg: any) => {
        startPreview(wProject);

    });
    ipcMain.on("build_" + wId, (event: any, arg: any) => {
        var rs = building({ name: arg }, (log: any) => {

            bw.webContents.send("_terminal", log);

        });
        updatePreviews.set(arg, "");


    });
    ipcMain.on("readPageCatalog_" + wId, (event: any, arg: any) => {
        //文件中的目录
        var catalogs = storage.readPageCatalog(wProject);
        //配置中的目录



        bw.webContents.send("_readPageCatalog", catalogs);
    });
    ipcMain.on("export_" + wId, (event: any, arg: any) => {

        if (arg.startsWith("sftp_")) {
            publicProject(wProject, arg.substring(5), bw);
            var notification = new Notification({ title: "导出成功" });
            notification.show();
            bw.webContents.send("_export", null);
        } else {
            var list = dialog.showOpenDialogSync(bw, { properties: ['openDirectory'] });
            if (list != undefined && list.length > 0) {
                if (arg == "html") {
                    exportHtml(list[0], wProject);
                } else if (arg == "vue") {
                    exportVue(list[0], wProject);
                } else if (arg == "react") {
                    exportReact(list[0], wProject);
                } else if (arg == "sql") {
                    exportSql(list[0], wProject);
                }

            }
            var notification = new Notification({ title: "导出成功" });
            notification.show();
            bw.webContents.send("_export", null);
        }


    });

    ipcMain.on("saveAs_" + wId, (event: any, arg: any) => {

        var list = dialog.showOpenDialogSync(bw, { properties: ['openDirectory'] });
        if (list != undefined && list.length > 0)
            saveAs(list[0], wProject);
        bw.webContents.send("_saveAs", null);
    });

    ipcMain.on("save_" + wId, (event: any, arg: any) => {
        var path: string = storage.readProject(wProject).path;
        var l = path.substring(0, path.lastIndexOf("/"));
        bw.webContents.send("_save", null);

        saveAs(l, wProject);
        if (preview) {
            var rs = building(wProject, (log) => {
                bw.webContents.send("_terminal", log);
            });
            updatePreviews.set(wProject.name, "");
            bw.webContents.send("_build", rs);
        }
    });
    ipcMain.on("readDataCatolog_" + wId, (event: any, arg: any) => {
        var rs = storage.readDataCatolog();
        bw.webContents.send("_readDataCatolog", rs);
    });
    ipcMain.on("editDataCatolog_" + wId, (event: any, arg: any) => {
        storage.editDataCatolog();

    });

    ipcMain.on("readDatabase_" + wId, (event: any, arg: any) => {
        var rs = storage.readDatabase(wProject);
        bw.webContents.send("_readDatabase", rs);
    });
    ipcMain.on("saveDatabase_" + wId, (event: any, arg: any) => {
        storage.saveDatabase(arg, wProject);

    });

    ipcMain.on("loadPluginsComponent_" + wId, (event: any, arg: any) => {
        var result = storage.loadPluginsComponent();
        bw.webContents.send("_loadPluginsComponent", result);

    });

    ipcMain.on("loadPluginsStyle_" + wId, (event: any, arg: any) => {
        var result = storage.loadPluginsStyle();
        bw.webContents.send("_loadPluginsStyle", result);

    });

    ipcMain.on("loadPluginsPanel_" + wId, (event: any, arg: any) => {
        var result = storage.loadPluginsPanel();

        bw.webContents.send("_loadPluginsPanel", result);

    });

    ipcMain.on("loadPluginsProperty_" + wId, (event: any, arg: any) => {
        var result = storage.loadPluginsProperty();

        bw.webContents.send("_loadPluginsProperty", result);

    });
    ipcMain.on("loadMapCatalog_" + wId, (event: any, arg: any) => {

        var result = storage.loadMapCatalog();
        bw.webContents.send("_loadMapCatalog", result);

    });
    ipcMain.on("loadMap_" + wId, (event: any, arg: any) => {
        try {
            var result = storage.loadMap(arg);
            bw.webContents.send("_loadMap", result);
        } catch (error) {
            console.log(error);
        }

    });
    ipcMain.on("isSave_" + wId, (event: any, arg: any) => {

        dialog.showMessageBox(bw, { message: arg.message, buttons: ["取消", "保存", "不保存"] }).then((value) => {
            bw.webContents.send("_isSave", { page: arg.page, response: value.response });
        })

    });
    ipcMain.on("insertImage_" + wId, (event: any, pageKey: any) => {
        if (pageKey == undefined || pageKey.length == 0) {
            console.log("pageKey is null");
            var list = dialog.showOpenDialogSync(bw, { properties: ['openFile'], filters: [{ name: "*", extensions: ["png", "jpg", "jpeg", "icon", "bmp"] }] });//filters: [{ name: "*", extensions: ["prototyping"] }] }

            if (list != undefined && list.length > 0) {
                var path = storage.saveImage(list[0], wProject, undefined);
                bw.webContents.send("_insertImage", path);
            }

            return;
        } else {
            var list = dialog.showOpenDialogSync(bw, { properties: ['openFile'], filters: [{ name: "*", extensions: ["png", "jpg", "jpeg", "icon", "bmp"] }] });//filters: [{ name: "*", extensions: ["prototyping"] }] }
            var result: string[] = [];
            if (list != undefined && list.length > 0) {
                list.forEach(element => {
                    var path = storage.saveImage(element, wProject, pageKey);
                    result.push(path)
                });
            }
            bw.webContents.send("_insertImage", result);
        }


    });
    ipcMain.on("pull_" + wId, (event: any, arg: IProject) => {
        var local = storage.getProjectFolderPath(wProject);
        var git = new GitTools(local);
        git.pull((code, msg) => {
            bw.webContents.send("_pull", msg);

        });

    });
    ipcMain.on("push_" + wId, (event: any, arg: IProject) => {

        var local = storage.getProjectFolderPath(wProject);
        var git = new GitTools(local);
        git.add((code, msg) => {
            if (code == 0) {
                git.commit(getNowDateTime(), (codec, msgc) => {
                    if (codec == 0) {
                        git.push((codep, msgp) => {
                            if (codep == 0) {
                                bw.webContents.send("_push", "提交成功");
                            } else {
                                bw.webContents.send("_push", msg);
                            }
                        });
                    } else {
                        bw.webContents.send("_push", msgc);
                    }
                });
            } else {
                bw.webContents.send("_push", msg);
            }
        });

    });

    ipcMain.on("min_" + wId, (event: any, arg: any) => {
        bw.minimize();
    });
    ipcMain.on("max_" + wId, (event: any, arg: any) => {
        if (!bw.isMaximized()) bw.maximize(); else bw.unmaximize();

    });
    ipcMain.on("close_" + wId, (event: any, arg: any) => {
        bw.close();
    });
    ipcMain.on("touchbar_colors_" + wId, (event: any, arg: any) => {
        touchBarColors(bw);

    });
    ipcMain.on("touchbar_default_" + wId, (event: any, arg: any) => {
        touchBarEditor(bw);
    });

    ipcMain.on("desktopCapturer_" + wId, (event: any, arg: any) => {

        desktopCapturer.getSources({ types: ['screen'] }).then(async (sources: Electron.DesktopCapturerSource[]) => {
            bw.webContents.send('_desktopCapturer', sources[0].id)

        });

    });

    ipcMain.on("show-context-menu_" + wId, (event, menuItems: Array<MenuItemConstructorOptions>) => {

        //contextmenu

        menuItems.forEach(item => {


            item.click = () => { event.sender.send('context-menu-command', item.id) };

        });

        const contextmenu: any = Menu.buildFromTemplate(menuItems)
        contextmenu.popup(BrowserWindow.fromWebContents(event.sender))

    })
    ipcMain.on("readProjectRecentPage_" + wId, (event, arg) => {

        var recent = storage.readProjectRecentPage(wProject);
        bw.webContents.send("_readProjectRecentPage", recent);

    });
    ipcMain.on("show-notification_" + wId, (event, arg) => {

        var notification = new Notification({ title: arg });
        notification.show();


    });



    ipcMain.on("savePageJpeg_" + wId, (event, arg) => {

        storage.savePageJpeg(arg.key, arg.data, wProject);

    });
    ipcMain.on("importDataExcel_" + wId, (event, arg) => {

        var list = dialog.showOpenDialogSync(bw, { properties: ['openFile'], filters: [{ name: "*", extensions: ["xls", "xlsx"] }] });//filters: [{ name: "*", extensions: ["prototyping"] }] }
        if (list != undefined && list.length > 0) {
            var file = list[0];
            var database = storage.readDatabase(wProject);
            const xlsx = require("node-xlsx");
            var workBook = xlsx.parse(file);
            if (workBook != undefined) {

                workBook.forEach((sheet: any) => {
                    if (sheet.data.length > 1) {
                        var st: any = {
                            key: getUUID(),
                            name: sheet.name,
                            columns: [],
                            data: sheet.data
                        }
                        database.tables.push(st);
                    }
                })
                storage.saveDatabase(database, wProject);
                bw.webContents.send("_readDatabase", database);
            }
        }
    });

}

var updatePreviews = new Map();

var preview = false;
var previewPort = 4000;
export function startPreview(project: any, port?: number) {


    if (port == undefined)
        port = previewPort;
    var path = app.getPath("home") + "/.prototyping/build/" + project.name + "/index.html";
    if (process.platform == "win32") {
        path = "file:///" + path;
    } else {
        path = "file://" + path;
    }

    console.log(path);
    shell.openExternal(path);//"http://127.0.0.1:" + port


    // if (preview) {
    //     return;
    // }

    // http.createServer((req, res) => {
    //     res.setHeader("Access-Control-Allow-Origin", "*");
    //     res.setHeader("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    //     res.setHeader("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    //     var url = req.url;
    //     if (updatePreviews.has(project.name)) {
    //         res.write("0");
    //         updatePreviews.delete(project.name);
    //     }

    //     res.end();
    // }).listen(port).on("error", (err: any) => {
    //     console.log(err);
    //     startPreview(port + 1);
    // }).on("listening", () => {
    //     preview = true;
    //     previewPort = port;
    //     //  shell.openExternal("http://127.0.0.1:" + port);
    // });



}