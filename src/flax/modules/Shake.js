/**
 * Created by long on 16/5/29.
 */

var flax  = flax || {};

flax.Module.Shake = {
    _shakeTarget:null,
    _originPos:null,
    _lastAxis:"",
    _lastOffset:0,
    _shakeCount:0,
    _maxCount:0,
    _shakeRange:0,
    startShake:function(target, range, count, interval)
    {
        this.stopShake();

        this._shakeTarget = target;

        this._shakeRange = range > 0 ? range : 8;
        this._maxCount = count > 0 ? count : 5;

        this._originPos = flax.p(target.getPosition());
        this._shakeCount = 0;
        this._lastAxis = "";

        target.schedule(this._doShake.bind(this), interval || flax.frameInterval, count);
    },
    stopShake: function () {
        if(!this._shakeTarget) return;
        if(this._originPos) this._shakeTarget.setPosition(this._originPos);
        this._shakeTarget = null;
    },
    _doShake:function()
    {
        if(!this._shakeTarget) return;

        var range = this._shakeRange;

        if(this._lastAxis) {
            this._shakeTarget[this._lastAxis] -= this._lastOffset;
            this._lastAxis = "";
        } else {
            this._lastAxis = (Math.random() <= 0.5) ? "x" : "y";
            var r = range/2 + Math.random()*range/2;
            if(Math.random() <= 0.5) r *= -1;
            this._lastOffset = r;
            this._shakeTarget[this._lastAxis] += this._lastOffset;
        }

        this._shakeCount++;
        if(this._shakeCount > this._maxCount) {
            this.stopShake();
        }
    }
}