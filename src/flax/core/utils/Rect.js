/**
 * Created by long on 15-8-14.
 */

flax.ZERO_RECT = {x: 0, y: 0, width: 0, height: 0};

flax.rect = function(x, y, w, h)
{
    if(x && x.x != undefined) return new PIXI.Rectangle(x.x, x.y, x.width, x.height);
    return new PIXI.Rectangle(x, y, w, h);
}

/**
 * Check whether the rect1 contains rect2
 * @function
 * @param {flax.Rect} rect1
 * @param {flax.Rect} rect2
 * @return {Boolean}
 */
flax.rectContainsRect = function (rect1, rect2) {
    if (!rect1 || !rect2)
        return false;
    return !((rect1.x >= rect2.x) || (rect1.y >= rect2.y) ||
        ( rect1.x + rect1.width <= rect2.x + rect2.width) ||
        ( rect1.y + rect1.height <= rect2.y + rect2.height));
};

/**
 * Check whether a rect contains a point
 * @function
 * @param {flax.Rect} rect
 * @param {flax.Point} point
 * @return {Boolean}
 */
flax.rectContainsPoint = function (rect, point) {
    return (point.x >= rect.x && point.x <= (rect.x + rect.width) &&
        point.y >= rect.y && point.y <= (rect.y + rect.height));
};

/**
 * Check whether a rect intersect with another
 * @function
 * @param {flax.Rect} rectA
 * @param {flax.Rect} rectB
 * @return {Boolean}
 */
flax.rectIntersectsRect = function (ra, rb) {
    var maxax = ra.x + ra.width,
        maxay = ra.y + ra.height,
        maxbx = rb.x + rb.width,
        maxby = rb.y + rb.height;
    return !(maxax < rb.x || maxbx < ra.x || maxay < rb.y || maxby < ra.y);
};

/**
 * Returns the smallest rectangle that contains the two source rectangles.
 * @function
 * @param {flax.Rect} rectA
 * @param {flax.Rect} rectB
 * @return {flax.Rect}
 */
flax.rectUnion = function (rectA, rectB) {
    var rect = flax.rect(0, 0, 0, 0);
    rect.x = Math.min(rectA.x, rectB.x);
    rect.y = Math.min(rectA.y, rectB.y);
    rect.width = Math.max(rectA.x + rectA.width, rectB.x + rectB.width) - rect.x;
    rect.height = Math.max(rectA.y + rectA.height, rectB.y + rectB.height) - rect.y;
    return rect;
};