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
            flax.log("There is no frame for display: "+this.assetID);
            return;
        }
    },
    doRenderFrame:function(frame)
    {
        var texture = flax.spriteFrameCache.getSpriteFrame(this._frameNames[frame]);
        if(FRAMEWORK == "cocos") this.setSpriteFrame(texture);
        else if(FRAMEWORK == "pixi") this._texture = texture;
        else flax.log("todo render frame for other engine!")
    },
    getDefine:function()
    {
       var define = flax.assetsManager.getDisplayDefine(this.assetsFile, this.assetID);
       if(define == null) throw "There is no Animator named: " + this.assetID + " in assets: " + this.assetsFile + ", or make sure this class extends from the proper class!";
       return define;
    }
});

//Avoid to advanced compile mode
window['flax']['Animator'] = flax.Animator;