/**
 * Created by long on 14-11-19.
 */

flax._fullUserData = null;

flax.userData = {};

flax.dataSlot = null;

flax._defaultUserData = null;
flax._tempSlot = null;

flax.fetchUserData = function(defaultValue, slot) {
    flax._defaultUserData = defaultValue;
    this._tempSlot = slot;
    flax._doGetData(flax.getUserDataID());
};

flax.saveUserData =  function(slot) {
    if(slot) flax.dataSlot = slot;
    if(!flax._fullUserData) flax._fullUserData = {};
    if(!flax.userData) flax.userData = {};
    var cId = flax.dataSlot || "default";
    flax._fullUserData[cId] = flax.userData;
    flax._fullUserData['lastSlot'] = flax.dataSlot;
    flax._doSaveData(flax.getUserDataID(), flax._fullUserData);
};

flax.getUserDataID = function() {
    return flax.game.config['gameId'];
}

flax._doSaveData = function(key, data) {
    if(typeof NativeStorage != "undefined")  NativeStorage.setItem(key, data, _setUserDataSuccess, _setUserDataErr);
    else flax.sys.localStorage.setItem(key, JSON.stringify(data));
}

flax._doGetData = function(key) {
    if(typeof NativeStorage != "undefined") {
        NativeStorage.getItem(key, _getUserDataSuccess, _getUserDataErr);
    } else {
       var data = flax.sys.localStorage.getItem(key);
        try{
            data = JSON.parse(data);
            _getUserDataSuccess(data);
        } catch (e) {
            _getUserDataErr(e);
        }
    }
}

function _getUserDataSuccess(data) {
    if(!data) data = {};
    flax._fullUserData = data;

    var defaultValue = flax._defaultUserData;
    var slot = this._tempSlot;

    if(defaultValue) flax.userData = JSON.parse(JSON.stringify(defaultValue));
    if(slot) {
        if(!defaultValue && (slot != flax.dataSlot || slot != "default")){
            flax.userData = {};
        }
        flax.dataSlot = slot;
    } else if(flax._fullUserData['lastSlot']) {
        flax.dataSlot = flax._fullUserData['lastSlot'];
    } else {
        flax.dataSlot = "default";
    }
    var data = flax._fullUserData[flax.dataSlot];
    if(data) flax.copyProperties(data, flax.userData);

    console.log("get userData ok... ");//, JSON.stringify(flax.userData))
}
function _setUserDataSuccess(data) {
    console.log("save userData ok...")
}

function _getUserDataErr(err) {
    _getUserDataSuccess(null);
    console.log("get userData error: ", err.code, err.exception)
}
function _setUserDataErr(err) {
    console.log("save userData error: ", err.code,  err.exception)
}
