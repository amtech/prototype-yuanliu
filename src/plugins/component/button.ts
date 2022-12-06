
import { IComponent } from "../../common/interfaceDefine"

const component: IComponent = {
    isTemplate: true, key: "button", label: "button", icon: "bi bi-badge-tm", type: "button",
    style: "user-select: none;display: inline-block; cursor:pointer;font-size:13px;padding: 5px 10px 5px 10px;border: 1px solid var(--theme-color);border-radius: 5px;",
    drop: "component",
    onDrop(component, data) {
        if (data != undefined) {
            if (data.type == "icon") {
                component.property.icon.context = data.icon;
                component.onRender(component, document.getElementById(component.key));
            }
        }
        console.log(data);
    },
    onPreview: () => {
        var button = document.createElement("input");
        button.type = "button";
        button.value = "按钮";
        return button;
    }, onRender: (component, element, content, type) => {
        var button: HTMLElement;

        if (element != undefined) {
            button = element;
            button.innerHTML = "";
        }

        else
            button = document.createElement("div");

        var bg = document.createElement("div");
        bg.className = "component_bg";
        button.appendChild(bg);
        var body = document.createElement("div");
        body.className = "component_body";
        body.style.display = "flex";
        body.style.alignItems = "center";
        button.appendChild(body);

        if (component.property.icon != undefined && component.property.icon.context.length > 1) {
            var icon = document.createElement("i");
            icon.className ="bi bi-"+component.property.icon.context;
            icon.style.paddingRight = "5px";
            body.appendChild(icon);
        }

        var label = document.createElement("div");
        body.appendChild(label);
        //新的
        label.innerText = component.property.text.context;
        if (type == "product") {
            button.setAttribute("hover", "true");
            button.setAttribute("active", "true");
        }


        if (type != "product") {
            label.ondblclick = () => {
                var input = document.createElement("input");
                input.type = "text";
                input.value = component.property.text.context;
                input.onkeydown = (ky) => {
                    ky.stopPropagation();
                }
                label.innerHTML = "";
                label.appendChild(input);
                input.onchange = () => {
                    component.property.text.context = input.value;
                }
                input.style.minWidth = "60px";
                input.onkeydown = (e) => {
                    e.stopPropagation();
                }
                input.focus();
                input.onclick = (oc) => {

                    oc.stopPropagation();
                }
                input.ondblclick = (oc) => {
                    oc.stopPropagation();
                }
                input.onblur = () => {
                    input.remove();
                    label.innerHTML = component.property.text.context;
                }

            }
        }

        button.onclick = () => {
            if (component.blue.event.click.on != undefined) {
                component.blue.event.click.on();
            }

        }

        return { root: button, content: button };
    }, property: {
        text: {
            label: "文本", type: "text", context: "按钮"
        },
        icon: {
            label: "图标", type: "text", context: ""
        },
    },
    blue: {
        event: {
            click: {
                label: "单击"
            }
        }
    }
}
export default function load() {
    return component;
}