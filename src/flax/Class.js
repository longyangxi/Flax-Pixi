/**
 * Created by long on 15/10/14.
 */
var flax = flax || {};

flax._clsInstanceId = (0|(Math.random()*998));
flax.getInstanceId = function () {
    return flax._clsInstanceId++;
}

/**
 * Add OOP class style for cls, after that, cls can use ctor as constructor function and use this._super to invoke
 * parent's function
 * */
flax.toClass = function(cls)
{
    cls.prototype.ctor = cls.prototype.constructor || function() {};
    cls.extend = function(def) {
        var classDef = function() {
            if (this.ctor && arguments[0] !== cls) {
                this.ctor.apply(this, arguments);
            }
        };

        var superClass = this.prototype;
        //todo
        //var proto = new this(cls);
        var proto = Object.create(superClass);

        var fnTest = /\b_super\b/;
        for (var name in def) {
            // Check if we're overwriting an existing function
            proto[name] = typeof def[name] == "function" &&
            typeof superClass[name] == "function" && fnTest.test(def[name]) ?
                (function(name, fn){
                    return function() {
                        var tmp = this._super;
                        // Add a new ._super() method that is the same method
                        // but on the super-class
                        this._super = superClass[name];
                        // The method only need to be bound temporarily, so we
                        // remove it when we're done executing
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;
                        return ret;
                    };
                })(name, def[name]) :
                def[name];
        }
        classDef.prototype = proto;
        //Give this new class the same static extend method
        classDef.extend = this.extend;
        return classDef;
    };
}

/**
 * Copy all the properties of params to target if it own the property
 * */
flax.copyProperties = function(params, target)
{
    if(params == null || target == null) return;
    for(var k in params){
        target[k] = params[k];
    }
};

//flax.copyProperties = function(params, target)
//{
//    if(params == null || target == null) return;
//
//    for(var k in params) {
//        if(typeof params[k] == "object") {
//            if(target[k] == null) {
//                target[k] = params[k] instanceof Array ? [] : {};
//            }
//            flax.copyProperties(params[k], target[k]);
//        }
//        else target[k] = params[k];
//    }
//};

/**
 * Common getter setter configuration function
 * @function
 * @param {Object}   proto      A class prototype or an object to config
 * @param {String}   prop       Property name
 * @param {function} getter     Getter function for the property
 * @param {function} setter     Setter function for the property
 */
flax.defineGetterSetter = function (proto, prop, getter, setter){
    var desc = { enumerable: false, configurable: true };
    getter && (desc.get = getter);
    setter && (desc.set = setter);
    Object.defineProperty(proto, prop, desc);
};

/**
 * Convert a name to a Object or a Function
 * @param {String}name class name
 * @param {String}type function or object, defaut is function
 * */
flax.nameToObject = function(name, type) {
    if(name == undefined || name == "") return null;
    type = type || "function";
    var arr = name.split(".");

    var fn = (window || this);
    for (var i = 0, len = arr.length; i < len; i++) {
        try{
            fn = fn[arr[i]];
        }catch(err){
            //console.log(name, err, window);
            break;
        }
    }
    if (typeof fn !== type) {
        //console.log(type +" not found: " + name);
        return null;
    }
    return  fn;
};

flax.Class = function () {}
flax.Class.prototype.constructor = flax.Class;
flax.toClass(flax.Class);