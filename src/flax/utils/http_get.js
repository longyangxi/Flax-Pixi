HTTP_TIME_OUT = 8000;

/**
 * responseType: text or arraybuffer
 * */
function http_get(url, callback, params, isPost, errorcallback, responseType, try_times){
    if(url == null || url == '')
        return;

    if(try_times == null) try_times = 3;

    var xhr = window.XMLHttpRequest ? new window.XMLHttpRequest() : new ActiveXObject("MSXML2.XMLHTTP");

    if(isPost){
        var paramsStr = JSON.stringify(params);
        xhr.open("POST", url);
        console.log("send post: " + url, paramsStr);
    }else{
        var paramsStr = encodeUrlVars(params);
        var rUrl = url;
        if(paramsStr !== "") rUrl = url + "?" + paramsStr;
        console.log("send get: " + rUrl);
        xhr.open("GET",rUrl);
    }

    //xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    if(responseType) {
        xhr.responseType = responseType;
    }

    var tId = setTimeout(function () {
        console.log("http error: connection time out!");
        if(errorcallback) errorcallback("time out");
    }, HTTP_TIME_OUT);

    if(!isPost || paramsStr == "") {
        xhr.send();
    } else {
        xhr.send(paramsStr);
    }

    xhr.onreadystatechange = function () {
        if(xhr.readyState == 4){
            if(xhr.status == 200){
                var response = null;
                if(responseType == "arraybuffer") {
                    response = xhr.response;
                } else {
                    response = xhr.responseText;
                    response = response.replace(/\\/g,"");
                    try{
                        response = JSON.parse(response);
                    } catch (e) {

                    }
                }

                if(callback){
                    callback(response);
                }
            }else{
                if(--try_times){
                    console.log("retry on response error: " + url, try_times);
                    http_get(url, callback, params, isPost, errorcallback, responseType, try_times);
                }else{
                    var response = xhr.responseText;
                    if(errorcallback)
                        errorcallback(response);
                }
            }
        }else{
            //cc.log(xhr.status + ", " + xhr.readyState)
        }
        clearTimeout(tId);
    }
}

function encodeUrlVars(params, useJson) {
    if(!params) return "";
    var paramsStr = "";
    for(var key in params){
        if(paramsStr != "") paramsStr += "&";
        paramsStr += key + "=" + encodeURIComponent(params[key]);
    }
    return paramsStr;
}

/**
 * 获取get参数
 * */
function urlParams(name){
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