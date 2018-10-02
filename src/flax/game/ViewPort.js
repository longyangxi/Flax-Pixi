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

    UNKNOWN:6
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
    hArr:null,
    vArr:null,

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

        var cy = b + h/2;

        //Topleft coordinate
        var temp = b;
        b = t;
        t = temp;

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
        this.center.y = cy;

        //left
        this.left.x = l;
        this.left.y = cy;

        //right
        this.right.x = r;
        this.right.y = cy;

        this.hArr = [l, this.center.x, r];
        this.vArr = [b, this.center.y, t];
    }
};

/**
 * Add viewport for ios and android
 * */
flax.setViewPortMeta = function () {

    if(!flax.sys.isMobile) return;

    var vp = document.getElementById("flaxViewPort");
    if(vp){
        document.head.removeChild(vp);
    }

    var viewportMetas,
        // elems = document.getElementsByName("viewport"),
        // currentVP = elems ? elems[0] : null,
        content;

    vp = document.createElement("meta");
    vp.id = "flaxViewPort";
    vp.name = "viewport";
    vp.content = "";

    viewportMetas = {
        "user-scalable": "no",
        "minimal-ui": "true",
        // "initial-scale":"1",//TODO, 这个加上会放大屏幕
    };

    //TODO
    if(flax.sys.os == flax.sys.OS_IOS) {
        // viewportMetas['width'] = 'device-width';
    }

    content = "";//currentVP ? currentVP.content : "";
    for (var key in viewportMetas) {
        // var pattern = new RegExp(key);
        // if (!pattern.test(content))
        {
            content += "," + key + "=" + viewportMetas[key];
        }
    }
    if(/^,/.test(content))
        content = content.substr(1);

    vp.content = content;
    // For adopting certain android devices which don't support second viewport
    // if (currentVP)
    //     currentVP.content = content;

    document.head.appendChild(vp);
}

/*
 * pixi.js 默认的检测比较严格
 * 导致无法启用WebGL，这里可以
 * 改一下
 */
// if(typeof canvas != "undefined" && typeof wx != "undefined") {
//     PIXI.utils.isWebGLSupported = function() {
//         return canvas.getContext('webgl')
//     }
// }