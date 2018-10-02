/**
 * Created by long on 15-9-30.
 */

flax.gameVersion = 0;
flax.currentSceneName = null;
flax.currentScene = null;
flax.prevSceneName = null;

flax.onSceneExit = null;
flax.onSceneEnter = null;

flax._scenesDict = {};

/**
 * Register scene for your game! You can use different render mode for every scene
 * @param {String} name the scene name of the scene
 * @param {flax.Scene} scene the scene to show
 * @param {Array} resources for the scene to preload
 * @param {Int} renderMode 0, 1 or 2, auto detect, canvas or webGl to render the scene
 * Note: when change from one renderMode to another, the displayObject in the prev scene
 * can not be reused in the new scene
 * */
flax.registerScene = function(name, scene, resources, renderMode)
{
    if(!resources) resources = [];
    if(!(resources instanceof Array)) resources = [resources];
    flax._scenesDict[name] = {scene:scene, res:resources, renderMode: renderMode};
    if(flax.onSceneEnter == null){
        flax.onSceneExit = new signals.Signal();
        flax.onSceneEnter = new signals.Signal();
    }
};
/**
 * Replace the current scene
 * @param {String} sceneName the scene name registered
 * @param {cc.TransitionXXX} transition the transition effect for this scene switch
 * @param {Number} duration the duration for the transition
 * */
flax.replaceScene = function(sceneName, transition, duration)
{
    if(!flax.isDomainAllowed()) return;

    if(flax.currentSceneName) flax.onSceneExit.dispatch(flax.currentSceneName);

    if(flax.ObjectPool) flax.ObjectPool.release();
    if(flax.BulletCanvas) flax.BulletCanvas.release();
    flax.director.resume();
    flax.prevSceneName = flax.currentSceneName;
    flax.currentSceneName = sceneName;
    if(flax.stopPhysicsWorld) flax.stopPhysicsWorld();
    if(flax.clearDraw) flax.clearDraw(true);

    var s = flax._scenesDict[sceneName];
    if(s == null){
        throw "Please register the scene: " + sceneName + " firstly!";
        return;
    }
    //to load the language resource
    if(flax.language) flax.language.checkRes(s.res);
    //to load the font resources
    if(flax._fontResources) {
        for(var fontName in flax._fontResources) {
            s.res.push({type:"font", name:fontName, srcs: flax._fontResources[fontName]});
        }
    }

    //Ad leaderboard resources on wechat or facebook
    var platform = flax.game.config.platform;
    if(platform == "wechat" || platform == "fb")
    {
        if(s.res.indexOf(RANK_LIST_JSON) == -1) {
            s.res.push(RANK_LIST_JSON);
            s.res.push(RANK_LIST_PNG);
        }
    }

    flax.preload(s.res,function(){
        //init language
        if (flax.language) flax.language.onLoaded(s.res);
        //remove the font resources
        if (flax._fontResources) {
            var i = s.res.length;
            while (i--) {
                if (typeof s.res[i] == "object") s.res.splice(i, 1);
            }
            flax._fontResources = null;
        }

        flax.currentScene = new s.scene();
        flax.currentScene.name = sceneName;

        if (flax.InputManager) {
            flax.inputManager = new flax.InputManager();
            flax.currentScene.addChild(flax.inputManager);
        }

        if (flax.device) flax.device.init();

        var transitioned = false;
        if (!transitioned) {
            flax.director.runScene(flax.currentScene, s.renderMode);
            //flax.director.runScene(flax.currentScene);
        }

        if(flax.device) flax.device.showTipTop();

        flax.onSceneEnter.dispatch(flax.currentSceneName);
    });
};
/**
 * Refresh current scene
 * */
flax.refreshScene = function()
{
    if(flax.currentSceneName){
        flax.replaceScene(flax.currentSceneName);
    }
};
flax._soundResources = {};
flax.preload = function(res, callBack, dynamic, context)
{
    if(res == null || res.length == 0) {
        callBack.apply(context);
        return;
    }
    if(typeof res === "string") res = [res];
    var needLoad = false;
    var res1 = [];
    var i = res.length;
    while(i--)
    {
        var r = res[i];
        if(r == null) throw "There is a null resource!";
        var rInLoader = flax.loader.getRes(r);
        var notLoaded = (rInLoader == null && flax._soundResources[r] == null);
        //In pixi, image has been loaded, but the texture has not ready!
        if(rInLoader != null && rInLoader.type === PIXI.loaders.Resource.TYPE.IMAGE && rInLoader.texture == null) {
            notLoaded = true;
        }
        if(notLoaded) {
            //in mobile web or jsb, .flax is not good now, so replace it  to .plist and .png
            if(typeof r == "string" && flax.path.extname(r) == ".flax" && (flax.sys.isNative || flax.game.config["useFlaxRes"] === false)){
                if(flax.sys.isNative) console.log("***Warning: .flax is not support JSB for now, use .plist + .png instead!");
                var plist = flax.path.changeBasename(r, DATA_FORMAT);
                var png = flax.path.changeBasename(r, ".png");
                if(flax.loader.getRes(png) == null) {
                    res1.unshift(flax._addResVersion(plist));
                    res1.unshift(flax._addResVersion(png));
                    needLoad = true;
                }
            }else{
                needLoad = true;
                res1.unshift(flax._addResVersion(r));
            }
        }
    }
    if(needLoad) {
        var loader = flax.nameToObject(flax.game.config["preloader"] || "flax.Preloader");
        //If dynamic load resources staying on current scene
        if(dynamic === true) loader = flax.ResPreloader;
        loader = new loader();
        loader.initWithResources(res1, function(){

            if(dynamic === true) {
                if(flax.inputManager) flax.inputManager.removeMask(loader);
                loader.removeFromParent();
            }
            //replace the resource's key with no version string when not in JSB
            //if(!flax.sys.isNative) {
            //    var i = res1.length;
            //    while(i--) {
            //        var res = res1[i];
            //        if(flax.isSoundFile(res)) flax._soundResources[res] = "loaded";
            //        var data = flax.loader.getRes(res);
            //        if(data){
            //            var pureUrl = flax._removeResVersion(res);
            //            flax.loader.cache[pureUrl] = data;
            //            //fixed the bug when opengl
            //            flax.loader.release(res);
            //        }
            //    }
            //}
            callBack.apply(context);
        });
        //loader.startLoad();
        if(dynamic === true) {
            flax.currentScene.addChild(loader, 999999);
            if(flax.inputManager) flax.inputManager.addMask(loader);
        } else {
            flax.director.runScene(loader);
        }
        return loader;
    }else{
        callBack.apply(context);
    }
};

flax.isLocalDebug = function()
{
    if(flax.sys.isNative) return false;
    var domain = document.domain;
    if(!domain) return false;
    return domain == "localhost" || domain.indexOf("192.168.") == 0;
};

flax.isDomainAllowed = function()
{
    if(flax.sys.isNative) return true;
    var domain = document.domain;
    if(!domain) return true;
    var domainAllowed = flax.game.config["domainAllowed"];
    return flax.isLocalDebug() || domainAllowed == null || domainAllowed.length == 0 || domainAllowed.indexOf(domain) > -1;
};

flax._addResVersion = function(url)
{
    //TODO
    return url;
    if(flax.sys.isNative  || typeof url != "string" || flax.isSoundFile(url)) return url;
    if(url.indexOf("?v=") > -1) return url;
    //if local debug, make the version randomly, so every time debug is refresh
    if(!flax.gameVersion && flax.isLocalDebug()) {
        flax.gameVersion = 1 + Math.floor(Math.random()*(999999 - 1))
    }
    return url + "?v=" + (flax.gameVersion || flax.game.config['version']);
};
flax._removeResVersion = function(url)
{
    //TODO
    return url;
    if(flax.sys.isNative  || typeof url != "string" || flax.isSoundFile(url)) return url;
    var i = url.indexOf("?v=");
    if(i > -1) url = url.substr(0, i);
    return url;
};