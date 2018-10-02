/**
 * Created by long on 15-9-18.
 */

var flax = flax || {};

flax.paddingString = function(str, maxChars, paddingChar, behand) {
    str = str + '';
    if(str.length >= maxChars) return str;
    if(!paddingChar) paddingChar = "0";
    for(var i = str.length; i < maxChars; i++) {
        if(!behand) str = paddingChar + str;
        else str = str + paddingChar;
    }
    return str;
}

/**
 * Convert to utf-8 string to unicode string, especially for Chinese chars from server or JSB
 * */
flax.utf8ToUnicode = function(strUtf8) {
    if(!strUtf8){
        return;
    }

    var bstr = "";
    var nTotalChars = strUtf8.length; // total chars to be processed.
    var nOffset = 0; // processing point on strUtf8
    var nRemainingBytes = nTotalChars; // how many bytes left to be converted
    var nOutputPosition = 0;
    var iCode, iCode1, iCode2; // the value of the unicode.
    while (nOffset < nTotalChars) {
        iCode = strUtf8.charCodeAt(nOffset);
        if ((iCode & 0x80) == 0) // 1 byte.
        {
            if (nRemainingBytes < 1) // not enough data
                break;
            bstr += String.fromCharCode(iCode & 0x7F);
            nOffset++;
            nRemainingBytes -= 1;
        }
        else if ((iCode & 0xE0) == 0xC0) // 2 bytes
        {
            iCode1 = strUtf8.charCodeAt(nOffset + 1);
            if (nRemainingBytes < 2 || // not enough data
                (iCode1 & 0xC0) != 0x80) // invalid pattern
            {
                break;
            }
            bstr += String
                .fromCharCode(((iCode & 0x3F) << 6) | (iCode1 & 0x3F));
            nOffset += 2;
            nRemainingBytes -= 2;
        } else if ((iCode & 0xF0) == 0xE0) // 3 bytes
        {
            iCode1 = strUtf8.charCodeAt(nOffset + 1);
            iCode2 = strUtf8.charCodeAt(nOffset + 2);
            if (nRemainingBytes < 3 || // not enough data
                (iCode1 & 0xC0) != 0x80 || // invalid pattern
                (iCode2 & 0xC0) != 0x80) {
                break;
            }
            bstr += String.fromCharCode(((iCode & 0x0F) << 12)
                | ((iCode1 & 0x3F) << 6) | (iCode2 & 0x3F));
            nOffset += 3;
            nRemainingBytes -= 3;
        } else
        // 4 or more bytes -- unsupported
            break;
    }
    if (nRemainingBytes != 0) { // bad UTF8 string.
        return "";
    }
    return bstr;
}
/*
*If char at i is chinese char
*/
String.prototype.isCHS = function(i){
    if (this.charCodeAt(i) > 255 || this.charCodeAt(i) < 0)
        return true;
    else
        return false;
}

/**
* Check if str contains Chinese link char
*/
flax.containChineseChar = function( str ) {
    var pattern=/[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi;
// [\u4E00-\u9FA5]表示汉字，[\uFE30-\uFFA0]表示全角
    return pattern.exec(str);
}

MINUTE_SECONDS = 60;
HOUR_SECONDS = MINUTE_SECONDS * 60;
DAY_SECONDS = HOUR_SECONDS * 24;
MONTH_SENCONDS = DAY_SECONDS * 30;
YEAR_SECONDS = MONTH_SENCONDS * 12;

flax.formatTime = function(seconds, levels, lang) {

    if(seconds <= 0) return "00:00:00";

    if(!levels) levels = 2;

    var y = Math.floor(seconds / YEAR_SECONDS);
    seconds -= y * YEAR_SECONDS;

    var m0 = Math.floor(seconds / MONTH_SENCONDS);
    seconds -= m0 * MONTH_SENCONDS;

    var d = Math.floor(seconds / DAY_SECONDS);
    seconds -= d * DAY_SECONDS;
    var h = Math.floor(seconds / HOUR_SECONDS);
    seconds -= h * HOUR_SECONDS;
    var m = Math.floor(seconds / 60);
    var s = seconds - m * 60;

    var str = [];
    var ts = [y, m0, d, h, m, s];
    var tn = [];
    if(lang == "en") tn = ["y", "m", "d", "h", "m", "s"];
    else if(lang == "cn") tn = ["年", "月", "天","小时", "分钟", "秒"];

    var started = false;
    var visualCount = 0;
    for(var i = 0; i < ts.length; i++) {
        var t = ts[i];
        if(t > 0 || started)
        {
            started = true;
            visualCount++;

            t = flax.paddingString(t, 2);

            var nStr = t + (tn[i] || ":");

            if(str.length >= levels)
            {
                str.push(nStr);
                break;
            } else {
                str.push(nStr);
            }
        }
    }

    if(visualCount < levels) {
        for(var i = visualCount; i < levels; i++) {
            str.unshift("00:");
        }
    }

    nStr = str[str.length - 1];
    var lastS = nStr.lastIndexOf(":");
    if(lastS == nStr.length - 1) {
        nStr = nStr.substring(0, nStr.length - 1);
        str[str.length - 1] = nStr;
    }

    return str.join(" ") || "0";
}

/**
 * generate a unique id
 //8 character ID (base=2)
 uuid(8, 2)  //  "01001010"
 //8 character ID (base=10)
 uuid(8, 10) // "47473046"
 //8 character ID (base=16)
 uuid(8, 16) // "098F4D35"
 * */
flax.generateUid = function(len, radix) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [], i;
    radix = radix || chars.length;

    if (len) {
        // Compact form
        for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
    } else {
        // rfc4122, version 4 form
        var r;

        // rfc4122 requires these characters
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';

        // Fill in random data.  At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random()*16;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }

    return uuid.join('');
}

/**
 * Get game url in appstroe with apple id and country provided
 * */
flax.getAppStoreUrl = function(appleId, country) {
    if(!country) country = "cn";
    return "https://itunes.apple.com/" + country + "/app/id" + appleId
}

//判断是否合法的以太坊地址
flax.isEthereumAddress = function(address) {
    if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
        // Check if it has the basic requirements of an address
        return false;
    }
    else if (!/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
        // If it's all small caps or all all caps, return true
        return false;
    }
    else {
        // Otherwise check each case
        //TODO， 暂时不这么麻烦
        return true;
        //return isChecksumAddress(address);
    }
};

/**
 * hex to utf8 string, especially used in ehtereum
 * */
flax.hex2utf8 = function(pStr) {
    if(pStr.indexOf("0x") == 0) pStr = pStr.substring(2);
    var tempstr = ''
    try {
        tempstr = decodeURIComponent(pStr.replace(/\s+/g, '').replace(/[0-9a-f]{2}/g, '%$&'));
    }
    catch (err) {
        for (var b = 0; b < pStr.length; b = b + 2) {
            var charCode = parseInt(pStr.substr(b, 2), 16);
            if(charCode <= 0) continue;
            tempstr = tempstr + String.fromCharCode();
        }
    }
    var isNull = true;
    for(var i = 0; i < tempstr.length; i++) {
        if(tempstr.charCodeAt(i) > 0) {
            isNull = false;
        }
    }
    if(isNull) tempstr = "";
    return tempstr;
}

/**
 * 获得今天的时间年月日字符串
 * offset是今天为基点的天数偏差
 * */
flax.getDateStrFromTody = function(offset, split) {
    if(!offset) offset = 0;
    if(!split) split = "/";
    var dd = new Date();
    dd.setDate(dd.getDate() + offset);//offset
    var y = dd.getFullYear();
    var m = dd.getMonth()+1;//获取当前月份的日期
    var d = dd.getDate();
    return m + split + d + split + y;
}

/**
 * 获取时间字符串对应的时间戳（毫秒）
 * 月/日/年 小时:分钟:秒
 * */
flax.getTimestamp = function(year, month, date, hour, munites, seconds) {
    var timeStr = month + "/" + date + "/" + year + " " + hour + ":" + munites + ":" + seconds;
    var time = new Date(timeStr);
    return time.getTime();
}

/**
 * 获取时间字符串对应的时间戳（毫秒）
 * 月/日/年 小时:分钟:秒
 * */
flax.getTimestampFromStr = function(timeStr) {
    var time = new Date(timeStr);
    return time.getTime();
}


function _fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    // textArea.focus();

    if(flax.sys.os == flax.sys.OS_IOS) {
        var range, selection;
        range = document.createRange();
        range.selectNodeContents(textArea);
        selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        textArea.setSelectionRange(0, 999999);
    } else {
        textArea.select();
    }

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
}
flax.copyTextToClipboard = function(text) {
    if (!navigator.clipboard) {
        _fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).then(function() {
        console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
        console.error('Async: Could not copy text: ', err);
    });
}