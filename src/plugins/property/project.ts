/*! *****************************************************************************
Copyright (c) taoyongwen. All rights reserved.

右侧默认 项目
***************************************************************************** */

import { getProject } from "../../render/workspace";
import { ICatalog, IPanel } from "../../common/interfaceDefine";
import * as form from "../../render/form";
import * as forms from "../../render/forms";
import { ipcRendererSend } from "../../preload";
import { getNowDateTime } from "../../server/work";
var formName:forms.FormText;
var formPath:forms.FormText;
/**
 *     name: string;
    path: string;
    catalogs?: ICatalog[];
    work?: string;
    type?: "local" | "git",
    username?: string;
    password?: string;
    createDate?: string;
    updateDate?: string;
    author?: string;
    version?: string;
    description?: string;
    cover?: string;
 */
var formAuther:forms.FormText;
var formCreateDate:forms.FormText;
var formUpdateDate:forms.FormText;
var formDescription:forms.FormPragraph;
var formCover:HTMLImageElement;
var formLaunch:forms.FormCatalog;
var formColor:forms.FormColor;
const  panel:IPanel={
    key:"project",name:"项目",hidden:true,sort:0,
    render:(content:HTMLElement)=>{
        var   panel = document.createElement("div");
        panel.className = "projectPanel";
        panel.id = "projectPanel";
        content.appendChild(panel);
        panel.style.padding="0px 10px 0px 10px";

        var image=document.createElement("div");
        image.style.minHeight="100px";
        image.style.marginTop="10px";
        image.style.borderRadius="5px";
        image.style.overflow="hidden";
        panel.appendChild(image);

        formCover=document.createElement("img");
        formCover.style.width="100%";
        formCover.id="project_cover";
        image.appendChild(formCover);
        image.ondblclick=()=>{
            ipcRendererSend("insertCover");
           
        }

        formName=new forms.FormText("名称");
        formName.render(panel);

        formPath=new forms.FormText("路径");
        formPath.render(panel);

        formAuther=new forms.FormText("作者");
        formAuther.render(panel);

        formCreateDate=new forms.FormText("创建日期");
        formCreateDate.render(panel);

        formUpdateDate=new forms.FormText("更新日期");
        formUpdateDate.render(panel);

        formDescription=new forms.FormPragraph("描述");
        formDescription.render(panel);

        formLaunch=new forms.FormCatalog("启动页");
        formLaunch.render(panel);

        formColor=new forms.FormColor("主题色");
        formColor.render(panel);
    
    
    }, 
    update:()=>{
        var project=getProject();
        formName.update(project.name);
        formPath.update(project.path);
        formAuther.update(project.author);
        formCreateDate.update(project.createDate);
        formUpdateDate.update(project.updateDate);
        formDescription.update(project.description,(value)=>{
            project.description=value;
            getProject().updateDate = getNowDateTime();
            ipcRendererSend("saveProject",project);
        });
        formCover.src= getProject().work + "/images/"+project.cover;

        formLaunch.update(project.launch,(cl:ICatalog)=>{
            project.launch=cl.key;
            getProject().updateDate = getNowDateTime();
            ipcRendererSend("saveProject",project);
            return true;
        });

        formColor.update(project.themeColor,(color)=>{
            project.themeColor=color;
            if(color!=undefined){
                var lightColor="";
                if(color.startsWith("#")){
                    var cr= get16ToRgb(color);
                    lightColor="rgba("+cr[0]+","+cr[1]+","+cr[2]+",0.4)";
                }else if(color.startsWith("rgba")){
                    var sp=color.split(",");
                    lightColor=sp[0]+","+sp[1]+","+sp[2]+",0.4)";
                }else if(color.startsWith("rgb")){
                    var sp=color.split(",");
                    lightColor=sp[0].replace("rgb","rgba")+","+sp[1]+","+sp[2].replace(")","")+",0.4)";
                }
                project.lightColor=lightColor;
                console.log("lightColor",lightColor);
            }


            document.body.style.cssText="--theme-color:"+color;
            getProject().updateDate = getNowDateTime();
            ipcRendererSend("saveProject",project);
        })
    }   
    

}
export default function load(){
    return panel;
}

function get16ToRgb(str:string){
    var reg = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/
    if(!reg.test(str)){return;}
    let newStr = (str.toLowerCase()).replace(/\#/g,'')
    let len = newStr.length;
    if(len == 3){
        let t = ''
        for(var i=0;i<len;i++){
            t += newStr.slice(i,i+1).concat(newStr.slice(i,i+1))
        }
        newStr = t
    }
    let arr = []; //将字符串分隔，两个两个的分隔
    for(var i =0;i<6;i=i+2){
        let s = newStr.slice(i,i+2)
        arr.push(parseInt("0x" + s))
    }
    return arr;
}