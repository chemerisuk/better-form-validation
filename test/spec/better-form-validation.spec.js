describe("better-form-validation", function() {
    "use strict";

    describe("elements", function() {
        var input;

        beforeEach(function() {
            input = DOM.mock("input[required]");
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

    //     it("should polyfill maxlength attribute for textarea", function() {
    //         var textarea = DOM.create("textarea[maxlength=3]");

    //         textarea.set("error").fire("input");
    //         //expect(textarea.get()).toBe("err");
    //     });

        it("should support custom validators", function() {
            input.validity(function() { return ["error"] });
            expect(input.validity()).toEqual(["error"]);

            input.validity(function() { return "" });
            expect(input.validity().length).not.toBe(0);

            input.set("123");
            expect(input.validity().length).toBe(0);
        });

        it("should fire invalid event on fail", function() {
            var spy = jasmine.createSpy("invalid");

            expect(input.validity().length).not.toBe(0);

            input.on("invalid", spy).handleValidity();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe("forms", function() {
    //     it("should hide all messages on form reset", function() {

    //     });

    //     it("should block form submit if it's invalid", function() {
    //         var form = DOM.mock("form>input[name=a required]+textarea+button"),
    //             spy = jasmine.createSpy("spy");

    //         form.on("submit", spy.andCallFake(function(target, defaultPrevented) {
    //             expect(defaultPrevented).toBe(true);
    //             expect(form.isValid()).toBe(false);
    //             expect(form.getValidity()).toEqual({a: ["i18n:value-missing"]});
    //             // prevent submitting even if the test fails
    //             return false;
    //         }));

    //         form.fire("submit");
    //         expect(spy).toHaveBeenCalled();
    //     });

    //     it("should send event on success/fail", function() {
    //         var form = DOM.mock("form>input[name=a required]"),
    //             spyFail = jasmine.createSpy("fail"),
    //             spySuccess = jasmine.createSpy("success");

    //         form.on("submit", function() { return false; });

    //         form.on({
    //             "validation:fail": spyFail,
    //             "validation:success": spySuccess
    //         });

    //         form.fire("submit");
    //         expect(spyFail).toHaveBeenCalled();
    //         expect(spySuccess).not.toHaveBeenCalled();

    //         form.find("input").set("required", null);
    //         form.fire("submit");
    //         expect(spySuccess).toHaveBeenCalled();
    //         expect(spyFail.callCount).toBe(1);
    //     });

    //     it("should handle checkboxes and radio buttons", function() {
    //         var form = DOM.mock("form>input:checkbox[required name=b]");

    //         form.on("submit", function() { return false; }).fire("submit");
    //         expect(form.isValid()).toBe(false);

    //         form.find("input").set("checked", true);
    //         form.fire("submit");
    //         expect(form.isValid()).toBe(true);
    //     });

    //     it("should handle checkboxes and radio buttons", function() {
    //         var form = DOM.mock("form>input:radio[required name=c]*3");

    //         form.on("submit", function() { return false; }).fire("submit");
    //         expect(form.isValid()).toBe(false);

    //         form.find("input").set("checked", true);
    //         form.fire("submit");
    //         expect(form.isValid()).toBe(true);
    //     });

    //     it("should allow to set errors manually", function() {
    //         var form = DOM.mock("form>input[name=a required]");

    //         form.on("submit", function() { return false; });

    //         form.find("input").set("required", null).fire("submit");
    //         expect(form.isValid()).toBe(true);

    //         form.setValidity({a: ["test"]});
    //         expect(form.isValid()).toBe(false);
    //         expect(form.getValidity()).toEqual({a: ["test"]});

    //         // invalid arguments check
    //         expect(function() { form.setValidity(1); }).toThrow();
    //     });
    });
});
