/**
 * @author       Longsir <longames@qq.com>
 * @copyright    2015 Longames Ltd.
 * @github       {@link https://github.com/longyangxi/flax.js}
 * @flax         {@link http://flax.so}
 * @license      MIT License: {@link http:http://mit-license.org/}
 */

function loadJsonSync(url) {
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

function loadJsList(urls, dir) {
    for(var i = 0; i< urls.length; i++) {
        var script = document.createElement("script");
        script.async = false;
        script.src = (dir || "") + urls[i];
        document.body.appendChild(script);
    }
}

function doBoost() {
    var userConfig = loadJsonSync("project.json");
    if(userConfig['frameWork']) FRAMEWORK =  userConfig['frameWork'];
    else FRAMEWORK = "pixi";
    var flaxDir = userConfig['flaxDir'] || "src/flax";
    var modules = userConfig['modules'];

    var moduleConfig = loadJsonSync(flaxDir + "/" + "moduleConfig.json");

    for(var i = 0; i < modules.length; i++) {
        var moduleName = modules[i];
        var module = moduleConfig['modules'][moduleName];
        if(module) {
            var dir = flaxDir + "/";
            if(module['base']) loadJsList(module['base'], dir);
            if(module[FRAMEWORK + "_base"]) loadJsList(module[FRAMEWORK + "_base"], dir);
            if(module['common']) loadJsList(module['common'], dir);
            if(module[FRAMEWORK]) loadJsList(module[FRAMEWORK], dir);
        }
    }

    loadJsList(userConfig['jsList']);
    loadJsList(['main.js']);
}

/**
 * 为了让cordova可以启动游戏，需要安装httpd的插件，在游戏运行时启动
 * 参见：https://github.com/floatinghotpot/cordova-httpd
 * */
if(typeof cordova == "undefined") {
    doBoost();
} else {
    loadJsList(["src/flax/httpd.js"]);
    document.addEventListener("httpdready", doBoost, false);
}
