/**
 * Created by long on 15/10/23.
 */
var flax = flax || {};
flax.Module = flax.Module || {};

flax.Module.Schedule = {
    onExit: function () {
        flax.scheduler.unschedule(this);
    },
    schedule: function (callback, interval, repeat, delay) {
        flax.scheduler.schedule(this, callback, interval, repeat, delay);
    },
    scheduleOnce: function (callback, delay) {
        flax.scheduler.scheduleOnce(this, callback, delay);
    },
    scheduleUpdate: function () {
        flax.scheduler.scheduleUpdate(this);
    },
    unschedule: function (callback) {
        flax.scheduler.unschedule(this, callback);
    },
    unscheduleUpdate: function () {
        flax.scheduler.unscheduleUpdate(this);
    }
}