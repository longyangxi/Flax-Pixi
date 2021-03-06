/**
 * Created by long on 14-2-11
 */

flax.Animator = flax.FlaxSprite.extend({
    clsName:"flax.Animator",
    _frameNames:null,
    onInit:function()
    {
        var startFrame = this.define['start'];
        var endFrame = this.define['end'];

        this._frameNames = flax.assetsManager.getFrameNames(this.assetsFile, startFrame, endFrame);
        this.totalFrames = this._frameNames.length;
        if(this.totalFrames == 0)
        {
            console.log("There is no frame for display: "+this.assetID);
            return;
        }
    },
    onExit: function () {
        this._super();
        this._frameNames = null;
    },
    doRenderFrame:function(frame)
    {
        var texture = flax.spriteFrameCache.getSpriteFrame(this._frameNames[frame]);
        this.texture = texture;
    },
    getDefine:function()
    {
       var define = flax.assetsManager.getDisplayDefine(this.assetsFile, this.assetID);
       if(define == null) throw "There is no Animator named: " + this.assetID + " in assets: " + this.assetsFile + ", or make sure this class extends from the proper class!";
       return define;
    }
});

window['flax']['Animator'] = flax.Animator;