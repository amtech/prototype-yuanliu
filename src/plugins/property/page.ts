/*! *****************************************************************************
Copyright (c) taoyongwen. All rights reserved.

底部  页面标签
***************************************************************************** */
import { ipcRenderer } from "electron";
import { cal_gradient } from "../../render/propertypanel";
import { IComponent, IPanel } from "../../common/interfaceDefine";
import { ipcRendererSend } from "../../preload";
import * as form from "../../render/form";
import * as forms from "../../render/forms";
import { renderPageLayout } from "../../render/pageLayout";
import { getCurPage, getCurPageContent, getCurViewContent, getLayers, getProjectNavJson, getProjectTitleJson, reRenderPage } from "../../render/workbench";
import { pushHistory } from "../../render/history";
import { saveSimplePage } from "../../render/toolbar";

var formHeight: forms.FormNumber;
var formWidth: forms.FormNumber;
var formTheme: forms.FormIcons;
var formStyle: forms.FormSelect;
var formBackgroundType: forms.FormIcons;
var formBackgroundSolidPanel: HTMLElement;
var formBackgroundSolidPanelColor: forms.FormColor;
var formBackgroundGradientPanel: HTMLElement;
var formBackgroundGradientPanelColor1: forms.FormColor;
var formBackgroundGradientPanelColor2: forms.FormColor;
var formBackgroundGradientPanelType: forms.FormIcons;
var formBackgroundGradientPanelAngle: forms.FormSolider;
var formBackgroundGradientPanelPosition: forms.FormSolider;
var formInfo: forms.FormPragraph;
var component_list: HTMLElement;
var hiddenMap=new Map();
const panel: IPanel = {
  key: "page", name: "页面", hidden: true, sort: 0,
  render: (content: HTMLElement) => {

    var setting = document.createElement("div");
    setting.style.flex = "1";
    setting.style.marginLeft = "10px";
    setting.style.marginRight = "10px";
    setting.style.display = "block";
    content.appendChild(setting);

    var pageLayout = document.createElement("div");
    pageLayout.style.margin = "10px";
    pageLayout.style.borderRadius = "5px";
    pageLayout.style.overflow = "hidden";
    pageLayout.style.width = (content.clientWidth - 20) + "px";
    pageLayout.style.minHeight = "200px";
    pageLayout.id = "pageLayout";
    content.appendChild(pageLayout);

    pageLayout.ondblclick = () => {
      requestIdleCallback(() => {
        renderPageLayout();
      });
    }


    var row = document.createElement("div");
    setting.appendChild(row);

    var w = form.createDivRow(row);
    formWidth = new forms.FormNumber("宽度");
    formWidth.render(w);

    var h = form.createDivRow(row, true);
    formHeight = new forms.FormNumber("高度");
    formHeight.render(h);





    formTheme = new forms.FormIcons("主题", ["bi bi-brightness-high-fill", "bi bi-moon-stars-fill"]);
    formTheme.render(setting);

    var style = document.createElement("div");
    setting.appendChild(style);

    //
    ipcRendererSend("loadPluginsStyle");
    ipcRenderer.on("_loadPluginsStyle", (event, args) => {
      console.log("_loadPluginsStyle", args);
      var styles: { label: string, value: any }[] = [

      ];
      args.forEach((item: string) => {
        var val = item.replace(".js", "");
        styles.push({ label: val, value: val });
      });
      formStyle = new forms.FormSelect("扩展样式", styles);
      formStyle.render(style);

    });

    formBackgroundType = new forms.FormIcons("背景", ["bi bi-slash-circle", "bi bi-palette", "bi bi-circle-half", "bi bi-image"]);
    formBackgroundType.render(setting);


    //bg
    var formBackgroundPanel = document.createElement("div");
    formBackgroundPanel.style.paddingRight = "5px";
    setting.appendChild(formBackgroundPanel);
    //0 no

    //1 color
    formBackgroundSolidPanel = document.createElement("div");
    formBackgroundSolidPanel.style.display = "none";
    formBackgroundPanel.appendChild(formBackgroundSolidPanel);
    formBackgroundSolidPanelColor = new forms.FormColor("填充颜色");
    formBackgroundSolidPanelColor.render(formBackgroundSolidPanel);


    //2 gradient

    formBackgroundGradientPanel = document.createElement("div");
    formBackgroundGradientPanel.style.display = "none";
    formBackgroundPanel.appendChild(formBackgroundGradientPanel);
    var row = document.createElement("div");
    formBackgroundGradientPanel.appendChild(row);
    var color1 = form.createDivRow(row, true);
    formBackgroundGradientPanelColor1 = new forms.FormColor("");
    formBackgroundGradientPanelColor1.render(color1);
    var color2 = form.createDivRow(row);
    formBackgroundGradientPanelColor2 = new forms.FormColor("");
    formBackgroundGradientPanelColor2.render(color2);

    formBackgroundGradientPanelType = new forms.FormIcons("类型", ["bi bi-dash-lg", "bi bi-circle"]);
    formBackgroundGradientPanelType.render(formBackgroundGradientPanel);



    formBackgroundGradientPanelAngle = new forms.FormSolider("角度", 180, -180);
    formBackgroundGradientPanelAngle.render(formBackgroundGradientPanel);

    formBackgroundGradientPanelPosition = new forms.FormSolider("位置", 100, 0);
    formBackgroundGradientPanelPosition.render(formBackgroundGradientPanel);


    formInfo = new forms.FormPragraph("页面大纲");
    formInfo.render(setting);

    component_list = document.createElement("div");
    component_list.className = "form_bg component_list";
    component_list.style.minHeight = "30px";
    component_list.style.marginTop = "10px";
    component_list.style.borderRadius = "5px";

    setting.appendChild(component_list);

  },
  update: () => {


    if (getCurPage() == undefined) {
      return;
    }


    formHeight.update(getCurPage().height + "", (value) => {
      var h = parseFloat(value);
      getCurPage().height = parseFloat(value);
      if (getProjectTitleJson().display) {
        getCurPageContent().style.height = (h - 40) + "px";

      } else {
        getCurPageContent().style.height = h + "px";
      }
      pushHistory(getCurPage());
    });
    formWidth.update(getCurPage().width + "", (value) => {
      var h = parseFloat(value);
      getCurPage().width = parseFloat(value);
      if (getProjectTitleJson().display) {
        getCurPageContent().style.width = (h - 160) + "px";

      } else {
        getCurPageContent().style.width = h + "px";
      }
      pushHistory(getCurPage());
    });
    formTheme.update(getCurPage().theme == "light" ? 0 : 1, (value) => {
      var val: "light" | "dark" = "light";
      if (value == 0) {
        val = "light";
      } else {
        val = "dark";
      }
      getCurPage().theme = val;
      getCurViewContent().getElementsByClassName("page_parent")[0].className = "page_parent " + val;
      pushHistory(getCurPage());
    });

    formStyle.update(getCurPage().style, (style) => {
      getCurPage().style = style;
      var exStyles = eval("require(style).default()");
      console.log(exStyles);
      getCurPage().styles = exStyles;
      reRenderPage();
      pushHistory(getCurPage());
    });

    formInfo.update(getCurPage().info, (info) => {
      getCurPage().info = info;

      pushHistory(getCurPage());
    });

    // var row1 = document.createElement("div");
    // setting.appendChild(row1);
    // var bc = form.createDivRow(row1, true);


    // var formBackgroundType = new forms.FormIcons("背景", ["bi bi-slash-circle", "bi bi-palette", "bi bi-circle-half", "bi bi-image"]);
    // formBackgroundType.render(bc);



    // //bg
    // var formBackgroundPanel = document.createElement("div");
    // formBackgroundPanel.style.paddingRight="5px";
    // setting.appendChild(formBackgroundPanel);
    // //0 no

    // //1 color
    // var formBackgroundSolidPanel = document.createElement("div");
    // formBackgroundSolidPanel.style.display = "none";
    // formBackgroundPanel.appendChild(formBackgroundSolidPanel);
    // var formBackgroundSolidPanelColor = new forms.FormColor("填充颜色");
    // formBackgroundSolidPanelColor.render(formBackgroundSolidPanel);


    // //2 gradient

    // var formBackgroundGradientPanel = document.createElement("div");
    // formBackgroundGradientPanel.style.display = "none";
    // formBackgroundPanel.appendChild(formBackgroundGradientPanel);
    // var row = document.createElement("div");
    // formBackgroundGradientPanel.appendChild(row);
    // var color1 = form.createDivRow(row, true);
    // var formBackgroundGradientPanelColor1 = new forms.FormColor("");
    // formBackgroundGradientPanelColor1.render(color1);
    // var color2 = form.createDivRow(row,true);
    // var formBackgroundGradientPanelColor2 = new forms.FormColor("");
    // formBackgroundGradientPanelColor2.render(color2);
    // var t3 = form.createDivRow(row);
    // var formBackgroundGradientPanelType = new forms.FormIcons("类型", ["bi bi-dash-lg", "bi bi-circle"]);
    // formBackgroundGradientPanelType.render(t3);

    // var ap=document.createElement("div");
    // formBackgroundGradientPanel.appendChild(ap);
    // var adiv = form.createDivRow(ap,true);

    // var formBackgroundGradientPanelAngle = new forms.FormSolider("角度", 180, -180);
    // formBackgroundGradientPanelAngle.render(adiv);
    // var pdiv = form.createDivRow(ap,true);
    // var formBackgroundGradientPanelPosition = new forms.FormSolider("位置", 100, 0);
    // formBackgroundGradientPanelPosition.render(pdiv);

    // // bg.update(getCurPage().backgroundColor, (color) => {
    // //   getCurPage().backgroundColor = color;
    // //   var gb: any = getCurViewContent().getElementsByClassName("page_parent")[0];
    // //   gb.style.backgroundColor = color;
    // // });

    var bgType = 0;
    var bgtc = getCurPage().backgroundColor;
    if (bgtc == "" || bgtc == "none" || bgtc == "transparent" || bgtc == "auto") {
      bgType = 0;
    } else if (bgtc.startsWith("rgb") || bgtc.startsWith("#")) {
      bgType = 1;
    } else if (bgtc.startsWith("linear-gradient") || bgtc.startsWith("radial-gradient")) {
      bgType = 2;
    }

    formBackgroundType.update(bgType, (value) => {
      bgType = value;
      if (value == 0) {
        var gb: any = getCurViewContent().getElementsByClassName("page_parent")[0];
        gb.style.background = "auto";
        getCurPage().backgroundColor = "auto";
      }
      backgroundTypeSwitch();
    });
    backgroundTypeSwitch();
    function backgroundTypeSwitch() {
      var gb: any = getCurViewContent().getElementsByClassName("page_parent")[0];
      var background = gb.style.background;
      if (bgType == 0) {
        formBackgroundSolidPanel.style.display = "none";
        formBackgroundGradientPanel.style.display = "none";


      } else if (bgType == 1) {
        formBackgroundSolidPanel.style.display = "block";
        formBackgroundGradientPanel.style.display = "none";
        formBackgroundSolidPanelColor.update(background, (value) => {
          gb.style.background = value;
          getCurPage().backgroundColor = value;
        })
      } else if (bgType == 2) {
        formBackgroundSolidPanel.style.display = "none";
        formBackgroundGradientPanel.style.display = "block";

        var type: number = 0;
        var angle = 0;
        var colors = ["", ""];

        if (background.indexOf("radial-gradient") >= 0) {
          var cs = background.match(/rgb([^)]+)/g);
          if (cs != undefined) {
            // var rgb=cs[0].substring(4).split(",");
            colors[0] = cs[0] + ")";
            colors[1] = cs[1] + ")";

          } else {
            cs = background.match(/rgba([^)]+)/g);
            if (cs != undefined) {
              colors[0] = cs[0] + ")";
              colors[1] = cs[1] + ")";
            }
          }
          type = 1;

        } else if (background.indexOf("linear-gradient") >= 0) {
          console.log(background);
          var as = background.match(/\d+deg/g);
          if (as != undefined) {
            angle = parseInt(as[0].substring(0, as[0].length - 2));
          }
          console.log("angle", angle);
          var cs = background.match(/rgb([^)]+)/g);
          if (cs != undefined) {
            // var rgb=cs[0].substring(4).split(",");
            colors[0] = cs[0] + ")";
            colors[1] = cs[1] + ")";

          } else {
            cs = background.match(/rgba([^)]+)/g);
            if (cs != undefined) {
              colors[0] = cs[0] + ")";
              colors[1] = cs[1] + ")";
            }
          }
        }
        var position = 50;
        formBackgroundGradientPanelColor1.update(colors[0], (value) => {
          colors[0] = value;
          var bg = cal_gradient(colors, angle, type, position);
          gb.style.background = bg;
          getCurPage().backgroundColor = bg;
        });
        formBackgroundGradientPanelColor2.update(colors[1], (value) => {
          colors[1] = value;
          var bg = cal_gradient(colors, angle, type, position);
          gb.style.background = bg;
          getCurPage().backgroundColor = bg;
        });

        formBackgroundGradientPanelType.update(type, (value) => {
          type = value;
          var bg = cal_gradient(colors, angle, type, position);
          gb.style.background = bg;
          getCurPage().backgroundColor = bg;
        })

        formBackgroundGradientPanelAngle.update(angle, (value) => {
          angle = value;
          var bg = cal_gradient(colors, angle, type, position);
          gb.style.background = bg;
          getCurPage().backgroundColor = bg;
        })
        formBackgroundGradientPanelPosition.update(position, (value) => {
          position = value;
          var bg = cal_gradient(colors, angle, type, position);
          gb.style.background = bg;
          getCurPage().backgroundColor = bg;
        })


      } else if (bgType == 3) {
        formBackgroundSolidPanel.style.display = "none";
        formBackgroundGradientPanel.style.display = "none";
        //   formBackgroundImagePanel.style.display = "block";
      }
    }

    //component_list  展示隐藏的组件
    requestIdleCallback(() => {

      var pageLayout = document.getElementById("pageLayout");
      if (pageLayout != undefined) {
        pageLayout.innerHTML = "";
      }
      component_list.innerHTML = "";
      var layers = getLayers();
      if (layers == undefined) return;
      // console.log("layers", layers);
      layers.forEach((layer: IComponent) => {

        renderLayersTree(layer);

      });

      function renderLayersTree(layer: IComponent) {
        if (layer.hidden) {
          var component_item = document.createElement("div");
          component_item.style.margin = "10px";
          component_item.style.cursor = "pointer";
          component_item.title = layer.label;
          component_item.style.display = "inline-block";
          var component_item_icon = document.createElement("i");
          component_item_icon.className = layer.icon;
          component_item.appendChild(component_item_icon);
          component_list.appendChild(component_item);
          hiddenMap.set(layer.key,layer.hidden);
          component_item.onclick = () => {
            var hidden=hiddenMap.get(layer.key);
            hidden=!hidden;
            hiddenMap.set(layer.key,hidden);
            if (layer.toogle != undefined) {
              layer.toogle(document.getElementById(layer.key), hidden);
            } else {
              document.getElementById(layer.key).style.display = hidden? "none" : "block";
            }
            if(!hidden){
              component_item_icon.style.color="var(--theme-color)";
            }else{
            
                component_item_icon.style.color="";
          
            }

          }


        } else {
          if (layer.children != undefined && layer.children.length > 0) {
            layer.children.forEach(child => {
              renderLayersTree(child);
            });
          }

        }


      }

    });

  }

}
export default function load() {
  return panel;
}

