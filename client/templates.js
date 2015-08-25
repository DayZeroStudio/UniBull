(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        if (typeof root === 'undefined' || root !== Object(root)) {
            throw new Error('templatizer: window does not exist or is not an object');
        }
        root.templatizer = factory();
    }
}(this, function () {
    var jade=function(){function n(n){return null!=n&&""!==n}function t(e){return(Array.isArray(e)?e.map(t):e&&"object"==typeof e?Object.keys(e).filter(function(n){return e[n]}):[e]).filter(n).join(" ")}function e(n){return i[n]||n}function r(n){var t=String(n).replace(o,e);return t===""+n?n:t}var a={};a.merge=function s(t,e){if(1===arguments.length){for(var r=t[0],a=1;a<t.length;a++)r=s(r,t[a]);return r}var i=t["class"],o=e["class"];(i||o)&&(i=i||[],o=o||[],Array.isArray(i)||(i=[i]),Array.isArray(o)||(o=[o]),t["class"]=i.concat(o).filter(n));for(var f in e)"class"!=f&&(t[f]=e[f]);return t},a.joinClasses=t,a.cls=function(n,e){for(var r=[],i=0;i<n.length;i++)e&&e[i]?r.push(a.escape(t([n[i]]))):r.push(t(n[i]));var o=t(r);return o.length?' class="'+o+'"':""},a.style=function(n){return n&&"object"==typeof n?Object.keys(n).map(function(t){return t+":"+n[t]}).join(";"):n},a.attr=function(n,t,e,r){return"style"===n&&(t=a.style(t)),"boolean"==typeof t||null==t?t?" "+(r?n:n+'="'+n+'"'):"":0==n.indexOf("data")&&"string"!=typeof t?(-1!==JSON.stringify(t).indexOf("&")&&console.warn("Since Jade 2.0.0, ampersands (`&`) in data attributes will be escaped to `&amp;`"),t&&"function"==typeof t.toISOString&&console.warn("Jade will eliminate the double quotes around dates in ISO form after 2.0.0")," "+n+"='"+JSON.stringify(t).replace(/'/g,"&apos;")+"'"):e?(t&&"function"==typeof t.toISOString&&console.warn("Jade will stringify dates in ISO form after 2.0.0")," "+n+'="'+a.escape(t)+'"'):(t&&"function"==typeof t.toISOString&&console.warn("Jade will stringify dates in ISO form after 2.0.0")," "+n+'="'+t+'"')},a.attrs=function(n,e){var r=[],i=Object.keys(n);if(i.length)for(var o=0;o<i.length;++o){var s=i[o],f=n[s];"class"==s?(f=t(f))&&r.push(" "+s+'="'+f+'"'):r.push(a.attr(s,f,!1,e))}return r.join("")};var i={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"},o=/[&<>"]/g;return a.escape=r,a.rethrow=function f(n,t,e,r){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&t||r))throw n.message+=" on line "+e,n;try{r=r||require("fs").readFileSync(t,"utf8")}catch(a){f(n,null,e)}var i=3,o=r.split("\n"),s=Math.max(e-i,0),l=Math.min(o.length,e+i),i=o.slice(s,l).map(function(n,t){var r=t+s+1;return(r==e?"  > ":"    ")+r+"| "+n}).join("\n");throw n.path=t,n.message=(t||"Jade")+":"+e+"\n"+i+"\n\n"+n.message,n},a.DebugItem=function(n,t){this.lineno=n,this.filename=t},a}(); 

    var templatizer = {};
    templatizer["includes"] = {};
    templatizer["pages"] = {};
    templatizer["views"] = {};

    // body.jade compiled template
    templatizer["body"] = function tmpl_body(locals) {
        var buf = [];
        var jade_mixins = {};
        var jade_interp;
        var locals_for_with = locals || {};
        (function(list, undefined) {
            buf.push('<body><nav class="navbar navbar-default"><div class="container-fluid"><div class="navbar-header"><a href="/" class="navbar-brand">My Amazing App</a></div><ul class="nav navbar-nav">');
            list = "home login classes".split(" ");
            (function() {
                var $obj = list;
                if ("number" == typeof $obj.length) {
                    for (var $index = 0, $l = $obj.length; $index < $l; $index++) {
                        var item = $obj[$index];
                        buf.push("<li><a" + jade.attr("href", "/" + item, true, false) + jade.attr("id", "nav-item-" + item, true, false) + ' class="nav-item internal">' + jade.escape(null == (jade_interp = item) ? "" : jade_interp) + "</a></li>");
                    }
                } else {
                    var $l = 0;
                    for (var $index in $obj) {
                        $l++;
                        var item = $obj[$index];
                        buf.push("<li><a" + jade.attr("href", "/" + item, true, false) + jade.attr("id", "nav-item-" + item, true, false) + ' class="nav-item internal">' + jade.escape(null == (jade_interp = item) ? "" : jade_interp) + "</a></li>");
                    }
                }
            }).call(this);
            buf.push('</ul></div></nav><main data-hook="page-container" class="container"></main><footer class="footer-main"><nav class="nav-footer cf"><div><a href="http://ampersandjs.com/learn" class="nav-item external">Learn</a><a href="http://ampersandjs.com/docs" class="nav-item external"> Docs</a><a href="http://tools.ampersandjs.com" class="nav-item external"> Modules</a></div></nav></footer></body>');
        }).call(this, "list" in locals_for_with ? locals_for_with.list : typeof list !== "undefined" ? list : undefined, "undefined" in locals_for_with ? locals_for_with.undefined : typeof undefined !== "undefined" ? undefined : undefined);
        return buf.join("");
    };

    // head.jade compiled template
    templatizer["head"] = function tmpl_head() {
        return '<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0"/><meta name="apple-mobile-web-app-capable" content="yes"/>';
    };

    // includes/formInput.jade compiled template
    templatizer["includes"]["formInput"] = function tmpl_includes_formInput(locals) {
        var buf = [];
        var jade_mixins = {};
        var jade_interp;
        var locals_for_with = locals || {};
        (function(id) {
            buf.push('<div class="form-group"><label data-hook="label"></label><div data-hook="message-container"><div data-hook="message-text" class="alert alert-danger"></div></div><input' + jade.attr("id", "" + id + "", true, false) + ' class="form-control"/></div>');
        }).call(this, "id" in locals_for_with ? locals_for_with.id : typeof id !== "undefined" ? id : undefined);
        return buf.join("");
    };

    // pages/addClass.jade compiled template
    templatizer["pages"]["addClass"] = function tmpl_pages_addClass() {
        return '<section class="page add-class-page"><h1>Add Class Page</h1></section>';
    };

    // pages/class.jade compiled template
    templatizer["pages"]["class"] = function tmpl_pages_class() {
        return '<section class="page class-page"><h1>Class Page!</h1><div data-hook="threads-list" class="container"></div><form data-hook="add-thread-form" class="hidden"><fieldset data-hook="field-container"></fieldset><div class="buttons"><button id="submit" type="submit" class="btn">Submit</button></div></form><button data-hook="add-thread" class="btn">Add a Thread</button></section>';
    };

    // pages/classes.jade compiled template
    templatizer["pages"]["classes"] = function tmpl_pages_classes() {
        return '<section class="page classes-page"><h1>classes page!</h1><div data-hook="my-classes" class="myClasses"></div><div data-hook="all-classes" class="allClasses"></div><button data-hook="add-class" class="btn">Add a Class</button></section>';
    };

    // pages/home.jade compiled template
    templatizer["pages"]["home"] = function tmpl_pages_home() {
        return '<section class="page home-page"><h1>This is the home page</h1></section>';
    };

    // pages/login.jade compiled template
    templatizer["pages"]["login"] = function tmpl_pages_login() {
        return '<section class="page login-page"><h1>Login Form</h1><form data-hook="user-login"><fieldset data-hook="field-container"></fieldset><div class="buttons"><button id="submit" type="submit" class="btn">Login</button><a href="/signup" class="btn">Signup</a></div></form></section>';
    };

    // pages/signup.jade compiled template
    templatizer["pages"]["signup"] = function tmpl_pages_signup() {
        return '<section class="page signup-page"><h1>Signup Form</h1><form data-hook="user-signup"><fieldset data-hook="field-container"></fieldset><div class="buttons"><button id="submit" type="submit" class="btn">Signup</button></div></form></section>';
    };

    // views/class.jade compiled template
    templatizer["views"]["class"] = function tmpl_views_class() {
        return '<div><a data-hook="view" class="classUrl"></a></div>';
    };

    // views/thread.jade compiled template
    templatizer["views"]["thread"] = function tmpl_views_thread() {
        return '<div class="thread"><span data-hook="thread-title"></span><p data-hook="thread-content"></p></div>';
    };

    return templatizer;
}));
