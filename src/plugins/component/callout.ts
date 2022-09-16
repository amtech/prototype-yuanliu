import { IComponent } from "../../common/interfaceDefine"

 const  component:IComponent={
    isTemplate: true, key: "callout", label: "callout", icon: "bi bi-chat-square", 
    type: "callout",group:"layout",drop:"component",
    styles:{
        "root":"min-height:100px;min-width:200px;padding:10px;border-radius:5px;box-shadow:0px 0px 5px rgba(157,157,157,0.5);position:fixed;z-index:100;",
        "main":"",
        "break":""
    },
    onPreview: () => {
        var callout = document.createElement("div");
        return callout;
    }, onRender: (component:IComponent,element:HTMLElement) => {
        var callout:HTMLElement= null;
        if(element!=undefined){
            callout=element;
            callout.innerHTML="";
        }else
        callout = document.createElement("div");

        callout.innerHTML="callout";

        if(component.property.position.context.length>0){
            var target=document.getElementById(component.property.position.context);
            if(target!=undefined){
                var left=target.getBoundingClientRect().left;
                var top=target.getBoundingClientRect().top+target.clientHeight+5;
                console.log("callout",left,top);
                setTimeout(() => {
                    callout.style.left=left+"px";
                    callout.style.top=top+"px"
                }, 100);
           

            }


        }

     
    
        return {root:callout,content:callout};
    },
    property: {
        position: { label: "位置", type: "component", context: "" },
    
    },
    blue: {
        event: {
            click: {
                label: "单击"
            }
        }
    }
}
export default function load(){
    return component;
}