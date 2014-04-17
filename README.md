# better-form-validation [![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url]
> HTML5 form validation for [better-dom](https://github.com/chemerisuk/better-dom)

HTML5 form validation is extremely useful to make client-side data checking consistent and standards-friendly. Unfortunately at present browser support is limited to the latest versions on desktop, and some mobile browsers don't support it at all. Also current standard has lack of customization options (not possible to style tooltips or error messages), JavaScript APIs are not friendly. This project aims to solve all these issues.

[LIVE DEMO](http://chemerisuk.github.io/better-form-validation/)

## Features
* polyfills HTML5 form validation markup support for browsers (mobile browsers as well)
* [live extension](https://github.com/chemerisuk/better-dom/wiki/Live-extensions) - works for current and future content
* validity tooltips are fully customizable via CSS
* validity messages are fully custumizable (value of the `title` attribute for `[pattern]` elements is supported as well)
* custom validation via new `validity` method for inputs and forms
* `validity:ok` and `validity:fail` events for advanced interaction
* `maxlength` attribute fix for `<textarea>`
* i18n support for any message text

## Installing
Use [bower](http://bower.io/) to download this extension with all required dependencies.

    bower install better-form-validation

This will clone the latest version of the __better-form-validation__ into the `bower_components` directory at the root of your project.

Then append the following script on your page:

```html
<html>
<head>
    ...
    <link rel="stylesheet" href="bower_components/better-form-validation/dist/better-form-validation.css"/>
    <!--[if IE]>
        <link href="bower_components/better-dom/dist/better-dom-legacy.htc" rel="htc"/>
        <script src="bower_components/better-dom/dist/better-dom-legacy.js"></script>
    <![endif]-->
</head>
<body>
    ...
    <script src="bower_components/better-dom/dist/better-dom.js"></script>
    <script src="bower_components/better-form-validation/dist/better-form-validation.js"></script>
</body>
</html>
```

## Custom validation via `pattern` attribute
There are a lot of use cases when you need something more flexible than having markup that describes client-side validation. HTML5 has `pattern` attribute, that can be useful in most of such cases.

For instance you need to implement a required `fullname` field, and you know that it may contain only letters. This can look like that:

```html
<input type="text" name="fullname" required placeholder="Your name" pattern="[^\d]+" maxlength="30" title="Your name may contain only letters"/>
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
if (replyPassword.validity().length) {
    // validation fails
} else {
    // validation is passed
} 
```

## Browser support
#### Desktop
* Chrome
* Safari 6.0+
* Firefox 16+
* Opera 12.10+
* IE8+

#### Mobile
* iOS Safari 6+
* Android 2.3+
* Chrome for Android

[travis-url]: http://travis-ci.org/chemerisuk/better-form-validation
[travis-image]: https://api.travis-ci.org/chemerisuk/better-form-validation.png?branch=master

[coveralls-url]: https://coveralls.io/r/chemerisuk/better-form-validation
[coveralls-image]: https://coveralls.io/repos/chemerisuk/better-form-validation/badge.png?branch=master
