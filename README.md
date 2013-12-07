# better-form-validation [![Build Status](https://api.travis-ci.org/chemerisuk/better-form-validation.png?branch=master)](http://travis-ci.org/chemerisuk/better-form-validation)
> Form validation polyfill for [better-dom](https://github.com/chemerisuk/better-dom)

[LIVE DEMO](http://chemerisuk.github.io/better-form-validation/)

## Features
* polyfills HTML5 form validation markup support for browsers
* [live extension](https://github.com/chemerisuk/better-dom/wiki/Live-extensions) - works for current and future content
* validity tooltips are fully customizable via css
* validity messages are fully custumizable (value of the `title` attribute for `[pattern]` elements is supported as well)
* programmatic configuration via new `validity` method for inputs and forms
* `validity:ok` and `validity:fail` events for advanced interaction
* `maxlength` attribute fix for `<textarea>`
* i18n support for any message text

## Installing
Use [bower](http://bower.io/) to download this extension with all required dependencies.

    bower install better-form-validation --save

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
## Browser support
* Chrome
* Safari 6.0+
* Firefox 16+
* Opera 12.10+
* IE8+