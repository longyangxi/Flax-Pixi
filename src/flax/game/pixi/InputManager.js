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
    _touchBeginPos:null,
    _callbacks:{},
    _touchListeners:null,
    _keyboardCallbacks:{},
    _keyboardListener:null,

    ctor:function()
    {
        this._super();
        this.inTouching = false;
        this._callbacks = {};
        this._touchListeners = {};
        this._keyboardCallbacks = {};
        this._keyboardListener = null;
    },
    onEnter:function()
    {
        this._super();

        //var self = this;
        //
        ////listen the mouse move event on PC
        //if(!flax.sys.isMobile){
        //    var mouseListener = cc.EventListener.create({
        //        event: cc.EventListener.MOUSE,
        //        onMouseMove:function(event){
        //            if(!self.nullEnabled) return;
        //            //event.getButton() == 0 means left mouse is in pressing
        //            flax.mousePos = event.getLocation();
        //            self.inDragging = event.getButton() == 0;
        //            self.justDragged = self.inDragging;
        //        }
        //    })
        //    cc.eventManager.addListener(mouseListener, this);
        //}
        //
        //var touchListener = cc.EventListener.create({
        //    event: cc.EventListener.TOUCH_ONE_BY_ONE,
        //    swallowTouches: false,
        //    onTouchBegan:function(touch, event)
        //    {
        //        flax.mousePos = touch.getLocation();
        //        if (!self.enabled) return false;
        //        if(!self.nullEnabled) return false;
        //        self.inDragging = false;
        //        self.justDragged = false;
        //        self.inTouching = true;
        //        self._dispatchOne(self, touch, event, InputType.press);
        //        return true;
        //    },
        //    onTouchEnded:function(touch, event)
        //    {
        //        self.inDragging = false;
        //        self.inTouching = false;
        //        self._dispatchOne(self, touch, event, InputType.up);
        //        self._dispatchOne(self, touch, event, InputType.click);
        //    },
        //    onTouchMoved:function(touch, event)
        //    {
        //        flax.mousePos = touch.getLocation();
        //        self.inDragging = true;
        //        self.justDragged = true;
        //        self._dispatchOne(self, touch, event, InputType.move);
        //    }
        //});
        //cc.eventManager.addListener(touchListener, this);
    },
    onExit:function(){
        this._super();
        this.removeAllTouchListeners();
        this.removeAllKeyboardListeners();
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
                flax.log("Listening target is null, make sure you want to listen to the full screen input!");
            }
        }

        if(isKeyboardEvent) {
            throw "todo for keyboard event!";
        }

        if(type == null) type = InputType.click;

        target.interactive = true;
        target.on(type, func, context);
    },
    removeListener:function(target, func, type, context)
    {
        if(target == null) target = this;
        target.removeListener(type, func, context);
    },
    removeAllTouchListeners:function()
    {
        this._callbacks = {};
        for(var id in this._touchListeners){
            var listener = this._touchListeners[id];
            cc.eventManager.removeListener(listener);
            delete this._touchListeners[id];

        }
    },
    removeAllKeyboardListeners:function()
    {
        this._keyboardCallbacks = {};
        if(this._keyboardListener) {
            this._keyboardListener = null;
        }
    }
});

flax.inputManager = new flax.InputManager();

flax.addListener = function(target, func, type, context)
{
    flax.inputManager.addListener(target, func, type, context);
}

flax.removeListener = function(target, func, type)
{
    flax.inputManager.removeListener(target, func, type);
}