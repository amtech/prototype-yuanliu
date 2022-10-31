import { openContextMenu } from "../common/contextmenu";
import { getUUID, ICatalog } from "../common/interfaceDefine";
import { ipcRendererSend } from "../preload";
import { getCatalog, getCatalogParent, getChartCount, menuItemsFolder, menuItemsPage, renameFile } from "./sidebar";
import { getProject } from "./workspace";
import * as dargData from "./DragData";
var rowHeight = 24;
var viewHeight = rowHeight * 16 + 10;
var rowStart = 0;
var rowCount = 0;
var treeView: HTMLElement;
export function renderCatalogs(context: HTMLElement) {

    var tree = document.createElement("div");
    tree.className = "explorer_tree";
    tree.style.height = 400 + "px";
    context.appendChild(tree);

    treeView = document.createElement("div");
    treeView.className = "explorer_tree_view";
    treeView.id = "explorer_catalog_view";

    treeView.style.height = tree.style.height;
    var treeScroll = document.createElement("div");
    treeScroll.className = "explorer_tree_scroll";

    tree.appendChild(treeView);
    tree.appendChild(treeScroll);
    rowCount = viewHeight / rowHeight;


    tranformLayers(getProject().catalogs, 0);
    renderCatalogsView(treeView);

    tree.onwheel = (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (catalogList.length <= 0)
            return;
        rowStart += Math.round(e.deltaY / 10);
        if (rowStart + rowCount > catalogList.length) {
            rowStart = Math.round(catalogList.length - rowCount);
        }
        if (rowStart < 0) {
            rowStart = 0;
        }

        renderCatalogsView(treeView);

    }

}
export function changeCatalogs(catalogs: ICatalog[]) {
    catalogList = [];
    tranformLayers(catalogs, 0);
}
export function updateCatalogs() {

    renderCatalogsView(treeView);


}
var catalogList: Array<ICatalog> = [];
function tranformLayers(catalogs: ICatalog[], level: number) {
    // console.log("tranformLayers");
    catalogs.forEach((catalog) => {
        tranformLayer(catalog, level);

    })


}
function tranformLayer(catalog: ICatalog, level: number) {
    catalog.level = level;
    catalogList.push(catalog);
    if (catalog.children != undefined)
        catalog.isDir = true; {
        if (catalog.isOpen) {
            level++;

            tranformLayers(catalog.children, level);
        }
    }
}


function renderCatalogsView(treeView: HTMLElement) {

    var adds: Array<any> = [];
    var exits: Array<string> = [];
    treeView.style.top = (-rowStart * rowHeight) + "px";
    for (var i = rowStart; i < rowCount + rowStart && i < catalogList.length; i++) {//
        var layer = catalogList[i];
        var row = document.getElementById("catalog_" + layer.key);
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
        renderCatalogsRow(treeView, layer, index);
    });





}

var lastSelected: HTMLElement;
function renderCatalogsRow(content: HTMLElement, catalog: ICatalog, index: number) {

    var level = catalog.level;

    var page = document.createElement("div");
    page.className = "explorer_file explorer_row";
    page.style.top = index * rowHeight + "px";
    page.id = "catalog_" + catalog.key;
    content.appendChild(page);

    page.title = catalog.path;
    var indent = document.createElement("div");
    indent.className = "indent";
    indent.style.width = 10 + level * 12 + "px";
    page.appendChild(indent);
    var icon = document.createElement("i");
    if (catalog.isDir) {

        if (catalog.isOpen) {
            icon.className = "bi bi-chevron-down";
            page.setAttribute("data-extend", "true");

        } else {
            icon.className = "bi bi-chevron-right";
            page.setAttribute("data-extend", "false");
        }
    } else {
        icon.className = "bi bi-file-earmark";
    }
    page.appendChild(icon);


    var name = document.createElement("div");
    name.className = "name";
    // name.innerText = catalog.page.name;
    page.appendChild(name);

    var nameInput = document.createElement("input");
    nameInput.value = catalog.name;
    name.appendChild(nameInput);

    var nameLabel = document.createElement("div");
    nameLabel.innerText = catalog.name;
    name.appendChild(nameLabel);




    var space = document.createElement("div");
    space.style.width = "10px";
    page.appendChild(space);
    page.tabIndex = 1;
    page.onkeydown = (e: KeyboardEvent) => {
        if (e.key == "Enter") {
            page.setAttribute("data-edit", "true");
            nameInput.focus();
        }

    };

    nameInput.onblur = () => {
        if (nameInput.value.length <= 0) return;
        page.setAttribute("data-edit", "false");
        nameLabel.innerText = nameInput.value;
        // catalog.name = nameInput.value;
        // catalog.path.replace(catalog.name, nameInput.value);
        renameFile(catalog, catalog.name, nameInput.value);
    }
    nameInput.onclick = (e: MouseEvent) => { e.stopPropagation() };
    nameInput.onkeydown = (e: KeyboardEvent) => {
        if (e.key == "Enter") {
            if (nameInput.value.length <= 0) return;
            page.setAttribute("data-edit", "false");
            nameLabel.innerText = nameInput.value;
            // catalog.name = nameInput.value;
            //  catalog.path.replace(catalog.name, nameInput.value);
            renameFile(catalog, catalog.name, nameInput.value);
            page.focus();
        }
        e.stopPropagation();

    };

    page.onclick = (e: MouseEvent) => {
        if (lastSelected == undefined || lastSelected != page) {
            if (lastSelected != undefined) lastSelected.setAttribute("selected", "false");
            page.setAttribute("selected", "true");
            lastSelected = page;
        }

        if (catalog.isDir) {


            if (catalog.isOpen) {

                catalog.isOpen = false;

                page.setAttribute("data-extend", "false");
                icon.className = "bi bi-chevron-right";

            } else {


                page.setAttribute("data-extend", "true");
                icon.className = "bi bi-chevron-down";
                catalog.isOpen = true;
            }
            catalogList = [];
            tranformLayers(getProject().catalogs, 0);
            renderCatalogsView(document.getElementById("explorer_catalog_view"));

        } else {

        }

    }
    page.ondblclick = (e: MouseEvent) => {
        //open page
        //   renderPage(catalog.page);
        if (!catalog.isDir) {
            console.log("---Open--", Date.now());
            ipcRendererSend("openPage", catalog);
        }


    }
    page.oncontextmenu = (e: MouseEvent) => {
        if (catalog.isDir) {
            openContextMenu(menuItemsFolder, catalog, page);

        } else {
            openContextMenu(menuItemsPage, catalog, page);
        }
    }
    page.setAttribute("data-index", index + "");
    page.draggable = true;
    //链接到菜单或按钮
    page.ondragstart = (e) => {
        //TODO
        //     e.dataTransfer.setData("catalog", catalog.key);
        dargData.setData("catalog", catalog);
        e.stopPropagation();
    }
    page.ondragover = (e) => {
        e.preventDefault();
        page.setAttribute("data-insert", "true");
        e.stopPropagation();
    }
    page.ondragleave = (e) => {

        page.removeAttribute("data-insert");
        e.stopPropagation();
    }
    //移动位置
    page.ondrop = (e) => {

        page.removeAttribute("data-insert");
        e.stopPropagation();
        var dropParent = getCatalogParent(getProject().catalogs, dargData.getData("catalog").key);
        if (dropParent == undefined) {

            console.log("ondrop parent is undefined");

            var ol = getCatalog(getProject().catalogs, dargData.getData("catalog").key);
            console.log(ol);
            var olds: ICatalog = ol.caltalog;

            var copy: ICatalog = { key: getUUID(), name: olds.name, path: olds.path, dir: olds.dir, children: olds.children };
            var oldIndex = ol.index;

            getProject().catalogs.splice(oldIndex, 1);
            var index = getProject().catalogs.findIndex(c => c.key == catalog.key);
            getProject().catalogs.splice(index + 1, 0, copy);

            // var v = document.getElementById("fileExplorer");
            // v.innerHTML = "";
            // renderCatalog(v, getProject().catalogs, 1);


            changeCatalogs(getProject().catalogs);
            updateCatalogs();

            ipcRendererSend("saveProject", getProject());
        } else {
            console.log("ondrop parent not  undefined");
            var ol = getCatalog(dropParent.children, dargData.getData("catalog").key);
            var olds: ICatalog = ol.caltalog;

            var copy: ICatalog = { key: getUUID(), name: olds.name, path: olds.path, dir: olds.dir, children: olds.children };

            var oldIndex = ol.index;
            dropParent.children.splice(oldIndex, 1);
            var index = dropParent.children.findIndex(c => c.key == catalog.key);
            console.log("old", olds);
            dropParent.children.splice(index + 1, 0, copy);

            // var vs: any = document.getElementById(dropParent.key).getElementsByClassName("explorer_folder_view").item(0);
            // vs.innerHTML = "";
            var level = getChartCount(dropParent.path, "/") + 1;
            console.log("level", level);
            // renderCatalog(vs, dropParent.children, level);

            changeCatalogs(getProject().catalogs);
            updateCatalogs();
            ipcRendererSend("saveProject", getProject());

        }
    }

}
