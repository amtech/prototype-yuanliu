var node = {
    "asdas": 234234,
    "ls": [
        { "a": "[f]asd,flex:333", "b": 33 }
    ]
};
var text = JSON.stringify(node, (key, val) => {

    if (key == "a") {
        var rg = RegExp("\\[f\\]", "g");


        return val.replace(rg, "flex:");
    } else {
        return val
    }
})
console.log(text);