import { IBlueProperty, IComponent } from "../../common/interfaceDefine"

const component: IComponent = {
    isTemplate: true, key: "field", label: "field", icon: "bi bi-input-cursor", type: "field",
    style: "white-space: nowrap;display:flex;max-width:200px;cursor: pointer;font-size:13px;padding: 5px 10px 5px 10px;border-radius:5px;",
    onPreview: () => {
        var div = document.createElement("div");
        var label = document.createElement("div");
        label.innerText = component.property.label.context;
        div.appendChild(label);
        var button = document.createElement("input");

        button.value = "ABC";
        div.appendChild(button);
        return div;
    }, onRender: (component, element) => {
        var div: any;
        if (element != undefined)
            div = element;
        else
            div = document.createElement("div");
        div.innerHTML = "";
        var label = document.createElement("div");
        //兼容j旧版本
        if (component.property.label == undefined) {
            component.property.label = component.property[0];
        }
        if (component.property.value == undefined) {
            component.property.value = component.property[1];
        }
        //xin
        label.innerText = component.property.label.context + " ： ";
        div.appendChild(label);
        var button = document.createElement("input");
        button.type = "text";
        button.value = component.property.value.context;
        button.onchange = () => {
            component.property.value.context = button.value;
            if(component.blue.event.change.on!=undefined){
                component.blue.event.change.on(button.value);
            }
        }
        div.appendChild(button);
        return { root: div, content: div };
    }, property: {
        label: {
            label: "标签", type: "text", context: "标签"
        },
        value: {
            label: "值", type: "text", context: ""
        }
    }, blue: {
        event: {
            change: {label: "改变"}
        },
        property: {
            value: {
                label: "值", get: (comp: IComponent, self:IBlueProperty) => {
                    var div = document.getElementById(comp.key);
                    var input = div.getElementsByTagName("input")[0];
                    return input.value;
                }, set: (comp: IComponent, self:IBlueProperty, args: any) => {
                    var div = document.getElementById(comp.key);
                    var input = div.getElementsByTagName("input")[0];
                    input.value = args;
                }
            }
        }

    }
}
export default function load() {
    return component;
}