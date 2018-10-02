/**
 * Created by long on 15/10/23.
 */

var flax = flax || {};

/**
 * https://github.com/tweenjs/tween.js/
 var someDisplay = this.mainMenu.newgamebtn;
 var actions = [
     flax.moveTo(someDisplay, 0.3, {x: someDisplay.x + 100, y: someDisplay.y + 100}, 0.5),
     flax.moveBy(someDisplay, 0.3, {x: -100, y: -100}),
     flax.rotateTo(someDisplay, 0.3, 180),
     flax.rotateBy(someDisplay, 0.3, -180),
     flax.scaleTo(someDisplay, 0.3, {x: 1.2, y: 0.8}),
     flax.scaleBy(someDisplay, 0.3, {x: -0.2, y: 0.2}),
     //flax.scaleTo(someDisplay, 0.3, 0.8),
     //flax.scaleBy(someDisplay, 0.3, 0.2),
     flax.alphaTo(someDisplay, 0.3, 0.2),
     flax.alphaBy(someDisplay, 0.3, 0.8),
     flax.blink(someDisplay, 0.3, 3),
     flax.blinkColor(someDisplay, 0.3, "#FF0000", 3)
 ]

 flax.runActions(actions, function(){
    console.log("Actions complete!")
 }, function(){
    console.log("Actions start!");
 })
 * */

//flax.onActionStart = new signals.Signal();
//flax.onActionComplete = new signals.Signal();

flax.moveTo = function(target, t, pos, delay) {
    var tween = new TWEEN.Tween(target.position)
        .to(pos, t * 1000)
        //.onStart(function(){
        //    flax.onActionStart.dispatch(tween);
        //})
        //.onComplete(function(){
        //    flax.onActionComplete.dispatch(tween);
        //})
    if(delay > 0) tween.delay(delay * 1000);
    return tween;
}

flax.moveBy = function(target, t, delta, delay) {
    var deltaObj = {};
    if(delta.x != null && delta.x != 0) {
        deltaObj.x = (delta.x > 0 ? "+" : "-") + Math.abs(delta.x);
    }
    if(delta.y != null && delta.y != 0) {
        deltaObj.y = (delta.y > 0 ? "+" : "-") + Math.abs(delta.y);
    }
    var tween = new TWEEN.Tween(target.position)
        .to(deltaObj, t * 1000);
    if(delay > 0) tween.delay(delay * 1000);
    return tween;
}

flax.rotateTo = function(target, t, angle, delay) {
    var tween = new TWEEN.Tween(target)
        .to({rotation: angle * DEGREE_TO_RADIAN}, t * 1000)
    return tween;
}

flax.rotateBy = function(target, t, delta, delay) {
    var deltaObj = {};
    if(delta != null && delta != 0) {
        deltaObj.rotation = (delta > 0 ? "+" : "-") + Math.abs(delta * DEGREE_TO_RADIAN);
    }
    var tween = new TWEEN.Tween(target)
        .to(deltaObj, t * 1000)
    if(delay > 0) tween.delay(delay * 1000);
    return tween;
}

flax.scaleTo = function(target, t, scale, delay) {
    if(typeof scale != "object") {
        scale = {x: scale, y: scale}
    }
    var tween = new TWEEN.Tween(target.scale)
        .to(scale, t * 1000);
    if(delay > 0) tween.delay(delay * 1000);
    return tween;
}

flax.scaleBy = function(target, t, delta, delay) {
    if(typeof delta != "object") {
        delta = {x: delta, y: delta}
    }
    var deltaObj = {};
    if(delta.x != null && delta.x != 0) {
        deltaObj.x = (delta.x > 0 ? "+" : "-") + Math.abs(delta.x);
    }
    if(delta.y != null && delta.y != 0) {
        deltaObj.y = (delta.y > 0 ? "+" : "-") + Math.abs(delta.y);
    }
    var tween = new TWEEN.Tween(target.scale)
        .to(deltaObj, t * 1000);
    if(delay > 0) tween.delay(delay * 1000);
    return tween;
}

flax.alphaTo = function(target, t, alpha, delay) {
    var tween = new TWEEN.Tween(target)
        .to({alpha: alpha}, t * 1000);
    if(delay > 0) tween.delay(delay * 1000);
    return tween;
}

flax.alphaBy = function(target, t, delta, delay) {
    var deltaObj = {};
    if(delta != null && delta != 0) {
        deltaObj.alpha = (delta > 0 ? "+" : "-") + Math.abs(delta);
    }
    var tween = new TWEEN.Tween(target)
        .to(deltaObj, t * 1000);
    if(delay > 0) tween.delay(delay * 1000);
    return tween;
}

flax.blink = function(target, inverval, times, delay) {
    if(!flax.scheduler) return null;
    if(times <= 0) {
        throw "Blink times must > 0"
    }
    times *= 2;
    //构造一个空的Tween
    var tween = new TWEEN.Tween(target)
        .to({__test_prop: 100}, inverval * times * 1000)
        .onStart(function() {
            var index = 0;
            flax.scheduler.schedule(target, function(delta) {
                target.visible = (index++ % 2 == 0);
            }, inverval, times, delay);
        })
    if(delay > 0) tween.delay(delay * 1000);
    return tween;
}

flax.blinkColor = function(target, inverval, color, times, delay) {
    if(!flax.scheduler) return null;
    if(times <= 0) {
        throw "Blink times must > 0"
    }
    times *= 2;
    //构造一个空的Tween
    var tween = new TWEEN.Tween(target)
        .to({__test_prop: 100}, inverval * times * 1000)
        .onStart(function() {
            var index = 0;
            var originColor = target.tint;
            flax.scheduler.schedule(target, function(delta) {
                var currentColor = (index++ % 2 != 0) ? color : originColor;
                if(typeof target.setColor == "function") {
                    target.setColor(currentColor);
                } else {
                    target.tint = currentColor;
                }
            }, inverval, times, delay);
        })
    if(delay > 0) tween.delay(delay * 1000);
    return tween;
}

flax.runActions = function(actions, onComplete, onStart, repeat) {
    if(!(actions instanceof  Array)) {
        throw "actions must be a array of action!"
    }

    var actFirst = actions[0];
    var act = actFirst;
    var actLast = null;
    for(var i = 1; i < actions.length; i++) {
        actLast = actions[i];
        act.chain(actLast);
        act = actLast;
    }

    if(repeat === true) {
        if(actLast == null) {
            actFirst.repeat(Infinity);
        } else {
            actLast.chain(actFirst);
        }
    }

    if(actLast == null) actLast = act;

    if(onComplete) actLast.onComplete(onComplete);
    if(onStart) actFirst.onStart(onStart);

    actFirst.start();

    return actLast;
}

//TODO, shake, 果冻，秋千，更多