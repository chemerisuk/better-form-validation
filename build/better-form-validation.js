(function(DOM, VALIDITY_KEY, I18N_MISMATCH, undefined) {
    "use strict";

    var patterns = {};

    patterns.required = /\S/;
    patterns.number = /^-?[0-9]*(\.[0-9]+)?$/;
    patterns.email = /^([a-z0-9_\.\-\+]+)@([\da-z\.\-]+)\.([a-z\.]{2,6})$/i;
    patterns.url = /^(https?:\/\/)?[\da-z\.\-]+\.[a-z\.]{2,6}[#&+_\?\/\w \.\-=]*$/i;
    patterns.tel = /^((\+\d{1,3}(-| )?\(?\d\)?(-| )?\d{1,5})|(\(?\d{2,6}\)?))(-| )?(\d{3,4})(-| )?(\d{4})(( x| ext)\d{1,5}){0,1}$/;

    DOM.extend("input[name],select[name],textarea[name]", {
        constructor: function() {
            var type = this.get("type");

            if (type !== "checkbox" && type !== "radio") {
                this.on("input", this.onValidityCheck);
            }

            this.on("change", this.onValidityUpdate);
        },
        validity: function(errors) {var this$0 = this;
            if (errors !== undefined) {
                this.set(VALIDITY_KEY, errors);
            } else {
                errors = this.get(VALIDITY_KEY);
            }

            if (this.get("novalidate")) return [];

            var type = this.get("type"),
                required = this.get("required"),
                regexp, pattern, msg;

            if (typeof errors === "function") errors = errors.call(this);
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
                    if (!required) break;

                    var elements = this.closest("form").findAll("[name]"),
                        hasCheckedRadio = function(el)  {return el.get("name") === this$0.get("name") && el.get("checked")};

                    if (elements.some(hasCheckedRadio)) break;
                    /* falls through */
                case "checkbox":
                    if (required && !this.get("checked")) {
                        errors.push("can't be empty");
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
                        msg = "can't be empty";
                    }

                    if (regexp && !regexp.test(value)) {
                        errors.push(msg);
                    }
                }
            }

            return errors;
        },
        onValidityCheck: function() {
            var value = this.get(),
                maxlength = this.get("maxlength");

            if (maxlength >= 0 && value.length > maxlength) {
                this.set(value.substr(0, maxlength));
            }

            if (this.get("aria-invalid")) {
                var errors = this.validity();

                if (errors.length) {
                    this.fire("validity:fail", errors);
                } else {
                    this.fire("validity:ok");
                }
            }
        },
        onValidityUpdate: function() {
            var errors = this.validity();

            if (errors.length) {
                this.fire("validity:fail", errors);
            } else {
                this.fire("validity:ok");
            }
        }
    });

    DOM.extend("form", {
        constructor: function() {
            this
                .set("novalidate", "novalidate") // disable native validation
                .on("submit", this.onFormSubmit)
                .on("reset", this.onFormReset);
        },
        validity: function(errors) {
            if (errors !== undefined) {
                this.set(VALIDITY_KEY, errors);
            } else {
                errors = this.get(VALIDITY_KEY);
            }

            if (typeof errors === "function") errors = errors.call(this);
            if (typeof errors === "string") errors = {0: errors, length: 1};

            if (errors) {
                errors.length = errors.length || 0;
            } else {
                errors = {length: 0};
            }

            this.findAll("[name]").forEach(function(el)  {
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
        onFormSubmit: function() {
            var errors = this.validity();

            if (errors.length) {
                // fire event on form level
                this.fire("validity:fail", errors);

                return false;
            }
        },
        onFormReset: function() {
            this.findAll("[name]").forEach(function(el)  {
                el.set("aria-invalid", null).popover().hide();
            });
        }
    });

    DOM.on("validity:ok", ["target", "defaultPrevented"], function(target, cancel)  {
        target.set("aria-invalid", false);

        if (!cancel) target.popover().hide();
    });

    DOM.on("validity:fail", [1, 2, "target", "defaultPrevented"], function(errors, coef, target, cancel)  {
        target.set("aria-invalid", true);

        if (cancel || !errors.length) return;

        if (target.matches("form")) {
            Object.keys(errors).forEach(function(name, index)  {
                target.find("[name=\"" + name + "\"]")
                    .fire("validity:fail", errors[name], index + 1);
            });
        } else {
            var errorMessage = DOM.i18n(typeof errors === "string" ? errors : errors[0]),
                popover = target.popover(errorMessage, "left", "bottom"),
                delay = 0;

            // hiding the tooltip to show later with a small delay
            if (!popover.hasClass("better-validity-tooltip")) {
                popover.addClass("better-validity-tooltip");

                popover.on("click", function()  {
                    target.fire("focus");
                    // hide with delay to fix issue in IE10-11
                    // which trigger input event on focus
                    setTimeout(function()  { popover.hide() }, delay);
                });
            }

            delay = popover.hide().css("transition-duration");

            if (coef && delay) {
                // parse animation duration value
                delay = parseFloat(delay) * (delay.slice(-2) === "ms" ? 1 : 1000);
                // use extra delay for each next form melement
                delay = delay * coef / target.get("form").length;
            }

            // use a small delay if several tooltips are going to be displayed
            setTimeout(function()  { popover.show() }, delay);
        }
    });
}(window.DOM, "_validity", {
    email: "should be a valid email",
    url: "should be a valid URL",
    tel: "should be a valid phone number",
    number: "should be a numeric value"
}));

DOM.importStyles(".better-validity-tooltip", "position:absolute;cursor:pointer;color:#ff3329;background:#FFF;font-weight:700;text-transform:uppercase;font-size:.75em;line-height:1;padding:.5em;border:1px solid;border-radius:.25em;-webkit-box-shadow:0 0 .25em;box-shadow:0 0 .25em;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;opacity:.925;-webkit-transform:scale(1,1);-ms-transform:scale(1,1);transform:scale(1,1);-webkit-transform-origin:0 0;-ms-transform-origin:0 0;transform-origin:0 0;-webkit-transition:.3s ease-in-out;transition:.3s ease-in-out;-webkit-transition-property:-webkit-transform,opacity;transition-property:transform,opacity");
DOM.importStyles(".better-validity-tooltip[aria-hidden=true]", "opacity:0;-webkit-transform:scale(2,2);-ms-transform:scale(2,2);transform:scale(2,2)");
DOM.importStyles("input[aria-invalid]", "background:none no-repeat right center / auto 100% content-box");
DOM.importStyles("input[aria-invalid=false]", "background-image:url(data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiB2aWV3Qm94PSIwIDAgMzIgMzIiPgo8cGF0aCBmaWxsPSIjNDJCMzAwIiBkPSJNMTYgM2MtNy4xOCAwLTEzIDUuODItMTMgMTNzNS44MiAxMyAxMyAxMyAxMy01LjgyIDEzLTEzLTUuODItMTMtMTMtMTN6TTIzLjI1OCAxMi4zMDdsLTkuNDg2IDkuNDg1Yy0wLjIzOCAwLjIzNy0wLjYyMyAwLjIzNy0wLjg2MSAwbC0wLjE5MS0wLjE5MS0wLjAwMSAwLjAwMS01LjIxOS01LjI1NmMtMC4yMzgtMC4yMzgtMC4yMzgtMC42MjQgMC0wLjg2MmwxLjI5NC0xLjI5M2MwLjIzOC0wLjIzOCAwLjYyNC0wLjIzOCAwLjg2MiAwbDMuNjg5IDMuNzE2IDcuNzU2LTcuNzU2YzAuMjM4LTAuMjM4IDAuNjI0LTAuMjM4IDAuODYyIDBsMS4yOTQgMS4yOTRjMC4yMzkgMC4yMzcgMC4yMzkgMC42MjMgMC4wMDEgMC44NjJ6Ij48L3BhdGg+Cjwvc3ZnPgo=)");
DOM.importStyles("input[aria-invalid=true]", "background-image:url(data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiB2aWV3Qm94PSIwIDAgMzIgMzIiPgo8cGF0aCBmaWxsPSIjRkYzMzI5IiBkPSJNMTUuNSAzLjVjLTcuMTggMC0xMyA1LjgyLTEzIDEzczUuODIgMTMgMTMgMTMgMTMtNS44MiAxMy0xMy01LjgyLTEzLTEzLTEzek0xNS41IDIzLjg3NWMtMC44MjkgMC0xLjUtMC42NzItMS41LTEuNXMwLjY3MS0xLjUgMS41LTEuNWMwLjgyOCAwIDEuNSAwLjY3MiAxLjUgMS41cy0wLjY3MiAxLjUtMS41IDEuNXpNMTcgMTcuMzc1YzAgMC44MjgtMC42NzIgMS41LTEuNSAxLjUtMC44MjkgMC0xLjUtMC42NzItMS41LTEuNXYtN2MwLTAuODI5IDAuNjcxLTEuNSAxLjUtMS41IDAuODI4IDAgMS41IDAuNjcxIDEuNSAxLjV2N3oiPjwvcGF0aD4KPC9zdmc+Cg==)");
DOM.importStyles("input[aria-invalid][type=checkbox],input[aria-invalid][type=radio]", "background:none");
DOM.importStyles("input[aria-invalid]::-ms-clear,input[aria-invalid]::-ms-reveal", "display:none");
