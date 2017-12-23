'use strict';

const matchHtmlRegExp = /['"<>&]/;

function escapeLongString (str) {
    let escape = '';
    let html = '';
    let lastIndex = 0;
    let index = 0;
    const b = new Buffer(str, 'ascii');
    const l = b.length;

    for (; index < l; index++) {
        switch (b[index]) {
        case 34: // "
            escape = '&quot;';
            break;
        case 38: // &
            escape = '&amp;';
            break;
        case 39: // '
            escape = '&#x27;';
            break;
        case 60: // <
            escape = '&lt;';
            break;
        case 62: // >
            escape = '&gt;';
            break;
        default:
            continue;
        }
        if (lastIndex !== index) {
            html += str.substring(lastIndex, index);
        }
        lastIndex = index + 1;
        html += escape;
    }
    return lastIndex !== index
      ? html + str.substring(lastIndex, index)
      : html;
}
function escapeShortString (str, start) {
    let escape = '';
    let html = '';
    let lastIndex = 0;
    let index = 0;
    const l = str.length;
    for (; index < l; index++) {
        switch (str.charCodeAt(index)) {
        case 34: // "
            escape = '&quot;';
            break;
        case 38: // &
            escape = '&amp;';
            break;
        case 39: // '
            escape = '&#x27;';
            break;
        case 60: // <
            escape = '&lt;';
            break;
        case 62: // >
            escape = '&gt;';
            break;
        default:
            continue;
        }
        if (lastIndex !== index) {
            html += str.substring(lastIndex, index);
        }
        lastIndex = index + 1;
        html += escape;
    }
    return lastIndex !== index
      ? html + str.substring(lastIndex, index)
      : html;
}
function escapeHtml (string) {
    const str = '' + string;
    if (matchHtmlRegExp.test(str)) {
        return str.length > 200 ? escapeLongString(str) : escapeShortString(str);
    }
    return str;
}
module.exports = escapeHtml;
