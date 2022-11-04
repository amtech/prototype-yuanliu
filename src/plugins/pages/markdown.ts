import { getViewPosition } from "../../render/workspace";
import * as Markdown from "markdown-it";
export function renderMarkDownPage(content: HTMLElement,url:string) {


    var viewPosition = getViewPosition();

    var page = document.createElement("div");
    page.style.position = "fixed";
    page.style.top = viewPosition.top + "px";
    page.style.right = viewPosition.right + "px";
    page.style.bottom = viewPosition.bottom + "px";
    page.style.left = viewPosition.left + "px";
    page.style.padding="20px";
    page.style.overflow="auto";
    content.appendChild(page);


    
    var httpRequest = new XMLHttpRequest();//第一步：建立所需的对象
    httpRequest.open('GET', url, true);//第二步：打开连接  将请求参数写在url中  ps:"./Ptest.php?name=test&nameone=testone"
    httpRequest.send();//第三步：发送请求  将请求参数写在URL中
    /**
     * 获取数据后的处理程序
     */
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var text = httpRequest.responseText;//获取到json字符串，还需解析
               var mk=new Markdown();
              var html=  mk.render(text);
              page.innerHTML=html;
        }else{
            page.innerHTML="404";
        }
    };










}