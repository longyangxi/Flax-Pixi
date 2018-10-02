/**
 * 交叉推广
 * */

var flax = flax || {};

/**
 * {
  "musicBall": {
    "wechat": "wx110197cdcb917a1a",
    "fb": "908356079347129",
    "ios": null,
    "android": null
  },
  "physicBall": {
    "wechat": null,
    "fb": "607111099688547",
    "ios": "1405651658",
    "android": null
  },
  "popSugar": {
    "wechat": "wxd0773a57a926cabe",
    "fb": null,
    "ios": null,
    "android": null
  }
}
 * */
var promoPath =  "https://lottery.etdogs.com/miniGameMaster/config/";
 var promoJsonUrl = promoPath + "promo.json"

flax.promo = flax.MovieClip.extend({
    promoId: null,
    promoName: null,
    onEnter: function() {
        this._super();
        var imgPath = flax.game.config.platform == "fb" ? "res/config/" : promoPath;
        this.icon.setSource(imgPath + this.promoName + ".jpg");
        var self = this;
        flax.addListener(this, function() {
            sdk.promoGame(self.promoId);
        });


        var actions = [
            flax.rotateBy(this, 0.2, 6),
            flax.rotateBy(this, 0.2, -6),
            flax.rotateBy(this, 0.2, -6),
            flax.rotateBy(this, 0.2, 6)
        ]

        flax.runActions(actions, null, null, true);
    },
    onExit: function() {
        this._super();
    }
})

flax.promo.show = function(x, y) {

    var gameConfig = flax.game.config;
    var platform = gameConfig.platform;
    var thisAppid = gameConfig.platformConfig.appid;

    http_get(promoJsonUrl, function(data) {
        var ids = [];
        var names = [];
        for(var k in data) {
            var game = data[k];
            var gameId = game[platform];
            if(gameId != null && gameId != "null" && gameId != thisAppid) {
                ids.push(gameId);
                names.push(k);
            }
        }
        var rnd = flax.randInt(0, ids.length);
        var promoId = ids[rnd];
        var promoName = names[rnd];

        if(!promoId) return;
        console.log("小游戏交叉推广：", ids, promoId, promoName);
        //try
        {
            var p = flax.createDisplay(RANK_LIST_JSON, "promo", {x: x || 0, y: y || 0, promoId: promoId, promoName: promoName},  false, "flax.promo");
            flax.currentScene.addChild(p);
        }

    });
}