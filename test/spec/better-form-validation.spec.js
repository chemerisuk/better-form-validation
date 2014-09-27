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

        it("should validate predefined types", function() {
            // email
            input.set("type", "email");
            input.set("123").fire("input");
            expect(input.validity().length).not.toBe(0);
            input.set("test@").fire("input");
            expect(input.validity().length).not.toBe(0);
            input.set("test@test.by").fire("input");
            expect(input.validity().length).toBe(0);

            // url
            input.set("type", "url");
            input.set("123").fire("input");
            expect(input.validity().length).not.toBe(0);
            input.set("https://test.html").fire("input");
            expect(input.validity().length).toBe(0);
            input.set("http://test.by#a2").fire("input");
            expect(input.validity().length).toBe(0);

            // number
            input.set("type", "number");
            input.set("123").fire("input");
            expect(input.validity().length).toBe(0);
            input.set("-43434.45").fire("input");
            expect(input.validity().length).toBe(0);
            input.set("abs").fire("input");
            expect(input.validity().length).not.toBe(0);
        });

        it("should validate by pattern attribute and use title for tooltip", function() {
            input.set("required", null).fire("input");
            expect(input.validity().length).toBe(0);

            input.set({pattern: "[a-z]+", title: "msg"});
            input.set("123").fire("input");
            expect(input.validity()).toEqual(["msg"]);

            input.set("title", "").fire("input");
            expect(input.validity()).toEqual(["illegal value format"]);

            input.set("abc").fire("input");
            expect(input.validity().length).toBe(0);
        });

        it("should support custom validators", function() {
            input.validity(function() {
                expect(this).toBe(input);

                return ["error"];
            });
            expect(input.validity()).toEqual(["error"]);

            input.validity(function() { return "" });
            expect(input.validity().length).not.toBe(0);

            input.validity(null);
            input.set("123");
            expect(input.validity().length).toBe(0);
        });

        it("should fire validity:fail and validity:ok", function() {
            var failSpy = jasmine.createSpy("validity:fail"),
                successSpy = jasmine.createSpy("validity:ok");

            expect(input.validity().length).not.toBe(0);

            input.on("validity:fail", failSpy);
            input.set("aria-invalid", false).onValidityCheck();
            expect(failSpy).toHaveBeenCalled();

            input.set("123").on("validity:ok", successSpy);
            input.onValidityCheck();
            expect(successSpy).toHaveBeenCalled();
        });

        it("should show/hide error message when it's needed", function() {
            var validityTooltip = input.get("_validityTooltip"), spy;

            expect(validityTooltip).toBeFalsy();
            input.set("aria-invalid", false).onValidityCheck();

            validityTooltip = input.get("_validityTooltip");
            expect(validityTooltip).toBeTruthy();

            spy = spyOn(validityTooltip, "hide");
            input.set("123").onValidityCheck();
            expect(spy).toHaveBeenCalled();
        });

        it("should skip non-form elements", function() {
            var div = DOM.mock("div[name=test]");

            expect(div.validity).toBeUndefined();
        });

        it("should create tooltip on demand", function() {
            var spy = jasmine.createSpy("validity:fail"),
                validity;

            input.on("validity:fail", spy).set("aria-invalid", false);
            expect(input.get("_validityTooltip")).toBeFalsy();
            input.onValidityCheck();
            expect(spy).toHaveBeenCalled();

            validity = input.get("_validityTooltip");
            expect(validity).not.toBeFalsy();

            input.set("aria-invalid", false).onValidityCheck();
            expect(spy.calls.count()).toBe(2);
            expect(validity).toBe(validity);
        });

        it("should focus input after clicking on the validity tooltip", function() {
            input.fire("validity:fail", "test");

            var validity = input.get("_validityTooltip"),
                focusSpy = jasmine.createSpy("focus"),
                hideSpy = spyOn(validity, "hide");

            input.on("focus", focusSpy);

            validity.fire("click");
            expect(focusSpy).toHaveBeenCalled();
            expect(hideSpy).toHaveBeenCalled();
        });
    });

    describe("textarea", function() {
        var textarea;

        beforeEach(function() {
            textarea = DOM.mock("textarea[name=b]");
        });

        it("should fix maxlength attribute", function() {
            textarea.set("maxlength", 5);

            textarea.set("1234567");
            textarea.onTextareaInput();
            expect(textarea.get()).toBe("12345");

            textarea.set("1234");
            textarea.onTextareaInput();
            expect(textarea.get()).toBe("1234");
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
            spys = inputs.map(function(el) { return spyOn(el.get("_validityTooltip"), "hide") });

            form.onFormReset();
            spys.forEach(function(spy) {
                expect(spy).toHaveBeenCalled();
            });

            form.remove();
        });

        it("should block form submit if it's invalid", function() {
            var form = DOM.mock("form>input[name=a required]+textarea+button[type=submit]"),
                spy = jasmine.createSpy("spy");

            form.on("submit", ["defaultPrevented"], spy.and.callFake(function(cancel) {
                expect(cancel).toBe(true);
                expect(form.validity().length).not.toBe(0);
                // prevent submitting even if the test fails
                return false;
            }));

            form.fire("submit");
            expect(spy).toHaveBeenCalled();
        });

        it("should handle checkboxes", function() {
            var form = DOM.mock("form>input[type=checkbox required name=b]");

            form.on("submit", function() { return false; }).fire("submit");
            expect(form.validity().length).not.toBeFalsy();

            form.find("input").set("checked", true);
            form.fire("submit");
            expect(form.validity()).toEqual({length: 0});
        });

        it("should handle checkboxes and radio buttons", function() {
            var form = DOM.mock("form>input[type=radio required name=c]*3");

            form.on("submit", function() { return false; }).fire("submit");
            expect(form.validity().length).not.toBe(0);

            form.find("input").set("checked", true);
            form.fire("submit");
            expect(form.validity()).toEqual({length: 0});
        });

        it("should skip some input types", function() {
            var form = DOM.mock("form>input[type=image name=a required]+input[type=submit name=b required]"),
                spy = jasmine.createSpy("spy");

            form.on("submit", ["defaultPrevented"], spy.and.callFake(function(cancel) {
                expect(cancel).toBeFalsy();
                expect(form.validity().length).toBe(0);
                // prevent submitting even if the test fails
                return false;
            }));

            form.fire("submit");
            expect(spy).toHaveBeenCalled();
        });

        it("should allow to add custom validation", function() {
            var form = DOM.mock("form>input[type=text name=d]");

            DOM.find("body").append(form);

            expect(form.validity().length).toBe(0);

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
            expect(spy).toHaveBeenCalledWith(["FAIL"], 0);

            form.remove();
        });
    });
});
