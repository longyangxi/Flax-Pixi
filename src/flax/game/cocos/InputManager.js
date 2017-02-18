/**
 * @author       Longsir <longames@qq.com>
 * @copyright    2015 Longames Ltd.
 * @github       {@link https://github.com/longyangxi/flax.js}
 * @flax         {@link http://flax.so}
 * @license      MIT License: {@link http:http://mit-license.org/}
 */

var flax = flax || {};
flax.mousePos = null;

var InputType = {
    press:"onMouseDown",
    up:"onUp",//The touch position maybe not within the press target
    click:"onClick",
    move:"onMouseMove",//The touch position maybe not within the press target,
    zoomIn:"onZoomIn",
    zoomOut:"onZoomOut",
    keyPress:"onKeyPress",
    keyUp:"onKeyUp"
};

var MULTI_TOUCH_TYPES = ["onZoomIn", "onZoomOut"];

flax.InputManager = cc.Node.extend({
    /**
     * If has multi-touch listener, this must be false, but single-touch will has some bug, so todo
     * */
    swallowTouches:true,
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
    _masks:[],
    _callbacks:{},
    _keyboardCallbacks:{},
    _keyboardListener:null,
    _touchListeners:null,

    ctor:function()
    {
        cc.Node.prototype.ctor.call(this);
        this._masks = [];
        this.inTouching = false;
        this._callbacks = {};
        this._keyboardCallbacks = {};
        this._keyboardListener = null;
        this._touchListeners = {};
    },
    onEnter:function()
    {
        this._super();

        var self = this;

        //listen the mouse move event on PC
        if(!flax.sys.isMobile){
            var mouseListener = cc.EventListener.create({
                event: cc.EventListener.MOUSE,
                onMouseMove:function(event){
                    if(!self.nullEnabled) return;
                    //event.getButton() == 0 means left mouse is in pressing
                    flax.mousePos = event.getLocation();
                    self.inDragging = event.getButton() == 0;
                    self.justDragged = self.inDragging;
                     /*if(self.inDragging) {
                        var delta = event.getDelta();
                        self.justDragDist += flax.pLength(delta);
                        self.justDragOff = flax.pAdd(self.justDragOff, delta);
                    }else{
                        //dispatch mouse hover event
                        var evt = {target:self, currentTarget:self};
                        self._dispatchOne(self, event, evt, InputType.move);
                        //todo, dispatch for every single target
//                        self._dispatch(self, event, evt, InputType.move);
                    }
                    */
                }
            })
            cc.eventManager.addListener(mouseListener, this);
        }

        var touchListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: false,
            onTouchBegan:function(touch, event)
            {
                flax.mousePos = touch.getLocation();
                self.inDragging = false;
                self.justDragged = false;
                self.inTouching = true;
                if (!self.enabled) return false;
                if(!self.nullEnabled) return false;
                //if(this.soleTarget) return false;
                self._dispatchOne(self, touch, event, InputType.press);
                return true;
            },
            onTouchEnded:function(touch, event)
            {
                self.inDragging = false;
                self.inTouching = false;
                if(!self.nullEnabled) return;
                self._dispatchOne(self, touch, event, InputType.up);
                self._dispatchOne(self, touch, event, InputType.click);
            },
            onTouchMoved:function(touch, event)
            {
                flax.mousePos = touch.getLocation();
                self.inDragging = true;
                self.justDragged = true;
                if(!self.nullEnabled) return;
                self._dispatchOne(self, touch, event, InputType.move);
            }
        });
        cc.eventManager.addListener(touchListener, 999999);
    },
    onExit:function(){
        this._super();
        this.removeAllTouchListeners();
        this.removeAllKeyboardListeners();
        this.removeAllMasks();
        cc.eventManager.removeAllListeners();
        this._masks = null;
        this._callbacks = null;
        this._keyboardCallbacks = null;
        this._keyboardListener = null;
        this._touchListeners = null;
        this.soleTarget = null;
        if(flax.inputManager == this) flax.inputManager = null;
    },
    /**
     * Add a Sprite node which will permitted the lower sprite to get touch event callback
     * */
    addMask:function(mask){
        if(this._masks.indexOf(mask) > -1) return;
        this._masks.push(mask);
        mask.__isInputMask = true;
    },
    removeMask:function(mask){
        if(!this.running) return;
        var i = this._masks.indexOf(mask);
        if(i > -1) {
            this._masks.splice(i, 1);
            mask.__isInputMask = false;
        }
    },
    removeAllMasks:function(){
        if(!this.running) return;
        var i = this._masks.length;
        while(i--){
            this._masks[i].__isInputMask = false;
            this._masks.splice(i, 1);
        }
        this._masks.length = 0;
    },
    _compareRealZIndex:function(node0, node1){
        if(!node0.parent || !node1.parent) return 1;
        if(node0.parent == node1.parent) return this._childIsOnFront(node0, node1);

        var theSameParent = null;
        var theSameIndex = 0;

        var parents0 = [];
        var node = node0.parent;
        while(node){
            parents0.push(node);
            node = node.parent;
        }

        var parents1 = [];
        node = node1.parent;
        while(node){
            theSameIndex = parents0.indexOf(node);
            if(theSameIndex > -1) {
                theSameParent = node;
                break;
            }
            parents1.push(node);
            node = node.parent;
        }
        parents0 = parents0.slice(0, theSameIndex);
        var front = this._childIsOnFront(parents0[parents0.length - 1] || node0, parents1[parents1.length - 1] || node1, theSameParent);
        return front ? 1 : -1;
    },
    _childIsOnFront:function(child0, child1, parent){
        if(parent == null) parent = child0.parent;
        return parent.children.indexOf(child0) > parent.children.indexOf(child1);
    },
    /**
     * @param{cc.Node} target the target want to receive the touch event, if target is null, then global event will be triggered
     *                       for keyboard event, the target will be the context if the real context is null
     * @param{function} func function to call back, for touch event: func(touch, event),{event.currentTarget, event.target}
     *                       for keyboard event: func(key){};
     * @param{string} type event type as InputType said
     * @param{cc.Node} context the callback context of "THIS", if null, use target as the context
     * @param {Boolean} If listening multi touches, default is false
     * Note: If the target is null, then listen the global event, in this instance, be sure to REMOVE the listener manually
     * on the sprite exit, otherwise, a new sprite will not receive the event again!
     * */
    addListener:function(target, func, type, context)
    {
        if(!this.running) return;

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
            var arr = this._keyboardCallbacks[type];
            if(arr == null) {
                arr = [];
                this._keyboardCallbacks[type] = arr;
            }
            //Make sure no duplicated listener
            var i = arr.length;
            while(i--){
                if(arr[i].func == func)  return;
            }
            arr.push({func:func, context:context || target});
            if(!this._keyboardListener) {
                this._createKeyboardListener();
            }
            return;
        }

        if(type == null) type = InputType.click;

        if(target.__instanceId == null) target.__instanceId = flax.getInstanceId();
        var arr = this._callbacks[target.__instanceId];
        if(arr == null){
            arr = [];
            this._callbacks[target.__instanceId] = arr;
            if(target != this) {
                var listener =  MULTI_TOUCH_TYPES.indexOf(type) > -1 ? this._createMultiListener(target, this.swallowTouches) : this._createListener(target, this.swallowTouches);
                this._touchListeners[target.__instanceId] = listener;
            }
        }
        //Make sure no duplicated listener
        var i = arr.length;
        while(i--){
            if(arr[i].type == type && arr[i].func == func)  return;
        }
        var callback = {type:type, func:func, context:context || target};
        arr.push(callback);
    },
    removeListener:function(target, func, type)
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
                var listener = this._touchListeners[target.__instanceId];
                if(listener){
                    //todo,3.5 cause Invalid native object error!
//                        cc.eventManager.removeListener(listener);
                    delete this._touchListeners[target.__instanceId];
                }
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
            //todo,3.5 cause Invalid native object error!
//            cc.eventManager.removeListener(this._keyboardListener);
            this._keyboardListener = null;
        }
    },
    handleTouchBegan:function(touch, event)
    {
        if (!this.enabled) return false;
        if(this._inMultiTouch) return false;

        var target = event.getCurrentTarget();

        if(this.soleTarget && this.soleTarget != target) return false;

        var pos = flax.mousePos = this._touchBeginPos = touch.getLocation();

        if(!flax.ifTouchValid(target, touch)) return false;

        //handle the masks
        if(!this.ifNotMasked(target, pos)) return false;

        event.currentTarget = target;
        event.target = this._findRealTarget(target, pos) || target;
        //if currentTarget is cc.Layer or flax.MovieClip and hasn't touch any of it's child, then ignore!
        //todo
        //if((target instanceof cc.Layer || target instanceof flax.MovieClip) && event.target == target) {
        //if((target instanceof cc.Layer) && event.target == target) {
        //    return false;
        //}
        this._dispatch(target, touch, event, InputType.press);

        if(this.soleTarget) this.soleTarget = null;

        return true;
    },
    handleTouchEnded:function(touch, event)
    {
        if(this._inMultiTouch) return;

        var target = event.getCurrentTarget();

        event.currentTarget = target;
        event.target = this._findRealTarget(target, touch.getLocation()) || target;

        this.justDragOff = flax.pSub(touch.getLocation(), this._touchBeginPos);
        this.justDragDist = flax.pLength(this.justDragOff);

        this._dispatch(target, touch, event, InputType.up);
        var onTarget = flax.ifTouched(target, touch.getLocation());
        var moved = this.justDragDist > MIN_DIST_FOR_CLICK;
        if(onTarget && !moved) this._dispatch(target, touch, event, InputType.click);
    },
    handleTouchMoved:function(touch, event)
    {
        if (!this.enabled) return;
        if(this._inMultiTouch) return;
        var target = event.getCurrentTarget();
        flax.mousePos = touch.getLocation();
        this._dispatch(target, touch, event, InputType.move);
    },
    handleTouchesBegan:function(touches, event)
    {
        if (!this.enabled) return;
        this._updateTouches(touches, event);
        this._inMultiTouch = this._touchesCount > 1;
    },
    handleTouchesEnded:function(touches, event)
    {
        this._endTouches(touches)
    },
    handleTouchesMoved:function(touches, event)
    {
        if (!this.enabled) return;
        this._parseGesture(touches, event)
    },
    _endTouches:function(touches) {
        for(var i = 0; i < touches.length; i++) {
            var touch = touches[i];
            delete this._touches[touch.getID()];
            this._touchesCount--;
        }
        if(this._touchesCount <= 0) {
            this._prevDist = 0;
            this._touchesCount = 0;
            this._inMultiTouch = false;
        } else if(this._touchesCount < 2) {
            //this._inMultiTouch = false;
        }
    },
    _updateTouches:function(touches, event) {
        if(this._touches == null) {
            this._touches = {}
        }
        var hasTouch = false;
        for(var i = 0; i < touches.length; i++) {
            var touch = touches[i];

            var pos = touch.getLocation();
            var target = event.getCurrentTarget();

            if(!flax.ifTouchValid(target, touch)) continue;;
            //handle the masks
            if(!this.ifNotMasked(target, pos)) continue;

            var id = touch.getID();
            var theInfo = this._touches[id];
            if(!theInfo) {
                this._touches[id] = {start:touch.getStartLocation(), current:touch.getLocation()};
                this._touchesCount++;
            } else {
                theInfo.start = touch.getStartLocation();
                theInfo.current = touch.getLocation();
            }
            hasTouch = true;
        }
        return hasTouch;
    },
    _touches:null,
    _touchesCount:0,
    _prevDist:0,
    _inMultiTouch:false,
    _parseGesture:function(touches, event){

        var hasTouch = this._updateTouches(touches, event);

        var touch0 = null;
        var touch1 = null;

        for(var id in this._touches) {
            var touch = this._touches[id];
            if(!touch0) touch0 = touch;
            else if(!touch1) touch1 = touch;
            else break;
        }


        if(!touch0 || !touch1) {
            return false;
        }

        //var startDist = flax.getDistance(touch0.start, touch0.current);
        //var currentDist = flax.getDistance(touch1.start, touch1.current);
        //var deltaDist = currentDist - startDist;

        //var startDist = flax.getDistance(touch0.start, touch1.start);
        var currentDist = flax.getDistance(touch0.current, touch1.current);
        //var deltaDist = currentDist - startDist;

        if(this._prevDist == 0) {
            this._prevDist = currentDist;
            return;
        } else {
            var deltaDist = currentDist - this._prevDist;
            this._prevDist = currentDist;
        }
        event.zoomDist = deltaDist;

        var target = event.getCurrentTarget();
        if(deltaDist > 0) {
            this._dispatchOne(target, touches, event, InputType.zoomIn);
        } else if (deltaDist < 0) {
            this._dispatchOne(target, touches, event, InputType.zoomOut);
        }

        return true;
    },
    _createListener:function(target, swallow)
    {
        var self = this;
        var touchType = cc.EventListener.TOUCH_ONE_BY_ONE;
        var listener = cc.EventListener.create({
            event: touchType,
            swallowTouches: swallow,
            onTouchBegan:function(touch, event)
            {
                return self.handleTouchBegan(touch, event);
            },
            onTouchEnded:function(touch, event)
            {
                self.handleTouchEnded(touch, event);
            },
            onTouchMoved:function(touch, event)
            {
                self.handleTouchMoved(touch, event);
            },
            onTouchCancelled:function(touch, event){
                self.handleTouchEnded(touch, event);
            }
        });
        cc.eventManager.addListener(listener, target);
        return listener;
    },
    _createMultiListener:function(target, swallow)
    {
        if(!('touches' in flax.sys.capabilities))
        {
            console.log("Multi TOUCHES not supported");
            return;
        }
        var self = this;
        var touchType = cc.EventListener.TOUCH_ALL_AT_ONCE;
        var listener = cc.EventListener.create({
            event: touchType,
            //swallowTouches: swallow,
            onTouchesBegan:function(touch, event)
            {
                return self.handleTouchesBegan(touch, event);
            },
            onTouchesEnded:function(touch, event)
            {
                self.handleTouchesEnded(touch, event);
            },
            onTouchesMoved:function(touch, event)
            {
                self.handleTouchesMoved(touch, event);
            },
            onTouchesCancelled:function(touch, event){
                self.handleTouchesEnded(touch, event);
            }
        });
        cc.eventManager.addListener(listener, target);
        return listener;
    },
    _createKeyboardListener:function()
    {
        var self = this;
        this._keyboardListener = {
            event: cc.EventListener.KEYBOARD,
            onKeyPressed:  function(keyCode, event){
                self._dispatchKeyboardEvent(keyCode, InputType.keyPress);
            },
            onKeyReleased: function(keyCode, event){
                self._dispatchKeyboardEvent(keyCode, InputType.keyUp);
            }
        };
        cc.eventManager.addListener(this._keyboardListener, this);
    },
    ifNotMasked:function(target, pos)
    {
        var i = this._masks.length;
        var mask = null;
        var maskTouchedItem = null;
        while(i--){
            mask = this._masks[i];
            if(target == mask || flax.isChildOf(target, mask) || flax.isChildOf(mask, target)) continue;
            if(!flax.ifTouchValid(mask)) continue;
            if(this._compareRealZIndex(mask, target) == 1){
                maskTouchedItem = this._findRealTarget(mask, pos);
                if(maskTouchedItem) return false;
            }
        }
        return true;
    },
    /**
     * Find the real target that clicked, the basic element in the targets...
     * */
    _findRealTarget:function(targets, pos)
    {
        if(!(targets instanceof Array)) targets = [targets];
        var target = null;
        var i = targets.length;
        while(i--){
            target = targets[i];
            if(!flax.ifTouchValid(target)) continue;
            if(target.children.length > 0){
                this._temp = this._findRealTarget(target.children, pos);
                if(this._temp) {
                    return this._temp;
                }
            }
            if(flax.ifTouched(target, pos)){
                return target;
            }
        }
        return null;
    },
    _dispatch:function(target, touch, event, type){
        if(!this.running) return;
        if(!this.swallowTouches) {
            this._dispatchOne(target, touch, event, type);
            return;
        }
        //If the target is button, then don't handle its parent's event
//        if(target.__isButton) {
//            this._dispatchOne(target, touch, event, type);
//            return;
//        }
        var p = target;
        //if the child triggered some event, then its parent should also be informed
        var ps = [];
        while(p){
            //Fixed the bug when addListener on the callback
            var calls = this._callbacks[p.__instanceId];
            if(calls && calls.length){
                ps.push(p);
            }
            p = p.parent;
        }
        for(var i = 0; i < ps.length; i++){
            p = ps[i];
            //If the callback return true, then stop the event to continue
            if(this._dispatchOne(p, touch, event, type)){
                break;
            }
        }
    },
    _dispatchOne:function(target, touch, event, type)
    {
        var calls = this._callbacks[target.__instanceId];
        if(!calls || !calls.length) return;
        event.currentTarget = target;
        event.inputType = type;
        var call = null;
        var dispatches = [];
        var i = calls.length;
        while(i--){
            call = calls[i];
            if(call.type == type) {
                dispatches.push(call);
            }
        }
        var stopEvent = false;
        //handle object according by the time it addListener
        i = dispatches.length;
        while(i--){
            call = dispatches[i];
            if(call.func.apply(call.context, [touch, event]) === true){
                stopEvent = true;
            }
        }
        return stopEvent;
    },
    _dispatchKeyboardEvent:function(keyCode, type)
    {
        var calls = this._keyboardCallbacks[type];
        if(!calls || !calls.length) return;
        var key = this._getNativeKeyName(keyCode);
        var call = null;
        var dispatches = [];
        var i = calls.length;
        while(i--){
            call = calls[i];
            dispatches.push(call);
        }
        //handle object according by the time it addListener
        i = dispatches.length;
        while(i--){
            call = dispatches[i];
            call.func.apply(call.context, [key]);
        }
    },
    _getNativeKeyName:function(keyCode) {
        var allCode = Object.getOwnPropertyNames(flax.KEY);
        var keyName = "";
        for(var x in allCode){
            if(flax.KEY[allCode[x]] == keyCode){
                keyName = allCode[x];
                break;
            }
        }
        return keyName;
    }
});

flax.addListener = function(target, func, type, context)
{
    if(flax.inputManager) flax.inputManager.addListener(target, func, type, context);
}

flax.removeListener = function(target, func, type)
{
    if(flax.inputManager) flax.inputManager.removeListener(target, func, type);
}

//Fixed bug in advanced mode compile when use cc.KEY
flax.KEY = {
    'none':0,

    // android
    'back':6,
    'menu':18,

    'backspace':8,
    'tab':9,

    'enter':13,

    'shift':16, //should use shiftkey instead
    'ctrl':17, //should use ctrlkey
    'alt':18, //should use altkey
    'pause':19,
    'capslock':20,

    'escape':27,
    'space':32,
    'pageup':33,
    'pagedown':34,
    'end':35,
    'home':36,
    'left':37,
    'up':38,
    'right':39,
    'down':40,
    'select':41,

    'insert':45,
    'Delete':46,
    '0':48,
    '1':49,
    '2':50,
    '3':51,
    '4':52,
    '5':53,
    '6':54,
    '7':55,
    '8':56,
    '9':57,
    'a':65,
    'b':66,
    'c':67,
    'd':68,
    'e':69,
    'f':70,
    'g':71,
    'h':72,
    'i':73,
    'j':74,
    'k':75,
    'l':76,
    'm':77,
    'n':78,
    'o':79,
    'p':80,
    'q':81,
    'r':82,
    's':83,
    't':84,
    'u':85,
    'v':86,
    'w':87,
    'x':88,
    'y':89,
    'z':90,
    //todo for advanced cimpile
    num0:96,
    num1:97,
    num2:98,
    num3:99,
    num4:100,
    num5:101,
    num6:102,
    num7:103,
    num8:104,
    num9:105,
    '*':106,
    '+':107,
    '-':109,
    'numdel':110,
    '/':111,
    f1:112, //f1-f12 dont work on ie
    f2:113,
    f3:114,
    f4:115,
    f5:116,
    f6:117,
    f7:118,
    f8:119,
    f9:120,
    f10:121,
    f11:122,
    f12:123,

    numlock:144,
    scrolllock:145,

    ';':186,
    semicolon:186,
    equal:187,
    '=':187,
    ',':188,
    comma:188,
    dash:189,
    '.':190,
    period:190,
    forwardslash:191,
    grave:192,
    '[':219,
    openbracket:219,
    backslash:220,
    ']':221,
    closebracket:221,
    quote:222,

    // gamepad controll
    dpadLeft:1000,
    dpadRight:1001,
    dpadUp:1003,
    dpadDown:1004,
    dpadCenter:1005
}