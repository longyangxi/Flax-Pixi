/**
 * Created by Administrator on 2018/6/19.
 */
//此对象为fb辅助工具
var fb = {
    contextId: "",
    contextType: "",
    playerName: "",
    playerPic: "",
    playerId: "",
    locale: "",
    maxNum:100, //fb 世界排行榜最大数量
    adVideoId: null,//视频广告位ID
    adInterId: null,//插屏广告位ID
    adVideo: null,//已经加载完毕的视频广告对象
    adInter: null,//已经加载完毕的插屏广告对象
    //初始化SDK
    init: function (config) {
        if(config.platformConfig) {
            fb.adVideoId = config.platformConfig.video;
            fb.adInterId = config.platformConfig.inter;
        }
        FBInstant.initializeAsync()
            .then(fb.startGame);
    },
    //准备开始游戏
    startGame: function (callBack) {
        FBInstant.startGameAsync()
            .then(function () {
                fb.contextId = FBInstant.context.getID();
                fb.contextType = FBInstant.context.getType();
                fb.playerName = FBInstant.player.getName();
                fb.playerPic = FBInstant.player.getPhoto();
                fb.playerId = FBInstant.player.getID();
                fb.locale = FBInstant.getLocale();
                console.log("facebook初始化运行成功，当前语言为:" + fb.locale);
                if (callBack)
                    callBack();
                if(fb.adInterId) setTimeout(fb.prepareAdInerstitial, 5000);
                if(fb.adVideoId) setTimeout(fb.prepareAdVideo, 10000);
                console.log("视频广告ID： " + fb.adVideoId);
                console.log("插屏广告ID: " + fb.adInterId);
                FBInstant.setLoadingProgress(100);
            });
    },
    //设置云数据，用来保存用户数据暂时没用上
    setData: function (key, value, callBack) {
        var params = {};
        params[key] = value;
        FBInstant.player
            .setDataAsync(params)
            .then(function () {
                console.log("设置数据成功:");
                if (callBack)
                    callBack();

            });
    },
    //获得云数据，暂时没用
    getData: function (key, callBack) {
        FBInstant.player
            .getDataAsync([key])
            .then(function (data) {
                var score = data[key];
                console.log("获得数据成功" + key + ":" + score);
                if (callBack)
                    callBack(score);
            });
    },
    //分享游戏
    shareGame: function (title, img, callBack) {
        var self = this;
        console.log("分享游戏");
        FBInstant.shareAsync({
            intent: 'SHARE',
            image: img,
            text: title,
            //data可以通过FBInstant.getEntryPointData()拿到
            data: {playerId: self.playerId}
        }).then(function () {
            console.log("分享游戏回调");
            if (callBack)
                callBack();
        }).catch(function (e) {
            console.log(e);
        });
    },
    prepareAdInerstitial: function() {
        if(!fb.adInterId) return;
        FBInstant.getInterstitialAdAsync(fb.adInterId)
            .then(function(interstitial) {
                fb.adInter = interstitial;
                return interstitial.loadAsync();
            }).then(function() {
                console.log("插屏广告加载完毕")
            }).catch(function(e) {
                console.warn("插屏广告加载错误", e);
                setTimeout(fb.prepareAdInerstitial, 5000);
            })
    },
    showInerstitialAd: function(onReady, onClose) {
        if(this.adInter == null)
        {
            if(onReady)
                onReady(false);
            return false;
        }
        if(onReady) onReady(true);
        this.adInter.showAsync()
            .then(function() {
                if(onClose)
                    onClose(true);
                //看完再加载
                fb.adInter == null;
                fb.prepareAdInerstitial();
            })
            .catch(function(e) {
                if(onClose)
                    onClose(false);
                console.warn(e.message);
            });
        return true;
    },
    //视频广告预先加载
    prepareAdVideo:function(){
        if(!fb.adVideoId) return;
        console.log("To prepare ad video....")
        FBInstant.getRewardedVideoAsync(
            fb.adVideoId // Your Ad Placement Id
        ).then(function(rewarded) {
            // Load the Ad asynchronously
            fb.adVideo = rewarded;
            return fb.adVideo.loadAsync();
        }).then(function() {
            console.log('Rewarded video preloaded')
        }).catch(function(err){
                console.warn('Rewarded video failed to preload: ' + err.message);
                //错误重试
                setTimeout(fb.prepareAdVideo, 5000);
        });
    },
    showAdVideo:function(callBack){
        if(this.adVideo == null)
        {
            if(callBack)
                callBack(false);
            return false;
        }
        this.adVideo.showAsync()
            .then(function() {
                // Perform post-ad success operation
                console.log('Rewarded video watched successfully');
                if(callBack)
                    callBack(true);
                //看完再加载
                fb.adVideo == null;
                fb.prepareAdVideo();
            })
            .catch(function(e) {
                if(callBack)
                    callBack(false);
                console.warn(e.message);
            });
        return true;
    },
    //提交分数
    submitMyScore: function(boardName, score, callBack) {
        var rankBoard;
        var self = this;
        FBInstant.getLeaderboardAsync(boardName)
            .then(function (leaderboard) {
                rankBoard = leaderboard;
                //设置玩家最高分用来更新排行榜,返回值是用户数据
                return leaderboard.setScoreAsync(score);
            }).then(function (entry) {
                return rankBoard.getEntriesAsync(self.maxNum);
            }).then(function (entry2) {
                console.log("获得排行榜成功");
                if (callBack)
                    callBack(entry2);
            }).catch(function (e) {
                console.log(e);
            });
    },
    //显示全部排行榜和自己
    //默认显示10个
    showLeaderboard: function (boardName, callBack) {
        var self = this;
        FBInstant.getLeaderboardAsync(boardName)
            .then(function (leaderboard) {
                return leaderboard.getEntriesAsync(self.maxNum);
            }).then(function (entries) {
                console.log("获得所有用户排名: ", entries);
                if (callBack)
                    callBack(entries);
            }).catch(function (e) {
                console.log(e);
            });
    },
    //创建桌面快捷方式，貌似只有安卓可以
    createShortCut: function() {
        FBInstant.canCreateShortcutAsync()
            .then(function(canCreateShortcut) {
                if (canCreateShortcut) {
                    FBInstant.createShortcutAsync()
                        .then(function() {
                            console.log("Create short cut successfully!")
                        })
                        .catch(function(e) {
                            console.log("Create short cut failed!")
                        });
                }
            });
    },
    //交叉推广
    promoGame: function(appid) {
        FBInstant.switchGameAsync(appid).catch(function (e) {
            // Handle game change failure
            console.log(e);
        });
    },
    //统计事件，做分析
    logEvent: function(evtName, params) {
        var logged = FBInstant.logEvent(
            //Name of the event. Must be 2 to 40 characters, and can only contain '_', '-', ' ', and alphanumeric characters.
            evtName,
            //An optional numeric value that FB Analytics can calculate a sum with.
            42,
            //An optional object that can contain up to 25 key-value pairs to be logged with the event. Keys must be 2 to 40 characters,
            // and can only contain '_', '-', ' ', and alphanumeric characters. Values must be less than 100 characters in length.
            params
        );
    }
    // //好友排行榜,暂时没用
    // showFriendsRank: function (callBack) {
    //     FBInstant.getLeaderboardAsync('highestScore')
    //         .then(function (leaderboard) {
    //             return leaderboard.getConnectedPlayerEntriesAsync();
    //         })
    //         .then(function (entries) {
    //             if (callBack)
    //                 callBack(entries);
    //         });
    // },
}