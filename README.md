# better-form-validation<br>[![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Bower version][bower-image]][bower-url]
> Form validation using [better-dom](https://github.com/chemerisuk/better-dom)

HTML5 form validation is extremely useful to make client-side data checking consistent and standards-friendly. Unfortunately at present browser support is limited to the latest versions on desktop, and some mobile browsers don't support it at all. Also the current standard has lack of customization options (not possible to style tooltips or error messages), JavaScript APIs are not developer-friendly. This project aims to solve all issues above.

[LIVE DEMO](http://chemerisuk.github.io/better-form-validation/)

## Features
* polyfills HTML5 form validation markup support for browsers (mobile browsers as well)
* [live extension](https://github.com/chemerisuk/better-dom/wiki/Live-extensions) - works for current and future content
* validity tooltips are fully customizable (messages and presentation)
* custom validation via new `validity` method for inputs and forms (instead of `setCustomValidity`)
* new `validity:ok` and `validity:fail` events that bubble (unlike standard `invalid`)
* polyfills `novalidate` and `required` properties in browsers that do not support them natively
* standards-based `aria-invalid` for styling inputs in CSS instead of broken `:valid` and `:invalid`
* `maxlength` attribute fix for  `<input type="number">` and `<textarea>`

## Installing
Use [bower](http://bower.io/) to download this extension with all required dependencies.

```sh
$ bower install better-form-validation
```

This will clone the latest version of the __better-form-validation__ into the `bower_components` directory at the root of your project.

Then append the following tags on your page:

```html
<script src="bower_components/better-dom/dist/better-dom.js"></script>
<script src="bower_components/better-i18n-plugin/dist/better-i18n-plugin.js"></script>
<script src="bower_components/better-popover-plugin/dist/better-popover-plugin.js"></script>
<script src="bower_components/better-form-validation/dist/better-form-validation.js"></script>
```

## Custom validation via `pattern` attribute
There are a lot of use cases when you need something more flexible than having markup that describes client-side validation. HTML5 has `pattern` attribute, that can be useful in most of such cases.

For instance you need to implement a required `fullname` field, and you know that it may contain only letters. This can look like that:

```html
<input type="text" name="fullname" pattern="\w+" title="Only letters, please"/>
```

So the `pattern` attribute allows you to use regexp for checking field value, without any extra JavaScript. By default problematic value displays tooltip `"illegal value format"` but you can change it by specifying the `title` attribute value (as in example above).

## Custom validation via `validity` method
Sometimes `pattern` attribute doesn't work as well. For instance when you need to integrate validation with external plugins, or when you just need a more complex validation (like AJAX validation etc.). To handle such cases you can use `validity` method that provides full access to form validation.

Let's implement a simple "passwords should match" check.

```js
var form = DOM.find("#myform"),
    password = form.find("[name=password]"),
    replyPassword = form.find("[name=reply_password]");

replyPassword.validity(function() {
     if (password.get() !== replyPassword.get()) {
        return "passwords should match";
    }
});
```

As you can see I use `validity` to set a function that will do validation. If the function returns non-empty string - this means that validation fails.

Calling `validity` method without arguments returns current array of error(s). Therefore you can use it to check field value manually:

```js
if (replyPassword.validity().valid) {
    // validation is passed
} else {
    // validation fails
} 
```

## CSS customization
Current standard has pseudo-selectors `:valid`, `:invalid` to capture an element in the appropriate state. The problem is that they are broken: `:valid` and `:invalid` applies immediately on a page load, even when user didn't touch the form.

To fix the issue polyfill uses standards-based [`aria-invalid`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_aria-invalid_attribute) attribute instead. Initially elements do not have this attribute, but as soon as user changed a value of an input (`"change"` event) or tried to submit the form (`"submit"` event) the attribute is set to `true` if the value is fine, or `false` otherwise.

By default elements with `aria-invalid` have a success or fail icon on the right side of the input. But you can your owns style rules of course.

Code example:
```css
/* reset user agent styles */
:invalid {
    outline: inherit;
    box-shadow: inherit;
}

input[aria-invalid]::-ms-clear,
input[aria-invalid]::-ms-reveal {
    display: none;
}

/* change background depending on value validity */
input[aria-invalid=false] {
    background-color: #42B300;
}

input[aria-invalid=true] {
    background-color: #FF5300;
}
```

## Browser support
#### Desktop
* Chrome
* Safari 6.0+
* Firefox 16+
* Opera 12.10+
* Internet Explorer 8+ (see [notes](https://github.com/chemerisuk/better-dom#notes-about-old-ies))

#### Mobile
* iOS Safari 6+
* Android 2.3+
* Chrome for Android

[travis-url]: http://travis-ci.org/chemerisuk/better-form-validation
[travis-image]: http://img.shields.io/travis/chemerisuk/better-form-validation/master.svg

[coveralls-url]: https://coveralls.io/r/chemerisuk/better-form-validation
[coveralls-image]: http://img.shields.io/coveralls/chemerisuk/better-form-validation/master.svg

[bower-url]: https://github.com/chemerisuk/better-form-validation
[bower-image]: http://img.shields.io/bower/v/better-form-validation.svg
