/**
 * Created by Administrator on 2018/5/22.
 * 这里主要处理主域和微信相关的操作
 */

var wechat = {
    isOfWeiXin: (typeof wx !== "undefined"), OfWeiXin: false,   //是否在微信环境运行
    openDataContext: null,   //开放域
    sharedCanvas: null,      //共享屏
    width: 750,                //项目的宽和高
    height: 1206,
    bannerAd: null,
    videoAd: null,
    deviceInfo: {},
    config: {},
    //初始化相关数据
    init: function (config) {
        if (!this.isOfWeiXin)
            return;
        this.config = config || {};
        this.openDataContext = wx.getOpenDataContext();
        this.sharedCanvas = this.openDataContext.canvas;
        this.sharedCanvas.width = this.width;
        this.sharedCanvas.height = this.height;

        //https://developers.weixin.qq.com/minigame/dev/document/system/system-info/wx.getSystemInfoSync.html
        this.deviceInfo = wx.getSystemInfoSync();

        var self = this;
        if (this.isOfWeiXin) {
            this.login(self.getUserInfo);
            //初始化拖管数据
            this.initScore(0);
            //显示右上角转发菜单
            this.showShareMenu();
        }
        var shareConfig = getShareConfig("wechat");
        if(shareConfig && shareConfig.shareTitle) {
            wx.onShareAppMessage(function () {
                return {
                    title: shareConfig.shareTitle,
                    imageUrl: shareConfig.shareImg
                }
            })
        }
    },
    //登录
    login: function (callback) {
        wx.login({
            success: function () {
                //todo 获得用户session key
                if (callback)
                    callback();
            }
        });
    },
    //获得用户授权，第一次会弹出窗口确认，无论授权与否，均可从子域拿到用户头像url，用来排行榜时判断是否本用户
    getUserInfo: function () {
        //在回调里self = this 没用，因为此时this已经不是本对象了
        //主要是弹用户授权
        wx.getUserInfo({
            fail: function (res) {
                // iOS 和 Android 对于拒绝授权的回调 errMsg 没有统一，需要做一下兼容处理
                if (res.errMsg.indexOf('auth deny') > -1 || res.errMsg.indexOf('auth denied') > -1) {
                    // 处理用户拒绝授权的情况,此时需要重新引导
                    console.log("用户拒绝授权");
                    // //再次尝试会失败，此时子域可以拿到url
                }
            },
            success: function (res) {
                //todo 进一步获得用户信息
                console.log("获得用户信息成功");
            },
            //从子域拿用户头像url
            complete: function () {
                wechat.openDataContext.postMessage({
                    text: 'getUserInfo'
                });
            }
        });
    },
    //显示右上角转发菜单
    showShareMenu: function () {
        wx.showShareMenu({
            withShareTicket: true
        });
    },
    //游戏在第一次运行时需要初始化分数，在子域进行
    initScore: function (value) {
        this.openDataContext.postMessage({
            text: 'initScore',
            key: MAX_SCORE_NAME,
            value: value
        });
    },
    submitScore: function (value) {
        this.openDataContext.postMessage({
            text: 'setScore',
            key: MAX_SCORE_NAME,
            value: value
        });
    },
    //从好友排行榜里显示群排行榜
    showGroupRank: function (ticket) {
        this.openDataContext.postMessage({
            text: 'getGroupCloudStorage',
            ticket: ticket,
            key: MAX_SCORE_NAME
        });
    },
    //显示群排行榜
    shareGroup: function (callback) {
        var shareConfig = getShareConfig("wechat");
        var self = this;
        wx.shareAppMessage({
            title: shareConfig.shareTitle,
            imageUrl: shareConfig.shareImg,
            success: function (data) {
                //发到一个群里
                if(data.shareTickets){
                    var ticket = data.shareTickets[0];
                    if(callback) callback(ticket);
                }else{
                    //todo 发给好友
                }
                //todo 进一步的解密，先不管
                // wx.getShareInfo({
                //     shareTicket:res.shareTickets,
                //     success:function(res){
                //     }
                // });
            },
            fail: function (res) {
                console.log(res);
                // console.log("fail");
            }
        });
    },
    //最简单的分享功能
    //目前不做任何处理
    //TODO, https://www.w3cschool.cn/wxagame/wxagame-26xn2iv0.html
    shareGame:function(title, img, cb){
        if(!this.isOfWeiXin)
            return;

        wx.shareAppMessage({
            title: title,
            imageUrl: img,
            query: "id=longsir",
            success:function(){
                if(cb) cb(true);
            },
            fail:function(){
                if(cb) cb(false);
            }
        });
    },
    /**
     * 全屏显示可刷二维码的图片，绝招
     * */
    previewImg: function(url) {
        if(!this.isOfWeiXin) return;
        //url = "https://lottery.etdogs.com/h5/res/bigLogo.png";
        wx.previewImage({urls: [url]})
    },
    moreGames: function() {
        wechat.previewImg("https://lottery.etdogs.com/wechat/pic_haolongames8.jpg");
    },
    recoredAudio: function() {
        if(!this.isOfWeiXin) return;
        var mp3Recorder = wx.getRecorderManager();
        var mp3RecoderOptions = {
            duration: 10000,
            sampleRate: 16000,
            numberOfChannels: 1,
            encodeBitRate: 48000,
            format: 'mp3'
            //frameSize: 50
        }
        mp3Recorder.start(mp3RecoderOptions);
        setTimeout(function() {

            mp3Recorder.onStop(function(res){
                //this.tempFilePath = res.tempFilePath;
                console.log('停止录音', res.tempFilePath);
                setTimeout(function(){
                    flax.playMusic(res.tempFilePath);
                }, 1000)
            })
            mp3Recorder.stop();

    }, mp3RecoderOptions.duration)

    },
    //https://developers.weixin.qq.com/minigame/dev/tutorial/ad/rewarded-video-ad.html
    showAdVideo: function(cb) {
        if(!this.isOfWeiXin) return;
        var config = this.config.platformConfig;
        if(!config && !config.video) {
            console.log("播放微信视频广告，请在project.json中定义一个wechat，其中包含广告位id的video字段");
            return;
        }
        if(!this.videoAd) {
            this.videoAd = wx.createRewardedVideoAd({ adUnitId: config.video})
        }
        var ad = this.videoAd;
        ad.onLoad(function(){
            console.log('视频广告加载成功');
        })
        ad.onError(function(err) {
            console.log('视频广告出错：', err)
        })
        ad.show().then(function() {
            console.log('视频广告显示');
            flax.onScreenHide.dispatch();
        }).catch(function(err) {
            console.log("视频广告显示失败", err);
            ad.load().then(function() {
                ad.show();
            })
        })
        ad.onClose(function(r) {
            if(cb) cb(r.isEnded);
            flax.onScreenShow.dispatch();
        });
    },
    showAdBanner: function(onBottom, createNew) {
        if(!this.isOfWeiXin)
            return;
        var config = this.config.platformConfig;
        if(!config && !config.banner) {
            console.log("展示微信banner广告，请在project.json中定义一个wechat，其中包含广告位id的banner字段");
            return;
        }
        if(this.bannerAd) {
            if(createNew === true) this.bannerAd.destroy();
            else {
                this.bannerAd.show();
                return;
            }
        }

        this.bannerAd = wx.createBannerAd({
            adUnitId: config.banner,
            style: {
                left: 0,
                top: 0,
                width: window.innerWidth
            }
        })
        var self = this;
        self.bannerAd.onLoad(function(d){
            console.log("banner广告加载成功");
        })
        self.bannerAd.onResize(function(size){
            //默认顶部显示，调整为底部显示
            if(onBottom) {
                self.bannerAd.style.top = window.innerHeight - size.height;
                console.log("调整banner位置到底部: " + (window.innerHeight - size.height))
            }
        })
        this.bannerAd.show().then(function(){
            console.log("banner广告显示成功");

        }).catch(function(e) {
            console.log("banner广告显示失败", e);
            setTimeout(function(){
                wechat.showAdBanner(createNew);
            }, 5000);
        })
    },
    hideAdBanner: function(destroy) {
        if(this.bannerAd) {
            if(destroy === true){
                this.bannerAd.destroy();
                this.bannerAd = null;
            } else this.bannerAd.hide();
        }
    }
}

