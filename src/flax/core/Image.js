/**
 * Created by long on 14-12-27.
 */
flax._image = {
    define:null,
    name:null,
    assetsFile:null,
    assetID:null,
    clsName:"flax.Image",
    autoRecycle:false,
    _anchorBindings:null,
    //__instanceId:null,
    _imgFile:null,
    _sx:1.0,
    _sy:1.0,
    _theSize:null,
    _destroyed:false,

    ctor:function(assetsFileOrUrl, assetID) {
        if(this instanceof flax.Sprite) this._super();
        else {
            //TODO, not implement in PIXI for Scale9Sprite
            this.define = flax.assetsManager.getDisplayDefine(assetsFile, assetID);
            //get the resource folder
            this._imgFile = this.define['url'];
            this._super(this._imgFile, flax.rect(), this.define['scale9']);
            this.clsName = "flax.Scale9Image";
        }
        if(!assetsFileOrUrl) throw "Please give assetsFile or url to me!";
        this._anchorBindings = [];
        this.setSource(assetsFileOrUrl, assetID);
    },
    /**
     * @param {String} assetsFileOrUrl the assets file path
     * @param {String} assetID the display id in the assets file
     * */
    setSource:function(assetsFileOrUrl, assetID)
    {
        if(assetsFileOrUrl == null){
            throw 'assetsFile or url can not be null!';
            return;
        }
        if(this.assetsFile == assetsFileOrUrl && this.assetID == assetID) return;

        var imgFile = null;

        if(!flax.isImageFile(assetsFileOrUrl)) {
            this.define = flax.assetsManager.getDisplayDefine(assetsFileOrUrl, assetID);
            if(flax.isImageFile(this.define['url'])) {
                imgFile = this.define['url'];
            }
        } else  {
            imgFile = assetsFileOrUrl;
            this.define = null;
        }

        if(this.define) {
            this.assetsFile = assetsFileOrUrl;
            this.assetID = assetID;
        }

        if(flax.Scale9Image && this instanceof flax.Scale9Image) {
            //TODO
            //this.initWithFile(this._imgFile, flax.rect(), this.define['scale9']);
            //if(flax.sys.isNative) this.onImgLoaded();
            //else this.addEventListener("load", this.onImgLoaded, this);
            //this.onImgLoaded();
        }
        //set the anchor
        if(this.define) {
            var anchorX = this.define['anchorX'];
            var anchorY = this.define['anchorY'];
            if(!isNaN(anchorX) && !isNaN(anchorY)) {
                this.setAnchorPoint(anchorX, anchorY);
            }
        }

        var self = this;
        if(flax.isImageFile(imgFile)) {
            var imgRes = flax.loader.getRes(imgFile);
            if(imgRes) {
                this.onImgLoaded(imgFile);
            } else {
                flax.loader.load(imgFile, function(resources) {
                    self.onImgLoaded(imgFile)
                });
            }
        } else if(assetsFileOrUrl && assetID){
            this.texture = flax.assetsManager.getTexture(assetsFileOrUrl, assetID);
            this._updateSize();
        } else {
            throw "Give flax.image a url or assetID";
        }

        this.onInit();
        if(this.__pool__id__ == null) this.__pool__id__ = this.assetID;
    },
    onImgLoaded:function(imgFile)
    {
        var res = flax.loader.getRes(imgFile);
        if(!res) return;

        this.texture = res.texture;

        this._updateSize();

        this._imgFile = imgFile;
    },
    destroy:function()
    {
        if(this._destroyed) return;
        this._destroyed = true;
        if(this.autoRecycle) {
            var pool = flax.ObjectPool.get(this.assetsFile, this.clsName, this.__pool__id__ || "");
            pool.recycle(this);
        }
        this.removeFromParent();
    },
    onEnter:function()
    {
        this._super();
        this._destroyed = false;
    },
    onExit:function()
    {
        this._super();

        if(flax.inputManager) flax.inputManager.removeListener(this);

        //remove anchors
        var node = null;
        var i = -1;
        var n = this._anchorBindings.length;
        while(++i < n) {
            node = this._anchorBindings[i];
            if(node.destroy) node.destroy();
            else node.removeFromParent(true);
            delete  node.__anchor__;
        }
        this._anchorBindings.length = 0;
        this.define = null;
    },
    /**
     * Do some thins when the object recycled by the pool
     * */
    reset:function()
    {
        //when recycled, reset all the prarams as default
        this.autoRecycle = false;
        this.setScale(1);
        this.opacity = 255;
        this.rotation = 0;
        this.setPosition(0, 0);
    },
    getAnchor:function(name)
    {
        if(!this.define) return this.anchor;

        if(this.define['anchors']){
            var an = this.define['anchors'][name];
            if(an != null) {
                return new flax.Anchor(an[0]);
            }
        }
        return null;
    },
    bindAnchor:function(anchorName, node, alwaysBind)
    {
        if(!this.define) return;

        if(!this.define['anchors']) {
            console.log(this.assetID+": there is no any anchor!");
            return false;
        }
        if(this.define['anchors'][anchorName] == null) {
            console.log(this.assetID+": there is no anchor named "+anchorName);
            return false;
        }
        if(node == null) throw "Node can't be null!";
        if(this._anchorBindings.indexOf(node) > -1) {
            console.log(this.assetID+": anchor has been bound, "+anchorName);
            return false;
        }
        if(alwaysBind !== false) this._anchorBindings.push(node);
        node.__anchor__ = anchorName;
        this._updateAnchorNode(node, this.getAnchor(anchorName));
        if(node.parent != this){
            node.removeFromParent(false);
            this.addChild(node);
        }
        return true;
    },
    _updateAnchorNode:function(node, anchor)
    {
        if(anchor == null) return;
        node.x = anchor.x;
        node.y = anchor.y;
        node.zIndex = anchor.zIndex;
        node.rotation = anchor.rotation;
    },
    //setScaleX:function(sx)
    //{
    //    if(flax.Scale9Image && this instanceof flax.Scale9Image){
    //        this._sx = sx;
    //        this._updateSize(sx, this._sy);
    //    }else{
    //        this._super(sx);
    //        //cc.Node.prototype.setScaleX.call(this, sx);
    //    }
    //},
    //setScaleY:function(sy)
    //{
    //    if(flax.Scale9Image && this instanceof flax.Scale9Image){
    //        this._sy = sy;
    //        this._updateSize(this._sx, sy);
    //    }else{
    //        this._super(sy);
    //        //cc.Node.prototype.setScaleY.call(this, sy);
    //    }
    //},
    _updateSize:function()
    {
        //if(this._theSize == null) return;
        //this.width = this._theSize.x * sx;
        //this.height = this._theSize.y * sy;
        if (!this._theSize) {
            this._theSize = flax.p(this.texture.width, this.texture.height);
        } else {
            this.setScale(this._theSize.x / this.texture.width, this._theSize.y / this.texture.height)
        }
    },
    onInit:function()
    {

    }
};

flax.Image = flax.Sprite.extend(flax._image);
window['flax']['Image'] = flax.Image;


var _p = flax.Image.prototype;
//flax.defineGetterSetter(_p, "scale", _p.getScale, _p.setScale);
flax.defineGetterSetter(_p, "scaleX", _p.getScaleX, _p.setScaleX);
flax.defineGetterSetter(_p, "scaleY", _p.getScaleY, _p.setScaleY);


if(flax.Scale9Sprite) {
    flax.Scale9Image = flax.Scale9Sprite.extend(flax._image);

    _p = flax.Scale9Image.prototype;
    //flax.defineGetterSetter(_p, "scale", _p.getScale, _p.setScale);
    flax.defineGetterSetter(_p, "scaleX", _p.getScaleX, _p.setScaleX);
    flax.defineGetterSetter(_p, "scaleY", _p.getScaleY, _p.setScaleY);

    window['flax']['Scale9Image'] = flax.Scale9Image;
}