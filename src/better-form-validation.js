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
        hasName = function(el) {
            return el.get("name") === this;
        },
        hasCheckedRadio = function(el) {
            return el.get("name") === this.get("name") && el.get("checked");
        },
        checkCustomValidators = function(el) {
            var errors = [], selector, message;

            for (selector in customValidators) {
                if (el.is(selector)) {
                    message = customValidators[selector].fn.call(el);

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

                    this._checkValidity();
                });
            } else {
                this.on("input", this._checkValidity);
            }
        },
        _checkValidity: function() {
            var type = this.get("type"),
                value = this.get("value"),
                checked = this.get("checked"),
                required = this.is("[required]"),
                errors = checkCustomValidators(this),
                regexp, valid, event;

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
                    errors.push("value-missing");
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
                            errors.push("pattern-mismatch");
                        }
                    }
                } else if (required) {
                    errors.push("value-missing");
                }
            }

            valid = !errors.length;

            if (valid && !this.isValid()) event = "validation:success";

            this._validity = errors;

            if (!valid) event = "validation:fail";

            if (event) this.fire(event);
        },
        isValid: function() {
            return !this._validity.length;
        },
        getValidity: function() {
            // return clone of the validity object
            return this._validity.slice(0);
        },
        setValidity: function(error) {
            if (typeof error !== "string") {
                throw "Errors should be a string";
            }

            this._customError = error;

            this._checkValidity();

            return this;
        }
    });

    DOM.extend("form", {
        constructor: function() {
            this._validity = {};

            this
                .set("novalidate", "novalidate")
                .on("submit", function() {
                    this._checkValidity();

                    return this.isValid();
                });
        },
        _checkValidity: function() {
            var errors = {},
                valid, event;

            valid = this.get("elements").foldr(function(valid, el) {
                if (el._checkValidity) {
                    el._checkValidity();
                    
                    if (!el.isValid()) {
                        errors[el.get("name")] = el.getValidity();

                        valid = valid && el.isValid();
                    }
                }

                return valid;
            }, true);

            if (valid && !this.isValid()) event = "validation:success";

            this._validity = errors;

            if (!valid) event = "validation:fail";

            if (event) this.fire(event);
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
        setValidity: function(errors) {
            if (typeof errors !== "object") {
                throw "Errors should be an object";
            }

            var el, key;

            for (key in errors) {
                el = this.get("elements").filter(hasName, key);

                if (el) el.setValidity(errors[key]);
            }

            this._checkValidity();

            return this;
        }
    });

    validityTooltip.on("click", function() {
        if (lastCapturedElement) lastCapturedElement.fire("focus");

        validityTooltip.hide();
    });

    DOM.on({
        "validation:fail(target,defaultPrevented)": function(target, defaultPrevented) {
            if (!defaultPrevented && target.get("tagName") !== "form") {
                var offset = target.offset(),
                    message = target.getValidity()[0],
                    title = target.get("title"),
                    hasCustomMessage = message === "pattern-mismatch" && title;

                validityTooltip
                    .setStyle({ left: offset.left, top: offset.bottom })
                    .set({
                        "innerHTML": hasCustomMessage ? title : "",
                        "data-i18n": hasCustomMessage ? null : message
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
