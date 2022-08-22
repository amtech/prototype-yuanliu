/*! *****************************************************************************
Copyright (c) taoyongwen. All rights reserved.
渲染Hub页面
***************************************************************************** */
import { ipcRenderer } from "electron";
import { IMenuItem, openContextMenu } from "../common/contextmenu";
import { getUUID, IExtension } from "../common/interfaceDefine";
import * as form from "../render/form";

// import { IMenuItem, showContextMenu } from "../render/sidebar";

var lastSideNav: any;
// It has the same sandbox as a Chrome extension.
var config: any;
window.addEventListener("DOMContentLoaded", () => {
  //theme
  var app = document.getElementById("app");
  if(app != undefined){
    app.setAttribute("data-platform", process.platform);
  }
  ipcRenderer.send("readConfig_hub");
  ipcRenderer.on("_readConfig", (event: any, arg: any) => {

    config = arg;
    renderHub();

  });
  ipcRenderer.send("readVersion_hub");
  ipcRenderer.on("_readVersion", (event: any, arg: any) => {
    document.getElementById("version").innerText = "version:" + arg;
  });

  if (process.platform != "darwin") {
    const toolbar=require("../render/toolbar");
    toolbar.renderWin32TitleBar(() => {
      ipcRenderer.send("min_hub");
    }, () => {
      ipcRenderer.send("max_hub");
    }, () => {
      ipcRenderer.send("close_hub");
    });
   
  }else{
    ipcRenderer.on("touchBar_back", (event: any, arg: any) => {
  
       goBack();
    });
    ipcRenderer.on("touchBar_open", (event: any, arg: any) => {
      ipcRenderer.send("openPeojectBackpage_hub");

    });
    ipcRenderer.on("touchBar_new", (event: any, arg: any) => {
    
      onNewProject();
    });
    ipcRenderer.on("touchBar_git", (event: any, arg: any) => {
   
      onGitProject();
    });
  }

});

function renderHub() {


  //load projects;
  ipcRenderer.send("readProjects_hub");
  ipcRenderer.on("_readProjects", (event: any, arg: any) => {
    projects = arg;
    console.log("_readProjects", arg);
    updateProjects(projects);
  });
  ipcRenderer.on("_openFolder", (event: any, arg: any) => {
    if (textPath != undefined && arg.length > 0) {
      textPath.value = arg[0];
      textPath.onchange();
      console.log(arg);
    }

  });
  ipcRenderer.on("_saveProjects", (event: any, arg: any) => {

    console.log("保存成功");
  });
  ipcRenderer.on("_loadHtml_hub", (event: any, arg: any) => {
    // console.log("_loadHtml_hub",arg);
    if (webId != undefined) {
      const markdown = require("markdown").markdown;
      arg = arg.replaceAll("![image](", "![image](./markdown/");
      document.getElementById(webId).innerHTML = markdown.toHTML(arg);
    }
  })

  console.log(config);
  var app = document.getElementById("app");
  var themeTap = document.getElementById("themeTap");
  {
    if (config.theme == "dark") {
      themeTap.children.item(0).className = "bi bi-brightness-high-fill";

    } else {

      themeTap.children.item(0).className = "bi bi-moon-stars-fill";
    }
    app.className = config.theme;
  }
  themeTap.onclick = () => {
    if (config.theme == "dark") {
      config.theme = "light";
      themeTap.children.item(0).className = "bi bi-moon-stars-fill";
    } else {
      config.theme = "dark";
      themeTap.children.item(0).className = "bi bi-brightness-high-fill";
    }
    app.className = config.theme;
    ipcRenderer.send("saveConfig_hub", config);
  }
  // var webTap = document.getElementById("webTap");
  // webTap.onclick = () => {

  //   ipcRenderer.send("webTap_hub");
  // }


  var side_navs = document.getElementById("side_navs");
  if (side_navs != undefined) {
    side_navs.innerHTML = "";
    sideNavs.forEach(nav => {
      var sideNav = document.createElement("div");
      sideNav.className = "side_nav";
      if (nav.selected) {
        sideNav.setAttribute("data-selected", "true");
        lastSideNav = sideNav;
        nav.onTap();
      }
      side_navs.appendChild(sideNav);
      sideNav.appendChild(document.createElement("space"));
      var icon = document.createElement("i");
      icon.className = nav.icon;
      sideNav.appendChild(icon);


      sideNav.appendChild(document.createElement("space"));
      sideNav.appendChild(document.createElement("space"));

      var label = document.createElement("div");
      label.innerText = nav.label;
      sideNav.appendChild(label);

      if (nav.onTap) {
        sideNav.onclick = () => {
          lastSideNav.setAttribute("data-selected", "false");
          sideNav.setAttribute("data-selected", "true");
          lastSideNav = sideNav;
          nav.onTap();
        }
      }

    })

  }


}
function goBack() {

  var list = document.getElementsByClassName("view");
  if (list != undefined && list.length > 1) {
    list.item(list.length - 1).remove();
  }

}
function onNewProject(){
  renderView({
    label: "新建项目", taps: [
     
      {
        label: "创建", icon: "bi bi-plus-circle", onTap: () => {
          if (newProject != undefined) {
            if (newProject.name != undefined && newProject.path != undefined) {
              newProject.path += "/" + newProject.name + ".rpj";
              newProject.modified = getNowDateTime();
              newProject.version = "v0.0.1";
              newProject.type = "local";
              projects.push(newProject);
              ipcRenderer.send("saveProjects_hub", projects);
              updateProjects(projects);
              goBack();

            }
          }
        }
      }
    ]
  }, (content) => {

    renderNewProject(content);


  })
}
function onGitProject(){
  renderView({
    label: "git仓库克隆", taps: [
     
      {
        label: "创建", icon: "bi bi-cloud-download", onTap: () => {
          if (newProject != undefined) {
            if (newProject.name != undefined && newProject.path != undefined && newProject.username != undefined && newProject.password != undefined) {

              newProject.modified = getNowDateTime();
              newProject.type = "git";
              newProject.version = "v0.0.1";
              ipcRenderer.send("cloneProject_hub", newProject);
              ipcRenderer.removeAllListeners("_cloneProject_hub");
              ipcRenderer.on("_cloneProject_hub", (event: any, arg: any) => {
                if (arg.code == 0) {
                  projects.push(newProject);
                  ipcRenderer.send("saveProjects_hub", projects);
                  updateProjects(projects);
                  goBack();
                } else {
                  alert(arg.code + " " + arg.msg);
                }

              });


            } else {
              alert("请填写完整信息");
            }
          }
        }
      }
    ]
  }, (content) => {

    renderGitroject(content);


  })
}
const sideNavs = [{
  label: "项目", icon: "bi bi-front", selected: true, onTap: () => {
    renderView({
      label: "项目", taps: [

        {
          label: "打开", icon: "bi bi-folder2-open", onTap: () => {
            ipcRenderer.send("openPeojectBackpage_hub");
          }
        }, {
          label: "新建项目", icon: "bi bi-folder-plus", onTap: () => {

            onNewProject();

          }
        },
        {
          label: "git仓库克隆", icon: "bi bi-git", onTap: () => {
            onGitProject();

          }
        },
      ]
    },
      (content) => {
        renderProjects(content);
      })
  }
},


{
  label: "学习", icon: "bi bi-puzzle-fill",onTap: () => {
    renderView({ label: "学习", taps: [] ,color:"#f09"}, (content) => {
      var page = document.createElement("div");
      content.appendChild(page);

      page.style.padding = "20px";

    
      renderExtensions(page);

    });
  }
},{
  label: "社区", icon: "bi bi-exclude", onTap: () => {
    // renderView({ label: "社区", taps: [], color: "#f90" }, (content) => {
    // },"https://www.violetime.com")
  }
}
]

function renderExtensions(content: HTMLElement) {

  //签名
  form.createDivInput(content, "搜索", "", (value: string) => { 
    searchExtensions(list,value);
  });
  content.appendChild(document.createElement("br"));
  content.appendChild(document.createElement("br"));

 


  var list=document.createElement("div");
  content.appendChild(list);
  
  requestIdleCallback(() => {
    const request=require("request");
    request.get("https://www.violetime.com/extensions.json",(err:any,res:any,body:any)=>{
 
      extensions=eval(body);
      searchExtensions(list);
    },{json:true});
 
  });

 

}
var extensions:Array<IExtension>=[]
function searchExtensions(content: HTMLElement,searchText?:string) {
 

  var list:Array<IExtension>=[];
  if(searchText==undefined||searchText.length==0){
    list=extensions;
  }else{
    list=extensions.filter(item=>{item.label.indexOf(searchText)>-1});
  }

  content.innerHTML="";

  list.forEach(item=>{
    var row=document.createElement("div");
    row.className="ex_row";
    row.onclick=()=>{

      renderView({label: item.label,icon:item.icon, taps: [{icon:"bi bi-download",label:"安装",onTap:()=>{

      }}], color: "#f90" }, (itemContent) => {
        itemContent.style.padding="0px 20px 0px 20px";
        const request=require("request");
        request.get(item.readmeUrl,(err:any,res:any,body:any)=>{
          const markdown = require("markdown").markdown;
         // arg = arg.replaceAll("![image](", "![image](./markdown/");
         itemContent.innerHTML = markdown.toHTML(body);

        });

     

      });

    }
   

    var icon=document.createElement("div");
    icon.className="ex_icon";
    row.appendChild(icon);

    var i=document.createElement("i");
    i.className=item.icon;
    icon.appendChild(i);

    var context=document.createElement("div");
    context.className="ex_context";
    row.appendChild(context);

    var label=document.createElement("div");
    label.className="ex_label";
    label.innerText=item.label;
    context.appendChild(label);

    var discription=document.createElement("div");
    discription.className="ex_discription";
    discription.innerText=item.discription;
    context.appendChild(discription);

    var botttom=document.createElement("div");
    botttom.className="ex_bottom";
    context.appendChild(botttom);

    var at=document.createElement("i");
    at.className="bi bi-at";
    botttom.appendChild(at);

    var author=document.createElement("div");
    author.className="ex_author";
    author.innerText=item.author;
    botttom.appendChild(author);

    var space=document.createElement("div");
    space.className="ex_space";
    botttom.appendChild(space);

    var count=document.createElement("div");
    count.className="ex_count";
    count.innerText=item.count+"";
    botttom.appendChild(count);


    var button=document.createElement("i");
    botttom.appendChild(button);
    if(item.installed){
      button.className="bi bi-trash ex_button";
    }else{
      button.className="bi bi-download ex_button";
    }

    content.appendChild(row);

  })




}


function getNowDateTime(): string {
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();
  var nowDateTime = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
  return nowDateTime;

}
var textPath: any;
var newProject: any;

function renderNewProject(content: HTMLElement) {
  newProject = { name: "未命名1" };

  content.style.padding = "20px";

  var name = document.createElement("div");

  content.appendChild(name);
  form.createDivInput(name, "项目名称", "未命名1", (text) => {
    newProject.name = text;
    console.log(newProject);
  });
  content.appendChild(document.createElement("br"));
  var path = document.createElement("div");

  content.appendChild(path);
  textPath = form.createDivFile(path, "存放目录", "", (text) => {

    newProject.path = text;
    console.log(newProject);
  });
}


function renderGitroject(content: HTMLElement) {
  newProject = { name: "demo", path: "http://ip:port/name.git", username: "username", password: "" };

  content.style.padding = "20px";

  var address = document.createElement("div");

  content.appendChild(address);
  form.createDivInput(address, "地&nbsp;&nbsp;&nbsp;&nbsp;址", newProject.path, (text) => {
    newProject.path = text;
    newProject.name = text.substring(text.lastIndexOf("/") + 1, text.lastIndexOf(".git"));
    //  newProject.name = text;
    console.log(newProject);
  });

  var username = document.createElement("div");
  form.createDivInput(username, "用户名", newProject.username, (text) => {
    newProject.username = text;
  });
  content.appendChild(username);
  var password = document.createElement("div");
  form.createDivPassword(password, "密&nbsp;&nbsp;&nbsp;&nbsp;码", newProject.password, (text) => {
    newProject.password = text;
  });
  content.appendChild(password);




}

var webId: any;
function loadHtml(title: string, src: string, color?: string, image?: string,) {
  console.log("loadHtml");
  renderView({ label: title, taps: [], color: color, image: image }, (content) => {
    var page = document.createElement("div");
    content.appendChild(page);

    console.log(content.clientWidth);

    page.style.padding = "20px";
    page.className = "markdown-body";
    // page.style.textAlign = "center";
    page.id = getUUID();
    webId = page.id;
    ipcRenderer.send("loadHtml_hub", src);
  });






}

function renderProjects(content: HTMLElement) {

  var projectsDiv = document.createElement("div");
  content.appendChild(projectsDiv);
  projectsDiv.style.userSelect = "none";

  var projectHead = document.createElement("div");
  projectHead.className = "project_head";
  projectsDiv.appendChild(projectHead);

  var headCheck = document.createElement("div");
  headCheck.className = "head_check";
  projectHead.appendChild(headCheck);
  var headCheckIcon = document.createElement("i");
  headCheckIcon.className = "bi bi-stars";
  headCheck.appendChild(headCheckIcon);




  var headName = document.createElement("div");
  headName.className = "head_name";
  headName.innerText = "项目名称";
  projectHead.appendChild(headName);


  var headModify = document.createElement("div");
  headModify.className = "head_modify";
  headModify.innerText = "修改日期";
  projectHead.appendChild(headModify);


  var headVersion = document.createElement("div");
  headVersion.className = "head_version";
  headVersion.innerText = "版本";
  projectHead.appendChild(headVersion);

  var headMore = document.createElement("div");
  headMore.className = "head_more";

  projectHead.appendChild(headMore);

  var projectBody = document.createElement("div");
  projectBody.className = "project_body";
  projectBody.id = "projectBody";
  projectsDiv.appendChild(projectBody);
  projects.forEach(project => {
    renderProject(project, projectBody)
  })


}
function updateProjects(projects: Array<any>) {
  var projectBody = document.getElementById("projectBody");
  projectBody.innerHTML = "";
  projects.forEach(project => {
    renderProject(project, projectBody)
  })

}
function renderProject(project: any, body: HTMLElement) {


  var projectHead = document.createElement("div");
  projectHead.className = "project_row";
  body.appendChild(projectHead);

  projectHead.ondblclick = () => { 
    
    ipcRenderer.send("openProject_hub", project);
    document.getElementById("open_project_process").style.display="flex";
    setTimeout(() => {
      document.getElementById("open_project_process").style.display="none";
    }, 2000);
  
  }

  var headCheck = document.createElement("div");
  headCheck.className = "head_check";
  projectHead.appendChild(headCheck);
  var headCheckIcon = document.createElement("i");
  headCheckIcon.className = "bi bi-stars";
  headCheck.appendChild(headCheckIcon);




  var headName = document.createElement("div");
  headName.className = "head_name";
  projectHead.appendChild(headName);

  var headNameLabel = document.createElement("div");
  headNameLabel.className = "head_name_label";
  headNameLabel.innerText = project.name;
  headName.appendChild(headNameLabel);

  var headNamePath = document.createElement("div");
  headNamePath.className = "head_name_path";
  headNamePath.innerText = project.path;
  headName.appendChild(headNamePath);


  var headModify = document.createElement("div");
  headModify.className = "head_modify";
  headModify.innerText = project.modified;
  projectHead.appendChild(headModify);


  var headVersion = document.createElement("div");
  headVersion.className = "head_version";
  headVersion.innerText = project.version;
  projectHead.appendChild(headVersion);

  var headMore = document.createElement("div");
  headMore.className = "head_more";
  projectHead.appendChild(headMore);

  var moreTap = document.createElement("div");
  moreTap.className = "more_tap";
  headMore.appendChild(moreTap);
  var moreTapIcon = document.createElement("i");
  moreTapIcon.className = "bi bi-three-dots";
  moreTap.appendChild(moreTapIcon);

  moreTap.onclick = (e) => {
    var contextMenu: IMenuItem[] = [
      {
        id: "delete",
        label: "删除", icon: "bi bi-trash", onclick: () => {
          var index = projects.indexOf(project);
          if (index >= 0) {
            projects.splice(index, 1);
            ipcRenderer.send("saveProjects_hub", projects);
            updateProjects(projects);
          }
        }

      }, {
        id: "editor",
        label: "编辑", icon: "bi bi-backspace-reverse", accelerator: "dbclick", onclick: () => {
          ipcRenderer.send("openProject_hub", project);
          document.getElementById("open_project_process").style.display="flex";
          setTimeout(() => {
            document.getElementById("open_project_process").style.display="none";
          }, 2000);
        }

      }
      // , {
      //   label: "预览", onclick: () => {
      //     ipcRenderer.send("startPreview_hub", project);
      //   }

      // } 
      , {
        id: "opencatalog",
        label: "打开目录", icon: "bi bi-folder2-open", onclick: () => {
          ipcRenderer.send("openPath_hub", project);
        }

      }
    ];
    e.stopPropagation();
    openContextMenu(contextMenu);
  }

}
var projects: Array<any> = []

function renderView(title: { label: string, taps: { label: string, icon: string, onTap(): void }[], image?: string, color?: string,icon?:string}, render: (content: HTMLElement) => void,url?:string) {
  var views = document.getElementById("views");
  if (views != undefined) {
    //  views.innerHTML = "";
    if (views.children.length > 5) {
      views.children.item(0).remove();
    }

    var view = document.createElement("div");
    view.className = "view";
    console.log("url",url);

    if(url!=undefined){ 
      var iframe=document.createElement("iframe");
      iframe.src=url;
      iframe.style.border='0';
      iframe.style.width='100%';
      iframe.style.height='100%';
      view.appendChild(iframe);
      view.style.overflow="hidden";
      views.appendChild(view);
    }else{

      var titleBar = document.createElement("div");
      titleBar.className = "title_bar";
      titleBar.style.userSelect = "none";
      titleBar.style.position = "sticky";
      titleBar.style.top = "-60px";
  
  
      if (title.image != undefined) {
        titleBar.style.backgroundImage = "url(" + title.image + ")";
        setTimeout(() => {
          getLightColorByImage(title.image, (c) => {
            titleBar.style.color = c;
          });
        }, 10);
  
      }
      if (title.color != undefined) {
        titleBar.style.backgroundColor = title.color;
        titleBar.style.color = "white";
      }
  
      view.appendChild(titleBar);

      if(title.icon!=undefined){
        var titleIcon=document.createElement("i");
        titleIcon.className=title.icon;
        titleIcon.style.position = "sticky";
        titleIcon.style.top = "10px";
        titleIcon.style.padding="0px 10px 0px 20px";
        titleIcon.style.fontSize="30px";
        titleBar.appendChild(titleIcon);
      }
  
  
      var titleLabel = document.createElement("div");
      titleLabel.className = "view_title";
      titleLabel.style.position = "sticky";
      titleLabel.style.top = "10px";
      titleBar.appendChild(titleLabel);
  
      var flex = document.createElement("div");
      flex.style.flex = "1";
      titleBar.appendChild(flex);
  
      var titleTaps = document.createElement("div");
      titleTaps.style.position = "sticky";
      titleTaps.style.top = "10px";
      titleTaps.className = "title_taps";
      titleBar.appendChild(titleTaps);
  
  
      if (title.label != undefined) {
  
        titleLabel.innerText = title.label;
  
      }
      if( title.taps==undefined){
        title.taps=[];
      }
      title.taps.splice(0,0,{label:"返回",icon:"bi bi-arrow-90deg-left",onTap:()=>{
        view.remove();
      }});
      if (title.taps != undefined) {
        title.taps.forEach(tap => {
  
          var tapDiv = document.createElement("div");
          tapDiv.className = "title_tap";
          tapDiv.title = tap.label;
          if (tap.icon != undefined && tap.icon.length > 0) {
            var tapIcon = document.createElement("i");
            tapIcon.className = tap.icon;
            tapDiv.appendChild(tapIcon);
          } else {
            tapDiv.innerText = tap.label;
          }
          titleTaps.appendChild(tapDiv);
  
          tapDiv.onclick = () => {
            tap.onTap();
          }
  
        })
      }
  
      var content = document.createElement("div");
      view.appendChild(content);
      views.appendChild(view);
      render(content);
    }



  

   

  }

}
export function getColorByImage(url: string, onload: (color: string) => void): void {


  var img = new Image();
  img.crossOrigin = "Anonymous";
  img.src = url;
  img.onload = () => {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    var r = 0, g = 0, b = 0;
    var length = data.length;
    var count = 0;
    for (var i = 0; i < length; i += 12) {
      var s = data[i] + data[i + 1] + data[i + 2];
      if (s < 100 || s > (220 * 3)) {
        continue;
      }
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }
    var color = "rgb(" + Math.floor(255 - r / count) + "," + Math.floor(255 - g / count) + "," + Math.floor(255 - b / count) + ")";
    onload(color)
    canvas.remove();
  }


}
export function getLightColorByImage(url: string, onload: (color: string) => void): void {


  var img = new Image();
  img.crossOrigin = "Anonymous";
  img.src = url;
  img.onload = () => {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    var r = 0, g = 0, b = 0;
    var length = data.length;

    for (var i = 0; i < length; i += 24) {
      if (r < data[i])
        r = data[i];
      if (g < data[i + 1])
        g = data[i + 1];
      if (b < data[i + 2])
        b = data[i + 2];
    }
    var color = "rgb(" + r + "," + g + "," + b + ")";
    onload(color)
    canvas.remove();
  }


}