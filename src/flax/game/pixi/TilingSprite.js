/**
 * @author       Longsir <longames@qq.com>
 * @copyright    2015 Longames Ltd.
 * @github       {@link https://github.com/longyangxi/flax.js}
 * @flax         {@link http://flax.so}
 * @license      MIT License: {@link http:http://mit-license.org/}
 */

var flax = flax || {};

flax.toClass(PIXI.extras.TilingSprite);

flax.TilingSprite = PIXI.extras.TilingSprite.extend({
    currentFrame:0,
    totalFrames:0,
    _frameNames:null,
    _loopStart:0,
    _loopEnd:0,
    _fps:0,
    _animReversed:false,
//todo
    //ctor: function (width, height) {
    //    this._super(null, width, height)
    //},
    onEnter: function () {
        this._super();
        this.renderFrame(this.currentFrame);
    },
    setSource: function (assetsFile, assetID) {

        var define = flax.assetsManager.getDisplayDefine(assetsFile, assetID);
        if(!define) throw "There is no asset: " + assetID + " in file: " + assetsFile;

        var startFrame = define['start'];
        var endFrame = define['end'];

        this._frameNames = flax.assetsManager.getFrameNames(assetsFile, startFrame, endFrame);
        this.totalFrames = this._frameNames.length;
        //set the fps from flash
        if(this._fps == 0) this.setFPS(define['fps']);
        this.renderFrame(this.currentFrame);
    },
    play: function (reversed) {

        if(reversed !== true) {
            this._loopStart = 0;
            this._loopEnd = this.totalFrames - 1;
        } else {
            this._animReversed = true;
            this._loopStart = this.totalFrames - 1;
            this.currentFrame = this._loopStart;
            this._loopEnd = 0;
        }

        this.updatePlaying(true);
    },
    stop: function () {
        this._animReversed = false;
        this.updatePlaying(false);
    },
    onFrame: function (delta) {

        if(!this.visible) return;

        var reversed = this._animReversed;
        var d = reversed ? -1 : 1;
        this.currentFrame += d;

        var end = !reversed  ? this.currentFrame > this._loopEnd : this.currentFrame < this._loopEnd;
        var last = !reversed ? this.currentFrame > this.totalFrames - 1 : this.currentFrame < 0;
        if(end || last) this.currentFrame = this._loopStart;

        this.renderFrame(this.currentFrame);
    },
    renderFrame:function(frame)
    {
        this._texture = flax.spriteFrameCache.getSpriteFrame(this._frameNames[frame]);
    },
    setFPS:function(f)
    {
        if(this._fps == f)  return;
        this._fps = f;
        this.updateSchedule();
    },
    getFPS:function(){
        return this._fps;
    },
    updatePlaying:function(state)
    {
        if(this.playing == state) return;
        this.playing = state;
        this.updateSchedule();
    },
    updateSchedule:function()
    {
        if(this.playing)
        {
            if(this.totalFrames > 1) this.schedule(this.onFrame, 1.0/this._fps);
        }else{
            this.unschedule(this.onFrame);
        }
    }
})