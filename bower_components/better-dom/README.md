# [better-dom](https://github.com/chemerisuk/better-dom): Live extension playground<br>[![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Bower version][fury-image]][fury-url]

This library is about __ideas__. After some time of using jQuery I found that it's just too big, has lack of [features](#features) I need and some desicions of the API design is debatable. In particular [live extensions](https://github.com/chemerisuk/better-dom/wiki/Live-extensions) was one of the main ideas that encouraged me to build a new library from scratch.

[API DOCUMENTATION](http://chemerisuk.github.io/better-dom/)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/chemerisuk.svg)](https://saucelabs.com/u/chemerisuk)

## Features
* lightweight: ~5 kB gzipped
* [live extensions](https://github.com/chemerisuk/better-dom/wiki/Live-extensions)
* [getter and setter](https://github.com/chemerisuk/better-dom/wiki/Getter-and-setter)
* [animations via CSS3](https://github.com/chemerisuk/better-dom/wiki/CSS-driven-animations)
* [microtemplating using the Emmet syntax](https://github.com/chemerisuk/better-dom/wiki/Microtemplating)
* [improved event handling](https://github.com/chemerisuk/better-dom/wiki/Event-handling)

## Installation
The simplest way is to use [bower](http://bower.io/):

    $ bower install better-dom

This will clone the latest version of the __better-dom__ with dependencies into the `bower_components` directory at the root of your project. Then just include the script below on your web page:

```html
<script src="bower_components/better-dom/dist/better-dom.js"></script>
```

## Documentation
* Read the [FAQ](https://github.com/chemerisuk/better-dom/wiki/FAQ)
* Take a look at the [better-dom wiki](https://github.com/chemerisuk/better-dom/wiki)
* Check [releases tab](https://github.com/chemerisuk/better-dom/releases) for getting the changes log
* Walk through the sorce code of existing [projects that use better-dom](http://bower.io/search/?q=better-dom).

## Contributing
In order to modify the source code you have to have [gulp](http://gulpjs.com) installed globally:

    $ npm install -g gulp

The project uses set of ES6 transpilers to compile an output file that works in current browsers. You can use the commend below to start development: 

    $ npm start

After any change it recompiles `build/better-dom.js` and runs it through the unit tests.

## Notes about old IEs
For IE8-9 support you have to incude an extra file via the conditional comment below __into `<head>`__ on your page:

```
<!--[if IE]>
    <script src="bower_components/better-dom/dist/better-dom-legacy.js"></script>
<![endif]-->
```

This file bundles several important addons for IE8-9:

1. [es5-shim](https://github.com/kriskowal/es5-shim) is used to polyfill/fix missed standards-based functions for `Array`, `Object`, `Function`, `Date` classes.
2. [html5shiv](https://github.com/aFarkas/html5shiv) solves issue with HTML5 tags in IE8
3. polyfill/fix for the `input` event in IE8-9
4. `change` event fix for checkboxes and radio buttons in IE8
5. fix for bubbling of the `submit` and `reset` events in IE8

Later the library downloads `better-dom-legacy.htc` file. This file helps to implement [live extensions](https://github.com/chemerisuk/better-dom/wiki/Live-extensions) support. And that fact applies several important limitations which you should be aware of in case when legacy browser support is needed:

1) [HTC behaviors](http://msdn.microsoft.com/en-us/library/ms531079(v=vs.85).aspx) have to serve up with a `content-type` header of “text/x-component”, otherwise IE will simply ignore the file. Many web servers are preconfigured with the correct `content-type`, but others are not:

    AddType text/x-component .htc

2) IE requires that the HTC file must be in the same domain with as the HTML page which uses it. If you try to load the behavior from a different domain, you will get an “Access Denied” error.

## Browser support
#### Desktop
* Chrome
* Safari 6.0+
* Firefox 16+
* Internet Explorer 8+ (see [notes](#notes-about-old-ies))
* Opera 12.10+

#### Mobile
* iOS Safari 6+
* Android 2.3+
* Chrome for Android

Opera Mini is out of the scope because of lack of support for CSS3 Animations.

[travis-url]: http://travis-ci.org/chemerisuk/better-dom
[travis-image]: http://img.shields.io/travis/chemerisuk/better-dom/master.svg

[coveralls-url]: https://coveralls.io/r/chemerisuk/better-dom
[coveralls-image]: http://img.shields.io/coveralls/chemerisuk/better-dom/master.svg

[fury-url]: http://badge.fury.io/bo/better-dom
[fury-image]: https://badge.fury.io/bo/better-dom.svg

