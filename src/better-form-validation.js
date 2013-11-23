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
        };

    DOM.extend("input,select,textarea", {
        constructor: function() {
            var validityTooltip = DOM.create("div.validity-tooltip").hide();

            if (this.matches("textarea")) {
                this.on("input", function() {
                    var maxlength = parseFloat(this.get("maxlength")),
                        value = this.get();

                    if (maxlength && value.length > maxlength) {
                        this.set(value.substr(0, maxlength));
                    }
                });
            }

            validityTooltip.on("click", validityTooltip.hide);

            this
                .on("blur", this.handleBlur)
                .data("validity-tooltip", validityTooltip)
                .after(validityTooltip);
        },
        invalid: function(value) {
            if (arguments.length) return this.data("validity", value);

            var validity = this.data("validity"),
                type = this.get("type"),
                value = this.get("value"),
                required = this.matches("[required]"),
                regexp;

            if (typeof validity === "function") {
                validity = validity();
            }

            if (!validity) {
                validity = [];

                switch(type) {
                case "image":
                case "submit":
                case "button":
                case "select-one":
                case "select-multiple":
                    // only check custom error case
                    return validity;

                case "radio":
                    if (!required || this.parent("form").findAll("[name]").some(hasCheckedRadio, this)) break;
                    /* falls through */
                case "checkbox":
                    if (required && !this.get("checked")) validity.push("can't be empty");
                    break;

                default:
                    if (value) {
                        regexp = predefinedPatterns[type];

                        if (regexp && !regexp.test(value)) {
                            validity.push(I18N_MISMATCH[type]);
                        }

                        if (type !== "textarea") {
                            regexp = this.get("pattern");

                            if (regexp && !new RegExp("^(?:" + regexp + ")$").test(value)) {
                                validity.push(this.get("title") || "illegal value format");
                            }
                        }
                    } else if (required) {
                        validity.push("can't be empty");
                    }
                }
            }

            return validity.length ? validity : "";
        },
        handleBlur: function() {
            var invalid = this.invalid();

            if (invalid) {
                this.fire("validity:fail", invalid);
            } else {
                this.data("validity-tooltip").hide();
                //this.fire("validity:success");
            }
        }
    });

    DOM.extend("form", {
        constructor: function() {
            // disable native validation
            this
                .set("novalidate", "novalidate");
        }
    });

    DOM.on("validity:fail", function(invalid, target, cancel) {
        if (!cancel && invalid && invalid.length) {
            if (isArray(invalid)) invalid = invalid.join("<br>");

            target.data("validity-tooltip").i18n(invalid).show();
        }
    });
}(window.DOM, {
    url: "should be a valid URL",
    email: "should be a valid email",
    tel: "should be a valid phone number"
}));
