var flax = flax || {};

var polygon_half_width_to_radius = [1, 1, 1, 1.1320593513522075, 1.375313813423834, 1.030845317880654, 1.128635810811684, 1.0056047679142686, 0.9818576365156653];
var polygon_half_height_to_radius = [1, 1, 1, 1.3071895424836597, 1.375313813423834, 1.0838949107843963, 0.982974384239583, 1.0314657682369481, 0.9818576365156653];

/**
 * Get polygons points to draw
 * @param Number radius the radius of the polygon
 * @param Number sideCount the side count of the polygon
 * @param Boolean star if draw a start polygon
 * */
flax.getPolygonPoints = function(radius, sideCount, star) {

    var TWO_PI = Math.PI * 2;

    var offsetAngle = Math.PI / 2;
    if(sideCount == 2) offsetAngle = 0;
    else if(sideCount == 4) offsetAngle = Math.PI/4;

    var angle = TWO_PI / sideCount;

    var points = [];
    for (var a = 0; a < TWO_PI; a += angle) {
        var sx =  Math.cos(a - offsetAngle) * radius;
        var sy = Math.sin(a - offsetAngle) * radius;
        var p = flax.p(sx, sy);
        points.push(p);

        if(star === true) {
            sx = Math.cos(a - offsetAngle + angle/2) * radius * 0.5;
            sy = Math.sin(a - offsetAngle + angle/2) * radius * 0.5;
            p = flax.p(sx, sy);
            points.push(p);
        }
    }
    points.push(points[0]);

    return points;
}

flax.findPolygonBounds = function(points) {
    var bounds = {
        minX: Number.MAX_VALUE,
        minY: Number.MAX_VALUE,
        maxX: Number.MIN_VALUE,
        maxY: Number.MIN_VALUE,
        centerX: 0,
        centerY: 0
    }

    for(var i= 0; i < points.length; i++) {
        var p = points[i];
        if(p.x < bounds.minX) bounds.minX = p.x;
        if(p.x > bounds.maxX) bounds.maxX = p.x;
        if(p.y < bounds.minY) bounds.minY = p.y;
        if(p.y > bounds.maxY) bounds.maxY = p.y;
    }

    bounds.centerX = (bounds.minX + bounds.maxX)/2;
    bounds.centerY = (bounds.minY + bounds.maxY)/2;

    return bounds;
}

flax.drawPolygon = function(radius, polyNum, x, y, star, parent, lineWeight, graphic) {
    var points = flax.getPolygonPoints(radius, polyNum, star);
    var g = graphic || new flax.Graphics();
    g.lineStyle(lineWeight || 2, 0xFFFFFF);
    var p = points[0]
    g.moveTo(p.x, p.y);
    for(var i = 1; i < points.length; i++) {
        p = points[i];
        g.lineTo(p.x, p.y);
    }
    g.endFill();
    g.setPosition(x, y);

    if(parent) parent.addChild(g);

    //console.log(g.width/2, polygon_half_width_to_radius[polyNum]*g.width/2)
    //console.log(g.height/2, polygon_half_height_to_radius[polyNum]*(g.height/2))

    return g;
}