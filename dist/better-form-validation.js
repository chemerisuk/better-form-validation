/**
 * better-form-validation: Form validation using better-dom
 * @version 1.5.0 Fri, 14 Oct 2016 08:26:37 GMT
 * @link https://github.com/chemerisuk/better-form-validation
 * @copyright 2016 Maksim Chemerisuk
 * @license MIT
 */
(function (DOM, VALIDITY_KEY, I18N_MISMATCH, undefined) {
    "use strict";

    var patterns = {};
    var invalidTypes = [null, "file", "image", "submit", "fieldset", "reset", "button", "hidden"];
    var isValidInput = function (el) {
        return invalidTypes.indexOf(el.get("type")) < 0;
    };

    patterns.required = /\S/;
    patterns.number = /^-?[0-9]*(\.[0-9]+)?$/;
    patterns.email = /^([a-z0-9_\.\-\+]+)@([\da-z\.\-]+)\.([a-z\.]{2,6})$/i;
    patterns.url = /^(https?:\/\/)?[\da-z\.\-]+\.[a-z\.]{2,6}[#&+_\?\/\w \.\-=]*$/i;
    patterns.tel = /^((\+\d{1,3}(-| )?\(?\d\)?(-| )?\d{1,5})|(\(?\d{2,6}\)?))(-| )?(\d{3,4})(-| )?(\d{4})(( x| ext)\d{1,5}){0,1}$/;
    /* istanbul ignore next */
    var getBooleanProp = function (name) {
        return function (attrValue) {
            attrValue = String(attrValue).toLowerCase();

            return attrValue === "" || attrValue === name.toLowerCase();
        };
    },
        setBooleanProp = function () {
        return function (propValue) {
            return propValue ? "" : null;
        };
    };

    function Validity(errors) {
        var _this = this;

        this.valid = true;

        if (!errors || typeof errors !== "object") return;

        Object.keys(errors).forEach(function (key) {
            var validity = errors[key];

            _this[key] = validity;

            if (validity instanceof Validity) {
                _this.valid = _this.valid && validity.valid;
            } else {
                _this.valid = _this.valid && !validity.length;
            }
        });
    }

    DOM.extend("[name]", isValidInput, {
        constructor: function () {
            var _this2 = this;

            var type = this.get("type");

            if (type !== "checkbox" && type !== "radio") {
                this.on("input", this._checkValidity);
            }

            this.on("change", this.reportValidity);
            /* istanbul ignore if */
            if (typeof this.get("required") !== "boolean") {
                ["required", "noValidate"].forEach(function (propName) {
                    _this2.define(propName, getBooleanProp(propName), setBooleanProp(propName));
                });
            }
        },
        validity: function (errors) {
            var _this3 = this;

            if (errors !== undefined) {
                this.set(VALIDITY_KEY, errors);
            } else {
                var form = DOM.constructor(this.get("form"));

                if (this.get("novalidate") != null || form.get("novalidate") != null) {
                    return new Validity();
                }
            }

            errors = this.get(VALIDITY_KEY);

            if (typeof errors === "function") errors = errors.call(this);
            if (typeof errors === "string") errors = [errors];

            errors = errors || [];

            var type = this.get("type"),
                required = this.get("required"),
                regexp,
                pattern,
                msg;

            if (!errors.length) {
                switch (type) {
                    case "radio":
                        if (!required) break;

                        var elements = this.closest("form").findAll("[name]"),
                            hasCheckedRadio = function (el) {
                            return el.get("name") === _this3.get("name") && el.get("checked");
                        };

                        if (elements.some(hasCheckedRadio)) break;
                    /* falls through */
                    case "checkbox":
                        if (required && !this.get("checked")) {
                            errors.push("field is required");
                        }
                        break;

                    default:
                        var value = this.get("value");
                        // pattern/type validations ignore blank values
                        if (value) {
                            pattern = this.get("pattern");

                            if (pattern) {
                                // make the pattern string
                                pattern = "^(?:" + pattern + ")$";

                                if (pattern in patterns) {
                                    regexp = patterns[pattern];
                                } else {
                                    regexp = new RegExp(pattern);
                                    // cache regexp internally
                                    patterns[pattern] = regexp;
                                }

                                msg = this.get("title") || "illegal value format";
                            } else {
                                regexp = patterns[type];
                                msg = I18N_MISMATCH[type];
                            }
                        }

                        if (required && !regexp) {
                            regexp = patterns.required;
                            msg = "field is required";
                        }

                        if (regexp && !regexp.test(value)) {
                            errors.push(msg);
                        }
                }
            }

            return new Validity(errors);
        },
        _checkValidity: function () {
            var value = this.get(),
                maxlength = this.get("maxlength");

            if (maxlength >= 0 && value.length > maxlength) {
                this.set(value.substr(0, maxlength));
            }

            if (this.get("aria-invalid")) {
                this.reportValidity();
            }
        },
        reportValidity: function () {
            var form = DOM.constructor(this.get("form"));

            if (this.get("novalidate") != null || form.get("novalidate") != null) {
                return new Validity();
            }

            var validity = this.validity();

            this.set("aria-invalid", !validity.valid);

            if (validity.valid) {
                this.fire("validity:ok");
            } else {
                this.fire("validity:fail", validity);
            }

            return validity;
        }
    });

    DOM.extend("form", {
        constructor: function () {
            var _this4 = this;

            /* istanbul ignore if */
            if (typeof this.get("noValidate") !== "boolean") {
                this.define("noValidate", getBooleanProp("noValidate"), setBooleanProp("noValidate"));
            } else {
                (function () {
                    var timeoutId = void 0;

                    _this4.on("invalid", function () {
                        if (!timeoutId) {
                            timeoutId = setTimeout(function () {
                                // trigger submit event manually
                                _this4.fire("submit");

                                timeoutId = null;
                            });
                        }

                        return false; // don't show tooltips
                    });
                })();
            }

            this.on("submit", this._submitForm).on("reset", this._resetForm);
        },
        validity: function (errors) {
            if (errors !== undefined) {
                this.set(VALIDITY_KEY, errors);
            } else if (this.get("novalidate") != null) {
                return new Validity();
            }

            errors = this.get(VALIDITY_KEY);

            if (typeof errors === "function") errors = errors.call(this);
            if (typeof errors === "string") errors = [errors];

            errors = errors || [];

            this.findAll("[name]").filter(isValidInput).forEach(function (el) {
                var name = el.get("name");
                // hidden elements might not have validity method yet
                if (!(name in errors) && el.validity) {
                    errors[name] = el.validity();
                }
            });

            return new Validity(errors);
        },
        _submitForm: function () {
            var validity = this.validity();

            if (!validity.valid) {
                // fire event on form level
                this.fire("validity:fail", validity);

                return false;
            }
        },
        _resetForm: function () {
            this.findAll("[name]").forEach(function (el) {
                el.set("aria-invalid", null).popover().hide();
            });
        }
    });

    DOM.on("validity:ok", ["target", "defaultPrevented"], function (target, cancel) {
        if (!cancel) target.popover().hide();
    });

    DOM.on("validity:fail", [1, 2, "target", "defaultPrevented"], function (errors, batch, target, cancel) {
        if (cancel) return;

        if (target.matches("form")) {
            Object.keys(errors).forEach(function (name) {
                var validity = errors[name];

                if (validity instanceof Validity) {
                    if (validity.valid) return;
                } else {
                    if (!validity.length) return;
                }

                target.find("[name=\"" + name + "\"]").set("aria-invalid", true).fire("validity:fail", validity, true);
            });
        } else {
            var popover = target.popover(),
                delay = 0;

            // hiding the tooltip to show later with a small delay
            if (!popover.hasClass("better-validity-tooltip")) {
                popover = target.popover(null, "left", "bottom").addClass("better-validity-tooltip").on("click", function () {
                    target.fire("focus");
                    // hide with delay to fix issue in IE10-11
                    // which trigger input event on focus
                    setTimeout(function () {
                        popover.hide();
                    }, delay);
                });
            }
            // set error message
            popover.set("innerHTML", DOM.__(errors[0]));

            if (batch) {
                // hide popover and show it later with delay
                delay = popover.hide().css("transition-duration");
                // parse animation duration value
                delay = delay && parseFloat(delay) * (delay.slice(-2) === "ms" ? 1 : 1000);
            }

            // use a small delay if several tooltips are going to be displayed
            setTimeout(function () {
                popover.show();
            }, delay || 0);
        }
    });
})(window.DOM, "_validity", {
    email: "should be a valid email",
    url: "should be a valid URL",
    tel: "should be a valid phone number",
    number: "should be a numeric value"
});
DOM.importStyles("@media screen", ".better-validity-tooltip{cursor:pointer;color:#ff3329;background:#FFF;font-weight:700;text-transform:uppercase;font-size:.75em;line-height:1;padding:.5em;border:1px solid;border-radius:.25em;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;opacity:.9;-webkit-transform:translateY(1px);-ms-transform:translateY(1px);transform:translateY(1px);-webkit-transition:.3s ease-out;transition:.3s ease-out;-webkit-transition-property:opacity,-webkit-transform;transition-property:opacity,-webkit-transform;transition-property:transform,opacity;transition-property:transform,opacity,-webkit-transform;-webkit-transform-origin:1em 0;-ms-transform-origin:1em 0;transform-origin:1em 0}.better-validity-tooltip[aria-hidden=true]{opacity:0;-webkit-transform:translateY(1em);-ms-transform:translateY(1em);transform:translateY(1em)}.better-validity-tooltip:before,.better-validity-tooltip:after{content:'';width:0;height:0;display:block;position:absolute;bottom:100%}.better-validity-tooltip:before{border:6px solid transparent;border-bottom-color:inherit}.better-validity-tooltip:after{border:5px solid transparent;border-bottom-color:#FFF;margin-left:1px}");
