/**
 * Created by long on 15-9-18.
 */

var flax = flax || {};

flax.pointZero = {x:0, y:0};

/**
 * Get the sprite's rotation in coordinate, if the sprite rotated 30 and the parent rotated -15, then the sprite's global rotation is 15
 * If coordinate === true, will return global rotation
 * */
flax.getRotation = function(sprite, coordinate)
{
    if(coordinate == false) return sprite.rotation;
    var r = 0;
    var p = sprite;
    while(p)
    {
        r += p.rotation;
        p = p.parent;
        if(p === coordinate) break;
    }
    return r;
};
/**
 * Get the sprite's global scale
 * */
flax.getScale = function(sprite, coordinate)
{
    if(coordinate == false) return {x:sprite.scaleX, y:sprite.scaleY};
    var sx = 1.0;
    var sy = 1.0;
    var p = sprite;
    while(p && p != flax.stage)
    {
        sx *= p.scaleX;
        sy *= p.scaleY;
        p = p.parent;
        if(p === coordinate) break;
    }
    return {x:sx, y:sy};
};

flax.getPosition = function(sprite, coordinate)
{
    var pos = sprite.getPosition();
    if(sprite.parent){
        if(coordinate) pos = sprite.parent.convertToWorldSpace(pos);
        if(coordinate instanceof flax.Sprite) pos = coordinate.convertToNodeSpace(pos);
    }
    return pos;
};

/**
 * Get the bounding rect of the sprite, maybe should refer the getBoundingBoxToWorld of the cc.Node
 * @param {flax.Sprite} sprite The target to cal
 * @param {Bollean|cc.Node} coordinate The coordinate to cal, if === undefined or === true means global coordinate
 *                                       if === flax.Sprite, cal in its coordinate!
 * */
flax.getBounds = function(sprite, coordinate)
{
    var rect;
    if(sprite.getBounds) {
        rect = sprite.getBounds(coordinate);
        return rect;
        //edit box it is layer
    }
    //else if(FRAMEWORK == "cocos" && (sprite instanceof cc.Layer || sprite instanceof cc.Scene) && (!cc.EditBox || !(sprite instanceof cc.EditBox))){
    //    return flax.stageRect;
    //}
    if(coordinate == null) coordinate = true;

    var size = sprite.getContentSize();
    var s = {x: 1.0, y: 1.0};

    var pos = sprite.getPosition();
    if(sprite.parent){
        if(coordinate) {
            if(coordinate != sprite.parent){
                if(isNaN(pos.x)) {
                    console.log("JSB bug, todo!")
                    return flax.rect();
                }
                pos = sprite.parent.convertToWorldSpace(pos);
                if(flax.isDisplay(coordinate)){
                    pos = coordinate.convertToNodeSpace(pos);
                }
            }
        }else {
            size.width *= Math.abs(s.x);
            size.height *= Math.abs(s.y);
            return flax.rect(0, 0,size.width, size.height);
        }
    }
    var anchor = sprite.getAnchorPoint();
    rect = flax.rect(pos.x - size.width * s.x * anchor.x, pos.y - size.height* s.y * anchor.y, size.width * Math.abs(s.x), size.height * Math.abs(s.y));
    return rect;
};

/**
 * @deprecated
 * */
flax.getRect = flax.getBounds;