/**
 * Created by long on 14-2-2.
 */

var flax = flax || {};
window['flax'] = flax;

flax.resolution = 1;
flax.frameInterval = 1/60;
flax.stage = null;
flax.stageRect = null;
flax.resolutionPolicy = null;
flax.designedStageSize = null;
flax.REPEAT_FOREVER = Number.MAX_VALUE - 1;

flax._rendererOptions = null;

flax.isMobile = false;

if(window.navigator) {
    var ua = window.navigator.userAgent.toLowerCase();
    flax.isMobile = ua.indexOf('mobile') !== -1 || ua.indexOf('android') !== -1;
} else {
    flax.isMobile = true;
}

if(FRAMEWORK == "cocos"){
    flax.Sprite = cc.Sprite;
    flax.SpriteBatchNode = cc.SpriteBatchNode;
    flax.Scale9Sprite = cc.Scale9Sprite;
    flax.game = cc.game;
    flax.Scene = cc.Scene;
    flax.sys = cc.sys;
    flax.ResolutionPolicy = cc.ResolutionPolicy;
}else{
    flax.log = function () {
        //todo
        console.log(arguments)
    }
    //todo
    //flax.Scale9Sprite = cc.Scale9Sprite;
}

/**
 * Setup flax as a plugin to play animation only
 * @param {flax.stage} stage the global container to be rendered in game, only need by pixi
 * */
flax.plugin = function (stage) {
    //In pixi, we need a root stage
    if(FRAMEWORK == "pixi"){
        if(stage == null) throw "Please give me stage!"
        flax.stage = stage;
    }
    //setup all the modules
    flax._setupModules();

    //In no cocos frameworks, we should setup a shcheduler
    if(FRAMEWORK != "cocos"){
        flax.scheduler = new flax.Scheduler();
        flax.scheduler.start();
    }

    flax.log("Flax initialized as an plugin, version: " + VERSION);
}

/**
 * @param {flax.ResolutionPolicy} resolutionPolicy resolution policy
 * @param {Size}   designSize  custom the designed screen size
 * @param {Object} options options used for pixi renderer
 * DEFAULT_RENDER_OPTIONS: {
        width:0, //custom the game width if you want to override the value in project.json
        height:0, //custom the game height if you want to override the value in project.json
        view: null,
        resolution: 1,//the resolution of the renderer retina would be 2
        antialias: false,//sets antialias (only applicable in chrome at the moment), webgl
        forceFXAA: false,
        autoResize: false,
        transparent: false,//backgroud transparent
        backgroundColor: 0x000000,
        clearBeforeRender: true,//This sets if the CanvasRenderer will clear the canvas or not before the new render pass.
        preserveDrawingBuffer: false//enables drawing buffer preservation, enable this if you need to call toDataUrl on the webgl context
    }
 * */
flax.init = function(resolutionPolicy, initialUserData, options)
{
    if(flax.game) flax.frameInterval = 1/flax.game.config["frameRate"];
    if(flax.language) flax.language.init();
    if(flax.userData) flax.fetchUserData(initialUserData);

    flax._rendererOptions = options;

    flax._setupModules();
    flax._setupView(resolutionPolicy, options && options.width, options && options.height);

    flax.log("Flax initialized as an engine, version: " + VERSION);
};

flax._setupModules = function()
{
    if(FRAMEWORK == "cocos") {
        flax.view = cc.view;
        flax.visibleRect = cc.visibleRect;
        flax.log = cc.log;
        flax.loader = cc.loader;
        flax.path = cc.path;
        flax.spriteFrameCache = cc.spriteFrameCache;
        flax.defineGetterSetter = cc.defineGetterSetter;
        flax.director = cc.director;
    }else{

    }

    if(flax.Module.PhysicsShape) flax.addModule(flax.Collider, flax.Module.PhysicsShape);

    if(flax.Module.TileMap) flax.addModule(flax.FlaxSprite, flax.Module.TileMap);
    if(flax.Module.Collider) flax.addModule(flax.FlaxSprite, flax.Module.Collider);
    if(flax.Module.Physics) flax.addModule(flax.FlaxSprite, flax.Module.Physics);
    if(flax.Module.Move) flax.addModule(flax.FlaxSprite, flax.Module.Move);
    if(flax.Module.ScreenLayout) flax.addModule(flax.FlaxSprite, flax.Module.ScreenLayout);

    if(flax.FlaxContainer){
        if(flax.Module.TileMap) flax.addModule(flax.FlaxContainer, flax.Module.TileMap);
        if(flax.Module.Collider) flax.addModule(flax.FlaxContainer, flax.Module.Collider);
        if(flax.Module.Physics) flax.addModule(flax.FlaxContainer, flax.Module.Physics);
        if(flax.Module.Move) flax.addModule(flax.FlaxContainer, flax.Module.Move);
        if(flax.Module.ScreenLayout) flax.addModule(flax.FlaxContainer, flax.Module.ScreenLayout);
    }

    if(flax.FlaxSpriteBatch){
        if(flax.Module.TileMap) flax.addModule(flax.FlaxSpriteBatch, flax.Module.TileMap);
        if(flax.Module.Collider) flax.addModule(flax.FlaxSpriteBatch, flax.Module.Collider);
        if(flax.Module.Physics) flax.addModule(flax.FlaxSpriteBatch, flax.Module.Physics);
        if(flax.Module.Move) flax.addModule(flax.FlaxSpriteBatch, flax.Module.Move);
        if(flax.Module.ScreenLayout) flax.addModule(flax.FlaxSpriteBatch, flax.Module.ScreenLayout);
    }
    if(flax.Module.Health){
        if(flax.Gunner) flax.addModule(flax.Gunner, flax.Module.Health, false, ["onHit", "onDie"]);
        if(flax.MCGunner) flax.addModule(flax.MCGunner, flax.Module.Health, false,  ["onHit", "onDie"]);
    }
}

flax._setupView = function (resolutionPolicy, designWidth, designHeight) {

    if(resolutionPolicy == null) resolutionPolicy = flax.sys.isMobile ? flax.ResolutionPolicy.NO_BORDER : flax.ResolutionPolicy.SHOW_ALL;

    flax.resolutionPolicy = resolutionPolicy;

    var width = designWidth ? designWidth : flax.game.config["width"];
    var height = designHeight ? designHeight: flax.game.config["height"];
    if(!width || !height) throw "Please set the game width and height in the project.json!"
    if(!flax.sys.isNative){
        var stg = document.getElementById(flax.game.config["id"]);
        if(stg){
            stg.width = width = width || stg.width;
            stg.height = height = height || stg.height;
        }
        flax.stageRect = flax.rect(0, 0, width, height);
        flax.view.adjustViewPort(true);
        flax.view.resizeWithBrowserSize(true);
    } else {
        flax.stageRect = flax.rect(0, 0, width, height);
    }

    flax.designedStageSize = flax.rect(0, 0, width, height);

    flax.view.setDesignResolutionSize(width, height, resolutionPolicy);

    flax.onScreenResize = new signals.Signal();

    if(!flax.sys.isNative) {
        window.addEventListener("resize", function(){
            //flax.stageRect = flax.rect(flax.visibleRect.bottomLeft.x, flax.visibleRect.bottomLeft.y, flax.visibleRect.width, flax.visibleRect.height);
            flax.stageRect = flax.rect(0, 0, width, height);
            if(flax.view.updateView) flax.view.updateView();
            flax.onScreenResize.dispatch();
        }, false);
    }
}