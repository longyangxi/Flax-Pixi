/**
 * Created by long on 14-11-19.
 */
flax.userData = {
//    gold:100,
//    levelStars:[],
//    powerups:[0,0,0,0]
};

flax.fetchUserData = function(defaultValue) {
    if(defaultValue) flax.userData = defaultValue;
    var data = null;
    try{
        data = flax.sys.localStorage.getItem(flax.game.config["gameId"]);
        if(data) data = JSON.parse(data);
    }catch(e){
        flax.log("Fetch UserData Error: "+ e.name);
    }
    if(data) flax.copyProperties(data, flax.userData);
//    else if(defaultValue) flax.userData = defaultValue;
    if(!flax.userData) flax.userData = {};
};

flax.saveUserData =  function() {
    if(!flax.userData) flax.userData = {};
    try{
        flax.sys.localStorage.setItem(flax.game.config["gameId"], JSON.stringify(flax.userData));
    }catch (e){
        flax.log("Save UserData Error: "+ e.name);
    }
};