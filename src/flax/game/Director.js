/**
 * Created by long on 15/10/23.
 */

var flax = flax || {};

/**
 * canvas or webGl
 * */
flax.renderMode = null;

flax.Game = flax.Class.extend({
    config: null,
    onStart: null,
    run: function () {
        var self = this;
        if(!flax.game.config) {
            flax.loadJsonSync('project.json', function(data) {
                //set the pxiel ratio, not used
                //PIXI.settings.RESOLUTION = window.devicePixelRatio || 1.0;
                flax.game.config = data;
                if(typeof sdk != "undefined") {
                    sdk.init(function(){
                        self.doRun();
                    });
                } else {
                    self.doRun();
                }
            });
        } else {
            if(typeof sdk != "undefined") {
                sdk.init(function(){
                    self.doRun();
                });
            } else {
                self.doRun();
            }
        }
    },
    doRun: function() {
        //Init cordova
        //if(typeof MyCordova != "undefined") {
        //    if(!MyCordova.deviceReady) {
        //        document.addEventListener("deviceready", this.doRun.bind(this), false);
        //        return;
        //    }
        //    flax.sys.isMobile = true;
        //    flax.sys.isNative = true;
        //    flax.sys.os = MyCordova.deviceInfo.platform;
        //    flax.sys.language = MyCordova.language;
        //    MyCordova.init(flax.game.config);
        //}

        var self = this;
        flax.scheduler = new flax.Scheduler();
        flax.director = new flax.Director();
        if(self.onStart) self.onStart();
    }
})

flax.game = new flax.Game();

//flax.game.config = flax.loadJsonSync('project.json?v' + Math.random());

/////////////////////////////////////////////////////////////////////////////////////

flax.Director = flax.Class.extend({
    renderer: null,
    scaleX: 1.0,
    scaleY: 1.0,
    _currentScene: null,
    _renderMode:-1,
    runScene: function (scene, renderMode) {

        var needUpdateScale = this._initRenderer(renderMode);

        if(needUpdateScale) {
            this._updateScale();
        }

        if(this._currentScene) {
            flax.stage.removeChild(this._currentScene);
            this._currentScene = null;
        }
        this._currentScene = scene;
        flax.stage.addChild(scene);
        flax.stage.setChildIndex(scene, 0);
        this.resume();
    },
    _initRenderer: function (renderMode) {

        if(renderMode == null) renderMode = flax.game.config['renderMode'];

        var needUpdateScale = false;
        if(this._renderMode != renderMode || this.renderer == null) {
            this._renderMode = renderMode;
            this.renderer = flax._setupRenderer(renderMode);
            needUpdateScale = true;
        }
        return needUpdateScale;
    },
    setScale:function(sx, sy)
    {
        this.scaleX = sx;
        this.scaleY = sy;
        this._updateScale();
    },
    resume: function () {
        flax.scheduler.start();
    },
    pause: function () {
        flax.scheduler.pause();
    },
    isPaused: function () {
        return flax.scheduler.isPaused();
    },
    _updateScale: function () {

        if(!this.renderer) {
            this._initRenderer(this._renderMode > -1 ? this._renderMode : flax.game.config['renderMode']);
        }

        var sx = this.scaleX;
        var sy = this.scaleY;

        var screenSize = flax.getRealScreenSize();

        var realWidth = Math.round(flax.stageRect.width * sx);
        var realHeight = Math.round(flax.stageRect.height * sy);

        if(flax.sys.isMobile) this.renderer.resize(screenSize.x, screenSize.y);
        else this.renderer.resize(realWidth, realHeight);
        flax.stage.setScale(sx, sy);

        var view = this.renderer.view;
        var style = view.style;

        //水平居中
        //TODO
        var lx = 0;//(screenSize.x - realWidth) * 0.5;
        // var lx = (screenSize.x - flax.game.config.width * sx) * 0.5;
        var ly = 0;

        //0或者不设置，舞台水平居中，对齐屏幕上部边缘
        if(!flax.game.config.stageAlign) {
            //style.left = "";
            //style.top = "";
            //style.position = "";
            style.marginLeft = "auto";
            style.marginRight = "auto";
            if(view.parentElement)
            {
                var parentStyle = view.parentElement.style;
                parentStyle.textAlign = "center";
                parentStyle.width = "100%";
                parentStyle.margin = "0 auto";
            }
            //TODO
            if(flax.isMobile) flax.stage.x = (screenSize.x - flax.game.config.width * sx) * 0.5;
            else lx = (screenSize.x - flax.game.config.width * sx) * 0.5;
        //1，舞台上下居中
        } else if(flax.game.config.stageAlign == 1) {
            ly = (screenSize.y - realHeight)*0.5;
            //1，舞台对齐屏幕下部边缘
        } else if(flax.game.config.stageAlign == 2) {
            ly = (screenSize.y - realHeight) * 1.0;
        }

        style.left = lx + "px";
        style.top = ly + "px";
        style.position = "absolute";

        //if(flax.view.getResolutionPolicy() == flax.ResolutionPolicy.NO_BORDER)
        //{
        //    lx = (screenSize.x - realWidth)*0.5;
        //    ly = (screenSize.y - realHeight)*0.5;
        //    style.left = lx + "px";
        //    style.top = ly + "px";
        //    style.position = "absolute";
        //} else {
        //    style.left = "";
        //    style.top = "";
        //    style.position = "";
        //    style.marginLeft = "auto";
        //    style.marginRight = "auto";
        //    if(view.parentElement)
        //    {
        //        var parentStyle = view.parentElement.style;
        //        parentStyle.textAlign = "center";
        //        parentStyle.width = "100%";
        //        parentStyle.margin = "0 auto";
        //    }
        //}

        flax.visibleRect.init(flax.rect(-lx/sx, -ly/sy, (realWidth + 2*lx)/sx, (realHeight + 2*ly)/sy));

    }
})

flax._setupRenderer = function (renderMode) {

    if(flax.app) flax.app.destroy(true);

    var options = flax._rendererOptions || {};
    options.width = flax.stageRect.width;
    options.height = flax.stageRect.height;

    //Force canvas render
    if(renderMode === 1) options.forceCanvas = true;

    //Use wx's canvas in wechat mini game enviroment
    if(typeof canvas != "undefined" && flax.game.config.platform == "wechat") options.view = canvas;

    flax.app = new PIXI.Application(options);
    document.body.appendChild(flax.app.view);
    flax.stage = flax.app.stage;

    //Forbidden context menu
    flax.app.view.oncontextmenu = function() { return false; };
    //flax.app.view.onselectstart = function() { return false; };
    flax.scheduler.showFPS();

    if(flax.audioEngine) flax.audioEngine.init();

    return flax.app.renderer;
}