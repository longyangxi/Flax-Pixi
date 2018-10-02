/**
 * Created by long on 15/10/22.
 */

var flax = flax || {};

/**
 * 为了阻止prix用默认的spreetSheet解析器，删掉Loader._pixiMiddleware的spritesheetParser
 * TODO, 要是pixi改版，顺序改变了，记得更新，位置请在pixi中搜索：_spritesheetParser2.default
 * */
PIXI.loaders.Loader._pixiMiddleware.splice(2, 1);

flax.Loader = flax.Class.extend({
    cache:null,
    ctor: function () {
        this.cache = {};
    },
    load: function (urls, progressCall, completeCall) {

        if(!Array.isArray(urls)) urls = [urls];

        var urlsToLoad = [];
        for(var i = 0; i < urls.length; i++)
        {
            var file = urls[i];
            if(this.getRes(file)) continue;
            urlsToLoad.push(file);
        }

        var _completeCall = null;
        var _progressCall = null;

        if(completeCall && progressCall) {
            _progressCall = progressCall;
            _completeCall = completeCall;
        }else if(progressCall) {
            _completeCall = progressCall;
        }

        if(urlsToLoad.length == 0) {
            if(_completeCall){
                _completeCall({}, this.cache);
            }
            return;
        }

        var loader = new PIXI.loaders.Loader();

        for(var i = 0; i < urlsToLoad.length; i++)
        {
            var file = urlsToLoad[i];
            loader.add(file, flax.getResUrl(file));
        }


        loader.on("progress", function (resource) {
            if(_progressCall) {
                _progressCall(resource, loader.progress);
            }
        }, this);

        loader.on("complete", function (loader, resources) {
            flax.copyProperties(resources, this.cache);
            if(_completeCall){
                _completeCall(resources);
            }
            loader.reset();
        }, this);

        loader.on("error", function (err, loader, resource) {
            console.log("Resource loaded error: " + resource.url);
        }, this);

        loader.load();
    },
    getRes: function (name) {
        var res = this.cache[name];
        if(res){
            //For json, directly return the data
            if(res.type === PIXI.loaders.Resource.TYPE.JSON){
                return res.data;
            }
        }
        return res;
    },
    release: function (name) {
        if(name)
            delete this.cache[name];
        else
            this.cache = {};
    }
});

flax.loadJsonSync = function (url, callback) {
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

flax.getResUrl = function(url) {

    if(url.indexOf("http") == 0) return url;

    var baseUrl = flax.game.config.resUrl || (flax.game.config.platformConfig && flax.game.config.platformConfig.resUrl);
    if(!baseUrl || !baseUrl.length) return url;

    if(baseUrl.lastIndexOf("/") != baseUrl.length - 1) {
        baseUrl += "/";
    }
    return baseUrl + url;

}

flax.loader = new flax.Loader();