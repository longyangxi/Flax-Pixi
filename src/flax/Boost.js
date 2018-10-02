/**
 * @author       Longsir <longames@qq.com>
 * @copyright    2015 Longames Ltd.
 * @github       {@link https://github.com/longyangxi/flax.js}
 * @flax         {@link http://flax.so}
 * @license      MIT License: {@link http:http://mit-license.org/}
 */

var loadJsonSync = function (url, callback) {
    var http = new XMLHttpRequest();
    http.open("GET", url, false);
    if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
        // IE-specific logic here
        http.setRequestHeader("Accept-Charset", "utf-8");
    } else {
        if (http.overrideMimeType) http.overrideMimeType("text\/plain; charset=utf-8");
    }
    http.onreadystatechange = function () {
        if(http.readyState == 4){
            if(http.status == 200){
                var response = http.responseText;
                response = response.replace(/\\/g,"");
                try{
                    response = JSON.parse(response);
                } catch (e) {

                }
                if(callback){
                    callback(response);
                }
            }else{

            }
        }else{
            //cc.log(xhr.status + ", " + xhr.readyState)
        }
    }
    http.send(null);
}

var flaxDir;

var loadJsList = function (urls, isFlax) {
    for(var i = 0; i< urls.length; i++) {
        if(typeof require != "undefined") {
            require(urls[i]);
        } else {
            var script = document.createElement("script");
            script.async = false;
            script.src = (isFlax ? flaxDir + "/" : "") + urls[i];
            document.body.appendChild(script);
        }
    }
}

loadJsonSync("project.json", function(userConfig) {
    flaxDir = userConfig['flaxDir'] || "src/flax";
    var modules = userConfig['modules'];
    loadJsonSync(flaxDir + "/" + "moduleConfig.json", function(moduleConfig) {
        var engineName = "pixi";
        for(var i = 0; i < modules.length; i++) {
            var moduleName = modules[i];
            var module = moduleConfig['modules'][moduleName];
            if(module) {
                if(module['base']) loadJsList(module['base'], true);
                if(module[engineName + "_base"]) loadJsList(module[engineName + "_base"], true);
                if(module['common']) loadJsList(module['common'], true);
                if(module[engineName]) loadJsList(module[engineName], true);
            }
        }

        loadJsList(userConfig['jsList']);
        loadJsList(['main.js']);
    });
});
