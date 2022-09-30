var style =
    "display:flex;" +
    "	background:transparent;" +
    "	min-height:34px;" +
    "	padding:5px;" +
    "	border-radius:5px;" +
    "	align-items: center;" +
    "	";
var property = "display";
var rep = RegExp("[^\-]" + property + ":[^;]+;");

var m = style.match(rep);
for (var i = 0; i < m.length; i++) {

    console.log(m[i].substring(1));
}