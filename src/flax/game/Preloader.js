var flax = flax || {};

flax.homeUrl = "http://flax.so";
flax.goHomeUrl = function()
{
    var homeUrl = flax.game.config["homeUrl"] || flax.homeUrl;
    if(!flax.sys.isNative && homeUrl){
        if(typeof window.open == "function") window.open(homeUrl);
    }
};

flax.AbstractPreloader = flax.Scene.extend({
    callback:null,
    context:null,
    initWithResources: function (resources, callback, context) {
        if(typeof resources == "string")
            resources = [resources];
        this.resources = resources || [];
        this.callback = callback;
        this.context = context;
    },
    onEnter: function () {
        if (flax.InputManager) {
            flax.inputManager = new flax.InputManager();
            //TODO, longsir-pixi
            this.addChild(flax.inputManager);
        }
        this._super();
        //this.startLoad();
    },
    onExit: function () {
        this._super();
    },
    startLoad: function () {
        var self = this;
        flax.loader.load(self.resources,
            function (result, count, loadedCount) {
                self._showProgress(count, loadedCount);
            }, function () {
                self.onLoadComplete();
            });
    },
    _showProgress:function(count, loadedCount)
    {
       //to be override
    },
    onLoadComplete: function () {
        if(flax.inputManager) {
            flax.inputManager.removeFromParent();
        }
        if (this.callback)
        {
            this.callback.apply(this.context);
            this.context = null;
            this.callback = null;
        }
    }
});

flax._preloader = {
    resources:null,
    _label : null,
    _logo:null,
    _inited:false,
    /**
     * init with resources
     * @param {Array} resources
     * @param {Function|String} cb
     */
    initWithResources: function (resources, cb) {
        this.init();
        if(typeof resources == "string")
            resources = [resources];
        this.resources = resources || [];
        this.cb = cb;
    },
    init : function(){
        if(this._inited) return;
        this._inited = true;

        var self = this;
        var sw = flax.game.config.width;
        var sh = flax.game.config.height;
        //logo
        var centerPos = flax.p(sw / 2, sh / 2);

        //logo
        var loadingImg = flax.game.config["loading"];
        if(loadingImg && flax.isImageFile(loadingImg)){
            flax.loader.load(loadingImg, function(){
                self._logo = new flax.Sprite(loadingImg);
                self._logo.setAnchorPoint(0.5, 0.5);
                self._logo.setPosition(centerPos);
                self.addChild(self._logo);

                if(!flax.sys.isNative || flax.game.config.platform == "wechat"){
                    var fontSize = 16*(1 + self._logo.width/200);
                    var pos = flax.pAdd(centerPos, flax.p(0,  self._logo.height/2 + fontSize*0.6));
                    self.createLabel(pos, fontSize);
                    self.logoClick();
                }
            })
        }else{
            self.createLabel(centerPos);
        }
    },
    createLabel:function(pos, fontSize) {
        var label = new flax.Text("Loading...", {fontFamily: (fontSize || 18) + "px Arial", fill: 0xFFFFFF, stroke:0x333333, strokeThickness:2});
        label.setPosition(pos);
        label.setAnchorPoint(0.5, 0.5);
        this.addChild(label);
        this._label = label;
    },
    logoClick:function(){
        //click logo to go
        var logo = this._logo;
        logo.interactive = true;
        logo.once(flax.isMobile ? "touchstart" : "mousedown", function () {
            flax.goHomeUrl();
        })
    },
    onEnter: function () {
        var self = this;
        this._super();
        if(this.resources) self.schedule(self._startLoading, 0.3);
    },
    _startLoading: function () {
        var self = this;
        self.unschedule(self._startLoading);
        var res = self.resources;
        flax.loader.load(res,
            function (result, count, loadedCount) {
                if(self._label == null) return;
                self._showProgress(count, loadedCount);
            }, function () {
                if (self.cb)
                    self.cb();
            });
    },
    _showProgress:function(count, loadedCount)
    {
        if(!this._label) return;
        if(loadedCount != null) {
            this._label.setString("Loading: " + (loadedCount + 1) + "/" + count);
        } else {
//            var percent = (loadedCount / count * 100) | 0;
//            percent = Math.min(percent, 100);
            this._label.setString("Loading: " + count.toFixed(1) + "%");
        }
    }
};

flax.Preloader = flax.Scene.extend(flax._preloader);
flax.ResPreloader = flax.Sprite.extend(flax._preloader);

window['flax']['Preloader'] = flax.Preloader;
window['flax']['ResPreloader'] = flax.ResPreloader;
