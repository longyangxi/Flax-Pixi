/**
 * Created by long on 14-2-3.
 */

var _p = cc.LabelTTF.prototype;
/** @expose */
_p.text;
flax.defineGetterSetter(_p, "text", _p.getString, _p.setString);

flax.createLabel = function(assetsFile, data, define)
{
    //if the plist was exported by the older version, give a tip
    if(data._isText === false){
        throw "The assetsFile: " + assetsFile + " was exported with old version of Flax tool, re-export it to fix the Text issue!";
    }
    //Remove all the \ chars in the text in Web
    if(!flax.sys.isNative) define.text = define.text.split("\\").join("");
    var lbl = null;
    var txtCls = define["class"];
    var bmpFontName = flax.assetsManager.getFont(assetsFile, txtCls);
    //input text
    if(define.input == true){
        if(cc.EditBox == null){
            throw "If you want to use input text, please add module of 'editbox' into project.json!";
        }
        var frames = flax.assetsManager.getFrameNamesOfDisplay(assetsFile, txtCls);
        //todo, the size of the edit box is the background's size, not the text
        if(flax.Scale9Image == null) throw "Please add module of 'gui' or 'ccui'(cocos 3.10 later) into project.json if you want to use EditBox!";
        lbl = new cc.EditBox(cc.size(data.textWidth, data.textHeight), new flax.Scale9Sprite(frames[0]),
            frames[1] ? new flax.Scale9Sprite(frames[1]) : null,
            frames[2] ? new flax.Scale9Sprite(frames[2]) : null);
        lbl.setFontColor(data.fontColor);
        lbl.setFontName(data.font);
        lbl.setFontSize(data.fontSize);
        //the placeholder text will be cleared when begin to edit
        lbl.setPlaceHolder(define.text);
        lbl.setPlaceholderFontName(data.font);
        lbl.setPlaceholderFontSize(data.fontSize);
//        lbl.setPlaceholderFontColor(cc.hexToColor(define.color));
        //set the anchor
        var d = flax.assetsManager.getDisplayDefine(assetsFile, txtCls);
        lbl.setAnchorPoint(d['anchorX'], d['anchorY']);

//        lbl.setInputFlag(cc.EDITBOX_INPUT_FLAG_PASSWORD);
//        lbl.setMaxLength(20);
//        lbl.setDelegate(this);
    }
    //If it is ttf label(has font and the bitmap font is null, other wise use bitmap label
    else if(data.font && bmpFontName == null){
        //todo, if setFontSize bug occur in JSB, pls don't use cc.FontDefinition to create labelTTF
        var labelDef = new cc.FontDefinition();
        labelDef.fontName = data.font;
        labelDef.fontSize = data.fontSize;
        labelDef.textAlign = data.textAlign;
        //labelDef.verticalAlign = cc.VERTICAL_TEXT_ALIGNMENT_CENTER;
        labelDef.fillStyle = data.fontColor;
        labelDef.fontDimensions = true;
        labelDef.boundingWidth = data.textWidth;
        labelDef.boundingHeight = data.textHeight;
        //text, fontName, fontSize, dimensions, hAlignment, vAlignment
        if(txtCls == "null" || !flax.language) {
            lbl = new cc.LabelTTF(define.text, labelDef);
        }else{
            lbl = new cc.LabelTTF(flax.language.getStr(txtCls) || define.text, labelDef);
        }
        lbl.__isTTF = true;
        //enable stroke
        //lbl.enableStroke(cc.color(255, 0, 0, 255), 5);
        //enable shadow
        //lbl.enableShadow(cc.color(255,255,255,255),2,5);
    //bitmap font text
    }else{
        lbl = new flax.BitmapLabel();
        flax.assetsManager.addAssets(assetsFile);
        lbl.assetsFile = assetsFile;
        lbl.params = data;
        lbl.setFontName(txtCls);
        lbl.setAnchorPoint(0, 0);
        lbl.setString(define.text);
    }
    return lbl;
};

flax._fontResources = null;
flax.registerFont = function(name, urls)
{
    if(!name || !urls) return;
    if(typeof urls == "string") urls = [urls];
    if(flax._fontResources == null) flax._fontResources = {};
    flax._fontResources[name] = urls;
};
