/**
 * Created by long on 14-8-19.
 */

flax.__drawNode = null;

flax.createDrawNode = function(parent, zIndex){

    if(flax.__drawNode && flax.__drawNode.parent && !parent) return;

    if(flax.__drawNode == null) {
        flax.__drawNode = new flax.Graphics();
    }
    if(flax.currentScene) {
        if(!parent) parent = flax.currentScene;
        if(flax.__drawNode.parent && flax.__drawNode.parent != parent){
            flax.__drawNode.parent.removeChild(flax.__drawNode);
            flax.__drawNode.clear();
        }
        if(flax.__drawNode.parent == null) parent.addChild(flax.__drawNode);
        flax.__drawNode.zIndex = zIndex || parent.childrenCount - 1;
    }
};

flax.clearDraw = function(destroy)
{
    if(flax.__drawNode == null) return;
    flax.__drawNode.clear();
    if(destroy === true) {
        if(flax.__drawNode.parent) flax.__drawNode.parent.removeChild(flax.__drawNode);
        flax.__drawNode = null;
    }
};

flax.drawLine = function(from, to, lineWidth, lineColor)
{
    flax.createDrawNode();
    var drawNode = flax.__drawNode;
    drawNode.lineStyle(lineWidth || 1, lineColor || 0xFF0000);
    drawNode.moveTo(from.x, from.y);
    drawNode.lineTo(to.x, to.y);
};
flax.drawRay = function(from, rotation, length, lineWidth, lineColor)
{
    flax.drawLine(from, flax.getPointOnCircle(from, length, rotation), lineWidth, lineColor);
};
flax.drawRect = function(rect, lineWidth, lineColor, fillColor)
{
    flax.createDrawNode();
    var drawNode = flax.__drawNode;
    drawNode.lineStyle(lineWidth || 1, lineColor || 0xFF0000);
    drawNode.beginFill(fillColor || 0xFF0000, 0.3);
    drawNode.drawRect(rect.x, rect.y, rect.width, rect.height);
    drawNode.endFill();
};
flax.drawStageRect = function()
{
    var w = h = 2;
    flax.drawRect(flax.rect(flax.stageRect.x + w, flax.stageRect.y + h, flax.stageRect.width - 2*w, flax.stageRect.height - 2*h));
}
flax.drawCircle = function(center, radius, lineWidth, lineColor)
{
    flax.createDrawNode();
    var drawNode = flax.__drawNode;
    drawNode.lineStyle(lineWidth || 1, lineColor || 0xFF0000);
    //drawNode.beginFill(fillColor || 0xFF0000);
    drawNode.drawCircle(center.x, center.y, radius);
    drawNode.endFill();
};
flax.drawDot = function(center, radius, color)
{
    flax.createDrawNode();
    var drawNode = flax.__drawNode;
    drawNode.beginFill(color || 0xFF0000, 0.5);
    drawNode.drawCircle(center.x, center.y, radius || 5);
    drawNode.endFill();
};