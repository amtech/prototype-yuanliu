/*! *****************************************************************************
Copyright (c) taoyongwen. All rights reserved.

文本编辑器
***************************************************************************** */

export class Editor {
    editor: HTMLElement;
    width: number;
    height: number;
    lineHeight: number = 18;
    fontSize: number = 12;
    measure: HTMLElement;
    content:HTMLElement;

    constructor(content: HTMLElement, onChange: (lines: string) => void,h?:number) {

        this.editor = document.createElement("div");
        this.editor.className="editor form_bg";
        content.appendChild(this.editor);
        this.content=content;
        this.width = content.clientWidth;
       
        if(h!=undefined){
            this.height = h;
        }else{
            this.height = content.clientHeight;
        }
        this.onChange = onChange;

        this.layout();

    }
    navBar: HTMLElement;
    view: HTMLElement;
    textarea: HTMLTextAreaElement;
    composition: boolean = false;
    selectLine: HTMLDivElement;
    selectIndex: number = 0;
    onChange: (lines: string) => void;
    change() {

        if (this.onChange != undefined) {
            var lines = "";
            for (var i = 2; i < this.view.childElementCount; i++) {
                var line = this.view.children.item(i).textContent;
                lines += line + "\n";
            }
            this.onChange(lines);
        }

    }
    resize(){
        if(this. content.clientHeight>0){
            this.width =this. content.clientWidth;
            this.height =this. content.clientHeight;
        }
        this.editor.style.height = this.height + "px";
    }
    layout() {

        this.editor.style.overflow = "auto";
        this.editor.style.height = this.height + "px";
        this.editor.style.borderRadius="5px";


        var context = document.createElement("div");
        context.style.display = "flex";
        context.style.padding="5px 5px 5px 0px";
        this.editor.appendChild(context);

        this.navBar = document.createElement("div");
        this.navBar.style.width = "32px";
        this.navBar.style.position = "relative"
        context.appendChild(this.navBar);

        this.view = document.createElement("div");
        this.view.style.flex = "1";
        this.view.className = "editor-view";

        context.appendChild(this.view);

        this.textarea = document.createElement("textarea");
        this.textarea.style.height = "18px";
        this.textarea.style.lineHeight = "18px";
        this.textarea.className = "view-textarea";
        this.textarea.style.fontSize = "12px";
        this.textarea.wrap = "off";
        this.textarea.autocapitalize = "off";
        this.textarea.autocomplete = "off";
        this.textarea.spellcheck = false;
        this.textarea.ariaMultiLine = "false";
        this.textarea.ariaHasPopup = "false";
        this.textarea.ariaSetSize = "false";


        this.view.tabIndex=100;
        this.view.appendChild(this.textarea);


        this.view.onkeydown = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            var wst=window.getSelection();
            
            if(wst.type=="Range"){
                var anchorNode:any=wst.anchorNode.parentElement;
                var anchorRow=parseInt(anchorNode.getAttribute("data-row"));
                var focusNode:any=wst.focusNode.parentElement;
                var focusRow=parseInt(focusNode.getAttribute("data-row"));
                var anchorOffset=wst.anchorOffset+0;
                var focusOffset=wst.focusOffset+0;
              
                if(e.key=="Backspace"){
                    if(anchorRow==focusRow){
                        if(anchorOffset>focusOffset){
                            var temp=focusOffset+0;
                            focusOffset=anchorOffset+0;
                            anchorOffset=temp+0;
                        }
                        focusNode.innerText=focusNode.innerText.substring(0,anchorOffset)+focusNode.innerText.substring(focusOffset);
                        this.selectLine=focusNode;
                        this.selectIndex=anchorOffset;
                 
                        this.textareaPosition();
                        this.textarea.focus({
                            preventScroll:true
                        });
                        this.change();
                    }else if(anchorRow<focusRow){

                        anchorNode.innerText=anchorNode.innerText.substring(0,anchorOffset)+focusNode.innerText.substring(focusOffset);
                        //删除行
                        var next=anchorNode.nextElementSibling;
                        while(next!=undefined){
                            var nextRow=next.getAttribute("data-row");
                            var _next=next.nextElementSibling;
                            next.remove();

                            if(nextRow==focusRow){
                                break;
                            }
                            next=_next;
                        }
                        
                        this.selectLine=anchorNode;
                        this.selectIndex=anchorOffset;
                        this.textareaPosition();
                        this.textarea.focus({
                            preventScroll:true
                        });
                        this.adjustTop();
                        this.change();
                    }else if(anchorRow>focusRow){

                        focusNode.innerText=focusNode.innerText.substring(0,anchorOffset)+anchorNode.innerText.substring(focusOffset);
                        //删除行
                        var next=focusNode.nextElementSibling;
                        while(next!=undefined){
                            var nextRow=next.getAttribute("data-row");
                            var _next=next.nextElementSibling;
                            next.remove();
                            if(nextRow==anchorRow){
                                break;
                            }
                            next=_next;
                        }
                        
                        this.selectLine=focusNode;
                        this.selectIndex=focusOffset;
                        this.textareaPosition();
                        this.textarea.focus({
                            preventScroll:true
                        });
                        this.adjustTop();
                        this.change();
                        

                    }


                }
            }
            console.log(e.key);
        }


        this.textarea.onkeydown = (e) => {
       
            if (e.key == "Enter") {
                e.preventDefault();
                var text = "";
                if (this.selectIndex < this.selectLine.innerText.length) {
                    text = this.selectLine.innerText.substring(this.selectIndex);
                    this.selectLine.innerText = this.selectLine.innerText.substring(0, this.selectIndex);
                }
                this.selectIndex = 0;
                var newLine = this.newLine(text);
                this.selectLine.insertAdjacentElement("afterend", newLine);

                this.adjustTop();
                this.switchLine(newLine);
               
                this.textareaPosition();
                this.updateNav();
                this.change();

            } else if (e.key == "Backspace") {
                e.preventDefault();
                if (this.selectIndex == 0) {
               
                    var old = this.selectLine.innerText;
                    var up: any = this.selectLine.previousElementSibling;
                    if (up != undefined) {
               
                        this.selectIndex = up.innerText.length;
                        up.innerText += old;
                        this.selectLine.remove();
                        this.selectLine = up;
                        this.selectLine.setAttribute("selected","true");
                        this.textareaPosition();
                        this.adjustTop();
                        this.updateNav();
                        this.change();
                    }

                } else if (this.selectIndex > 0) {

                    this.selectIndex--;
                    var v = this.selectLine.innerText.substring(this.selectIndex, this.selectIndex + 1);
                    var a = this.selectLine.innerText.substring(0, this.selectIndex);
                    var b = this.selectLine.innerText.substring(this.selectIndex + 1);
                    this.selectLine.innerText = a + b;
                    this.textareaPosition();
                    this.change();


                }
            } else if (e.key == "ArrowRight") {
                e.preventDefault();
                if (this.selectIndex < this.selectLine.innerText.length) {
                    this.selectIndex++;
                }
                this.textareaPosition();
            } else if (e.key == "ArrowLeft") {
                e.preventDefault();
                if (this.selectIndex > 0) {
                    this.selectIndex--;
                }
                this.textareaPosition();

            } else if (e.key == "ArrowDown") {
                e.preventDefault();
                var next: any = this.selectLine.nextElementSibling;
                if (next != undefined) {
     
                    this.switchLine(next);
                    this.textareaPosition();
                }

            } else if (e.key == "ArrowUp") {
                e.preventDefault();
                var up: any = this.selectLine.previousElementSibling;
                if (up != undefined) {
                
                    this.switchLine(up);
                    this.textareaPosition();
                }

            } else if (e.key == "Tab") {
                
                e.preventDefault();
                e.stopPropagation();
                setTimeout(() => {
                    this.insertValue("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
                }, 10);

            }
        };

        this.textarea.onkeyup = (e) => {
            if (e.key == "Enter" || e.key == "Backspace" || e.key == "ArrowRight" || e.key == "ArrowLeft"
                || e.key == "ArrowDown" || e.key == "ArrowUp" || e.key == "Tab") {
                this.textarea.value = "";
                e.stopPropagation();
                return;
            }
            if (!this.composition) {
            
                var text = this.textarea.value;
                this.insertValue(text);

            }


        }
        this.textarea.addEventListener("compositionstart", () => {
        
            this.composition = true;
        });
        this.textarea.addEventListener("compositionend", () => {
          
            this.composition = false;
        });



        this.measure = document.createElement("div");
        this.measure.className = "view-line";
        this.measure.style.fontSize = this.fontSize + "px";
        this.measure.style.letterSpacing = "0px";
        this.measure.style.width = "auto";
        this.measure.style.height = "0";
        this.measure.style.overflow = "hidden";
        this.view.appendChild(this.measure);



    }
    switchLine(newLine:HTMLDivElement){
        if(this.selectLine ==newLine){
            return;
        }
        if(newLine!=undefined){
            newLine.setAttribute("selected","true");
        }
        if(this.selectLine!=undefined){
            this.selectLine.removeAttribute("selected");
        }
        this.selectLine = newLine;

    }
    insertValue(text: string) {

        if(text.indexOf("\n")>0){
            var a=this.selectLine.innerText.substring(0,this.selectIndex);
            
            var b=this.selectLine.innerText.substring(this.selectIndex);
            this.selectLine.innerHTML=this.selectLine.innerHTML.substring(0,this.selectLine.innerHTML.length-a.length);

            var values=text.split("\n");
            this.insertLineText(values[0]);
            for(var i=1;i<values.length;i++){
                var val=values[i];
                this.selectIndex = 0;
                var newLine = this.newLine(val);
                this.selectLine.insertAdjacentElement("afterend", newLine);
                this.adjustTop();
                this.selectLine = newLine;
               
               
            }
            this.selectLine.innerText+=b;
            this.textareaPosition();
            this.updateNav();
            this.change();
            
        }else{
            this.insertLineText(text);
        }
       
    }
    insertLineText(text: string){
        var l = this.measureText(text);
        var left = parseFloat(this.textarea.style.left.replace("px", ""));
     
        this.textarea.value = "";
        left += l;
        this.textarea.style.left = (left-1) + "px";
        this.selectLine.innerHTML = this.selectLine.innerText.substring(0, this.selectIndex) +
            text + this.selectLine.innerText.substring(this.selectIndex);
        this.selectIndex+=text.length;
        this.change();
    }
    setValue(text: string) {
       
        this.view.innerHTML="";
        this.selectLine=undefined;
        this.selectIndex=0;
        this.textarea.style.display="none";
        this.view.appendChild(this.textarea);
        this.view.appendChild(this.measure);
        var lines = text.split("\n");
        lines.forEach((line, row) => {
            this.addLine(line, row);
        })
        this.updateNav();

    }

    adjustTop() {
     
        var line: any = this.selectLine;
        var top = parseFloat(this.selectLine.style.top.replace("px", ""));
        var row = parseFloat(this.selectLine.getAttribute("data-row"));
        while (line != undefined) {
            row++;
            line.style.top = top + "px";
            line.setAttribute("data-row",row);

            line = line.nextElementSibling;
            top += this.lineHeight;
         


        }


    }

    measureText(text: string) {
                this.measure.innerHTML = text;
        var w = window.getComputedStyle(this.measure).width;
   
        return parseFloat(w.replace("px", ""));

    }
    updateNav() {
        var lines = this.view.childElementCount - 2;
        this.navBar.innerHTML = "";
        for (var i = 0; i < lines; i++) {
            var top = i * this.lineHeight;
            var line = document.createElement("div");
            line.style.top = top + "px";
            line.style.height = this.lineHeight + "px";
            line.style.lineHeight = this.lineHeight + "px";
            line.className = "nav-num";
            line.style.fontSize = this.fontSize + "px";
            line.style.letterSpacing = "0px";
            line.innerText = i + "";
            this.navBar.appendChild(line);

        }

    }

    textareaPosition() {
        if (this.selectIndex > this.selectLine.innerText.length) {
            this.selectIndex = this.selectLine.innerText.length;
        }
        var left = this.measureText(this.selectLine.innerText.substring(0, this.selectIndex))-1;
        this.textarea.style.left = left + "px";
        this.textarea.style.top = this.selectLine.style.top;
    }

    addLine(text: string, row: number) {

        var top = row * this.lineHeight;

        var newLine = this.newLine(text,row);
        newLine.style.top = top + "px";
        this.view.appendChild(newLine);
    }
    newLine(text: string,row?:number) {

        if(text.indexOf("\t")>=0){
            text=text.replace(/\t/g,"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
        }
        if(text.indexOf("  ")>=0){
            text=text.replace(/ /g,"&nbsp;&nbsp;");
        }
        if(row==undefined&&this.selectLine!=undefined){
            parseInt(this.selectLine.getAttribute("data-row"))+1;

        }

        var line = document.createElement("div");
        line.style.top = top + "px";
        line.setAttribute("data-row",row+"");
        line.style.height = this.lineHeight + "px";
        line.style.lineHeight = this.lineHeight + "px";
        line.className = "view-line";
        line.style.fontSize = this.fontSize + "px";
        line.style.letterSpacing = "0px";
        line.innerHTML = text;

        line.onmouseup=(e)=>{
            e.stopPropagation();
            this.moving=false;
            this.switchLine(line);
            var wst=window.getSelection();
            
            if(wst.type=="Range"){
              
                return;
            }
            var lineLength = this.measureText(line.innerText);
            var left = 0;
            if (e.offsetX < this.fontSize / 2) {
                left = 0;
            } else
                if (e.offsetX > lineLength) {
                    left = lineLength;
                } else {
                    left = e.offsetX;
                    if (line.innerText.length == 0) {
                        left = 0;
                    } else {
                        for (var i = line.innerText.length; i >= 0; i--) {
                            var l = this.measureText(line.innerText.substring(0, i));
                           
                            if (e.offsetX < l) {
                                left = l;
                            } else {
                                break;
                            }
                            this.selectIndex = i;
                            if (i == 0) {
                                left = 0;
                            }


                        }
                    }

                }

      
            this.textarea.style.top = line.style.top;
            this.textarea.style.left = (left-1) + "px";
            this.textarea.style.display="block";
            setTimeout(() => {
                this.textarea.focus({
                    preventScroll:true
                });
                //       this.textarea.setSelectionRange(0,0);
            }, 10);


        }
        line.onmousemove=(e)=>{
            if(this.moving&&window.getSelection().toString().length>0){

                this.textarea.style.top = line.style.top;
               
                this.textarea.style.pointerEvents="none";
                var left=0;
                for (var i = line.innerText.length; i >= 0; i--) {
                    var l = this.measureText(line.innerText.substring(0, i));
               
                    if (e.offsetX < l) {
                        left = l;
                    } else {
                        break;
                    }
                    this.selectIndex = i;
                    if (i == 0) {
                        left = 0;
                    }
                }
                this.textarea.style.left =(left-1) + "px";
                this.textarea.style.display="block";
            }

        }
        window.onmouseup=(e)=>{
            this.moving=false;
        }

        line.onmousedown = (e) => {
            this.moving=true;
            this.textarea.style.pointerEvents="all";
        }
        return line;
    }
    moving:boolean=false;
    init(content: HTMLElement) {



    }
}