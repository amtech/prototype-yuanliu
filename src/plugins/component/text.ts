import { IBlueProperty, IComponent } from "../../common/interfaceDefine"

const component: IComponent = {
    isTemplate: true, key: "text", label: "text", icon: "bi bi-input-cursor-text", type: "text",
    style: "cursor: pointer;font-size:13px;padding: 5px 10px 5px 10px;border:1px solid rgba(157,157,115,0.5);color:#000;border-radius:5px;",
    onPreview: () => {
        var button = document.createElement("input");
        button.type = "text";
        button.value = "ABC";
        return button;
    }, onRender: (component, element) => {
        var button: any;
        if (element != undefined)
            button = element;
        else
            button = document.createElement("input");
        button.type = "text";

        //兼容j旧版本
        if (component.property.text == undefined) {
            component.property.text = component.property[0];
        }
        //xin
        button.value = component.property.text.context;
        button.onChange = () => {
            component.property.text.context = button.value;
        }
        return { root: button, content: button };
    }, property: {
        text: {
            label: "文本", type: "text", context: "文本"
        }
    }, blue: {
        event: {
            change: {
                label: "改变", on: (comp: IComponent, action: (args: any) => void) => {

                }
            }
        },
        property: {
            value: {
                label: "值", get: (comp: IComponent, self: IBlueProperty) => {
                    var ip: any = document.getElementById(comp.key);
                    return ip.value;
                }, set: (comp: IComponent, self: IBlueProperty, args: any) => {
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