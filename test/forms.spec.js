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

/*    it("should skip some input types", function() {
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
    });*/

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
        expect(spy).toHaveBeenCalledWith(["FAIL"]);

        form.remove();
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
