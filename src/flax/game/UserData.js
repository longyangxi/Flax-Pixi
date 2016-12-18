/**
 * Created by long on 14-11-19.
 */

flax.cookieData = null;

flax.userData = {
//    gold:100,
//    levelStars:[],
//    powerups:[0,0,0,0]
};

flax.cookieID = null;

flax.fetchUserData = function(defaultValue, cookieID) {
    try{
        flax.cookieData = flax.sys.localStorage.getItem(flax.game.config['gameId']);
        if(!flax.cookieData) flax.cookieData = {};
        flax.cookieData = JSON.parse(flax.cookieData);
    }catch(e){
        cc.log("Fetch UserData Error: "+ e.name);
    }
    if(defaultValue) flax.userData = defaultValue;
    if(cookieID && !defaultValue && (cookieID != flax.cookieID || cookieID != "default")) flax.userData = {};
    if(cookieID) flax.cookieID = cookieID;
    else if(flax.cookieData['lastUser']) flax.cookieID = flax.cookieData['lastUser'];
    var cId = flax.cookieID || "default";
    var data = flax.cookieData[cId];
    if(data) flax.copyProperties(data, flax.userData);
    else flax.saveUserData();
    return flax.userData;
};

flax.saveUserData =  function(cookieID) {
    if(cookieID) flax.cookieID = cookieID;
    if(!flax.cookieData) flax.cookieData = {};
    if(!flax.userData) flax.userData = {};
    try{
        var cId = flax.cookieID || "default";
        flax.cookieData[cId] = flax.userData;
        flax.cookieData['lastUser'] = flax.cookieID;
        flax.sys.localStorage.setItem(flax.game.config['gameId'], JSON.stringify(flax.cookieData));
    }catch (e){
        cc.log("Save UserData Error: "+ e.name);
    }
};