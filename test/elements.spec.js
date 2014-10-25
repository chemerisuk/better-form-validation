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
        expect(input.validity()[0]).toBe("msg");

        input.set("title", "").fire("input");
        expect(input.validity()[0]).toBe("illegal value format");

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
        expect(input.validity()[0]).toBe("error");

        input.validity(function() { return "" });
        expect(input).toBeValid();

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

beforeEach(function() {
    jasmine.addMatchers({
        toBeValid: function() {
            return {
                compare: function(actual) {
                    var result = {};

                    if (actual) {
                        result.pass = actual.validity().valid;
                    }

                    if (!result.pass) {
                        result.message = "Expected " + actual + " to be valid";
                    }

                    return result;
                }
            };
        }
    });
});