/**
 * Created by long on 15-9-18.
 */

var flax = flax || {};

flax.buttonSound = null;

flax._soundEnabled = true;

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
      {"id": "kick1", "src": {"wav": "kick1.wav"}},
      {"id": "kick2", "src": {"wav": "kick2.wav"}},
      {"id": "kick3", "src": {"wav": "kick3.wav"}},
      {"id": "kick4", "src": {"wav": "kick4.wav"}},
      {"id": "kick5", "src": {"wav": "kick5.wav"}},
      {"id": "menu", "src": {"mp3": "menu.mp3"}}
    ]
  }
 * */
flax.preloadSounds = function() {
    var gameConfig = flax.game.config;
    var sounds = gameConfig.sounds;
    if(gameConfig.platform != "wechat") {
        createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin]);
        createjs.Sound.alternateExtensions = ["mp3"];
        createjs.Sound.on("fileload", flax._onSoundsLoaded, this);
        //The maximum number of concurrently playing instances of the same sound is 2
        //createjs.Sound.registerSound("res/music/kick1.wav", "kick", 2);
        if(sounds) {
            createjs.Sound.registerSounds(sounds);
        }
    }
    if(sounds) {
        for(var i = 0; i < sounds.manifest.length; i++) {
            var sItem = sounds.manifest[i];
            var type = null;
            for(var k in sItem.src) {
                type = k;
                break;
            }
            flax._registeredSounds[sItem.id] = sounds.path + sItem.src[type];
        }

    }
}

flax._onSoundsLoaded = function(event) {
    console.log("sounds loaded", event.id, event.src);
    var sounds = flax.game.config.sounds;
    if(sounds && sounds.autoPlayMusic == event.id) {
        flax.playMusic(event.id, true);
    }
    // This is fired for each sound that is registered.
    //instance的api: http://createjs.cc/soundjs/docs/classes/HTMLAudioSoundInstance.html
    //var instance = createjs.Sound.play(event.id, {interrupt: createjs.Sound.INTERRUPT_ANY, loop: 3, volume: 1, pan: 1});  // play using id.  Could also use full sourcepath or event.src.
    //instance.on("complete", function(){
    //    console.log("play over...")
    //}, this);
    //是否加载完成的判断
    //if(createjs.Sound.loadComplete(src))
    //sound.destroy之后是不能再播放了，资源全部清除了
    //注册播放ogg在cordova或fb上出错，暂时不用了：{"id": "title", "src": {"ogg": "loop_title.ogg"}}
    //instance.volume = 1;
}

flax.setSoundEnabled = function(value)
{
    if(flax._soundEnabled == value) return;
    flax._soundEnabled = value;
    if(value)
    {
        if(flax._currentMusic) {
            flax._currentMusic.paused = false;
        } else if (flax._lastMusic) {
            flax.playMusic(flax._lastMusic.id, flax._lastMusic.loop, false, flax._lastMusic.volume);
            flax._lastMusic = null;
        }
    } else {
        if(flax._currentMusic) {
            flax._currentMusic.paused = true;
        }
        flax.stopEffect();
    }
}

flax.getSoundEnabled = function() {
    return flax._soundEnabled;
}

flax._lastMusic = null;
flax._currentMusic = null;
flax._currentMusicInfo = null;

flax.playMusic = function(id, loop, releaseOld, volume)
{
    if(loop == null || loop === true) loop = -1;
    else if(loop === false) loop = 0;
    if(!volume) volume = 1.0;

    if(flax._soundEnabled) {
        if(flax._currentMusic) {
            flax._currentMusic.stop();
            if(releaseOld !== false) flax._currentMusic.destroy();
        }
        //For wechat game
        if(flax.game.config.platform === "wechat") {
            var bgm = wx.createInnerAudioContext()
            bgm.autoplay = true;
            bgm.loop = loop == -1;
            bgm.src = flax.getResUrl(flax._registeredSounds[id]);
            bgm.volume = volume;
            bgm.play();
            return bgm;
        }
        flax._currentMusic = createjs.Sound.play(id, {loop: loop, volume: volume});
        flax._currentMusicInfo = {id: id, loop: loop, volume: volume, position: flax._currentMusic.position};
    } else {
        flax._lastMusic = {id: id, loop: loop, volume: volume};
    }
}

flax.restartCurrentMusic = function() {
    if(flax._currentMusicInfo) {
        flax.playMusic(flax._currentMusicInfo.id, flax._currentMusicInfo.loop, false, flax._currentMusicInfo.volume);
        if(flax._currentMusic) flax._currentMusic.position = flax._currentMusicInfo.position;
    }
}

flax.stopMusic = function(release){
    if(flax._currentMusic) {
        flax._currentMusic.stop();
        if(release) {
            flax._currentMusic.destroy();
            flax._currentMusic = null;
            flax._currentMusicInfo = null;
        }
    }
}

flax.pauseMusic = function(){
    if(flax._currentMusic) {
        flax._currentMusic.paused = true;
        if(flax._currentMusicInfo) {
            flax._currentMusicInfo.position = flax._currentMusic.position;
        }
    }
}

flax.resumeMusic = function(){
    if(!flax._soundEnabled) return;
    if(flax._currentMusic) {
        flax._currentMusic.paused = false;
    }
}

flax._effects = [];
flax.playEffect = function(id, volume)
{
    if(!flax._soundEnabled) return;

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

    var effect = createjs.Sound.play(id, {loop: 0, volume: volume});
    flax._effects.push(effect);
    return effect;
}
flax.stopEffect = function(effect)
{
    if(effect) {
        var i = flax._effects.indexOf(effect);
        if(i > -1) flax._effects.splice(i, 1);
        effect.stop();
    } else {
        for(var i = 0; i < flax._effects.length; i++) {
            flax._effects[i].stop();
        }
        flax._effects.length = 0;
    }
};
flax.playSound = function(url, volume)
{
    return flax.playEffect(url, volume);
};

flax.fixSoundBugIos = function() {
    createjs.WebAudioPlugin.playEmptySound();
    //TODO, 有时候音乐并没有停止，这个时候，怎么能续上最好，不过目前也能接受了
    flax.restartCurrentMusic();
}

flax.onScreenHide.add(function () {
    flax.pauseMusic();
});

flax.onScreenShow.add(function () {
    flax.resumeMusic();
});