/**
 * Created by long on 14-1-31.
 */
flax._assetsClassMap =
{
    "btn":"flax.SimpleButton",
    "button":"flax.SimpleButton",
    "progress":"flax.ProgressBar",
    "jpg":"flax.Image",
    "png":"flax.Image",
    "scrollPane":"flax.ScrollPane",
    "gun":"flax.Gunner",
    "soundBtn":"flax.SimpleSoundButton"
};

flax._assetsMcClassMap =
{
    "button":"flax.Button",
    "scrollPane":"flax.MCScrollPane",
    "gun":"flax.MCGunner",
    "gun1":"flax.MCGunner",
    "soundBtn":"flax.SoundButton"
};
/**
 * Asset type in flax
 * */
flax.ASSET_NONE = 0;
flax.ASSET_ANIMATOR = 1;
flax.ASSET_MOVIE_CLIP = 2;
flax.ASSET_IMAGE = 3;
/**
 * Register a className for Animator
 * */
flax.registerClass = function(key, className){
    flax._assetsClassMap[key] = className;
};
/**
 * Register a className for MovieClip
 * */
flax.registerMcClass = function(key, className){
    flax._assetsMcClassMap[key] = className;
};

flax.AssetsManager = flax.Class.extend({
    framesCache:null,
    displaysCache:null,
    displayDefineCache:null,
    mcsCache:null,
    subAnimsCache:null,
    fontsCache:null,
    imageCache:null,
    metaCache:null,

   ctor:function()
   {
       this.framesCache = {};
       this.displaysCache = {};
       this.displayDefineCache = {};
       this.mcsCache = {};
       this.subAnimsCache = {};
       this.fontsCache = {};
       this.imageCache = [];
       this.metaCache = {};
   },
   getAssetType:function(assetsFile, assetID)
   {
       if(this.getMc(assetsFile, assetID)) return flax.ASSET_MOVIE_CLIP;
       var define = this.getDisplayDefine(assetsFile, assetID);
       if(define) {
           if(define['type'] == "jpg" || define['type'] == "png") return flax.ASSET_IMAGE;
           if(define['type'] == "share"){
                return this.getAssetType(this._getSharedPlist(assetsFile, define), assetID)
           }
           return flax.ASSET_ANIMATOR;
       }
       return flax.ASSET_NONE;
   },
    /**
     * Create a display from a assetsFile with assetID
     * @param {String} assetsFile the assetsFile
     * @param {String} assetID the asset id in the assetsFile
     * @param {Object} params params could be set to the target with attr function
     *                 the special param is:
     *                 parent, if set parent, the display will be auto added to it
     *                 class, if set class, the display will be created with the class
     *                 batch, if set true and it is MovieClip then create flax.MovieClipBatch instance
     * @param {Boolean} fromPool if the display should fetch from the pool
     * @param {String} clsName the class name to create the display, if null, it'll be automatically set according by the assets file
     * Deprecated: createDisplay:function(assetsFile, assetID, clsName, fromPool, parent, params)
     * */
    createDisplay:function(assetsFile, assetID, params, fromPool, clsName)
    {
        if(assetsFile == null || assetID == null){
            throw  "Please give me assetsFile and assetID!";
        }
        if(clsName == null && params) clsName = params["class"];
        if((params && typeof params === "string") || (clsName && typeof clsName !== "string")) {
            throw "Params error: maybe you are using the old api, please use the latest!";
        }
        this.addAssets(assetsFile);

        var subAnims = this.getSubAnims(assetsFile, assetID);
        if(subAnims.length) {
            assetID = assetID + "$" + subAnims[0];
        }

        if(params == null) params = {};

        var define = this.getDisplayDefine(assetsFile, assetID);
        //if it's a shared object, then fetch its source assetsFile
        if(define && define['type'] == "share"){
            //params.__isShare = true;
            return this.createDisplay(this._getSharedPlist(assetsFile, define), assetID, params, fromPool, clsName);
        }

        var mcCls = null;
        if(clsName) {
            mcCls = flax.nameToObject(clsName);
            if(mcCls == null){
                throw "The class: "+clsName+" doesn't exist!"
            }
        }

        if(mcCls == null) {
            var isMC = false;
            if(define == null) {
                define = this.getMc(assetsFile, assetID);
                isMC = true;
            }
            if(define){
                clsName = define['type'];
                if(clsName == "null" && assetID != "jpg" && assetID != "png"){
                    clsName = assetID;
                }
                mcCls = flax.nameToObject(clsName);
                if(mcCls == null){
                    clsName = isMC ? flax._assetsMcClassMap[clsName] : flax._assetsClassMap[clsName];
                    //Handle the scale9Image
                    if(clsName == "flax.Image" && define['scale9']){
                        if(flax.Scale9Image != null) {
                            clsName = "flax.Scale9Image";
                        } else {
                            console.warn("Please add module of 'gui' or 'ccui'(cocos 3.10 later) into project.json if you want to use Scale9Image!");
                        }
                    }
                    mcCls = flax.nameToObject(clsName);
                }
                if(mcCls == null)
                {
                    mcCls = isMC ? flax.MovieClip : flax.Animator;
                    clsName = isMC ? "flax.MovieClip" : "flax.Animator";
                    if(isMC && params.batch === true){
                        mcCls = flax.MovieClipBatch;
                        clsName = "flax.MovieClipBatch";
                    }
                }
            }else{
                throw  "There is no display with assetID: "+assetID+" in assets file: "+assetsFile+", or make sure the display is not a BLANK symbol!";
            }
        }

        var mc = null;
        var parent = params.parent;
        delete params.parent;
        if(fromPool === true) {
            mc = flax.ObjectPool.get(assetsFile,clsName,assetID).fetch(assetID, null, params);
            //var view = mc.getCollider ? mc.getCollider("mask") : null;
            //if(view) {
            //    this._createMask(mc, view, parent, params);
            //} else if(parent) {
            //    parent.addChild(mc);
            //}
            if(parent) {
                parent.addChild(mc);
            }
        }else{
            if(mcCls.create) mc = mcCls.create(assetsFile, assetID);
            else mc = new mcCls(assetsFile, assetID);
            flax.copyProperties(params, mc);

            //var view = mc.getCollider ? mc.getCollider("mask") : null;
            //if(view) {
            //    this._createMask(mc, view, parent, params);
            //    mc.clsName = clsName;
            //    return mc;
            //}

            if(parent) parent.addChild(mc);
            mc.clsName = clsName;
        }
        return mc;
    },
    //_createMask: function (mc, view, parent, params) {
    //
    //    var viewRect = view.getRect(false);
    //
    //    //todo, 根据任意形状画出来,然后做遮罩,在createDisplay的时候就做
    //    //todo, pixi的做法
    //
    //    var stencil = new cc.DrawNode();
    //    var color = cc.color(255, 0, 0, 255);
    //    var rect = flax.rect(0, 0, viewRect.width, viewRect.height);
    //    stencil.drawRect(flax.p(rect.x, rect.y), flax.p(rect.width, rect.height), color);
    //    stencil.__originPos = flax.p(viewRect.x, viewRect.y);
    //    stencil.setPosition(stencil.__originPos);
    //    stencil.setContentSize(rect.width, rect.height);
    //
    //
    //    var clipper = new cc.ClippingNode();
    //
    //    clipper.setContentSize(mc.getContentSize());
    //
    //    flax.copyProperties(params, clipper);
    //
    //    clipper.stencil = stencil;
    //    if(parent) parent.addChild(clipper);
    //
    //    mc.mask = clipper;
    //
    //    clipper.addChild(mc);
    //},
    /**
     * Clone a new display from the target, if fromPool = true, it'll be fetched from the pool
     * It only supports flax.FlaxSprite or its sub classes
     * */
    cloneDisplay:function(target, fromPool, autoAdd)
    {
        if(!flax.isFlaxDisplay(target)) {
            throw "cloneDisplay only support flax type display!"
        }
        var obj = this.createDisplay(target.assetsFile, target.assetID, {parent: (autoAdd ? target.parent : null)}, fromPool, target.clsName);
        if(autoAdd) obj.setPosition(target.getPosition());
        obj.name = target.name;
        obj.setScale(target.getScale());
        obj.setRotation(target.rotation);
        obj.zIndex = target.zIndex;
        return obj;
    },
    getTexture: function(assetFile, assetID, frame) {
        if(frame == null) frame = 0;
        var define = this.getDisplayDefine(assetFile, assetID);
        var frameNames = this.getFrameNames(assetFile, define['start'], define['end']);
        return flax.spriteFrameCache.getSpriteFrame(frameNames[frame]);
    },
    getTextures: function(assetFile, assetID, startFrame, endFrame) {

        var define = this.getDisplayDefine(assetFile, assetID);

        if(startFrame == null || startFrame < define['start']) startFrame = define['start'];
        if(endFrame == null || endFrame < define['end']) endFrame = define['end'];

        var frameNames = this.getFrameNames(assetFile, startFrame, endFrame);

        var textures = [];

        for(var i = 0; i < frameNames.length; i++) {
            textures.push(flax.spriteFrameCache.getSpriteFrame(frameNames[i]));
        }

        return textures;
    },
    removeAssets:function(assetsFile)
    {
        delete this.framesCache[assetsFile];
        delete this.displaysCache[assetsFile];
        delete this.displayDefineCache[assetsFile];
        delete this.mcsCache[assetsFile];
        delete this.subAnimsCache[assetsFile];
        delete this.fontsCache[assetsFile];
        delete this.metaCache[assetsFile];

        var assetsFile1 = assetsFile;
        var ext = flax.path.extname(assetsFile);
        if(ext == ".flax") assetsFile1 = flax.path.changeBasename(assetsFile1, DATA_FORMAT);

        flax.spriteFrameCache.removeSpriteFramesFromFile(assetsFile1);
        flax.loader.release(assetsFile1);
        flax.loader.release(flax.path.changeBasename(assetsFile1, ".png"));
    },
    removeAllAssets:function()
    {
        for(var file in this.framesCache) {
            this.removeAssets(file);
        }
        //release all the image cache
        for(var i = 0; i < this.imageCache.length; i++) {
            flax.loader.release(this.imageCache[i]);
        }
        this.imageCache.length = 0;
        //todo,清除
        //this.framesCache = {};
        //this.displaysCache = {};
        //this.displayDefineCache = {};
        //this.mcsCache = {};
        //this.subAnimsCache = {};
        //this.fontsCache = {};
        //this.imageCache = [];
        //this.metaCache = {};
    },
    addAssets:function(assetsFile)
    {
        if(typeof this.framesCache[assetsFile] !== "undefined") return false;

        var assetsFile1 = assetsFile;
        var ext = flax.path.extname(assetsFile);
        if(ext == ".flax") assetsFile1 = flax.path.changeBasename(assetsFile1, DATA_FORMAT);
        var dict = flax.loader.getRes(assetsFile1);
        if(dict == null){
            throw "Make sure you have loaded the resource: " + assetsFile;
        }

        //If the assetsFile is not exported from flash
        if(dict['displays'] == null && dict['fonts'] == null) {
            return this._addFromOriginPlist(assetsFile1);
        }

        this.metaCache[assetsFile] = dict['metadata'] || dict['meta'];
        //the min tool version this API needed
        var toolVersion = this.getToolVersion(assetsFile);
        if(!toolVersion || toolVersion < MIN_TOOL_VERSION){
            throw "The resource: " + assetsFile + " was exported with the old version of Flax, please do it with current version!";
        }
        //get the fps from flash
        var fps = this.metaCache[assetsFile]["fps"];

        flax.spriteFrameCache.addSpriteFrames(assetsFile1);
        //Note: the plist will be released by cocos when addSpriteFrames
        //We want it to be there to check the resource if loaded
        flax.loader.cache[assetsFile1] = "loaded!";

        //parse the frames
        var frames = [];
        var frameDict = dict["frames"];
        for(var key in frameDict)
        {
            frames.push(key);
        }
        //sort ascending
        frames.sort();

        this.framesCache[assetsFile] = frames;

        //parse the displays defined in the assets
        if(dict["displays"])
        {
            this._parseDisplays(assetsFile, dict["displays"], fps);
        }
        //parse the movieClipgs
        if(dict["mcs"])
        {
            this._parseMovieClips(assetsFile, dict["mcs"], fps);
        }
        //parse the fonts
        if(dict["fonts"])
        {
            this._parseFonts(assetsFile, dict["fonts"]);
        }
        return true;
    },
    /**
     * Add plist defined anim, not from flash
     * */
    _addFromOriginPlist:function(plistFile)
    {
        if(typeof this.framesCache[plistFile] !== "undefined") return false;

        var dict = flax.loader.getRes(plistFile);
        if(dict == null){
            throw "Make sure you have loaded the resource: " + plistFile;
        }

        flax.spriteFrameCache.addSpriteFrames(plistFile);
        //Note: the plist will be released by cocos when addSpriteFrames
        //We want it to be there to check the resource if loaded
        flax.loader.cache[plistFile] = "loaded!";

        //parse the frames
        var frames = [];
        var frameDict = dict["frames"];
        for(var key in frameDict)
        {
            frames.push(key);
        }
        //sort ascending
        frames.sort();

        this.framesCache[plistFile] = frames;

        var animName = flax.path.basename(plistFile);
        var idx = animName.lastIndexOf(".");
        if(idx !== -1)
            animName = animName.substring(0,idx);

        var dDefine = {"type": null, "start": 0, "end": frames.length - 1, "fps": flax.game.config["frameRate"]};
        this.displayDefineCache[plistFile + animName] = dDefine;
        this.displaysCache[plistFile] = [animName];

        return true;
    },
    _parseDisplays:function(assetsFile, displays, fps) {
        //the res root path
        var resDir = flax.getResUrl(assetsFile.slice(0, assetsFile.lastIndexOf("/")));
        var displayNames = [];
        var dDefine = null;
        for(var dName in displays)
        {
            displayNames.push(dName);
            dDefine = displays[dName];
            if(dDefine['anchors']) dDefine['anchors'] = this._parseFrames(dDefine['anchors']);
            if(dDefine['colliders']) dDefine['colliders'] = this._parseFrames(dDefine['colliders']);
            if(dDefine['scale9']) dDefine['scale9'] = flax._strToRect(dDefine['scale9']);

            dDefine['fps'] = fps || flax.game.config["frameRate"];
            this.displayDefineCache[assetsFile + dName] = dDefine;
            this._parseSubAnims(assetsFile, dName);
            //cache the png or jpg url
            if(dDefine['type'] == "png" || dDefine['type'] == "jpg") {
                //parse the real path for the image
                dDefine['url'] = resDir + "/" + dDefine['url'];
                this.imageCache.push(dDefine['url']);
                //if(dDefine['scale9']) cc.log(dDefine['url'])
            }
        }
        this.displaysCache[assetsFile] = displayNames;
    },
    _parseMovieClips:function(assetsFile, mcs, fps){
        for(var sName in mcs)
        {
            var mcDefine = mcs[sName];
            if(mcDefine['anchors']) mcDefine['anchors'] = this._parseFrames(mcDefine['anchors']);
            if(mcDefine['colliders']) mcDefine['colliders'] = this._parseFrames(mcDefine['colliders']);
            var childDefine;
            var childrenDefine = mcDefine['children'];
            for(var childName in childrenDefine)
            {
                childDefine = childrenDefine[childName];
                //Language label parse, TODO, to be more clear
                if(childName.indexOf("label__") == 0) {
                    var pureChildName = childName.replace("label__", "");
                    childDefine._isLanguageElement = true;
                    childrenDefine[pureChildName] = childDefine;
                    delete childrenDefine[childName];
                }
                childDefine.frames = this._strToArray(childDefine.frames);
            }
            mcDefine['fps'] = fps || flax.game.config["frameRate"];
            this.mcsCache[assetsFile + sName] = mcDefine;
            //see if there is a '$' sign which present sub animation of the mc
            this._parseSubAnims(assetsFile, sName);
        }
    },
    _parseFonts:function(assetsFile, fonts){
        for(var fName in fonts)
        {
            this.fontsCache[assetsFile + fName] = fonts[fName];
        }
    },
    _parseSubAnims:function(assetsFile, assetID)
    {
        var aarr = assetID.split("$");
        var rname = aarr[0];
        var aname = aarr[1];
        if(rname && aname && rname != '' && aname != ''){
            var akey = assetsFile + rname;
            var anims = this.subAnimsCache[akey];
            if(anims == null) {
                anims = [];
                this.subAnimsCache[akey] = anims;
            }
            anims.push(aname);
        }
    },
    _parseFrames:function(data){
        var dict = {};
        for(var name in data)
        {
            dict[name] = this._strToArray(data[name]);
        }
        return dict;
    },
    _strToArray:function(str){
        var frames = str.split("|");
        var i = -1;
        var arr = [];
        while(++i < frames.length)
        {
            var frame = frames[i];
            if(frame === "null") arr.push(null);
            //"" means the params is the same as prev frame
            else if(frame === "") arr.push(arr[i - 1]);
            else arr.push(frame);
        }
        return arr;
    },
    _getSharedPlist:function(assetsFile, define)
    {
        //get the resource root folder, the share library must be in the root folder
        //var dir = assetsFile.slice(0, assetsFile.indexOf("/"));
        //get current resource folder
        var dir = assetsFile.slice(0, assetsFile.lastIndexOf("/"));
        return dir + "/" + define.url + DATA_FORMAT;
    },
    getFrameNames:function(assetsFile, startFrame, endFrame)
    {
        this.addAssets(assetsFile);
        var frames = this.framesCache[assetsFile];
        if(frames == null) return [];
        if(startFrame == -1) startFrame = 0;
        if(endFrame == -1) endFrame = frames.length - 1;
        return frames.slice(parseInt(startFrame), parseInt(endFrame) + 1);
    },
    getFrameNamesOfDisplay:function(assetsFile, assetID)
    {
        var define = this.getDisplayDefine(assetsFile, assetID);
        if(define == null) throw "There is no display named: " + assetID + " in assetsFile: " + assetsFile;
        return this.getFrameNames(assetsFile, define.start, define.end);
    },
    getDisplayDefine:function(assetsFile, assetID)
    {
        this.addAssets(assetsFile);
        var key = assetsFile + assetID;
        return this.displayDefineCache[key];
    },
    getDisplayNames:function(assetsFile)
    {
        this.addAssets(assetsFile);
        return this.displaysCache[assetsFile] || [];
    },
    getRandomDisplayName:function(assetsFile)
    {
        var names = this.getDisplayNames(assetsFile);
        var i = Math.floor(Math.random()*names.length);
        return names[i];
    },
    getMc:function(assetsFile, assetID)
    {
        this.addAssets(assetsFile);
        var key = assetsFile + assetID;
        return this.mcsCache[key];
    },
    getSubAnims:function(assetsFile, theName)
    {
        this.addAssets(assetsFile);
        var akey = assetsFile + theName;
        return this.subAnimsCache[akey] || [];
    },
    getFont:function(assetsFile, fontName)
    {
        this.addAssets(assetsFile);
        var key = assetsFile + fontName;
        return this.fontsCache[key];
    },
    getToolVersion:function(assetsFile)
    {
        var v = this.metaCache[assetsFile]['version'] || this.metaCache[assetsFile]['flaxVersion'];
        return v || 0;
    }
});

flax.assetsManager = new flax.AssetsManager();

flax._strToRect = function(str)
{
    var arr = str.split(",");
    return flax.rect(parseFloat(arr[0]), parseFloat(arr[1]), parseFloat(arr[2]), parseFloat(arr[3]));
};

flax.createDisplay = function(assetsFile, assetID, params, fromPool, clsName)
{

    return flax.assetsManager.createDisplay(assetsFile, assetID, params, fromPool, clsName);
}