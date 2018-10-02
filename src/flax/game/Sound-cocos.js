/**
 * Created by long on 15-9-18.
 */

var flax = flax || {};

flax.buttonSound = null;

flax._sound_cookie_key = "flax_sound_state";

flax._soundEnabled = flax.sys.localStorage.getItem(flax._sound_cookie_key) != "false";

/**
 * key id
 * value src
 * */
flax._registeredSounds = {

}

/**
 * Define your preload sounds in project.json like:
 * "sounds": {
    "path": "res/music/",
    "autoPlay": "menu",
    "manifest": [
      "sound1": "sound1.mp3"
    ]
  }
 * */
flax.preloadSounds = function() {
    var gameConfig = flax.game.config;
    var sounds = gameConfig.sounds;

    if(sounds) {
        for(var id in sounds.manifest) {
            var src = sounds.manifest[id];
            var src = sounds.path + src;
            src = src.replace(/\/\//g, "/");
            flax._registeredSounds[id] = src;
        }
        if(sounds.autoPlayMusic) {
            flax.playMusic(sounds.autoPlayMusic);
        }
    }
}

flax.setSoundEnabled = function(value)
{
    if(flax._soundEnabled == value) return;
    flax._soundEnabled = value;
    var audioEngine = flax.audioEngine;
    if(value)
    {
        //audioEngine.resumeMusic();
        audioEngine._resumePlaying();
        //if(flax._lastMusic) {
        //    flax.playMusic(flax._lastMusic.id, flax._lastMusic.volume, flax._lastMusic.loop);
        //    flax._lastMusic = null;
        //}
    }else{
        //audioEngine.pauseMusic();
        //audioEngine.stopAllEffects();
        audioEngine._pausePlaying();
    }
    flax.sys.localStorage.setItem(flax._sound_cookie_key, value ? "true" : "false")
};
flax.getSoundEnabled = function() {
    return flax._soundEnabled;
};

flax._lastMusic = null;
flax._currentMusic = null;

flax.playMusic = function(id, volume, loop, releaseOld)
{
    if(loop !== false) loop = true;

    if(!volume) volume = 1.0;

    var path = flax._registeredSounds[id];
    if(!path) {
        path = id;
        //console.log("Please register sound id: " + id + " firstly!")
        //return;
    }
    if(flax._soundEnabled){
        //For wechat game
        if(flax.game.config.platform === "wechat") {
            var bgm = wx.createInnerAudioContext()
            bgm.autoplay = true;
            bgm.loop = loop;
            bgm.src = flax.getResUrl(flax._registeredSounds[id]);
            bgm.volume = volume;
            bgm.play();
            return bgm;
        }
        var audioEngine = flax.audioEngine;
        //audioEngine.stopMusic(releaseOld === true);
        flax._currentMusic = audioEngine.playMusic(path, loop);
    }else{
        flax._lastMusic = {id: id, volume: volume, loop: loop};
    }
};
flax.stopMusic = function(release){
    flax.audioEngine.stopMusic(release === true);
};
flax.pauseMusic = function(){
    flax.audioEngine.pauseMusic();
};
flax.resumeMusic = function(){
    if(!flax._soundEnabled) return;
    flax.audioEngine.resumeMusic();
}

flax.pauseAllSounds = function() {
    flax.audioEngine._pausePlaying();
}

flax.resumeAllSounds = function() {
    if(flax._soundEnabled) {
        flax.audioEngine._resumePlaying();
    }
}

flax.DEFAULT_MIN_SOUND_INTERVAL = 100;

flax.minSoundIntervals = {

}
flax._lastSoundTimes = {

}

flax.playEffect = function(id, volume)
{
    if(!flax._soundEnabled) return;
    var path = flax._registeredSounds[id];
    if(!path) {
        path = id;
    }

    var minInterval = flax.minSoundIntervals[id] || flax.DEFAULT_MIN_SOUND_INTERVAL;
    var lastTime = flax._lastSoundTimes[id];
    if(!lastTime) flax._lastSoundTimes[id] = 0;
    var now = flax.scheduler.time;
    if(now - lastTime < minInterval) {
        return;
    }
    flax._lastSoundTimes[id] = now;

    //For wechat game
    if(flax.game.config.platform === "wechat") {
        var bgm = wx.createInnerAudioContext()
        bgm.autoplay = false;
        bgm.loop = false;
        bgm.src = flax.getResUrl(flax._registeredSounds[id]);
        bgm.volume = volume || 1;
        bgm.play();
        return bgm;
    }
    var audioEngine = flax.audioEngine;
    var audio = audioEngine.playEffect(path);
    return audio;
};
flax.stopEffect = function(effect)
{
    var audioEngine = flax.audioEngine;
    if(effect != null) audioEngine.stopEffect(effect);
    else audioEngine.stopAllEffects();
};
flax.playSound = function(path)
{
    return flax.playEffect(path);
};

flax.setMusicVolume = function(volume){
    var audioEngine = flax.audioEngine;
    audioEngine.setMusicVolume(volume);
}

flax.onScreenHide.add(flax.pauseAllSounds);
flax.onScreenShow.add(flax.resumeAllSounds);