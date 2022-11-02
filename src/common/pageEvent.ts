import { pushHistory } from "../render/history";
import { updateBlueView } from "../render/blueprint";
import { activePropertyPanel } from "../render/propertypanel";
import { updateSidebar } from "../render/sidebar";
import { updateStatus } from "../render/statusBar";
import { IComponent, IPage } from "./interfaceDefine";

export function onOpenPage(page:IPage){


    requestIdleCallback(() => {
        //右侧面板
        activePropertyPanel("page");
        //状态栏
        updateStatus(page, undefined, undefined);
        updateSidebar({type:"page",data:page});
    });
    setTimeout(() => {
        //TODO  load
        //   renderPageViewF();
        //  switchFloatTab("页面");
        updateBlueView();//蓝图
        //历史记录
        pushHistory(page);
   }, 1000);
    
  
}

export function onSwitchPage(page:IPage){
    requestIdleCallback(() => {
          
        //右侧面板
        activePropertyPanel("page");
        //导航
        updateSidebar({type:"page",data:page});
        //状态栏
        updateStatus(page, undefined, undefined);

    });
    //更新右侧、底部面板
    setTimeout(() => {
       
        updateBlueView();//蓝图

    }, 1000);
    
}

