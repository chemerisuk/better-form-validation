/**
 * @file src/better-i18n.js
 * @version 1.0.0-rc.1 2014-10-03T02:23:09
 * @overview Internationalization extension for better-dom
 * @copyright Maksim Chemerisuk 2014
 * @license MIT
 * @see https://github.com/chemerisuk/better-i18n
 */
(function(DOM) {
    "use strict";

    var strings = {},
        languages = [];

    DOM.importStrings = function(lang, key, value) {
        var keyType = typeof key,
            langIndex = languages.indexOf(lang);

        if (keyType === "string") {
            if (langIndex === -1) {
                langIndex = languages.push(lang) - 1;

                // add global rules to to able to switch to new language
                var prefix = ":lang(" + lang + ") > ";

                // by default localized strings should be hidden
                DOM.importStyles("[data-i18n='" + lang + "']", "display:none");
                // ... except current page language is appropriate
                DOM.importStyles(prefix + "[data-i18n='" + lang + "']", "display:inline");
                // ... in such case hide default string as well
                DOM.importStyles(prefix + "[data-i18n='" + lang + "'] ~ [data-i18n]", "display:none");
            }

            if (!strings[key]) strings[key] = [];

            // store localized string internally
            strings[key][langIndex] = value;
        } else if (keyType === "object") {
            Object.keys(key).forEach(function(x) {
                DOM.importStrings(lang, x, key[x]);
            });
        } else {
            throw TypeError("importStrings");
        }
    };

    DOM.i18n = function(key, varMap) {
        return new Entry(key, varMap);
    };

    // helper functions

    function Entry(key, varMap) {
        languages.forEach(populateLang(key, varMap, this));

        this._ = DOM.format(key, varMap);
    }

    Entry.prototype.toString = function(varMap) {
        return Object.keys(this).map(formatLang(varMap, this)).join("");
    };

    Entry.prototype.toLocaleString = function(lang) {
        if (!lang) lang = DOM.get("lang");

        return lang in this ? this[lang] : this._;
    };

    function populateLang(key, varMap, entry) {
        var record = strings[key] || {};

        return function(lang, index) {
            if (index in record) {
                entry[lang] = DOM.format(record[index], varMap);
            }
        };
    }

    function formatLang(varMap, entry) {
        return function(key) {
            var lang = key === "_" ? "" : key,
                value = DOM.format(entry[key], varMap);

            return "<span data-i18n=\"" + lang + "\">" + value + "</span>";
        };
    }
}(window.DOM));
