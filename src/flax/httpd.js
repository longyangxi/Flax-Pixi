/**
 * Created by long on 17/2/9.
 */

HTTPD_HOST = "http://127.0.0.1"
HTTPD_PORT = 8080;
CORDOVA_HOME = HTTPD_HOST + ":" + HTTPD_PORT;

var httpd = null;

startServer();

function startServer() {
    var wwwroot = "";
    httpd = ( cordova && cordova.plugins && cordova.plugins.CorHttpd ) ? cordova.plugins.CorHttpd : null;
    if(!httpd) {
        document.addEventListener("deviceready", startServer, false);
    }
    httpd.getURL(function (url) {
        if (url.length > 0) {
            //服务器已启动
            document.dispatchEvent(createEvent("httpdready"));
        } else {
            httpd.startServer({
                'www_root': wwwroot,
                'port': HTTPD_PORT
            }, function (url) {
                //启动服务器后，再定向到服务器根目录，也就是游戏目录
                //window.location = url;
                window.location = CORDOVA_HOME;
            }, function (error) {
                alert(error);
            });
        }
    }, function () {

    });
}

function stopServer() {
    if ( httpd ) {
        // call this API to stop web server
        httpd.stopServer(function(){
            console.log("Stop server successfully!");
        },function( error ){
            console.log(error);
        });
    } else {
        alert('CorHttpd plugin not available/ready.');
    }
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
