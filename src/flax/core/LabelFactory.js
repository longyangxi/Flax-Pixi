/**
 * Created by long on 15/11/16.
 */

/**
 * Override the PIXI default wordWrap to support Chinese char
 */
PIXI.Text.prototype.wordWrap = function (text)
{
    // Greedy wrapping algorithm that will wrap words as the line grows longer
    // than its horizontal bounds.
    var result = '';
    var lines = text.split('\n');
    var wordWrapWidth = this._style.wordWrapWidth;
    for (var i = 0; i < lines.length; i++)
    {
        var spaceLeft = wordWrapWidth;
        var line = lines[i];
        
        var word = "";
        var wordCount = 0;
        for(var j = 0; j < line.length; j++) {
            var cCode = line.charCodeAt(j);
            var wordEnd = false;
            var hasSpace = false;
            //Chindese char
            if(cCode > 255 || cCode < 0) {
                wordEnd = true;
                if(word == "") {
                    word = line[j];
                } else {
                    j--;
                }
            } else if(line[j] == " ") {
                wordEnd = true;
                hasSpace = true;
            } else {
                word += line[j];
                wordEnd = j == line.length - 1;
            }
            
            if(!wordEnd) continue;
                        
            var wordWidth = this.context.measureText(word).width;
            var wordWidthWithSpace = wordWidth + this.context.measureText(' ').width;
            if (wordCount === 0 || wordWidthWithSpace > spaceLeft)
            {
                // Skip printing the newline if it's the first word of the line that is
                // greater than the word wrap width.
                if (wordCount > 0)
                {
                    result += '\n';
                }
                result += word;
                spaceLeft = wordWrapWidth - wordWidth;
            }
            else
            {
                if(hasSpace) {
                    spaceLeft -= wordWidthWithSpace;
                    result += ' ';
                } else {
                    spaceLeft -= wordWidth;
                }
                    
                result += word;
            }
            word = "";
            wordCount++;
        }

        if (i < lines.length-1)
        {
            result += '\n';
        }
    }
    return result;
};

PIXI.Text.prototype.setString = function(text) {
    this.text = text;
}

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

    /**
     * http://pixijs.download/dev/docs/PIXI.TextStyle.html
     *  var style = new PIXI.TextStyle({
                fontFamily: 'Arial',
                fontSize: 36,
                fontStyle: 'italic',
                fontWeight: 'bold',
                fill: ['#ffffff', '#00ff99'], // gradient
                stroke: '#4a1850',
                strokeThickness: 5,
                dropShadow: true,
                dropShadowColor: '#000000',
                dropShadowBlur: 4,
                dropShadowAngle: Math.PI / 6,
                dropShadowDistance: 6,
                wordWrap: true,
                wordWrapWidth: 440
            });
     * */
    var styleInfo = {
        fontFamily: data.font,
        fontSize: data.fontSize * flax.resolution,
        fill: data.fontColor,
        align: data.textAlign,
        wordWrap: true,
        breakWords: true,// For chinese words specially
        wordWrapWidth: data.textWidth,
        lineHeight: data.lineHeight,
        //padding: 10,
        //offsetX: 0,
        //offsetY: 10,
        //padding: 10,
        //fontWeight: "bold",
        //stroke: 0xAAAAAA,//data.fontColor,
        //strokeThickness: 2,
        //dropShadow: true,
        //dropShadowColor: '#000000',
        //dropShadowBlur: 1
        //fontStyle: data.style
    }

    //input text
    if(define.input == true){

        delete styleInfo.wordWrap;
        var style = new PIXI.TextStyle(styleInfo);

        //TODO
        lbl= new PixiTextInput("", style, false, true);
        lbl.placeholder = define.text;
        // lbl = new flax.Text(define.text, style);

        // var d = flax.assetsManager.getDisplayDefine(assetsFile, txtCls);
        // lbl.setAnchorPoint(d['anchorX'], d['anchorY']);
    }
    //If it is ttf text(has font and the bitmap font is null), other wise use bitmap label
    else if(data.font && bmpFontName == null){
        var style = new PIXI.TextStyle(styleInfo);

        if(txtCls == "null" || !flax.language) {
            lbl= new flax.Text(define.text, style);
        }else{
            lbl= new flax.Text(flax.language.getStr(txtCls) || define.text, style);
        }

        lbl.__isTTF = true;

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


/**
 * Note: copy from pixi and solve the single line text align issue
 *
 * Measures the supplied string of text and returns a Rectangle.
 *
 * @param {string} text - the text to measure.
 * @param {PIXI.TextStyle} style - the text style to use for measuring
 * @param {boolean} [wordWrap] - optional override for if word-wrap should be applied to the text.
 * @param {HTMLCanvasElement} [canvas] - optional specification of the canvas to use for measuring.
 * @return {PIXI.TextMetrics} measured width and height of the text.
 */


PIXI.TextMetrics.measureText = function (text, style, wordWrap) {
    var canvas = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : PIXI.TextMetrics._canvas;

    wordWrap = wordWrap || style.wordWrap;
    var font = style.toFontString();
    var fontProperties = PIXI.TextMetrics.measureFont(font);
    var context = canvas.getContext('2d');

    context.font = font;

    var outputText = wordWrap ? PIXI.TextMetrics.wordWrap(text, style, canvas) : text;
    var lines = outputText.split(/(?:\r\n|\r|\n)/);
    var lineWidths = new Array(lines.length);

    /**TODO, EIDT by longsir**/
    var maxLineWidth = style.wordWrap ? style.wordWrapWidth : 0;
    /**TODO, EIDT by longsir**/

    for (var i = 0; i < lines.length; i++) {
        var lineWidth = context.measureText(lines[i]).width + (lines[i].length - 1) * style.letterSpacing;

        lineWidths[i] = lineWidth;
        maxLineWidth = Math.max(maxLineWidth, lineWidth);
    }
    var width = maxLineWidth + style.strokeThickness;

    if (style.dropShadow) {
        width += style.dropShadowDistance;
    }

    var lineHeight = style.lineHeight || fontProperties.fontSize + style.strokeThickness;
    var height = Math.max(lineHeight, fontProperties.fontSize + style.strokeThickness) + (lines.length - 1) * (lineHeight + style.leading);

    if (style.dropShadow) {
        height += style.dropShadowDistance;
    }

    return new PIXI.TextMetrics(text, style, width, height, lines, lineWidths, lineHeight + style.leading, maxLineWidth, fontProperties);
};
/**
 * Note: copy from pixi and try to solve font size issue but failed, 目前用 迷你简大黑 可以
 *
 * Calculates the ascent, descent and fontSize of a given font-style
 *
 * @static
 * @param {string} font - String representing the style of the font
 * @return {PIXI.TextMetrics~FontMetrics} Font properties object
 */


PIXI.TextMetrics.measureFont = function measureFont(font) {
    // as this method is used for preparing assets, don't recalculate things if we don't need to
    if (PIXI.TextMetrics._fonts[font]) {
        return PIXI.TextMetrics._fonts[font];
    }

    var properties = {};

    var canvas = PIXI.TextMetrics._canvas;
    var context = PIXI.TextMetrics._context;

    context.font = font;

    var width = Math.ceil(context.measureText('|MÉq').width);
    var baseline = Math.ceil(context.measureText('M').width);
    var height = 2 * baseline;

    baseline = baseline * 1.4 | 0;

    canvas.width = width;
    canvas.height = height;

    context.fillStyle = '#f00';
    context.fillRect(0, 0, width, height);

    context.font = font;

    context.textBaseline = 'alphabetic';
    context.fillStyle = '#000';
    context.fillText('|MÉq', 0, baseline);

    var imagedata = context.getImageData(0, 0, width, height).data;
    var pixels = imagedata.length;
    var line = width * 4;

    var i = 0;
    var idx = 0;
    var stop = false;

    // ascent. scan from top to bottom until we find a non red pixel
    for (i = 0; i < baseline; ++i) {
        for (var j = 0; j < line; j += 4) {
            if (imagedata[idx + j] !== 255) {
                stop = true;
                break;
            }
        }
        if (!stop) {
            idx += line;
        } else {
            break;
        }
    }

    properties.ascent = baseline - i;

    idx = pixels - line;
    stop = false;

    // descent. scan from bottom to top until we find a non red pixel
    for (i = height; i > baseline; --i) {
        for (var _j = 0; _j < line; _j += 4) {
            if (imagedata[idx + _j] !== 255) {
                stop = true;
                break;
            }
        }

        if (!stop) {
            idx -= line;
        } else {
            break;
        }
    }

    properties.descent = i - baseline;
    properties.fontSize = properties.ascent + properties.descent;

    PIXI.TextMetrics._fonts[font] = properties;

    return properties;
};

flax.showVersionLabel = function() {
    if(!flax.currentScene) return;
    var style = new PIXI.TextStyle({
        fontSize: 24,
        fill: "#FFFFFF",
        align: "right",
        stroke: 0x000000,
        strokeThickness: 5
    });
    var vTxt= new flax.Text("V" + flax.game.config.version, style);
    flax.currentScene.addChild(vTxt);
    var right = 85;
    var bottom = 35;
    if(flax.sys.isMobile) {
        var screenSize = flax.getRealScreenSize();
        var scale = flax.getGameScale();
        vTxt.position.x = (screenSize.x) / scale.x  - right;
        vTxt.position.y = (screenSize.y) / scale.y - bottom;
    } else {
        vTxt.position.x = (flax.stageRect.width - right);
        vTxt.position.y = (flax.stageRect.height - bottom);
    }
}

//flax._fontResources = null;
//flax.registerFont = function(name, urls)
//{
//    if(!name || !urls) return;
//    if(typeof urls == "string") urls = [urls];
//    if(flax._fontResources == null) flax._fontResources = {};
//    flax._fontResources[name] = urls;
//};
