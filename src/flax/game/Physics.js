/**
 * Created by long on 18/5/18.
 */
var flax = flax || {};
flax.Physics = flax.Class.extend({
    fps: 60,
    engine: null,
    world: null,
    render: null,
    runner: null,
    running: false,
    bodies: {},
    subBodies: {},
    _updateInterval:1000/60,
    /**
     * options:
     *     bounds: {x: 0, y: 0, width: 750, height: 1136}
     *     gravity: {x: 0, y: 1},
     *     showRender: true,
     *     autoMouse: false,
     *     autoWalls: false,
     *     fps: 60  //模拟的fps，fps越大，速度越快
     * */
    ctor: function(options) {
        this._super();

        if(!options) options = {};
        if(!options.bounds) options.bounds = flax.stageRect;

        // create engine and world
        /**
         * var defaults = {
                positionIterations: 6,
                velocityIterations: 4,
                constraintIterations: 2,
                enableSleeping: false,
                events: [],
                plugin: {},
                timing: {
                    timestamp: 0,
                    timeScale: 1
                },
                broadphase: {
                    controller: Grid
                }
            };
         * */
        var engineOptions = {
            positionIterations: 6,
            velocityIterations: 4,
            constraintIterations: 2,
            enableSleeping: false,
            //timing: {
            //    timeScale: 1.5,
            //    timestamp: 0
            //}
        }

        if(options.fps > 0) {
            this.fps = options.fps;
        }
        this._updateInterval = 1000/this.fps;

        var engine = this.engine = Matter.Engine.create(engineOptions);

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
        if(options.showRender === true) {
            this.render = this._createRender();
            this.runner = Matter.Runner.create();
            //让场景半透明，可以看到物理引擎的运行状况
            flax.currentScene.alpha = 0.1;
        }

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

        Matter.Events.on(this.engine, 'beforeUpdate', this._preHandleUpdate.bind(this));

        if(!this.runner) {
            //var plat = flax.game.config.platform;
            //if(plat == "wechat" || plat == "web")
            //{
            //    requestAnimationFrame(this.update1.bind(this));
            //} else
            {
                flax.scheduler.fixedSchedule(this, this.update, 1/this.fps);
            }
        }
    },
    stop: function() {
        if(!this.running) return;
        this.running = false;
        if(this.render) Matter.Render.stop(this.render);
        //if(this.runner) Matter.Runner.stop(this.runner);

        Matter.Events.off(this.engine, 'beforeUpdate', this._preHandleUpdate.bind(this));

        if(!this.runner) flax.scheduler.unschedule(this, this.update);
    },
    _t:0,
    update: function(delta) {
        if(!this.engine) return;
        delta *= 1000;
        Matter.Engine.update(this.engine, delta);
    },
    update1: function(time) {
        var delta = 1/this.fps;
        if(this._t > 0) {
            delta = time - this._t;
        }
        this._t = time;

        if(this.engine) Matter.Engine.update(this.engine, delta);
        requestAnimationFrame(this.update1.bind(this));
    },
    destroy: function() {
        this.stop();
        if(this.engine) Matter.Engine.clear(this.engine);
        this.engine = null;
        this.render = null;
        this.runner = null;
        this.bodies = null;
        this.subBodies = null;
    },
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

        pos: initial position

        noGravity: true or false

        noRotate:  rue or false

        maxSpeed: max speed for the body

        children: {
            name0: {isSensor: true},
            name1: {noGravity: true}
        }
     * */
    addSpriteBody: function(sprite, options) {
        var world = this.world;
        if(!world) throw "There is no physics world!";
        if(this.bodies[sprite.__instanceId]) throw "There has a sprite body with id: " + sprite.__instanceId;

        if(typeof options != "object") options = {};

        var parts = [];

        var childrenOptions = options.children || {};
        delete options.children;

        if(options.noRotate === true) {
            options.inertia = Infinity;
            options.torque = 0
            delete options.noRotate;
        }

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
            var ops = {name: child.name, label: child.assetID, isChild: true};
            flax.copyProperties(options, ops);
            flax.copyProperties(childrenOptions[child.name], ops);

            if(collider.type == flax.ColliderType.rect) {
                var body = Matter.Bodies.rectangle(pos.x, pos.y, collider._width * child.scale.x, collider._height * child.scale.y, ops);
            } else if(collider.type == flax.ColliderType.circle){
                var body = Matter.Bodies.circle(pos.x, pos.y, collider._width/2 * child.scale.x, ops);
            } else if(collider.type == flax.ColliderType.polygon || collider._polygonsStr) {
                if(!collider._polygonsStr) {
                    throw "There is no polygon shape defination in child: " + child.name + "(" + child.assetID + ") of assets: " + sprite.assetID ;
                }
                var verts = Matter.Vertices.fromPath(collider._polygonsStr);
                var body = Matter.Bodies.fromVertices(pos.x, pos.y, verts, ops, false);
            }

            parts.push(body);

            //物理引擎不支持skew，所以拿到原始数据来获得其真正的rotation
            if(sprite.getFrameData) {
                var frame = sprite.getFrameData(child.name, 0);
                if(frame) {
                    Matter.Body.setAngle(body, frame.rotation);
                }
            } else {
                Matter.Body.setAngle(body, child.rotation);
            }

            child.physicsBody = body;
            body.sprite = child;
            body.owner = sprite;
            this.subBodies[child.__instanceId] = body;
        }

        var wholeBody;

        //Single body
        if(!hasChildren) {
            wholeBody = parts[0];
        } else {
            options.name = sprite.name;
            options.label = sprite.assetID;
            //composite bodies
            options.parts = parts;
            //add to the world
            wholeBody = Matter.Body.create(options);

            //init the position and offset
            var pos = sprite.position;

            sprite.pivot = wholeBody.position;
            //sprite.setPosition(wholeBody.position);
        }

        if(options.pos){
            Matter.Body.setPosition(wholeBody, options.pos);
            sprite.setPosition(options.pos);
        }

        sprite.physicsBody = wholeBody;
        wholeBody.sprite = sprite;
        wholeBody.owner = sprite;
        this.bodies[sprite.__instanceId] = wholeBody;

        Matter.World.add(world, [wholeBody]);

        return wholeBody;
    },
    removeSpriteBody: function(sprite, destroySprite) {
        if(!sprite) return;
        var id = sprite.__instanceId;
        var body = this.bodies[id] || this.subBodies[id];
        if(body) {
            sprite.physicsBody = null;
            body.sprite = null;
            body.owner = null;
            Matter.World.remove(this.world, [body]);
            delete this.bodies[id];
            delete this.subBodies[id];
        }
        if(destroySprite === true) {
            sprite.destroy();
        }
    },
    removeBody: function(body, destroySprite) {
        if(!body) return;
        if(body.sprite) this.removeSpriteBody(body.owner || body.sprite, destroySprite);
        else {
            Matter.World.remove(this.world, [body]);
        }
    },
    getSpriteBody: function(sprite) {
        if(!sprite) return null;
        return this.bodies[sprite.__instanceId] || this.subBodies[sprite.__instanceId];
    },
    _createRender: function() {
        var w = flax.stageRect.width;
        var h = flax.stageRect.height;
        //console.log(w, h, flax.director.scaleX, flax.director.scaleY)
        var render = Matter.Render.create({
            element: document.body,
            engine: this.engine,
            options: {
                width: w,
                height: h,
                showAngleIndicator: true,
                showPositions: true,
                //pixelRatio: flax.director.scaleX
                //showCollisions: true
            }
        });

        // fit the render viewport to the scene
        Matter.Render.lookAt(render, {
            min: { x: 0, y: 0 },
            max: { x: w , y: h}
        });

        //同比例缩放render
        render.canvas.style.width = w * flax.director.scaleX + "px";
        render.canvas.style.height = h * flax.director.scaleY + "px";

        return render;
    },
    _createWalls: function() {
        var wallHeight = 100;
        //在舞台上漏出一点，否则好像会有bug
        var showGap = 5;
        Matter.World.add(this.world, [
            Matter.Bodies.rectangle(flax.stageRect.width/2 , - wallHeight/2 + showGap, flax.stageRect.width, wallHeight, { isStatic: true, label: "topWall"}),//上边缘
            Matter.Bodies.rectangle(flax.stageRect.width/2, flax.stageRect.height + wallHeight/2 - showGap, flax.stageRect.width, wallHeight, { isStatic: true, label: "bottomWall"}),//下边缘
            Matter.Bodies.rectangle(flax.stageRect.width + wallHeight/2 - showGap, flax.stageRect.height/2, wallHeight, flax.stageRect.height, { isStatic: true, label: "rightWall"}),//右边缘
            Matter.Bodies.rectangle(-wallHeight/2 + showGap, flax.stageRect.height/2, wallHeight, flax.stageRect.height, { isStatic: true, label: "leftWall"})//左边缘
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
            //todo,优化!body.isStatic的情况，也许并没有必要
            if(body) {

                this._validateVelocity(body);

                if(body.sprite) {
                    var sprite = body.sprite;
                    if(sprite.running) {
                        //Postion offset between body and sprite
                        var bPos = body.position;
                        var bPosOffset = body.posOffset || flax.pointZero;
                        sprite.setPosition(bPos.x - bPosOffset.x, bPos.y - bPosOffset.y);
                        //sprite.scale = body.scale;

                        sprite.rotation = body.angle;

                        //hook
                        if(sprite.onPositionUpdateDelay) {
                            sprite.onPositionUpdateDelay(body.positionPrev);
                        }
                        if(sprite.onPositionUpdate) {
                            sprite.onPositionUpdate(bPos);
                        }

                    } else {
                        this.removeSpriteBody(sprite);
                    }
                }
            }
        }
    },
    _validateVelocity: function(body) {
        var maxSpeed = body.maxSpeed;
        var v = body.velocity;
        var speed = body.speed;

        if(!isNaN(maxSpeed) && speed > maxSpeed)
        {
            Matter.Body.setVelocity(body, flax.pMult(v, maxSpeed/speed))
        }
    }
})

/**
 * Default collision filter category
 * */
flax.Physics.DEFAULT_CATEGORY = 0x0001;

/**
 * Matter Collision Events
 * */
var MatterCollisionEvents = {
    name: 'matter-collision-events',
    version: '0.1.5',
    for: 'matter-js@^0.14.1',
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