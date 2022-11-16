/*! *****************************************************************************
Copyright (c) taoyongwen. All rights reserved.

文本编辑器
***************************************************************************** */


export class Editor {
    editor: HTMLElement;
    width: number;
    height: number;
    lineHeight: number = 20;
    fontSize: number = 12;
    measure: HTMLElement;
    content: HTMLElement;
    lineCount: number = 0;
    lineIndex: number = 0;
    constructor(content: HTMLElement, onChange: (lines: string) => void, h?: number) {
        this.width = content.clientWidth;
        this.editor = document.createElement("div");
        this.editor.className = "editor form_bg";
        content.appendChild(this.editor);
        this.content = content;
        if (h != undefined) {
            this.height = h;
        } else {
            this.height = content.clientHeight;
        }
        this.onChange = onChange;
        this.layout();
    }
    navBar: HTMLElement;
    view: HTMLElement;
    textarea: HTMLTextAreaElement;
    composition: boolean = undefined;
    selectLine: HTMLDivElement;
    selectLineIndex: number = 0;
    selectIndex: number = 0;
    onChange: (lines: string) => void;
    isChanging: any;
    vscroll_thumb: HTMLElement;
    hscroll_thumb: HTMLElement;
    change() {
        if (this.onChange != undefined) {
            var lines = "";
            for (var i = 0; i < this.lines.length; i++) {
                var line = this.lines[i].value;
                lines += line + "\n";
            }
            if (this.isChanging != undefined) {
                clearTimeout(this.isChanging);
            }
            this.isChanging = setTimeout(() => {
                this.onChange(lines);
            }, 2000);
        }
    }
    resize() {
        if (this.content.clientHeight > 0) {
            this.width = this.content.clientWidth;
            this.height = this.content.clientHeight;
        }
        this.editor.style.height = this.height + "px";
        this.lineCount = Math.floor(this.height / this.lineHeight);
    }
    layout() {
        this.editor.style.overflow = "hidden";
        this.editor.style.height = this.height + "px";
        this.editor.style.borderRadius = "5px";
        var context = document.createElement("div");
        context.style.position = "relative";
        context.style.overflow = "hidden";
        context.style.height = "inherit";
        this.editor.appendChild(context);
        this.navBar = document.createElement("div");
        this.navBar.style.width = "32px";
        // this.navBar.style.background = "rgba(227,227,227)";
        this.navBar.style.position = "relative";
        this.navBar.style.zIndex = "100";
        this.navBar.style.userSelect = "none";
        this.navBar.style.height = "100%";
        context.appendChild(this.navBar);
        this.view = document.createElement("div");
        this.view.style.left = "32px";
        this.view.style.width = "100%";
        this.view.className = "editor-view";
        context.appendChild(this.view);
        var vScroll = document.createElement("div");
        vScroll.className = "editor_scrollV";
        vScroll.style.userSelect = "none";
        this.vscroll_thumb = document.createElement("div");
        this.vscroll_thumb.className = "editor_scrollV_thumb";
        vScroll.appendChild(this.vscroll_thumb);
        context.appendChild(vScroll);
        var hScroll = document.createElement("div");
        hScroll.className = "editor_scrollH";
        hScroll.style.userSelect = "none";
        this.hscroll_thumb = document.createElement("div");
        this.hscroll_thumb.className = "editor_scrollH_thumb";
        this.hscroll_thumb.style.left = "0px";
        hScroll.appendChild(this.hscroll_thumb);
        context.appendChild(hScroll);
        this.textarea = document.createElement("textarea");
        this.textarea.style.height = (this.lineHeight - 2) + "px";
        this.textarea.style.lineHeight = (this.lineHeight - 2) + "px";
        this.textarea.className = "view-textarea";
        this.textarea.style.fontSize = "12px";
        this.textarea.wrap = "off";
        this.textarea.autocapitalize = "off";
        this.textarea.autocomplete = "off";
        this.textarea.spellcheck = false;
        this.textarea.ariaMultiLine = "false";
        this.textarea.ariaHasPopup = "false";
        this.textarea.ariaSetSize = "false";
        this.textarea.style.fontFamily = "Arial, sans-serif";
        this.view.tabIndex = 100;
        this.view.appendChild(this.textarea);
        this.lineCount = Math.floor(this.height / this.lineHeight);
        this.view.onwheel = (e) => {
            e.stopPropagation();
            e.preventDefault();
            {
                //V
                if (this.lines.length <= 0)
                    return;
                this.lineIndex += Math.round(e.deltaY / 10);
                if (this.lineIndex + this.lineCount > this.lines.length) {
                    this.lineIndex = Math.round(this.lines.length - this.lineCount);
                }
                if (this.lineIndex < 0) {
                    this.lineIndex = 0;
                }
                this.render();
            } {
                //W
                var left = parseFloat(this.hscroll_thumb.style.left.replace("px", ""));
                var l = left + e.deltaX / 10;
                if (l < 0) {
                    l = 0;
                }
                var sroll_h_rate = (this.view.clientWidth - this.width - 32) / (this.width - 32 - this.hscroll_thumb.clientWidth);
                this.hscroll_thumb.style.left = l + "px";
                this.view.style.left = (-l * sroll_h_rate + 32) + "px";
            }

        }

        this.view.onkeydown = (e) => {
            e.stopPropagation();
            var wst = window.getSelection();
            if (wst.type == "Range") {
                var anchorNode: any = wst.anchorNode.parentElement;
                var anchorRow = parseInt(anchorNode.getAttribute("data-row"));
                var anchorLine = this.lines[anchorRow];
                var focusNode: any = wst.focusNode.parentElement;
                var focusRow = parseInt(focusNode.getAttribute("data-row"));
                var focusLine = this.lines[focusRow];
                var anchorOffset = wst.anchorOffset + 0;
                var focusOffset = wst.focusOffset + 0;
                if (e.key == "Backspace") {
                    if (anchorRow == focusRow) {
                        if (anchorOffset > focusOffset) {
                            var temp = focusOffset + 0;
                            focusOffset = anchorOffset + 0;
                            anchorOffset = temp + 0;
                        }
                        var line = this.lines[this.selectLineIndex];
                        line.value = line.value.substring(0, anchorOffset) + line.value.substring(focusOffset);
                        focusNode.innerHTML = this.toHtml(line.value);
                        this.selectLine = focusNode;
                        this.selectIndex = anchorOffset;
                        this.textareaPosition();
                        this.textarea.focus({
                            preventScroll: true
                        });
                        this.change();
                    } else if (anchorRow < focusRow) {

                        anchorLine.value = anchorLine.value.substring(0, anchorOffset) + focusLine.value.substring(focusOffset);
                        anchorNode.innerHTML = this.toHtml(anchorLine.value);
                        for (var i = anchorRow + 1; i <= focusRow; i++) {
                            this.lines.splice(anchorRow + 1, 1);
                        }
                        //删除行
                        var next = anchorNode.nextElementSibling;
                        while (next != undefined) {
                            var nextRow = next.getAttribute("data-row");
                            var _next = next.nextElementSibling;
                            next.remove();
                            if (nextRow == focusRow) {
                                break;
                            }
                            next = _next;
                        }
                        this.selectIndex = anchorOffset;
                        this.switchLine(anchorNode, anchorRow)
                        this.render();
                        this.textareaPosition();
                        this.textarea.focus({
                            preventScroll: true
                        });
                        this.change();
                    } else if (anchorRow > focusRow) {
                        focusLine.value = focusLine.value.substring(0, anchorOffset) + anchorLine.value.substring(focusOffset);
                        focusNode.innerHTML = this.toHtml(focusLine.value);
                        for (var i = focusRow + 1; i <= anchorRow; i++) {
                            this.lines.splice(focusRow + 1, 1);
                        }
                        //删除行
                        var next = focusNode.nextElementSibling;
                        while (next != undefined) {
                            var nextRow = next.getAttribute("data-row");
                            var _next = next.nextElementSibling;
                            next.remove();
                            if (nextRow == anchorRow) {
                                break;
                            }
                            next = _next;
                        }
                        this.selectIndex = focusOffset;
                        this.switchLine(focusNode, focusRow)
                        this.render();
                        this.textareaPosition();
                        this.textarea.focus({
                            preventScroll: true
                        });

                        this.change();
                    }
                }
            }
        }
        this.textarea.onkeydown = (e) => {
            e.stopPropagation();
            if (e.key == "Enter") {
                var line = this.lines[this.selectLineIndex];
                var text = "";
                if (this.selectIndex < line.value.length) {
                    text = line.value.substring(this.selectIndex);
                    line.value = line.value.substring(0, this.selectIndex);
                    this.selectLine.innerHTML = this.toHtml(line.value);
                }
                this.selectIndex = 0;
                this.lines.splice(this.selectLineIndex + 1, 0, {
                    key: this.getKey(), value: text
                });
                this.render();
                this.switchLine(undefined, this.selectLineIndex + 1);
                this.textareaPosition();
                this.change();
            } else if (e.key == "Backspace") {
                if (this.selectIndex == 0) {
                    var line = this.lines[this.selectLineIndex];
                    this.lines.splice(this.selectLineIndex, 1);
                    var old = line.value;
                    var upIndex = this.selectLineIndex - 1;
                    if (upIndex >= 0) {
                        var upLine = this.lines[upIndex];
                        this.selectIndex = upLine.value.length + 0;
                        upLine.value += old;
                
                        this.selectLineIndex = upIndex;
                        if (this.selectLineIndex < this.lineIndex) {
                            this.render();
                        } else {
                            var upLineDiv: any = this.selectLine.previousElementSibling;
                            this.selectLine.remove();
                            if (upLineDiv != undefined) {
                                upLineDiv.innerHTML = this.toHtml(upLine.value);
                                this.switchLine(upLineDiv, upIndex);
                            }
                            this.rows.splice(this.selectLineIndex - this.selectIndex, 1);
                            this.selectLine = upLineDiv;
                            this.textareaPosition();
                            this.render();
                        }
                        this.change();
                    }
                } else if (this.selectIndex > 0) {
                    this.selectIndex--;
                    var line = this.lines[this.selectLineIndex];
                    var v = line.value.substring(this.selectIndex, this.selectIndex + 1);
                    var a = line.value.substring(0, this.selectIndex);
                    var b = line.value.substring(this.selectIndex + 1);
                    line.value = a + b;
                    this.selectLine.innerHTML = this.toHtml(line.value);
                    this.textareaPosition();
                    this.change();
                }
            } else if (e.key == "ArrowRight") {

                if (this.selectIndex < this.selectLine.innerText.length) {
                    this.selectIndex++;
                }
                this.textareaPosition();
            } else if (e.key == "ArrowLeft") {

                if (this.selectIndex > 0) {
                    this.selectIndex--;
                }
                this.textareaPosition();

            } else if (e.key == "ArrowDown") {

                var next: any = this.selectLine.nextElementSibling;
                if (next != undefined) {
                    this.switchLine(next, this.selectLineIndex + 1);
                    this.textareaPosition();
                }

            } else if (e.key == "ArrowUp") {

                var up: any = this.selectLine.previousElementSibling;
                if (up != undefined) {
                    this.switchLine(up, this.selectLineIndex - 1);
                    this.textareaPosition();
                }

            } else if (e.key == "Tab") {
                e.preventDefault();
                setTimeout(() => {
                    this.insertValue("    ");
                }, 10);

            }
        };

        this.textarea.onkeyup = (e) => {

            if (e.key == "Enter" || e.key == "Backspace" || e.key == "ArrowRight" || e.key == "ArrowLeft"
                || e.key == "ArrowDown" || e.key == "ArrowUp" || e.key == "Tab") {
                this.textarea.value = "";
                return;
            }
            if (this.composition == undefined) {
                var text = this.textarea.value + "";
                this.textarea.value = "";
                this.insertValue(text);

            } else if (this.composition == false) {
                var text = this.textarea.value + "";
                //  
                this.textarea.value = "";
                this.insertValue(text, false);
                this.composition = undefined;

            } else if (this.composition == true) {

                var text = this.textarea.value + "";

                this.insertValue(text, true);
            }
            e.preventDefault();
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
        this.measure.style.width = "auto";
        this.measure.style.height = "0";
        this.measure.style.top = "-20px";
        this.view.appendChild(this.measure);
    }
    switchLine(newLine: HTMLDivElement, lineIndex: number) {
        if (this.selectLine != undefined && newLine != undefined && this.selectLine == newLine) {
            return;
        }
        if (newLine == undefined && lineIndex != undefined) {
            for (var i = 0; i < this.rows.length; i++) {
                var row: any = this.rows[i];
                if (parseInt(row.getAttribute("data-row")) == lineIndex) {
                    newLine = row;
                    break;
                }
            }
        }
        if (this.selectLine != undefined) {
            this.selectLine.removeAttribute("selected");
        }
        if (newLine != undefined) {
            newLine.setAttribute("selected", "true");
            this.selectLine = newLine;
        }

        if (lineIndex != undefined)
            this.selectLineIndex = lineIndex;

    }
    insertValue(text: string, isComposition?: boolean) {

        if (text.indexOf("\n") > 0) {
            var line = this.lines[this.selectLineIndex];
            var a = line.value.substring(0, this.selectIndex);
            var b = line.value.substring(this.selectIndex);
            var values = text.split("\n");
            line.value = a + values[0];
            this.selectLine.innerHTML = this.toHtml(line.value);

            for (var i = 1; i < values.length; i++) {
                var val = values[i];
                if (i == values.length - 1) {
                    val += b;
                }
                this.lines.splice(this.selectLineIndex + i, 0, {
                    key: this.getKey(), value: val
                });
            }
            this.render();
            this.change();

        } else {
            this.insertLineText(text, isComposition);
        }

    }
    compositionStart: number;
    compositionEnd: number;
    compositionLeft: number;
    insertLineText(text: string, isComposition?: boolean) {
        var start = this.selectIndex;
        var end = this.selectIndex;
        if (this.compositionStart != undefined && isComposition != undefined) {
            start = this.compositionStart;
            end = this.compositionEnd;
        }
        var line = this.lines[this.selectLineIndex];
        line.value = line.value.substring(0, start) +
            text + line.value.substring(end);

        this.selectLine.innerHTML = this.toHtml(line.value, true);
        this.selectIndex = start + text.length;
        if (isComposition) {
            this.compositionStart = start;
            this.compositionEnd = this.selectIndex;
        } else {
            this.compositionStart = undefined;
            this.compositionEnd = undefined;
        }
        this.textareaPosition();
        this.change();
    }
    lines: Array<{ key: string, value: string }>;
    keyIndex: number = 0;
    getKey(): string {
        this.keyIndex++;
        return this.keyIndex + "";
    }
    setValue(text: string) {
        this.lines = [];
        text.split("\n").forEach((line, row) => {
            this.lines.push({
                key: this.getKey(), value: line
            })
        })
        this.lineIndex = 0;
        this.adjustHscroll();
        this.render();
        this.textarea.style.display = "none";
    }
    adjustHscroll() {
        if (this.lines != undefined) {
            var maxL = 0;
            var maxText = "";
            this.lines.forEach((line) => {
                if (line.value.length > maxL) {
                    maxL = line.value.length;
                    maxText = line.value;
                }
            });
            var mw = this.measureText(maxText);
            var w = 0;
            if (mw > this.width - 32) {
                this.view.style.width = mw + "px";
                w = mw;
               
                this.hscroll_thumb.style.width = (this.width - 32) / (w) * (this.width - 32) + "px";
            } else {
                this.view.style.width = (this.width - 32) + "px";
                w = this.width - 32;
                this.hscroll_thumb.style.width ="0px";
            }
          
        }

    }

    rows: Array<HTMLElement>;
    render() {
        if (this.lines == undefined) return;
        if (this.rows == undefined) this.rows = [];


        var scroll_val = this.lineCount / (this.lines.length);
        if (scroll_val > 0.99) {
            this.vscroll_thumb.style.height = "0px";

        } else {
            this.vscroll_thumb.style.height = this.lineCount / (this.lines.length) * this.height + "px";
            this.vscroll_thumb.style.top = this.lineIndex / this.lines.length * this.height + "px";
        }


        var adds: Array<any> = [];
        var exits: Array<string> = [];
        this.view.style.top = (-this.lineIndex * this.lineHeight) + "px";
        this.view.style.height = (this.lines.length * this.lineHeight) + "px";
        for (var i = this.lineIndex; i < this.lineCount + this.lineIndex && i < this.lines.length; i++) {//
            var line = this.lines[i];
            var row;
            for (var j = 0; j < this.rows.length; j++) {
                var rowj = this.rows[j];
                if (rowj.getAttribute("key") == line.key) {
                    row = rowj;
                    break;
                }
            }
            if (row != undefined) {
                exits.push(line.key);
                row.style.top = (i) * this.lineHeight + "px";
                row.setAttribute("data-row", i + "");
                row = undefined;
            } else {
                adds.push({
                    index: i,
                    line: line
                });
            }
        }

        //删除多余的

        var wi = 0;
        while (wi < this.rows.length) {
            var ele = this.rows[wi];
            if ((exits.indexOf(ele.getAttribute("key"))) < 0) {
                ele.remove();
                this.rows.splice(wi, 1);
            } else {
                wi++;
            }
        }
        //增加新的
        adds.forEach((value, key) => {
            var index = value.index;
            var line = value.line;
            this.renderLine(line, index);
        });

        this.updateNav();


    }
    renderLine(line: { key: string, value: string }, index: number) {

        var top = index * this.lineHeight;

        var newLine = this.newLine(line.value, index);
        newLine.setAttribute("key", line.key);
        newLine.style.top = top + "px";
        this.view.appendChild(newLine);
        this.rows.push(newLine);
    }

    adjustTop() {

        var line: any = this.selectLine;
        var top = parseFloat(this.selectLine.style.top.replace("px", ""));
        var row = parseFloat(this.selectLine.getAttribute("data-row"));
        while (line != undefined) {
            row++;
            line.style.top = top + "px";
            line.setAttribute("data-row", row);

            line = line.nextElementSibling;
            top += this.lineHeight;
        }
    }

    measureText(text: string) {

        this.measure.innerHTML = this.toHtml(text);
        var w = this.measure.clientWidth;// window.getComputedStyle(this.measure).width;
        return w;//parseFloat(w.replace("px", ""));

    }
    updateNav() {

        var length = this.navBar.childElementCount;
        for (var i = length; i < this.lineCount; i++) {
            var line = document.createElement("div");
            // line.style.top = top + "px";
            line.style.height = (this.lineHeight) + "px";
            line.style.lineHeight = (this.lineHeight) + "px";
            line.className = "nav-num";
            line.style.fontSize = this.fontSize + "px";
            line.innerText = "";
            this.navBar.appendChild(line);
        }

        for (var i = this.lineIndex; i < this.lineCount + this.lineIndex && i < this.lines.length; i++) {//
            var num: any = this.navBar.children.item(i - this.lineIndex);
            num.innerText = (i + 1) + "";
        }
     

    }

    textareaPosition() {
       
        var line = this.lines[this.selectLineIndex];
       
        if (this.selectIndex >line.value.length) {
            this.selectIndex =line.value.length;
        }
        
        var left = this.measureText(line.value.substring(0, this.selectIndex)) - 1.5;
       
        this.textarea.style.left = left + "px";
        this.textarea.style.top = (parseFloat(this.selectLine.style.top.replace("px", "")) + 1) + "px";
        this.textarea.style.display = "block";
    }

    addLine(text: string, row: number) {

        var top = row * this.lineHeight;

        var newLine = this.newLine(text, row);
        newLine.style.top = top + "px";
        this.view.appendChild(newLine);
    }
    tansferWord(text:string):string{
        var html =text+ ""; 
        if (html.indexOf("\t") >= 0) {
            html = html.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
        }
        if (html.indexOf(" ") >= 0) {
            html = html.replace(/ /g, "&nbsp;");
        }
        return html;
    }
    toHtml(text: string, isHighLight?: boolean): string {
        var html = "";
        if (isHighLight) {
            //高亮显示
            // var m = text.match(/[a-z]+-?[a-z]*:/g);
            // if (m != undefined) {
            //     var lastIndex=0;
            //     for (var i = 0; i < m.length; i++) {
            //         var v = m[i];
            //         var index= text.indexOf(v);
            //         html+=this.tansferWord(text.substring(lastIndex,index))+"<span class='editor-css-heightlight'>"+v+"</span>";
            //         lastIndex=index+v.length;
            //     }
            //     {
            //         html+=this.tansferWord(text.substring(lastIndex,text.length));
            //     }


            // }else{
               
            // }
            html=this.tansferWord(text);

        }else{
            html=this.tansferWord(text);

        }

          

        return html;
    }
    newLine(text: string, row?: number) {

        if (row == undefined && this.selectLine != undefined) {
            parseInt(this.selectLine.getAttribute("data-row")) + 1;
        }
        var line = document.createElement("div");
        line.style.top = top + "px";
        line.setAttribute("data-row", row + "");
        line.style.height = (this.lineHeight - 2) + "px";
        line.style.lineHeight = (this.lineHeight - 2) + "px";
        line.className = "view-line";
        line.style.fontSize = this.fontSize + "px";
        line.innerHTML = this.toHtml(text, true);
        line.onmouseup = (e) => {
            e.stopPropagation();
            this.moving = false;
            var eRow = parseInt(line.getAttribute("data-row"));
            this.switchLine(line, eRow);
            var wst = window.getSelection();
       
            if (wst.type == "Range") {
                return;
            } else if (wst.type == "Caret") {
                var anchorOffset = wst.anchorOffset;
             
                this.selectIndex = anchorOffset;
                this.textareaPosition();
                setTimeout(() => {
                    this.textarea.focus({
                        preventScroll: true
                    });
                }, 10);
            }
        }
        line.onmousemove = (e) => {
            if (this.moving) {
                var wst = window.getSelection();

                if (wst.type == "Range") {
                    var eRow = parseInt(line.getAttribute("data-row"));
                    this.switchLine(line, eRow);
                    this.selectIndex = wst.focusOffset;
                    this.textareaPosition();

                }
            }


        }
        window.onmouseup = (e) => {
            this.moving = false;
        }
        line.onmousedown = (e) => {
            this.moving = true;

        }
        return line;
    }
    moving: boolean = false;
    init(content: HTMLElement) {



    }
}