import { IComponent } from "../../common/interfaceDefine"

const component: IComponent = {
    isTemplate: true, key: "button", label: "button", icon: "bi bi-badge-tm", type: "button",
    style: "user-select: none;display:inline-block;cursor: pointer;font-size:13px;padding: 5px 20px 5px 20px;border: 1px solid var(--theme-color);border-radius: 5px;",
    onPreview: () => {
        var button = document.createElement("input");
        button.type = "button";
        button.value = "按钮";
        return button;
    }, onRender: (component, element, content, type) => {
        var label: HTMLElement;
        if (element != undefined)
            label = element;
        else
            label = document.createElement("div");
      
        //新的
        label.innerText = component.property.text.context;
        label.setAttribute("hover", "true");
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

        label.onclick = () => {
            if (component.blue.event.click.on != undefined) {
                component.blue.event.click.on();
            }

        }

        return { root: label, content: label };
    }, property: {
        text: {
            label: "文本", type: "text", context: "按钮"
        }
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