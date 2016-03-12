/**
 * Created by long on 15/12/24.
 */

var flax = flax || {};

flax.ListView = flax.MovieClip.extend({
    gap:null,
    cgap:null,
    margin:0,
    dataArray:null,
    viewArray:null,
    _clickInited:false,
    _columns:1,
    _yDirection:true,
    _itemSize:0,
    _citemSize:0,
    _originSize:0,
    _blankFilled:false,
    _totalSize:0,
    _visibleSize:0,
    _originPos:0,
    _startPos:0,
    _viewAnchorX:0,
    _viewAnchorY:0,
    _currentPos:0,
    _currentIndex:-1,
    _percentage:0,
    _scrollSpeed:0,
    _targetPos:0,
    _scrollDirect:0,

    onEnter: function () {

        this._super();

        this.viewArray = [];

        var self = this;

        var children = this.children.concat();

        //Sort the children from top to bottom
        children.sort(function (a, b) {
            return self._yDirection ? (Y_DIRECTION > 0 ? a.y > b.y : a.y < b.y) : (a.x < b.x);
        });

        this._totalSize = 0;

        var firstItem = null;
        this._columns = 1;

        for(var i = 0; i < this.childrenCount; i++) {
            var item = children[i];

            if(this._itemSize == 0) {
                this._itemSize = this._yDirection ? item.height : item.width;
                this._startPos = this._yDirection ? item.x : item.y;
                //if(typeof item.setData !== "function") throw "List item must implement setData function!"
            }

            if(firstItem == null) {
                firstItem = item;
            } else {
                //find the items within the same column
                var delta = this._yDirection ? Math.abs(firstItem.y - item.y) : Math.abs(firstItem.x - item.x);
                if (delta < 10) {
                    this._columns++;
                }
            }

            if(i == 1) {
                if(this._columns == 2) {
                    this._citemSize = this._yDirection ? item.width : item.height;
                    if(this._yDirection) this.cgap = item.x - firstItem.x - this._citemSize;
                    else this.cgap = Y_DIRECTION*(item.y - firstItem.y) - this._citemSize;
                } else {
                    if(this._yDirection) this.gap = Y_DIRECTION*(item.y - firstItem.y) - this._itemSize;
                    else this.gap = item.x - firstItem.x - this._itemSize;
                }
            }
            this._totalSize += (this._yDirection ? item.height : item.width) + this.gap;
            this.viewArray.push(item);
        }

        if(this._columns > 1) {
            var item = children[this._columns];
            if(this._yDirection) this.gap = Y_DIRECTION*(item.y - firstItem.y) - this._itemSize;
            else this.gap = item.x - firstItem.x - this._itemSize;
        }

        this._originSize = this._yDirection ? this.height : this.width;

        this._originPos = this._yDirection ? this.getPositionY() : this.getPositionX();
        this._currentPos = this._originPos;

        this.onNewPosition();
    },
    onExit: function () {
        this._super();
        this.dataArray = null;
        this.viewArray = null;
    },
    reset: function () {
        this._super();
        this._yDirection = true;
        this._itemSize = 0;
        this.gap = null;
        this._currentIndex = -1;
        this._currentPos = 0;
        this.margin = 0;
        this._columns = 1;
        this._citemSize = 0;
        this._visibleSize = 0;
        this._blankFilled = false;
        this._clickInited = false;
    },
    refresh: function (dataArr) {
        if(dataArr) this.dataArray = dataArr;
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
            pos = this.gap + (this._yDirection ? item.y : item.x);
        }
        this.scrollToPosition(pos, speed);
    },
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
    onStartDrag: function () {
        if(!this._clickInited) {
            var rect = this.getCollider("mask").getRect(true);
            this._visibleSize = this._yDirection ? rect.height : rect.width;
            this.setClickArea(rect);
            this._clickInited = true;
        }
    },
    onNewPosition: function (dx, dy) {

        if(!this.viewArray) return;

        var itemSize = this._itemSize + this.gap;

        if(this.dataArray) {
            this._totalSize = itemSize * Math.ceil(this.dataArray.length / this._columns);
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
            if(this._originSize < this._visibleSize + this._itemSize + this.gap && !this._blankFilled) {
                this._fillItem();
                this._blankFilled = true;
            }

            var dataIndex = Math.floor(scrolled / itemSize);

            if(this._currentIndex != dataIndex) {

                if(this._currentIndex >= 0) {

                    var direction = flax.numberSign(newPos - this._currentPos);
                    if(this._yDirection) direction *= Y_DIRECTION;

                    this._fillItem(direction);

                }
                for(var i = 0; i < this.viewArray.length; i++) {
                    var item = this.viewArray[i];
                    var data = this.dataArray[i + dataIndex * this._columns];
                    if(data && item.setData) item.setData(data, i);
                    item.visible = data != null;
                }
                this._currentIndex = dataIndex;
            }
        }

        this._currentPos = newPos;
    },
    _fillItem: function (direction) {

        var fromPool = true;
        if(direction == null) {
            direction = -1;
            fromPool = false;
        }

        var lastItem = this.viewArray[this.viewArray.length - 1];
        var firstPos = this.viewArray[0].getPosition();
        var lastPos = lastItem.getPosition();

        var s = this._itemSize + this.gap;
        var cs = this._citemSize + this.cgap;

        for(var i = 0; i < this._columns; i++) {

            var cItem = null;

            if(fromPool) cItem = direction < 0 ? this.viewArray.shift() : this.viewArray.pop();
            else cItem = flax.assetsManager.cloneDisplay(lastItem, false, true);

            if(direction < 0) {
                this._yDirection ? cItem.setPositionY(lastPos.y + Y_DIRECTION * s) : cItem.setPositionX(lastPos.x - s);
                this.viewArray.push(cItem);
            } else {
                this._yDirection ? cItem.setPositionY(firstPos.y - Y_DIRECTION *  s) : cItem.setPositionX(firstPos.x + s);
                this.viewArray.unshift(cItem);
            }
            this._yDirection ? cItem.setPositionX(this._startPos + i * cs) : cItem.setPositionY(this._startPos + Y_DIRECTION * i * cs);
        }
    }
})

flax.addModule(flax.ListView, flax.Module.Draggable);