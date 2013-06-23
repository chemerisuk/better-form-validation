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
        makePair = function(name, value) {
            return encodeURIComponent(name) + "=" + encodeURIComponent(value);
        },
        checkCustomValidators = function(el) {
            var errors = [], selector, message;

            for (selector in customValidators) {
                if (el.matches(selector)) {
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

            this.on("input", this._checkValidity);
        },
        _checkValidity: function() {
            var type = this.get("type"),
                value = this.get("value"),
                required = this.has("required"),
                checked = this.has("checked"),
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
        },
        toQueryString: function() {
            var name = this.get("name"),
                result = [];

            if (name) { // don't include form fields without names
                switch(this.get("type")) {
                case "select-one":
                case "select-multiple":
                    this.get("options").each(function(option) {
                        if (option.get("selected")) {
                            result.push(makePair(name, option.get()));
                        }
                    });
                    break;

                case undefined:
                case "fieldset": // fieldset
                case "file": // file input
                case "submit": // submit button
                case "reset": // reset button
                case "button": // custom button
                    break;

                case "radio": // radio button
                case "checkbox": // checkbox
                    if (!this.get("checked")) break;
                    /* falls through */
                default:
                    result.push(makePair(name, this.get()));
                }
            }

            return result.join("&").replace(/%20/g, "+");
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
        },
        toQueryString: function() {
            return this.get("elements").reduce(function(memo, el) {
                if (el.get("name")) {
                    var str = el.toQueryString();

                    if (str) memo += (memo ? "&" : "") + str;
                }

                return memo;
            }, "");
        }
    });

    DOM.ready(function() {
        DOM.find("body").prepend(validityTooltip);
    });

    DOM.on("validation:fail(target)", function(target) {
        if (target.get("tagName") !== "form") {
            var offset = target.offset(),
                message = target.getValidity()[0],
                customMessage = message === "pattern-mismatch" && target.has("title");

            validityTooltip
                .setStyle({ left: offset.left, top: offset.bottom })
                .set({
                    "innerHTML": customMessage ? target.get("title") : "",
                    "data-i18n": customMessage ? null : message
                })
                .show();

            lastCapturedElement = target;
        }
    });

    DOM.on("validation:success(target)", function() {
        validityTooltip.hide();
    });

    validityTooltip.on("click", function() {
        if (lastCapturedElement) lastCapturedElement.fire("focus");

        validityTooltip.hide();
    });

    DOM.registerValidator = function(selector, fn) {
        customValidators[selector] = fn;
    };

}());