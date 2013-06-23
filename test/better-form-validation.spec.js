describe("better-form-validation", function() {
    "use strict";

    describe("elements", function() {
        var input, textarea;

        beforeEach(function() {
            input = DOM.create("input[required]");
            textarea = DOM.create("textarea[maxlength=3]");

            DOM.find("body").append(input).append(textarea);

            waits(30);
        });

        afterEach(function() {
            input.remove();
            textarea.remove();
        });

        it("should validate predefined types", function() {
            runs(function() {
                // email
                input.set("type", "email");
                input.set("123").fire("input");
                expect(input.isValid()).toBe(false);
                input.set("test@").fire("input");
                expect(input.isValid()).toBe(false);
                input.set("test@test.by").fire("input");
                expect(input.isValid()).toBe(true);

                // url
                input.set("type", "url");
                input.set("123").fire("input");
                expect(input.isValid()).toBe(false);
                input.set("https://test.html").fire("input");
                expect(input.isValid()).toBe(true);
                input.set("http://test.by#a2").fire("input");
                expect(input.isValid()).toBe(true);

                // number
                input.set("type", "number");
                input.set("123").fire("input");
                expect(input.isValid()).toBe(true);
                input.set("-43434.45").fire("input");
                expect(input.isValid()).toBe(true);
                input.set("abs").fire("input");
                expect(input.isValid()).toBe(false);
            });
        });

        it("should validate by pattern attribute and use title for tooltip", function() {
            runs(function() {
                input.set("required", null).fire("input");
                expect(input.isValid()).toBe(true);

                input.set({pattern: "[a-z]+", title: "msg"});
                input.set("123").fire("input");
                expect(input.isValid()).toBe(false);
                expect(input.getValidity()).toEqual(["msg"]);

                input.set("abc").fire("input");
                expect(input.isValid()).toBe(true);
            });
        });

        it("should polyfill maxlength attribute for textarea", function() {
            runs(function() {
                textarea.set("error").fire("input");
                //expect(textarea.get()).toBe("err");
            });
        });

        it("should support custom validators", function() {
            expect(DOM.registerValidator).toBeDefined();

            DOM.registerValidator("[data-test1]", function() { return "error"; });
            DOM.registerValidator("[data-test2]", function() { return ""; });

            runs(function() {
                input.fire("input");
                expect(input.isValid()).toBe(false);
                input.set("123").fire("input");
                expect(input.isValid()).toBe(true);
                input.set("data-test1", "123").fire("input");
                expect(input.isValid()).toBe(false);
                input.set("data-test2", "321").fire("input");
                expect(input.isValid()).toBe(false);
                expect(input.getValidity()).toEqual(["error"]);
            });

            // registering validator twice check
            expect(function() { DOM.registerValidator("[data-test1]", function() {}); }).toThrow();
        });

        it("should allow to set errors manually", function() {
            runs(function() {
                input.set("required", null);
                input._checkValidity();
                expect(input.isValid()).toBe(true);
                input.setValidity(["error"]);
                input._checkValidity();
                expect(input.isValid()).toBe(false);

                // invalid arguments check
                expect(function() { input.setValidity(1); }).toThrow();
            });
        });

        it("should provide additional public methods", function() {
            runs(function() {
                expect(input.getValidity).toBeDefined();
                expect(input.setValidity).toBeDefined();
                expect(input.isValid).toBeDefined();
            });
        });

        it("should send event on success/fail", function() {
            var spyFail = jasmine.createSpy("fail"),
                spySuccess = jasmine.createSpy("success");

            DOM.on({"validation:fail": spyFail, "validation:success": spySuccess});

            runs(function() {
                input.fire("input");
                expect(spyFail).toHaveBeenCalled();
                expect(spySuccess).not.toHaveBeenCalled();

                input.set("required", null).fire("input");
                expect(spySuccess).toHaveBeenCalled();
                expect(spyFail.callCount).toBe(1);

                input.set("1232").fire("input");
                expect(spySuccess.callCount).toBe(1);
                expect(spyFail.callCount).toBe(1);
            });
        });
    });

    describe("forms", function() {
        var form, index = 0;

        beforeEach(function() {
            form = DOM.create("form#form" + (++index) + ">input[name=a required]+textarea+button");

            DOM.find("body").append(form);

            waits(30);
        });

        afterEach(function() {
            form.remove();
        });

        it("should hide all messages on form reset", function() {

        });

        it("should block form submit if it's invalid", function() {
            runs(function() {
                var spy = jasmine.createSpy("spy");

                DOM.on("submit(defaultPrevented) #form2", spy.andCallFake(function(defaultPrevented) {
                    expect(defaultPrevented).toBe(true);
                    expect(form.isValid()).toBe(false);
                    expect(form.getValidity()).toEqual({a: ["i18n:value-missing"]});
                    // prevent submitting even if the test fails
                    return false;
                }));

                form.fire("submit");
                expect(spy).toHaveBeenCalled();
            });
        });

        it("should send event on success/fail", function() {
            var spyFail = jasmine.createSpy("fail"),
                spySuccess = jasmine.createSpy("success");

            form.on("submit", function() { return false; });

            DOM.on({
                "validation:fail #form3": spyFail,
                "validation:success #form3": spySuccess
            });

            runs(function() {
                form.fire("submit");
                expect(spyFail).toHaveBeenCalled();
                expect(spySuccess).not.toHaveBeenCalled();

                form.find("input").set("required", null);
                form.fire("submit");
                expect(spySuccess).toHaveBeenCalled();
                expect(spyFail.callCount).toBe(2);
            });
        });
    });
});
