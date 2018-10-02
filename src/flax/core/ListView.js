/**
 * Created by long on 15/12/24.
 */

var flax = flax || {};

/**
 * Min distance between rows
 * */
ROW_MIN_DIST = 6;

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

        this._yDirection ? this.xDraggable = false : this.yDraggable = false;

        this.viewArray = [];
        this._totalSize = 0;
        this._columns = 1;

        this._initItems();

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
    refresh: function (dataArr, resetPos) {
        if(dataArr && dataArr instanceof Array) this.dataArray = dataArr;
        this._currentIndex = -1;
        this.onNewPosition();
        if(resetPos === true) this.scrollToIndex(0);
    },
    getViewRect: function () {

        var w = this._yDirection ? this.width : this._totalSize;
        var h = this._yDirection ? this._totalSize : this.height;

        //if(FRAMEWORK == "cocos") {
        //    var s = flax.getScale(this, true);
        //    w *= Math.abs(s.x);
        //    h *= Math.abs(s.y);
        //}

        var pos = this.getPosition();
        if(this.parent){
            pos = this.parent.convertToWorldSpace(pos);
        }

        var rect = flax.rect(pos.x - w * this._viewAnchorX, pos.y - h * this._viewAnchorY, w, h);

        return rect;
    },
    getMaxDragSpeed: function () {
        return this._itemSize || 100;
    },
    addItem: function (itemView) {
        var gap = this.gap;
        var lastPos = 0;//(FRAMEWORK == "cocos" && this._yDirection) ? this._originSize : 0;
        var lastSize = 0;
        var lastItem = this.viewArray[this.viewArray.length - 1];
        if(lastItem) {
            lastPos = this._yDirection ? lastItem.y : lastItem.x;
            lastSize = this._yDirection ? lastItem.height : lastItem.width;
        }
        if(this._itemSize == 0)  this._itemSize = lastSize;
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
        }
        this.refresh();
        return true;
    },
    scrollToTop:function(speed) {
       this.scrollToIndex(0, speed);
    },
    scrollToBottom:function(speed) {
        this.scrollToIndex(this.dataArray.length - 1, speed);
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
        var hasSpeed = speed && speed > 0;
        this._scrollSpeed = this._scrollDirect * (hasSpeed ? speed : 500);
        //tween to
        if(hasSpeed) this.schedule(this._doScroll, flax.frameInterval);
        //move to directly
        else {
            while(this._doScroll()){}
        }
    },
    _doScroll: function (delta) {
        if(delta == null) delta = flax.frameInterval;
        var deltaPos = delta*this._scrollSpeed;
        var movedOver = this._scrollDirect > 0 ? this._targetPos <= this._currentPos : this._targetPos >= this._currentPos;
        if(movedOver || !this.dragBy(this._yDirection ? 0 : deltaPos, this._yDirection ? deltaPos : 0)) {
            this.unschedule(this._doScroll);
            this.dragEnabled = true;
            return false;
        }
        return true;
    },
    onStartDrag: function () {
        if(!this._clickInited) {
            var rect = this.getCollider("mask").getBounds(true);
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

            var dataIndex = Math.floor(scrolled / itemSize);

            var toUpdateData = false;

            //auto fill the blank area
            if(this._originSize < (this._visibleSize + this._itemSize + this.gap) && !this._blankFilled) {
                this._fillItem();
                this._blankFilled = true;
                toUpdateData = true;
            }

            if(this._currentIndex != dataIndex) {
                if(this._currentIndex >= 0) {

                    var direction = flax.numberSign(newPos - this._currentPos);
                    if(this._yDirection) direction *= Y_DIRECTION;

                    this._fillItem(direction);
                }
                this._currentIndex = dataIndex;
                toUpdateData = true;
            }

            if(toUpdateData) this._updateData();
        }

        this._currentPos = newPos;
    },
    _updateData: function () {
        for(var i = 0; i < this.viewArray.length; i++) {
            var item = this.viewArray[i];
            var dataIndex = i + this._currentIndex * this._columns;
            var data = this.dataArray[dataIndex];
            if(data && item.setData) item.setData(data, i, dataIndex);
            item.visible = data != null;
        }
    },
    _initItems: function () {

        if(!this.children.length) return;

        var self = this;

        var children = this.children.concat();
        var firstItem = children[0];
        this._itemSize = this._yDirection ? firstItem.height : firstItem.width;

        var count = children.length;

        var sorted = [];
        var row = 0;
        for(var i = 0; i < count; i++) {
            var child0 = children[i];
            if(child0.__temp_row != undefined) continue;
            for(var j = i + 1; j < count; j++) {
                var child1 = children[j];
                if(child1.__temp_row != undefined) continue;
                var delta = self._yDirection ? Math.abs(child0.y - child1.y) : Math.abs(child0.x - child1.x);
                if(delta < ROW_MIN_DIST) {
                    if(child0.__temp_row == undefined) {
                        child0.__temp_row = row++;
                        sorted[child0.__temp_row] = [child0];
                    }
                    child1.__temp_row = child0.__temp_row;
                    sorted[child0.__temp_row].push(child1);
                }
            }
        }
        //multi columns
        if(sorted.length) {
            //sort columns
            flax.sortArray(sorted, function (a, b) {
                return (self._yDirection ? (Y_DIRECTION > 0 ? a[0].y > b[0].y : a[0].y < b[0].y) : (a[0].x < b[0].x));
            })

            this._columns = sorted[0].length;

            //sort rows
            for(var i = 0; i < row; i++) {
                var cArr = sorted[i];
                flax.sortArray(cArr, function (a, b) {
                    return (!self._yDirection ? (Y_DIRECTION > 0 ? a.y < b.y : a.y > b.y) : (a.x > b.x));
                });
                this.viewArray = this.viewArray.concat(cArr);
            }
            children = this.viewArray;
        } else {
            //sort single list
            flax.sortArray(children, function (a, b) {
                return (self._yDirection ? (Y_DIRECTION > 0 ? a.y > b.y : a.y < b.y) : (a.x < b.x));
            })
            this.viewArray = children;
        }


        firstItem = children[0];
        var secondItem = children[1];

        this._startPos = this._yDirection ? firstItem.x : firstItem.y;

        if(this._columns > 1) {
            this._citemSize = this._yDirection ? firstItem.width : firstItem.height;
            if(this._yDirection) this.cgap = secondItem.x - firstItem.x - this._citemSize;
            else this.cgap = Y_DIRECTION*(secondItem.y - firstItem.y) - this._citemSize;
            //cal clolumn gap
            var item = children[this._columns];
            if(this._yDirection) this.gap = Y_DIRECTION*(item.y - firstItem.y) - this._itemSize;
            else this.gap = item.x - firstItem.x - this._itemSize;

        } else {
            if(this._yDirection) this.gap = Y_DIRECTION*(secondItem.y - firstItem.y) - this._itemSize;
            else this.gap = secondItem.x - firstItem.x - this._itemSize;
        }

        this._totalSize = (this._itemSize + this.gap) * sorted.length || children.length;
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

            var posIndex = 0;

            if(direction < 0) {
                this._yDirection ? cItem.setPositionY(lastPos.y + Y_DIRECTION * s) : cItem.setPositionX(lastPos.x - s);
                this.viewArray.push(cItem);
                posIndex = i;
            } else {
                this._yDirection ? cItem.setPositionY(firstPos.y - Y_DIRECTION * s) : cItem.setPositionX(firstPos.x + s);
                this.viewArray.unshift(cItem);
                posIndex = this._columns - i - 1;
            }
            this._yDirection ? cItem.setPositionX(this._startPos + posIndex * cs) : cItem.setPositionY(this._startPos + Y_DIRECTION * posIndex * cs);
        }
    }
})

flax.addModule(flax.ListView, flax.Module.Draggable);