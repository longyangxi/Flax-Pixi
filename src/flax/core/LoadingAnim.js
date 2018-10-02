var flax = flax || {};

flax.LoadingAnim = flax.Container.extend({
    _bg: null,
    _circle: null,
    _star: null,
    _anim: null,
    onEnter: function() {
        this._super();

        var sw = flax.stageRect.width;
        var sh = flax.stageRect.height;

        var w = flax.game.config.width;
        var h = flax.game.config.height;

        var bg = this.bg = new flax.Graphics();
        bg.beginFill(0x000000, 0.5);
        bg.drawRect(0, 0, sw, sh);
        bg.endFill();
        bg.setPosition(-sw/2, -sh/2);
        this.addChild(bg);
        bg.interactive = true;

        var circle = this._circle = new flax.Graphics();
        this.addChild(circle);

        var radius = 40;
        circle.lineStyle(6 ,0xFFFFFFF);
        circle.drawCircle(0, 0, radius);
        circle.endFill();

        this._star = flax.drawPolygon(radius * 0.7, 5, 0, 0, true, this, 4);
        this._anim = flax.rotateBy(this._star, 0.5, 90).start().repeat(Infinity);

        this.setPosition(w/2, h/2);
    },
    onExit: function() {
        this._super();
        if(this._bg) this._bg.destroy();
        if(this._circle) this._circle.destroy();
        if(this._star) this._star.destroy();
        if(this._anim) this._anim.stop();
        this._bg = null;
        this._circle = null;
        this._star = null;
        this._anim = null;
    }
})

flax.LoadingAnim.show = function() {
    if(flax.LoadingAnim.current) return;
    var l = flax.LoadingAnim.current = new flax.LoadingAnim();
    flax.stage.addChild(l);
    return l;
}

flax.LoadingAnim.hide = function() {
    if(!flax.LoadingAnim.current) return;
    flax.LoadingAnim.current.destroy();
    flax.LoadingAnim.current = null;
}