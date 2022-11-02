import { onSelectComponents } from "../../common/componentEvent";
import { deleteComponent } from "../../common/components";
import { IMenuItem, openContextMenu } from "../../common/contextmenu";
import { createExplorerLayout } from "../../common/explorerTool";
import { IComponent, IExplorer } from "../../common/interfaceDefine";
import { getCurPage, getLayers } from "../../render/workbench";
var body: HTMLElement;
const explorer: IExplorer = {
    key: "outline",
    extend: false,
    title: "层级",
    height: 260,
    onRender(content) {
        body = createExplorerLayout(content, this);
        renderLayers(body);
    },
    sort: 1,
    onResize(height) {
        return -1;
    },

    onExtend(extend) {
        return -1;
    },
    update(updater) {
        
        if (updater.type == "page") {
            changeLayers(updater.data.children);
            updateLayers();
        } else if (updater.type == "add" || updater.type == "del" || updater.type == "move") {
            
            changeLayers(getCurPage().children);
            updateLayers();
        } else if (updater.type == "select"&&explorer.extend) {
            
            //寻找并展示
            findComponent(updater.data);
            changeLayers(getCurPage().children);
            selectComponent(updater.data);
            updateLayers();

        }
    },
    setHeight(height) {
        body.style.height = height + "px";
        viewHeight = height;
        updateLayout();
        updateLayers();
    },
}
export default explorer;
var tree: HTMLElement;
var rowHeight = 24;
var viewHeight = 0;
var rowStart = 0;
var rowCount = 0;
var treeView: HTMLElement;
var scroll_thumb: HTMLElement;
function updateLayout() {
    tree.style.height = viewHeight + "px";
    treeView.style.height = tree.style.height;
    rowCount = Math.floor(viewHeight / rowHeight);
}
function renderLayers(context: HTMLElement) {
    tree = document.createElement("div");
    tree.className = "explorer_tree";
    tree.style.height = viewHeight + "px";
    context.appendChild(tree);

    treeView = document.createElement("div");
    treeView.className = "explorer_tree_view";
    treeView.id = "explorer_tree_view";
    treeView.style.height = tree.style.height;
    var treeScroll = document.createElement("div");
    treeScroll.className = "explorer_tree_scroll";
    scroll_thumb = document.createElement("div");
    scroll_thumb.className = "explorer_tree_scroll_thumb";


    treeScroll.appendChild(scroll_thumb);

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
function changeLayers(layers: IComponent[]) {
    layerList = [];
    console.log("changeLayers", layers.length);
    tranformLayers(layers, 0);
}
function updateLayers() {
    renderLayersView(treeView);
}

function renderLayersView(treeView: HTMLElement) {
    var scroll_val = rowCount / (layerList.length);
    if (scroll_val > 0.99) {
        scroll_thumb.style.height = "0px";

    } else {
        scroll_thumb.style.height = rowCount / (layerList.length) * viewHeight + "px";
        scroll_thumb.style.top = rowStart / layerList.length * viewHeight + "px";
    }

    var adds: Array<any> = [];
    var exits: Array<string> = [];
    treeView.style.top = (-rowStart * rowHeight) + "px";
    for (var i = rowStart; i < rowCount + rowStart && i < layerList.length; i++) {//
        var layer = layerList[i];
        var row = document.getElementById("layer_" + layer.key);
        if (row != undefined) {
            exits.push(row.id);
            row.style.top = (i) * rowHeight + "px";

            if (select != undefined && select.key == layer.key) {
                if (lastSelected != undefined) {
                    lastSelected.setAttribute("selected", "false");

                }
                lastSelected = row;
                row.setAttribute("selected", "true");
                select = undefined;
            }
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

    if (layers != undefined)
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
function findComponent(component: IComponent) {
    var paths = component.path.split("/");
    var children = getCurPage().children;
    for (var i = 0; i < paths.length - 1; i++) {
        var path = paths[i];
        var cmpt = children.find(p => p.key == path);
        if (cmpt != undefined && cmpt.children != undefined && cmpt.children.length > 0) {
            cmpt.isOpen = true;
            children = cmpt.children;
        }
    }
}
function selectComponent(component: IComponent) {
    for (var i = 0; i < layerList.length; i++) {
        var layer = layerList[i];
        if (layer.key == component.key) {
            rowStart = i - Math.floor(rowCount / 2);
            select = component;
            if (rowStart < 0) {
                rowStart = 0;
            }
            break;
        }
    }
    console.log("select", select);
}
var select: IComponent;
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
    indent.style.width = 10 + level * 5 + "px";
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
        icon.className = "bi bi-dash";//component.icon;
    }
    page.appendChild(icon);


    var name = document.createElement("div");
    name.className = "name";
    name.style.flex = "1";
    name.innerText = component.label;
    page.appendChild(name);


    // var type = document.createElement("div");
    // type.style.paddingRight = "10px";
    // type.style.opacity = "0.6";
    // type.innerText = "[" + component.type + "]";
    // page.appendChild(type);


    var visiable = document.createElement("i");
    visiable.style.cursor = "pointer";
    visiable.style.fontSize="10px";
    if (component.hidden) {
        visiable.className = "bi bi-eye-slash";

    } else {
        visiable.className = component.icon;//"bi bi-eye";
    }

    page.appendChild(visiable);
    var space = document.createElement("div");
    space.style.width = "10px";
    page.appendChild(space);
    visiable.onclick = (e: MouseEvent) => {
        if (component.hidden) {
            visiable.className =component.icon;// "bi bi-eye";
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

    if (select != undefined && select.key == component.key) {
        if (lastSelected != undefined) {
            lastSelected.setAttribute("selected", "false");

        }
        lastSelected = page;
        page.setAttribute("selected", "true");
        select = undefined;
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


        // clearComponentsProperty();
        // //  clearComponentsCode();
        // loadComponentsProperty(component);
        // //   loadComponentsCode([component]);
        onSelectComponents([component]);
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
