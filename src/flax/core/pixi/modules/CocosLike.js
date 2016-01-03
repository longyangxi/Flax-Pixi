/**
 * Created by long on 15/10/23.
 */

var flax = flax || {};
flax.Module = flax.Module || {};

flax.Module.CocosLike = {
    /**
     * The total children count
     * */
    childrenCount:0,
    /**
     * If THIS is on the rendering stage
     * */
    running:false,
    _toIndex:null,

    onEnter: function () {
        if(this.anchor == null) this.anchor = new flax.p();
        this.running = true;
        if(!this.children) this.children = [];
        var children = this.children;
        var num = children.length;
        for(var i = 0; i < num; i++)
        {
            var child = children[i];
            child.onEnter();
        }
        if(this._toIndex != null) {
            this.parent.setChildIndex(this, this._toIndex);
            this._toIndex = null;
        }
    },
    onExit:function () {
        this.running = false;
        var children = this.children;
        var num = children.length;
        for(var i = 0; i < num; i++)
        {
            var child = children[i];
            child.onExit();
        }
    },
    removeFromParent : function (clear) {
        if(this.parent){
            this.parent.removeChild(this);
        }
    },
    retain: function () {
        //do nothing
    },
    release: function () {
        //do nothing
    },
    attr: function (params) {
        flax.copyProperties(params, this);
    },
    getPosition: function () {
        return this.position;
    },
    setPosition: function (x, y) {
        if(y == undefined){
            this.position.x = x.x;
            this.position.y = x.y;
        }else{
            this.position.x = x;
            this.position.y = y;
        }
    },
    getPositionX: function () {
        return this.position.x;
    },
    setPositionX: function (x) {
        this.position.x = x;
    },
    getPositionY: function () {
        return this.position.y;
    },
    setPositionY: function (y) {
        this.position.y = y;
    },
    getScale: function () {
        return this.scale;
    },
    setScale: function (x, y) {
        this.scale.x = x;
        this.scale.y = (y == undefined) ? x : y;
    },
    getScaleX: function () {
        return this.scale.x;
    },
    setScaleX: function (x) {
        this.scale.x = x;
    },
    scaleX:{
        get: function () {
            return this.scale.x;
        },
        set: function (s) {
            this.scale.x = s;
        }
    },
    getScaleY: function () {
        return this.scale.y;
    },
    setScaleY: function (y) {
        this.scale.y = y;
    },
    scaleY:{
        get: function () {
            return this.scale.y;
        },
        set: function (s) {
            this.scale.y = s;
        }
    },
    getRotation: function () {
        return this.rotation;
    },
    setRotation: function (r) {
        this.rotation = r;
    },
    getOpacity: function () {
        return Math.floor(this.alpha*255);
    },
    setOpacity: function (o) {
        this.alpha = o/255;
    },
    opacity: {
        get: function () {
            return Math.floor(this.alpha*255);
        },
        set: function (o) {
            this.alpha = o/255;
        }
    },
    isVisible: function () {
        return this.visible;
    },
    setVisible: function (v) {
        this.visible = v;
    },
    zIndex: {
        get: function () {
            return this.parent ? this.parent.getChildIndex(this) : -1;
        },
        set: function (v) {
            if(this.parent) this.parent.setChildIndex(this, v);
            else this._toIndex = v;
        }
    },
    getAnchorPoint: function () {
        return this.anchor;
    },
    setAnchorPoint: function (ax, ay) {
        if(this.anchor == null) this.anchor = new flax.p();
        if(ay == undefined){
            this.anchor.x = ax.x;
            this.anchor.y = ax.y;
        }else{
            this.anchor.x = ax;
            this.anchor.y = ay;
        }
    },
    getAnchorPointInPoints: function () {
        return new flax.p(this.width*this.anchor.x, this.height*this.anchor.y);
    }
}

PIXI.Rectangle.prototype.getCenter = function()
{
    return flax.p(this.x + this.width*0.5, this.y + this.height*0.5);
}