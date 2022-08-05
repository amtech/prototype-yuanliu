/*! *****************************************************************************
Copyright (c) taoyongwen. All rights reserved.

接口定义
***************************************************************************** */

/**
 * 项目
 */
export interface IProject {
    name: string;
    path: string;
    catalogs?: ICatalog[];
    work?: string;
    type?: "local" | "git",
    username?: string;
    password?: string;
    createDate?: string;
    updateDate?: string;
    author?: string;
    version?: string;
    description?: string;
    cover?: string;
    launch?:string;
    themeColor?:string;
}
/**
 * 组件
 */
export interface IComponent {
    key: string;
    label: string;
    hidden?: boolean;
    toogle?: (element: HTMLElement, hidden: boolean) => void;
    icon: string;
    rotate?: boolean;
    type?: string;
    option?: string;
    sort?: number;
    /**
     * 可接受拖拽的组价类型
     */
    drop?: "component" | "catalog";
    /**
     * 拖拽后调用
     */
    onDrop?: (component: IComponent, data: any) => void;
    children?: Array<IComponent>;
    style?: string;
    styles?: any;
    flex?: boolean;
    path?: string;
    isTemplate?: boolean;
    background?: number;
    /**
     *组件布局 是否是fxied
     */
    isFixed?: boolean;
    /**
     * 
     * 渲染子组件是回调
     * 
     * @param parent 
     * @param child 
     * @param index 
     * @param root 
     * @param body 
     */
    onChild?(parent:IComponent,child:IComponent,index:number,root:HTMLElement,body:HTMLElement):void;
    /**
     * 
     * 渲染组件
     * 
     * @param component 
     * @param element 
     * @param content 
     * @param type 
     */
    onRender?(component: IComponent, element: HTMLElement, content?: HTMLElement, type?: "design" | "product"): { root: HTMLElement, content: HTMLElement };
    /**
     * 
     * 渲染组件预览效果
     * 
     * @param omponent 
     */
    onPreview?(omponent?: IComponent): HTMLElement;
    /**
     * 是否已被删除
     */
    isRemoved?: boolean;
    /**
     * 组件分组
     */
    group?: "base" | "layout" | "chart" | "container"|"flow";
    /**{
     * 
     * name:IComponentProperty
     * 
     * }
     * 
     *export interface IComponentProperty {
        type: "text" | "select" | "number" | "bool" | "doc",
        label: string,
        context?: string
    }
    * 
    * */
    property?: any;
    /**
     * 组件项目模板，模板组件的key，每次渲染时子组件样式被赋值。
     */
    master?: string;
    /**
     * 组件蓝图
     */
    blue?: {
        /**{
       * 
       * name:IBlueEvent
       * 
       * }
       * 
       *export interface IBlueEvent {
            label: string;
            on?:(args:any)=>void
        }
       * 
       * */
        event?: any;
        /**{
       * 
       * name:IBlueMethod
       * 
       * }
       * 
       *export interface IBlueEvent{
        label:string;
        on:(comp:IComponent,action:(args:any)=>void)=>void;
        }
       * 
       * */
        method?: any;
        /**{
         * 
         * name:IBlueProperty
         * 
         * }
         * 
         * export interface IBlueProperty{
            label:string;
            get:(comp:IComponent)=>any;
            set:(comp:IComponent,args:any)=>any;
        }
         * 
         * */
        property?: any;
        properties?:(comp:IComponent)=>IBlueProperty[];
        
    },
    /**
     * 组件悬停时 展示的按钮组
     */
    edge?: { icon: string, label: string, onclick: (component: IComponent, item: any) => void }[];
   /**
    * 组件选中时，右侧需要展示的面板key
    */
    panel?:string;
}
export interface IBlueEvent {
    label: string;
    on?:(args:any)=>void
}
export interface IBlueMethod {
    label: string;
    fun: (comp: IComponent, args?: any) => void;
}
export interface IBlueProperty {
    label: string;
    key?:string;
    get: (comp: IComponent,self:IBlueProperty) => any;
    set: (comp: IComponent,self:IBlueProperty, args: any) => any;
}
/**
 * 项目属性
 */
export interface IComponentProperty {
    type: "text" | "select" | "number" | "bool" | "doc"|"component"|"catalog",
    label: string,
    context?: string
}
/**
 * 页面
 */
export interface IPage {
    type: "page" | "title";
    key: string;
    name: string,
    path?: string;
    width?: number;
    height?: number;
    backgroundColor?: string;
    theme: "light" | "dark";
    children?: IComponent[];
    modified?: string;
    dialogs?: IDialog[];
    canvases?: ICanvas[];
    info?: string;
    blues?: IBlue[];
    blueLinks?: IBlueLink[];
    guides?: IGuide[];
    style?: string;
    styles?: any;
    change?:boolean;

}
/**
 * 指引
 */
export interface IGuide {
    key: string;
    component: string;
    name?: string;
    icon?: string;
    context?: string;

}
/**
 * 目录
 */
export interface ICatalog {
    key: string;
    /**
     * 名称
     */
    name: string;
    /**
     * 完整路径
     */
    path?: string;
    /**
     * 所在文件夹路径
     */
    dir?: string;
    children?: ICatalog[];
    // page?:IPage;
    sort?: number;
}
/**
 * 对话框
 */
export interface IDialog {
    key: string;
    label: string;
    icon: string;
    style?: string;
    styles?: any;
    isRemoved?: boolean;
    component?: IComponent;
}
/**
 * 画布
 */
export interface ICanvas {
    key: string;
    label: string;
    icon: string;
    style?: string;
    styles?: any;
    isRemoved?: boolean;
}
/**
 * 蓝图 点
 */
export interface IBluePoint {
    name: string,
    label: string,
    type?: "out" | "in",
    value?: any;
    hidden?: boolean;
}
/**
 * 蓝图 
 */
export interface IBlue {
    component: string;
    key: string;
    type: "link" | "hub" | "page" | "project" | "component" | "method" | "variable" | "window" | "disabled" | "catalog" | "matrix" | "database"|"upload"|"download";
    name: string,
    icon?: string;
    events?: IBluePoint[];
    methods?: IBluePoint[];
    properties?: IBluePoint[];
    top?: number;
    left?: number;
    value?: string;

}
/**
 * 蓝图 链接
 */
export interface IBlueLink {
    key: string;
    from: {
        blue: string;
        component: string;
        type: "event" | "method" | "property";
        name: string;
    };
    to: {
        blue: string;
        component: string;
        type: "event" | "method" | "property";
        name: string;
    },
    position: {
        x0: number;
        y0: number;
        x1: number;
        y1: number;
    },
    tempPosition?: {
        x0: number;
        y0: number;
        x1: number;
        y1: number;
    },
    color?: string;
}
export function getUUID(): string {
    // import {v4 as uuid} from "uuid";
    const uuid = require("uuid");
    return "uuid_" + uuid.v4().replace(/-/g, "");
}
/**
 * 面板
 */
export interface IPanel {
    key: string;
    name: string;
    render?: (context: HTMLElement) => void;
    update?: (args?:any) => void;
    hidden?: boolean;
    sort: number;
}
/**
 * 标题
 */
export interface ITitle {
    display: boolean,
    background: string,
    page?: IPage;
}
/**
 * 数据
 */
export interface IDatabase {
    name: string;
    key: string;
    tables: ITable[];

}
/**
 * 表格
 */
export interface ITable {
    name: string;
    key: string;
    columns: IColumn[];
    data: any[];
}
/**
 * 表格列
 */
export interface IColumn {
    name: string;
    key: string;
}
/**
 * 扩展
 */
export interface IExtension {
    label: string;
    key: string;
    icon: string,
    installed?: boolean;
    count: number;
    cover:string;
    discription: string;
    version: string;
    author: string;
    readmeUrl: string;
    type:"component"|"image"|"style"|"group"

}
export interface IStyle {

}
export function renderPageByKey(a:any,b:any){

}