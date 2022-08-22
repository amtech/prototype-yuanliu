/*! *****************************************************************************
Copyright (c) taoyongwen. All rights reserved.

渲染主窗口
***************************************************************************** */
import { ipcRenderer } from "electron";
import { onContextMenu } from "../common/contextmenu";
import { getUUID, IComponent, IPage, IProject } from "../common/interfaceDefine";
import { ipcRendererSend } from "../preload";
import { renderFloatPanel } from "../render/floatPanel";

import { renderPropertyPanel, activePropertyPanel } from "./propertypanel";
import { renderSidebar, updateSidebar } from "./sidebar";
import { renderToolbar, updateToolbar } from "./toolbar";
import { findCurPageComponent, getCurPage, getCurPageContent, getSelectComponents, loadProjectTitleNav, renderPage } from "./workbench";
var project: IProject;
export function getProject():IProject {
    return project;
}
var config: any
export function getConfig(){
    return config;
}
export function saveConfig(){
    ipcRendererSend("saveConfig",config);
}
/**
 * 监听主窗口
 * @param app 
 */
export function renderWorkSpace(app: HTMLElement) {
    layout(app);
    requestIdleCallback(() => {
        //import * as shorcuts from "./shorcuts";
        const shorcuts=require("./shorcuts");
        shorcuts.init();
    });

    onContextMenu();

    ipcRendererSend("readProject");
    ipcRenderer.on("_readConfig", (event: any, arg: any) => {
        console.log("_readConfig", arg);
        config = arg;
        app.setAttribute("data-platform", process.platform);
        app.className = config.theme;
    });
    ipcRendererSend("readConfig");
   
    ipcRenderer.on("_readProject", (event, arg) => {
        console.log("_readProject", arg);
        document.title = arg.name + " - " + arg.path;
        project = arg;
        //  render(app);
        updateToolbar();
        updateSidebar();
        activePropertyPanel("project");
        
    })

    ipcRenderer.on("_openPage",(event,arg:IPage)=>{
        if(arg==undefined){
            showMessageBox("页面不存在","info");
        }else{
            console.log("---OpenPage---",Date.now(),arg);
            renderPage(arg);
        }
            
    })

    ipcRenderer.on("_savePage",(event,arg:IPage)=>{
        showMessageBox("页面保存成功", "info");
    })
  
    //插入图片
    ipcRenderer.on("_insertImage", (event, arg) => {
        console.log("_insertImage", arg);
 
        if(typeof arg=="string" && arg.startsWith("cover.")){
            //插入封面
            project.cover = arg;
            var cover:any=document.getElementById("project_cover");
            cover.src= getProject().work + "/images/"+project.cover+"?"+Date.now();
            ipcRendererSend("saveProject",project);

        }else
        if(arg.length>0&&getCurPage()!=undefined){
            arg.forEach((name:string) => {
                var component: IComponent = {
                    type: "image",
                    key: getUUID(),
                    icon: "bi bi-card-image",
                    label: "图片",
                    style:"display:inline-block;width:400px;",
          
                    property:[
                        {label:"src",name:"src",type:'text',context:name}
                    ],
                    onPreview: () => {
                        return document.createElement("div");
                    }, onRender: (component:IComponent, element:any,content,type) => {
                        var img;
                        if (element != undefined)
                        img = element;
                        else
                        img = document.createElement("img");
                        if(component.property.length>0){
                            if(type!="product"){
                                img.src= getProject().work+ "/images/"+component.property[0].context;
                            }else{
                                img.src= "./images/"+component.property[0].context;
                            }
                        }
                          
                        // pi.className = "bi bi-" + icon;
                        return { root:img, content: img }
                    }
                };
                var iPage=true;
              //  import { renderComponent } from "../common/components";
                const components=require("../common/components");
                if(getSelectComponents().length==1){
                    var parent=findCurPageComponent(getSelectComponents()[0]);
                    if(parent!=undefined&&parent.type=="images"){
                        //如果是组件是 图片组 ，则直接插入
                        parent.option+=name+"\n";
                        iPage=false;
                        parent.onRender(parent,document.getElementById(parent.key));
                    
                    }else if(parent!=undefined&&parent.drop=="component"){
                        iPage=false;
                        if( parent.children==undefined)  parent.children=[];
                        parent.children.push(component);
                        activePropertyPanel();

                        components.renderComponent(document.getElementById(parent.key), component);
                    
                    }
                }
                if(iPage){
                    getCurPage().children.push(component);
                    activePropertyPanel();
                  
                    components.renderComponent(getCurPageContent(), component);
                  
                }
            });
        }
    })   
}
function layout(app: HTMLElement){


    //标题工具栏
    var toolBarHeight: number = 32;//60;
    var toolBar = document.createElement("div");

    toolBar.style.height = toolBarHeight + "px";
    toolBar.style.position = "fixed";
    toolBar.style.width = "100%";
    toolBar.style.overflow="hidden";

    app.appendChild(toolBar);
    var flex = document.createElement("div");
    flex.style.display = "flex";
    flex.style.position = "fixed";
    flex.style.inset = toolBarHeight + "px 0px 0px";


    app.appendChild(flex);
    //侧边栏
    var sideBar = document.createElement("div");
    flex.appendChild(sideBar);


    var main = document.createElement("div");
    main.id="main";
    main.style.flex = "1";
    flex.appendChild(main);

    var floatPanelHeight = 210;
    //工作台
    var workbench = document.createElement("div");
    workbench.id = "workbench";
    main.appendChild(workbench);

    workbench.style.height = (window.innerHeight - toolBarHeight - floatPanelHeight) + "px";

    var tabsHeight=32;

    var row=document.createElement("div");

    row.style.display="flex";
    row.style.height=tabsHeight+"px";
    
    //多标签页面
    var tabs=document.createElement("div");
    tabs.className="workbench_tabs";
    tabs.id="workbench_tabs";
    tabs.style.display="flex";
    tabs.style.userSelect="none";
    tabs.style.height=tabsHeight+"px";
    tabs.style.flex="1";
    row.appendChild(tabs);
    //工具栏
    var tools=document.createElement("div");
    tools.id="workbench_tools";
    tools.style.display="flex";
    tools.style.height=tabsHeight+"px";
    row.appendChild(tools);
  //多标签页面
    var pages=document.createElement("div");
    pages.className="workbench_pages";
    pages.id="workbench_pages";
    pages.style.position="relative";
    pages.style.height=(window.innerHeight - toolBarHeight - floatPanelHeight-tabsHeight) + "px";
    workbench.appendChild(row);
    workbench.appendChild(pages);
    //底部栏
    var floatPanel = document.createElement("div");
    floatPanel.id="floatPanel";
    main.appendChild(floatPanel);
    floatPanel.style.height = floatPanelHeight + "px";
    renderRightSilderBar(flex,window.innerHeight - toolBarHeight);
    //右侧栏
    var edgePanel = document.createElement("div");
    edgePanel.id="edgePanel";
    flex.appendChild(edgePanel);

    renderToolbar(toolBar);
    renderSidebar(sideBar);
    renderFloatPanel(floatPanel);
    renderPropertyPanel(edgePanel);

    requestIdleCallback(()=>{
        loadProjectTitleNav();
    });
}
/**
 * 渲染主窗口
 * @param app 
 */
function render(app: HTMLElement) {

    app.className=config.theme;
    //标题工具栏
    var toolBarHeight: number = 32;//60;
    var toolBar = document.createElement("div");

    toolBar.style.height = toolBarHeight + "px";
    toolBar.style.position = "fixed";
    toolBar.style.width = "100%";
    toolBar.style.overflow="hidden";
    // toolBar.style.top="0px";
    app.appendChild(toolBar);
    var flex = document.createElement("div");
    flex.style.display = "flex";
    flex.style.position = "fixed";
    flex.style.inset = toolBarHeight + "px 0px 0px";


    app.appendChild(flex);
    //侧边栏
    var sideBar = document.createElement("div");
    flex.appendChild(sideBar);


    var main = document.createElement("div");
    main.id="main";
    main.style.flex = "1";
    flex.appendChild(main);

    var floatPanelHeight = 210;
    //工作台
    var workbench = document.createElement("div");
    workbench.id = "workbench";
    main.appendChild(workbench);

    workbench.style.height = (window.innerHeight - toolBarHeight - floatPanelHeight) + "px";

    var tabsHeight=32;

    var row=document.createElement("div");

    row.style.display="flex";
    row.style.height=tabsHeight+"px";
    
    //多标签页面
    var tabs=document.createElement("div");
    tabs.className="workbench_tabs";
    tabs.id="workbench_tabs";
    tabs.style.display="flex";
    tabs.style.userSelect="none";
    tabs.style.height=tabsHeight+"px";
    tabs.style.flex="1";
    row.appendChild(tabs);
    //工具栏
    var tools=document.createElement("div");
    tools.id="workbench_tools";
    tools.style.display="flex";
    tools.style.height=tabsHeight+"px";
    row.appendChild(tools);
  //多标签页面
    var pages=document.createElement("div");
    pages.className="workbench_pages";
    pages.id="workbench_pages";
    pages.style.position="relative";
    pages.style.height=(window.innerHeight - toolBarHeight - floatPanelHeight-tabsHeight) + "px";
    workbench.appendChild(row);
    workbench.appendChild(pages);


    //底部栏
    var floatPanel = document.createElement("div");
    floatPanel.id="floatPanel";
    main.appendChild(floatPanel);

    floatPanel.style.height = floatPanelHeight + "px";

    

    renderRightSilderBar(flex,window.innerHeight - toolBarHeight);
    //右侧属性栏
    var propertyPanel = document.createElement("div");
    flex.appendChild(propertyPanel);



    renderToolbar(toolBar);


    renderSidebar(sideBar);


    loadProjectTitleNav();

    setTimeout(() => {
        renderPropertyPanel(propertyPanel);
        renderFloatPanel(floatPanel);
    }, 500);




}
/**
 * 渲染左侧边栏 滚动条
 * @param content 
 * @param h 
 */
function renderRightSilderBar(content: HTMLElement,h:number) {

    var silderBar = document.createElement("div");
    silderBar.className = "silderBarV";
    silderBar.style.height=h+"px";
    content.appendChild(silderBar);
    var silderBarBlock = document.createElement("div");
    silderBarBlock.className = "silderBarBlockV";
    silderBar.appendChild(silderBarBlock);
    silderBarBlock.onmousedown = (ed: MouseEvent) => {
        var propertyWidth= document.getElementById("edgePanel").clientWidth;
        var startX= ed.clientX;
        var move: boolean = true;
        document.onmousemove = (em: MouseEvent) => {
            if (move) {
                var x = em.clientX - startX;
                var width = propertyWidth - x;
                if (width<20)
                  width =20;
              //  document.getElementById("workbench").style.width = (width) + "px";
                document.getElementById("edgePanel").style.width = (width ) + "px";
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
export function showMessageBox(message:string,type:"info"|"error"|"warning"|"question"|"none"){
    ipcRendererSend("show-notification_",message);
}