/*! *****************************************************************************
Copyright (c) taoyongwen. All rights reserved.

渲染侧边栏
***************************************************************************** */
import { clipboard, ipcRenderer } from "electron";
import { renderDialog } from "../dialog/export";
import { setComponentsTemplate } from "../common/components";
import { IContextMenuItem, showContextMenu } from "../common/contextmenu";
import { icons } from "../common/icons";
import { getUUID, ICatalog, IComponent, IDatabase } from "../common/interfaceDefine";
import { logj } from "../common/log";
import { ipcRendererSend } from "../preload";
import { blueMethods } from "./blueprintMethods";
import { blueObjects } from "./blueprintObjects";
import { showCustomComponent } from "./customComponent";
import * as dargData from "./DragData";
import { findCurPageComponent, getCurPageContent, getSelectComponents } from "./workbench";
import { getConfig, getProject } from "./workspace";
export function updateSidebar() {

    document.getElementById("sidebarcataloglabel").innerHTML = getProject().name;
    renderFileExplorer(fileExplorer);

}
var fileExplorer: HTMLElement;
export function renderSidebar(content: HTMLElement) {

    var sidebar = document.createElement("div");
    sidebar.className = "sidebar";
    content.appendChild(sidebar);

    var layoutBar = document.createElement("div");
    layoutBar.className = "layoutBar";
    sidebar.appendChild(layoutBar);
    var layoutBarText = document.createElement("div");
    layoutBarText.innerText = "资源";
    layoutBarText.style.flex = "1";
    layoutBar.appendChild(layoutBarText);
    // var layoutBarIcon = document.createElement("i");
    // layoutBarIcon.className = "bi  bi-three-dots";
    // layoutBar.appendChild(layoutBarIcon);




    //目录
    fileExplorer = renderExplorer("sidebar_catalog", sidebar, "[sidebarcataloglabel]", false, [{
        label: "新建文件夹", icon: "bi bi-folder-plus", onclick: () => {
            createFolder("新建文件夹");
        }
    },
    {
        label: "新建页面", icon: "bi bi-file-earmark-plus", onclick: () => {
            createPage("新建页面");
        }
    },
    {
        label: "按模板新建页面", icon: "bi bi-node-plus", onclick: () => {
            createPageByTemplate();
        }
    }

    ]);



    //组件
    var componentsExplorer = renderExplorer("sidebar_component", sidebar, "组件");
    requestIdleCallback(() => {
        renderComponentsExplorer(componentsExplorer);
    });


    //图标
    var iconExplorer = renderExplorer("sidebar_icon", sidebar, "图标", true);
    requestIdleCallback(() => {
        renderIconExplorers(iconExplorer);
    });


    //蓝图
    var blueExplorer = renderExplorer("sidebar_blue", sidebar, "蓝图");
    renderBlueExploer(blueExplorer);

    //数据
    var databaseExplorer = renderExplorer("sidebar_database", sidebar, "数据");
    databaseExplorer.id = "database_explorer";


    //默认隐藏，蓝图打开时展示.
    document.getElementById("sidebar_blue").style.display = "none";
    document.getElementById("sidebar_database").style.display = "none";

    //ipc
    ipcRenderer.on("_newFile", (event, arg) => {
        ipcRendererSend("readPageCatalog");
    });
    ipcRenderer.on("_deleteFile", (event, arg) => {
        //


        ipcRendererSend("readPageCatalog");
    });
    ipcRenderer.on("_deletePage", (event, arg: ICatalog) => {
        //
        var catalogDiv = document.getElementById(arg.key);
        catalogDiv.remove();
        deletePageByKey(arg.key, getProject().catalogs);
        ipcRendererSend("saveProject", getProject());

    });
    ipcRenderer.on("_renameFile", (event, arg: { catalog: ICatalog, oldName: string, newName: string }) => {
        //  ipcRendererSend("readPageCatalog");

        // var catalogDiv=document.getElementById(arg.catalog.key);

        var target = findPageByKey(arg.catalog.key, getProject().catalogs);
        console.log("_renameFile", arg.oldName, arg.newName, arg.catalog.key, target);
        console.log(arg.catalog.key, getProject().catalogs);
        if (target != undefined) {
            target.name = arg.newName;
            target.path = target.path.replace(arg.oldName, arg.newName);

        }
        ipcRendererSend("saveProject", getProject());


    });
    ipcRenderer.on("_copyFile", (event, arg) => {
        ipcRendererSend("readPageCatalog");
    });


}
function findPageByKey(key: string, catalogs: ICatalog[]): ICatalog {
    console.log("find", key, catalogs);
    var index = catalogs.find(c => c.key == key);
    if (index != undefined) {
        return index;
    } else {
        for (var i = 0; i < catalogs.length; i++) {
            var c = catalogs[i];
            if (c.children != undefined) {
                var rs = findPageByKey(key, c.children);
                if (rs != undefined) {
                    return rs;
                }
            }
        }

    }

}

function deletePageByKey(key: string, catalogs: ICatalog[]) {

    var index = catalogs.findIndex(c => c.key == key);
    if (index >= 0) {
        catalogs.splice(index, 1);
    } else {
        catalogs.forEach(c => {
            if (c.children) {
                deletePageByKey(key, c.children);
            }
        });
    }

}


function deletePage(catalog: ICatalog) {
    ipcRendererSend("deletePage", catalog);

}
function renameFile(catalog: ICatalog, oldName: string, newName: string) {
    console.log("renameFile", catalog, oldName, newName);
    ipcRendererSend("renameFile", {
        catalog: catalog,
        oldName: oldName,
        newName: newName
    })

}
function copyFile(path: string, oldName: string, newName: string) {
    ipcRendererSend("copyFile", {
        path: path,
        oldName: oldName,
        newName: newName,
    })

}
function createFolder(name: string, catalog?: ICatalog) {
    if (catalog == undefined) {

        var page: ICatalog = { name: name, path: "/" + name, dir: "/", sort: 0, children: [], key: getUUID() };
        if (getProject().catalogs == undefined) {
            getProject().catalogs = [];
        }
        getProject().catalogs.push(page);

        renderFileTree(document.getElementById("fileExplorer"), page, 1);

    } else {


    }
    // ipcRendererSend("newFile", {
    //     path: path,
    //     name: name,
    //     isDirectory: true
    // })
}
/**
 * char count
 */
function getChartCount(text: string, char: string): number {
    var count = 0;
    for (var i = 0; i < text.length; i++) {
        if (text[i] == char) {
            count++;
        }
    }
    return count;
}

/**
 * 
 * @param name 
 * @param catalog 
 */

function createPage(name: string, catalog?: ICatalog) {
    if (catalog == undefined) {
        //level =0
        var page: ICatalog = { name: name, path: "/" + name + ".json", dir: "/", sort: 0, key: getUUID() };
        if (getProject().catalogs == undefined) {
            getProject().catalogs = [];
        }
        getProject().catalogs.push(page);

        renderFileTree(document.getElementById("fileExplorer"), page, 1);

    } else {
        if (catalog.children == undefined) {
            catalog.children = [];
        }
        //children
        var page: ICatalog = { key: getUUID(), name: name, path: catalog.path + "/" + name + ".json", dir: catalog.path, sort: catalog.children.length };
        // if(catalog.path=="/"){
        //     page.path = "/" + catalog.name;
        // }
        catalog.children.push(page);
        var context: any = document.getElementById(catalog.key).getElementsByClassName("explorer_folder_view").item(0);
        var level = getChartCount(catalog.path, "/") + 1;
        renderFileTree(context, page, level);


    }


    // ipcRendererSend("newFile", {
    //     path: path,
    //     name: name,
    //     isDirectory: false
    // })
}

function renderBlueExploer(content: HTMLElement) {
    {
        var title = document.createElement("div");
        title.className = "sidebar_title";
        title.innerText = "对象";
        title.draggable = false;
        content.appendChild(title);
        var componentsDiv = document.createElement("div");
        componentsDiv.className = "components";
        componentsDiv.draggable = false;
        content.appendChild(componentsDiv);
        blueObjects.forEach(obj => {

            var icon = document.createElement("i");
            icon.className = obj.icon;

            var label = document.createElement("span");
            label.innerText = obj.name;
            var componentDiv = document.createElement("div");
            componentDiv.className = "component";
            componentDiv.appendChild(icon);
            componentDiv.appendChild(label);
            componentDiv.draggable = true;
            componentsDiv.appendChild(componentDiv);

            componentDiv.ondragstart = (e: DragEvent) => {

                // dragComponent = component;
                e.dataTransfer.setData("blueObject", JSON.stringify(obj));
                var page = getCurPageContent();
                if (page != undefined) {
                    page.setAttribute("data-drag", "true");
                }

            }
            componentDiv.ondragend = (e: DragEvent) => {
                // dragComponent = undefined;
                var page = getCurPageContent();
                if (page != undefined) {
                    page.removeAttribute("data-drag");
                }
            };


        });
    }
    {
        var title = document.createElement("div");
        title.className = "sidebar_title";
        title.innerText = "函数";
        title.draggable = false;
        content.appendChild(title);
        var componentsDiv = document.createElement("div");
        componentsDiv.className = "components";
        componentsDiv.draggable = false;
        content.appendChild(componentsDiv);
        blueMethods.forEach(method => {

            var icon = document.createElement("i");
            icon.className = method.icon;

            var label = document.createElement("span");
            label.innerText = method.name;
            var componentDiv = document.createElement("div");
            componentDiv.className = "component";
            componentDiv.appendChild(icon);
            componentDiv.appendChild(label);
            componentDiv.draggable = true;
            componentsDiv.appendChild(componentDiv);

            componentDiv.ondragstart = (e: DragEvent) => {

                // dragComponent = component;
                e.dataTransfer.setData("blueMethod", JSON.stringify(method));
                var page = getCurPageContent();
                if (page != undefined) {
                    page.setAttribute("data-drag", "true");
                }

            }
            componentDiv.ondragend = (e: DragEvent) => {
                // dragComponent = undefined;
                var page = getCurPageContent();
                if (page != undefined) {
                    page.removeAttribute("data-drag");
                }
            };


        });

    }




}

export function getDataBase(): IDatabase {
    return database;
}
var database: IDatabase;
export function renderDatabaseExplorer() {
    var database_explorer = document.getElementById("database_explorer");

    ipcRenderer.on("_readDatabase", (event, arg) => {
        console.log("_readDatabase", arg);
        database = arg;
        database_explorer.innerHTML = "";

        for (var key in arg.tables) {
            var table = arg.tables[key];

            var item = document.createElement("div");
            item.style.paddingLeft = "5px";
            item.style.cursor = "pointer";
            item.draggable = true;
            item.innerHTML = table.name;
            item.style.minHeight = "24px";
            item.className = "explorer_file explorer_row";
            item.style.textIndent = "20px";
            database_explorer.appendChild(item);
            item.ondragstart = (e: DragEvent) => {

                // dragComponent = component;
                e.dataTransfer.setData("blueDatabase", JSON.stringify(table));
                var page = getCurPageContent();
                if (page != undefined) {
                    page.setAttribute("data-drag", "true");
                }

            }
            item.ondragend = (e: DragEvent) => {
                // dragComponent = undefined;
                var page = getCurPageContent();
                if (page != undefined) {
                    page.removeAttribute("data-drag");
                }
            };

        }
    });
    ipcRendererSend("readDatabase");

}


function renderIconExplorers(content: HTMLElement) {


    var iconSearchBar = document.createElement("div");
    iconSearchBar.className = "iconSearchBar";

    var searchInput = document.createElement("input");
    searchInput.type = "text";
    iconSearchBar.appendChild(searchInput);

    var searchButton = document.createElement("button");

    iconSearchBar.appendChild(searchButton);
    searchButton.innerHTML = ("<i class='bi bi-search'></>")

    content.appendChild(iconSearchBar);

    var iconExplorer = document.createElement("div");
    iconExplorer.className = "iconExplorer";

    content.appendChild(iconExplorer);
    renderIconExplorer(iconExplorer, "");

    searchButton.onclick = (e: MouseEvent) => {
        e.stopPropagation();
        var searchText = searchInput.value;
        renderIconExplorer(iconExplorer, searchText);

    };

}
function renderIconExplorer(content: HTMLElement, filter: string) {

    content.innerHTML = "";

    var list = icons.filter(icon => icon.indexOf(filter) >= 0);

    for (var i = 0; i < list.length; i++) {
        var icon = list[i];

        var iconDiv = document.createElement("div");
        iconDiv.setAttribute("icon", "bi bi-" + icon);
        iconDiv.className = "sidebar_icon";

        var iconIcon = document.createElement("i");

        iconIcon.className = "bi bi-" + icon;
        iconIcon.title = icon;
        iconDiv.appendChild(iconIcon);

        content.appendChild(iconDiv);

        iconDiv.draggable = true;
        iconDiv.ondragstart = (e: any) => {
            var icon_e = e.target.getAttribute("icon");
            var component: IComponent = {
                type: "icon",
                isTemplate: true,
                key: getUUID(),
                icon: icon_e,
                label: icon_e,
                style: "display:inline-block;",

                onPreview: () => {
                    var pi = document.createElement("i");
                    pi.className = icon_e;
                    return pi;
                }, onRender: (component, element) => {
                    var pi;
                    if (element != undefined)
                        pi = element;
                    else
                        pi = document.createElement("div");
                    //    if (component.blue != undefined && component.blue.event != undefined && component.blue.event.click != undefined)
                    pi.setAttribute("icon_hover", "true");
                    pi.innerHTML = "<i class='" + icon_e + "'></i>"
                    pi.onclick = () => {
                        if (component.blue.event.click.on != undefined) {
                            component.blue.event.click.on();
                        }

                    }
                    // pi.className = "bi bi-" + icon;
                    return { root: pi, content: pi }
                },
                blue: {
                    event: {
                        click: {
                            label: "单击"
                        }
                    }
                }
            };
            dargData.setData("componentTemplate", component);


        };
        iconDiv.ondblclick = (e: any) => {
            // console.log(e.target.className,icon);
            clipboard.writeText(e.target.className);

        };
        iconDiv.onclick = (e: any) => {
            var sl = getSelectComponents();
            console.log(sl);
            if (sl.length == 1) {
                var sc = findCurPageComponent(sl[0]);

                if (sc != undefined && sc.type == "icon") {
                    var icon_e = e.target.className;
                    if (icon_e != undefined && icon_e.length > 0) {

                        sc.icon = icon_e;

                        document.getElementById(sc.key).innerHTML = "<i class='" + icon_e + "'></i>";
                    }

                }
            }
        }

    };




}



var lastSelected: HTMLElement;
function renderFileExplorer(content: HTMLElement) {
    var fileExplorer = document.createElement("div");
    fileExplorer.id = "fileExplorer";
    fileExplorer.className = "fileExplorer";
    fileExplorer.style.minHeight = "100px";
    content.appendChild(fileExplorer);

    // var fileTree = {
    //     name: "dasda",
    //     type: "folder",
    //     children: [
    //         {
    //             name: "src",
    //             type: "page"
    //         }, {
    //             name: "src",
    //             type: "page"
    //         },
    //         {
    //             name: "src",
    //             type: "page"
    //         }, {
    //             name: "src",
    //             type: "page"
    //         },
    //     ]
    // };
    renderCatalog(fileExplorer, getProject().catalogs, 1);

    // ipcRendererSend("readPageCatalog");
    // ipcRenderer.on("_readPageCatalog", (event, arg) => {
    //     console.log("_readPageCatalog", arg);
    //     var catalogs: ICatalog[] = arg;

    //     console.log("catalogs", catalogs);
    //     fileExplorer.innerHTML = "";
    //     var level = 1;
    //     renderCatalog(fileExplorer, catalogs, level);
    // });

}
function renderCatalog(content: HTMLElement, catalogs: ICatalog[], level: number) {
    if (catalogs != undefined) {
        //  catalogs.sort((a, b) => (a.sort - b.sort));
        // console.log("load Catalog:---")
        logj("load Catalog:---", "sidebar", 569);
        console.log(catalogs);
        catalogs.forEach((catalog: ICatalog) => {
            renderFileTree(content, catalog, level);
        });
    }

}

var folderHiddenMap = new Map<string, boolean>();
function renderFileTree(content: HTMLElement, catalog: ICatalog, level: number, parent?: ICatalog) {
    // console.log("renderFileTree", content, catalog);
    if (catalog == undefined) {
        return;
    }
    var menuItemsFolder: Array<IContextMenuItem> = [
        {
            label: "新建页面", icon: "bi bi-file-earmark-plus",
            onclick: (args) => {
                console.log(args);

                createPage("新建页面", catalog);
            }
        }, {
            label: "根据模板新建页面", icon: "bi bi-node-plus",
            onclick: (args) => {
                console.log(args);

                createPageByTemplate(catalog);
            }
        }, {
            label: "新建文件夹", icon: "bi bi-folder-plus",
            onclick: (args) => {
                console.log(args);

                createFolder("新建文件夹", catalog);
            }
        }, {
            label: "删除", icon: "bi bi-trash", onclick: (args: ICatalog) => {
                console.log(args);
                deletePage(args);
            }
        }, {
            label: "重命名", icon: "bi bi-pencil", shorcut: "Enter", onclick: (args: ICatalog, ele: HTMLElement) => {
                ele.setAttribute("data-edit", "true");
                ele.getElementsByTagName("input").item(0).focus();
            }
        }];
    var menuItemsPage: Array<IContextMenuItem> = [{
        label: "删除", icon: "bi bi-trash", onclick: (args: ICatalog) => {
            console.log(args);
            deletePage(args);
        }
    }, {
        label: "重命名", icon: "bi bi-pencil", shorcut: "Enter", onclick: (args: ICatalog, ele: HTMLElement) => {
            ele.setAttribute("data-edit", "true");
            ele.getElementsByTagName("input").item(0).focus();
        }
    }, {
        label: "复制", icon: "bi bi-files", onclick: (args: ICatalog) => {
            copyFile(args.path, args.name, args.name + "_copy");
        }
    }];

    if (catalog.children != undefined) {
        var folder = document.createElement("div");
        folder.className = "explorer_folder";
        folder.id = catalog.key;
        content.appendChild(folder);

        var folderTitle = document.createElement("div");

        folderTitle.className = "explorer_folder_title explorer_row";
        folder.appendChild(folderTitle);



        var indent = document.createElement("div");
        indent.className = "indent";
        indent.style.width = level * 12 + "px";
        folderTitle.appendChild(indent);


        var icon = document.createElement("i");
        icon.className = "bi bi-chevron-down";
        folderTitle.appendChild(icon);

        // var name = document.createElement("div");
        // name.className = "name";
        // name.innerText = catalog.name;
        // folderTitle.appendChild(name);


        var name = document.createElement("div");
        name.className = "name";
        // name.innerText = catalog.page.name;
        folderTitle.appendChild(name);

        var nameInput = document.createElement("input");
        nameInput.value = catalog.name;
        name.appendChild(nameInput);

        var nameLabel = document.createElement("div");
        nameLabel.innerText = catalog.name;
        name.appendChild(nameLabel);



        var folderView = document.createElement("div");
        folderView.className = "explorer_folder_view";
        folder.appendChild(folderView);

        var hidden = folderHiddenMap.get(catalog.path);
        if (hidden == true) {
            folderView.style.display = "none";
            icon.className = "bi bi-chevron-right";
        }


        folderTitle.onclick = (e: MouseEvent) => {
            // folderTitle.setAttribute("selected", "true");
            if (folderView.style.display == "none") {
                folderView.style.display = "block";
                icon.className = "bi bi-chevron-down";
                folderHiddenMap.set(catalog.path, false);
            } else {
                folderView.style.display = "none";
                icon.className = "bi bi-chevron-right";
                folderHiddenMap.set(catalog.path, true);
            }
        }
        folderTitle.tabIndex = 1;
        folderTitle.onkeydown = (e: KeyboardEvent) => {
            if (e.key == "Enter") {
                folderTitle.setAttribute("data-edit", "true");
                nameInput.focus();
            }

        };

        folderTitle.oncontextmenu = (e: MouseEvent) => {
            // folderTitle.setAttribute("selected", "true");

            showContextMenu(menuItemsFolder, e.clientX, e.clientY, catalog, folderTitle);
        }
        nameInput.onblur = () => {
            if (nameInput.value.length <= 0) return;
            folderTitle.setAttribute("data-edit", "false");
            nameLabel.innerText = nameInput.value;
            renameFile(catalog, catalog.name, nameInput.value);
        }
        nameInput.onclick = (e: MouseEvent) => { e.stopPropagation() };
        nameInput.onkeydown = (e: KeyboardEvent) => {
            if (e.key == "Enter") {
                if (nameInput.value.length <= 0) return;
                folderTitle.setAttribute("data-edit", "false");
                nameLabel.innerText = nameInput.value;
                renameFile(catalog, catalog.name, nameInput.value);
                folderTitle.focus();
            }
            e.stopPropagation();

        };

        folderTitle.draggable = true;
        //链接到菜单或按钮
        folderTitle.ondragstart = (e) => {
            //TODO
            //   e.dataTransfer.setData("catalog", catalog.name);
            dargData.setData("catalog", catalog.name);
            e.stopPropagation();
        }
        folderTitle.ondragover = (e) => {
            e.preventDefault();
            folderTitle.setAttribute("data-insert", "true");
            e.stopPropagation();
        }
        folderTitle.ondragleave = (e) => {

            folderTitle.removeAttribute("data-insert");
            e.stopPropagation();
        }
        folderTitle.ondrop = (e) => {

            folderTitle.removeAttribute("data-insert");
            e.stopPropagation();
            if (parent == undefined) {

                var old = getProject().catalogs.find(c => c.key == dargData.getData("catalog"));
                var copy: ICatalog = { key: getUUID(), name: old.name, path: old.path, children: old.children, dir: old.dir };
                var oldIndex = getProject().catalogs.findIndex(c => c.key == dargData.getData("catalog"));
                getProject().catalogs.splice(oldIndex, 1);
                var index = getProject().catalogs.findIndex(c => c.key == catalog.key);
                getProject().catalogs.splice(index + 1, 0, copy);

                var v = document.getElementById("fileExplorer");
                v.innerHTML = "";
                renderCatalog(v, getProject().catalogs, 1);


                ipcRendererSend("saveProject", getProject());


            } else {

                var old = parent.children.find(c => c.key == dargData.getData("catalog"));
                var copy: ICatalog = { key: getUUID(), name: old.name, path: old.path, children: old.children, dir: old.dir };
                var oldIndex = parent.children.findIndex(c => c.key == dargData.getData("catalog"));
                parent.children.splice(oldIndex, 1);
                var index = parent.children.findIndex(c => c.key == catalog.key);
                console.log("old", old);
                parent.children.splice(index + 1, 0, copy);

                var vs: any = document.getElementById(parent.key).getElementsByClassName("explorer_folder_view").item(0);
                vs.innerHTML = "";
                renderCatalog(vs, parent.children, 1);

                ipcRendererSend("saveProject", getProject());


            }
        }


        catalog.children.forEach((child: any) => {
            renderFileTree(folderView, child, level + 1, catalog);
        })


    } else {
        var page = document.createElement("div");
        page.className = "explorer_file explorer_row";
        page.id = catalog.key;
        content.appendChild(page);

        var indent = document.createElement("div");
        indent.className = "indent";
        indent.style.width = level * 12 + "px";
        page.appendChild(indent);

        var icon = document.createElement("i");
        icon.className = "bi bi-file-earmark-richtext";
        page.appendChild(icon);


        var name = document.createElement("div");
        name.className = "name";
        // name.innerText = catalog.page.name;
        page.appendChild(name);

        var nameInput = document.createElement("input");
        nameInput.value = catalog.name;
        name.appendChild(nameInput);

        var nameLabel = document.createElement("div");
        nameLabel.innerText = catalog.name;
        name.appendChild(nameLabel);

        page.onclick = (e: MouseEvent) => {
            if (lastSelected == undefined || lastSelected != page) {
                if (lastSelected != undefined) lastSelected.setAttribute("selected", "false");
                page.setAttribute("selected", "true");
                lastSelected = page;
            }

        }
        page.ondblclick = (e: MouseEvent) => {
            //open page
            //   renderPage(catalog.page);
            console.log("---Open--", Date.now());
            ipcRendererSend("openPage", catalog);


        }
        page.oncontextmenu = (e: MouseEvent) => {
            //    page.setAttribute("selected", "true");

            showContextMenu(menuItemsPage, e.clientX, e.clientY, catalog, page);
        }
        page.tabIndex = 1;
        page.onkeydown = (e: KeyboardEvent) => {
            if (e.key == "Enter") {
                page.setAttribute("data-edit", "true");
                nameInput.focus();
            }

        };

        nameInput.onblur = () => {
            if (nameInput.value.length <= 0) return;
            page.setAttribute("data-edit", "false");
            nameLabel.innerText = nameInput.value;
            // catalog.name = nameInput.value;
            // catalog.path.replace(catalog.name, nameInput.value);
            renameFile(catalog, catalog.name, nameInput.value);
        }
        nameInput.onclick = (e: MouseEvent) => { e.stopPropagation() };
        nameInput.onkeydown = (e: KeyboardEvent) => {
            if (e.key == "Enter") {
                if (nameInput.value.length <= 0) return;
                page.setAttribute("data-edit", "false");
                nameLabel.innerText = nameInput.value;
                // catalog.name = nameInput.value;
                //  catalog.path.replace(catalog.name, nameInput.value);
                renameFile(catalog, catalog.name, nameInput.value);
                page.focus();
            }
            e.stopPropagation();

        };
        page.draggable = true;
        //链接到菜单或按钮
        page.ondragstart = (e) => {
            //TODO
            //     e.dataTransfer.setData("catalog", catalog.key);
            dargData.setData("catalog", catalog);
            e.stopPropagation();
        }
        page.ondragover = (e) => {
            e.preventDefault();
            page.setAttribute("data-insert", "true");
            e.stopPropagation();
        }
        page.ondragleave = (e) => {

            page.removeAttribute("data-insert");
            e.stopPropagation();
        }
        page.ondrop = (e) => {

            page.removeAttribute("data-insert");
            e.stopPropagation();

            if (parent == undefined) {


                console.log(getProject().catalogs, dargData.getData("catalog"));
                var ol = getCatalog(getProject().catalogs, dargData.getData("catalog").key);
                console.log(ol);
                var olds: ICatalog = ol.caltalog;

                var copy: ICatalog = { key: getUUID(), name: olds.name, path: olds.path, dir: olds.dir, children: olds.children };
                var oldIndex = ol.index;

                getProject().catalogs.splice(oldIndex, 1);
                var index = getProject().catalogs.findIndex(c => c.key == catalog.key);
                getProject().catalogs.splice(index + 1, 0, copy);

                var v = document.getElementById("fileExplorer");
                v.innerHTML = "";
                renderCatalog(v, getProject().catalogs, 1);


                ipcRendererSend("saveProject", getProject());
            } else {

                var ol = getCatalog(parent.children, dargData.getData("catalog").key);
                var olds: ICatalog = ol.caltalog;

                var copy: ICatalog = { key: getUUID(), name: olds.name, path: olds.path, dir: olds.dir, children: olds.children };

                var oldIndex = ol.index;
                parent.children.splice(oldIndex, 1);
                var index = parent.children.findIndex(c => c.key == catalog.key);
                console.log("old", olds);
                parent.children.splice(index + 1, 0, copy);

                var vs: any = document.getElementById(parent.key).getElementsByClassName("explorer_folder_view").item(0);
                vs.innerHTML = "";
                var level = getChartCount(parent.path, "/");
                renderCatalog(vs, parent.children, level);


                ipcRendererSend("saveProject", getProject());

            }
        }


    }



}
function getCatalog(list: ICatalog[], key: string): { caltalog: ICatalog, index: number } {
    if (list == undefined) {
        return;
    }

    var old = list.find(c => c.key == key);
    if (old != undefined) {
        var index = list.findIndex(c => c.key == key);
        return { caltalog: old, index: index };
    }
    for (var i = 0; i < list.length; i++) {
        var c = getCatalog(list[i].children, key);
        if (c != undefined) {
            return c;
        }
    }
}

function renderComponentsExplorer(content: HTMLElement) {
    content.style.paddingBottom = "20px";
    ipcRenderer.on("_loadPluginsComponent", (event, args) => {
        //    console.log("_loadPluginsComponent", args);
        var components: IComponent[] = [];
        args.forEach((item: string) => {
            try {
                // console.log(item);
                var component: IComponent = require(item).default();
                if (component != undefined)
                    components.push(component);

            } catch (error) {
                console.log(error);
            }

        })
        setComponentsTemplate(components)
        content.innerHTML = "";
        var base = renderComponentGroup(content, "sidebar_component_base", "基础");
        var layout = renderComponentGroup(content, "sidebar_component_layout", "布局");
        var container = renderComponentGroup(content, "sidebar_component_container", "容器");
        var chart = renderComponentGroup(content, "sidebar_component_chart", "图表");
        var flow = renderComponentGroup(content, "sidebar_component_flow", "流程");

        renderComponents(components, base, layout, container, chart, flow);

        //自定义按钮
        var custom = document.createElement("div");
        custom.className = "custom_component";
        custom.style.lineHeight = "1.5";
        custom.style.textAlign = "center";
        custom.style.fontSize = "10px";
        custom.innerText = "更多组件";

        content.appendChild(custom);

        custom.onclick = () => {

            showCustomComponent();

        }



    });
    ipcRendererSend("loadPluginsComponent");


}

var explorerHideMap = new Map<string, boolean>();
export function renderExplorer(key: string, content: HTMLElement, name: string, hide?: boolean, taps?: IContextMenuItem[]): HTMLDivElement {
    var explorer = document.createElement("div");
    explorer.className = "explorer";
    explorer.id = key;
    content.appendChild(explorer);

    var title = document.createElement("div");
    title.className = "explorer_title";

    var icon = document.createElement("i");
    icon.style.marginLeft = "5px";
    title.appendChild(icon);


    var label = document.createElement("div");
    if (/\[\S+\]/.test(name)) {
        label.id = name.substring(1, name.length - 1);
    } else {
        label.innerText = name;
    }

    title.appendChild(label);
    label.style.flex = "1";

    explorer.appendChild(title);
    var view = document.createElement("div");
    view.className = "explorer_view";

    explorer.appendChild(view);

    var hideMap = explorerHideMap.get(name);
    if (hideMap != undefined) {
        hide = hideMap;
    }

    if (hide) {
        view.style.display = "none";
        icon.className = "bi bi-chevron-right";
    } else {
        icon.className = "bi bi-chevron-down";
    }

    label.onclick = (e: MouseEvent) => {
        if (view.style.display == "none") {
            view.style.display = "block";
            icon.className = "bi bi-chevron-down";
            explorerHideMap.set(name, false);
        } else {
            view.style.display = "none";
            icon.className = "bi bi-chevron-right";
            explorerHideMap.set(name, true);
        }
    }

    if (taps != undefined) {
        var tapsDiv = document.createElement("div");
        tapsDiv.style.paddingRight = "5px";
        tapsDiv.style.display = "flex";
        title.appendChild(tapsDiv);
        taps.forEach((tap: IContextMenuItem) => {
            var tapDiv = document.createElement("div");
            tapDiv.className = "tool_tap";
            tapDiv.title = tap.label;
            var tapIcon = document.createElement("i");
            tapIcon.className = tap.icon;
            tapDiv.appendChild(tapIcon);
            tapIcon.onclick = tap.onclick;
            tapsDiv.appendChild(tapDiv);
        });
    }




    var body = document.createElement("div");
    body.className = "explorer_body";


    view.appendChild(body);

    return body;

}

function renderComponentGroup(content: HTMLElement, key: string, label: string) {
    var title = document.createElement("div");
    title.className = "sidebar_title";
    title.innerText = label;
    title.draggable = false;
    content.appendChild(title);
    var componentsDiv = document.createElement("div");
    componentsDiv.className = "components";
    componentsDiv.draggable = false;
    content.appendChild(componentsDiv);
    componentsDiv.id = key;
    return componentsDiv;
}
//只渲染默认组件，多余组件不展示再sidebar中

function renderComponents(components: Array<IComponent>, base: HTMLElement, layout: HTMLElement, container: HTMLElement, chart: HTMLElement, flow: HTMLElement) {
    var componentsdisplay = getConfig().componentsEnable;
    components.forEach(component => {

        //只渲染默认组件
        if (componentsdisplay.indexOf(component.type) > -1) {
            var icon = document.createElement("i");
            icon.className = component.icon;
            if (component.rotate != undefined) {
                // icon.style.cssText+=component.iconStyle;
                icon.setAttribute("data-rotate", "");
            }
            var label = document.createElement("span");
            label.innerText = component.label;
            var componentDiv = document.createElement("div");
            componentDiv.className = "component";
            componentDiv.appendChild(icon);
            componentDiv.appendChild(label);
            componentDiv.draggable = true;
            if (component.group == undefined || component.group == "base") {
                base.appendChild(componentDiv);
            } else if (component.group == "layout") {
                layout.appendChild(componentDiv);
            } else if (component.group == "container") {
                container.appendChild(componentDiv);
            } else if (component.group == "chart") {
                chart.appendChild(componentDiv);
            } else if (component.group == "flow") {
                flow.appendChild(componentDiv);
            }



            componentDiv.ondragstart = (e: DragEvent) => {
                dargData.setData("componentTemplate", component);
                var page = getCurPageContent();
                if (page != undefined) {
                    page.setAttribute("data-drag", "true");
                }

            }
            componentDiv.ondragend = (e: DragEvent) => {

                var page = getCurPageContent();
                if (page != undefined) {
                    page.removeAttribute("data-drag");
                }
            };

        }




    })


}

const templatePages: Array<{
    key: string,
    label: string,
    onPriview: () => HTMLElement,
}> = [
        {
            label: "列表",
            key: "list",
            onPriview: () => {
                var page = document.createElement("div");


                var header = document.createElement("div");
                header.style.height = "20px";


                header.style.opacity = "0.5";
                header.style.display = "flex";
                page.appendChild(header);

                var headerText = document.createElement("div");
                headerText.style.flex = "1";
                headerText.style.backgroundColor = "#f90";
                headerText.style.borderRadius = "5px";
                header.appendChild(headerText);

                var flex = document.createElement("div");
                flex.style.flex = "1";

                header.appendChild(flex);

                var headerTap = document.createElement("div");
                headerTap.style.flex = "1";
                headerTap.style.borderRadius = "5px";
                headerTap.style.backgroundColor = "#9f0";
                header.appendChild(headerTap);


                var table = document.createElement("div");
                table.style.height = "100px";
                table.style.marginTop = "10px";
                table.style.backgroundColor = "#f09";
                table.style.borderRadius = "5px";
                table.style.opacity = "0.5";
                page.appendChild(table);

                var footer = document.createElement("div");
                footer.style.height = "20px";
                footer.style.marginTop = "10px";

                footer.style.display = "flex";
                footer.style.opacity = "0.5";
                page.appendChild(footer);

                var flex1 = document.createElement("div");
                flex1.style.flex = "1";
                footer.appendChild(flex1);

                var footerPages = document.createElement("div");
                footerPages.style.flex = "1";
                footerPages.style.borderRadius = "5px";
                footerPages.style.backgroundColor = "#9f0";
                footer.appendChild(footerPages);






                return page;
            }
        },
        {
            label: "树形",
            key: "tree",
            onPriview: () => {

                var content = document.createElement("div");
                content.style.display = "flex";

                var tree = document.createElement("div");
                tree.style.flex = "1";
                tree.style.backgroundColor = "#f90";
                tree.style.borderRadius = "5px";
                tree.style.marginRight = "10px";
                tree.style.opacity = "0.5";
                content.appendChild(tree);




                var page = document.createElement("div");
                page.style.flex = "3";
                content.appendChild(page);

                var header = document.createElement("div");
                header.style.height = "20px";


                header.style.opacity = "0.5";
                header.style.display = "flex";
                page.appendChild(header);

                var headerText = document.createElement("div");
                headerText.style.flex = "1";
                headerText.style.backgroundColor = "#f90";
                headerText.style.borderRadius = "5px";
                header.appendChild(headerText);

                var flex = document.createElement("div");
                flex.style.flex = "1";

                header.appendChild(flex);

                var headerTap = document.createElement("div");
                headerTap.style.flex = "1";
                headerTap.style.borderRadius = "5px";
                headerTap.style.backgroundColor = "#9f0";
                header.appendChild(headerTap);


                var table = document.createElement("div");
                table.style.height = "100px";
                table.style.marginTop = "10px";
                table.style.backgroundColor = "#f09";
                table.style.borderRadius = "5px";
                table.style.opacity = "0.5";
                page.appendChild(table);

                var footer = document.createElement("div");
                footer.style.height = "20px";
                footer.style.marginTop = "10px";

                footer.style.display = "flex";
                footer.style.opacity = "0.5";
                page.appendChild(footer);

                var flex1 = document.createElement("div");
                flex1.style.flex = "1";
                footer.appendChild(flex1);

                var footerPages = document.createElement("div");
                footerPages.style.flex = "1";
                footerPages.style.borderRadius = "5px";
                footerPages.style.backgroundColor = "#9f0";
                footer.appendChild(footerPages);
                return content;
            }
        },
        {
            label: "Hub",
            key: "hub",
            onPriview: () => {



                var page = document.createElement("div");
              


                var table = document.createElement("div");
                table.style.height = "100px";
               
                table.style.backgroundColor = "#f09";
                table.style.borderRadius = "5px";
                table.style.opacity = "0.5";
                page.appendChild(table);



                var header = document.createElement("div");
                header.style.height = "20px";

                header.style.marginTop = "10px";
                header.style.opacity = "0.5";
                header.style.display = "flex";
                page.appendChild(header);

                var headerText = document.createElement("div");
                headerText.style.flex = "1";
                headerText.style.backgroundColor = "#f90";
                headerText.style.borderRadius = "5px";
                header.appendChild(headerText);

                var flex = document.createElement("div");
                flex.style.flex = "1";

                header.appendChild(flex);

                var headerTap = document.createElement("div");
                headerTap.style.flex = "1";
                headerTap.style.borderRadius = "5px";
                headerTap.style.backgroundColor = "#9f0";
                header.appendChild(headerTap);

                var footer = document.createElement("div");
                footer.style.height = "20px";
                footer.style.marginTop = "10px";

                footer.style.display = "flex";
                footer.style.opacity = "0.5";
                page.appendChild(footer);




                var flex1 = document.createElement("div");
                flex1.style.flex = "1";
                footer.appendChild(flex1);



                var footerPages = document.createElement("div");
                footerPages.style.flex = "1";
                footerPages.style.borderRadius = "5px";
                footerPages.style.backgroundColor = "#9f0";
                footer.appendChild(footerPages);
                return page;
            }
        }
    ]

function createPageByTemplate(caltalog?: ICatalog) {

    var rd = renderDialog();
    var dialog = rd.content;
    dialog.style.display = "flex";
    dialog.style.alignItems = "center";
    dialog.style.justifyContent = "center";

    var content = document.createElement("div");
    content.className = "template_content";
    dialog.appendChild(content);

    templatePages.forEach(page => {
        var pageDiv = document.createElement("div");
        pageDiv.className = "template_page background";
        var context = page.onPriview();
        pageDiv.appendChild(context);

        var title = document.createElement("div");
        title.className = "template_title";
        title.innerText = page.label;
        title.style.fontSize = "18px";
        title.style.fontWeight = "bold";
        title.style.lineHeight = "3";
        title.style.opacity= "0.9";
        pageDiv.appendChild(title);

        content.appendChild(pageDiv);
    });


}