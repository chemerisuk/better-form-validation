(function(DOM, VALID_CLASS, INVALID_CLASS, VALIDITY_KEY, VALIDITY_TOOLTIP_KEY, VALIDITY_TOOLTIP_DELAY, PATTERN, I18N_MISMATCH) {
    "use strict";

    var hasCheckedRadio = function(el) {
            return el.get("name") === this.get("name") && el.get("checked");
        },
        lastTooltipTimestamp = Date.now(),
        delay = 0;

    DOM.extend("input[name],select[name],textarea[name]", {
        constructor: function() {
            var type = this.get("type");

            if (type === "checkbox" || type === "radio") {
                this.on("click", this.onValidityCheck);
            } else {
                if (type === "textarea") this.on("input", this.onTextareaInput);

                this.on("input", this.onValidityCheck);
            }
        },
        validity: function(errors) {
            if (arguments.length) return this.data(VALIDITY_KEY, errors);

            var type = this.get("type"),
                value = this.get("value"),
                required = this.matches("[required]"),
                regexp;

            errors = this.data(VALIDITY_KEY);

            if (typeof errors === "function") errors = this.dispatch(errors);
            if (typeof errors === "string") errors = [errors];

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
        onValidityCheck: function() {
            var errors = this.validity();

            if (errors.length) {
                if (!this.hasClass(INVALID_CLASS) && this.hasClass(VALID_CLASS)) this.fire("validity:fail", errors);
            } else {
                if (!this.hasClass(VALID_CLASS) && this.hasClass(INVALID_CLASS)) this.fire("validity:ok");
            }
        },
        onTextareaInput: function() {
            // maxlength fix for textarea
            var maxlength = parseFloat(this.get("maxlength")),
                value = this.get();

            if (maxlength && value.length > maxlength) {
                this.set(value.substr(0, maxlength));
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

            if (typeof errors === "function") errors = this.dispatch(errors);
            if (typeof errors === "string") errors = [errors];

            return this.findAll("[name]").reduce(function(memo, el) {
                var name = el.get("name");

                if (errors && errors[name]) {
                    memo[name] = errors[name];
                } else {
                    memo[name] = el.validity && el.validity();
                    memo.length += memo[name].length;
                }

                if (!memo[name] || !memo[name].length) delete memo[name];

                return memo;
            }, Array.isArray(errors) ? errors : []);
        },
        onFormSubmit: function() {
            var errors = this.validity();

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

    DOM.on("validity:ok", function(target, _, cancel) {
        var validityTooltip = target.data(VALIDITY_TOOLTIP_KEY);

        target.removeClass(INVALID_CLASS).addClass(VALID_CLASS);

        if (!cancel && validityTooltip) validityTooltip.hide();
    });

    DOM.on("validity:fail", function(errors, target, _, cancel) {
        target.removeClass(VALID_CLASS).addClass(INVALID_CLASS);

        if (cancel || !errors.length) return;

        if (target == "form") {
            Object.keys(errors).forEach(function(name) {
                this.find("[name=\"" + name + "\"]").fire("validity:fail", errors[name]);
            });
        } else {
            var validityTooltip = target.data(VALIDITY_TOOLTIP_KEY),
                offset = target.offset();

            if (!validityTooltip) {
                validityTooltip = DOM.create("div.better-validity-tooltip").hide();

                target.data(VALIDITY_TOOLTIP_KEY, validityTooltip).before(validityTooltip);

                validityTooltip.on("click", function() {
                    validityTooltip.hide();
                    // focus to the invalid input
                    target.fire("focus");
                });
            }

            validityTooltip.style({
                "margin-top": offset.height,
                "z-index": parseFloat("0" + target.style("z-index")) + 1
            });

            // use a small delay if several tooltips are going to be displayed
            if (Date.now() - lastTooltipTimestamp < VALIDITY_TOOLTIP_DELAY) {
                delay += VALIDITY_TOOLTIP_DELAY;
            } else {
                delay = VALIDITY_TOOLTIP_DELAY;
            }

            // display only the first error
            validityTooltip.i18n(Array.isArray(errors) ? errors[0] : errors).hide().show(delay);

            lastTooltipTimestamp = Date.now();
        }
    });
}(window.DOM, "valid", "invalid", "validity", "validity-tooltip", 100, {
    email: new RegExp("^([a-z0-9_\\.\\-\\+]+)@([\\da-z\\.\\-]+)\\.([a-z\\.]{2,6})$", "i"),
    url: new RegExp("^(https?:\\/\\/)?[\\da-z\\.\\-]+\\.[a-z\\.]{2,6}[#&+_\\?\\/\\w \\.\\-=]*$", "i"),
    tel: new RegExp("^((\\+\\d{1,3}(-| )?\\(?\\d\\)?(-| )?\\d{1,5})|(\\(?\\d{2,6}\\)?))(-| )?(\\d{3,4})(-| )?(\\d{4})(( x| ext)\\d{1,5}){0,1}$"),
    number: new RegExp("^-?[0-9]*(\\.[0-9]+)?$")
}, {
    email: "should be a valid email",
    url: "should be a valid URL",
    tel: "should be a valid phone number",
    number: "should be a numeric value"
}));
