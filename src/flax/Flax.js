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

/**
 * Dispatch when the window resized
 * */
flax.onScreenResize = new signals.Signal();
/**
 * Dispatch when the window show
 * */
flax.onScreenShow = new signals.Signal();
/**
 * Dispatch when the window hide
 * */
flax.onScreenHide = new signals.Signal();

flax._rendererOptions = null;

flax.isMobile = false;

if(window.navigator) {
    var ua = window.navigator.userAgent.toLowerCase();
    flax.isMobile = ua.indexOf('mobile') !== -1 || ua.indexOf('android') !== -1;
} else {
    flax.isMobile = true;
}

/**
 * Setup flax as a plugin to play animation only
 * @param {flax.stage} stage the global container to be rendered in game, only need by pixi
 * */
flax.plugin = function (stage) {
    //In pixi, we need a root stage
    if(stage == null) throw "Please give me stage!"
    flax.stage = stage;
    //setup all the modules
    flax._setupModules();

    flax.scheduler = new flax.Scheduler();
    flax.scheduler.start();

    console.log("Flax initialized as an plugin, version: " + VERSION);
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
    //remove the css preloader
    if(typeof document != "undefined" && document.getElementById && document.getElementById("flaxLoading"))
        document.body.removeChild(document.getElementById("flaxLoading"));

    if(flax.game) flax.frameInterval = 1/flax.game.config["frameRate"];
    if(flax.language) flax.language.init();

    flax._rendererOptions = options;

    flax._setupModules();

    if(flax.fetchUserData) flax.fetchUserData(initialUserData);

    if(!options || options.enableRetina !== false) flax.view.enableRetina(true);

    flax._setupView(resolutionPolicy, options);

    flax._addEvents();

    if(flax.preloadSounds) flax.preloadSounds();

    console.log("Flax initialized as an engine, version: " + VERSION);
};

flax._setupModules = function()
{
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

flax._setupView = function (resolutionPolicy, options) {

    flax.setViewPortMeta();

    var gameConfig = flax.game.config;
    var platform = gameConfig.platform;
    //TODO, use fixed-width in fb instant game
    if(platform == "fb") {
        resolutionPolicy = flax.ResolutionPolicy.FIXED_WIDTH;
    }

    if(resolutionPolicy == null) {
        resolutionPolicy = flax.ResolutionPolicy.SHOW_ALL;
        if(flax.isMobile) {
            resolutionPolicy = !gameConfig.landscape ? flax.ResolutionPolicy.FIXED_WIDTH : flax.ResolutionPolicy.FIXED_HEIGHT;
        }
    }

    flax.resolutionPolicy = resolutionPolicy;

    var designWidth = options && options.width;
    var designHeight = options && options.height;

    var width = designWidth ? designWidth : flax.game.config["width"];
    var height = designHeight ? designHeight: flax.game.config["height"];

    //TODO, 需要进一步验证，这里将手机全屏设为渲染尺寸
    //TODO, FB上有点问题
    if(flax.sys.isMobile || platform == "fb")
    {
        var screenSize = flax.getRealScreenSize();
        var s = flax.getGameScale(flax.rect(0, 0, width, height));
        width = screenSize.x / s.x;
        height = screenSize.y / s.y;
    }

    if(!width || !height) throw "Please set the game width and height in the project.json!"

    flax.designedStageSize = flax.rect(0, 0, width, height);

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

    //flax.designedStageSize = flax.rect(0, 0, width, height);

    flax.view.setDesignResolutionSize(width, height, resolutionPolicy);

    if(!flax.sys.isNative)
    {
        window.addEventListener("resize", function(){
            flax.stageRect = flax.rect(0, 0, width, height);
            if(flax.view.updateView) flax.view.updateView();
            flax.onScreenResize.dispatch();
        }, false);
    }
}

flax._addEvents = function () {
    //var lastHidenTime = 0;
    //var lastShowTime = 0;
    var onHidden = function() {
        //var now = Date.now();
        //if(now - lastHidenTime > 16.667) {
            flax.onScreenHide.dispatch();
            //lastHidenTime = now;
        //}
    };
    var onShow = function() {
        //var now = Date.now();
        //if(now - lastShowTime > 16.667) {
            flax.onScreenShow.dispatch();
            //lastShowTime = now;
        //}
    };

    var plat = flax.game.config.platform;

    if(plat == "fb") {
        //FB has only pause event
        FBInstant.onPause(onHidden);
    //} else if(typeof cordova != "undefined") {
    //    document.addEventListener('pause', onHidden, false)
    //    document.addEventListener('resume', onShow, false)
    } else {
        var win = window, hidden, visibilityChange, _undef = "undefined";
        if (typeof document.hidden != _undef) {
            hidden = "hidden";
            visibilityChange = "visibilitychange";
        } else if (typeof document.mozHidden != _undef) {
            hidden = "mozHidden";
            visibilityChange = "mozvisibilitychange";
        } else if (typeof document.msHidden != _undef) {
            hidden = "msHidden";
            visibilityChange = "msvisibilitychange";
        } else if (typeof document.webkitHidden != _undef) {
            hidden = "webkitHidden";
            visibilityChange = "webkitvisibilitychange";
        }

        if (hidden) {
            win.addEventListener(visibilityChange, function () {
                if (document[hidden]) onHidden();
                else onShow();
            }, false);
        } else {
            win.addEventListener("blur", onHidden, false);
            win.addEventListener("focus", onShow, false);
        }

        //fix the safari in Mac
        if(!flax.sys.isMobile && flax.sys.browserType == flax.sys.BROWSER_TYPE_SAFARI) {
            win.addEventListener("blur", onHidden, false);
            win.addEventListener("focus", onShow, false);
        }

        if(navigator.userAgent.indexOf("MicroMessenger") > -1){
            win.onfocus = function(){ onShow() };
        }

        if ("onpageshow" in window && "onpagehide" in window) {
            win.addEventListener("pagehide", onHidden, false);
            win.addEventListener("pageshow", onShow, false);
        }
        win = null;
        visibilityChange = null;
    }
}

function catchAllErrors() {
    window.onerror = function(msg, url, lineNo, columnNo, error) {

        var idx = url.lastIndexOf("/");
        console.log("**************JAVASCRIPT ERROR START*****************")
        if (idx > -1) { url = url.substring(idx + 1); }
        console.log("In " + url + " (line #" + lineNo + ", column #" + columnNo + "): " + msg);
        console.log(error.stack);
        console.log("**************JAVASCRIPT ERROR END*****************");

        flax.showDebugError("In " + url + " (line #" + lineNo + ", column #" + columnNo + "): " + msg + "\n" + error.stack)

        return false; //suppress Error Alert;

    };
}

flax.showStageMask = function(clickDestroy, cb) {

    if (!flax.stageRect) return;

    var w = flax.stageRect.width;
    var h = flax.stageRect.height;

    var bg = new flax.Graphics();
    bg.beginFill(0x000000, 0.5);
    bg.drawRect(0, 0, w, h);
    bg.endFill();
    flax.stage.addChild(bg);
    bg.interactive = true;

    flax.inputManager.addListener(bg, function () {
        if (clickDestroy) {
            bg.destroy();
        }
        if (cb) cb();
    });

    return bg;
}

flax.showDebugError = function(msg) {

    if(!flax.stageRect) return;
    var w = flax.stageRect.width;

    var style = new PIXI.TextStyle({
        fontSize: 24,
        fill: "#FFFFFF",
        align: "left",
        stroke: 0x000000,
        strokeThickness: 5,
        wordWrap: true,
        breakWords: true,// For chinese words specially
        wordWrapWidth: w - 50
    });

    var vTxt= new flax.Text(msg, style);

    flax.showStageMask(true, function() {
        vTxt.removeFromParent();
    });

    vTxt.x = 50;
    vTxt.y = 50;
    flax.currentScene.addChild(vTxt);
}

if(flax.isMobile) catchAllErrors();