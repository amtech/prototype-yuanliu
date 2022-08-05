/*! *****************************************************************************
Copyright (c) taoyongwen. All rights reserved.

商店
***************************************************************************** */

import { activePropertyPanels } from "../../render/propertypanel";
import { IComponent, IExtension, IPanel } from "../../common/interfaceDefine";
import * as dargData from "../../render/DragData";
import * as form from "../../render/form";
const panel: IPanel = {
    key: "store", name: "商店", hidden: true, sort: 2,
    render: (content: HTMLElement) => {

        var storePanel = document.createElement("div");
        storePanel.className = "storePanel";
        storePanel.id = "storePanel";
        content.appendChild(storePanel);

        var context = document.createElement("div");
        context.style.padding = "0px 10px 0px 10px";
        storePanel.appendChild(context);
        //search
        form.createDivInput(context, "搜索", "", (value) => {

        });

        //["图标","形状","图标","图片"]
        form.createDivIconSelect(context, "类型", ["bi bi-pie-chart", "bi bi-pentagon", "bi bi-patch-plus", "bi bi-images"], 0, (index) => {

        });

        var cardsDiv = document.createElement("div");
        cardsDiv.id = "cardsDiv"; 
        cardsDiv.style.minHeight=(window.innerHeight-200)+"px";
        context.appendChild(cardsDiv);
        var previewComponent: HTMLElement;
        cardsDiv.ondragover=(e)=>{
            var cmp=dargData.getData("component");
            if(cmp!=undefined){
                e.preventDefault();
            }else{
                e.dataTransfer.dropEffect="none";
            }
     
        }
        cardsDiv.ondragenter = (e: any) => {
            var cmp:IComponent=dargData.getData("component");
            if(cmp!=undefined){
             previewComponent = renderCardPreview(cardsDiv,cmp.icon);
            }
        }
        cardsDiv.ondragleave = (e: DragEvent) => {
            if (previewComponent != undefined) {
                previewComponent.remove();
                previewComponent = undefined;
            }
        }
        cardsDiv.ondragend = (e: DragEvent) => {
            if (previewComponent != undefined) {
                previewComponent.remove();
                previewComponent = undefined;
            }
        }
        cardsDiv.ondrop=(e)=>{
            if (previewComponent != undefined) {
                previewComponent.remove();
                previewComponent = undefined;
            }
            var arg=dargData.getData("component");
            if(arg!=undefined){
                activePropertyPanels(["storeadd","store"],arg);


            }
        }

    },
    update: () => {

        var data: IExtension[] = [
            {
                key: "sadasdada",
                label: "仪表展示",
                icon: "",
                count: 0,
                type:"group",
                discription: "展示多种仪表，包括数据操作。",
                version: "1.0.0",
                author: "tt",
                readmeUrl: "",
                cover: "https://source.violetime.com/svg/table.svg",



            }
        ]
        renderCards(document.getElementById("cardsDiv"), data);

    }


}
export default function load() {
    return panel;
}
function renderCardPreview(content: HTMLElement,iconname:string){

         var row = document.createElement("div");
        row.style.margin="10px 0px 10px 0px";
        row.style.padding="10px";
        row.style.pointerEvents="none";
        row.style.height="120px";
        row.className="form_bg";
        row.style.borderRadius="5px";
        content.appendChild(row);
        var icon = document.createElement("div");
        icon.style.display="flex";
        icon.style.alignItems="center";
        icon.style.justifyContent="center";
        row.appendChild(icon);

        var i = document.createElement("i");
        i.className = iconname;
        i.style.fontSize="30px";
        i.style.pointerEvents="none";
        icon.appendChild(i);
        return row
}
function renderCards(content: HTMLElement, cards: IExtension[]) {
    content.innerHTML = "";

    cards.forEach((item) => {
        var row = document.createElement("div");
        row.style.margin="10px 0px 10px 0px";
        row.style.padding="10px";
        row.className="form_bg";
        row.style.borderRadius="5px";
        row.onclick = () => { };
        row.draggable = true;

        row.ondragstart=(e)=>{

            dargData.setData("store",item);

        }

        var icon = document.createElement("div");
        icon.style.display="flex";
        icon.style.alignItems="center";
        icon.style.justifyContent="center";
        row.appendChild(icon);

        var i = document.createElement("img");
        i.src = item.cover;
        i.style.minWidth="200px";
        i.style.maxHeight="100px";
        i.style.pointerEvents="none";
        icon.appendChild(i);

        var context = document.createElement("div");

        row.appendChild(context);

        var label = document.createElement("div");
        label.style.fontSize="13px";
        label.innerText = item.label;
        context.appendChild(label);

        var discription = document.createElement("div");
        discription.style.fontSize="12px";
        discription.innerText = item.discription;
        discription.style.textIndent="2em";
        context.appendChild(discription);

        var botttom = document.createElement("div");
        botttom.style.display="flex";
        botttom.style.fontSize="12px";
        context.appendChild(botttom);

        var at = document.createElement("i");
        at.className="bi bi-at";
        botttom.appendChild(at);

        var author = document.createElement("div");
        author.style.flex="1";
        author.innerText = item.author;
        botttom.appendChild(author);

        var space = document.createElement("div");
        space.style.flex="1";
        botttom.appendChild(space);

        var count = document.createElement("div");
        count.style.marginLeft="10px";
        count.innerText = item.count + "";
        botttom.appendChild(count);


        // var button = document.createElement("i");
        // button.style.marginLeft="10px";
        // button.style.cursor="pointer";
        // botttom.appendChild(button);
        // if (item.installed) {
        //     button.className = "bi bi-trash ex_button";
        // } else {
        //     button.className = "bi bi-download ex_button";
        // }

        content.appendChild(row);


    });
}