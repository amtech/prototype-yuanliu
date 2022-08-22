/*! *****************************************************************************
Copyright (c) taoyongwen. All rights reserved.

蓝图对象
***************************************************************************** */
import { getUUID } from "../common/interfaceDefine";
import { IBlue } from "../common/interfaceDefine";
import { IMenuItem } from "../common/contextmenu";
import { updateBlueView } from "./blueprint";
export const blueObjects:IBlue[]=[
    {
        component: "", key: getUUID(), name: "单变量", icon: "bi bi-123", 
        events: [], type: "variable", value: "0",
        properties: [{ label: "输出", name: "result", type: "out" }], methods: []
    }, {
        component: "", key: getUUID(), name: "矩阵变量", icon: "bi bi-grid-3x2-gap", 
        events: [], type: "matrix", value: "[0,1,2]",
        properties: [{ label: "输出", name: "result", type: "out" }], methods: []
    },
    {
        component: "window", key: getUUID(), name: "window", icon: "bi bi-window", 
        events: [], type: "window",
        properties: [{ label: "高度", name: "innerHeight", type: "out" },
        { label: "宽度", name: "innerWidth", type: "out" },
        { label: "scrollTop", name: "scrollTop", type: "out" },
        { label: "scrollLeft", name: "scrollLeft", type: "out" }
        ], methods: []
    },{
        component: "project", key: "blue_project_key", name: "项目", icon: "bi bi-projector",type: "project",
        events: [],
        properties: [{ label: "项目名称", name: "name", type: "out" }], methods: []
    },{
        component: "page", key: "blue_page_key", name: "页面", icon: "bi bi-file-earmark-richtext", type: "page",
        events: [{ label: "加载完成", name: "onload" }],
        properties: [{ label: "页面名称", name: "name", type: "out" },{ label: "页面位置", name: "path", type: "out" }], methods: []
    },{
        component: "hub", key: "blue_hub_key", name: "数据集", icon: "bi bi-signpost-split", type: "hub",
        events: [],
        properties: [{ label: "输入", name: "in", type: "in" },{ label: "输出", name: "out", type: "out" }], methods: []
    },{
        component: "link", key: "blue_hub_link", name: "外部链接", icon: "bi bi-link", type: "link",
        events: [],
        properties: [], methods: [
            { label: "打开", name: "open" }
        ]
    },{
        component: "upload", key: "blue_hub_link_upload", name: "上传Excel", icon: "bi bi-cloud-upload", type: "upload",
        events: [
            {label:"数据",name:"data"}
        ],
        properties: [], methods: [
            { label: "打开", name: "open" }
        ]
    },{
        component: "download", key: "blue_hub_link_download", name: "下载Excel", icon: "bi bi-cloud-download", type: "download",
        events: [],
        properties: [
            {label:"数据",name:"data"}
        ], methods: [
            { label: "打开", name: "open" }
        ]
    }
 ]
export function getBlueMethods():IMenuItem[]{
    var items:IMenuItem[]=[];
    blueObjects.forEach(blue=>{
        items.push( {
            id: getUUID(),
            label: blue.name, accelerator: "", onclick: () => {
                // blue.left= getX(e.clientX);blue.top= getY(e.clientY),
                // args.push(blue);
                // updateBlueView();
            }
        });
    });


    return items;


};
function getX(x: number): number {
    return x - 280;
}
function getY(y: number): number {
    return y - document.getElementById("page_view").clientHeight - 152;
}