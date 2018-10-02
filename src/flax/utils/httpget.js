HTTP_TIME_OUT = 720000;

//HTTP_HOST = "http://etdogs.com:4561";
//HTTP_HOST = "http://120.24.180.89:8781";
HTTP_HOST = "http://120.24.180.89:9002";

// Read a page's GET URL variables and return them as an associative array.
function getUrlVars()
{
    var vars = {}, hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars[hash[0]] = decodeURIComponent(hash[1]);
    }
    return vars;
}

var loadJsonSync = function (url) {
    var http = new XMLHttpRequest();
    http.open("GET", url, false);
    if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
        // IE-specific logic here
        http.setRequestHeader("Accept-Charset", "utf-8");
    } else {
        if (http.overrideMimeType) http.overrideMimeType("text\/plain; charset=utf-8");
    }
    http.send(null);
    if (!http.readyState === 4 || http.status !== 200) {
        return null;
    }
    return JSON.parse(http.responseText);
};

var Database = {
    cache: {},
    getData: function (name) {
        var fileName = name + ".json";
        var data = Database.cache[fileName];
        if (data != undefined) return data;
        data = loadJsonSync("data/" + fileName);
        Database.cache[fileName] = data;
        return data;
    }
};

var encodeUrlVars = function (params, useJson) {
    if (!params) return "";
    var paramsStr = "";
    for (var key in params) {
        if(params[key] == null) continue;
        if (paramsStr != "") paramsStr += "&";
        paramsStr += key + "=" + encodeURIComponent(params[key]);
    }
    return paramsStr;
}

//http请求的缓存
var httpCache = {};
//缓存有效时间，大约一个block的时钟
var cacheTime = 5 * 1000;
/**
 * responseType: text or arraybuffer
 * */
function http_get(url, callback, params, isPost, errorcallback, responseType, try_times) {
    if (url == null || url == '')
        return;

    if(!params) {
        params = {};
    }
    params.token = userData.token;

    //不从cache里拿数据
    var noCache =  params.__noCache === true;
    delete params.__noCache;

    if(url.indexOf(HTTP_HOST) == -1) url = HTTP_HOST + "/" + url;

    if (try_times == null) try_times = 3;

    var xhr = window.XMLHttpRequest ? new window.XMLHttpRequest() : new ActiveXObject("MSXML2.XMLHTTP");

    //xhr.timeout = 20000;

    if (isPost) {
        var paramsStr = JSON.stringify(params);
        var httpKey = url + "?" + paramsStr;
    } else {
        var paramsStr = encodeUrlVars(params);
        var rUrl = url;
        if (paramsStr !== "") rUrl = url + "?" + paramsStr;
        var httpKey = rUrl;
    }

    //读有效缓存，有则直接返回，否则去请求http
    var cache = httpCache[httpKey];
    if(!noCache && cache && Date.now() - cache.time <= cacheTime) {
        callback(cache.data);
        return;
    }

    if(isPost) {
        xhr.open("POST", url);
        console.log("send post: " + httpKey);
    } else {
        xhr.open("GET", rUrl);
        console.log("send get: " + httpKey);
    }

    //xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    if (responseType) {
        xhr.responseType = responseType;
    }

    var tId = setTimeout(function () {
        console.log("http error: connection time out!");
        if (errorcallback) errorcallback("time out");
    }, HTTP_TIME_OUT);

    if (!isPost || paramsStr == "") {
        xhr.send();
    } else {
        xhr.send(paramsStr);
    }

    xhr.onerror = function (e) {
        clearTimeout(tId);
        if (errorcallback) errorcallback("no network");
    }

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                var response = null;
                if (responseType == "arraybuffer") {
                    response = xhr.response;
                } else {
                    response = xhr.responseText;
                    response = response.replace(/\\/g, "");
                    try {
                        response = JSON.parse(response);
                    } catch (e) {
                        console.log(e);
                    }
                }

                clearTimeout(tId);

                if (callback) {
                    if(response.code && response.code != ServerCode.SUCCESS) {
                        if(response.code != ServerCode.MSG_NOT_SHOW) {
                            alert(getServerMsg(response.code));
                        }
                        if(errorcallback) errorcallback();
                        //token 不合法， 重新登陆
                        //if(response.code == ServerCode.INVALID_TOKEN) {
                        //    alert('操作失败!');
                        //}
                    } else {
                        if(response['data'] && response['data']['token']) {
                            userData.token = response['data']['token'];
                        }
                        httpCache[httpKey] = {data: response, time: Date.now()};
                        callback(response);
                    }
                }
            } else {
                if (--try_times) {
                    console.log("retry on response error: " + url, try_times);
                    http_get(url, callback, params, isPost, errorcallback, responseType, try_times);
                } else {
                    clearTimeout(tId);
                    var response = xhr.responseText;
                    if (errorcallback)
                        errorcallback(response);
                }
            }
        } else {
            //cc.log(xhr.status + ", " + xhr.readyState)
        }
    }
}

/**
 * 获取get参数
 * */
$.urlParam = function(name){
    try{
        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
        if (results==null){
            return null;
        }
        else{
            return decodeURI(results[1]) || 0;
        }
    } catch (e) {
        return {};
    }
}