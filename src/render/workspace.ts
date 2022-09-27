/*! *****************************************************************************
Copyright (c) taoyongwen. All rights reserved.

渲染主窗口
***************************************************************************** */
import { IpcMain, ipcRenderer } from "electron";
import { renderComponent } from "../common/components";
import { onContextMenu } from "../common/contextmenu";
import { getUUID, ICatalog, IComponent, IPage, IProject } from "../common/interfaceDefine";
import { ipcRendererSend } from "../preload";
import { renderFloatPanel } from "../render/floatPanel";

import { renderPropertyPanel, activePropertyPanel } from "./propertypanel";
import { renderSidebar, updateSidebar } from "./sidebar";
import { renderStatusBar } from "./statusBar";
import { renderToolbar, updateToolbar } from "./toolbar";
import { findCurPageComponent, getCurPage, getCurPageContent, getSelectComponents, loadProjectTitleNav, renderPage } from "./workbench";
var project: IProject;
export function getProject(): IProject {
    return project;
}
var config: any
export function getConfig() {
    return config;
}
export function setConfig(key: string, value: any) {
    config[key] = value;
}
export function saveConfig() {
    ipcRendererSend("saveConfig", config);
}
/**
 * 监听主窗口
 * @param app 
 */
export function renderWorkSpace(app: HTMLElement) {
    layout(app);
    requestIdleCallback(() => {
        //import * as shorcuts from "./shorcuts";
        const shorcuts = require("./shorcuts");
        shorcuts.init();
    });

    onContextMenu();

    ipcRendererSend("readProject");
    ipcRenderer.on("_readConfig", (event: any, arg: any) => {
        console.log("_readConfig", arg);
        config = arg;
        app.setAttribute("data-platform", process.platform);
        app.className = config.theme;
        renderRecent();
        renderStatusBar();
    });
    ipcRendererSend("readConfig");

    ipcRenderer.on("_readProject", (event, arg) => {
        console.log("_readProject", arg);
        document.title = arg.name + " - " + arg.path;
        project = arg;
        //  render(app);
        //切换主题色
        document.body.style.cssText = "--theme-color:" + getProject().themeColor;
        requestIdleCallback(()=>{
            updateToolbar();
            updateSidebar();
            activePropertyPanel("project");
        });

    })

    ipcRenderer.on("_openPage", (event, arg: IPage) => {
        hideRecent();
        if (arg == undefined) {
            showMessageBox("页面不存在", "info");
        } else {
            console.log("---OpenPage---", Date.now(), arg);
            renderPage(arg);
        }

    })

    ipcRenderer.on("_savePage", (event, arg: IPage) => {
        showMessageBox("页面保存成功", "info");
    })

    //插入图片
    ipcRenderer.on("_insertImage", (event, arg) => {
        console.log("_insertImage", arg);

        if (typeof arg == "string" && arg.startsWith("cover.")) {
            //插入封面
            project.cover = arg;
            var cover: any = document.getElementById("project_cover");
            cover.src = getProject().work + "/images/" + project.cover + "?" + Date.now();
            ipcRendererSend("saveProject", project);

        } else
            if (arg.length > 0 && getCurPage() != undefined) {
                arg.forEach((name: string) => {
                    var component: IComponent = {
                        type: "image",
                        key: getUUID(),
                        icon: "bi bi-card-image",
                        label: "图片",
                        style: "display:inline-block;width:400px;",

                        property: [
                            { label: "src", name: "src", type: 'text', context: name }
                        ],
                        onPreview: () => {
                            return document.createElement("div");
                        }, onRender: (component: IComponent, element: any, content, type) => {
                            var img;
                            if (element != undefined)
                                img = element;
                            else
                                img = document.createElement("img");
                            if (component.property.length > 0) {
                                if (type != "product") {
                                    img.src = getProject().work + "/images/" + component.property[0].context;
                                } else {
                                    img.src = "./images/" + component.property[0].context;
                                }
                            }

                            // pi.className = "bi bi-" + icon;
                            return { root: img, content: img }
                        }
                    };
                    var iPage = true;
                    //  import { renderComponent } from "../common/components";
                    const components = require("../common/components");
                    if (getSelectComponents().length == 1) {
                        var parent = findCurPageComponent(getSelectComponents()[0]);
                        if (parent != undefined && parent.type == "images") {
                            //如果是组件是 图片组 ，则直接插入
                            parent.option += name + "\n";
                            iPage = false;
                            parent.onRender(parent, document.getElementById(parent.key));

                        } else if (parent != undefined && parent.drop == "component") {
                            iPage = false;
                            if (parent.children == undefined) parent.children = [];
                            parent.children.push(component);
                            activePropertyPanel();

                            components.renderComponent(document.getElementById(parent.key), component);

                        }
                    }
                    if (iPage) {
                        getCurPage().children.push(component);
                        activePropertyPanel();

                        components.renderComponent(getCurPageContent(), component);

                    }
                });
            }
    })
}
function layout(app: HTMLElement) {


    //标题工具栏
    var toolBarHeight: number = 32;//60;
    var toolBar = document.createElement("div");

    toolBar.style.height = toolBarHeight + "px";
    toolBar.style.position = "fixed";
    toolBar.style.width = "100%";
    toolBar.style.overflow = "hidden";

    app.appendChild(toolBar);
    var flex = document.createElement("div");
    flex.style.display = "flex";
    flex.style.position = "fixed";
    flex.style.inset = toolBarHeight + "px 0px 0px";


    app.appendChild(flex);

    //状态栏
    var statusBarHeight = 22;
    var statusBar = document.createElement("div");
    statusBar.className = "statusBar";
    statusBar.id = "statusBar";
    app.appendChild(statusBar);


    //侧边栏
    var sideBar = document.createElement("div");
    flex.appendChild(sideBar);


    var main = document.createElement("div");
    main.id = "main";
    main.style.flex = "1";
    flex.appendChild(main);

    var floatPanelHeight = 210;
    //工作台
    var workbench = document.createElement("div");
    workbench.id = "workbench";
    workbench.style.position = "relative";
    main.appendChild(workbench);

    workbench.style.height = (window.innerHeight - toolBarHeight - floatPanelHeight - statusBarHeight) + "px";

    var tabsHeight = 32;

    var row = document.createElement("div");
    row.id="workbench_row";
    row.style.display = "flex";
    row.style.height = tabsHeight + "px";

    //多标签页面
    var tabs = document.createElement("div");
    tabs.className = "workbench_tabs";
    tabs.id = "workbench_tabs";
    tabs.style.display = "flex";
    tabs.style.userSelect = "none";
    tabs.style.height = tabsHeight + "px";
    tabs.style.flex = "1";
    row.appendChild(tabs);

    tabs.ondblclick = () => {
        renderRecent();
    }

    //工具栏
    var tools = document.createElement("div");
    tools.id = "workbench_tools";
    tools.style.display = "flex";
    tools.style.height = tabsHeight + "px";
    row.appendChild(tools);
    //多标签页面
    var pages = document.createElement("div");
    pages.className = "workbench_pages";
    pages.id = "workbench_pages";
    pages.style.position = "relative";
    pages.style.height = (window.innerHeight - toolBarHeight - floatPanelHeight - tabsHeight-statusBarHeight) + "px";
    workbench.appendChild(row);
    workbench.appendChild(pages);

    //最近使用页面
    var recent = document.createElement("div");
    recent.className = "project_recent";
    recent.id = "project_recent";

    workbench.appendChild(recent);

    //扩展页面
    var expand = document.createElement("div");
    expand.className = "project_expand";
    expand.id = "project_expand";
    expand.style.position = "absolute";
    workbench.appendChild(expand);
    // expand.ondblclick=()=>{
    //     expand.style.display="none";
    // }
    expand.oncontextmenu = () => {
        expand.style.display = "none";
    }
    //工作区 左侧 阴影线
    var leftShadow=document.createElement("div");
    leftShadow.id="left_shadow";
    leftShadow.style.position="absolute";
    leftShadow.style.left="-10px";
    leftShadow.style.top="32px";
    leftShadow.style.bottom="0px";
    leftShadow.style.width="10px";
  
    workbench.appendChild(leftShadow);


    //底部栏
    var floatPanel = document.createElement("div");
    floatPanel.id = "floatPanel";
    main.appendChild(floatPanel);
    floatPanel.style.height = floatPanelHeight + "px";
    renderRightSilderBar(flex, window.innerHeight - toolBarHeight);
    //右侧栏
    var edgePanel = document.createElement("div");
    edgePanel.id = "edgePanel";
    flex.appendChild(edgePanel);

    renderToolbar(toolBar);
    renderSidebar(sideBar);
    renderFloatPanel(floatPanel);
    renderPropertyPanel(edgePanel);

    requestIdleCallback(() => {
        loadProjectTitleNav();
    });
}

/**
 * 渲染左侧边栏 滚动条
 * @param content 
 * @param h 
 */
function renderRightSilderBar(content: HTMLElement, h: number) {

    var silderBar = document.createElement("div");
    silderBar.className = "silderBarV";
    silderBar.style.height = h + "px";
    content.appendChild(silderBar);
    var silderBarBlock = document.createElement("div");
    silderBarBlock.className = "silderBarBlockV";
    silderBar.appendChild(silderBarBlock);
    silderBarBlock.onmousedown = (ed: MouseEvent) => {
        var propertyWidth = document.getElementById("edgePanel").clientWidth;
        var startX = ed.clientX;
        var move: boolean = true;
        document.onmousemove = (em: MouseEvent) => {
            if (move) {
                var x = em.clientX - startX;
                var width = propertyWidth - x;
                if (width < 20)
                    width = 20;
                //  document.getElementById("workbench").style.width = (width) + "px";
                document.getElementById("edgePanel").style.width = (width) + "px";
            }
        }
        document.onmouseup = () => {
            move = false;
        }
    };
}
/**
 * 展示提示信息
 * @param message 
 * @param type 
 */
export function showMessageBox(message: string, type: "info" | "error" | "warning" | "question" | "none") {
    ipcRendererSend("show-notification_", message);
}
export function hideRecent() {
    //最近使用页面
    var recent = document.getElementById("project_recent");
    recent.style.display = "none";
}
export function renderRecent() {

    //最近使用页面
    var recent = document.getElementById("project_recent");
    recent.style.display = "block";
    recent.innerHTML = "";
    var content = document.createElement("div");
    content.style.width = "300px";
    recent.appendChild(content);

    var title = document.createElement("div");
    title.innerHTML = "最近使用";
    title.style.lineHeight = "30px";
    title.style.fontSize = "10px";
    title.className = "project_recent_title"
    content.appendChild(title);

    var list = document.createElement("div");
    list.style.minWidth = "800px";
    content.appendChild(list);

    ipcRenderer.on("_readProjectRecentPage", (event, recentData) => {
        console.log("renderRecent", recentData);
        if (recentData.length > 0) {
            for (var i = recentData.length - 1; i >= 0; i--) {

                if (recentData.length - i > 9) {
                    continue;
                }
                var pagePath = recentData[i];

                var pg: any = getPageByPath(pagePath, getProject().catalogs);

                if (pg != undefined) {
                    var page = document.createElement("div");
                    page.className = "recent_card ground";
                    page.id = pg.key;
                    page.setAttribute("data-path", pg.path);
                    page.setAttribute("data-name", pg.name);
                    list.appendChild(page);

                    var imageDiv = document.createElement("div");
                    imageDiv.style.height = "100px";
                    imageDiv.style.width = "200px";
                    page.appendChild(imageDiv);
                    imageDiv.style.backgroundImage = "url(" + getProject().work + "/images/" + pg.key + ".jpeg" + ")";
                    imageDiv.style.backgroundSize = "cover";
                    imageDiv.style.pointerEvents = "none";

                    var pageTitle = document.createElement("div");
                    pageTitle.innerHTML = pg.name;
                    pageTitle.style.lineHeight = "30px";
                    pageTitle.style.fontSize = "13px";
                    pageTitle.style.pointerEvents = "none";
                    page.appendChild(pageTitle);


                    page.onclick = (e: MouseEvent) => {
                        //open page
                        //   renderPage(catalog.page);
                        var cp: any = e.target;
                        console.log(cp);

                        ipcRendererSend("openPage", {
                            path: cp.getAttribute("data-path"), name: cp.getAttribute("data-name")
                        });


                    }
                }


            }

        }

    })
    ipcRendererSend("readProjectRecentPage", null);

}
export function getPageByPath(pagePath: string, catalogs: ICatalog[]) {
    for (var index in catalogs) {
        var cl = catalogs[index];

        if (cl.path == pagePath) {
            return cl;

        } else if (cl.children != undefined && cl.children.length > 0) {
            var p: any = getPageByPath(pagePath, cl.children);
            if (p != undefined) {
                return p;
            }
        }
    }

}
/**
 * 渲染扩展组件
 * @param component 
 */
export function renderExpand(component: IComponent) {
    var expand = document.getElementById("project_expand");
    expand.innerHTML = "";
    expand.style.display = "flex";
    requestIdleCallback(() => {
        renderComponent(expand, component);
    })
}