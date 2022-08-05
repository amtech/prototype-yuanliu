/*! *****************************************************************************
Copyright (c) taoyongwen. All rights reserved.

蓝图方法
***************************************************************************** */
import { getUUID } from "../common/interfaceDefine";
import { IBlue } from "../common/interfaceDefine";
import { IContextMenuItem } from "../common/contextmenu";
import { updateBlueView } from "./blueprint";
export const blueMethods:IBlue[]=[
    {
        component: "", key: getUUID(), name: "判断", icon: "bi bi-question", 
        events: [ { label: "True", name: "true", type: "out" }, { label: "False", name: "false", type: "out" }], type: "method",
        properties: [{ label: "输入", name: "in1", type: "in" }, { label: "阈值", name: "in2", type: "in" }], methods: []
    },
    {
        component: "", key: getUUID(), name: "加法", icon: "bi bi-plus-lg", 
        events: [], type: "method",
        properties: [{ label: "输入", name: "in", type: "in" }, { label: "输入", name: "threshold", type: "in" },{ label: "输出", name: "result", type: "out" } ], methods: [],
        
    },{
        component: "", key: getUUID(), name: "乘法", icon: "bi bi-x-lg", 
        events: [], type: "method",
        properties: [{ label: "输入", name: "in", type: "in" }, { label: "输入", name: "threshold", type: "in" }, { label: "输出", name: "result", type: "out" }], methods: []
    },{
        component: "", key: getUUID(), name: "拼接字符串", icon: "bi bi-plus-square-dotted",
        events: [], type: "method",
        properties: [{ label: "输入", name: "in", type: "in" }, { label: "输入", name: "threshold", type: "in" }, { label: "输出", name: "result", type: "out" }], methods: [],

    }

 ]
export function getBlueMethods():IContextMenuItem[]{
    var items:IContextMenuItem[]=[];
    blueMethods.forEach(blue=>{
        items.push( {
            label: blue.name, shorcut: "", onclick: (args, ele, e) => {
                blue.left= getX(e.clientX);blue.top= getY(e.clientY),
                args.push(blue);
                updateBlueView();
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