/**
 * Created by long on 15-8-13.
 */
var flax = flax || {};

flax.ResolutionPolicy = {
    // The entire application is visible in the specified area without trying to preserve the original aspect ratio.
    // Distortion can occur, and the application may appear stretched or compressed.
    EXACT_FIT:0,
    // The entire application fills the specified area, without distortion but possibly with some cropping,
    // while maintaining the original aspect ratio of the application.
    NO_BORDER:1,
    // The entire application is visible in the specified area without distortion while maintaining the original
    // aspect ratio of the application. Borders can appear on two sides of the application.
    SHOW_ALL:2,
    // The application takes the height of the design resolution size and modifies the width of the internal
    // canvas so that it fits the aspect ratio of the device
    // no distortion will occur however you must make sure your application works on different
    // aspect ratios
    FIXED_HEIGHT:3,
    // The application takes the width of the design resolution size and modifies the height of the internal
    // canvas so that it fits the aspect ratio of the device
    // no distortion will occur however you must make sure your application works on different
    // aspect ratios
    FIXED_WIDTH:4,

    UNKNOWN:5
};

flax.view = {
    _width:0,
    _height:0,
    _resolutionPolicy: flax.ResolutionPolicy.SHOW_ALL,
    setDesignResolutionSize: function(width, height, policy)
    {

        this._width = width;
        this._height = height;
        //flax.visibleRect.init(flax.rect(0, 0, width, height));
        this._resolutionPolicy = policy || this._resolutionPolicy;

        this.updateView();
    },
    updateView: function () {
        var scale = flax.getGameScale();
        flax.director.setScale(scale.x, scale.y);
    },
    getResolutionPolicy: function () {
        return this._resolutionPolicy;
    },
    adjustViewPort: function(){
        //do nothing
    },
    resizeWithBrowserSize: function () {
        //do nothing
    },
    enableRetina: function () {
        //do nothing
    }
}

flax.visibleRect = {
    topLeft:flax.p(0,0),
    topRight:flax.p(0,0),
    top:flax.p(0,0),
    bottomLeft:flax.p(0,0),
    bottomRight:flax.p(0,0),
    bottom:flax.p(0,0),
    center:flax.p(0,0),
    left:flax.p(0,0),
    right:flax.p(0,0),
    width:0,
    height:0,

    /**
     * initialize
     * @param {flax.Rect} visibleRect
     */
    init:function(visibleRect){

        var w = this.width = visibleRect.width;
        var h = this.height = visibleRect.height;
        var l = visibleRect.x,
            b = visibleRect.y,
            t = b + h,
            r = l + w;

        //top
        this.topLeft.x = l;
        this.topLeft.y = t;
        this.topRight.x = r;
        this.topRight.y = t;
        this.top.x = l + w/2;
        this.top.y = t;

        //bottom
        this.bottomLeft.x = l;
        this.bottomLeft.y = b;
        this.bottomRight.x = r;
        this.bottomRight.y = b;
        this.bottom.x = l + w/2;
        this.bottom.y = b;

        //center
        this.center.x = l + w/2;
        this.center.y = b + h/2;

        //left
        this.left.x = l;
        this.left.y = b + h/2;

        //right
        this.right.x = r;
        this.right.y = b + h/2;
    }
};