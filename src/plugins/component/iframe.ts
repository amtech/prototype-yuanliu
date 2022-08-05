import { IBlueProperty, IComponent, renderPageByKey } from "../../common/interfaceDefine"

const component: IComponent = {
    isTemplate: true, key: "iframe", label: "iframe", icon: "bi bi-window", type: "iframe", group: "container",
    drop: "catalog",
    style: "flex:1;background:transparent;min-height:100px;margin:5px;padding:5px;border-radius:5px;",
    onPreview: () => {
        var gird = document.createElement("div");
        return gird;
    }, onRender: (component, element, content, type) => {
        var iframe = document.createElement("div");
        console.log("Iframe ",type,component);
        if (type == "product") {
            if (component.property.catalog.context != undefined && component.property.catalog.context.length > 0) {
                
                    
                renderPageByKey( component.property.catalog.context,iframe);
            
            }


        } else {


        }
        return { root: iframe, content: iframe };
    },
    option: "",
    property: {
        catalog: { label: "页面", type: "catalog" }
    },
    onDrop: (component: IComponent, caltalog: any) => {
        component.option = caltalog.key;
        component.property.catalog.context = caltalog.name;

    },
    blue: {
        property: {
            catalog: {
                label: "页面", get(comp: IComponent, self: IBlueProperty) {
                    return comp.option;
                }, set(comp: IComponent, self: IBlueProperty, args: any) {
                    comp.option = args;
                    var iframe = document.getElementById(comp.key);
                    { eval("renderPageByKey(\"" + comp.option + "\",iframe)"); }
                },

            }
        }
    }
}
export default function load() {
    return component;
}