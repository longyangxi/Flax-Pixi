/**
 * Created by long on 16/5/25.
 */
/**
 * 遍历project.json包含的所有js(不包括flax引擎)，将继承flax.MovieClip, flax.ListView的类
 * 用window['xxx']= xxx标注，并记录到src/__dynamicFlaxView.js中，防止高级混淆时出错
 * */

var folder = "/Users/long/Documents/www/projects/darkLegend/src/";
var fs = require("fs");

fs.writeFile( folder + "__dynamicFlaxView.js", readSubFiles(folder, ""));

function readSubFiles(file) {
    var stat = fs.lstatSync(file);
    if(stat.isDirectory()) {
        var files = fs.readdirSync(file);
        var str = "";
        for(var i = 0; i < files.length; i++) {
            //忽略flax文件夹
            if(files[i] == "flax") continue;
            if(file.charAt(file.length - 1) != "/") file += "/";
            str += "\n" + readSubFiles(file + files[i], str);
        }
        return str;
    } else if(file.indexOf(".js") > 0){
        if(file.indexOf("__dynamicFlaxView.js") > 0) return ""
        console.log("read file: " + file);
        return fs.readFileSync(file);
    } else {
        return ""
    }
}