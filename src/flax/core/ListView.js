/**
 * Created by long on 15/12/24.
 */

var flax = flax || {};

flax.ListView = flax.MovieClip.extend({
    gap:null,
    margin:0,
    dataArray:null,
    viewArray:null,
    _yDirection:true,
    _itemSize:0,
    _originSize:0,
    _totalSize:0,
    _visibleSize:0,
    _originPos:0,
    _viewAnchorX:0,
    _viewAnchorY:0,
    _currentPos:0,
    _currentIndex:-1,
    _percentage:0,

    onEnter: function () {

        this._super();

        this.viewArray = [];

        var self = this;

        var children = this.children.concat();
        children.sort(function (a, b) {
            //todo
            return self._yDirection ? (a.getPositionY() < b.getPositionY()) : (a.getPositionX() < b.getPositionX());
        });

        this._totalSize = 0;

        for(var i = 0; i < this.childrenCount; i++) {
            var item = children[i];
            if(this._itemSize == 0) {
                this._itemSize = this._yDirection ? item.height : item.width;
                //if(typeof item.setData !== "function") throw "List item must implement setData function!"
            }
            if(i > 0 && this.gap == null) {
                if(this._yDirection) this.gap = children[i - 1].getPositionY() - item.getPositionY() - this._itemSize;
                else this.gap = item.getPositionX() - children[i - 1].getPositionX() - this._itemSize;
            }
            this._totalSize += (this._yDirection ? item.height : item.width) + this.gap;
            this.viewArray.push(item);
        }

        this._originSize = this._yDirection ? this.height : this.width;

        this._originPos = this._yDirection ? this.getPositionY() : this.getPositionX();
        this._currentPos = this._originPos;

        this.onNewPosition();

        //todo
        this.scheduleOnce(function () {
            var rect = this.getCollider("mask").getRect(true);
            this._visibleSize = this._yDirection ? rect.height : rect.width;
            this.setClickArea(rect);
        }, 0.01);
    },
    onExit: function () {
        this._super();
        this.dataArray = null;
        this.viewArray = null;
        this._yDirection = true;
        this._itemSize = 0;
        this.gap = null;
        this._currentIndex = -1;
    },
    refresh: function () {
        this._currentIndex = -1;
        this.onNewPosition();
    },
    getViewRect: function () {

        var w = this._yDirection ? this.width : this._totalSize;
        var h = this._yDirection ? this._totalSize : this.height;

        if(FRAMEWORK == "cocos") {
            var s = flax.getScale(this, true);
            w *= Math.abs(s.x);
            h *= Math.abs(s.y);
        }

        var pos = this.getPosition();
        if(this.parent){
            pos = this.parent.convertToWorldSpace(pos);
        }

        var rect = flax.rect(pos.x - w * this._viewAnchorX, pos.y - h * this._viewAnchorY, w, h);

        return rect;
    },
    addItem: function (itemView) {
        var gap = this.gap;
        var lastPos = (FRAMEWORK == "cocos" && this._yDirection) ? this._originSize : 0;
        var lastSize = 0;
        var lastItem = this.viewArray[this.viewArray.length - 1];
        if(lastItem) {
            lastPos = this._yDirection ? lastItem.y : lastItem.x;
            lastSize = this._yDirection ? lastItem.height : lastItem.width;
        }
        itemView.x = this._yDirection ? this.margin : (lastPos + lastSize + gap);
        itemView.y = this._yDirection ? (lastPos + (lastSize + gap)*Y_DIRECTION) : this.margin;

        if(itemView.parent != this) itemView.removeFromParent();
        this.addChild(itemView);

        this._totalSize += (this._yDirection ? itemView.height : itemView.width) + gap;
        this.viewArray.push(itemView);

        return itemView;
    },
    removeItem: function (itemView) {
        var index = this.viewArray.indexOf(itemView);
        if(index == -1) return false;
        if(this.dataArray) {
            index += this._currentIndex;
        }
        return this.removeItemAt(index);
    },
    removeItemAt: function (index) {
        if(this.dataArray) {
            if(index < 0 || index > this.dataArray.length - 1) return false;
            this.dataArray.splice(index, 1);
            index -= this._currentIndex;
        }
        if(index < 0 || index > this.viewArray.length - 1) return false;
        var theItem = this.viewArray[index];
        if(theItem){
            this.viewArray.splice(index, 1);
            this._totalSize -= (this._yDirection ? theItem.height : theItem.width) + this.gap;
            for(var i = index; i < this.viewArray.length; i++) {
                if(this._yDirection) {
                    this.viewArray[i].y -= Y_DIRECTION*(theItem.height + this.gap);
                } else {
                    this.viewArray[i].x -= theItem.width + this.gap;
                }
            }
            theItem.destroy();
        }
        return true;
    },
    scrollToIndex: function (index, speed) {
        if(this.viewArray.length < 1) return;
        if(index  < 0) index = 0;
        var pos = (this._itemSize + this.gap)*index;
        if(!this.dataArray) {
            index = Math.min(this.viewArray.length - 1, index);
            var item = this.viewArray[index];
            pos = this._yDirection ? item.y : item.x;
            if(FRAMEWORK == "cocos" && this._yDirection) pos = pos - this._originSize;
        }
        this.scrollToPosition(pos, speed);
    },
    _scrollSpeed:0,
    _targetPos:0,
    _scrollDirect:0,
    scrollToPosition: function (pos, speed) {
        this.dragEnabled = false;
        this._targetPos = this._originPos + pos;
        this._scrollDirect = flax.numberSign(this._targetPos - this._currentPos);
        this._scrollSpeed = this._scrollDirect * ((speed && speed > 0) ? speed : 500);
        this.schedule(this._doScroll, flax.frameInterval);
    },
    _doScroll: function (delta) {
        var deltaPos = delta*this._scrollSpeed;
        var movedOver = this._scrollDirect > 0 ? this._targetPos <= this._currentPos : this._targetPos >= this._currentPos;
        if(movedOver || !this.dragBy(this._yDirection ? 0 : deltaPos, this._yDirection ? deltaPos : 0)) {
            this.unschedule(this._doScroll);
            this.dragEnabled = true;
        }
    },
    onNewPosition: function () {

        if(!this.viewArray) return;

        var itemSize = this._itemSize + this.gap;

        if(this.dataArray) {
            this._totalSize = itemSize * this.dataArray.length;
        }

        //Cal the view anchor
        var sizeChange = this._totalSize - this._originSize;

        var anchor = this.getAnchorPoint();

        this._viewAnchorX = anchor.x;
        this._viewAnchorY = anchor.y;

        if(this._yDirection) this._viewAnchorY = (this._originSize * anchor.y + sizeChange) / this._totalSize;
        else this._viewAnchorX = (this._originSize * anchor.x + sizeChange) / this._totalSize;

        var newPos = this._yDirection ? this.getPositionY() : this.getPositionX();

        if(newPos < this._originPos) newPos = this._originPos;

        var scrolled = newPos - this._originPos;

        this._percentage = scrolled / this._totalSize;

        if(this.dataArray) {

            //auto fill the blank area
            if(this._originSize < this._visibleSize + this._itemSize + this.gap) {
                this._fillTheBlank();
                this._originSize += this._itemSize + this.gap;
                this._totalSize += this._itemSize + this.gap;
            }

            var dataIndex = Math.floor(scrolled / itemSize);

            if(this._currentIndex != dataIndex) {

                if(this._currentIndex >= 0) {

                    var direction = flax.numberSign(newPos - this._currentPos);
                    if(this._yDirection) direction *= Y_DIRECTION;

                    if(direction < 0) {
                        var item = this.viewArray.shift();
                        var lastItem = this.viewArray[this.viewArray.length - 1];
                        var lastSize = (this._yDirection ? lastItem.height : lastItem.width) + this.gap;
                        this._yDirection ? item.setPositionY(lastItem.getPositionY() - lastSize) : item.setPositionX(lastItem.getPositionX() - lastSize);
                        this.viewArray.push(item);
                    } else {
                        var item = this.viewArray.pop();
                        var firstItem = this.viewArray[0];
                        var firstSize = (this._yDirection ? firstItem.height : firstItem.width) + this.gap;
                        this._yDirection ? item.setPositionY(firstItem.getPositionY() + firstSize) : item.setPositionX(firstItem.getPositionX() + firstSize);
                        this.viewArray.unshift(item);
                    }
                }
                for(var i = 0; i < this.viewArray.length; i++) {
                    var item = this.viewArray[i];
                    var data = this.dataArray[i + dataIndex];
                    if(data && item.setData) item.setData(data, i);
                    item.visible = data != null;
                }
                this._currentIndex = dataIndex;
            }
        }

        this._currentPos = newPos;
    },
    _fillTheBlank: function () {
        var item = this.viewArray[this.viewArray.length - 1];
        var itemSizeWithGap = this._itemSize + this.gap;
        var cItem = flax.assetsManager.cloneDisplay(item, false, true);
        this._yDirection ? cItem.setPositionY(item.getPositionY() - itemSizeWithGap) : cItem.setPositionX(item.getPositionX() - itemSizeWithGap);
        this.viewArray.push(cItem);
    }
})

flax.addModule(flax.ListView, flax.Module.Draggable);