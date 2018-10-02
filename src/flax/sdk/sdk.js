/**
 * Created by long on 18/7/1.
 */

/**
 * High Score leaderboard name, used in FB and AppStore GameCenter
 * */
MAX_SCORE_NAME = "HighScore";
MIN_VIDEO_INTERVAL = 30 * 1000;

var sdk = {
    platform: "web",
    lastVideoTime: 0,
    init: function(callback) {
        var config = flax.game.config;
        var plat = sdk.platform = config.platform;
        switch(plat) {
            case "wechat":
                wechat.init(config);
                callback();
                break;
            case "fb":
                fb.init(config);
                callback();
                break;
            case "ios":
            case "android":
                if(!MyCordova.deviceReady) {
                    document.addEventListener("deviceready", function(){
                        sdk.init(callback);
                    }, false);
                    return;
                }
                flax.sys.isMobile = true;
                flax.sys.isNative = true;
                flax.sys.os = MyCordova.deviceInfo.platform;
                flax.sys.language = MyCordova.language;
                MyCordova.init(config);
                callback();
                break;
            default :
                callback();
                break;
        }
        //TODO, 离屏显示插屏广告，倒是可以，但是有点不友好
        //flax.onScreenHide.add(sdk.showInterstitialAd, sdk);
    },
    share: function(title, img, url, cb) {

        if(typeof title == "object") {
            img = title.img;
            url = title.url;
            cb = title.callback;
            title = title.title;
        }

        var shareInfo = getShareConfig(this.platform);
        if(!img) img = shareInfo.shareImg;
        if(!title) title = shareInfo.shareTitle;
        if(!url) url = shareInfo.shareUrl;

        var plat = this.platform;
        if(plat == "wechat") {
            wechat.shareGame(title, img, cb);
        } else if(typeof MyCordova != "undefined") {
            MyCordova.share(title,
                url,
                img,
                function(result) {
                    if(result.completed) {
                        if(cb) cb(true);
                    }
            });
        } else if(plat == "fb") {
            fb.shareGame(title, img, cb);
        }
    },
    showAppRate: function() {
      if(typeof MyCordova != "undefined") {
          MyCordova.showAppRate(flax.game.config.appid, flax.game.config.name);
      }
    },
    submitScore: function(maxScore, callback) {
        if(this.platform == "wechat") {
            wechat.submitScore(maxScore);
        } else if(typeof MyCordova != "undefined") {
            MyCordova.submitMyScore(MAX_SCORE_NAME, maxScore);
        } else if(this.platform == "fb") {
            fb.submitMyScore(MAX_SCORE_NAME, maxScore, callback);
        }
    },
    showLeaderboard: function(isGroup, callback) {
        if(this.platform == "wechat" || this.platform == "fb") {
            rankList.show(false, isGroup === true);
        } else if(typeof MyCordova != "undefined") {
            MyCordova.showMyLeaderBoard(MAX_SCORE_NAME, function() {
            }, function(err) {
                console.log(err);
            });
        }
    },
    showAdBanner: function(onBottom) {
        onBottom = onBottom !== false;
        var ok = false;
        if(this.platform == "wechat") {
            ok = true;
            wechat.showAdBanner(onBottom);
        } else if(typeof MyCordova != "undefined") {
            ok = true;
            MyCordova.showAdBanner(null, onBottom);
        }
        return ok;
    },
    hideAdBanner: function(destroy) {
        if(this.platform == "wechat") {
            wechat.hideAdBanner(destroy);
        } else if(typeof MyCordova != "undefined") {
            MyCordova.hideAdBanner(destroy);
        }
    },
    adVideoAvailable: function() {
        if(this.platform == "wechat") {
            return true;
        } else if(typeof MyCordova != "undefined") {
            return MyCordova.rewardVideoReady;
        } else if(this.platform == "fb") {
            return fb.adVideo != null;
        }
        return false;
    },
    showAdVideo: function(cb, limit) {
        //视频播放不能太频繁
        var now = Date.now();
        if(limit !== false && now - this.lastVideoTime < MIN_VIDEO_INTERVAL) {
            return false;
        }
        this.lastVideoTime = now;
        if(this.platform == "wechat") {
            wechat.showAdVideo(function(ok){
                if(cb) cb(ok);
            });
            return true;
        } else if(typeof MyCordova != "undefined") {
            if(MyCordova.rewardVideoReady) {
                sdk._onScreenAdShow();
                MyCordova.showAdVideo(function(ok){
                    //NOT NEED
                    //flax.onScreenShow.dispatch();
                    if(cb) cb(ok);
                });
                return true;
            } else {
                return false;
            }
        } else if(this.platform == "fb") {
            if(fb.adVideo) {
                sdk._onScreenAdShow();
                fb.showAdVideo(function(ok){
                    //NOT NEED
                    //flax.onScreenShow.dispatch();
                    if(cb) cb(ok);
                });
                return true;
            } else {
                return false;
            }

        }
    },
    showInterstitialAd: function(cb) {
        var ok = false;
        if(typeof MyCordova != "undefined") {
            ok = MyCordova.showInterstitialAd(sdk._onScreenAdShow, function(ok){
                //NOT NEED
                //flax.onScreenShow.dispatch();
                if(cb) cb(ok);
            });
        } else if(this.platform == "fb") {
            ok = fb.showInerstitialAd(sdk._onScreenAdShow, function(ok){
                //flax.onScreenShow.dispatch();
                if(cb) cb(ok);
            });
        }
        return ok;
    },
    //交叉推广
    promoGame: function(appid) {
        if(this.platform == "fb") {
            fb.promoGame(appid);
        } else if(this.platform == "wechat"){
            wx.navigateToMiniProgram({"appId": appid})
        } else {
            //TODO
        }
    },
    alert: function(title, msg) {
        if(typeof MyCordova != "undefined") {
            MyCordova.alert(title, msg);
        } else {
            alert(msg);
        }
    },
    /**
     * 全屏广告，如奖励视频或插屏广告出现时，发送游戏的screenHide的事件
     * */
    _onScreenAdShow: function(really) {
        //Dont need pause in fb
        if(really !== false && sdk.platform != "fb")
            flax.onScreenHide.dispatch();
    }
}

function getShareConfig(platform) {
    var info = {};

    var platConfig = flax.game.config[platform] || flax.game.config.platformConfig;

    if(platConfig && platConfig.shareTitle) info.shareTitle = platConfig.shareTitle;
    if(!info.shareTitle) info.shareTitle = flax.game.config.shareTitle;

    if(typeof info.shareTitle != "string") info.shareTitle = flax.getRandomInArray(info.shareTitle);

    if(platConfig && platConfig.shareImg) info.shareImg = platConfig.shareImg;
    if(!info.shareImg) info.shareImg = flax.game.config.shareImg;

    if(platConfig && platConfig.shareUrl) info.shareUrl = platConfig.shareUrl;
    if(!info.shareUrl) info.shareUrl = flax.game.config.shareUrl;

    return info;
}