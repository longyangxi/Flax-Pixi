/**
 * Created by long on 14-5-7.
 */
flax.ProgressBarType = {
    HORIZONTAL:"horizontal",
    VERTICAL:"vertical",
    RADIAL:"radial"
};
flax.ProgressBar = flax.Animator.extend({
    clsName:"flax.ProgressBar",
    pBar:null,
    _type:flax.ProgressBarType.HORIZONTAL,
    _reversed:false,
    _tween:null,
    onEnter:function()
    {
        this._super();
    },
    onExit: function () {
        this._super();
        this.pBar = null;
        this._type = flax.ProgressBarType.HORIZONTAL;
        this._reversed = false;
        this._tween = null;
    },
    getPercentage:function()
    {
        if(this.pBar) return this.pBar.percentage;
        return 0;
    },
    setPercentage:function(p)
    {
        if(this.pBar) this.pBar.percentage = p;
    },
    getType:function()
    {
        return this._type;
    },
    setType:function(type)
    {
        if(this._type == type) return;
        this._type = type;
        this._updatePBar();
    },
    getReversed:function()
    {
        return this._reversed;
    },
    setReversed:function(r)
    {
        if(this._reversed == r) return;
        this._reversed = r;
        this._updatePBar();
        //to fix the setReverse bug
        this.percentage += 0.1;
        this.percentage -= 0.1;
    },
    tween:function(from, to, duration)
    {
        if(this.pBar == null) return;
        if(this._tween) {
            if(!this._tween.isDone()){
                this.pBar.stopAction(this._tween);
            }
            this._tween.release();
        }
        this._tween = cc.progressFromTo(duration, from, to);
        this._tween.retain();
        this.pBar.runAction(this._tween);
    },
    stopTween:function()
    {
        if(this._tween && this.pBar) {
            this.pBar.stopAction(this._tween);
            this._tween.release();
            this._tween = null;
        }
    },
    doRenderFrame:function(frame)
    {
        var sFrame = flax.spriteFrameCache.getSpriteFrame(this._frameNames[frame]);
        if(sFrame) {
            //todo, is there some performance issue? pool?
            var frameSprite = new flax.Sprite(sFrame);
            if(this.pBar == null){
                this.width = frameSprite.width;
                this.height = frameSprite.height;

                this.pBar = new cc.ProgressTimer(frameSprite);

                this._updatePBar();

                this.pBar.setAnchorPoint(this.getAnchorPoint());
                this.pBar.setPosition(this.getAnchorPointInPoints());
                this.addChild(this.pBar);
            }else{
                this.pBar.setSprite(frameSprite);
            }
        }
    },
    _updatePBar:function()
    {
        if(this.pBar == null) return;
        if(this._type == flax.ProgressBarType.RADIAL) {
            //In version 3.0 alpha called cc.PROGRESS_TIMER_TYPE_RADIAL,  3.0 rc1 called cc.ProgressTimer.TYPE_RADIAL
            this.pBar.type = 0;
            this.pBar.setReverseDirection(this._reversed);
            this.pBar.midPoint = flax.p(0.5, 0.5);
        }else{
            //In version 3.0 alpha called cc.PROGRESS_TIMER_TYPE_BAR,  3.0 rc1 called cc.ProgressTimer.TYPE_BAR
            this.pBar.type = 1;
            var isHorizontal = this._type == flax.ProgressBarType.HORIZONTAL;
            var mid = flax.p(0, 0);
            var cRate = flax.p(isHorizontal ? 1: 0, isHorizontal ? 0 : 1);
            if(this._reversed){
                if(isHorizontal) mid.x = 1;
                else mid.y = 1;
            }
            this.pBar.midPoint = mid;
            this.pBar.barChangeRate = cRate;
        }
    }
});

window['flax']['ProgressBar'] = flax.ProgressBar;

var _p = flax.ProgressBar.prototype;

/** @expose */
_p.percentage;
flax.defineGetterSetter(_p, "percentage", _p.getPercentage, _p.setPercentage);
/** @expose */
_p.type;
flax.defineGetterSetter(_p, "type", _p.getType, _p.setType);
/** @expose */
_p.reversed;
flax.defineGetterSetter(_p, "reversed", _p.getReversed, _p.setReversed);