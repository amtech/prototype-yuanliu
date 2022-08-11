// window.onresize = () => {
//     window.location.reload();
// }
/**
 * [
            dist + '/js/blues.js',
            dist + '/js/pagesData.js',
            dist + '/js/titleData.js',
            dist + '/js/navData.js',
            dist + '/js/projectData.js',
             dist + '/js/component.js', 
             dist + '/js/dataCatalog.js'
            , dist + '/js/map.js',
             dist + '/js/components.js', dist + '/js/database.js'
            ,
        ]
 *  */
import project_data from "./projectData.js";
import pages_data from "./pagesData.js";
import title_data from "./titleData.js";
import dataCatalog from "./dataCatalog.js";
import nav_data from "./navData.js";
import { loadBlueprint, renderBlueView, find_catalog_by_key } from "./blues.js";
import { getComponentTempateByType } from "./component.js";


window.onload = () => {

    // console.log(project_data);
    // console.log("dataCatalog", dataCatalog);
    console.log("############prototyping start############");
    document.title = project_data.name;
    document.body.style.cssText = "--theme-color:" + project_data.themeColor;
    if (title_data.display) {
        renderTitle();
    }
    console.log("nav", nav_data);
    if (nav_data.display) {
        renderNav();
    }

    renderHubIcon();

    // setInterval(() => {
    //     req();
    // }, 50);
    var hash = document.location.hash;
    logj(hash, "main", 47);
    if (hash != undefined && hash.length > 0) {

        var page = pages_data.find(p => p.key == hash.substring(1));
        renderPage(page);
        return;


    }
    if (project_data.launch != undefined && project_data.launch.length > 0) {
        var page = pages_data.find(p => p.key == project_data.launch);
        renderPage(page, undefined, true);
        return;
    }
    for (var key in pages_data) {

        renderPage(pages_data[key]);
        break;
    }


}

function req() {

    var xhr = new XMLHttpRequest();
    var data = window.location.href;

    xhr.open('POST', 'http://127.0.0.1:4000', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(data);
    xhr.onload = () => {

        if (xhr.response == "0") {
            window.location.reload();
        }
    }




}
var nav_bar;

function renderNav() {
    var app = document.getElementById("navBar");
    app.style.height = (window.innerHeight - 44) + "px";
    nav_bar = document.createElement("div");
    nav_bar.className = "nav_bar";
    nav_bar.id = "nav_bar";
    nav_bar.style.background = nav_data.background;

    app.appendChild(nav_bar);
    renderNavTrees(nav_bar, nav_data.items);

}

function renderNavTrees(content, nav) {

    content.innerHTML = "";

    nav.forEach(item => {
        renderNavTree(content, item, 1);
    })


}
var lastSelected;

function renderNavTree(content, nav, level) {
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
        icon.className = "bi bi-chevron-right";
        folderTitle.appendChild(icon);

        var name = document.createElement("div");
        name.className = "name";
        name.innerText = nav.name;
        folderTitle.appendChild(name);

        var folderView = document.createElement("div");
        folderView.className = "nav_folder_view";
        folderView.style.display = "none";
        folder.appendChild(folderView);


        folderTitle.onclick = (e) => {
            // folderTitle.setAttribute("selected", "true");
            if (folderView.style.display == "none") {
                folderView.style.display = "block";
                icon.className = "bi bi-chevron-down";
            } else {
                folderView.style.display = "none";
                icon.className = "bi bi-chevron-right";
            }
        }
        nav.children.forEach((child) => {
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

        page.onclick = (e) => {
            if (lastSelected == undefined || lastSelected != page) {
                if (lastSelected != undefined)
                    lastSelected.setAttribute("selected", "false");
                page.setAttribute("selected", "true");
                lastSelected = page;
                document.title = nav.name;

                var c = find_catalog_by_key(project_data.catalogs, nav.path);
                console.log(c);
                var p = pages_data.find(p => p.path == c.path);

                document.location.hash = p.key;


                logj(p, "main", 190);
                if (p != undefined)
                    renderPage(p);

            }
        }
    }
}
var title_bar;

function renderTitle() {
    var app = document.getElementById("titleBar");

    title_bar = document.createElement("div");
    title_bar.className = "title_bar";
    title_bar.id = "title_bar";
    app.appendChild(title_bar);
    title_bar.style.background = title_data.background;


    if (title_data.page != undefined)
        renderComponents(title_bar, title_data.page.children);
    setTimeout(() => {
        if (title_data.page != undefined) {
            loadBlueprint(title_data.page.blues, title_data.page.blueLinks);
        }
    }, 1000);

}
var curpage;

export function getCurPage() {
    return curpage;
}

export function renderPageByCatalogKey(key, content) {

    var c = find_catalog_by_key(project_data.catalogs, key);
    if (c == undefined) {
        console.log("renderPageByCatalogKey not found " + key)
        console.log(project_data.catalogs);
        return;
    }
    var p = pages_data.find(p => p.path == c.path);
    renderPage(p, content);
}

export function renderPage(pageJson, content, isLaunch) {
    if (pageJson == undefined) {
        return;
    }
    if (pageJson.backgroundColor != "auto" && pageJson.backgroundColor != "transparent") {
        document.getElementById("app").style.background = pageJson.backgroundColor;
    }



    curpage = pageJson;

    if (isLaunch != undefined && isLaunch) {
        if (title_bar != undefined)
            title_bar.style.display = "none";
        if (nav_bar != undefined)
            nav_bar.style.display = "none";
    } else {
        if (title_bar != undefined)
            title_bar.style.display = "block";
        if (nav_bar != undefined)
            nav_bar.style.display = "block";

    }

    //nav title
    if (isDark(title_data.background) && getCurPage().theme == "light") {
        if (title_bar != undefined)
            title_bar.style.color = "#fff";
    } else if (!isDark(title_data.background) && getCurPage().theme == "dark") {
        if (title_bar != undefined)
            title_bar.style.color = "#000";
    }
    if (isDark(nav_data.background) && getCurPage().theme == "light") {
        if (nav_bar != undefined)
            nav_bar.style.color = "#fff";
    } else if (!isDark(nav_data.background) && getCurPage().theme == "dark") {
        if (nav_bar != undefined)
            nav_bar.style.color = "#000";
    }

    logj("renderPage", "main", 242);

    var app = document.getElementById("pageView");
    if (content != undefined) {
        app = content;
    } else {
        app.style.height = (window.innerHeight - 44) + "px";
    }
    app.innerHTML = "";

    app.style.overflow = "auto";
    var page = document.createElement("div");
    page.className = "page";

    app.appendChild(page);

    var theme = "light";
    if (pageJson.theme)
        theme = pageJson.theme;

    document.getElementById("app").className = theme;
    renderComponents(page, pageJson.children);

    setTimeout(() => {
        if (pageJson.guides != undefined && pageJson.guides.length > 0)
            renderGuide(pageJson.guides);
        loadBlueprint(pageJson.blues, pageJson.blueLinks);
    }, 1000);

}
var guidesIndex = 0;

function renderGuide(guides) {

    var guideDiv = document.getElementById("guideDiv");
    if (guideDiv == undefined) {
        var app = document.getElementById("app");

        var guideDiv = document.createElement("div");
        guideDiv.className = "guideDiv";
        guideDiv.id = "guideDiv";

        app.appendChild(guideDiv);
        guideDiv.onclick = (e) => {
            guidesIndex++;
            if (guidesIndex >= guides.length) {
                guidesIndex = 0;
                guideDiv.remove();
            } else {
                renderGuide(guides);
            }
        }
    }
    guideDiv.innerHTML = "";
    if (guidesIndex < guides.length) {
        var g = guides[guidesIndex];
        logj(g, "main", 300);

        var guideText = document.createElement("div");
        guideText.className = "guideText";
        guideText.id = "guideText";
        guideText.innerText = (guidesIndex + 1) + "/" + guides.length + "\r\n" + g.context + "";

        guideText.onclick = (e) => {
            e.stopPropagation();
        }

        var target = document.getElementById(g.component);
        if (target != undefined) {
            target.scrollIntoView({ behavior: "smooth" });

            setTimeout(() => {

                var t = target.getBoundingClientRect().top + 20; // getDivClientTop(target) + 20;
                var l = target.getBoundingClientRect().left + 20;
                if (t > window.innerHeight - 100) {
                    guideText.style.bottom = (window.innerHeight - t) + "px";
                } else {
                    guideText.style.top = t + "px";
                }
                if (l > window.innerWidth - 100) {
                    guideText.style.right = (window.innerWidth - t) + "px";
                } else {
                    guideText.style.left = l + "px";

                }
                guideDiv.appendChild(guideText);
            }, 500);
        }
    }
}

function getDivClientTop(div) {
    var top = 0;
    while (div.offsetParent) {
        top += div.offsetTop;

        div = div.offsetParent;
    }
    return top;
}

function getDivClientLeft(div) {
    var left = 0;
    while (div.offsetParent) {
        left += div.offsetLeft;

        div = div.offsetParent;
    }
    return left;
}
/**
 * 
 * @param content 
 * @param components  从文件中获取，缺少方法
 */
export function renderComponents(content, components, parent) {
    content.innerHTML = "";
    //  var newComponents: IComponent[]=[];
    if (components != undefined)
        components.forEach((component, index) => {

            if (component.isRemoved == undefined && !component.isRemoved) {
                if (component.onRender == undefined) {

                    if (component.type == "icon") {
                        var icon_e = component.icon;
                        component.onPreview = () => {
                            var pi = document.createElement("i");
                            pi.className = icon_e;
                            return pi;
                        };
                        component.onRender = (component, element) => {
                            var pi;
                            if (element != undefined)
                                pi = element;
                            else
                                pi = document.createElement("div");
                            // if (component.blue != undefined && component.blue.event != undefined && component.blue.event.click != undefined)
                            pi.setAttribute("icon_hover", "true");
                            pi.innerHTML = "<i class='" + icon_e + "'></i>";
                            pi.onclick = () => {
                                    if (component.blue.event.click.on != undefined) {
                                        component.blue.event.click.on();
                                    }

                                }
                                // pi.className = "bi bi-" + icon;
                            return { root: pi, body: pi };
                        };
                    } else if (component.type == "image") {

                        component.onPreview = () => {

                            return document.createElement("div");
                        };
                        component.onRender = (component, element) => {
                            var img;
                            if (element != undefined)
                                img = element;
                            else
                                img = document.createElement("img");
                            if (component.property != undefined && component.property.length > 0)
                                img.src = "images/" + component.property[0].context;
                            // pi.className = "bi bi-" + icon;
                            return { root: img, content: img }
                        };
                    } else {
                        var template = getComponentTempateByType(component.type);
                        if (template != undefined) {
                            component.onPreview = template.onPreview;
                            component.onRender = template.onRender;
                            component.blue = copyBlue(template.blue);
                        }
                    }
                }
                if (component.onRender != undefined && component.onPreview != undefined) {
                    renderComponent(content, component, parent, index);
                }
            }
        })
}

function copyBlue(blue) {
    if (blue == undefined)
        return undefined;
    var event;
    var method = blue.method;
    var property;
    if (blue.event != undefined) {
        event = {};
        for (var key in blue.event) {
            var eve = blue.event[key];
            var e = { label: eve.label };
            event[key] = e;
        }
    }
    if (blue.property != undefined) {
        property = {};
        for (var key in blue.property) {
            var eve = blue.property[key];
            var el = { label: eve.label, get: eve.get, set: eve.set };
            property[key] = el;
        }
    }
    var temp = {
        event: event,
        method: method,
        property: property,
        properties: blue.properties

    };
    return temp;
}

export function renderComponent(content, component, parent, index) {

    //  console.log("----renderComponent----")
    var rs = component.onRender(component, undefined, content, "product");
    var root = rs.root;
    var body = rs.content;
    if (root == undefined) {
        logj("renderComponent is undefined", "main", 476);
        return;
    }
    root.className += "component_canvas";
    root.setAttribute("component_type", component.type);
    root.id = component.key;
    root.setAttribute("component_group", component.group);

    if (root.style != undefined && root.style.cssText.length <= 0) {
        if (component.styles != undefined && component.styles["root"] != undefined) {
            root.style.cssText = component.styles["root"];
        } else if (component.style != undefined) {
            root.style.cssText = component.style;
        }
    }
    if (component.hidden) {
        if (component.toogle != undefined) {
            component.toogle(root, true);
        } else {
            root.style.display = "none";
        }
    }
    if (content != undefined)
        content.appendChild(root);
    //控制层级 layer
    if (component.type == "layers") {
        root.style.padding = "0px";
    }
    if (parent != undefined && index != undefined) {
        if (parent.type == "layers") {

            var layer = parseInt(parent.property.layer.context);

            logj("===layer :" + layer + "," + index, "main", 515);
            root = document.getElementById(component.key);
            root.style.margin = "0px";
            //层级
            // if (layer == -2) {
            //     //平铺
            //     root.style.position = "relative";
            //     root.style.top = "0px";

            //     root.style.right = "0px";
            //     root.style.left = "0px";
            //     root.style.bottom = "0px";

            // } else 
            if (layer == -1 || layer == -2) {
                //层级
                if (index == 0) {
                    root.style.position = "relative";
                    root.style.top = "0px";
                    root.style.right = "0px";
                    root.style.left = "0px";
                    root.style.bottom = "0px";

                } else {
                    root.style.position = "absolute";
                    root.style.top = "0px";
                    root.style.right = "0px";
                    root.style.left = "0px";
                    root.style.bottom = "0px";
                }

            } else {
                //展示其中的一个
                logj("--layer one--" + index === layer, "main", 548);
                if (index === layer) {
                    logj("show", "main", 550);
                    root.style.display = "block";
                    root.style.position = "relative";
                } else {
                    logj("hide", "main", 554);

                    root.style.display = "none";
                }
            }
        }
    }
    if (component.children != undefined && component.children.length > 0) {
        logj("renderComponent children:" + component.children.length, "main", 565);

        setTimeout(() => {
            renderComponents(body, component.children, component);
        }, 0);
    }
    return root;
}

function renderHubIcon() {


    var hub_icon = document.createElement("div");
    hub_icon.className = "hub_icon";
    hub_icon.id = "hub_icon";

    var hub_icon_i = document.createElement("i");
    hub_icon_i.className = "bi bi-layers-half";
    hub_icon.appendChild(hub_icon_i);

    document.getElementById("app").appendChild(hub_icon);

    hub_icon.onclick = (e) => {
        var hub = document.createElement("div");
        hub.className = "hub";
        hub.id = "hub";
        document.body.appendChild(hub);
        hub.onclick = (eh) => {
            hub.remove();
            eh.stopPropagation();
        }
        renderHub(hub);
    }
}

function renderHub(content) {

    //catalog
    var catalog = document.createElement("div");
    catalog.className = "hub_catalog";
    catalog.id = "hub_catalog";
    content.appendChild(catalog);
    var catalogTitle = document.createElement("div");
    catalogTitle.className = "hub_title";
    catalogTitle.innerHTML = "Catalog";
    catalog.appendChild(catalogTitle);
    var catalogContent = document.createElement("div");
    catalog.appendChild(catalogContent);

    renderCatalogTrees(catalogContent, project_data.catalogs);

    var hub_blue = document.createElement("div");
    hub_blue.className = "hub_blue";

    content.appendChild(hub_blue);
    hub_blue.onclick = (e) => { e.stopPropagation() };
    var blueitle = document.createElement("div");
    blueitle.className = "hub_title";
    blueitle.innerHTML = "Blueprint";
    hub_blue.appendChild(blueitle);
    var blueContent = document.createElement("div");
    blueContent.id = "hub_blue";
    hub_blue.appendChild(blueContent);

    var setting = document.createElement("div");
    setting.className = "hub_setting";
    setting.id = "hub_setting";
    content.appendChild(setting);
    setting.onclick = (e) => { e.stopPropagation() };

    var settingTitle = document.createElement("div");
    settingTitle.className = "hub_title";
    settingTitle.innerHTML = "Setting";
    setting.appendChild(settingTitle);
    var settingContent = document.createElement("div");
    setting.appendChild(settingContent);

    updateBlueView();
}

export function updateBlueView() {
    var conent = document.getElementById("hub_blue");
    if (conent != undefined) {
        conent.innerHTML = "";
        renderBlueView(conent);
    }
}

function renderCatalogTrees(content, nav) {
    content.innerHTML = "";
    nav.forEach(item => {
        renderCatalogTree(content, item, 1);
    })
}

function renderCatalogTree(content, nav, level) {
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
        icon.className = "bi bi-chevron-right";
        folderTitle.appendChild(icon);

        var name = document.createElement("div");
        name.className = "name";
        name.innerText = nav.name;
        folderTitle.appendChild(name);

        var folderView = document.createElement("div");
        folderView.className = "nav_folder_view";
        folderView.style.display = "none";
        folder.appendChild(folderView);

        folderTitle.onclick = (e) => {
            e.stopPropagation();
            // folderTitle.setAttribute("selected", "true");
            if (folderView.style.display == "none") {
                folderView.style.display = "block";
                icon.className = "bi bi-chevron-down";
            } else {
                folderView.style.display = "none";
                icon.className = "bi bi-chevron-right";
            }
        }
        nav.children.forEach((child) => {
            renderCatalogTree(folderView, child, level + 1);
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
        icon.className = "bi bi-file-earmark-richtext";
        page.appendChild(icon);

        var name = document.createElement("div");
        name.className = "name";
        name.innerText = nav.name;
        page.appendChild(name);

        page.onclick = (e) => {
            e.stopPropagation();
            window.location.hash = nav.key;
            renderPageByCatalogKey(nav.key);
            updateBlueView();
        }
    }
}

export function logj(log, file, line) {

    console.log(Date.now(), file, line, log);

}


function isDark(color) {

    if (color == undefined) {
        console.log("is dark ", color);
        return false;
    }

    if (color.startsWith("#")) {
        var rgb = set16ToRgb(color);
        if (rgb == undefined) {
            return false;
        }

        var RgbValue = rgb.replace("rgb(", "").replace(")", "");


        var RgbValueArry = RgbValue.split(",");

        var grayLevel = parseInt(RgbValueArry[0]) * 0.299 + parseInt(RgbValueArry[1]) * 0.587 + parseInt(RgbValueArry[2]) * 0.114;
        if (grayLevel >= 150) {　　
            return false;
        } else {　
            return true;
        }

    } else if (color.startsWith("rgb(")) {
        var RgbValue = color.replace("rgb(", "").replace(")", "");


        var RgbValueArry = RgbValue.split(",");

        var grayLevel = parseInt(RgbValueArry[0]) * 0.299 + parseInt(RgbValueArry[1]) * 0.587 + parseInt(RgbValueArry[2]) * 0.114;
        if (grayLevel >= 150) {　　
            return false;
        } else {　
            return true;
        }
    } else if (color.startsWith("rgba(")) {
        var RgbValue = color.replace("rgba(", "").replace(")", "");


        var RgbValueArry = RgbValue.split(",");

        var grayLevel = parseInt(RgbValueArry[0]) * 0.299 + parseInt(RgbValueArry[1]) * 0.587 + parseInt(RgbValueArry[2]) * 0.114;
        if (grayLevel >= 150) {　　
            return false;
        } else {　
            return true;
        }
    }
    return false;

}

function set16ToRgb(str) {
    var reg = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/
    if (!reg.test(str)) { return; }
    let newStr = (str.toLowerCase()).replace(/\#/g, '')
    let len = newStr.length;
    if (len == 3) {
        let t = ''
        for (var i = 0; i < len; i++) {
            t += newStr.slice(i, i + 1).concat(newStr.slice(i, i + 1))
        }
        newStr = t
    }
    let arr = []; //将字符串分隔，两个两个的分隔
    for (var i = 0; i < 6; i = i + 2) {
        let s = newStr.slice(i, i + 2)
        arr.push(parseInt("0x" + s))
    }
    return 'rgb(' + arr.join(",") + ')';
}