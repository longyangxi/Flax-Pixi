/**
 * Created by long on 15-8-14.
 */
var flax = flax || {};

flax.toClass(PIXI.Container);
flax.toClass(PIXI.ParticleContainer);
flax.toClass(PIXI.Sprite);
flax.toClass(PIXI.Text);

flax.addModule(PIXI.Container, flax.Module.CocosLike, false, false);
flax.addModule(PIXI.Container, flax.Module.Schedule);
flax.addModule(PIXI.Container, flax.Module.Action);

PIXI.Container.prototype.removeAllChildren = PIXI.Sprite.prototype.removeChildren;
//PIXI.Container.prototype.convertToWorldSpace = PIXI.Sprite.prototype.toGlobal;
PIXI.Container.prototype.convertToWorldSpace = function (pos) {
    pos = this.toGlobal(pos);
    if(flax.__scene_ready) {
        pos = flax.currentScene.toLocal(pos);
    }
    return pos;
}

//PIXI.Container.prototype.convertToNodeSpace = PIXI.Sprite.prototype.toLocal;
PIXI.Container.prototype.convertToNodeSpace = function (pos, from) {
    if(flax.__scene_ready) {
        pos = flax.currentScene.toGlobal(pos);
    }
    pos = this.toLocal(pos, from);
    return pos;
}

PIXI.Container.prototype.getContentSize = PIXI.Sprite.prototype.getBounds;
PIXI.Container.prototype.setContentSize = function(w, h){/**do nothing now*/};

///**
//* Override the function to invoke a sub function of _updateTransform
//* */
//PIXI.Container.prototype.updateTransform = function ()
//{
//    if (!this.visible)
//    {
//        return;
//    }
//
//    this.displayObjectUpdateTransform();
//
//    /**
//     * Add the hook for sub class to update transform, especially for anchor
//     * */
//    if(this._updateTransform) {
//        this._updateTransform();
//    }
//
//    for (var i = 0, j = this.children.length; i < j; ++i)
//    {
//        this.children[i].updateTransform();
//    }
//
//    if(this.scale.x == undefined) {
//        throw "The scale of a DisplayObject must be a Point!"
//    }
//};
//// performance increase to avoid using call.. (10x faster)
//PIXI.Container.prototype.containerUpdateTransform = PIXI.Container.prototype.updateTransform;


PIXI.Container.prototype.addChildAt = function (child, index)
{
    /*copy from pixi begin*/
    // prevent adding self as child
    if (child === this)
    {
        return child;
    }

    if (index >= 0 && index <= this.children.length)
    {
        if (child.parent)
        {
            child.parent.removeChild(child);
        }

        child.parent = this;

        this.children.splice(index, 0, child);
        this.onChildrenChange(index);

        child.emit('added', this);

        //return child;
    }
    else
    {
        throw new Error(child + 'addChildAt: The index '+ index +' supplied is out of bounds ' + this.children.length);
    }
    /*copy from pixi end*/

    this.childrenCount = this.children.length;
    if(this.running || this == flax.stage){
        child.onEnter();
    }
    return child;
}
PIXI.Container.prototype.removeChildAt = function(index) {
    /*copy from pixi begin*/
    var child = this.getChildAt(index);

    child.parent = null;
    this.children.splice(index, 1);
    this.onChildrenChange(index);

    child.emit('removed', this);

    /*copy from pixi end*/
    this.childrenCount = this.children.length;
    child.onExit();
    return child;
}
PIXI.Container.prototype.removeChildren = function (beginIndex, endIndex) {
    /*copy from pixi begin*/
    var begin = beginIndex || 0;
    var end = typeof endIndex === 'number' ? endIndex : this.children.length;
    var range = end - begin;
    var removed, i;

    if (range > 0 && range <= end)
    {
        removed = this.children.splice(begin, range);

        for (i = 0; i < removed.length; ++i)
        {
            removed[i].parent = null;
        }

        this.onChildrenChange(beginIndex);

        for (i = 0; i < removed.length; ++i)
        {
            removed[i].emit('removed', this);
        }

        //return removed;
    }
    else if (range === 0 && this.children.length === 0)
    {
        //return [];
        removed = [];
    }
    else
    {
        throw new RangeError('removeChildren: numeric values are outside the acceptable range.');
    }
    /*copy from pixi end*/

    this.childrenCount = this.children.length;

    var len = removed.length;
    for (var i = 0; i < len; ++i)
    {
        var child = removed[i];
        if(child) child.onExit();
    }
    return removed;
}

flax.Container = PIXI.Container.extend({
    onEnter: function () {
        if(!(this instanceof flax.FlaxContainer)) {
            flax.callModuleOnEnter(this);
        }
        this._super();
    },
    onExit: function () {
        if(!(this instanceof flax.FlaxContainer)) {
            flax.callModuleOnExit(this);
        }
        this._super();
    }
})

/////////////////////////////////////////////////////////////////////////////////////

flax.Sprite = PIXI.Sprite.extend({
    ctor: function (fileOrTexture) {
        if(flax.isImageFile(fileOrTexture)){
            fileOrTexture = PIXI.Texture.fromImage(fileOrTexture);
        }else if(typeof fileOrTexture === "string"){
            fileOrTexture = PIXI.Texture.fromFrame(fileOrTexture);
        }
        this._super(fileOrTexture);
        //default anchor is 0.5
        this.anchor.x = this.anchor.y = 0.5;
    },
    onEnter: function () {
        if(!(this instanceof flax.FlaxSprite)) {
            flax.callModuleOnEnter(this);
        }
        this._super();
    },
    onExit: function () {
        if(!(this instanceof flax.FlaxSprite)) {
            flax.callModuleOnExit(this)
        }
        this._super();
    }
})

flax.SpriteBatchNode = flax.Sprite;
flax.FlaxSpriteBatch = flax.Sprite;

/////////////////////////////////////////////////////////////////////////////////////

flax.Graphics = PIXI.Graphics;

flax.Text = PIXI.Text.extend({
    destroy: function (destroyBaseTexture) {
        if(this.parent) this.parent.removeChild(this);
        this.parent = null;
        this._super(destroyBaseTexture);
    }
})

/////////////////////////////////////////////////////////////////////////////////////

flax.Scene = flax.Container.extend({
    name:null,
    onEnter: function () {
        this._super();
        flax.__scene_ready = false;
        this.scheduleOnce(function () {
            //todo, somtimes wrong
            flax.currentScene = this;
            flax.__scene_ready = true;
        }, 0.01);
    }
    //todo more
})