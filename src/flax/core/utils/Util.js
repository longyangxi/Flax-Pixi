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
flax.isDisplay = function (target) {
    if(FRAMEWORK == "cocos") return target instanceof cc.Node;
    if(FRAMEWORK == "pixi") return target instanceof PIXI.DisplayObject;
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
    if(flax.sys.isNative) return vars;
    var query = window.location.search.substring(1);
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
flax.encodeUrlVars = function (params) {
    if(!params) return "";
    var paramsStr = "";
    for(var key in params){
        if(paramsStr != "") paramsStr += "&";
        paramsStr += key + "=" + params[key];
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
    var p = target;
    while(p) {
        if(!p.visible) return false;
        p = p.parent;
    }
    if(target.isMouseEnabled && target.isMouseEnabled() === false) return false;
    if(touch && !flax.ifTouched(target, touch.getLocation())) return false;
    return true;
}