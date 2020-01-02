export function get_cookie(key: string) {
    // istanbul ignore next
    for (let [name, value] of cookie_iterator()) {
        if (name === key) {
            return value;
        }
    }

    return null;
}

// Adapted from: https://stackoverflow.com/questions/179355/clearing-all-cookies-with-javascript
export function delete_all_cookies() {
    // istanbul ignore next
    for (let [name, value] of cookie_iterator()) {
        document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain="
        + location.hostname;
    }
}

// istanbul ignore next
function* cookie_iterator() {
    let cookies = decodeURIComponent(document.cookie).split(";");
    for (let cookie of cookies) {
        let eq_pos = cookie.indexOf("=");
        let name = eq_pos > -1 ? cookie.substr(0, eq_pos) : cookie;
        let value = eq_pos > -1 ? cookie.substr(eq_pos + 1) : '';
        yield [name.trim(), value.trim()];
    }
}
