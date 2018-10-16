/**
 * Created by long on 15-9-18.
 */

var flax = flax || {};

flax.languages = ["zh","en","de","fr","it","es","tr","pt","ru"];

flax.language = {
    current:null,
    index:-1,
    _dict:null,
    _toLoad:null,
    init:function()
    {
        var lan = flax.game.config["language"];
        if(lan == null || lan == "") {
            if(this.current == null) {
                lan = flax.sys.language;
                this.update(lan);
            }
        }else{
            this.update(lan);
        }
    },
    checkRes:function(resArr)
    {
        if(this._toLoad && resArr.indexOf(this._toLoad) == -1){
            resArr.push(this._toLoad);
        }
    },
    onLoaded:function(resArr)
    {
        if(this._toLoad){
            this._dict = flax.loader.getRes(this._resPath());
            var i = resArr.indexOf(this._toLoad);
            if(i > -1) resArr.splice(i, 1);
            this._toLoad = null;
        }
    },
    getStr:function(key, params){
        if(this._dict == null) {
            console.log("Warning: there is no language defined: "+this.current);
            return null;
        }
        var str = this._dict[key];
        if(str == null) {
            //console.log("Warning: there is no language string for key: " + key);
        } else if(params){
            for(var key in params){
                var rk = "{" + key + "}";
                str = str.replace(new RegExp(rk, 'g'), params[key]);
            }
        }
        return str;
    },
    update:function(lan){
        if(lan == null || lan == "" || lan == this.current) return;
        this.current = lan;
        if(flax.game.config["languages"] && flax.game.config["languages"].length) flax.languages = flax.game.config["languages"];
        this.index = flax.languages.indexOf(lan);
        if(this.index == -1) console.log("Invalid language: " + lan);
        if(flax.game.config["languageJson"]) this._toLoad = this._resPath(lan);
    },
    _resPath:function(lan){
        return  "res/locale/"+(lan || this.current)+".json";
    }
}
flax.updateLanguage = function()
{
    throw "flax.updateLanguage is deprecated, please use flax.language.update instead!"
}
flax.getLanguageStr = function()
{
    throw "flax.getLanguageStr is deprecated, please use flax.language.getStr instead!"
}