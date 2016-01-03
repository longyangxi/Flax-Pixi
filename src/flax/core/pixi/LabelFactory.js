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

        var style = {
            font: data.fontSize + "px " + data.font,
            fill: data.fontColor,
            align: data.textAlign,
            //wordWrap: true,
            wordWrapWidth: data.textWidth
            //todo, data.textHeight isn't useful now
        };

        lbl= new PixiTextInput(define.text, style);

        var d = flax.assetsManager.getDisplayDefine(assetsFile, txtCls);
        lbl.setAnchorPoint(d['anchorX'], d['anchorY']);
    }
    //If it is ttf text(has font and the bitmap font is null), other wise use bitmap label
    else if(data.font && bmpFontName == null){

        var style = {
            font: data.fontSize + "px " + data.font,
            fill: data.fontColor,
            align: H_ALIGHS[data.textAlign],
            wordWrap: true,
            wordWrapWidth: data.textWidth
            //todo, data.textHeight isn't useful now
        };

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

//flax._fontResources = null;
//flax.registerFont = function(name, urls)
//{
//    if(!name || !urls) return;
//    if(typeof urls == "string") urls = [urls];
//    if(flax._fontResources == null) flax._fontResources = {};
//    flax._fontResources[name] = urls;
//};
