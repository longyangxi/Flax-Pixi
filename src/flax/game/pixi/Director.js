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
        var json = 'project.json?v' + Math.random();
        flax.loader.load(json, function(){
            self.config = flax.loader.getRes(json);
            self.init();
            if(self.onStart) self.onStart();
        })
    },
    init: function () {
        flax.scheduler = new flax.Scheduler();
        flax.director = new flax.Director();
    }
})

flax.game = new flax.Game();

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

        this.resume();
    },
    _initRenderer: function (renderMode) {

        if(renderMode == null) renderMode = flax.game.config['renderMode'];

        var needUpdateScale = false;
        if(this._renderMode != renderMode || this.renderer == null) {
            this._renderMode = renderMode;
            if(this.renderer) {
                this.renderer.destroy(true);
                this.renderer = null;
            }
            flax.stage = null;
            this.renderer = flax.setupRenderer(renderMode);
            needUpdateScale = true;
        }

        if(!flax.stage) {
            flax.stage = new flax.Container();
            flax.scheduler.scheduleUpdate(this);
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
    update: function (delta) {
        if(this.renderer) this.renderer.render(flax.stage);
    },
    _updateScale: function () {

        if(!this.renderer) {
            this._initRenderer(this._renderMode > -1 ? this._renderMode : flax.game.config['renderMode']);
        }

        var sx = this.scaleX;
        var sy = this.scaleY;

        var realWidth = flax.stageRect.width*sx;
        var realHeight = flax.stageRect.height*sy;

        this.renderer.resize(realWidth, realHeight);
        flax.stage.setScale(sx, sy);

        var view = this.renderer.view;
        var style = view.style;
        var lx = 0;
        var ly = 0;
        if(flax.view.getResolutionPolicy() == flax.ResolutionPolicy.NO_BORDER)
        {
            lx = (window.innerWidth - realWidth)*0.5;
            ly = (window.innerHeight - realHeight)*0.5;
            style.left = lx + "px";
            style.top = ly + "px";
            style.position = "absolute";
        }else{
            style.left = "";
            style.top = "";
            style.position = "";
            style.marginLeft = "auto";
            style.marginRight = "auto";
            if(view.parentElement)
            {
                var parentStyle = view.parentElement.style;
                parentStyle.textAlign = "center";
                parentStyle.width = "100%";
                parentStyle.margin = "0 auto";
            }
        }

        flax.visibleRect.init(flax.rect(-lx/sx, -ly/sy, (realWidth + 2*lx)/sx, (realHeight + 2*ly)/sy));
    }
})

flax.setupRenderer = function (renderMode) {
    var renderer;
    switch (renderMode){
        case 1:
            flax.renderMode = "canvas";
            renderer = new PIXI.CanvasRenderer(flax.stageRect.width, flax.stageRect.height, flax._rendererOptions);
            break;
        case 2:
            flax.renderMode = "webGl";
            renderer = new PIXI.WebGLRenderer(flax.stageRect.width, flax.stageRect.height, flax._rendererOptions);
            break;
        case 0:
        default:
            flax.renderMode = flax.isWebGLSupported() ? "webGl" : "canvas";
            renderer = new PIXI.autoDetectRenderer(flax.stageRect.width, flax.stageRect.height, flax._rendererOptions);
            break;
    }
    document.body.appendChild(renderer.view);
    return renderer;
}