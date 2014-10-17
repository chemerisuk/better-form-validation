describe("better-form-validation", function() {
    "use strict";

    describe("elements", function() {
        var input, body = DOM.find("body");

        beforeEach(function() {
            input = DOM.mock("input[required name=t]");
            body.append(input);
        });

        afterEach(function() {
            input.remove();
        });

        it("deosn't allow empty values for required inputs", function() {
            input.set("").fire("input");
            expect(input).not.toBeValid();

            input.set("   ").fire("input");
            expect(input).not.toBeValid();

            input.set(" 123  ").fire("input");
            expect(input).toBeValid();

            input.set("123").fire("input");
            expect(input).toBeValid();

            input.set("123").fire("input");
            expect(input).toBeValid();

            input.set(" a b").fire("input");
            expect(input).toBeValid();

            input.set("a b ").fire("input");
            expect(input).toBeValid();

            input.set(" ").fire("input");
            expect(input).not.toBeValid();
            input.set("novalidate", "novalidate");
            expect(input).toBeValid();
        });

        it("should validate email type", function() {
            input.set("type", "email");
            input.set("123").fire("input");
            expect(input).not.toBeValid();
            input.set("test@").fire("input");
            expect(input).not.toBeValid();
            input.set("test@test.by").fire("input");
            expect(input).toBeValid();

            input.set(" ").fire("input");
            expect(input).not.toBeValid();
            input.set("novalidate", "novalidate");
            expect(input).toBeValid();
        });

        it("should validate url type", function() {
            input.set("type", "url");
            input.set("123").fire("input");
            expect(input).not.toBeValid();
            input.set("https://test.html").fire("input");
            expect(input).toBeValid();
            input.set("http://test.by#a2").fire("input");
            expect(input).toBeValid();

            input.set(" ").fire("input");
            expect(input).not.toBeValid();
            input.set("novalidate", "novalidate");
            expect(input).toBeValid();
        });

        it("should validate number type", function() {
            input.set("type", "number");
            input.set("123").fire("input");
            expect(input).toBeValid();
            input.set("-43434.45").fire("input");
            expect(input).toBeValid();

            input.set(" ").fire("input");
            expect(input).not.toBeValid();
            input.set("novalidate", "novalidate");
            expect(input).toBeValid();
        });

        it("should validate by pattern attribute and use title for tooltip", function() {
            input.set("required", null).fire("input");
            expect(input).toBeValid();

            input.set({pattern: "[a-z]+", title: "msg"});
            input.set("123").fire("input");
            expect(input.validity()).toEqual(["msg"]);

            input.set("title", "").fire("input");
            expect(input.validity()).toEqual(["illegal value format"]);

            input.set("abc").fire("input");
            expect(input).toBeValid();

            input.set("").fire("input");
            expect(input).toBeValid();

            input.set(" ").fire("input");
            expect(input).not.toBeValid();
            input.set("novalidate", "novalidate");
            expect(input).toBeValid();
        });

        it("should support custom validators", function() {
            input.validity(function() {
                expect(this).toBe(input);

                return ["error"];
            });
            expect(input.validity()).toEqual(["error"]);

            input.validity(function() { return "" });
            expect(input).not.toBeValid();

            input.validity(null);
            input.set("123");
            expect(input).toBeValid();
        });

        it("should fire validity:fail and validity:ok", function() {
            var failSpy = jasmine.createSpy("validity:fail"),
                successSpy = jasmine.createSpy("validity:ok");

            expect(input).not.toBeValid();

            input.on("validity:fail", failSpy);
            input.set("aria-invalid", false).onValidityCheck();
            expect(failSpy).toHaveBeenCalled();

            input.set("123").on("validity:ok", successSpy);
            input.onValidityCheck();
            expect(successSpy).toHaveBeenCalled();
        });

        it("should skip non-form elements", function() {
            var div = DOM.mock("div[name=test]");

            expect(div.validity).toBeUndefined();
        });

        it("should focus input after clicking on the validity tooltip", function() {
            input.fire("validity:fail", "test");

            var validity = input.popover(),
                spy = jasmine.createSpy("focus");

            input.on("focus", spy);

            validity.fire("click");
            expect(spy).toHaveBeenCalled();
        });
    });

    describe("maxlength", function() {
        it("provides fix for textarea", function() {
            var textarea = DOM.mock("textarea[name=b maxlength=5]");

            textarea.set("1234567");
            textarea.onValidityCheck();
            expect(textarea.get()).toBe("12345");

            textarea.set("1234");
            textarea.onValidityCheck();
            expect(textarea.get()).toBe("1234");

            textarea.set("maxlength", null);
            textarea.set("1234567");
            textarea.onValidityCheck();
            expect(textarea.get()).toBe("1234567");
        });

        it("provides fix for input", function() {
            var input = DOM.mock("input[name=c type=number maxlength=3]");

            input.set("1234567");
            input.onValidityCheck();
            expect(input.get()).toBe("123");

            input.set("12");
            input.onValidityCheck();
            expect(input.get()).toBe("12");

            input.set("maxlength", null);
            input.set("1234567");
            input.onValidityCheck();
            expect(input.get()).toBe("1234567");
        });
    });

    describe("forms", function() {
        it("should send invalid event when validation fails", function() {
            var form = DOM.mock("form>input[type=checkbox required name=a]+textarea[required name=b]"),
                spy = jasmine.createSpy("validity:fail");

            form.on("validity:fail", spy).fire("submit");
            expect(spy).toHaveBeenCalledWith({
                a: ["can't be empty"],
                b: ["can't be empty"],
                length: 2
            });
        });

        it("should hide all messages on form reset", function() {
            var form = DOM.mock("form>input[type=checkbox required name=b]+input[type=text required name=c]"),
                inputs = form.findAll("[name]"),
                spys;

            DOM.find("body").append(form);

            expect(function() { form.onFormReset() }).not.toThrow();

            form.onFormSubmit();
            spys = inputs.map(function(el) { return spyOn(el.popover(), "hide") });

            form.onFormReset();
            spys.forEach(function(spy) {
                expect(spy).toHaveBeenCalled();
            });

            inputs.forEach(function(el) {
                expect(el.get("aria-invalid")).toBeNull();
            });

            form.remove();
        });

        it("should block form submit if it's invalid", function() {
            var form = DOM.mock("form>input[name=a required]+textarea+button[type=submit]"),
                spy = jasmine.createSpy("spy");

            form.on("submit", ["defaultPrevented"], spy.and.callFake(function(cancel) {
                expect(cancel).toBe(true);
                expect(form).not.toBeValid();
                // prevent submitting even if the test fails
                return false;
            }));

            form.fire("submit");
            expect(spy).toHaveBeenCalled();
        });

        it("should handle checkboxes", function() {
            var form = DOM.mock("form>input[type=checkbox required name=b]");

            form.on("submit", function() { return false; }).fire("submit");
            expect(form).not.toBeValid();

            form.find("input").set("checked", true);
            form.fire("submit");
            expect(form).toBeValid();
        });

        it("should handle checkboxes and radio buttons", function() {
            var form = DOM.mock("form>input[type=radio required name=c]*3");

            form.on("submit", function() { return false; }).fire("submit");
            expect(form).not.toBeValid();

            form.find("input").set("checked", true);
            form.fire("submit");
            expect(form).toBeValid();
        });

        it("should skip some input types", function() {
            var form = DOM.mock("form>input[type=image name=a required]+input[type=submit name=b required]"),
                spy = jasmine.createSpy("spy");

            form.on("submit", ["defaultPrevented"], spy.and.callFake(function(cancel) {
                expect(cancel).toBeFalsy();
                expect(form).toBeValid();
                // prevent submitting even if the test fails
                return false;
            }));

            form.fire("submit");
            expect(spy).toHaveBeenCalled();
        });

        it("should allow to add custom validation", function() {
            var form = DOM.mock("form>input[type=text name=d]");

            DOM.find("body").append(form);

            expect(form).toBeValid();

            form.validity(function() {
                expect(this).toBe(form);

                return "FAIL";
            });

            expect(form.validity()).toEqual({0: "FAIL", length: 1});

            form.validity(function() {
                expect(this).toBe(form);

                return {d: ["FAIL"]};
            });

            expect(form.validity()).toEqual({d: ["FAIL"], length: 1});
        });

        it("should fire validity:fail on invalid elements", function() {
            var form = DOM.mock("form>input[type=text name=a]"),
                input = form.find("input"),
                spy = jasmine.createSpy("validity:fail");

            DOM.find("body").append(form);

            form.validity(function() {
                expect(this).toBe(form);

                return {a: ["FAIL"]};
            });

            input.on("validity:fail", spy);
            form.onFormSubmit();
            expect(spy).toHaveBeenCalledWith(["FAIL"], 1);

            form.remove();
        });
    });

    beforeEach(function() {
        jasmine.addMatchers({
            toBeValid: function() {
                return {
                    compare: function(actual) {
                        var result = {};

                        if (actual) {
                            result.pass = actual.validity().length === 0;
                        }

                        if (!result.pass) {
                            result.message = "Expected element " + actual + " to be valid";
                        }

                        return result;
                    }
                };
            }
        });
    });
});
