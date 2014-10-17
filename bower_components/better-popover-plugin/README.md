# better-popover-plugin<br>[![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Bower version][fury-image]][fury-url]
> Popover plugin for [better-dom](https://github.com/chemerisuk/better-dom)

[LIVE DEMO](http://chemerisuk.github.io/better-popover-plugin/)

## Features
* ability to display a HTML relative to a parent element
* increases parent element `z-index` by one

## Usage

```js
el.popover("Hello", "left", "top");
el.popover("<b>alert</b>", "center");
```

## Installing
Use [bower](http://bower.io/) to download this extension with all required dependencies.

    bower install better-popover-plugin

This will clone the latest version of the __better-popover-plugin__ into the `bower_components` directory at the root of your project.

Then append the following tags on your page:

```html
<script src="bower_components/better-dom/dist/better-dom.js"></script>
<script src="bower_components/better-popover-plugin/dist/better-popover-plugin.js"></script>
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

[travis-url]: http://travis-ci.org/chemerisuk/better-popover-plugin
[travis-image]: http://img.shields.io/travis/chemerisuk/better-popover-plugin/master.svg

[coveralls-url]: https://coveralls.io/r/chemerisuk/better-popover-plugin
[coveralls-image]: http://img.shields.io/coveralls/chemerisuk/better-popover-plugin/master.svg

[fury-url]: http://badge.fury.io/bo/better-popover-plugin
[fury-image]: https://badge.fury.io/bo/better-popover-plugin.svg