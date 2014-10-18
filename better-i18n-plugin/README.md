# better-i18n-plugin<br>[![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Bower version][fury-image]][fury-url]
> Internationalization plugin for [better-dom](https://github.com/chemerisuk/better-dom)

The project aims to solve the internationalization problem __on front-end side__. The technique used behind the scenes I call “CSS-driven internationalization” and there is a [deep article](http://www.smashingmagazine.com/2014/06/23/css-driven-internationalization-in-javascript/) about it.

## Features

* no initionalization calls on initial page load
* change current language using the `lang` attribute
* ability to change language on a DOM subtree
* supports HTML markup in localized strings

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

## Localization on front-end
The plugin introduces 2 new static functions for the `DOM` namespace: `DOM.importStrings` and `DOM.__`. The first one is used to populate DOM with new localizations for a particular language:

```js
DOM.importStrings("ru", "Enter your name", "Введите ваше имя");
// you can populate many strings in one call
DOM.importStrings("ru", {
    "string 1": "translation 1",
    "string 2": "translation 2"
    ...
});
```

This storage is private therefore you can't access to it directly. Intstead you can use `DOM.__`:

```js
alert(DOM.__("Enter your name")); // shows "Enter your name"
// change current language...
DOM.set("lang", "ru");

alert(DOM.__("Enter your name")); // shows "Введите ваше имя"
```

Function `DOM.__` can accept extra parameter `varMap` with variables used in the key string:

```js
DOM.__("your {name}", {name: "Maksim"}); // => "your Maksim"
// arrays are supported too
DOM.__("your {0}", ["Maksim"]);          // => "your Maksim"
```

## Usage with DOM elements
Let's say you need to localize a button to support multiple languages. In this case you can just use `$Element#l10n`:

```js
button.l10n("Hello world");
```

When you need to add a support for a new language just import a localized version of the string. For example the string in Russian:

```js
DOM.importStrings("ru", "Hello world", "Привет мир");
```

Now for web pages where `<html lang="ru">` the button displays `"Привет мир"` instead of `"Hello world"`. 

Also you can specify variables via declaring `{param}` in your strings:

```js
button.l10n("Hello {user}", {user: "Maksim"});
// displays "Hello Maksim"
```

For a more compact syntax arrays are supported too:

```js
button.l10n("Hello {0}", ["Maksim"]);
// displays "Hello Maksim"
```

## Integration with backend
Often you need to grab localized strings from backend. This is very easy to do using `DOM.importStrings`. In the example below I'll use [Handlebars](http://handlebarsjs.com) as a templating language and [i18n-node](https://github.com/mashpie/i18n-node).

Assuming you have stored the target locale in `res.locals.locale`, just add another variable that will store all strings as a result of `JSON.stringify` call:

```js
res.locals.catalog = JSON.stringify(i18n.getCatalog(res.locals.locale));
```

After that just add extra `script` element that will populate all those data:

```html
<!DOCTYPE html>
<html lang="{{locale}}">
...
<body>
    ...
    <script src="bower_components/better-dom/dist/better-dom.js"></script>
    <script src="build/better-i18n-plugin.js"></script>
    <!-- populate strings from backend -->
    <script>DOM.importStrings("{{locale}}",{{{catalog}}})</script>
</body>
</html>
```

Now you can use `DOM.__` with an appropriate key to get some backend string on a client side.

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
