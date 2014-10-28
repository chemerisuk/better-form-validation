/**
 * better-i18n-plugin: Internationalization plugin for better-dom
 * @version 1.0.1 Sat, 25 Oct 2014 11:37:21 GMT
 * @link https://github.com/chemerisuk/better-i18n-plugin
 * @copyright 2014 Maksim Chemerisuk
 * @license MIT
 */
/* jshint -W053 */
(function(DOM) {
    "use strict";

    var strings = [],
        languages = [];

    DOM.importStrings = function(lang, key, value) {
        if (typeof lang !== "string") throw new TypeError("lang argument must be a string");

        var langIndex = languages.indexOf(lang),
            stringsMap = strings[langIndex];

        if (langIndex === -1) {
            langIndex = languages.push(lang) - 1;
            strings[langIndex] = stringsMap = {};

            // add global rules to to able to switch to new language

            // by default localized strings should be hidden
            DOM.importStyles((("[data-l10n=\"" + lang) + "\"]"), "display:none");
            // ... except current page language is `lang`
            DOM.importStyles(((":lang(" + lang) + (") > [data-l10n=\"" + lang) + "\"]"), "display:inline");
            // ... in such case hide default value too
            DOM.importStyles(((":lang(" + lang) + (") > [data-l10n=\"" + lang) + "\"] ~ [data-l10n]"), "display:none");
        }

        if (typeof key === "string") {
            stringsMap[key] = value;
        } else {
            Object.keys(key).forEach(function(x)  {
                stringsMap[x] = key[x];
            });
        }
    };

    DOM.extend("*", {
        l10n: function(key, varMap) {
            var entry = new Entry(key, varMap),
                keys = Object.keys(entry).sort(function(k)  {return k === "_" ? 1 : -1});

            return this.set(keys.map(function(key)  {
                var attrValue = key === "_" ? "" : key;

                return (("<span data-l10n=\"" + attrValue) + ("\">" + (entry[key])) + "</span>");
            }).join(""));
        }
    });

    DOM.__ = function(key, varMap)  {return new Entry(key, varMap)};

    function Entry(key, varMap) {var this$0 = this;
        languages.forEach(function(lang, index)  {
            var value = strings[index][key];

            if (value) {
                if (varMap) value = DOM.format(value, varMap);

                this$0[lang] = value;
            }
        });

        this._ = varMap ? DOM.format(key, varMap) : key;
    }

    // grab all methods from String.prototype
    Entry.prototype = new String();
    Entry.prototype.constructor = Entry;

    Entry.prototype.toString = Entry.prototype.valueOf = function() {
        return this[DOM.get("lang")] || this._;
    };

    Entry.prototype.toLocaleString = function(lang) {
        return lang ? this[lang] || this._ : this.toString();
    };
}(window.DOM));
