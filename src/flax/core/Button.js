/**
 * Created by long on 14-4-25.
 */

var ButtonState = {
    UP:"up",
    OVER:"over",
    DOWN:"down",
    SELECTED:"selected",
    SELECTED_OVER:"selected_over",
    SELECTED_DOWN:"selected_down",
    DISABLED:"disabled",
    LOCKED:"locked"
};

flax._buttonDefine = {
    clickSound:null,//The sound will play when click
    group:null,//the button group it belongs to
    _playChildrenOnState:false,//If auto play children's animation when change state
    _state:null,
    _initScaleX:1.0,
    _initScaleY:1.0,
    _inScaleDown:false,
    _inDisabledGray:true,
    __isButton:true,

    onEnter:function(){
        this._super();
//        this._state = null
        if(this._state == null) this.setState(ButtonState.UP);
        this._initScaleX = this.scaleX;
        this._initScaleY = this.scaleY;
        this._addListeners();
    },
    onExit:function(){
        if(this.group){
            this.group.removeButton(this);
            this.group = null;
        }
        this._removeListeners();
        this._super();
    },
    reset:function(){
        this._super();
        this._playChildrenOnState = false;
        this._state = null;
        this._inScaleDown = false;
        if(this._inDisabledGray) {
//            this.setColor(COLOR_WHITE);
        }
        if(this['disabledCover']) this['disabledCover'].visible = true;
        this._inDisabledGray = true;
    },
    setState:function(state)
    {
//        if(this._state == state) return;
        var oldSelected = this.isSelected();
        this._state = state;
        if(!this.gotoAndStop(this._state))
        {
            var optionState = this.isSelected() ? ButtonState.SELECTED : ButtonState.UP;
            if(!this.gotoAndStop(optionState)){
                this.gotoAndStop(0);
                if(this._state.indexOf("down") > -1) {
                    this._inScaleDown = true;
                    this.setScale(this._initScaleX*MOUSE_DOWN_SCALE, this._initScaleY*MOUSE_DOWN_SCALE);
                }
                if(this._state == ButtonState.DISABLED){
                    this._inDisabledGray = true;
//                    this.setColor(COLOR_GRAY);
                    if(this['disabledCover']) this['disabledCover'].visible = true;
                }
            }
        }
        if(this._state.indexOf("down") == -1 && this._inScaleDown)
        {
            this.setScale(this._initScaleX, this._initScaleY);
        }
        if(this._state != ButtonState.DISABLED && this._inDisabledGray)
        {
            this._inDisabledGray = false;
            if(this['disabledCover']) this['disabledCover'].visible = false;
//            this.setColor(COLOR_WHITE);
        }
        this._playOrPauseChildren();
        if(this.isSelected() && !oldSelected && this.group){
            this.group.updateButtons(this);
        }
        this.handleStateChange();
    },
    handleStateChange:function()
    {
        //to be override
    },
    getState:function()
    {
        return this._state;
    },
    isSelected:function()
    {
        return this._state && (this._state.indexOf("selected") == 0);
    },
    setSelected:function(value)
    {
        if(this.isSelected() == value || !this.isSelectable() || !this.isMouseEnabled() || this.isLocked()) return;
        this.setState(value ? ButtonState.SELECTED : ButtonState.UP);
    },
    isSelectable:function()
    {
        return this.hasLabel(ButtonState.SELECTED);
    },
    setMouseEnabled:function(enable)
    {
//        if(this.isMouseEnabled() == enable) return false;
        this.setState(enable ? ButtonState.UP : ButtonState.DISABLED);
        return true;
    },
    isMouseEnabled:function()
    {
        return this._state != ButtonState.DISABLED;
    },
    setLocked:function(locked)
    {
//        if(this.isLocked() == locked) return;
        this.setState(locked ? ButtonState.LOCKED : ButtonState.UP);
    },
    isLocked:function()
    {
        return this._state == ButtonState.LOCKED;
    },
    setPlayChildrenOnState:function(play)
    {
        if(this._playChildrenOnState == play) return;
        this._playChildrenOnState = play;
        this._playOrPauseChildren();
    },
    getPlayChildrenOnState:function()
    {
        return this._playChildrenOnState;
    },
    _onPress:function(touch, event)
    {
        if(this._state == ButtonState.LOCKED  || this._state == ButtonState.DISABLED) return;
        var sound = this.clickSound || flax.buttonSound;
        if(sound && flax.playSound) flax.playSound(sound);
        this._toSetState(ButtonState.DOWN);
    },
    _onClick:function(touch, event)
    {
        if(this._state == ButtonState.LOCKED || this._state == ButtonState.DISABLED) return;
        if(this.isSelectable())
        {
            var selected = this.isSelected();
            if (!selected || this.group){
                this.setState(ButtonState.SELECTED);
                if(selected) this.group.updateButtons(this);
            }else {
                this.setState(ButtonState.UP);
            }
        }else{
            this.setState(ButtonState.UP);
        }
    },
    _onMove:function(touch)
    {
        var over = flax.ifTouched(this, touch.getLocation());
        over ? this._onOver() : this._onOut();
    },
    _onOver: function () {
        if(this._state == ButtonState.DISABLED || this._state == ButtonState.LOCKED) return;
        this._toSetState(flax.isMobile ? ButtonState.DOWN : ButtonState.OVER);
    },
    _onOut: function () {
        if(this._state == ButtonState.DISABLED || this._state == ButtonState.LOCKED) return;
        this._toSetState(ButtonState.UP);
    },
    _toSetState:function(state)
    {
        if(this.isSelectable() && this.isSelected())
        {
            if(state == ButtonState.UP) state = ButtonState.SELECTED;
            else state = "selected_"+state;
        }
        this.setState(state);
    },
    /**
     * Auto play the children's animation on new state if _playChildrenOnState = true
     * */
    _playOrPauseChildren:function()
    {
        var i = this.childrenCount;
        while(i--){
            var child = this.children[i];
            if(!flax.isFlaxSprite(child)) continue;
            if(this._playChildrenOnState) {
                child.autoPlayChildren = true;
                child.play();
            }else{
                child.autoPlayChildren = false;
                child.stop();
            }
        }
    },
    _addListeners: function () {
        if(FRAMEWORK == "cocos") {
            var self = this;

            if(flax.inputManager) {
                flax.inputManager.addListener(this, this._onPress, InputType.press, this);
                flax.inputManager.addListener(this, this._onClick, InputType.click, this);
            } else {
                var touchListener = cc.EventListener.create({
                    event: cc.EventListener.TOUCH_ONE_BY_ONE,
                    swallowTouches: false,
                    onTouchBegan:function(touch, event)
                    {
                        if(!flax.ifTouchValid(self, touch)) return false;
                        if(flax.inputManager && !flax.inputManager.ifNotMasked(self, touch.getLocation())) return false;
                        self._onPress(touch, event);
                        return true;
                    },
                    onTouchEnded:function(touch, event)
                    {
                        if(flax.ifTouched(self, touch.getLocation())) {
                            self._onClick(touch, event);
                        }
                    },
                    onTouchMoved:function(touch, event) { self._onMove(touch, event); }
                });
                cc.eventManager.addListener(touchListener, this);
            }

            //listen the mouse move event on PC
            if(!flax.isMobile){
                var mouseListener = cc.EventListener.create({
                    event: cc.EventListener.MOUSE,
                    onMouseMove:function(event){
                        if(event.getButton() != 0){
                            var evt = {target:self, currentTarget:self};
                            if(self.isMouseEnabled()) self._onMove(event, evt);
                        }
                    }
                })
                cc.eventManager.addListener(mouseListener, this);
            }
        } else if (FRAMEWORK == "pixi") {
            this.interactive = true;
            this.buttonMode = true;
            var isMobile = flax.isMobile;
            this.on(isMobile ? "touchstart" : "mousedown", this._onPress, this);
            this.on(isMobile ? "tap" : "click", this._onClick, this);
            if(!isMobile) {
                this.on("mouseover", this._onOver, this);
                this.on("mouseout", this._onOut, this);
            }
        }
    },
    _removeListeners: function () {
        if(FRAMEWORK == "cocos") cc.eventManager.removeListener(this);
        else if(FRAMEWORK == "pixi") {
            var isMobile = flax.isMobile;
            this.removeListener(isMobile ? "touchstart" : "mousedown", this._onPress);
            this.removeListener(isMobile ? "tap" : "click", this._onClick);
            if(!isMobile) {
                this.removeListener("mouseover", this._onOver);
                this.removeListener("mouseout", this._onOut);
            }
        }
    }
};

flax.SimpleButton = flax.Animator.extend(flax._buttonDefine);
flax.SimpleButton.create = function(assetsFile, assetID)
{
    var btn = new flax.SimpleButton(assetsFile, assetID);
    btn.clsName = "flax.SimpleButton";
    btn.setState(ButtonState.UP);
    return btn;
};
//Avoid to advanced compile mode
window['flax']['SimpleButton'] = flax.SimpleButton;

var _p = flax.SimpleButton.prototype;
/** @expose */
_p.state;
flax.defineGetterSetter(_p, "state", _p.getState, _p.setState);
/** @expose */
_p.playChildrenOnState;
flax.defineGetterSetter(_p, "playChildrenOnState", _p.getPlayChildrenOnState, _p.setPlayChildrenOnState);
/** @expose */
_p.selected;
flax.defineGetterSetter(_p, "selected", _p.isSelected, _p.setSelected);

flax.Button = flax.MovieClip.extend(flax._buttonDefine);
flax.Button.create = function(assetsFile, assetID)
{
    var btn = new flax.Button(assetsFile, assetID);
    btn.clsName = "flax.Button";
    btn.setState(ButtonState.UP);
    return btn;
};
//Avoid to advanced compile mode
window['flax']['Button'] = flax.Button;

_p = flax.Button.prototype;
/** @expose */
_p.state;
flax.defineGetterSetter(_p, "state", _p.getState, _p.setState);
/** @expose */
_p.playChildrenOnState;
flax.defineGetterSetter(_p, "playChildrenOnState", _p.getPlayChildrenOnState, _p.setPlayChildrenOnState);
/** @expose */
_p.selected;
flax.defineGetterSetter(_p, "selected", _p.isSelected, _p.setSelected);