import { IComponent } from "../../common/interfaceDefine"

 const  component:IComponent={
    isTemplate: true, key: "dialog", label: "dialog", icon: "bi bi-front", type: "dialog", drop:"component",group:"container",
        style: "",
        styles:{
            root:"background:rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;position:absolute;top:0;left:0;right:0;bottom:0;z-index:200;",
            main:"min-height:400px;min-width:500px;position:relative;border-radius:5px;",
         
        },
        onPreview: (component) => {
            var dialog = document.createElement("div");
            //TODO
            dialog.style.cssText=component.styles.root;
            

            var main=document.createElement("div");
            main.style.cssText=component.styles.main;
            dialog.appendChild(main);
            
        
            return dialog;
        }, onRender: (component, element,content,type) => {
            var dialog: any;
            if (element != undefined)
                dialog = element;
            else
                dialog = document.createElement("div");
            //TODO
            if(type=="product"){
                component.styles.root=component.styles.root.replace("position:absolute;","position:fixed;")
            }

          


            var main=document.createElement("div");
            main.setAttribute("data-styles","main");
            main.style.cssText=component.styles.main;
            
            dialog.appendChild(main);
            
       

            // //event
            // var close=document.createElement("i");
            // close.style.position="absolute";
            // close.className="bi bi-x";
            // close.style.right="5px";
            // close.style.top="5px";
            // close.style.zIndex="1000";
            // main.appendChild(close);
            // close.onclick=()=>{
            //     dialog.style.display="none";
            //     component.hidden=true;
            // }
          
            return {root:dialog,content:main};
        }, property: [
        
        ]
        , toogle: ( element,hidden) => {
           console.log("dialog toogle");
            //TODO
            if(hidden){
                element.style.display="none";
            }else{
                element.style.display="flex";
            }

          
        }, 
        blue:{
          
        }
}
export default function load(){
    return component;
}