/**
 * Created by long on 15-8-14.
 */

flax.p = function(x, y)
{
    if(FRAMEWORK == "pixi"){
        if(x === undefined) return new PIXI.Point(0, 0);
        if(y === undefined) return new PIXI.Point(x.x, x.y);
        return new PIXI.Point(x, y);
    }else {
        if (x === undefined)
            return {x: 0, y: 0};
        if (y === undefined)
            return {x: x.x, y: x.y};
        return {x: x, y: y};
    }
}

/**
 * smallest such that 1.0+FLT_EPSILON != 1.0
 * @constant
 * @type Number
 */
flax.POINT_EPSILON = parseFloat('1.192092896e-07F');
/**
 * Calculates sum of two points.
 * @param {flax.Point} v1
 * @param {flax.Point} v2
 * @return {flax.Point}
 */
flax.pAdd = function (v1, v2) {
    return flax.p(v1.x + v2.x, v1.y + v2.y);
};

/**
 * Calculates difference of two points.
 * @param {flax.Point} v1
 * @param {flax.Point} v2
 * @return {flax.Point}
 */
flax.pSub = function (v1, v2) {
    return flax.p(v1.x - v2.x, v1.y - v2.y);
};

/**
 * Returns point multiplied by given factor.
 * @param {flax.Point} point
 * @param {Number} floatVar
 * @return {flax.Point}
 */
flax.pMult = function (point, floatVar) {
    return flax.p(point.x * floatVar, point.y * floatVar);
};

/**
 * Calculates distance between point an origin
 * @param  {flax.Point} v
 * @return {Number}
 */
flax.pLength = function (v) {
    return Math.sqrt(v.x* v.x + v.y* v.y);
};

/**
 * Calculates the distance between two points
 * @param {flax.Point} v1
 * @param {flax.Point} v2
 * @return {Number}
 */
flax.pDistance = function (v1, v2) {
    return flax.pLength(flax.pSub(v1, v2));
};

/**
 * Calculates dot product of two points.
 * @param {flax.Point} v1
 * @param {flax.Point} v2
 * @return {Number}
 */
flax.pDot = function (v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
};

