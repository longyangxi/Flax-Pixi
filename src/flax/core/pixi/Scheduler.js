/**
 * Created by long on 15/11/7.
 */

var flax = flax || {};

DELTA_RATE = 0.001/0.06;

flax.REPEAT_FOREVER = Number.MAX_VALUE - 1;

flax.Scheduler = flax.Class.extend({
    ticker:null,
    schedules:null,
    toRemoves:null,
    stas:null,
    ctor: function () {
        this.schedules = [];
        this.toRemoves = [];
        this._setupTicker();
    },
    start: function () {
        this.ticker.start();
    },
    pause: function () {
        this.ticker.pause();
    },
    isPaused: function () {
        return !this.ticker.started;
    },
    schedule: function (target, callback, interval, repeat, delay) {
        if(!target || !callback) throw "Target or callback can not be null!"
        if(interval == null || interval < 0) interval = flax.frameInterval;
        if(repeat == null) repeat = flax.REPEAT_FOREVER;
        if(delay == null || delay < 0) delay = 0;
        var obj = {target: target, callback: callback, interval: interval, repeat: repeat, delay: delay, time: 0};
        var sObj = this._ifExist(obj, this.schedules);
        if(sObj) {
            flax.copyProperties(obj, sObj);
        } else {
            this.schedules.push(obj);
        }
    },
    scheduleOnce: function (target, callback, delay) {
        this.schedule(target, callback, 0, 0, delay);
    },
    scheduleUpdate: function (target) {
        if(target.update == null || typeof target.update != "function") {
            flax.log("ScheduleUpdate need a function named update to invoke!");
            return;
        }
        this.schedule(target, target.update, flax.frameInterval, flax.REPEAT_FOREVER, 0);
    },
    unscheduleUpdate: function (target) {
        if(target.update) {
            this.unschedule(target, target.update);
        }
    },
    unschedule: function (target, callback) {
        var obj = {target: target, callback: callback};
        var removes = this.toRemoves;
        //If callback is null, then try to remove all the schedules for the target
        if(callback == null) {
            var ss = this.schedules;
            var len = ss.length;
            for(var i = 0; i < len; i++){
                if(ss[i].target == target){
                    obj = {target: target, callback: ss[i].callback};
                    if(!this._ifExist(obj, removes) && this._ifExist(obj, this.schedules)){
                        removes.push(obj);
                    }
                }
            }
        }else if (!this._ifExist(obj, removes) && this._ifExist(obj, this.schedules)) {
            removes.push(obj);
        }
    },
    update: function (delta) {

        if(this.stats) this.stats.begin();

        delta *= DELTA_RATE;//CONST.TARGET_FPMS;
        var ss = this.schedules;
        var ss1 = this.toRemoves;
        var len = ss.length;
        for(var i = 0; i < len; i++)
        {
            var s = ss[i];
            //Check the schedule to be removed
            var removed = false;
            var j = ss1.length;
            while(j--){
                var s1 = ss1[j];
                if(s1.target == s.target && s1.callback == s.callback) {
                    removed = true;
                    ss.splice(i, 1);
                    ss1.splice(j, 1);
                    i--;
                    len--;
                    break;
                }
            }
            //Ignore the schedule has been removed in this update
            if(removed) continue;
            //begin handle the schedules
            if(s.delay <= 0) {
                if(s.repeat >= 0) {
                    s.time += delta;
                    if(s.time >= s.interval) {
                        s.time = 0;
                        s.repeat--;
                        s.callback.apply(s.target, [delta]);
                    }
                }
                //If reached to the max repeat count, then remove the schedule
                if(s.repeat < 0) {
                    this.unschedule(s.target, s.callback);
                }
            }else{
                s.delay -= delta;
            }
        }

        if(this.stats) this.stats.end();
    },
    _ifExist: function (sObj, arr) {
        var len = arr.length;
        for(var i = 0; i < len; i++)
        {
            var obj = arr[i];
            if(obj.target == sObj.target && obj.callback == sObj.callback){
                return obj;
            }
        }
        return null;
    },
    _setupTicker: function () {
        var ticker = this.ticker = PIXI.ticker.shared;
        ticker.add(this.update, this);
        //ticker.minFPS = flax.game.config['frameRate'];
        ticker.autoStart = true;

        if(flax.game.config['showFPS'] === true) {
            var stats = new Stats();
            stats.setMode(0); // 0: fps, 1: ms, 2: mb

            // align top-left
            stats.domElement.style.position = 'absolute';
            stats.domElement.style.left = '0px';
            stats.domElement.style.top = '0px';

            document.body.appendChild( stats.domElement );
            this.stats = stats;
        }
    }
});