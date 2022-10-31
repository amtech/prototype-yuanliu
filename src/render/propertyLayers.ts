import { clearComponentsProperty } from "../plugins/property/property";
import { loadComponentsProperty } from "../plugins/property/property";
import { deleteComponent, onSelectComponent } from "../common/components";
import { openContextMenu } from "../common/contextmenu";
import { IMenuItem } from "../common/contextmenu";
import { IComponent } from "../common/interfaceDefine";
import { getLayers } from "./workbench";
var rowHeight = 24;
var viewHeight = 400;
var rowStart = 0;
var rowCount = 0;
var treeView: HTMLElement;
export function renderLayers(context: HTMLElement) {
    var tree = document.createElement("div");
    tree.className = "explorer_tree";
    tree.style.height = 400 + "px";
    context.appendChild(tree);

    treeView = document.createElement("div");
    treeView.className = "explorer_tree_view";
    treeView.id = "explorer_tree_view";
    treeView.style.height = tree.style.height;
    var treeScroll = document.createElement("div");
    treeScroll.className = "explorer_tree_scroll";

    tree.appendChild(treeView);
    tree.appendChild(treeScroll);
    //

    rowCount = viewHeight / rowHeight;



    tree.onwheel = (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (layerList.length <= 0)
            return;
        rowStart += Math.round(e.deltaY / 10);
        if (rowStart + rowCount > layerList.length) {
            rowStart = Math.round(layerList.length - rowCount);
        }
        if (rowStart < 0) {
            rowStart = 0;
        }

        renderLayersView(treeView);

    }

}
export function changeLayers(layers: IComponent[]) {
    layerList = [];
    tranformLayers(layers, 0);
}
export function updateLayers() {

    renderLayersView(treeView);


}

function renderLayersView(treeView: HTMLElement) {

    console.log("renderLayersView");
    var adds: Array<any> = [];
    var exits: Array<string> = [];
    treeView.style.top = (-rowStart * rowHeight) + "px";
    for (var i = rowStart; i < rowCount + rowStart && i < layerList.length; i++) {//
        var layer = layerList[i];
        var row = document.getElementById("layer_" + layer.key);
        if (row != undefined) {
            exits.push(row.id);
            row.style.top = (i) * rowHeight + "px";
        } else {
            adds.push({
                index: i,
                layer: layer
            });
        }
    }
    //删除多余的

    var wi = 0;
    while (wi < treeView.childElementCount) {
        var line = treeView.children.item(wi);
        if (exits.indexOf(line.id) < 0) {
            line.remove();
        } else {
            wi++;
        }
    }
    //增加新的
    adds.forEach((value, key) => {
        var index = value.index;
        var layer = value.layer;
        renderLayersRow(treeView, layer, index);
    });





}
var layerList: Array<IComponent> = [];
function tranformLayers(layers: IComponent[], level: number) {
    // console.log("tranformLayers");
    layers.forEach((layer) => {
        tranformLayer(layer, level);

    })


}
function tranformLayer(layer: IComponent, level: number) {
    layer.level = level;
    layerList.push(layer);
    if (layer.children != undefined && layer.children.length > 0)
        layer.isDir = true; {
        if (layer.isOpen) {
            level++;

            tranformLayers(layer.children, level);
        }
    }
}

var lastSelected: HTMLElement;
function renderLayersRow(content: HTMLElement, component: IComponent, index: number) {

    var level = component.level;
    var page = document.createElement("div");
    page.className = "explorer_file explorer_row";
    page.style.top = index * rowHeight + "px";
    page.id = "layer_" + component.key;
    content.appendChild(page);

    page.title = component.path;
    var indent = document.createElement("div");
    indent.className = "indent";
    indent.style.width = 10 + level * 12 + "px";
    page.appendChild(indent);
    var icon = document.createElement("i");
    if (component.isDir) {

        if (component.isOpen) {
            icon.className = "bi bi-chevron-down";
            page.setAttribute("data-extend", "true");

        } else {
            icon.className = "bi bi-chevron-right";
            page.setAttribute("data-extend", "false");
        }
    } else {
        icon.className = component.icon;
    }
    page.appendChild(icon);


    var name = document.createElement("div");
    name.className = "name";
    name.style.flex = "1";
    name.innerText = component.label;
    page.appendChild(name);


    var type = document.createElement("div");
    type.style.paddingRight = "10px";
    type.style.opacity = "0.6";
    type.innerText = "[" + component.type + "]";
    page.appendChild(type);


    var visiable = document.createElement("i");
    visiable.style.cursor = "pointer";
    if (component.hidden) {
        visiable.className = "bi bi-eye-slash";

    } else {
        visiable.className = "bi bi-eye";
    }

    page.appendChild(visiable);
    var space = document.createElement("div");
    space.style.width = "10px";
    page.appendChild(space);
    visiable.onclick = (e: MouseEvent) => {
        if (component.hidden) {
            visiable.className = "bi bi-eye";
            component.hidden = false;
        } else {
            visiable.className = "bi bi-eye-slash";
            component.hidden = true;
        }


        if (component.toogle != undefined) {
            component.toogle(document.getElementById(component.key), component.hidden);
        } else {
            document.getElementById(component.key).style.display = component.hidden ? "none" : "block";
        }


        e.stopPropagation();
    }

    page.onclick = (e: MouseEvent) => {
        if (lastSelected == undefined || lastSelected != page) {
            if (lastSelected != undefined) lastSelected.setAttribute("selected", "false");
            page.setAttribute("selected", "true");
            lastSelected = page;
        }

        if (component.isDir) {


            if (component.isOpen) {

                component.isOpen = false;

                page.setAttribute("data-extend", "false");
                icon.className = "bi bi-chevron-right";

            } else {


                page.setAttribute("data-extend", "true");
                icon.className = "bi bi-chevron-down";
                component.isOpen = true;
            }
            layerList = [];
            tranformLayers(getLayers(), 0);


            renderLayersView(document.getElementById("explorer_tree_view"));

        }


        clearComponentsProperty();
        //  clearComponentsCode();
        loadComponentsProperty(component);
        //   loadComponentsCode([component]);
        onSelectComponent(component.path);
    }
    page.oncontextmenu = (e: MouseEvent) => {
        // page.setAttribute("selected", "true");
        var menuItems: Array<IMenuItem> = [{
            id: "new",
            label: "新建",
        }, {
            id: "delete",
            label: "删除", icon: "bi bi-trash", onclick: () => {
                var del = document.getElementById("layer_" + component.key);
                console.log("del", del);
                if (del != undefined) {
                    del.remove();
                }
                deleteComponent(component);


            }
        }, {
            id: "rename",
            label: "重命名",
        }, {
            id: "copy",
            label: "复制",
        }];
        openContextMenu(menuItems);
    }
    page.setAttribute("data-index", index + "");

}
