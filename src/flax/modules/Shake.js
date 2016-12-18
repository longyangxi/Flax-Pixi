/**
 * Created by long on 16/5/29.
 */

var flax  = flax || {};
if(!flax.Module) flax.Module = {};

flax.Module.Shake = {
    _shakeTarget:null,
    _originPos:null,
    _lastAxis:"",
    _lastOffset:0,
    _shakeCount:0,
    _maxCount:0,
    _shakeRange:0,
    startShake:function(target, range, count)
    {
        //if(this._shakeTarget) return;
        this.stopShake();

        this._shakeTarget = target;

        this._shakeRange = range > 0 ? range : 8;
        this._maxCount = count > 0 ? count : 5;

        this._originPos = target.getPosition();
        this._shakeCount = 0;
        this._lastAxis = "";

        this.schedule(this._doShake, flax.frameInterval);
    },
    stopShake: function () {
        if(!this._shakeTarget) return;
        if(this._originPos) this._shakeTarget.setPosition(this._originPos);
        this._shakeTarget = null;
        this.unschedule(this._doShake);
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