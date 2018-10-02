var flax = flax || {};

SHOW_PAUSE_MASK = true;

flax.PauseScreenMask = flax.Graphics.extend({
    ctor: function() {
        this._super();
        if(SHOW_PAUSE_MASK) {
            var w = flax.stageRect.width + 10;
            var h = flax.stageRect.height + 10;
            var bg = this;
            bg.beginFill(0x000000, 0.5);
            bg.drawRect(0, 0, w, h);
            bg.endFill();
        }
    },
    hide: function() {
        //if(!this.visible) return;
        //fix the bug of sound in ios
        //if(flax.fixSoundBugIos) flax.fixSoundBugIos();
        //注意：通过监听用户点击，来重新开启声音播放，这个用来解决ios中的问题
        flax.stage.off(InputType.press, this.hide, this);
        flax.stage.off(InputType.up, this.hide, this);
        this.visible = false;
    },
    show: function() {
        this.visible = true;
    }
})
flax.PauseScreenMask.instance = null;
flax.PauseScreenMask.show = function() {
    if(!flax.stage) return;
    var mask = flax.PauseScreenMask.instance;
    if(!mask) {
        flax.PauseScreenMask.instance = mask = new flax.PauseScreenMask();
        flax.stage.addChild(mask);
    }
    mask.show();
    flax.stage.setChildIndex(mask, flax.stage.children.length - 1);
    //注意：通过监听用户点击，来重新开启声音播放，这个用来解决ios中的问题
    flax.stage.interaction = true;
    flax.stage.on(InputType.press, mask.hide, mask);
    flax.stage.on(InputType.up, mask.hide, mask);
}

flax.PauseScreenMask.hide = function() {
    if(flax.PauseScreenMask.instance) {
        flax.PauseScreenMask.instance.hide();
    }
}

//显示暂停屏幕
//flax.onScreenHide.add(flax.PauseScreenMask.show);