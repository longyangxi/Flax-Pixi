var flax = flax || {};

flax.homeUrl = "http://flax.so";
flax.goHomeUrl = function()
{
    var homeUrl = flax.game.config["homeUrl"] || flax.homeUrl;
    if(!flax.sys.isNative && homeUrl){
        window.open(homeUrl);
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
        this._super();
        //this.startLoad();
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
        if (this.callback)
        {
            this.callback.apply(self.context);
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
        var winSize = flax.visibleRect;

        //logo
        var centerPos = flax.p(winSize.width / 2, winSize.height / 2);

        //logo
        var loadingImg = flax.game.config["loading"];
        if(loadingImg && flax.isImageFile(loadingImg)){
            flax.loader.load(loadingImg, function(){
                self._logo = new flax.Sprite(loadingImg);
                self._logo.setPosition(centerPos);
                self.addChild(self._logo, 10);

                if(!flax.sys.isNative){
                    var fontSize = 16*(1 + self._logo.width/200);
                    var pos = FRAMEWORK == "cocos" ? flax.pSub(centerPos, flax.p(0,  self._logo.height/2 + fontSize*0.6)) : flax.pAdd(centerPos, flax.p(0,  self._logo.height/2 + fontSize*0.6))
                    self.createLabel(pos, fontSize);
                    self.logoClick();
                }
            })
        }else{
            self.createLabel(centerPos);
        }
    },
    createLabel:function(pos, fontSize) {
        if(FRAMEWORK == "cocos") {
            var label = this._label = new cc.LabelTTF("Loading...", "Arial", fontSize || 18);
            label.enableStroke(cc.color(51, 51, 51), 2);
            label.setColor(cc.color(255, 255, 255));
            label.setPosition(pos);
            this.addChild(label, 10);
        } else {
            var label = new flax.Text("Loading...", {font: (fontSize || 18) + "px Arial", fill: 0xFFFFFF, stroke:0x333333, strokeThickness:2});
            label.setPosition(pos);
            label.setAnchorPoint(0.5, 0.5);
            this.addChild(label);
        }
    },
    logoClick:function(){
        //click logo to go
        var logo = this._logo;
        if(FRAMEWORK == "cocos") {
            var listener = cc.EventListener.create({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: false,
                onTouchBegan:function(touch, event)
                {
                    if(flax.rectContainsPoint(flax.getBounds(logo, true), touch.getLocation())){
                        flax.goHomeUrl();
                        return true;
                    }
                    return false;
                }
            });
            cc.eventManager.addListener(listener, this._logo);
        } else {
            logo.interactive = true;
            logo.once(flax.isMobile ? "touchstart" : "mousedown", function () {
                flax.goHomeUrl();
            })
        }
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
        if(loadedCount != null) this._label.setString("Loading: " + (loadedCount + 1) + "/" + count);
        else {
//            var percent = (loadedCount / count * 100) | 0;
//            percent = Math.min(percent, 100);
            this._label.setString("Loading: " + count + "%");
        }
    }
};

flax.Preloader = flax.Scene.extend(flax._preloader);
flax.ResPreloader = flax.Sprite.extend(flax._preloader);

window['flax']['Preloader'] = flax.Preloader;
window['flax']['ResPreloader'] = flax.ResPreloader;
