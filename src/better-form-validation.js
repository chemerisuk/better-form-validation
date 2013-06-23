/*!
 * better-form-validation (https://github.com/chemerisuk/better-form-validation)
 * form validation for better-dom (https://github.com/chemerisuk/better-form-validation)
 *
 * Copyright (c) 2013 Maksim Chemerisuk
 */
(function() {
    "use strict";

    var rNumber = /^-?[0-9]*(\.[0-9]+)?$/,
        rEmail = /^([a-z0-9_\.\-\+]+)@([\da-z\.\-]+)\.([a-z\.]{2,6})$/i,
        rUrl = /^(https?:\/\/)?[\da-z\.\-]+\.[a-z\.]{2,6}[#&+_\?\/\w \.\-=]*$/i,
        predefinedPatterns = {number: rNumber, email: rEmail, url: rUrl},
        isArray = Array.isArray || function(obj) {
            return Object.prototype.toString.call(obj) === "[object Array]";
        },
        hasCheckedRadio = function(el) {
            return el.get("name") === this.get("name") && el.get("checked");
        },
        checkCustomValidators = function(el) {
            var errors = [], selector, message;

            for (selector in customValidators) {
                if (el.is(selector)) {
                    message = customValidators[selector].call(el);

                    if (message) errors.push(message);
                }
            }

            return errors;
        },
        customValidators = {},
        validityTooltip = DOM.create("div[hidden].better-form-validation-tooltip"),
        lastCapturedElement;

    DOM.extend("input,textarea,select", {
        constructor: function() {
            this._validity = [];

            if (this.is("textarea") && !this.supports("maxLength")) {
                this.on("input", function() {
                    var maxlength = parseInt(this.get("maxlength"), 10),
                        value = this.get();

                    if (maxlength && value.length > maxlength) {
                        this.set(value.substr(0, maxlength));
                    }

                    this.setValidity(this._checkValidity(), true);
                });
            } else {
                this.on("input", function() {
                    this.setValidity(this._checkValidity(), true);
                });
            }
        },
        _checkValidity: function() {
            var type = this.get("type"),
                value = this.get("value"),
                checked = this.get("checked"),
                required = this.is("[required]"),
                errors = checkCustomValidators(this),
                regexp;

            if (this._customError) {
                errors.push(this._customError);
            }

            switch(type) {
            case "image":
            case "submit":
            case "button":
                return;

            case "select-one":
            case "select-multiple":
                // for a select only check custom error case
                break;
                
            case "radio":
                if (checked || this.get("form").get("elements").some(hasCheckedRadio, this)) break;
                /* falls through */
            case "checkbox":
                if (required && !checked) {
                    errors.push("i18n:value-missing");
                }
                break;

            default:
                if (value) {
                    regexp = predefinedPatterns[type];

                    if (regexp && !regexp.test(value)) {
                        errors.push(type + "-mismatch");
                    }

                    if (type !== "textarea") {
                        regexp = this.get("pattern");

                        if (regexp && !new RegExp("^(?:" + regexp + ")$").test(value)) {
                            errors.push(this.get("title") || "i18n:pattern-mismatch");
                        }
                    }
                } else if (required) {
                    errors.push("i18n:value-missing");
                }
            }

            return errors;
        },
        isValid: function() {
            return !this._validity.length;
        },
        getValidity: function() {
            // return clone of the validity object
            return this._validity.slice(0);
        },
        setValidity: function(errors, /*INTERNAL*/flag) {
            if (!isArray(errors)) {
                throw "Errors should be an array";
            }

            var oldValid = this.isValid();

            this._validity = errors;

            if (!flag) this._customErrors = errors;

            if (!this.isValid() || !oldValid) {
                this.fire(this.isValid() ? "validation:success" : "validation:fail");
            }

            return this;
        }
    });

    DOM.extend("form", {
        constructor: function() {
            this._validity = {};

            this
                .set("novalidate", "novalidate")
                .on("reset", validityTooltip, "hide")
                .on("submit", function() {
                    return this.setValidity(this._checkValidity(), true).isValid();
                });
        },
        _checkValidity: function() {
            return this.get("elements").foldl(function(memo, el) {
                if (el._checkValidity) {
                    var errors = el._checkValidity();
                    
                    if (errors.length) memo[el.get("name")] = errors;
                }

                return memo;
            }, {});
        },
        isValid: function() {
            for (var key in this._validity) {
                if (this._validity[key].length) return false;
            }

            return true;
        },
        getValidity: function() {
            // return clone of the validity object
            return JSON.parse(JSON.stringify(this._validity));
        },
        setValidity: function(errors, /*INTERNAL*/flag) {
            if (typeof errors !== "object") {
                throw "Errors should be an object";
            }

            var oldValid = this.isValid();

            this.get("elements").foldr(function(memo, el) {
                if (el.get("name")) {
                    var validity = errors[el.get("name")];

                    if (validity) el.setValidity(validity, flag);
                }
            }, 0);

            this._validity = errors;

            if (!this.isValid() || !oldValid) {
                this.fire(this.isValid() ? "validation:success" : "validation:fail");
            }

            return this;
        }
    });

    validityTooltip.on("click", function() {
        if (lastCapturedElement) lastCapturedElement.fire("focus");

        validityTooltip.hide();
    });

    DOM.on({
        "validation:fail(target,defaultPrevented)": function(target, defaultPrevented) {
            if (!defaultPrevented && !target.is("form")) {
                var offset = target.offset(),
                    message = target.getValidity()[0],
                    i18nMessage = !message.indexOf("i18n:");

                validityTooltip
                    .setStyle({ left: offset.left, top: offset.bottom })
                    .set({
                        "innerHTML": i18nMessage ? "" : message,
                        "data-i18n": i18nMessage ? message.substr(5) : null
                    })
                    .show();

                lastCapturedElement = target;
            }
        },
        "validation:success(defaultPrevented)": function(defaultPrevented) {
            if (!defaultPrevented) validityTooltip.hide();
        }
    });

    DOM.ready(function() {
        DOM.find("body").prepend(validityTooltip);
    });

    DOM.registerValidator = function(selector, fn) {
        if (selector in customValidators) {
            throw "Can't register validator for the same selector twice!";
        }

        customValidators[selector] = fn;
    };

}());
