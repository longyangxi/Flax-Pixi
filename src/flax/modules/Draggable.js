/**
 * Created by long on 14-7-10.
 */

var flax  = flax || {};

if(!flax.Module) flax.Module = {};

flax.Module.Draggable = {

    xDraggable:true,
    yDraggable:true,
    dragEnabled:true,
    _boundsView:null,
    _viewRect:null,
    _inDragging:false,
    _lastPos:null,
    _anchorPos:null,
    _p:null,

    "onEnter":function() {

        var view = this.getCollider("view");
        if(view == null) view = this.getCollider("mask");
        this._boundsView = view;

        flax.inputManager.addListener(this, this._startDrag, InputType.press, this);
        flax.inputManager.addListener(this, this._drag, InputType.move, this);
        flax.inputManager.addListener(this, this._stopDrag, InputType.up, this);

    },
    "onExit":function() {
        this.xDraggable = true;
        this.yDraggable = true;
        this.dragEnabled = true;
        this._boundsView = null;
        this._viewRect = null;
        this._lastPos = null;
        this._anchorPos = null;
        this._p = null;
    },
    /**
     * Scroll the pane to make the target in the screen center
     * @param {sprite || point} target the sprite or the position in this pane
     * @param {number} time the duration to scroll to
     * */
    //scrollToCenter:function(target, time){
    //    var pos0 = flax.visibleRect.center;
    //    pos0 = this.parent.convertToNodeSpace(pos0);
    //    var pos = this.convertToWorldSpace( target.getPosition ? target.getPosition() : target);
    //    pos = this.parent.convertToNodeSpace(pos);
    //    var delta = flax.pSub(pos0, pos);
    //    var x = this.x + delta.x;
    //    var y = this.y + delta.y;
    //    var newPos = this._validatePos(x, y);
    //    if(time > 0){
    //        this.runAction(cc.MoveTo.create(time, newPos));
    //    }else{
    //        this.setPosition(newPos);
    //    }
    //},
    _startDrag:function(touch, event){
        if(!this.dragEnabled) return;
        this._inDragging = true;
        this._lastPos = touch.getLocation();
    },
    _drag:function(touch, event){

        if(!this._inDragging) return;

        var newPos = touch.getLocation();
        var deltaX = newPos.x - this._lastPos.x;
        var deltaY = newPos.y - this._lastPos.y;

        deltaX = (deltaX > 0 ? 1 : -1) * Math.min(100, Math.abs(deltaX));
        deltaY = (deltaY > 0 ? 1 : -1) * Math.min(100, Math.abs(deltaY));

        this.dragBy(deltaX, deltaY);

        this._lastPos = newPos;
    },
    _stopDrag:function(touch, event){
        this._inDragging = false;
    },
    dragBy: function (deltaX, deltaY) {

        if(deltaX == 0 && deltaY == 0) return false;

        if(!this._viewRect) this._viewRect = this._boundsView ? this._boundsView.getRect(true) : null;

        if(this._viewRect) {
            var rect = this.getViewRect ? this.getViewRect(true) : this.getRect(true);
            rect.x += deltaX;
            rect.y += deltaY;
            if(rect.x > this._viewRect.x || rect.x + rect.width < this._viewRect.x + this._viewRect.width) deltaX = 0;
            if(rect.y > this._viewRect.y || rect.y + rect.height < this._viewRect.y + this._viewRect.height) deltaY = 0;
        }

        if(this._p == null) this._p = flax.p(this.x, this.y);
        if(this.xDraggable) {
            this._p.x += deltaX;
        }
        if(this.yDraggable) {
            this._p.y += deltaY;
        }

        this.setPosition(this._p);

        return deltaX != 0 || deltaY != 0;
    }
};