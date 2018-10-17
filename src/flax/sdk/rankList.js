/**
 * Created by Administrator on 2018/5/28.
 */
var flax = flax || {};

RANK_LIST_JSON = "res/leaderboard.json";
RANK_LIST_PNG = "res/leaderboard.png";

//显示好友或群排行榜，默认显示好友
//需要PIXI库，完全运行需要微信运行环境
var rankItem = null;  //暴露给外部的对象接口，更改标题或者下面按钮内容时使用
var rankList = flax.MovieClip.extend({
    //可以在子域通过url验证是不是本人，此时如果没授权仍然拿不到openId
    sprite: null,  //用来显示共享屏
    isFromRankLittle: false,                 //是否从小排行榜调用
    isGroup: false,
    ticket: "",                              //如果是群排行榜，shareTicket
    plat: "web",
    theTexture: null,
    //构造器
    onEnter: function () {
        this._super();

        this.plat = flax.game.config.platform;

        this.initView();
        if(this.bg) this.bg.interactive = true;
        this.setScale(flax.stageRect.width / 750);
    },
    onExit: function () {
        this._super();
        this.sprite = null;
        this.ticket = null;
    },
    initView: function () {
        rankItem = this;  //暴露给外部的对象接口，更改标题或者下面按钮内容时使用
        this.hide();
        this.setScript();
        this.bg.interactive = true;
        //这里区分了微信和faceBook
        var plat = flax.game.config.platform;
        if(plat == "wechat") {
            this.calCoor();
        } else if(plat == "fb"){
            if (this.isFromRankLittle){
                this.showFBRank(fbPageList.userList);
            } else {
                fb.showLeaderboard(MAX_SCORE_NAME, this.showFBRank.bind(this));
            }
        }
    },

    //显示faceBook排行榜
    //这里不能用this，因为是在回调里，切记
    showFBRank: function (entries) {
        //增加排行榜测试数据用来测试分页按钮
        // while(entries.length<13)
        //     entries.push(entries[0]);
        fbPageList.userList = entries;
        fbPageList.setPageNum();
        //判断用户自己
        var userIndex = -1;
        for (var i = 0; i < entries.length; i++) {
            if (entries[i].getPlayer().getID() == fb.playerId) {
                userIndex = i;
                break;
            }
        }
        var pageItem = fbPageList.pageView();
        //绘制用户自己
        if(userIndex != -1){
            rankItem['rankUser'].visible = true;
            rankItem['iconUser'].visible = true;
            rankItem['nickNameUser'].visible = true;
            rankItem['scoreUser'].visible = true;
            rankItem['rankUser']['value'].text = entries[userIndex].getRank();
            rankItem['rankUser']['value'].setColor("#66FF00");
            rankItem['iconUser'].setSource(entries[userIndex].getPlayer().getPhoto());
            rankItem['iconUser'].width = 80;
            rankItem['iconUser'].height = 80;
            rankItem['nickNameUser']['value'].text = entries[userIndex].getPlayer().getName();
            rankItem['scoreUser']['value'].text = entries[userIndex].getScore();
        }
        rankItem.refreshRank(pageItem);
    },
    refreshRank: function (pageItem) {
        if(pageItem == null )
            return;
        for (var i = 0; i < 5; i++) {
            this["rank" + i].visible = false;
            this["icon" + i].visible = false;
            this['nickName' + i].visible = false;
            this['score' + i].visible = false;
        }
        for (var i = 0; i < pageItem.length; i++) {
            var player = pageItem[i].getPlayer();
            rankItem["rank" + i].visible = true;
            rankItem["rank" + i]['value'].text = pageItem[i].getRank();
            rankItem["icon" + i].setSource(player.getPhoto());
            rankItem["icon" + i].width = 80;
            rankItem["icon" + i].height = 80;
            rankItem["icon" + i].visible = true;
            rankItem["nickName" + i].visible = true;
            rankItem["nickName" + i]['value'].text = player.getName();
            rankItem["score" + i].visible = true;
            rankItem["score" + i]['value'].text = pageItem[i].getScore();
        }
    },
    //隐藏原始元素
    hide: function () {
        var item = this;
        for (var i = 0; i < 5; i++) {
            item['rank' + i].visible = false;
            item['icon' + i].visible = false;
            item['nickName' + i].visible = false;
            item['score' + i].visible = false;
        }
        item['rankUser'].visible = false;
        item['iconUser'].visible = false;
        item['nickNameUser'].visible = false;
        item['scoreUser'].visible = false;
        if(this.plat == "fb"){
            if(item["groupBtn"])  item['groupBtn'].visible = false;
        }
    },
    //设置监听器
    setScript: function () {
        var item = this;
        var self = this;
        //退出按钮
        flax.addListener(item['exitBtn'], function () {
            rankItem = null;
            self.destroy();
            if (self.plat == "wechat"){
                //退出排行榜，通知子域排行榜清空,区分条件是否要重绘
                var mes = {
                    text: 'exitRank',
                    refresh: false  //不需要重绘
                };
                //如果从小排行榜调用再关闭，需要重绘
                if (self.isFromRankLittle)
                    mes.refresh = true;
                wechat.openDataContext.postMessage(mes)
            }else if(self.plat == "fb"){
                fbPageList.reset();
            }
        }, InputType.click);

        flax.addListener(item['preBtn'], function () {
            self.prePage();
        }, InputType.click);

        flax.addListener(item['nextBtn'], function () {
            self.nextPage();
        }, InputType.click);

        if(item["groupBtn"])flax.addListener(item['groupBtn'], function () {
            var self = this;
            wechat.shareGroup(function() {
                self.destroy();
                sdk.showLeaderboard(true);
            });
        }, InputType.click, this);
    },
    //微信环境下计算坐标
    calCoor: function () {
        var item = this;
        //名次//ICON //nickName //score位置
        var rank = item["rank0"].position.x + "-" + item["rank0"].position.y;
        var icon = item["icon0"].position.x + "-" + item["icon0"].position.y;
        var nickName = item["nickName0"].position.x + "-" + item["nickName0"].position.y;
        var scorePos = item["score0"].position.x + "-" + item["score0"].position.y;
        //排行榜最下方显示自己的元素位置
        var rankUser = item["rankUser"].position.x + "-" + item["rankUser"].position.y;
        var iconUser = item["iconUser"].position.x + "-" + item["iconUser"].position.y;
        var nickNameUser = item["nickNameUser"].position.x + "-" + item["nickNameUser"].position.y;
        var scorePosUser = item["scoreUser"].position.x + "-" + item["scoreUser"].position.y;

        var itemWidth = 600;
        var itemHeight = 100;
        if(item['backItem']) {
            //背景条框的宽和高
            itemHeight = item["backItem"].height;
            itemWidth = item["backItem"].width;
            var backItem = item['backItem'].position.x + "-" + item["backItem"].position.y;
        }
        //传送的消息
        var message = {
            text: 'getFriendCloudStorage',
            rank: rank,
            icon: icon,
            nickName: nickName,
            scorePos: scorePos,
            rankUser: rankUser,
            iconUser:iconUser,
            nickNameUser:nickNameUser,
            scorePosUser:scorePosUser,
            backItem:backItem,
            itemHeight:itemHeight,
            itemWidth:itemWidth,
            key: MAX_SCORE_NAME
        };
        //区分从小排行榜调用
        if(this.isFromRankLittle){
            message.text = 'showAllRank';
        }else if (this.isGroup){
            message.text = 'getGroupCloudStorage';
            message.ticket = this.ticket;
        }
        this.showCanvas(message);
    },
    //发送消息来显示共享屏
    showCanvas: function (message) {
        wechat.openDataContext.postMessage(message);
        //显示共享屏
        this.sprite = new PIXI.Sprite();
        this.addChild(this.sprite);
        this.scheduleUpdate();
    },
    update: function () {
        if(this.theTexture) this.theTexture.destroy(true);
        var btexture = new PIXI.BaseTexture(wechat.sharedCanvas);
        this.sprite.texture = new PIXI.Texture(btexture);
        this.theTexture = this.sprite.texture;
    },
    //下一页
    nextPage: function () {
        if (this.plat == "wechat") {
            wechat.openDataContext.postMessage({
                text: 'nextPage'
            });
        } else if (this.plat == "fb") {
            var pageItem = fbPageList.nextPage();
            rankItem.refreshRank(pageItem);
        }
    },
    //上一页
    prePage: function () {
        if (this.plat == "wechat") {
            wechat.openDataContext.postMessage({
                text: 'prePage'
            });
        } else if (this.plat == "fb") {
            var pageItem = fbPageList.prePage();
            rankItem.refreshRank(pageItem);
        }
    },
    //分享给好友，暂时没用，weixinHelp.shareGroup
    inviteFriend: function () {
        wx.shareAppMessage({
            success: function (res) {
                //todo
            },
            fail: function (res) {
                //todo
            }
        });
    }
});
window["rankList"] = rankList;

rankList.show = function(isFromRankLittle, isGroup) {

    var rank =  flax.createDisplay(RANK_LIST_JSON, "a38",{isFromRankLittle: isFromRankLittle, isGroup: isGroup}, false, "rankList");
    flax.currentScene.addChild(rank);
    // var rank = new rankList(key,isFromRankLittle,isGroup);
    return rank;
}

//游戏结束时显示小排行榜，此时多了一个功能，要设置游戏的最高分
//主要结构和上面的rankList一样
var littleRankItem = null;
var rankListLittle = flax.MovieClip.extend({
    score: 0,
    sprite: null,
    entries:null,
    theTexture: null,
    onEnter: function () {
        this._super();
        this.initView();
    },
    initView: function () {
        littleRankItem = this;
        this.hide();
        this.setScript();
        var plat = flax.game.config.platform;
        if(plat == "wechat") {
            this.calCoor();
        } else if(plat == "fb"){
            sdk.submitScore(this.score, this.showFBRank.bind(this));
        }
        //if (fbFlag)
        //    fb.showRank(this.showFBRank, this.score);
        //else
        //    this.calCoor();
    },
    showFBRank: function (entries) {
        littleRankItem.entries = entries;
        var userIndex = -1;
        for (var i = 0; i < entries.length; i++) {
            if (entries[i].getPlayer().getID() == fb.playerId) {
                userIndex = i;
                break;
            }
        }
        var pageItem = [];
        //没有上榜，只显示前三名
        if(userIndex == -1){
            for(var j =0;j<3;j++){
                //此情况应该不会出现
                if(j>=entries.length)
                    break;
                pageItem[j] = entries[j];
            }
        }else{
            //显示用户相邻榜
            //如果在榜首
            if(userIndex == 0){
                for(var j =0;j<3;j++){
                    if(j>=entries.length)
                        break;
                    pageItem[j] = entries[j];
                }
            }else{
                //不在榜首，显示相邻
                for(var j = userIndex-1;j<=userIndex+1;j++){
                    if(j>=entries.length)
                        break;
                    pageItem[j] = entries[j];
                }
            }
        }
        littleRankItem.showItem(pageItem);
    },
    showItem:function(pageItem){
        for (var i = 0; i < pageItem.length; i++){
            var player = pageItem[i].getPlayer();
            littleRankItem['rank' + (1+i)].visible = true;
            littleRankItem['icon' + (1+i)].visible = true;
            littleRankItem['nickName' + (1+i)].visible = true;
            littleRankItem['score' + (1+i)].visible = true;
            littleRankItem['rank' + (1+i)]['value'].text = pageItem[i].getRank();

            littleRankItem['rank' + (1+i)]['value'].setColor("#000000") ;
            littleRankItem['icon' + (1+i)].setSource(player.getPhoto());
            littleRankItem['icon' + (1+i)].width = 64;
            littleRankItem['icon' + (1+i)].height = 64;
            littleRankItem['nickName' + (1+i)]['value'].text = player.getName();
            littleRankItem['nickName' + (1+i)]['value'].color = "#000000";
            littleRankItem['score' + (1+i)]['value'].text = pageItem[i].getScore();
            littleRankItem['score' + (1+i)]['value'].color = "#000000";
            console.log(littleRankItem['rank' + (1+i)]['value'].color);
        }
    },
    onExit: function () {
        this._super();
        this.sprite = null;
        this.entries = null;
    },
    hide: function () {
        var item = this;
        for (var i = 1; i <=3; i++){
            item['rank' + i].visible = false;
            item['icon' + i].visible = false;
            item['nickName' + i].visible = false;
            item['score' + i].visible = false;
        }
    },
    setScript: function () {
        var item = this;
        var self = this;
        //查看全部排行按钮
        flax.addListener(item['viewBtn'], function () {
            if(this.plat == "fb")
                fbPageList.userList = item.entries;
            var rank = flax.createDisplay(RANK_LIST_JSON, "a38", {
                key: MAX_SCORE_NAME,
                isFromRankLittle: true,
                isGroup: false
            }, false, "rankList");
            self.parent.addChild(rank);
        }, InputType.click);
    },
    calCoor: function () {
        var item = this;
        var itemHeight = item['leftItem'].height;
        var itemWidth = item['leftItem'].width;
        //名次//ICON //nickName //score
        var rank = item["rank1"].position.x + "-" + item["rank1"].position.y;
        var icon = item["icon1"].position.x + "-" + item["icon1"].position.y;
        var nickName = item["nickName1"].position.x + "-" + item["nickName1"].position.y;
        var scorePos = item["score1"].position.x + "-" + item["score1"].position.y;
        var leftItem = item['leftItem'].position.x + '-' + item['leftItem'].position.y;
        var message = {
            text: 'showLittleRank',
            rank: rank,
            icon: icon,
            nickName: nickName,
            scorePos: scorePos,
            leftItem: leftItem,
            itemHeight: itemHeight,
            itemWidth: itemWidth,
            key: MAX_SCORE_NAME,
            score: this.score
        };
        this.showCanvas(message);
    },
    showCanvas: function (message) {
        wechat.openDataContext.postMessage(message);
        this.sprite = new PIXI.Sprite();
        this.addChild(this.sprite);
        this.scheduleUpdate();
    },
    update: function () {
        if(this.theTexture) this.theTexture.destroy(true);
        var btexture = new PIXI.BaseTexture(wechat.sharedCanvas);
        this.sprite.texture = new PIXI.Texture(btexture);
        this.theTexture = this.sprite.texture;
    }
});
window["rankListLittle"] = rankListLittle;

/**
 * Created by Administrator on 2018/5/31.
 * 这里主要进行FB一些分页操作
 */
var fbPageList = {
    userList: [],                //所有的用户列表
    currentPage: 1,            //当前页，页码大小，总页码
    pageSize: 5,
    pageNum: 1,
    horList: [],                 //横向小排行榜
    hasNextPage: function () {
        return this.currentPage < this.pageNum;
    },
    hasPrePage: function () {
        return this.currentPage > 1;
    },
    setPageNum: function () {
        this.pageNum = Math.ceil(this.userList.length / this.pageSize);
    },
    //重置
    reset:function(){
        this.userList = [];
        this.currentPage = 1;
        this.pageNum = 1;
        this.horList = [];
    },
    //分页显示
    pageView: function () {
        var pageItem = [];
        //名次偏移量
        var offset = this.pageSize * (this.currentPage - 1);
        for (var i = 0; i < this.pageSize; i++) {
            var j = i + offset;
            if (j >= this.userList.length)
                break;
            this.userList[j].index = j;
            pageItem.push(this.userList[j]);
        }
        return pageItem;
    },
    nextPage: function () {
        if (this.hasNextPage()) {
            this.currentPage++;
            return this.pageView()
        } else
            return null;
    },
    prePage: function () {
        if (this.hasPrePage()) {
            this.currentPage--;
            return this.pageView();
        } else
            return null;
    },
    //得到水平方向排行榜的用户数组
    getHorArray: function (userInfo) {
        var result = [];
        if (userInfo.index == 0) {
            for (var j = 0; j < 3; j++) {
                if (j >= this.userList.length) {
                    break;
                }

                this.userList[j].index = j;
                result.push(this.userList[j]);
            }
        } else {
            for (var j = -1; j < 2; j++) {
                var k = j + userInfo.index;
                if (k >= this.userList.length) {
                    break;
                }
                this.userList[k].index = k;
                result.push(this.userList[k]);
            }
        }
        return result;
    }
};
