/**
 * Created by long on 15-9-18.
 */

var flax = flax || {};

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

flax.formatTime = function(seconds, levels)
{
    if(levels <= 1) return seconds + "";
    if(!levels) levels = 2;

    var h = 0;
    if(levels > 2) h = Math.floor(seconds/3600);
    var m = Math.floor((seconds - h*3600)/60);
    var s = seconds - h*3600 - m*60;

    if(h < 10) h = "0" + h;
    if(m < 10) m = "0" + m;
    if(s < 10) s = "0" + s;

    if(levels > 2) return h + ":" + m + ":" + s;
    return m + ":" + s;
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