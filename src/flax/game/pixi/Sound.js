/**
 * Created by long on 15-9-18.
 */

var flax = flax || {};

flax.buttonSound = null;

flax._soundEnabled = true;

flax.setSoundEnabled = function(value)
{
    if(flax._soundEnabled == value) return;
    flax._soundEnabled = value;
    if(value)
    {
        if(flax._currentMusic) {
            flax._currentMusic.play();
        } else if (flax._lastMusic) {
            flax.playMusic(flax._lastMusic.url, flax._lastMusic.loop);
            flax._lastMusic = null;
        }
    } else {
        if(flax._currentMusic) {
            flax._currentMusic.pause();
        }
        flax.stopEffect();
    }
}

flax.getSoundEnabled = function() {
    return flax._soundEnabled;
}

flax._lastMusic = null;
flax._currentMusic = null;
flax.playMusic = function(url, loop, releaseOld)
{
    if(flax._soundEnabled) {
        if(flax._currentMusic) {
            flax._currentMusic.stop();
            if(releaseOld !== false) flax._currentMusic.unload();
        }
        flax._currentMusic = new Howl({
            urls: [url],
            autoplay: true,
            loop: loop,
            volume: 1.0
        });
    } else {
        flax._lastMusic = {url: url, loop: loop};
    }
}

flax.stopMusic = function(release){
    if(flax._currentMusic) {
        flax._currentMusic.stop();
        if(release) flax._currentMusic.unload();
    }
}

flax.pauseMusic = function(){
    if(flax._currentMusic) {
        flax._currentMusic.pause();
    }
}

flax.resumeMusic = function(){
    if(!flax._soundEnabled) return;
    if(flax._currentMusic) {
        flax._currentMusic.play();
    }
}

flax._effects = [];
flax.playEffect = function(url)
{
    if(!flax._soundEnabled) return;
    var effect = new Howl({
        urls: [url],
        autoplay: true,
        loop: false,
        volume: 1.0,
        onend: function () {
            var i = flax._effects.indexOf(effect);
            if(i > -1) flax._effects.splice(i, 1);
            effect.unload();
        }
    });
    effect.play();
    flax._effects.push(effect);
    return effect;
}
flax.stopEffect = function(effect)
{
    if(effect) {
        var i = flax._effects.indexOf(effect);
        if(i > -1) flax._effects.splice(i, 1);
        effect.unload();
    } else {
        for(var i = 0; i < flax._effects.length; i++) {
            flax._effects[i].unload();
        }
        flax._effects.length = 0;
    }
};
flax.playSound = function(url)
{
    return flax.playEffect(url);
};