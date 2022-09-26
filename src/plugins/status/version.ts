import { IStatusBarActivity } from "../../common/interfaceDefine";

const version:IStatusBarActivity={
    title:"版本",
    position:"right",
    sort:0,
    onRender(acticity, config?, project?) {
        acticity.innerHTML= require("../../../package.json").version;
    }
}
export default version;