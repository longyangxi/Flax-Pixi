/**
 * Created by long on 15/11/7.
 */

var flax = flax || {};

DELTA_RATE = 0.001/0.06;

flax.Scheduler = flax.Class.extend({
    ticker:null,
    schedules:null,
    toRemoves:null,
    stats:null,
    time: -1,
    _timePaused: true,
    _runningFrames: 0,
    ctor: function () {
        this.schedules = [];
        this.toRemoves = [];
        this._setupTicker();
    },
    start: function () {
        this.ticker.start();
    },
    pause: function () {
        this.ticker.stop();
    },
    isPaused: function () {
        return !this.ticker.started;
    },
    schedule: function (target, callback, interval, repeat, delay, fixed) {
        if(!target || !callback) throw "Target or callback can not be null!"
        if(interval == null || interval < 0) interval = flax.frameInterval;
        if(repeat == null) repeat = flax.REPEAT_FOREVER;
        if(delay == null || delay < 0) delay = 0;
        var obj = {target: target, callback: callback, interval: interval, repeat: repeat, delay: delay, time: 0, fixed: fixed === true};
        var sObj = this._ifExist(obj, this.schedules);
        if(sObj) {
            flax.copyProperties(obj, sObj);
        } else {
            this.schedules.push(obj);
        }
    },
    fixedSchedule: function (target, callback, interval, repeat, delay) {
        this.schedule(target, callback, interval, repeat, delay, true);
    },
    scheduleOnce: function (target, callback, delay) {
        this.schedule(target, callback, 0, 0, delay);
    },
    scheduleUpdate: function (target, fixed) {
        if(target.update == null || typeof target.update != "function") {
            console.log("ScheduleUpdate need a function named update to invoke!");
            return;
        }
        this.schedule(target, target.update, flax.frameInterval, flax.REPEAT_FOREVER, 0, fixed);
    },
    fixedScheduleUpdate: function(target) {
        this.scheduleUpdate(target, true);
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
    //_lastTime:0,
    update: function (delta) {

        delta *= DELTA_RATE;

        var now = window.performance.now();
        if(this.time == -1) this.time = now;

        //Try to fix the sound bug in Mobile
        if(now - this.time > 1000) {
            this._runningFrames = 0;
            if(!this._timePaused) {
                this._timePaused = true;
            }
        } else {
            this._runningFrames++;
            if(this._timePaused && this._runningFrames >= 60) {
                this._timePaused = false;
                flax.resumeAllSounds();
            }
        }

        this.time = now;

        if(this.stats) this.stats.begin();

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
                        var tTime = s.time;
                        s.time = 0;
                        s.repeat--;
                        //fixed update, for logic or physic simulate
                        if(s.fixed === true) {
                            var count = Math.floor(tTime / s.interval);
                            s.time = tTime - s.interval * count;
                            //TODO
                            count = Math.min(6, count);
                            for(var j = 0; j < count; j++) {
                                s.callback.apply(s.target, [s.interval]);
                            }
                        } else {
                            s.callback.apply(s.target, [delta]);
                        }
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

        if(typeof TWEEN != "undefined") {
            TWEEN.update(this.time);
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
    },
    showFPS: function() {
        if(flax.game.config['showFPS'] === true) {
            var stats = new Stats();
            stats.setMode(0); // 0: fps, 1: ms, 2: mb

            // align top-left
            stats.domElement.style.position = 'absolute';
            stats.domElement.style.left = flax.app.view.style.left;//'0px';
            stats.domElement.style.top = flax.app.view.style.top;//'0px';



            document.body.appendChild( stats.domElement );
            this.stats = stats;
        }
    }
});