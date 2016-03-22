/**
 * Created by long on 15-9-17.
 */
var flax  = flax || {};
if(!flax.Module) flax.Module = {};

flax.Module.PhysicsShape = {
    physicsBody:null,//the physics body if exist
    physicsFixture:null,//the physics fixture
    physicsContact:null,//the contact info if collision happens
    "onExit": function () {
        this.physicsBody = null;
        this.physicsFixture = null;
        this.physicsContact = null;
    },
    /**
     * Enable the physics with the params
     * @param {int} type Box2D.Dynamics.b2Body.b2_dynamicBody,b2_staticBody,b2_kinematicBody
     * */
    createPhysics:function(density, friction, restitution, isSensor, catBits, maskBits){
        if(this.physicsFixture) return this.physicsFixture;
        var body = this.physicsBody = this.owner.physicsBody;
        if(body == null) throw "Please CreatePhysics in its owner firstly!";

        var size = this.getSize();
        var centerPos = this.getCenter();
        var bodyPos = flax.getPosition(this.owner, true);

        var shape =null;
        if(this.type == flax.ColliderType.circle){
            shape = new Box2D.Collision.Shapes.b2CircleShape();
            var s = FRAMEWORK == "cocos" ? flax.getScale(this.owner, true).x : 1.0;
            shape.SetRadius(0.5*size.width*s/PTM_RATIO);
            var offsetToAnchor = flax.pSub(centerPos, bodyPos);
            shape.SetLocalPosition(flax.pMult(offsetToAnchor, 1/PTM_RATIO));
        }else if(this.type == flax.ColliderType.rect || this.type == flax.ColliderType.polygon){
            //convert the rect to polygon
            if(this.type == flax.ColliderType.rect){
                this._polygons = [flax.p(-0.5*size.width, -0.5*size.height), flax.p(0.5*size.width, - 0.5*size.height), flax.p(0.5*size.width, 0.5*size.height),flax.p(-0.5*size.width, 0.5*size.height)];
                for(var i = 0; i < this._polygons.length; i++){
                    var p = this._polygons[i];
                    p.x += this._center.x;
                    p.y += this._center.y;
                }
            }
            shape = new Box2D.Collision.Shapes.b2PolygonShape();
            var arr = [];
            for(var i = 0; i < this._polygons.length; i++){
                var p = flax.p(this._polygons[i]);
                p = this.owner.convertToWorldSpace(p);
                p.x -= bodyPos.x;
                p.y -= bodyPos.y;
                p.x /= PTM_RATIO;
                p.y /= PTM_RATIO;
                arr.push(p);
            }
            shape.SetAsArray(arr);
        }else{
            throw "The physics type: "+this.type+" is not supported!";
        }

        // Define the dynamic body fixture.
        var fixtureDef = new Box2D.Dynamics.b2FixtureDef();
        fixtureDef.shape = shape;
        if(density == null) density = 0.0;
        fixtureDef.density = density;
        if(friction == null) friction = 0.2;
        fixtureDef.friction = friction;
        if(restitution == null) restitution = 0.0;
        fixtureDef.restitution = restitution;
        fixtureDef.isSensor = isSensor;
        if(catBits == null) catBits = 0x0001;
        if(maskBits == null) maskBits = 0xFFFF;
        fixtureDef.filter.categoryBits = catBits;
        fixtureDef.filter.maskBits = maskBits;
        this.physicsFixture = body.CreateFixture(fixtureDef);
        this.physicsFixture.SetUserData(this);
        return this.physicsFixture;
    },
    destroyPhysics:function(){
        if(this.physicsFixture){
            flax.removePhysicsFixture(this.physicsFixture);
            this.physicsFixture = null;
            this.physicsBody = null;
        }
        if(this.owner){
            this.owner.release();
            this.owner = null;
        }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

flax.Module.Physics = {
    ignoreBodyRotation:false,
    _physicsBody:null,
    _physicsToBeSet:null,
    _physicsBodyParam:null,
    _physicsColliders:null,
    "onEnter":function()
    {
        if(this._physicsColliders == null) this._physicsColliders = [];
        if(this._physicsBodyParam) {
            this.createPhysics(this._physicsBodyParam.type, this._physicsBodyParam.fixedRotation, this._physicsBodyParam.bullet);
        }
        if(this._physicsToBeSet){
            for(var name in this._physicsToBeSet){
                var collider = this.getCollider(name);
                var param = this._physicsToBeSet[name];
                collider.createPhysics(param.density, param.friction, param.restitution, param.isSensor, param.catBits, param.maskBits);
                delete this._physicsToBeSet[name];
                if(this._physicsColliders.indexOf(collider) == -1) this._physicsColliders.push(collider);
            }
        }
    },
    "onExit":function()
    {
        if(this._physicsColliders) {
            //remove physics
            for(var i = 0; i < this._physicsColliders.length; i++){
                this._physicsColliders[i].destroyPhysics();
            }
        }
        this._physicsColliders = [];

        if(this._physicsBody){
            flax.removePhysicsBody(this._physicsBody);
            this._physicsBody = null;
        }
        this._physicsBodyParam = null;
        this._physicsToBeSet = null;
        this.ignoreBodyRotation = false;
    },
    physicsBody:{
        get: function()
        {
            return this._physicsBody;
        }
    },
//    getPhysicsBody:function(){
//        return this._physicsBody;
//    },
    createPhysics:function(type, fixedRotation, bullet){
        if(type == null) type = Box2D.Dynamics.b2Body.b2_dynamicBody;
        this._physicsBodyParam = {type:type, fixedRotation:fixedRotation, bullet:bullet};
        if(!this.running) return null;
        if(this._physicsBody == null) {
            var def = new Box2D.Dynamics.b2BodyDef();
            def.type = type;
            def.fixedRotation = fixedRotation;
            def.bullet = bullet;
            def.userData = this;
            var pos = flax.getPosition(this, true);
            def.position.Set(pos.x / PTM_RATIO, pos.y / PTM_RATIO);
            this._physicsBody = flax.getPhysicsWorld().CreateBody(def);
            this._physicsBody.__rotationOffset = this.rotation;
        }
        return this._physicsBody;
    },
    destroyPhysics:function(){
        this.removePhysicsShape();
    },
    addPhysicsShape:function(name, density, friction,restitution, isSensor, catBits, maskBits){
        if(this._physicsBody == null) throw "Please createPhysics firstly!";
        var collider = this.getCollider(name);
        if(collider == null) {
            flax.log("There is no collider named: "+name);
            return null;
        }else if(collider.physicsFixture){
            return collider.physicsFixture;
        }
        var param = {density:density,friction:friction,restitution:restitution,isSensor:isSensor,catBits:catBits,maskBits:maskBits};
        if(this.parent) {
            collider.setOwner(this);
            var fixture = collider.createPhysics(density, friction, restitution, isSensor, catBits, maskBits);
            if(this._physicsColliders.indexOf(collider) == -1) this._physicsColliders.push(collider);
            return fixture;
        }
        if(this._physicsToBeSet == null) this._physicsToBeSet = {};
        if(this._physicsToBeSet[name] == null) this._physicsToBeSet[name] = param;
        return null;
    },
    /**
     * Remove the physics of name, if not set name, remove all
     * */
    removePhysicsShape:function(name){
        var i = this._physicsColliders.length;
        while(i--){
            var c = this._physicsColliders[i];
            if(name == null || c.name == name){
                c.destroyPhysics();
                this._physicsColliders.splice(i, 1);
            }
        }
        if(this._physicsColliders.length == 0){
            flax.removePhysicsBody(this._physicsBody);
            this._physicsBody = null;
        }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

flax.onCollideStart = new signals.Signal();
flax.onCollideEnd = new signals.Signal();
flax.onCollidePre = new signals.Signal();
flax.onCollidePost = new signals.Signal();
flax._physicsWorld = null;
flax._physicsListener = null;
flax._physicsRunning = false;
flax._physicsBodyToRemove = null;
flax._physicsFixtureToRemove = null;
flax.physicsTypeStatic = 0;
flax.physicsTypeKinematic = 1;
flax.physicsTypeDynamic = 2;
/**
 * The position of the whole physics world
 * */
flax.physicsWorldPos = flax.p();

flax.createPhysicsWorld = function(gravity, doSleep){
    if(flax._physicsWorld) flax.destroyPhysicsWorld();
    var world = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(gravity.x, gravity.y), doSleep === true);
    world.SetContinuousPhysics(true);
    flax.physicsWorldPos = flax.p();
    flax._physicsWorld = world;
    flax._physicsBodyToRemove = [];
    flax._physicsFixtureToRemove = [];
    return world;
};
flax.getPhysicsWorld = function(){
    if(flax._physicsWorld == null) throw "Pleas use flax.createPhysicsWorld to create the world firstly!";
    return flax._physicsWorld;
};
flax.startPhysicsWorld = function(){
    var world = flax.getPhysicsWorld();
    if(world && flax.currentScene && !flax._physicsRunning){
        flax._createPhysicsListener();
        flax.currentScene.schedule(flax._updatePhysicsWorld, 1.0/flax.game.config["frameRate"]);
        flax._physicsRunning = true;
    }
};
flax.stopPhysicsWorld = function(){
    if(flax._physicsRunning && flax.currentScene) {
        flax.currentScene.unschedule(flax._updatePhysicsWorld);
        flax._physicsRunning = false;
    }
};
flax.destroyPhysicsWorld = function(){
    if(!flax._physicsWorld) return;
    flax.stopPhysicsWorld();
    for (var b = flax._physicsWorld.GetBodyList(); b; b = b.GetNext()) {
        var sprite = b.GetUserData();
        if(sprite) sprite._physicsBody = null;
        flax._physicsWorld.DestroyBody(b);
    }
    flax.onCollideStart.removeAll();
    flax.onCollideEnd.removeAll();
    flax.onCollidePre.removeAll();
    flax.onCollidePost.removeAll();

    flax._physicsWorld = null;
    flax._physicsListener = null;
    flax._physicsBodyToRemove = null;
};

flax.removePhysicsBody = function(body){
    var i = flax._physicsBodyToRemove.indexOf(body);
    if(i == -1) flax._physicsBodyToRemove.push(body);
};
flax.removePhysicsFixture = function(fixture){
    var i = flax._physicsFixtureToRemove.indexOf(fixture);
    if(i == -1) flax._physicsFixtureToRemove.push(fixture);
};
/**
 * Cast a ray from point0 to point1, callBack when there is a collid happen
 * @param {function} callBack Callback when collid, function(flax.Collider, reflectedPoint, endPoint, fraction)
 * @param {point} point0 the start point0
 * @param {point} point1 the end point1
 * @param {float} rayRadius if the ray need a size to check collision
 * */
flax.physicsRaycast = function(callBack, point0, point1, rayRadius){
    flax.getPhysicsWorld().RayCast(function(fixture, point, normal, fraction){
        var collider = fixture.GetUserData();
        point = flax.pMult(point, PTM_RATIO);

        var l0 = flax.pSub(point1, point);
        var pj = flax.pMult(normal, flax.pDot(l0, normal));
        //the new positon of the ray end point after reflected
        var endPoint = flax.pSub(point1,flax.pMult(pj, 2));
        //the angle of the reflected ray
        var reflectAngle = flax.getAngle(point, endPoint);

        //if the ray has a size, adjust the collision point
        //todo, not correct for some non-flat surface
        if(rayRadius && rayRadius > 0) {
            var inAngle = flax.getAngle(point0, point1);
            rayRadius = rayRadius/Math.sin(Math.abs(reflectAngle/2 - inAngle/2)*Math.PI/180);
            point = flax.pSub(point, flax.getPointOnCircle(flax.p(), rayRadius, inAngle));
            var dist = flax.pDistance(point0, point1);
            fraction = flax.pDistance(point0, point)/dist;
            endPoint = flax.getPointOnCircle(point, dist*(1 - fraction), reflectAngle);
        }

        //collider: the target collided by thre ray, flax.Collider
        //point: the collision point
        //endPoint: the end point after reflected
        //fraction: the distance rate from the start point to the collision point of the total ray length
        callBack(collider, point, endPoint, fraction);
    }, flax.pMult(point0, 1/PTM_RATIO), flax.pMult(point1, 1/PTM_RATIO));
};

flax.physicsSimulate = function(body, time, step){
    if(!step) step = flax.frameInterval;
    var steps = Math.round(time/step);

    var oldTrans = {pos: body.GetPosition(), rot: body.GetAngle()};
    var dTypes = {};
    var i = 0;
    for (var b = flax._physicsWorld.GetBodyList(); b; b = b.GetNext()) {
        if(b == body) continue;
        var type = b.GetType();
        if(type != flax.physicsTypeStatic){
            b.m_type = flax.physicsTypeStatic;
            b.__tempKey = ++i;
            dTypes[b.__tempKey] = type;
        }
    }

    var path = [];
    for(i = 0; i < steps; i++){
        flax._physicsWorld.Step(step, velocityIterations, positionIterations);
        var pos = body.GetPosition();
        path.push(flax.p(pos.x*PTM_RATIO, pos.y*PTM_RATIO));
    }

    for (var b = flax._physicsWorld.GetBodyList(); b; b = b.GetNext()) {
        if(b.__tempKey){
            b.SetType(dTypes[b.__tempKey]);
            delete b.__tempKey;
        }
    }
    body.SetPositionAndAngle(oldTrans.pos, oldTrans.rot);
    return path;
};
flax._createPhysicsListener = function(){
    if(flax._physicsListener) return;
    flax._physicsListener = new Box2D.Dynamics.b2ContactListener();
    flax._physicsListener.BeginContact = function (contact) {
        var fa = contact.GetFixtureA();
        var fb = contact.GetFixtureB();
        var ca = fa.GetUserData() || fa;
        var cb = fb.GetUserData() || fb;
        if(ca.owner && ca.owner.parent == null) return;
        if(cb.owner && cb.owner.parent == null) return;

        ca.physicsContact = cb.physicsContact = contact;

        //How to fetch the collision point
//        var mainfold = new Box2D.Collision.b2WorldManifold();
//        contact.GetWorldManifold(mainfold);
//        var contactPoint = flax.pMult(mainfold.m_points[0], PTM_RATIO);
//        flax.drawRect(cc.rect(contactPoint.x - 2, contactPoint.y - 2, 4, 4));
//        flax.log(mainfold.m_points.length);

        flax.onCollideStart.dispatch(ca, cb);
        ca.physicsContact = cb.physicsContact = null;
    };
    flax._physicsListener.EndContact = function (contact) {
        var fa = contact.GetFixtureA();
        var fb = contact.GetFixtureB();
        var ca = fa.GetUserData() || fa;
        var cb = fb.GetUserData() || fb;
        if(ca.owner && ca.owner.parent == null) return;
        if(cb.owner && cb.owner.parent == null) return;
        ca.physicsContact = cb.physicsContact = contact;
        flax.onCollideEnd.dispatch(ca, cb);
        ca.physicsContact = cb.physicsContact = null;
    };
    flax._physicsListener.PreSolve = function (contact, oldManifold) {
        var fa = contact.GetFixtureA();
        var fb = contact.GetFixtureB();
        var ca = fa.GetUserData() || fa;
        var cb = fb.GetUserData() || fb;
        if(ca.owner && ca.owner.parent == null) return;
        if(cb.owner && cb.owner.parent == null) return;
        ca.physicsContact = cb.physicsContact = contact;
        flax.onCollidePre.dispatch(ca, cb);
        ca.physicsContact = cb.physicsContact = null;
    };
    flax._physicsListener.PostSolve = function (contact, impulse) {
        var fa = contact.GetFixtureA();
        var fb = contact.GetFixtureB();
        var ca = fa.GetUserData() || fa;
        var cb = fb.GetUserData() || fb;
        if(ca.owner && ca.owner.parent == null) return;
        if(cb.owner && cb.owner.parent == null) return;
        ca.physicsContact = cb.physicsContact = contact;
        flax.onCollidePost.dispatch(ca, cb);
        ca.physicsContact = cb.physicsContact = null;
    };
    flax._physicsWorld.SetContactListener(flax._physicsListener);
};

/**
 * Create physical walls, up/down/left/right
 * flax.createPhysicalWalls(0, 0.8, [1,1,1,1]);
 * */
flax.createPhysicalWalls = function(walls, friction){
    if(walls == null || walls.length == 0) walls = [1,1,1,1];
    var world = flax.getPhysicsWorld();
    var fixDef = new Box2D.Dynamics.b2FixtureDef();
    fixDef.density = 1.0;
    if(friction == null)  friction = 3;
    fixDef.friction = friction;

    var bodyDef = new Box2D.Dynamics.b2BodyDef();

    var winSize = flax.visibleRect;
    //create ground
    bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
    fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
    fixDef.shape.SetAsBox(0.5*winSize.width/PTM_RATIO, 0.5);

    // upper
    if(walls[0]){
        bodyDef.position.Set(0.5*winSize.width / PTM_RATIO, winSize.height / PTM_RATIO);
        world.CreateBody(bodyDef).CreateFixture(fixDef);
    }
    // bottom
    if(walls[1]){
        bodyDef.position.Set(0.5*winSize.width / PTM_RATIO, 0);
        world.CreateBody(bodyDef).CreateFixture(fixDef);
    }
    fixDef.shape.SetAsBox(0.5, 0.5*winSize.height / PTM_RATIO);
    // left
    if(walls[2]){
        bodyDef.position.Set(0, 0.5*winSize.height / PTM_RATIO);
        world.CreateBody(bodyDef).CreateFixture(fixDef);
    }
    // right
    if(walls[3]){
        bodyDef.position.Set(winSize.width / PTM_RATIO, 0.5*winSize.height / PTM_RATIO);
        world.CreateBody(bodyDef).CreateFixture(fixDef);
    }
};
//It is recommended that a fixed time step is used with Box2D for stability
//of the simulation, however, we are using a variable time step here.
//You need to make an informed choice, the following URL is useful
//http://gafferongames.com/game-physics/fix-your-timestep/
var velocityIterations = 8;
var positionIterations = 1;
flax._updatePhysicsWorld = function(dt){
    var i = flax._physicsFixtureToRemove.length;
    while(i--){
        var fixture = flax._physicsFixtureToRemove[i];
        var body = fixture.GetBody();
        if(body) body.DestroyFixture(fixture);
        flax._physicsFixtureToRemove.splice(i, 1);
    }

    i = flax._physicsBodyToRemove.length;
    while(i--){
        flax._physicsWorld.DestroyBody(flax._physicsBodyToRemove[i]);
        flax._physicsBodyToRemove.splice(i, 1);
    }
    // Instruct the world to perform a single step of simulation. It is
    // generally best to keep the time step and iterations fixed.
    flax._physicsWorld.Step(dt, velocityIterations, positionIterations);
    //Iterate over the bodies in the physics world
    for (var b = flax._physicsWorld.GetBodyList(); b; b = b.GetNext()) {
        var sprite = b.GetUserData();
        if(sprite == null) continue;
        if (sprite != null && sprite.parent) {
            var pos = flax.p(b.GetPosition());
            pos.x *= PTM_RATIO;
            pos.y *= PTM_RATIO;
            //cal the whole physics world position
            pos = flax.pAdd(pos, flax.physicsWorldPos);
            pos = sprite.parent.convertToNodeSpace(pos);
            sprite.x = pos.x;
            sprite.y = pos.y;
            //ignore rotation
            if(sprite.ignoreBodyRotation === true) continue;
            sprite.rotation = -1 * RADIAN_TO_DEGREE*b.GetAngle();
            //fix the rotation offset
            sprite.rotation += b.__rotationOffset;
        }
    }
};
flax._debugBox2DNode = null;
/**
 * todo, bug
 * */
flax.debugDrawPhysics = function(){
    if(flax._debugBox2DNode == null){
        flax._debugBox2DNode = new flax.DebugBox2DNode(flax.getPhysicsWorld());
        flax.currentScene.addChild(flax._debugBox2DNode, Number.MAX_VALUE);
    }
};
flax.DebugBox2DNode = cc.Node.extend({
    _refWorld: null,
    ctor: function(world) {
        this._super();
        this._refWorld = world;

        var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
        var debugDraw = new b2DebugDraw();
        debugDraw.SetSprite(document.getElementById("gameCanvas").getContext("2d"));
        var scale = PTM_RATIO * flax.visibleRect.width / flax.view.getDesignResolutionSize().width;
        debugDraw.SetDrawScale(scale);
        debugDraw.SetFillAlpha(0.5);
        debugDraw.SetLineThickness(1.0);
        debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit | b2DebugDraw.e_centerOfMassBit);
        this._refWorld.SetDebugDraw(debugDraw);
    },
    draw: function(ctx) {
        this._super();
        if(this._refWorld) {
            ctx.scale(1, -1);
            //todo, bug, if you want to show the debugdraw, denote this line
//            ctx.translate(0, ctx.canvas.height);
            this._refWorld.DrawDebugData();
            ctx.scale(1, 1);
            ctx.translate(0, 0);
        }
    }
});