/**
 * @author       Longsir <longames@qq.com>
 * @copyright    2015 Longames Ltd.
 * @github       {@link https://github.com/longyangxi/flax.js}
 * @flax         {@link http://flax.so}
 * @license      MIT License: {@link http:http://mit-license.org/}
 */

var loadJsonSync = function (url) {
    var http = new XMLHttpRequest();
    http.open("GET", url, false);
    if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
        // IE-specific logic here
        http.setRequestHeader("Accept-Charset", "utf-8");
    } else {
        if (http.overrideMimeType) http.overrideMimeType("text\/plain; charset=utf-8");
    }
    http.send(null);
    if (!http.readyState === 4 || http.status !== 200) {
        return null;
    }
    return JSON.parse(http.responseText);
}

var loadJsList = function (urls, isFlax) {
    for(var i = 0; i< urls.length; i++) {
        var script = document.createElement("script");
        script.async = false;
        script.src = (isFlax ? flaxDir + "/" : "") + urls[i];
        document.body.appendChild(script);
    }
}

var userConfig = loadJsonSync("project.json");
FRAMEWORK = userConfig['frameWork'] || "pixi";
var flaxDir = userConfig['flaxDir'] || "src/flax";
var modules = userConfig['modules'];

var moduleConfig = loadJsonSync(flaxDir + "/" + "moduleConfig.json");

for(var i = 0; i < modules.length; i++) {
    var moduleName = modules[i];
    var module = moduleConfig['modules'][moduleName];
    if(module) {
        if(module['base']) loadJsList(module['base'], true);
        if(module[FRAMEWORK + "_base"]) loadJsList(module[FRAMEWORK + "_base"], true);
        if(module['common']) loadJsList(module['common'], true);
        if(module[FRAMEWORK]) loadJsList(module[FRAMEWORK], true);
    }
}

loadJsList(userConfig['jsList']);
loadJsList(['main.js']);
