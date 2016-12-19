/**
 * Created by long on 14-8-1.
 * for box2d
 */

var flax = flax || {};
if(!flax.Module) flax.Module = {};

flax.ColliderType = {
    rect: "Rect",
    circle: "Circle",
    polygon: "Poly"
};

flax.Collider = flax.Class.extend({
    name:null,
    owner:null,
    type:flax.ColliderType.rect,
    _center:null,//center point in local space
    _width:0,
    _height:0,
    _rotation:0,
    _localRect:null,
    _polygons:null,
    _originData:null,
    _clickArea:null,
    _debugNode:null,
    ctor:function(data){
        this.init(data)
    },
    init:function(data){

        this._originData = data;

        data = data.split(",");
        this.type = data[0];
        this._center = flax.p(parseFloat(data[1]), parseFloat(data[2]));
        this._width = parseFloat(data[3]);
        this._height = parseFloat(data[4]);
        this._rotation = parseFloat(data[5]);
        //polygon data
        if(data.length > 6){
            this._polygons = [];
            var arr = data[6].split("'");
            for(var i = 0; i < arr.length - 1; i += 2){
                var pos = {x:parseFloat(arr[i]), y:parseFloat(arr[i + 1])};
                this._polygons.push(pos);
            }
        }
        this._localRect = flax.rect(this._center.x - this._width/2, this._center.y - this._height/2, this._width, this._height);
    },
    destroy: function () {
        this.owner = null;
        this._polygons = null;
        this._originData = null;
        this._debugNode = null;
    },
    clone: function () {
        return new flax.Collider(this._originData)
    },
    setOwner:function(owner)
    {
        if(this.owner == owner) return;
        this.owner = owner;
        this.owner.retain();
    },
    //todo, with polygon
    checkCollision:function(collider){
        if(collider.type == this.type && this.type == flax.ColliderType.rect){
            return flax.rectIntersectsRect(this.getBounds(true), collider.getBounds(true));
        }else if(collider.type == this.type && this.type == flax.ColliderType.circle){
            var pos = this.getCenter(true);
            var pos1 = collider.getCenter(true);
            return flax.pDistance(pos, pos1) <= (this.getSize().width + collider.getSize().width)/2;
        }else if(this.type == flax.ColliderType.rect){
            return this._ifRectCollidCircle(this.getBounds(true),collider.getBounds(true));
        }else if(this.type == flax.ColliderType.circle){
            return this._ifRectCollidCircle(collider.getBounds(true), this.getBounds(true));
        }
    },
    containPoint:function(pos){
        return this.containsPoint(pos);
    },
    containsPoint:function(pos){
        if(this._clickArea) {
            return flax.rectContainsPoint(this._clickArea, pos);
        }
        pos = this.owner.convertToNodeSpace(pos);
        if(this.type == flax.ColliderType.rect){
            return flax.rectContainsPoint(this._localRect, pos);
        }else if(this.type == flax.ColliderType.polygon){
            return this._polyContainsPoint(pos);
        }
        var dis = flax.pDistance(pos, this._center);
        return dis <= this._width/2;
    },
    /**
     * Checks whether the x and y coordinates passed to this function are contained within this polygon
     * @method _polyContainsPoint
     * @param pos {x,y} The X coordinate of the point to test
     * @return {Boolean} Whether the x/y coordinates are within this polygon
     */
    _polyContainsPoint:function(pos)
    {
        var inside = false;
        // use some raycasting to test hits
        // https://github.com/substack/point-in-polygon/blob/master/index.js
        var length = this._polygons.length;

        for(var i = 0, j = length - 1; i < length; j = i++)
        {
            var pi = this._polygons[i],
                pj = this._polygons[j];
            intersect = ((pi.y > pos.y) !== (pj.y > pos.y)) && (pos.x < (pj.x - pi.x) * (pos.y - pi.y) / (pj.y - pi.y) + pi.x);
            if(intersect) inside = !inside;
        }
        return inside;
    },
    /**
     * Check if the rectangle collide with the circle
     * toto: to be verified!
     * ref: http://stackoverflow.com/questions/21089959/detecting-collision-of-rectangle-with-circle-in-html5-canvas
     * */
    _ifRectCollidCircle:function(rect, circle){
        //Find the vertical & horizontal (distX/distY) distances between the circle’s center and the rectangle’s center
        var distX = Math.abs((circle.x + circle.width/2) - (rect.x + rect.width/2));
        var distY = Math.abs((circle.y + circle.height/2) - (rect.y + rect.height/2));
        //If the distance is greater than halfCircle + halfRect, then they are too far apart to be colliding
        if (distX > (rect.width/2 + circle.width/2)) return false;
        if (distY > (rect.height/2 + circle.width/2)) return false;
        //If the distance is less than halfRect then they are definitely colliding
        if (distX <= (rect.width/2)) return true;
        if (distY <= (rect.height/2)) return true;
        //Test for collision at rect corner.
        var dx=distX-rect.width/2;
        var dy=distY-rect.height/2;
        return (dx*dx+dy*dy<=(circle.width/2*circle.width/2));
    },
    getBounds:function(coordinate){

        //if(FRAMEWORK == "cocos") {
            if(coordinate == null) coordinate = true;
            if(!coordinate) return this._localRect;

            var center = this.getCenter(coordinate);

            var size = this.getSize(coordinate);

            var rect = flax.rect(center.x - size.width/2, center.y - size.height/2, size.width, size.height);
        //} else {

        //}
        return rect;
    },
    getCenter:function(coordinate){
        var center = this.owner.convertToWorldSpace(this._center);
        if(this.owner.parent) {
            if(coordinate === false) center = this.owner.parent.convertToNodeSpace(center);
            else if(flax.isDisplay(coordinate)) center = coordinate.convertToNodeSpace(center);
        }
        return center;
    },
    /**
     * If the owner or its parent has been scaled, the calculate the real size of the collider
     * */
    getSize:function(coordinate){
        var w = this._width;
        var h = this._height;
        //In pixi or other frameworks, no need to scale the size
        if(FRAMEWORK == "cocos") {
            var s = flax.getScale(this.owner, coordinate);
            w *= Math.abs(s.x);
            h *= Math.abs(s.y);
        }
        return {width:w, height:h};
    },
    debugDraw:function(){

        if(FRAMEWORK == "pixi") {
            this._debugDraw_pixi();
        } else if(FRAMEWORK == "cocos") {
            this._debugDraw_cocos();
        }

    },
    _debugDraw_pixi: function () {

        var rect = this.getBounds(true);
        var center = rect.getCenter();

        if(this._debugNode == null) {
            this._debugNode = new flax.Graphics();
            if(flax.currentScene) flax.currentScene.addChildAt(this._debugNode, flax.currentScene.childrenCount);
        } else {
            this._debugNode.clear();
        }

        var drawNode = this._debugNode;

        drawNode.lineStyle(1, 0x00FF00, 1);
        drawNode.beginFill(0xFF0000, 0.5);

        if(this.type == flax.ColliderType.rect) {
            drawNode.drawRect(-rect.width/2, -rect.height/2, rect.width, rect.height);
            drawNode.setPosition(center.x, center.y);
        } else if(this.type == flax.ColliderType.circle) {
            drawNode.drawCircle(0, 0, rect.width/2);
            drawNode.setPosition(center.x, center.y);
        } else {
            var first = null;
            var p = null;
            for(var i = 0; i < this._polygons.length - 1; i ++) {
                p = flax.p(this._polygons[i]);
                p = this.owner.convertToWorldSpace(p);
                if(i == 0) {
                    first = flax.p(p);
                    drawNode.moveTo(p.x, p.y);
                }
                else drawNode.lineTo(p.x, p.y);
            }
            drawNode.lineTo(first.x, first.y);
        }
        drawNode.endFill();
    },
    _debugDraw_cocos: function () {

        var rect = this.getBounds(true);

        if(this._debugNode == null) {
            this._debugNode = cc.DrawNode.create();
            if(flax.currentScene) flax.currentScene.addChild(this._debugNode, flax.currentScene.childrenCount);
        } else {
            this._debugNode.clear();
        }
        var drawNode = this._debugNode;

        var lineWidth = 1;
        var lineColor = cc.color(255, 0, 0, 255);
        var fillColor = cc.color(0, 255, 0, 122);

        if(this.type == flax.ColliderType.rect){
            var dp = flax.pAdd(flax.p(rect.x, rect.y), flax.p(rect.width, rect.height));
            drawNode.drawRect(flax.p(rect.x, rect.y), dp, null, lineWidth, lineColor);
        }else{
            if(this.type == flax.ColliderType.circle){
                drawNode.drawCircle(this.getCenter(true), rect.width/2, 0, 360, false,lineWidth, lineColor, fillColor);
            }else{
                var first = null;
                var from = null;
                var to = null;
                for(var i = 0; i < this._polygons.length - 1; i ++){
                    from = flax.p(this._polygons[i]);
                    from = this.owner.convertToWorldSpace(from);
                    if(i == 0) first = flax.p(from);
                    to = flax.p(this._polygons[i + 1]);
                    to = this.owner.convertToWorldSpace(to);
                    drawNode.drawSegment(from, to, lineWidth, lineColor, fillColor)
                }
                drawNode.drawSegment(to, first, lineWidth, lineColor, fillColor)
            }
        }
    }
});

/**
 *@deprecated
 * */
flax.Collider.prototype.getRect = flax.Collider.prototype.getBounds;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

flax.Module.Collider = {
    _colliders:null,
    _mainCollider:null,
    _definedMainCollider:false,
    "onInit": function () {
        this._mainCollider = null;
        this._colliders = {};
        var cs = this.define['colliders'];
        if(cs){
            var cd = null;
            for(var k in cs){
                this._colliders[k] = [];
                var cArr = cs[k];
                var frame = -1;
                while(++frame < cArr.length){
                    if(cArr[frame] == null) {
                        this._colliders[k][frame] = null;
                        continue;
                    }
                    cd = this._colliders[k][frame] = new flax.Collider(cArr[frame]);
                    cd.name = k;
                    cd.setOwner(this);
                    if(k == "main" || k == "base") {
                        this._mainCollider = cd;
                    }
                }
            }
        }
        this._definedMainCollider = (this._mainCollider != null);
        if(!this._definedMainCollider){
            this._initMainCollider();
        }
    },
    _initMainCollider:function(){
        var w = 0;
        var h = 0;

        if(this.__isMovieClip) {
            w = this._gRect.width;
            h = this._gRect.height;
        } else {
            w = this.width;
            h = this.height;
        }
        var cx = w/2;
        var cy = h/2;
        //todo, fix in cocos as pixi
        if(FRAMEWORK == "cocos") {
            this._mainCollider = new flax.Collider("Rect," + cx + "," + cy + "," + w + "," + h + ",0");
        } else {
            cx -= this.anchor.x*w;
            cy -= this.anchor.y*h;
            this._mainCollider = new flax.Collider("Rect," + cx + "," + cy + "," + w + "," + h + ",0");
        }
        this._mainCollider.name = "main";
        this._mainCollider.setOwner(this);
    },
    "onEnter": function() {
        
    },
    "onExit": function () {
        if(this._colliders) {
            for(var k in this._colliders) {
                var cs = this._colliders[k];
                var frame = -1;
                while(++frame < cs.length){
                    var cc = cs[frame];
                    if(cc && cc.destroy) {
                        cc.destroy();
                    }
                }
            }
            this._colliders = null;
        }
        if(this._mainCollider) {
            this._mainCollider.destroy();
            this._mainCollider = null;
        }
    },
    setClickArea: function (rect) {
        if(this._mainCollider) this._mainCollider._clickArea = rect;
    },
    getClickArea: function () {
        if(this._mainCollider) return this._mainCollider._clickArea;
        return null
    },
    mainCollider:{
        get: function () {
            if(this._mainCollider) {
                //fix the zero size bug
                if((this._mainCollider._width == 0 && this.width > 0) || (this._mainCollider._height == 0 && this.height > 0)) {
                    this._initMainCollider();
                }
            }
            return this._mainCollider || flax.ZERO_RECT;
        }
    },
    center:{
        get: function() {
            return this.getCenter();
        }
    },
    getCollider:function(name){
        var c = null;
        if(this._colliders){
            var an = this._colliders[name];
            if(an != null) {
                c = an[this.currentFrame];
            }
        }
        return c;
    },
    /**
     * Use for cocos only now, in pixi will invoke pixi's getBounds
     * */
    getBounds:function(coordinate)
    {
        return this.mainCollider.getBounds(coordinate);
    },
    debugDraw:function()
    {
        this.mainCollider.debugDraw();
    },
    getCenter:function(coordinate) {
        return this.mainCollider.getCenter(coordinate);
    },
    _updateCollider:function(){
//        if(this._mainCollider == null) {
//            this._mainCollider = flax.getRect(this, true);
//        }else{
        //todo
//            this._mainCollider = flax.getRect(this, true);
//        }
//        this.collidCenter.x = this._mainCollider.x + this._mainCollider.width/2;
//        this.collidCenter.y = this._mainCollider.y + this._mainCollider.height/2;
    }
}

/**
 *@deprecated
 * */
flax.Module.Collider.getRect = flax.Module.Collider.getBounds;

flax.ifCollide = function(sprite1, sprite2)
{
    return sprite1.mainCollider.checkCollision(sprite2.mainCollider);
};