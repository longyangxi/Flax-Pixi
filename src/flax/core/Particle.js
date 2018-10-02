/**
 * Created by long on 18/5/28.
 */

/**
 * options is same as emitter config
 *
 * extra options:
 *
 * parent: the parent of the emitter
 *
 * special options:
 * pos: position of the particle
 * playOnce: play once and destroy, default is false
 *
 * color: {
 *  start: 0x00000,
 *  end: 0x0000
 * }               start color and end color of the particle, can be null to show origin color
 *
 * See the doc: https://pixijs.io/pixi-particles/docs/PIXI.particles.Emitter.html
 * See the editor: https://pixijs.io/pixi-particles-editor/#
 *
 * emitter.playOnce(callback);
 * emitter.playOnceAndDestroy(callback);
 * emitter.updateOwnerPos(x, y);
 * emitter.updateSpawnPos(x, y);
 * */
flax.showParticle = function(textures, emitterConfig, options) {

    if(!textures) {
        throw "Please give the particle a texture!"
    }

    if(!emitterConfig) {
        throw "Please give the particle a config!"
    }

    if(!options) options = {};

    flax.copyProperties(options, emitterConfig);

    var parent = options.parent || flax.currentScene;

    if(!parent) {
        throw "Please give the particle a container!"
    }

    var emitter = new PIXI.particles.Emitter(
        parent,
        textures,
        emitterConfig
    );

    emitter.emit = true;
    emitter.autoUpdate = true;

    if(options.playOnce === true) {
        emitter.playOnceAndDestroy(null);
    }

    return emitter;
}