

/*! *****************************************************************************
Copyright (c) taoyongwen. All rights reserved.

渲染工作区
***************************************************************************** */
import { BrowserWindow, clipboard, ipcRenderer, Menu, MenuItem } from "electron";
import { regeditTheme } from "../echarts/theme";

import { copyComponent, deleteComponent, getComponentsTemplate, getComponentTempateByType, getPathKey, initComponent, renderComponent, renderComponentPreview, renderComponents, renderStorePreview } from "../common/components";
import { checkContextMenu, IMenuItem, openContextMenu } from "../common/contextmenu";
import { getUUID, IComponent, IPage, ITitle } from "../common/interfaceDefine";
import { ipcContextMenu, ipcRendererSend } from "../preload";
import { updateBlueView } from "./blueprint";
import * as dargData from "./DragData";
import { INavItem, renderNavTrees } from "./pageNav";
import { renderTitleBar } from "./pageTitle";
import { getKeyCode, getMousePosition } from "../render/shorcuts";
import { activePropertyPanel } from "./propertypanel";
import { pushHistory } from "./history";
import { isDark } from "../dialog/picker";
import { getProject, renderRecent } from "./workspace";
import { saveSimplePage } from "./toolbar";
import { updateStatus } from "./statusBar";


// var hoverComponentRoot: HTMLElement;
// export function setHoverComponentRoot(componentRoot: HTMLElement) {
//     hoverComponentRoot = componentRoot;
// }
// export function getHoverComponentRoot() {
//     return hoverComponentRoot;
// }
/**
 * 获取当前页面展示上下文div
 * @returns 
 */
export function getCurPageContent(): HTMLElement {
    var content = document.getElementById("page_content_" + getCurPage().key);
    return content;
}
export function getCurViewContent(): HTMLElement {
    var content = document.getElementById("page_view_" + getCurPage().key);
    return content;
}

/**
 * 获取当前页面组件
 * @returns 
 */
export function getPageLayers() {
    return getCurPage().children;

}
/**
 * 删除组件
 * @param comments 
 */
export function clearDelete(comments: IComponent[]) {
    var i = 0;
    while (i < comments.length) {
        if (comments[i].isRemoved) {
            console.log("delete", i);
            comments.splice(i, 1);
        } else {

            if (comments[i].children != undefined) {
                clearDelete(comments[i].children);
            } i++;
        }
    }
}
/**
 * 寻找当前页面的组件 按照 组件的path
 * @param path 
 * @returns 
 */
export function findCurPageComponent(path: string): IComponent {
    try {
        var page = getCurPage();
        if (page == undefined || page.children == undefined || page.children.length == 0)
            return undefined;
        var keys = path.split("/");
        if (keys.length == 1) {
            return page.children.find(c => c.key == keys[0]);
        }
        var parent: any = page;
        keys.forEach(key => {
            parent = parent.children.find((c: IComponent) => c.key == key);
        })
        return parent;
    } catch (e) {
        return undefined;
    };

}
export function getCurPageKey() {
    return selectPageKey;
}
/**
 * 获取当前页面
 * @returns 
 */
export function getCurPage() {

    var page = pages.find(p => p.key == selectPageKey);
    if (page != undefined) {
        if (page != undefined && page.blues == undefined) {
            page.blues = [];
        }
        if (page != undefined && page.blueLinks == undefined) {
            page.blueLinks = [];
        }
        if (page != undefined && page.children != undefined) {
            //sort
            component_sort(page.children);
        }
        return page;
    }
    return undefined;
}
export function setCurPage(page: any) {

    var old = pages.findIndex(p => p.key == page.key)
    pages.splice(old, 1, page);

}
/**
 * 组件排序
 * @param comments 
 * @param parent 
 * @returns 
 */
export function component_sort(comments: IComponent[], parent?: IComponent) {
    for (var s = 0; s < comments.length; s++) {
        if (comments[s] == undefined) {
            return;
        }
        //初始化路径
        if (parent == undefined) {
            comments[s].path = comments[s].key;

        } else {
            comments[s].path = parent.path + "/" + comments[s].key;
        }
        comments[s].sort = s;
        if (comments[s].children != undefined) {
            component_sort(comments[s].children, comments[s]);
        }
    }

}
//项目标题栏
var projectTitleJson: any;
//项目导航栏
var projectNavJson: any;
export function getProjectTitleJson(): ITitle {
    return projectTitleJson;
}
export function getProjectNavJson() {
    return projectNavJson;
}
export function setProjectNavJson(json: any) {
    return projectNavJson = json;
}
export function setProjectTitleJson(json: any) {
    return projectTitleJson = json;
}
/**
 * 加载标题栏
 */
export function loadProjectTitleNav() {
    ipcRenderer.removeListener("_readTitleNav", () => { });
    ipcRendererSend("readTitleNav");
    ipcRenderer.on("_readTitleNav", (event: any, arg: any) => {
        console.log(arg);
        projectNavJson = arg.nav;
        projectTitleJson = arg.title;


    })
}
/**
 * 刷新页面
 */
export function reRenderPage() {
    var page = getCurPage();
    var body = document.getElementById("page_content_" + selectPageKey);
    renderPageBody(body, page, page.width, page.height);
    //   renderWorkbench(view, projectTitleJson, projectNavJson, page);
    try {
        var title_bar: any = getCurViewContent().getElementsByClassName("title_bar")[0];
        renderTitleBody(title_bar, getProjectTitleJson(), page.height);
    } catch (e) {
        console.log(e);
    }
}

function closePage(spage: IPage) {

    var index = pages.findIndex(p => p.path == spage.path);
    if (index != -1) {
        pages.splice(index, 1);
    }
    var tab = document.getElementById("page_tab_" + spage.key);
    if (tab != undefined) {
        tab.remove();

    }
    var view = document.getElementById("page_view_" + spage.key);
    if (view != undefined) {
        view.remove();
    }
    if (pages.length > 0) {
        renderPage(pages[0]);
    }
    if (pages.length == 0) {
        activePropertyPanel("project");
        renderRecent();
    }


}

var pages: IPage[] = [];
var selectPageKey: string;
/**
 * 
 * @param page 渲染页面
 */
export function renderPage(page: IPage) {
    var workbenchtabs = document.getElementById("workbench_tabs");
    var workbenchpages = document.getElementById("workbench_pages");



    if (pages.findIndex(p => p.key == page.key) == -1) {


        if (pages.length >= 8) {
            //删除页面，并保存
            requestIdleCallback(() => {

                var index = 0;
                var rmPage = pages[0];
                if (rmPage.change) {
                    saveSimplePage(rmPage);
                }

                pages.splice(index, 1);
                var tab = document.getElementById("page_tab_" + rmPage.key);
                if (tab != undefined) {
                    tab.remove();

                }
                var view = document.getElementById("page_view_" + rmPage.key);
                if (view != undefined) {
                    view.remove();
                }

            });

        }





        //打开新页面

        pages.push(page);
        page.change = false;
        if (selectPageKey != undefined) {
            var tab = document.getElementById("page_tab_" + selectPageKey);
            if (tab != undefined) {
                tab.setAttribute("selected", "false");

            }
            var view = document.getElementById("page_view_" + selectPageKey);
            if (view != undefined) {
                view.style.display = "none";
            }
        }


        selectPageKey = page.key;
        //添加tab
        var pageTab = document.createElement("div");
        pageTab.style.display = "flex";
        pageTab.id = "page_tab_" + page.key;
        pageTab.className = "page_tab";
        pageTab.style.alignItems = "center";
        pageTab.style.justifyContent = "center";
        pageTab.style.padding = "0px 10px 0px 5px";
        workbenchtabs.style.overflow = "hidden";
        workbenchtabs.appendChild(pageTab);
        //tab icon
        var icon = document.createElement("i");
        icon.className = "bi bi-file-earmark";
        pageTab.appendChild(icon);
        //tab title
        var title = document.createElement("span");
        title.innerHTML = page.name;
        pageTab.onclick = () => {
            renderPage(page);
        }
        title.style.padding = "0px 5px 0px 5px";
        pageTab.appendChild(title);

        var button = document.createElement("div");
        button.style.width = "18px";
        button.style.overflow = "hidden";
        pageTab.appendChild(button);

        var changed = document.createElement("i");
        changed.className = "bi bi-dot";

        button.appendChild(changed);

        //contextmenu
        pageTab.oncontextmenu = (event: any) => {
            var menuList: IMenuItem[] = [
                {
                    label: "关闭", id: "close", accelerator: "Command+w", onclick: () => {
                        closePage(page);
                    }
                },
                {
                    label: "关闭全部", id: "closeall", onclick: () => {
                        //closePage(page);
                    }
                },
                {
                    label: "关闭其他", id: "closeother", onclick: () => {
                        //  closePage(page);
                    }
                }
            ];
            openContextMenu(menuList);
        }


        //tab close
        var close = document.createElement("i");
        close.className = "bi bi-x";
        button.appendChild(close);
        close.onclick = (e) => {
            e.stopPropagation();


            if (page.change) {

                ipcRendererSend("isSave", { message: "是否保存 " + page.name, page: page.key });
                ipcRenderer.on("_isSave", (eve, arg) => {
                    var pageKey = arg.page;
                    var response = arg.response;
                    if (response == 0) {

                    } else if (response == 1) {
                        var spage = pages.find(p => p.key == pageKey);
                        saveSimplePage(spage);
                        closePage(spage);
                    } else if (response == 2) {
                        var spage = pages.find(p => p.key == pageKey);
                        spage.change = false;
                        closePage(spage);
                    }

                })

                // saveSimplePage(page);
            } else {
                closePage(page);
            }



        }

        pageTab.setAttribute("selected", "true");

        //添加页面
        var pageView = document.createElement("div");
        pageView.id = "page_view_" + page.key;
        pageView.style.position = "absolute";
        pageView.style.top = "0px";
        pageView.style.left = "0px";
        pageView.style.right = "0px";
        pageView.style.bottom = "0px";
        workbenchpages.appendChild(pageView);

        //渲染页面工作区
        renderWorkbench(pageView, projectTitleJson, projectNavJson, page);
        //更新右侧、底部面板

        setTimeout(() => {
            //TODO  load
            //   renderPageViewF();
            //  switchFloatTab("页面");
            updateBlueView();//蓝图
            //右侧面板
            activePropertyPanel("page");
            //renderGuidePanel();//引导面板
            //状态栏
            updateStatus(page, undefined, undefined);
        }, 500);
        //历史记录
        //    pushHistory(page);

    } else {
        //切换页面
        if (selectPageKey != undefined) {
            var tab = document.getElementById("page_tab_" + selectPageKey);
            if (tab != undefined) {
                tab.setAttribute("selected", "false");


            }
            var view = document.getElementById("page_view_" + selectPageKey);
            if (view != undefined) {
                view.style.display = "none";
            }
        }

        selectPageKey = page.key;
        if (selectPageKey != undefined) {
            var tab = document.getElementById("page_tab_" + selectPageKey);
            if (tab != undefined) {
                tab.setAttribute("selected", "true");
            }
            var view = document.getElementById("page_view_" + selectPageKey);
            if (view != undefined) {
                view.style.display = "block";
            }
        }
        //更新右侧、底部面板
        setTimeout(() => {
            //TODO  load
            //   renderPageViewF();
            //   switchFloatTab("页面");
            updateBlueView();//蓝图
            //右侧面板
            activePropertyPanel("page");
            //renderGuidePanel();//引导面板
            //状态栏
            updateStatus(page, undefined, undefined);
        }, 100);
    }
    requestIdleCallback(() => {
        var theme = "default";
        if (getCurPage().theme == "dark") {
            theme = "dark";
        }
        regeditTheme();


    });


}


export function getLayers(): Array<IComponent> {
    if (getCurPage() == undefined) {
        return undefined;
    }

    return getCurPage().children;
}

export function pushLayer(component: IComponent): void {

    getCurPage().children.push(component);
}

/**
 *  //渲染页面工作区
 * @param content 
 * @param titleJson 
 * @param navJson 
 * @param p 
 */
export function renderWorkbench(content: HTMLElement, titleJson: any, navJson: any, p: IPage) {
    var start = Date.now();
    console.log("renderPage");
    var curPage = p;
    content.innerHTML = "";
    var scale = 1;
    if (p.scale != undefined) {
        scale = p.scale;
    }
    var workbench = document.createElement("div");
    workbench.className = "workbench";
    content.appendChild(workbench);
    var ruler_show = true;
    var ruler_width = 20;
    var title_display: boolean = titleJson.display;
    var nav_display: boolean = navJson.display;
    var page_view = document.createElement("div");
    page_view.className = "page_view";
    if (ruler_show) {
        page_view.style.top = "0px";
        page_view.style.left = "0px";
    }
    workbench.appendChild(page_view);
    //view control
    var view_control = document.createElement("div");
    view_control.className = "view_control";
    workbench.appendChild(view_control);

    var pageHeight = 800;
    var pageWidth = 1200;
    if (curPage.height != undefined) pageHeight = curPage.height;
    if (curPage.width != undefined) pageWidth = curPage.width;
    //
    var page_parent = document.createElement("div");
    page_parent.id = "page_parent_" + p.key;
    page_parent.className = "page_parent " + curPage.theme;
    page_view.appendChild(page_parent);
    page_parent.style.transform = "scale(" + scale + ")";

    //工作区 缩放
    page_view.onwheel = function (ew) {
        if (getKeyCode() == "Control") {
            scale += ew.deltaY / 1000;
            scale = Math.round(scale * 100) / 100;
            if (scale < 0.1) {
                scale = 0.1;

            }
            if (scale > 1.1) {
                scale = 1.1;
            }
            page_parent.style.transform = "scale(" + scale + ")";
            getCurPage().scale = scale;
            //右侧面板
            activePropertyPanel("page");
        }
    }
    //渲染标题栏
    if (title_display && curPage.type == "page") {
        var title_bar = document.createElement("div");
        page_parent.appendChild(title_bar);
        pageHeight = pageHeight - title_bar.clientHeight;
        if (isDark(titleJson.background) && curPage.theme == "light") {
            title_bar.style.color = "#fff";
        } else if (!isDark(navJson.background) && curPage.theme == "dark") {
            title_bar.style.color = "#000";
        }
        renderTitleBody(title_bar, titleJson, pageHeight);


    }
    //工作区
    var page_content = document.createElement("div");
    page_content.className = "page_content";
    page_parent.appendChild(page_content);
    //渲染导航
    if (nav_display && curPage.type == "page") {
        page_content.style.display = "flex";
        var nav_bar = document.createElement("div");
        nav_bar.className = "nav_bar";
        nav_bar.style.background = navJson.background;
        if (isDark(navJson.background) && curPage.theme == "light") {
            nav_bar.style.color = "#fff";
        } else if (!isDark(navJson.background) && curPage.theme == "dark") {
            nav_bar.style.color = "#000";
        }
        page_content.appendChild(nav_bar);
        pageWidth = pageWidth - nav_bar.clientWidth;
        nav_items = navJson.items;
        renderNavTrees(nav_bar, navJson.items);
    }
    //渲染页面
    var page = document.createElement("div");
    renderPageBody(page, curPage, pageWidth, pageHeight);
    page_content.appendChild(page);
    if (curPage.backgroundColor != undefined && curPage.backgroundColor != "none" && curPage.backgroundColor != "transparent")
        page_parent.style.background = curPage.backgroundColor;
    //渲染标尺
    if (ruler_show) {
        var ruler_top = document.createElement("div");
        ruler_top.className = "ruler_top";
        ruler_top.style.height = ruler_width + "px";
        workbench.appendChild(ruler_top);
        var ruler_view = document.createElement("div");
        ruler_view.className = "ruler_view";
        ruler_top.appendChild(ruler_view);
        for (var r = -100; r <= pageWidth + 200; r += 50) {
            var ruler_px = document.createElement("div");
            ruler_px.className = "ruler_px";
            ruler_px.innerText = r + "";
            ruler_view.appendChild(ruler_px);
        }
        var ruler_left = document.createElement("div");
        ruler_left.className = "ruler_left";
        ruler_left.style.width = ruler_width + "px";
        ruler_left.style.top = ruler_width + "px";
        workbench.appendChild(ruler_left);
        var ruler_view1 = document.createElement("div");
        ruler_view1.className = "ruler_view_left";
        // ruler_view1.id = "ruler_view_left";
        ruler_view1.style.top = (-ruler_width) + "px";
        ruler_left.appendChild(ruler_view1);
        for (var r = -100; r <= pageHeight + 100; r += 50) {
            var ruler_px = document.createElement("div");
            ruler_px.className = "ruler_px_left";
            ruler_px.innerText = r + "";
            ruler_view1.appendChild(ruler_px);
        }
    }

    //页面滚动，标尺跟着滚动
    page_view.onscroll = (e: Event) => {
        //  var ruler_view = document.getElementById("ruler_view");
        if (ruler_view != undefined) {
            ruler_view.style.left = (-page_view.scrollLeft) + "px";
        }
        //   var ruler_view_left = document.getElementById("ruler_view_left");
        if (ruler_view1 != undefined) {
            ruler_view1.style.top = - page_view.scrollTop - ruler_width + "px";
        }
    }
    //渲染 页面 选择效果
    page_view.onmousedown = (e: any) => {
        if (e.button != 0) {
            return;
        }
        checkContextMenu();
        if (e.target.className == "page_view" || e.target.className == "component" || e.target.className == "page" || e.target.className == "grid") {
            e.stopPropagation();
            var selectCover = document.createElement("div");
            selectCover.className = "selectCover";
            selectCover.id = "selectCover";
            selectCover.style.pointerEvents = "none";
            selectComponents.forEach(s => {
                var div = document.getElementById(getPathKey(s));
                if (div) div.removeAttribute("selected");
            })
            selectComponents = [];
            //右侧面板
            activePropertyPanel("page");
            var x = e.clientX;
            var y = e.clientY;
            var h = 0;
            var w = 0;
            var select = true;
            selectCover.style.left = x + "px";
            selectCover.style.top = y + "px";
            page_view.onmousemove = (e) => {
                if (!select) return;
                if (!document.getElementById("selectCover")) { document.body.appendChild(selectCover); }
                w = e.clientX - x;
                h = e.clientY - y;
                if (w >= 0) {
                    selectCover.style.width = w + "px";
                } else {
                    selectCover.style.left = e.clientX + "px";
                    selectCover.style.width = (x - e.clientX) + "px";
                }
                if (h >= 0) {
                    selectCover.style.height = h + "px";
                } else {
                    selectCover.style.top = e.clientY + "px";
                    selectCover.style.height = (y - e.clientY) + "px";
                }
            };
            document.onmouseup = () => {
                select = false;
                selectCover.remove();
            }
        }
    }
    console.log("renderPage---", Date.now() - start);
}
function renderTitleBody(title_bar: HTMLElement, titleJson: any, pageHeight: number) {
    if (title_bar == undefined)
        return;
    title_bar.className = "title_bar";
    title_bar.style.background = titleJson.background;

    renderTitleBar(title_bar, titleJson);

}
var zoomType: "50" | "100" | "150" = "100";
export function renderPageBody(page: HTMLElement, curPage: IPage, pageWidth: number, pageHeight: number) {
    page.innerHTML = "";
    page.className = "page";
    page.id = "page_content_" + curPage.key;
    page.tabIndex = 800;
    page.setAttribute("data-type", curPage.type);
    page.style.width = pageWidth + "px";
    page.style.height = pageHeight + "px";
    //render
    if (curPage.children != undefined && curPage.children.length > 0) {
        var rs = Date.now();
        renderComponents(page, curPage.children, undefined);
        console.log("renderComponents---", Date.now() - rs);
    }
    //渲染 右键菜单
    page.oncontextmenu = (e: MouseEvent) => {
        // folderTitle.setAttribute("selected", "true");
        var menuItems: Array<IMenuItem> = [{
            id: "paste",
            label: "粘贴", icon: "bi bi-clipboard", accelerator: "Command+v", onclick: () => {
                clipboardPaste(page);

            }
        }, {
            id: "insert",
            label: "插入组件", icon: "bi bi-layout-wtf", accelerator: "i", onclick: () => {
                setTimeout(() => {
                    shortcutInsertComponent(e.clientX, e.clientY);
                }, 1);
            }
        }, {
            id: "insertImg",
            label: "插入图片", icon: "bi bi-card-image", accelerator: "i", onclick: () => {
                setTimeout(() => {
                    ipcRendererSend("insertImage");
                }, 1);
            }
        }, {
            type: "separator"
        }, {
            id: "zoom50",
            label: "50%",
            type: "radio",
            checked: zoomType == "50",
            onclick: () => {
                zoomType = "50";

                // page_parent.style.transform = "scale(" + scale + ")";
                // page_sacle.innerText = scale + "";
            }

        }, {
            id: "zoom100",
            label: "100%",
            type: "radio",
            checked: zoomType == "100",
            onclick: () => {
                zoomType = "100";
                // page.style.transform="scale(1)";
            }
        }, {
            id: "zoom150",
            label: "150%",
            type: "radio",
            checked: zoomType == "150",
            onclick: () => {
                zoomType = "150";
                // page.style.transform="scale(1.5)";
            }

        }];
        openContextMenu(menuItems);
        e.stopPropagation();
    }
    //设置 快捷键
    page.onkeydown = (e: KeyboardEvent) => {
        if (!e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
            if (e.key == "i") {
                //插入组件
                shortcutInsertComponent(getMousePosition().x, getMousePosition().y);
            }
            else if (e.key == "Backspace") {
                //删除
                selectComponents.forEach((key: string) => {
                    var cmpt = findCurPageComponent(key);
                    deleteComponent(cmpt);
                });
            } else if (e.key == "v") {
                //显示组件 边框
                showComponentsOutLine();
            }
            e.stopPropagation();
        }
    };
    //shortcut
    page.onkeyup = (e: KeyboardEvent) => {

        if (!e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
            if (e.key == "v") {
                //隐藏组件 边框
                hideComponentsOutLine();
            }
            e.stopPropagation();
        }
    };
    //页面 接受 组件 拖拽
    var previewComponent: HTMLElement;
    page.ondragover = (e: DragEvent) => {

        e.preventDefault();
    }
    page.ondragenter = (e: any) => {
        var component = dargData.getData("componentTemplate")
        if (e.target.className == "page" && previewComponent == undefined) {
            if (component != undefined)
                previewComponent = renderComponentPreview(page, component)
        }
        var dragStore = dargData.getData("store");
        if (dragStore != undefined) {
            //拖拽 商店 内容 至 界面
            previewComponent = renderStorePreview(page, dragStore)

        }

    }
    page.ondragleave = (e: DragEvent) => {
        if (previewComponent != undefined) {
            previewComponent.remove();
            previewComponent = undefined;
        }
    }
    page.ondragend = (e: DragEvent) => {
        if (previewComponent != undefined) {
            previewComponent.remove();
            previewComponent = undefined;
        }
    }
    page.ondrop = (e: DragEvent) => {
        if (previewComponent != undefined) {
            previewComponent.remove();
            previewComponent = undefined;
        }
        var componentT = dargData.getData("componentTemplate")
        if (componentT != undefined) {
            var component = initComponent(componentT);
            if (curPage.children == undefined) {
                curPage.children = [];
            }
            component.path = component.key;
            component.sort = curPage.children.length;
            curPage.children.push(component);
            //右侧面板
            //  activePropertyPanel();
            //如果是扩展组件
            if (component.isExpand) {
                var expand = document.getElementById("project_expand");
                expand.innerHTML = "";
                expand.style.display = "flex";
                renderComponent(expand, component);
            } else {
                renderComponent(page, component);
            }


            pushHistory(getCurPage());
        }
        var dragStore = dargData.getData("store");
        if (dragStore != undefined) {
            //拖拽 商店 内容 至 界面
            getStoreExtension(dragStore.key, (err: any, res: any, body: any) => {
                if (err == null || err == undefined) {
                    var cmpt: IComponent = body;
                    copyComponent(cmpt);
                    component.sort = curPage.children.length;
                    curPage.children.push(cmpt);
                    //右侧面板
                    //  activePropertyPanel();
                    renderComponent(page, cmpt);

                    pushHistory(getCurPage());

                } else {
                    console.log(err);
                }


            })


        }
    }


}
export function getStoreExtension(key: string, callback: (err: any, res: any, body: any) => void) {
    var url = "https://www.violetiem.com/store/get?extesion=" + key;
    const request = require("request");
    request.get(url, callback, { json: true });
}
export function hideComponentsOutLine() {
    var page = getCurPageContent();
    if (page != undefined) {
        page.removeAttribute("data-drag");
    }
}
export function showComponentsOutLine() {
    var page = getCurPageContent();
    if (page != undefined) {
        page.setAttribute("data-drag", "true");
    }

}
var selectComponents: Array<string> = [];
export function getSelectComponents(): Array<string> {
    return selectComponents;
}
export function setSelectComponents(data: Array<string>) {
    selectComponents = data;
}

/**
 * 渲染 插入组件 的右键菜单
 * @param x 
 * @param y 
 * @param component 
 * @param position 
 * @returns 
 */
export function shortcutInsertComponent(x: number, y: number, component?: IComponent, position?: number) {

    if (component != undefined) {
        if (component.type != "grid" && component.type != "row") {
            if (component.drop != "component") {
                console.log("shortcutInsertComponent<<<<");
                return;
            }
        }

    }
    //
    console.log("shortcutInsertComponent>>>>");
    var showComponents = ["button", "label", "text", "grid", "row", "flex", "space", "dialog", "chart_line", "chart_bar", "chart_pie"];
    var contextMenus: IMenuItem[] = [];

    showComponents.forEach((key: string) => {
        var t = getComponentsTemplate().find(t => t.type == key);
        if (t != undefined) {
            var item: IMenuItem = {
                id: getUUID(),
                label: t.label, icon: t.icon, onclick: () => {
                    var ct = initComponent(t);
                    if (component == undefined) {
                        getCurPage().children.push(ct);
                        renderComponent(getCurPageContent(), ct);
                    }
                    else {
                        if (component.children == undefined) {
                            component.children = [];
                        }
                        if (position == undefined) {
                            component.children.push(ct);
                            renderComponent(document.getElementById(component.key), ct);
                        } else {
                            console.log(component.path, position);
                            if (component.path.indexOf("/") < 0) {
                                ct.sort = position;
                                getCurPage().children.splice(position, 0, ct);
                                renderComponent(getCurPageContent(), ct, position);
                            } else {
                                var parent = findCurPageComponent(component.path.substring(0, component.path.lastIndexOf("/")));
                                if (parent != undefined) {
                                    ct.sort = position;
                                    parent.children.splice(position, 0, ct);
                                    renderComponent(document.getElementById(parent.key), ct, position);
                                }
                            }
                        }

                    }
                    //右侧面板
                    activePropertyPanel();

                }
            }
            contextMenus.push(item);
            if (t.key == "dialog" || t.key == "text") {
                contextMenus.push({
                    type: "separator"
                })
            }
        }

    });


    var label = "插入组件";
    if (position != undefined) {
        label = "前/上插入"
    }
    openContextMenu(contextMenus);

}

var nav_items: INavItem[] = [];
export function getNavItems(): Array<INavItem> {
    return nav_items;
}
export function setNavItems(item: Array<INavItem>) {
    return nav_items = item;
}
/**
 * 插入 剪贴板 内容
 * @param body 
 * @param component 
 * @returns 
 */
export function clipboardPaste(body: HTMLElement, component?: IComponent) {


    var text = clipboard.readText();
    //插入 拷贝的组件
    if (text != undefined && text.trim().startsWith("[selectComponents]")) {
        var sr = text.substring("[selectComponents]".length);
        if (sr == "undefined") {
            return;
        }
        if (component != undefined && component.type != "grid" && component.type != "row" && component.drop != "component") {
            alert("不可以放置到这里");
            return;
        }

        console.log("copy selectComponents>>>");
        //copy selects
        var _selectComponents = JSON.parse(sr);
        _selectComponents.forEach((ncmpt: IComponent) => {

            console.log(ncmpt);
            console.log(JSON.stringify(ncmpt));

            if (component == undefined) {
                copyComponent(ncmpt, undefined);
                getCurPage().children.push(ncmpt);
            } else {
                copyComponent(ncmpt, component.path);

                if (component.children == undefined) {
                    component.children = [ncmpt];
                } else {
                    component.children.push(ncmpt);
                }
            }
            //右侧面板
            activePropertyPanel(ncmpt);
            renderComponent(body, ncmpt);


        });
        return;
    }

    //html
    var html = clipboard.readHTML();
    if (html.length > 20) {
        console.log("readhtml");
        // console.log(html);
        //插入excel
        if (html.indexOf("urn:schemas-microsoft-com:office:excel") > 0) {
            if (component != undefined && component.drop != "component") {
                alert("不可以放置到这里");
                return;
            }

            //粘贴excel
            var fra = html.match("<\!\-\-StartFragment\-\->[^\!]+");
            //console.log("fra",fra);
            if (fra != undefined && fra.length > 0) {
                var fragment = fra[0].substring(0, fra[0].length - 1);
                var tableContext = fragment.substring("<!--StartFragment-->".length, fragment.length - 2)
                var tableTmp = document.createElement("table");
                tableTmp.innerHTML = tableContext;


                var tbody = tableTmp.getElementsByTagName("tbody")[0];
                //     console.log(tbody);
                if (tbody != undefined) {
                    var trs = tbody.getElementsByTagName("tr");
                    var trsLen = trs.length;
                    var data = [];
                    for (var i = 0; i < trsLen; i++) {
                        var tr = trs[i];
                        var tds = tr.getElementsByTagName("td");
                        var tdsLen = tds.length;
                        var row: any[] = [];
                        for (var j = 0; j < tdsLen; j++) {
                            var td = tds[j];
                            if (td.colSpan != undefined || td.rowSpan != undefined) {
                                var obj: any = { v: td.innerText };
                                if (td.colSpan != undefined) {
                                    obj.c = td.colSpan;
                                }
                                if (td.rowSpan != undefined) {
                                    obj.r = td.rowSpan;
                                }
                                if (obj.c == "1" && obj.r == "1") {
                                    row.push(td.innerText);
                                } else {
                                    row.push(obj);
                                }
                            } else {
                                row.push(td.innerText);
                            }

                        }
                        data.push(row);
                        //trsArr.push(tdsArr);
                    }
                    //
                    //  console.log(data);
                    // table
                    var tableCt: IComponent = getComponentTempateByType("table");
                    var tableC = initComponent(tableCt);
                    tableC.property.hasHead.context = "false";
                    tableC.option = JSON.stringify(data, null, 2);


                    //render
                    if (component == undefined) {
                        getCurPage().children.push(tableC);
                    } else {
                        if (component.children == undefined) {
                            component.children = [tableC];
                        } else {
                            component.children.push(tableC);
                        }
                    }
                    //右侧面板
                    activePropertyPanel(tableC);
                    renderComponent(body, tableC);


                }

            }

        }

    } else if (clipboard.readImage() != undefined && clipboard.readImage().isEmpty() == false) {
        let dataUrl = clipboard.readImage().toDataURL();
        //插入图片
        var component: IComponent = {
            type: "images",

            key: getUUID(),
            icon: "bi bi-card-image",
            label: "图片",
            style: "display:inline-block;width:400px;",

            onPreview: () => {
                var img = document.createElement("img");
                img.src = dataUrl;
                return img;
            }, onRender: (component: IComponent, element: any) => {
                var img;
                if (element != undefined)
                    img = element;
                else
                    img = document.createElement("img");
                img.src = dataUrl;

                // pi.className = "bi bi-" + icon;
                return { root: img, content: img }
            }
        };
        var iPage = true;
        if (getSelectComponents().length == 1) {
            var parent = findCurPageComponent(getSelectComponents()[0]);
            if (parent != undefined && parent.drop != "component") {
                iPage = false;
                if (parent.children == undefined) parent.children = [];
                parent.children.push(component);
                //右侧面板
                activePropertyPanel(component);
                renderComponent(document.getElementById(parent.key), component);

            }
        }
        if (iPage) {
            getCurPage().children.push(component);
            //右侧面板
            activePropertyPanel();
            renderComponent(getCurPageContent(), component);

        }
    } else {
        console.log("readText");
        var text = clipboard.readText();
        // console.log(text);
    }
}
