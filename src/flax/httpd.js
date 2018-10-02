/**
 * Created by long on 17/2/9.
 */

HTTPD_HOST = "http://127.0.0.1";
var time = new Date();
HTTPD_PORT = 10000 + parseInt(time.getMinutes() + "" + time.getSeconds());
CORDOVA_HOME = HTTPD_HOST + ":" + HTTPD_PORT;

var httpd = null;

startServer();

function startServer(reloadGame) {
    var wwwroot = "";
    httpd = (cordova && cordova.plugins && cordova.plugins.CorHttpd) ? cordova.plugins.CorHttpd : null;
    if (!httpd) {
        document.addEventListener("deviceready", function() {
            startServer();
            document.addEventListener("resume", onGameResume, false);
        }, false);
        return
    }
    httpd.getURL(function(url) {
        if (url.length > 0) {
            //服务器已启动
            document.dispatchEvent(createEvent("httpdready"));
        } else {
            httpd.startServer({
                'www_root': wwwroot,
                'port': HTTPD_PORT
            }, function(url) {
                //启动服务器后，再定向到服务器根目录，也就是游戏目录
                //window.location = url;
                if (reloadGame !== false) window.location = CORDOVA_HOME;
            }, function(error) {
                alert(error);
            });
        }
    }, function() {

    });
}

function stopServer(callback) {
    if (httpd) {
        // call this API to stop web server
        httpd.stopServer(function() {
            console.log("Stop server successfully!");
            if (callback) callback();
        }, function(error) {
            console.log(error);
            if (callback) callback(error);
        });
    } else {
        alert('CorHttpd plugin not available/ready.');
    }
}

function restartServer(reloadGame) {
    stopServer(function() {
        startServer(reloadGame);
    });
}

function createEvent(type, data) {
    var event = document.createEvent('Events');
    event.initEvent(type, false, false);
    if (data) {
        for (var i in data) {
            if (data.hasOwnProperty(i)) {
                event[i] = data[i];
            }
        }
    }
    return event;
}

/**
 * When the game back to the foreground, restart the http server to avoid sleep
 * */
function onGameResume() {
    //restartServer(false);
}