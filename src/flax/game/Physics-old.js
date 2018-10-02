/**
 * Created by long on 18/5/18.
 */
var flax = flax || {};

flax.Physics = flax.Class.extend({
    engine: null,
    world: null,
    render: null,
    runner: null,
    running: false,
    bodies: {},
    /**
     * options:
     *     bounds: {x: 0, y: 0, width: 750, height: 1136}
     *     gravity: {x: 0, y: 1},
     *     showRender: true,
     *     autoMouse: false,
     *     autoWalls: false
     * */
    ctor: function(options) {
        this._super();

        if(!options) options = {};
        if(!options.bounds) options.bounds = flax.stageRect;

        // create engine and world
        var engine = this.engine = Matter.Engine.create();
        this.world = engine.world;

        //world bounds
        this.world.bounds = {
            min: { x: options.bounds.x, y: options.bounds.y},
            max: { x: options.bounds.width, y: options.bounds.height }
        };

        //gravity
        if(options.gravity) {
            if(!isNaN(options.gravity.x)) this.world.gravity.x = options.gravity.x;
            if(!isNaN(options.gravity.y)) this.world.gravity.y = options.gravity.y;
            if(!isNaN(options.gravity.scale)) this.world.gravity.scale = options.gravity.scale;
        }

        // create renderer
        if(options.showRender === true) this.render = this._createRender();

        // create runner
        this.runner = Matter.Runner.create();

        // walls
        if(options.autoWalls === true) {
            this._createWalls();
        }

        // add mouse control
        if(this.render && options.autoMouse === true) {
            this._createMouse();
        }
    },
    start: function() {
        if(this.running) return;
        this.running = true;
        if(this.render) Matter.Render.run(this.render);
        if(this.runner && this.engine) Matter.Runner.run(this.runner, this.engine);
        //flax.scheduler.scheduleUpdate(this);

        Matter.Events.on(this.engine, 'beforeUpdate', this._preHandleUpdate.bind(this));
    },
    stop: function() {
        if(!this.running) return;
        this.running = false;
        if(this.render) Matter.Render.stop(this.render);
        if(this.runner) Matter.Runner.stop(this.runner);
        //flax.scheduler.unscheduleUpdate(this);

        Matter.Events.off(this.engine, 'beforeUpdate', this._preHandleUpdate.bind(this));
    },
    //update: function(delta) {
        //for(var k in this.bodies) {
        //    var body = this.bodies[k];
        //    if(body && body.sprite) {
        //        var sprite = body.sprite
        //        if(sprite.running) {
        //            sprite.setPosition(body.position);
        //            sprite.rotation = body.angle;
        //        } else {
        //            this.removeSpriteBody(sprite);
        //        }
        //    }
        //}
    //},
    /**
     *   Options, detail see 'Body.create = function' in matter.js
     *
     *   angle: 0,
         torque: 0,
         velocity: { x: 0, y: 0 },
         angularVelocity: 0,
         isSensor: false,
         isStatic: false,
         inertia:       //set Infinity to prevent auto rotating
         isSleeping: false,
         motion: 0,
         sleepThreshold: 60,
         density: 0.001,
         restitution: 0,
         friction: 0.1,
         frictionStatic: 0.5,
         frictionAir: 0.01,
         collisionFilter: {
                        category: 0x0001,
                        mask: 0xFFFFFFFF,
                        group: 0
                    }

        extra parameters:
        noGravity: true or false
     * */
    addSpriteBody: function(sprite, options) {
        var world = this.world;
        if(!world) throw "There is no physics world!";
        if(this.bodies[sprite.__instanceId]) throw "There has a sprite body with id: " + sprite.__instanceId;

        if(typeof options != "object") options = {};

        var parts = [];

        //TODO, handle colliders in MC or more colliders except mainCollider
        //for now, MC only handles its children
        var hasChildren = sprite.children.length > 0;
        var children = hasChildren ? sprite.children.concat() : [sprite];

        for(var index in children) {
            var child = children[index];
            var pos = child.position;

            //Ignore the objects not predefine main collider
            if(!child._definedMainCollider) {
                continue;
            }

            var collider = child.mainCollider;

            //Add name and tag property to body
            var ops = {name: child.name, label: child.assetID};
            flax.copyProperties(options, ops);

            if(collider.type == flax.ColliderType.rect) {
                var body = Matter.Bodies.rectangle(pos.x, pos.y, collider._width * child.scale.x, collider._height * child.scale.y, ops);
            } else if(collider.type == flax.ColliderType.circle){
                var body = Matter.Bodies.circle(pos.x, pos.y, collider._width/2 * child.scale.x, ops);
            } else if(collider.type == flax.ColliderType.polygon) {
                var verts = Matter.Vertices.fromPath(collider._polygonsStr);
                var body = Matter.Bodies.fromVertices(pos.x, pos.y, verts, ops, true);
            }

            parts.push(body);

            Matter.Body.setAngle(body, child.rotation);

            child.physicsBody = body;
            body.sprite = child;
            this.bodies[child.__instanceId] = body;
        }

        var wholeBody;

        //Single body
        if(!hasChildren) {
        //if(parts.length = 1) {
            wholeBody = parts[0];
        } else {
            //composite bodies
            options.parts = parts;
            //add to the world
            wholeBody = Matter.Body.create(options);

            //init the position and offset
            var pos = sprite.position;

            sprite.pivot = wholeBody.position;
            sprite.setPosition(wholeBody.position);
        }

        Matter.World.add(world, [wholeBody]);

        return wholeBody;
    },
    removeSpriteBody: function(sprite) {
        if(!sprite) return;
        var body = this.bodies[sprite.__instanceId];
        if(body) {
            sprite.physicsBody = null;
            body.sprite = null;
            Matter.World.remove(this.world, [body]);
            delete this.bodies[sprite.__instanceId];
        }
    },
    removeBody: function(body) {
        if(!body) return;
        if(body.sprite) this.removeSpriteBody(body.sprite);
        else {
            Matter.World.remove(this.world, [body]);
        }
    },
    getSpriteBody: function(sprite) {
        return this.bodies[sprite.__instanceId];
    },
    _createRender: function() {
        var render = Matter.Render.create({
            element: document.body,
            //canvas: flax.app.view,
            engine: this.engine,
            options: {
                width: flax.stageRect.width,
                height: flax.stageRect.height,
                //showAngleIndicator: true,
                showPositions: true,
                //showCollisions: true
            }
        });

        // fit the render viewport to the scene
        Matter.Render.lookAt(render, {
            min: { x: 0, y: 0 },
            max: { x: flax.stageRect.width, y: flax.stageRect.height }
        });
        return render;
    },
    _createWalls: function() {
        var wallHeight = 100;
        Matter.World.add(this.world, [
            Matter.Bodies.rectangle(flax.stageRect.width/2 , - wallHeight/2, flax.stageRect.width, wallHeight, { isStatic: true }),//上边缘
            Matter.Bodies.rectangle(flax.stageRect.width/2, flax.stageRect.height + wallHeight/2, flax.stageRect.width, wallHeight, { isStatic: true }),//下边缘
            Matter.Bodies.rectangle(flax.stageRect.width + wallHeight/2, flax.stageRect.height/2, wallHeight, flax.stageRect.height, { isStatic: true }),//右边缘
            Matter.Bodies.rectangle(-wallHeight/2, flax.stageRect.height/2, wallHeight, flax.stageRect.height, { isStatic: true })//左边缘
        ]);
    },
    _createMouse: function() {
        var mouse = Matter.Mouse.create(this.render.canvas);
        var mouseConstraint = Matter.MouseConstraint.create(this.engine, {
                mouse: mouse,
                constraint: {
                    stiffness: 0.2,
                    render: {
                        visible: false
                    }
                }
            });

        Matter.World.add(this.world, mouseConstraint);

        // keep the mouse in sync with rendering
        this.render.mouse = mouse;
    },
    _preHandleUpdate: function() {
        var gravity = this.world.gravity;
        for(var k in this.bodies) {
            var body = this.bodies[k];
            if(body && body.sprite) {
                var sprite = body.sprite;
                if(sprite.running) {
                    //Postion offset between body and sprite
                    var bPos = body.position;
                    var bPosOffset = body.posOffset || flax.pointZero;
                    sprite.setPosition(bPos.x - bPosOffset.x, bPos.y - bPosOffset.y);

                    sprite.rotation = body.angle;

                    //try{
                    //    body.parentSprite.doRenderFrame();
                    //} catch(e) {
                    //    console.log(e);
                    //}
                } else {
                    this.removeSpriteBody(sprite);
                }
            }
        }
    }
})

/**
 * Matter Collision Events
 * */
var MatterCollisionEvents = {
    name: 'matter-collision-events',
    version: '0.1.5',
    for: 'matter-js@^0.12.0',
    install: function(matter) {
        // add the onCollide, onCollideEnd, and onCollideActive callback handlers
        // to the native Matter.Body created
        var create = matter.Body.create;
        matter.Body.create = function() {
            var body = create.apply(null, arguments);
            body.onCollide = function(cb) { body._mceOC = cb; }
            body.onCollideEnd = function(cb) { body._mceOCE = cb; }
            body.onCollideActive = function(cb) { body._mceOCA = cb; }
            return body;
        }
        matter.after('Engine.create', function() {
            matter.Events.on(this, 'collisionStart', function(event) {
                event.pairs.map(function(pair) {
                    matter.Events.trigger(pair.bodyA, 'onCollide', { pair : pair});
                    matter.Events.trigger(pair.bodyB, 'onCollide', { pair : pair});
                    pair.bodyA._mceOC &&
                    pair.bodyA._mceOC(pair, pair.bodyB)
                    pair.bodyB._mceOC &&
                    pair.bodyB._mceOC(pair, pair.bodyA)
                });
            });

            matter.Events.on(this, 'collisionActive', function(event) {
                event.pairs.map(function(pair) {
                    matter.Events.trigger(
                        pair.bodyA,
                        'onCollideActive',
                        { pair: pair }
                    );
                    matter.Events.trigger(
                        pair.bodyB,
                        'onCollideActive',
                        { pair: pair }
                    );
                    pair.bodyA._mceOCA &&
                    pair.bodyA._mceOCA(pair, pair.bodyB)
                    pair.bodyB._mceOCA &&
                    pair.bodyB._mceOCA(pair, pair.bodyA)
                });
            });

            matter.Events.on(this, 'collisionEnd', function(event) {
                event.pairs.map(function(pair) {
                    matter.Events.trigger(pair.bodyA, 'onCollideEnd', { pair : pair });
                    matter.Events.trigger(pair.bodyB, 'onCollideEnd', { pair : pair });
                    pair.bodyA._mceOCE &&
                    pair.bodyA._mceOCE(pair, pair.bodyB)
                    pair.bodyB._mceOCE &&
                    pair.bodyB._mceOCE(pair, pair.bodyA)
                });
            });
        });
    }
};

Matter.Plugin.register(MatterCollisionEvents);
Matter.use('matter-collision-events');

/**
 * Events:
 *
 * Events.on(engine, 'collisionStart', function(event) {
    var pairs = event.pairs;

    for (var i = 0, j = pairs.length; i != j; ++i) {
        var pair = pairs[i];

        if (pair.bodyA === playerFloorSensor) {
            playerBody.col = '#ddddFF';
        } else if (pair.bodyB === playerFloorSensor) {
            playerBody.col = '#ddddFF';
        }
    }
})

 Events.on(engine, 'collisionEnd', function(event) {
    var pairs = event.pairs;

    for (var i = 0, j = pairs.length; i != j; ++i) {
        var pair = pairs[i];

        if (pair.bodyA === playerFloorSensor) {
            playerBody.col = '#FFdddd';
            playerOnFloor = false;
        } else if (pair.bodyB === playerFloorSensor) {
            playerBody.col = '#FFdddd';
            playerOnFloor = false;
        }
    }
})

 Events.on(engine, 'collisionActive', function(event) {
    var pairs = event.pairs;

    for (var i = 0, j = pairs.length; i != j; ++i) {
        var pair = pairs[i];

        if (pair.bodyA === playerFloorSensor) {
            playerBody.col = '#DDFFDD';
            playerOnFloor = true;
        } else if (pair.bodyB === playerFloorSensor) {
            playerBody.col = '#DDFFDD';
            playerOnFloor = true;
        }
    }
})
 * */