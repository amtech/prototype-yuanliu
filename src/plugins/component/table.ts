import { IBlueProperty, IComponent } from "../../common/interfaceDefine"

const component: IComponent = {
    isTemplate: true, key: "table", label: "table", icon: "bi bi-table", type: "table",

    styles: {
        root: "position:absolute;width:100%;text-align:center;border-top: 1px dashed rgba(175,175,175,0.5);border-left: 1px dashed rgba(175,175,175,0.5);",
        th: "padding: 5px;border-bottom: 1px dashed rgba(175,175,175,0.5);border-right: 1px dashed rgba(175,175,175,0.5);min-width:32px; font-size:14px;",
        td: "padding: 5px;border-bottom: 1px dashed rgba(175,175,175,0.5);border-right: 1px dashed rgba(175,175,175,0.5);min-width:32px; font-size:13px;",
    },
    option: JSON.stringify([
        ["序号", "名称", "数值"],
        [1],
        [2],
        [3],
    ], null, 2),
    onPreview: () => {
        var table = document.createElement("div");

        var thead = document.createElement("div");
        thead.style.height = '40px';
        thead.style.width = '400px';
        thead.style.backgroundColor = "#07b";

        var tbody = document.createElement("div");
        tbody.style.height = '200px';
        tbody.style.width = '400px';
        tbody.style.backgroundColor = "#09f";
        table.appendChild(thead);
        table.appendChild(tbody);

        table.style.opacity = "0.7";
        return table;
    }, onRender: (component, element) => {
        var body: any;
        if (element != undefined)
            body = element;
        else
            body = document.createElement("div");

        body.innerHTML = "";
        var table=document.createElement("table");
        table.style.width="max-content";
        body.appendChild(table);
        var data = JSON.parse(component.option);
        var thead = document.createElement("thead");
        var tbody = document.createElement("tbody");
        // console.log(component.property);
     
        var showHead = component.property.hasHead.context == "true";
        var mul = component.property.hasMul.context == "true";
        var colNum = 0;

        for (var i = 0; i < data.length; i++) {
            var row = data[i];

            if (showHead && i == 0) {
                if (mul) {
                    var th = document.createElement("th");
                    th.style.cssText = component.styles.th;
                    th.setAttribute("data-styles", "th")
                    th.style.width = "32px";
                    thead.appendChild(th);
                    var check = document.createElement("input");
                    check.type = "checkbox";
                    check.setAttribute("data-row", i + "");
                    check.onclick = () => {
                        //    var  checks= table.getElementsByTagName("input");
                        //    for(var  c=0;c<checks.length;c++){
                        //         var ch=checks[c];
                        //             ch.checked="true";
                        //    }
                    };
                    th.appendChild(check);
                }
                var rowColNums = 0;
                row.forEach((col: any) => {
                    var th = document.createElement("th");
                    if (typeof (col) == "object") {

                        th.innerHTML = col.v + "";

                        if (col.c != undefined) {
                            th.colSpan = col.c;
                            rowColNums += parseInt(col.c);
                        }
                        if (col.r != undefined) {
                            th.rowSpan = col.r;
                        }


                    } else {
                        rowColNums++;
                        th.innerHTML = col + "";

                    }
                    th.style.cssText = component.styles.th;
                    th.setAttribute("data-styles", "th")
                    thead.appendChild(th);


                });
                if (colNum < rowColNums)
                    colNum = rowColNums;



            } else {

                var tr = document.createElement("tr");
               // tr.setAttribute("hover","true");
                if (mul) {
                    var td = document.createElement("td");
                    td.style.cssText = component.styles.td;
                    td.style.width = "32px";
                    var check = document.createElement("input");
                    check.type = "checkbox";
                    check.setAttribute("data-row", i + "");
                    check.onclick = () => {

                    };
                    td.appendChild(check);
                    td.setAttribute("data-styles", "td")
                    tr.appendChild(td);
                }
                var rowColNums = 0;
                row.forEach((col: any) => {
                    var td = document.createElement("td");
                    if (typeof (col) == "object") {
                        td.innerHTML = col.v + "";
                        if (col.c != undefined) {
                            td.colSpan = col.c;
                            rowColNums += parseInt(col.c);
                        }
                        if (col.r != undefined) {
                            td.rowSpan = col.r;
                        }


                    } else {
                        rowColNums++;
                        td.innerHTML = col + "";
                    }


                    td.style.cssText = component.styles.td;
                    if (td.innerHTML.startsWith("其中")) {
                        td.style.textAlign = "left";
                    }
                    td.setAttribute("data-styles", "td")
                    tr.appendChild(td);


                });
                if (colNum < rowColNums)
                    colNum = rowColNums; 
                else {
                    // for(var t=rowColNums;t<colNum;t++){
                    //     var td = document.createElement("td");
                    //     td.style.cssText = component.styles.td;
                    //     td.setAttribute("data-styles", "td")
                    //     tr.appendChild(td);
                    // }


                }


                tbody.appendChild(tr);



            }



        }


        // [" ", "1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"].forEach(colName => {
        //     var th = document.createElement("th");
        //     th.innerHTML = colName;
        //     thead.appendChild(th);
        // })

        table.appendChild(thead);
        table.appendChild(tbody);
        return { root: body, content: body };
    }, property: {
        hasHead: { label: "表头", type: "bool", context: "true", },
        hasMul: { label: "多选", type: "bool", context: "false" }
    }
    , blue: {
        property: {
            data: {
                label: "数据", name: "data", get: (comp: IComponent, self: IBlueProperty) => {
                    return JSON.parse(comp.option);
                }, set: (comp: IComponent, self: IBlueProperty, arg: any) => {
                    comp.option = JSON.stringify(arg, null, 2);
                    comp.onRender(comp, document.getElementById(comp.key));
                }
            }
        },
        event: {
            select: {
                label: "选择"
            }
        }

    }
}
export default function load() {
    return component;
}