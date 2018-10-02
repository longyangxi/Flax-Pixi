/**
 * @author       Longsir <longames@qq.com>
 * @copyright    2015 Longames Ltd.
 * @github       {@link https://github.com/longyangxi/flax.js}
 * @flax         {@link http://flax.so}
 * @license      MIT License: {@link http:http://mit-license.org/}
 */


var flax = flax || {};
flax.mousePos = null;

var InputType =
{
    press:     flax.isMobile ? "touchstart"      : "mousedown",
    up:        flax.isMobile ? "touchend"        : "mouseup",
    click:     flax.isMobile ? "tap"             : "click",
    move:      flax.isMobile ? "touchmove"       : "mousemove",
    upOutside: flax.isMobile ? "touchendoutside" : "mouseupoutside",
    mouseOver: flax.isMobile ? null              : "mouseover",
    mouseOut:  flax.isMobile ? null              : "mouseout",
    keyPress:  "keyPress",
    keyUp:     "keyUp"
};

flax.InputManager = flax.Container.extend({
    /**
     * Global switch for touch
     * */
    enabled:true,
    /**
     * Switch for the null listening target
     * */
    nullEnabled:true,
    inTouching:false,
    inDragging:false,
    justDragged:false,
    justDragDist:0,
    justDragOff:0,
    /**
     * If set, only the target can receive the touch event
     * */
    soleTarget:null,
    _touchBeginPos:null,
    _callbacks:{},
    _keyboardCallbacks:{},
    _keyboardListener:null,

    ctor:function()
    {
        this._super();
        this.inTouching = false;
        this._callbacks = {};
        this._keyboardCallbacks = {};
        this._keyboardListener = null;
    },
    onEnter:function()
    {
        this._super();

        //Set the stage click area
        flax.stage.hitArea = flax.stageRect;
        flax.stage.interactive = true;

        var self = this;

        flax.stage.on(InputType.press, function(event) {
            if(flax.currentScene) flax.mousePos = flax.currentScene.toLocal(event.data.global);
            else flax.mousePos = event.data.global;
            if (!self.enabled) return false;
            if(!self.nullEnabled) return false;
            self.inDragging = false;
            self.justDragged = false;
            self.inTouching = true;
        }, this);

        flax.stage.on(InputType.up, function(event) {
            self.inDragging = false;
            self.inTouching = false;
        }, this);

        flax.stage.on(InputType.move, function(event) {
            if(flax.currentScene) flax.mousePos = flax.currentScene.toLocal(event.data.global);
            else flax.mousePos = event.data.global;
            self.inDragging = true;
            self.justDragged = true;
        }, this);
    },
    onExit:function(){
        this._super();
        this.removeAllTouchListeners();
        this.removeAllKeyboardListeners();
        this._masks = null;
        this._callbacks = null;
        this._keyboardCallbacks = null;
        this._keyboardListener = null;
        this.soleTarget = null;
    },
    /**
     * @param{cc.Node} target the target want to receive the touch event, if target is null, then global event will be triggered
     *                       for keyboard event, the target will be the context if the real context is null
     * @param{function} func function to call back, for touch event: func(touch, event),{event.currentTarget, event.target}
     *                       for keyboard event: func(key){};
     * @param{string} type event type as InputType said
     * @param{cc.Node} context the callback context of "THIS", if null, use target as the context
     * Note: If the target is null, then listen the global event, in this instance, be sure to REMOVE the listener manually
     * on the sprite exit, otherwise, a new sprite will not receive the event again!
     * */
    addListener:function(target, func, type, context)
    {
        if(func == null) {
            throw "Event callback can not be null!"
        }
        var isKeyboardEvent = (type == InputType.keyPress || type == InputType.keyUp);

        if(target == null) {
            target = this;
            if(!isKeyboardEvent) {
                throw "Listening target is null, make sure you want to listen to the full screen input!";
            }
        }

        if(isKeyboardEvent) {
            throw "todo for keyboard event!";
        }

        if(type == null) type = InputType.click;

        if(target.__instanceId == null) target.__instanceId = flax.getInstanceId();

        var arr = this._callbacks[target.__instanceId];
        if(arr == null){
            arr = [];
            this._callbacks[target.__instanceId] = arr;
            if(target != this) {
                //var listener =  this._createListener(target, this.swallowTouches);
                //this._touchListeners[target.__instanceId] = listener;
            }
        }
        //Make sure no duplicated listener
        var i = arr.length;
        while(i--){
            if(arr[i].type == type && arr[i].func == func)  return;
        }
        var callback = {target:target, type:type, func:func, context:context || target};
        arr.push(callback);

        target.interactive = true;

        //target.on(type, function(event) {
        //    if (this.soleTarget && this.soleTarget != event.target) return;
        //    //todo, memory leak possible if not destroy?
        //    var touch = new flax.Touch(event);
        //    event.currentTarget = event.currentTarget;
        //    if(event.target == null) console.log("fuck...", event.currentTarget == flax.currentScene)
        //    func.apply(context, [touch, event]);
        //});

        //target.on(type, this._evtHub, callback.context);
        target.on(type, func, callback.context);
    },
    //_evtHub: function(event) {
    //
    //    var inputManager = flax.inputManager;
    //    if(!inputManager) return;
    //
    //    if(inputManager.soleTarget && inputManager.soleTarget != event.target) return;
    //
    //    var target = event.currentTarget = event.currentTarget;
    //
    //    //if(target == null) return;
    //
    //    var touch = new flax.Touch(event);
    //
    //    var callbacks = inputManager._callbacks[target.__instanceId];
    //
    //    for(var i = 0; i < callbacks.length; i++) {
    //        var callback = callbacks[i];
    //
    //        if(event.type != callback.type) continue;
    //
    //        callback.func.apply(callback.context, [touch, event]);
    //
    //        if(event.type == InputType.press) {
    //            if(inputManager.soleTarget) inputManager.soleTarget = null;
    //        }
    //    }
    //},
    removeListener:function(target, func, type, context)
    {
        if(!this.running) return;
        if(target == null) target = this;
        var calls = this._callbacks[target.__instanceId];
        if(calls && (type == null || (type != InputType.keyPress && type != InputType.keyUp))) {
            if(this.soleTarget == target) this.soleTarget = null;
            var call = null;
            var i = calls.length;
            if(func || type) {
                while(i--){
                    call = calls[i];
                    if((!type || call.type == type) && (!func || call.func == func)) {
                        calls.splice(i, 1);
                    }
                }
            }
            if(calls.length == 0 || (!func && !type)){
                delete this._callbacks[target.__instanceId];
            }
        }
        if(func && (type == null || type == InputType.keyPress || type == InputType.keyUp)){
            if(type == null) {
                calls = this._keyboardCallbacks[InputType.keyPress] || [];
                calls = calls.concat(this._keyboardCallbacks[InputType.keyUp] || []);
            }else{
                calls = this._keyboardCallbacks[type];
            }
            if(calls && calls.length){
                var call = null;
                var i = calls.length;
                while(i--){
                    call = calls[i];
                    if(call.func == func) calls.splice(i, 1);
                }
            }
        }

        if(type) target.off(type, func, context);

        if(!type || this._callbacks[target.__instanceId] == null) target.removeAllListeners();
    },
    removeAllTouchListeners:function()
    {
        for(var id in this._callbacks) {
            var cs = this._callbacks[id];
            for(var i in cs) {
                var callback = cs[i];
                callback.target.off(callback.type, callback.func, callback.context);
            }
        }
        this.soleTarget = null;
        this._callbacks = {};
    },
    removeAllKeyboardListeners:function()
    {
        this._keyboardCallbacks = {};
        if(this._keyboardListener) {
            this._keyboardListener = null;
        }
    },
    /**
     * Add a Sprite node which will permitted the lower sprite to get touch event callback
     * */
    addMask:function(mask){
        //if(this._masks.indexOf(mask) > -1) return;
        //this._masks.push(mask);
        //mask.__isInputMask = true;
    },
    removeMask:function(mask){
        //if(!this.running) return;
        //var i = this._masks.indexOf(mask);
        //if(i > -1) {
        //    this._masks.splice(i, 1);
        //    mask.__isInputMask = false;
        //}
    },
    removeAllMasks:function(){
        //if(!this.running) return;
        //var i = this._masks.length;
        //while(i--){
        //    this._masks[i].__isInputMask = false;
        //    this._masks.splice(i, 1);
        //}
        //this._masks.length = 0;
    }
});

flax.addListener = function(target, func, type, context)
{
    flax.inputManager.addListener(target, func, type, context);
}

flax.removeListener = function(target, func, type)
{
    flax.inputManager.removeListener(target, func, type);
}

flax.Touch = flax.Class.extend({
    _event:null,
    _location:null,
    ctor: function (event) {
        this._event = event;
    },
    getLocation: function () {
        if(this._location == null) {
            this._location = this._event.data.global;
            this._location = flax.currentScene.toLocal(this._location);
        }
        return this._location;
    },
    destroy: function () {
        this._event = null;
        this._location = null;
    }
})

flax.getMousePos = function(event) {
    var pos = event.data.global;
    if(!flax.currentScene) return pos;
    return flax.currentScene.toLocal(pos)
}