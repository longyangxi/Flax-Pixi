/**
 * Created by long on 15/11/16.
 */

flax.ProgressBarType = {
    HORIZONTAL:"horizontal",
    VERTICAL:"vertical",
    RADIAL:"radial"
};

flax.ProgressBar = flax.Animator.extend({
    clsName:"flax.ProgressBar",
    _bar:null,
    _percentage:-1,
    _type:flax.ProgressBarType.HORIZONTAL,
    _reversed:false,
    _to: null,
    _speed: null,
    _needRedraw:false,
    onEnter:function()
    {
        this._super();
        this.setPercentage(50);
    },
    onExit: function () {
        this._super();
        if(this._bar) {
            this._bar.destroy();
            this._bar = null;
        }
        this.mask = null;
        this._type = flax.ProgressBarType.HORIZONTAL;
        this._reversed = false;
    },
    reset: function () {
        this._super();
        this._percentage = 0;
        this._type = flax.ProgressBarType.HORIZONTAL;
        this._reversed = false;
    },
    getPercentage:function()
    {
        return this._percentage;
    },
    setPercentage:function(p)
    {
        if(this._percentage == p) return;
        this._percentage = p;
        this._updateBar();
    },
    getType:function()
    {
        return this._type;
    },
    setType:function(type)
    {
        if(this._type == type) return;
        this._type = type;
        this._needRedraw = true;
        this._updateBar();
    },
    getReversed:function()
    {
        return this._reversed;
    },
    setReversed:function(r)
    {
        if(this._reversed == r) return;
        this._reversed = r;
        this._needRedraw = true;
        this._updateBar();
    },
    /**
     * Tween the percentage from xxx to xxx within duration seconds
     * */
    tween:function(from, to, duration)
    {
        if(from < 0 || from > 100 || to < 0 || to > 100) throw "ProgressBar's percentage is from 0 to 100!";
        this.setPercentage(from);
        var d = to - from;
        this._speed = d/duration;
        if(this._speed == 0) return;
        this._to = to;
        this.scheduleUpdate();
    },
    stopTween:function()
    {
        this.unscheduleUpdate();
        this._to = null;
    },
    update: function (delta) {
        if(this._to == null) {
            this.stopTween();
            return;
        }
        var p;
        var pDelta = delta * this._speed;
        //Check if the tween is over
        if((this._speed > 0 && (this._to - this._percentage) < pDelta) ||
            (this._speed < 0 && (this._to - this._percentage) > pDelta)) {
            p = this._to;
            this._to = null;
        } else {
            p = this._percentage + pDelta;
        }
        this.setPercentage(p);
    },
    _updateBar:function()
    {
        if(!this.running) return;

        var isRadial = this._type == flax.ProgressBarType.RADIAL;
        var isHorizontal = this._type == flax.ProgressBarType.HORIZONTAL;

        var bounds = this.getBounds();

        if(!this._bar || this._needRedraw) {
            isRadial ? this._drawCircleBar(bounds) : this._drawRectBar(isHorizontal, bounds);
            this.mask = this._bar;
            this._needRedraw = false;
        }

        var bar = this._bar;

        if(this._type == flax.ProgressBarType.RADIAL) {

            var totalAngle = Math.PI*2*this._percentage*0.01;
            var r = Math.max(bounds.width/2, bounds.height/2);
            var d = this._reversed ? -1 : 1;

            /**
             * Draw a sector of some angle
             * */

            bar.clear();
            bar.beginFill(0xFF0000);
            bar.moveTo(0, 0);

            var start = -Math.PI/2;
            var seg = 2*Math.PI/40;
            var segs = Math.floor(totalAngle/seg);
            var delta = totalAngle - seg*segs;

            var an = 0;
            for(var i = 0; i <= segs; i++) {
                an = start + i*seg*d;
                if(i == 0) bar.moveTo(r*Math.cos(an), r*Math.sin(an))
                else bar.lineTo(r*Math.cos(an), r*Math.sin(an));
            }

            if(delta > 0) bar.lineTo(r*Math.cos(an + d*delta), r*Math.sin(an + d*delta));
            bar.lineTo(0, 0);
            bar.endFill();

        } else {
            //scale the bar
            var s = this._percentage*0.01;
            if (isHorizontal) {
                bar.setScaleX(s);
            } else {
                bar.setScaleY(s);
            }
        }
    },
    _drawCircleBar: function (bounds) {

        this._initBar();

        this._bar.setPosition(bounds.x + bounds.width/2, bounds.y + bounds.height/2);
    },
    _drawRectBar: function (isHorizontal, bounds) {

        this._initBar();

        var bar = this._bar;

        bar.beginFill(0xFF0000);
        bar.drawRect(0, 0, bounds.width, bounds.height);
        //set position
        var x = bounds.x;
        var y = bounds.y;
        if(this._reversed){
            if(isHorizontal) {
                x += bounds.width;
                bar.pivot.x = bounds.width;
            } else {
                y += bounds.height;
                bar.pivot.y = bounds.height;
            }
        }
        bar.setPosition(x, y);
    },
    _initBar: function () {
        if(!this._bar) {
            this._bar = new flax.Graphics();
            this.parent.addChild(this._bar);
        } else {
            var bar = this._bar;
            bar.clear();
            bar.setScale(1.0, 1.0);
            bar.pivot.x = 0;
            bar.pivot.y = 0;
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