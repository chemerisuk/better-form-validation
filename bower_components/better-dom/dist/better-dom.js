/**
 * @file better-dom.js
 * @overview better-dom: Live extension playground
 * @version 2.1.0-beta.2 Sun, 30 Nov 2014 12:47:27 GMT
 * @copyright 2013-2014 Maksim Chemerisuk
 * @license MIT
 * @see https://github.com/chemerisuk/better-dom
 */
(function() {
    "use strict";var SLICE$0 = Array.prototype.slice;
    var WINDOW = window;
    var DOCUMENT = document;
    var HTML = DOCUMENT.documentElement;

    var userAgent = WINDOW.navigator.userAgent;
    var jscriptVersion = WINDOW.ScriptEngineMajorVersion;

    var JSCRIPT_VERSION = jscriptVersion && jscriptVersion();
    var LEGACY_ANDROID = ~userAgent.indexOf("Android") && userAgent.indexOf("Chrome") < 0;
    var WEBKIT_PREFIX = WINDOW.WebKitAnimationEvent ? "-webkit-" : "";
    var CUSTOM_EVENT_TYPE = "dataavailable";

    var NODE_DATA = "__2001000-beta002__";
    var HANDLERS_DATA = "handlers2001000-beta002";
    var WATCHERS_DATA = "watchers2001000-beta002";
    var EXTENSIONS_DATA = "extensions2001000-beta002";
    var FRAME_DATA = "frame2001000-beta002";
    var CONTEXT_DATA = "context2001000-beta002";

    function $NullElement() {}

    function $Element(node) {
        if (this instanceof $Element) {
            if (node) {
                this[0] = node;
                // use a generated property to store a reference
                // to the wrapper for circular object binding
                node[NODE_DATA] = this;

                this._ = {};
                this._[HANDLERS_DATA] = [];
                this._[WATCHERS_DATA] = {};
                this._[EXTENSIONS_DATA] = [];
                this._[CONTEXT_DATA] = {};
            }


        } else if (node) {
            var cached = node[NODE_DATA];
            // create a wrapper only once for each native element
            return cached ? cached : new $Element(node);
        } else {
            return new $NullElement();
        }
    }

    $Element.prototype = {
        constructor: function(node) {
            // filter non elements like text nodes, comments etc.
            return $Element(node && node.nodeType === 1 ? node : null);
        },
        toString: function() {
            var node = this[0];

            return node ? "<" + node.tagName.toLowerCase() + ">" : "";
        },
        version: "2.1.0-beta.2"
    };

    $NullElement.prototype = new $Element();

    function $Document(node) {
        if (node && node.nodeType === 9) {
            node = node.documentElement;
        }

        $Element.call(this, node);
    }

    $Document.prototype = new $Element();

    var DOM = new $Document(DOCUMENT);

    var util$index$$arrayProto = Array.prototype;

    var util$index$$default = {
        computeStyle: function(node) {
            if (JSCRIPT_VERSION < 9) {
                return node.currentStyle;
            } else {
                return WINDOW.getComputedStyle(node);
            }
        },
        injectElement: function(el) {
            if (el && el.nodeType === 1) {
                return el.ownerDocument.getElementsByTagName("head")[0].appendChild(el);
            }
        },
        // utilites
        every: util$index$$arrayProto.every,
        each: util$index$$arrayProto.forEach,
        filter: util$index$$arrayProto.filter,
        map: util$index$$arrayProto.map,
        slice: util$index$$arrayProto.slice,
        isArray: Array.isArray,
        keys: Object.keys,
        safeInvoke: function(context, fn, arg1, arg2) {
            if (typeof fn === "string") fn = context[fn];

            try {
                return fn.call(context, arg1, arg2);
            } catch (err) {
                WINDOW.setTimeout(function()  { throw err }, 1);

                return false;
            }
        },
        register: function(mixins, defaultBehavior) {
            defaultBehavior = defaultBehavior || function() {};

            Object.keys(mixins).forEach(function(key)  {
                var defaults = defaultBehavior(key) || function() { return this };

                $Element.prototype[key] = mixins[key];
                $NullElement.prototype[key] = defaults;
            });
        },
        getLegacyFile: function(type) {
            if (JSCRIPT_VERSION < 10) {
                var legacyScripts = util$index$$arrayProto.filter.call(DOCUMENT.scripts, function(el)  {return el.src.indexOf("better-dom-legacy.js") >= 0});

                if (legacyScripts.length < 1) {
                    throw new Error("In order to use live extensions in IE < 10 you have to include extra files. See https://github.com/chemerisuk/better-dom#notes-about-old-ies for details.");
                }

                return legacyScripts[0].src.replace(".js", "." + type);
            }
        }
    };

    // customized errors

    function errors$$MethodError(methodName, args) {var type = arguments[2];if(type === void 0)type = "$Element";
        var url = "http://chemerisuk.github.io/better-dom/" + type + ".html#" + methodName,
            line = "invalid call `" + type + (type === "DOM" ? "." : "#") + methodName + "(";

        line += util$index$$default.map.call(args, function(arg)  {return String(arg)}).join(", ") + ")`;";

        this.message = line + " check " + url + " to verify the function arguments";
    }

    errors$$MethodError.prototype = new TypeError();

    function errors$$StaticMethodError(methodName, args) {
        errors$$MethodError.call(this, methodName, args, "DOM");
    }

    errors$$StaticMethodError.prototype = new TypeError();

    /* es6-transpiler has-iterators:false, has-generators: false */

    var // operator type / priority object
        global$emmet$$operators = {"(": 1,")": 2,"^": 3,">": 4,"+": 5,"*": 6,"`": 7,"[": 8,".": 8,"#": 8},
        global$emmet$$reParse = /`[^`]*`|\[[^\]]*\]|\.[^()>^+*`[#]+|[^()>^+*`[#.]+|\^+|./g,
        global$emmet$$reAttr = /\s*([\w\-]+)(?:=((?:`([^`]*)`)|[^\s]*))?/g,
        global$emmet$$reIndex = /(\$+)(?:@(-)?(\d+)?)?/g,
        global$emmet$$reDot = /\./g,
        global$emmet$$reDollar = /\$/g,
        global$emmet$$tagCache = {"": ""},
        global$emmet$$normalizeAttrs = function(_, name, value, rawValue)  {
            // try to detemnie which kind of quotes to use
            var quote = value && value.indexOf("\"") >= 0 ? "'" : "\"";

            if (typeof rawValue === "string") {
                // grab unquoted value for smart quotes
                value = rawValue;
            } else if (typeof value !== "string") {
                // handle boolean attributes by using name as value
                value = name;
            }
            // always wrap attribute values with quotes even they don't exist
            return " " + name + "=" + quote + value + quote;
        },
        global$emmet$$injectTerm = function(term, end)  {return function(html)  {
            // find index of where to inject the term
            var index = end ? html.lastIndexOf("<") : html.indexOf(">");
            // inject the term into the HTML string
            return html.slice(0, index) + term + html.slice(index);
        }},
        global$emmet$$makeTerm = function(tag)  {
            return global$emmet$$tagCache[tag] || (global$emmet$$tagCache[tag] = "<" + tag + "></" + tag + ">");
        },
        global$emmet$$makeIndexedTerm = function(n, term)  {
            var result = Array(n), i;

            for (i = 0; i < n; ++i) {
                result[i] = term.replace(global$emmet$$reIndex, function(expr, fmt, sign, base)  {
                    var index = (sign ? n - i - 1 : i) + (base ? +base : 1);
                    // handle zero-padded index values, like $$$ etc.
                    return (fmt + index).slice(-fmt.length).replace(global$emmet$$reDollar, "0");
                });
            }

            return result;
        },
        global$emmet$$reUnsafe = /[&<>"']/g,
        // http://stackoverflow.com/questions/6234773/can-i-escape-html-special-chars-in-javascript
        global$emmet$$safeSymbol = {"&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;"};

    // populate empty tag names with result
    "area base br col hr img input link meta param command keygen source".split(" ").forEach(function(tag)  {
        global$emmet$$tagCache[tag] = "<" + tag + ">";
    });

    DOM.emmet = function(template, varMap) {var $D$0;var $D$1;var $D$2;
        if (typeof template !== "string") throw new errors$$StaticMethodError("emmet", arguments);

        if (varMap) template = DOM.format(template, varMap);

        if (template in global$emmet$$tagCache) {return global$emmet$$tagCache[template];}

        // transform template string into RPN

        var stack = [], output = [];

        $D$2 = (template.match(global$emmet$$reParse));$D$0 = 0;$D$1 = $D$2.length;for (var str ;$D$0 < $D$1;){str = ($D$2[$D$0++]);
            var op = str[0];
            var priority = global$emmet$$operators[op];

            if (priority) {
                if (str !== "(") {
                    // for ^ operator need to skip > str.length times
                    for (var i = 0, n = (op === "^" ? str.length : 1); i < n; ++i) {
                        while (stack[0] !== op && global$emmet$$operators[stack[0]] >= priority) {
                            var head = stack.shift();

                            output.push(head);
                            // for ^ operator stop shifting when the first > is found
                            if (op === "^" && head === ">") break;
                        }
                    }
                }

                if (str === ")") {
                    stack.shift(); // remove "(" symbol from stack
                } else {
                    // handle values inside of `...` and [...] sections
                    if (op === "[" || op === "`") {
                        output.push(str.slice(1, -1));
                    }
                    // handle multiple classes, e.g. a.one.two
                    if (op === ".") {
                        output.push(str.slice(1).replace(global$emmet$$reDot, " "));
                    }

                    stack.unshift(op);
                }
            } else {
                output.push(str);
            }
        };$D$0 = $D$1 = $D$2 = void 0;

        output = output.concat(stack);

        // transform RPN into html nodes

        stack = [];

        $D$0 = 0;$D$1 = output.length;for (var str$0 ;$D$0 < $D$1;){str$0 = (output[$D$0++]);
            if (str$0 in global$emmet$$operators) {
                var value = stack.shift();
                var node = stack.shift();

                if (typeof node === "string") {
                    node = [ global$emmet$$makeTerm(node) ];
                }

                switch(str$0) {
                case ".":
                    value = global$emmet$$injectTerm(" class=\"" + value + "\"");
                    break;

                case "#":
                    value = global$emmet$$injectTerm(" id=\"" + value + "\"");
                    break;

                case "[":
                    value = global$emmet$$injectTerm(value.replace(global$emmet$$reAttr, global$emmet$$normalizeAttrs));
                    break;

                case "*":
                    node = global$emmet$$makeIndexedTerm(+value, node.join(""));
                    break;

                case "`":
                    stack.unshift(node);
                    // escape unsafe HTML symbols
                    node = [ value.replace(global$emmet$$reUnsafe, function(ch)  {return global$emmet$$safeSymbol[ch]}) ];
                    break;

                default: /* ">", "+", "^" */
                    value = typeof value === "string" ? global$emmet$$makeTerm(value) : value.join("");

                    if (str$0 === ">") {
                        value = global$emmet$$injectTerm(value, true);
                    } else {
                        node.push(value);
                    }
                }

                str$0 = typeof value === "function" ? node.map(value) : node;
            }

            stack.unshift(str$0);
        };$D$0 = $D$1 = void 0;

        if (output.length === 1) {
            // handle single tag case
            output = global$emmet$$makeTerm(stack[0]);
        } else {
            output = stack[0].join("");
        }

        return output;
    };

    var global$emmet$$default = global$emmet$$tagCache;

    var document$create$$makeMethod = function(all)  {return function(value, varMap) {
            var doc = this[0].ownerDocument,
                sandbox = doc.createElement("div");

            this["create" + all] = function(value, varMap)  {
                var nodes, el;

                if (value && value in global$emmet$$default) {
                    nodes = doc.createElement(value);

                    if (all) nodes = [ new $Element(nodes) ];
                } else {
                    value = value.trim();

                    if (value[0] === "<" && value[value.length - 1] === ">") {
                        value = varMap ? DOM.format(value, varMap) : value;
                    } else {
                        value = DOM.emmet(value, varMap);
                    }

                    sandbox.innerHTML = value; // parse input HTML string

                    for (nodes = all ? [] : null; el = sandbox.firstChild; ) {
                        sandbox.removeChild(el); // detach element from the sandbox

                        if (el.nodeType === 1) {
                            if (all) {
                                nodes.push(new $Element(el));
                            } else {
                                nodes = el;

                                break; // stop early, because need only the first element
                            }
                        }
                    }
                }

                return all ? nodes : $Element(nodes);
            };

            return this["create" + all](value, varMap);
        }};

    $Document.prototype.create = document$create$$makeMethod("");

    $Document.prototype.createAll = document$create$$makeMethod("All");

    $Document.prototype.importScripts = function() {var urls = SLICE$0.call(arguments, 0);
        var doc = this[0].ownerDocument;

        var callback = function()  {
            var arg = urls.shift(),
                argType = typeof arg,
                script;

            if (argType === "string") {
                script = doc.createElement("script");
                script.src = arg;
                script.onload = callback;
                script.async = true;

                util$index$$default.injectElement(script);
            } else if (argType === "function") {
                arg();
            } else if (arg) {
                throw new errors$$StaticMethodError("importScripts", arguments);
            }
        };

        callback();
    };

    $Document.prototype.importStyles = function(selector, cssText) {
        var doc = this[0].ownerDocument,
            styleNode = util$index$$default.injectElement(doc.createElement("style")),
            styleSheet = styleNode.sheet || styleNode.styleSheet,
            styleRules = styleSheet.cssRules || styleSheet.rules;

        // override prototype method with actual implementation
        this.importStyles = function(selector, cssText)  {
            if (typeof selector !== "string" || typeof cssText !== "string") {
                throw new errors$$StaticMethodError("importStyles", arguments);
            }

            // insert rules one by one because of several reasons:
            // 1. IE8 does not support comma in a selector string
            // 2. if one selector fails it doesn't break others
            selector.split(",").forEach(function(selector)  {
                try {
                    if (styleSheet.cssRules) {
                        styleSheet.insertRule(selector + "{" + cssText + "}", styleRules.length);
                    } else if (selector[0] !== "@") {
                        styleSheet.addRule(selector, cssText);
                    } else {
                        // addRule doesn't support at-rules, use cssText instead
                        styleSheet.cssText += selector + "{" + cssText + "}";
                    }
                } catch(err) {
                    // silently ignore invalid rules
                }
            });
        };

        return this.importStyles(selector, cssText);
    };

    // Helper for css selectors

    /*es6-transpiler has-iterators:false, has-generators: false*/
    var util$selectormatcher$$rquickIs = /^(\w*)(?:#([\w\-]+))?(?:\[([\w\-\=]+)\])?(?:\.([\w\-]+))?$/,
        util$selectormatcher$$propName = "m oM msM mozM webkitM".split(" ").reduce(function(result, prefix)  {
                var propertyName = prefix + "atchesSelector";

                return result || HTML[propertyName] && propertyName;
            }, null);

    var util$selectormatcher$$default = function(selector, context) {
        if (typeof selector !== "string") return null;

        var quick = util$selectormatcher$$rquickIs.exec(selector);

        if (quick) {
            //   0  1    2   3          4
            // [ _, tag, id, attribute, class ]
            if (quick[1]) quick[1] = quick[1].toLowerCase();
            if (quick[3]) quick[3] = quick[3].split("=");
            if (quick[4]) quick[4] = " " + quick[4] + " ";
        }

        return function(node) {var $D$3;var $D$4;
            var result, found;
            if (!quick && !util$selectormatcher$$propName) {
                found = (context || DOCUMENT).querySelectorAll(selector);
            }

            for (; node && node.nodeType === 1; node = node.parentNode) {
                if (quick) {
                    result = (
                        (!quick[1] || node.nodeName.toLowerCase() === quick[1]) &&
                        (!quick[2] || node.id === quick[2]) &&
                        (!quick[3] || (quick[3][1] ? node.getAttribute(quick[3][0]) === quick[3][1] : node.hasAttribute(quick[3][0]))) &&
                        (!quick[4] || (" " + node.className + " ").indexOf(quick[4]) >= 0)
                    );
                } else {
                    if (util$selectormatcher$$propName) {
                        result = node[util$selectormatcher$$propName](selector);
                    } else {
                        $D$3 = 0;$D$4 = found.length;for (var n ;$D$3 < $D$4;){n = (found[$D$3++]);
                            if (n === node) return n;
                        };$D$3 = $D$4 = void 0;
                    }
                }

                if (result || !context || node === context) break;
            }

            return result && node;
        };
    };

    var element$children$$makeMethod = function(all)  {return function(selector) {
        if (all) {
            if (selector && typeof selector !== "string") throw new errors$$MethodError("children", arguments);
        } else {
            if (selector && typeof selector !== "number") throw new errors$$MethodError("child", arguments);
        }

        var node = this[0],
            matcher = util$selectormatcher$$default(selector),
            children = node.children;
        if (JSCRIPT_VERSION < 9) {
            // fix IE8 bug with children collection
            children = util$index$$default.filter.call(children, function(node)  {return node.nodeType === 1});
        }

        if (all) {
            if (matcher) children = util$index$$default.filter.call(children, matcher);

            return util$index$$default.map.call(children, $Element);
        } else {
            if (selector < 0) selector = children.length + selector;

            return $Element(children[selector]);
        }
    }};

    util$index$$default.register({
        child: element$children$$makeMethod(false),

        children: element$children$$makeMethod(true)
    }, function(methodName)  {
        return methodName === "child" ? function()  {return new $NullElement()} : function()  {return []};
    });

    /* es6-transpiler has-iterators:false, has-generators: false */

    var element$classes$$reSpace = /[\n\t\r]/g,
        element$classes$$makeMethod = function(nativeMethodName, strategy)  {
            var methodName = nativeMethodName === "contains" ? "hasClass" : nativeMethodName + "Class";
            if (HTML.classList) {
                // use native classList property if possible
                strategy = function(el, token) {
                    return el[0].classList[nativeMethodName](token);
                };
            }

            if (methodName === "hasClass" || methodName === "toggleClass") {
                return function(token, force) {
                    if (typeof force === "boolean" && methodName === "toggleClass") {
                        this[force ? "addClass" : "removeClass"](token);

                        return force;
                    }

                    if (typeof token !== "string") throw new errors$$MethodError(methodName, arguments);

                    return strategy(this, token);
                };
            } else {
                return function() {var $D$5;var $D$6;
                    var tokens = arguments;

                    $D$5 = 0;$D$6 = tokens.length;for (var token ;$D$5 < $D$6;){token = (tokens[$D$5++]);
                        if (typeof token !== "string") throw new errors$$MethodError(methodName, arguments);

                        strategy(this, token);
                    };$D$5 = $D$6 = void 0;

                    return this;
                };
            }
        };

    util$index$$default.register({
        hasClass: element$classes$$makeMethod("contains", function(el, token)  {
            return (" " + el[0].className + " ")
                .replace(element$classes$$reSpace, " ").indexOf(" " + token + " ") >= 0;
        }),

        addClass: element$classes$$makeMethod("add", function(el, token)  {
            if (!el.hasClass(token)) el[0].className += " " + token;
        }),

        removeClass: element$classes$$makeMethod("remove", function(el, token)  {
            el[0].className = (" " + el[0].className + " ")
                .replace(element$classes$$reSpace, " ").replace(" " + token + " ", " ").trim();
        }),

        toggleClass: element$classes$$makeMethod("toggle", function(el, token)  {
            var hasClass = el.hasClass(token);

            if (hasClass) {
                el.removeClass(token);
            } else {
                el[0].className += " " + token;
            }

            return !hasClass;
        })
    }, function(methodName)  {
        if (methodName === "hasClass" || methodName === "toggleClass") {
            return function()  {return false};
        }
    });

    util$index$$default.register({
        clone: function(deep) {
            if (typeof deep !== "boolean") throw new errors$$MethodError("clone", arguments);

            var node = this[0], result;
            if (JSCRIPT_VERSION < 9) {
                result = DOM.create(node.outerHTML);

                if (!deep) result.set("");
            } else {
                result = new $Element(node.cloneNode(deep));
            }

            return result;
        }
    }, function()  {
        return function()  {return new $NullElement()};
    });

    util$index$$default.register({
        contains: function(element) {
            var node = this[0];

            if (element instanceof $Element) {
                var otherNode = element[0];

                if (otherNode === node) return true;
                if (node.contains) {
                    return node.contains(otherNode);
                } else {
                    return node.compareDocumentPosition(otherNode) & 16;
                }
            }

            throw new errors$$MethodError("contains", arguments);
        }
    }, function()  {
        return function()  {return false};
    });

    // Inspired by the article written by Daniel Buchner:
    // http://www.backalleycoder.com/2014/04/18/element-queries-from-the-feet-up/

    // IE8 fails with about:blank, use better-dom-legacy.html instead
    var element$context$$SANDBOX_URL = JSCRIPT_VERSION < 9 ? util$index$$default.getLegacyFile("html") : "about:blank";

    // NOTE: Chrome/Safari have issue with focusing on the <object>:
    // https://code.google.com/p/chromium/issues/detail?id=255150

    util$index$$default.register({
        context: function(name, callback) {
            var node = this[0],
                doc = node.ownerDocument,
                contexts = this._[CONTEXT_DATA];

            if (name in contexts) return contexts[name];

            var wrapper = doc.createElement("div");
            var object;
            var ready = function()  {
                var doc = object.contentDocument;
                // remove default margin because it's useless
                doc.body.style.margin = 0;
                // apply user-defined styles for the context
                wrapper.className = name;

                if (typeof callback === "function") {
                    callback(new $Document(doc));
                }
            };
            if (JSCRIPT_VERSION < 9) {
                // IE8 is buggy, use innerHTML and better-dom-legacy.html
                // use overflow and extra size to get rid of the frame
                wrapper.innerHTML = DOM.emmet("object[data=`{0}` type=`text/html` style=`left:-2px;top:-2px`]", [element$context$$SANDBOX_URL]);

                object = wrapper.firstChild;
                // IE8 does not support onload - use timeout instead
                DOM.requestFrame(function repeat() {
                    var htmlEl;
                    // TODO: tbd if try/catch check is required
                    try {
                        htmlEl = object.contentDocument.documentElement;
                    } catch (err) {
                        return DOM.requestFrame(repeat);
                    }
                    // use the trick below to hide frame border in IE8
                    wrapper.onresize = function resizing() {
                        wrapper.onresize = null;

                        object.width = wrapper.offsetWidth + 4;
                        object.height = wrapper.offsetHeight + 4;

                        DOM.requestFrame(function()  {
                            wrapper.onresize = resizing;
                        });
                    };

                    ready();
                });
            } else {
                object = doc.createElement("object");
                object.type = "text/html";
                object.data = element$context$$SANDBOX_URL;
                object.onload = ready;

                wrapper.appendChild(object);
            }

            wrapper.style.overflow = "hidden";

            object.style.position = "absolute";
            object.width = "100%";
            object.height = "100%";

            // TODO: check if parent is not null
            node.parentNode.insertBefore(wrapper, node);

            return contexts[name] = new $Element(wrapper);
        }
    });

    // Helper for CSS properties access

    var util$stylehooks$$reDash = /\-./g,
        util$stylehooks$$cssPrefixes = [ "Webkit", "O", "Moz", "ms" ],
        util$stylehooks$$hooks = {get: {}, set: {}, find: function(name, style) {
            var propName = name.replace(util$stylehooks$$reDash, function(str)  {return str[1].toUpperCase()});

            if (!(propName in style)) {
                propName = util$stylehooks$$cssPrefixes
                    .map(function(prefix)  {return prefix + propName[0].toUpperCase() + propName.slice(1)})
                    .filter(function(prop)  {return prop in style})[0];
            }

            return this.get[name] = this.set[name] = propName;
        }},
        util$stylehooks$$directions = ["Top", "Right", "Bottom", "Left"],
        util$stylehooks$$shortCuts = {
            font: ["fontStyle", "fontSize", "/", "lineHeight", "fontFamily"],
            padding: util$stylehooks$$directions.map(function(dir)  {return "padding" + dir}),
            margin: util$stylehooks$$directions.map(function(dir)  {return "margin" + dir}),
            "border-width": util$stylehooks$$directions.map(function(dir)  {return "border" + dir + "Width"}),
            "border-style": util$stylehooks$$directions.map(function(dir)  {return "border" + dir + "Style"})
        };

    // Exclude the following css properties from adding px
    " float fill-opacity font-weight line-height opacity orphans widows z-index zoom ".split(" ").forEach(function(propName)  {
        var stylePropName = propName.replace(util$stylehooks$$reDash, function(str)  {return str[1].toUpperCase()});

        if (propName === "float") {
            stylePropName = "cssFloat" in HTML.style ? "cssFloat" : "styleFloat";
            // normalize float css property
            util$stylehooks$$hooks.get[propName] = util$stylehooks$$hooks.set[propName] = stylePropName;
        } else {
            util$stylehooks$$hooks.get[propName] = stylePropName;
            util$stylehooks$$hooks.set[propName] = function(value, style)  {
                style[stylePropName] = value.toString();
            };
        }
    });

    // normalize property shortcuts
    util$index$$default.keys(util$stylehooks$$shortCuts).forEach(function(key)  {
        var props = util$stylehooks$$shortCuts[key];

        util$stylehooks$$hooks.get[key] = function(style)  {
            var result = [],
                hasEmptyStyleValue = function(prop, index)  {
                    result.push(prop === "/" ? prop : style[prop]);

                    return !result[index];
                };

            return props.some(hasEmptyStyleValue) ? "" : result.join(" ");
        };

        util$stylehooks$$hooks.set[key] = function(value, style)  {
            if (value && "cssText" in style) {
                // normalize setting complex property across browsers
                style.cssText += ";" + key + ":" + value;
            } else {
                props.forEach(function(name)  {return style[name] = typeof value === "number" ? value + "px" : value.toString()});
            }
        };
    });

    var util$stylehooks$$default = util$stylehooks$$hooks;

    util$index$$default.register({
        css: function(name, value) {var this$0 = this;
            var len = arguments.length,
                node = this[0],
                style = node.style,
                computed;

            if (len === 1 && (typeof name === "string" || util$index$$default.isArray(name))) {
                var strategy = function(name)  {
                    var getter = util$stylehooks$$default.get[name] || util$stylehooks$$default.find(name, style),
                        value = typeof getter === "function" ? getter(style) : style[getter];

                    if (!value) {
                        if (!computed) computed = util$index$$default.computeStyle(node);

                        value = typeof getter === "function" ? getter(computed) : computed[getter];
                    }

                    return value;
                };

                if (typeof name === "string") {
                    return strategy(name);
                } else {
                    return name.map(strategy).reduce(function(memo, value, index)  {
                        memo[name[index]] = value;

                        return memo;
                    }, {});
                }
            }

            if (len === 2 && typeof name === "string") {
                var setter = util$stylehooks$$default.set[name] || util$stylehooks$$default.find(name, style);

                if (typeof value === "function") {
                    value = value.call(this, this.css(name));
                }

                if (value == null) value = "";

                if (typeof setter === "function") {
                    setter(value, style);
                } else {
                    style[setter] = typeof value === "number" ? value + "px" : value.toString();
                }
            } else if (len === 1 && name && typeof name === "object") {
                util$index$$default.keys(name).forEach(function(key)  { this$0.css(key, name[key]) });
            } else {
                throw new errors$$MethodError("css", arguments);
            }

            return this;
        }
    }, function()  {return function(name) {
        if (arguments.length === 1 && util$index$$default.isArray(name)) {
            return {};
        }

        if (arguments.length !== 1 || typeof name !== "string") {
            return this;
        }
    }});

    util$index$$default.register({
        define: function(name, getter, setter) {var this$0 = this;
            var node = this[0];

            if (typeof name !== "string" || typeof getter !== "function" || typeof setter !== "function") {
                throw new errors$$MethodError("define", arguments);
            }

            // initial value reading must be before defineProperty
            // because IE8 will try to read wrong attribute value
            var initialValue = node.getAttribute(name);
            var letterCase = JSCRIPT_VERSION < 9 ? "toUpperCase" : "toLowerCase";
            // trick to fix infinite recursion in IE8
            var attrName = name[letterCase]();
            var _setAttribute = node.setAttribute;
            var _removeAttribute = node.removeAttribute;

            Object.defineProperty(node, name, {
                get: function()  {
                    var attrValue = node.getAttribute(attrName, 1);

                    return getter.call(this$0, attrValue);
                },
                set: function(propValue)  {
                    var attrValue = setter.call(this$0, propValue);

                    if (attrValue == null) {
                        _removeAttribute.call(node, attrName, 1);
                    } else {
                        _setAttribute.call(node, attrName, attrValue, 1);
                    }
                }
            });

            // override methods to catch changes from attributes too
            node.setAttribute = function(attrName, attrValue, flags)  {
                if (name === attrName[letterCase]()) {
                    node[name] = getter.call(this$0, attrValue);
                } else {
                    _setAttribute.call(node, attrName, attrValue, flags);
                }
            };

            node.removeAttribute = function(attrName, flags)  {
                if (name === attrName[letterCase]()) {
                    node[name] = getter.call(this$0, null);
                } else {
                    _removeAttribute.call(node, attrName, flags);
                }
            };

            // apply initial attribute value
            node[name] = getter.call(this, initialValue);

            return this;
        }
    });

    // big part of code inspired by Sizzle:
    // https://github.com/jquery/sizzle/blob/master/sizzle.js

    var element$find$$rquick = DOCUMENT.getElementsByClassName ? /^(?:(\w+)|\.([\w\-]+))$/ : /^(?:(\w+))$/,
        element$find$$rescape = /'|\\/g,
        element$find$$makeMethod = function(all)  {return function(selector) {
            if (typeof selector !== "string") throw new errors$$MethodError("find" + all, arguments);

            var node = this[0],
                quickMatch = element$find$$rquick.exec(selector),
                result, old, nid, context;

            if (quickMatch) {
                if (quickMatch[1]) {
                    // speed-up: "TAG"
                    result = node.getElementsByTagName(selector);
                } else {
                    // speed-up: ".CLASS"
                    result = node.getElementsByClassName(quickMatch[2]);
                }

                if (result && !all) result = result[0];
            } else {
                old = true;
                nid = "DOM2001000-beta002";
                context = node;

                if (node !== node.ownerDocument.documentElement) {
                    // qSA works strangely on Element-rooted queries
                    // We can work around this by specifying an extra ID on the root
                    // and working up from there (Thanks to Andrew Dupont for the technique)
                    if ( (old = node.getAttribute("id")) ) {
                        nid = old.replace(element$find$$rescape, "\\$&");
                    } else {
                        node.setAttribute("id", nid);
                    }

                    nid = "[id='" + nid + "'] ";
                    selector = nid + selector.split(",").join("," + nid);
                }

                result = util$index$$default.safeInvoke(context, "querySelector" + all, selector);

                if (!old) node.removeAttribute("id");
            }

            return all ? util$index$$default.map.call(result, $Element) : $Element(result);
        }};

    util$index$$default.register({
        find: element$find$$makeMethod(""),

        findAll: element$find$$makeMethod("All")
    }, function(methodName)  {
        return methodName === "find" ? function()  {return new $NullElement()} : function()  {return []};
    });

    var util$eventhooks$$hooks = {};
    if ("onfocusin" in DOCUMENT.documentElement) {
        util$eventhooks$$hooks.focus = function(handler)  { handler._type = "focusin" };
        util$eventhooks$$hooks.blur = function(handler)  { handler._type = "focusout" };
    } else {
        // firefox doesn't support focusin/focusout events
        util$eventhooks$$hooks.focus = util$eventhooks$$hooks.blur = function(handler)  { handler.capturing = true };
    }
    if (DOCUMENT.createElement("input").validity) {
        util$eventhooks$$hooks.invalid = function(handler)  { handler.capturing = true };
    }
    if (JSCRIPT_VERSION < 9) {
        // fix non-bubbling form events for IE8 therefore
        // use custom event type instead of original one
        ["submit", "change", "reset"].forEach(function(name)  {
            util$eventhooks$$hooks[name] = function(handler)  { handler._type = "_" };
        });
    }

    var util$eventhooks$$default = util$eventhooks$$hooks;

    function util$eventhandler$$getEventProperty(name, e, type, node, target, currentTarget) {
        if (typeof name === "number") {
            var args = e["__2001000-beta002__"];

            return args ? args[name] : void 0;
        }
        if (JSCRIPT_VERSION < 9) {
            var docEl = node.ownerDocument.documentElement;

            switch (name) {
            case "which":
                return e.keyCode;
            case "button":
                var button = e.button;
                // click: 1 === left; 2 === middle; 3 === right
                return button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) );
            case "pageX":
                return e.clientX + docEl.scrollLeft - docEl.clientLeft;
            case "pageY":
                return e.clientY + docEl.scrollTop - docEl.clientTop;
            case "preventDefault":
                return function()  {return e.returnValue = false};
            case "stopPropagation":
                return function()  {return e.cancelBubble = true};
            }
        }

        switch (name) {
        case "type":
            return type;
        case "defaultPrevented":
            // IE8 and Android 2.3 use returnValue instead of defaultPrevented
            return "defaultPrevented" in e ? e.defaultPrevented : e.returnValue === false;
        case "target":
            return $Element(target);
        case "currentTarget":
            return $Element(currentTarget);
        case "relatedTarget":
            return $Element(e.relatedTarget || e[(e.toElement === node ? "from" : "to") + "Element"]);
        }

        var value = e[name];

        if (typeof value === "function") {
            return function()  {return value.apply(e, arguments)};
        }

        return value;
    }

    function util$eventhandler$$EventHandler(type, selector, callback, props, el, once) {
        var node = el[0],
            hook = util$eventhooks$$default[type],
            matcher = util$selectormatcher$$default(selector, node),
            handler = function(e)  {
                e = e || WINDOW.event;
                // early stop in case of default action
                if (util$eventhandler$$EventHandler.skip === type) return;
                if (handler._type === CUSTOM_EVENT_TYPE && e.srcUrn !== type) {
                    return; // handle custom events in legacy IE
                }
                // srcElement can be null in legacy IE when target is document
                var target = e.target || e.srcElement || node.ownerDocument,
                    currentTarget = matcher ? matcher(target) : node,
                    args = props || [];

                // early stop for late binding or when target doesn't match selector
                if (!currentTarget) return;

                // off callback even if it throws an exception later
                if (once) el.off(type, callback);

                if (props) {
                    args = args.map(function(name)  {return util$eventhandler$$getEventProperty(
                        name, e, type, node, target, currentTarget)});
                } else {
                    args = util$index$$default.slice.call(e["__2001000-beta002__"] || [0], 1);
                }

                // prevent default if handler returns false
                if (callback.apply(el, args) === false) {
                    if (JSCRIPT_VERSION < 9) {
                        e.returnValue = false;
                    } else {
                        e.preventDefault();
                    }
                }
            };

        if (hook) handler = hook(handler, type) || handler;
        if (JSCRIPT_VERSION < 9 && !("on" + (handler._type || type) in node)) {
            // handle custom events for IE8
            handler._type = CUSTOM_EVENT_TYPE;
        }

        handler.type = type;
        handler.callback = callback;
        handler.selector = selector;

        return handler;
    }

    var util$eventhandler$$default = util$eventhandler$$EventHandler;

    util$index$$default.register({
        fire: function(type) {
            var node = this[0],
                e, eventType, canContinue;

            if (typeof type === "string") {
                var hook = util$eventhooks$$default[type],
                    handler = {};

                if (hook) handler = hook(handler) || handler;

                eventType = handler._type || type;
            } else {
                throw new errors$$MethodError("fire", arguments);
            }
            if (JSCRIPT_VERSION < 9) {
                e = node.ownerDocument.createEventObject();
                e["__2001000-beta002__"] = arguments;
                // handle custom events for legacy IE
                if (!("on" + eventType in node)) eventType = CUSTOM_EVENT_TYPE;
                // store original event type
                if (eventType === CUSTOM_EVENT_TYPE) e.srcUrn = type;

                node.fireEvent("on" + eventType, e);

                canContinue = e.returnValue !== false;
            } else {
                e = node.ownerDocument.createEvent("HTMLEvents");
                e["__2001000-beta002__"] = arguments;
                e.initEvent(eventType, true, true);
                canContinue = node.dispatchEvent(e);
            }

            // call native function to trigger default behavior
            if (canContinue && node[type]) {
                // prevent re-triggering of the current event
                util$eventhandler$$default.skip = type;

                util$index$$default.safeInvoke(node, type);

                util$eventhandler$$default.skip = null;
            }

            return canContinue;
        }
    }, function()  {
        return function()  {return true};
    });

    var util$accessorhooks$$hooks = {get: {}, set: {}};
    var util$accessorhooks$$body = DOCUMENT.createElement("body");

    // fix camel cased attributes
    "tabIndex readOnly maxLength cellSpacing cellPadding rowSpan colSpan useMap frameBorder contentEditable".split(" ").forEach(function(key)  {
        util$accessorhooks$$hooks.get[ key.toLowerCase() ] = function(node)  {return node[key]};
    });

    // style hook
    util$accessorhooks$$hooks.get.style = function(node)  {return node.style.cssText};
    util$accessorhooks$$hooks.set.style = function(node, value)  { node.style.cssText = value };

    // title hook for DOM
    util$accessorhooks$$hooks.get.title = function(node)  {
        var doc = node.ownerDocument;

        return node === doc.documentElement ? doc.title : node.title;
    };

    util$accessorhooks$$hooks.set.title = function(node, value)  {
        var doc = node.ownerDocument;

        (node === doc.documentElement ? doc : node).title = value;
    };

    util$accessorhooks$$hooks.get.undefined = function(node)  {
        var name;

        switch (node.tagName) {
        case "SELECT":
            return ~node.selectedIndex ? node.options[ node.selectedIndex ].value : "";

        case "OPTION":
            name = node.hasAttribute("value") ? "value" : "text";
            break;

        default:
            name = node.type && "value" in node ? "value" : "innerHTML";
        }

        return node[name];
    };

    util$accessorhooks$$hooks.set.value = function(node, value) {
        if (node.tagName === "SELECT") {
            // selectbox has special case
            if (util$index$$default.every.call(node.options, function(o)  {return !(o.selected = o.value === value)})) {
                node.selectedIndex = -1;
            }
        } else {
            // for IE use innerText for textareabecause it doesn't trigger onpropertychange
            node[JSCRIPT_VERSION < 9 && node.type === "textarea" ? "innerText" : "value"] = value;
        }
    };

    // some browsers don't recognize input[type=email] etc.
    util$accessorhooks$$hooks.get.type = function(node)  {return node.getAttribute("type") || node.type};
    if (JSCRIPT_VERSION < 9) {
        // IE8 has innerText but not textContent
        util$accessorhooks$$hooks.get.textContent = function(node)  {return node.innerText};
        util$accessorhooks$$hooks.set.textContent = function(node, value)  { node.innerText = value };

        // IE8 sometimes breaks on innerHTML
        util$accessorhooks$$hooks.set.innerHTML = function(node, value) {
            try {
                node.innerHTML = value;
            } catch (err) {
                node.innerText = "";
                util$accessorhooks$$body.innerHTML = value;

                for (var it; it = util$accessorhooks$$body.firstChild; ) {
                    node.appendChild(it);
                }
            }
        };
    }

    var util$accessorhooks$$default = util$accessorhooks$$hooks;

    var element$get$$reUpper = /[A-Z]/g,
        element$get$$readPrivateProperty = function(node, key)  {
            // convert from camel case to dash-separated value
            key = key.replace(element$get$$reUpper, function(l)  {return "-" + l.toLowerCase()});

            var value = node.getAttribute("data-" + key);

            if (value != null) {
                // try to recognize and parse  object notation syntax
                if (value[0] === "{" && value[value.length - 1] === "}") {
                    try {
                        value = JSON.parse(value);
                    } catch (err) {
                        // just return the value itself
                    }
                }
            }

            return value;
        };

    util$index$$default.register({
        get: function(name) {var this$0 = this;
            var node = this[0],
                hook = util$accessorhooks$$default.get[name];

            if (hook) return hook(node, name);

            if (typeof name === "string") {
                if (name in node) {
                    return node[name];
                } else if (name[0] !== "_") {
                    return node.getAttribute(name);
                } else {
                    var key = name.slice(1),
                        data = this._;

                    if (!(key in data)) {
                        data[key] = element$get$$readPrivateProperty(node, key);
                    }

                    return data[key];
                }
            } else if (util$index$$default.isArray(name)) {
                return name.reduce(function(memo, key)  {
                    return (memo[key] = this$0.get(key), memo);
                }, {});
            } else {
                throw new errors$$MethodError("get", arguments);
            }
        }
    }, function()  {
        return function()  {return void 0};
    });

    var element$manipulation$$makeMethod = function(methodName, fastStrategy, requiresParent, strategy)  {return function() {var contents = SLICE$0.call(arguments, 0);var this$0 = this;
            var node = this[0];

            if (requiresParent && !node.parentNode) return this;

            // the idea of the algorithm is to construct HTML string
            // when possible or use document fragment as a fallback to
            // invoke manipulation using a single method call
            var fragment = fastStrategy ? "" : node.ownerDocument.createDocumentFragment();

            contents.forEach(function(content)  {
                if (typeof content === "function") content = content.call(this$0);

                if (typeof content === "string") {
                    if (typeof fragment === "string") {
                        fragment += content.trim();
                    } else {
                        content = DOM.createAll(content);
                    }
                } else if (content instanceof $Element) {
                    content = [ content ];
                }

                if (util$index$$default.isArray(content)) {
                    if (typeof fragment === "string") {
                        // append existing string to fragment
                        content = DOM.createAll(fragment).concat(content);
                        // fallback to document fragment strategy
                        fragment = node.ownerDocument.createDocumentFragment();
                    }

                    content.forEach(function(el)  {
                        fragment.appendChild(el[0]);
                    });
                }
            });

            if (typeof fragment === "string") {
                node.insertAdjacentHTML(fastStrategy, fragment);
            } else {
                strategy(node, fragment);
            }

            return this;
        }};

    util$index$$default.register({
        after: element$manipulation$$makeMethod("after", "afterend", true, function(node, relatedNode)  {
            node.parentNode.insertBefore(relatedNode, node.nextSibling);
        }),

        before: element$manipulation$$makeMethod("before", "beforebegin", true, function(node, relatedNode)  {
            node.parentNode.insertBefore(relatedNode, node);
        }),

        prepend: element$manipulation$$makeMethod("prepend", "afterbegin", false, function(node, relatedNode)  {
            node.insertBefore(relatedNode, node.firstChild);
        }),

        append: element$manipulation$$makeMethod("append", "beforeend", false, function(node, relatedNode)  {
            node.appendChild(relatedNode);
        }),

        replace: element$manipulation$$makeMethod("replace", "", true, function(node, relatedNode)  {
            node.parentNode.replaceChild(relatedNode, node);
        }),

        remove: element$manipulation$$makeMethod("remove", "", true, function(node)  {
            node.parentNode.removeChild(node);
        })
    });

    util$index$$default.register({
        map: function(fn, context) {
            if (typeof fn !== "function") {
                throw new errors$$MethodError("map", arguments);
            }

            return [ fn.call(context, this) ];
        }
    }, function()  {
        return function()  {return []};
    });

    var util$selectorhooks$$isHidden = function(node)  {
        var computed = util$index$$default.computeStyle(node);

        return computed.visibility === "hidden" || computed.display === "none";
    };

    var util$selectorhooks$$default = {
        ":focus": function(node)  {return node === node.ownerDocument.activeElement},

        ":visible": function(node)  {return !util$selectorhooks$$isHidden(node)},

        ":hidden": util$selectorhooks$$isHidden
    };

    util$index$$default.register({
        matches: function(selector) {
            if (!selector || typeof selector !== "string") throw new errors$$MethodError("matches", arguments);

            var checker = util$selectorhooks$$default[selector] || util$selectormatcher$$default(selector);

            return !!checker(this[0]);
        }
    }, function()  {
        return function()  {return false};
    });

    util$index$$default.register({
        off: function(type, selector, callback) {
            if (typeof type !== "string") throw new errors$$MethodError("off", arguments);

            if (callback === void 0) {
                callback = selector;
                selector = void 0;
            }

            var node = this[0];

            this._[HANDLERS_DATA] = this._[HANDLERS_DATA].filter(function(handler)  {
                var skip = type !== handler.type;

                skip = skip || selector && selector !== handler.selector;
                skip = skip || callback && callback !== handler.callback;

                if (skip) return true;

                type = handler._type || handler.type;
                if (JSCRIPT_VERSION < 9) {
                    node.detachEvent("on" + type, handler);
                } else {
                    node.removeEventListener(type, handler, !!handler.capturing);
                }
            });

            return this;
        }
    });

    util$index$$default.register({
        offset: function() {
            var node = this[0],
                docEl = node.ownerDocument.documentElement,
                clientTop = docEl.clientTop,
                clientLeft = docEl.clientLeft,
                scrollTop = WINDOW.pageYOffset || docEl.scrollTop,
                scrollLeft = WINDOW.pageXOffset || docEl.scrollLeft,
                boundingRect = node.getBoundingClientRect();

            return {
                top: boundingRect.top + scrollTop - clientTop,
                left: boundingRect.left + scrollLeft - clientLeft,
                right: boundingRect.right + scrollLeft - clientLeft,
                bottom: boundingRect.bottom + scrollTop - clientTop,
                width: boundingRect.right - boundingRect.left,
                height: boundingRect.bottom - boundingRect.top
            };
        }
    }, function()  {
        return function()  {
            return { top : 0, left : 0, right : 0, bottom : 0, width : 0, height : 0 };
        };
    });

    var element$on$$makeMethod = function(method)  {return function(type, selector, args, callback) {var this$0 = this;
            if (typeof type === "string") {
                if (typeof args === "function") {
                    callback = args;

                    if (typeof selector === "string") {
                        args = null;
                    } else {
                        args = selector;
                        selector = null;
                    }
                }

                if (typeof selector === "function") {
                    callback = selector;
                    selector = null;
                    args = null;
                }

                if (typeof callback !== "function") {
                    throw new errors$$MethodError(method, arguments);
                }

                var node = this[0],
                    handler = util$eventhandler$$default(type, selector, callback, args, this, method === "once");

                if (handler) {
                    if (JSCRIPT_VERSION < 9) {
                        node.attachEvent("on" + (handler._type || type), handler);
                    } else {
                        node.addEventListener(handler._type || type, handler, !!handler.capturing);
                    }
                    // store event entry
                    this._[HANDLERS_DATA].push(handler);
                }
            } else if (typeof type === "object") {
                if (util$index$$default.isArray(type)) {
                    type.forEach(function(name)  { this$0[method](name, selector, args, callback) });
                } else {
                    util$index$$default.keys(type).forEach(function(name)  { this$0[method](name, type[name]) });
                }
            } else {
                throw new errors$$MethodError(method, arguments);
            }

            return this;
        }};

    util$index$$default.register({
        on: element$on$$makeMethod("on"),

        once: element$on$$makeMethod("once")
    });

    util$index$$default.register({
        set: function(name, value) {var this$0 = this;
            var node = this[0];

            // handle the value shortcut
            if (arguments.length === 1) {
                if (typeof name === "function") {
                    value = name;
                } else {
                    value = name == null ? "" : String(name);
                }

                if (value !== "[object Object]") {
                    var tag = node.tagName;

                    if (tag === "INPUT" || tag === "TEXTAREA" ||  tag === "SELECT" || tag === "OPTION") {
                        name = "value";
                    } else {
                        name = "innerHTML";
                    }
                }
            }

            var hook = util$accessorhooks$$default.set[name],
                watchers = this._[WATCHERS_DATA][name],
                oldValue;

            if (watchers || typeof value === "function") {
                oldValue = this.get(name);
            }

            if (typeof name === "string") {
                if (name[0] === "_") {
                    this._[name.slice(1)] = value;
                } else {
                    if (typeof value === "function") {
                        value = value.call(this, oldValue);
                    }

                    if (hook) {
                        hook(node, value);
                    } else if (value == null) {
                        node.removeAttribute(name);
                    } else if (name in node) {
                        node[name] = value;
                    } else {
                        node.setAttribute(name, value);
                    }
                    if (JSCRIPT_VERSION < 9 || LEGACY_ANDROID) {
                        // always trigger reflow manually for IE8 and legacy Android
                        node.className = node.className;
                    }
                }
            } else if (util$index$$default.isArray(name)) {
                name.forEach(function(key)  { this$0.set(key, value) });
            } else if (typeof name === "object") {
                util$index$$default.keys(name).forEach(function(key)  { this$0.set(key, name[key]) });
            } else {
                throw new errors$$MethodError("set", arguments);
            }

            if (watchers && oldValue !== value) {
                watchers.forEach(function(w)  {
                    util$index$$default.safeInvoke(this$0, w, value, oldValue);
                });
            }

            return this;
        }
    });

    var element$traversing$$makeMethod = function(methodName, propertyName, all)  {return function(selector) {
            if (selector && typeof selector !== "string") throw new errors$$MethodError(methodName, arguments);

            var matcher = util$selectormatcher$$default(selector),
                nodes = all ? [] : null,
                it = this[0];

            if (methodName !== "closest" || !matcher) {
                // method closest starts traversing from the element itself
                // except no selector was specified
                it = it[propertyName];
            }

            for (; it; it = it[propertyName]) {
                if (it.nodeType === 1 && (!matcher || matcher(it))) {
                    if (!all) break;

                    nodes.push(it);
                }
            }

            return all ? util$index$$default.map.call(nodes, $Element) : $Element(it);
        }};

    util$index$$default.register({
        next: element$traversing$$makeMethod("next", "nextSibling"),

        prev: element$traversing$$makeMethod("prev", "previousSibling"),

        nextAll: element$traversing$$makeMethod("nextAll", "nextSibling", true),

        prevAll: element$traversing$$makeMethod("prevAll", "previousSibling", true),

        closest: element$traversing$$makeMethod("closest", "parentNode")
    }, function(methodName)  {
        if (methodName.slice(-3) === "All") {
            return function()  {return []};
        } else {
            return function()  {return new $NullElement()};
        }
    });

    var util$animationhandler$$TRANSITION_PROPS = ["timing-function", "property", "duration", "delay"].map(function(prop)  {return "transition-" + prop}),
        util$animationhandler$$parseTimeValue = function(value)  {
            var result = parseFloat(value) || 0;
            // if duration is in seconds, then multiple result value by 1000
            return !result || value.slice(-2) === "ms" ? result : result * 1000;
        },
        util$animationhandler$$calcTransitionDuration = function(transitionValues)  {
            var delays = transitionValues[3],
                durations = transitionValues[2];

            return Math.max.apply(Math, durations.map(function(value, index)  {
                return util$animationhandler$$parseTimeValue(value) + (util$animationhandler$$parseTimeValue(delays[index]) || 0);
            }));
        };

    // initialize hooks for properties used below
    util$animationhandler$$TRANSITION_PROPS.concat("animation-duration").forEach(function(prop)  { util$stylehooks$$default.find(prop, HTML.style) });

    var util$animationhandler$$default = function(node, computed, animationName, hiding, done)  {
        var rules, duration;

        // Legacy Android is usually slow and has lots of bugs in the
        // CSS animations implementation, so skip any animations for it
        if (LEGACY_ANDROID || JSCRIPT_VERSION < 10) return null;

        if (animationName) {
            duration = util$animationhandler$$parseTimeValue(computed[util$stylehooks$$default.get["animation-duration"]]);

            if (!duration) return; // skip animations with zero duration

            rules = [
                WEBKIT_PREFIX + "animation-direction:" + (hiding ? "normal" : "reverse"),
                WEBKIT_PREFIX + "animation-name:" + animationName,
                // for CSS3 animation element should always be visible
                "visibility:inherit"
            ];
        } else {
            var transitionValues = util$animationhandler$$TRANSITION_PROPS.map(function(prop, index)  {
                    // have to use regexp to split transition-timing-function value
                    return computed[util$stylehooks$$default.get[prop]].split(index ? ", " : /, (?!\d)/);
                });

            duration = util$animationhandler$$calcTransitionDuration(transitionValues);

            if (!duration) return; // skip transitions with zero duration

            if (transitionValues[1].indexOf("all") < 0) {
                // try to find existing or use 0s length or make a new visibility transition
                var visibilityIndex = transitionValues[1].indexOf("visibility");

                if (visibilityIndex < 0) visibilityIndex = transitionValues[2].indexOf("0s");
                if (visibilityIndex < 0) visibilityIndex = transitionValues[1].length;

                transitionValues[0][visibilityIndex] = "linear";
                transitionValues[1][visibilityIndex] = "visibility";
                transitionValues[hiding ? 2 : 3][visibilityIndex] = "0s";
                transitionValues[hiding ? 3 : 2][visibilityIndex] = duration + "ms";
            }

            rules = transitionValues.map(function(props, index)  {
                // fill holes in a trasition property value
                for (var i = 0, n = props.length; i < n; ++i) {
                    props[i] = props[i] || props[i - 1] || "initial";
                }

                return WEBKIT_PREFIX + util$animationhandler$$TRANSITION_PROPS[index] + ":" + props.join(", ");
            });

            rules.push(
                // append target visibility value to trigger transition
                "visibility:" + (hiding ? "hidden" : "inherit"),
                // use willChange to improve performance in modern browsers:
                // http://dev.opera.com/articles/css-will-change-property/
                "will-change:" + transitionValues[1].join(", ")
            );
        }

        return {
            cssText: rules.join(";"),
            initialCssText: node.style.cssText,
            // this function used to trigger callback
            handleEvent: function(e)  {
                if (e.target === node) {
                    if (animationName) {
                        if (e.animationName !== animationName) return;
                    } else {
                        if (e.propertyName !== "visibility") return;
                    }

                    e.stopPropagation(); // this is an internal event

                    done();
                }
            }
        };
    };

    var element$visibility$$TRANSITION_EVENT_TYPE = WEBKIT_PREFIX ? "webkitTransitionEnd" : "transitionend",
        element$visibility$$ANIMATION_EVENT_TYPE = WEBKIT_PREFIX ? "webkitAnimationEnd" : "animationend",
        element$visibility$$makeMethod = function(name, condition)  {return function(animationName, callback) {var this$0 = this;
            if (typeof animationName !== "string") {
                callback = animationName;
                animationName = null;
            }

            if (callback && typeof callback !== "function") {
                throw new errors$$MethodError(name, arguments);
            }

            var node = this[0],
                style = node.style,
                computed = util$index$$default.computeStyle(node),
                hiding = condition,
                frameId = this._[FRAME_DATA],
                done = function()  {
                    if (animationHandler) {
                        node.removeEventListener(eventType, animationHandler, true);
                        // clear inline style adjustments were made previously
                        style.cssText = animationHandler.initialCssText;
                    } else {
                        this$0.set("aria-hidden", String(hiding));
                    }
                    // always update element visibility property: use value "inherit"
                    // to respect parent container visibility. Should be a separate
                    // from setting cssText because of Opera 12 quirks
                    style.visibility = hiding ? "hidden" : "inherit";

                    this$0._[FRAME_DATA] = null;

                    if (callback) callback.call(this$0);
                };

            if (typeof hiding !== "boolean") {
                hiding = computed.visibility !== "hidden";
            }

            // cancel previous frame if it exists
            if (frameId) DOM.cancelFrame(frameId);

            if (!node.ownerDocument.documentElement.contains(node)) {
                // apply attribute/visibility syncronously for detached DOM elements
                // because browser returns zero animation/transition duration for them
                done();
            } else {
                var animationHandler = util$animationhandler$$default(node, computed, animationName, hiding, done),
                    eventType = animationName ? element$visibility$$ANIMATION_EVENT_TYPE : element$visibility$$TRANSITION_EVENT_TYPE;
                // use requestAnimationFrame to avoid animation quirks for
                // new elements inserted into the DOM
                // http://christianheilmann.com/2013/09/19/quicky-fading-in-a-newly-created-element-using-css/
                this._[FRAME_DATA] = DOM.requestFrame(!animationHandler ? done : function()  {
                    node.addEventListener(eventType, animationHandler, true);
                    // update modified style rules
                    style.cssText = animationHandler.initialCssText + animationHandler.cssText;
                    // trigger CSS3 transition / animation
                    this$0.set("aria-hidden", String(hiding));
                });
            }

            return this;
        }};

    util$index$$default.register({
        show: element$visibility$$makeMethod("show", false),

        hide: element$visibility$$makeMethod("hide", true),

        toggle: element$visibility$$makeMethod("toggle")
    });

    util$index$$default.register({
        watch: function(name, callback) {
            var watchers = this._[WATCHERS_DATA];

            if (!watchers[name]) watchers[name] = [];

            watchers[name].push(callback);

            return this;
        },

        unwatch: function(name, callback) {
            var watchers = this._[WATCHERS_DATA];

            if (watchers[name]) {
                watchers[name] = watchers[name].filter(function(w)  {return w !== callback});
            }

            return this;
        }
    });

    var util$extensionhandler$$rePrivateFunction = /^(?:on|do)[A-Z]/;

    var util$extensionhandler$$default = function(selector, condition, mixins, index)  {
        var ctr = mixins.hasOwnProperty("constructor") && mixins.constructor,
            matcher = util$selectormatcher$$default(selector);

        return function(node, mock)  {
            var el = $Element(node);
            // skip previously invoked or mismatched elements
            if (~el._[EXTENSIONS_DATA].indexOf(index) || !matcher(node)) return;
            // mark extension as invoked
            el._[EXTENSIONS_DATA].push(index);

            if (mock === true || condition(el) !== false) {
                // apply all private/public members to the element's interface
                var privateFunctions = Object.keys(mixins).filter(function(prop)  {
                    var value = mixins[prop];
                    // TODO: private functions are deprecated, remove this line later
                    if (util$extensionhandler$$rePrivateFunction.exec(prop)) {
                        // preserve context for private functions
                        el[prop] = function()  {return value.apply(el, arguments)};

                        return !mock;
                    }

                    if (prop !== "constructor") {
                        el[prop] = value;

                        return !mock && prop[0] === "_";
                    }
                });

                // invoke constructor if it exists
                // make a safe call so live extensions can't break each other
                if (ctr) util$index$$default.safeInvoke(el, ctr);
                // remove event handlers from element's interface
                privateFunctions.forEach(function(prop)  { delete el[prop] });
            }
        };
    };

    // Inspired by trick discovered by Daniel Buchner:
    // https://github.com/csuwldcat/SelectorListener

    var global$extend$$extensions = [],
        global$extend$$returnTrue = function()  {return true},
        global$extend$$returnFalse = function()  {return false},
        global$extend$$cssText;

    DOM.extend = function(selector, condition, definition) {
        if (arguments.length === 2) {
            definition = condition;
            condition = true;
        }

        if (typeof condition === "boolean") condition = condition ? global$extend$$returnTrue : global$extend$$returnFalse;
        if (typeof definition === "function") definition = {constructor: definition};

        if (!definition || typeof definition !== "object" || typeof condition !== "function") throw new errors$$StaticMethodError("extend", arguments);

        if (selector === "*") {
            util$index$$default.keys(definition).forEach(function(methodName)  {
                $Element.prototype[methodName] = definition[methodName];
            });
        } else {
            var ext = util$extensionhandler$$default(selector, condition, definition, global$extend$$extensions.length);

            global$extend$$extensions.push(ext);

            // initialize extension manually to make sure that all elements
            // have appropriate methods before they are used in other DOM.extend.
            // Also fixes legacy IEs when the HTC behavior is already attached
            util$index$$default.each.call(DOCUMENT.querySelectorAll(selector), ext);
            // MUST be after querySelectorAll because of legacy IEs quirks
            DOM.importStyles(selector, global$extend$$cssText);
        }
    };

    if (JSCRIPT_VERSION < 10) {
        global$extend$$cssText = "-ms-behavior:url(" + util$index$$default.getLegacyFile("htc") + ") !important";

        DOCUMENT.attachEvent("on" + CUSTOM_EVENT_TYPE, function()  {
            var e = WINDOW.event;

            if (e.srcUrn === CUSTOM_EVENT_TYPE) {
                global$extend$$extensions.forEach(function(ext)  { ext(e.srcElement) });
            }
        });
    } else {
        var global$extend$$ANIMATION_NAME = "DOM2001000-beta002";
        var global$extend$$_extend = DOM.extend;

        global$extend$$cssText = WEBKIT_PREFIX + "animation-name:" + global$extend$$ANIMATION_NAME + " !important;";
        global$extend$$cssText += WEBKIT_PREFIX + "animation-duration:1ms !important";

        DOM.extend = function()  {
            // declare the fake animation on the first DOM.extend method call
            DOM.importStyles("@" + WEBKIT_PREFIX + "keyframes " + global$extend$$ANIMATION_NAME, "from {opacity:.99} to {opacity:1}");
            // restore original method and invoke it
            (DOM.extend = global$extend$$_extend).apply(DOM, arguments);
        };

        // use capturing to suppress internal animationstart events
        DOCUMENT.addEventListener(WEBKIT_PREFIX ? "webkitAnimationStart" : "animationstart", function(e)  {
            if (e.animationName === global$extend$$ANIMATION_NAME) {
                global$extend$$extensions.forEach(function(ext)  { ext(e.target) });
                // this is an internal event - stop it immediately
                e.stopImmediatePropagation();
            }
        }, true);
    }

    var global$extend$$default = global$extend$$extensions;

    var global$format$$reVar = /\{([\w\-]+)\}/g;

    DOM.format = function(tmpl, varMap) {
        if (typeof tmpl !== "string") tmpl = String(tmpl);

        if (!varMap || typeof varMap !== "object") varMap = {};

        return tmpl.replace(global$format$$reVar, function(x, name, index)  {
            if (name in varMap) {
                x = varMap[name];

                if (typeof x === "function") x = x(index);

                x = String(x);
            }

            return x;
        });
    };

    var global$frame$$raf = WINDOW.requestAnimationFrame,
        global$frame$$craf = WINDOW.cancelAnimationFrame,
        global$frame$$lastTime = 0;

    if (!(global$frame$$raf && global$frame$$craf)) {
        ["ms", "moz", "webkit", "o"].forEach(function(prefix)  {
            global$frame$$raf = global$frame$$raf || WINDOW[prefix + "RequestAnimationFrame"];
            global$frame$$craf = global$frame$$craf || WINDOW[prefix + "CancelAnimationFrame"];
        });
    }

    DOM.requestFrame = function(callback)  {
        if (global$frame$$raf) {
            return global$frame$$raf.call(WINDOW, callback);
        } else {
            // use idea from Erik Möller's polyfill:
            // http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
            var currTime = Date.now();
            var timeToCall = Math.max(0, 16 - (currTime - global$frame$$lastTime));

            global$frame$$lastTime = currTime + timeToCall;

            return WINDOW.setTimeout(function()  { callback(currTime + timeToCall) }, timeToCall);
        }
    };

    DOM.cancelFrame = function(frameId)  {
        if (global$frame$$craf) {
            global$frame$$craf.call(WINDOW, frameId);
        } else {
            WINDOW.clearTimeout(frameId);
        }
    };

    function global$mock$$applyExtensions(node) {
        global$extend$$default.forEach(function(ext)  { ext(node, true) });

        util$index$$default.each.call(node.children, global$mock$$applyExtensions);
    }

    DOM.mock = function(content, varMap) {
        if (!content) return new $NullElement();

        var result = DOM.create(content, varMap);

        global$mock$$applyExtensions(result[0]);

        return result;
    };

    var exports$$_DOM = WINDOW.DOM;

    DOM.noConflict = function() {
        if (WINDOW.DOM === DOM) {
            WINDOW.DOM = exports$$_DOM;
        }

        return DOM;
    };

    WINDOW.DOM = DOM;
})();
