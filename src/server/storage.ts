/*! *****************************************************************************
Copyright (c) taoyongwen. All rights reserved.

存储
***************************************************************************** */
import { app, screen, shell } from "electron";
import * as fs from "fs";
import * as path from "path";
import { dataCatolog } from "../common/data";
import { getUUID, ICatalog, IDatabase, IPage, IProject } from "../common/interfaceDefine";
import { getNowDateTime } from "./work";
export function readProjects(): any {
    checkAppData();
    var projectsPath = path.join(appData, "projects.json");
    if (fs.existsSync(projectsPath)) {
        var projects = fs.readFileSync(projectsPath).toString();
        return JSON.parse(projects);
    } else {
        saveProjects([]);

        return [];
    }

}
var appData: string;
export function saveProjects(projects: Array<any>) {
    var projectsPath = path.join(appData, "projects.json");
    fs.writeFileSync(projectsPath, JSON.stringify(projects));
}
export function checkAppData() {
    appData = path.join(app.getPath("home"), ".prototyping");
    if (!fs.existsSync(appData)) {
        fs.mkdirSync(appData);
    }

}
export function saveConfig(config: any) {
    checkAppData();
    var configPath = path.join(appData, "config.json");
    return fs.writeFileSync(configPath, JSON.stringify(config));
}
export function readConfig(): any {
    checkAppData();
    //config
    var titlePath = path.join(appData, "config.json");
    if (!fs.existsSync(titlePath)) {
        return {
            theme: "dark",//dark,light 主题 
            componentsEnable: [//组件开关
                "button", "canvas", "chart_bar", "chart_candlestick",
                "chart_line", "chart_map", "chart_pie", "chart_radar", "chart_scatter",
                "custom", "dialog", "field", "flex",
                "grid", "iframe", "label", "layers", "paragraph",
                "row", "select", "slider", "space",
                "tab", "table", "text", "images",
                "flow_base", "flow_level", "flow_cycle", "flow_pyramid", "fixed", "tree"
            ]
        }
    }
    return JSON.parse(fs.readFileSync(titlePath).toString());
}
export function readDataCatolog(): any {
    checkAppData();
    //title
    var titlePath = path.join(appData, "dataCatolog.json");
    if (fs.existsSync(titlePath)) {
        return JSON.parse(fs.readFileSync(titlePath).toString());
    }
    fs.writeFileSync(titlePath, JSON.stringify(dataCatolog));
    return dataCatolog;


}
export function editDataCatolog() {
    checkAppData();
    //title
    var titlePath = path.join(appData, "dataCatolog.json");
    if (!fs.existsSync(titlePath))
        fs.writeFileSync(titlePath, JSON.stringify(dataCatolog));
    shell.openPath(titlePath);

}

export function openPage(catalog: ICatalog, project: IProject): IPage {

    var p = catalog.path;

    var file = path.join(getProjectFolderPath(project, "pages"), p);
    if (fs.existsSync(file)) {
        var page = readPage(file);
        page.name = catalog.name;
        page.path = p;
        return page;
    }
    return undefined;

}

export function readTitleBar(wProject: IProject): any {
    //title
    var titlePath = path.join(getProjectFolderPath(wProject), "title.json");
    return JSON.parse(fs.readFileSync(titlePath).toString());

}

export function saveTitleBar(title: string, wProject: IProject): any {

    //title
    var titlePath = path.join(getProjectFolderPath(wProject), "title.json");
    return fs.writeFileSync(titlePath, title);

}
export function readNav(wProject: IProject): any {
    //navPath
    var navPath = path.join(getProjectFolderPath(wProject), "nav.json");
    return JSON.parse(fs.readFileSync(navPath).toString());

}
export function saveNavBar(nav: string, wProject: IProject): any {

    //title
    var navPath = path.join(getProjectFolderPath(wProject), "nav.json");
    return fs.writeFileSync(navPath, nav);

}
export function savePage(page: string, folder: string, wProject: IProject): any {

    //page
    var navPath = path.join(getProjectFolderPath(wProject, "pages"), folder);
    try {
        fs.writeFileSync(navPath, page);
    } catch (e) {
        console.log(e);
    }
    //多余的图片删除 (png)|(jpeg)|(gif)|(bmp)|(JPG)|(PNG)|(JPEG)|(GIF)|(BMP)
    var ms = page.match(/(uuid_([a-z]|[0-9])+\.jpg)|(uuid_([a-z]|[0-9])+\.png)|(uuid_([a-z]|[0-9])+\.jpeg)|(uuid_([a-z]|[0-9])+\.gif)|(uuid_([a-z]|[0-9])+\.bmp)|(uuid_([a-z]|[0-9])+\.JPG)|(uuid_([a-z]|[0-9])+\.PNG)|(uuid_([a-z]|[0-9])+\.JPEG)|(uuid_([a-z]|[0-9])+\.GIF)|(uuid_([a-z]|[0-9])+\.NMP)/g);
    if (ms != undefined && ms.length > 0) {
        //page key 
        var tempKey = page.match(/"key"\:"[^"]+"/)[0];//"key":"index"
        var key = tempKey.substring(7, tempKey.length - 1);
        //删除多余的文件
        var imagesPath = path.join(getProjectFolderPath(wProject, 'images'), key);
        if (fs.existsSync(imagesPath)) {
            var list = fs.readdirSync(imagesPath);
            for (var i = 0; i < list.length; i++) {
                var file = list[i];
                if (ms.indexOf(file) == -1) {
                    fs.unlinkSync(imagesPath + "/" + file);
                }
            }
        }
    } else {
        //page key 
        var tempKey = page.match(/"key"\:"[^"]+"/)[0];//"key":"index"
        var key = tempKey.substring(7, tempKey.length - 1);
        //删除多余的文件
        var imagesPath = path.join(getProjectFolderPath(wProject, 'images'), key);
        emptyFolder(imagesPath);
    }



}

/**
 * 
 * @param args {path:string,oldName:string,newName:string,isDirectory:boolean}
 * @returns 
 */
export function renameFile(args: { catalog: ICatalog, oldName: string, newName: string }, wProject: IProject): any {

    console.log("rename");
    console.log(args);
    var catalog = args.catalog;

    var pagesPath = getProjectFolderPath(wProject, "pages");
    var pt = catalog.path;
    var newPath = catalog.path.replace(args.oldName, args.newName);
    try {
        var p = path.join(pagesPath, pt);
        if (fs.existsSync(p)) {
            fs.renameSync(p, path.join(pagesPath, newPath));
        } else {
            catalog.path = newPath;
            newFile(catalog, wProject);
        }

    } catch (e) {
        console.log(e);
    }

}

/**
 * 
 * @param args {path:string,oldName:string,newName:string}
 * @returns 
 */
export function copyFile(args: any, wProject: IProject): any {

    console.log("copyFile");
    console.log(args);
    var pagesPath = getProjectFolderPath(wProject, "pages");
    //TODO
    var p = args.path;
    console.log(pagesPath);
    var file = path.join(pagesPath, p);
    var newPath = file.replace(args.oldName, args.newName);
    fs.copyFileSync(file, newPath);

}

/**
 * 
 * @param args {path:string,name:string,isDirectory:boolean}
 * @returns 
 */
export function deleteFile(args: any, wProject: IProject): any {

    var pagesPath = getProjectFolderPath(wProject, "pages");
    if (args.isDirectory) {
        var path = args.path;
        var folder = path.join(pagesPath, path);
        emptyFolder(folder);

    } else {

        var path = args.path;
        var file = path.join(pagesPath, path);
        fs.unlinkSync(file);

    }

}
export function deletePage(args: ICatalog, wProject: IProject): any {

    var pagesPath = getProjectFolderPath(wProject, "pages");
    if (args.children) {
        //TODO 删除目录
        var p = args.path;
        var folder = path.join(pagesPath, p);
        emptyFolder(folder);

    } else {
        //TODO 删除文件
        var p = args.path;
        var file = path.join(pagesPath, p);
        try {
            fs.unlinkSync(file);
        } catch (e) {
            console.log(e);
        }

    }

}



/**
 * 
 * @param args {path:string,name:string,isDirectory:boolean}
 * @returns 
 */
export function newFile(args: ICatalog, wProject: IProject): any {
    var pagesPath = getProjectFolderPath(wProject, "pages");
    var folderPath = path.join(pagesPath, args.dir);
    console.log("folderPath", folderPath);
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
    }

    if (args.children) {
        var p = args.path;
        var folder = path.join(pagesPath, p);
        fs.mkdirSync(folder);

    } else {
        var p = args.path;
        var file = path.join(pagesPath, p);
        const { width, height } = screen.getPrimaryDisplay().workAreaSize;
        var page: IPage = {
            type: "page",
            key: args.key,
            width: width,
            height: height,
            backgroundColor: "transparent",
            theme: readConfig().theme,
            children: [],
            modified: getNowDateTime(),
            name: args.name,
            path: p,
            canvases: [],
            dialogs: [],
            info: "",
            blues: [],
            blueLinks: [],
            guides: []
        };
        //加载模板
        if (args.template != undefined) {
            var templatePagePath = path.join(getAppFolderPath("templates"), "pages", args.template + ".json");
            if (fs.existsSync(templatePagePath)) {
                var templatePage = JSON.parse(fs.readFileSync(templatePagePath).toString());
                if (templatePage.children != undefined) {
                    page.children = templatePage.children;
                    page.blues = templatePage.blues;
                    page.blueLinks = templatePage.blueLinks;
                    page.theme = templatePage.theme;
                    page.backgroundColor = templatePage.backgroundColor;
                    
                }

            }


        }
        //写入文件
        fs.writeFileSync(file, JSON.stringify(page, null, 2));

    }
    return;

}
export function readPageCatalog(wProject: IProject): IPage[] {
    var pagesPath = getProjectFolderPath(wProject, "pages");
    var catalogs: IPage[] = [];
    fs.readdirSync(pagesPath).forEach(function (file) {
        readPagesFile(pagesPath, file, catalogs, wProject);
    })
    return catalogs;
}

/**
 * 
 * page内的path随目录变化
 * @param path 
 * @param file 
 * @param catalogs 
 */
function readPagesFile(p: string, file: string, catalogs: IPage[], wProject: IProject) {
    let curPath = path.join(p, file);
    if (fs.statSync(curPath).isFile()) {
        console.log("readPagesFile", curPath);
        var page = readPage(curPath);
        page.path = curPath.substring(getProjectFolderPath(wProject, "pages").length);
        page.name = file.replace(".json", "");
        catalogs.push(page);
    } else if (fs.statSync(curPath).isDirectory()) {
        fs.readdirSync(curPath).forEach(function (file) {
            readPagesFile(curPath, file, catalogs, wProject);
        })
    }
}
function readPage(file: string): IPage {
    return JSON.parse(fs.readFileSync(file).toString());

}

export function emptyFolder(p: string) {
    let files = [];
    if (fs.existsSync(p)) {
        files = fs.readdirSync(p);
        files.forEach((file, index) => {
            let curPath = path.join(p, file);
            if (fs.statSync(curPath).isDirectory()) {
                emptyFolder(curPath); //递归删除文件夹
            } else {
                fs.unlinkSync(curPath); //删除文件
            }
        });
        fs.rmdirSync(p);  // 删除文件夹自身
    }
}
export function readProject(wProject: IProject): any {
    //readProject
    var navPath = path.join(getProjectFolderPath(wProject), "project.json");
    var project = JSON.parse(fs.readFileSync(navPath).toString());
    project.work = getProjectFolderPath(wProject);
    project.path = wProject.path;
    project.type = wProject.type;
    return project;

}
export function saveProject(wProject: IProject): any {

    var p = path.join(getProjectFolderPath(wProject), "project.json");
    return fs.writeFileSync(p, JSON.stringify(wProject, null, 2));

}
export function getProjectFolderPath(project: any, folder?: "pages" | "images"): string {
    var work = path.join(app.getPath("home"), ".prototyping", "work");
    if (folder == undefined) {
        return path.join(work, project.name);
    } else if (folder == "pages") {
        return path.join(work, project.name, "pages");
    } else if (folder == "images") {
        var iPath = path.join(work, project.name, "images");
        if (!fs.existsSync(iPath)) {
            fs.mkdirSync(iPath);
        }
        return iPath;
    }
    return undefined;
}
export function getAppFolderPath(folder?: "plugins" | "src" | "map" | "client" | "markdown" | "templates"): string {

    var appPath = app.getAppPath();
    if (path.basename(appPath) == "dist") {
        if (folder == undefined) {
            return path.dirname(appPath);
        } else {
            var root = path.dirname(appPath);
            if (folder == "plugins") {
                return path.join(appPath, "plugins");
            } else if (folder == "src") {
                return path.join(root, "src");
            } else if (folder == "markdown") {
                return path.join(root, "markdown");
            } else if (folder == "map") {
                return path.join(root, "src", "map");
            } else if (folder == "client") {
                return path.join(root, "src", "client");
            } else if (folder == "templates") {
                return path.join(root, "templates");
            }
        }
    } else {
        if (folder == undefined) {
            return appPath;
        } else
            if (folder == "plugins") {
                return path.join(appPath, "dist", "plugins");//appPath + "/dist/plugins";
            } else if (folder == "src") {
                return path.join(appPath, "src");
            } else if (folder == "markdown") {
                return path.join(appPath, "markdown");
            } else if (folder == "map") {
                return path.join(appPath, "src", "map");
            } else if (folder == "client") {
                return path.join(appPath, "src", "client");
            } else if (folder == "templates") {
                return path.join(appPath, "templates");
            }
    }

    return undefined;
}

export function loadMapCatalog(): string[] {
    var folder = getAppFolderPath("map");
    //  console.log("loadPluginsComponent",componentsFolder);
    var result: string[] = [];
    if (fs.existsSync(folder)) {
        fs.readdirSync(folder).forEach(file => {
            if (file.endsWith(".json")) {
                var path = file;
                result.push(path);
            }

        })
    }
    return result;
}
export function loadMap(map: string): any {
    var file = path.join(getAppFolderPath("map"), map);
    return JSON.parse(fs.readFileSync(file).toString());
}

export function loadPluginsProperty(): string[] {
    var componentsFolder = path.join(getAppFolderPath("plugins"), "property");
    //  console.log("loadPluginsComponent",componentsFolder);
    var result: string[] = [];
    if (fs.existsSync(componentsFolder)) {
        fs.readdirSync(componentsFolder).forEach(file => {
            if (file.endsWith(".js")) {
                var path = "../plugins/property/" + file;
                result.push(path);
            }

        })
    }
    return result;
}
export function loadPluginsPanel(): string[] {
    var componentsFolder = path.join(getAppFolderPath("plugins"), "panel");
    //  console.log("loadPluginsComponent",componentsFolder);
    var result: string[] = [];
    if (fs.existsSync(componentsFolder)) {
        fs.readdirSync(componentsFolder).forEach(file => {
            if (file.endsWith(".js")) {
                var path = "../plugins/panel/" + file;
                result.push(path);
            }

        })
    }
    return result;
}
export function loadPluginsComponent(): string[] {
    var componentsFolder = path.join(getAppFolderPath("plugins"), "component");
    //  console.log("loadPluginsComponent",componentsFolder);
    var result: string[] = [];
    if (fs.existsSync(componentsFolder)) {
        fs.readdirSync(componentsFolder).forEach(file => {
            if (file.endsWith(".js")) {
                var path = "../plugins/component/" + file;
                result.push(path);
            }

        })
    }
    return result;
}
export function loadPluginsStyle(): string[] {
    var componentsFolder = path.join(getAppFolderPath("plugins"), "styles");
    //  console.log("loadPluginsComponent",componentsFolder);
    var result: string[] = [];
    if (fs.existsSync(componentsFolder)) {
        fs.readdirSync(componentsFolder).forEach(file => {
            if (file.endsWith(".js")) {
                var path = "../styles/" + file;
                result.push(path);
            }

        })
    }
    return result;
}

export function loadHtml(src: string): string {
    var file = path.join(getAppFolderPath("markdown"), src);
    console.log("markdown", file);
    if (fs.existsSync(file)) {
        return fs.readFileSync(file).toString();
    }
    return "";

}
export function saveImage(iPath: string, wProject: IProject, pageKey: string): string {

    var newName = getUUID() + path.extname(iPath);
    var imageFodler = getProjectFolderPath(wProject, 'images');
    if (!fs.existsSync(imageFodler)) {
        fs.mkdirSync(imageFodler);
    }
    if (pageKey == undefined) {
        newName = "cover" + path.extname(iPath);
        var newPath = path.join(imageFodler, newName);
        fs.copyFileSync(iPath, newPath);
        return newName;
    } else {
        var imagePageFolder = path.join(imageFodler, pageKey);
        if (!fs.existsSync(imagePageFolder)) {
            fs.mkdirSync(imagePageFolder);
        }
        var newPath = path.join(imagePageFolder, newName);
        fs.copyFileSync(iPath, newPath);
        return path.join(pageKey, newName);
    }

}

export function readDatabase(wProject: IProject) {

    //navPath
    var dPath = path.join(getProjectFolderPath(wProject), "database.json");
    return JSON.parse(fs.readFileSync(dPath).toString());

}
export function saveDatabase(database: IDatabase, wProject: IProject) {

    var dPath = path.join(getProjectFolderPath(wProject), "database.json");
    return fs.writeFileSync(dPath, JSON.stringify(database, null, 2));

}