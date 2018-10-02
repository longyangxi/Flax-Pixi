/**
 * Created by long on 18/6/19.
 */

var MyCordova = MyCordova || {};

MyCordova.deviceReady = false;

MyCordova.deviceInfo = {};

MyCordova.rewardVideoReady = false;
MyCordova.interstitialReady = false;

MyCordova.autoPreloadRewardVideo = true;

MyCordova.rewardVideoCallback = null;
MyCordova.interstitialCallback = null;

MyCordova.adPresentedOk = false;

MyCordova.gamecenterUser = {};
MyCordova.gamecenterAvatar = null;

MyCordova.pauseStartTime = 0;

MyCordova.hasNetwork = false;

MyCordova.language = "zh-CN";

var cordova_game_config = {
    adBannerOnBottom: true,
    showPauseAdInterval: 30 * 1000 //从后台返回时显示插屏广告的最少时间间隔，单位秒
};

MyCordova.languageAlias = {
    "zh-CN": "zh-Hans",
    "zh": "zh-Hans"
}

if (typeof cordova != "undefined") {
    document.addEventListener("deviceready", onDeviceReady, false);

    function onDeviceReady() {

        console.log("********** cordova device is ready**********");

        catchAllErrors();

        MyCordova.deviceReady = true;
        MyCordova.language = navigator.language || navigator.userLanguage;
        MyCordova.hideStatusBar();

        MyCordova.deviceInfo = MyCordova.getDeviceInfo();
    }
}

MyCordova.init = function(config) {

    if (typeof config == "object") {
        for (var k in config) {
            cordova_game_config[k] = config[k];
        }
    }

    var deviceInfo = MyCordova.deviceInfo;

    //热云统计
    if (typeof Reyun != "undefined" && cordova_game_config.reyun) {
        Reyun.register(deviceInfo.uuid);
    }

    //game center
    MyCordova.loginGameCenter();
    //检查网络
    MyCordova.checkNetWork();
    //隐藏splash
    if (typeof navigator != "undefined" && navigator.splashscreen) {
        navigator.splashscreen.hide();
    }

    //If has vedio ad id setting, then auto preload it
    if (cordova_game_config.platformConfig && typeof AdMob != "undefined") {
        MyCordova.__handleAdEvents();
        setTimeout(function() {
            var interAd = cordova_game_config.platformConfig.inter;
            if (interAd) AdMob.prepareInterstitial({ adId: interAd, autoShow: false });
            if (MyCordova.autoPreloadRewardVideo && cordova_game_config.platformConfig.video) {
                MyCordova.prepareAdVideo();
            }
        }, 10000);
    }

    document.addEventListener('pause', function() {
        MyCordova.pauseStartTime = Date.now();
        console.log("********** pause...");
    }, false)

    document.addEventListener('resume', function() {
        console.log("********** resume...");
        var now = Date.now();
        if (now - MyCordova.pauseStartTime >= cordova_game_config.showPauseAdInterval * 1000) {
            MyCordova.showInterstitialAd();
        }
    }, false)

    document.addEventListener('backbutton', function() {
        console.log("********** backbutton...")
    }, false)

    //Network connection state events
    document.addEventListener("online", MyCordova.checkNetWork, false);
    document.addEventListener("offline", MyCordova.checkNetWork, false);

    //Battery events
    //MyCordova.watchBattery();
}

/**
 * Check network connection
 * https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-network-information/index.html
 * */
MyCordova.checkNetWork = function() {

    if (!navigator.connection) return "unknown";

    //var states = {};
    //states[Connection.UNKNOWN]  = 'Unknown connection';
    //states[Connection.ETHERNET] = 'Ethernet connection';
    //states[Connection.WIFI]     = 'WiFi connection';
    //states[Connection.CELL_2G]  = 'Cell 2G connection';
    //states[Connection.CELL_3G]  = 'Cell 3G connection';
    //states[Connection.CELL_4G]  = 'Cell 4G connection';
    //states[Connection.CELL]     = 'Cell generic connection';
    //states[Connection.NONE]     = 'No network connection';
    //var networkState = navigator.connection.type;
    //MyCordova.alert('Connection type: ' + states[networkState]);

    MyCordova.hasNetwork == navigator.connection.type != Connection.NONE;

    return navigator.connection.type;
}
MyCordova.watchBattery = function() {
    window.addEventListener("batterystatus", onBatteryStatus, false);

    function onBatteryStatus(status) {
        //MyCordova.alert(null, "Battery Level: " + status.level + " isPlugged: " + status.isPlugged);
    }

    window.addEventListener("batterylow", onBatteryLow, false);

    function onBatteryLow(status) {
        //MyCordova.alert(null, "Battery Level Low " + status.level + "%");
    }

    window.addEventListener("batterycritical", onBatteryCritical, false);

    function onBatteryCritical(status) {
        //MyCordova.alert(null, "Battery Level Critical " + status.level + "%\nRecharge Soon!");
    }
}
/**
 * https://github.com/leecrossley/cordova-plugin-game-center
 * */
MyCordova.loginGameCenter = function() {
    if (typeof gamecenter != "undefined") {
        gamecenter.auth(function(user) {
            console.log("***Game center login ok: " + user.alias);
            MyCordova.gamecenterUser = user;
            gamecenter.getPlayerImage(function(path) {
                console.log("****Game center avatar: " + path);
                MyCordova.gamecenterAvatar = path;
            }, function(err) {
                console.log("***Game center avatar error: ", err)
            });
        }, function(err) {
            console.log("***Game center login error: ", err)
        });
    }
}

/**
 * https://github.com/leecrossley/cordova-plugin-game-center
 * */
MyCordova.showMyLeaderBoard = function(boardName, successCallback, failureCallback) {
    if (typeof gamecenter != "undefined") {
        var data = {
            leaderboardId: boardName
        };
        gamecenter.showLeaderboard(successCallback, failureCallback, data);
    }
}

/**
 * https://github.com/leecrossley/cordova-plugin-game-center
 * */
MyCordova.submitMyScore = function(boardName, score, successCallback, failureCallback) {
    if (typeof gamecenter != "undefined") {
        var data = {
            score: score,
            leaderboardId: boardName
        };
        gamecenter.submitScore(successCallback, failureCallback, data);
    }
}

/**
 * https://github.com/leecrossley/cordova-plugin-game-center
 * */
MyCordova.reportMyAchievement = function(achieveName, percent, successCallback, failureCallback) {
    if (typeof gamecenter != "undefined") {
        var data = {
            achievementId: achieveName,
            percent: "" + percent
        };

        gamecenter.reportAchievement(successCallback, failureCallback, data);
    }
}

/**
 * https://github.com/leecrossley/cordova-plugin-game-center
 * var successCallback = function(results) {
        if (results) {
            for (var i = 0; i < results.length; i += 1) {
                //results[i].identifier
                //results[i].percentComplete
                //results[i].completed
                //results[i].lastReportedDate
                //results[i].showsCompletionBanner
                //results[i].playerID
            }
        }
    }
 */
MyCordova.getMyAchievements = function(successCallback, failureCallback) {
    if (typeof gamecenter != "undefined") {
        gamecenter.getAchievements(successCallback, failureCallback);
    }
}

MyCordova.__handleAdEvents = function() {
    var admobConifg = cordova_game_config.platformConfig;
    document.addEventListener('onAdLoaded', function(e) {
        //e.adType banner, rewardvideo, interstitial
        //表示有视频广告可播放
        if (e.adType == "rewardvideo") {
            MyCordova.rewardVideoReady = true;
        } else if(e.adType == "interstitial") {
            MyCordova.interstitialReady = true;
        }
        console.log("广告加载完毕。。。", e.adType)
    });
    document.addEventListener('onAdFailLoad', function(e) {
        //e.adType banner, rewardvideo, interstitial
        console.log("广告加载失败。。。", e.adType);
        MyCordova.retryAdLoad(e.adType);
    });
    document.addEventListener('onAdPresent', function(e) {
        //e.adType banner, rewardvideo, interstitial
        //这里给视频广告奖励
        if (e.adType == "rewardvideo" || e.adType == "interstitial") {
            MyCordova.adPresentedOk = true;
        }
        console.log("广告正确播放完毕。。。", e.adType)
    });
    document.addEventListener('onAdDismiss', function(e) {
        //e.adType banner, rewardvideo, interstitial
        console.log("用户点击关闭按钮。。。", e.adType);
        if (e.adType == "rewardvideo") {
            MyCordova.rewardVideoReady = false;
            if (MyCordova.autoPreloadRewardVideo) MyCordova.prepareAdVideo();
            if (MyCordova.rewardVideoCallback) {
                MyCordova.rewardVideoCallback(MyCordova.adPresentedOk);
                MyCordova.rewardVideoCallback = null;
            }
            MyCordova.prepareAdVideo();
        } else if(e.adType == "interstitial") {
            MyCordova.interstitialReady = false;
            if (MyCordova.interstitialCallback) {
                MyCordova.interstitialCallback(MyCordova.adPresentedOk);
                MyCordova.interstitialCallback = null;
            }
            if(admobConifg.inter)
                AdMob.prepareInterstitial({ adId: admobConifg.inter, autoShow: false });
        }
        MyCordova.adPresentedOk = false;
    });
    document.addEventListener('onAdLeaveApp', function(e) {
        //e.adType banner, rewardvideo, interstitial
        console.log("广告被关闭，可能是没看完的情况下。。。", e.adType)
    });
}

/**
 * 顶部状态栏的控制
 * https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-statusbar/index.html
 * */
MyCordova.hideStatusBar = function() {
    if (typeof StatusBar != "undefined") {
        //StatusBar.overlaysWebView(true);
        StatusBar.hide();

        window.addEventListener('statusTap', function() {
            console.log("***Status bar is tapped...")
            // scroll-up with document.body.scrollTop = 0; or do whatever you want
        });
    }
}

/**
 * 设备信息获取
 * https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-device/index.html
 *   device.cordova
 device.model
 device.platform
 device.uuid
 device.version
 device.manufacturer
 device.isVirtual
 device.serial
 * */
MyCordova.getDeviceInfo = function() {
    if (typeof device != "undefined") {
        console.log("***Device info: ");
        console.log(device);
        device.isIPhoneX = device.platform == "iOS" && device.model.indexOf("x86_64") > -1; //iPhone10
        return device;
    }
    return {};
}

/**
 * https://github.com/floatinghotpot/cordova-admob-pro/wiki/1.0-Quick-Start-Example-Code
 * 显示banner广告
 * @param id String ad id
 * @param inBottom Boolean if the banner is on bottom of the screen ,default is true
 * */
MyCordova.showAdBanner = function(id, onBottom, isTest) {
    if (typeof AdMob != "undefined") {
        if (id == null && cordova_game_config.platformConfig && cordova_game_config.platformConfig.banner) {
            id = cordova_game_config.platformConfig.banner;
        }
        if (id == null) {
            console.log("**** Ad banner need a id!")
            return;
        }
        cordova_game_config.adBannerOnBottom = onBottom !== false;
        AdMob.createBanner({
            adId: id,
            /**
             * Default:'SMART_BANNER'. it can be: (see the screenshots for effects)
             'SMART_BANNER', // recommended. auto fit the screen width, auto decide the banner height
             'BANNER',
             'MEDIUM_RECTANGLE',
             'FULL_BANNER',
             'LEADERBOARD',
             'SKYSCRAPER',
             'CUSTOM', // custom banner size with given width and height, see param 'width' and 'height'
             * */
            //adSize:'MEDIUM_RECTANGLE',
            overlap: true,
            position: cordova_game_config.adBannerOnBottom ? AdMob.AD_POSITION.BOTTOM_CENTER : AdMob.AD_POSITION.TOP_CENTER,
            autoShow: true,
            isTesting: isTest === true
        });
    } else {
        console.log("***AdMob plugin is not installed!")
    }
}

MyCordova.showInterstitialAd = function(onReady, onClose) {
    if(MyCordova.interstitialReady)
    {
        MyCordova.interstitialCallback = onClose;
        AdMob.showInterstitial();
    }
    if(onReady) onReady(MyCordova.interstitialReady);
    return MyCordova.interstitialReady;
}

/**
 * https://github.com/floatinghotpot/cordova-admob-pro/wiki/1.0-Quick-Start-Example-Code
 * 隐藏banner广告
 * @param hideOnly true表示只是隐藏，不销毁，false表示销毁，默认为true
 * */
MyCordova.hideAdBanner = function(hideOnly) {
    if (typeof AdMob == "undefined") return;
    hideOnly = hideOnly !== false;
    hideOnly ? AdMob.hideBanner() : AdMob.removeBanner();
}

/**
 * 加载视频激励广告
 * https://github.com/floatinghotpot/cordova-admob-pro#api
 * @param id String ad id
 * @param success Function success callback
 * @param fail Function fail callback
 * */
MyCordova.prepareAdVideo = function(id, success, fail) {
    if (typeof AdMob != "undefined") {
        if (id == null && cordova_game_config.platformConfig && cordova_game_config.platformConfig.video) {
            id = cordova_game_config.platformConfig.video;
        }
        if (id == null) {
            console.log("**** Video AD need a id!")
            return;
        }
        AdMob.prepareRewardVideoAd({
            adId: id,
            success: function(e) {
                console.log("*** reward video will be load...");
                if (success) success();
            },
            error: function(e) {
                console.log("*** reward video load error...");
                if (fail) fail();
            }
        });
    } else {
        console.log("***AdMob plugin is not installed!")
    }
}

/**
 * 显示视频激励广告
 * https://github.com/floatinghotpot/cordova-admob-pro#api
 * @param cb Function success callback to give reward
 * */
MyCordova.showAdVideo = function(cb) {
    if (typeof AdMob != "undefined") {
        MyCordova.rewardVideoCallback = cb;
        AdMob.showRewardVideoAd(function() {
            console.log("***视频广告播放执行成功");
        }, function() {
            console.log("***视频广告播放执行错误")
        });
    } else {
        console.log("***AdMob plugin is not installed!");
    }
}

MyCordova.retryAdLoad = function(adType) {
    var admobConifg = cordova_game_config.platformConfig;
    if (!admobConifg) return;
    setTimeout(function() {
        if (MyCordova.hasNetwork) {
            switch (adType) {
                case "rewardvideo":
                    if (MyCordova.autoPreloadRewardVideo) {
                        MyCordova.prepareAdVideo();
                    }
                    break;
                case "banner":
                    MyCordova.removeBanner(false);
                    MyCordova.showAdBanner(null, admobConifg.adBannerOnBottom);
                    break;
                case "interstitial":
                    if (admobConifg.inter)
                        AdMob.prepareInterstitial({ adId: admobConifg.inter, autoShow: false });
                    break;
            }
        } else {
            MyCordova.retryAdLoad(adType);
        }

    }, 5000);
}

var customLocale_cn = {
    title: "邀请您给我们的游戏做一个评价，可以吗?",
    message: "谢谢您对我们的支持！",
    cancelButtonLabel: "残忍拒绝",
    laterButtonLabel: "以后再说",
    rateButtonLabel: "非常乐意",
    yesButtonLabel: "是的!",
    noButtonLabel: "不",
    appRatePromptTitle: '亲爱的玩家，您玩的还愉快吗？',
    feedbackPromptTitle: '介意给我们一些真诚的反馈吗？'
}

/**
 * 显示app评价窗口
 * https://github.com/pushandplay/cordova-plugin-apprate
 * TODO, 自己从json里拿？
 * */
MyCordova.showAppRate = function(appId, appName) {
    if (typeof AppRate == "undefined") return;

    var lan = MyCordova.languageAlias[MyCordova.language] || MyCordova.language;

    AppRate.preferences.useLanguage = lan;

    AppRate.preferences = {
        displayAppName: appName,
        usesUntilPrompt: 5,
        promptAgainForEachNewVersion: false,
        inAppReview: true,
        storeAppURL: {
            ios: appId,
            android: 'market://details?id=<package_name>',
            windows: 'ms-windows-store://pdp/?ProductId=<the apps Store ID>',
            blackberry: 'appworld://content/[App Id]/',
            windows8: 'ms-windows-store:Review?name=<the Package Family Name of the application>'
        },
        callbacks: {
            handleNegativeFeedback: function() {
                window.open('mailto:feedback@example.com', '_system');
            },
            onRateDialogShow: function(callback) {
                callback(1) // cause immediate click on 'Rate Now' button
            },
            onButtonClicked: function(buttonIndex) {
                console.log("onButtonClicked -> " + buttonIndex);
            }
        }
    };

    //https://github.com/pushandplay/cordova-plugin-apprate/blob/master/www/locales.js
    //TODO, 中文的zh-hans格式有问题
    if (lan == "zh-Hans") {
        AppRate.preferences.customLocale = customLocale_cn;
    } else {
        AppRate.preferences.customLocale = AppRate.locales.getLocale(lan);
    }

    // Getting list of names for available locales
    //["ar","bn","ca","cs","da","de","de-AT","el","en","es","fa","fi","fr","he","hi","id","it","ja","ko","nl","no","pa","pl","pt","pt-PT","ru","sk","sl","sv","ta","th","tr","uk","ur","ur-IN","ur-PK","vi","zh-TW","zh-Hans","zh-Hant"]
    //AppRate.locales.getLocalesNames();

    AppRate.promptForRating();
}

MyCordova.alert = function(title, message, callback) {
    if (typeof navigator == "undefined" || !navigator.notification) return;
    navigator.notification.alert(
        message || "This is content!", // message
        callback, // callback
        title || "Notice", // title
        'OK' // buttonName
    );
}

MyCordova.confirm = function(title, message, callback) {
    if (typeof navigator == "undefined" || !navigator.notification) return;
    navigator.notification.confirm(
        message || "This is content!", // message
        callback, // callback to invoke with index of button pressed
        title || "Confirm", // title
        ['OK', 'Cancel'] // buttonLabels
    );
}

MyCordova.prompt = function(title, message, defaultInput, callback) {
    if (typeof navigator == "undefined" || !navigator.notification) return;
    navigator.notification.prompt(
        message || "This is content!", // message
        callback, // callback to invoke
        title || "Prompt", // title
        ['Ok', 'Cancel'], // buttonLabels
        defaultInput || "" // defaultText
    );
}

MyCordova.beep = function(times) {
    if (typeof navigator == "undefined" || !navigator.notification) return;
    navigator.notification.beep(times || 1);
}

/**
 * https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin
 * */
MyCordova.share = function(title, url, imgUrl, okCallback) {
    if (!window.plugins || !window.plugins.socialsharing) {
        return;
    }
    // this is the complete list of currently supported params you can pass to the plugin (all optional)
    var options = {
        message: title, // not supported on some apps (Facebook, Instagram)
        subject: 'the subject', // fi. for email
        files: [imgUrl], // an array of filenames either locally or remotely
        url: url,
        //chooserTitle: 'Pick an app', // Android only, you can override the default share sheet title,
        //appPackageName: 'com.apple.social.facebook' // Android only, you can provide id of the App you want to share with
    };

    var onSuccess = function(result) {
        console.log("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
        console.log("Shared to app: " + result.app); // On Android result.app since plugin version 5.4.0 this is no longer empty. On iOS it's empty when sharing is cancelled (result.completed=false)
        if (okCallback) okCallback(result);
    };

    var onError = function(msg) {
        console.log("Sharing failed with message: " + msg);
    };

    window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
}

function catchAllErrors() {
    window.onerror = function(msg, url, lineNo, columnNo, error) {

        var idx = url.lastIndexOf("/");
        console.log("**************JAVASCRIPT ERROR START*****************")
        if (idx > -1) { url = url.substring(idx + 1); }
        console.log("In " + url + " (line #" + lineNo + ", column #" + columnNo + "): " + msg);
        console.log(error.stack);
        console.log("**************JAVASCRIPT ERROR END*****************")

        return false; //suppress Error Alert;

    };
}