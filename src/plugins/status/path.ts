import { IStatusBarActivity } from "../../common/interfaceDefine";

const path:IStatusBarActivity={
    title:"路径",
    position:"left",
    sort:2,
    onRender(acticity, config?, project?) {
    
    },
    onUpdate(acticity, config?, project?, page?, component?, selects?) {
        acticity.innerHTML="";
        if(component!=undefined){
            var i=document.createElement("i");
            i.className=component.icon;
            acticity.appendChild(i);
            i.style.paddingRight="4px";
            acticity.innerHTML+=component.path;
            acticity.style.fontSize="10px";
        
        }   
    },
}
export default path;