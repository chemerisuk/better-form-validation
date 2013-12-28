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
            expect(input.validity().length).not.toBe(0);
            expect(input.validity()).toEqual(["msg"]);

            input.set("title", "").fire("input");
            expect(input.validity().length).not.toBe(0);
            expect(input.validity()).toEqual(["illegal value format"]);

            input.set("abc").fire("input");
            expect(input.validity().length).toBe(0);
        });

        it("should support custom validators", function() {
            input.validity(function() { return ["error"] });
            expect(input.validity()).toEqual(["error"]);

            input.validity(function() { return "" });
            expect(input.validity().length).not.toBe(0);

            input.validity(null);
            input.set("123");
            expect(input.validity().length).toBe(0);
        });

        it("should fire validity:fail and validity:ok", function() {
            var spy = spyOn(input.data("validity-tooltip"), "show").andCallThrough(),
                failSpy = jasmine.createSpy("validity:fail"),
                successSpy = jasmine.createSpy("validity:ok");

            expect(input.validity().length).not.toBe(0);

            input.on("validity:fail", failSpy);
            input.addClass("valid").onValidityCheck();
            expect(failSpy).toHaveBeenCalled();

            waitsFor((function(input) {
                return function() {
                    if (spy.callCount === 1) {
                        input.set("123").on("validity:ok", successSpy);
                        input.onValidityCheck();
                        return successSpy.callCount === 1;
                    }
                };
            })(input));
        });

        it("should show/hide error message when it's needed", function() {
            var validityTooltip = input.data("validity-tooltip"),
                spy = spyOn(validityTooltip, "show").andCallThrough();

            expect(validityTooltip.matches(":hidden")).toBe(true);
            input.addClass("valid").onValidityCheck();
            expect(spy).toHaveBeenCalled();

            waitsFor((function(input) {
                return function() {
                    if (spy.callCount === 1) {
                        spy = spyOn(validityTooltip, "hide");
                        input.set("123").onValidityCheck();
                        return spy.callCount === 1;
                    }
                };
            })(input));
        });
    });

    describe("forms", function() {
        it("should send invalid event when validation fails", function() {
            var form = DOM.mock("form>input[type=checkbox required name=a]+input[type=text required name=b]"),
                spy = jasmine.createSpy("validity:fail"),
                errors = [];

            form.on("validity:fail", spy).fire("submit");
            errors.a = ["can't be empty"];
            errors.b = ["can't be empty"];
            expect(spy).toHaveBeenCalledWith(errors, form, false);
        });

        it("should hide all messages on form reset", function() {
            var form = DOM.mock("form>input[type=checkbox required name=b]+input[type=text required name=c]"),
                inputs = form.findAll("[name]"),
                spys = inputs.map(function(el) { return spyOn(el.data("validity-tooltip"), "hide") });

            form.onFormReset();
            while (spys.length) expect(spys.pop()).toHaveBeenCalled();
        });

        it("should block form submit if it's invalid", function() {
            var form = DOM.mock("form>input[name=a required]+textarea+button"),
                spy = jasmine.createSpy("spy");

            form.on("submit", spy.andCallFake(function(target, cancel) {
                expect(cancel).toBe(true);
                expect(Object.keys(form.validity()).length).not.toBeFalsy();
                // prevent submitting even if the test fails
                return false;
            }));

            form.fire("submit");
            expect(spy).toHaveBeenCalled();
        });

        it("should handle checkboxes", function() {
            var form = DOM.mock("form>input[type=checkbox required name=b]");

            form.on("submit", function() { return false; }).fire("submit");
            expect(Object.keys(form.validity()).length).not.toBeFalsy();

            form.find("input").set("checked", true);
            form.fire("submit");
            expect(Object.keys(form.validity()).length).toBeFalsy();
        });

        it("should handle checkboxes and radio buttons", function() {
            var form = DOM.mock("form>input[type=radio required name=c]*3");

            form.on("submit", function() { return false; }).fire("submit");
            expect(Object.keys(form.validity()).length).not.toBeFalsy();

            form.find("input").set("checked", true);
            form.fire("submit");
            expect(Object.keys(form.validity()).length).toBeFalsy();
        });

        it("should allow to add custom validation", function() {
            var form = DOM.mock("form>input[type=text name=d]");

            expect(Object.keys(form.validity()).length).toBeFalsy();

            form.validity(function() { return form.find("input").get() ? "" : {d: ["FAIL"]} });
            expect(Object.keys(form.validity()).length).not.toBeFalsy();
        });
    });
});
