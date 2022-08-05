/*! *****************************************************************************
Copyright (c) taoyongwen. All rights reserved.

菜单
***************************************************************************** */

import { ipcRenderer } from "electron";
import { findCurPageComponent, onTabContextMenu } from "../render/workbench";
import { getSelectComponents } from "../render/workbench";
import { renderComponent } from "./components";
import { IComponent } from "./interfaceDefine";

export interface IContextMenuItem {

    label: string;
    icon?: string,
    shorcut?: string,
    onclick?(args?: any, element?: HTMLElement, event?: MouseEvent): void;
    children?: IContextMenuItem[];

}
export interface IComponentContextMenuItem {

    label: string;
    icon?: string,
    shorcut?: string,
    onclick?(component:IComponent,item:IComponentContextMenuItem): void;
    children?: IContextMenuItem[];

}
export function checkContextMenu() {
    var contextMenu = document.getElementById("contextMenu");
    if (contextMenu != undefined)
        contextMenu.remove();
}

export function showContextMenu(menuItems: Array<IContextMenuItem>, x: number, y: number, args?: any, element?: HTMLElement, head?: string) {

    var contextMenu = document.getElementById("contextMenu");

    if (contextMenu != undefined && contextMenu != null) {
        contextMenu.innerHTML = "";
    } else {
        contextMenu = document.createElement("div");
        contextMenu.id = "contextMenu";
        contextMenu.className = "contextMenu";

        document.onclick = (e: MouseEvent) => {
            contextMenu.remove();
        }

        var app = document.getElementById("app");
        app.appendChild(contextMenu);
    }

    if (head != undefined) {
        var contextMenuHead = document.createElement("div");
        contextMenuHead.className = "contextMenuHead";
        contextMenuHead.innerHTML = head;
        contextMenu.appendChild(contextMenuHead);
    }

    var comtextMenuBody = document.createElement("div");
    comtextMenuBody.className = "contextMenuBody";
    contextMenu.appendChild(comtextMenuBody);





    if (x > window.innerWidth - 100) {
        contextMenu.style.left = "";
        contextMenu.style.right = (window.innerWidth - x) + "px";
    } else {
        contextMenu.style.left = x + "px";
        contextMenu.style.right = "";
    }
    if (y > window.innerHeight - 100) {
        contextMenu.style.bottom = (window.innerHeight - y) + "px";
        contextMenu.style.top = "";
    } else {
        contextMenu.style.top = y + "px";
        contextMenu.style.bottom = "";
    }
    console.log("showContextMenu");
    console.log(contextMenu.style.top);
    console.log(contextMenu.style.right);

    menuItems.forEach((item: IContextMenuItem) => {

        if (item.label == undefined || item.label.length == 0) {
            var menuItem = document.createElement("div");
            menuItem.className = "contextMenuItemSeparator";

            comtextMenuBody.appendChild(menuItem);
        } else {
            var menuItem = document.createElement("div");
            menuItem.className = "contextMenuItem";

            comtextMenuBody.appendChild(menuItem);

            menuItem.onclick = (e: MouseEvent) => {
                if (item.onclick != undefined) {
                    item.onclick(args, element, e);
                }
                contextMenu.remove();

            }
            if (item.icon != undefined) {
                var icon = document.createElement("i");
                icon.className = item.icon;
                menuItem.appendChild(icon);
            }


            var label = document.createElement("div");
            label.style.flex = "1";
            label.innerText = item.label;
            menuItem.appendChild(label);

            if (item.shorcut != undefined) {
                var shorcut = document.createElement("div");
                shorcut.innerText = item.shorcut;
                shorcut.style.fontSize = "10px";
                shorcut.style.paddingLeft = "20px";
                shorcut.style.opacity = "0.8";
                menuItem.appendChild(shorcut);
            }
        }





    })


}


export function showComponentContextMenu(menuItems: Array<IComponentContextMenuItem>, x: number, y: number, args?: any, element?: HTMLElement) {

    var contextMenu = document.getElementById("componentContextMenu");

    if (contextMenu != undefined && contextMenu != null) {
        contextMenu.innerHTML = "";
    } else {
        contextMenu = document.createElement("div");
        contextMenu.id = "componentContextMenu";
        contextMenu.className = "componentContextMenu";

        document.onclick = (e: MouseEvent) => {
            contextMenu.remove();
        }

        var app = document.getElementById("app");
        app.appendChild(contextMenu);
    }

  
    var comtextMenuBody = document.createElement("div");
    comtextMenuBody.className = "componentContextMenuBody";
    contextMenu.appendChild(comtextMenuBody);





    if (x > window.innerWidth - 100) {
        contextMenu.style.left = "";
        contextMenu.style.right = (window.innerWidth - x) + "px";
    } else {
        contextMenu.style.left = x + "px";
        contextMenu.style.right = "";
    }
    if (y > window.innerHeight - 100) {
        contextMenu.style.bottom = (window.innerHeight - y) + "px";
        contextMenu.style.top = "";
    } else {
        contextMenu.style.top = y + "px";
        contextMenu.style.bottom = "";
    }
    // console.log("showContextMenu");
    // console.log(contextMenu.style.top);
    // console.log(contextMenu.style.right);

    menuItems.forEach((item: IComponentContextMenuItem) => {

        if (item.icon != undefined) {
    
            var menuItem = document.createElement("div");
            menuItem.className = "componentContextMenuItem";
            menuItem.title = item.label;
            comtextMenuBody.appendChild(menuItem);

            menuItem.onclick = (e: MouseEvent) => {
                e.stopPropagation();
                console.log('click edge',item);
                if (item.onclick != undefined) {
                    var cmpt=findCurPageComponent(getSelectComponents()[0]);
                    console.log('edge -> onclick');
                    item.onclick(cmpt,item);
                    //刷新组件
                   setTimeout(() => {
                    renderComponent(undefined,cmpt,undefined,undefined,undefined,document.getElementById(cmpt.key));
                   }, 10);
                }
              //  contextMenu.remove();

            }
            var icon = document.createElement("i");
            icon.className = item.icon;
            menuItem.appendChild(icon);

          
        }





    })


}

export function onContextMenu(){

    ipcRenderer.on("context-menu-command",(event,arg:{type:"tab"|"icon"|"otho"|"component",content:string,command:string})=>{
        console.log(arg);
        if(arg.type=='tab'){
            onTabContextMenu(arg.command,arg.content)
  


        }


    })


}