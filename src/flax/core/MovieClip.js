/**
 * Created by long on 14-2-14.
 */
var flax = flax || {};

flax.FrameData = flax.Class.extend({
    x:0,
    y:0,
    rotation:0,
    scaleX:1,
    scaleY:1,
    alpha:1.0,
    opacity:255,
    zIndex:-1,
    skewX:0,
    skewY:0,
    //ttf text properties
    font:null,
    fontSize:12,
    fontColor:"",
    textAlign:"",
    textWidth:40,
    textHeight:20,

    _isText:false,
    _data:null,
    _hasSkew:false,

    ctor:function(data){
        this._data = data;
        this.x = parseFloat(data[0]);
        this.y = parseFloat(data[1]);
        this.rotation = parseFloat(data[2]);
        this.scaleX = parseFloat(data[3]);
        this.scaleY = parseFloat(data[4]);
        this.alpha = parseFloat(data[5]);
        this.opacity = Math.round(255*this.alpha);
        if(data.length > 6) this.zIndex = parseInt(data[6]);
        if(data.length > 7) this.skewX = parseFloat(data[7]);
        if(data.length > 8) this.skewY = parseFloat(data[8]);
        this._hasSkew = (data.length > 7 && (this.skewX != 0 || this.skewY != 0));
        //the ttf text info
        if(data.length > 9) {
            this._isText = true;
            this.font = data[9];
            this.fontSize = parseInt(data[10] * flax.resolution);
            this.fontColor = data[11];
            //cocos color
            if(FRAMEWORK == "cocos") this.fontColor = cc.hexToColor(this.fontColor);
            this.textAlign = H_ALIGHS.indexOf(data[12]);
            this.textWidth = parseFloat(data[13]) * flax.resolution;
            this.textHeight = parseFloat(data[14]) * flax.resolution;
        }
    },
    setForChild:function(child)
    {
        child.setScaleX(this.scaleX);
        child.setScaleY(this.scaleY);
        //handle the skew
        if(this._hasSkew){
            //skew in cocos
            if(FRAMEWORK == "cocos"){
                child.setRotationX(this.skewX);
                child.setRotationY(this.skewY);
            //skew in pixi
            }else if(FRAMEWORK == "pixi"){
                if(child.skew){
                    child.skew.x = this.skewX*DEGREE_TO_RADIAN;
                    child.skew.y = this.skewY*DEGREE_TO_RADIAN;
                }else{
                    flax.log("***Warning: this version of pixi has not implemented the skew!")
                }
            }
        } else {
            child.setRotation(this.rotation);
        }

        if(child.alpha != undefined) child.alpha = this.alpha;
        else if(child.setOpacity) child.setOpacity(this.opacity);

        var x = this.x;
        var y = this.y;
        //set the ttf text properties
        if(this.font && child.__isTTF === true)
        {
            //cc.LabelTTF
            if(FRAMEWORK == "cocos") {
                child.setFontName(this.font);
                child.setFontFillColor(this.fontColor);
                child.setHorizontalAlignment(this.textAlign);
                child.setDimensions(this.textWidth, this.textHeight);
                //todo: fix the bug of cocos: no update when the font color changed
                child.setFontSize(this.fontSize - 1);
                child.setFontSize(this.fontSize);
            //PIXI.Text
            } else {
                var styleNow = child.style;
                var fs = this.fontSize + "px " + this.font;
                if(styleNow.font != fs || styleNow.fill != this.fontColor || styleNow.align == this.textAlign) {
                    styleNow.font = fs;
                    styleNow.fill = this.fontColor;
                    styleNow.align = this.textAlign;
                }
                child.style = styleNow;
            }
        }
        child.setPositionX(x);
        child.setPositionY(y);
    },
    clone:function(){
        return new flax.FrameData(this._data);
    },
    destroy: function () {
        this._data = null;
    }
});

flax._movieClip = {
    clsName:"flax.MovieClip",
    sameFpsForChildren:false,//all children use the same fps with this
    createChildFromPool:false,
    _autoPlayChildren:false,//auto play children when play
    namedChildren:null,
    _childrenDefine: null,
//    _stoppingChildren:null,
    _gRect:null,
    _extraChildren:null,
    __isMovieClip:true,
    /**
     * Replace a child with name of childName by an asset of assetID in assetsFile
     * @param {String} childName the child to be replaced
     * @param {String|Display} assetID the new assetID or a DisplayObject
     * @param {String} assetsFile the new asset's assetsFile, if null, use this.assetsFile
     * */
    replaceChild:function(childName, assetID, assetsFile)
    {
        if(!this.running) return false;
        var childDefine = this._childrenDefine[childName];
        if(childDefine == null){
            flax.log("There is no child with named: "+childName +"  in MovieClip: "+this.assetID);
            return false;
        }
        var child = this.namedChildren[childName];
        //console.log(child)
        if(child)
        {
            if(!assetsFile) assetsFile = this.assetsFile;
            var isDisplay = flax.isDisplay(assetID);
            if(!isDisplay) {
                var assetType = flax.assetsManager.getAssetType(assetsFile, assetID);
                if(!assetType){
                    //flax.log("***There is no display with assetID: " + assetID + " in assets: " + assetsFile);
                    return false;
                }
            }
            //todo
            //if(!isDisplay && flax.assetsManager.getAssetType(child.assetsFile, child.assetID) == assetType){
            //    child.setSource(assetsFile, assetID);
            //} else
            {
                var autoPlay = child._autoPlayChildren;
                this.destroyChild(child);
                child = isDisplay ? assetID : flax.assetsManager.createDisplay(assetsFile, assetID, null, this.createChildFromPool);
                child.name = childName;
                this.namedChildren[childName] = child;
                if(child.__isMovieClip === true && !autoPlay) child.autoPlayChildren = this._autoPlayChildren;
                if(this._autoPlayChildren && child.__isFlaxSprite === true) {
                    this.playing ? child.gotoAndPlay(0) : child.gotoAndStop(0);
                }
                this[childName] = child;
                this.addChild(child);
                this.renderFrame(this.currentFrame, true);
            }
        }else{
            childDefine["class"] = assetID;
            childDefine.assetsFile = assetsFile;
        }
        return true;
    },
    getFrameData:function(childName, frame)
    {
        if(!this.define) return null;
        if(this.define && this.define.frames){
            var arr = this.define.frames[frame];
            if(arr) {
                for(var i = 0; i < arr.length; i++) {
                    var d = arr[i];
                    if(d.name == childName) {
                        return d.data;
                    }
                }
            }
        }
        flax.log("This MovieClip maybe is not initialized yet!")
        return null;
    },
    setOpacity: function (opacity) {
        //todo
        if(FRAMEWORK == "cocos") {
            cc.Node.prototype.setOpacity.call(this, opacity);
            for(var k in this.namedChildren){
                var child = this.namedChildren[k];
                if(child.setOpacity) child.setOpacity(opacity);
            }
        }
    },
    setColor: function (color) {
        //todo
        if(FRAMEWORK == "cocos") {
            cc.Node.prototype.setColor.call(this, color);
            for(var k in this.namedChildren){
                var child = this.namedChildren[k];
                if(child.setColor) child.setColor(color);
            }
        }
    },
    /**
     * Stop the child with name at some frame or label on all frames, if just child.gotAndStop(frameOrLabel), it maybe
     * only take effect on some frames instead all frames especially in $ animation
     * @param {String|Sprite} nameOrInstance The child or its name
     * @param {String|Integer} frameOrLabel The frame or label to stop, if null, set random frame
     * */
//    stopChildAt:function(nameOrInstance, frameOrLabel)
//    {
//        var child = null;
//        if(typeof nameOrInstance === "string") {
//            child = this.namedChildren[nameOrInstance];
//            if(child == null){
//                flax.log("***Warning--There is no child with name: " + nameOrInstance);
//                return;
//            }
//        }else if(nameOrInstance.__isFlaxSprite === true) {
//            child = nameOrInstance;
//            if(child.parent != this){
//                flax.log("***Warning--The target is not a child of this!");
//                return;
//            }
//        }else throw 'Invalid child name of instance!'
//        if(frameOrLabel == null) frameOrLabel = flax.randInt(0, child.totalFrames);
//        if(child.gotoAndStop(frameOrLabel)){
//            if(this._stoppingChildren == null) this._stoppingChildren = {};
//            this._stoppingChildren[child.name] = frameOrLabel;
//        }
//    },
//    updateStoppingChildren:function()
//    {
//        if(this._stoppingChildren){
//            for(var childName in this._stoppingChildren){
//                var child = this.namedChildren[childName];
//                if(child){
//                    child.gotoAndStop(this._stoppingChildren[childName]);
//                }
//            }
//        }
//    },
    onInit:function()
    {
        for(var childName in this.namedChildren){
            this.destroyChild(this.namedChildren[childName]);
        }
        this.namedChildren = {};
        this._childrenDefine = this.define['children'];
        this.totalFrames = this.define['totalFrames'];
        this._gRect = flax._strToRect(this.define['rect']);
        this.setContentSize(this._gRect.width, this._gRect.height);
        this._initFrameData();
    },
    _initFrameData:function()
    {
        //Only parse one time for all the instance of this MovieClip
        if(this.define.frames) return;

        var framesDict = {};
        this.define.frames = [];

        for(var frame = 0; frame < this.totalFrames; frame++) {
            var fs = [];
            var fs1 = [];
            for(var childName in this._childrenDefine) {
                var framesData = framesDict[childName];
                //if the child's frames data has not been parsed, then do it
                if(framesData == null) {
                    framesData = [];
                    var fds = this._childrenDefine[childName].frames;
                    var i = -1;
                    while(++i < fds.length){
                        var fd = fds[i];
                        if(fd){
                            fd = new flax.FrameData(fd.split(","));
                            framesData[i] = fd;
                        }
                    }
                    delete this._childrenDefine[childName].frames;
                    framesDict[childName] = framesData;
                }
                //Make the frames ordered by zIndex to create these children in no cocos framework
                var frameData = framesData[frame];
                if(frameData == null) {
                    fs1.push({name: childName, data: null});
                } else {
                    fs[frameData.zIndex] = {name: childName, data: frameData};
                }
            }
            this.define.frames[frame] = fs1.concat(fs);
        }
    },
    onEnter:function()
    {
        this._super();
        this.setContentSize(this._gRect.width, this._gRect.height);
    },
    //addChild: function (child, localZOrder, tag) {
    //    this._super(child, localZOrder, tag);
    //    if(!child.name || (this.namedChildren && !this.namedChildren[child.name])) {
    //        if (!this._extraChildren) this._extraChildren = [];
    //        child.__eIndex = localZOrder || this.childrenCount - 1;
    //        this._extraChildren.push(child);
    //    }
    //},
    addChildAt: function (child, index) {
        this._super(child, index);
        if(!child.name || (this.namedChildren && !this.namedChildren[child.name])) {
            if (!this._extraChildren) this._extraChildren = [];
            child.__eIndex = index;
            this._extraChildren.push(child);
        }
    },
    /**
     * Special for PIXI to make the anchor sense for Container
     * */
    _updateTransform: function () {

        var pt = this.parent.worldTransform;
        var wt = this.worldTransform;
        var dx = this._gRect.width * this.anchor.x;
        var dy = this._gRect.height * this.anchor.y;
        wt.tx -= dx * pt.a + dy * pt.c;
        wt.ty -= dx * pt.b + dy * pt.d;
    },
    doRenderFrame:function(frame)
    {
        var frames = this.define.frames[frame];
        var count = frames.length;
        for(var i = 0;  i < count; i++) {
            var d = frames[i];
            if(d == null) {
                continue;
                throw "Please check if there are duplicated children names in this MovieClip when export from flash with flax tool!";
            }
            var childName = d.name;
            var frameData = d.data;
            var child = this.namedChildren[childName];

            //Ignore the invisible child
            //if(child && !child.visible) continue;

            if(frameData) {
                var childDefine = this._childrenDefine[childName];
                if(child == null) {
                    //hadle the label text
                    if(childDefine.text != null){
                        child = flax.createLabel(this.assetsFile, frameData, childDefine);
                        child.name = childName;
                    }else{
                        child = flax.assetsManager.createDisplay(childDefine.assetsFile || this.assetsFile, childDefine["class"], {name: childName}, this.createChildFromPool);
                    }

                    this.namedChildren[childName] = child;
                    this[childName] = child;
                    this.onNewChild(child);
                }

                frameData.setForChild(child);
                //all children use the same fps with this
                if(this.sameFpsForChildren) child.fps = this.fps;
                //To fix the zIndex bug when use the old version tool
                var zIndex = (frameData.zIndex == -1) ? childDefine['zIndex'] : frameData.zIndex;

                if(child.mask && FRAMEWORK == "cocos") {
                    if(child.mask.parent != this){
                        child.mask.removeFromParent(false);
                        this.addChild(child.mask, zIndex);
                    }else if(child.mask.zIndex != zIndex) {
                        child.mask.zIndex = zIndex;
                    }
                } else {
                    if(child.parent != this){
                        child.removeFromParent(false);
                        if(FRAMEWORK == "cocos") this.addChild(child, zIndex);
                        else this.addChildAt(child, zIndex);
                    }else if(child.zIndex != zIndex) {
                        child.zIndex = zIndex;
                    }
                }
            }else if(child) {
                this.destroyChild(child);
            }
        }

        if(this._extraChildren) {
            for(var i = 0; i < this._extraChildren.length; i++) {
                var child = this._extraChildren[i];
                child.zIndex = child.__eIndex;
            }
        }
    },
    /**
     * Manually destroy the child
     * */
    destroyChild: function (child) {
        var childName = child.name;
        if(this.namedChildren && this.namedChildren[childName] == child) {
            delete this.namedChildren[childName];
            delete this[childName];
        }
        if(child.destroy) child.destroy();
        else child.removeFromParent(true);
    },
    stop:function()
    {
        this._super();
        if(this._autoPlayChildren && this.namedChildren) {
            for(var key in this.namedChildren) {
                var child = this.namedChildren[key];
                if(child.__isFlaxSprite === true) {
                    child.stop();
                }
            }
        }
    },
    play:function()
    {
        this._super();
        if(this._autoPlayChildren && this.namedChildren) {
            for(var key in this.namedChildren) {
                var child = this.namedChildren[key];
                if(child.__isFlaxSprite === true) {
                    child.play();
                }
            }
        }
    },
    getAutoPlayChildren:function()
    {
        return this._autoPlayChildren;
    },
    setAutoPlayChildren:function(v)
    {
        if(this._autoPlayChildren == v) return;
        this._autoPlayChildren = v;
        if(!this.namedChildren) return;
        for(var key in this.namedChildren) {
            var child = this.namedChildren[key];
            if(child.__isMovieClip === true) {
                child.setAutoPlayChildren(v);
            }
            if(child.__isFlaxSprite) {
                v ? child.play() : child.stop();
            }
        }
    },
    onNewChild:function(child)
    {
        if(child.__isMovieClip === true) child.autoPlayChildren = this._autoPlayChildren;
        if(this._autoPlayChildren && child.__isFlaxSprite === true) {
            this.playing ? child.gotoAndPlay(0) : child.gotoAndStop(0);
        }
//        if(this._stoppingChildren && child.__isFlaxSprite === true){
//            var frameOrLabel = this._stoppingChildren[child.name];
//            if(frameOrLabel != null) child.gotoAndStop(frameOrLabel);
//        }
//        if(child.__isMovieClip === true && child._stoppingChildren){
//            child.updateStoppingChildren();
//        }
    },
    getDefine:function()
    {
        var define = flax.assetsManager.getMc(this.assetsFile, this.assetID);
        if(define == null) throw "There is no MovieClip named: " + this.assetID + " in assets: " + this.assetsFile + ", or make sure this class extends from the proper class!";
        return define;
    },
    getChild:function(name, nest)
    {
        if(!this.namedChildren) return null;
        if(nest === undefined) nest = true;
        var child = this.namedChildren[name];
        if(child) return child;
        if(!nest) return null;
        for(var key in this.namedChildren) {
            child = this.namedChildren[key];
            if(child.getChild) {
                child = child.getChild(name, nest);
                if(child) return child;
            }
        }
        return null;
    },
    getChildByAssetID:function(id)
    {
        if(!this.namedChildren) return null;
        var child = null;
        for(var key in this.namedChildren) {
            child = this.namedChildren[key];
            if(child.assetID == id){
                return child;
            }
        }
        return null;
    },
    getLabelText:function(labelName, ifNest)
    {
        var label = this.getChild(labelName, ifNest === undefined ? true : ifNest);
        if(label && (label instanceof flax.BitmapLabel || label.__isTTF === true)) return label.getString();
        return null;
    },
    setLabelText:function(labelName, text, ifNest)
    {
        var label = this.getChild(labelName, ifNest === undefined ? true : ifNest);
        if(label && (label instanceof flax.BitmapLabel || label.__isTTF === true)) {
            label.setString(text);
            return label;
        }
        return null;
    },
    setFPS:function(f)
    {
        if(this._fps == f)  return;
        this._fps = f;
        this.updateSchedule();
        if(!this.sameFpsForChildren || !this.namedChildren) return;
        var child = null;
        for(var key in this.namedChildren) {
            child = this.namedChildren[key];
            child.fps = this._fps;
        }
    },
    //setStatic: function (s) {
    //    if(this.__static == s) return;
    //    this.__static = s;
    //    var child = null;
    //    for(var key in this.namedChildren) {
    //        child = this.namedChildren[key];
    //        child.setStatic(s);
    //    }
    //},
    //todo, not verified yet
    //getRect:function(coordinate)
    //{
    //    var rect = null;
    //    for (var i = 0; i < this.children.length; i++) {
    //        var child = this.children[i];
    //        var r = flax.getRect(child, coordinate);
    //        if(rect) rect = flax.rectUnion(r, rect);
    //        else rect = r;
    //    }
    //    return rect;
    //},
    reset:function()
    {
        this._super();
        this.sameFpsForChildren = false;
        this.createChildFromPool = false;
        this._autoPlayChildren = false;
        if(RESET_FRAME_ON_RECYCLE){
            for(var key in this.namedChildren) {
                var child = this.namedChildren[key];
                if(child.__isFlaxSprite === true) {
                    this.currentFrame = 0;
                    //child.gotoAndStop(0);
                }
            }
        }
    },
    onExit: function () {
        this._super();
        for(var childName in this.namedChildren){
            delete this.namedChildren[childName];
            delete this[childName];
        }
        this._childrenDefine = null;
        this._gRect = null;
        this._extraChildren = null;
        //In cocos, remove all children
        if(this.autoRecycle && FRAMEWORK == "cocos")
            this.removeAllChildren(true);
    }
};

flax.MovieClip = flax.FlaxContainer.extend(flax._movieClip);
flax.MovieClip.create = function(assetsFile, assetID)
{
    var mc = new flax.MovieClip(assetsFile, assetID);
    mc.clsName = "flax.MovieClip";
    return mc;
};

var _p = flax.MovieClip.prototype;
/** @expose */
_p.autoPlayChildren;
flax.defineGetterSetter(_p, "autoPlayChildren", _p.getAutoPlayChildren, _p.setAutoPlayChildren);
flax.defineGetterSetter(_p, "opacity", _p.getOpacity, _p.setOpacity);

window['flax']['MovieClip'] = flax.MovieClip;

///////////////////////////////////////////////////////////////////////////////////////////////

if(FRAMEWORK == "cocos"){
    flax.MovieClipBatch = flax.FlaxSpriteBatch.extend(flax._movieClip);
    flax.MovieClipBatch.create = function(assetsFile, assetID)
    {
        var mc = new flax.MovieClipBatch(assetsFile, assetID);
        mc.clsName = "flax.MovieClipBatch";
        return mc;
    };

    _p = flax.MovieClipBatch.prototype;
    /** @expose */
    _p.autoPlayChildren;
    flax.defineGetterSetter(_p, "autoPlayChildren", _p.getAutoPlayChildren, _p.setAutoPlayChildren);
    flax.defineGetterSetter(_p, "opacity", _p.getOpacity, _p.setOpacity);

    window['flax']['MovieClipBatch'] = flax.MovieClipBatch;
}