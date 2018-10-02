/**
 * Created by long on 15/10/8.
 */
flax._isWebglSupported = null;
flax.isWebGLSupported = function ()
{
    if(flax._isWebglSupported != null) return flax._isWebglSupported;

    var contextOptions = { stencil: true };
    try
    {
        if (!window.WebGLRenderingContext)
        {
            flax._isWebglSupported = false;
        } else {
            var canvas = document.createElement('canvas'),
                gl = canvas.getContext('webgl', contextOptions) || canvas.getContext('experimental-webgl', contextOptions);

            flax._isWebglSupported = !!(gl && gl.getContextAttributes().stencil);
        }
        return flax._isWebglSupported;
    }
    catch (e)
    {
        flax._isWebglSupported = false;
        return false;
    }
}

flax._screenSize = {x: 0, y: 0};
flax._realScreenSize = {x: 0, y: 0};

flax.getScreenSize = function() {
    if(flax._screenSize.x > 0 && flax.sys.isMobile) return flax._screenSize;
    //var screenWidth = flax.sys.isMobile ?  window.screen.width :  window.innerWidth;
    //var screenHeight = flax.sys.isMobile ? window.screen.height : window.innerHeight;
    //TODO, in mobile the real width is window.innerWidth and window.innerHeight
    //TODO, screen.width and screen height is real the device's pixel size, but not correct for game renderer
    var screenWidth = window.innerWidth;
    var screenHeight = window.innerHeight;

    flax._screenSize.x = screenWidth;
    flax._screenSize.y = screenHeight;

    return flax._screenSize;
}

flax.getRealScreenSize = function() {
    if(flax._realScreenSize.x > 0 && flax.sys.isMobile) return flax._realScreenSize;
    var pixilRatio = 1.0;//window.devicePixelRatio;
    //window.devicePixelRatio if only correct for wechat games
    if(flax.game.config.platform == "wechat") {
        pixilRatio = window.devicePixelRatio;
    } else {
        // if(flax.sys.isMobile && flax.sys.os == flax.sys.OS_IOS) {
        //     pixilRatio = window.devicePixelRatio;
        //     if(pixilRatio > 2) pixilRatio = 2;
        // }
    }

    var size = flax.getScreenSize();

    flax._realScreenSize.x = size.x * pixilRatio;
    flax._realScreenSize.y = size.y * pixilRatio;

    return flax._realScreenSize;
}

flax.getGameScale = function (size) {

    var sx = 1.0;
    var sy = 1.0;

    var screenSize = flax.getRealScreenSize();

    if(!size) size = flax.designedStageSize;

    var ws =  screenSize.x / size.width;
    var hs = screenSize.y / size.height;

    switch(flax.resolutionPolicy){
        case flax.ResolutionPolicy.EXACT_FIT:
            sx = ws;
            sy = hs;
            break;
        case flax.ResolutionPolicy.NO_BORDER:
            sx = sy = ws;
            if(hs > ws) sx = sy = hs;
            break;
        case flax.ResolutionPolicy.SHOW_ALL:
            sx = sy = ws;
            if(hs < ws) sx = sy = hs;
            break;
        case flax.ResolutionPolicy.FIXED_HEIGHT:
            sx = sy = hs;
            break;
        case flax.ResolutionPolicy.FIXED_WIDTH:
            sx = sy = ws;
            break;
        case flax.ResolutionPolicy.UNKNOWN:
            break;
    }
    //console.log("update game scale: ", screenSize.x, screenSize.y, size.width, size.height, sx, sy, size.width*sx, size.height*sy);
    return {x: sx, y: sy};
}

flax.isDisplay = function (target) {
    return target instanceof PIXI.DisplayObject;
}

flax.isFlaxDisplay = function(target)
{
    return target instanceof flax.FlaxSprite || target instanceof flax.FlaxContainer || target instanceof flax.FlaxSpriteBatch || target instanceof flax.Image || (flax.Scale9Image && target instanceof flax.Scale9Image);
};
flax.isFlaxSprite = function(target)
{
    return target instanceof flax.FlaxSprite  || target instanceof flax.FlaxContainer || target instanceof flax.FlaxSpriteBatch;
};
flax.isMovieClip = function(target)
{
    return target instanceof flax.MovieClip || target instanceof flax.MovieClipBatch;
};
flax.isButton = function(target)
{
    return target instanceof flax.Button || target instanceof flax.SimpleButton;
};
flax.isChildOf = function(child, parent)
{
    if(child == null || parent == null) return false;
    if(child == parent) return false;
    var p = child.parent;
    while(p)
    {
        if(p == parent) return true;
        p = p.parent;
    }
    return false;
};

flax.findParentWithClass = function(sprite, cls)
{
    var p = sprite;
    while(p){
        if(p instanceof cls) return p;
        p = p.parent;
    }
    return null;
};

flax.findChildWithClass = function(sprite, cls)
{
    var children = sprite.children;
    var i = children.length;
    var child;
    while(i--){
        child = children[i];
        if(child instanceof cls) return child;
        child = flax.findChildWithClass(child, cls);
        if(child) return child;
    }
    return null;
};

flax.isImageFile = function(path)
{
    if(typeof path != "string") return false;
    var ext = flax.path.extname(path);
    ext = ext.toLowerCase();
    return IMAGE_TYPES.indexOf(ext) > -1;
};
flax.isSoundFile = function(path)
{
    if(typeof path != "string") return false;
    var ext = flax.path.extname(path);
    return SOUND_TYPES.indexOf(ext) > -1;
};
/**
 * Fetch URL GET variables
 * */
flax.getUrlVars = function() {
    var vars = {};
    try{
        var query = window.location.search.substring(1);
    } catch(e) {
        return vars;
    }
    var varsArr = query.split("&");
    for (var i = 0; i < varsArr.length; i++) {
        var pair = varsArr[i].split("=");
        vars[pair[0]] = decodeURIComponent(pair[1]);
    }
    return vars;
};
/**
 * Convert key-value params to url vars string
 * */
flax.encodeUrlVars = function (params, useJson) {
    if(!params) return "";
    var paramsStr = "";
    for(var key in params){
        if(paramsStr != "") paramsStr += "&";
        paramsStr += key + "=" + encodeURIComponent(params[key]);
    }
    return paramsStr;
}

CHS_PATTERN = /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi;

/**
* WordWrap a string include Chinese chars
*/
flax.wordWrapStr = function (str) {
    
    //No chinese char, then split directly
    if(!CHS_PATTERN.exec(str)) return str.split(' ');
    
    var words = [];
    var word = "";
    for(var i = 0; i < str.length; i++) {
        var cCode = str.charCodeAt(i);
        //Chindese char
        if(cCode > 255 || cCode < 0) {
            if(word != "") words.push(word);
            words.push(str[i]);
            word = "";
        } else if(str[i] == " ") {
            if(word != "") words.push(word);
            word = "";
        } else {
            word += str[i];
        }
    }
    return words;
}

/**
 * Check if the target is really touched by pos, only for cocos
 * */
flax.ifTouched = function(target, pos)
{
    if(target == null) return false;
    if(!(flax.isDisplay(target))) return false;

    //if its flax.FlaxSprite
    if(target.mainCollider){
        return target.mainCollider.containsPoint(pos);
    }
    var r = flax.getBounds(target,true);
    return flax.rectContainsPoint(r, pos);
};
/**
 * Check if the target is touch valid, only for cocos
 * */
flax.ifTouchValid = function(target, touch)
{
    if(target == null) return false;
    if(!(target instanceof flax.Scene) && !target.parent) return false;
    var pos = null;
    if(touch) pos = touch.getLocation();
    var p = target;
    while(p) {
        if(!p.visible) return false;
        //Check the parent's clickArea, specially for children of masked mc
        //todo, to be more perfect
        if(pos && p.getClickArea) {
            var clickArea = p.getClickArea();
            if(clickArea && !flax.rectContainsPoint(clickArea, pos)) return false;
        }
        p = p.parent;
    }
    if(target.isMouseEnabled && target.isMouseEnabled() === false) return false;
    if(pos && !flax.ifTouched(target, pos)) return false;
    return true;
}

/**
 * 在index.html中不设置 <meta name="viewport" content="width=device-width, minimal-ui=true, user-scalable=no">
 *  的情况下，输入文本框和iframe都会出现严重缩小的问题，此函数专用于修正这个问题
 *  而上述meta设置会导致游戏画面缩小看不清
 * */
flax.fixHtmlElementToScreen = function(element, originWidth, originHeight, marginX, marginY, offsetX, offsetY) {

    if(!originWidth) originWidth = element.offsetWidth;
    if(!originHeight) originHeight = element.offsetHeight;
    if(!marginX) marginX = 100;
    if(!marginY) marginY = 100;
    if(!offsetX) offsetX = 0;
    if(!offsetY) offsetY = 0;

    var screenSize = flax.getScreenSize();
    var maxWidth = screenSize.x - 2 * marginX;
    var maxHeight = screenSize.y - 2 * marginY;

    var scale = Math.min(maxWidth / originWidth, maxHeight / originHeight);

    if(flax.isSetDeviceViewPort()) {
        scale = 1.0;
    }

    var newLeftPos = screenSize.x / 2 + offsetX;
    var newTopPos =  screenSize.y / 2 + offsetY;

    var styleObj = flax.htmlStyleToObject(element);

    var scaleStyle =
        "-ms-transform scale($);" +
        "-moz-transform: scale($);" +
        "-webkit-transform: scale($);" +
        "transform: scale($);"

    scaleStyle = scaleStyle.replace(/\$/g, scale);

    var styleStr = flax.mergeHtmlStyleToStr(styleObj, scaleStyle);

    element.style = styleStr + 'position:absolute;left:' + newLeftPos + 'px;top:' + newTopPos + 'px;';

    console.log(styleStr)

    return true;
}

flax.isSetDeviceViewPort = function() {
    var viewPortMeta = document.getElementById("flaxViewPort");
    if(viewPortMeta && viewPortMeta.content && viewPortMeta.content.indexOf("device-width") > -1) {
        return true;
    }
    return false;
}

flax.htmlStyleToObject = function(element) {
    var originCssText = element.style.cssText;
    originCssText = originCssText.replace(/\s/g, "");
    var styleObj = {};
    var arr = originCssText.split(";");
    for(var i = 0; i < arr.length; i++) {
        var arr0 = arr[i].split(":");
        styleObj[arr0[0]] = arr0[1];
    }
    return styleObj;
}

flax.mergeHtmlStyleToStr = function(styleObj, newStyleStr) {
    var arr = newStyleStr.split(";");
    for(var i = 0; i < arr.length; i++) {
        var arr0 = arr[i].split(":");
        styleObj[arr0[0]] = arr0[1];
    }

    var styleStr = "";
    for(var k in styleObj) {
        styleStr = styleStr + k + ": " + styleObj[k] + ";";
    }
    return styleStr;
}