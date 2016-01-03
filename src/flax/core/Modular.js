/**
 * Created by long on 15-9-18.
 */

var flax = flax || {};

flax.Module = flax.Module || {};

var MODULE_SPECIAL_FUNCS = ["onInit", "onEnter", "onExit", "onPosition"];

/**
 * Module template, all the functions with "on" start are the special functions,
 * don't forget the 双引号
 *
 * var SomeModule = {
 *     "onInit":function()
 *     {
 *         //invoked on constructor or new assetsFile and assetID
 *     },
 *     "onEnter":function()
 *     {
 *         //invoked on added in the stage
 *     },
 *     "onExit":function()
 *     {
 *        //invoked on remove from the stage
 *     },
 *     "prop":
 *     {
 *          get:function()
 *          {
 *              return this._someValue;
 *          },
 *          set:function(v)
 *          {
 *              this._value = v;
 *          }
 *     }
 * }
 *
 * */

/**
 * Add a function module to some class
 * The function in the class will override the same name function in the module
 * But if override === true, the function in the module will override the same name function in the class,
 * Note: if the owner is not a flax.FlaxSprite and its successor,
 * pls call flax.callModuleOnEnter(this) within onEnter and call flax.callModuleOnExit(this) within onExit
 * */
flax.addModule = function(cls, module, override, onFuncs){
    if(module == null){
        throw "Module can not be null!"
    }
    for(var k in module){
        var value = module[k];
        if(onFuncs !== false && typeof value == "function"
            && (MODULE_SPECIAL_FUNCS.indexOf(k) > - 1 || (Array.isArray(onFuncs) && onFuncs.indexOf(k) > -1))){
            var nk = "__" + k;
            var kn = nk + "Num";
            var funcs = cls.prototype;
            if(funcs[kn] === undefined) funcs[kn] = 0;
            else funcs[kn]++;
            funcs[nk + funcs[kn]] = value;
        }else if(override === true || cls.prototype[k] == undefined){
            if (value && (typeof value.get === 'function' || typeof value.set === 'function'))
            {
                if (typeof value.clone === 'function')
                {
                    cls.prototype[k] = value.clone();
                }
                else
                {
                    Object.defineProperty(cls.prototype, k, value);
                }
            }
            else
            {
                cls.prototype[k] = value;
            }
        }
    }
};
flax.callModuleFunction = function(owner, funcName, params){
    funcName = "__" + funcName;
    var num = owner[funcName + "Num"];
    if(num !== undefined){
        var i = num;
        while(i >= 0){
            owner[funcName+i](params);
            i--;
        }
    }else if(owner[funcName]){
        owner[funcName](params);
    }
};
flax.callModuleOnEnter = function(owner){
    flax.callModuleFunction(owner, "onEnter");
};
flax.callModuleOnExit = function(owner){
    flax.callModuleFunction(owner, "onExit");
};