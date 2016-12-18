/**
 * Created by long on 15/10/23.
 */
var flax = flax || {};
flax.Module = flax.Module || {};

flax.Module.ScheduleOnce = {
    _schedules:[],
    _inRunning:false,
    "onEnter": function() {
        this._schedules = [];
    },
    "onExit": function () {
        this._schedules = null;
        if(this._inRunning) this.unschedule(this._checkSchedule);
    },
    _checkSchedule:function(delta) {
        if(!this._schedules) return;
        var i = this._schedules.length;
        while(i--) {
            var sData = this._schedules[i];
            if(sData['has'] >= sData['delay']) {
                this._schedules.splice(i, 1);
                sData['func'].apply(this);
            } else {
                sData['has'] += delta;
            }
        }
    },
    scheduleOnce: function (callback, delay) {
        if(!this._inRunning) {
            this._inRunning = true;
            if(!this._schedules) this._schedules = [];
            this.schedule(this._checkSchedule, 1/60);
        }

        //No duplicated callback
        for(var i = 0; i < this._schedules.length; i++) {
            if(this._schedules[i]['func'] == callback) {
                return;
            }
        }

        var sData = {"func":callback, "delay":delay, "has":0};

        this._schedules.push(sData);
    }
}