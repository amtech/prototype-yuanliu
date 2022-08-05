import { IBlueProperty, IComponent } from "../../common/interfaceDefine"

const component: IComponent = {
    isTemplate: true, key: "select", label: "select", icon: "bi bi-menu-button", type: "select",group: "base"
    , style: "display:inline-block;cursor: pointer;font-size:13px;padding: 5px 10px 5px 10px;border:1px solid rgba(157,157,115,0.5);border-radius:5px;",
    option:JSON.stringify([
        {
            text:"选项1",value:"select_1"
        }
    ],null,2),
    onPreview: () => {
        var button = document.createElement("select");
    
        var option = document.createElement("option");
        option.text = "选项1";
        option.selected = true;
        button.appendChild(option);
        return button;
    }, onRender: (component, element) => {
        var div: any;
        if (element != undefined)
            div = element;
        else
            div = document.createElement("div");
        
        div.innerHTML="";
        var select=document.createElement("select");
        div.appendChild(select);
     
        var options=JSON.parse(component.option);
        options.forEach((ele:any) => {

            var option = document.createElement("option");
            option.text =ele.text;
            option.value=ele.value;
           
            select.appendChild(option);
        });
       
        
        select.onchange = () => {
            component.property.value.context = select.value;
            if(component.blue.event.change.on!=undefined){
                component.blue.event.change.on(select.value);
            }
        }
        return { root: div, content: select };
    }, property: {
        value:{label:"值",type:"text",context:""} 
    }, blue: {
        event:{
            change:{
                label:"改变"
            }
        },
        property:{
            value:{
                label: "值", get: (comp: IComponent, self:IBlueProperty) => {
                    var ip: any = document.getElementById(comp.key);
                    return ip.value;
                }, set: (comp: IComponent, self:IBlueProperty, args:any) => {
                    var ip: any = document.getElementById(comp.key);
                    ip.value = args;
                }  
            }
        }
    }
}
export default function load() {
    return component;
}