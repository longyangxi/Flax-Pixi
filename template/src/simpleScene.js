var simpleScene = flax.Scene.extend({
    onEnter: function() {
        this._super();
        var logo = flax.createDisplay(res.simple, "logoAnim", { parent: this, autoStopWhenOver: true });
        logo.setPosition(flax.stageRect.width / 2, flax.stageRect.height / 2);
        logo.play();
        flax.addListener(logo, function() {
            logo.gotoAndPlay(0);
        }, InputType.click, this);
    },
    onExit: function() {
        this._super();
    }
})