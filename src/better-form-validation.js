(function(DOM, VALIDITY_KEY, I18N_MISMATCH, undefined) {
    "use strict";

    var patterns = {};
    var invalidTypes = [null, "file", "image", "submit", "fieldset", "reset", "button"];

    patterns.required = /\S/;
    patterns.number = /^-?[0-9]*(\.[0-9]+)?$/;
    patterns.email = /^([a-z0-9_\.\-\+]+)@([\da-z\.\-]+)\.([a-z\.]{2,6})$/i;
    patterns.url = /^(https?:\/\/)?[\da-z\.\-]+\.[a-z\.]{2,6}[#&+_\?\/\w \.\-=]*$/i;
    patterns.tel = /^((\+\d{1,3}(-| )?\(?\d\)?(-| )?\d{1,5})|(\(?\d{2,6}\)?))(-| )?(\d{3,4})(-| )?(\d{4})(( x| ext)\d{1,5}){0,1}$/;

    DOM.extend("[name]", (el) => invalidTypes.indexOf(el.get("type")) < 0, {
        constructor() {
            var type = this.get("type");

            if (type !== "checkbox" && type !== "radio") {
                this.on("input", this.onValidityCheck);
            }

            this.on("change", this.onValidityUpdate);
            /* istanbul ignore if */
            if (typeof this.get("required") !== "boolean") {
                ["required", "noValidate"].forEach((propName) => {
                    this.defineAttribute(propName, {
                        get: this.doGetBooleanProp(propName),
                        set: this.doSetBooleanProp(propName)
                    });
                });
            }
        },
        doGetBooleanProp(name) {
            return (attrValue) => {
                attrValue = String(attrValue).toLowerCase();

                return attrValue === "" || attrValue === name.toLowerCase();
            };
        },
        doSetBooleanProp(name) {
            return (propValue) => {
                var currentValue = this.get(name);

                propValue = !!propValue;

                if (currentValue !== propValue) {
                    return propValue ? "" : null;
                }
            };
        },
        validity(errors) {
            if (errors !== undefined) {
                this.set(VALIDITY_KEY, errors);
            } else {
                errors = this.get(VALIDITY_KEY);
            }

            if (this.get("novalidate") != null) return [];

            var type = this.get("type"),
                required = this.get("required"),
                regexp, pattern, msg;

            if (typeof errors === "function") errors = errors.call(this);
            if (typeof errors === "string") errors = [errors];

            errors = errors || [];

            if (!errors.length) {
                switch(type) {
                case "radio":
                    if (!required) break;

                    let elements = this.closest("form").findAll("[name]"),
                        hasCheckedRadio = (el) => el.get("name") === this.get("name") && el.get("checked");

                    if (elements.some(hasCheckedRadio)) break;
                    /* falls through */
                case "checkbox":
                    if (required && !this.get("checked")) {
                        errors.push("can't be empty");
                    }
                    break;

                default:
                    let value = this.get("value");
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
                        msg = "can't be empty";
                    }

                    if (regexp && !regexp.test(value)) {
                        errors.push(msg);
                    }
                }
            }

            return errors;
        },
        onValidityCheck() {
            var value = this.get(),
                maxlength = this.get("maxlength");

            if (maxlength >= 0 && value.length > maxlength) {
                this.set(value.substr(0, maxlength));
            }

            var form = DOM.constructor(this.get("form"));

            if (this.get("novalidate") != null || form.get("novalidate") != null) return;

            if (this.get("aria-invalid")) {
                var errors = this.validity();

                if (errors.length) {
                    this.fire("validity:fail", errors);
                } else {
                    this.fire("validity:ok");
                }
            }
        },
        onValidityUpdate() {
            var form = DOM.constructor(this.get("form"));

            if (this.get("novalidate") != null || form.get("novalidate") != null) return;

            var errors = this.validity();

            if (errors.length) {
                this.fire("validity:fail", errors);
            } else {
                this.fire("validity:ok");
            }
        }
    });

    DOM.extend("form", {
        constructor() {
            if (typeof this.get("noValidate") === "boolean") {
                let timeoutId;
                // have to use legacy addEventListener because
                // the invalid event does not bubble
                this[0].addEventListener("invalid", (e) => {
                    e.preventDefault(); // don't show tooltips

                    if (!timeoutId) {
                        timeoutId = setTimeout(() => {
                            // trigger submit event manually
                            this.fire("submit");

                            timeoutId = null;
                        });
                    }
                }, true);
            }

            this
                .on("submit", this.onFormSubmit)
                .on("reset", this.onFormReset);
        },
        validity(errors) {
            if (errors !== undefined) {
                this.set(VALIDITY_KEY, errors);
            } else {
                errors = this.get(VALIDITY_KEY);
            }

            if (this.get("novalidate") != null) return {length: 0};

            if (typeof errors === "function") errors = errors.call(this);
            if (typeof errors === "string") errors = {0: errors, length: 1};

            if (errors) {
                errors.length = errors.length || 0;
            } else {
                errors = {length: 0};
            }

            this.findAll("[name]").forEach((el) => {
                var name = el.get("name");

                if (!(name in errors)) {
                    errors[name] = el.validity && el.validity();
                }

                if (errors[name] && errors[name].length) {
                    errors.length += errors[name].length;
                } else {
                    delete errors[name];
                }
            });

            return errors;
        },
        onFormSubmit() {
            var errors = this.validity();

            if (errors.length) {
                // fire event on form level
                this.fire("validity:fail", errors);

                return false;
            }
        },
        onFormReset() {
            this.findAll("[name]").forEach((el) => {
                el.set("aria-invalid", null).popover().hide();
            });
        }
    });

    DOM.on("validity:ok", ["target", "defaultPrevented"], (target, cancel) => {
        target.set("aria-invalid", false);

        if (!cancel) target.popover().hide();
    });

    DOM.on("validity:fail", [1, 2, "target", "defaultPrevented"], (errors, batch, target, cancel) => {
        target.set("aria-invalid", true);

        if (cancel || !errors.length) return;

        if (target.matches("form")) {
            Object.keys(errors).forEach((name) => {
                target.find("[name=\"" + name + "\"]")
                    .fire("validity:fail", errors[name], true);
            });
        } else {
            var popover = target.popover(),
                delay = 0;

            // hiding the tooltip to show later with a small delay
            if (!popover.hasClass("better-validity-tooltip")) {
                popover = target
                    .popover(null, "left", "bottom")
                    .addClass("better-validity-tooltip")
                    .on("click", () => {
                        target.fire("focus");
                        // hide with delay to fix issue in IE10-11
                        // which trigger input event on focus
                        setTimeout(() => { popover.hide() }, delay);
                    });
            }
            // set error message
            popover.l10n(typeof errors === "string" ? errors : errors[0]);

            if (batch) {
                // hide popover and show it later with delay
                delay = popover.hide().css("transition-duration");
                // parse animation duration value
                delay = delay && parseFloat(delay) * (delay.slice(-2) === "ms" ? 1 : 1000);
            }

            // use a small delay if several tooltips are going to be displayed
            setTimeout(() => { popover.show() }, delay || 0);
        }
    });
}(window.DOM, "_validity", {
    email: "should be a valid email",
    url: "should be a valid URL",
    tel: "should be a valid phone number",
    number: "should be a numeric value"
}));
