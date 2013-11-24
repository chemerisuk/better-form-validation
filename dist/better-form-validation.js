/**
 * @file src/better-form-validation.js
 * @version 1.2.0-rc.2 2013-11-24T17:03:29
 * @overview Form validation polyfill for better-dom
 * @copyright Maksim Chemerisuk 2013
 * @license MIT
 * @see https://github.com/chemerisuk/better-form-validation
 */
(function(DOM, I18N_MISMATCH) {
    "use strict";

    var reNumber = /^-?[0-9]*(\.[0-9]+)?$/,
        reEmail = /^([a-z0-9_\.\-\+]+)@([\da-z\.\-]+)\.([a-z\.]{2,6})$/i,
        reUrl = /^(https?:\/\/)?[\da-z\.\-]+\.[a-z\.]{2,6}[#&+_\?\/\w \.\-=]*$/i,
        reTel = /^((\+\d{1,3}(-| )?\(?\d\)?(-| )?\d{1,5})|(\(?\d{2,6}\)?))(-| )?(\d{3,4})(-| )?(\d{4})(( x| ext)\d{1,5}){0,1}$/,
        predefinedPatterns = {number: reNumber, email: reEmail, url: reUrl, tel: reTel},
        hasCheckedRadio = function(el) {
            return el.get("name") === this.get("name") && el.get("checked");
        },
        isArray = Array.isArray || function(obj) {
            return Object.prototype.toString.call(obj) === "[object Array]";
        },
        VALIDITY_KEY = "validity",
        VALIDITY_TOOLTIP_KEY = "validity-tooltip",
        VALIDITY_TOOLTIP_DELAY = 100;

    DOM.extend("input,select,textarea", {
        constructor: function() {
            var validityTooltip = DOM.create("div.better-validity-tooltip").hide().on("click", "hide"),
                type = this.get("type");

            if (this.matches("textarea")) {
                // maxlength fix for textarea
                this.on("input", function() {
                    var maxlength = parseFloat(this.get("maxlength")),
                        value = this.get();

                    if (maxlength && value.length > maxlength) {
                        this.set(value.substr(0, maxlength));
                    }
                });
            }

            this
                .on(type === "checkbox" || type === "radio" ? "click" : "blur", this.onCheckValidity)
                .data(VALIDITY_TOOLTIP_KEY, validityTooltip)
                .after(validityTooltip);
        },
        validity: function(errors) {
            if (arguments.length) return this.data(VALIDITY_KEY, errors);

            var type = this.get("type"),
                value = this.get("value"),
                required = this.matches("[required]"),
                regexp;

            errors = this.data(VALIDITY_KEY);

            if (typeof errors === "function") errors = errors();

            errors = errors || [];

            if (!errors.length) {
                switch(type) {
                case "image":
                case "submit":
                case "button":
                case "select-one":
                case "select-multiple":
                    // only check custom error case
                    break;

                case "radio":
                    if (!required || this.parent("form").findAll("[name]").some(hasCheckedRadio, this)) break;
                    /* falls through */
                case "checkbox":
                    if (required && !this.get("checked")) errors.push("can't be empty");
                    break;

                default:
                    if (value) {
                        regexp = predefinedPatterns[type];

                        if (regexp && !regexp.test(value)) errors.push(I18N_MISMATCH[type]);

                        if (type !== "textarea") {
                            regexp = this.get("pattern");

                            if (regexp && !new RegExp("^(?:" + regexp + ")$").test(value)) {
                                errors.push(this.get("title") || "illegal value format");
                            }
                        }
                    } else if (required) {
                        errors.push("can't be empty");
                    }
                }
            }

            return errors;
        },
        onCheckValidity: function() {
            var errors = this.validity();

            if (errors.length) {
                this.fire("validity:fail", errors);
            } else {
                this.fire("validity:success");
            }
        }
    });

    DOM.extend("form", {
        constructor: function() {
            // disable native validation
            this
                .set("novalidate", "novalidate")
                .on("submit", this.onFormSubmit)
                .on("reset", this.onFormReset);
        },
        validity: function(errors) {
            if (arguments.length) return this.data(VALIDITY_KEY, errors);

            errors = this.data(VALIDITY_KEY);

            if (typeof errors === "function") errors = errors();

            errors = errors || {};
            errors.length = 0;

            return this.findAll("[name]").reduce(function(memo, el) {
                var name = el.get("name"),
                    errors = name in memo ? memo[name] : el.validity();

                if (errors.length) {
                    memo[name] = errors;

                    memo.length += errors.length;
                }

                return memo;
            }, errors);
        },
        onFormSubmit: function() {
            var errors = this.validity(),
                delay = 0,
                showTooltip = function(el) {
                    setTimeout(function() { el.fire("validity:fail", errors[name]) }, delay);

                    delay += VALIDITY_TOOLTIP_DELAY;
                },
                name;

            for (name in errors) showTooltip(this.find("[name=" + name + "]"));

            if (errors.length) {
                // fire event on form level
                this.fire("validity:fail", errors);

                return false;
            }
        },
        onFormReset: function() {
            this.findAll("[name]").each(function(el) {
                el.data(VALIDITY_TOOLTIP_KEY).hide();
            });
        }
    });

    DOM.on("validity:success", function(target, cancel) {
        if (!cancel) {
            var validityTooltip = target.data(VALIDITY_TOOLTIP_KEY);

            if (validityTooltip) validityTooltip.hide();
        }
    });

    DOM.on("validity:fail", function(errors, target, cancel) {
        // errors could be string, array, object
        if (!cancel && (typeof errors === "string" || isArray(errors)) && errors.length) {
            if (isArray(errors)) errors = errors.join("<br>");

            var validityTooltip = target.data(VALIDITY_TOOLTIP_KEY);

            if (!validityTooltip) {
                validityTooltip = DOM.create("div.better-validity-tooltip").on("click", "hide");
                target.data(VALIDITY_TOOLTIP_KEY, validityTooltip).after(validityTooltip);
            }

            if (validityTooltip.hide().i18n()) {
                // display error with a small delay if a message already exists
                setTimeout(function() { validityTooltip.i18n(errors).show() }, VALIDITY_TOOLTIP_DELAY);
            } else {
                validityTooltip.i18n(errors).show();
            }
        }
    });
}(window.DOM, {
    url: "should be a valid URL",
    email: "should be a valid email",
    tel: "should be a valid phone number"
}));
