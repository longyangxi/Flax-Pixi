/**
 * Created by long on 15/11/16.
 */

var _superCls = FRAMEWORK == "pixi" ? PIXI.ParticleContainer : cc.Sprite;

flax.BitmapLabel = _superCls.extend({
    mlWidth:0.0,
    mlHeight:0.0,
    fontName:null,
    fontSize:20,
    frames:[],
    chars:[],
    assetsFile:null,
    name:null,
    params:null,
    _str:null,
    _gap:0,
    _spaceGap:10,
    _charCanvas:null,
    _fontDefine:null,
    _isRealFont:false,

    onEnter: function () {
        this._super();
        this._updateStr();
    },
    onExit: function () {
        this._super();
        this.frames = null;
        this.chars = null;
        this.params = null;
        this._charCanvas = null;
        this._fontDefine = null;
    },
    getString:function()
    {
        return this._str;
    },
    setString:function(str)
    {
        if(str == null) str = "";
        str = "" + str;
        if(str === this._str) return;
        this._str = str;
        this._updateStr();
    },
    getSpaceGap:function()
    {
        return this._spaceGap;
    },
    setSpaceGap:function(gap)
    {
        if(this._spaceGap == gap)  return;
        this._spaceGap = gap;
        if(this._str && this._str.indexOf(" ") > -1){
            this._updateStr();
        }
    },
    getGap:function()
    {
        return this._gap;
    },
    setGap:function(gap)
    {
        if(gap == this._gap) return;
        this._gap = gap;
        if(this._str)
        {
            this._updateStr();
        }
    },
    setFontName:function(font)
    {
        if(font == null) return;
        if(this.fontName != null && this.fontName == font) return;
        this.fontName = font;
        this._isRealFont = true;
        this._fontDefine = flax.assetsManager.getFont(this.assetsFile, this.fontName);
        //If there is no font, then find the Animator as the font
        if(this._fontDefine == null) {
            this._isRealFont = false;
            this._fontDefine = flax.assetsManager.getDisplayDefine(this.assetsFile, this.fontName);
        }
        if(this._fontDefine == null){
            throw "Can't find the font named: " + this.fontName;
        }

        this.frames = flax.assetsManager.getFrameNames(this.assetsFile, parseInt(this._fontDefine['start']), parseInt(this._fontDefine['end']));
        this.chars = this._fontDefine['chars'];
        if(this._isRealFont) this.fontSize = parseInt(this._fontDefine['size']);
    },
    tweenInt:function(from, to, time) {
        this.setString(from);
        var sign = flax.numberSign(to - from);
        if(sign == 0) return;

        var num = Math.abs(to - from);
        var interval = Math.max(time/num, flax.frameInterval);
        num = Math.round(time/interval);
        sign *= Math.round(Math.abs(to - from)/num);
        //todo, num + 10 maybe cause bug!
        this.schedule(function(delta){
            var ct = parseInt(this._str);
            var ci = ct + sign;
            if(sign > 0 && ci > to) ci = to;
            else if(sign < 0 && ci < to) ci = to;
            if(ci != ct) this.setString(ci);
        },interval, num + 10);
    },
    _updateStr:function()
    {
        if(!this.parent || !this._str || !this._str.length) return;

        if(this._charCanvas == null) {
            if(FRAMEWORK == "cocos") {
                var imgFile = flax.path.changeBasename(this.assetsFile, ".png");
                this._charCanvas = new flax.SpriteBatchNode(imgFile, this._str.length);
                this.addChild(this._charCanvas);
            } else if(FRAMEWORK == "pixi") {
                this._charCanvas = this;
                this._fontContext = PIXI.Text.fontPropertiesContext;
                this._fontContext.font = this.params.fontSize + "px " + this.params.font;
            }
        }

        if(!this._isRealFont) this.params.textHeight = 0;
        this._charCanvas.removeAllChildren();

        this.mlWidth = 0;
        this.mlHeight = 0;
        for(var i = 0; i < this._str.length ; i++)
        {
            var ch = this._str[i];
            //if it's a break char or other special char, ignore it for now!
            if(ch == "\n")
            {
                continue;
            }
            if(ch == " ")
            {
                this.mlWidth += this._spaceGap;
                continue;
            }
            var charIndex = this._findCharIndex(ch);

            if(charIndex == -1)
            {
                flax.log("Not found the char: "+ch + " in the fonts: "+ this.fontName);
                continue;
            }
            //todo, use pool for performance improve
            var sprite = new flax.Sprite(flax.spriteFrameCache.getSpriteFrame(this.frames[charIndex]));
            sprite.setAnchorPoint(this._fontDefine.anchorX, this._fontDefine.anchorY);
            sprite.x = this.mlWidth;
            sprite.y = 0;
            this._charCanvas.addChild(sprite);

            // calculate the position of the sprite;
            var size = sprite.getContentSize();

            //in pixi, we have a better method to measure font's width
            if(FRAMEWORK == "pixi") {
                size.width = this._fontContext.measureText(ch).width;
            }
            this.mlWidth += size.width;
            if(i != this._str.length -1) this.mlWidth += this._gap;
            this.mlHeight = size.height > this.mlHeight ? size.height : this.mlHeight;
            if(!this._isRealFont && this.params.textHeight < size.height) this.params.textHeight = size.height;
        }

        if(this.params && this.params.textWidth && this.params.textHeight){
            //restrain the text within the rectangle
            var rx = this.mlWidth/this.params.textWidth;
            var ry = this.mlHeight/this.params.textHeight;
            var r = Math.max(rx, ry);
            var deltaY = 0;
            if(r > 1){
                var rscale = 1/r;
                this._charCanvas.setScale(rscale);
                deltaY = this.mlHeight*(1 - 1/r)*r;
                this.mlWidth *= rscale;
                this.mlHeight *= rscale;

            }
            //enable the center align
            var deltaX = (this.params.textWidth - this.mlWidth)/2;
            i = this._charCanvas.childrenCount;
            while(i--){
                var charChild = this._charCanvas.children[i];
                if(H_ALIGHS[this.params.textAlign] == "center") charChild.x += deltaX;
                else if(H_ALIGHS[this.params.textAlign] == "right") charChild.x += 2*deltaX;
                charChild.y -= deltaY;
            }
        }

        if(FRAMEWORK == "cocos") {
            this._charCanvas.setContentSize(this.mlWidth, this.mlHeight);
            this.setContentSize(this.mlWidth, this.mlHeight);
        }
    },
    _findCharIndex: function (ch) {
        var charIndex = -1;
        if(this._isRealFont) {
            for(var j = 0; j < this.chars.length; j++)
            {
                if(this.chars[j] == ch)
                {
                    charIndex = j;
                    break;
                }
            }
        } else {
            if(this._fontDefine['labels']){
                var label = this._fontDefine['labels'][ch];
                if(label) charIndex = label.start;
            }
            if(charIndex == -1 && !isNaN(parseInt(ch))) {
                charIndex = parseInt(ch);
            }
        }

        return charIndex;
    },
    getBounds:function(coordinate)
    {
        if(coordinate == null) coordinate = true;
        var border = 2;
        var rect = flax.rect(0.5*this.width/this._str.length, -this.params.textHeight, this.width, this.height + border);
        rect.y += (this.params.textHeight - this.height)/2 - border/2;
        if(!coordinate) return rect;
        var w = rect.width;
        var h = rect.height;
        var origin = flax.p(rect.x, rect.y);
        origin = this.convertToWorldSpace(origin);
        if(coordinate.convertToNodeSpace) origin = coordinate.convertToNodeSpace(origin);
        return flax.rect(origin.x, origin.y, w, h);
    },
    destroy:function()
    {
        this.removeFromParent();
    }
});
/**
 * @deprecated
 * */
flax.Label = flax.BitmapLabel;
/**
 * @deprecated
 * */
flax.BitmapLabel.prototype.getRect = flax.BitmapLabel.prototype.getBounds;

var _p = flax.BitmapLabel.prototype;
/** @expose */
_p.gap;
flax.defineGetterSetter(_p, "gap", _p.getGap, _p.setGap);
/** @expose */
_p.spaceGap;
flax.defineGetterSetter(_p, "spaceGap", _p.getSpaceGap, _p.setSpaceGap);
/** @expose */
_p.text;
flax.defineGetterSetter(_p, "text", _p.getString, _p.setString);

/**
 * Create a bitmapLabel from an animation (use its frame as font)
 * */
flax.BitmapLabel.createFromAnim = function (assetsFile, assetID, text) {
    var lbl = new flax.BitmapLabel();
    flax.assetsManager.addAssets(assetsFile);
    lbl.assetsFile = assetsFile;
    lbl.params = {textWidth:0, textHeight:0, textAlign:0};
    lbl.setFontName(assetID);
    lbl.setAnchorPoint(0, 0);
    lbl.setString(text);
    return lbl;
}