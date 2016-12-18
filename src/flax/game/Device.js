/**
 * Created by long on 15-9-18.
 */

var flax = flax || {};

flax.device = {
    osVersion:"unknown",
    landscape:false,
    onRotate:null,
    _imgTip:null,
    _oldGamePauseState:false,
    init:function(){
        this.onRotate = new signals.Signal();
        if(flax.sys.isNative) return;
        this._checkOSVersion();
        flax.bgColor = this._getBackgroundColor();
        if(!this._imgTip && flax.sys.isMobile){
            if(flax.game.config["rotateImg"]){
                var w = flax.stageRect.width + 10;
                var h = flax.stageRect.height + 10;
                if(FRAMEWORK == "cocos") {
                    this._imgTip = new cc.LayerColor(flax.bgColor, w, h);
                } else {
                    var imgTip = new flax.Graphics();
                    imgTip.beginFill(flax.bgColor);
                    imgTip.drawRect(0, 0, w, h);
                    imgTip.endFill();
                    this._imgTip = imgTip;
                }
                var img =  new flax.Sprite(flax.game.config["rotateImg"]);
                img.setAnchorPoint(0.5, 0.5);
                img.setPosition(flax.visibleRect.center);
                this._imgTip.__icon = img;
                this._imgTip.addChild(img);
            }
            var orientationEvent = ("orientationchange" in window) ? "orientationchange" : "resize";
            window.addEventListener(orientationEvent, this._showOrientaionTip, false);
            this._showOrientaionTip();
        }
        if(this._imgTip){
            this._imgTip.removeFromParent();
            flax.currentScene.addChild(this._imgTip);
        }
    },
    isCorrectDirection: function () {
        return flax.game.config["landscape"] == this.landscape;
    },
    showTipTop: function () {
        if(this._imgTip && this._imgTip.parent) {
            if(FRAMEWORK == "cocos") this._imgTip.zIndex = 9999999;
            else this._imgTip.parent.setChildIndex(this._imgTip, this._imgTip.parent.childrenCount - 1);
        }
    },
    _showOrientaionTip:function(){
        var self = flax.device;
        //Math.abs(window.orientation) = 90 || 0
        var newLandscape = (Math.abs(window.orientation) == 90);
        var landscapeConfiged = flax.game.config["landscape"];
        if(self._imgTip){
            var notLandscapeAsSet = (landscapeConfiged != newLandscape);
            self._imgTip.visible = notLandscapeAsSet;
            if(FRAMEWORK == "cocos")
                self._imgTip.__icon.rotation = (newLandscape ? -90 : 0);
            //document.body.scrollTop = 0;
            if(self._imgTip.visible) {
                //if(self.landscape != newLandscape) self._oldGamePauseState = flax.director.isPaused();
                //flax.director.pause();
            }else if(!self._oldGamePauseState){
                //flax.director.resume();
            }
            if(flax.inputManager) flax.inputManager.enabled = !self._imgTip.visible;
        }
        self.landscape = newLandscape;

        self.showTipTop();

        //if(landscapeConfiged == newLandscape){
        //    flax.view.setDesignResolutionSize(flax.designedStageSize.width, flax.designedStageSize.height, flax.view.getResolutionPolicy());
        //}else{
        //    flax.view.setDesignResolutionSize(flax.designedStageSize.height, flax.designedStageSize.width, flax.view.getResolutionPolicy());
        //}
        //flax.stageRect = flax.rect(flax.visibleRect.bottomLeft.x, flax.visibleRect.bottomLeft.y, flax.visibleRect.width, flax.visibleRect.height);

        self.onRotate.dispatch(newLandscape);
    },
    _checkOSVersion:function(){
        if(flax.sys.isNative) return;
        var ua = navigator.userAgent;
        var i;
        if(ua.match(/iPad/i) || ua.match(/iPhone/i)){
            i = ua.indexOf( 'OS ' );
            //        flax.sys.os = flax.sys.OS_IOS;
            if(i > -1) this.osVersion = ua.substr( i + 3, 3 ).replace( '_', '.' );
        }else if(ua.match(/Android/i)){
            i = ua.indexOf( 'Android ' );
            //        flax.sys.os = flax.sys.OS_ANDROID;
            if(i > -1) this.osVersion = ua.substr( i + 8, 3 );
        }
    },
    _getBackgroundColor: function () {
        var bgColor = document.body.style.backgroundColor;
        //var canvasNode = document.getElementById(flax.game.config["id"]);
        //canvasNode.style.backgroundColor = bgColor;//'transparent'
        bgColor = bgColor.replace("rgb(","");
        bgColor = bgColor.replace(")", "");
        bgColor = bgColor.split(",");
        var r = parseInt(bgColor[0]);
        var g = parseInt(bgColor[1]);
        var b = parseInt(bgColor[2]);
        if(FRAMEWORK == "cocos") return cc.color(r, g, b);
        return parseInt(rgbToHex(r, g, b), 16);
    }
}