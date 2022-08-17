/*! *****************************************************************************
Copyright (c) taoyongwen. All rights reserved.

渲染 导航栏
***************************************************************************** */
import { switchFloatTab } from "./floatPanel";

import { IContextMenuItem, showContextMenu } from "../common/contextmenu";
import { getNavItems, getProjectNavJson, setNavItems } from "./workbench";
import * as dargData from "./DragData";
import { getProject } from "./workspace";
import { ipcRendererSend } from "../preload";

var lastSelected: any;
export interface INavItem {
    name: string;
    path: string;
    icon?: string;
    isExtend?: boolean;
    children?: INavItem[];

}
export function getNavBar(): any {
    getProjectNavJson().items = getNavItems();
    return getProjectNavJson();
}

export function renderNavTrees(content: HTMLElement, nav: INavItem[]) {
    if (nav == undefined) {
        return;
    }
    content.innerHTML = "";
    content.oncontextmenu = (e: MouseEvent) => {
        // folderTitle.setAttribute("selected", "true");
        var menuItems: Array<IContextMenuItem> = [
            {
            label: "新建", icon: "bi bi-plus", onclick: () => {
                getNavItems().push({
                    name: "新建菜单", path: "", icon: "bi bi-plus", isExtend: false, children: []
                });
                renderNavTrees(content, getNavItems());
            }
        },
        {
            label: "自动识别", icon: "bi bi-plus", onclick: () => {
                //复制文件目录至菜单
                setNavItems([]);
                getProject().catalogs.forEach((catalog) => {
                    if(catalog.children!=undefined&& catalog.children.length > 0) {
                        var children:INavItem[]=[];

                        catalog.children.forEach((child) => {

                            children.push({
                                name: child.name,
                                path: child.key,
                                icon: "bi bi-file-earmark-richtext",
                                isExtend: false,
                  
                            });
                        });


                        getNavItems().push({
                            name: catalog.name, path: catalog.key, icon: "bi bi-plus", isExtend: false, children: children
                        });
                    }else{
                        getNavItems().push({
                            name: catalog.name, path: catalog.key, icon: "bi bi-file-earmark-richtext", isExtend: false, children: []
                        });
                    }
              

                })

                renderNavTrees(content, getNavItems());
                requestIdleCallback(() => {

                    ipcRendererSend("saveNav", JSON.stringify(getNavBar()));
                });
               
            }
        }
    
    ];
        showContextMenu(menuItems, e.clientX, e.clientY);
    }
    nav.forEach(item => {
        renderNavTree(content, item, 1);
    })
    content.onclick = (e: MouseEvent) => {
        // clearNavCode();
        // renderNavCode();
        switchFloatTab("导航");
    };

}
export function renderNavTree(content: HTMLElement, nav: INavItem, level: number) {
    if (nav.children != undefined && nav.children.length > 0) {
        var folder = document.createElement("div");
        folder.className = "nav_folder";
        content.appendChild(folder);

        var folderTitle = document.createElement("div");
        folderTitle.className = "nav_folder_title nav_row";
        folder.appendChild(folderTitle);



        var indent = document.createElement("div");
        indent.className = "indent";
        indent.style.width = level * 12 + "px";
        folderTitle.appendChild(indent);


        var icon = document.createElement("i");
        icon.className = "bi bi-chevron-down";
        folderTitle.appendChild(icon);

        var name = document.createElement("div");
        name.className = "name";
        name.innerText = nav.name;
        folderTitle.appendChild(name);



        var folderView = document.createElement("div");
        folderView.className = "nav_folder_view";
        folder.appendChild(folderView);

        if (nav.isExtend) {
            folderView.style.display = "block";
        } else {
            folderView.style.display = "none";
        }


        folderTitle.onclick = (e: MouseEvent) => {
            // folderTitle.setAttribute("selected", "true");
            if (folderView.style.display == "none") {
                folderView.style.display = "block";
                icon.className = "bi bi-chevron-down";
            } else {
                folderView.style.display = "none";
                icon.className = "bi bi-chevron-right";
            }
            e.stopPropagation();
        }


        folderTitle.oncontextmenu = (e: MouseEvent) => {
            // folderTitle.setAttribute("selected", "true");
            var menuItems: Array<IContextMenuItem> = [{
                label: "新建",
            }, {
                label: "删除", icon: "bi bi-trash"
            }, {
                label: "重命名",
            }, {
                label: "复制",
            }];
            showContextMenu(menuItems, e.clientX, e.clientY);
            e.stopPropagation();
        }

        nav.children.forEach((child: any) => {
            renderNavTree(folderView, child, level + 1);
        })

    } else {
        var page = document.createElement("div");
        page.className = "nav_file nav_row";
        content.appendChild(page);

        var indent = document.createElement("div");
        indent.className = "indent";
        indent.style.width = level * 12 + "px";
        page.appendChild(indent);

        var icon = document.createElement("i");
        icon.className = nav.icon;
        page.appendChild(icon);


        var name = document.createElement("div");
        name.className = "name";
        name.innerText = nav.name;
        page.appendChild(name);


        page.onclick = (e: MouseEvent) => {
            if (lastSelected == undefined || lastSelected != page) {
                if (lastSelected != undefined) lastSelected.setAttribute("selected", "false");
                page.setAttribute("selected", "true");
                lastSelected = page;
            }
            e.stopPropagation();
        }
        page.oncontextmenu = (e: MouseEvent) => {
            //    page.setAttribute("selected", "true");
            var menuItems: Array<IContextMenuItem> = [{
                label: "新建",
            }, {
                label: "删除", icon: "bi bi-trash"
            }, {
                label: "重命名",
            }, {
                label: "复制",
            }];

            showContextMenu(menuItems, e.clientX, e.clientY);
            e.stopPropagation();
        }

        page.ondragover = (e: DragEvent) => {
            e.preventDefault();
            page.style.background = "#09f";
        }
        page.ondragleave = (e: DragEvent) => {

            page.style.removeProperty("background");
        }
        page.ondrop = (e: DragEvent) => {
            var catalog = dargData.getData("catalog");
            if (catalog != undefined) {
                nav.path = catalog.key;
            }


            var component = dargData.getData("componentTemplate");
            if (component != undefined) {
                console.log(component);

                if (component.type == "icon") {
                    icon.className = component.icon;
                    nav.icon = component.icon;
                }
            }
             page.style.removeProperty("background");
            //  switchFloatTab("导航");
            // clearNavCode();
            // renderNavCode();
        }
    }



}