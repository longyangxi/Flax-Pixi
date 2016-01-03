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
    var audioEngine = cc.audioEngine;
    if(value)
    {
        audioEngine.resumeMusic();
        if(flax._lastMusic) {
            flax.playMusic(flax._lastMusic, true);
            flax._lastMusic = null;
        }
    }else{
        audioEngine.pauseMusic();
        audioEngine.stopAllEffects();
    }
};
flax.getSoundEnabled = function() {
    return flax._soundEnabled;
};
flax._lastMusic = null;
flax.playMusic = function(path, loop, releaseOld)
{
    var audioEngine = cc.audioEngine;
    audioEngine.stopMusic(releaseOld === true);
    if(flax._soundEnabled){
        audioEngine.playMusic(path, loop);
    }else{
        flax._lastMusic = path;
    }
};
flax.stopMusic = function(release){
    cc.audioEngine.stopMusic(release === true);
};
flax.pauseMusic = function(){
    cc.audioEngine.pauseMusic();
};
flax.resumeMusic = function(){
    cc.audioEngine.resumeMusic();
}
flax.playEffect = function(path)
{
    if(!flax._soundEnabled) return;
    var audioEngine = cc.audioEngine;
    var id = audioEngine.playEffect(path);
    return id;
};
flax.stopEffect = function(effectID)
{
    var audioEngine = cc.audioEngine;
    if(effectID != null) audioEngine.stopEffect(effectID);
    else audioEngine.stopAllEffects();
};
flax.playSound = function(path)
{
    return flax.playEffect(path);
};