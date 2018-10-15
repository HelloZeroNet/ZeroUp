

/* ---- /1uPLoaDwKzP6MCGoVzw48r4pxawRBdmQc/js/lib/Class.coffee ---- */


(function() {
  var Class,
    slice = [].slice;

  Class = (function() {
    function Class() {}

    Class.prototype.trace = true;

    Class.prototype.log = function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      if (!this.trace) {
        return;
      }
      if (typeof console === 'undefined') {
        return;
      }
      args.unshift("[" + this.constructor.name + "]");
      console.log.apply(console, args);
      return this;
    };

    Class.prototype.logStart = function() {
      var args, name;
      name = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      if (!this.trace) {
        return;
      }
      this.logtimers || (this.logtimers = {});
      this.logtimers[name] = +(new Date);
      if (args.length > 0) {
        this.log.apply(this, ["" + name].concat(slice.call(args), ["(started)"]));
      }
      return this;
    };

    Class.prototype.logEnd = function() {
      var args, ms, name;
      name = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      ms = +(new Date) - this.logtimers[name];
      this.log.apply(this, ["" + name].concat(slice.call(args), ["(Done in " + ms + "ms)"]));
      return this;
    };

    return Class;

  })();

  window.Class = Class;

}).call(this);


/* ---- /1uPLoaDwKzP6MCGoVzw48r4pxawRBdmQc/js/lib/Dollar.coffee ---- */


(function() {
  window.$ = function(selector) {
    if (selector.startsWith("#")) {
      return document.getElementById(selector.replace("#", ""));
    }
  };

}).call(this);


/* ---- /1uPLoaDwKzP6MCGoVzw48r4pxawRBdmQc/js/lib/Promise.coffee ---- */


(function() {
  var Promise,
    slice = [].slice;

  Promise = (function() {
    Promise.join = function() {
      var args, fn, i, len, num_uncompleted, promise, task, task_id, tasks;
      tasks = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      num_uncompleted = tasks.length;
      args = new Array(num_uncompleted);
      promise = new Promise();
      fn = function(task_id) {
        return task.then(function() {
          var callback, j, len1, ref, results;
          args[task_id] = Array.prototype.slice.call(arguments);
          num_uncompleted--;
          if (num_uncompleted === 0) {
            ref = promise.callbacks;
            results = [];
            for (j = 0, len1 = ref.length; j < len1; j++) {
              callback = ref[j];
              results.push(callback.apply(promise, args));
            }
            return results;
          }
        });
      };
      for (task_id = i = 0, len = tasks.length; i < len; task_id = ++i) {
        task = tasks[task_id];
        fn(task_id);
      }
      return promise;
    };

    function Promise() {
      this.resolved = false;
      this.end_promise = null;
      this.result = null;
      this.callbacks = [];
    }

    Promise.prototype.resolve = function() {
      var back, callback, i, len, ref;
      if (this.resolved) {
        return false;
      }
      this.resolved = true;
      this.data = arguments;
      if (!arguments.length) {
        this.data = [true];
      }
      this.result = this.data[0];
      ref = this.callbacks;
      for (i = 0, len = ref.length; i < len; i++) {
        callback = ref[i];
        back = callback.apply(callback, this.data);
      }
      if (this.end_promise && back && back.then) {
        return back.then((function(_this) {
          return function(back_res) {
            return _this.end_promise.resolve(back_res);
          };
        })(this));
      }
    };

    Promise.prototype.fail = function() {
      return this.resolve(false);
    };

    Promise.prototype.then = function(callback) {
      if (this.resolved === true) {
        return callback.apply(callback, this.data);
      }
      this.callbacks.push(callback);
      this.end_promise = new Promise();
      return this.end_promise;
    };

    return Promise;

  })();

  window.Promise = Promise;


  /*
  s = Date.now()
  log = (text) ->
  	console.log Date.now()-s, Array.prototype.slice.call(arguments).join(", ")

  log "Started"

  cmd = (query) ->
  	p = new Promise()
  	setTimeout ( ->
  		p.resolve query+" Result"
  	), 100
  	return p


  back = cmd("SELECT * FROM message").then (res) ->
  	log res
  	p = new Promise()
  	setTimeout ( ->
  		p.resolve("DONE parsing SELECT")
  	), 100
  	return p
  .then (res) ->
  	log "Back of messages", res
  	return cmd("SELECT * FROM users")
  .then (res) ->
  	log "End result", res

  log "Query started", back


  q1 = cmd("SELECT * FROM anything")
  q2 = cmd("SELECT * FROM something")

  Promise.join(q1, q2).then (res1, res2) ->
    log res1, res2
   */

}).call(this);


/* ---- /1uPLoaDwKzP6MCGoVzw48r4pxawRBdmQc/js/lib/Property.coffee ---- */


(function() {
  Function.prototype.property = function(prop, desc) {
    return Object.defineProperty(this.prototype, prop, desc);
  };

}).call(this);


/* ---- /1uPLoaDwKzP6MCGoVzw48r4pxawRBdmQc/js/lib/Prototypes.coffee ---- */


(function() {
  String.prototype.startsWith = function(s) {
    return this.slice(0, s.length) === s;
  };

  String.prototype.endsWith = function(s) {
    return s === '' || this.slice(-s.length) === s;
  };

  String.prototype.repeat = function(count) {
    return new Array(count + 1).join(this);
  };

  window.isEmpty = function(obj) {
    var key;
    for (key in obj) {
      return false;
    }
    return true;
  };

}).call(this);


/* ---- /1uPLoaDwKzP6MCGoVzw48r4pxawRBdmQc/js/lib/RateLimitCb.coffee ---- */


(function() {
  var call_after_interval, calling, last_time,
    slice = [].slice;

  last_time = {};

  calling = {};

  call_after_interval = {};

  window.RateLimitCb = function(interval, fn, args) {
    var cb;
    if (args == null) {
      args = [];
    }
    cb = function() {
      var left;
      left = interval - (Date.now() - last_time[fn]);
      if (left <= 0) {
        delete last_time[fn];
        if (calling[fn]) {
          RateLimitCb(interval, fn, calling[fn]);
        }
        return delete calling[fn];
      } else {
        return setTimeout((function() {
          delete last_time[fn];
          if (calling[fn]) {
            RateLimitCb(interval, fn, calling[fn]);
          }
          return delete calling[fn];
        }), left);
      }
    };
    if (last_time[fn]) {
      return calling[fn] = args;
    } else {
      last_time[fn] = Date.now();
      return fn.apply(this, [cb].concat(slice.call(args)));
    }
  };

  window.RateLimit = function(interval, fn) {
    if (!calling[fn]) {
      call_after_interval[fn] = false;
      fn();
      return calling[fn] = setTimeout((function() {
        if (call_after_interval[fn]) {
          fn();
        }
        delete calling[fn];
        return delete call_after_interval[fn];
      }), interval);
    } else {
      return call_after_interval[fn] = true;
    }
  };


  /*
  window.s = Date.now()
  window.load = (done, num) ->
    console.log "Loading #{num}...", Date.now()-window.s
    setTimeout (-> done()), 1000

  RateLimit 500, window.load, [0] # Called instantly
  RateLimit 500, window.load, [1]
  setTimeout (-> RateLimit 500, window.load, [300]), 300
  setTimeout (-> RateLimit 500, window.load, [600]), 600 # Called after 1000ms
  setTimeout (-> RateLimit 500, window.load, [1000]), 1000
  setTimeout (-> RateLimit 500, window.load, [1200]), 1200  # Called after 2000ms
  setTimeout (-> RateLimit 500, window.load, [3000]), 3000  # Called after 3000ms
   */

}).call(this);


/* ---- /1uPLoaDwKzP6MCGoVzw48r4pxawRBdmQc/js/lib/anime.min.js ---- */


/*
 * Anime v1.0.0
 * http://anime-js.com
 * JavaScript animation engine
 * Copyright (c) 2016 Julian Garnier
 * http://juliangarnier.com
 * Released under the MIT license
 */
(function(r,n){"function"===typeof define&&define.amd?define([],n):"object"===typeof module&&module.exports?module.exports=n():r.anime=n()})(this,function(){var r={duration:1E3,delay:0,loop:!1,autoplay:!0,direction:"normal",easing:"easeOutElastic",elasticity:400,round:!1,begin:void 0,update:void 0,complete:void 0},n="translateX translateY translateZ rotate rotateX rotateY rotateZ scale scaleX scaleY scaleZ skewX skewY".split(" "),e=function(){return{array:function(a){return Array.isArray(a)},object:function(a){return-1<
Object.prototype.toString.call(a).indexOf("Object")},html:function(a){return a instanceof NodeList||a instanceof HTMLCollection},node:function(a){return a.nodeType},svg:function(a){return a instanceof SVGElement},number:function(a){return!isNaN(parseInt(a))},string:function(a){return"string"===typeof a},func:function(a){return"function"===typeof a},undef:function(a){return"undefined"===typeof a},"null":function(a){return"null"===typeof a},hex:function(a){return/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a)},
rgb:function(a){return/^rgb/.test(a)},rgba:function(a){return/^rgba/.test(a)},hsl:function(a){return/^hsl/.test(a)},color:function(a){return e.hex(a)||e.rgb(a)||e.rgba(a)||e.hsl(a)}}}(),z=function(){var a={},b={Sine:function(a){return 1-Math.cos(a*Math.PI/2)},Circ:function(a){return 1-Math.sqrt(1-a*a)},Elastic:function(a,b){if(0===a||1===a)return a;var f=1-Math.min(b,998)/1E3,h=a/1-1;return-(Math.pow(2,10*h)*Math.sin(2*(h-f/(2*Math.PI)*Math.asin(1))*Math.PI/f))},Back:function(a){return a*a*(3*a-2)},
Bounce:function(a){for(var b,f=4;a<((b=Math.pow(2,--f))-1)/11;);return 1/Math.pow(4,3-f)-7.5625*Math.pow((3*b-2)/22-a,2)}};["Quad","Cubic","Quart","Quint","Expo"].forEach(function(a,d){b[a]=function(a){return Math.pow(a,d+2)}});Object.keys(b).forEach(function(c){var d=b[c];a["easeIn"+c]=d;a["easeOut"+c]=function(a,b){return 1-d(1-a,b)};a["easeInOut"+c]=function(a,b){return.5>a?d(2*a,b)/2:1-d(-2*a+2,b)/2}});a.linear=function(a){return a};return a}(),u=function(a){return e.string(a)?a:a+""},A=function(a){return a.replace(/([a-z])([A-Z])/g,
"$1-$2").toLowerCase()},B=function(a){if(e.color(a))return!1;try{return document.querySelectorAll(a)}catch(b){return!1}},v=function(a){return a.reduce(function(a,c){return a.concat(e.array(c)?v(c):c)},[])},p=function(a){if(e.array(a))return a;e.string(a)&&(a=B(a)||a);return e.html(a)?[].slice.call(a):[a]},C=function(a,b){return a.some(function(a){return a===b})},N=function(a,b){var c={};a.forEach(function(a){var f=JSON.stringify(b.map(function(b){return a[b]}));c[f]=c[f]||[];c[f].push(a)});return Object.keys(c).map(function(a){return c[a]})},
D=function(a){return a.filter(function(a,c,d){return d.indexOf(a)===c})},w=function(a){var b={},c;for(c in a)b[c]=a[c];return b},t=function(a,b){for(var c in b)a[c]=e.undef(a[c])?b[c]:a[c];return a},O=function(a){a=a.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,function(a,b,c,e){return b+b+c+c+e+e});var b=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(a);a=parseInt(b[1],16);var c=parseInt(b[2],16),b=parseInt(b[3],16);return"rgb("+a+","+c+","+b+")"},P=function(a){a=/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(a);
var b=parseInt(a[1])/360,c=parseInt(a[2])/100,d=parseInt(a[3])/100;a=function(a,b,c){0>c&&(c+=1);1<c&&--c;return c<1/6?a+6*(b-a)*c:.5>c?b:c<2/3?a+(b-a)*(2/3-c)*6:a};if(0==c)c=d=b=d;else var f=.5>d?d*(1+c):d+c-d*c,h=2*d-f,c=a(h,f,b+1/3),d=a(h,f,b),b=a(h,f,b-1/3);return"rgb("+255*c+","+255*d+","+255*b+")"},k=function(a){return/([\+\-]?[0-9|auto\.]+)(%|px|pt|em|rem|in|cm|mm|ex|pc|vw|vh|deg)?/.exec(a)[2]},E=function(a,b,c){return k(b)?b:-1<a.indexOf("translate")?k(c)?b+k(c):b+"px":-1<a.indexOf("rotate")||
-1<a.indexOf("skew")?b+"deg":b},F=function(a,b){if((e.node(a)||e.svg(a))&&C(n,b))return"transform";if((e.node(a)||e.svg(a))&&"transform"!==b&&x(a,b))return"css";if((e.node(a)||e.svg(a))&&(a.getAttribute(b)||e.svg(a)&&a[b]))return"attribute";if(!e["null"](a[b])&&!e.undef(a[b]))return"object"},x=function(a,b){if(b in a.style)return getComputedStyle(a).getPropertyValue(A(b))||"0"},Q=function(a,b){var c=-1<b.indexOf("scale")?1:0,d=a.style.transform;if(!d)return c;for(var f=/(\w+)\((.+?)\)/g,h=[],e=[],
q=[];h=f.exec(d);)e.push(h[1]),q.push(h[2]);d=q.filter(function(a,c){return e[c]===b});return d.length?d[0]:c},G=function(a,b){switch(F(a,b)){case "transform":return Q(a,b);case "css":return x(a,b);case "attribute":return a.getAttribute(b)}return a[b]||0},H=function(a,b,c){if(e.color(b))return b=e.rgb(b)||e.rgba(b)?b:e.hex(b)?O(b):e.hsl(b)?P(b):void 0,b;if(k(b))return b;a=k(a.to)?k(a.to):k(a.from);!a&&c&&(a=k(c));return a?b+a:b},I=function(a){var b=/-?\d*\.?\d+/g;return{original:a,numbers:u(a).match(b)?
u(a).match(b).map(Number):[0],strings:u(a).split(b)}},R=function(a,b,c){return b.reduce(function(b,f,e){f=f?f:c[e-1];return b+a[e-1]+f})},S=function(a){a=a?v(e.array(a)?a.map(p):p(a)):[];return a.map(function(a,c){return{target:a,id:c}})},T=function(a,b){var c=[],d;for(d in a)if(!r.hasOwnProperty(d)&&"targets"!==d){var f=e.object(a[d])?w(a[d]):{value:a[d]};f.name=d;c.push(t(f,b))}return c},J=function(a,b,c,d){"transform"===c?(c=a+"("+E(a,b.from,b.to)+")",b=a+"("+E(a,b.to)+")"):(a="css"===c?x(d,a):
void 0,c=H(b,b.from,a),b=H(b,b.to,a));return{from:I(c),to:I(b)}},U=function(a,b){var c=[];a.forEach(function(d,f){var h=d.target;return b.forEach(function(b){var q=F(h,b.name);if(q){var k;k=b.name;var g=b.value,g=p(e.func(g)?g(h,f):g);k={from:1<g.length?g[0]:G(h,k),to:1<g.length?g[1]:g[0]};g=w(b);g.animatables=d;g.type=q;g.from=J(b.name,k,g.type,h).from;g.to=J(b.name,k,g.type,h).to;g.round=e.color(k.from)||g.round?1:0;g.delay=(e.func(g.delay)?g.delay(h,f,a.length):g.delay)/l.speed;g.duration=(e.func(g.duration)?
g.duration(h,f,a.length):g.duration)/l.speed;c.push(g)}})});return c},V=function(a,b){var c=U(a,b);return N(c,["name","from","to","delay","duration"]).map(function(a){var b=w(a[0]);b.animatables=a.map(function(a){return a.animatables});b.totalDuration=b.delay+b.duration;return b})},y=function(a,b){a.tweens.forEach(function(c){var d=c.from,f=a.duration-(c.delay+c.duration);c.from=c.to;c.to=d;b&&(c.delay=f)});a.reversed=a.reversed?!1:!0},K=function(a){var b=[],c=[];a.tweens.forEach(function(a){if("css"===
a.type||"transform"===a.type)b.push("css"===a.type?A(a.name):"transform"),a.animatables.forEach(function(a){c.push(a.target)})});return{properties:D(b).join(", "),elements:D(c)}},W=function(a){var b=K(a);b.elements.forEach(function(a){a.style.willChange=b.properties})},X=function(a){K(a).elements.forEach(function(a){a.style.removeProperty("will-change")})},Y=function(a,b){var c=a.path,d=a.value*b,f=function(f){f=f||0;return c.getPointAtLength(1<b?a.value+f:d+f)},e=f(),k=f(-1),f=f(1);switch(a.name){case "translateX":return e.x;
case "translateY":return e.y;case "rotate":return 180*Math.atan2(f.y-k.y,f.x-k.x)/Math.PI}},Z=function(a,b){var c=Math.min(Math.max(b-a.delay,0),a.duration)/a.duration,d=a.to.numbers.map(function(b,d){var e=a.from.numbers[d],k=z[a.easing](c,a.elasticity),e=a.path?Y(a,k):e+k*(b-e);return e=a.round?Math.round(e*a.round)/a.round:e});return R(d,a.to.strings,a.from.strings)},L=function(a,b){var c=void 0;a.time=Math.min(b,a.duration);a.progress=a.time/a.duration*100;a.tweens.forEach(function(a){a.currentValue=
Z(a,b);var d=a.currentValue;a.animatables.forEach(function(b){var e=b.id;switch(a.type){case "css":b.target.style[a.name]=d;break;case "attribute":b.target.setAttribute(a.name,d);break;case "object":b.target[a.name]=d;break;case "transform":c||(c={}),c[e]||(c[e]=[]),c[e].push(d)}})});if(c)for(var d in c)a.animatables[d].target.style.transform=c[d].join(" ");a.settings.update&&a.settings.update(a)},M=function(a){var b={};b.animatables=S(a.targets);b.settings=t(a,r);b.properties=T(a,b.settings);b.tweens=
V(b.animatables,b.properties);b.duration=b.tweens.length?Math.max.apply(Math,b.tweens.map(function(a){return a.totalDuration})):a.duration/l.speed;b.time=0;b.progress=0;b.running=!1;b.ended=!1;return b},m=[],l=function(a){var b=M(a),c={tick:function(){if(b.running){b.ended=!1;c.now=+new Date;c.current=c.last+c.now-c.start;L(b,c.current);var a=b.settings;a.begin&&c.current>=a.delay&&(a.begin(b),a.begin=void 0);c.current>=b.duration?(a.loop?(c.start=+new Date,"alternate"===a.direction&&y(b,!0),e.number(a.loop)&&
a.loop--,c.raf=requestAnimationFrame(c.tick)):(b.ended=!0,a.complete&&a.complete(b),b.pause()),c.last=0):c.raf=requestAnimationFrame(c.tick)}}};b.seek=function(a){L(b,a/100*b.duration)};b.pause=function(){b.running=!1;cancelAnimationFrame(c.raf);X(b);var a=m.indexOf(b);-1<a&&m.splice(a,1)};b.play=function(a){a&&(b=t(M(t(a,b.settings)),b));b.pause();b.running=!0;c.start=+new Date;c.last=b.ended?0:b.time;a=b.settings;"reverse"===a.direction&&y(b);"alternate"!==a.direction||a.loop||(a.loop=1);W(b);m.push(b);
c.raf=requestAnimationFrame(c.tick)};b.restart=function(){b.reversed&&y(b);b.pause();b.seek(0);b.play()};b.settings.autoplay&&b.play();return b};l.speed=1;l.list=m;l.remove=function(a){a=v(e.array(a)?a.map(p):p(a));for(var b=m.length-1;0<=b;b--)for(var c=m[b],d=c.tweens.length-1;0<=d;d--)for(var f=c.tweens[d],h=f.animatables.length-1;0<=h;h--)C(a,f.animatables[h].target)&&(f.animatables.splice(h,1),f.animatables.length||c.tweens.splice(d,1),c.tweens.length||c.pause())};l.easings=z;l.getValue=G;l.path=
function(a){a=e.string(a)?B(a)[0]:a;return{path:a,value:a.getTotalLength()}};l.random=function(a,b){return Math.floor(Math.random()*(b-a+1))+a};return l});


/* ---- /1uPLoaDwKzP6MCGoVzw48r4pxawRBdmQc/js/lib/maquette.js ---- */


(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports'], factory);
    } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
        // CommonJS
        factory(exports);
    } else {
        // Browser globals
        factory(root.maquette = {});
    }
}(this, function (exports) {
    'use strict';
    // Comment that is displayed in the API documentation for the maquette module:
    /**
 * Welcome to the API documentation of the **maquette** library.
 *
 * [[http://maquettejs.org/|To the maquette homepage]]
 */
    Object.defineProperty(exports, '__esModule', { value: true });
    var NAMESPACE_W3 = 'http://www.w3.org/';
    var NAMESPACE_SVG = NAMESPACE_W3 + '2000/svg';
    var NAMESPACE_XLINK = NAMESPACE_W3 + '1999/xlink';
    // Utilities
    var emptyArray = [];
    var extend = function (base, overrides) {
        var result = {};
        Object.keys(base).forEach(function (key) {
            result[key] = base[key];
        });
        if (overrides) {
            Object.keys(overrides).forEach(function (key) {
                result[key] = overrides[key];
            });
        }
        return result;
    };
    // Hyperscript helper functions
    var same = function (vnode1, vnode2) {
        if (vnode1.vnodeSelector !== vnode2.vnodeSelector) {
            return false;
        }
        if (vnode1.properties && vnode2.properties) {
            if (vnode1.properties.key !== vnode2.properties.key) {
                return false;
            }
            return vnode1.properties.bind === vnode2.properties.bind;
        }
        return !vnode1.properties && !vnode2.properties;
    };
    var toTextVNode = function (data) {
        return {
            vnodeSelector: '',
            properties: undefined,
            children: undefined,
            text: data.toString(),
            domNode: null
        };
    };
    var appendChildren = function (parentSelector, insertions, main) {
        for (var i = 0, length_1 = insertions.length; i < length_1; i++) {
            var item = insertions[i];
            if (Array.isArray(item)) {
                appendChildren(parentSelector, item, main);
            } else {
                if (item !== null && item !== undefined) {
                    if (!item.hasOwnProperty('vnodeSelector')) {
                        item = toTextVNode(item);
                    }
                    main.push(item);
                }
            }
        }
    };
    // Render helper functions
    var missingTransition = function () {
        throw new Error('Provide a transitions object to the projectionOptions to do animations');
    };
    var DEFAULT_PROJECTION_OPTIONS = {
        namespace: undefined,
        eventHandlerInterceptor: undefined,
        styleApplyer: function (domNode, styleName, value) {
            // Provides a hook to add vendor prefixes for browsers that still need it.
            domNode.style[styleName] = value;
        },
        transitions: {
            enter: missingTransition,
            exit: missingTransition
        }
    };
    var applyDefaultProjectionOptions = function (projectorOptions) {
        return extend(DEFAULT_PROJECTION_OPTIONS, projectorOptions);
    };
    var checkStyleValue = function (styleValue) {
        if (typeof styleValue !== 'string') {
            throw new Error('Style values must be strings');
        }
    };
    var setProperties = function (domNode, properties, projectionOptions) {
        if (!properties) {
            return;
        }
        var eventHandlerInterceptor = projectionOptions.eventHandlerInterceptor;
        var propNames = Object.keys(properties);
        var propCount = propNames.length;
        var _loop_1 = function (i) {
            var propName = propNames[i];
            /* tslint:disable:no-var-keyword: edge case */
            var propValue = properties[propName];
            /* tslint:enable:no-var-keyword */
            if (propName === 'className') {
                throw new Error('Property "className" is not supported, use "class".');
            } else if (propName === 'class') {
                propValue.split(/\s+/).forEach(function (token) {
                    return domNode.classList.add(token);
                });
            } else if (propName === 'classes') {
                // object with string keys and boolean values
                var classNames = Object.keys(propValue);
                var classNameCount = classNames.length;
                for (var j = 0; j < classNameCount; j++) {
                    var className = classNames[j];
                    if (propValue[className]) {
                        domNode.classList.add(className);
                    }
                }
            } else if (propName === 'styles') {
                // object with string keys and string (!) values
                var styleNames = Object.keys(propValue);
                var styleCount = styleNames.length;
                for (var j = 0; j < styleCount; j++) {
                    var styleName = styleNames[j];
                    var styleValue = propValue[styleName];
                    if (styleValue) {
                        checkStyleValue(styleValue);
                        projectionOptions.styleApplyer(domNode, styleName, styleValue);
                    }
                }
            } else if (propName !== 'key' && propValue !== null && propValue !== undefined) {
                var type = typeof propValue;
                if (type === 'function') {
                    if (propName.lastIndexOf('on', 0) === 0) {
                        if (eventHandlerInterceptor) {
                            propValue = eventHandlerInterceptor(propName, propValue, domNode, properties);    // intercept eventhandlers
                        }
                        if (propName === 'oninput') {
                            (function () {
                                // record the evt.target.value, because IE and Edge sometimes do a requestAnimationFrame between changing value and running oninput
                                var oldPropValue = propValue;
                                propValue = function (evt) {
                                    oldPropValue.apply(this, [evt]);
                                    evt.target['oninput-value'] = evt.target.value;    // may be HTMLTextAreaElement as well
                                };
                            }());
                        }
                        domNode[propName] = propValue;
                    }
                } else if (type === 'string' && propName !== 'value' && propName !== 'innerHTML') {
                    if (projectionOptions.namespace === NAMESPACE_SVG && propName === 'href') {
                        domNode.setAttributeNS(NAMESPACE_XLINK, propName, propValue);
                    } else {
                        domNode.setAttribute(propName, propValue);
                    }
                } else {
                    domNode[propName] = propValue;
                }
            }
        };
        for (var i = 0; i < propCount; i++) {
            _loop_1(i);
        }
    };
    var updateProperties = function (domNode, previousProperties, properties, projectionOptions) {
        if (!properties) {
            return;
        }
        var propertiesUpdated = false;
        var propNames = Object.keys(properties);
        var propCount = propNames.length;
        for (var i = 0; i < propCount; i++) {
            var propName = propNames[i];
            // assuming that properties will be nullified instead of missing is by design
            var propValue = properties[propName];
            var previousValue = previousProperties[propName];
            if (propName === 'class') {
                if (previousValue !== propValue) {
                    throw new Error('"class" property may not be updated. Use the "classes" property for conditional css classes.');
                }
            } else if (propName === 'classes') {
                var classList = domNode.classList;
                var classNames = Object.keys(propValue);
                var classNameCount = classNames.length;
                for (var j = 0; j < classNameCount; j++) {
                    var className = classNames[j];
                    var on = !!propValue[className];
                    var previousOn = !!previousValue[className];
                    if (on === previousOn) {
                        continue;
                    }
                    propertiesUpdated = true;
                    if (on) {
                        classList.add(className);
                    } else {
                        classList.remove(className);
                    }
                }
            } else if (propName === 'styles') {
                var styleNames = Object.keys(propValue);
                var styleCount = styleNames.length;
                for (var j = 0; j < styleCount; j++) {
                    var styleName = styleNames[j];
                    var newStyleValue = propValue[styleName];
                    var oldStyleValue = previousValue[styleName];
                    if (newStyleValue === oldStyleValue) {
                        continue;
                    }
                    propertiesUpdated = true;
                    if (newStyleValue) {
                        checkStyleValue(newStyleValue);
                        projectionOptions.styleApplyer(domNode, styleName, newStyleValue);
                    } else {
                        projectionOptions.styleApplyer(domNode, styleName, '');
                    }
                }
            } else {
                if (!propValue && typeof previousValue === 'string') {
                    propValue = '';
                }
                if (propName === 'value') {
                    var domValue = domNode[propName];
                    if (domValue !== propValue    // The 'value' in the DOM tree !== newValue
&& (domNode['oninput-value'] ? domValue === domNode['oninput-value']    // If the last reported value to 'oninput' does not match domValue, do nothing and wait for oninput
 : propValue !== previousValue    // Only update the value if the vdom changed
)) {
                        domNode[propName] = propValue;
                        // Reset the value, even if the virtual DOM did not change
                        domNode['oninput-value'] = undefined;
                    }
                    // else do not update the domNode, otherwise the cursor position would be changed
                    if (propValue !== previousValue) {
                        propertiesUpdated = true;
                    }
                } else if (propValue !== previousValue) {
                    var type = typeof propValue;
                    if (type === 'function') {
                        throw new Error('Functions may not be updated on subsequent renders (property: ' + propName + '). Hint: declare event handler functions outside the render() function.');
                    }
                    if (type === 'string' && propName !== 'innerHTML') {
                        if (projectionOptions.namespace === NAMESPACE_SVG && propName === 'href') {
                            domNode.setAttributeNS(NAMESPACE_XLINK, propName, propValue);
                        } else if (propName === 'role' && propValue === '') {
                            domNode.removeAttribute(propName);
                        } else {
                            domNode.setAttribute(propName, propValue);
                        }
                    } else {
                        if (domNode[propName] !== propValue) {
                            domNode[propName] = propValue;
                        }
                    }
                    propertiesUpdated = true;
                }
            }
        }
        return propertiesUpdated;
    };
    var findIndexOfChild = function (children, sameAs, start) {
        if (sameAs.vnodeSelector !== '') {
            // Never scan for text-nodes
            for (var i = start; i < children.length; i++) {
                if (same(children[i], sameAs)) {
                    return i;
                }
            }
        }
        return -1;
    };
    var nodeAdded = function (vNode, transitions) {
        if (vNode.properties) {
            var enterAnimation = vNode.properties.enterAnimation;
            if (enterAnimation) {
                if (typeof enterAnimation === 'function') {
                    enterAnimation(vNode.domNode, vNode.properties);
                } else {
                    transitions.enter(vNode.domNode, vNode.properties, enterAnimation);
                }
            }
        }
    };
    var nodeToRemove = function (vNode, transitions) {
        var domNode = vNode.domNode;
        if (vNode.properties) {
            var exitAnimation = vNode.properties.exitAnimation;
            if (exitAnimation) {
                domNode.style.pointerEvents = 'none';
                var removeDomNode = function () {
                    if (domNode.parentNode) {
                        domNode.parentNode.removeChild(domNode);
                    }
                };
                if (typeof exitAnimation === 'function') {
                    exitAnimation(domNode, removeDomNode, vNode.properties);
                    return;
                } else {
                    transitions.exit(vNode.domNode, vNode.properties, exitAnimation, removeDomNode);
                    return;
                }
            }
        }
        if (domNode.parentNode) {
            domNode.parentNode.removeChild(domNode);
        }
    };
    var checkDistinguishable = function (childNodes, indexToCheck, parentVNode, operation) {
        var childNode = childNodes[indexToCheck];
        if (childNode.vnodeSelector === '') {
            return;    // Text nodes need not be distinguishable
        }
        var properties = childNode.properties;
        var key = properties ? properties.key === undefined ? properties.bind : properties.key : undefined;
        if (!key) {
            for (var i = 0; i < childNodes.length; i++) {
                if (i !== indexToCheck) {
                    var node = childNodes[i];
                    if (same(node, childNode)) {
                        if (operation === 'added') {
                            throw new Error(parentVNode.vnodeSelector + ' had a ' + childNode.vnodeSelector + ' child ' + 'added, but there is now more than one. You must add unique key properties to make them distinguishable.');
                        } else {
                            throw new Error(parentVNode.vnodeSelector + ' had a ' + childNode.vnodeSelector + ' child ' + 'removed, but there were more than one. You must add unique key properties to make them distinguishable.');
                        }
                    }
                }
            }
        }
    };
    var createDom;
    var updateDom;
    var updateChildren = function (vnode, domNode, oldChildren, newChildren, projectionOptions) {
        if (oldChildren === newChildren) {
            return false;
        }
        oldChildren = oldChildren || emptyArray;
        newChildren = newChildren || emptyArray;
        var oldChildrenLength = oldChildren.length;
        var newChildrenLength = newChildren.length;
        var transitions = projectionOptions.transitions;
        var oldIndex = 0;
        var newIndex = 0;
        var i;
        var textUpdated = false;
        while (newIndex < newChildrenLength) {
            var oldChild = oldIndex < oldChildrenLength ? oldChildren[oldIndex] : undefined;
            var newChild = newChildren[newIndex];
            if (oldChild !== undefined && same(oldChild, newChild)) {
                textUpdated = updateDom(oldChild, newChild, projectionOptions) || textUpdated;
                oldIndex++;
            } else {
                var findOldIndex = findIndexOfChild(oldChildren, newChild, oldIndex + 1);
                if (findOldIndex >= 0) {
                    // Remove preceding missing children
                    for (i = oldIndex; i < findOldIndex; i++) {
                        nodeToRemove(oldChildren[i], transitions);
                        checkDistinguishable(oldChildren, i, vnode, 'removed');
                    }
                    textUpdated = updateDom(oldChildren[findOldIndex], newChild, projectionOptions) || textUpdated;
                    oldIndex = findOldIndex + 1;
                } else {
                    // New child
                    createDom(newChild, domNode, oldIndex < oldChildrenLength ? oldChildren[oldIndex].domNode : undefined, projectionOptions);
                    nodeAdded(newChild, transitions);
                    checkDistinguishable(newChildren, newIndex, vnode, 'added');
                }
            }
            newIndex++;
        }
        if (oldChildrenLength > oldIndex) {
            // Remove child fragments
            for (i = oldIndex; i < oldChildrenLength; i++) {
                nodeToRemove(oldChildren[i], transitions);
                checkDistinguishable(oldChildren, i, vnode, 'removed');
            }
        }
        return textUpdated;
    };
    var addChildren = function (domNode, children, projectionOptions) {
        if (!children) {
            return;
        }
        for (var i = 0; i < children.length; i++) {
            createDom(children[i], domNode, undefined, projectionOptions);
        }
    };
    var initPropertiesAndChildren = function (domNode, vnode, projectionOptions) {
        addChildren(domNode, vnode.children, projectionOptions);
        // children before properties, needed for value property of <select>.
        if (vnode.text) {
            domNode.textContent = vnode.text;
        }
        setProperties(domNode, vnode.properties, projectionOptions);
        if (vnode.properties && vnode.properties.afterCreate) {
            vnode.properties.afterCreate.apply(vnode.properties.bind || vnode.properties, [
                domNode,
                projectionOptions,
                vnode.vnodeSelector,
                vnode.properties,
                vnode.children
            ]);
        }
    };
    createDom = function (vnode, parentNode, insertBefore, projectionOptions) {
        var domNode, i, c, start = 0, type, found;
        var vnodeSelector = vnode.vnodeSelector;
        var doc = parentNode.ownerDocument;
        if (vnodeSelector === '') {
            domNode = vnode.domNode = doc.createTextNode(vnode.text);
            if (insertBefore !== undefined) {
                parentNode.insertBefore(domNode, insertBefore);
            } else {
                parentNode.appendChild(domNode);
            }
        } else {
            for (i = 0; i <= vnodeSelector.length; ++i) {
                c = vnodeSelector.charAt(i);
                if (i === vnodeSelector.length || c === '.' || c === '#') {
                    type = vnodeSelector.charAt(start - 1);
                    found = vnodeSelector.slice(start, i);
                    if (type === '.') {
                        domNode.classList.add(found);
                    } else if (type === '#') {
                        domNode.id = found;
                    } else {
                        if (found === 'svg') {
                            projectionOptions = extend(projectionOptions, { namespace: NAMESPACE_SVG });
                        }
                        if (projectionOptions.namespace !== undefined) {
                            domNode = vnode.domNode = doc.createElementNS(projectionOptions.namespace, found);
                        } else {
                            domNode = vnode.domNode = vnode.domNode || doc.createElement(found);
                            if (found === 'input' && vnode.properties && vnode.properties.type !== undefined) {
                                // IE8 and older don't support setting input type after the DOM Node has been added to the document
                                domNode.setAttribute('type', vnode.properties.type);
                            }
                        }
                        if (insertBefore !== undefined) {
                            parentNode.insertBefore(domNode, insertBefore);
                        } else if (domNode.parentNode !== parentNode) {
                            parentNode.appendChild(domNode);
                        }
                    }
                    start = i + 1;
                }
            }
            initPropertiesAndChildren(domNode, vnode, projectionOptions);
        }
    };
    updateDom = function (previous, vnode, projectionOptions) {
        var domNode = previous.domNode;
        var textUpdated = false;
        if (previous === vnode) {
            return false;    // By contract, VNode objects may not be modified anymore after passing them to maquette
        }
        var updated = false;
        if (vnode.vnodeSelector === '') {
            if (vnode.text !== previous.text) {
                var newVNode = domNode.ownerDocument.createTextNode(vnode.text);
                domNode.parentNode.replaceChild(newVNode, domNode);
                vnode.domNode = newVNode;
                textUpdated = true;
                return textUpdated;
            }
        } else {
            if (vnode.vnodeSelector.lastIndexOf('svg', 0) === 0) {
                projectionOptions = extend(projectionOptions, { namespace: NAMESPACE_SVG });
            }
            if (previous.text !== vnode.text) {
                updated = true;
                if (vnode.text === undefined) {
                    domNode.removeChild(domNode.firstChild);    // the only textnode presumably
                } else {
                    domNode.textContent = vnode.text;
                }
            }
            updated = updateChildren(vnode, domNode, previous.children, vnode.children, projectionOptions) || updated;
            updated = updateProperties(domNode, previous.properties, vnode.properties, projectionOptions) || updated;
            if (vnode.properties && vnode.properties.afterUpdate) {
                vnode.properties.afterUpdate.apply(vnode.properties.bind || vnode.properties, [
                    domNode,
                    projectionOptions,
                    vnode.vnodeSelector,
                    vnode.properties,
                    vnode.children
                ]);
            }
        }
        if (updated && vnode.properties && vnode.properties.updateAnimation) {
            vnode.properties.updateAnimation(domNode, vnode.properties, previous.properties);
        }
        vnode.domNode = previous.domNode;
        return textUpdated;
    };
    var createProjection = function (vnode, projectionOptions) {
        return {
            update: function (updatedVnode) {
                if (vnode.vnodeSelector !== updatedVnode.vnodeSelector) {
                    throw new Error('The selector for the root VNode may not be changed. (consider using dom.merge and add one extra level to the virtual DOM)');
                }
                updateDom(vnode, updatedVnode, projectionOptions);
                vnode = updatedVnode;
            },
            domNode: vnode.domNode
        };
    };
    // The other two parameters are not added here, because the Typescript compiler creates surrogate code for destructuring 'children'.
    exports.h = function (selector) {
        var properties = arguments[1];
        if (typeof selector !== 'string') {
            throw new Error();
        }
        var childIndex = 1;
        if (properties && !properties.hasOwnProperty('vnodeSelector') && !Array.isArray(properties) && typeof properties === 'object') {
            childIndex = 2;
        } else {
            // Optional properties argument was omitted
            properties = undefined;
        }
        var text;
        var children;
        var argsLength = arguments.length;
        // Recognize a common special case where there is only a single text node
        if (argsLength === childIndex + 1) {
            var onlyChild = arguments[childIndex];
            if (typeof onlyChild === 'string') {
                text = onlyChild;
            } else if (onlyChild !== undefined && onlyChild !== null && onlyChild.length === 1 && typeof onlyChild[0] === 'string') {
                text = onlyChild[0];
            }
        }
        if (text === undefined) {
            children = [];
            for (; childIndex < argsLength; childIndex++) {
                var child = arguments[childIndex];
                if (child === null || child === undefined) {
                } else if (Array.isArray(child)) {
                    appendChildren(selector, child, children);
                } else if (child.hasOwnProperty('vnodeSelector')) {
                    children.push(child);
                } else {
                    children.push(toTextVNode(child));
                }
            }
        }
        return {
            vnodeSelector: selector,
            properties: properties,
            children: children,
            text: text === '' ? undefined : text,
            domNode: null
        };
    };
    /**
 * Contains simple low-level utility functions to manipulate the real DOM.
 */
    exports.dom = {
        /**
     * Creates a real DOM tree from `vnode`. The [[Projection]] object returned will contain the resulting DOM Node in
     * its [[Projection.domNode|domNode]] property.
     * This is a low-level method. Users will typically use a [[Projector]] instead.
     * @param vnode - The root of the virtual DOM tree that was created using the [[h]] function. NOTE: [[VNode]]
     * objects may only be rendered once.
     * @param projectionOptions - Options to be used to create and update the projection.
     * @returns The [[Projection]] which also contains the DOM Node that was created.
     */
        create: function (vnode, projectionOptions) {
            projectionOptions = applyDefaultProjectionOptions(projectionOptions);
            createDom(vnode, document.createElement('div'), undefined, projectionOptions);
            return createProjection(vnode, projectionOptions);
        },
        /**
     * Appends a new child node to the DOM which is generated from a [[VNode]].
     * This is a low-level method. Users will typically use a [[Projector]] instead.
     * @param parentNode - The parent node for the new child node.
     * @param vnode - The root of the virtual DOM tree that was created using the [[h]] function. NOTE: [[VNode]]
     * objects may only be rendered once.
     * @param projectionOptions - Options to be used to create and update the [[Projection]].
     * @returns The [[Projection]] that was created.
     */
        append: function (parentNode, vnode, projectionOptions) {
            projectionOptions = applyDefaultProjectionOptions(projectionOptions);
            createDom(vnode, parentNode, undefined, projectionOptions);
            return createProjection(vnode, projectionOptions);
        },
        /**
     * Inserts a new DOM node which is generated from a [[VNode]].
     * This is a low-level method. Users wil typically use a [[Projector]] instead.
     * @param beforeNode - The node that the DOM Node is inserted before.
     * @param vnode - The root of the virtual DOM tree that was created using the [[h]] function.
     * NOTE: [[VNode]] objects may only be rendered once.
     * @param projectionOptions - Options to be used to create and update the projection, see [[createProjector]].
     * @returns The [[Projection]] that was created.
     */
        insertBefore: function (beforeNode, vnode, projectionOptions) {
            projectionOptions = applyDefaultProjectionOptions(projectionOptions);
            createDom(vnode, beforeNode.parentNode, beforeNode, projectionOptions);
            return createProjection(vnode, projectionOptions);
        },
        /**
     * Merges a new DOM node which is generated from a [[VNode]] with an existing DOM Node.
     * This means that the virtual DOM and the real DOM will have one overlapping element.
     * Therefore the selector for the root [[VNode]] will be ignored, but its properties and children will be applied to the Element provided.
     * This is a low-level method. Users wil typically use a [[Projector]] instead.
     * @param element - The existing element to adopt as the root of the new virtual DOM. Existing attributes and child nodes are preserved.
     * @param vnode - The root of the virtual DOM tree that was created using the [[h]] function. NOTE: [[VNode]] objects
     * may only be rendered once.
     * @param projectionOptions - Options to be used to create and update the projection, see [[createProjector]].
     * @returns The [[Projection]] that was created.
     */
        merge: function (element, vnode, projectionOptions) {
            projectionOptions = applyDefaultProjectionOptions(projectionOptions);
            vnode.domNode = element;
            initPropertiesAndChildren(element, vnode, projectionOptions);
            return createProjection(vnode, projectionOptions);
        },
        /**
     * Replaces an existing DOM node with a node generated from a [[VNode]].
     * This is a low-level method. Users will typically use a [[Projector]] instead.
     * @param element - The node for the [[VNode]] to replace.
     * @param vnode - The root of the virtual DOM tree that was created using the [[h]] function. NOTE: [[VNode]]
     * objects may only be rendered once.
     * @param projectionOptions - Options to be used to create and update the [[Projection]].
     * @returns The [[Projection]] that was created.
     */
        replace: function (element, vnode, projectionOptions) {
            projectionOptions = applyDefaultProjectionOptions(projectionOptions);
            createDom(vnode, element.parentNode, element, projectionOptions);
            element.parentNode.removeChild(element);
            return createProjection(vnode, projectionOptions);
        }
    };
    /**
 * Creates a [[CalculationCache]] object, useful for caching [[VNode]] trees.
 * In practice, caching of [[VNode]] trees is not needed, because achieving 60 frames per second is almost never a problem.
 * For more information, see [[CalculationCache]].
 *
 * @param <Result> The type of the value that is cached.
 */
    exports.createCache = function () {
        var cachedInputs;
        var cachedOutcome;
        return {
            invalidate: function () {
                cachedOutcome = undefined;
                cachedInputs = undefined;
            },
            result: function (inputs, calculation) {
                if (cachedInputs) {
                    for (var i = 0; i < inputs.length; i++) {
                        if (cachedInputs[i] !== inputs[i]) {
                            cachedOutcome = undefined;
                        }
                    }
                }
                if (!cachedOutcome) {
                    cachedOutcome = calculation();
                    cachedInputs = inputs;
                }
                return cachedOutcome;
            }
        };
    };
    /**
 * Creates a {@link Mapping} instance that keeps an array of result objects synchronized with an array of source objects.
 * See {@link http://maquettejs.org/docs/arrays.html|Working with arrays}.
 *
 * @param <Source>       The type of source items. A database-record for instance.
 * @param <Target>       The type of target items. A [[Component]] for instance.
 * @param getSourceKey   `function(source)` that must return a key to identify each source object. The result must either be a string or a number.
 * @param createResult   `function(source, index)` that must create a new result object from a given source. This function is identical
 *                       to the `callback` argument in `Array.map(callback)`.
 * @param updateResult   `function(source, target, index)` that updates a result to an updated source.
 */
    exports.createMapping = function (getSourceKey, createResult, updateResult) {
        var keys = [];
        var results = [];
        return {
            results: results,
            map: function (newSources) {
                var newKeys = newSources.map(getSourceKey);
                var oldTargets = results.slice();
                var oldIndex = 0;
                for (var i = 0; i < newSources.length; i++) {
                    var source = newSources[i];
                    var sourceKey = newKeys[i];
                    if (sourceKey === keys[oldIndex]) {
                        results[i] = oldTargets[oldIndex];
                        updateResult(source, oldTargets[oldIndex], i);
                        oldIndex++;
                    } else {
                        var found = false;
                        for (var j = 1; j < keys.length + 1; j++) {
                            var searchIndex = (oldIndex + j) % keys.length;
                            if (keys[searchIndex] === sourceKey) {
                                results[i] = oldTargets[searchIndex];
                                updateResult(newSources[i], oldTargets[searchIndex], i);
                                oldIndex = searchIndex + 1;
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            results[i] = createResult(source, i);
                        }
                    }
                }
                results.length = newSources.length;
                keys = newKeys;
            }
        };
    };
    /**
 * Creates a [[Projector]] instance using the provided projectionOptions.
 *
 * For more information, see [[Projector]].
 *
 * @param projectorOptions   Options that influence how the DOM is rendered and updated.
 */
    exports.createProjector = function (projectorOptions) {
        var projector;
        var projectionOptions = applyDefaultProjectionOptions(projectorOptions);
        projectionOptions.eventHandlerInterceptor = function (propertyName, eventHandler, domNode, properties) {
            return function () {
                // intercept function calls (event handlers) to do a render afterwards.
                projector.scheduleRender();
                return eventHandler.apply(properties.bind || this, arguments);
            };
        };
        var renderCompleted = true;
        var scheduled;
        var stopped = false;
        var projections = [];
        var renderFunctions = [];
        // matches the projections array
        var doRender = function () {
            scheduled = undefined;
            if (!renderCompleted) {
                return;    // The last render threw an error, it should be logged in the browser console.
            }
            renderCompleted = false;
            for (var i = 0; i < projections.length; i++) {
                var updatedVnode = renderFunctions[i]();
                projections[i].update(updatedVnode);
            }
            renderCompleted = true;
        };
        projector = {
            renderNow: doRender,
            scheduleRender: function () {
                if (!scheduled && !stopped) {
                    scheduled = requestAnimationFrame(doRender);
                }
            },
            stop: function () {
                if (scheduled) {
                    cancelAnimationFrame(scheduled);
                    scheduled = undefined;
                }
                stopped = true;
            },
            resume: function () {
                stopped = false;
                renderCompleted = true;
                projector.scheduleRender();
            },
            append: function (parentNode, renderMaquetteFunction) {
                projections.push(exports.dom.append(parentNode, renderMaquetteFunction(), projectionOptions));
                renderFunctions.push(renderMaquetteFunction);
            },
            insertBefore: function (beforeNode, renderMaquetteFunction) {
                projections.push(exports.dom.insertBefore(beforeNode, renderMaquetteFunction(), projectionOptions));
                renderFunctions.push(renderMaquetteFunction);
            },
            merge: function (domNode, renderMaquetteFunction) {
                projections.push(exports.dom.merge(domNode, renderMaquetteFunction(), projectionOptions));
                renderFunctions.push(renderMaquetteFunction);
            },
            replace: function (domNode, renderMaquetteFunction) {
                projections.push(exports.dom.replace(domNode, renderMaquetteFunction(), projectionOptions));
                renderFunctions.push(renderMaquetteFunction);
            },
            detach: function (renderMaquetteFunction) {
                for (var i = 0; i < renderFunctions.length; i++) {
                    if (renderFunctions[i] === renderMaquetteFunction) {
                        renderFunctions.splice(i, 1);
                        return projections.splice(i, 1)[0];
                    }
                }
                throw new Error('renderMaquetteFunction was not found');
            }
        };
        return projector;
    };
}));



/* ---- /1uPLoaDwKzP6MCGoVzw48r4pxawRBdmQc/js/utils/Animation.coffee ---- */


(function() {
  var Animation;

  Animation = (function() {
    function Animation() {}

    Animation.prototype.slideDown = function(elem, props) {
      var border_bottom_width, border_top_width, cstyle, h, margin_bottom, margin_top, next_elem, padding_bottom, padding_top, parent, top_after, top_before, transition;
      h = elem.offsetHeight;
      cstyle = window.getComputedStyle(elem);
      margin_top = cstyle.marginTop;
      margin_bottom = cstyle.marginBottom;
      padding_top = cstyle.paddingTop;
      padding_bottom = cstyle.paddingBottom;
      border_top_width = cstyle.borderTopWidth;
      border_bottom_width = cstyle.borderBottomWidth;
      transition = cstyle.transition;
      if (window.Animation.shouldScrollFix(elem, props)) {
        top_after = document.body.scrollHeight;
        next_elem = elem.nextSibling;
        parent = elem.parentNode;
        parent.removeChild(elem);
        top_before = document.body.scrollHeight;
        console.log("Scrollcorrection down", top_before - top_after);
        window.scrollTo(window.scrollX, window.scrollY - (top_before - top_after));
        if (next_elem) {
          parent.insertBefore(elem, next_elem);
        } else {
          parent.appendChild(elem);
        }
        return;
      }
      if (props.animate_scrollfix && elem.getBoundingClientRect().top > 1600) {
        return;
      }
      elem.style.boxSizing = "border-box";
      elem.style.overflow = "hidden";
      if (!props.animate_noscale) {
        elem.style.transform = "scale(0.6)";
      }
      elem.style.opacity = "0";
      elem.style.height = "0px";
      elem.style.marginTop = "0px";
      elem.style.marginBottom = "0px";
      elem.style.paddingTop = "0px";
      elem.style.paddingBottom = "0px";
      elem.style.borderTopWidth = "0px";
      elem.style.borderBottomWidth = "0px";
      elem.style.transition = "none";
      setTimeout((function() {
        elem.className += " animate-inout";
        elem.style.height = h + "px";
        elem.style.transform = "scale(1)";
        elem.style.opacity = "1";
        elem.style.marginTop = margin_top;
        elem.style.marginBottom = margin_bottom;
        elem.style.paddingTop = padding_top;
        elem.style.paddingBottom = padding_bottom;
        elem.style.borderTopWidth = border_top_width;
        return elem.style.borderBottomWidth = border_bottom_width;
      }), 1);
      return elem.addEventListener("transitionend", function() {
        elem.classList.remove("animate-inout");
        elem.style.transition = elem.style.transform = elem.style.opacity = elem.style.height = null;
        elem.style.boxSizing = elem.style.marginTop = elem.style.marginBottom = null;
        elem.style.paddingTop = elem.style.paddingBottom = elem.style.overflow = null;
        elem.style.borderTopWidth = elem.style.borderBottomWidth = elem.style.overflow = null;
        return elem.removeEventListener("transitionend", arguments.callee, false);
      });
    };

    Animation.prototype.shouldScrollFix = function(elem, props) {
      var pos;
      pos = elem.getBoundingClientRect();
      if (props.animate_scrollfix && window.scrollY > 300 && pos.top < 0 && !document.querySelector(".noscrollfix:hover")) {
        return true;
      } else {
        return false;
      }
    };

    Animation.prototype.slideDownAnime = function(elem, props) {
      var cstyle;
      cstyle = window.getComputedStyle(elem);
      elem.style.overflowY = "hidden";
      return anime({
        targets: elem,
        height: [0, elem.offsetHeight],
        easing: 'easeInOutExpo'
      });
    };

    Animation.prototype.slideUpAnime = function(elem, remove_func, props) {
      elem.style.overflowY = "hidden";
      return anime({
        targets: elem,
        height: [elem.offsetHeight, 0],
        complete: remove_func,
        easing: 'easeInOutExpo'
      });
    };

    Animation.prototype.slideUp = function(elem, remove_func, props) {
      var next_elem, parent, top_after, top_before;
      if (window.Animation.shouldScrollFix(elem, props) && elem.nextSibling) {
        top_after = document.body.scrollHeight;
        next_elem = elem.nextSibling;
        parent = elem.parentNode;
        parent.removeChild(elem);
        top_before = document.body.scrollHeight;
        console.log("Scrollcorrection down", top_before - top_after);
        window.scrollTo(window.scrollX, window.scrollY + (top_before - top_after));
        if (next_elem) {
          parent.insertBefore(elem, next_elem);
        } else {
          parent.appendChild(elem);
        }
        remove_func();
        return;
      }
      if (props.animate_scrollfix && elem.getBoundingClientRect().top > 1600) {
        remove_func();
        return;
      }
      elem.className += " animate-inout";
      elem.style.boxSizing = "border-box";
      elem.style.height = elem.offsetHeight + "px";
      elem.style.overflow = "hidden";
      elem.style.transform = "scale(1)";
      elem.style.opacity = "1";
      elem.style.pointerEvents = "none";
      setTimeout((function() {
        var cstyle;
        cstyle = window.getComputedStyle(elem);
        elem.style.height = "0px";
        elem.style.marginTop = (0 - parseInt(cstyle.borderTopWidth) - parseInt(cstyle.borderBottomWidth)) + "px";
        elem.style.marginBottom = "0px";
        elem.style.paddingTop = "0px";
        elem.style.paddingBottom = "0px";
        elem.style.transform = "scale(0.8)";
        return elem.style.opacity = "0";
      }), 1);
      return elem.addEventListener("transitionend", function(e) {
        if (e.propertyName === "opacity" || e.elapsedTime >= 0.6) {
          elem.removeEventListener("transitionend", arguments.callee, false);
          return setTimeout((function() {
            return remove_func();
          }), 2000);
        }
      });
    };

    Animation.prototype.showRight = function(elem, props) {
      elem.className += " animate";
      elem.style.opacity = 0;
      elem.style.transform = "TranslateX(-20px) Scale(1.01)";
      setTimeout((function() {
        elem.style.opacity = 1;
        return elem.style.transform = "TranslateX(0px) Scale(1)";
      }), 1);
      return elem.addEventListener("transitionend", function() {
        elem.classList.remove("animate");
        elem.style.transform = elem.style.opacity = null;
        return elem.removeEventListener("transitionend", arguments.callee, false);
      });
    };

    Animation.prototype.show = function(elem, props) {
      var delay, ref;
      delay = ((ref = arguments[arguments.length - 2]) != null ? ref.delay : void 0) * 1000 || 1;
      elem.className += " animate";
      elem.style.opacity = 0;
      setTimeout((function() {
        return elem.style.opacity = 1;
      }), delay);
      return elem.addEventListener("transitionend", function() {
        elem.classList.remove("animate");
        elem.style.opacity = null;
        return elem.removeEventListener("transitionend", arguments.callee, false);
      });
    };

    Animation.prototype.hide = function(elem, remove_func, props) {
      var delay, ref;
      delay = ((ref = arguments[arguments.length - 2]) != null ? ref.delay : void 0) * 1000 || 1;
      elem.className += " animate";
      setTimeout((function() {
        return elem.style.opacity = 0;
      }), delay);
      return elem.addEventListener("transitionend", function(e) {
        if (e.propertyName === "opacity") {
          remove_func();
          return elem.removeEventListener("transitionend", arguments.callee, false);
        }
      });
    };

    Animation.prototype.addVisibleClass = function(elem, props) {
      return setTimeout(function() {
        return elem.classList.add("visible");
      });
    };

    Animation.prototype.cloneAnimation = function(elem, animation) {
      return window.requestAnimationFrame((function(_this) {
        return function() {
          var clone, cloneleft, cstyle;
          if (elem.style.pointerEvents === "none") {
            elem = elem.nextSibling;
          }
          elem.style.position = "relative";
          elem.style.zIndex = "2";
          clone = elem.cloneNode(true);
          cstyle = window.getComputedStyle(elem);
          clone.classList.remove("loading");
          clone.style.position = "absolute";
          clone.style.zIndex = "1";
          clone.style.pointerEvents = "none";
          clone.style.animation = "none";
          elem.parentNode.insertBefore(clone, elem);
          cloneleft = clone.offsetLeft;
          clone.parentNode.removeChild(clone);
          clone.style.marginLeft = parseInt(cstyle.marginLeft) + elem.offsetLeft - cloneleft + "px";
          elem.parentNode.insertBefore(clone, elem);
          clone.style.animation = animation + " 0.8s ease-in-out forwards";
          return setTimeout((function() {
            return clone.remove();
          }), 1000);
        };
      })(this));
    };

    Animation.prototype.flashIn = function(elem) {
      if (elem.offsetWidth > 100) {
        return this.cloneAnimation(elem, "flash-in-big");
      } else {
        return this.cloneAnimation(elem, "flash-in");
      }
    };

    Animation.prototype.flashOut = function(elem) {
      if (elem.offsetWidth > 100) {
        return this.cloneAnimation(elem, "flash-out-big");
      } else {
        return this.cloneAnimation(elem, "flash-out");
      }
    };

    return Animation;

  })();

  window.Animation = new Animation();

}).call(this);


/* ---- /1uPLoaDwKzP6MCGoVzw48r4pxawRBdmQc/js/utils/Autosize.coffee ---- */


(function() {
  var Autosize,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Autosize = (function(superClass) {
    extend(Autosize, superClass);

    function Autosize(attrs1) {
      var base;
      this.attrs = attrs1 != null ? attrs1 : {};
      this.render = bind(this.render, this);
      this.handleKeydown = bind(this.handleKeydown, this);
      this.handleInput = bind(this.handleInput, this);
      this.autoHeight = bind(this.autoHeight, this);
      this.setValue = bind(this.setValue, this);
      this.storeNode = bind(this.storeNode, this);
      this.node = null;
      if ((base = this.attrs).classes == null) {
        base.classes = {};
      }
      this.attrs.classes.loading = false;
      this.attrs.oninput = this.handleInput;
      this.attrs.onkeydown = this.handleKeydown;
      this.attrs.afterCreate = this.storeNode;
      this.attrs.rows = 1;
      this.attrs.disabled = false;
    }

    Autosize.property('loading', {
      get: function() {
        return this.attrs.classes.loading;
      },
      set: function(loading) {
        this.attrs.classes.loading = loading;
        this.node.value = this.attrs.value;
        this.autoHeight();
        return Page.projector.scheduleRender();
      }
    });

    Autosize.prototype.storeNode = function(node) {
      this.node = node;
      if (this.attrs.focused) {
        node.focus();
      }
      return setTimeout((function(_this) {
        return function() {
          return _this.autoHeight();
        };
      })(this));
    };

    Autosize.prototype.setValue = function(value) {
      if (value == null) {
        value = null;
      }
      this.attrs.value = value;
      if (this.node) {
        this.node.value = value;
        this.autoHeight();
      }
      return Page.projector.scheduleRender();
    };

    Autosize.prototype.autoHeight = function() {
      var h, height_before, scrollh;
      height_before = this.node.style.height;
      if (height_before) {
        this.node.style.height = "0px";
      }
      h = this.node.offsetHeight;
      scrollh = this.node.scrollHeight;
      this.node.style.height = height_before;
      if (scrollh > h) {
        return anime({
          targets: this.node,
          height: scrollh,
          scrollTop: 0
        });
      } else {
        return this.node.style.height = height_before;
      }
    };

    Autosize.prototype.handleInput = function(e) {
      if (e == null) {
        e = null;
      }
      this.attrs.value = e.target.value;
      return RateLimit(300, this.autoHeight);
    };

    Autosize.prototype.handleKeydown = function(e) {
      if (e == null) {
        e = null;
      }
      if (e.which === 13 && !e.shiftKey && this.attrs.onsubmit && this.attrs.value.trim()) {
        this.attrs.onsubmit();
        setTimeout(((function(_this) {
          return function() {
            return _this.autoHeight();
          };
        })(this)), 100);
        return false;
      }
    };

    Autosize.prototype.render = function(body) {
      var attrs;
      if (body == null) {
        body = null;
      }
      if (body && this.attrs.value === void 0) {
        this.setValue(body);
      }
      if (this.loading) {
        attrs = clone(this.attrs);
        attrs.disabled = true;
        return h("textarea.autosize", attrs);
      } else {
        return h("textarea.autosize", this.attrs);
      }
    };

    return Autosize;

  })(Class);

  window.Autosize = Autosize;

}).call(this);


/* ---- /1uPLoaDwKzP6MCGoVzw48r4pxawRBdmQc/js/utils/Editable.coffee ---- */


(function() {
  var Editable,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Editable = (function(superClass) {
    extend(Editable, superClass);

    function Editable(type, handleSave, handleDelete) {
      this.type = type;
      this.handleSave = handleSave;
      this.handleDelete = handleDelete;
      this.render = bind(this.render, this);
      this.handleSaveClick = bind(this.handleSaveClick, this);
      this.handleDeleteClick = bind(this.handleDeleteClick, this);
      this.handleCancelClick = bind(this.handleCancelClick, this);
      this.handleEditClick = bind(this.handleEditClick, this);
      this.storeNode = bind(this.storeNode, this);
      this.node = null;
      this.editing = false;
      this.render_function = null;
      this.empty_text = "Click here to edit this field";
    }

    Editable.prototype.storeNode = function(node) {
      return this.node = node;
    };

    Editable.prototype.handleEditClick = function(e) {
      this.editing = true;
      this.field_edit = new Autosize({
        focused: 1,
        style: "height: 0px"
      });
      return false;
    };

    Editable.prototype.handleCancelClick = function() {
      this.editing = false;
      return false;
    };

    Editable.prototype.handleDeleteClick = function() {
      Page.cmd("wrapperConfirm", ["Are you sure?", "Delete"], (function(_this) {
        return function() {
          _this.field_edit.loading = true;
          return _this.handleDelete(function(res) {
            return _this.field_edit.loading = false;
          });
        };
      })(this));
      return false;
    };

    Editable.prototype.handleSaveClick = function() {
      this.field_edit.loading = true;
      this.handleSave(this.field_edit.attrs.value, (function(_this) {
        return function(res) {
          _this.field_edit.loading = false;
          if (res) {
            return _this.editing = false;
          }
        };
      })(this));
      return false;
    };

    Editable.prototype.render = function(body) {
      if (this.editing) {
        return h("div.editable.editing", {
          exitAnimation: Animation.slideUp
        }, this.field_edit.render(body), h("div.editablebuttons", h("a.link.cancel", {
          href: "#Cancel",
          onclick: this.handleCancelClick,
          tabindex: "-1"
        }, "Cancel"), this.handleDelete ? h("a.button.button-submit.button-small.button-outline", {
          href: "#Delete",
          onclick: this.handleDeleteClick,
          tabindex: "-1"
        }, "Delete") : void 0, h("a.button.button-submit.button-small", {
          href: "#Save",
          onclick: this.handleSaveClick
        }, "Save")));
      } else {
        return h("div.editable", {
          enterAnimation: Animation.slideDown
        }, h("a.icon.icon-edit", {
          key: this.node,
          href: "#Edit",
          onclick: this.handleEditClick
        }), !body ? h(this.type, h("span.empty", {
          onclick: this.handleEditClick
        }, this.empty_text)) : this.render_function ? h(this.type, {
          innerHTML: this.render_function(body)
        }) : h(this.type, body));
      }
    };

    return Editable;

  })(Class);

  window.Editable = Editable;

}).call(this);


/* ---- /1uPLoaDwKzP6MCGoVzw48r4pxawRBdmQc/js/utils/ItemList.coffee ---- */


(function() {
  var ItemList;

  ItemList = (function() {
    function ItemList(item_class1, key1) {
      this.item_class = item_class1;
      this.key = key1;
      this.items = [];
      this.items_bykey = {};
    }

    ItemList.prototype.sync = function(rows, item_class, key) {
      var current_obj, i, item, len, results, row;
      this.items.splice(0, this.items.length);
      results = [];
      for (i = 0, len = rows.length; i < len; i++) {
        row = rows[i];
        current_obj = this.items_bykey[row[this.key]];
        if (current_obj) {
          current_obj.setRow(row);
          results.push(this.items.push(current_obj));
        } else {
          item = new this.item_class(row, this);
          this.items_bykey[row[this.key]] = item;
          results.push(this.items.push(item));
        }
      }
      return results;
    };

    ItemList.prototype.deleteItem = function(item) {
      var index;
      index = this.items.indexOf(item);
      if (index > -1) {
        this.items.splice(index, 1);
      } else {
        console.log("Can't delete item", item);
      }
      return delete this.items_bykey[item.row[this.key]];
    };

    return ItemList;

  })();

  window.ItemList = ItemList;

}).call(this);


/* ---- /1uPLoaDwKzP6MCGoVzw48r4pxawRBdmQc/js/utils/Menu.coffee ---- */


(function() {
  var Menu,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Menu = (function() {
    function Menu() {
      this.render = bind(this.render, this);
      this.renderItem = bind(this.renderItem, this);
      this.handleClick = bind(this.handleClick, this);
      this.storeNode = bind(this.storeNode, this);
      this.toggle = bind(this.toggle, this);
      this.hide = bind(this.hide, this);
      this.show = bind(this.show, this);
      this.visible = false;
      this.items = [];
      this.node = null;
    }

    Menu.prototype.show = function() {
      var ref;
      if ((ref = window.visible_menu) != null) {
        ref.hide();
      }
      this.visible = true;
      return window.visible_menu = this;
    };

    Menu.prototype.hide = function() {
      return this.visible = false;
    };

    Menu.prototype.toggle = function() {
      if (this.visible) {
        this.hide();
      } else {
        this.show();
      }
      return Page.projector.scheduleRender();
    };

    Menu.prototype.addItem = function(title, cb, selected) {
      if (selected == null) {
        selected = false;
      }
      return this.items.push([title, cb, selected]);
    };

    Menu.prototype.storeNode = function(node) {
      this.node = node;
      if (this.visible) {
        node.className = node.className.replace("visible", "");
        return setTimeout((function() {
          return node.className += " visible";
        }), 10);
      }
    };

    Menu.prototype.handleClick = function(e) {
      var cb, i, item, keep_menu, len, ref, selected, title;
      keep_menu = false;
      ref = this.items;
      for (i = 0, len = ref.length; i < len; i++) {
        item = ref[i];
        title = item[0], cb = item[1], selected = item[2];
        if (title === e.target.textContent) {
          keep_menu = cb(item);
        }
      }
      if (keep_menu !== true) {
        this.hide();
      }
      return false;
    };

    Menu.prototype.renderItem = function(item) {
      var cb, href, onclick, selected, title;
      title = item[0], cb = item[1], selected = item[2];
      if (typeof selected === "function") {
        selected = selected();
      }
      if (title === "---") {
        return h("div.menu-item-separator");
      } else {
        if (typeof cb === "string") {
          href = cb;
          onclick = true;
        } else {
          href = "#" + title;
          onclick = this.handleClick;
        }
        return h("a.menu-item", {
          href: href,
          onclick: onclick,
          key: title,
          classes: {
            "selected": selected
          }
        }, [title]);
      }
    };

    Menu.prototype.render = function(class_name) {
      if (class_name == null) {
        class_name = "";
      }
      if (this.visible || this.node) {
        return h("div.menu" + class_name, {
          classes: {
            "visible": this.visible
          },
          afterCreate: this.storeNode
        }, this.items.map(this.renderItem));
      }
    };

    return Menu;

  })();

  window.Menu = Menu;

  document.body.addEventListener("mouseup", function(e) {
    if (!window.visible_menu || !window.visible_menu.node) {
      return false;
    }
    if (e.target !== window.visible_menu.node.parentNode && e.target.parentNode !== window.visible_menu.node && e.target.parentNode !== window.visible_menu.node.parentNode && e.target.parentNode !== window.visible_menu.node && e.target.parentNode.parentNode !== window.visible_menu.node.parentNode) {
      window.visible_menu.hide();
      return Page.projector.scheduleRender();
    }
  });

}).call(this);


/* ---- /1uPLoaDwKzP6MCGoVzw48r4pxawRBdmQc/js/utils/Text.coffee ---- */


(function() {
  var Text,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Text = (function() {
    function Text() {
      this.renderLinks = bind(this.renderLinks, this);
      this.renderMarked = bind(this.renderMarked, this);
    }

    Text.prototype.toColor = function(text, saturation, lightness) {
      var hash, i, j, ref;
      if (saturation == null) {
        saturation = 30;
      }
      if (lightness == null) {
        lightness = 50;
      }
      hash = 0;
      for (i = j = 0, ref = text.length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
        hash += text.charCodeAt(i) * i;
        hash = hash % 1777;
      }
      return "hsl(" + (hash % 360) + ("," + saturation + "%," + lightness + "%)");
    };

    Text.prototype.renderMarked = function(text, options) {
      if (options == null) {
        options = {};
      }
      if (!text) {
        return "";
      }
      options["gfm"] = true;
      options["breaks"] = true;
      options["sanitize"] = true;
      options["renderer"] = marked_renderer;
      text = this.fixReply(text);
      text = marked(text, options);
      text = text.replace(/(@[^\x00-\x1f^\x21-\x2f^\x3a-\x40^\x5b-\x60^\x7b-\x7f]{1,16}):/g, '<b class="reply-name">$1</b>:');
      return this.fixHtmlLinks(text);
    };

    Text.prototype.renderLinks = function(text) {
      text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      text = text.replace(/(https?:\/\/[^\s)]+)/g, function(match) {
        return "<a href=\"" + (match.replace(/&amp;/g, '&')) + "\">" + match + "</a>";
      });
      text = text.replace(/\n/g, '<br>');
      text = text.replace(/(@[^\x00-\x1f^\x21-\x2f^\x3a-\x40^\x5b-\x60^\x7b-\x7f]{1,16}):/g, '<b class="reply-name">$1</b>:');
      text = this.fixHtmlLinks(text);
      return text;
    };

    Text.prototype.emailLinks = function(text) {
      return text.replace(/([a-zA-Z0-9]+)@zeroid.bit/g, "<a href='?to=$1' onclick='return Page.message_create.show(\"$1\")'>$1@zeroid.bit</a>");
    };

    Text.prototype.fixHtmlLinks = function(text) {
      text = text.replace(/href="http:\/\/(127.0.0.1|localhost):43110\/(Me.ZeroNetwork.bit|1MeFqFfFFGQfa1J3gJyYYUvb5Lksczq7nH)\/\?/gi, 'href="?');
      if (window.is_proxy) {
        text = text.replace(/href="http:\/\/(127.0.0.1|localhost):43110/gi, 'href="http://zero');
        text = text.replace(/http:\/\/zero\/([^\/]+\.bit)/, "http://$1");
      } else {
        text = text.replace(/href="http:\/\/(127.0.0.1|localhost):43110/g, 'href="');
      }
      text = text.replace(/href="\?/g, 'onclick="return Page.handleLinkClick(window.event)" href="?');
      return text;
    };

    Text.prototype.fixLink = function(link) {
      var back;
      if (window.is_proxy) {
        back = link.replace(/http:\/\/(127.0.0.1|localhost):43110/, 'http://zero');
        return back.replace(/http:\/\/zero\/([^\/]+\.bit)/, "http://$1");
      } else {
        return link.replace(/http:\/\/(127.0.0.1|localhost):43110/, '');
      }
    };

    Text.prototype.toUrl = function(text) {
      return text.replace(/[^A-Za-z0-9]/g, "+").replace(/[+]+/g, "+").replace(/[+]+$/, "");
    };

    Text.prototype.getSiteUrl = function(address) {
      if (window.is_proxy) {
        if (indexOf.call(address, ".") >= 0) {
          return "http://" + address + "/";
        } else {
          return "http://zero/" + address + "/";
        }
      } else {
        return "/" + address + "/";
      }
    };

    Text.prototype.fixReply = function(text) {
      return text.replace(/(>.*\n)([^\n>])/gm, "$1\n$2");
    };

    Text.prototype.toBitcoinAddress = function(text) {
      return text.replace(/[^A-Za-z0-9]/g, "");
    };

    Text.prototype.jsonEncode = function(obj) {
      return unescape(encodeURIComponent(JSON.stringify(obj)));
    };

    Text.prototype.jsonDecode = function(obj) {
      return JSON.parse(decodeURIComponent(escape(obj)));
    };

    Text.prototype.fileEncode = function(obj) {
      if (typeof obj === "string") {
        return btoa(unescape(encodeURIComponent(obj)));
      } else {
        return btoa(unescape(encodeURIComponent(JSON.stringify(obj, void 0, '\t'))));
      }
    };

    Text.prototype.utf8Encode = function(s) {
      return unescape(encodeURIComponent(s));
    };

    Text.prototype.utf8Decode = function(s) {
      return decodeURIComponent(escape(s));
    };

    Text.prototype.distance = function(s1, s2) {
      var char, extra_parts, j, key, len, match, next_find, next_find_i, val;
      s1 = s1.toLocaleLowerCase();
      s2 = s2.toLocaleLowerCase();
      next_find_i = 0;
      next_find = s2[0];
      match = true;
      extra_parts = {};
      for (j = 0, len = s1.length; j < len; j++) {
        char = s1[j];
        if (char !== next_find) {
          if (extra_parts[next_find_i]) {
            extra_parts[next_find_i] += char;
          } else {
            extra_parts[next_find_i] = char;
          }
        } else {
          next_find_i++;
          next_find = s2[next_find_i];
        }
      }
      if (extra_parts[next_find_i]) {
        extra_parts[next_find_i] = "";
      }
      extra_parts = (function() {
        var results;
        results = [];
        for (key in extra_parts) {
          val = extra_parts[key];
          results.push(val);
        }
        return results;
      })();
      if (next_find_i >= s2.length) {
        return extra_parts.length + extra_parts.join("").length;
      } else {
        return false;
      }
    };

    Text.prototype.queryParse = function(query) {
      var j, key, len, params, part, parts, ref, val;
      params = {};
      parts = query.split('&');
      for (j = 0, len = parts.length; j < len; j++) {
        part = parts[j];
        ref = part.split("="), key = ref[0], val = ref[1];
        if (val) {
          params[decodeURIComponent(key)] = decodeURIComponent(val);
        } else {
          params["url"] = decodeURIComponent(key);
          params["urls"] = params["url"].split("/");
        }
      }
      return params;
    };

    Text.prototype.queryEncode = function(params) {
      var back, key, val;
      back = [];
      if (params.url) {
        back.push(params.url);
      }
      for (key in params) {
        val = params[key];
        if (!val || key === "url") {
          continue;
        }
        back.push((encodeURIComponent(key)) + "=" + (encodeURIComponent(val)));
      }
      return back.join("&");
    };

    Text.prototype.highlight = function(text, search) {
      var back, i, j, len, part, parts;
      parts = text.split(RegExp(search, "i"));
      back = [];
      for (i = j = 0, len = parts.length; j < len; i = ++j) {
        part = parts[i];
        back.push(part);
        if (i < parts.length - 1) {
          back.push(h("span.highlight", {
            key: i
          }, search));
        }
      }
      return back;
    };

    Text.prototype.sqlIn = function(values) {
      var value;
      return "(" + ((function() {
        var j, len, results;
        results = [];
        for (j = 0, len = values.length; j < len; j++) {
          value = values[j];
          results.push("'" + value + "'");
        }
        return results;
      })()).join(',') + ")";
    };

    Text.prototype.formatSize = function(size) {
      var size_mb;
      if (!size) {
        return "0 KB";
      }
      size_mb = size / 1024 / 1024;
      if (size_mb >= 1000) {
        return (size_mb / 1024).toFixed(1) + " GB";
      } else if (size_mb >= 100) {
        return size_mb.toFixed(0) + " MB";
      } else if (size / 1024 >= 1000) {
        return size_mb.toFixed(2) + " MB";
      } else {
        return (size / 1024).toFixed(2) + " KB";
      }
    };

    return Text;

  })();

  window.is_proxy = document.location.host === "zero" || window.location.pathname === "/";

  window.Text = new Text();

}).call(this);


/* ---- /1uPLoaDwKzP6MCGoVzw48r4pxawRBdmQc/js/utils/Time.coffee ---- */


(function() {
  var Time;

  Time = (function() {
    function Time() {}

    Time.prototype.since = function(timestamp) {
      var back, now, secs;
      now = +(new Date) / 1000;
      if (timestamp > 1000000000000) {
        timestamp = timestamp / 1000;
      }
      secs = now - timestamp;
      if (secs < 60) {
        back = "Just now";
      } else if (secs < 60 * 60) {
        back = (Math.round(secs / 60)) + " minutes ago";
      } else if (secs < 60 * 60 * 24) {
        back = (Math.round(secs / 60 / 60)) + " hours ago";
      } else if (secs < 60 * 60 * 24 * 3) {
        back = (Math.round(secs / 60 / 60 / 24)) + " days ago";
      } else {
        back = "on " + this.date(timestamp);
      }
      back = back.replace(/^1 ([a-z]+)s/, "1 $1");
      return back;
    };

    Time.prototype.date = function(timestamp, format) {
      var display, parts;
      if (format == null) {
        format = "short";
      }
      if (timestamp > 1000000000000) {
        timestamp = timestamp / 1000;
      }
      parts = (new Date(timestamp * 1000)).toString().split(" ");
      if (format === "short") {
        display = parts.slice(1, 4);
      } else {
        display = parts.slice(1, 5);
      }
      return display.join(" ").replace(/( [0-9]{4})/, ",$1");
    };

    Time.prototype.timestamp = function(date) {
      if (date == null) {
        date = "";
      }
      if (date === "now" || date === "") {
        return parseInt(+(new Date) / 1000);
      } else {
        return parseInt(Date.parse(date) / 1000);
      }
    };

    return Time;

  })();

  window.Time = new Time;

}).call(this);


/* ---- /1uPLoaDwKzP6MCGoVzw48r4pxawRBdmQc/js/utils/ZeroFrame.coffee ---- */


(function() {
  var ZeroFrame,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ZeroFrame = (function(superClass) {
    extend(ZeroFrame, superClass);

    function ZeroFrame(url) {
      this.onCloseWebsocket = bind(this.onCloseWebsocket, this);
      this.onOpenWebsocket = bind(this.onOpenWebsocket, this);
      this.onRequest = bind(this.onRequest, this);
      this.onMessage = bind(this.onMessage, this);
      this.queue = [];
      this.url = url;
      this.waiting_cb = {};
      this.history_state = {};
      this.wrapper_nonce = document.location.href.replace(/.*wrapper_nonce=([A-Za-z0-9]+).*/, "$1");
      this.connect();
      this.next_message_id = 1;
      this.init();
      this.ready = false;
    }

    ZeroFrame.prototype.init = function() {
      return this;
    };

    ZeroFrame.prototype.connect = function() {
      this.target = window.parent;
      window.addEventListener("message", this.onMessage, false);
      this.send({
        "cmd": "innerReady"
      });
      window.addEventListener("beforeunload", (function(_this) {
        return function(e) {
          _this.log("Save scrollTop", window.pageYOffset);
          _this.history_state["scrollTop"] = window.pageYOffset;
          return _this.cmd("wrapperReplaceState", [_this.history_state, null]);
        };
      })(this));
      return this.cmd("wrapperGetState", [], (function(_this) {
        return function(state) {
          return _this.handleState(state);
        };
      })(this));
    };

    ZeroFrame.prototype.handleState = function(state) {
      if (state != null) {
        this.history_state = state;
      }
      this.log("Restore scrollTop", state, window.pageYOffset);
      if (window.pageYOffset === 0 && state) {
        return window.scroll(window.pageXOffset, state.scrollTop);
      }
    };

    ZeroFrame.prototype.onMessage = function(e) {
      var cmd, message;
      message = e.data;
      cmd = message.cmd;
      if (cmd === "response") {
        if (this.waiting_cb[message.to] != null) {
          return this.waiting_cb[message.to](message.result);
        } else {
          return this.log("Websocket callback not found:", message);
        }
      } else if (cmd === "wrapperReady") {
        return this.send({
          "cmd": "innerReady"
        });
      } else if (cmd === "ping") {
        return this.response(message.id, "pong");
      } else if (cmd === "wrapperOpenedWebsocket") {
        this.onOpenWebsocket();
        this.ready = true;
        return this.processQueue();
      } else if (cmd === "wrapperClosedWebsocket") {
        return this.onCloseWebsocket();
      } else if (cmd === "wrapperPopState") {
        this.handleState(message.params.state);
        return this.onRequest(cmd, message.params);
      } else {
        return this.onRequest(cmd, message.params);
      }
    };

    ZeroFrame.prototype.processQueue = function() {
      var cb, cmd, i, len, params, ref, ref1;
      ref = this.queue;
      for (i = 0, len = ref.length; i < len; i++) {
        ref1 = ref[i], cmd = ref1[0], params = ref1[1], cb = ref1[2];
        this.cmd(cmd, params, cb);
      }
      return this.queue = [];
    };

    ZeroFrame.prototype.onRequest = function(cmd, message) {
      return this.log("Unknown request", message);
    };

    ZeroFrame.prototype.response = function(to, result) {
      return this.send({
        "cmd": "response",
        "to": to,
        "result": result
      });
    };

    ZeroFrame.prototype.cmd = function(cmd, params, cb) {
      if (params == null) {
        params = {};
      }
      if (cb == null) {
        cb = null;
      }
      if (this.ready) {
        return this.send({
          "cmd": cmd,
          "params": params
        }, cb);
      } else {
        return this.queue.push([cmd, params, cb]);
      }
    };

    ZeroFrame.prototype.send = function(message, cb) {
      if (cb == null) {
        cb = null;
      }
      message.wrapper_nonce = this.wrapper_nonce;
      message.id = this.next_message_id;
      this.next_message_id += 1;
      this.target.postMessage(message, "*");
      if (cb) {
        return this.waiting_cb[message.id] = cb;
      }
    };

    ZeroFrame.prototype.onOpenWebsocket = function() {
      return this.log("Websocket open");
    };

    ZeroFrame.prototype.onCloseWebsocket = function() {
      return this.log("Websocket close");
    };

    return ZeroFrame;

  })(Class);

  window.ZeroFrame = ZeroFrame;

}).call(this);


/* ---- /1uPLoaDwKzP6MCGoVzw48r4pxawRBdmQc/js/.Uploader-Blobs.coffee ---- */


(function() {
  var Uploader,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Uploader = (function(superClass) {
    extend(Uploader, superClass);

    function Uploader() {
      this.render = bind(this.render, this);
      this.renderSpeed = bind(this.renderSpeed, this);
      this.renderBlob = bind(this.renderBlob, this);
      this.animationBlobEnter = bind(this.animationBlobEnter, this);
      this.blobs = [];
      this.percent = 0;
      "setInterval ( =>\n	if @percent < 100 and Math.random() > 0.2\n		@setPercent(@percent + Math.random())\n), 100";
    }

    Uploader.prototype.setPercent = function(percent) {
      var i;
      this.blobs = (function() {
        var j, ref, results;
        results = [];
        for (i = j = 1, ref = percent; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
          results.push({
            id: i,
            percent: i
          });
        }
        return results;
      })();
      this.percent = percent;
      return Page.projector.scheduleRender();
    };

    Uploader.prototype.getRandomOutpos = function() {
      var left, rand, top;
      rand = Math.random();
      if (rand < 0.25) {
        left = 105;
        top = Math.random() * 100;
      } else if (rand < 0.5) {
        left = 100 * Math.random();
        top = 105;
      } else if (rand < 0.75) {
        left = -5;
        top = 100 * Math.random();
      } else {
        left = 100 * Math.random();
        top = -5;
      }
      return [left, top];
    };

    Uploader.prototype.animationBlobEnter = function(elem, projector, vnode, properties) {
      var ref, start_left, start_top;
      ref = this.getRandomOutpos(), start_top = ref[0], start_left = ref[1];
      return anime({
        targets: elem,
        top: [start_top, 50 + (Math.random() * 10 - 5) + "%"],
        left: [start_left, 50 + (Math.random() * 10 - 5) + "%"],
        elasticity: 200,
        duration: 2000,
        delay: Math.random() * 100
      });
    };

    Uploader.prototype.renderBlob = function(blob) {
      return h("div.blob", {
        id: "blob-" + blob.id,
        key: blob.id,
        blob: blob,
        afterCreate: this.animationBlobEnter
      });
    };

    Uploader.prototype.renderSpeed = function() {
      return "<svg height=\"500\" width=\"500\">\n <linearGradient id=\"linearColors\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">\n     <stop offset=\"15%\" stop-color=\"#FF4136\"></stop>\n     <stop offset=\"40%\" stop-color=\"#1BA1E2\"></stop>\n     <stop offset=\"90%\" stop-color=\"#F012BE\"></stop>\n  </linearGradient>\n  <circle cx=\"300\" cy=\"300\" r=\"150\" stroke=\"black\" stroke-width=\"3\" class=\"speed-bg\"></circle>\n  <circle cx=\"300\" cy=\"300\" r=\"155\" stroke=\"black\" stroke-width=\"3\" class=\"speed-bg speed-bg-big\" stroke=\"url(#linearColors)\"></circle>\n  <circle cx=\"300\" cy=\"300\" r=\"150\" stroke-width=\"3\" class=\"speed-current\" stroke=\"url(#linearColors)\"></circle>\n  <text x=\"190\" y=\"373\" class=\"speed-text\">0</text>\n  <text x=\"173\" y=\"282\" class=\"speed-text\">20</text>\n  <text x=\"217\" y=\"210\" class=\"speed-text\">40</text>\n  <text x=\"292\" y=\"178\" class=\"speed-text\">60</text>\n  <text x=\"371\" y=\"210\" class=\"speed-text\">80</text>\n  <text x=\"404\" y=\"282\" class=\"speed-text\">100</text>\n  <text x=\"390\" y=\"373\" class=\"speed-text\">120</text>\n</svg>";
    };

    Uploader.prototype.render = function() {
      return h("div.Uploader", [
        h("div.speed", {
          innerHTML: this.renderSpeed()
        }), h("div.percent", Math.round(this.percent) + "%"), h("div.blobs", [
          h("div.blob.blob-center", {
            style: "transform: scale(" + (0.1 + this.percent / 90) + ")"
          }), this.blobs.map(this.renderBlob)
        ])
      ]);
    };

    return Uploader;

  })(Class);

  window.Uploader = Uploader;

}).call(this);


/* ---- /1uPLoaDwKzP6MCGoVzw48r4pxawRBdmQc/js/Bg.coffee ---- */


(function() {
  var Bg,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bg = (function(superClass) {
    extend(Bg, superClass);

    function Bg(bg_elem) {
      this.bg_elem = bg_elem;
      this.repositionItem = bind(this.repositionItem, this);
      this.handleResize = bind(this.handleResize, this);
      this.item_types = ["video", "gamepad", "ipod", "image", "file"];
      window.onresize = this.handleResize;
      this.handleResize();
      this.randomizePosition();
      setTimeout(((function(_this) {
        return function() {
          return _this.randomizeAnimation();
        };
      })(this)), 10);
      this.log("inited");
    }

    Bg.prototype.handleResize = function() {
      this.width = window.innerWidth;
      return this.height = window.innerHeight;
    };

    Bg.prototype.randomizePosition = function() {
      var i, item, left, len, ref, ref1, results, rotate, scale, top;
      ref = this.bg_elem.querySelectorAll(".bgitem");
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        item = ref[i];
        top = Math.random() * this.height * 0.8;
        left = Math.random() * this.width * 0.8;
        if (Math.random() > 0.8) {
          ref1 = this.getRandomOutpos(), left = ref1[0], top = ref1[1];
        }
        rotate = 45 - (Math.random() * 90);
        scale = 0.5 + Math.min(0.5, Math.random());
        results.push(item.style.transform = "TranslateX(" + left + "px) TranslateY(" + top + "px) rotateZ(" + rotate + "deg) scale(" + scale + ")");
      }
      return results;
    };

    Bg.prototype.getRandomOutpos = function() {
      var left, rand, top;
      rand = Math.random();
      if (rand < 0.25) {
        left = this.width + 100;
        top = this.height * Math.random();
      } else if (rand < 0.5) {
        left = this.width * Math.random();
        top = this.height + 100;
      } else if (rand < 0.75) {
        left = -100;
        top = this.height * Math.random();
      } else {
        left = this.width * Math.random();
        top = -100;
      }
      return [left, top];
    };

    Bg.prototype.randomizeAnimation = function() {
      var bg, i, interval, item, left, len, ref, ref1, results, rotate, scale, top;
      return false;
      ref = this.bg_elem.querySelectorAll(".bgitem");
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        item = ref[i];
        item.style.visibility = "visible";
        interval = 30 + (Math.random() * 60);
        item.style.transition = "all " + interval + "s linear";
        ref1 = this.getRandomOutpos(), left = ref1[0], top = ref1[1];
        rotate = 360 - (Math.random() * 720);
        scale = 0.5 + Math.min(0.5, Math.random());
        item.style.transform = "TranslateX(" + left + "px) TranslateY(" + top + "px) rotateZ(" + rotate + "deg) scale(" + scale + ")";
        bg = this;
        results.push(item.addEventListener("transitionend", function(e) {
          if (e.propertyName === "transform") {
            return bg.repositionItem(this);
          }
        }));
      }
      return results;
    };

    Bg.prototype.repositionItem = function(item) {
      var left, ref, rotate, scale, top;
      ref = this.getRandomOutpos(), left = ref[0], top = ref[1];
      rotate = 360 - (Math.random() * 720);
      scale = 0.5 + Math.min(0.5, Math.random());
      return item.style.transform = "TranslateX(" + left + "px) TranslateY(" + top + "px) rotateZ(" + rotate + "deg) scale(" + scale + ")";
    };

    return Bg;

  })(Class);

  window.Bg = Bg;

}).call(this);


/* ---- /1uPLoaDwKzP6MCGoVzw48r4pxawRBdmQc/js/File.coffee ---- */


(function() {
  var File,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  File = (function() {
    function File(row, item_list) {
      this.item_list = item_list;
      this.handleMenuDeleteClick = bind(this.handleMenuDeleteClick, this);
      this.handleMenuClick = bind(this.handleMenuClick, this);
      this.handleOpenClick = bind(this.handleOpenClick, this);
      this.handleSeedClick = bind(this.handleSeedClick, this);
      this.handleTitleSave = bind(this.handleTitleSave, this);
      this.handleDelete = bind(this.handleDelete, this);
      this.deleteFromDataJson = bind(this.deleteFromDataJson, this);
      this.deleteFromContentJson = bind(this.deleteFromContentJson, this);
      this.deleteFile = bind(this.deleteFile, this);
      this.editable_title = null;
      this.status = "unknown";
      this.menu = null;
      this.setRow(row);
    }

    File.prototype.getRatioColor = function(ratio) {
      var ratio_h, ratio_l, ratio_s;
      ratio_h = Math.min(ratio * 50, 145);
      ratio_s = Math.min(ratio * 100, 60);
      ratio_l = 80 - Math.min(ratio * 5, 30);
      return "hsl(" + ratio_h + ", " + ratio_s + "%, " + ratio_l + "%)";
    };

    File.prototype.setRow = function(row1) {
      var ref;
      this.row = row1;
      this.owned = Page.site_info.auth_address === this.row.directory;
      if (this.owned && !this.editable_title) {
        this.editable_title = new Editable("div.body", this.handleTitleSave, this.handleDelete);
        this.editable_title.empty_text = " ";
      }
      if (this.row.stats.bytes_downloaded >= this.row.size) {
        return this.status = "seeding";
      } else if (this.row.stats.is_downloading || this.row.stats.is_pinned) {
        return this.status = "downloading";
      } else if ((0 < (ref = this.row.stats.bytes_downloaded) && ref < this.row.size)) {
        return this.status = "partial";
      } else {
        return this.status = "inactive";
      }
    };

    File.prototype.deleteFile = function(cb) {
      return Page.cmd("optionalFileDelete", this.row.inner_path, (function(_this) {
        return function() {
          return Page.cmd("optionalFileDelete", _this.row.inner_path + ".piecemap.msgpack", function() {
            return typeof cb === "function" ? cb(true) : void 0;
          });
        };
      })(this));
    };

    File.prototype.deleteFromContentJson = function(cb) {
      return Page.cmd("fileGet", this.row.content_inner_path, (function(_this) {
        return function(res) {
          var data;
          data = JSON.parse(res);
          delete data["files_optional"][_this.row.file_name];
          delete data["files_optional"][_this.row.file_name + ".piecemap.msgpack"];
          return Page.cmd("fileWrite", [_this.row.content_inner_path, Text.fileEncode(data)], function(res) {
            return typeof cb === "function" ? cb(res) : void 0;
          });
        };
      })(this));
    };

    File.prototype.deleteFromDataJson = function(cb) {
      return Page.cmd("fileGet", this.row.data_inner_path, (function(_this) {
        return function(res) {
          var data;
          data = JSON.parse(res);
          delete data["file"][_this.row.file_name];
          delete data["file"][_this.row.file_name + ".piecemap.msgpack"];
          return Page.cmd("fileWrite", [_this.row.data_inner_path, Text.fileEncode(data)], function(res) {
            return typeof cb === "function" ? cb(res) : void 0;
          });
        };
      })(this));
    };

    File.prototype.handleDelete = function(cb) {
      return this.deleteFile((function(_this) {
        return function(res) {
          return _this.deleteFromContentJson(function(res) {
            if (!res === "ok") {
              return cb(false);
            }
            return _this.deleteFromDataJson(function(res) {
              if (res === "ok") {
                Page.cmd("sitePublish", {
                  "inner_path": _this.row.content_inner_path
                });
                Page.list.update();
                return cb(true);
              }
            });
          });
        };
      })(this));
    };

    File.prototype.handleTitleSave = function(title, cb) {
      return Page.cmd("fileGet", this.row.data_inner_path, (function(_this) {
        return function(res) {
          var data;
          data = JSON.parse(res);
          data["file"][_this.row.file_name]["title"] = title;
          _this.row.title = title;
          return Page.cmd("fileWrite", [_this.row.data_inner_path, Text.fileEncode(data)], function(res) {
            if (res === "ok") {
              cb(true);
              return Page.cmd("sitePublish", {
                "inner_path": _this.row.content_inner_path
              });
            } else {
              return cb(false);
            }
          });
        };
      })(this));
    };

    File.prototype.handleSeedClick = function() {
      this.status = "downloading";
      Page.cmd("fileNeed", this.row.inner_path + "|all", (function(_this) {
        return function(res) {
          return console.log(res);
        };
      })(this));
      Page.cmd("optionalFilePin", this.row.inner_path);
      return false;
    };

    File.prototype.handleOpenClick = function() {
      Page.cmd("serverShowdirectory", ["site", this.row.inner_path]);
      return false;
    };

    File.prototype.handleMenuClick = function() {
      if (!this.menu) {
        this.menu = new Menu();
      }
      this.menu.items = [];
      this.menu.items.push(["Delete file", this.handleMenuDeleteClick]);
      this.menu.toggle();
      return false;
    };

    File.prototype.handleMenuDeleteClick = function() {
      this.deleteFile();
      return false;
    };

    File.prototype.render = function() {
      var ext, low_seeds, peer_num, ratio, ratio_color, ref, ref1, ref2, ref3, style, type;
      if (this.row.stats.bytes_downloaded) {
        ratio = this.row.stats.uploaded / this.row.stats.bytes_downloaded;
      } else {
        ratio = 0;
      }
      ratio_color = this.getRatioColor(ratio);
      if ((ref = this.status) === "downloading" || ref === "partial") {
        style = "box-shadow: inset " + (this.row.stats.downloaded_percent * 1.5) + "px 0px 0px #70fcd8";
      } else {
        style = "";
      }
      ext = this.row.file_name.toLowerCase().replace(/.*\./, "");
      if (ext === "mp4" || ext === "webm" || ext === "ogm") {
        type = "video";
      } else {
        type = "other";
      }
      peer_num = Math.max((this.row.stats.peer_seed + this.row.stats.peer_leech) || 0, this.row.stats.peer || 0);
      low_seeds = this.row.stats.peer_seed <= peer_num * 0.1 && this.row.stats.peer_leech >= peer_num * 0.2;
      return h("div.file." + type, {
        key: this.row.id
      }, h("div.stats", [
        h("div.stats-col.peers", {
          title: "Seeder: " + this.row.stats.peer_seed + ", Leecher: " + this.row.stats.peer_leech
        }, [
          h("span.value", peer_num), h("span.icon.icon-profile", {
            style: low_seeds ? "background: #f57676" : "background: #666"
          })
        ]), h("div.stats-col.ratio", {
          title: "Hash id: " + this.row.stats.hash_id
        }, h("span.value", {
          "style": "background-color: " + ratio_color
        }, ratio >= 10 ? ratio.toFixed(0) : ratio.toFixed(1))), h("div.stats-col.uploaded", "\u2BA5 " + (Text.formatSize(this.row.stats.uploaded)))
      ]), type === "video" ? h("a.open", {
        href: this.row.inner_path
      }, "\u203A") : h("a.open", {
        href: this.row.inner_path
      }, h("span.icon.icon-open-new")), h("div.left-info", [
        ((ref1 = this.editable_title) != null ? ref1.editing : void 0) ? this.editable_title.render(this.row.title) : h("a.title.link", {
          href: this.row.inner_path,
          enterAnimation: Animation.slideDown
        }, ((ref2 = this.editable_title) != null ? ref2.render(this.row.title) : void 0) || this.row.title), h("div.details", [
          ((ref3 = this.status) === "inactive" || ref3 === "partial") && !this.row.stats.is_pinned ? h("a.add", {
            href: "#Add",
            title: "Download and seed",
            onclick: this.handleSeedClick
          }, "+ seed") : void 0, h("span.size", {
            classes: {
              downloading: this.status === "downloading",
              partial: this.status === "partial",
              seeding: this.status === "seeding"
            },
            style: style
          }, [this.status === "seeding" ? h("span", "seeding: ") : void 0, this.status === "downloading" || this.status === "partial" ? [h("span.downloaded", Text.formatSize(this.row.stats.bytes_downloaded)), " of "] : void 0, Text.formatSize(this.row.size)]), this.status !== "inactive" ? [
            h("a.menu-button", {
              href: "#Menu",
              onclick: Page.returnFalse,
              onmousedown: this.handleMenuClick
            }, "\u22EE"), this.menu ? this.menu.render(".menu-right") : void 0
          ] : void 0, h("span.detail.added", {
            title: Time.date(this.row.date_added, "long")
          }, Time.since(this.row.date_added)), h("span.detail.uploader", [
            "by ", h("span.username", {
              title: this.row.cert_user_id + ": " + this.row.directory
            }, this.row.cert_user_id.split("@")[0])
          ]), this.status === "seeding" ? h("a.detail", h("a.link.filename", {
            href: "#Open+directory",
            title: "Open directory",
            onclick: this.handleOpenClick
          }, this.row.file_name)) : h("a.detail.filename", {
            title: this.row.file_name
          }, this.row.file_name)
        ])
      ]));
    };

    return File;

  })();

  window.File = File;

}).call(this);



/* ---- /1uPLoaDwKzP6MCGoVzw48r4pxawRBdmQc/js/List.coffee ---- */


(function() {
  var List,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  List = (function(superClass) {
    extend(List, superClass);

    function List() {
      this.render = bind(this.render, this);
      this.handleSearchBlur = bind(this.handleSearchBlur, this);
      this.handleSearchKeyup = bind(this.handleSearchKeyup, this);
      this.handleSearchInput = bind(this.handleSearchInput, this);
      this.handleSearchClick = bind(this.handleSearchClick, this);
      this.handleMoreClick = bind(this.handleMoreClick, this);
      this.update = bind(this.update, this);
      this.needFile = bind(this.needFile, this);
      this.item_list = new ItemList(File, "id");
      this.files = this.item_list.items;
      this.need_update = true;
      this.loaded = false;
      this.type = "Popular";
      this.limit = 10;
    }

    List.prototype.needFile = function() {
      this.log(args);
      return false;
    };

    List.prototype.update = function() {
      var order, params, wheres;
      this.log("update");
      this.loaded = false;
      if (this.type === "Popular") {
        order = "peer";
      } else {
        order = "date_added";
      }
      if (this.search) {
        wheres = "WHERE file.title LIKE :search OR file.file_name LIKE :search";
        params = {
          search: "%" + this.search + "%"
        };
      } else {
        wheres = "";
        params = "";
      }
      return Page.cmd("dbQuery", ["SELECT * FROM file LEFT JOIN json USING (json_id) " + wheres + " ORDER BY date_added DESC", params], (function(_this) {
        return function(files_res) {
          var orderby;
          orderby = "time_downloaded DESC, peer DESC";
          if (_this.type === "My") {
            orderby = "is_downloaded DESC";
          } else if (_this.type === "Latest") {
            orderby = "is_downloaded DESC, time_added DESC";
          } else if (_this.type === "Seeding") {
            orderby = "is_downloaded DESC, is_pinned DESC";
          }
          return Page.cmd("optionalFileList", {
            filter: "bigfile",
            limit: 2000,
            orderby: orderby
          }, function(stat_res) {
            var base, base1, base2, file, i, j, len, len1, stat, stats;
            stats = {};
            for (i = 0, len = stat_res.length; i < len; i++) {
              stat = stat_res[i];
              stats[stat.inner_path] = stat;
            }
            for (j = 0, len1 = files_res.length; j < len1; j++) {
              file = files_res[j];
              file.id = file.directory + "_" + file.date_added;
              file.inner_path = "data/users/" + file.directory + "/" + file.file_name;
              file.data_inner_path = "data/users/" + file.directory + "/data.json";
              file.content_inner_path = "data/users/" + file.directory + "/content.json";
              file.stats = stats[file.inner_path];
              if (file.stats == null) {
                file.stats = {};
              }
              if ((base = file.stats).peer == null) {
                base.peer = 0;
              }
              if ((base1 = file.stats).peer_seed == null) {
                base1.peer_seed = 0;
              }
              if ((base2 = file.stats).peer_leech == null) {
                base2.peer_leech = 0;
              }
            }
            if (order === "peer") {
              files_res.sort(function(a, b) {
                return Math.min(5, b.stats["peer_seed"]) + b.stats["peer"] - a.stats["peer"] - Math.min(5, a.stats["peer_seed"]);
              });
            }
            if (_this.type === "Seeding") {
              files_res = (function() {
                var k, len2, results;
                results = [];
                for (k = 0, len2 = files_res.length; k < len2; k++) {
                  file = files_res[k];
                  if (file.stats.bytes_downloaded > 0 || file.stats.is_pinned === 1) {
                    results.push(file);
                  }
                }
                return results;
              })();
            }
            if (_this.type === "My") {
              files_res = (function() {
                var k, len2, results;
                results = [];
                for (k = 0, len2 = files_res.length; k < len2; k++) {
                  file = files_res[k];
                  if (file.directory === Page.site_info.auth_address) {
                    results.push(file);
                  }
                }
                return results;
              })();
            }
            _this.item_list.sync(files_res);
            _this.loaded = true;
            return Page.projector.scheduleRender();
          });
        };
      })(this));
    };

    List.prototype.handleMoreClick = function() {
      this.limit += 20;
      return false;
    };

    List.prototype.handleSearchClick = function() {
      this.is_search_active = true;
      document.querySelector(".input-search").focus();
      return false;
    };

    List.prototype.handleSearchInput = function(e) {
      this.search = e.currentTarget.value;
      this.update();
      return false;
    };

    List.prototype.handleSearchKeyup = function(e) {
      if (e.keyCode === 27) {
        if (!this.search) {
          this.is_search_active = false;
        }
        e.target.value = "";
        this.search = "";
        this.update();
      }
      return false;
    };

    List.prototype.handleSearchBlur = function(e) {
      if (!this.search) {
        return this.is_search_active = false;
      }
    };

    List.prototype.render = function() {
      if (this.need_update) {
        this.update();
        this.need_update = false;
      }
      return h("div.List", {
        ondragenter: document.body.ondragover,
        ondragover: document.body.ondragover,
        ondrop: Page.selector.handleFileDrop,
        classes: {
          hidden: Page.state.page !== "list"
        }
      }, [
        h("div.list-types", [
          h("a.list-type.search", {
            href: "#Search",
            onclick: this.handleSearchClick,
            classes: {
              active: this.is_search_active
            }
          }, h("div.icon.icon-magnifier"), h("input.input-search", {
            oninput: this.handleSearchInput,
            onkeyup: this.handleSearchKeyup,
            onblur: this.handleSearchBlur
          })), h("a.list-type", {
            href: "?Popular",
            onclick: Page.handleLinkClick,
            classes: {
              active: this.type === "Popular"
            }
          }, "Popular"), h("a.list-type", {
            href: "?Latest",
            onclick: Page.handleLinkClick,
            classes: {
              active: this.type === "Latest"
            }
          }, "Latest"), h("a.list-type", {
            href: "?Seeding",
            onclick: Page.handleLinkClick,
            classes: {
              active: this.type === "Seeding"
            }
          }, "Seeding"), h("a.list-type", {
            href: "?My",
            onclick: Page.handleLinkClick,
            classes: {
              active: this.type === "My"
            }
          }, "My uploads")
        ]), h("a.upload", {
          href: "#",
          onclick: Page.selector.handleBrowseClick
        }, [h("div.icon.icon-upload"), h("span.upload-title", "Upload new file")]), this.files.length ? h("div.files", [
          h("div.file.header", h("div.stats", [h("div.stats-col.peers", "Peers"), h("div.stats-col.ratio", "Ratio"), h("div.stats-col.downloaded", "Uploaded")])), this.files.slice(0, +this.limit + 1 || 9e9).map((function(_this) {
            return function(file) {
              return file.render();
            };
          })(this))
        ]) : void 0, this.loaded && !this.files.length ? this.type === "Seeding" ? h("h2", "Not seeded files yet :(") : h("h2", "No files submitted yet") : void 0, this.files.length > this.limit ? h("a.more.link", {
          href: "#",
          onclick: this.handleMoreClick
        }, "Show more...") : void 0
      ]);
    };

    return List;

  })(Class);

  window.List = List;

}).call(this);


/* ---- /1uPLoaDwKzP6MCGoVzw48r4pxawRBdmQc/js/Selector.coffee ---- */


(function() {
  var Selector,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Selector = (function(superClass) {
    extend(Selector, superClass);

    function Selector() {
      this.render = bind(this.render, this);
      this.preventEvent = bind(this.preventEvent, this);
      this.handleUploadClick = bind(this.handleUploadClick, this);
      this.handleBrowseClick = bind(this.handleBrowseClick, this);
      this.handleFileDrop = bind(this.handleFileDrop, this);
      this.uploadFile = bind(this.uploadFile, this);
      this.handleUploadDone = bind(this.handleUploadDone, this);
      this.registerUpload = bind(this.registerUpload, this);
      this.checkContentJson = bind(this.checkContentJson, this);
      this.file_info = {};
      document.body.ondragover = (function(_this) {
        return function(e) {
          var ref;
          if (((ref = e.dataTransfer.items[0]) != null ? ref.kind : void 0) === "file") {
            document.body.classList.add("drag-over");
          }
          return _this.preventEvent(e);
        };
      })(this);
      document.body.ondragleave = (function(_this) {
        return function(e) {
          if (!e.pageX) {
            document.body.classList.remove("drag-over");
          }
          return _this.preventEvent(e);
        };
      })(this);
    }

    Selector.prototype.checkContentJson = function(cb) {
      var inner_path;
      inner_path = "data/users/" + Page.site_info.auth_address + "/content.json";
      return Page.cmd("fileGet", [inner_path, false], (function(_this) {
        return function(res) {
          var optional_pattern;
          if (res) {
            res = JSON.parse(res);
          }
          if (res == null) {
            res = {};
          }
          optional_pattern = "(?!data.json)";
          if (res.optional === optional_pattern) {
            return cb();
          }
          res.optional = optional_pattern;
          return Page.cmd("fileWrite", [inner_path, Text.fileEncode(res)], cb);
        };
      })(this));
    };

    Selector.prototype.registerUpload = function(title, file_name, file_size, date_added, cb) {
      var inner_path;
      inner_path = "data/users/" + Page.site_info.auth_address + "/data.json";
      return Page.cmd("fileGet", [inner_path, false], (function(_this) {
        return function(res) {
          if (res) {
            res = JSON.parse(res);
          }
          if (res == null) {
            res = {};
          }
          if (res.file == null) {
            res.file = {};
          }
          res.file[file_name] = {
            title: title,
            size: file_size,
            date_added: date_added
          };
          return Page.cmd("fileWrite", [inner_path, Text.fileEncode(res)], cb);
        };
      })(this));
    };

    Selector.prototype.handleUploadDone = function(file) {
      Page.setUrl("?Latest");
      return this.log("Upload done", file);
    };

    Selector.prototype.uploadFile = function(file) {
      var ref;
      if (file.size > 200 * 1024 * 1024) {
        Page.cmd("wrapperNotification", ["info", "Maximum file size on this site during the testing period: 200MB"]);
        return false;
      }
      if (file.size < 10 * 1024 * 1024) {
        Page.cmd("wrapperNotification", ["info", "Minimum file size: 10MB"]);
        return false;
      }
      if ((ref = file.name.split(".").slice(-1)[0]) !== "mp4" && ref !== "gz" && ref !== "zip" && ref !== "webm") {
        Page.cmd("wrapperNotification", ["info", "Only mp4, webm, tar.gz, zip files allowed on this site"]);
        debugger;
        return false;
      }
      this.file_info = {};
      return this.checkContentJson((function(_this) {
        return function(res) {
          var file_name;
          file_name = file.name;
          if (file_name.replace(/[^A-Za-z0-9]/g, "").length < 20) {
            file_name = Time.timestamp() + "-" + file_name;
          }
          return Page.cmd("bigfileUploadInit", ["data/users/" + Page.site_info.auth_address + "/" + file_name, file.size], function(init_res) {
            var formdata, req;
            formdata = new FormData();
            formdata.append(file_name, file);
            req = new XMLHttpRequest();
            _this.req = req;
            _this.file_info = {
              size: file.size,
              name: file_name,
              type: file.type,
              url: init_res.url
            };
            req.upload.addEventListener("loadstart", function(progress) {
              _this.log("loadstart", arguments);
              _this.file_info.started = progress.timeStamp;
              return Page.setPage("uploader");
            });
            req.upload.addEventListener("loadend", function() {
              _this.log("loadend", arguments);
              _this.file_info.status = "done";
              return _this.registerUpload(file.name.replace(/\.[^\.]+$/, ""), init_res.file_relative_path, file.size, Time.timestamp(), function(res) {
                return Page.cmd("siteSign", {
                  inner_path: "data/users/" + Page.site_info.auth_address + "/content.json"
                }, function(res) {
                  return Page.cmd("sitePublish", {
                    inner_path: "data/users/" + Page.site_info.auth_address + "/content.json",
                    "sign": false
                  }, function(res) {
                    return _this.handleUploadDone(file);
                  });
                });
              });
            });
            req.upload.addEventListener("progress", function(progress) {
              _this.file_info.speed = 1000 * progress.loaded / (progress.timeStamp - _this.file_info.started);
              _this.file_info.percent = progress.loaded / progress.total;
              _this.file_info.loaded = progress.loaded;
              _this.file_info.updated = progress.timeStamp;
              return Page.projector.scheduleRender();
            });
            req.addEventListener("load", function() {
              return _this.log("load", arguments);
            });
            req.addEventListener("error", function() {
              return _this.log("error", arguments);
            });
            req.addEventListener("abort", function() {
              return _this.log("abort", arguments);
            });
            req.withCredentials = true;
            req.open("POST", init_res.url);
            return req.send(formdata);
          });
        };
      })(this));
    };

    Selector.prototype.handleFileDrop = function(e) {
      this.log("File drop", e);
      document.body.classList.remove("drag-over");
      if (!event.dataTransfer.files[0]) {
        return false;
      }
      this.preventEvent(e);
      if (Page.site_info.cert_user_id) {
        return this.uploadFile(event.dataTransfer.files[0]);
      } else {
        return Page.cmd("certSelect", [["zeroid.bit"]], (function(_this) {
          return function(res) {
            return _this.uploadFile(event.dataTransfer.files[0]);
          };
        })(this));
      }
    };

    Selector.prototype.handleBrowseClick = function(e) {
      if (Page.site_info.cert_user_id) {
        return this.handleUploadClick(e);
      } else {
        return Page.cmd("certSelect", [["zeroid.bit"]], (function(_this) {
          return function(res) {
            return _this.handleUploadClick(e);
          };
        })(this));
      }
    };

    Selector.prototype.handleUploadClick = function(e) {
      var input;
      input = document.createElement('input');
      document.body.appendChild(input);
      input.type = "file";
      input.style.visibility = "hidden";
      input.onchange = (function(_this) {
        return function(e) {
          return _this.uploadFile(input.files[0]);
        };
      })(this);
      input.click();
      return false;
    };

    Selector.prototype.preventEvent = function(e) {
      e.stopPropagation();
      return e.preventDefault();
    };

    Selector.prototype.render = function() {
      return h("div#Selector.Selector", {
        classes: {
          hidden: Page.state.page !== "selector"
        }
      }, h("div.browse", [
        h("div.icon.icon-upload"), h("a.button", {
          href: "#Browse",
          onclick: this.handleBrowseClick
        }, "Select file from computer")
      ]), h("div.dropzone", {
        ondragenter: this.preventEvent,
        ondragover: this.preventEvent,
        ondrop: this.handleFileDrop
      }));
    };

    return Selector;

  })(Class);

  window.Selector = Selector;

}).call(this);


/* ---- /1uPLoaDwKzP6MCGoVzw48r4pxawRBdmQc/js/Uploader.coffee ---- */


(function() {
  var Uploader,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Uploader = (function(superClass) {
    extend(Uploader, superClass);

    function Uploader() {
      this.render = bind(this.render, this);
      this.handleFinishUpload = bind(this.handleFinishUpload, this);
      this.randomBase2 = bind(this.randomBase2, this);
      this.renderSpeed = bind(this.renderSpeed, this);
      this;
    }

    Uploader.prototype.renderSpeed = function() {
      return "<svg>\n <linearGradient id=\"linearColors\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">\n     <stop offset=\"15%\" stop-color=\"#FF4136\"></stop>\n     <stop offset=\"40%\" stop-color=\"#1BA1E2\"></stop>\n     <stop offset=\"90%\" stop-color=\"#F012BE\"></stop>\n  </linearGradient>\n  <circle cx=\"0\" cy=\"0\" r=\"150\" transform=\"translate(300, 300) rotate(-72.7)\" stroke=\"black\" stroke-width=\"3\" class=\"speed-bg\"></circle>\n  <circle cx=\"0\" cy=\"0\" r=\"155\" transform=\"translate(300, 300) rotate(149.3)\" stroke=\"black\" stroke-width=\"3\" class=\"speed-bg speed-bg-big\" stroke=\"url(#linearColors)\"></circle>\n  <circle cx=\"0\" cy=\"0\" r=\"150\" transform=\"translate(300, 300) rotate(-210)\" stroke-width=\"3\" class=\"speed-current\" stroke=\"url(#linearColors)\" id=\"speed_current\"></circle>\n  <text x=\"190\" y=\"373\" class=\"speed-text\">0</text>\n  <text x=\"173\" y=\"282\" class=\"speed-text\">20</text>\n  <text x=\"217\" y=\"210\" class=\"speed-text\">40</text>\n  <text x=\"292\" y=\"178\" class=\"speed-text\">60</text>\n  <text x=\"371\" y=\"210\" class=\"speed-text\">80</text>\n  <text x=\"404\" y=\"282\" class=\"speed-text\">100</text>\n  <text x=\"390\" y=\"373\" class=\"speed-text\">120</text>\n</svg>";
    };

    Uploader.prototype.randomBase2 = function(len) {
      return (Math.random()).toString(2).slice(2, len);
    };

    Uploader.prototype.handleFinishUpload = function() {
      Page.state.page = "list";
      Page.projector.scheduleRender();
      setTimeout(((function(_this) {
        return function() {
          return Page.list.update();
        };
      })(this)), 1000);
      return false;
    };

    Uploader.prototype.render = function() {
      var dash_offset, file_info;
      file_info = Page.selector.file_info;
      dash_offset = Math.max(2390 - (486 * file_info.speed / 1024 / 1024 / 100), 1770) + Math.random() * 10;
      if (dash_offset !== this.last_dash_offset) {
        this.last_dash_offset = dash_offset;
        setTimeout(((function(_this) {
          return function() {
            var ref;
            return (ref = document.getElementById("speed_current")) != null ? ref.style.strokeDashoffset = dash_offset : void 0;
          };
        })(this)), 1);
      }
      return h("div.Uploader", {
        classes: {
          hidden: Page.state.page !== "uploader"
        }
      }, [
        h("div.speed", {
          innerHTML: this.renderSpeed()
        }), h("div.status", [
          h("div.icon.icon-file-empty.file-fg", {
            style: "clip: rect(0px 100px " + (114 * file_info.percent) + "px 0px)"
          }, [this.randomBase2(13), h("br"), this.randomBase2(13), h("br"), this.randomBase2(13), h("br"), this.randomBase2(40), this.randomBase2(40), this.randomBase2(40), this.randomBase2(24)]), h("div.icon.icon-file-empty.file-bg"), h("div.percent", {
            style: "transform: translateY(" + (114 * file_info.percent) + "px"
          }, [Math.round(file_info.percent * 100), h("span.post", "% \u25B6")]), h("div.name", file_info.name), h("div.size", Text.formatSize(file_info.size)), file_info.status === "done" ? h("div.message.message-done", "File uploaded in " + (((file_info.updated - file_info.started) / 1000).toFixed(1)) + "s @ " + (Text.formatSize(file_info.speed)) + "/s!") : file_info.speed ? h("div.message", "Hashing @ " + (Text.formatSize(file_info.speed)) + "/s...") : h("div.message", "Opening file..."), h("a.button-big.button-finish", {
            href: "?List",
            onclick: this.handleFinishUpload,
            classes: {
              visible: file_info.status === "done"
            }
          }, "Finish upload \u00BB")
        ])
      ]);
    };

    return Uploader;

  })(Class);

  window.Uploader = Uploader;

}).call(this);


/* ---- /1uPLoaDwKzP6MCGoVzw48r4pxawRBdmQc/js/ZeroUp.coffee ---- */


(function() {
  var ZeroUp,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.h = maquette.h;

  ZeroUp = (function(superClass) {
    extend(ZeroUp, superClass);

    function ZeroUp() {
      this.handleLinkClick = bind(this.handleLinkClick, this);
      this.updateSiteInfo = bind(this.updateSiteInfo, this);
      this.onOpenWebsocket = bind(this.onOpenWebsocket, this);
      return ZeroUp.__super__.constructor.apply(this, arguments);
    }

    ZeroUp.prototype.init = function() {
      this.bg = new Bg($("#Bg"));
      this.state = {};
      this.state.page = "list";
      this.on_site_info = new Promise();
      return this.on_loaded = new Promise();
    };

    ZeroUp.prototype.createProjector = function() {
      var url;
      this.projector = maquette.createProjector();
      this.list = new List();
      this.selector = new Selector();
      this.uploader = new Uploader();
      if (base.href.indexOf("?") === -1) {
        this.route("");
      } else {
        url = base.href.replace(/.*?\?/, "");
        this.route(url);
        this.history_state["url"] = url;
      }
      this.projector.replace($("#List"), this.list.render);
      return this.projector.replace($("#Uploader"), this.uploader.render);
    };

    ZeroUp.prototype.setPage = function(page_name) {
      this.state.page = page_name;
      return this.projector.scheduleRender();
    };

    ZeroUp.prototype.setSiteInfo = function(site_info) {
      return this.site_info = site_info;
    };

    ZeroUp.prototype.onOpenWebsocket = function() {
      this.updateSiteInfo();
      return this.cmd("serverInfo", {}, (function(_this) {
        return function(server_info) {
          _this.server_info = server_info;
          if (_this.server_info.rev < 3090) {
            return _this.cmd("wrapperNotification", ["error", "This site requires ZeroNet 0.6.0"]);
          }
        };
      })(this));
    };

    ZeroUp.prototype.updateSiteInfo = function() {
      return this.cmd("siteInfo", {}, (function(_this) {
        return function(site_info) {
          _this.address = site_info.address;
          _this.setSiteInfo(site_info);
          return _this.on_site_info.resolve();
        };
      })(this));
    };

    ZeroUp.prototype.onRequest = function(cmd, params) {
      var ref, ref1;
      if (cmd === "setSiteInfo") {
        this.setSiteInfo(params);
        if ((ref = (ref1 = params.event) != null ? ref1[0] : void 0) === "file_done" || ref === "file_delete" || ref === "peernumber_updated") {
          return RateLimit(1000, (function(_this) {
            return function() {
              _this.list.need_update = true;
              return Page.projector.scheduleRender();
            };
          })(this));
        }
      } else if (cmd === "wrapperPopState") {
        if (params.state) {
          if (!params.state.url) {
            params.state.url = params.href.replace(/.*\?/, "");
          }
          this.on_loaded.resolved = false;
          document.body.className = "";
          window.scroll(window.pageXOffset, params.state.scrollTop || 0);
          return this.route(params.state.url || "");
        }
      } else {
        return this.log("Unknown command", cmd, params);
      }
    };

    ZeroUp.prototype.route = function(query) {
      this.params = Text.queryParse(query);
      this.log("Route", this.params);
      this.content = this.list;
      if (this.params.url) {
        this.list.type = this.params.url;
      }
      this.content.limit = 10;
      this.content.need_update = true;
      return this.projector.scheduleRender();
    };

    ZeroUp.prototype.setUrl = function(url, mode) {
      if (mode == null) {
        mode = "push";
      }
      url = url.replace(/.*?\?/, "");
      this.log("setUrl", this.history_state["url"], "->", url);
      if (this.history_state["url"] === url) {
        this.content.update();
        return false;
      }
      this.history_state["url"] = url;
      if (mode === "replace") {
        this.cmd("wrapperReplaceState", [this.history_state, "", url]);
      } else {
        this.cmd("wrapperPushState", [this.history_state, "", url]);
      }
      this.route(url);
      return false;
    };

    ZeroUp.prototype.handleLinkClick = function(e) {
      if (e.which === 2) {
        return true;
      } else {
        this.log("save scrollTop", window.pageYOffset);
        this.history_state["scrollTop"] = window.pageYOffset;
        this.cmd("wrapperReplaceState", [this.history_state, null]);
        window.scroll(window.pageXOffset, 0);
        this.history_state["scrollTop"] = 0;
        this.on_loaded.resolved = false;
        document.body.className = "";
        this.setUrl(e.currentTarget.search);
        return false;
      }
    };

    ZeroUp.prototype.createUrl = function(key, val) {
      var params, vals;
      params = JSON.parse(JSON.stringify(this.params));
      if (typeof key === "Object") {
        vals = key;
        for (key in keys) {
          val = keys[key];
          params[key] = val;
        }
      } else {
        params[key] = val;
      }
      return "?" + Text.queryEncode(params);
    };

    ZeroUp.prototype.returnFalse = function() {
      return false;
    };

    return ZeroUp;

  })(ZeroFrame);

  window.Page = new ZeroUp();

  window.Page.createProjector();

}).call(this);


/* ---- /1uPLoaDwKzP6MCGoVzw48r4pxawRBdmQc/js/clone.js ---- */


function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
    }
    return copy;
}