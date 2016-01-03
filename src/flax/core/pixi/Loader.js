/**
 * Created by long on 15/10/22.
 */

var flax = flax || {};

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
            loader.add(file, file);
        }


        loader.on("progress", function (resource) {
            if(_progressCall) {
                _progressCall(resource, loader.progress);
            }
        }, this);

        loader.on("complete", function (loader, resources) {
            flax.copyProperties(resources, this.cache);
            if(_completeCall){
                _completeCall(loader, resources);
            }
            loader.reset();
        }, this);

        loader.on("error", function (resource) {
            console.log("Resource loaded error: " + resource.url);
        }, this);

        loader.load();
    },
    getRes: function (name) {
        var res = this.cache[name];
        if(res){
            //For json, directly return the data
            if(res.isJson){
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

flax.loader = new flax.Loader();