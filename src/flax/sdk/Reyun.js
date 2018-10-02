
var REYUN_APP_ID = "202f10a1744d2558764f4afdb8b33cb8";

var REYUN_HOST = "http://log.reyun.com";

var REYUN_API = {
    install: "/receive/rest/install",//安装
    start: "/receive/rest/startup",//打开
    register: "/receive/rest/register",//注册,TODO, 后面的多加who作为账户id
    login: "/receive/rest/loggedin",//登录
    /**
     transactionid	    是	字符串	最长64	交易的流水号
     paymenttype	    是	字符串	最长16	支付类型，例如支付宝，银联，苹果、谷歌官方等,如果是系统赠送的，paymentType为：free
     currencytype	    是	字符串	最长3	货币类型，按照国际标准组织ISO 4217中规范的3位字母，例如CNY人民币、USD美金等，详情请点击
     currencyamount	    是	字符串	最长16	支付的真实货币的金额
     virtualcoinamount	是	字符串	最长16	通过充值获得的游戏内货币的数量
     iapname	        是	字符串	最长32	游戏内购买道具的名称
     iapamount	        是	字符串	最长16	游戏内购买道具的数量
     * */
    pay: "/receive/rest/payment",//支付
    /**
     questid	    是	字符串	最长32	当前任务/关卡/副本的编号或名称
     queststatus	是	枚举	最长1	当前任务/关卡/副本的状态，有如下三种类型：开始：a完成：c失败：f
     questtype	    是	字符串	最长16	当前任务/关卡/副本的类型，例如： 新手任务：new 主线任务：main 支线任务：sub 开发者也可以根据自己游戏的特点自定义类型
     * */
    quest: "/receive/rest/quest",//任务关卡
    /**
     * what	是	字符串	最长32	自定义事件的名称----TODO多加的参数
     * */
    event: "/receive/rest/event"//自定义事件
}

var Reyun = {
    register: function(appId, uid, deviceid) {
        if(deviceid == null) deviceid = uid;
        REYUN_APP_ID = appId;
        Reyun.log(uid, REYUN_API.install, function(){
            Reyun.log(uid, REYUN_API.start, function() {
                Reyun.log(uid, REYUN_API.register);
            })
        }, null, {deviceid: deviceid});
    },
    log: function(uid, api, callback, what, params) {
        var context = {
            deviceid: uid
        }
        if(params) {
            for(var k in params) {
                context[k] = params[k];
            }
        }

        http_get(REYUN_HOST + api, function(data) {
            if(callback) callback(data);
        }, {
            appid: REYUN_APP_ID,
            who: uid,
            what: what,
            context: context
        }, true);
        //request({
        //    url: REYUN_HOST + api,
        //    method: "POST",
        //    json: {
        //        appid: REYUN_APP_ID,
        //        who: uid,
        //        what: what,
        //        context: context
        //    }
        //}, function(error, response, body){
        //    console.log(uid, api, body);
        //    if(callback) callback(error, body);
        //});
    }
}