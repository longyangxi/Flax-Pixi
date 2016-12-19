/**
 * Created by long on 15-5-10.
 */

var flax  = flax || {};
if(!flax.Module) flax.Module = {};

var HLayoutType = {
    LEFT:0,
    CENTER:1,
    RIGHT:2
}
var VLayoutType = {
    BOTTOM:0,
    MIDDLE:1,
    TOP:2
}

flax.getLayoutPosition = function(target, hLayout, vLayout)
{
    var rect = flax.getBounds(target, true);
    var sCenter = flax.visibleRect.center;
    var anchorPos = target.getAnchorPointInPoints();

    var x = 0;
    var y = 0;

    switch(hLayout){
        case HLayoutType.LEFT:
            x = 0;
            break;
        case HLayoutType.CENTER:
            x = sCenter.x - rect.width/2;
            break;
        case HLayoutType.RIGHT:
            x = flax.visibleRect.right.x - rect.width;
            break;
    }
    switch(vLayout){
        case VLayoutType.BOTTOM:
            y = 0;
            break;
        case VLayoutType.MIDDLE:
            y = sCenter.y - rect.height/2;
            break;
        case VLayoutType.TOP:
            y = flax.visibleRect.top.y - rect.height;
            break;
    }

    var scale = FRAMEWORK == "cocos" ? flax.getScale(target, true) : {x:1.0, y: 1.0};

    var offsetX = !hLayout ? flax.visibleRect.bottomLeft.x : 0;
    var offsetY = !vLayout ? flax.visibleRect.bottomLeft.y : 0;

    var pos = flax.p(x + offsetX + anchorPos.x*scale.x, y + offsetY + anchorPos.y*scale.y);

    if(target.parent){
        pos = target.parent.convertToNodeSpace(pos);
    }
    return pos;
}

flax.getLayoutPosition_old = function(target, hLayout, vLayout)
{
    var rect = flax.getBounds(target, true);
    var sCenter = flax.visibleRect.center;
    var anchorPos = target.getAnchorPointInPoints();

    var x = 0;
    var y = 0;

    switch(hLayout){
        case HLayoutType.LEFT:
            x = 0;
            break;
        case HLayoutType.CENTER:
            x = sCenter.x - rect.width/2;
            break;
        case HLayoutType.RIGHT:
            x = flax.visibleRect.right.x - rect.width;
            break;
    }
    switch(vLayout){
        case VLayoutType.BOTTOM:
            y = 0;
            break;
        case VLayoutType.MIDDLE:
            y = sCenter.y - rect.height/2;
            break;
        case VLayoutType.TOP:
            y = flax.visibleRect.top.y - rect.height;
            break;
    }

    var scale = FRAMEWORK == "cocos" ? flax.getScale(target, true) : {x:1.0, y: 1.0};

    var offsetX = !hLayout ? flax.visibleRect.bottomLeft.x : 0;
    var offsetY = !vLayout ? flax.visibleRect.bottomLeft.y : 0;

    var pos = flax.p(x + offsetX + anchorPos.x*scale.x, y + offsetY + anchorPos.y*scale.y);

    if(target.parent){
        pos = target.parent.convertToNodeSpace(pos);
    }
    return pos;
}

flax.Module.ScreenLayout = {
    layoutWhenResize:false,
    _isAutoLayout:false,
    _hlayout:null,
    _vlayout:null,
    _offsetX:0,
    _offsetY:0,
    "onEnter":function()
    {
        if(this.layoutWhenResize) {
            if(flax.device && flax.device.onRotate) flax.device.onRotate.add(this._updateLayout, this);
            if(flax.onScreenResize) flax.onScreenResize.add(this._updateLayout, this);
        }
    },
    "onExit":function()
    {
        if(this.layoutWhenResize) {
            if(flax.device && flax.device.onRotate) flax.device.onRotate.remove(this._updateLayout, this);
            if(flax.onScreenResize) flax.onScreenResize.remove(this._updateLayout, this);
        }
    },
    setLayoutOffset:function(offsetX, offsetY)
    {
        this._offsetX = offsetX;
        this._offsetY = offsetY;
        this._updateLayout();
    },
    /**
     *  Show the view in the screen center
     * */
    showInCenter: function () {
        this.setLayout(HLayoutType.CENTER, VLayoutType.MIDDLE);
    },
    /**
     * Set the layout
     * @param {HLayoutType} hLayout Layout type on horizontal direction
     * @param {VLayoutType} vLayout Layout type on vertical direction
     * */
    setLayout:function(hLayout, vLayout)
    {
        this._isAutoLayout = false;
        this._hlayout = hLayout;
        this._vlayout = vLayout;
        var pos = flax.getLayoutPosition(this, hLayout, vLayout);
        pos.x += this._offsetX;
        pos.y += this._offsetY;
        this.setPosition(pos);
    },
    /**
     * Auto layout on the screen according on the designed position.
     * In most situations, the object on the top-left will still on the top-left when screen size changed.
     * Note: This can be used only on the resolution policy of flax.ResolutionPolicy.NO_BORDER
     * */
    autoLayout:function()
    {
        if(flax.view.getResolutionPolicy() != flax.ResolutionPolicy.NO_BORDER) return;

        if(flax.device && !flax.device.isCorrectDirection()) return;

        this._isAutoLayout = true;

        //todo, pixi用geBounds比较准确
        //var rect = flax.getRect(this, this.parent);
        var rect = this.getBounds();
        var sCenter = flax.visibleRect.center;
        sCenter = this.parent.convertToNodeSpace(sCenter);

        if(this.__oxx == null) {
            this.__oxx = this.x;
            this.__oxg = sCenter.x - (rect.x + rect.width/2);
        }
        if(this.__oyy == null) {
            this.__oyy = this.y;
            this.__oyg = sCenter.y - (rect.y + rect.height/2);
        }

        if(this.name == "arrowAnim" || this.name == "scanBtn") {
            //todo, 这两个元件挨着的，怎么差了70像素，搞定它
            //alert(this.name + ": " + this.__oyy + ", " + (rect.y + rect.height/2));
        }

        var anchorPos = this.getAnchorPointInPoints();
        var offsetPlus = 0;

        var rateX = flax.visibleRect.width/flax.designedStageSize.width;
        if(rateX != 1.0) {
            //var offsetX = this.x - sCenter.x;
            //if(offsetX > 0) {
            //    offsetPlus = rect.width;
            //}
            //offsetX = rect.x + offsetPlus - sCenter.x;
            //this.x = sCenter.x + offsetX*rateX + anchorPos.x*this.scaleX - offsetPlus + this._offsetX;

            this.x = this.__oxx + this.__oxg*(1 - rateX);
        }

        var rateY = flax.visibleRect.height/flax.designedStageSize.height;
        if(rateY != 1.0) {
            //var offsetY = this.y - sCenter.y;
            //offsetPlus = 0;
            //if((FRAMEWORK == "cocos" && offsetY > 0) || offsetY < 0) {
            //    offsetPlus = rect.height;
            //}
            //offsetY = rect.y + offsetPlus - sCenter.y;
            //this.y = sCenter.y + offsetY*rateY + anchorPos.y*this.scaleY - offsetPlus + this._offsetY;

            this.y = this.__oyy + this.__oyg*(1 - rateY);

            //if(this.name == "scanBtn" || this.name == "dna") {
            //    alert(this.name + ": " + this.__oyg + "," + this.__oyg*(1 - rateY));
            //}
        }
    },
    _updateLayout:function(landscape)
    {
        if(this._isAutoLayout){
            this.autoLayout();
        }else if(this._hlayout != null && this._vlayout != null){
            this.setLayout(this._hlayout, this._vlayout);
        }
    }
}