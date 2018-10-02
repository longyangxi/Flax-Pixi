/**
 * Created by long on 15-8-14.
 */
var flax = flax || {};

flax.toClass(PIXI.Container);
flax.toClass(PIXI.particles.ParticleContainer);
flax.toClass(PIXI.Sprite);
flax.toClass(PIXI.Text);
flax.toClass(PIXI.Graphics)

flax.addModule(PIXI.Container, flax.Module.CocosLike, false, false);
flax.addModule(PIXI.Container, flax.Module.Schedule);

PIXI.Container.prototype.removeAllChildren = PIXI.Sprite.prototype.removeChildren;
//PIXI.Container.prototype.convertToWorldSpace = PIXI.Sprite.prototype.toGlobal;
PIXI.Container.prototype.convertToWorldSpace = function (pos) {
    pos = this.toGlobal(pos);
    //if(flax.__scene_ready)
    if(flax.stage){
        pos = flax.stage.toLocal(pos);
    }
    return pos;
}

//PIXI.Container.prototype.convertToNodeSpace = PIXI.Sprite.prototype.toLocal;
PIXI.Container.prototype.convertToNodeSpace = function (pos, from) {
    //if(flax.__scene_ready) {
    if(flax.stage) {
        pos = flax.stage.toGlobal(pos);
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

PIXI.Container.prototype.addChild = function(child) {
    /*copy from pixi begin*/
    var argumentsLength = arguments.length;
    // if there is only one argument we can bypass looping through the them
    if (argumentsLength > 1) {
        // loop through the arguments property and add all children
        // use it the right way (.length and [i]) so that this function can still be optimised by JS runtimes
        for (var i = 0; i < argumentsLength; i++) {
            var c = arguments[i];
            if(c instanceof PIXI.DisplayObject) {
                this.addChild(c);
            } else {
                console.warn("The " + (i + 1) + " parameter is not a PIXI.DisplayObjet when call addchild, will be ignored!");
                continue;
            }
        }
    } else {
        // if the child has a parent then lets remove it as PixiJS objects can only exist in one place
        if (child.parent) {
            child.parent.removeChild(child);
        }

        child.parent = this;
        // ensure child transform will be recalculated
        child.transform._parentID = -1;

        this.children.push(child);

        // ensure bounds will be recalculated
        this._boundsID++;

        // TODO - lets either do all callbacks or all events.. not both!
        this.onChildrenChange(this.children.length - 1);
        child.emit('added', this);

        /** add by flax start **/
        this.childrenCount = this.children.length;
        if(this.running || this == flax.stage){
            child.onEnter();
        }
        return child;
        /** add by flax end **/
    }
    /*copy from pixi end*/
}

PIXI.Container.prototype.addChildAt = function (child, index)
{
    /*copy from pixi begin*/
    if (index < 0 || index > this.children.length) {
        throw new Error(child + 'addChildAt: The index ' + index + ' supplied is out of bounds ' + this.children.length);
    }

    if (child.parent) {
        child.parent.removeChild(child);
    }

    child.parent = this;
    // ensure child transform will be recalculated
    child.transform._parentID = -1;

    this.children.splice(index, 0, child);

    // ensure bounds will be recalculated
    this._boundsID++;

    // TODO - lets either do all callbacks or all events.. not both!
    this.onChildrenChange(index);
    child.emit('added', this);
    /*copy from pixi end*/

    this.childrenCount = this.children.length;
    if(this.running || this == flax.stage){
        child.onEnter();
    }
    return child;
}
PIXI.Container.prototype.removeChild = function removeChild(child) {
    /*copy from pixi begin*/
    var argumentsLength = arguments.length;

    // if there is only one argument we can bypass looping through the them
    if (argumentsLength > 1) {
        // loop through the arguments property and add all children
        // use it the right way (.length and [i]) so that this function can still be optimised by JS runtimes
        for (var i = 0; i < argumentsLength; i++) {
            this.removeChild(arguments[i]);
        }
    } else {
        var index = this.children.indexOf(child);

        if (index === -1) return null;

        child.parent = null;
        // ensure child transform will be recalculated
        child.transform._parentID = -1;
        (0, PIXI.utils.removeItems)(this.children, index, 1);

        // ensure bounds will be recalculated
        this._boundsID++;

        // TODO - lets either do all callbacks or all events.. not both!
        this.onChildrenChange(index);
        child.emit('removed', this);
    }
    /*copy from pixi end*/
    this.childrenCount = this.children.length;
    child.onExit();
    return child;
};
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
    __instanceId: null,
    ctor: function() {
        this.__instanceId = flax.getInstanceId();
        this._super();
    },
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
        this.__instanceId = flax.getInstanceId();
        if(flax.isImageFile(fileOrTexture)){
            fileOrTexture = PIXI.Texture.fromImage(fileOrTexture);
        }else if(typeof fileOrTexture === "string"){
            fileOrTexture = PIXI.Texture.fromFrame(fileOrTexture);
        }
        this._super(fileOrTexture);
        //default anchor is 0.5
        //this.anchor.x = this.anchor.y = 0.5;
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
        flax.currentScene = this;
        //flax.__scene_ready = false;
        //this.scheduleOnce(function () {
        //    //todo, somtimes wrong
        //    flax.currentScene = this;
        //    flax.__scene_ready = true;
        //}, 0.01);
    },
    onExit: function() {
        this._super();
        //flax.__scene_ready = false;
    }
})