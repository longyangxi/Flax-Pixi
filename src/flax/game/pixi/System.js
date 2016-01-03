/**
 * Created by long on 15-8-14.
 */

var flax = flax || {};

/**
 * System variables
 * @namespace
 * @name flax.sys
 */
flax.sys = {};

var sys = flax.sys;

/**
 * English language code
 * @memberof flax.sys
 * @name LANGUAGE_ENGLISH
 * @constant
 * @type {Number}
 */
sys.LANGUAGE_ENGLISH = "en";

/**
 * Chinese language code
 * @memberof flax.sys
 * @name LANGUAGE_CHINESE
 * @constant
 * @type {Number}
 */
sys.LANGUAGE_CHINESE = "zh";

/**
 * French language code
 * @memberof flax.sys
 * @name LANGUAGE_FRENCH
 * @constant
 * @type {Number}
 */
sys.LANGUAGE_FRENCH = "fr";

/**
 * Italian language code
 * @memberof flax.sys
 * @name LANGUAGE_ITALIAN
 * @constant
 * @type {Number}
 */
sys.LANGUAGE_ITALIAN = "it";

/**
 * German language code
 * @memberof flax.sys
 * @name LANGUAGE_GERMAN
 * @constant
 * @type {Number}
 */
sys.LANGUAGE_GERMAN = "de";

/**
 * Spanish language code
 * @memberof flax.sys
 * @name LANGUAGE_SPANISH
 * @constant
 * @type {Number}
 */
sys.LANGUAGE_SPANISH = "es";

/**
 * Spanish language code
 * @memberof flax.sys
 * @name LANGUAGE_DUTCH
 * @constant
 * @type {Number}
 */
sys.LANGUAGE_DUTCH = "du";

/**
 * Russian language code
 * @memberof flax.sys
 * @name LANGUAGE_RUSSIAN
 * @constant
 * @type {Number}
 */
sys.LANGUAGE_RUSSIAN = "ru";

/**
 * Korean language code
 * @memberof flax.sys
 * @name LANGUAGE_KOREAN
 * @constant
 * @type {Number}
 */
sys.LANGUAGE_KOREAN = "ko";

/**
 * Japanese language code
 * @memberof flax.sys
 * @name LANGUAGE_JAPANESE
 * @constant
 * @type {Number}
 */
sys.LANGUAGE_JAPANESE = "ja";

/**
 * Hungarian language code
 * @memberof flax.sys
 * @name LANGUAGE_HUNGARIAN
 * @constant
 * @type {Number}
 */
sys.LANGUAGE_HUNGARIAN = "hu";

/**
 * Portuguese language code
 * @memberof flax.sys
 * @name LANGUAGE_PORTUGUESE
 * @constant
 * @type {Number}
 */
sys.LANGUAGE_PORTUGUESE = "pt";

/**
 * Arabic language code
 * @memberof flax.sys
 * @name LANGUAGE_ARABIC
 * @constant
 * @type {Number}
 */
sys.LANGUAGE_ARABIC = "ar";

/**
 * Norwegian language code
 * @memberof flax.sys
 * @name LANGUAGE_NORWEGIAN
 * @constant
 * @type {Number}
 */
sys.LANGUAGE_NORWEGIAN = "no";

/**
 * Polish language code
 * @memberof flax.sys
 * @name LANGUAGE_POLISH
 * @constant
 * @type {Number}
 */
sys.LANGUAGE_POLISH = "pl";

/**
 * @memberof flax.sys
 * @name OS_IOS
 * @constant
 * @type {string}
 */
sys.OS_IOS = "iOS";
/**
 * @memberof flax.sys
 * @name OS_ANDROID
 * @constant
 * @type {string}
 */
sys.OS_ANDROID = "Android";
/**
 * @memberof flax.sys
 * @name OS_WINDOWS
 * @constant
 * @type {string}
 */
sys.OS_WINDOWS = "Windows";
/**
 * @memberof flax.sys
 * @name OS_MARMALADE
 * @constant
 * @type {string}
 */
sys.OS_MARMALADE = "Marmalade";
/**
 * @memberof flax.sys
 * @name OS_LINUX
 * @constant
 * @type {string}
 */
sys.OS_LINUX = "Linux";
/**
 * @memberof flax.sys
 * @name OS_BADA
 * @constant
 * @type {string}
 */
sys.OS_BADA = "Bada";
/**
 * @memberof flax.sys
 * @name OS_BLACKBERRY
 * @constant
 * @type {string}
 */
sys.OS_BLACKBERRY = "Blackberry";
/**
 * @memberof flax.sys
 * @name OS_OSX
 * @constant
 * @type {string}
 */
sys.OS_OSX = "OS X";
/**
 * @memberof flax.sys
 * @name OS_WP8
 * @constant
 * @type {string}
 */
sys.OS_WP8 = "WP8";
/**
 * @memberof flax.sys
 * @name OS_WINRT
 * @constant
 * @type {string}
 */
sys.OS_WINRT = "WINRT";
/**
 * @memberof flax.sys
 * @name OS_UNKNOWN
 * @constant
 * @type {string}
 */
sys.OS_UNKNOWN = "Unknown";

/**
 * @memberof flax.sys
 * @name UNKNOWN
 * @constant
 * @default
 * @type {Number}
 */
sys.UNKNOWN = -1;
/**
 * @memberof flax.sys
 * @name WIN32
 * @constant
 * @default
 * @type {Number}
 */
sys.WIN32 = 0;
/**
 * @memberof flax.sys
 * @name LINUX
 * @constant
 * @default
 * @type {Number}
 */
sys.LINUX = 1;
/**
 * @memberof flax.sys
 * @name MACOS
 * @constant
 * @default
 * @type {Number}
 */
sys.MACOS = 2;
/**
 * @memberof flax.sys
 * @name ANDROID
 * @constant
 * @default
 * @type {Number}
 */
sys.ANDROID = 3;
/**
 * @memberof flax.sys
 * @name IOS
 * @constant
 * @default
 * @type {Number}
 */
sys.IPHONE = 4;
/**
 * @memberof flax.sys
 * @name IOS
 * @constant
 * @default
 * @type {Number}
 */
sys.IPAD = 5;
/**
 * @memberof flax.sys
 * @name BLACKBERRY
 * @constant
 * @default
 * @type {Number}
 */
sys.BLACKBERRY = 6;
/**
 * @memberof flax.sys
 * @name NACL
 * @constant
 * @default
 * @type {Number}
 */
sys.NACL = 7;
/**
 * @memberof flax.sys
 * @name EMSCRIPTEN
 * @constant
 * @default
 * @type {Number}
 */
sys.EMSCRIPTEN = 8;
/**
 * @memberof flax.sys
 * @name TIZEN
 * @constant
 * @default
 * @type {Number}
 */
sys.TIZEN = 9;
/**
 * @memberof flax.sys
 * @name WINRT
 * @constant
 * @default
 * @type {Number}
 */
sys.WINRT = 10;
/**
 * @memberof flax.sys
 * @name WP8
 * @constant
 * @default
 * @type {Number}
 */
sys.WP8 = 11;
/**
 * @memberof flax.sys
 * @name MOBILE_BROWSER
 * @constant
 * @default
 * @type {Number}
 */
sys.MOBILE_BROWSER = 100;
/**
 * @memberof flax.sys
 * @name DESKTOP_BROWSER
 * @constant
 * @default
 * @type {Number}
 */
sys.DESKTOP_BROWSER = 101;

sys.BROWSER_TYPE_WECHAT = "wechat";
sys.BROWSER_TYPE_ANDROID = "androidbrowser";
sys.BROWSER_TYPE_IE = "ie";
sys.BROWSER_TYPE_QQ = "qqbrowser";
sys.BROWSER_TYPE_MOBILE_QQ = "mqqbrowser";
sys.BROWSER_TYPE_UC = "ucbrowser";
sys.BROWSER_TYPE_360 = "360browser";
sys.BROWSER_TYPE_BAIDU_APP = "baiduboxapp";
sys.BROWSER_TYPE_BAIDU = "baidubrowser";
sys.BROWSER_TYPE_MAXTHON = "maxthon";
sys.BROWSER_TYPE_OPERA = "opera";
sys.BROWSER_TYPE_OUPENG = "oupeng";
sys.BROWSER_TYPE_MIUI = "miuibrowser";
sys.BROWSER_TYPE_FIREFOX = "firefox";
sys.BROWSER_TYPE_SAFARI = "safari";
sys.BROWSER_TYPE_CHROME = "chrome";
sys.BROWSER_TYPE_LIEBAO = "liebao";
sys.BROWSER_TYPE_QZONE = "qzone";
sys.BROWSER_TYPE_SOUGOU = "sogou";
sys.BROWSER_TYPE_UNKNOWN = "unknown";

/**
 * Is native ?
 * @memberof flax.sys
 * @name isNative
 * @type {Boolean}
 */
sys.isNative = false;

var win = window, nav = win.navigator, doc = document, docEle = doc.documentElement;
var ua = nav.userAgent.toLowerCase();

/**
 * Indicate whether system is mobile system
 * @memberof flax.sys
 * @name isMobile
 * @type {Boolean}
 */
sys.isMobile = ua.indexOf('mobile') !== -1 || ua.indexOf('android') !== -1;

/**
 * Indicate the running platform
 * @memberof flax.sys
 * @name platform
 * @type {Number}
 */
sys.platform = sys.isMobile ? sys.MOBILE_BROWSER : sys.DESKTOP_BROWSER;

var currLanguage = nav.language;
currLanguage = currLanguage ? currLanguage : nav.browserLanguage;
currLanguage = currLanguage ? currLanguage.split("-")[0] : sys.LANGUAGE_ENGLISH;

/**
 * Indicate the current language of the running system
 * @memberof flax.sys
 * @name language
 * @type {String}
 */
sys.language = currLanguage;

var browserType = sys.BROWSER_TYPE_UNKNOWN;
var browserTypes = ua.match(/sogou|qzone|liebao|micromessenger|qqbrowser|ucbrowser|360 aphone|360browser|baiduboxapp|baidubrowser|maxthon|trident|oupeng|opera|miuibrowser|firefox/i)
    || ua.match(/chrome|safari/i);
if (browserTypes && browserTypes.length > 0) {
    browserType = browserTypes[0];
    if (browserType === 'micromessenger') {
        browserType = sys.BROWSER_TYPE_WECHAT;
    } else if (browserType === "safari" && (ua.match(/android.*applewebkit/)))
        browserType = sys.BROWSER_TYPE_ANDROID;
    else if (browserType === "trident") browserType = sys.BROWSER_TYPE_IE;
    else if (browserType === "360 aphone") browserType = sys.BROWSER_TYPE_360;
}else if(ua.indexOf("iphone") && ua.indexOf("mobile")){
    browserType = "safari";
}
/**
 * Indicate the running browser type
 * @memberof flax.sys
 * @name browserType
 * @type {String}
 */
sys.browserType = browserType;

// Get the os of system
var iOS = ( ua.match(/(iPad|iPhone|iPod)/i) ? true : false );
var isAndroid = ua.match(/android/i) || nav.platform.match(/android/i) ? true : false;
var osName = sys.OS_UNKNOWN;
if (nav.appVersion.indexOf("Win") !== -1) osName = sys.OS_WINDOWS;
else if (iOS) osName = sys.OS_IOS;
else if (nav.appVersion.indexOf("Mac") !== -1) osName = sys.OS_OSX;
else if (nav.appVersion.indexOf("X11") !== -1 && nav.appVersion.indexOf("Linux") === -1) osName = sys.OS_UNIX;
else if (isAndroid) osName = sys.OS_ANDROID;
else if (nav.appVersion.indexOf("Linux") !== -1) osName = sys.OS_LINUX;

/**
 * Indicate the running os name
 * @memberof flax.sys
 * @name os
 * @type {String}
 */
sys.os = osName;

var multipleAudioWhiteList = [
    sys.BROWSER_TYPE_BAIDU, sys.BROWSER_TYPE_OPERA, sys.BROWSER_TYPE_FIREFOX, sys.BROWSER_TYPE_CHROME, sys.BROWSER_TYPE_BAIDU_APP,
    sys.BROWSER_TYPE_SAFARI, sys.BROWSER_TYPE_UC, sys.BROWSER_TYPE_QQ, sys.BROWSER_TYPE_MOBILE_QQ, sys.BROWSER_TYPE_IE
];

sys._supportMultipleAudio = multipleAudioWhiteList.indexOf(sys.browserType) > -1;

// check if browser supports Web Audio
// check Web Audio's context
try {
    sys._supportWebAudio = !!(win.AudioContext || win.webkitAudioContext || win.mozAudioContext);
} catch (e) {
    sys._supportWebAudio = false;
}

/**
 * flax.sys.localStorage is a local storage component.
 * @memberof flax.sys
 * @name localStorage
 * @type {Object}
 */
try {
    var localStorage = sys.localStorage = win.localStorage;
    localStorage.setItem("storage", "");
    localStorage.removeItem("storage");
    localStorage = null;
} catch (e) {
    var warn = function () {
        flax.warn("Warning: localStorage isn't enabled. Please confirm browser cookie or privacy option");
    }
    sys.localStorage = {
        getItem : warn,
        setItem : warn,
        removeItem : warn,
        clear : warn
    };
}

/**
 * Dump system informations
 * @memberof flax.sys
 * @name dump
 * @function
 */
sys.dump = function () {
    var self = this;
    var str = "";
    str += "isMobile : " + self.isMobile + "\r\n";
    str += "language : " + self.language + "\r\n";
    str += "browserType : " + self.browserType + "\r\n";
    str += "os : " + self.os + "\r\n";
    str += "platform : " + self.platform + "\r\n";
    console.log(str);
}

/**
 * Open a url in browser
 * @memberof flax.sys
 * @name openURL
 * @param {String} url
 */
sys.openURL = function(url){
    window.open(url);
}