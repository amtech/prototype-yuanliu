import { IComponent } from "../../common/interfaceDefine"

 const  component:IComponent={
    isTemplate: true, key: "grid", label: "grid", icon: "bi bi-grid", 
    type: "grid",group:"layout",drop:"component"
    ,style: "flex:1;background:transparent;min-height:34px;margin:5px;padding:5px;border-radius:5px;",
    onPreview: () => {
        var gird = document.createElement("div");
        return gird;
    }, onRender: () => {
        var gird = document.createElement("div");
        return {root:gird,content:gird};
    },
}
export default function load(){
    return component;
}