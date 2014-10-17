# better-i18n-plugin<br>[![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Bower version][fury-image]][fury-url]
> Internationalization plugin for [better-dom](https://github.com/chemerisuk/better-dom)

The project aims to solve the internationalization problem __on front-end side__. The technique used behind the scenes I call “CSS-driven internationalization” and there is a [deep article](http://www.smashingmagazine.com/2014/06/23/css-driven-internationalization-in-javascript/) about it.

## Features

* does not require initionalization calls on initial page load
* change current language using the `lang` attribute
* ability to change language on a subset of DOM elements
* supports localization of HTML strings

NOTE: currently the project can't localize empty DOM elements (like `<input>`, `<select>` etc.) or attribute values.

## Installing
Use [bower](http://bower.io/) to download this extension with all required dependencies.

    bower install better-i18n-plugin

This will clone the latest version of the __better-i18n-plugin__ into the `bower_components` directory at the root of your project.

Then append the following scripts on your page:

```html
<script src="bower_components/better-dom/dist/better-dom.js"></script>
<script src="bower_components/better-i18n-plugin/dist/better-i18n-plugin.js"></script>
```

## Usage

Let's say you need to localize a button to support multiple languages. In this case you can use `DOM.i18n` with appropriate string and set it as a `innerHTML`:

```js
button.set( DOM.i18n("Hello world") );
```

When you need to add a support for a new language just import a localized version of the string. For example the string in Russian:

```js
DOM.importStrings("ru", "Hello world", "Привет мир");
```

Now for web pages where `<html lang="ru">` the button displays `"Привет мир"` instead of `"Hello world"`. 

### Variables support
You can specify variables via declaring `{param}` in your strings:

```js
button.set( DOM.i18n("Hello {user}", {user: "Maksim"}) );
// displays "Hello Maksim"
```

For a more compact syntax you can use arrays:

```js
button.set( DOM.i18n("Hello {0}", ["Maksim"]) );
// displays "Hello Maksim"
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

[travis-url]: http://travis-ci.org/chemerisuk/better-i18n-plugin
[travis-image]: http://img.shields.io/travis/chemerisuk/better-i18n-plugin/master.svg

[coveralls-url]: https://coveralls.io/r/chemerisuk/better-i18n-plugin
[coveralls-image]: http://img.shields.io/coveralls/chemerisuk/better-i18n-plugin/master.svg

[fury-url]: http://badge.fury.io/bo/better-i18n-plugin
[fury-image]: https://badge.fury.io/bo/better-i18n-plugin.svg
