/**
 * Created by long on 15-8-14.
 */

var flax = flax || {};

flax.getAngle = function(startPoint, endPoint, forDegree)
{
    var x0 = 0;
    var y0 = 0;
    if(startPoint){
        x0 = startPoint.x;
        y0 = startPoint.y;
    }
    var dx = endPoint.x - x0;
    var dy = endPoint.y - y0;
    return flax.getAngle1(dx, dy, forDegree);
};
flax.getAngle1 = function(dx, dy, forDegree)
{
    if(forDegree === undefined) forDegree = true;
    var angle = Math.atan2(dx, dy);
    if(angle < 0) angle += 2*Math.PI;
    if(forDegree)
    {
        angle *= RADIAN_TO_DEGREE;
    }
    return angle;
};
flax.getDistance = function(p0, p1)
{
    var x0 = p0 == null ? 0 : p0.x;
    var y0 = p0 == null ? 0 : p0.y;
    var dx = p1.x - x0;
    var dy = p1.y - y0;
    return Math.sqrt(dx*dx + dy*dy);
}
flax.getPointOnCircle = function(center, radius, angleDegree)
{
    angleDegree = 90 - angleDegree;
    angleDegree *= DEGREE_TO_RADIAN;
    var cx = center ? center.x : 0;
    var cy = center ? center.y : 0;
    return {x: cx + radius*Math.cos(angleDegree), y: cy + radius*Math.sin(angleDegree)};
};

/**
 * Solve the incompatible of Array.sort in different browsers
 * */
flax.sortArray = function (array, fn) {
    if(fn == null) {
        fn = function (a, b) {
            return b > a
        }
    }
    for(var i = 0; i < array.length; i++) {
        var key = array[i];
        var j = i - 1;
        while(j >= 0 && fn(array[j], key)) {
            array[j + 1] = array[j];
            j--;
        }
        array[j + 1] = key;
    }
    return array;
}

flax.shuffleArray = function(arr, len)
{
    if(len === undefined || len <= 0 || len > arr.length) len = arr.length;
    for (var i = len - 1; i >= 0; i--) {
        var j = 0 | ((Math.random() * 0xffffff) % (i + 1));
        var v = arr[i];
        arr[i] = arr[j];
        arr[j] = v;
    }
};
flax.restrictValue = function(value, min, max)
{
    value = Math.max(min, value);
    value = Math.min(max, value);
    return value;
};
flax.numberSign = function(number){
    if(number == 0) return 0;
    return number > 0 ? 1 : -1;
};
flax.randInt = function (start, end)
{
    return start + Math.floor(Math.random()*(end - start));
};
flax.getRandomInArray = function (arr, rates)
{
    if(arr == null) return null;
    if(rates == null){
        var i = flax.randInt(0, arr.length);
        return arr[i];
    }
    var rate = Math.random();
    var totalRate = 0;
    for(var i = 0; i < rates.length; i++)
    {
        if(rates[i] <= 0) continue;
        totalRate += rates[i];
        if(rate <= totalRate){
            break;
        }
    }
    //if the rates sum is not 1
    if(i == rates.length) {
        i = flax.randInt(0, arr.length);
        console.warn("The sum of the rates is not equal with 1!")
    }
    return arr[i];
};
/**
 * Create an int array like this: [0, -1, 1, -2, 2, -3, 3, -4, 4, -5, 5, -6, 6, -7, 7, ...]
 * */
flax.createDInts = function(count, centerInt)
{
    if(isNaN(centerInt)) centerInt = 0;
    var ds = [];
    var i = -1;
    var d0 = centerInt - 1;
    var d1 = centerInt;
    while(++i < count){
        if(i%2 == 0) {
            ds.push(++d0);
        }else{
            ds.push(--d1);
        }
    }
    return ds;
};

/**
 * Create an random int array between min and max with length
 * */
flax.createRandInts = function(min, max, length, noDuplicate)
{
    var arr = [];

    var maxLength = max - min;
    if(length <= 0 || maxLength <= 0 || maxLength < length) return arr;

    while(arr.length < length) {
        var i = flax.randInt(min, max);
        if(noDuplicate !== false) {
            if(arr.indexOf(i) == -1) {
                arr.push(i);
            }
        } else {
            arr.push(i);
        }
    }
    return arr;
};

