import { IComponent } from "../../common/interfaceDefine"

 const  component:IComponent={
    isTemplate: true, key: "grid", label: "grid", icon: "bi bi-grid", 
    type: "grid",group:"layout",drop:"component"
    ,style: "flex:1;background:transparent;min-height:34px;margin:5px;padding:5px;border-radius:5px;",
    onPreview: () => {
        var gird = document.createElement("div");
        return gird;
    }, onRender: (component:IComponent) => {
        var gird = document.createElement("div");

        if(component.property!=undefined&&component.property.isHost!=undefined&&component.property.isHost.context=="true"){

            gird.onmouseover=()=>{
                gird.style.backgroundColor="rgba(175,175,175,0.2)";
                gird.style.cursor="pointer";

            };
            gird.onmouseleave=()=>{

                gird.style.cssText=component.style;
            }
            gird.onclick = () => {
                if (component.blue.event.click.on != undefined) {
                    component.blue.event.click.on();
                }
    
            }
    

       //     gird.setAttribute("data-hot",component.property.isHost.context);

        }
    
        return {root:gird,content:gird};
    },
    property: {
        isHost: { label: "热区", type: "bool", context: "false", },
    
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