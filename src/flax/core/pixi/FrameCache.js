/**
 * Created by long on 15/10/22.
 */

var flax = flax || {};

flax.SpriteFrameCache = flax.Class.extend({

    _REG1 : /^\s*\{\s*([\-]?\d+[.]?\d*)\s*,\s*([\-]?\d+[.]?\d*)\s*\}\s*$/,
    _REG2 : /^\s*\{\s*\{\s*([\-]?\d+[.]?\d*)\s*,\s*([\-]?\d+[.]?\d*)\s*\}\s*,\s*\{\s*([\-]?\d+[.]?\d*)\s*,\s*([\-]?\d+[.]?\d*)\s*\}\s*\}\s*$/,

    addSpriteFrames:function (file, texture) {
        var dict = flax.loader.getRes(file);
        if(dict == null) throw "Please load the resource: " + file + " firstly!";

        flax.loader.release(file);
        this._createSpriteFrames(file, dict, texture);
    },
    removeSpriteFramesFromFile: function (file) {
        var imgFile = flax.path.changeExtname(file, ".png");
        var resource = flax.loader.getRes(imgFile);
        if(resource){
            var textures = resource.textures;
            for(var n in textures){
                delete PIXI.utils.TextureCache[n];
            }
        }
        delete PIXI.utils.BaseTextureCache[imgFile];
        delete PIXI.utils.TextureCache[imgFile];
    },
    getSpriteFrame: function (frameId) {
        return PIXI.utils.TextureCache[frameId];
    },
    setSpriteFrame: function (frameId, texture) {
        PIXI.utils.TextureCache[frameId] = texture;
    },
    _createSpriteFrames: function(file, dict, texture) {
        var frames = dict["frames"];
        var meta = dict['metadata'];

        if(!frames) throw "Invalid sprite frames file!";

        var texturePath;
        if(!texture || typeof texture == "string"){
            texturePath = texture || flax.path.changeBasename(file, meta['image'] || ".png");
            var imgRes = flax.loader.getRes(texturePath);
            if(imgRes && imgRes.texture){
                texture = imgRes.texture;
            }else{
                texture = PIXI.Texture.fromImage(texturePath);
            }
        }
        if(!texture || !(texture instanceof PIXI.Texture)) {
            throw "The texture parameter is not valid: " + texturePath;
        }

        for (var key in frames) {

            var frame = frames[key];
            if(!frame) continue;
            //Real texture rectangle for this frame
            var rect = this._rectFromString(frame["frame"]);
            //The frame rectangle offset to the full rectangle
            var offset = this._pointFromString(frame["offset"]);
            //Full rectangle who covered all frames in this animation
            var sourceSize = this._pointFromString(frame["sourceSize"]);
            //If rotated
            var rotated = frame["rotated"] || false;

            var trim = null;
            if(offset.x != 0 || offset.y != 0){
                trim = flax.rect(offset.x, offset.y, sourceSize.x, sourceSize.y);
            }

            var t = new PIXI.Texture(texture.baseTexture, rect, flax.rect(rect), trim, rotated);

            PIXI.utils.TextureCache[key] = t;
        }
    },
    _rectFromString :  function (content) {
        var result = this._REG2.exec(content);
        if(!result) return flax.rect(0, 0, 0, 0);
        return flax.rect(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3]), parseFloat(result[4]));
    },
    _pointFromString : function (content) {
        var result = this._REG1.exec(content);
        if(!result) return flax.p(0,0);
        return flax.p(parseFloat(result[1]), parseFloat(result[2]));
    }
})
flax.spriteFrameCache = new flax.SpriteFrameCache();