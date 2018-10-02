var flax = flax || {};

flax.game.onStart = function() {

    flax.init(flax.ResolutionPolicy.SHOW_ALL);

    flax.registerScene("simpleScene", simpleScene, res_simple);
    flax.replaceScene("simpleScene");
};

flax.game.run();