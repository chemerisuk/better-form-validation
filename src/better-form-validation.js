(function(DOM, PATTERN, I18N_MISMATCH) {
    "use strict";

    var hasCheckedRadio = function(el) {
            return el.get("name") === this.get("name") && el.get("checked");
        },
        isArray = Array.isArray || function(obj) {
            return Object.prototype.toString.call(obj) === "[object Array]";
        },
        attachValidityTooltip = function(el) {
            var validityTooltip = DOM.create("div.better-validity-tooltip").hide();

            validityTooltip.on("click", function() {
                validityTooltip.hide();
                // focus to the invalid input
                el.fire("focus");
            });

            el.data(VALIDITY_TOOLTIP_KEY, validityTooltip).after(validityTooltip);

            return validityTooltip;
        },
        VALIDITY_KEY = "validity",
        VALIDITY_TOOLTIP_KEY = "validity-tooltip",
        VALIDITY_TOOLTIP_DELAY = 100,
        lastTooltipTimestamp = new Date(),
        delay = 0;

    DOM.extend("input,select,textarea", {
        constructor: function() {
            var type = this.get("type"),
                events = type === "checkbox" || type === "radio" ? ["click", "click"] : ["input", "change"];

            this
                .on(events[0], this.onPositiveValidityCheck)
                .on(events[1], this.onNegativeValidityCheck);

            attachValidityTooltip(this);
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
                        regexp = PATTERN[type];

                        if (regexp && !regexp.test(value)) errors.push(I18N_MISMATCH[type]);

                        if (type !== "textarea" && (type = this.get("pattern"))) {
                            type = "^(?:" + type + ")$";

                            if (!(regexp = PATTERN[type])) {
                                regexp = PATTERN[type] = new RegExp(type);
                            }

                            if (!regexp.test(value)) {
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
        onPositiveValidityCheck: function() {
            // maxlength fix for textarea
            if (this.matches("textarea")) {
                var maxlength = parseFloat(this.get("maxlength")),
                    value = this.get();

                if (maxlength && value.length > maxlength) {
                    this.set(value.substr(0, maxlength));
                }
            }

            if (!this.validity().length) this.fire("validity:ok");
        },
        onNegativeValidityCheck: function() {
            var errors = this.validity();

            if (errors.length) this.fire("validity:fail", errors);
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
            var errors = this.validity(), name;

            for (name in errors) {
                this.find("[name=" + name + "]").fire("validity:fail", errors[name]);
            }

            if (errors.length) {
                // fire event on form level
                this.fire("validity:fail", errors);

                return false;
            }
        },
        onFormReset: function() {
            this.findAll("[name]").each(function(el) { el.data(VALIDITY_TOOLTIP_KEY).hide() });
        }
    });

    DOM.on("validity:ok", function(target, cancel) {
        if (!cancel) {
            target.removeClass("invalid").addClass("valid");

            var validityTooltip = target.data(VALIDITY_TOOLTIP_KEY);

            if (validityTooltip) validityTooltip.hide();
        }
    });

    DOM.on("validity:fail", function(errors, target, cancel) {
        // errors could be string, array, object
        if (!cancel && (typeof errors === "string" || isArray(errors)) && errors.length) {
            if (isArray(errors)) errors = errors.join("<br>");

            target.removeClass("valid").addClass("invalid");

            var validityTooltip = target.data(VALIDITY_TOOLTIP_KEY) || attachValidityTooltip(target);

            // use a small delay if several tooltips are going to be displayed
            if (new Date() - lastTooltipTimestamp < VALIDITY_TOOLTIP_DELAY) {
                delay += VALIDITY_TOOLTIP_DELAY;
            } else {
                delay = VALIDITY_TOOLTIP_DELAY;
            }

            validityTooltip.hide().i18n(errors).show(delay);

            lastTooltipTimestamp = new Date();
        }
    });
}(window.DOM, {
    email: new RegExp("^([a-z0-9_\\.\\-\\+]+)@([\\da-z\\.\\-]+)\\.([a-z\\.]{2,6})$", "i"),
    url: new RegExp("^(https?:\\/\\/)?[\\da-z\\.\\-]+\\.[a-z\\.]{2,6}[#&+_\\?\\/\\w \\.\\-=]*$", "i"),
    tel: new RegExp("^((\\+\\d{1,3}(-| )?\\(?\\d\\)?(-| )?\\d{1,5})|(\\(?\\d{2,6}\\)?))(-| )?(\\d{3,4})(-| )?(\\d{4})(( x| ext)\\d{1,5}){0,1}$"),
    number: new RegExp("^-?[0-9]*(\\.[0-9]+)?$")
}, {
    email: "should be a valid email",
    url: "should be a valid URL",
    tel: "should be a valid phone number"
}));
