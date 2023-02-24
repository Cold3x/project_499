// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"../../node_modules/heatmap.js/build/heatmap.js":[function(require,module,exports) {
var define;
/*
 * heatmap.js v2.0.5 | JavaScript Heatmap Library
 *
 * Copyright 2008-2016 Patrick Wied <heatmapjs@patrick-wied.at> - All rights reserved.
 * Dual licensed under MIT and Beerware license 
 *
 * :: 2016-09-05 01:16
 */
;(function (name, context, factory) {

  // Supports UMD. AMD, CommonJS/Node.js and browser context
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory();
  } else if (typeof define === "function" && define.amd) {
    define(factory);
  } else {
    context[name] = factory();
  }

})("h337", this, function () {

// Heatmap Config stores default values and will be merged with instance config
var HeatmapConfig = {
  defaultRadius: 40,
  defaultRenderer: 'canvas2d',
  defaultGradient: { 0.25: "rgb(0,0,255)", 0.55: "rgb(0,255,0)", 0.85: "yellow", 1.0: "rgb(255,0,0)"},
  defaultMaxOpacity: 1,
  defaultMinOpacity: 0,
  defaultBlur: .85,
  defaultXField: 'x',
  defaultYField: 'y',
  defaultValueField: 'value', 
  plugins: {}
};
var Store = (function StoreClosure() {

  var Store = function Store(config) {
    this._coordinator = {};
    this._data = [];
    this._radi = [];
    this._min = 10;
    this._max = 1;
    this._xField = config['xField'] || config.defaultXField;
    this._yField = config['yField'] || config.defaultYField;
    this._valueField = config['valueField'] || config.defaultValueField;

    if (config["radius"]) {
      this._cfgRadius = config["radius"];
    }
  };

  var defaultRadius = HeatmapConfig.defaultRadius;

  Store.prototype = {
    // when forceRender = false -> called from setData, omits renderall event
    _organiseData: function(dataPoint, forceRender) {
        var x = dataPoint[this._xField];
        var y = dataPoint[this._yField];
        var radi = this._radi;
        var store = this._data;
        var max = this._max;
        var min = this._min;
        var value = dataPoint[this._valueField] || 1;
        var radius = dataPoint.radius || this._cfgRadius || defaultRadius;

        if (!store[x]) {
          store[x] = [];
          radi[x] = [];
        }

        if (!store[x][y]) {
          store[x][y] = value;
          radi[x][y] = radius;
        } else {
          store[x][y] += value;
        }
        var storedVal = store[x][y];

        if (storedVal > max) {
          if (!forceRender) {
            this._max = storedVal;
          } else {
            this.setDataMax(storedVal);
          }
          return false;
        } else if (storedVal < min) {
          if (!forceRender) {
            this._min = storedVal;
          } else {
            this.setDataMin(storedVal);
          }
          return false;
        } else {
          return { 
            x: x, 
            y: y,
            value: value, 
            radius: radius,
            min: min,
            max: max 
          };
        }
    },
    _unOrganizeData: function() {
      var unorganizedData = [];
      var data = this._data;
      var radi = this._radi;

      for (var x in data) {
        for (var y in data[x]) {

          unorganizedData.push({
            x: x,
            y: y,
            radius: radi[x][y],
            value: data[x][y]
          });

        }
      }
      return {
        min: this._min,
        max: this._max,
        data: unorganizedData
      };
    },
    _onExtremaChange: function() {
      this._coordinator.emit('extremachange', {
        min: this._min,
        max: this._max
      });
    },
    addData: function() {
      if (arguments[0].length > 0) {
        var dataArr = arguments[0];
        var dataLen = dataArr.length;
        while (dataLen--) {
          this.addData.call(this, dataArr[dataLen]);
        }
      } else {
        // add to store  
        var organisedEntry = this._organiseData(arguments[0], true);
        if (organisedEntry) {
          // if it's the first datapoint initialize the extremas with it
          if (this._data.length === 0) {
            this._min = this._max = organisedEntry.value;
          }
          this._coordinator.emit('renderpartial', {
            min: this._min,
            max: this._max,
            data: [organisedEntry]
          });
        }
      }
      return this;
    },
    setData: function(data) {
      var dataPoints = data.data;
      var pointsLen = dataPoints.length;


      // reset data arrays
      this._data = [];
      this._radi = [];

      for(var i = 0; i < pointsLen; i++) {
        this._organiseData(dataPoints[i], false);
      }
      this._max = data.max;
      this._min = data.min || 0;
      
      this._onExtremaChange();
      this._coordinator.emit('renderall', this._getInternalData());
      return this;
    },
    removeData: function() {
      // TODO: implement
    },
    setDataMax: function(max) {
      this._max = max;
      this._onExtremaChange();
      this._coordinator.emit('renderall', this._getInternalData());
      return this;
    },
    setDataMin: function(min) {
      this._min = min;
      this._onExtremaChange();
      this._coordinator.emit('renderall', this._getInternalData());
      return this;
    },
    setCoordinator: function(coordinator) {
      this._coordinator = coordinator;
    },
    _getInternalData: function() {
      return { 
        max: this._max,
        min: this._min, 
        data: this._data,
        radi: this._radi 
      };
    },
    getData: function() {
      return this._unOrganizeData();
    }/*,

      TODO: rethink.

    getValueAt: function(point) {
      var value;
      var radius = 100;
      var x = point.x;
      var y = point.y;
      var data = this._data;

      if (data[x] && data[x][y]) {
        return data[x][y];
      } else {
        var values = [];
        // radial search for datapoints based on default radius
        for(var distance = 1; distance < radius; distance++) {
          var neighbors = distance * 2 +1;
          var startX = x - distance;
          var startY = y - distance;

          for(var i = 0; i < neighbors; i++) {
            for (var o = 0; o < neighbors; o++) {
              if ((i == 0 || i == neighbors-1) || (o == 0 || o == neighbors-1)) {
                if (data[startY+i] && data[startY+i][startX+o]) {
                  values.push(data[startY+i][startX+o]);
                }
              } else {
                continue;
              } 
            }
          }
        }
        if (values.length > 0) {
          return Math.max.apply(Math, values);
        }
      }
      return false;
    }*/
  };


  return Store;
})();

var Canvas2dRenderer = (function Canvas2dRendererClosure() {

  var _getColorPalette = function(config) {
    var gradientConfig = config.gradient || config.defaultGradient;
    var paletteCanvas = document.createElement('canvas');
    var paletteCtx = paletteCanvas.getContext('2d');

    paletteCanvas.width = 256;
    paletteCanvas.height = 1;

    var gradient = paletteCtx.createLinearGradient(0, 0, 256, 1);
    for (var key in gradientConfig) {
      gradient.addColorStop(key, gradientConfig[key]);
    }

    paletteCtx.fillStyle = gradient;
    paletteCtx.fillRect(0, 0, 256, 1);

    return paletteCtx.getImageData(0, 0, 256, 1).data;
  };

  var _getPointTemplate = function(radius, blurFactor) {
    var tplCanvas = document.createElement('canvas');
    var tplCtx = tplCanvas.getContext('2d');
    var x = radius;
    var y = radius;
    tplCanvas.width = tplCanvas.height = radius*2;

    if (blurFactor == 1) {
      tplCtx.beginPath();
      tplCtx.arc(x, y, radius, 0, 2 * Math.PI, false);
      tplCtx.fillStyle = 'rgba(0,0,0,1)';
      tplCtx.fill();
    } else {
      var gradient = tplCtx.createRadialGradient(x, y, radius*blurFactor, x, y, radius);
      gradient.addColorStop(0, 'rgba(0,0,0,1)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      tplCtx.fillStyle = gradient;
      tplCtx.fillRect(0, 0, 2*radius, 2*radius);
    }



    return tplCanvas;
  };

  var _prepareData = function(data) {
    var renderData = [];
    var min = data.min;
    var max = data.max;
    var radi = data.radi;
    var data = data.data;

    var xValues = Object.keys(data);
    var xValuesLen = xValues.length;

    while(xValuesLen--) {
      var xValue = xValues[xValuesLen];
      var yValues = Object.keys(data[xValue]);
      var yValuesLen = yValues.length;
      while(yValuesLen--) {
        var yValue = yValues[yValuesLen];
        var value = data[xValue][yValue];
        var radius = radi[xValue][yValue];
        renderData.push({
          x: xValue,
          y: yValue,
          value: value,
          radius: radius
        });
      }
    }

    return {
      min: min,
      max: max,
      data: renderData
    };
  };


  function Canvas2dRenderer(config) {
    var container = config.container;
    var shadowCanvas = this.shadowCanvas = document.createElement('canvas');
    var canvas = this.canvas = config.canvas || document.createElement('canvas');
    var renderBoundaries = this._renderBoundaries = [10000, 10000, 0, 0];

    var computed = getComputedStyle(config.container) || {};

    canvas.className = 'heatmap-canvas';

    this._width = canvas.width = shadowCanvas.width = config.width || +(computed.width.replace(/px/,''));
    this._height = canvas.height = shadowCanvas.height = config.height || +(computed.height.replace(/px/,''));

    this.shadowCtx = shadowCanvas.getContext('2d');
    this.ctx = canvas.getContext('2d');

    // @TODO:
    // conditional wrapper

    canvas.style.cssText = shadowCanvas.style.cssText = 'position:absolute;left:0;top:0;';

    container.style.position = 'relative';
    container.appendChild(canvas);

    this._palette = _getColorPalette(config);
    this._templates = {};

    this._setStyles(config);
  };

  Canvas2dRenderer.prototype = {
    renderPartial: function(data) {
      if (data.data.length > 0) {
        this._drawAlpha(data);
        this._colorize();
      }
    },
    renderAll: function(data) {
      // reset render boundaries
      this._clear();
      if (data.data.length > 0) {
        this._drawAlpha(_prepareData(data));
        this._colorize();
      }
    },
    _updateGradient: function(config) {
      this._palette = _getColorPalette(config);
    },
    updateConfig: function(config) {
      if (config['gradient']) {
        this._updateGradient(config);
      }
      this._setStyles(config);
    },
    setDimensions: function(width, height) {
      this._width = width;
      this._height = height;
      this.canvas.width = this.shadowCanvas.width = width;
      this.canvas.height = this.shadowCanvas.height = height;
    },
    _clear: function() {
      this.shadowCtx.clearRect(0, 0, this._width, this._height);
      this.ctx.clearRect(0, 0, this._width, this._height);
    },
    _setStyles: function(config) {
      this._blur = (config.blur == 0)?0:(config.blur || config.defaultBlur);

      if (config.backgroundColor) {
        this.canvas.style.backgroundColor = config.backgroundColor;
      }

      this._width = this.canvas.width = this.shadowCanvas.width = config.width || this._width;
      this._height = this.canvas.height = this.shadowCanvas.height = config.height || this._height;


      this._opacity = (config.opacity || 0) * 255;
      this._maxOpacity = (config.maxOpacity || config.defaultMaxOpacity) * 255;
      this._minOpacity = (config.minOpacity || config.defaultMinOpacity) * 255;
      this._useGradientOpacity = !!config.useGradientOpacity;
    },
    _drawAlpha: function(data) {
      var min = this._min = data.min;
      var max = this._max = data.max;
      var data = data.data || [];
      var dataLen = data.length;
      // on a point basis?
      var blur = 1 - this._blur;

      while(dataLen--) {

        var point = data[dataLen];

        var x = point.x;
        var y = point.y;
        var radius = point.radius;
        // if value is bigger than max
        // use max as value
        var value = Math.min(point.value, max);
        var rectX = x - radius;
        var rectY = y - radius;
        var shadowCtx = this.shadowCtx;




        var tpl;
        if (!this._templates[radius]) {
          this._templates[radius] = tpl = _getPointTemplate(radius, blur);
        } else {
          tpl = this._templates[radius];
        }
        // value from minimum / value range
        // => [0, 1]
        var templateAlpha = (value-min)/(max-min);
        // this fixes #176: small values are not visible because globalAlpha < .01 cannot be read from imageData
        shadowCtx.globalAlpha = templateAlpha < .01 ? .01 : templateAlpha;

        shadowCtx.drawImage(tpl, rectX, rectY);

        // update renderBoundaries
        if (rectX < this._renderBoundaries[0]) {
            this._renderBoundaries[0] = rectX;
          }
          if (rectY < this._renderBoundaries[1]) {
            this._renderBoundaries[1] = rectY;
          }
          if (rectX + 2*radius > this._renderBoundaries[2]) {
            this._renderBoundaries[2] = rectX + 2*radius;
          }
          if (rectY + 2*radius > this._renderBoundaries[3]) {
            this._renderBoundaries[3] = rectY + 2*radius;
          }

      }
    },
    _colorize: function() {
      var x = this._renderBoundaries[0];
      var y = this._renderBoundaries[1];
      var width = this._renderBoundaries[2] - x;
      var height = this._renderBoundaries[3] - y;
      var maxWidth = this._width;
      var maxHeight = this._height;
      var opacity = this._opacity;
      var maxOpacity = this._maxOpacity;
      var minOpacity = this._minOpacity;
      var useGradientOpacity = this._useGradientOpacity;

      if (x < 0) {
        x = 0;
      }
      if (y < 0) {
        y = 0;
      }
      if (x + width > maxWidth) {
        width = maxWidth - x;
      }
      if (y + height > maxHeight) {
        height = maxHeight - y;
      }

      var img = this.shadowCtx.getImageData(x, y, width, height);
      var imgData = img.data;
      var len = imgData.length;
      var palette = this._palette;


      for (var i = 3; i < len; i+= 4) {
        var alpha = imgData[i];
        var offset = alpha * 4;


        if (!offset) {
          continue;
        }

        var finalAlpha;
        if (opacity > 0) {
          finalAlpha = opacity;
        } else {
          if (alpha < maxOpacity) {
            if (alpha < minOpacity) {
              finalAlpha = minOpacity;
            } else {
              finalAlpha = alpha;
            }
          } else {
            finalAlpha = maxOpacity;
          }
        }

        imgData[i-3] = palette[offset];
        imgData[i-2] = palette[offset + 1];
        imgData[i-1] = palette[offset + 2];
        imgData[i] = useGradientOpacity ? palette[offset + 3] : finalAlpha;

      }

      img.data = imgData;
      this.ctx.putImageData(img, x, y);

      this._renderBoundaries = [1000, 1000, 0, 0];

    },
    getValueAt: function(point) {
      var value;
      var shadowCtx = this.shadowCtx;
      var img = shadowCtx.getImageData(point.x, point.y, 1, 1);
      var data = img.data[3];
      var max = this._max;
      var min = this._min;

      value = (Math.abs(max-min) * (data/255)) >> 0;

      return value;
    },
    getDataURL: function() {
      return this.canvas.toDataURL();
    }
  };


  return Canvas2dRenderer;
})();


var Renderer = (function RendererClosure() {

  var rendererFn = false;

  if (HeatmapConfig['defaultRenderer'] === 'canvas2d') {
    rendererFn = Canvas2dRenderer;
  }

  return rendererFn;
})();


var Util = {
  merge: function() {
    var merged = {};
    var argsLen = arguments.length;
    for (var i = 0; i < argsLen; i++) {
      var obj = arguments[i]
      for (var key in obj) {
        merged[key] = obj[key];
      }
    }
    return merged;
  }
};
// Heatmap Constructor
var Heatmap = (function HeatmapClosure() {

  var Coordinator = (function CoordinatorClosure() {

    function Coordinator() {
      this.cStore = {};
    };

    Coordinator.prototype = {
      on: function(evtName, callback, scope) {
        var cStore = this.cStore;

        if (!cStore[evtName]) {
          cStore[evtName] = [];
        }
        cStore[evtName].push((function(data) {
            return callback.call(scope, data);
        }));
      },
      emit: function(evtName, data) {
        var cStore = this.cStore;
        if (cStore[evtName]) {
          var len = cStore[evtName].length;
          for (var i=0; i<len; i++) {
            var callback = cStore[evtName][i];
            callback(data);
          }
        }
      }
    };

    return Coordinator;
  })();


  var _connect = function(scope) {
    var renderer = scope._renderer;
    var coordinator = scope._coordinator;
    var store = scope._store;

    coordinator.on('renderpartial', renderer.renderPartial, renderer);
    coordinator.on('renderall', renderer.renderAll, renderer);
    coordinator.on('extremachange', function(data) {
      scope._config.onExtremaChange &&
      scope._config.onExtremaChange({
        min: data.min,
        max: data.max,
        gradient: scope._config['gradient'] || scope._config['defaultGradient']
      });
    });
    store.setCoordinator(coordinator);
  };


  function Heatmap() {
    var config = this._config = Util.merge(HeatmapConfig, arguments[0] || {});
    this._coordinator = new Coordinator();
    if (config['plugin']) {
      var pluginToLoad = config['plugin'];
      if (!HeatmapConfig.plugins[pluginToLoad]) {
        throw new Error('Plugin \''+ pluginToLoad + '\' not found. Maybe it was not registered.');
      } else {
        var plugin = HeatmapConfig.plugins[pluginToLoad];
        // set plugin renderer and store
        this._renderer = new plugin.renderer(config);
        this._store = new plugin.store(config);
      }
    } else {
      this._renderer = new Renderer(config);
      this._store = new Store(config);
    }
    _connect(this);
  };

  // @TODO:
  // add API documentation
  Heatmap.prototype = {
    addData: function() {
      this._store.addData.apply(this._store, arguments);
      return this;
    },
    removeData: function() {
      this._store.removeData && this._store.removeData.apply(this._store, arguments);
      return this;
    },
    setData: function() {
      this._store.setData.apply(this._store, arguments);
      return this;
    },
    setDataMax: function() {
      this._store.setDataMax.apply(this._store, arguments);
      return this;
    },
    setDataMin: function() {
      this._store.setDataMin.apply(this._store, arguments);
      return this;
    },
    configure: function(config) {
      this._config = Util.merge(this._config, config);
      this._renderer.updateConfig(this._config);
      this._coordinator.emit('renderall', this._store._getInternalData());
      return this;
    },
    repaint: function() {
      this._coordinator.emit('renderall', this._store._getInternalData());
      return this;
    },
    getData: function() {
      return this._store.getData();
    },
    getDataURL: function() {
      return this._renderer.getDataURL();
    },
    getValueAt: function(point) {

      if (this._store.getValueAt) {
        return this._store.getValueAt(point);
      } else  if (this._renderer.getValueAt) {
        return this._renderer.getValueAt(point);
      } else {
        return null;
      }
    }
  };

  return Heatmap;

})();


// core
var heatmapFactory = {
  create: function(config) {
    return new Heatmap(config);
  },
  register: function(pluginKey, plugin) {
    HeatmapConfig.plugins[pluginKey] = plugin;
  }
};

return heatmapFactory;


});
},{}],"../../node_modules/regenerator-runtime/runtime.js":[function(require,module,exports) {
var define;
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var defineProperty = Object.defineProperty || function (obj, key, desc) { obj[key] = desc.value; };
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) });

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  define(IteratorPrototype, iteratorSymbol, function () {
    return this;
  });

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = GeneratorFunctionPrototype;
  defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: true });
  defineProperty(
    GeneratorFunctionPrototype,
    "constructor",
    { value: GeneratorFunction, configurable: true }
  );
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    defineProperty(this, "_invoke", { value: enqueue });
  }

  defineIteratorMethods(AsyncIterator.prototype);
  define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
    return this;
  });
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var methodName = context.method;
    var method = delegate.iterator[methodName];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method, or a missing .next mehtod, always terminate the
      // yield* loop.
      context.delegate = null;

      // Note: ["return"] must be used for ES3 parsing compatibility.
      if (methodName === "throw" && delegate.iterator["return"]) {
        // If the delegate iterator has a return method, give it a
        // chance to clean up.
        context.method = "return";
        context.arg = undefined;
        maybeInvokeDelegate(delegate, context);

        if (context.method === "throw") {
          // If maybeInvokeDelegate(context) changed context.method from
          // "return" to "throw", let that override the TypeError below.
          return ContinueSentinel;
        }
      }
      if (methodName !== "return") {
        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a '" + methodName + "' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  define(Gp, iteratorSymbol, function() {
    return this;
  });

  define(Gp, "toString", function() {
    return "[object Generator]";
  });

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(val) {
    var object = Object(val);
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  typeof module === "object" ? module.exports : {}
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, in modern engines
  // we can explicitly access globalThis. In older engines we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  if (typeof globalThis === "object") {
    globalThis.regeneratorRuntime = runtime;
  } else {
    Function("r", "regeneratorRuntime = r")(runtime);
  }
}

},{}],"../../node_modules/seeso/dist/seeso.js":[function(require,module,exports) {
var define;
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(self, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/axios/index.js":
/*!*************************************!*\
  !*** ./node_modules/axios/index.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("module.exports = __webpack_require__(/*! ./lib/axios */ \"./node_modules/axios/lib/axios.js\");\n\n//# sourceURL=webpack://seeso/./node_modules/axios/index.js?");

/***/ }),

/***/ "./node_modules/axios/lib/adapters/xhr.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/adapters/xhr.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nvar utils = __webpack_require__(/*! ./../utils */ \"./node_modules/axios/lib/utils.js\");\nvar settle = __webpack_require__(/*! ./../core/settle */ \"./node_modules/axios/lib/core/settle.js\");\nvar cookies = __webpack_require__(/*! ./../helpers/cookies */ \"./node_modules/axios/lib/helpers/cookies.js\");\nvar buildURL = __webpack_require__(/*! ./../helpers/buildURL */ \"./node_modules/axios/lib/helpers/buildURL.js\");\nvar buildFullPath = __webpack_require__(/*! ../core/buildFullPath */ \"./node_modules/axios/lib/core/buildFullPath.js\");\nvar parseHeaders = __webpack_require__(/*! ./../helpers/parseHeaders */ \"./node_modules/axios/lib/helpers/parseHeaders.js\");\nvar isURLSameOrigin = __webpack_require__(/*! ./../helpers/isURLSameOrigin */ \"./node_modules/axios/lib/helpers/isURLSameOrigin.js\");\nvar createError = __webpack_require__(/*! ../core/createError */ \"./node_modules/axios/lib/core/createError.js\");\n\nmodule.exports = function xhrAdapter(config) {\n  return new Promise(function dispatchXhrRequest(resolve, reject) {\n    var requestData = config.data;\n    var requestHeaders = config.headers;\n\n    if (utils.isFormData(requestData)) {\n      delete requestHeaders['Content-Type']; // Let the browser set it\n    }\n\n    var request = new XMLHttpRequest();\n\n    // HTTP basic authentication\n    if (config.auth) {\n      var username = config.auth.username || '';\n      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';\n      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);\n    }\n\n    var fullPath = buildFullPath(config.baseURL, config.url);\n    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);\n\n    // Set the request timeout in MS\n    request.timeout = config.timeout;\n\n    // Listen for ready state\n    request.onreadystatechange = function handleLoad() {\n      if (!request || request.readyState !== 4) {\n        return;\n      }\n\n      // The request errored out and we didn't get a response, this will be\n      // handled by onerror instead\n      // With one exception: request that using file: protocol, most browsers\n      // will return status as 0 even though it's a successful request\n      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {\n        return;\n      }\n\n      // Prepare the response\n      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;\n      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;\n      var response = {\n        data: responseData,\n        status: request.status,\n        statusText: request.statusText,\n        headers: responseHeaders,\n        config: config,\n        request: request\n      };\n\n      settle(resolve, reject, response);\n\n      // Clean up request\n      request = null;\n    };\n\n    // Handle browser request cancellation (as opposed to a manual cancellation)\n    request.onabort = function handleAbort() {\n      if (!request) {\n        return;\n      }\n\n      reject(createError('Request aborted', config, 'ECONNABORTED', request));\n\n      // Clean up request\n      request = null;\n    };\n\n    // Handle low level network errors\n    request.onerror = function handleError() {\n      // Real errors are hidden from us by the browser\n      // onerror should only fire if it's a network error\n      reject(createError('Network Error', config, null, request));\n\n      // Clean up request\n      request = null;\n    };\n\n    // Handle timeout\n    request.ontimeout = function handleTimeout() {\n      var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';\n      if (config.timeoutErrorMessage) {\n        timeoutErrorMessage = config.timeoutErrorMessage;\n      }\n      reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',\n        request));\n\n      // Clean up request\n      request = null;\n    };\n\n    // Add xsrf header\n    // This is only done if running in a standard browser environment.\n    // Specifically not if we're in a web worker, or react-native.\n    if (utils.isStandardBrowserEnv()) {\n      // Add xsrf header\n      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?\n        cookies.read(config.xsrfCookieName) :\n        undefined;\n\n      if (xsrfValue) {\n        requestHeaders[config.xsrfHeaderName] = xsrfValue;\n      }\n    }\n\n    // Add headers to the request\n    if ('setRequestHeader' in request) {\n      utils.forEach(requestHeaders, function setRequestHeader(val, key) {\n        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {\n          // Remove Content-Type if data is undefined\n          delete requestHeaders[key];\n        } else {\n          // Otherwise add header to the request\n          request.setRequestHeader(key, val);\n        }\n      });\n    }\n\n    // Add withCredentials to request if needed\n    if (!utils.isUndefined(config.withCredentials)) {\n      request.withCredentials = !!config.withCredentials;\n    }\n\n    // Add responseType to request if needed\n    if (config.responseType) {\n      try {\n        request.responseType = config.responseType;\n      } catch (e) {\n        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.\n        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.\n        if (config.responseType !== 'json') {\n          throw e;\n        }\n      }\n    }\n\n    // Handle progress if needed\n    if (typeof config.onDownloadProgress === 'function') {\n      request.addEventListener('progress', config.onDownloadProgress);\n    }\n\n    // Not all browsers support upload events\n    if (typeof config.onUploadProgress === 'function' && request.upload) {\n      request.upload.addEventListener('progress', config.onUploadProgress);\n    }\n\n    if (config.cancelToken) {\n      // Handle cancellation\n      config.cancelToken.promise.then(function onCanceled(cancel) {\n        if (!request) {\n          return;\n        }\n\n        request.abort();\n        reject(cancel);\n        // Clean up request\n        request = null;\n      });\n    }\n\n    if (!requestData) {\n      requestData = null;\n    }\n\n    // Send the request\n    request.send(requestData);\n  });\n};\n\n\n//# sourceURL=webpack://seeso/./node_modules/axios/lib/adapters/xhr.js?");

/***/ }),

/***/ "./node_modules/axios/lib/axios.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/axios.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nvar utils = __webpack_require__(/*! ./utils */ \"./node_modules/axios/lib/utils.js\");\nvar bind = __webpack_require__(/*! ./helpers/bind */ \"./node_modules/axios/lib/helpers/bind.js\");\nvar Axios = __webpack_require__(/*! ./core/Axios */ \"./node_modules/axios/lib/core/Axios.js\");\nvar mergeConfig = __webpack_require__(/*! ./core/mergeConfig */ \"./node_modules/axios/lib/core/mergeConfig.js\");\nvar defaults = __webpack_require__(/*! ./defaults */ \"./node_modules/axios/lib/defaults.js\");\n\n/**\n * Create an instance of Axios\n *\n * @param {Object} defaultConfig The default config for the instance\n * @return {Axios} A new instance of Axios\n */\nfunction createInstance(defaultConfig) {\n  var context = new Axios(defaultConfig);\n  var instance = bind(Axios.prototype.request, context);\n\n  // Copy axios.prototype to instance\n  utils.extend(instance, Axios.prototype, context);\n\n  // Copy context to instance\n  utils.extend(instance, context);\n\n  return instance;\n}\n\n// Create the default instance to be exported\nvar axios = createInstance(defaults);\n\n// Expose Axios class to allow class inheritance\naxios.Axios = Axios;\n\n// Factory for creating new instances\naxios.create = function create(instanceConfig) {\n  return createInstance(mergeConfig(axios.defaults, instanceConfig));\n};\n\n// Expose Cancel & CancelToken\naxios.Cancel = __webpack_require__(/*! ./cancel/Cancel */ \"./node_modules/axios/lib/cancel/Cancel.js\");\naxios.CancelToken = __webpack_require__(/*! ./cancel/CancelToken */ \"./node_modules/axios/lib/cancel/CancelToken.js\");\naxios.isCancel = __webpack_require__(/*! ./cancel/isCancel */ \"./node_modules/axios/lib/cancel/isCancel.js\");\n\n// Expose all/spread\naxios.all = function all(promises) {\n  return Promise.all(promises);\n};\naxios.spread = __webpack_require__(/*! ./helpers/spread */ \"./node_modules/axios/lib/helpers/spread.js\");\n\n// Expose isAxiosError\naxios.isAxiosError = __webpack_require__(/*! ./helpers/isAxiosError */ \"./node_modules/axios/lib/helpers/isAxiosError.js\");\n\nmodule.exports = axios;\n\n// Allow use of default import syntax in TypeScript\nmodule.exports.default = axios;\n\n\n//# sourceURL=webpack://seeso/./node_modules/axios/lib/axios.js?");

/***/ }),

/***/ "./node_modules/axios/lib/cancel/Cancel.js":
/*!*************************************************!*\
  !*** ./node_modules/axios/lib/cancel/Cancel.js ***!
  \*************************************************/
/***/ ((module) => {

"use strict";
eval("\n\n/**\n * A `Cancel` is an object that is thrown when an operation is canceled.\n *\n * @class\n * @param {string=} message The message.\n */\nfunction Cancel(message) {\n  this.message = message;\n}\n\nCancel.prototype.toString = function toString() {\n  return 'Cancel' + (this.message ? ': ' + this.message : '');\n};\n\nCancel.prototype.__CANCEL__ = true;\n\nmodule.exports = Cancel;\n\n\n//# sourceURL=webpack://seeso/./node_modules/axios/lib/cancel/Cancel.js?");

/***/ }),

/***/ "./node_modules/axios/lib/cancel/CancelToken.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/cancel/CancelToken.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nvar Cancel = __webpack_require__(/*! ./Cancel */ \"./node_modules/axios/lib/cancel/Cancel.js\");\n\n/**\n * A `CancelToken` is an object that can be used to request cancellation of an operation.\n *\n * @class\n * @param {Function} executor The executor function.\n */\nfunction CancelToken(executor) {\n  if (typeof executor !== 'function') {\n    throw new TypeError('executor must be a function.');\n  }\n\n  var resolvePromise;\n  this.promise = new Promise(function promiseExecutor(resolve) {\n    resolvePromise = resolve;\n  });\n\n  var token = this;\n  executor(function cancel(message) {\n    if (token.reason) {\n      // Cancellation has already been requested\n      return;\n    }\n\n    token.reason = new Cancel(message);\n    resolvePromise(token.reason);\n  });\n}\n\n/**\n * Throws a `Cancel` if cancellation has been requested.\n */\nCancelToken.prototype.throwIfRequested = function throwIfRequested() {\n  if (this.reason) {\n    throw this.reason;\n  }\n};\n\n/**\n * Returns an object that contains a new `CancelToken` and a function that, when called,\n * cancels the `CancelToken`.\n */\nCancelToken.source = function source() {\n  var cancel;\n  var token = new CancelToken(function executor(c) {\n    cancel = c;\n  });\n  return {\n    token: token,\n    cancel: cancel\n  };\n};\n\nmodule.exports = CancelToken;\n\n\n//# sourceURL=webpack://seeso/./node_modules/axios/lib/cancel/CancelToken.js?");

/***/ }),

/***/ "./node_modules/axios/lib/cancel/isCancel.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/cancel/isCancel.js ***!
  \***************************************************/
/***/ ((module) => {

"use strict";
eval("\n\nmodule.exports = function isCancel(value) {\n  return !!(value && value.__CANCEL__);\n};\n\n\n//# sourceURL=webpack://seeso/./node_modules/axios/lib/cancel/isCancel.js?");

/***/ }),

/***/ "./node_modules/axios/lib/core/Axios.js":
/*!**********************************************!*\
  !*** ./node_modules/axios/lib/core/Axios.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nvar utils = __webpack_require__(/*! ./../utils */ \"./node_modules/axios/lib/utils.js\");\nvar buildURL = __webpack_require__(/*! ../helpers/buildURL */ \"./node_modules/axios/lib/helpers/buildURL.js\");\nvar InterceptorManager = __webpack_require__(/*! ./InterceptorManager */ \"./node_modules/axios/lib/core/InterceptorManager.js\");\nvar dispatchRequest = __webpack_require__(/*! ./dispatchRequest */ \"./node_modules/axios/lib/core/dispatchRequest.js\");\nvar mergeConfig = __webpack_require__(/*! ./mergeConfig */ \"./node_modules/axios/lib/core/mergeConfig.js\");\n\n/**\n * Create a new instance of Axios\n *\n * @param {Object} instanceConfig The default config for the instance\n */\nfunction Axios(instanceConfig) {\n  this.defaults = instanceConfig;\n  this.interceptors = {\n    request: new InterceptorManager(),\n    response: new InterceptorManager()\n  };\n}\n\n/**\n * Dispatch a request\n *\n * @param {Object} config The config specific for this request (merged with this.defaults)\n */\nAxios.prototype.request = function request(config) {\n  /*eslint no-param-reassign:0*/\n  // Allow for axios('example/url'[, config]) a la fetch API\n  if (typeof config === 'string') {\n    config = arguments[1] || {};\n    config.url = arguments[0];\n  } else {\n    config = config || {};\n  }\n\n  config = mergeConfig(this.defaults, config);\n\n  // Set config.method\n  if (config.method) {\n    config.method = config.method.toLowerCase();\n  } else if (this.defaults.method) {\n    config.method = this.defaults.method.toLowerCase();\n  } else {\n    config.method = 'get';\n  }\n\n  // Hook up interceptors middleware\n  var chain = [dispatchRequest, undefined];\n  var promise = Promise.resolve(config);\n\n  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {\n    chain.unshift(interceptor.fulfilled, interceptor.rejected);\n  });\n\n  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {\n    chain.push(interceptor.fulfilled, interceptor.rejected);\n  });\n\n  while (chain.length) {\n    promise = promise.then(chain.shift(), chain.shift());\n  }\n\n  return promise;\n};\n\nAxios.prototype.getUri = function getUri(config) {\n  config = mergeConfig(this.defaults, config);\n  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\\?/, '');\n};\n\n// Provide aliases for supported request methods\nutils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {\n  /*eslint func-names:0*/\n  Axios.prototype[method] = function(url, config) {\n    return this.request(mergeConfig(config || {}, {\n      method: method,\n      url: url,\n      data: (config || {}).data\n    }));\n  };\n});\n\nutils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {\n  /*eslint func-names:0*/\n  Axios.prototype[method] = function(url, data, config) {\n    return this.request(mergeConfig(config || {}, {\n      method: method,\n      url: url,\n      data: data\n    }));\n  };\n});\n\nmodule.exports = Axios;\n\n\n//# sourceURL=webpack://seeso/./node_modules/axios/lib/core/Axios.js?");

/***/ }),

/***/ "./node_modules/axios/lib/core/InterceptorManager.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/core/InterceptorManager.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nvar utils = __webpack_require__(/*! ./../utils */ \"./node_modules/axios/lib/utils.js\");\n\nfunction InterceptorManager() {\n  this.handlers = [];\n}\n\n/**\n * Add a new interceptor to the stack\n *\n * @param {Function} fulfilled The function to handle `then` for a `Promise`\n * @param {Function} rejected The function to handle `reject` for a `Promise`\n *\n * @return {Number} An ID used to remove interceptor later\n */\nInterceptorManager.prototype.use = function use(fulfilled, rejected) {\n  this.handlers.push({\n    fulfilled: fulfilled,\n    rejected: rejected\n  });\n  return this.handlers.length - 1;\n};\n\n/**\n * Remove an interceptor from the stack\n *\n * @param {Number} id The ID that was returned by `use`\n */\nInterceptorManager.prototype.eject = function eject(id) {\n  if (this.handlers[id]) {\n    this.handlers[id] = null;\n  }\n};\n\n/**\n * Iterate over all the registered interceptors\n *\n * This method is particularly useful for skipping over any\n * interceptors that may have become `null` calling `eject`.\n *\n * @param {Function} fn The function to call for each interceptor\n */\nInterceptorManager.prototype.forEach = function forEach(fn) {\n  utils.forEach(this.handlers, function forEachHandler(h) {\n    if (h !== null) {\n      fn(h);\n    }\n  });\n};\n\nmodule.exports = InterceptorManager;\n\n\n//# sourceURL=webpack://seeso/./node_modules/axios/lib/core/InterceptorManager.js?");

/***/ }),

/***/ "./node_modules/axios/lib/core/buildFullPath.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/buildFullPath.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nvar isAbsoluteURL = __webpack_require__(/*! ../helpers/isAbsoluteURL */ \"./node_modules/axios/lib/helpers/isAbsoluteURL.js\");\nvar combineURLs = __webpack_require__(/*! ../helpers/combineURLs */ \"./node_modules/axios/lib/helpers/combineURLs.js\");\n\n/**\n * Creates a new URL by combining the baseURL with the requestedURL,\n * only when the requestedURL is not already an absolute URL.\n * If the requestURL is absolute, this function returns the requestedURL untouched.\n *\n * @param {string} baseURL The base URL\n * @param {string} requestedURL Absolute or relative URL to combine\n * @returns {string} The combined full path\n */\nmodule.exports = function buildFullPath(baseURL, requestedURL) {\n  if (baseURL && !isAbsoluteURL(requestedURL)) {\n    return combineURLs(baseURL, requestedURL);\n  }\n  return requestedURL;\n};\n\n\n//# sourceURL=webpack://seeso/./node_modules/axios/lib/core/buildFullPath.js?");

/***/ }),

/***/ "./node_modules/axios/lib/core/createError.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/createError.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nvar enhanceError = __webpack_require__(/*! ./enhanceError */ \"./node_modules/axios/lib/core/enhanceError.js\");\n\n/**\n * Create an Error with the specified message, config, error code, request and response.\n *\n * @param {string} message The error message.\n * @param {Object} config The config.\n * @param {string} [code] The error code (for example, 'ECONNABORTED').\n * @param {Object} [request] The request.\n * @param {Object} [response] The response.\n * @returns {Error} The created error.\n */\nmodule.exports = function createError(message, config, code, request, response) {\n  var error = new Error(message);\n  return enhanceError(error, config, code, request, response);\n};\n\n\n//# sourceURL=webpack://seeso/./node_modules/axios/lib/core/createError.js?");

/***/ }),

/***/ "./node_modules/axios/lib/core/dispatchRequest.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/core/dispatchRequest.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nvar utils = __webpack_require__(/*! ./../utils */ \"./node_modules/axios/lib/utils.js\");\nvar transformData = __webpack_require__(/*! ./transformData */ \"./node_modules/axios/lib/core/transformData.js\");\nvar isCancel = __webpack_require__(/*! ../cancel/isCancel */ \"./node_modules/axios/lib/cancel/isCancel.js\");\nvar defaults = __webpack_require__(/*! ../defaults */ \"./node_modules/axios/lib/defaults.js\");\n\n/**\n * Throws a `Cancel` if cancellation has been requested.\n */\nfunction throwIfCancellationRequested(config) {\n  if (config.cancelToken) {\n    config.cancelToken.throwIfRequested();\n  }\n}\n\n/**\n * Dispatch a request to the server using the configured adapter.\n *\n * @param {object} config The config that is to be used for the request\n * @returns {Promise} The Promise to be fulfilled\n */\nmodule.exports = function dispatchRequest(config) {\n  throwIfCancellationRequested(config);\n\n  // Ensure headers exist\n  config.headers = config.headers || {};\n\n  // Transform request data\n  config.data = transformData(\n    config.data,\n    config.headers,\n    config.transformRequest\n  );\n\n  // Flatten headers\n  config.headers = utils.merge(\n    config.headers.common || {},\n    config.headers[config.method] || {},\n    config.headers\n  );\n\n  utils.forEach(\n    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],\n    function cleanHeaderConfig(method) {\n      delete config.headers[method];\n    }\n  );\n\n  var adapter = config.adapter || defaults.adapter;\n\n  return adapter(config).then(function onAdapterResolution(response) {\n    throwIfCancellationRequested(config);\n\n    // Transform response data\n    response.data = transformData(\n      response.data,\n      response.headers,\n      config.transformResponse\n    );\n\n    return response;\n  }, function onAdapterRejection(reason) {\n    if (!isCancel(reason)) {\n      throwIfCancellationRequested(config);\n\n      // Transform response data\n      if (reason && reason.response) {\n        reason.response.data = transformData(\n          reason.response.data,\n          reason.response.headers,\n          config.transformResponse\n        );\n      }\n    }\n\n    return Promise.reject(reason);\n  });\n};\n\n\n//# sourceURL=webpack://seeso/./node_modules/axios/lib/core/dispatchRequest.js?");

/***/ }),

/***/ "./node_modules/axios/lib/core/enhanceError.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/core/enhanceError.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";
eval("\n\n/**\n * Update an Error with the specified config, error code, and response.\n *\n * @param {Error} error The error to update.\n * @param {Object} config The config.\n * @param {string} [code] The error code (for example, 'ECONNABORTED').\n * @param {Object} [request] The request.\n * @param {Object} [response] The response.\n * @returns {Error} The error.\n */\nmodule.exports = function enhanceError(error, config, code, request, response) {\n  error.config = config;\n  if (code) {\n    error.code = code;\n  }\n\n  error.request = request;\n  error.response = response;\n  error.isAxiosError = true;\n\n  error.toJSON = function toJSON() {\n    return {\n      // Standard\n      message: this.message,\n      name: this.name,\n      // Microsoft\n      description: this.description,\n      number: this.number,\n      // Mozilla\n      fileName: this.fileName,\n      lineNumber: this.lineNumber,\n      columnNumber: this.columnNumber,\n      stack: this.stack,\n      // Axios\n      config: this.config,\n      code: this.code\n    };\n  };\n  return error;\n};\n\n\n//# sourceURL=webpack://seeso/./node_modules/axios/lib/core/enhanceError.js?");

/***/ }),

/***/ "./node_modules/axios/lib/core/mergeConfig.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/mergeConfig.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nvar utils = __webpack_require__(/*! ../utils */ \"./node_modules/axios/lib/utils.js\");\n\n/**\n * Config-specific merge-function which creates a new config-object\n * by merging two configuration objects together.\n *\n * @param {Object} config1\n * @param {Object} config2\n * @returns {Object} New object resulting from merging config2 to config1\n */\nmodule.exports = function mergeConfig(config1, config2) {\n  // eslint-disable-next-line no-param-reassign\n  config2 = config2 || {};\n  var config = {};\n\n  var valueFromConfig2Keys = ['url', 'method', 'data'];\n  var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];\n  var defaultToConfig2Keys = [\n    'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',\n    'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',\n    'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',\n    'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',\n    'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'\n  ];\n  var directMergeKeys = ['validateStatus'];\n\n  function getMergedValue(target, source) {\n    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {\n      return utils.merge(target, source);\n    } else if (utils.isPlainObject(source)) {\n      return utils.merge({}, source);\n    } else if (utils.isArray(source)) {\n      return source.slice();\n    }\n    return source;\n  }\n\n  function mergeDeepProperties(prop) {\n    if (!utils.isUndefined(config2[prop])) {\n      config[prop] = getMergedValue(config1[prop], config2[prop]);\n    } else if (!utils.isUndefined(config1[prop])) {\n      config[prop] = getMergedValue(undefined, config1[prop]);\n    }\n  }\n\n  utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {\n    if (!utils.isUndefined(config2[prop])) {\n      config[prop] = getMergedValue(undefined, config2[prop]);\n    }\n  });\n\n  utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);\n\n  utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {\n    if (!utils.isUndefined(config2[prop])) {\n      config[prop] = getMergedValue(undefined, config2[prop]);\n    } else if (!utils.isUndefined(config1[prop])) {\n      config[prop] = getMergedValue(undefined, config1[prop]);\n    }\n  });\n\n  utils.forEach(directMergeKeys, function merge(prop) {\n    if (prop in config2) {\n      config[prop] = getMergedValue(config1[prop], config2[prop]);\n    } else if (prop in config1) {\n      config[prop] = getMergedValue(undefined, config1[prop]);\n    }\n  });\n\n  var axiosKeys = valueFromConfig2Keys\n    .concat(mergeDeepPropertiesKeys)\n    .concat(defaultToConfig2Keys)\n    .concat(directMergeKeys);\n\n  var otherKeys = Object\n    .keys(config1)\n    .concat(Object.keys(config2))\n    .filter(function filterAxiosKeys(key) {\n      return axiosKeys.indexOf(key) === -1;\n    });\n\n  utils.forEach(otherKeys, mergeDeepProperties);\n\n  return config;\n};\n\n\n//# sourceURL=webpack://seeso/./node_modules/axios/lib/core/mergeConfig.js?");

/***/ }),

/***/ "./node_modules/axios/lib/core/settle.js":
/*!***********************************************!*\
  !*** ./node_modules/axios/lib/core/settle.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nvar createError = __webpack_require__(/*! ./createError */ \"./node_modules/axios/lib/core/createError.js\");\n\n/**\n * Resolve or reject a Promise based on response status.\n *\n * @param {Function} resolve A function that resolves the promise.\n * @param {Function} reject A function that rejects the promise.\n * @param {object} response The response.\n */\nmodule.exports = function settle(resolve, reject, response) {\n  var validateStatus = response.config.validateStatus;\n  if (!response.status || !validateStatus || validateStatus(response.status)) {\n    resolve(response);\n  } else {\n    reject(createError(\n      'Request failed with status code ' + response.status,\n      response.config,\n      null,\n      response.request,\n      response\n    ));\n  }\n};\n\n\n//# sourceURL=webpack://seeso/./node_modules/axios/lib/core/settle.js?");

/***/ }),

/***/ "./node_modules/axios/lib/core/transformData.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/transformData.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nvar utils = __webpack_require__(/*! ./../utils */ \"./node_modules/axios/lib/utils.js\");\n\n/**\n * Transform the data for a request or a response\n *\n * @param {Object|String} data The data to be transformed\n * @param {Array} headers The headers for the request or response\n * @param {Array|Function} fns A single function or Array of functions\n * @returns {*} The resulting transformed data\n */\nmodule.exports = function transformData(data, headers, fns) {\n  /*eslint no-param-reassign:0*/\n  utils.forEach(fns, function transform(fn) {\n    data = fn(data, headers);\n  });\n\n  return data;\n};\n\n\n//# sourceURL=webpack://seeso/./node_modules/axios/lib/core/transformData.js?");

/***/ }),

/***/ "./node_modules/axios/lib/defaults.js":
/*!********************************************!*\
  !*** ./node_modules/axios/lib/defaults.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nvar utils = __webpack_require__(/*! ./utils */ \"./node_modules/axios/lib/utils.js\");\nvar normalizeHeaderName = __webpack_require__(/*! ./helpers/normalizeHeaderName */ \"./node_modules/axios/lib/helpers/normalizeHeaderName.js\");\n\nvar DEFAULT_CONTENT_TYPE = {\n  'Content-Type': 'application/x-www-form-urlencoded'\n};\n\nfunction setContentTypeIfUnset(headers, value) {\n  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {\n    headers['Content-Type'] = value;\n  }\n}\n\nfunction getDefaultAdapter() {\n  var adapter;\n  if (typeof XMLHttpRequest !== 'undefined') {\n    // For browsers use XHR adapter\n    adapter = __webpack_require__(/*! ./adapters/xhr */ \"./node_modules/axios/lib/adapters/xhr.js\");\n  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {\n    // For node use HTTP adapter\n    adapter = __webpack_require__(/*! ./adapters/http */ \"./node_modules/axios/lib/adapters/xhr.js\");\n  }\n  return adapter;\n}\n\nvar defaults = {\n  adapter: getDefaultAdapter(),\n\n  transformRequest: [function transformRequest(data, headers) {\n    normalizeHeaderName(headers, 'Accept');\n    normalizeHeaderName(headers, 'Content-Type');\n    if (utils.isFormData(data) ||\n      utils.isArrayBuffer(data) ||\n      utils.isBuffer(data) ||\n      utils.isStream(data) ||\n      utils.isFile(data) ||\n      utils.isBlob(data)\n    ) {\n      return data;\n    }\n    if (utils.isArrayBufferView(data)) {\n      return data.buffer;\n    }\n    if (utils.isURLSearchParams(data)) {\n      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');\n      return data.toString();\n    }\n    if (utils.isObject(data)) {\n      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');\n      return JSON.stringify(data);\n    }\n    return data;\n  }],\n\n  transformResponse: [function transformResponse(data) {\n    /*eslint no-param-reassign:0*/\n    if (typeof data === 'string') {\n      try {\n        data = JSON.parse(data);\n      } catch (e) { /* Ignore */ }\n    }\n    return data;\n  }],\n\n  /**\n   * A timeout in milliseconds to abort a request. If set to 0 (default) a\n   * timeout is not created.\n   */\n  timeout: 0,\n\n  xsrfCookieName: 'XSRF-TOKEN',\n  xsrfHeaderName: 'X-XSRF-TOKEN',\n\n  maxContentLength: -1,\n  maxBodyLength: -1,\n\n  validateStatus: function validateStatus(status) {\n    return status >= 200 && status < 300;\n  }\n};\n\ndefaults.headers = {\n  common: {\n    'Accept': 'application/json, text/plain, */*'\n  }\n};\n\nutils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {\n  defaults.headers[method] = {};\n});\n\nutils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {\n  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);\n});\n\nmodule.exports = defaults;\n\n\n//# sourceURL=webpack://seeso/./node_modules/axios/lib/defaults.js?");

/***/ }),

/***/ "./node_modules/axios/lib/helpers/bind.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/helpers/bind.js ***!
  \************************************************/
/***/ ((module) => {

"use strict";
eval("\n\nmodule.exports = function bind(fn, thisArg) {\n  return function wrap() {\n    var args = new Array(arguments.length);\n    for (var i = 0; i < args.length; i++) {\n      args[i] = arguments[i];\n    }\n    return fn.apply(thisArg, args);\n  };\n};\n\n\n//# sourceURL=webpack://seeso/./node_modules/axios/lib/helpers/bind.js?");

/***/ }),

/***/ "./node_modules/axios/lib/helpers/buildURL.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/buildURL.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nvar utils = __webpack_require__(/*! ./../utils */ \"./node_modules/axios/lib/utils.js\");\n\nfunction encode(val) {\n  return encodeURIComponent(val).\n    replace(/%3A/gi, ':').\n    replace(/%24/g, '$').\n    replace(/%2C/gi, ',').\n    replace(/%20/g, '+').\n    replace(/%5B/gi, '[').\n    replace(/%5D/gi, ']');\n}\n\n/**\n * Build a URL by appending params to the end\n *\n * @param {string} url The base of the url (e.g., http://www.google.com)\n * @param {object} [params] The params to be appended\n * @returns {string} The formatted url\n */\nmodule.exports = function buildURL(url, params, paramsSerializer) {\n  /*eslint no-param-reassign:0*/\n  if (!params) {\n    return url;\n  }\n\n  var serializedParams;\n  if (paramsSerializer) {\n    serializedParams = paramsSerializer(params);\n  } else if (utils.isURLSearchParams(params)) {\n    serializedParams = params.toString();\n  } else {\n    var parts = [];\n\n    utils.forEach(params, function serialize(val, key) {\n      if (val === null || typeof val === 'undefined') {\n        return;\n      }\n\n      if (utils.isArray(val)) {\n        key = key + '[]';\n      } else {\n        val = [val];\n      }\n\n      utils.forEach(val, function parseValue(v) {\n        if (utils.isDate(v)) {\n          v = v.toISOString();\n        } else if (utils.isObject(v)) {\n          v = JSON.stringify(v);\n        }\n        parts.push(encode(key) + '=' + encode(v));\n      });\n    });\n\n    serializedParams = parts.join('&');\n  }\n\n  if (serializedParams) {\n    var hashmarkIndex = url.indexOf('#');\n    if (hashmarkIndex !== -1) {\n      url = url.slice(0, hashmarkIndex);\n    }\n\n    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;\n  }\n\n  return url;\n};\n\n\n//# sourceURL=webpack://seeso/./node_modules/axios/lib/helpers/buildURL.js?");

/***/ }),

/***/ "./node_modules/axios/lib/helpers/combineURLs.js":
/*!*******************************************************!*\
  !*** ./node_modules/axios/lib/helpers/combineURLs.js ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";
eval("\n\n/**\n * Creates a new URL by combining the specified URLs\n *\n * @param {string} baseURL The base URL\n * @param {string} relativeURL The relative URL\n * @returns {string} The combined URL\n */\nmodule.exports = function combineURLs(baseURL, relativeURL) {\n  return relativeURL\n    ? baseURL.replace(/\\/+$/, '') + '/' + relativeURL.replace(/^\\/+/, '')\n    : baseURL;\n};\n\n\n//# sourceURL=webpack://seeso/./node_modules/axios/lib/helpers/combineURLs.js?");

/***/ }),

/***/ "./node_modules/axios/lib/helpers/cookies.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/helpers/cookies.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nvar utils = __webpack_require__(/*! ./../utils */ \"./node_modules/axios/lib/utils.js\");\n\nmodule.exports = (\n  utils.isStandardBrowserEnv() ?\n\n  // Standard browser envs support document.cookie\n    (function standardBrowserEnv() {\n      return {\n        write: function write(name, value, expires, path, domain, secure) {\n          var cookie = [];\n          cookie.push(name + '=' + encodeURIComponent(value));\n\n          if (utils.isNumber(expires)) {\n            cookie.push('expires=' + new Date(expires).toGMTString());\n          }\n\n          if (utils.isString(path)) {\n            cookie.push('path=' + path);\n          }\n\n          if (utils.isString(domain)) {\n            cookie.push('domain=' + domain);\n          }\n\n          if (secure === true) {\n            cookie.push('secure');\n          }\n\n          document.cookie = cookie.join('; ');\n        },\n\n        read: function read(name) {\n          var match = document.cookie.match(new RegExp('(^|;\\\\s*)(' + name + ')=([^;]*)'));\n          return (match ? decodeURIComponent(match[3]) : null);\n        },\n\n        remove: function remove(name) {\n          this.write(name, '', Date.now() - 86400000);\n        }\n      };\n    })() :\n\n  // Non standard browser env (web workers, react-native) lack needed support.\n    (function nonStandardBrowserEnv() {\n      return {\n        write: function write() {},\n        read: function read() { return null; },\n        remove: function remove() {}\n      };\n    })()\n);\n\n\n//# sourceURL=webpack://seeso/./node_modules/axios/lib/helpers/cookies.js?");

/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAbsoluteURL.js":
/*!*********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAbsoluteURL.js ***!
  \*********************************************************/
/***/ ((module) => {

"use strict";
eval("\n\n/**\n * Determines whether the specified URL is absolute\n *\n * @param {string} url The URL to test\n * @returns {boolean} True if the specified URL is absolute, otherwise false\n */\nmodule.exports = function isAbsoluteURL(url) {\n  // A URL is considered absolute if it begins with \"<scheme>://\" or \"//\" (protocol-relative URL).\n  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed\n  // by any combination of letters, digits, plus, period, or hyphen.\n  return /^([a-z][a-z\\d\\+\\-\\.]*:)?\\/\\//i.test(url);\n};\n\n\n//# sourceURL=webpack://seeso/./node_modules/axios/lib/helpers/isAbsoluteURL.js?");

/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAxiosError.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAxiosError.js ***!
  \********************************************************/
/***/ ((module) => {

"use strict";
eval("\n\n/**\n * Determines whether the payload is an error thrown by Axios\n *\n * @param {*} payload The value to test\n * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false\n */\nmodule.exports = function isAxiosError(payload) {\n  return (typeof payload === 'object') && (payload.isAxiosError === true);\n};\n\n\n//# sourceURL=webpack://seeso/./node_modules/axios/lib/helpers/isAxiosError.js?");

/***/ }),

/***/ "./node_modules/axios/lib/helpers/isURLSameOrigin.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isURLSameOrigin.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nvar utils = __webpack_require__(/*! ./../utils */ \"./node_modules/axios/lib/utils.js\");\n\nmodule.exports = (\n  utils.isStandardBrowserEnv() ?\n\n  // Standard browser envs have full support of the APIs needed to test\n  // whether the request URL is of the same origin as current location.\n    (function standardBrowserEnv() {\n      var msie = /(msie|trident)/i.test(navigator.userAgent);\n      var urlParsingNode = document.createElement('a');\n      var originURL;\n\n      /**\n    * Parse a URL to discover it's components\n    *\n    * @param {String} url The URL to be parsed\n    * @returns {Object}\n    */\n      function resolveURL(url) {\n        var href = url;\n\n        if (msie) {\n        // IE needs attribute set twice to normalize properties\n          urlParsingNode.setAttribute('href', href);\n          href = urlParsingNode.href;\n        }\n\n        urlParsingNode.setAttribute('href', href);\n\n        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils\n        return {\n          href: urlParsingNode.href,\n          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',\n          host: urlParsingNode.host,\n          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\\?/, '') : '',\n          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',\n          hostname: urlParsingNode.hostname,\n          port: urlParsingNode.port,\n          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?\n            urlParsingNode.pathname :\n            '/' + urlParsingNode.pathname\n        };\n      }\n\n      originURL = resolveURL(window.location.href);\n\n      /**\n    * Determine if a URL shares the same origin as the current location\n    *\n    * @param {String} requestURL The URL to test\n    * @returns {boolean} True if URL shares the same origin, otherwise false\n    */\n      return function isURLSameOrigin(requestURL) {\n        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;\n        return (parsed.protocol === originURL.protocol &&\n            parsed.host === originURL.host);\n      };\n    })() :\n\n  // Non standard browser envs (web workers, react-native) lack needed support.\n    (function nonStandardBrowserEnv() {\n      return function isURLSameOrigin() {\n        return true;\n      };\n    })()\n);\n\n\n//# sourceURL=webpack://seeso/./node_modules/axios/lib/helpers/isURLSameOrigin.js?");

/***/ }),

/***/ "./node_modules/axios/lib/helpers/normalizeHeaderName.js":
/*!***************************************************************!*\
  !*** ./node_modules/axios/lib/helpers/normalizeHeaderName.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nvar utils = __webpack_require__(/*! ../utils */ \"./node_modules/axios/lib/utils.js\");\n\nmodule.exports = function normalizeHeaderName(headers, normalizedName) {\n  utils.forEach(headers, function processHeader(value, name) {\n    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {\n      headers[normalizedName] = value;\n      delete headers[name];\n    }\n  });\n};\n\n\n//# sourceURL=webpack://seeso/./node_modules/axios/lib/helpers/normalizeHeaderName.js?");

/***/ }),

/***/ "./node_modules/axios/lib/helpers/parseHeaders.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/parseHeaders.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nvar utils = __webpack_require__(/*! ./../utils */ \"./node_modules/axios/lib/utils.js\");\n\n// Headers whose duplicates are ignored by node\n// c.f. https://nodejs.org/api/http.html#http_message_headers\nvar ignoreDuplicateOf = [\n  'age', 'authorization', 'content-length', 'content-type', 'etag',\n  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',\n  'last-modified', 'location', 'max-forwards', 'proxy-authorization',\n  'referer', 'retry-after', 'user-agent'\n];\n\n/**\n * Parse headers into an object\n *\n * ```\n * Date: Wed, 27 Aug 2014 08:58:49 GMT\n * Content-Type: application/json\n * Connection: keep-alive\n * Transfer-Encoding: chunked\n * ```\n *\n * @param {String} headers Headers needing to be parsed\n * @returns {Object} Headers parsed into an object\n */\nmodule.exports = function parseHeaders(headers) {\n  var parsed = {};\n  var key;\n  var val;\n  var i;\n\n  if (!headers) { return parsed; }\n\n  utils.forEach(headers.split('\\n'), function parser(line) {\n    i = line.indexOf(':');\n    key = utils.trim(line.substr(0, i)).toLowerCase();\n    val = utils.trim(line.substr(i + 1));\n\n    if (key) {\n      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {\n        return;\n      }\n      if (key === 'set-cookie') {\n        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);\n      } else {\n        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;\n      }\n    }\n  });\n\n  return parsed;\n};\n\n\n//# sourceURL=webpack://seeso/./node_modules/axios/lib/helpers/parseHeaders.js?");

/***/ }),

/***/ "./node_modules/axios/lib/helpers/spread.js":
/*!**************************************************!*\
  !*** ./node_modules/axios/lib/helpers/spread.js ***!
  \**************************************************/
/***/ ((module) => {

"use strict";
eval("\n\n/**\n * Syntactic sugar for invoking a function and expanding an array for arguments.\n *\n * Common use case would be to use `Function.prototype.apply`.\n *\n *  ```js\n *  function f(x, y, z) {}\n *  var args = [1, 2, 3];\n *  f.apply(null, args);\n *  ```\n *\n * With `spread` this example can be re-written.\n *\n *  ```js\n *  spread(function(x, y, z) {})([1, 2, 3]);\n *  ```\n *\n * @param {Function} callback\n * @returns {Function}\n */\nmodule.exports = function spread(callback) {\n  return function wrap(arr) {\n    return callback.apply(null, arr);\n  };\n};\n\n\n//# sourceURL=webpack://seeso/./node_modules/axios/lib/helpers/spread.js?");

/***/ }),

/***/ "./node_modules/axios/lib/utils.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/utils.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nvar bind = __webpack_require__(/*! ./helpers/bind */ \"./node_modules/axios/lib/helpers/bind.js\");\n\n/*global toString:true*/\n\n// utils is a library of generic helper functions non-specific to axios\n\nvar toString = Object.prototype.toString;\n\n/**\n * Determine if a value is an Array\n *\n * @param {Object} val The value to test\n * @returns {boolean} True if value is an Array, otherwise false\n */\nfunction isArray(val) {\n  return toString.call(val) === '[object Array]';\n}\n\n/**\n * Determine if a value is undefined\n *\n * @param {Object} val The value to test\n * @returns {boolean} True if the value is undefined, otherwise false\n */\nfunction isUndefined(val) {\n  return typeof val === 'undefined';\n}\n\n/**\n * Determine if a value is a Buffer\n *\n * @param {Object} val The value to test\n * @returns {boolean} True if value is a Buffer, otherwise false\n */\nfunction isBuffer(val) {\n  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)\n    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);\n}\n\n/**\n * Determine if a value is an ArrayBuffer\n *\n * @param {Object} val The value to test\n * @returns {boolean} True if value is an ArrayBuffer, otherwise false\n */\nfunction isArrayBuffer(val) {\n  return toString.call(val) === '[object ArrayBuffer]';\n}\n\n/**\n * Determine if a value is a FormData\n *\n * @param {Object} val The value to test\n * @returns {boolean} True if value is an FormData, otherwise false\n */\nfunction isFormData(val) {\n  return (typeof FormData !== 'undefined') && (val instanceof FormData);\n}\n\n/**\n * Determine if a value is a view on an ArrayBuffer\n *\n * @param {Object} val The value to test\n * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false\n */\nfunction isArrayBufferView(val) {\n  var result;\n  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {\n    result = ArrayBuffer.isView(val);\n  } else {\n    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);\n  }\n  return result;\n}\n\n/**\n * Determine if a value is a String\n *\n * @param {Object} val The value to test\n * @returns {boolean} True if value is a String, otherwise false\n */\nfunction isString(val) {\n  return typeof val === 'string';\n}\n\n/**\n * Determine if a value is a Number\n *\n * @param {Object} val The value to test\n * @returns {boolean} True if value is a Number, otherwise false\n */\nfunction isNumber(val) {\n  return typeof val === 'number';\n}\n\n/**\n * Determine if a value is an Object\n *\n * @param {Object} val The value to test\n * @returns {boolean} True if value is an Object, otherwise false\n */\nfunction isObject(val) {\n  return val !== null && typeof val === 'object';\n}\n\n/**\n * Determine if a value is a plain Object\n *\n * @param {Object} val The value to test\n * @return {boolean} True if value is a plain Object, otherwise false\n */\nfunction isPlainObject(val) {\n  if (toString.call(val) !== '[object Object]') {\n    return false;\n  }\n\n  var prototype = Object.getPrototypeOf(val);\n  return prototype === null || prototype === Object.prototype;\n}\n\n/**\n * Determine if a value is a Date\n *\n * @param {Object} val The value to test\n * @returns {boolean} True if value is a Date, otherwise false\n */\nfunction isDate(val) {\n  return toString.call(val) === '[object Date]';\n}\n\n/**\n * Determine if a value is a File\n *\n * @param {Object} val The value to test\n * @returns {boolean} True if value is a File, otherwise false\n */\nfunction isFile(val) {\n  return toString.call(val) === '[object File]';\n}\n\n/**\n * Determine if a value is a Blob\n *\n * @param {Object} val The value to test\n * @returns {boolean} True if value is a Blob, otherwise false\n */\nfunction isBlob(val) {\n  return toString.call(val) === '[object Blob]';\n}\n\n/**\n * Determine if a value is a Function\n *\n * @param {Object} val The value to test\n * @returns {boolean} True if value is a Function, otherwise false\n */\nfunction isFunction(val) {\n  return toString.call(val) === '[object Function]';\n}\n\n/**\n * Determine if a value is a Stream\n *\n * @param {Object} val The value to test\n * @returns {boolean} True if value is a Stream, otherwise false\n */\nfunction isStream(val) {\n  return isObject(val) && isFunction(val.pipe);\n}\n\n/**\n * Determine if a value is a URLSearchParams object\n *\n * @param {Object} val The value to test\n * @returns {boolean} True if value is a URLSearchParams object, otherwise false\n */\nfunction isURLSearchParams(val) {\n  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;\n}\n\n/**\n * Trim excess whitespace off the beginning and end of a string\n *\n * @param {String} str The String to trim\n * @returns {String} The String freed of excess whitespace\n */\nfunction trim(str) {\n  return str.replace(/^\\s*/, '').replace(/\\s*$/, '');\n}\n\n/**\n * Determine if we're running in a standard browser environment\n *\n * This allows axios to run in a web worker, and react-native.\n * Both environments support XMLHttpRequest, but not fully standard globals.\n *\n * web workers:\n *  typeof window -> undefined\n *  typeof document -> undefined\n *\n * react-native:\n *  navigator.product -> 'ReactNative'\n * nativescript\n *  navigator.product -> 'NativeScript' or 'NS'\n */\nfunction isStandardBrowserEnv() {\n  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||\n                                           navigator.product === 'NativeScript' ||\n                                           navigator.product === 'NS')) {\n    return false;\n  }\n  return (\n    typeof window !== 'undefined' &&\n    typeof document !== 'undefined'\n  );\n}\n\n/**\n * Iterate over an Array or an Object invoking a function for each item.\n *\n * If `obj` is an Array callback will be called passing\n * the value, index, and complete array for each item.\n *\n * If 'obj' is an Object callback will be called passing\n * the value, key, and complete object for each property.\n *\n * @param {Object|Array} obj The object to iterate\n * @param {Function} fn The callback to invoke for each item\n */\nfunction forEach(obj, fn) {\n  // Don't bother if no value provided\n  if (obj === null || typeof obj === 'undefined') {\n    return;\n  }\n\n  // Force an array if not already something iterable\n  if (typeof obj !== 'object') {\n    /*eslint no-param-reassign:0*/\n    obj = [obj];\n  }\n\n  if (isArray(obj)) {\n    // Iterate over array values\n    for (var i = 0, l = obj.length; i < l; i++) {\n      fn.call(null, obj[i], i, obj);\n    }\n  } else {\n    // Iterate over object keys\n    for (var key in obj) {\n      if (Object.prototype.hasOwnProperty.call(obj, key)) {\n        fn.call(null, obj[key], key, obj);\n      }\n    }\n  }\n}\n\n/**\n * Accepts varargs expecting each argument to be an object, then\n * immutably merges the properties of each object and returns result.\n *\n * When multiple objects contain the same key the later object in\n * the arguments list will take precedence.\n *\n * Example:\n *\n * ```js\n * var result = merge({foo: 123}, {foo: 456});\n * console.log(result.foo); // outputs 456\n * ```\n *\n * @param {Object} obj1 Object to merge\n * @returns {Object} Result of all merge properties\n */\nfunction merge(/* obj1, obj2, obj3, ... */) {\n  var result = {};\n  function assignValue(val, key) {\n    if (isPlainObject(result[key]) && isPlainObject(val)) {\n      result[key] = merge(result[key], val);\n    } else if (isPlainObject(val)) {\n      result[key] = merge({}, val);\n    } else if (isArray(val)) {\n      result[key] = val.slice();\n    } else {\n      result[key] = val;\n    }\n  }\n\n  for (var i = 0, l = arguments.length; i < l; i++) {\n    forEach(arguments[i], assignValue);\n  }\n  return result;\n}\n\n/**\n * Extends object a by mutably adding to it the properties of object b.\n *\n * @param {Object} a The object to be extended\n * @param {Object} b The object to copy properties from\n * @param {Object} thisArg The object to bind function to\n * @return {Object} The resulting value of object a\n */\nfunction extend(a, b, thisArg) {\n  forEach(b, function assignValue(val, key) {\n    if (thisArg && typeof val === 'function') {\n      a[key] = bind(val, thisArg);\n    } else {\n      a[key] = val;\n    }\n  });\n  return a;\n}\n\n/**\n * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)\n *\n * @param {string} content with BOM\n * @return {string} content value without BOM\n */\nfunction stripBOM(content) {\n  if (content.charCodeAt(0) === 0xFEFF) {\n    content = content.slice(1);\n  }\n  return content;\n}\n\nmodule.exports = {\n  isArray: isArray,\n  isArrayBuffer: isArrayBuffer,\n  isBuffer: isBuffer,\n  isFormData: isFormData,\n  isArrayBufferView: isArrayBufferView,\n  isString: isString,\n  isNumber: isNumber,\n  isObject: isObject,\n  isPlainObject: isPlainObject,\n  isUndefined: isUndefined,\n  isDate: isDate,\n  isFile: isFile,\n  isBlob: isBlob,\n  isFunction: isFunction,\n  isStream: isStream,\n  isURLSearchParams: isURLSearchParams,\n  isStandardBrowserEnv: isStandardBrowserEnv,\n  forEach: forEach,\n  merge: merge,\n  extend: extend,\n  trim: trim,\n  stripBOM: stripBOM\n};\n\n\n//# sourceURL=webpack://seeso/./node_modules/axios/lib/utils.js?");

/***/ }),

/***/ "./lib/polyfil/ImageCapture-polyfil.js":
/*!*********************************************!*\
  !*** ./lib/polyfil/ImageCapture-polyfil.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"ImageCapture\": () => (/* binding */ ImageCapture)\n/* harmony export */ });\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\n/* eslint-disable */\n\n/**\n * MediaStream ImageCapture polyfill\n *\n * @license\n * Copyright 2018 Google Inc.\n *\n * Licensed under the Apache License, Version 2.0 (the \"License\");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n *      http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an \"AS IS\" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n */\nvar ImageCapture = window.ImageCapture;\n\nif (typeof ImageCapture === 'undefined') {\n  ImageCapture = /*#__PURE__*/function () {\n    /**\n     * TODO https://www.w3.org/TR/image-capture/#constructors\n     *\n     * @param {MediaStreamTrack} videoStreamTrack - A MediaStreamTrack of the 'video' kind\n     */\n    function ImageCapture(videoStreamTrack) {\n      var _this = this;\n\n      _classCallCheck(this, ImageCapture);\n\n      if (videoStreamTrack.kind !== 'video') throw new DOMException('NotSupportedError');\n      this._videoStreamTrack = videoStreamTrack;\n\n      if (!('readyState' in this._videoStreamTrack)) {\n        // Polyfill for Firefox\n        this._videoStreamTrack.readyState = 'live';\n      } // MediaStream constructor not available until Chrome 55 - https://www.chromestatus.com/feature/5912172546752512\n\n\n      this._previewStream = new MediaStream([videoStreamTrack]);\n      this.videoElement = document.createElement('video');\n      this.videoElementPlaying = new Promise(function (resolve) {\n        _this.videoElement.addEventListener('playing', resolve);\n      });\n\n      if (HTMLMediaElement) {\n        this.videoElement.srcObject = this._previewStream; // Safari 11 doesn't allow use of createObjectURL for MediaStream\n      } else {\n        this.videoElement.src = URL.createObjectURL(this._previewStream);\n      }\n\n      this.videoElement.muted = true;\n      this.videoElement.setAttribute('playsinline', ''); // Required by Safari on iOS 11. See https://webkit.org/blog/6784\n\n      this.videoElement.play();\n      this.canvasElement = document.createElement('canvas'); // TODO Firefox has https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas\n\n      this.canvas2dContext = this.canvasElement.getContext('2d');\n    }\n    /**\n     * https://w3c.github.io/mediacapture-image/index.html#dom-imagecapture-videostreamtrack\n     * @return {MediaStreamTrack} The MediaStreamTrack passed into the constructor\n     */\n\n\n    _createClass(ImageCapture, [{\n      key: \"videoStreamTrack\",\n      get: function get() {\n        return this._videoStreamTrack;\n      }\n      /**\n       * Implements https://www.w3.org/TR/image-capture/#dom-imagecapture-getphotocapabilities\n       * @return {Promise<PhotoCapabilities>} Fulfilled promise with\n       * [PhotoCapabilities](https://www.w3.org/TR/image-capture/#idl-def-photocapabilities)\n       * object on success, rejected promise on failure\n       */\n\n    }, {\n      key: \"getPhotoCapabilities\",\n      value: function getPhotoCapabilities() {\n        return new Promise(function executorGPC(resolve, reject) {\n          // TODO see https://github.com/w3c/mediacapture-image/issues/97\n          var MediaSettingsRange = {\n            current: 0,\n            min: 0,\n            max: 0\n          };\n          resolve({\n            exposureCompensation: MediaSettingsRange,\n            exposureMode: 'none',\n            fillLightMode: 'none',\n            focusMode: 'none',\n            imageHeight: MediaSettingsRange,\n            imageWidth: MediaSettingsRange,\n            iso: MediaSettingsRange,\n            redEyeReduction: false,\n            whiteBalanceMode: 'none',\n            zoom: MediaSettingsRange\n          });\n          reject(new DOMException('OperationError'));\n        });\n      }\n      /**\n       * Implements https://www.w3.org/TR/image-capture/#dom-imagecapture-setoptions\n       * @param {Object} photoSettings - Photo settings dictionary, https://www.w3.org/TR/image-capture/#idl-def-photosettings\n       * @return {Promise<void>} Fulfilled promise on success, rejected promise on failure\n       */\n\n    }, {\n      key: \"setOptions\",\n      value: function setOptions() {\n        var photoSettings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};\n        return new Promise(function executorSO(resolve, reject) {// TODO\n        });\n      }\n      /**\n       * TODO\n       * Implements https://www.w3.org/TR/image-capture/#dom-imagecapture-takephoto\n       * @return {Promise<Blob>} Fulfilled promise with [Blob](https://www.w3.org/TR/FileAPI/#blob)\n       * argument on success; rejected promise on failure\n       */\n\n    }, {\n      key: \"takePhoto\",\n      value: function takePhoto() {\n        var self = this;\n        return new Promise(function executorTP(resolve, reject) {\n          // `If the readyState of the MediaStreamTrack provided in the constructor is not live,\n          // return a promise rejected with a new DOMException whose name is \"InvalidStateError\".`\n          if (self._videoStreamTrack.readyState !== 'live') {\n            return reject(new DOMException('InvalidStateError'));\n          }\n\n          self.videoElementPlaying.then(function () {\n            try {\n              self.canvasElement.width = self.videoElement.videoWidth;\n              self.canvasElement.height = self.videoElement.videoHeight;\n              self.canvas2dContext.drawImage(self.videoElement, 0, 0);\n              self.canvasElement.toBlob(resolve);\n            } catch (error) {\n              reject(new DOMException('UnknownError'));\n            }\n          });\n        });\n      }\n      /**\n       * Implements https://www.w3.org/TR/image-capture/#dom-imagecapture-grabframe\n       * @return {Promise<ImageBitmap>} Fulfilled promise with\n       * [ImageBitmap](https://www.w3.org/TR/html51/webappapis.html#webappapis-images)\n       * argument on success; rejected promise on failure\n       */\n\n    }, {\n      key: \"grabFrame\",\n      value: function grabFrame() {\n        var self = this;\n        return new Promise(function executorGF(resolve, reject) {\n          // `If the readyState of the MediaStreamTrack provided in the constructor is not live,\n          // return a promise rejected with a new DOMException whose name is \"InvalidStateError\".`\n          if (self._videoStreamTrack.readyState !== 'live') {\n            return reject(new DOMException('InvalidStateError'));\n          }\n\n          self.videoElementPlaying.then(function () {\n            try {\n              self.canvasElement.width = self.videoElement.videoWidth;\n              self.canvasElement.height = self.videoElement.videoHeight;\n              self.canvas2dContext.drawImage(self.videoElement, 0, 0); // TODO polyfill https://developer.mozilla.org/en-US/docs/Web/API/ImageBitmapFactories/createImageBitmap for IE\n\n              resolve(window.createImageBitmap(self.canvasElement));\n            } catch (error) {\n              reject(new DOMException('UnknownError'));\n            }\n          });\n        });\n      }\n    }]);\n\n    return ImageCapture;\n  }();\n}\n\nwindow.ImageCapture = ImageCapture;\n\n//# sourceURL=webpack://seeso/./lib/polyfil/ImageCapture-polyfil.js?");

/***/ }),

/***/ "./lib/seeso.js":
/*!**********************!*\
  !*** ./lib/seeso.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"InitializationErrorType\": () => (/* reexport safe */ _type_error_type__WEBPACK_IMPORTED_MODULE_3__.InitializationErrorType),\n/* harmony export */   \"CalibrationAccuracyCriteria\": () => (/* reexport safe */ _type_calibration_accuracy_type__WEBPACK_IMPORTED_MODULE_5__.CalibrationAccuracyCriteria),\n/* harmony export */   \"TrackingState\": () => (/* reexport safe */ _type_gaze_info__WEBPACK_IMPORTED_MODULE_2__.TrackingState),\n/* harmony export */   \"EyeMovementState\": () => (/* reexport safe */ _type_gaze_info__WEBPACK_IMPORTED_MODULE_2__.EyeMovementState),\n/* harmony export */   \"CalibrationData\": () => (/* reexport safe */ _type_calibration_data__WEBPACK_IMPORTED_MODULE_6__.CalibrationData),\n/* harmony export */   \"UserStatusOption\": () => (/* reexport safe */ _type_user_status_option__WEBPACK_IMPORTED_MODULE_12__.default),\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _setting__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./setting */ \"./lib/setting/index.js\");\n/* harmony import */ var _polyfil_ImageCapture_polyfil__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./polyfil/ImageCapture-polyfil */ \"./lib/polyfil/ImageCapture-polyfil.js\");\n/* harmony import */ var _type_gaze_info__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./type/gaze-info */ \"./lib/type/gaze-info.js\");\n/* harmony import */ var _type_error_type__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./type/error-type */ \"./lib/type/error-type.js\");\n/* harmony import */ var _type_color_format__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./type/color-format */ \"./lib/type/color-format.js\");\n/* harmony import */ var _type_calibration_accuracy_type__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./type/calibration-accuracy-type */ \"./lib/type/calibration-accuracy-type.js\");\n/* harmony import */ var _type_calibration_data__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./type/calibration-data */ \"./lib/type/calibration-data.js\");\n/* harmony import */ var _utils_InstantThread__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./utils/InstantThread */ \"./lib/utils/InstantThread.js\");\n/* harmony import */ var wasm_check__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! wasm-check */ \"./node_modules/wasm-check/dist/wasm-check.min.js\");\n/* harmony import */ var wasm_check__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(wasm_check__WEBPACK_IMPORTED_MODULE_13__);\n/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! axios */ \"./node_modules/axios/index.js\");\n/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_8__);\n/* harmony import */ var _utils_MonitorSizeConverter__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./utils/MonitorSizeConverter */ \"./lib/utils/MonitorSizeConverter.js\");\n/* harmony import */ var _utils_make_url__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./utils/make-url */ \"./lib/utils/make-url.js\");\n/* harmony import */ var buffer__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! buffer */ \"./node_modules/buffer/index.js\");\n/* harmony import */ var _type_user_status_option__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./type/user-status-option */ \"./lib/type/user-status-option.js\");\nfunction _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }\n\nfunction _nonIterableRest() { throw new TypeError(\"Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.\"); }\n\nfunction _iterableToArrayLimit(arr, i) { if (typeof Symbol === \"undefined\" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i[\"return\"] != null) _i[\"return\"](); } finally { if (_d) throw _e; } } return _arr; }\n\nfunction _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }\n\nfunction _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === \"undefined\" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === \"number\") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError(\"Invalid attempt to iterate non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.\"); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it[\"return\"] != null) it[\"return\"](); } finally { if (didErr) throw err; } } }; }\n\nfunction _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === \"string\") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === \"Object\" && o.constructor) n = o.constructor.name; if (n === \"Map\" || n === \"Set\") return Array.from(o); if (n === \"Arguments\" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }\n\nfunction _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }\n\nfunction asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }\n\nfunction _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, \"next\", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, \"throw\", err); } _next(undefined); }); }; }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\n/* eslint-disable */\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nvar Seeso = /*#__PURE__*/function () {\n  function Seeso() {\n    _classCallCheck(this, Seeso);\n\n    if (Seeso.gaze) {\n      return Seeso.gaze;\n    }\n\n    Seeso.gaze = this;\n    this.statusOptionPtr = null;\n    this.userStatusOption = null;\n    this.thread = null;\n    this.debugThread = null;\n    this.initialized = false;\n    this.widthMm = 330;\n    this.heightMm = 210;\n    this.monitorInch = _utils_MonitorSizeConverter__WEBPACK_IMPORTED_MODULE_9__.default.sizeMMtoInch(this.widthMm, this.heightMm);\n    this.faceDistance = 50;\n    this.cameraX = window.outerWidth / 2;\n    this.isCameraOnTop = true;\n    this.trackerModule = null;\n    this.cameraTopMm = 10; // debug\n\n    this.latencyList = [];\n    this.befTime = -1;\n    this.initCallbacks = [];\n    this.debugCallbacks = [];\n    this.gazeCallbacks = [];\n    this.calibrationFinishCallbacks = [];\n    this.calibrationNextPointCallbacks = [];\n    this.calibrationProgressCallbacks = [];\n    this.attentionCallbacks = [];\n    this.blinkCallbacks = [];\n    this.drowsinessCallbacks = [];\n    this.addFunctions = [];\n    this.eyeTracker = null;\n    this.errCode = _type_error_type__WEBPACK_IMPORTED_MODULE_3__.InitializationErrorType.ERROR_INIT;\n    this.licenseKey = null;\n    this.calibrationData = null;\n  } //// Lifecycle functions\n\n  /**  */\n\n\n  _createClass(Seeso, [{\n    key: \"initialize\",\n    value: function () {\n      var _initialize = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(licenseKey, userStatusOption) {\n        var optionList;\n        return regeneratorRuntime.wrap(function _callee$(_context) {\n          while (1) {\n            switch (_context.prev = _context.next) {\n              case 0:\n                optionList = undefined;\n\n                if (userStatusOption) {\n                  this.userStatusOption = userStatusOption;\n                  optionList = userStatusOption.getUserStatusOptions();\n                }\n\n                if (licenseKey) {\n                  _context.next = 4;\n                  break;\n                }\n\n                return _context.abrupt(\"return\");\n\n              case 4:\n                _context.prev = 4;\n                _context.next = 7;\n                return this.initWasm_();\n\n              case 7:\n                if (!_context.sent) {\n                  _context.next = 10;\n                  break;\n                }\n\n                _context.next = 10;\n                return this.initEyeTracker_(licenseKey, optionList);\n\n              case 10:\n                this.licenseKey = licenseKey;\n\n                if (this.errCode === _type_error_type__WEBPACK_IMPORTED_MODULE_3__.InitializationErrorType.ERROR_NONE) {\n                  this.initialized = true;\n                } else {\n                  this.deinitialize();\n                }\n\n                return _context.abrupt(\"return\", this.errCode);\n\n              case 15:\n                _context.prev = 15;\n                _context.t0 = _context[\"catch\"](4);\n                console.log(_context.t0);\n                this.releaseStreamTrack_();\n                return _context.abrupt(\"return\", this.errCode);\n\n              case 20:\n              case \"end\":\n                return _context.stop();\n            }\n          }\n        }, _callee, this, [[4, 15]]);\n      }));\n\n      function initialize(_x2, _x3) {\n        return _initialize.apply(this, arguments);\n      }\n\n      return initialize;\n    }()\n  }, {\n    key: \"deinitialize\",\n    value: function () {\n      var _deinitialize = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {\n        var _this = this;\n\n        return regeneratorRuntime.wrap(function _callee2$(_context2) {\n          while (1) {\n            switch (_context2.prev = _context2.next) {\n              case 0:\n                this.userStatusOption = null;\n                this.imageCapture = null;\n                this.stopTracking();\n                setTimeout(function () {\n                  if (_this.trackerModule) {\n                    if (_this.eyeTracker) {\n                      var isDeinit = _this.trackerModule.ccall('deinitEyeTracker', 'boolean', ['number'], [_this.eyeTracker]);\n\n                      console.log('eyeTracker deinit ' + isDeinit);\n                      _this.eyeTracker = null;\n                    }\n\n                    var _iterator = _createForOfIteratorHelper(_this.addFunctions),\n                        _step;\n\n                    try {\n                      for (_iterator.s(); !(_step = _iterator.n()).done;) {\n                        var fn = _step.value;\n\n                        _this.trackerModule.removeFunction(fn);\n                      }\n                    } catch (err) {\n                      _iterator.e(err);\n                    } finally {\n                      _iterator.f();\n                    }\n\n                    _this.addFunctions = [];\n                  }\n                }, 1000);\n\n              case 4:\n              case \"end\":\n                return _context2.stop();\n            }\n          }\n        }, _callee2, this);\n      }));\n\n      function deinitialize() {\n        return _deinitialize.apply(this, arguments);\n      }\n\n      return deinitialize;\n    }()\n  }, {\n    key: \"getCameraPosition\",\n    value: function getCameraPosition() {\n      if (!this.trackerModule || !this.eyeTracker) {\n        return undefined;\n      }\n\n      return {\n        isCameraOnTop: this.isCameraOnTop,\n        cameraX: this.cameraX\n      };\n    }\n  }, {\n    key: \"setCameraPosition\",\n    value: function setCameraPosition(cameraX, isCameraOnTop) {\n      this.cameraX = cameraX;\n      this.isCameraOnTop = isCameraOnTop;\n    }\n  }, {\n    key: \"getFaceDistance\",\n    value: function getFaceDistance() {\n      return this.faceDistance / 10;\n    }\n  }, {\n    key: \"setFaceDistance\",\n    value: function setFaceDistance(faceDistance) {\n      this.faceDistance = parseFloat(faceDistance) * 10;\n\n      if (!this.trackerModule || !this.eyeTracker) {\n        return;\n      }\n\n      this.trackerModule.ccall('setCameraDistanceZ', null, ['number', 'number'], [this.eyeTracker, this.faceDistance]);\n    }\n  }, {\n    key: \"getMonitorSize\",\n    value: function getMonitorSize() {\n      if (!this.trackerModule || !this.eyeTracker) {\n        return undefined;\n      }\n\n      return this.monitorInch;\n    }\n  }, {\n    key: \"setMonitorSize\",\n    value: function setMonitorSize(monitorInch) {\n      if (monitorInch) {\n        this.monitorInch = monitorInch;\n\n        var _MonitorSizeConveter$ = _utils_MonitorSizeConverter__WEBPACK_IMPORTED_MODULE_9__.default.inchToSizeMM(monitorInch),\n            width = _MonitorSizeConveter$.width,\n            height = _MonitorSizeConveter$.height;\n\n        this.widthMm = width;\n        this.heightMm = height;\n      }\n    }\n  }, {\n    key: \"setTrackingFps\",\n    value: function setTrackingFps(fps) {\n      if (!this.trackerModule || !this.eyeTracker) {\n        return;\n      }\n\n      this.trackerModule.ccall('setTrackingFps', null, ['number', 'number'], [this.eyeTracker, fps]);\n    }\n  }, {\n    key: \"addGazeCallback\",\n    value: function addGazeCallback(callback) {\n      if (this.gazeCallbacks.indexOf(callback) === -1) {\n        this.gazeCallbacks.push(callback);\n      }\n    }\n  }, {\n    key: \"removeGazeCallback\",\n    value: function removeGazeCallback(callback) {\n      this.removeCallbackFunc_(callback, this.gazeCallbacks);\n    }\n  }, {\n    key: \"addDebugCallback\",\n    value: function addDebugCallback(callback) {\n      if (this.debugCallbacks.indexOf(callback) === -1) {\n        this.debugCallbacks.push(callback);\n      }\n    }\n  }, {\n    key: \"removeDebugCallback\",\n    value: function removeDebugCallback(callback) {\n      this.removeCallbackFunc_(callback, this.debugCallbacks);\n    }\n  }, {\n    key: \"addAttentionCallback\",\n    value: function addAttentionCallback(callback) {\n      if (this.attentionCallbacks.indexOf(callback) === -1) {\n        this.attentionCallbacks.push(callback);\n      }\n    }\n  }, {\n    key: \"removeAttentionCallback\",\n    value: function removeAttentionCallback(callback) {\n      this.removeCallbackFunc_(callback, this.attentionCallbacks);\n    }\n  }, {\n    key: \"addBlinkCallback\",\n    value: function addBlinkCallback(callback) {\n      if (this.blinkCallbacks.indexOf(callback) === -1) {\n        this.blinkCallbacks.push(callback);\n      }\n    }\n  }, {\n    key: \"removeBlinkCallback\",\n    value: function removeBlinkCallback(callback) {\n      this.removeCallbackFunc_(callback, this.blinkCallbacks);\n    }\n  }, {\n    key: \"addDrowsinessCallback\",\n    value: function addDrowsinessCallback(callback) {\n      if (this.drowsinessCallbacks.indexOf(callback) === -1) {\n        this.drowsinessCallbacks.push(callback);\n      }\n    }\n  }, {\n    key: \"removeDrowsinessCallback\",\n    value: function removeDrowsinessCallback(callback) {\n      this.removeCallbackFunc_(callback, this.drowsinessCallbacks);\n    }\n  }, {\n    key: \"addCalibrationNextPointCallback\",\n    value: function addCalibrationNextPointCallback(callback) {\n      if (this.calibrationNextPointCallbacks.indexOf(callback) === -1) {\n        this.calibrationNextPointCallbacks.push(callback);\n      }\n    }\n  }, {\n    key: \"removeCalibrationNextPointCallback\",\n    value: function removeCalibrationNextPointCallback(callback) {\n      this.removeCallbackFunc_(callback, this.calibrationNextPointCallbacks);\n    }\n  }, {\n    key: \"addCalibrationProgressCallback\",\n    value: function addCalibrationProgressCallback(callback) {\n      if (this.calibrationProgressCallbacks.indexOf(callback) === -1) {\n        this.calibrationProgressCallbacks.push(callback);\n      }\n    }\n  }, {\n    key: \"removeCalibrationProgressCallback\",\n    value: function removeCalibrationProgressCallback(callback) {\n      this.removeCallbackFunc_(callback, this.calibrationProgressCallbacks);\n    }\n  }, {\n    key: \"addCalibrationFinishCallback\",\n    value: function addCalibrationFinishCallback(callback) {\n      if (this.calibrationFinishCallbacks.indexOf(callback) === -1) {\n        this.calibrationFinishCallbacks.push(callback);\n      }\n    }\n  }, {\n    key: \"removeCalibrationFinishCallback\",\n    value: function removeCalibrationFinishCallback(callback) {\n      this.removeCallbackFunc_(callback, this.calibrationFinishCallbacks);\n    }\n    /** @private */\n\n  }, {\n    key: \"removeCallbackFunc_\",\n    value: function removeCallbackFunc_(callback, callbacklist) {\n      var index = callbacklist.indexOf(callback);\n\n      if (index !== -1) {\n        callbacklist.splice(index, 1);\n      }\n    }\n  }, {\n    key: \"fetchCalibrationData\",\n    value: function () {\n      var _fetchCalibrationData = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(userId) {\n        var payload, queryString, urlQuery, response, errPayload;\n        return regeneratorRuntime.wrap(function _callee3$(_context3) {\n          while (1) {\n            switch (_context3.prev = _context3.next) {\n              case 0:\n                payload = {\n                  licenseKey: this.licenseKey,\n                  userId: userId,\n                  hostname: window.location.origin\n                };\n                queryString = Object.entries(payload).map(function (e) {\n                  return e.join('=');\n                }).join('&');\n                urlQuery = \"\".concat((0,_setting__WEBPACK_IMPORTED_MODULE_0__.getServerUrl)(), \"?\").concat(queryString);\n                _context3.prev = 3;\n                _context3.next = 6;\n                return axios__WEBPACK_IMPORTED_MODULE_8___default().get(urlQuery);\n\n              case 6:\n                response = _context3.sent;\n                _context3.next = 13;\n                break;\n\n              case 9:\n                _context3.prev = 9;\n                _context3.t0 = _context3[\"catch\"](3);\n                errPayload = _context3.t0.response.data.payload;\n                console.error(errPayload);\n\n              case 13:\n                if (!response.data.header.err) {\n                  _context3.next = 15;\n                  break;\n                }\n\n                return _context3.abrupt(\"return\", '');\n\n              case 15:\n                if (!(response.status === 200)) {\n                  _context3.next = 17;\n                  break;\n                }\n\n                return _context3.abrupt(\"return\", httpRes.data.payload.doc.calibrationData);\n\n              case 17:\n              case \"end\":\n                return _context3.stop();\n            }\n          }\n        }, _callee3, this, [[3, 9]]);\n      }));\n\n      function fetchCalibrationData(_x4) {\n        return _fetchCalibrationData.apply(this, arguments);\n      }\n\n      return fetchCalibrationData;\n    }()\n  }, {\n    key: \"uploadCalibrationData\",\n    value: function () {\n      var _uploadCalibrationData = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(userId) {\n        var reqHeaders, _MonitorSizeConveter$2, width, height, bodyParams, _httpRes, errPayload;\n\n        return regeneratorRuntime.wrap(function _callee4$(_context4) {\n          while (1) {\n            switch (_context4.prev = _context4.next) {\n              case 0:\n                _context4.prev = 0;\n                reqHeaders = {\n                  headers: {\n                    'Content-Type': 'application/json'\n                  },\n                  withCredentials: true\n                };\n                _MonitorSizeConveter$2 = _utils_MonitorSizeConverter__WEBPACK_IMPORTED_MODULE_9__.default.inchToSizeMM(this.calibrationData.monitorInch), width = _MonitorSizeConveter$2.width, height = _MonitorSizeConveter$2.height;\n                bodyParams = {\n                  licenseKey: this.licenseKey,\n                  userId: userId,\n                  hostname: window.location.origin,\n                  calibrationData: this.calibrationData.to_string()\n                };\n                _context4.next = 6;\n                return axios__WEBPACK_IMPORTED_MODULE_8___default().post((0,_setting__WEBPACK_IMPORTED_MODULE_0__.getServerUrl)(), bodyParams, reqHeaders);\n\n              case 6:\n                _httpRes = _context4.sent;\n                return _context4.abrupt(\"return\", _httpRes.status === 200);\n\n              case 10:\n                _context4.prev = 10;\n                _context4.t0 = _context4[\"catch\"](0);\n                errPayload = _context4.t0.response.data.payload;\n                console.error(errPayload);\n                return _context4.abrupt(\"return\", false);\n\n              case 15:\n              case \"end\":\n                return _context4.stop();\n            }\n          }\n        }, _callee4, this, [[0, 10]]);\n      }));\n\n      function uploadCalibrationData(_x5) {\n        return _uploadCalibrationData.apply(this, arguments);\n      }\n\n      return uploadCalibrationData;\n    }()\n  }, {\n    key: \"startTracking\",\n    value: function startTracking(stream) {\n      if (!this.thread) {\n        this.thread = new _utils_InstantThread__WEBPACK_IMPORTED_MODULE_7__.default(_setting__WEBPACK_IMPORTED_MODULE_0__.INTERVAL_TIME_MS);\n      }\n\n      if (!this.debugThread) {\n        this.debugThread = new _utils_InstantThread__WEBPACK_IMPORTED_MODULE_7__.default(_setting__WEBPACK_IMPORTED_MODULE_0__.DEBUG_INTERVAL_TIME_MS);\n      }\n\n      if (!this.trackerModule || !this.eyeTracker || !this.thread || !this.debugThread) {\n        return false;\n      } // this.trackerModule.ccall('startTrackingTimeCheck', null);\n\n\n      if (this.initStreamTrack_(stream) && this.startCameraThread_(this.thread) && this.startDebugThread_(this.debugThread)) {\n        return true;\n      }\n\n      return false;\n    }\n  }, {\n    key: \"stopTracking\",\n    value: function stopTracking() {\n      this.releaseStreamTrack_();\n\n      if (this.thread) {\n        this.thread.release();\n        this.thread = null;\n      }\n\n      if (this.debugThread) {\n        this.debugThread.release();\n        this.debugThread = null;\n      }\n    }\n  }, {\n    key: \"startCalibration\",\n    value: function startCalibration(calibrationPoints, criteria) {\n      if (!this.trackerModule || !this.eyeTracker) {\n        return false;\n      }\n\n      var left = window.screen.width * (1 - _setting__WEBPACK_IMPORTED_MODULE_0__.CALIBRATION_REGION_RATIO) / 2;\n      var right = window.screen.width - left;\n      var top = window.screen.height * (1 - _setting__WEBPACK_IMPORTED_MODULE_0__.CALIBRATION_REGION_RATIO) / 2;\n      var bottom = window.screen.height - top;\n      var lt = this.screen_to_camera_(left, top);\n      var rb = this.screen_to_camera_(right, bottom);\n      var point = 5; // default points\n\n      if (calibrationPoints === 1) {\n        point = 1;\n      }\n\n      this.trackerModule.ccall('startCalibration', null, ['number', 'number', 'number', 'number', 'number', 'number', 'number'], [this.eyeTracker, point, criteria, lt.camera_x, lt.camera_y, rb.camera_x, rb.camera_y]);\n      return true;\n    }\n  }, {\n    key: \"stopCalibration\",\n    value: function stopCalibration() {\n      if (!this.trackerModule || !this.eyeTracker) {\n        return false;\n      }\n\n      return this.trackerModule.ccall('stopCalibration', null, ['number'], [this.eyeTracker]);\n    }\n  }, {\n    key: \"setCalibrationData\",\n    value: function () {\n      var _setCalibrationData = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(calibrationData) {\n        var data;\n        return regeneratorRuntime.wrap(function _callee5$(_context5) {\n          while (1) {\n            switch (_context5.prev = _context5.next) {\n              case 0:\n                data = new _type_calibration_data__WEBPACK_IMPORTED_MODULE_6__.CalibrationData(calibrationData);\n\n                if (!(!this.trackerModule || !this.eyeTracker)) {\n                  _context5.next = 3;\n                  break;\n                }\n\n                return _context5.abrupt(\"return\");\n\n              case 3:\n                this.calibrationData = data;\n                this.setCameraPosition(data.cameraX, data.isCameraOnTop); // this.setFaceDistance(data.faceDistance)\n\n                this.setMonitorSize(data.monitorInch);\n                _context5.next = 8;\n                return this.setCalibrationBase64(data.vector, data.vectorLength);\n\n              case 8:\n              case \"end\":\n                return _context5.stop();\n            }\n          }\n        }, _callee5, this);\n      }));\n\n      function setCalibrationData(_x6) {\n        return _setCalibrationData.apply(this, arguments);\n      }\n\n      return setCalibrationData;\n    }()\n    /**\n     *\n     * @returns {String}\n     */\n\n  }, {\n    key: \"getCalibrationData\",\n    value: function getCalibrationData() {\n      if (!this.calibrationData) return null;\n      return this.calibrationData.to_string();\n    }\n    /**\n     *\n     * @param {string} vector\n     * @param {int} vectorLength\n     * @returns {Promise<void>}\n     */\n\n  }, {\n    key: \"setCalibration\",\n    value: function () {\n      var _setCalibration = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(vector, vectorLength) {\n        return regeneratorRuntime.wrap(function _callee6$(_context6) {\n          while (1) {\n            switch (_context6.prev = _context6.next) {\n              case 0:\n                if (!(!this.trackerModule || !this.eyeTracker)) {\n                  _context6.next = 2;\n                  break;\n                }\n\n                return _context6.abrupt(\"return\", false);\n\n              case 2:\n                _context6.next = 4;\n                return this.trackerModule.ccall('setCalibrationData', null, ['number', 'number', 'number'], [this.eyeTracker, vector, vectorLength]);\n\n              case 4:\n                return _context6.abrupt(\"return\", true);\n\n              case 5:\n              case \"end\":\n                return _context6.stop();\n            }\n          }\n        }, _callee6, this);\n      }));\n\n      function setCalibration(_x7, _x8) {\n        return _setCalibration.apply(this, arguments);\n      }\n\n      return setCalibration;\n    }()\n  }, {\n    key: \"startCollectSamples\",\n    value: function startCollectSamples() {\n      if (!this.trackerModule || !this.eyeTracker) {\n        return;\n      }\n\n      this.trackerModule.ccall('startCollectSamples', null, ['number'], [this.eyeTracker]);\n    }\n  }, {\n    key: \"setAttentionInterval\",\n    value: function setAttentionInterval(interval) {\n      if (!this.trackerModule || !this.eyeTracker) {\n        return;\n      }\n\n      this.trackerModule.ccall('setAttentionInterval', null, ['number', 'number'], [this.eyeTracker, interval]);\n    }\n  }, {\n    key: \"setAttentionRegion\",\n    value: function setAttentionRegion(left, top, right, bottom) {\n      if (!this.trackerModule || !this.eyeTracker) {\n        return;\n      }\n\n      var lt = this.pixel_to_cm_(left, top);\n      var rb = this.pixel_to_cm_(right, bottom);\n      this.trackerModule.ccall('setAttentionRegion', null, ['number', 'number', 'number', 'number', 'number'], [this.eyeTracker, lt.camera_x, lt.camera_y, rb.camera_x, rb.camera_y]);\n    }\n  }, {\n    key: \"getAttentionScore\",\n    value: function getAttentionScore() {\n      if (!this.trackerModule || !this.eyeTracker) {\n        return;\n      }\n\n      return this.trackerModule.ccall('getAttentionScore', 'number', ['number'], [this.eyeTracker]);\n    }\n  }, {\n    key: \"showImage\",\n    value:\n    /**\n     * For debugging, have to remove\n     */\n    function showImage() {\n      this.isShowPreview = true;\n    }\n    /**\n     * For debugging, have to remove\n     */\n\n  }, {\n    key: \"hideImage\",\n    value: function hideImage() {\n      this.isShowPreview = false;\n    } //* @private */\n    // base64로 캘리브레이션 데이터를 받아 설정\n\n  }, {\n    key: \"setCalibrationBase64\",\n    value: function () {\n      var _setCalibrationBase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(vector, length) {\n        var caliDataB64, caliDataPointer, caliDataByteBuffer, caliDataUInt8Arr, isSuccess;\n        return regeneratorRuntime.wrap(function _callee7$(_context7) {\n          while (1) {\n            switch (_context7.prev = _context7.next) {\n              case 0:\n                if (!(!this.trackerModule || !this.eyeTracker)) {\n                  _context7.next = 2;\n                  break;\n                }\n\n                return _context7.abrupt(\"return\");\n\n              case 2:\n                caliDataB64 = vector;\n                caliDataPointer = this.trackerModule.ccall('create_ptr', 'number', ['number'], [length]);\n                caliDataByteBuffer = this.base64ToByteBuffer_(caliDataB64);\n                caliDataUInt8Arr = new Uint8Array(caliDataByteBuffer);\n                this.trackerModule.HEAPU8.set(caliDataUInt8Arr, caliDataPointer);\n                _context7.next = 9;\n                return this.setCalibration(caliDataPointer, length);\n\n              case 9:\n                isSuccess = _context7.sent;\n                return _context7.abrupt(\"return\", isSuccess);\n\n              case 11:\n              case \"end\":\n                return _context7.stop();\n            }\n          }\n        }, _callee7, this);\n      }));\n\n      function setCalibrationBase64(_x9, _x10) {\n        return _setCalibrationBase.apply(this, arguments);\n      }\n\n      return setCalibrationBase64;\n    }()\n    /** @private */\n\n  }, {\n    key: \"initWasm_\",\n    value: function () {\n      var _initWasm_ = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {\n        var _this2 = this;\n\n        var _makeUrl, _makeUrl2, jsUrl, workerUrl, module;\n\n        return regeneratorRuntime.wrap(function _callee8$(_context8) {\n          while (1) {\n            switch (_context8.prev = _context8.next) {\n              case 0:\n                if (this.initialized) {\n                  _context8.next = 16;\n                  break;\n                }\n\n                _context8.next = 3;\n                return this.wasmStatusCheck_();\n\n              case 3:\n                _makeUrl = (0,_utils_make_url__WEBPACK_IMPORTED_MODULE_10__.default)(wasm_check__WEBPACK_IMPORTED_MODULE_13__.feature.simd, wasm_check__WEBPACK_IMPORTED_MODULE_13__.feature.threads), _makeUrl2 = _slicedToArray(_makeUrl, 2), jsUrl = _makeUrl2[0], workerUrl = _makeUrl2[1];\n\n                if (!(typeof jsUrl == 'string' && typeof workerUrl == 'string')) {\n                  _context8.next = 14;\n                  break;\n                }\n\n                _context8.next = 7;\n                return this.loadModuleScript_(jsUrl);\n\n              case 7:\n                _context8.next = 9;\n                return this.makePresetModule_(jsUrl, workerUrl);\n\n              case 9:\n                module = _context8.sent;\n                _context8.next = 12;\n                return createSeeSo(module).then(function (instance) {\n                  _this2.trackerModule = instance;\n                });\n\n              case 12:\n                _context8.next = 16;\n                break;\n\n              case 14:\n                console.warn('WRONG CDN URL!');\n                return _context8.abrupt(\"return\", false);\n\n              case 16:\n                return _context8.abrupt(\"return\", true);\n\n              case 17:\n              case \"end\":\n                return _context8.stop();\n            }\n          }\n        }, _callee8, this);\n      }));\n\n      function initWasm_() {\n        return _initWasm_.apply(this, arguments);\n      }\n\n      return initWasm_;\n    }()\n    /** @private function() */\n\n  }, {\n    key: \"getUserStatusOptionPtr\",\n    value: function getUserStatusOptionPtr(userStatusOptionList) {\n      if (userStatusOptionList.length <= 0) {\n        return undefined;\n      }\n\n      var inArray = new Int32Array(userStatusOptionList);\n      var nByte = inArray.BYTES_PER_ELEMENT;\n      var length = inArray.length;\n\n      var ptr = this.trackerModule._malloc(length * nByte);\n\n      this.trackerModule.HEAP32.set(inArray, ptr / nByte);\n      return ptr;\n    }\n    /** @private */\n\n  }, {\n    key: \"initEyeTracker_\",\n    value: function initEyeTracker_(licenseKey, userStatusOptionList) {\n      if (this.trackerModule && !this.eyeTracker) {\n        var serverUrl = (0,_setting__WEBPACK_IMPORTED_MODULE_0__.getServerUrl)();\n        var initCallback = this.trackerModule.addFunction(this.sendInitCallback_, 'vii');\n        this.addFunctions.push(initCallback);\n\n        if (this.statusOptionPtr) {\n          this.trackerModule._free(this.statusOptionPtr);\n\n          this.statusOptionPtr = null;\n        }\n\n        var statusOptionLength = 0;\n\n        if (userStatusOptionList) {\n          statusOptionLength = userStatusOptionList.length;\n          this.statusOptionPtr = this.getUserStatusOptionPtr(userStatusOptionList);\n        }\n\n        return this.trackerModule.ccall('initEyeTracker', null, ['string', 'number', 'number', 'number', 'number'], [licenseKey, licenseKey.length, initCallback, this.statusOptionPtr, statusOptionLength], {\n          async: true\n        });\n      }\n    }\n    /** @private */\n\n  }, {\n    key: \"wasmStatusCheck_\",\n    value: function () {\n      var _wasmStatusCheck_ = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {\n        return regeneratorRuntime.wrap(function _callee9$(_context9) {\n          while (1) {\n            switch (_context9.prev = _context9.next) {\n              case 0:\n                console.log('SIMD: ' + wasm_check__WEBPACK_IMPORTED_MODULE_13__.feature.simd);\n                console.log('Threads: ' + wasm_check__WEBPACK_IMPORTED_MODULE_13__.feature.threads);\n\n              case 2:\n              case \"end\":\n                return _context9.stop();\n            }\n          }\n        }, _callee9);\n      }));\n\n      function wasmStatusCheck_() {\n        return _wasmStatusCheck_.apply(this, arguments);\n      }\n\n      return wasmStatusCheck_;\n    }()\n    /** @private */\n\n  }, {\n    key: \"loadModuleScript_\",\n    value: function loadModuleScript_(jsUrl) {\n      return new Promise(function (resolve, reject) {\n        var script = document.createElement('script');\n\n        script.onload = function () {\n          resolve();\n        };\n\n        script.onerror = function () {\n          reject();\n        };\n\n        script.async = true;\n        script.src = jsUrl;\n        script.crossOrigin = 'anonymous';\n        document.getElementsByTagName('script')[0].parentNode.appendChild(script);\n      });\n    }\n    /** @private */\n\n  }, {\n    key: \"makePresetModule_\",\n    value: function () {\n      var _makePresetModule_ = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(jsUrl, workerUrl) {\n        var readUrl, _readUrl, doc, worker_doc;\n\n        return regeneratorRuntime.wrap(function _callee11$(_context11) {\n          while (1) {\n            switch (_context11.prev = _context11.next) {\n              case 0:\n                _readUrl = function _readUrl3() {\n                  _readUrl = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(url) {\n                    var workerResponse, workerJS, blob;\n                    return regeneratorRuntime.wrap(function _callee10$(_context10) {\n                      while (1) {\n                        switch (_context10.prev = _context10.next) {\n                          case 0:\n                            _context10.next = 2;\n                            return fetch(url);\n\n                          case 2:\n                            workerResponse = _context10.sent;\n                            _context10.next = 5;\n                            return workerResponse.text();\n\n                          case 5:\n                            workerJS = _context10.sent;\n                            blob = new Blob([workerJS], {\n                              type: 'application/javascript'\n                            });\n                            return _context10.abrupt(\"return\", URL.createObjectURL(blob));\n\n                          case 8:\n                          case \"end\":\n                            return _context10.stop();\n                        }\n                      }\n                    }, _callee10);\n                  }));\n                  return _readUrl.apply(this, arguments);\n                };\n\n                readUrl = function _readUrl2(_x13) {\n                  return _readUrl.apply(this, arguments);\n                };\n\n                _context11.next = 4;\n                return readUrl(jsUrl);\n\n              case 4:\n                doc = _context11.sent;\n                _context11.next = 7;\n                return readUrl(workerUrl);\n\n              case 7:\n                worker_doc = _context11.sent;\n                return _context11.abrupt(\"return\", {\n                  'mainScriptUrlOrBlob': doc,\n                  'workerScriptBlob': worker_doc\n                });\n\n              case 9:\n              case \"end\":\n                return _context11.stop();\n            }\n          }\n        }, _callee11);\n      }));\n\n      function makePresetModule_(_x11, _x12) {\n        return _makePresetModule_.apply(this, arguments);\n      }\n\n      return makePresetModule_;\n    }()\n    /** @private */\n\n  }, {\n    key: \"convertBitmapToBlob_\",\n    value: function convertBitmapToBlob_(bitmap) {\n      if (!this.canvas) {\n        this.canvas = document.createElement('canvas');\n      }\n\n      if (!this.preview) {\n        this.preview = document.getElementById('preview');\n      }\n\n      this.canvas.width = bitmap.width;\n      this.canvas.height = bitmap.height;\n      var ctx = this.canvas.getContext('2d');\n      ctx.drawImage(bitmap, 0, 0);\n\n      if (this.isShowPreview) {\n        this.preview.width = bitmap.width / 2;\n        this.preview.height = bitmap.height / 2;\n        var previewCtx = this.preview.getContext(\"2d\");\n        previewCtx.scale(0.5, 0.5);\n        previewCtx.drawImage(this.canvas, 0, 0);\n      }\n\n      return ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);\n    }\n    /** @private */\n\n  }, {\n    key: \"addCallbackInCpp_\",\n    value: function addCallbackInCpp_(_trackerPtr) {\n      var gazeCallback_ = this.trackerModule.addFunction(this.wasmGazeCallback_, 'viffii');\n      var calibrationProgressCallback_ = this.trackerModule.addFunction(this.wasmCalibrationProgress_, 'vf');\n      var calibrationNextPointCallback_ = this.trackerModule.addFunction(this.wasmCalibrationNextPoint_, 'vff');\n      var calibrationFinishCallback_ = this.trackerModule.addFunction(this.wasmCalibrationFinished_, 'vii');\n      var attentionCallback_ = this.trackerModule.addFunction(this.wasmAttentionCallback_, 'viif');\n      var statusCallback_ = this.trackerModule.addFunction(this.wasmStatusCallback_, 'viiiiffi');\n      var faceCallback_ = this.trackerModule.addFunction(this.wasmFaceCallback_, 'vii');\n      this.addFunctions.push(gazeCallback_);\n      this.addFunctions.push(calibrationNextPointCallback_);\n      this.addFunctions.push(calibrationProgressCallback_);\n      this.addFunctions.push(calibrationFinishCallback_);\n      this.addFunctions.push(attentionCallback_);\n      this.addFunctions.push(statusCallback_);\n      this.addFunctions.push(faceCallback_);\n      this.trackerModule.ccall('setJSCallbacks', 'boolean', ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number'], [_trackerPtr, gazeCallback_, calibrationNextPointCallback_, calibrationProgressCallback_, calibrationFinishCallback_, attentionCallback_, statusCallback_, faceCallback_]);\n    }\n    /** @private */\n\n  }, {\n    key: \"sendInitCallback_\",\n    value: function sendInitCallback_(_trackerPtr, _errCode) {\n      var instance = Seeso.gaze;\n      instance.eyeTracker = _trackerPtr;\n\n      if (_errCode === 0) {\n        instance.errCode = _type_error_type__WEBPACK_IMPORTED_MODULE_3__.InitializationErrorType.ERROR_NONE;\n        var left = window.screen.width * (1 - _setting__WEBPACK_IMPORTED_MODULE_0__.CALIBRATION_REGION_RATIO) / 2;\n        var right = window.screen.width - left;\n        var top = window.screen.height * (1 - _setting__WEBPACK_IMPORTED_MODULE_0__.CALIBRATION_REGION_RATIO) / 2;\n        var bottom = window.screen.height - top;\n        var lt = instance.screen_to_camera_(left, top);\n        var rb = instance.screen_to_camera_(right, bottom);\n        instance.trackerModule.ccall('setTargetBoundRegion', null, ['number', 'number', 'number', 'number', 'number'], [instance.eyeTracker, lt.camera_x, lt.camera_y, rb.camera_x, rb.camera_y]);\n        instance.trackerModule.ccall('setAttentionRegion', null, ['number', 'number', 'number', 'number', 'number'], [instance.eyeTracker, lt.camera_x, lt.camera_y, rb.camera_x, rb.camera_y]);\n      } else {\n        instance.errCode = _errCode + 2;\n      }\n\n      if (instance.errCode === _type_error_type__WEBPACK_IMPORTED_MODULE_3__.InitializationErrorType.ERROR_NONE) {\n        instance.addCallbackInCpp_(_trackerPtr);\n      }\n\n      if (instance.statusOptionPtr) {\n        instance.trackerModule._free(instance.statusOptionPtr);\n\n        instance.statusOptionPtr = null;\n      }\n    }\n    /** @private */\n\n  }, {\n    key: \"initStreamTrack_\",\n    value: function initStreamTrack_(stream) {\n      this.releaseStreamTrack_();\n      var tracks = stream.getVideoTracks();\n\n      if (tracks) {\n        this.track = tracks[0];\n        this.imageCapture = new _polyfil_ImageCapture_polyfil__WEBPACK_IMPORTED_MODULE_1__.ImageCapture(this.track);\n        return true;\n      }\n\n      return false;\n    }\n    /** @private */\n\n  }, {\n    key: \"startCameraThread_\",\n    value: function startCameraThread_(cameraThread) {\n      var _this3 = this;\n\n      cameraThread.setFunc( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12() {\n        return regeneratorRuntime.wrap(function _callee12$(_context12) {\n          while (1) {\n            switch (_context12.prev = _context12.next) {\n              case 0:\n                _context12.prev = 0;\n\n                if (_this3.checkStreamTrack_(_this3.track)) {\n                  _context12.next = 3;\n                  break;\n                }\n\n                return _context12.abrupt(\"return\");\n\n              case 3:\n                _context12.next = 5;\n                return _this3.processFrame_(_this3.imageCapture);\n\n              case 5:\n                _context12.next = 11;\n                break;\n\n              case 7:\n                _context12.prev = 7;\n                _context12.t0 = _context12[\"catch\"](0);\n                console.log(_context12.t0);\n                return _context12.abrupt(\"return\", false);\n\n              case 11:\n              case \"end\":\n                return _context12.stop();\n            }\n          }\n        }, _callee12, null, [[0, 7]]);\n      })));\n      cameraThread.start();\n      return true;\n    }\n    /** @private */\n\n  }, {\n    key: \"startDebugThread_\",\n    value: function startDebugThread_(debugThread) {\n      var _this4 = this;\n\n      debugThread.setFunc( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13() {\n        var averageLatency, latency_avg, latency_max, latency_min, FPS;\n        return regeneratorRuntime.wrap(function _callee13$(_context13) {\n          while (1) {\n            switch (_context13.prev = _context13.next) {\n              case 0:\n                _context13.prev = 0;\n\n                averageLatency = function averageLatency(arr) {\n                  return arr.reduce(function (p, c) {\n                    return p + c;\n                  }, 0) / arr.length;\n                };\n\n                latency_avg = averageLatency(_this4.latencyList);\n                latency_max = Math.max.apply(null, _this4.latencyList);\n                latency_min = Math.min.apply(null, _this4.latencyList);\n                FPS = Math.floor(_setting__WEBPACK_IMPORTED_MODULE_0__.DEBUG_INTERVAL_TIME_MS / 1000 * _this4.latencyList.length);\n\n                _this4.debugCallbacks.forEach(function (fn) {\n                  if (!fn) return;\n                  fn(FPS, latency_min, latency_max, latency_avg);\n                });\n\n                _this4.latencyList = [];\n                _this4.befTime = -1;\n                _context13.next = 15;\n                break;\n\n              case 11:\n                _context13.prev = 11;\n                _context13.t0 = _context13[\"catch\"](0);\n                console.log(_context13.t0);\n                return _context13.abrupt(\"return\", false);\n\n              case 15:\n              case \"end\":\n                return _context13.stop();\n            }\n          }\n        }, _callee13, null, [[0, 11]]);\n      })));\n      debugThread.start();\n      return true;\n    }\n    /** @private */\n\n  }, {\n    key: \"checkStreamTrack_\",\n    value: function checkStreamTrack_(track) {\n      if (track === null || track.readyState !== 'live' || !track.enabled || track.muted) {\n        if (track === null) {\n          console.log('error checkStreamTrack_ ');\n        } else {\n          console.log(\"error \\n                    ready \".concat(track.readyState !== 'live', \", \\n                    enabled \").concat(!track.enabled, \", \\n                    muted \").concat(track.muted));\n        }\n\n        return false;\n      }\n\n      return true;\n    }\n    /** @private */\n\n  }, {\n    key: \"processFrame_\",\n    value: function () {\n      var _processFrame_ = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14(imageCapture) {\n        var bitmap, ptr, blob, isAdd;\n        return regeneratorRuntime.wrap(function _callee14$(_context14) {\n          while (1) {\n            switch (_context14.prev = _context14.next) {\n              case 0:\n                _context14.next = 2;\n                return imageCapture.grabFrame();\n\n              case 2:\n                bitmap = _context14.sent;\n                ptr = this.getBufferPtr_(bitmap);\n                blob = this.convertBitmapToBlob_(bitmap);\n                this.trackerModule.HEAPU8.set(blob.data, ptr);\n                isAdd = this.trackerModule.ccall('addFrame', 'boolean', ['number', 'number', 'number', 'number', 'number'], [this.eyeTracker, ptr, bitmap.width, bitmap.height, _type_color_format__WEBPACK_IMPORTED_MODULE_4__.ColorFormat.RGBA]);\n\n              case 7:\n              case \"end\":\n                return _context14.stop();\n            }\n          }\n        }, _callee14, this);\n      }));\n\n      function processFrame_(_x14) {\n        return _processFrame_.apply(this, arguments);\n      }\n\n      return processFrame_;\n    }()\n    /** @private */\n\n  }, {\n    key: \"getBufferPtr_\",\n    value: function getBufferPtr_(bitmap) {\n      if (!this.imagePtr) {\n        this.imagePtr = this.trackerModule.ccall('create_image_ptr', 'number', ['number', 'number'], [bitmap.width, bitmap.height]);\n      }\n\n      return this.imagePtr;\n    }\n    /** @private */\n\n  }, {\n    key: \"wasmGazeCallback_\",\n    value: function wasmGazeCallback_(_timestamp, _x, _y, _trackingState, _eyeMovmentState) {\n      if (Seeso.gaze.befTime === -1) {\n        Seeso.gaze.befTime = Date.now();\n      } else {\n        var curTime = Date.now();\n        Seeso.gaze.latencyList.push(curTime - Seeso.gaze.befTime);\n        Seeso.gaze.befTime = curTime;\n      }\n\n      var gazeInfo;\n\n      if (_x !== -1001 && _y !== -1001) {\n        var _Seeso$gaze$cm_to_pix = Seeso.gaze.cm_to_pixel_(_x, _y, false),\n            browser_x = _Seeso$gaze$cm_to_pix.browser_x,\n            browser_y = _Seeso$gaze$cm_to_pix.browser_y;\n\n        gazeInfo = new _type_gaze_info__WEBPACK_IMPORTED_MODULE_2__.default(_timestamp, browser_x, browser_y, _trackingState, _eyeMovmentState);\n      } else {\n        gazeInfo = new _type_gaze_info__WEBPACK_IMPORTED_MODULE_2__.default(_timestamp, NaN, NaN, _trackingState, _eyeMovmentState);\n      }\n\n      Seeso.gaze.gazeCallbacks.forEach(function (fn) {\n        fn(gazeInfo);\n      });\n    }\n    /** @private */\n\n  }, {\n    key: \"wasmCalibrationProgress_\",\n    value: function wasmCalibrationProgress_(_progress) {\n      var progress = _progress;\n      Seeso.gaze.calibrationProgressCallbacks.forEach(function (fn) {\n        fn(progress);\n      });\n    }\n    /** @private */\n\n  }, {\n    key: \"wasmCalibrationNextPoint_\",\n    value: function wasmCalibrationNextPoint_(_x, _y) {\n      var _Seeso$gaze$cm_to_pix2 = Seeso.gaze.cm_to_pixel_(_x, _y, false),\n          browser_x = _Seeso$gaze$cm_to_pix2.browser_x,\n          browser_y = _Seeso$gaze$cm_to_pix2.browser_y;\n\n      Seeso.gaze.calibrationNextPointCallbacks.forEach(function (fn) {\n        fn(browser_x, browser_y);\n      });\n    }\n    /** @private */\n\n  }, {\n    key: \"wasmCalibrationFinished_\",\n    value: function wasmCalibrationFinished_(calibrationData, dataSize) {\n      var seeso = Seeso.gaze;\n      var buffer = new ArrayBuffer(dataSize);\n      var intArr = new Uint8Array(buffer);\n      intArr.set(seeso.trackerModule.HEAPU8.subarray(calibrationData, calibrationData + dataSize));\n      var calibrationB64 = seeso.bytesToBase64_(intArr);\n      var cameraInfo = seeso.getCameraPosition();\n      var monitorInch = seeso.getMonitorSize();\n      var faceDistance = seeso.getFaceDistance();\n      Seeso.gaze.calibrationFinishCallbacks.forEach(function (fn) {\n        fn(new _type_calibration_data__WEBPACK_IMPORTED_MODULE_6__.CalibrationData({\n          vector: calibrationB64,\n          vectorLength: dataSize,\n          isCameraOnTop: cameraInfo.isCameraOnTop,\n          cameraX: cameraInfo.cameraX,\n          monitorInch: monitorInch,\n          faceDistance: faceDistance\n        }).to_string());\n      });\n    }\n    /** @private */\n\n  }, {\n    key: \"wasmAttentionCallback_\",\n    value: function wasmAttentionCallback_(timestampBegin, timestampEnd, attentionScore) {\n      var seeso = Seeso.gaze;\n\n      if (!seeso.userStatusOption) {\n        return;\n      }\n\n      if (seeso.userStatusOption.isUseAttention) {\n        if (attentionScore >= 0) {\n          Seeso.gaze.attentionCallbacks.forEach(function (fn) {\n            fn(timestampBegin, timestampEnd, attentionScore);\n          });\n        }\n      }\n    }\n    /** @private */\n\n  }, {\n    key: \"wasmStatusCallback_\",\n    value: function wasmStatusCallback_(timestamp, isBlinkLeft, isBlinkRight, isBlink, leftOpenness, rightOpenness, isDrowsiness) {\n      var seeso = Seeso.gaze;\n\n      if (!seeso.userStatusOption) {\n        return;\n      }\n\n      if (seeso.userStatusOption.isUseBlink) {\n        Seeso.gaze.blinkCallbacks.forEach(function (fn) {\n          fn(timestamp, isBlinkLeft > 0, isBlinkRight > 0, isBlink > 0, leftOpenness, rightOpenness);\n        });\n      }\n\n      if (seeso.userStatusOption.isUseDrowsiness) {\n        Seeso.gaze.drowsinessCallbacks.forEach(function (fn) {\n          fn(timestamp, isDrowsiness > 0);\n        });\n      }\n    }\n    /** @private */\n\n  }, {\n    key: \"wasmFaceCallback_\",\n    value: function wasmFaceCallback_(data, dataSize) {// not use\n      // console.log('testCallback onFace ');\n    }\n    /** @private */\n\n  }, {\n    key: \"bytesToBase64_\",\n    value: function bytesToBase64_(bytes) {\n      var binary = '';\n      var len = bytes.byteLength;\n\n      for (var i = 0; i < len; i++) {\n        binary += String.fromCharCode(bytes[i]);\n      }\n\n      return window.btoa(binary);\n    }\n    /** @private */\n\n  }, {\n    key: \"base64ToByteBuffer_\",\n    value: function base64ToByteBuffer_(base64) {\n      return buffer__WEBPACK_IMPORTED_MODULE_11__.Buffer.from(base64, 'base64');\n    } // Functions for dimension calculate\n\n    /** @private */\n\n  }, {\n    key: \"cm_to_pixel_\",\n    value: function cm_to_pixel_(_x, _y, debug) {\n      var _this$camera_to_scree = this.camera_to_screen_(_x, _y),\n          screen_x = _this$camera_to_scree.screen_x,\n          screen_y = _this$camera_to_scree.screen_y;\n\n      var _this$screen_to_brows = this.screen_to_browser_(screen_x, screen_y),\n          browser_x = _this$screen_to_brows.browser_x,\n          browser_y = _this$screen_to_brows.browser_y;\n\n      if (debug) {\n        console.log(_x, _y, '->', screen_x, screen_y, '->', browser_x, browser_y);\n      }\n\n      return {\n        browser_x: browser_x,\n        browser_y: browser_y\n      };\n    }\n    /** @private */\n\n  }, {\n    key: \"pixel_to_cm_\",\n    value: function pixel_to_cm_(_x, _y) {\n      var _this$browser_to_scre = this.browser_to_screen_(_x, _y),\n          screen_x = _this$browser_to_scre.screen_x,\n          screen_y = _this$browser_to_scre.screen_y;\n\n      var _this$screen_to_camer = this.screen_to_camera_(screen_x, screen_y),\n          camera_x = _this$screen_to_camer.camera_x,\n          camera_y = _this$screen_to_camer.camera_y;\n\n      console.log(_x, _y, '->', screen_x, screen_y, '->', camera_x, camera_y);\n      return {\n        camera_x: camera_x,\n        camera_y: camera_y\n      };\n    }\n    /** @private */\n\n  }, {\n    key: \"screen_to_browser_\",\n    value: function screen_to_browser_(_x, _y) {\n      var isFullScreen = window.outerHeight === window.innerHeight;\n      var leftOrigin = isFullScreen ? 0 : window.screenX; // - (window.outerWidth - window.innerWidth);\n\n      var topOrigin = isFullScreen ? 0 : window.screenY + (window.outerHeight - window.innerHeight);\n      var browser_x = _x - leftOrigin;\n      var browser_y = _y - topOrigin;\n      return {\n        browser_x: browser_x,\n        browser_y: browser_y\n      };\n    }\n    /** @private */\n\n  }, {\n    key: \"browser_to_screen_\",\n    value: function browser_to_screen_(_x, _y) {\n      var isFullScreen = window.outerHeight === window.innerHeight;\n      var leftOrigin = isFullScreen ? 0 : window.screenX; // - (window.outerWidth - window.innerWidth);\n\n      var topOrigin = isFullScreen ? 0 : window.screenY + (window.outerHeight - window.innerHeight);\n      var screen_x = _x + leftOrigin;\n      var screen_y = _y + topOrigin - (this.isCameraOnTop ? 0 : window.outerHeight); // screen_to_browser를 그냥 반대로\n\n      return {\n        screen_x: screen_x,\n        screen_y: screen_y\n      };\n    }\n    /** @private */\n\n  }, {\n    key: \"camera_to_screen_\",\n    value: function camera_to_screen_(_x, _y) {\n      _y = _y + this.cameraTopMm;\n      var screen_x = Math.floor(window.screen.width / this.widthMm * _x + this.cameraX);\n      var screen_y = Math.floor(window.screen.height / this.heightMm * -_y);\n      return {\n        screen_x: screen_x,\n        screen_y: screen_y\n      };\n    }\n    /** @private */\n\n  }, {\n    key: \"screen_to_camera_\",\n    value: function screen_to_camera_(_x, _y) {\n      var camera_x = Math.floor(this.widthMm / window.screen.width * (_x - this.cameraX));\n      var camera_y = -Math.floor(this.heightMm / window.screen.height * _y);\n      camera_y = camera_y - this.cameraTopMm;\n      return {\n        camera_x: camera_x,\n        camera_y: camera_y\n      };\n    }\n    /** @private */\n\n  }, {\n    key: \"releaseStreamTrack_\",\n    value: function releaseStreamTrack_() {\n      if (this.track) {\n        this.track.stop();\n        this.track = null;\n      }\n    }\n  }], [{\n    key: \"openCalibrationPageQuickStart\",\n    value: function openCalibrationPageQuickStart(licenseKey, userId, redirectUrl, calibrationPoint) {\n      var payload = {\n        licenseKey: licenseKey,\n        userId: userId,\n        redirectUrl: redirectUrl,\n        selectCalibrationPoint: calibrationPoint,\n        quickStart: true\n      };\n      var queryString = Object.entries(payload).map(function (e) {\n        return e.join('=');\n      }).join('&');\n      window.location.replace(\"\".concat((0,_setting__WEBPACK_IMPORTED_MODULE_0__.getCalibrationServiceUrl)(), \"?\").concat(queryString));\n    }\n  }, {\n    key: \"openCalibrationPage\",\n    value: function openCalibrationPage(licenseKey, userId, redirectUrl, calibrationPoint) {\n      var payload = {\n        licenseKey: licenseKey,\n        userId: userId,\n        redirectUrl: redirectUrl,\n        selectCalibrationPoint: calibrationPoint\n      };\n      var queryString = Object.entries(payload).map(function (e) {\n        return e.join('=');\n      }).join('&');\n      window.location.replace(\"\".concat((0,_setting__WEBPACK_IMPORTED_MODULE_0__.getCalibrationServiceUrl)(), \"?\").concat(queryString));\n    }\n  }, {\n    key: \"getVersionName\",\n    value: function getVersionName() {\n      return _setting__WEBPACK_IMPORTED_MODULE_0__.SEESO_VERSION;\n    }\n  }]);\n\n  return Seeso;\n}();\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Seeso);\n\n//# sourceURL=webpack://seeso/./lib/seeso.js?");

/***/ }),

/***/ "./lib/setting/index.js":
/*!******************************!*\
  !*** ./lib/setting/index.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"SEESO_VERSION\": () => (/* binding */ SEESO_VERSION),\n/* harmony export */   \"MAX_FPS\": () => (/* binding */ MAX_FPS),\n/* harmony export */   \"INTERVAL_TIME_MS\": () => (/* binding */ INTERVAL_TIME_MS),\n/* harmony export */   \"DEBUG_INTERVAL_TIME_MS\": () => (/* binding */ DEBUG_INTERVAL_TIME_MS),\n/* harmony export */   \"CALIBRATION_REGION_RATIO\": () => (/* binding */ CALIBRATION_REGION_RATIO),\n/* harmony export */   \"getServerUrl\": () => (/* binding */ getServerUrl),\n/* harmony export */   \"getCalibrationServiceUrl\": () => (/* binding */ getCalibrationServiceUrl)\n/* harmony export */ });\n/* eslint-disable */\n// export const SEESO_VERSION = `${VERSION}`;\nvar SEESO_VERSION = \"2.4.2\";\nvar MAX_FPS = 30;\nvar INTERVAL_TIME_MS = 1000 / MAX_FPS;\nvar DEBUG_INTERVAL_TIME_MS = 1000;\nvar CALIBRATION_REGION_RATIO = 0.95;\nvar getServerUrl = function getServerUrl() {\n  return 'https://console.seeso.io';\n};\nvar getCalibrationServiceUrl = function getCalibrationServiceUrl() {\n  return 'https://calibration.seeso.io/#/service';\n};\n\n//# sourceURL=webpack://seeso/./lib/setting/index.js?");

/***/ }),

/***/ "./lib/type/calibration-accuracy-type.js":
/*!***********************************************!*\
  !*** ./lib/type/calibration-accuracy-type.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"CalibrationAccuracyCriteria\": () => (/* binding */ CalibrationAccuracyCriteria)\n/* harmony export */ });\nvar CalibrationAccuracyCriteria = Object.freeze({\n  DEFAULT: 0,\n  LOW: 1,\n  HIGH: 2\n});\n\n//# sourceURL=webpack://seeso/./lib/type/calibration-accuracy-type.js?");

/***/ }),

/***/ "./lib/type/calibration-data.js":
/*!**************************************!*\
  !*** ./lib/type/calibration-data.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"CalibrationData\": () => (/* binding */ CalibrationData)\n/* harmony export */ });\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\nvar CalibrationData = /*#__PURE__*/function () {\n  function CalibrationData(input) {\n    _classCallCheck(this, CalibrationData);\n\n    if (typeof input === \"string\") {\n      this.constructFromString(input);\n    } else {\n      this.constructFromCalibrationInput(input);\n    }\n  }\n\n  _createClass(CalibrationData, [{\n    key: \"constructFromString\",\n    value: function constructFromString(jsonString) {\n      var calibrationData = JSON.parse(jsonString);\n      var vector = calibrationData.vector,\n          vectorLength = calibrationData.vectorLength,\n          isCameraOnTop = calibrationData.isCameraOnTop,\n          cameraX = calibrationData.cameraX,\n          monitorInch = calibrationData.monitorInch,\n          faceDistance = calibrationData.faceDistance;\n      this.vector = vector;\n      this.vectorLength = vectorLength;\n      this.isCameraOnTop = isCameraOnTop;\n      this.cameraX = cameraX;\n      this.monitorInch = monitorInch;\n      this.faceDistance = faceDistance;\n    }\n  }, {\n    key: \"constructFromCalibrationInput\",\n    value: function constructFromCalibrationInput(input) {\n      this.vector = input.vector; //b64 string\n\n      this.vectorLength = input.vectorLength; //b64 길이\n\n      this.isCameraOnTop = input.isCameraOnTop;\n      this.cameraX = input.cameraX;\n      this.monitorInch = input.monitorInch;\n      this.faceDistance = input.faceDistance;\n    }\n  }, {\n    key: \"to_string\",\n    value: function to_string() {\n      return JSON.stringify(this);\n    }\n  }]);\n\n  return CalibrationData;\n}();\n\n//# sourceURL=webpack://seeso/./lib/type/calibration-data.js?");

/***/ }),

/***/ "./lib/type/color-format.js":
/*!**********************************!*\
  !*** ./lib/type/color-format.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"ColorFormat\": () => (/* binding */ ColorFormat)\n/* harmony export */ });\nvar ColorFormat = Object.freeze({\n  NV12: 1,\n  NV21: 2,\n  RGB: 3,\n  BGRA: 4,\n  RGBA: 5,\n  ELSE: 6\n});\n\n//# sourceURL=webpack://seeso/./lib/type/color-format.js?");

/***/ }),

/***/ "./lib/type/error-type.js":
/*!********************************!*\
  !*** ./lib/type/error-type.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"InitializationErrorType\": () => (/* binding */ InitializationErrorType)\n/* harmony export */ });\nvar InitializationErrorType = Object.freeze({\n  ERROR_NONE: 0,\n  ERROR_INIT: 1,\n  ERROR_CAMERA_PERMISSION: 2,\n  AUTH_INVALID_KEY: 3,\n\n  /* 3 */\n  // 잘못된 키(없는 키)\n  AUTH_INVALID_ENV_USED_DEV_IN_PROD: 4,\n\n  /* 4 */\n  // dev 키를 prod 에서 사용함\n  AUTH_INVALID_ENV_USED_PROD_IN_DEV: 5,\n\n  /* 5 */\n  // prod 키를 dev 에서 사용함\n  AUTH_INVALID_PACKAGE_NAME: 6,\n\n  /* 6 */\n  // 잘못된 패키지 이름\n  AUTH_INVALID_APP_SIGNATURE: 7,\n\n  /* 7 */\n  // 잘못된 앱 서명\n  AUTH_EXCEEDED_FREE_TIER: 8,\n\n  /* 8 */\n  // 무료 사용량 초과\n  AUTH_DEACTIVATED_KEY: 9,\n\n  /* 9 */\n  // 비 활성화 된 키\n  AUTH_INVALID_ACCESS: 10,\n\n  /* 10 */\n  // 잘못된 접근(ip 차단, 암호화/복호화 실패, 검증 무시 등); 상세한 정보 제공 하지 않음\n  AUTH_UNKNOWN_ERROR: 11,\n\n  /* 11 */\n  // 서버 에서 처리해 주지 못 한 에러\n  AUTH_SERVER_ERROR: 12,\n\n  /* 12 */\n  // 서버 내부 에러 (timeout 등)\n  AUTH_CANNOT_FIND_HOST: 13,\n\n  /* 13 */\n  // 인터넷 연결 안되거나 잘못된 주소\n  AUTH_WRONG_LOCAL_TIME: 14,\n\n  /* 14 */\n  // 기기와 서버의 시간 차이가 큰 경우\n  AUTH_INVALID_KEY_FORMAT: 15,\n\n  /* 15 */\n  // 잘못된 라이센스 키 포맷\n  AUTH_EXPIRED_KEY: 16\n  /* 16 */\n  // 만료된 키 (로컬 인증 전용)\n\n});\n\n//# sourceURL=webpack://seeso/./lib/type/error-type.js?");

/***/ }),

/***/ "./lib/type/gaze-info.js":
/*!*******************************!*\
  !*** ./lib/type/gaze-info.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"TrackingState\": () => (/* binding */ TrackingState),\n/* harmony export */   \"EyeMovementState\": () => (/* binding */ EyeMovementState),\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nvar TrackingState = Object.freeze({\n  SUCCESS: 0,\n  LOW_CONFIDENCE: 1,\n  UNSUPPORTED: 2,\n  FACE_MISSING: 3\n});\nvar EyeMovementState = Object.freeze({\n  FIXATION: 0,\n  SACCADE: 2,\n  UNKNOWN: 3\n});\n\nvar GazeInfo =\n/**\n *\n * @param {number} timestamp\n * @param {number} x\n * @param {number} y\n * @param {TrackingState} trackingState\n * @param {EyeMovementState} eyemovementState\n */\nfunction GazeInfo(timestamp, x, y, trackingState, eyemovementState) {\n  _classCallCheck(this, GazeInfo);\n\n  this.timestamp = timestamp;\n  this.x = x;\n  this.y = y;\n  this.trackingState = trackingState;\n  this.eyemovementState = eyemovementState;\n};\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (GazeInfo);\n\n//# sourceURL=webpack://seeso/./lib/type/gaze-info.js?");

/***/ }),

/***/ "./lib/type/user-status-option.js":
/*!****************************************!*\
  !*** ./lib/type/user-status-option.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\nvar UserStatusOptions = Object.freeze({\n  STATUS_ATTENTION: 1,\n  STATUS_BLINK: 2,\n  STATUS_DROWSINESS: 3\n});\n\nvar UserStatusOption = /*#__PURE__*/function () {\n  /**\n   *\n   * @param {number} isUseAttention\n   * @param {number} isUseBlink\n   * @param {number} isUseDrowsiness\n   */\n  function UserStatusOption(isUseAttention, isUseBlink, isUseDrowsiness) {\n    _classCallCheck(this, UserStatusOption);\n\n    this.isUseAttention = isUseAttention;\n    this.isUseBlink = isUseBlink;\n    this.isUseDrowsiness = isUseDrowsiness;\n  }\n\n  _createClass(UserStatusOption, [{\n    key: \"getUserStatusOptions\",\n    value: function getUserStatusOptions() {\n      var list = [];\n\n      if (this.isUseAttention) {\n        list.push(UserStatusOptions.STATUS_ATTENTION);\n      }\n\n      if (this.isUseBlink) {\n        list.push(UserStatusOptions.STATUS_BLINK);\n      }\n\n      if (this.isUseDrowsiness) {\n        list.push(UserStatusOptions.STATUS_DROWSINESS);\n      }\n\n      return list;\n    }\n  }]);\n\n  return UserStatusOption;\n}();\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (UserStatusOption);\n\n//# sourceURL=webpack://seeso/./lib/type/user-status-option.js?");

/***/ }),

/***/ "./lib/utils/Commons.js":
/*!******************************!*\
  !*** ./lib/utils/Commons.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"delay\": () => (/* binding */ delay)\n/* harmony export */ });\n/* eslint-disable */\nvar delay = function delay(ms, cb) {\n  return new Promise(function (resolve) {\n    return setTimeout(function () {\n      if (cb) cb();\n      resolve();\n    }, ms);\n  });\n};\n\n//# sourceURL=webpack://seeso/./lib/utils/Commons.js?");

/***/ }),

/***/ "./lib/utils/InstantThread.js":
/*!************************************!*\
  !*** ./lib/utils/InstantThread.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _Commons__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Commons */ \"./lib/utils/Commons.js\");\nfunction asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }\n\nfunction _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, \"next\", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, \"throw\", err); } _next(undefined); }); }; }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\n/* eslint-disable */\n\n\nvar InstantThread = /*#__PURE__*/function () {\n  function InstantThread(min_interval_ms) {\n    var _this = this;\n\n    _classCallCheck(this, InstantThread);\n\n    if (!min_interval_ms) throw new Error('min_interval_ms required');\n    this.current_interval_ms = min_interval_ms;\n    this.min_interval_ms = min_interval_ms;\n    this.flag = false;\n    this.running = true;\n\n    this.func = function () {};\n\n    (function () {\n      _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {\n        var before_ms, after_ms, execute_ms, diff_ms;\n        return regeneratorRuntime.wrap(function _callee$(_context) {\n          while (1) {\n            switch (_context.prev = _context.next) {\n              case 0:\n                if (!_this.running) {\n                  _context.next = 19;\n                  break;\n                }\n\n                if (!(_this.flag === true)) {\n                  _context.next = 15;\n                  break;\n                }\n\n                before_ms = Date.now();\n                _context.next = 5;\n                return _this.func();\n\n              case 5:\n                after_ms = Date.now();\n                execute_ms = after_ms - before_ms;\n                diff_ms = _this.current_interval_ms - execute_ms;\n\n                if (!(0 < diff_ms)) {\n                  _context.next = 13;\n                  break;\n                }\n\n                _context.next = 11;\n                return (0,_Commons__WEBPACK_IMPORTED_MODULE_0__.delay)(diff_ms);\n\n              case 11:\n                _context.next = 13;\n                break;\n\n              case 13:\n                _context.next = 17;\n                break;\n\n              case 15:\n                _context.next = 17;\n                return (0,_Commons__WEBPACK_IMPORTED_MODULE_0__.delay)(_this.min_interval_ms);\n\n              case 17:\n                _context.next = 0;\n                break;\n\n              case 19:\n              case \"end\":\n                return _context.stop();\n            }\n          }\n        }, _callee);\n      }))();\n    })();\n  }\n\n  _createClass(InstantThread, [{\n    key: \"setFunc\",\n    value: function setFunc(func) {\n      this.func = func;\n    }\n  }, {\n    key: \"stop\",\n    value: function stop() {\n      this.flag = false;\n    }\n  }, {\n    key: \"start\",\n    value: function start() {\n      this.flag = true;\n    }\n  }, {\n    key: \"release\",\n    value: function release() {\n      this.running = false;\n    }\n  }]);\n\n  return InstantThread;\n}();\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (InstantThread); // this.runCount = 0;\n// this.latencyList = [];\n//\n// latency = execute_ms;\n//\n// if(this.runCount > 29){\n//     const averageLatency = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;\n//     latency_avg = averageLatency(this.latencyList);\n//     latency_max = Math.max.apply(null, this.latencyList);\n//     latency_min = Math.min.apply(null, this.latencyList);\n//     FPS =  Math.floor(1000 / averageLatency(this.latencyList));\n//     this.latencyList = [];\n//     this.runCount = 0;\n// }\n\n//# sourceURL=webpack://seeso/./lib/utils/InstantThread.js?");

/***/ }),

/***/ "./lib/utils/MonitorSizeConverter.js":
/*!*******************************************!*\
  !*** ./lib/utils/MonitorSizeConverter.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\nvar INCH_TO_MM = 25.4;\n\nvar MonitorSizeConveter = /*#__PURE__*/function () {\n  function MonitorSizeConveter() {\n    _classCallCheck(this, MonitorSizeConveter);\n  }\n\n  _createClass(MonitorSizeConveter, null, [{\n    key: \"inchToSizeMM\",\n    value: function inchToSizeMM(inch) {\n      var widthRatio = screen.width / screen.height;\n      var heightRatio = 1; // height에 대한 비를 구했으니 height는 1\n\n      if (inch) {\n        var mornitorInchMm = INCH_TO_MM * inch;\n        var ratioDiagonal = Math.sqrt(Math.pow(widthRatio, 2) + Math.pow(heightRatio, 2));\n        var monitorRatio = mornitorInchMm / ratioDiagonal;\n        var monitorWidth = widthRatio * monitorRatio;\n        var monitorHeight = heightRatio * monitorRatio;\n        return {\n          width: monitorWidth,\n          height: monitorHeight\n        };\n      }\n    }\n  }, {\n    key: \"sizeMMtoInch\",\n    value: function sizeMMtoInch(monitorWidth, monitorHeight) {\n      var diagonal = Math.sqrt(Math.pow(monitorWidth, 2) + Math.pow(monitorHeight, 2));\n      return Math.round(diagonal / INCH_TO_MM);\n    }\n  }]);\n\n  return MonitorSizeConveter;\n}();\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MonitorSizeConveter);\n\n//# sourceURL=webpack://seeso/./lib/utils/MonitorSizeConverter.js?");

/***/ }),

/***/ "./lib/utils/make-url.js":
/*!*******************************!*\
  !*** ./lib/utils/make-url.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _setting_index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../setting/index */ \"./lib/setting/index.js\");\n/** @private */\n\n\nvar makeUrl_ = function makeUrl_(useSimd, useThreads) {\n  if (!useThreads) {\n    return [null, null];\n  } // jenkinstest로 테스트시 simd, non-simd 대신 넣어주면 된다.\n\n\n  var default_url = \"https://cdn.seeso.io/\".concat(_setting_index__WEBPACK_IMPORTED_MODULE_0__.SEESO_VERSION, \"/\");\n\n  if (useSimd) {\n    default_url += 'simd/';\n  } else {\n    default_url += 'non-simd/';\n  }\n\n  return [default_url + 'seeso.js', default_url + 'seeso.worker.js'];\n};\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (makeUrl_);\n\n//# sourceURL=webpack://seeso/./lib/utils/make-url.js?");

/***/ }),

/***/ "./node_modules/base64-js/index.js":
/*!*****************************************!*\
  !*** ./node_modules/base64-js/index.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";
eval("\n\nexports.byteLength = byteLength\nexports.toByteArray = toByteArray\nexports.fromByteArray = fromByteArray\n\nvar lookup = []\nvar revLookup = []\nvar Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array\n\nvar code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'\nfor (var i = 0, len = code.length; i < len; ++i) {\n  lookup[i] = code[i]\n  revLookup[code.charCodeAt(i)] = i\n}\n\n// Support decoding URL-safe base64 strings, as Node.js does.\n// See: https://en.wikipedia.org/wiki/Base64#URL_applications\nrevLookup['-'.charCodeAt(0)] = 62\nrevLookup['_'.charCodeAt(0)] = 63\n\nfunction getLens (b64) {\n  var len = b64.length\n\n  if (len % 4 > 0) {\n    throw new Error('Invalid string. Length must be a multiple of 4')\n  }\n\n  // Trim off extra bytes after placeholder bytes are found\n  // See: https://github.com/beatgammit/base64-js/issues/42\n  var validLen = b64.indexOf('=')\n  if (validLen === -1) validLen = len\n\n  var placeHoldersLen = validLen === len\n    ? 0\n    : 4 - (validLen % 4)\n\n  return [validLen, placeHoldersLen]\n}\n\n// base64 is 4/3 + up to two characters of the original data\nfunction byteLength (b64) {\n  var lens = getLens(b64)\n  var validLen = lens[0]\n  var placeHoldersLen = lens[1]\n  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen\n}\n\nfunction _byteLength (b64, validLen, placeHoldersLen) {\n  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen\n}\n\nfunction toByteArray (b64) {\n  var tmp\n  var lens = getLens(b64)\n  var validLen = lens[0]\n  var placeHoldersLen = lens[1]\n\n  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))\n\n  var curByte = 0\n\n  // if there are placeholders, only get up to the last complete 4 chars\n  var len = placeHoldersLen > 0\n    ? validLen - 4\n    : validLen\n\n  var i\n  for (i = 0; i < len; i += 4) {\n    tmp =\n      (revLookup[b64.charCodeAt(i)] << 18) |\n      (revLookup[b64.charCodeAt(i + 1)] << 12) |\n      (revLookup[b64.charCodeAt(i + 2)] << 6) |\n      revLookup[b64.charCodeAt(i + 3)]\n    arr[curByte++] = (tmp >> 16) & 0xFF\n    arr[curByte++] = (tmp >> 8) & 0xFF\n    arr[curByte++] = tmp & 0xFF\n  }\n\n  if (placeHoldersLen === 2) {\n    tmp =\n      (revLookup[b64.charCodeAt(i)] << 2) |\n      (revLookup[b64.charCodeAt(i + 1)] >> 4)\n    arr[curByte++] = tmp & 0xFF\n  }\n\n  if (placeHoldersLen === 1) {\n    tmp =\n      (revLookup[b64.charCodeAt(i)] << 10) |\n      (revLookup[b64.charCodeAt(i + 1)] << 4) |\n      (revLookup[b64.charCodeAt(i + 2)] >> 2)\n    arr[curByte++] = (tmp >> 8) & 0xFF\n    arr[curByte++] = tmp & 0xFF\n  }\n\n  return arr\n}\n\nfunction tripletToBase64 (num) {\n  return lookup[num >> 18 & 0x3F] +\n    lookup[num >> 12 & 0x3F] +\n    lookup[num >> 6 & 0x3F] +\n    lookup[num & 0x3F]\n}\n\nfunction encodeChunk (uint8, start, end) {\n  var tmp\n  var output = []\n  for (var i = start; i < end; i += 3) {\n    tmp =\n      ((uint8[i] << 16) & 0xFF0000) +\n      ((uint8[i + 1] << 8) & 0xFF00) +\n      (uint8[i + 2] & 0xFF)\n    output.push(tripletToBase64(tmp))\n  }\n  return output.join('')\n}\n\nfunction fromByteArray (uint8) {\n  var tmp\n  var len = uint8.length\n  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes\n  var parts = []\n  var maxChunkLength = 16383 // must be multiple of 3\n\n  // go through the array every three bytes, we'll deal with trailing stuff later\n  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {\n    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))\n  }\n\n  // pad the end with zeros, but make sure to not forget the extra bytes\n  if (extraBytes === 1) {\n    tmp = uint8[len - 1]\n    parts.push(\n      lookup[tmp >> 2] +\n      lookup[(tmp << 4) & 0x3F] +\n      '=='\n    )\n  } else if (extraBytes === 2) {\n    tmp = (uint8[len - 2] << 8) + uint8[len - 1]\n    parts.push(\n      lookup[tmp >> 10] +\n      lookup[(tmp >> 4) & 0x3F] +\n      lookup[(tmp << 2) & 0x3F] +\n      '='\n    )\n  }\n\n  return parts.join('')\n}\n\n\n//# sourceURL=webpack://seeso/./node_modules/base64-js/index.js?");

/***/ }),

/***/ "./node_modules/buffer/index.js":
/*!**************************************!*\
  !*** ./node_modules/buffer/index.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
eval("/*!\n * The buffer module from node.js, for the browser.\n *\n * @author   Feross Aboukhadijeh <https://feross.org>\n * @license  MIT\n */\n/* eslint-disable no-proto */\n\n\n\nconst base64 = __webpack_require__(/*! base64-js */ \"./node_modules/base64-js/index.js\")\nconst ieee754 = __webpack_require__(/*! ieee754 */ \"./node_modules/ieee754/index.js\")\nconst customInspectSymbol =\n  (typeof Symbol === 'function' && typeof Symbol['for'] === 'function') // eslint-disable-line dot-notation\n    ? Symbol['for']('nodejs.util.inspect.custom') // eslint-disable-line dot-notation\n    : null\n\nexports.Buffer = Buffer\nexports.SlowBuffer = SlowBuffer\nexports.INSPECT_MAX_BYTES = 50\n\nconst K_MAX_LENGTH = 0x7fffffff\nexports.kMaxLength = K_MAX_LENGTH\n\n/**\n * If `Buffer.TYPED_ARRAY_SUPPORT`:\n *   === true    Use Uint8Array implementation (fastest)\n *   === false   Print warning and recommend using `buffer` v4.x which has an Object\n *               implementation (most compatible, even IE6)\n *\n * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,\n * Opera 11.6+, iOS 4.2+.\n *\n * We report that the browser does not support typed arrays if the are not subclassable\n * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`\n * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support\n * for __proto__ and has a buggy typed array implementation.\n */\nBuffer.TYPED_ARRAY_SUPPORT = typedArraySupport()\n\nif (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&\n    typeof console.error === 'function') {\n  console.error(\n    'This browser lacks typed array (Uint8Array) support which is required by ' +\n    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'\n  )\n}\n\nfunction typedArraySupport () {\n  // Can typed array instances can be augmented?\n  try {\n    const arr = new Uint8Array(1)\n    const proto = { foo: function () { return 42 } }\n    Object.setPrototypeOf(proto, Uint8Array.prototype)\n    Object.setPrototypeOf(arr, proto)\n    return arr.foo() === 42\n  } catch (e) {\n    return false\n  }\n}\n\nObject.defineProperty(Buffer.prototype, 'parent', {\n  enumerable: true,\n  get: function () {\n    if (!Buffer.isBuffer(this)) return undefined\n    return this.buffer\n  }\n})\n\nObject.defineProperty(Buffer.prototype, 'offset', {\n  enumerable: true,\n  get: function () {\n    if (!Buffer.isBuffer(this)) return undefined\n    return this.byteOffset\n  }\n})\n\nfunction createBuffer (length) {\n  if (length > K_MAX_LENGTH) {\n    throw new RangeError('The value \"' + length + '\" is invalid for option \"size\"')\n  }\n  // Return an augmented `Uint8Array` instance\n  const buf = new Uint8Array(length)\n  Object.setPrototypeOf(buf, Buffer.prototype)\n  return buf\n}\n\n/**\n * The Buffer constructor returns instances of `Uint8Array` that have their\n * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of\n * `Uint8Array`, so the returned instances will have all the node `Buffer` methods\n * and the `Uint8Array` methods. Square bracket notation works as expected -- it\n * returns a single octet.\n *\n * The `Uint8Array` prototype remains unmodified.\n */\n\nfunction Buffer (arg, encodingOrOffset, length) {\n  // Common case.\n  if (typeof arg === 'number') {\n    if (typeof encodingOrOffset === 'string') {\n      throw new TypeError(\n        'The \"string\" argument must be of type string. Received type number'\n      )\n    }\n    return allocUnsafe(arg)\n  }\n  return from(arg, encodingOrOffset, length)\n}\n\nBuffer.poolSize = 8192 // not used by this implementation\n\nfunction from (value, encodingOrOffset, length) {\n  if (typeof value === 'string') {\n    return fromString(value, encodingOrOffset)\n  }\n\n  if (ArrayBuffer.isView(value)) {\n    return fromArrayView(value)\n  }\n\n  if (value == null) {\n    throw new TypeError(\n      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +\n      'or Array-like Object. Received type ' + (typeof value)\n    )\n  }\n\n  if (isInstance(value, ArrayBuffer) ||\n      (value && isInstance(value.buffer, ArrayBuffer))) {\n    return fromArrayBuffer(value, encodingOrOffset, length)\n  }\n\n  if (typeof SharedArrayBuffer !== 'undefined' &&\n      (isInstance(value, SharedArrayBuffer) ||\n      (value && isInstance(value.buffer, SharedArrayBuffer)))) {\n    return fromArrayBuffer(value, encodingOrOffset, length)\n  }\n\n  if (typeof value === 'number') {\n    throw new TypeError(\n      'The \"value\" argument must not be of type number. Received type number'\n    )\n  }\n\n  const valueOf = value.valueOf && value.valueOf()\n  if (valueOf != null && valueOf !== value) {\n    return Buffer.from(valueOf, encodingOrOffset, length)\n  }\n\n  const b = fromObject(value)\n  if (b) return b\n\n  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&\n      typeof value[Symbol.toPrimitive] === 'function') {\n    return Buffer.from(value[Symbol.toPrimitive]('string'), encodingOrOffset, length)\n  }\n\n  throw new TypeError(\n    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +\n    'or Array-like Object. Received type ' + (typeof value)\n  )\n}\n\n/**\n * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError\n * if value is a number.\n * Buffer.from(str[, encoding])\n * Buffer.from(array)\n * Buffer.from(buffer)\n * Buffer.from(arrayBuffer[, byteOffset[, length]])\n **/\nBuffer.from = function (value, encodingOrOffset, length) {\n  return from(value, encodingOrOffset, length)\n}\n\n// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:\n// https://github.com/feross/buffer/pull/148\nObject.setPrototypeOf(Buffer.prototype, Uint8Array.prototype)\nObject.setPrototypeOf(Buffer, Uint8Array)\n\nfunction assertSize (size) {\n  if (typeof size !== 'number') {\n    throw new TypeError('\"size\" argument must be of type number')\n  } else if (size < 0) {\n    throw new RangeError('The value \"' + size + '\" is invalid for option \"size\"')\n  }\n}\n\nfunction alloc (size, fill, encoding) {\n  assertSize(size)\n  if (size <= 0) {\n    return createBuffer(size)\n  }\n  if (fill !== undefined) {\n    // Only pay attention to encoding if it's a string. This\n    // prevents accidentally sending in a number that would\n    // be interpreted as a start offset.\n    return typeof encoding === 'string'\n      ? createBuffer(size).fill(fill, encoding)\n      : createBuffer(size).fill(fill)\n  }\n  return createBuffer(size)\n}\n\n/**\n * Creates a new filled Buffer instance.\n * alloc(size[, fill[, encoding]])\n **/\nBuffer.alloc = function (size, fill, encoding) {\n  return alloc(size, fill, encoding)\n}\n\nfunction allocUnsafe (size) {\n  assertSize(size)\n  return createBuffer(size < 0 ? 0 : checked(size) | 0)\n}\n\n/**\n * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.\n * */\nBuffer.allocUnsafe = function (size) {\n  return allocUnsafe(size)\n}\n/**\n * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.\n */\nBuffer.allocUnsafeSlow = function (size) {\n  return allocUnsafe(size)\n}\n\nfunction fromString (string, encoding) {\n  if (typeof encoding !== 'string' || encoding === '') {\n    encoding = 'utf8'\n  }\n\n  if (!Buffer.isEncoding(encoding)) {\n    throw new TypeError('Unknown encoding: ' + encoding)\n  }\n\n  const length = byteLength(string, encoding) | 0\n  let buf = createBuffer(length)\n\n  const actual = buf.write(string, encoding)\n\n  if (actual !== length) {\n    // Writing a hex string, for example, that contains invalid characters will\n    // cause everything after the first invalid character to be ignored. (e.g.\n    // 'abxxcd' will be treated as 'ab')\n    buf = buf.slice(0, actual)\n  }\n\n  return buf\n}\n\nfunction fromArrayLike (array) {\n  const length = array.length < 0 ? 0 : checked(array.length) | 0\n  const buf = createBuffer(length)\n  for (let i = 0; i < length; i += 1) {\n    buf[i] = array[i] & 255\n  }\n  return buf\n}\n\nfunction fromArrayView (arrayView) {\n  if (isInstance(arrayView, Uint8Array)) {\n    const copy = new Uint8Array(arrayView)\n    return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength)\n  }\n  return fromArrayLike(arrayView)\n}\n\nfunction fromArrayBuffer (array, byteOffset, length) {\n  if (byteOffset < 0 || array.byteLength < byteOffset) {\n    throw new RangeError('\"offset\" is outside of buffer bounds')\n  }\n\n  if (array.byteLength < byteOffset + (length || 0)) {\n    throw new RangeError('\"length\" is outside of buffer bounds')\n  }\n\n  let buf\n  if (byteOffset === undefined && length === undefined) {\n    buf = new Uint8Array(array)\n  } else if (length === undefined) {\n    buf = new Uint8Array(array, byteOffset)\n  } else {\n    buf = new Uint8Array(array, byteOffset, length)\n  }\n\n  // Return an augmented `Uint8Array` instance\n  Object.setPrototypeOf(buf, Buffer.prototype)\n\n  return buf\n}\n\nfunction fromObject (obj) {\n  if (Buffer.isBuffer(obj)) {\n    const len = checked(obj.length) | 0\n    const buf = createBuffer(len)\n\n    if (buf.length === 0) {\n      return buf\n    }\n\n    obj.copy(buf, 0, 0, len)\n    return buf\n  }\n\n  if (obj.length !== undefined) {\n    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {\n      return createBuffer(0)\n    }\n    return fromArrayLike(obj)\n  }\n\n  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {\n    return fromArrayLike(obj.data)\n  }\n}\n\nfunction checked (length) {\n  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when\n  // length is NaN (which is otherwise coerced to zero.)\n  if (length >= K_MAX_LENGTH) {\n    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +\n                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')\n  }\n  return length | 0\n}\n\nfunction SlowBuffer (length) {\n  if (+length != length) { // eslint-disable-line eqeqeq\n    length = 0\n  }\n  return Buffer.alloc(+length)\n}\n\nBuffer.isBuffer = function isBuffer (b) {\n  return b != null && b._isBuffer === true &&\n    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false\n}\n\nBuffer.compare = function compare (a, b) {\n  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)\n  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)\n  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {\n    throw new TypeError(\n      'The \"buf1\", \"buf2\" arguments must be one of type Buffer or Uint8Array'\n    )\n  }\n\n  if (a === b) return 0\n\n  let x = a.length\n  let y = b.length\n\n  for (let i = 0, len = Math.min(x, y); i < len; ++i) {\n    if (a[i] !== b[i]) {\n      x = a[i]\n      y = b[i]\n      break\n    }\n  }\n\n  if (x < y) return -1\n  if (y < x) return 1\n  return 0\n}\n\nBuffer.isEncoding = function isEncoding (encoding) {\n  switch (String(encoding).toLowerCase()) {\n    case 'hex':\n    case 'utf8':\n    case 'utf-8':\n    case 'ascii':\n    case 'latin1':\n    case 'binary':\n    case 'base64':\n    case 'ucs2':\n    case 'ucs-2':\n    case 'utf16le':\n    case 'utf-16le':\n      return true\n    default:\n      return false\n  }\n}\n\nBuffer.concat = function concat (list, length) {\n  if (!Array.isArray(list)) {\n    throw new TypeError('\"list\" argument must be an Array of Buffers')\n  }\n\n  if (list.length === 0) {\n    return Buffer.alloc(0)\n  }\n\n  let i\n  if (length === undefined) {\n    length = 0\n    for (i = 0; i < list.length; ++i) {\n      length += list[i].length\n    }\n  }\n\n  const buffer = Buffer.allocUnsafe(length)\n  let pos = 0\n  for (i = 0; i < list.length; ++i) {\n    let buf = list[i]\n    if (isInstance(buf, Uint8Array)) {\n      if (pos + buf.length > buffer.length) {\n        if (!Buffer.isBuffer(buf)) buf = Buffer.from(buf)\n        buf.copy(buffer, pos)\n      } else {\n        Uint8Array.prototype.set.call(\n          buffer,\n          buf,\n          pos\n        )\n      }\n    } else if (!Buffer.isBuffer(buf)) {\n      throw new TypeError('\"list\" argument must be an Array of Buffers')\n    } else {\n      buf.copy(buffer, pos)\n    }\n    pos += buf.length\n  }\n  return buffer\n}\n\nfunction byteLength (string, encoding) {\n  if (Buffer.isBuffer(string)) {\n    return string.length\n  }\n  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {\n    return string.byteLength\n  }\n  if (typeof string !== 'string') {\n    throw new TypeError(\n      'The \"string\" argument must be one of type string, Buffer, or ArrayBuffer. ' +\n      'Received type ' + typeof string\n    )\n  }\n\n  const len = string.length\n  const mustMatch = (arguments.length > 2 && arguments[2] === true)\n  if (!mustMatch && len === 0) return 0\n\n  // Use a for loop to avoid recursion\n  let loweredCase = false\n  for (;;) {\n    switch (encoding) {\n      case 'ascii':\n      case 'latin1':\n      case 'binary':\n        return len\n      case 'utf8':\n      case 'utf-8':\n        return utf8ToBytes(string).length\n      case 'ucs2':\n      case 'ucs-2':\n      case 'utf16le':\n      case 'utf-16le':\n        return len * 2\n      case 'hex':\n        return len >>> 1\n      case 'base64':\n        return base64ToBytes(string).length\n      default:\n        if (loweredCase) {\n          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8\n        }\n        encoding = ('' + encoding).toLowerCase()\n        loweredCase = true\n    }\n  }\n}\nBuffer.byteLength = byteLength\n\nfunction slowToString (encoding, start, end) {\n  let loweredCase = false\n\n  // No need to verify that \"this.length <= MAX_UINT32\" since it's a read-only\n  // property of a typed array.\n\n  // This behaves neither like String nor Uint8Array in that we set start/end\n  // to their upper/lower bounds if the value passed is out of range.\n  // undefined is handled specially as per ECMA-262 6th Edition,\n  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.\n  if (start === undefined || start < 0) {\n    start = 0\n  }\n  // Return early if start > this.length. Done here to prevent potential uint32\n  // coercion fail below.\n  if (start > this.length) {\n    return ''\n  }\n\n  if (end === undefined || end > this.length) {\n    end = this.length\n  }\n\n  if (end <= 0) {\n    return ''\n  }\n\n  // Force coercion to uint32. This will also coerce falsey/NaN values to 0.\n  end >>>= 0\n  start >>>= 0\n\n  if (end <= start) {\n    return ''\n  }\n\n  if (!encoding) encoding = 'utf8'\n\n  while (true) {\n    switch (encoding) {\n      case 'hex':\n        return hexSlice(this, start, end)\n\n      case 'utf8':\n      case 'utf-8':\n        return utf8Slice(this, start, end)\n\n      case 'ascii':\n        return asciiSlice(this, start, end)\n\n      case 'latin1':\n      case 'binary':\n        return latin1Slice(this, start, end)\n\n      case 'base64':\n        return base64Slice(this, start, end)\n\n      case 'ucs2':\n      case 'ucs-2':\n      case 'utf16le':\n      case 'utf-16le':\n        return utf16leSlice(this, start, end)\n\n      default:\n        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)\n        encoding = (encoding + '').toLowerCase()\n        loweredCase = true\n    }\n  }\n}\n\n// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)\n// to detect a Buffer instance. It's not possible to use `instanceof Buffer`\n// reliably in a browserify context because there could be multiple different\n// copies of the 'buffer' package in use. This method works even for Buffer\n// instances that were created from another copy of the `buffer` package.\n// See: https://github.com/feross/buffer/issues/154\nBuffer.prototype._isBuffer = true\n\nfunction swap (b, n, m) {\n  const i = b[n]\n  b[n] = b[m]\n  b[m] = i\n}\n\nBuffer.prototype.swap16 = function swap16 () {\n  const len = this.length\n  if (len % 2 !== 0) {\n    throw new RangeError('Buffer size must be a multiple of 16-bits')\n  }\n  for (let i = 0; i < len; i += 2) {\n    swap(this, i, i + 1)\n  }\n  return this\n}\n\nBuffer.prototype.swap32 = function swap32 () {\n  const len = this.length\n  if (len % 4 !== 0) {\n    throw new RangeError('Buffer size must be a multiple of 32-bits')\n  }\n  for (let i = 0; i < len; i += 4) {\n    swap(this, i, i + 3)\n    swap(this, i + 1, i + 2)\n  }\n  return this\n}\n\nBuffer.prototype.swap64 = function swap64 () {\n  const len = this.length\n  if (len % 8 !== 0) {\n    throw new RangeError('Buffer size must be a multiple of 64-bits')\n  }\n  for (let i = 0; i < len; i += 8) {\n    swap(this, i, i + 7)\n    swap(this, i + 1, i + 6)\n    swap(this, i + 2, i + 5)\n    swap(this, i + 3, i + 4)\n  }\n  return this\n}\n\nBuffer.prototype.toString = function toString () {\n  const length = this.length\n  if (length === 0) return ''\n  if (arguments.length === 0) return utf8Slice(this, 0, length)\n  return slowToString.apply(this, arguments)\n}\n\nBuffer.prototype.toLocaleString = Buffer.prototype.toString\n\nBuffer.prototype.equals = function equals (b) {\n  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')\n  if (this === b) return true\n  return Buffer.compare(this, b) === 0\n}\n\nBuffer.prototype.inspect = function inspect () {\n  let str = ''\n  const max = exports.INSPECT_MAX_BYTES\n  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()\n  if (this.length > max) str += ' ... '\n  return '<Buffer ' + str + '>'\n}\nif (customInspectSymbol) {\n  Buffer.prototype[customInspectSymbol] = Buffer.prototype.inspect\n}\n\nBuffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {\n  if (isInstance(target, Uint8Array)) {\n    target = Buffer.from(target, target.offset, target.byteLength)\n  }\n  if (!Buffer.isBuffer(target)) {\n    throw new TypeError(\n      'The \"target\" argument must be one of type Buffer or Uint8Array. ' +\n      'Received type ' + (typeof target)\n    )\n  }\n\n  if (start === undefined) {\n    start = 0\n  }\n  if (end === undefined) {\n    end = target ? target.length : 0\n  }\n  if (thisStart === undefined) {\n    thisStart = 0\n  }\n  if (thisEnd === undefined) {\n    thisEnd = this.length\n  }\n\n  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {\n    throw new RangeError('out of range index')\n  }\n\n  if (thisStart >= thisEnd && start >= end) {\n    return 0\n  }\n  if (thisStart >= thisEnd) {\n    return -1\n  }\n  if (start >= end) {\n    return 1\n  }\n\n  start >>>= 0\n  end >>>= 0\n  thisStart >>>= 0\n  thisEnd >>>= 0\n\n  if (this === target) return 0\n\n  let x = thisEnd - thisStart\n  let y = end - start\n  const len = Math.min(x, y)\n\n  const thisCopy = this.slice(thisStart, thisEnd)\n  const targetCopy = target.slice(start, end)\n\n  for (let i = 0; i < len; ++i) {\n    if (thisCopy[i] !== targetCopy[i]) {\n      x = thisCopy[i]\n      y = targetCopy[i]\n      break\n    }\n  }\n\n  if (x < y) return -1\n  if (y < x) return 1\n  return 0\n}\n\n// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,\n// OR the last index of `val` in `buffer` at offset <= `byteOffset`.\n//\n// Arguments:\n// - buffer - a Buffer to search\n// - val - a string, Buffer, or number\n// - byteOffset - an index into `buffer`; will be clamped to an int32\n// - encoding - an optional encoding, relevant is val is a string\n// - dir - true for indexOf, false for lastIndexOf\nfunction bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {\n  // Empty buffer means no match\n  if (buffer.length === 0) return -1\n\n  // Normalize byteOffset\n  if (typeof byteOffset === 'string') {\n    encoding = byteOffset\n    byteOffset = 0\n  } else if (byteOffset > 0x7fffffff) {\n    byteOffset = 0x7fffffff\n  } else if (byteOffset < -0x80000000) {\n    byteOffset = -0x80000000\n  }\n  byteOffset = +byteOffset // Coerce to Number.\n  if (numberIsNaN(byteOffset)) {\n    // byteOffset: it it's undefined, null, NaN, \"foo\", etc, search whole buffer\n    byteOffset = dir ? 0 : (buffer.length - 1)\n  }\n\n  // Normalize byteOffset: negative offsets start from the end of the buffer\n  if (byteOffset < 0) byteOffset = buffer.length + byteOffset\n  if (byteOffset >= buffer.length) {\n    if (dir) return -1\n    else byteOffset = buffer.length - 1\n  } else if (byteOffset < 0) {\n    if (dir) byteOffset = 0\n    else return -1\n  }\n\n  // Normalize val\n  if (typeof val === 'string') {\n    val = Buffer.from(val, encoding)\n  }\n\n  // Finally, search either indexOf (if dir is true) or lastIndexOf\n  if (Buffer.isBuffer(val)) {\n    // Special case: looking for empty string/buffer always fails\n    if (val.length === 0) {\n      return -1\n    }\n    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)\n  } else if (typeof val === 'number') {\n    val = val & 0xFF // Search for a byte value [0-255]\n    if (typeof Uint8Array.prototype.indexOf === 'function') {\n      if (dir) {\n        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)\n      } else {\n        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)\n      }\n    }\n    return arrayIndexOf(buffer, [val], byteOffset, encoding, dir)\n  }\n\n  throw new TypeError('val must be string, number or Buffer')\n}\n\nfunction arrayIndexOf (arr, val, byteOffset, encoding, dir) {\n  let indexSize = 1\n  let arrLength = arr.length\n  let valLength = val.length\n\n  if (encoding !== undefined) {\n    encoding = String(encoding).toLowerCase()\n    if (encoding === 'ucs2' || encoding === 'ucs-2' ||\n        encoding === 'utf16le' || encoding === 'utf-16le') {\n      if (arr.length < 2 || val.length < 2) {\n        return -1\n      }\n      indexSize = 2\n      arrLength /= 2\n      valLength /= 2\n      byteOffset /= 2\n    }\n  }\n\n  function read (buf, i) {\n    if (indexSize === 1) {\n      return buf[i]\n    } else {\n      return buf.readUInt16BE(i * indexSize)\n    }\n  }\n\n  let i\n  if (dir) {\n    let foundIndex = -1\n    for (i = byteOffset; i < arrLength; i++) {\n      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {\n        if (foundIndex === -1) foundIndex = i\n        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize\n      } else {\n        if (foundIndex !== -1) i -= i - foundIndex\n        foundIndex = -1\n      }\n    }\n  } else {\n    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength\n    for (i = byteOffset; i >= 0; i--) {\n      let found = true\n      for (let j = 0; j < valLength; j++) {\n        if (read(arr, i + j) !== read(val, j)) {\n          found = false\n          break\n        }\n      }\n      if (found) return i\n    }\n  }\n\n  return -1\n}\n\nBuffer.prototype.includes = function includes (val, byteOffset, encoding) {\n  return this.indexOf(val, byteOffset, encoding) !== -1\n}\n\nBuffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {\n  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)\n}\n\nBuffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {\n  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)\n}\n\nfunction hexWrite (buf, string, offset, length) {\n  offset = Number(offset) || 0\n  const remaining = buf.length - offset\n  if (!length) {\n    length = remaining\n  } else {\n    length = Number(length)\n    if (length > remaining) {\n      length = remaining\n    }\n  }\n\n  const strLen = string.length\n\n  if (length > strLen / 2) {\n    length = strLen / 2\n  }\n  let i\n  for (i = 0; i < length; ++i) {\n    const parsed = parseInt(string.substr(i * 2, 2), 16)\n    if (numberIsNaN(parsed)) return i\n    buf[offset + i] = parsed\n  }\n  return i\n}\n\nfunction utf8Write (buf, string, offset, length) {\n  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)\n}\n\nfunction asciiWrite (buf, string, offset, length) {\n  return blitBuffer(asciiToBytes(string), buf, offset, length)\n}\n\nfunction base64Write (buf, string, offset, length) {\n  return blitBuffer(base64ToBytes(string), buf, offset, length)\n}\n\nfunction ucs2Write (buf, string, offset, length) {\n  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)\n}\n\nBuffer.prototype.write = function write (string, offset, length, encoding) {\n  // Buffer#write(string)\n  if (offset === undefined) {\n    encoding = 'utf8'\n    length = this.length\n    offset = 0\n  // Buffer#write(string, encoding)\n  } else if (length === undefined && typeof offset === 'string') {\n    encoding = offset\n    length = this.length\n    offset = 0\n  // Buffer#write(string, offset[, length][, encoding])\n  } else if (isFinite(offset)) {\n    offset = offset >>> 0\n    if (isFinite(length)) {\n      length = length >>> 0\n      if (encoding === undefined) encoding = 'utf8'\n    } else {\n      encoding = length\n      length = undefined\n    }\n  } else {\n    throw new Error(\n      'Buffer.write(string, encoding, offset[, length]) is no longer supported'\n    )\n  }\n\n  const remaining = this.length - offset\n  if (length === undefined || length > remaining) length = remaining\n\n  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {\n    throw new RangeError('Attempt to write outside buffer bounds')\n  }\n\n  if (!encoding) encoding = 'utf8'\n\n  let loweredCase = false\n  for (;;) {\n    switch (encoding) {\n      case 'hex':\n        return hexWrite(this, string, offset, length)\n\n      case 'utf8':\n      case 'utf-8':\n        return utf8Write(this, string, offset, length)\n\n      case 'ascii':\n      case 'latin1':\n      case 'binary':\n        return asciiWrite(this, string, offset, length)\n\n      case 'base64':\n        // Warning: maxLength not taken into account in base64Write\n        return base64Write(this, string, offset, length)\n\n      case 'ucs2':\n      case 'ucs-2':\n      case 'utf16le':\n      case 'utf-16le':\n        return ucs2Write(this, string, offset, length)\n\n      default:\n        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)\n        encoding = ('' + encoding).toLowerCase()\n        loweredCase = true\n    }\n  }\n}\n\nBuffer.prototype.toJSON = function toJSON () {\n  return {\n    type: 'Buffer',\n    data: Array.prototype.slice.call(this._arr || this, 0)\n  }\n}\n\nfunction base64Slice (buf, start, end) {\n  if (start === 0 && end === buf.length) {\n    return base64.fromByteArray(buf)\n  } else {\n    return base64.fromByteArray(buf.slice(start, end))\n  }\n}\n\nfunction utf8Slice (buf, start, end) {\n  end = Math.min(buf.length, end)\n  const res = []\n\n  let i = start\n  while (i < end) {\n    const firstByte = buf[i]\n    let codePoint = null\n    let bytesPerSequence = (firstByte > 0xEF)\n      ? 4\n      : (firstByte > 0xDF)\n          ? 3\n          : (firstByte > 0xBF)\n              ? 2\n              : 1\n\n    if (i + bytesPerSequence <= end) {\n      let secondByte, thirdByte, fourthByte, tempCodePoint\n\n      switch (bytesPerSequence) {\n        case 1:\n          if (firstByte < 0x80) {\n            codePoint = firstByte\n          }\n          break\n        case 2:\n          secondByte = buf[i + 1]\n          if ((secondByte & 0xC0) === 0x80) {\n            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)\n            if (tempCodePoint > 0x7F) {\n              codePoint = tempCodePoint\n            }\n          }\n          break\n        case 3:\n          secondByte = buf[i + 1]\n          thirdByte = buf[i + 2]\n          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {\n            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)\n            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {\n              codePoint = tempCodePoint\n            }\n          }\n          break\n        case 4:\n          secondByte = buf[i + 1]\n          thirdByte = buf[i + 2]\n          fourthByte = buf[i + 3]\n          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {\n            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)\n            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {\n              codePoint = tempCodePoint\n            }\n          }\n      }\n    }\n\n    if (codePoint === null) {\n      // we did not generate a valid codePoint so insert a\n      // replacement char (U+FFFD) and advance only 1 byte\n      codePoint = 0xFFFD\n      bytesPerSequence = 1\n    } else if (codePoint > 0xFFFF) {\n      // encode to utf16 (surrogate pair dance)\n      codePoint -= 0x10000\n      res.push(codePoint >>> 10 & 0x3FF | 0xD800)\n      codePoint = 0xDC00 | codePoint & 0x3FF\n    }\n\n    res.push(codePoint)\n    i += bytesPerSequence\n  }\n\n  return decodeCodePointsArray(res)\n}\n\n// Based on http://stackoverflow.com/a/22747272/680742, the browser with\n// the lowest limit is Chrome, with 0x10000 args.\n// We go 1 magnitude less, for safety\nconst MAX_ARGUMENTS_LENGTH = 0x1000\n\nfunction decodeCodePointsArray (codePoints) {\n  const len = codePoints.length\n  if (len <= MAX_ARGUMENTS_LENGTH) {\n    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()\n  }\n\n  // Decode in chunks to avoid \"call stack size exceeded\".\n  let res = ''\n  let i = 0\n  while (i < len) {\n    res += String.fromCharCode.apply(\n      String,\n      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)\n    )\n  }\n  return res\n}\n\nfunction asciiSlice (buf, start, end) {\n  let ret = ''\n  end = Math.min(buf.length, end)\n\n  for (let i = start; i < end; ++i) {\n    ret += String.fromCharCode(buf[i] & 0x7F)\n  }\n  return ret\n}\n\nfunction latin1Slice (buf, start, end) {\n  let ret = ''\n  end = Math.min(buf.length, end)\n\n  for (let i = start; i < end; ++i) {\n    ret += String.fromCharCode(buf[i])\n  }\n  return ret\n}\n\nfunction hexSlice (buf, start, end) {\n  const len = buf.length\n\n  if (!start || start < 0) start = 0\n  if (!end || end < 0 || end > len) end = len\n\n  let out = ''\n  for (let i = start; i < end; ++i) {\n    out += hexSliceLookupTable[buf[i]]\n  }\n  return out\n}\n\nfunction utf16leSlice (buf, start, end) {\n  const bytes = buf.slice(start, end)\n  let res = ''\n  // If bytes.length is odd, the last 8 bits must be ignored (same as node.js)\n  for (let i = 0; i < bytes.length - 1; i += 2) {\n    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))\n  }\n  return res\n}\n\nBuffer.prototype.slice = function slice (start, end) {\n  const len = this.length\n  start = ~~start\n  end = end === undefined ? len : ~~end\n\n  if (start < 0) {\n    start += len\n    if (start < 0) start = 0\n  } else if (start > len) {\n    start = len\n  }\n\n  if (end < 0) {\n    end += len\n    if (end < 0) end = 0\n  } else if (end > len) {\n    end = len\n  }\n\n  if (end < start) end = start\n\n  const newBuf = this.subarray(start, end)\n  // Return an augmented `Uint8Array` instance\n  Object.setPrototypeOf(newBuf, Buffer.prototype)\n\n  return newBuf\n}\n\n/*\n * Need to make sure that buffer isn't trying to write out of bounds.\n */\nfunction checkOffset (offset, ext, length) {\n  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')\n  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')\n}\n\nBuffer.prototype.readUintLE =\nBuffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {\n  offset = offset >>> 0\n  byteLength = byteLength >>> 0\n  if (!noAssert) checkOffset(offset, byteLength, this.length)\n\n  let val = this[offset]\n  let mul = 1\n  let i = 0\n  while (++i < byteLength && (mul *= 0x100)) {\n    val += this[offset + i] * mul\n  }\n\n  return val\n}\n\nBuffer.prototype.readUintBE =\nBuffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {\n  offset = offset >>> 0\n  byteLength = byteLength >>> 0\n  if (!noAssert) {\n    checkOffset(offset, byteLength, this.length)\n  }\n\n  let val = this[offset + --byteLength]\n  let mul = 1\n  while (byteLength > 0 && (mul *= 0x100)) {\n    val += this[offset + --byteLength] * mul\n  }\n\n  return val\n}\n\nBuffer.prototype.readUint8 =\nBuffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {\n  offset = offset >>> 0\n  if (!noAssert) checkOffset(offset, 1, this.length)\n  return this[offset]\n}\n\nBuffer.prototype.readUint16LE =\nBuffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {\n  offset = offset >>> 0\n  if (!noAssert) checkOffset(offset, 2, this.length)\n  return this[offset] | (this[offset + 1] << 8)\n}\n\nBuffer.prototype.readUint16BE =\nBuffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {\n  offset = offset >>> 0\n  if (!noAssert) checkOffset(offset, 2, this.length)\n  return (this[offset] << 8) | this[offset + 1]\n}\n\nBuffer.prototype.readUint32LE =\nBuffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {\n  offset = offset >>> 0\n  if (!noAssert) checkOffset(offset, 4, this.length)\n\n  return ((this[offset]) |\n      (this[offset + 1] << 8) |\n      (this[offset + 2] << 16)) +\n      (this[offset + 3] * 0x1000000)\n}\n\nBuffer.prototype.readUint32BE =\nBuffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {\n  offset = offset >>> 0\n  if (!noAssert) checkOffset(offset, 4, this.length)\n\n  return (this[offset] * 0x1000000) +\n    ((this[offset + 1] << 16) |\n    (this[offset + 2] << 8) |\n    this[offset + 3])\n}\n\nBuffer.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE (offset) {\n  offset = offset >>> 0\n  validateNumber(offset, 'offset')\n  const first = this[offset]\n  const last = this[offset + 7]\n  if (first === undefined || last === undefined) {\n    boundsError(offset, this.length - 8)\n  }\n\n  const lo = first +\n    this[++offset] * 2 ** 8 +\n    this[++offset] * 2 ** 16 +\n    this[++offset] * 2 ** 24\n\n  const hi = this[++offset] +\n    this[++offset] * 2 ** 8 +\n    this[++offset] * 2 ** 16 +\n    last * 2 ** 24\n\n  return BigInt(lo) + (BigInt(hi) << BigInt(32))\n})\n\nBuffer.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE (offset) {\n  offset = offset >>> 0\n  validateNumber(offset, 'offset')\n  const first = this[offset]\n  const last = this[offset + 7]\n  if (first === undefined || last === undefined) {\n    boundsError(offset, this.length - 8)\n  }\n\n  const hi = first * 2 ** 24 +\n    this[++offset] * 2 ** 16 +\n    this[++offset] * 2 ** 8 +\n    this[++offset]\n\n  const lo = this[++offset] * 2 ** 24 +\n    this[++offset] * 2 ** 16 +\n    this[++offset] * 2 ** 8 +\n    last\n\n  return (BigInt(hi) << BigInt(32)) + BigInt(lo)\n})\n\nBuffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {\n  offset = offset >>> 0\n  byteLength = byteLength >>> 0\n  if (!noAssert) checkOffset(offset, byteLength, this.length)\n\n  let val = this[offset]\n  let mul = 1\n  let i = 0\n  while (++i < byteLength && (mul *= 0x100)) {\n    val += this[offset + i] * mul\n  }\n  mul *= 0x80\n\n  if (val >= mul) val -= Math.pow(2, 8 * byteLength)\n\n  return val\n}\n\nBuffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {\n  offset = offset >>> 0\n  byteLength = byteLength >>> 0\n  if (!noAssert) checkOffset(offset, byteLength, this.length)\n\n  let i = byteLength\n  let mul = 1\n  let val = this[offset + --i]\n  while (i > 0 && (mul *= 0x100)) {\n    val += this[offset + --i] * mul\n  }\n  mul *= 0x80\n\n  if (val >= mul) val -= Math.pow(2, 8 * byteLength)\n\n  return val\n}\n\nBuffer.prototype.readInt8 = function readInt8 (offset, noAssert) {\n  offset = offset >>> 0\n  if (!noAssert) checkOffset(offset, 1, this.length)\n  if (!(this[offset] & 0x80)) return (this[offset])\n  return ((0xff - this[offset] + 1) * -1)\n}\n\nBuffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {\n  offset = offset >>> 0\n  if (!noAssert) checkOffset(offset, 2, this.length)\n  const val = this[offset] | (this[offset + 1] << 8)\n  return (val & 0x8000) ? val | 0xFFFF0000 : val\n}\n\nBuffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {\n  offset = offset >>> 0\n  if (!noAssert) checkOffset(offset, 2, this.length)\n  const val = this[offset + 1] | (this[offset] << 8)\n  return (val & 0x8000) ? val | 0xFFFF0000 : val\n}\n\nBuffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {\n  offset = offset >>> 0\n  if (!noAssert) checkOffset(offset, 4, this.length)\n\n  return (this[offset]) |\n    (this[offset + 1] << 8) |\n    (this[offset + 2] << 16) |\n    (this[offset + 3] << 24)\n}\n\nBuffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {\n  offset = offset >>> 0\n  if (!noAssert) checkOffset(offset, 4, this.length)\n\n  return (this[offset] << 24) |\n    (this[offset + 1] << 16) |\n    (this[offset + 2] << 8) |\n    (this[offset + 3])\n}\n\nBuffer.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE (offset) {\n  offset = offset >>> 0\n  validateNumber(offset, 'offset')\n  const first = this[offset]\n  const last = this[offset + 7]\n  if (first === undefined || last === undefined) {\n    boundsError(offset, this.length - 8)\n  }\n\n  const val = this[offset + 4] +\n    this[offset + 5] * 2 ** 8 +\n    this[offset + 6] * 2 ** 16 +\n    (last << 24) // Overflow\n\n  return (BigInt(val) << BigInt(32)) +\n    BigInt(first +\n    this[++offset] * 2 ** 8 +\n    this[++offset] * 2 ** 16 +\n    this[++offset] * 2 ** 24)\n})\n\nBuffer.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE (offset) {\n  offset = offset >>> 0\n  validateNumber(offset, 'offset')\n  const first = this[offset]\n  const last = this[offset + 7]\n  if (first === undefined || last === undefined) {\n    boundsError(offset, this.length - 8)\n  }\n\n  const val = (first << 24) + // Overflow\n    this[++offset] * 2 ** 16 +\n    this[++offset] * 2 ** 8 +\n    this[++offset]\n\n  return (BigInt(val) << BigInt(32)) +\n    BigInt(this[++offset] * 2 ** 24 +\n    this[++offset] * 2 ** 16 +\n    this[++offset] * 2 ** 8 +\n    last)\n})\n\nBuffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {\n  offset = offset >>> 0\n  if (!noAssert) checkOffset(offset, 4, this.length)\n  return ieee754.read(this, offset, true, 23, 4)\n}\n\nBuffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {\n  offset = offset >>> 0\n  if (!noAssert) checkOffset(offset, 4, this.length)\n  return ieee754.read(this, offset, false, 23, 4)\n}\n\nBuffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {\n  offset = offset >>> 0\n  if (!noAssert) checkOffset(offset, 8, this.length)\n  return ieee754.read(this, offset, true, 52, 8)\n}\n\nBuffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {\n  offset = offset >>> 0\n  if (!noAssert) checkOffset(offset, 8, this.length)\n  return ieee754.read(this, offset, false, 52, 8)\n}\n\nfunction checkInt (buf, value, offset, ext, max, min) {\n  if (!Buffer.isBuffer(buf)) throw new TypeError('\"buffer\" argument must be a Buffer instance')\n  if (value > max || value < min) throw new RangeError('\"value\" argument is out of bounds')\n  if (offset + ext > buf.length) throw new RangeError('Index out of range')\n}\n\nBuffer.prototype.writeUintLE =\nBuffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {\n  value = +value\n  offset = offset >>> 0\n  byteLength = byteLength >>> 0\n  if (!noAssert) {\n    const maxBytes = Math.pow(2, 8 * byteLength) - 1\n    checkInt(this, value, offset, byteLength, maxBytes, 0)\n  }\n\n  let mul = 1\n  let i = 0\n  this[offset] = value & 0xFF\n  while (++i < byteLength && (mul *= 0x100)) {\n    this[offset + i] = (value / mul) & 0xFF\n  }\n\n  return offset + byteLength\n}\n\nBuffer.prototype.writeUintBE =\nBuffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {\n  value = +value\n  offset = offset >>> 0\n  byteLength = byteLength >>> 0\n  if (!noAssert) {\n    const maxBytes = Math.pow(2, 8 * byteLength) - 1\n    checkInt(this, value, offset, byteLength, maxBytes, 0)\n  }\n\n  let i = byteLength - 1\n  let mul = 1\n  this[offset + i] = value & 0xFF\n  while (--i >= 0 && (mul *= 0x100)) {\n    this[offset + i] = (value / mul) & 0xFF\n  }\n\n  return offset + byteLength\n}\n\nBuffer.prototype.writeUint8 =\nBuffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {\n  value = +value\n  offset = offset >>> 0\n  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)\n  this[offset] = (value & 0xff)\n  return offset + 1\n}\n\nBuffer.prototype.writeUint16LE =\nBuffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {\n  value = +value\n  offset = offset >>> 0\n  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)\n  this[offset] = (value & 0xff)\n  this[offset + 1] = (value >>> 8)\n  return offset + 2\n}\n\nBuffer.prototype.writeUint16BE =\nBuffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {\n  value = +value\n  offset = offset >>> 0\n  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)\n  this[offset] = (value >>> 8)\n  this[offset + 1] = (value & 0xff)\n  return offset + 2\n}\n\nBuffer.prototype.writeUint32LE =\nBuffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {\n  value = +value\n  offset = offset >>> 0\n  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)\n  this[offset + 3] = (value >>> 24)\n  this[offset + 2] = (value >>> 16)\n  this[offset + 1] = (value >>> 8)\n  this[offset] = (value & 0xff)\n  return offset + 4\n}\n\nBuffer.prototype.writeUint32BE =\nBuffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {\n  value = +value\n  offset = offset >>> 0\n  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)\n  this[offset] = (value >>> 24)\n  this[offset + 1] = (value >>> 16)\n  this[offset + 2] = (value >>> 8)\n  this[offset + 3] = (value & 0xff)\n  return offset + 4\n}\n\nfunction wrtBigUInt64LE (buf, value, offset, min, max) {\n  checkIntBI(value, min, max, buf, offset, 7)\n\n  let lo = Number(value & BigInt(0xffffffff))\n  buf[offset++] = lo\n  lo = lo >> 8\n  buf[offset++] = lo\n  lo = lo >> 8\n  buf[offset++] = lo\n  lo = lo >> 8\n  buf[offset++] = lo\n  let hi = Number(value >> BigInt(32) & BigInt(0xffffffff))\n  buf[offset++] = hi\n  hi = hi >> 8\n  buf[offset++] = hi\n  hi = hi >> 8\n  buf[offset++] = hi\n  hi = hi >> 8\n  buf[offset++] = hi\n  return offset\n}\n\nfunction wrtBigUInt64BE (buf, value, offset, min, max) {\n  checkIntBI(value, min, max, buf, offset, 7)\n\n  let lo = Number(value & BigInt(0xffffffff))\n  buf[offset + 7] = lo\n  lo = lo >> 8\n  buf[offset + 6] = lo\n  lo = lo >> 8\n  buf[offset + 5] = lo\n  lo = lo >> 8\n  buf[offset + 4] = lo\n  let hi = Number(value >> BigInt(32) & BigInt(0xffffffff))\n  buf[offset + 3] = hi\n  hi = hi >> 8\n  buf[offset + 2] = hi\n  hi = hi >> 8\n  buf[offset + 1] = hi\n  hi = hi >> 8\n  buf[offset] = hi\n  return offset + 8\n}\n\nBuffer.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE (value, offset = 0) {\n  return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt('0xffffffffffffffff'))\n})\n\nBuffer.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE (value, offset = 0) {\n  return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt('0xffffffffffffffff'))\n})\n\nBuffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {\n  value = +value\n  offset = offset >>> 0\n  if (!noAssert) {\n    const limit = Math.pow(2, (8 * byteLength) - 1)\n\n    checkInt(this, value, offset, byteLength, limit - 1, -limit)\n  }\n\n  let i = 0\n  let mul = 1\n  let sub = 0\n  this[offset] = value & 0xFF\n  while (++i < byteLength && (mul *= 0x100)) {\n    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {\n      sub = 1\n    }\n    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF\n  }\n\n  return offset + byteLength\n}\n\nBuffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {\n  value = +value\n  offset = offset >>> 0\n  if (!noAssert) {\n    const limit = Math.pow(2, (8 * byteLength) - 1)\n\n    checkInt(this, value, offset, byteLength, limit - 1, -limit)\n  }\n\n  let i = byteLength - 1\n  let mul = 1\n  let sub = 0\n  this[offset + i] = value & 0xFF\n  while (--i >= 0 && (mul *= 0x100)) {\n    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {\n      sub = 1\n    }\n    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF\n  }\n\n  return offset + byteLength\n}\n\nBuffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {\n  value = +value\n  offset = offset >>> 0\n  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)\n  if (value < 0) value = 0xff + value + 1\n  this[offset] = (value & 0xff)\n  return offset + 1\n}\n\nBuffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {\n  value = +value\n  offset = offset >>> 0\n  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)\n  this[offset] = (value & 0xff)\n  this[offset + 1] = (value >>> 8)\n  return offset + 2\n}\n\nBuffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {\n  value = +value\n  offset = offset >>> 0\n  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)\n  this[offset] = (value >>> 8)\n  this[offset + 1] = (value & 0xff)\n  return offset + 2\n}\n\nBuffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {\n  value = +value\n  offset = offset >>> 0\n  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)\n  this[offset] = (value & 0xff)\n  this[offset + 1] = (value >>> 8)\n  this[offset + 2] = (value >>> 16)\n  this[offset + 3] = (value >>> 24)\n  return offset + 4\n}\n\nBuffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {\n  value = +value\n  offset = offset >>> 0\n  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)\n  if (value < 0) value = 0xffffffff + value + 1\n  this[offset] = (value >>> 24)\n  this[offset + 1] = (value >>> 16)\n  this[offset + 2] = (value >>> 8)\n  this[offset + 3] = (value & 0xff)\n  return offset + 4\n}\n\nBuffer.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE (value, offset = 0) {\n  return wrtBigUInt64LE(this, value, offset, -BigInt('0x8000000000000000'), BigInt('0x7fffffffffffffff'))\n})\n\nBuffer.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE (value, offset = 0) {\n  return wrtBigUInt64BE(this, value, offset, -BigInt('0x8000000000000000'), BigInt('0x7fffffffffffffff'))\n})\n\nfunction checkIEEE754 (buf, value, offset, ext, max, min) {\n  if (offset + ext > buf.length) throw new RangeError('Index out of range')\n  if (offset < 0) throw new RangeError('Index out of range')\n}\n\nfunction writeFloat (buf, value, offset, littleEndian, noAssert) {\n  value = +value\n  offset = offset >>> 0\n  if (!noAssert) {\n    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)\n  }\n  ieee754.write(buf, value, offset, littleEndian, 23, 4)\n  return offset + 4\n}\n\nBuffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {\n  return writeFloat(this, value, offset, true, noAssert)\n}\n\nBuffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {\n  return writeFloat(this, value, offset, false, noAssert)\n}\n\nfunction writeDouble (buf, value, offset, littleEndian, noAssert) {\n  value = +value\n  offset = offset >>> 0\n  if (!noAssert) {\n    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)\n  }\n  ieee754.write(buf, value, offset, littleEndian, 52, 8)\n  return offset + 8\n}\n\nBuffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {\n  return writeDouble(this, value, offset, true, noAssert)\n}\n\nBuffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {\n  return writeDouble(this, value, offset, false, noAssert)\n}\n\n// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)\nBuffer.prototype.copy = function copy (target, targetStart, start, end) {\n  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')\n  if (!start) start = 0\n  if (!end && end !== 0) end = this.length\n  if (targetStart >= target.length) targetStart = target.length\n  if (!targetStart) targetStart = 0\n  if (end > 0 && end < start) end = start\n\n  // Copy 0 bytes; we're done\n  if (end === start) return 0\n  if (target.length === 0 || this.length === 0) return 0\n\n  // Fatal error conditions\n  if (targetStart < 0) {\n    throw new RangeError('targetStart out of bounds')\n  }\n  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')\n  if (end < 0) throw new RangeError('sourceEnd out of bounds')\n\n  // Are we oob?\n  if (end > this.length) end = this.length\n  if (target.length - targetStart < end - start) {\n    end = target.length - targetStart + start\n  }\n\n  const len = end - start\n\n  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {\n    // Use built-in when available, missing from IE11\n    this.copyWithin(targetStart, start, end)\n  } else {\n    Uint8Array.prototype.set.call(\n      target,\n      this.subarray(start, end),\n      targetStart\n    )\n  }\n\n  return len\n}\n\n// Usage:\n//    buffer.fill(number[, offset[, end]])\n//    buffer.fill(buffer[, offset[, end]])\n//    buffer.fill(string[, offset[, end]][, encoding])\nBuffer.prototype.fill = function fill (val, start, end, encoding) {\n  // Handle string cases:\n  if (typeof val === 'string') {\n    if (typeof start === 'string') {\n      encoding = start\n      start = 0\n      end = this.length\n    } else if (typeof end === 'string') {\n      encoding = end\n      end = this.length\n    }\n    if (encoding !== undefined && typeof encoding !== 'string') {\n      throw new TypeError('encoding must be a string')\n    }\n    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {\n      throw new TypeError('Unknown encoding: ' + encoding)\n    }\n    if (val.length === 1) {\n      const code = val.charCodeAt(0)\n      if ((encoding === 'utf8' && code < 128) ||\n          encoding === 'latin1') {\n        // Fast path: If `val` fits into a single byte, use that numeric value.\n        val = code\n      }\n    }\n  } else if (typeof val === 'number') {\n    val = val & 255\n  } else if (typeof val === 'boolean') {\n    val = Number(val)\n  }\n\n  // Invalid ranges are not set to a default, so can range check early.\n  if (start < 0 || this.length < start || this.length < end) {\n    throw new RangeError('Out of range index')\n  }\n\n  if (end <= start) {\n    return this\n  }\n\n  start = start >>> 0\n  end = end === undefined ? this.length : end >>> 0\n\n  if (!val) val = 0\n\n  let i\n  if (typeof val === 'number') {\n    for (i = start; i < end; ++i) {\n      this[i] = val\n    }\n  } else {\n    const bytes = Buffer.isBuffer(val)\n      ? val\n      : Buffer.from(val, encoding)\n    const len = bytes.length\n    if (len === 0) {\n      throw new TypeError('The value \"' + val +\n        '\" is invalid for argument \"value\"')\n    }\n    for (i = 0; i < end - start; ++i) {\n      this[i + start] = bytes[i % len]\n    }\n  }\n\n  return this\n}\n\n// CUSTOM ERRORS\n// =============\n\n// Simplified versions from Node, changed for Buffer-only usage\nconst errors = {}\nfunction E (sym, getMessage, Base) {\n  errors[sym] = class NodeError extends Base {\n    constructor () {\n      super()\n\n      Object.defineProperty(this, 'message', {\n        value: getMessage.apply(this, arguments),\n        writable: true,\n        configurable: true\n      })\n\n      // Add the error code to the name to include it in the stack trace.\n      this.name = `${this.name} [${sym}]`\n      // Access the stack to generate the error message including the error code\n      // from the name.\n      this.stack // eslint-disable-line no-unused-expressions\n      // Reset the name to the actual name.\n      delete this.name\n    }\n\n    get code () {\n      return sym\n    }\n\n    set code (value) {\n      Object.defineProperty(this, 'code', {\n        configurable: true,\n        enumerable: true,\n        value,\n        writable: true\n      })\n    }\n\n    toString () {\n      return `${this.name} [${sym}]: ${this.message}`\n    }\n  }\n}\n\nE('ERR_BUFFER_OUT_OF_BOUNDS',\n  function (name) {\n    if (name) {\n      return `${name} is outside of buffer bounds`\n    }\n\n    return 'Attempt to access memory outside buffer bounds'\n  }, RangeError)\nE('ERR_INVALID_ARG_TYPE',\n  function (name, actual) {\n    return `The \"${name}\" argument must be of type number. Received type ${typeof actual}`\n  }, TypeError)\nE('ERR_OUT_OF_RANGE',\n  function (str, range, input) {\n    let msg = `The value of \"${str}\" is out of range.`\n    let received = input\n    if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {\n      received = addNumericalSeparator(String(input))\n    } else if (typeof input === 'bigint') {\n      received = String(input)\n      if (input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32))) {\n        received = addNumericalSeparator(received)\n      }\n      received += 'n'\n    }\n    msg += ` It must be ${range}. Received ${received}`\n    return msg\n  }, RangeError)\n\nfunction addNumericalSeparator (val) {\n  let res = ''\n  let i = val.length\n  const start = val[0] === '-' ? 1 : 0\n  for (; i >= start + 4; i -= 3) {\n    res = `_${val.slice(i - 3, i)}${res}`\n  }\n  return `${val.slice(0, i)}${res}`\n}\n\n// CHECK FUNCTIONS\n// ===============\n\nfunction checkBounds (buf, offset, byteLength) {\n  validateNumber(offset, 'offset')\n  if (buf[offset] === undefined || buf[offset + byteLength] === undefined) {\n    boundsError(offset, buf.length - (byteLength + 1))\n  }\n}\n\nfunction checkIntBI (value, min, max, buf, offset, byteLength) {\n  if (value > max || value < min) {\n    const n = typeof min === 'bigint' ? 'n' : ''\n    let range\n    if (byteLength > 3) {\n      if (min === 0 || min === BigInt(0)) {\n        range = `>= 0${n} and < 2${n} ** ${(byteLength + 1) * 8}${n}`\n      } else {\n        range = `>= -(2${n} ** ${(byteLength + 1) * 8 - 1}${n}) and < 2 ** ` +\n                `${(byteLength + 1) * 8 - 1}${n}`\n      }\n    } else {\n      range = `>= ${min}${n} and <= ${max}${n}`\n    }\n    throw new errors.ERR_OUT_OF_RANGE('value', range, value)\n  }\n  checkBounds(buf, offset, byteLength)\n}\n\nfunction validateNumber (value, name) {\n  if (typeof value !== 'number') {\n    throw new errors.ERR_INVALID_ARG_TYPE(name, 'number', value)\n  }\n}\n\nfunction boundsError (value, length, type) {\n  if (Math.floor(value) !== value) {\n    validateNumber(value, type)\n    throw new errors.ERR_OUT_OF_RANGE(type || 'offset', 'an integer', value)\n  }\n\n  if (length < 0) {\n    throw new errors.ERR_BUFFER_OUT_OF_BOUNDS()\n  }\n\n  throw new errors.ERR_OUT_OF_RANGE(type || 'offset',\n                                    `>= ${type ? 1 : 0} and <= ${length}`,\n                                    value)\n}\n\n// HELPER FUNCTIONS\n// ================\n\nconst INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g\n\nfunction base64clean (str) {\n  // Node takes equal signs as end of the Base64 encoding\n  str = str.split('=')[0]\n  // Node strips out invalid characters like \\n and \\t from the string, base64-js does not\n  str = str.trim().replace(INVALID_BASE64_RE, '')\n  // Node converts strings with length < 2 to ''\n  if (str.length < 2) return ''\n  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not\n  while (str.length % 4 !== 0) {\n    str = str + '='\n  }\n  return str\n}\n\nfunction utf8ToBytes (string, units) {\n  units = units || Infinity\n  let codePoint\n  const length = string.length\n  let leadSurrogate = null\n  const bytes = []\n\n  for (let i = 0; i < length; ++i) {\n    codePoint = string.charCodeAt(i)\n\n    // is surrogate component\n    if (codePoint > 0xD7FF && codePoint < 0xE000) {\n      // last char was a lead\n      if (!leadSurrogate) {\n        // no lead yet\n        if (codePoint > 0xDBFF) {\n          // unexpected trail\n          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)\n          continue\n        } else if (i + 1 === length) {\n          // unpaired lead\n          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)\n          continue\n        }\n\n        // valid lead\n        leadSurrogate = codePoint\n\n        continue\n      }\n\n      // 2 leads in a row\n      if (codePoint < 0xDC00) {\n        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)\n        leadSurrogate = codePoint\n        continue\n      }\n\n      // valid surrogate pair\n      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000\n    } else if (leadSurrogate) {\n      // valid bmp char, but last char was a lead\n      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)\n    }\n\n    leadSurrogate = null\n\n    // encode utf8\n    if (codePoint < 0x80) {\n      if ((units -= 1) < 0) break\n      bytes.push(codePoint)\n    } else if (codePoint < 0x800) {\n      if ((units -= 2) < 0) break\n      bytes.push(\n        codePoint >> 0x6 | 0xC0,\n        codePoint & 0x3F | 0x80\n      )\n    } else if (codePoint < 0x10000) {\n      if ((units -= 3) < 0) break\n      bytes.push(\n        codePoint >> 0xC | 0xE0,\n        codePoint >> 0x6 & 0x3F | 0x80,\n        codePoint & 0x3F | 0x80\n      )\n    } else if (codePoint < 0x110000) {\n      if ((units -= 4) < 0) break\n      bytes.push(\n        codePoint >> 0x12 | 0xF0,\n        codePoint >> 0xC & 0x3F | 0x80,\n        codePoint >> 0x6 & 0x3F | 0x80,\n        codePoint & 0x3F | 0x80\n      )\n    } else {\n      throw new Error('Invalid code point')\n    }\n  }\n\n  return bytes\n}\n\nfunction asciiToBytes (str) {\n  const byteArray = []\n  for (let i = 0; i < str.length; ++i) {\n    // Node's code seems to be doing this and not & 0x7F..\n    byteArray.push(str.charCodeAt(i) & 0xFF)\n  }\n  return byteArray\n}\n\nfunction utf16leToBytes (str, units) {\n  let c, hi, lo\n  const byteArray = []\n  for (let i = 0; i < str.length; ++i) {\n    if ((units -= 2) < 0) break\n\n    c = str.charCodeAt(i)\n    hi = c >> 8\n    lo = c % 256\n    byteArray.push(lo)\n    byteArray.push(hi)\n  }\n\n  return byteArray\n}\n\nfunction base64ToBytes (str) {\n  return base64.toByteArray(base64clean(str))\n}\n\nfunction blitBuffer (src, dst, offset, length) {\n  let i\n  for (i = 0; i < length; ++i) {\n    if ((i + offset >= dst.length) || (i >= src.length)) break\n    dst[i + offset] = src[i]\n  }\n  return i\n}\n\n// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass\n// the `instanceof` check but they should be treated as of that type.\n// See: https://github.com/feross/buffer/issues/166\nfunction isInstance (obj, type) {\n  return obj instanceof type ||\n    (obj != null && obj.constructor != null && obj.constructor.name != null &&\n      obj.constructor.name === type.name)\n}\nfunction numberIsNaN (obj) {\n  // For IE11 support\n  return obj !== obj // eslint-disable-line no-self-compare\n}\n\n// Create lookup table for `toString('hex')`\n// See: https://github.com/feross/buffer/issues/219\nconst hexSliceLookupTable = (function () {\n  const alphabet = '0123456789abcdef'\n  const table = new Array(256)\n  for (let i = 0; i < 16; ++i) {\n    const i16 = i * 16\n    for (let j = 0; j < 16; ++j) {\n      table[i16 + j] = alphabet[i] + alphabet[j]\n    }\n  }\n  return table\n})()\n\n// Return not function with Error if BigInt not supported\nfunction defineBigIntMethod (fn) {\n  return typeof BigInt === 'undefined' ? BufferBigIntNotDefined : fn\n}\n\nfunction BufferBigIntNotDefined () {\n  throw new Error('BigInt not supported')\n}\n\n\n//# sourceURL=webpack://seeso/./node_modules/buffer/index.js?");

/***/ }),

/***/ "./node_modules/ieee754/index.js":
/*!***************************************!*\
  !*** ./node_modules/ieee754/index.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */\nexports.read = function (buffer, offset, isLE, mLen, nBytes) {\n  var e, m\n  var eLen = (nBytes * 8) - mLen - 1\n  var eMax = (1 << eLen) - 1\n  var eBias = eMax >> 1\n  var nBits = -7\n  var i = isLE ? (nBytes - 1) : 0\n  var d = isLE ? -1 : 1\n  var s = buffer[offset + i]\n\n  i += d\n\n  e = s & ((1 << (-nBits)) - 1)\n  s >>= (-nBits)\n  nBits += eLen\n  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}\n\n  m = e & ((1 << (-nBits)) - 1)\n  e >>= (-nBits)\n  nBits += mLen\n  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}\n\n  if (e === 0) {\n    e = 1 - eBias\n  } else if (e === eMax) {\n    return m ? NaN : ((s ? -1 : 1) * Infinity)\n  } else {\n    m = m + Math.pow(2, mLen)\n    e = e - eBias\n  }\n  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)\n}\n\nexports.write = function (buffer, value, offset, isLE, mLen, nBytes) {\n  var e, m, c\n  var eLen = (nBytes * 8) - mLen - 1\n  var eMax = (1 << eLen) - 1\n  var eBias = eMax >> 1\n  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)\n  var i = isLE ? 0 : (nBytes - 1)\n  var d = isLE ? 1 : -1\n  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0\n\n  value = Math.abs(value)\n\n  if (isNaN(value) || value === Infinity) {\n    m = isNaN(value) ? 1 : 0\n    e = eMax\n  } else {\n    e = Math.floor(Math.log(value) / Math.LN2)\n    if (value * (c = Math.pow(2, -e)) < 1) {\n      e--\n      c *= 2\n    }\n    if (e + eBias >= 1) {\n      value += rt / c\n    } else {\n      value += rt * Math.pow(2, 1 - eBias)\n    }\n    if (value * c >= 2) {\n      e++\n      c /= 2\n    }\n\n    if (e + eBias >= eMax) {\n      m = 0\n      e = eMax\n    } else if (e + eBias >= 1) {\n      m = ((value * c) - 1) * Math.pow(2, mLen)\n      e = e + eBias\n    } else {\n      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)\n      e = 0\n    }\n  }\n\n  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}\n\n  e = (e << mLen) | m\n  eLen += mLen\n  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}\n\n  buffer[offset + i - d] |= s * 128\n}\n\n\n//# sourceURL=webpack://seeso/./node_modules/ieee754/index.js?");

/***/ }),

/***/ "./node_modules/wasm-check/dist/wasm-check.min.js":
/*!********************************************************!*\
  !*** ./node_modules/wasm-check/dist/wasm-check.min.js ***!
  \********************************************************/
/***/ ((module) => {

"use strict";
eval("function e(e,r){if(!f)return!1;const n=e.buffer;let u=l.get(n);if(null==u){if((u=t.validate(n))&&r)try{new t.Instance(new t.Module(n)).exports[0]()}catch(e){u=!1}l.set(n,u)}return u}const t=WebAssembly,r=(...e)=>Uint8Array.of(0,97,115,109,1,0,0,0,...e),n=(...e)=>Uint32Array.of(1836278016,1,...e),u=(...e)=>r(1,4,1,96,0,0,3,2,1,0,...e,11,0,10,4,110,97,109,101,2,3,1,0,0),i=(...e)=>Uint16Array.of(24832,28019,1,0,1025,24577,0,515,1,...e),o=(...e)=>n(1610679297,33751040,...e,40239360,259),a=(...e)=>i(...e,2842,4096,28164,28001,357,260,256,560,259,0),s=(...e)=>i(...e,2560,28164,28001,613,259,0),f=\"object\"==typeof t,g=e=>f&&\"function\"==typeof e,l=new WeakMap,c=n(1610679553,58589440,117440770,805372165,101318656,1107297281,268438272,1835101700,17039717,36700416,259),p=s(773,1,2561,269,11,65,65,65,3068,2816),y=s(781,1,2560,265,7,16390,2311,2827),b=r(2,8,1,1,97,1,98,3,127,1,6,6,1,127,1,65,0,11,7,5,1,1,97,3,1,0,8,4,110,97,109,101,2,1,0),m=Uint16Array.of(24832,28019,1,0,1537,24577,512,32639,515,1,2058,1537,16640,16640,2816,2560,28164,28001,613,259,0),A=a(3082,2561,17152,0,0,252),d=a(2058,1537,16640,49152),U=o(101318657,301990913,268438272,1835101700,17039717),x=u(5,4,1,3,1,1,10,7,1,5,0,254,3,0),w=o(84344833,6357249,17369600,4259847,186257917,1845758464),M=u(10,7,1,5,0,208,112,26);module.exports={support:(t=1)=>f&&e(Uint32Array.of(1836278016,t)),get supportStreaming(){return g(t.instantiateStreaming)},feature:{get bigInt(){return e(c,!0)},get bulk(){return e(p)},get exceptions(){return e(y)},get mutableGlobal(){return e(b)},get multiValue(){return e(m)},get saturateConversions(){return e(A)},get signExtensions(){return e(d)},get tailCall(){return e(U)},get threads(){return e(x)},get simd(){return e(w)},get references(){return e(M)},get typeReflection(){return g(t.Memory.type)},get funcReferences(){return g(t.Function)}}};\n\n//# sourceURL=webpack://seeso/./node_modules/wasm-check/dist/wasm-check.min.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./lib/seeso.js");
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});
},{}],"../../node_modules/seeso/easy-seeso.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _seeso = _interopRequireWildcard(require("seeso"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
class EasySeeso {
  constructor() {
    this.seeso = new _seeso.default();
    this.onGaze = null;
    this.onDebug = null;
    // calibration
    this.onCalibrationNextPoint = null;
    this.onCalibrationProgress = null;
    this.onCalibrationFinished = null;
    // user status
    this.onAttention = null;
    this.onBlink = null;
    this.onDrowsiness = null;
    this.onGazeBind = null;
    this.onCalibrationFinishedBind = null;
  }
  async init(licenseKey, afterInitialized, afterFailed, userStatusOption) {
    await this.seeso.initialize(licenseKey, userStatusOption).then(function (errCode) {
      if (errCode === _seeso.InitializationErrorType.ERROR_NONE) {
        afterInitialized();
        this.onCalibrationFinishedBind = this.onCalibrationFinished_.bind(this);
        this.seeso.addCalibrationFinishCallback(this.onCalibrationFinishedBind);
        this.onGazeBind = this.onGaze_.bind(this);
        this.seeso.addGazeCallback(this.onGazeBind);
      } else {
        afterFailed();
      }
    }.bind(this));
  }
  deinit() {
    this.removeUserStatusCallback();
    this.seeso.removeGazeCallback(this.onGazeBind);
    this.seeso.removeCalibrationFinishCallback(this.onCalibrationFinishedBind);
    this.seeso.removeDebugCallback(this.onDebug);
    this.seeso.deinitialize();
  }
  async startTracking(onGaze, onDebug) {
    const stream = await navigator.mediaDevices.getUserMedia({
      'video': true
    });
    this.seeso.addDebugCallback(onDebug);
    if (this.seeso.startTracking(stream)) {
      this.onGaze = onGaze;
      this.onDebug = onDebug;
      return true;
    } else {
      this.seeso.removeDebugCallback(this.onDebug);
      return false;
    }
  }
  stopTracking() {
    this.seeso.stopTracking();
    this.seeso.removeDebugCallback(this.onDebug);
    this.onGaze = null;
    this.onDebug = null;
  }
  setUserStatusCallback(onAttention, onBlink, onDrowsiness) {
    this.seeso.addAttentionCallback(onAttention);
    this.seeso.addBlinkCallback(onBlink);
    this.seeso.addDrowsinessCallback(onDrowsiness);
    this.onAttention = onAttention;
    this.onBlink = onBlink;
    this.onDrowsiness = onDrowsiness;
  }
  removeUserStatusCallback() {
    this.seeso.removeAttentionCallback(this.onAttention);
    this.seeso.removeBlinkCallback(this.onBlink);
    this.seeso.removeDrowsinessCallback(this.onDrowsiness);
  }
  startCalibration(onCalibrationNextPoint, onCalibrationProgress, onCalibrationFinished, calibrationPoints = 5) {
    this.seeso.addCalibrationNextPointCallback(onCalibrationNextPoint);
    this.seeso.addCalibrationProgressCallback(onCalibrationProgress);
    const isStart = this.seeso.startCalibration(calibrationPoints, _seeso.CalibrationAccuracyCriteria.Default);
    if (isStart) {
      this.onCalibrationNextPoint = onCalibrationNextPoint;
      this.onCalibrationProgress = onCalibrationProgress;
      this.onCalibrationFinished = onCalibrationFinished;
    } else {
      this.seeso.removeCalibrationNextPointCallback(this.onCalibrationNextPoint);
      this.seeso.removeCalibrationProgressCallback(this.onCalibrationProgress);
    }
    return isStart;
  }
  stopCalibration() {
    return this.seeso.stopCalibration();
  }
  setTrackingFps(fps) {
    this.seeso.setTrackingFps(fps);
  }
  async fetchCalibrationData(userId) {
    return this.seeso.fetchCalibrationData(userId);
  }
  async uploadCalibrationData(userId) {
    return this.seeso.uploadCalibrationData(userId);
  }
  showImage() {
    this.seeso.showImage();
  }
  hideImage() {
    this.seeso.hideImage();
  }
  startCollectSamples() {
    this.seeso.startCollectSamples();
  }
  setMonitorSize(monitorInch) {
    this.seeso.setMonitorSize(monitorInch);
  }
  setFaceDistance(faceDistance) {
    this.seeso.setFaceDistance(faceDistance);
  }
  setCameraPosition(cameraX, cameraOnTop) {
    this.seeso.setCameraPosition(cameraX, cameraOnTop);
  }
  getCameraPosition() {
    return this.seeso.getCameraPosition();
  }
  getFaceDistance() {
    return this.seeso.getFaceDistance();
  }
  getMonitorSize() {
    return this.seeso.getMonitorSize();
  }
  async setCalibrationData(calibrationDataString) {
    await this.seeso.setCalibrationData(calibrationDataString);
  }
  static openCalibrationPage(licenseKey, userId, redirectUrl, calibraitonPoint) {
    _seeso.default.openCalibrationPage(licenseKey, userId, redirectUrl, calibraitonPoint);
  }
  static openCalibrationPageQuickStart(licenseKey, userId, redirectUrl, calibraitonPoint) {
    _seeso.default.openCalibrationPageQuickStart(licenseKey, userId, redirectUrl, calibraitonPoint);
  }
  setAttentionInterval(interval) {
    this.seeso.setAttentionInterval(interval);
  }
  getAttentionScore() {
    return this.seeso.getAttentionScore();
  }
  static getVersionName() {
    return _seeso.default.getVersionName();
  }
  /**
   * For type hinting
   * @private
   * @param {GazeInfo} gazeInfo
   */
  onGaze_(gazeInfo) {
    if (this.onGaze) this.onGaze(gazeInfo);
  }

  /**
   * For remove callback
   * @private
   */
  onCalibrationFinished_(calibrationData) {
    if (this.onCalibrationFinished) {
      this.onCalibrationFinished(calibrationData);
    }
    this.seeso.removeCalibrationNextPointCallback(this.onCalibrationNextPoint);
    this.seeso.removeCalibrationProgressCallback(this.onCalibrationProgress);
    this.onCalibrationFinished = null;
    this.onCalibrationProgress = null;
    this.onCalibrationNextPoint = null;
  }
}
var _default = EasySeeso;
exports.default = _default;
},{"seeso":"../../node_modules/seeso/dist/seeso.js"}],"showGaze.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
// helper functions to display gaze information and dot in browser.

// show gaze information on screen.
function showGazeInfoOnDom(gazeInfo) {
  var gazeInfoDiv = document.getElementById("gazeInfo");
  gazeInfoDiv.innerText = "Gaze Information Below\n                           \nx: ".concat(gazeInfo.x, "\n                           \ny: ").concat(gazeInfo.y, "\n                           ");
}

// show gaze dot on screen.
function showGazeDotOnDom(gazeInfo) {
  var canvas = document.getElementById("heatMap");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "#FF0000";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.arc(gazeInfo.x, gazeInfo.y, 10, 0, Math.PI * 2, true);
  ctx.fill();
}
function changeDOM() {
  document.getElementById("gazeheader").style.display = "none";
  document.getElementById("calibrationButton").style.display = "none";
  // document.getElementById("myimg").style.display = "block";
  document.getElementById("heatMap").style.display = "block";
  document.getElementById("finBtn").style.display = "block";
}
function showGaze(gazeInfo) {
  changeDOM();
  // showGazeDotOnDom(gazeInfo);
  // showGazeInfoOnDom(gazeInfo);
}
var _default = showGaze;
exports.default = _default;
},{}],"../../node_modules/html2canvas/dist/html2canvas.js":[function(require,module,exports) {
var define;
var global = arguments[3];
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
/*!
 * html2canvas 1.4.1 <https://html2canvas.hertzen.com>
 * Copyright (c) 2022 Niklas von Hertzen <https://hertzen.com>
 * Released under MIT License
 */
(function (global, factory) {
  (typeof exports === "undefined" ? "undefined" : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.html2canvas = factory());
})(this, function () {
  'use strict';

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation.
    Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.
    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */
  /* global Reflect, Promise */
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
    };
    return _extendStatics(d, b);
  };
  function __extends(d, b) {
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    _extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }
  var _assign = function __assign() {
    _assign = Object.assign || function __assign(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
      return t;
    };
    return _assign.apply(this, arguments);
  };
  function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function (resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  }
  function __generator(thisArg, body) {
    var _ = {
        label: 0,
        sent: function sent() {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: []
      },
      f,
      y,
      t,
      g;
    return g = {
      next: verb(0),
      "throw": verb(1),
      "return": verb(2)
    }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
      return this;
    }), g;
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (_) try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
        if (y = 0, t) op = [op[0] & 2, t.value];
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;
          case 4:
            _.label++;
            return {
              value: op[1],
              done: false
            };
          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;
          case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;
          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if (t[2]) _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
      if (op[0] & 5) throw op[1];
      return {
        value: op[0] ? op[1] : void 0,
        done: true
      };
    }
  }
  function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
        if (!ar) ar = Array.prototype.slice.call(from, 0, i);
        ar[i] = from[i];
      }
    }
    return to.concat(ar || from);
  }
  var Bounds = /** @class */function () {
    function Bounds(left, top, width, height) {
      this.left = left;
      this.top = top;
      this.width = width;
      this.height = height;
    }
    Bounds.prototype.add = function (x, y, w, h) {
      return new Bounds(this.left + x, this.top + y, this.width + w, this.height + h);
    };
    Bounds.fromClientRect = function (context, clientRect) {
      return new Bounds(clientRect.left + context.windowBounds.left, clientRect.top + context.windowBounds.top, clientRect.width, clientRect.height);
    };
    Bounds.fromDOMRectList = function (context, domRectList) {
      var domRect = Array.from(domRectList).find(function (rect) {
        return rect.width !== 0;
      });
      return domRect ? new Bounds(domRect.left + context.windowBounds.left, domRect.top + context.windowBounds.top, domRect.width, domRect.height) : Bounds.EMPTY;
    };
    Bounds.EMPTY = new Bounds(0, 0, 0, 0);
    return Bounds;
  }();
  var parseBounds = function parseBounds(context, node) {
    return Bounds.fromClientRect(context, node.getBoundingClientRect());
  };
  var parseDocumentSize = function parseDocumentSize(document) {
    var body = document.body;
    var documentElement = document.documentElement;
    if (!body || !documentElement) {
      throw new Error("Unable to get document size");
    }
    var width = Math.max(Math.max(body.scrollWidth, documentElement.scrollWidth), Math.max(body.offsetWidth, documentElement.offsetWidth), Math.max(body.clientWidth, documentElement.clientWidth));
    var height = Math.max(Math.max(body.scrollHeight, documentElement.scrollHeight), Math.max(body.offsetHeight, documentElement.offsetHeight), Math.max(body.clientHeight, documentElement.clientHeight));
    return new Bounds(0, 0, width, height);
  };

  /*
   * css-line-break 2.1.0 <https://github.com/niklasvh/css-line-break#readme>
   * Copyright (c) 2022 Niklas von Hertzen <https://hertzen.com>
   * Released under MIT License
   */
  var toCodePoints$1 = function toCodePoints$1(str) {
    var codePoints = [];
    var i = 0;
    var length = str.length;
    while (i < length) {
      var value = str.charCodeAt(i++);
      if (value >= 0xd800 && value <= 0xdbff && i < length) {
        var extra = str.charCodeAt(i++);
        if ((extra & 0xfc00) === 0xdc00) {
          codePoints.push(((value & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000);
        } else {
          codePoints.push(value);
          i--;
        }
      } else {
        codePoints.push(value);
      }
    }
    return codePoints;
  };
  var fromCodePoint$1 = function fromCodePoint$1() {
    var codePoints = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      codePoints[_i] = arguments[_i];
    }
    if (String.fromCodePoint) {
      return String.fromCodePoint.apply(String, codePoints);
    }
    var length = codePoints.length;
    if (!length) {
      return '';
    }
    var codeUnits = [];
    var index = -1;
    var result = '';
    while (++index < length) {
      var codePoint = codePoints[index];
      if (codePoint <= 0xffff) {
        codeUnits.push(codePoint);
      } else {
        codePoint -= 0x10000;
        codeUnits.push((codePoint >> 10) + 0xd800, codePoint % 0x400 + 0xdc00);
      }
      if (index + 1 === length || codeUnits.length > 0x4000) {
        result += String.fromCharCode.apply(String, codeUnits);
        codeUnits.length = 0;
      }
    }
    return result;
  };
  var chars$2 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  // Use a lookup table to find the index.
  var lookup$2 = typeof Uint8Array === 'undefined' ? [] : new Uint8Array(256);
  for (var i$2 = 0; i$2 < chars$2.length; i$2++) {
    lookup$2[chars$2.charCodeAt(i$2)] = i$2;
  }

  /*
   * utrie 1.0.2 <https://github.com/niklasvh/utrie>
   * Copyright (c) 2022 Niklas von Hertzen <https://hertzen.com>
   * Released under MIT License
   */
  var chars$1$1 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  // Use a lookup table to find the index.
  var lookup$1$1 = typeof Uint8Array === 'undefined' ? [] : new Uint8Array(256);
  for (var i$1$1 = 0; i$1$1 < chars$1$1.length; i$1$1++) {
    lookup$1$1[chars$1$1.charCodeAt(i$1$1)] = i$1$1;
  }
  var decode$1 = function decode$1(base64) {
    var bufferLength = base64.length * 0.75,
      len = base64.length,
      i,
      p = 0,
      encoded1,
      encoded2,
      encoded3,
      encoded4;
    if (base64[base64.length - 1] === '=') {
      bufferLength--;
      if (base64[base64.length - 2] === '=') {
        bufferLength--;
      }
    }
    var buffer = typeof ArrayBuffer !== 'undefined' && typeof Uint8Array !== 'undefined' && typeof Uint8Array.prototype.slice !== 'undefined' ? new ArrayBuffer(bufferLength) : new Array(bufferLength);
    var bytes = Array.isArray(buffer) ? buffer : new Uint8Array(buffer);
    for (i = 0; i < len; i += 4) {
      encoded1 = lookup$1$1[base64.charCodeAt(i)];
      encoded2 = lookup$1$1[base64.charCodeAt(i + 1)];
      encoded3 = lookup$1$1[base64.charCodeAt(i + 2)];
      encoded4 = lookup$1$1[base64.charCodeAt(i + 3)];
      bytes[p++] = encoded1 << 2 | encoded2 >> 4;
      bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
      bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
    }
    return buffer;
  };
  var polyUint16Array$1 = function polyUint16Array$1(buffer) {
    var length = buffer.length;
    var bytes = [];
    for (var i = 0; i < length; i += 2) {
      bytes.push(buffer[i + 1] << 8 | buffer[i]);
    }
    return bytes;
  };
  var polyUint32Array$1 = function polyUint32Array$1(buffer) {
    var length = buffer.length;
    var bytes = [];
    for (var i = 0; i < length; i += 4) {
      bytes.push(buffer[i + 3] << 24 | buffer[i + 2] << 16 | buffer[i + 1] << 8 | buffer[i]);
    }
    return bytes;
  };

  /** Shift size for getting the index-2 table offset. */
  var UTRIE2_SHIFT_2$1 = 5;
  /** Shift size for getting the index-1 table offset. */
  var UTRIE2_SHIFT_1$1 = 6 + 5;
  /**
   * Shift size for shifting left the index array values.
   * Increases possible data size with 16-bit index values at the cost
   * of compactability.
   * This requires data blocks to be aligned by UTRIE2_DATA_GRANULARITY.
   */
  var UTRIE2_INDEX_SHIFT$1 = 2;
  /**
   * Difference between the two shift sizes,
   * for getting an index-1 offset from an index-2 offset. 6=11-5
   */
  var UTRIE2_SHIFT_1_2$1 = UTRIE2_SHIFT_1$1 - UTRIE2_SHIFT_2$1;
  /**
   * The part of the index-2 table for U+D800..U+DBFF stores values for
   * lead surrogate code _units_ not code _points_.
   * Values for lead surrogate code _points_ are indexed with this portion of the table.
   * Length=32=0x20=0x400>>UTRIE2_SHIFT_2. (There are 1024=0x400 lead surrogates.)
   */
  var UTRIE2_LSCP_INDEX_2_OFFSET$1 = 0x10000 >> UTRIE2_SHIFT_2$1;
  /** Number of entries in a data block. 32=0x20 */
  var UTRIE2_DATA_BLOCK_LENGTH$1 = 1 << UTRIE2_SHIFT_2$1;
  /** Mask for getting the lower bits for the in-data-block offset. */
  var UTRIE2_DATA_MASK$1 = UTRIE2_DATA_BLOCK_LENGTH$1 - 1;
  var UTRIE2_LSCP_INDEX_2_LENGTH$1 = 0x400 >> UTRIE2_SHIFT_2$1;
  /** Count the lengths of both BMP pieces. 2080=0x820 */
  var UTRIE2_INDEX_2_BMP_LENGTH$1 = UTRIE2_LSCP_INDEX_2_OFFSET$1 + UTRIE2_LSCP_INDEX_2_LENGTH$1;
  /**
   * The 2-byte UTF-8 version of the index-2 table follows at offset 2080=0x820.
   * Length 32=0x20 for lead bytes C0..DF, regardless of UTRIE2_SHIFT_2.
   */
  var UTRIE2_UTF8_2B_INDEX_2_OFFSET$1 = UTRIE2_INDEX_2_BMP_LENGTH$1;
  var UTRIE2_UTF8_2B_INDEX_2_LENGTH$1 = 0x800 >> 6; /* U+0800 is the first code point after 2-byte UTF-8 */
  /**
   * The index-1 table, only used for supplementary code points, at offset 2112=0x840.
   * Variable length, for code points up to highStart, where the last single-value range starts.
   * Maximum length 512=0x200=0x100000>>UTRIE2_SHIFT_1.
   * (For 0x100000 supplementary code points U+10000..U+10ffff.)
   *
   * The part of the index-2 table for supplementary code points starts
   * after this index-1 table.
   *
   * Both the index-1 table and the following part of the index-2 table
   * are omitted completely if there is only BMP data.
   */
  var UTRIE2_INDEX_1_OFFSET$1 = UTRIE2_UTF8_2B_INDEX_2_OFFSET$1 + UTRIE2_UTF8_2B_INDEX_2_LENGTH$1;
  /**
   * Number of index-1 entries for the BMP. 32=0x20
   * This part of the index-1 table is omitted from the serialized form.
   */
  var UTRIE2_OMITTED_BMP_INDEX_1_LENGTH$1 = 0x10000 >> UTRIE2_SHIFT_1$1;
  /** Number of entries in an index-2 block. 64=0x40 */
  var UTRIE2_INDEX_2_BLOCK_LENGTH$1 = 1 << UTRIE2_SHIFT_1_2$1;
  /** Mask for getting the lower bits for the in-index-2-block offset. */
  var UTRIE2_INDEX_2_MASK$1 = UTRIE2_INDEX_2_BLOCK_LENGTH$1 - 1;
  var slice16$1 = function slice16$1(view, start, end) {
    if (view.slice) {
      return view.slice(start, end);
    }
    return new Uint16Array(Array.prototype.slice.call(view, start, end));
  };
  var slice32$1 = function slice32$1(view, start, end) {
    if (view.slice) {
      return view.slice(start, end);
    }
    return new Uint32Array(Array.prototype.slice.call(view, start, end));
  };
  var createTrieFromBase64$1 = function createTrieFromBase64$1(base64, _byteLength) {
    var buffer = decode$1(base64);
    var view32 = Array.isArray(buffer) ? polyUint32Array$1(buffer) : new Uint32Array(buffer);
    var view16 = Array.isArray(buffer) ? polyUint16Array$1(buffer) : new Uint16Array(buffer);
    var headerLength = 24;
    var index = slice16$1(view16, headerLength / 2, view32[4] / 2);
    var data = view32[5] === 2 ? slice16$1(view16, (headerLength + view32[4]) / 2) : slice32$1(view32, Math.ceil((headerLength + view32[4]) / 4));
    return new Trie$1(view32[0], view32[1], view32[2], view32[3], index, data);
  };
  var Trie$1 = /** @class */function () {
    function Trie(initialValue, errorValue, highStart, highValueIndex, index, data) {
      this.initialValue = initialValue;
      this.errorValue = errorValue;
      this.highStart = highStart;
      this.highValueIndex = highValueIndex;
      this.index = index;
      this.data = data;
    }
    /**
     * Get the value for a code point as stored in the Trie.
     *
     * @param codePoint the code point
     * @return the value
     */
    Trie.prototype.get = function (codePoint) {
      var ix;
      if (codePoint >= 0) {
        if (codePoint < 0x0d800 || codePoint > 0x0dbff && codePoint <= 0x0ffff) {
          // Ordinary BMP code point, excluding leading surrogates.
          // BMP uses a single level lookup.  BMP index starts at offset 0 in the Trie2 index.
          // 16 bit data is stored in the index array itself.
          ix = this.index[codePoint >> UTRIE2_SHIFT_2$1];
          ix = (ix << UTRIE2_INDEX_SHIFT$1) + (codePoint & UTRIE2_DATA_MASK$1);
          return this.data[ix];
        }
        if (codePoint <= 0xffff) {
          // Lead Surrogate Code Point.  A Separate index section is stored for
          // lead surrogate code units and code points.
          //   The main index has the code unit data.
          //   For this function, we need the code point data.
          // Note: this expression could be refactored for slightly improved efficiency, but
          //       surrogate code points will be so rare in practice that it's not worth it.
          ix = this.index[UTRIE2_LSCP_INDEX_2_OFFSET$1 + (codePoint - 0xd800 >> UTRIE2_SHIFT_2$1)];
          ix = (ix << UTRIE2_INDEX_SHIFT$1) + (codePoint & UTRIE2_DATA_MASK$1);
          return this.data[ix];
        }
        if (codePoint < this.highStart) {
          // Supplemental code point, use two-level lookup.
          ix = UTRIE2_INDEX_1_OFFSET$1 - UTRIE2_OMITTED_BMP_INDEX_1_LENGTH$1 + (codePoint >> UTRIE2_SHIFT_1$1);
          ix = this.index[ix];
          ix += codePoint >> UTRIE2_SHIFT_2$1 & UTRIE2_INDEX_2_MASK$1;
          ix = this.index[ix];
          ix = (ix << UTRIE2_INDEX_SHIFT$1) + (codePoint & UTRIE2_DATA_MASK$1);
          return this.data[ix];
        }
        if (codePoint <= 0x10ffff) {
          return this.data[this.highValueIndex];
        }
      }
      // Fall through.  The code point is outside of the legal range of 0..0x10ffff.
      return this.errorValue;
    };
    return Trie;
  }();

  /*
   * base64-arraybuffer 1.0.2 <https://github.com/niklasvh/base64-arraybuffer>
   * Copyright (c) 2022 Niklas von Hertzen <https://hertzen.com>
   * Released under MIT License
   */
  var chars$3 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  // Use a lookup table to find the index.
  var lookup$3 = typeof Uint8Array === 'undefined' ? [] : new Uint8Array(256);
  for (var i$3 = 0; i$3 < chars$3.length; i$3++) {
    lookup$3[chars$3.charCodeAt(i$3)] = i$3;
  }
  var base64$1 = 'KwAAAAAAAAAACA4AUD0AADAgAAACAAAAAAAIABAAGABAAEgAUABYAGAAaABgAGgAYgBqAF8AZwBgAGgAcQB5AHUAfQCFAI0AlQCdAKIAqgCyALoAYABoAGAAaABgAGgAwgDKAGAAaADGAM4A0wDbAOEA6QDxAPkAAQEJAQ8BFwF1AH0AHAEkASwBNAE6AUIBQQFJAVEBWQFhAWgBcAF4ATAAgAGGAY4BlQGXAZ8BpwGvAbUBvQHFAc0B0wHbAeMB6wHxAfkBAQIJAvEBEQIZAiECKQIxAjgCQAJGAk4CVgJeAmQCbAJ0AnwCgQKJApECmQKgAqgCsAK4ArwCxAIwAMwC0wLbAjAA4wLrAvMC+AIAAwcDDwMwABcDHQMlAy0DNQN1AD0DQQNJA0kDSQNRA1EDVwNZA1kDdQB1AGEDdQBpA20DdQN1AHsDdQCBA4kDkQN1AHUAmQOhA3UAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AKYDrgN1AHUAtgO+A8YDzgPWAxcD3gPjA+sD8wN1AHUA+wMDBAkEdQANBBUEHQQlBCoEFwMyBDgEYABABBcDSARQBFgEYARoBDAAcAQzAXgEgASIBJAEdQCXBHUAnwSnBK4EtgS6BMIEyAR1AHUAdQB1AHUAdQCVANAEYABgAGAAYABgAGAAYABgANgEYADcBOQEYADsBPQE/AQEBQwFFAUcBSQFLAU0BWQEPAVEBUsFUwVbBWAAYgVgAGoFcgV6BYIFigWRBWAAmQWfBaYFYABgAGAAYABgAKoFYACxBbAFuQW6BcEFwQXHBcEFwQXPBdMF2wXjBeoF8gX6BQIGCgYSBhoGIgYqBjIGOgZgAD4GRgZMBmAAUwZaBmAAYABgAGAAYABgAGAAYABgAGAAYABgAGIGYABpBnAGYABgAGAAYABgAGAAYABgAGAAYAB4Bn8GhQZgAGAAYAB1AHcDFQSLBmAAYABgAJMGdQA9A3UAmwajBqsGqwaVALMGuwbDBjAAywbSBtIG1QbSBtIG0gbSBtIG0gbdBuMG6wbzBvsGAwcLBxMHAwcbByMHJwcsBywHMQcsB9IGOAdAB0gHTgfSBkgHVgfSBtIG0gbSBtIG0gbSBtIG0gbSBiwHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAdgAGAALAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAdbB2MHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsB2kH0gZwB64EdQB1AHUAdQB1AHUAdQB1AHUHfQdgAIUHjQd1AHUAlQedB2AAYAClB6sHYACzB7YHvgfGB3UAzgfWBzMB3gfmB1EB7gf1B/0HlQENAQUIDQh1ABUIHQglCBcDLQg1CD0IRQhNCEEDUwh1AHUAdQBbCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIcAh3CHoIMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIgggwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAALAcsBywHLAcsBywHLAcsBywHLAcsB4oILAcsB44I0gaWCJ4Ipgh1AHUAqgiyCHUAdQB1AHUAdQB1AHUAdQB1AHUAtwh8AXUAvwh1AMUIyQjRCNkI4AjoCHUAdQB1AO4I9gj+CAYJDgkTCS0HGwkjCYIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiAAIAAAAFAAYABgAGIAXwBgAHEAdQBFAJUAogCyAKAAYABgAEIA4ABGANMA4QDxAMEBDwE1AFwBLAE6AQEBUQF4QkhCmEKoQrhCgAHIQsAB0MLAAcABwAHAAeDC6ABoAHDCwMMAAcABwAHAAdDDGMMAAcAB6MM4wwjDWMNow3jDaABoAGgAaABoAGgAaABoAGgAaABoAGgAaABoAGgAaABoAGgAaABoAEjDqABWw6bDqABpg6gAaABoAHcDvwOPA+gAaABfA/8DvwO/A78DvwO/A78DvwO/A78DvwO/A78DvwO/A78DvwO/A78DvwO/A78DvwO/A78DvwO/A78DpcPAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcAB9cPKwkyCToJMAB1AHUAdQBCCUoJTQl1AFUJXAljCWcJawkwADAAMAAwAHMJdQB2CX4JdQCECYoJjgmWCXUAngkwAGAAYABxAHUApgn3A64JtAl1ALkJdQDACTAAMAAwADAAdQB1AHUAdQB1AHUAdQB1AHUAowYNBMUIMAAwADAAMADICcsJ0wnZCRUE4QkwAOkJ8An4CTAAMAB1AAAKvwh1AAgKDwoXCh8KdQAwACcKLgp1ADYKqAmICT4KRgowADAAdQB1AE4KMAB1AFYKdQBeCnUAZQowADAAMAAwADAAMAAwADAAMAAVBHUAbQowADAAdQC5CXUKMAAwAHwBxAijBogEMgF9CoQKiASMCpQKmgqIBKIKqgquCogEDQG2Cr4KxgrLCjAAMADTCtsKCgHjCusK8Qr5CgELMAAwADAAMAB1AIsECQsRC3UANAEZCzAAMAAwADAAMAB1ACELKQswAHUANAExCzkLdQBBC0kLMABRC1kLMAAwADAAMAAwADAAdQBhCzAAMAAwAGAAYABpC3ELdwt/CzAAMACHC4sLkwubC58Lpwt1AK4Ltgt1APsDMAAwADAAMAAwADAAMAAwAL4LwwvLC9IL1wvdCzAAMADlC+kL8Qv5C/8LSQswADAAMAAwADAAMAAwADAAMAAHDDAAMAAwADAAMAAODBYMHgx1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1ACYMMAAwADAAdQB1AHUALgx1AHUAdQB1AHUAdQA2DDAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AD4MdQBGDHUAdQB1AHUAdQB1AEkMdQB1AHUAdQB1AFAMMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQBYDHUAdQB1AF8MMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUA+wMVBGcMMAAwAHwBbwx1AHcMfwyHDI8MMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAYABgAJcMMAAwADAAdQB1AJ8MlQClDDAAMACtDCwHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsB7UMLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AA0EMAC9DDAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAsBywHLAcsBywHLAcsBywHLQcwAMEMyAwsBywHLAcsBywHLAcsBywHLAcsBywHzAwwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAHUAdQB1ANQM2QzhDDAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMABgAGAAYABgAGAAYABgAOkMYADxDGAA+AwADQYNYABhCWAAYAAODTAAMAAwADAAFg1gAGAAHg37AzAAMAAwADAAYABgACYNYAAsDTQNPA1gAEMNPg1LDWAAYABgAGAAYABgAGAAYABgAGAAUg1aDYsGVglhDV0NcQBnDW0NdQ15DWAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAlQCBDZUAiA2PDZcNMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAnw2nDTAAMAAwADAAMAAwAHUArw23DTAAMAAwADAAMAAwADAAMAAwADAAMAB1AL8NMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAB1AHUAdQB1AHUAdQDHDTAAYABgAM8NMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAA1w11ANwNMAAwAD0B5A0wADAAMAAwADAAMADsDfQN/A0EDgwOFA4wABsOMAAwADAAMAAwADAAMAAwANIG0gbSBtIG0gbSBtIG0gYjDigOwQUuDsEFMw7SBjoO0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIGQg5KDlIOVg7SBtIGXg5lDm0OdQ7SBtIGfQ6EDooOjQ6UDtIGmg6hDtIG0gaoDqwO0ga0DrwO0gZgAGAAYADEDmAAYAAkBtIGzA5gANIOYADaDokO0gbSBt8O5w7SBu8O0gb1DvwO0gZgAGAAxA7SBtIG0gbSBtIGYABgAGAAYAAED2AAsAUMD9IG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIGFA8sBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAccD9IGLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHJA8sBywHLAcsBywHLAccDywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywPLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAc0D9IG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIGLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAccD9IG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIGFA8sBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHPA/SBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gYUD0QPlQCVAJUAMAAwADAAMACVAJUAlQCVAJUAlQCVAEwPMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAA//8EAAQABAAEAAQABAAEAAQABAANAAMAAQABAAIABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQACgATABcAHgAbABoAHgAXABYAEgAeABsAGAAPABgAHABLAEsASwBLAEsASwBLAEsASwBLABgAGAAeAB4AHgATAB4AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQABYAGwASAB4AHgAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAWAA0AEQAeAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAAQABAAEAAQABAAFAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAJABYAGgAbABsAGwAeAB0AHQAeAE8AFwAeAA0AHgAeABoAGwBPAE8ADgBQAB0AHQAdAE8ATwAXAE8ATwBPABYAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAFAAUABQAFAAUABQAFAAUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAB4AHgAeAFAATwBAAE8ATwBPAEAATwBQAFAATwBQAB4AHgAeAB4AHgAeAB0AHQAdAB0AHgAdAB4ADgBQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgBQAB4AUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAJAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAkACQAJAAkACQAJAAkABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAeAB4AHgAeAFAAHgAeAB4AKwArAFAAUABQAFAAGABQACsAKwArACsAHgAeAFAAHgBQAFAAUAArAFAAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAEAAQABAAEAAQABAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAUAAeAB4AHgAeAB4AHgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAYAA0AKwArAB4AHgAbACsABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQADQAEAB4ABAAEAB4ABAAEABMABAArACsAKwArACsAKwArACsAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAKwArACsAKwBWAFYAVgBWAB4AHgArACsAKwArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AGgAaABoAGAAYAB4AHgAEAAQABAAEAAQABAAEAAQABAAEAAQAEwAEACsAEwATAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABABLAEsASwBLAEsASwBLAEsASwBLABoAGQAZAB4AUABQAAQAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQABMAUAAEAAQABAAEAAQABAAEAB4AHgAEAAQABAAEAAQABABQAFAABAAEAB4ABAAEAAQABABQAFAASwBLAEsASwBLAEsASwBLAEsASwBQAFAAUAAeAB4AUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwAeAFAABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQAUABQAB4AHgAYABMAUAArACsABAAbABsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAFAABAAEAAQABAAEAFAABAAEAAQAUAAEAAQABAAEAAQAKwArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAArACsAHgArAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAB4ABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAUAAEAAQABAAEAAQABAAEAFAAUABQAFAAUABQAFAAUABQAFAABAAEAA0ADQBLAEsASwBLAEsASwBLAEsASwBLAB4AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAArAFAAUABQAFAAUABQAFAAUAArACsAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAUAArACsAKwBQAFAAUABQACsAKwAEAFAABAAEAAQABAAEAAQABAArACsABAAEACsAKwAEAAQABABQACsAKwArACsAKwArACsAKwAEACsAKwArACsAUABQACsAUABQAFAABAAEACsAKwBLAEsASwBLAEsASwBLAEsASwBLAFAAUAAaABoAUABQAFAAUABQAEwAHgAbAFAAHgAEACsAKwAEAAQABAArAFAAUABQAFAAUABQACsAKwArACsAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAUABQACsAUABQACsAUABQACsAKwAEACsABAAEAAQABAAEACsAKwArACsABAAEACsAKwAEAAQABAArACsAKwAEACsAKwArACsAKwArACsAUABQAFAAUAArAFAAKwArACsAKwArACsAKwBLAEsASwBLAEsASwBLAEsASwBLAAQABABQAFAAUAAEAB4AKwArACsAKwArACsAKwArACsAKwAEAAQABAArAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAUABQACsAUABQAFAAUABQACsAKwAEAFAABAAEAAQABAAEAAQABAAEACsABAAEAAQAKwAEAAQABAArACsAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAABAAEACsAKwBLAEsASwBLAEsASwBLAEsASwBLAB4AGwArACsAKwArACsAKwArAFAABAAEAAQABAAEAAQAKwAEAAQABAArAFAAUABQAFAAUABQAFAAUAArACsAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAArACsABAAEACsAKwAEAAQABAArACsAKwArACsAKwArAAQABAAEACsAKwArACsAUABQACsAUABQAFAABAAEACsAKwBLAEsASwBLAEsASwBLAEsASwBLAB4AUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArAAQAUAArAFAAUABQAFAAUABQACsAKwArAFAAUABQACsAUABQAFAAUAArACsAKwBQAFAAKwBQACsAUABQACsAKwArAFAAUAArACsAKwBQAFAAUAArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArAAQABAAEAAQABAArACsAKwAEAAQABAArAAQABAAEAAQAKwArAFAAKwArACsAKwArACsABAArACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAUABQAFAAHgAeAB4AHgAeAB4AGwAeACsAKwArACsAKwAEAAQABAAEAAQAUABQAFAAUABQAFAAUABQACsAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAUAAEAAQABAAEAAQABAAEACsABAAEAAQAKwAEAAQABAAEACsAKwArACsAKwArACsABAAEACsAUABQAFAAKwArACsAKwArAFAAUAAEAAQAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAKwAOAFAAUABQAFAAUABQAFAAHgBQAAQABAAEAA4AUABQAFAAUABQAFAAUABQACsAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAKwArAAQAUAAEAAQABAAEAAQABAAEACsABAAEAAQAKwAEAAQABAAEACsAKwArACsAKwArACsABAAEACsAKwArACsAKwArACsAUAArAFAAUAAEAAQAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwBQAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwAEAAQABAAEAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAFAABAAEAAQABAAEAAQABAArAAQABAAEACsABAAEAAQABABQAB4AKwArACsAKwBQAFAAUAAEAFAAUABQAFAAUABQAFAAUABQAFAABAAEACsAKwBLAEsASwBLAEsASwBLAEsASwBLAFAAUABQAFAAUABQAFAAUABQABoAUABQAFAAUABQAFAAKwAEAAQABAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQACsAUAArACsAUABQAFAAUABQAFAAUAArACsAKwAEACsAKwArACsABAAEAAQABAAEAAQAKwAEACsABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArAAQABAAeACsAKwArACsAKwArACsAKwArACsAKwArAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAAqAFwAXAAqACoAKgAqACoAKgAqACsAKwArACsAGwBcAFwAXABcAFwAXABcACoAKgAqACoAKgAqACoAKgAeAEsASwBLAEsASwBLAEsASwBLAEsADQANACsAKwArACsAKwBcAFwAKwBcACsAXABcAFwAXABcACsAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcACsAXAArAFwAXABcAFwAXABcAFwAXABcAFwAKgBcAFwAKgAqACoAKgAqACoAKgAqACoAXAArACsAXABcAFwAXABcACsAXAArACoAKgAqACoAKgAqACsAKwBLAEsASwBLAEsASwBLAEsASwBLACsAKwBcAFwAXABcAFAADgAOAA4ADgAeAA4ADgAJAA4ADgANAAkAEwATABMAEwATAAkAHgATAB4AHgAeAAQABAAeAB4AHgAeAB4AHgBLAEsASwBLAEsASwBLAEsASwBLAFAAUABQAFAAUABQAFAAUABQAFAADQAEAB4ABAAeAAQAFgARABYAEQAEAAQAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQADQAEAAQABAAEAAQADQAEAAQAUABQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABAArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArAA0ADQAeAB4AHgAeAB4AHgAEAB4AHgAeAB4AHgAeACsAHgAeAA4ADgANAA4AHgAeAB4AHgAeAAkACQArACsAKwArACsAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgBcAEsASwBLAEsASwBLAEsASwBLAEsADQANAB4AHgAeAB4AXABcAFwAXABcAFwAKgAqACoAKgBcAFwAXABcACoAKgAqAFwAKgAqACoAXABcACoAKgAqACoAKgAqACoAXABcAFwAKgAqACoAKgBcAFwAXABcAFwAXABcAFwAXABcAFwAXABcACoAKgAqACoAKgAqACoAKgAqACoAKgAqAFwAKgBLAEsASwBLAEsASwBLAEsASwBLACoAKgAqACoAKgAqAFAAUABQAFAAUABQACsAUAArACsAKwArACsAUAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgBQAFAAUABQAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUAArACsAUABQAFAAUABQAFAAUAArAFAAKwBQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAKwBQACsAUABQAFAAUAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsABAAEAAQAHgANAB4AHgAeAB4AHgAeAB4AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwBQAFAAUABQAFAAUAArACsADQBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAANAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAWABEAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAA0ADQANAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAAQABAAEACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAANAA0AKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUAArAAQABAArACsAKwArACsAKwArACsAKwArACsAKwBcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqAA0ADQAVAFwADQAeAA0AGwBcACoAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwAeAB4AEwATAA0ADQAOAB4AEwATAB4ABAAEAAQACQArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArAFAAUABQAFAAUAAEAAQAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQAUAArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAArACsAKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsAHgArACsAKwATABMASwBLAEsASwBLAEsASwBLAEsASwBcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAArACsAXABcAFwAXABcACsAKwArACsAKwArACsAKwArACsAKwBcAFwAXABcAFwAXABcAFwAXABcAFwAXAArACsAKwArAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAXAArACsAKwAqACoAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAArACsAHgAeAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcACoAKgAqACoAKgAqACoAKgAqACoAKwAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKwArAAQASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArACsAKwBLAEsASwBLAEsASwBLAEsASwBLACsAKwArACsAKwArACoAKgAqACoAKgAqACoAXAAqACoAKgAqACoAKgArACsABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsABAAEAAQABAAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABABQAFAAUABQAFAAUABQACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwANAA0AHgANAA0ADQANAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAEAAQABAAEAAQABAAEAAQAHgAeAB4AHgAeAB4AHgAeAB4AKwArACsABAAEAAQAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABABQAFAASwBLAEsASwBLAEsASwBLAEsASwBQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwAeAB4AHgAeAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArAA0ADQANAA0ADQBLAEsASwBLAEsASwBLAEsASwBLACsAKwArAFAAUABQAEsASwBLAEsASwBLAEsASwBLAEsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAA0ADQBQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwBQAFAAUAAeAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArAAQABAAEAB4ABAAEAAQABAAEAAQABAAEAAQABAAEAAQABABQAFAAUABQAAQAUABQAFAAUABQAFAABABQAFAABAAEAAQAUAArACsAKwArACsABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsABAAEAAQABAAEAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArAFAAUABQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAKwBQACsAUAArAFAAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACsAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArAB4AHgAeAB4AHgAeAB4AHgBQAB4AHgAeAFAAUABQACsAHgAeAB4AHgAeAB4AHgAeAB4AHgBQAFAAUABQACsAKwAeAB4AHgAeAB4AHgArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArAFAAUABQACsAHgAeAB4AHgAeAB4AHgAOAB4AKwANAA0ADQANAA0ADQANAAkADQANAA0ACAAEAAsABAAEAA0ACQANAA0ADAAdAB0AHgAXABcAFgAXABcAFwAWABcAHQAdAB4AHgAUABQAFAANAAEAAQAEAAQABAAEAAQACQAaABoAGgAaABoAGgAaABoAHgAXABcAHQAVABUAHgAeAB4AHgAeAB4AGAAWABEAFQAVABUAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ADQAeAA0ADQANAA0AHgANAA0ADQAHAB4AHgAeAB4AKwAEAAQABAAEAAQABAAEAAQABAAEAFAAUAArACsATwBQAFAAUABQAFAAHgAeAB4AFgARAE8AUABPAE8ATwBPAFAAUABQAFAAUAAeAB4AHgAWABEAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArABsAGwAbABsAGwAbABsAGgAbABsAGwAbABsAGwAbABsAGwAbABsAGwAbABsAGgAbABsAGwAbABoAGwAbABoAGwAbABsAGwAbABsAGwAbABsAGwAbABsAGwAbABsAGwAbAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAHgAeAFAAGgAeAB0AHgBQAB4AGgAeAB4AHgAeAB4AHgAeAB4AHgBPAB4AUAAbAB4AHgBQAFAAUABQAFAAHgAeAB4AHQAdAB4AUAAeAFAAHgBQAB4AUABPAFAAUAAeAB4AHgAeAB4AHgAeAFAAUABQAFAAUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAFAAHgBQAFAAUABQAE8ATwBQAFAAUABQAFAATwBQAFAATwBQAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAFAAUABQAFAATwBPAE8ATwBPAE8ATwBPAE8ATwBQAFAAUABQAFAAUABQAFAAUAAeAB4AUABQAFAAUABPAB4AHgArACsAKwArAB0AHQAdAB0AHQAdAB0AHQAdAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHgAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB4AHQAdAB4AHgAeAB0AHQAeAB4AHQAeAB4AHgAdAB4AHQAbABsAHgAdAB4AHgAeAB4AHQAeAB4AHQAdAB0AHQAeAB4AHQAeAB0AHgAdAB0AHQAdAB0AHQAeAB0AHgAeAB4AHgAeAB0AHQAdAB0AHgAeAB4AHgAdAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB4AHgAeAB0AHgAeAB4AHgAeAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB0AHgAeAB0AHQAdAB0AHgAeAB0AHQAeAB4AHQAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHQAeAB4AHQAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAeAB4AHgAdAB4AHgAeAB4AHgAeAB4AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AFAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeABYAEQAWABEAHgAeAB4AHgAeAB4AHQAeAB4AHgAeAB4AHgAeACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAWABEAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAFAAHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHgAeAB4AHgAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAeAB4AHQAdAB0AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHQAeAB0AHQAdAB0AHQAdAB0AHgAeAB4AHgAeAB4AHgAeAB0AHQAeAB4AHQAdAB4AHgAeAB4AHQAdAB4AHgAeAB4AHQAdAB0AHgAeAB0AHgAeAB0AHQAdAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB0AHQAdAB4AHgAeAB4AHgAeAB4AHgAeAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAlACUAJQAlAB4AHQAdAB4AHgAdAB4AHgAeAB4AHQAdAB4AHgAeAB4AJQAlAB0AHQAlAB4AJQAlACUAIAAlACUAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAlACUAJQAeAB4AHgAeAB0AHgAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB0AHgAdAB0AHQAeAB0AJQAdAB0AHgAdAB0AHgAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACUAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAlACUAJQAlACUAJQAlACUAJQAlACUAJQAdAB0AHQAdACUAHgAlACUAJQAdACUAJQAdAB0AHQAlACUAHQAdACUAHQAdACUAJQAlAB4AHQAeAB4AHgAeAB0AHQAlAB0AHQAdAB0AHQAdACUAJQAlACUAJQAdACUAJQAgACUAHQAdACUAJQAlACUAJQAlACUAJQAeAB4AHgAlACUAIAAgACAAIAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHgAeAB4AFwAXABcAFwAXABcAHgATABMAJQAeAB4AHgAWABEAFgARABYAEQAWABEAFgARABYAEQAWABEATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeABYAEQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAWABEAFgARABYAEQAWABEAFgARAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AFgARABYAEQAWABEAFgARABYAEQAWABEAFgARABYAEQAWABEAFgARABYAEQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAWABEAFgARAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AFgARAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB0AHQAdAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AUABQAFAAUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAEAAQABAAeAB4AKwArACsAKwArABMADQANAA0AUAATAA0AUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAUAANACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAA0ADQANAA0ADQANAA0ADQAeAA0AFgANAB4AHgAXABcAHgAeABcAFwAWABEAFgARABYAEQAWABEADQANAA0ADQATAFAADQANAB4ADQANAB4AHgAeAB4AHgAMAAwADQANAA0AHgANAA0AFgANAA0ADQANAA0ADQANAA0AHgANAB4ADQANAB4AHgAeACsAKwArACsAKwArACsAKwArACsAKwArACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAKwArACsAKwArACsAKwArACsAKwArACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAlACUAJQAlACUAJQAlACUAJQAlACUAJQArACsAKwArAA0AEQARACUAJQBHAFcAVwAWABEAFgARABYAEQAWABEAFgARACUAJQAWABEAFgARABYAEQAWABEAFQAWABEAEQAlAFcAVwBXAFcAVwBXAFcAVwBXAAQABAAEAAQABAAEACUAVwBXAFcAVwA2ACUAJQBXAFcAVwBHAEcAJQAlACUAKwBRAFcAUQBXAFEAVwBRAFcAUQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFEAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBRAFcAUQBXAFEAVwBXAFcAVwBXAFcAUQBXAFcAVwBXAFcAVwBRAFEAKwArAAQABAAVABUARwBHAFcAFQBRAFcAUQBXAFEAVwBRAFcAUQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFEAVwBRAFcAUQBXAFcAVwBXAFcAVwBRAFcAVwBXAFcAVwBXAFEAUQBXAFcAVwBXABUAUQBHAEcAVwArACsAKwArACsAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAKwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAKwAlACUAVwBXAFcAVwAlACUAJQAlACUAJQAlACUAJQAlACsAKwArACsAKwArACsAKwArACsAKwArAFEAUQBRAFEAUQBRAFEAUQBRAFEAUQBRAFEAUQBRAFEAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQArAFcAVwBXAFcAVwBXAFcAVwBXAFcAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQBPAE8ATwBPAE8ATwBPAE8AJQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACUAJQAlAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAEcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAKwArACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAADQATAA0AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABLAEsASwBLAEsASwBLAEsASwBLAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAFAABAAEAAQABAAeAAQABAAEAAQABAAEAAQABAAEAAQAHgBQAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AUABQAAQABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAeAA0ADQANAA0ADQArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAFAAUABQAFAAUABQAFAAUABQAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAB4AHgAeAB4AHgAeAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAHgAeAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAeAB4AUABQAFAAUABQAFAAUABQAFAAUABQAAQAUABQAFAABABQAFAAUABQAAQAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAeAB4AHgAeAAQAKwArACsAUABQAFAAUABQAFAAHgAeABoAHgArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAADgAOABMAEwArACsAKwArACsAKwArACsABAAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwANAA0ASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArACsAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABABQAFAAUABQAFAAUAAeAB4AHgBQAA4AUABQAAQAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAA0ADQBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwArACsAKwArACsAKwArACsAKwArAB4AWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYACsAKwArAAQAHgAeAB4AHgAeAB4ADQANAA0AHgAeAB4AHgArAFAASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArAB4AHgBcAFwAXABcAFwAKgBcAFwAXABcAFwAXABcAFwAXABcAEsASwBLAEsASwBLAEsASwBLAEsAXABcAFwAXABcACsAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwArAFAAUABQAAQAUABQAFAAUABQAFAAUABQAAQABAArACsASwBLAEsASwBLAEsASwBLAEsASwArACsAHgANAA0ADQBcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAKgAqACoAXAAqACoAKgBcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAAqAFwAKgAqACoAXABcACoAKgBcAFwAXABcAFwAKgAqAFwAKgBcACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFwAXABcACoAKgBQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAA0ADQBQAFAAUAAEAAQAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUAArACsAUABQAFAAUABQAFAAKwArAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgAeACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQADQAEAAQAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAVABVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBUAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVACsAKwArACsAKwArACsAKwArACsAKwArAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAKwArACsAKwBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAKwArACsAKwAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACUAJQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAJQAlACUAJQAlACUAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAKwArACsAKwArAFYABABWAFYAVgBWAFYAVgBWAFYAVgBWAB4AVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgArAFYAVgBWAFYAVgArAFYAKwBWAFYAKwBWAFYAKwBWAFYAVgBWAFYAVgBWAFYAVgBWAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAEQAWAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUAAaAB4AKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAGAARABEAGAAYABMAEwAWABEAFAArACsAKwArACsAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACUAJQAlACUAJQAWABEAFgARABYAEQAWABEAFgARABYAEQAlACUAFgARACUAJQAlACUAJQAlACUAEQAlABEAKwAVABUAEwATACUAFgARABYAEQAWABEAJQAlACUAJQAlACUAJQAlACsAJQAbABoAJQArACsAKwArAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAAcAKwATACUAJQAbABoAJQAlABYAEQAlACUAEQAlABEAJQBXAFcAVwBXAFcAVwBXAFcAVwBXABUAFQAlACUAJQATACUAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXABYAJQARACUAJQAlAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwAWACUAEQAlABYAEQARABYAEQARABUAVwBRAFEAUQBRAFEAUQBRAFEAUQBRAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAEcARwArACsAVwBXAFcAVwBXAFcAKwArAFcAVwBXAFcAVwBXACsAKwBXAFcAVwBXAFcAVwArACsAVwBXAFcAKwArACsAGgAbACUAJQAlABsAGwArAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwAEAAQABAAQAB0AKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsADQANAA0AKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArAB4AHgAeAB4AHgAeAB4AHgAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAFAAHgAeAB4AKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAAQAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAA0AUABQAFAAUAArACsAKwArAFAAUABQAFAAUABQAFAAUAANAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwAeACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAKwArAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUAArACsAKwBQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwANAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAB4AUABQAFAAUABQAFAAUAArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUAArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArAA0AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAUABQAFAAUABQAAQABAAEACsABAAEACsAKwArACsAKwAEAAQABAAEAFAAUABQAFAAKwBQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAAQABAAEACsAKwArACsABABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArAA0ADQANAA0ADQANAA0ADQAeACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAFAAUABQAFAAUABQAFAAUAAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAArACsAKwArAFAAUABQAFAAUAANAA0ADQANAA0ADQAUACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsADQANAA0ADQANAA0ADQBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArAFAAUABQAFAAUABQAAQABAAEAAQAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUAArAAQABAANACsAKwBQAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABABQAFAAUABQAB4AHgAeAB4AHgArACsAKwArACsAKwAEAAQABAAEAAQABAAEAA0ADQAeAB4AHgAeAB4AKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABAAeAB4AHgANAA0ADQANACsAKwArACsAKwArACsAKwArACsAKwAeACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwBLAEsASwBLAEsASwBLAEsASwBLACsAKwArACsAKwArAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsASwBLAEsASwBLAEsASwBLAEsASwANAA0ADQANAFAABAAEAFAAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAeAA4AUAArACsAKwArACsAKwArACsAKwAEAFAAUABQAFAADQANAB4ADQAEAAQABAAEAB4ABAAEAEsASwBLAEsASwBLAEsASwBLAEsAUAAOAFAADQANAA0AKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAANAA0AHgANAA0AHgAEACsAUABQAFAAUABQAFAAUAArAFAAKwBQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAA0AKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsABAAEAAQABAArAFAAUABQAFAAUABQAFAAUAArACsAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAUABQACsAUABQAFAAUABQACsABAAEAFAABAAEAAQABAAEAAQABAArACsABAAEACsAKwAEAAQABAArACsAUAArACsAKwArACsAKwAEACsAKwArACsAKwBQAFAAUABQAFAABAAEACsAKwAEAAQABAAEAAQABAAEACsAKwArAAQABAAEAAQABAArACsAKwArACsAKwArACsAKwArACsABAAEAAQABAAEAAQABABQAFAAUABQAA0ADQANAA0AHgBLAEsASwBLAEsASwBLAEsASwBLAA0ADQArAB4ABABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAEAAQABAAEAFAAUAAeAFAAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAArACsABAAEAAQABAAEAAQABAAEAAQADgANAA0AEwATAB4AHgAeAA0ADQANAA0ADQANAA0ADQANAA0ADQANAA0ADQANAFAAUABQAFAABAAEACsAKwAEAA0ADQAeAFAAKwArACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAFAAKwArACsAKwArACsAKwBLAEsASwBLAEsASwBLAEsASwBLACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAKwArACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwBcAFwADQANAA0AKgBQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAeACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwBQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAKwArAFAAKwArAFAAUABQAFAAUABQAFAAUAArAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQAKwAEAAQAKwArAAQABAAEAAQAUAAEAFAABAAEAA0ADQANACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAArACsABAAEAAQABAAEAAQABABQAA4AUAAEACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAABAAEAAQABAAEAAQABAAEAAQABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAFAABAAEAAQABAAOAB4ADQANAA0ADQAOAB4ABAArACsAKwArACsAKwArACsAUAAEAAQABAAEAAQABAAEAAQABAAEAAQAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAA0ADQANAFAADgAOAA4ADQANACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEACsABAAEAAQABAAEAAQABAAEAFAADQANAA0ADQANACsAKwArACsAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwAOABMAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQACsAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAArACsAKwAEACsABAAEACsABAAEAAQABAAEAAQABABQAAQAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAUABQAFAAUABQAFAAKwBQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQAKwAEAAQAKwAEAAQABAAEAAQAUAArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAB4AHgAeAB4AHgAeAB4AHgAaABoAGgAaAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwArACsAKwArACsAKwArAA0AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsADQANAA0ADQANACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAASABIAEgAQwBDAEMAUABQAFAAUABDAFAAUABQAEgAQwBIAEMAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAASABDAEMAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwAJAAkACQAJAAkACQAJABYAEQArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABIAEMAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwANAA0AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAAQABAAEAAQABAANACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAA0ADQANAB4AHgAeAB4AHgAeAFAAUABQAFAADQAeACsAKwArACsAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwArAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAANAA0AHgAeACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwAEAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwArACsAKwArACsAKwAEAAQABAAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAARwBHABUARwAJACsAKwArACsAKwArACsAKwArACsAKwAEAAQAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACsAKwArACsAKwArACsAKwBXAFcAVwBXAFcAVwBXAFcAVwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUQBRAFEAKwArACsAKwArACsAKwArACsAKwArACsAKwBRAFEAUQBRACsAKwArACsAKwArACsAKwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUAArACsAHgAEAAQADQAEAAQABAAEACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwArACsAKwArAB4AHgAeAB4AHgAeAB4AKwArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAAQABAAEAAQABAAeAB4AHgAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAB4AHgAEAAQABAAEAAQABAAEAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAEAAQABAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAEAAQAHgArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwArACsAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwBQAFAAKwArAFAAKwArAFAAUAArACsAUABQAFAAUAArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACsAUAArAFAAUABQAFAAUABQAFAAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwBQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAHgAeAFAAUABQAFAAUAArAFAAKwArACsAUABQAFAAUABQAFAAUAArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAFAAUABQAFAAUABQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAB4AHgAeAB4AHgAeAB4AHgAeACsAKwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAeAB4AHgAeAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAeAB4AHgAeAB4AHgAeAB4ABAAeAB4AHgAeAB4AHgAeAB4AHgAeAAQAHgAeAA0ADQANAA0AHgArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAEAAQABAAEAAQAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAAQABAAEAAQABAAEAAQAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwArAAQABAAEAAQABAAEAAQAKwAEAAQAKwAEAAQABAAEAAQAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwAEAAQABAAEAAQABAAEAFAAUABQAFAAUABQAFAAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwBQAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArABsAUABQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwArAB4AHgAeAB4ABAAEAAQABAAEAAQABABQACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArABYAFgArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAGgBQAFAAUAAaAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwBQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAKwBQACsAKwBQACsAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAKwBQACsAUAArACsAKwArACsAKwBQACsAKwArACsAUAArAFAAKwBQACsAUABQAFAAKwBQAFAAKwBQACsAKwBQACsAUAArAFAAKwBQACsAUAArAFAAUAArAFAAKwArAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAUABQAFAAUAArAFAAUABQAFAAKwBQACsAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAUABQAFAAKwBQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8AJQAlACUAHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHgAeAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB4AHgAeACUAJQAlAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQApACkAKQApACkAKQApACkAKQApACkAKQApACkAKQApACkAKQApACkAKQApACkAKQApACkAJQAlACUAJQAlACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAeAB4AJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlAB4AHgAlACUAJQAlACUAHgAlACUAJQAlACUAIAAgACAAJQAlACAAJQAlACAAIAAgACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACEAIQAhACEAIQAlACUAIAAgACUAJQAgACAAIAAgACAAIAAgACAAIAAgACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAJQAlACUAIAAlACUAJQAlACAAIAAgACUAIAAgACAAJQAlACUAJQAlACUAJQAgACUAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAHgAlAB4AJQAeACUAJQAlACUAJQAgACUAJQAlACUAHgAlAB4AHgAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAeACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACAAIAAlACUAJQAlACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACAAJQAlACUAJQAgACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAHgAeAB4AHgAeAB4AHgAeACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAeAB4AHgAeAB4AHgAlACUAJQAlACUAJQAlACAAIAAgACUAJQAlACAAIAAgACAAIAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeABcAFwAXABUAFQAVAB4AHgAeAB4AJQAlACUAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACAAIAAgACUAJQAlACUAJQAlACUAJQAlACAAJQAlACUAJQAlACUAJQAlACUAJQAlACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAlACUAJQAlACUAJQAlACUAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACUAJQAlACUAJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAeACUAJQAlACUAJQAlAB4AHgAeAB4AHgAeAB4AHgAlACUAJQAlACUAJQAlACUAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAgACUAJQAgACUAJQAlACUAJQAlACUAJQAgACAAIAAgACAAIAAgACAAJQAlACUAJQAlACUAIAAlACUAJQAlACUAJQAlACUAJQAgACAAIAAgACAAIAAgACAAIAAgACUAJQAgACAAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAgACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACAAIAAlACAAIAAlACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAgACAAIAAlACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAJQAlAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAKwArAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACUAJQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwAlACUAJQAlACUAJQAlACUAJQAlACUAVwBXACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAKwAEACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAA==';
  var LETTER_NUMBER_MODIFIER = 50;
  // Non-tailorable Line Breaking Classes
  var BK = 1; //  Cause a line break (after)
  var CR$1 = 2; //  Cause a line break (after), except between CR and LF
  var LF$1 = 3; //  Cause a line break (after)
  var CM = 4; //  Prohibit a line break between the character and the preceding character
  var NL = 5; //  Cause a line break (after)
  var WJ = 7; //  Prohibit line breaks before and after
  var ZW = 8; //  Provide a break opportunity
  var GL = 9; //  Prohibit line breaks before and after
  var SP = 10; // Enable indirect line breaks
  var ZWJ$1 = 11; // Prohibit line breaks within joiner sequences
  // Break Opportunities
  var B2 = 12; //  Provide a line break opportunity before and after the character
  var BA = 13; //  Generally provide a line break opportunity after the character
  var BB = 14; //  Generally provide a line break opportunity before the character
  var HY = 15; //  Provide a line break opportunity after the character, except in numeric context
  var CB = 16; //   Provide a line break opportunity contingent on additional information
  // Characters Prohibiting Certain Breaks
  var CL = 17; //  Prohibit line breaks before
  var CP = 18; //  Prohibit line breaks before
  var EX = 19; //  Prohibit line breaks before
  var IN = 20; //  Allow only indirect line breaks between pairs
  var NS = 21; //  Allow only indirect line breaks before
  var OP = 22; //  Prohibit line breaks after
  var QU = 23; //  Act like they are both opening and closing
  // Numeric Context
  var IS = 24; //  Prevent breaks after any and before numeric
  var NU = 25; //  Form numeric expressions for line breaking purposes
  var PO = 26; //  Do not break following a numeric expression
  var PR = 27; //  Do not break in front of a numeric expression
  var SY = 28; //  Prevent a break before; and allow a break after
  // Other Characters
  var AI = 29; //  Act like AL when the resolvedEAW is N; otherwise; act as ID
  var AL = 30; //  Are alphabetic characters or symbols that are used with alphabetic characters
  var CJ = 31; //  Treat as NS or ID for strict or normal breaking.
  var EB = 32; //  Do not break from following Emoji Modifier
  var EM = 33; //  Do not break from preceding Emoji Base
  var H2 = 34; //  Form Korean syllable blocks
  var H3 = 35; //  Form Korean syllable blocks
  var HL = 36; //  Do not break around a following hyphen; otherwise act as Alphabetic
  var ID = 37; //  Break before or after; except in some numeric context
  var JL = 38; //  Form Korean syllable blocks
  var JV = 39; //  Form Korean syllable blocks
  var JT = 40; //  Form Korean syllable blocks
  var RI$1 = 41; //  Keep pairs together. For pairs; break before and after other classes
  var SA = 42; //  Provide a line break opportunity contingent on additional, language-specific context analysis
  var XX = 43; //  Have as yet unknown line breaking behavior or unassigned code positions
  var ea_OP = [0x2329, 0xff08];
  var BREAK_MANDATORY = '!';
  var BREAK_NOT_ALLOWED$1 = '×';
  var BREAK_ALLOWED$1 = '÷';
  var UnicodeTrie$1 = createTrieFromBase64$1(base64$1);
  var ALPHABETICS = [AL, HL];
  var HARD_LINE_BREAKS = [BK, CR$1, LF$1, NL];
  var SPACE$1 = [SP, ZW];
  var PREFIX_POSTFIX = [PR, PO];
  var LINE_BREAKS = HARD_LINE_BREAKS.concat(SPACE$1);
  var KOREAN_SYLLABLE_BLOCK = [JL, JV, JT, H2, H3];
  var HYPHEN = [HY, BA];
  var codePointsToCharacterClasses = function codePointsToCharacterClasses(codePoints, lineBreak) {
    if (lineBreak === void 0) {
      lineBreak = 'strict';
    }
    var types = [];
    var indices = [];
    var categories = [];
    codePoints.forEach(function (codePoint, index) {
      var classType = UnicodeTrie$1.get(codePoint);
      if (classType > LETTER_NUMBER_MODIFIER) {
        categories.push(true);
        classType -= LETTER_NUMBER_MODIFIER;
      } else {
        categories.push(false);
      }
      if (['normal', 'auto', 'loose'].indexOf(lineBreak) !== -1) {
        // U+2010, – U+2013, 〜 U+301C, ゠ U+30A0
        if ([0x2010, 0x2013, 0x301c, 0x30a0].indexOf(codePoint) !== -1) {
          indices.push(index);
          return types.push(CB);
        }
      }
      if (classType === CM || classType === ZWJ$1) {
        // LB10 Treat any remaining combining mark or ZWJ as AL.
        if (index === 0) {
          indices.push(index);
          return types.push(AL);
        }
        // LB9 Do not break a combining character sequence; treat it as if it has the line breaking class of
        // the base character in all of the following rules. Treat ZWJ as if it were CM.
        var prev = types[index - 1];
        if (LINE_BREAKS.indexOf(prev) === -1) {
          indices.push(indices[index - 1]);
          return types.push(prev);
        }
        indices.push(index);
        return types.push(AL);
      }
      indices.push(index);
      if (classType === CJ) {
        return types.push(lineBreak === 'strict' ? NS : ID);
      }
      if (classType === SA) {
        return types.push(AL);
      }
      if (classType === AI) {
        return types.push(AL);
      }
      // For supplementary characters, a useful default is to treat characters in the range 10000..1FFFD as AL
      // and characters in the ranges 20000..2FFFD and 30000..3FFFD as ID, until the implementation can be revised
      // to take into account the actual line breaking properties for these characters.
      if (classType === XX) {
        if (codePoint >= 0x20000 && codePoint <= 0x2fffd || codePoint >= 0x30000 && codePoint <= 0x3fffd) {
          return types.push(ID);
        } else {
          return types.push(AL);
        }
      }
      types.push(classType);
    });
    return [indices, types, categories];
  };
  var isAdjacentWithSpaceIgnored = function isAdjacentWithSpaceIgnored(a, b, currentIndex, classTypes) {
    var current = classTypes[currentIndex];
    if (Array.isArray(a) ? a.indexOf(current) !== -1 : a === current) {
      var i = currentIndex;
      while (i <= classTypes.length) {
        i++;
        var next = classTypes[i];
        if (next === b) {
          return true;
        }
        if (next !== SP) {
          break;
        }
      }
    }
    if (current === SP) {
      var i = currentIndex;
      while (i > 0) {
        i--;
        var prev = classTypes[i];
        if (Array.isArray(a) ? a.indexOf(prev) !== -1 : a === prev) {
          var n = currentIndex;
          while (n <= classTypes.length) {
            n++;
            var next = classTypes[n];
            if (next === b) {
              return true;
            }
            if (next !== SP) {
              break;
            }
          }
        }
        if (prev !== SP) {
          break;
        }
      }
    }
    return false;
  };
  var previousNonSpaceClassType = function previousNonSpaceClassType(currentIndex, classTypes) {
    var i = currentIndex;
    while (i >= 0) {
      var type = classTypes[i];
      if (type === SP) {
        i--;
      } else {
        return type;
      }
    }
    return 0;
  };
  var _lineBreakAtIndex = function _lineBreakAtIndex(codePoints, classTypes, indicies, index, forbiddenBreaks) {
    if (indicies[index] === 0) {
      return BREAK_NOT_ALLOWED$1;
    }
    var currentIndex = index - 1;
    if (Array.isArray(forbiddenBreaks) && forbiddenBreaks[currentIndex] === true) {
      return BREAK_NOT_ALLOWED$1;
    }
    var beforeIndex = currentIndex - 1;
    var afterIndex = currentIndex + 1;
    var current = classTypes[currentIndex];
    // LB4 Always break after hard line breaks.
    // LB5 Treat CR followed by LF, as well as CR, LF, and NL as hard line breaks.
    var before = beforeIndex >= 0 ? classTypes[beforeIndex] : 0;
    var next = classTypes[afterIndex];
    if (current === CR$1 && next === LF$1) {
      return BREAK_NOT_ALLOWED$1;
    }
    if (HARD_LINE_BREAKS.indexOf(current) !== -1) {
      return BREAK_MANDATORY;
    }
    // LB6 Do not break before hard line breaks.
    if (HARD_LINE_BREAKS.indexOf(next) !== -1) {
      return BREAK_NOT_ALLOWED$1;
    }
    // LB7 Do not break before spaces or zero width space.
    if (SPACE$1.indexOf(next) !== -1) {
      return BREAK_NOT_ALLOWED$1;
    }
    // LB8 Break before any character following a zero-width space, even if one or more spaces intervene.
    if (previousNonSpaceClassType(currentIndex, classTypes) === ZW) {
      return BREAK_ALLOWED$1;
    }
    // LB8a Do not break after a zero width joiner.
    if (UnicodeTrie$1.get(codePoints[currentIndex]) === ZWJ$1) {
      return BREAK_NOT_ALLOWED$1;
    }
    // zwj emojis
    if ((current === EB || current === EM) && UnicodeTrie$1.get(codePoints[afterIndex]) === ZWJ$1) {
      return BREAK_NOT_ALLOWED$1;
    }
    // LB11 Do not break before or after Word joiner and related characters.
    if (current === WJ || next === WJ) {
      return BREAK_NOT_ALLOWED$1;
    }
    // LB12 Do not break after NBSP and related characters.
    if (current === GL) {
      return BREAK_NOT_ALLOWED$1;
    }
    // LB12a Do not break before NBSP and related characters, except after spaces and hyphens.
    if ([SP, BA, HY].indexOf(current) === -1 && next === GL) {
      return BREAK_NOT_ALLOWED$1;
    }
    // LB13 Do not break before ‘]’ or ‘!’ or ‘;’ or ‘/’, even after spaces.
    if ([CL, CP, EX, IS, SY].indexOf(next) !== -1) {
      return BREAK_NOT_ALLOWED$1;
    }
    // LB14 Do not break after ‘[’, even after spaces.
    if (previousNonSpaceClassType(currentIndex, classTypes) === OP) {
      return BREAK_NOT_ALLOWED$1;
    }
    // LB15 Do not break within ‘”[’, even with intervening spaces.
    if (isAdjacentWithSpaceIgnored(QU, OP, currentIndex, classTypes)) {
      return BREAK_NOT_ALLOWED$1;
    }
    // LB16 Do not break between closing punctuation and a nonstarter (lb=NS), even with intervening spaces.
    if (isAdjacentWithSpaceIgnored([CL, CP], NS, currentIndex, classTypes)) {
      return BREAK_NOT_ALLOWED$1;
    }
    // LB17 Do not break within ‘——’, even with intervening spaces.
    if (isAdjacentWithSpaceIgnored(B2, B2, currentIndex, classTypes)) {
      return BREAK_NOT_ALLOWED$1;
    }
    // LB18 Break after spaces.
    if (current === SP) {
      return BREAK_ALLOWED$1;
    }
    // LB19 Do not break before or after quotation marks, such as ‘ ” ’.
    if (current === QU || next === QU) {
      return BREAK_NOT_ALLOWED$1;
    }
    // LB20 Break before and after unresolved CB.
    if (next === CB || current === CB) {
      return BREAK_ALLOWED$1;
    }
    // LB21 Do not break before hyphen-minus, other hyphens, fixed-width spaces, small kana, and other non-starters, or after acute accents.
    if ([BA, HY, NS].indexOf(next) !== -1 || current === BB) {
      return BREAK_NOT_ALLOWED$1;
    }
    // LB21a Don't break after Hebrew + Hyphen.
    if (before === HL && HYPHEN.indexOf(current) !== -1) {
      return BREAK_NOT_ALLOWED$1;
    }
    // LB21b Don’t break between Solidus and Hebrew letters.
    if (current === SY && next === HL) {
      return BREAK_NOT_ALLOWED$1;
    }
    // LB22 Do not break before ellipsis.
    if (next === IN) {
      return BREAK_NOT_ALLOWED$1;
    }
    // LB23 Do not break between digits and letters.
    if (ALPHABETICS.indexOf(next) !== -1 && current === NU || ALPHABETICS.indexOf(current) !== -1 && next === NU) {
      return BREAK_NOT_ALLOWED$1;
    }
    // LB23a Do not break between numeric prefixes and ideographs, or between ideographs and numeric postfixes.
    if (current === PR && [ID, EB, EM].indexOf(next) !== -1 || [ID, EB, EM].indexOf(current) !== -1 && next === PO) {
      return BREAK_NOT_ALLOWED$1;
    }
    // LB24 Do not break between numeric prefix/postfix and letters, or between letters and prefix/postfix.
    if (ALPHABETICS.indexOf(current) !== -1 && PREFIX_POSTFIX.indexOf(next) !== -1 || PREFIX_POSTFIX.indexOf(current) !== -1 && ALPHABETICS.indexOf(next) !== -1) {
      return BREAK_NOT_ALLOWED$1;
    }
    // LB25 Do not break between the following pairs of classes relevant to numbers:
    if (
    // (PR | PO) × ( OP | HY )? NU
    [PR, PO].indexOf(current) !== -1 && (next === NU || [OP, HY].indexOf(next) !== -1 && classTypes[afterIndex + 1] === NU) ||
    // ( OP | HY ) × NU
    [OP, HY].indexOf(current) !== -1 && next === NU ||
    // NU ×	(NU | SY | IS)
    current === NU && [NU, SY, IS].indexOf(next) !== -1) {
      return BREAK_NOT_ALLOWED$1;
    }
    // NU (NU | SY | IS)* × (NU | SY | IS | CL | CP)
    if ([NU, SY, IS, CL, CP].indexOf(next) !== -1) {
      var prevIndex = currentIndex;
      while (prevIndex >= 0) {
        var type = classTypes[prevIndex];
        if (type === NU) {
          return BREAK_NOT_ALLOWED$1;
        } else if ([SY, IS].indexOf(type) !== -1) {
          prevIndex--;
        } else {
          break;
        }
      }
    }
    // NU (NU | SY | IS)* (CL | CP)? × (PO | PR))
    if ([PR, PO].indexOf(next) !== -1) {
      var prevIndex = [CL, CP].indexOf(current) !== -1 ? beforeIndex : currentIndex;
      while (prevIndex >= 0) {
        var type = classTypes[prevIndex];
        if (type === NU) {
          return BREAK_NOT_ALLOWED$1;
        } else if ([SY, IS].indexOf(type) !== -1) {
          prevIndex--;
        } else {
          break;
        }
      }
    }
    // LB26 Do not break a Korean syllable.
    if (JL === current && [JL, JV, H2, H3].indexOf(next) !== -1 || [JV, H2].indexOf(current) !== -1 && [JV, JT].indexOf(next) !== -1 || [JT, H3].indexOf(current) !== -1 && next === JT) {
      return BREAK_NOT_ALLOWED$1;
    }
    // LB27 Treat a Korean Syllable Block the same as ID.
    if (KOREAN_SYLLABLE_BLOCK.indexOf(current) !== -1 && [IN, PO].indexOf(next) !== -1 || KOREAN_SYLLABLE_BLOCK.indexOf(next) !== -1 && current === PR) {
      return BREAK_NOT_ALLOWED$1;
    }
    // LB28 Do not break between alphabetics (“at”).
    if (ALPHABETICS.indexOf(current) !== -1 && ALPHABETICS.indexOf(next) !== -1) {
      return BREAK_NOT_ALLOWED$1;
    }
    // LB29 Do not break between numeric punctuation and alphabetics (“e.g.”).
    if (current === IS && ALPHABETICS.indexOf(next) !== -1) {
      return BREAK_NOT_ALLOWED$1;
    }
    // LB30 Do not break between letters, numbers, or ordinary symbols and opening or closing parentheses.
    if (ALPHABETICS.concat(NU).indexOf(current) !== -1 && next === OP && ea_OP.indexOf(codePoints[afterIndex]) === -1 || ALPHABETICS.concat(NU).indexOf(next) !== -1 && current === CP) {
      return BREAK_NOT_ALLOWED$1;
    }
    // LB30a Break between two regional indicator symbols if and only if there are an even number of regional
    // indicators preceding the position of the break.
    if (current === RI$1 && next === RI$1) {
      var i = indicies[currentIndex];
      var count = 1;
      while (i > 0) {
        i--;
        if (classTypes[i] === RI$1) {
          count++;
        } else {
          break;
        }
      }
      if (count % 2 !== 0) {
        return BREAK_NOT_ALLOWED$1;
      }
    }
    // LB30b Do not break between an emoji base and an emoji modifier.
    if (current === EB && next === EM) {
      return BREAK_NOT_ALLOWED$1;
    }
    return BREAK_ALLOWED$1;
  };
  var cssFormattedClasses = function cssFormattedClasses(codePoints, options) {
    if (!options) {
      options = {
        lineBreak: 'normal',
        wordBreak: 'normal'
      };
    }
    var _a = codePointsToCharacterClasses(codePoints, options.lineBreak),
      indicies = _a[0],
      classTypes = _a[1],
      isLetterNumber = _a[2];
    if (options.wordBreak === 'break-all' || options.wordBreak === 'break-word') {
      classTypes = classTypes.map(function (type) {
        return [NU, AL, SA].indexOf(type) !== -1 ? ID : type;
      });
    }
    var forbiddenBreakpoints = options.wordBreak === 'keep-all' ? isLetterNumber.map(function (letterNumber, i) {
      return letterNumber && codePoints[i] >= 0x4e00 && codePoints[i] <= 0x9fff;
    }) : undefined;
    return [indicies, classTypes, forbiddenBreakpoints];
  };
  var Break = /** @class */function () {
    function Break(codePoints, lineBreak, start, end) {
      this.codePoints = codePoints;
      this.required = lineBreak === BREAK_MANDATORY;
      this.start = start;
      this.end = end;
    }
    Break.prototype.slice = function () {
      return fromCodePoint$1.apply(void 0, this.codePoints.slice(this.start, this.end));
    };
    return Break;
  }();
  var LineBreaker = function LineBreaker(str, options) {
    var codePoints = toCodePoints$1(str);
    var _a = cssFormattedClasses(codePoints, options),
      indicies = _a[0],
      classTypes = _a[1],
      forbiddenBreakpoints = _a[2];
    var length = codePoints.length;
    var lastEnd = 0;
    var nextIndex = 0;
    return {
      next: function next() {
        if (nextIndex >= length) {
          return {
            done: true,
            value: null
          };
        }
        var lineBreak = BREAK_NOT_ALLOWED$1;
        while (nextIndex < length && (lineBreak = _lineBreakAtIndex(codePoints, classTypes, indicies, ++nextIndex, forbiddenBreakpoints)) === BREAK_NOT_ALLOWED$1) {}
        if (lineBreak !== BREAK_NOT_ALLOWED$1 || nextIndex === length) {
          var value = new Break(codePoints, lineBreak, lastEnd, nextIndex);
          lastEnd = nextIndex;
          return {
            value: value,
            done: false
          };
        }
        return {
          done: true,
          value: null
        };
      }
    };
  };

  // https://www.w3.org/TR/css-syntax-3
  var FLAG_UNRESTRICTED = 1 << 0;
  var FLAG_ID = 1 << 1;
  var FLAG_INTEGER = 1 << 2;
  var FLAG_NUMBER = 1 << 3;
  var LINE_FEED = 0x000a;
  var SOLIDUS = 0x002f;
  var REVERSE_SOLIDUS = 0x005c;
  var CHARACTER_TABULATION = 0x0009;
  var SPACE = 0x0020;
  var QUOTATION_MARK = 0x0022;
  var EQUALS_SIGN = 0x003d;
  var NUMBER_SIGN = 0x0023;
  var DOLLAR_SIGN = 0x0024;
  var PERCENTAGE_SIGN = 0x0025;
  var APOSTROPHE = 0x0027;
  var LEFT_PARENTHESIS = 0x0028;
  var RIGHT_PARENTHESIS = 0x0029;
  var LOW_LINE = 0x005f;
  var HYPHEN_MINUS = 0x002d;
  var EXCLAMATION_MARK = 0x0021;
  var LESS_THAN_SIGN = 0x003c;
  var GREATER_THAN_SIGN = 0x003e;
  var COMMERCIAL_AT = 0x0040;
  var LEFT_SQUARE_BRACKET = 0x005b;
  var RIGHT_SQUARE_BRACKET = 0x005d;
  var CIRCUMFLEX_ACCENT = 0x003d;
  var LEFT_CURLY_BRACKET = 0x007b;
  var QUESTION_MARK = 0x003f;
  var RIGHT_CURLY_BRACKET = 0x007d;
  var VERTICAL_LINE = 0x007c;
  var TILDE = 0x007e;
  var CONTROL = 0x0080;
  var REPLACEMENT_CHARACTER = 0xfffd;
  var ASTERISK = 0x002a;
  var PLUS_SIGN = 0x002b;
  var COMMA = 0x002c;
  var COLON = 0x003a;
  var SEMICOLON = 0x003b;
  var FULL_STOP = 0x002e;
  var NULL = 0x0000;
  var BACKSPACE = 0x0008;
  var LINE_TABULATION = 0x000b;
  var SHIFT_OUT = 0x000e;
  var INFORMATION_SEPARATOR_ONE = 0x001f;
  var DELETE = 0x007f;
  var EOF = -1;
  var ZERO = 0x0030;
  var a = 0x0061;
  var e = 0x0065;
  var f = 0x0066;
  var u = 0x0075;
  var z = 0x007a;
  var A = 0x0041;
  var E = 0x0045;
  var F = 0x0046;
  var U = 0x0055;
  var Z = 0x005a;
  var isDigit = function isDigit(codePoint) {
    return codePoint >= ZERO && codePoint <= 0x0039;
  };
  var isSurrogateCodePoint = function isSurrogateCodePoint(codePoint) {
    return codePoint >= 0xd800 && codePoint <= 0xdfff;
  };
  var isHex = function isHex(codePoint) {
    return isDigit(codePoint) || codePoint >= A && codePoint <= F || codePoint >= a && codePoint <= f;
  };
  var isLowerCaseLetter = function isLowerCaseLetter(codePoint) {
    return codePoint >= a && codePoint <= z;
  };
  var isUpperCaseLetter = function isUpperCaseLetter(codePoint) {
    return codePoint >= A && codePoint <= Z;
  };
  var isLetter = function isLetter(codePoint) {
    return isLowerCaseLetter(codePoint) || isUpperCaseLetter(codePoint);
  };
  var isNonASCIICodePoint = function isNonASCIICodePoint(codePoint) {
    return codePoint >= CONTROL;
  };
  var isWhiteSpace = function isWhiteSpace(codePoint) {
    return codePoint === LINE_FEED || codePoint === CHARACTER_TABULATION || codePoint === SPACE;
  };
  var isNameStartCodePoint = function isNameStartCodePoint(codePoint) {
    return isLetter(codePoint) || isNonASCIICodePoint(codePoint) || codePoint === LOW_LINE;
  };
  var isNameCodePoint = function isNameCodePoint(codePoint) {
    return isNameStartCodePoint(codePoint) || isDigit(codePoint) || codePoint === HYPHEN_MINUS;
  };
  var isNonPrintableCodePoint = function isNonPrintableCodePoint(codePoint) {
    return codePoint >= NULL && codePoint <= BACKSPACE || codePoint === LINE_TABULATION || codePoint >= SHIFT_OUT && codePoint <= INFORMATION_SEPARATOR_ONE || codePoint === DELETE;
  };
  var isValidEscape = function isValidEscape(c1, c2) {
    if (c1 !== REVERSE_SOLIDUS) {
      return false;
    }
    return c2 !== LINE_FEED;
  };
  var isIdentifierStart = function isIdentifierStart(c1, c2, c3) {
    if (c1 === HYPHEN_MINUS) {
      return isNameStartCodePoint(c2) || isValidEscape(c2, c3);
    } else if (isNameStartCodePoint(c1)) {
      return true;
    } else if (c1 === REVERSE_SOLIDUS && isValidEscape(c1, c2)) {
      return true;
    }
    return false;
  };
  var isNumberStart = function isNumberStart(c1, c2, c3) {
    if (c1 === PLUS_SIGN || c1 === HYPHEN_MINUS) {
      if (isDigit(c2)) {
        return true;
      }
      return c2 === FULL_STOP && isDigit(c3);
    }
    if (c1 === FULL_STOP) {
      return isDigit(c2);
    }
    return isDigit(c1);
  };
  var stringToNumber = function stringToNumber(codePoints) {
    var c = 0;
    var sign = 1;
    if (codePoints[c] === PLUS_SIGN || codePoints[c] === HYPHEN_MINUS) {
      if (codePoints[c] === HYPHEN_MINUS) {
        sign = -1;
      }
      c++;
    }
    var integers = [];
    while (isDigit(codePoints[c])) {
      integers.push(codePoints[c++]);
    }
    var int = integers.length ? parseInt(fromCodePoint$1.apply(void 0, integers), 10) : 0;
    if (codePoints[c] === FULL_STOP) {
      c++;
    }
    var fraction = [];
    while (isDigit(codePoints[c])) {
      fraction.push(codePoints[c++]);
    }
    var fracd = fraction.length;
    var frac = fracd ? parseInt(fromCodePoint$1.apply(void 0, fraction), 10) : 0;
    if (codePoints[c] === E || codePoints[c] === e) {
      c++;
    }
    var expsign = 1;
    if (codePoints[c] === PLUS_SIGN || codePoints[c] === HYPHEN_MINUS) {
      if (codePoints[c] === HYPHEN_MINUS) {
        expsign = -1;
      }
      c++;
    }
    var exponent = [];
    while (isDigit(codePoints[c])) {
      exponent.push(codePoints[c++]);
    }
    var exp = exponent.length ? parseInt(fromCodePoint$1.apply(void 0, exponent), 10) : 0;
    return sign * (int + frac * Math.pow(10, -fracd)) * Math.pow(10, expsign * exp);
  };
  var LEFT_PARENTHESIS_TOKEN = {
    type: 2 /* LEFT_PARENTHESIS_TOKEN */
  };

  var RIGHT_PARENTHESIS_TOKEN = {
    type: 3 /* RIGHT_PARENTHESIS_TOKEN */
  };

  var COMMA_TOKEN = {
    type: 4 /* COMMA_TOKEN */
  };
  var SUFFIX_MATCH_TOKEN = {
    type: 13 /* SUFFIX_MATCH_TOKEN */
  };
  var PREFIX_MATCH_TOKEN = {
    type: 8 /* PREFIX_MATCH_TOKEN */
  };
  var COLUMN_TOKEN = {
    type: 21 /* COLUMN_TOKEN */
  };
  var DASH_MATCH_TOKEN = {
    type: 9 /* DASH_MATCH_TOKEN */
  };
  var INCLUDE_MATCH_TOKEN = {
    type: 10 /* INCLUDE_MATCH_TOKEN */
  };
  var LEFT_CURLY_BRACKET_TOKEN = {
    type: 11 /* LEFT_CURLY_BRACKET_TOKEN */
  };

  var RIGHT_CURLY_BRACKET_TOKEN = {
    type: 12 /* RIGHT_CURLY_BRACKET_TOKEN */
  };

  var SUBSTRING_MATCH_TOKEN = {
    type: 14 /* SUBSTRING_MATCH_TOKEN */
  };
  var BAD_URL_TOKEN = {
    type: 23 /* BAD_URL_TOKEN */
  };
  var BAD_STRING_TOKEN = {
    type: 1 /* BAD_STRING_TOKEN */
  };
  var CDO_TOKEN = {
    type: 25 /* CDO_TOKEN */
  };
  var CDC_TOKEN = {
    type: 24 /* CDC_TOKEN */
  };
  var COLON_TOKEN = {
    type: 26 /* COLON_TOKEN */
  };
  var SEMICOLON_TOKEN = {
    type: 27 /* SEMICOLON_TOKEN */
  };
  var LEFT_SQUARE_BRACKET_TOKEN = {
    type: 28 /* LEFT_SQUARE_BRACKET_TOKEN */
  };

  var RIGHT_SQUARE_BRACKET_TOKEN = {
    type: 29 /* RIGHT_SQUARE_BRACKET_TOKEN */
  };

  var WHITESPACE_TOKEN = {
    type: 31 /* WHITESPACE_TOKEN */
  };
  var EOF_TOKEN = {
    type: 32 /* EOF_TOKEN */
  };
  var Tokenizer = /** @class */function () {
    function Tokenizer() {
      this._value = [];
    }
    Tokenizer.prototype.write = function (chunk) {
      this._value = this._value.concat(toCodePoints$1(chunk));
    };
    Tokenizer.prototype.read = function () {
      var tokens = [];
      var token = this.consumeToken();
      while (token !== EOF_TOKEN) {
        tokens.push(token);
        token = this.consumeToken();
      }
      return tokens;
    };
    Tokenizer.prototype.consumeToken = function () {
      var codePoint = this.consumeCodePoint();
      switch (codePoint) {
        case QUOTATION_MARK:
          return this.consumeStringToken(QUOTATION_MARK);
        case NUMBER_SIGN:
          var c1 = this.peekCodePoint(0);
          var c2 = this.peekCodePoint(1);
          var c3 = this.peekCodePoint(2);
          if (isNameCodePoint(c1) || isValidEscape(c2, c3)) {
            var flags = isIdentifierStart(c1, c2, c3) ? FLAG_ID : FLAG_UNRESTRICTED;
            var value = this.consumeName();
            return {
              type: 5 /* HASH_TOKEN */,
              value: value,
              flags: flags
            };
          }
          break;
        case DOLLAR_SIGN:
          if (this.peekCodePoint(0) === EQUALS_SIGN) {
            this.consumeCodePoint();
            return SUFFIX_MATCH_TOKEN;
          }
          break;
        case APOSTROPHE:
          return this.consumeStringToken(APOSTROPHE);
        case LEFT_PARENTHESIS:
          return LEFT_PARENTHESIS_TOKEN;
        case RIGHT_PARENTHESIS:
          return RIGHT_PARENTHESIS_TOKEN;
        case ASTERISK:
          if (this.peekCodePoint(0) === EQUALS_SIGN) {
            this.consumeCodePoint();
            return SUBSTRING_MATCH_TOKEN;
          }
          break;
        case PLUS_SIGN:
          if (isNumberStart(codePoint, this.peekCodePoint(0), this.peekCodePoint(1))) {
            this.reconsumeCodePoint(codePoint);
            return this.consumeNumericToken();
          }
          break;
        case COMMA:
          return COMMA_TOKEN;
        case HYPHEN_MINUS:
          var e1 = codePoint;
          var e2 = this.peekCodePoint(0);
          var e3 = this.peekCodePoint(1);
          if (isNumberStart(e1, e2, e3)) {
            this.reconsumeCodePoint(codePoint);
            return this.consumeNumericToken();
          }
          if (isIdentifierStart(e1, e2, e3)) {
            this.reconsumeCodePoint(codePoint);
            return this.consumeIdentLikeToken();
          }
          if (e2 === HYPHEN_MINUS && e3 === GREATER_THAN_SIGN) {
            this.consumeCodePoint();
            this.consumeCodePoint();
            return CDC_TOKEN;
          }
          break;
        case FULL_STOP:
          if (isNumberStart(codePoint, this.peekCodePoint(0), this.peekCodePoint(1))) {
            this.reconsumeCodePoint(codePoint);
            return this.consumeNumericToken();
          }
          break;
        case SOLIDUS:
          if (this.peekCodePoint(0) === ASTERISK) {
            this.consumeCodePoint();
            while (true) {
              var c = this.consumeCodePoint();
              if (c === ASTERISK) {
                c = this.consumeCodePoint();
                if (c === SOLIDUS) {
                  return this.consumeToken();
                }
              }
              if (c === EOF) {
                return this.consumeToken();
              }
            }
          }
          break;
        case COLON:
          return COLON_TOKEN;
        case SEMICOLON:
          return SEMICOLON_TOKEN;
        case LESS_THAN_SIGN:
          if (this.peekCodePoint(0) === EXCLAMATION_MARK && this.peekCodePoint(1) === HYPHEN_MINUS && this.peekCodePoint(2) === HYPHEN_MINUS) {
            this.consumeCodePoint();
            this.consumeCodePoint();
            return CDO_TOKEN;
          }
          break;
        case COMMERCIAL_AT:
          var a1 = this.peekCodePoint(0);
          var a2 = this.peekCodePoint(1);
          var a3 = this.peekCodePoint(2);
          if (isIdentifierStart(a1, a2, a3)) {
            var value = this.consumeName();
            return {
              type: 7 /* AT_KEYWORD_TOKEN */,
              value: value
            };
          }
          break;
        case LEFT_SQUARE_BRACKET:
          return LEFT_SQUARE_BRACKET_TOKEN;
        case REVERSE_SOLIDUS:
          if (isValidEscape(codePoint, this.peekCodePoint(0))) {
            this.reconsumeCodePoint(codePoint);
            return this.consumeIdentLikeToken();
          }
          break;
        case RIGHT_SQUARE_BRACKET:
          return RIGHT_SQUARE_BRACKET_TOKEN;
        case CIRCUMFLEX_ACCENT:
          if (this.peekCodePoint(0) === EQUALS_SIGN) {
            this.consumeCodePoint();
            return PREFIX_MATCH_TOKEN;
          }
          break;
        case LEFT_CURLY_BRACKET:
          return LEFT_CURLY_BRACKET_TOKEN;
        case RIGHT_CURLY_BRACKET:
          return RIGHT_CURLY_BRACKET_TOKEN;
        case u:
        case U:
          var u1 = this.peekCodePoint(0);
          var u2 = this.peekCodePoint(1);
          if (u1 === PLUS_SIGN && (isHex(u2) || u2 === QUESTION_MARK)) {
            this.consumeCodePoint();
            this.consumeUnicodeRangeToken();
          }
          this.reconsumeCodePoint(codePoint);
          return this.consumeIdentLikeToken();
        case VERTICAL_LINE:
          if (this.peekCodePoint(0) === EQUALS_SIGN) {
            this.consumeCodePoint();
            return DASH_MATCH_TOKEN;
          }
          if (this.peekCodePoint(0) === VERTICAL_LINE) {
            this.consumeCodePoint();
            return COLUMN_TOKEN;
          }
          break;
        case TILDE:
          if (this.peekCodePoint(0) === EQUALS_SIGN) {
            this.consumeCodePoint();
            return INCLUDE_MATCH_TOKEN;
          }
          break;
        case EOF:
          return EOF_TOKEN;
      }
      if (isWhiteSpace(codePoint)) {
        this.consumeWhiteSpace();
        return WHITESPACE_TOKEN;
      }
      if (isDigit(codePoint)) {
        this.reconsumeCodePoint(codePoint);
        return this.consumeNumericToken();
      }
      if (isNameStartCodePoint(codePoint)) {
        this.reconsumeCodePoint(codePoint);
        return this.consumeIdentLikeToken();
      }
      return {
        type: 6 /* DELIM_TOKEN */,
        value: fromCodePoint$1(codePoint)
      };
    };
    Tokenizer.prototype.consumeCodePoint = function () {
      var value = this._value.shift();
      return typeof value === 'undefined' ? -1 : value;
    };
    Tokenizer.prototype.reconsumeCodePoint = function (codePoint) {
      this._value.unshift(codePoint);
    };
    Tokenizer.prototype.peekCodePoint = function (delta) {
      if (delta >= this._value.length) {
        return -1;
      }
      return this._value[delta];
    };
    Tokenizer.prototype.consumeUnicodeRangeToken = function () {
      var digits = [];
      var codePoint = this.consumeCodePoint();
      while (isHex(codePoint) && digits.length < 6) {
        digits.push(codePoint);
        codePoint = this.consumeCodePoint();
      }
      var questionMarks = false;
      while (codePoint === QUESTION_MARK && digits.length < 6) {
        digits.push(codePoint);
        codePoint = this.consumeCodePoint();
        questionMarks = true;
      }
      if (questionMarks) {
        var start_1 = parseInt(fromCodePoint$1.apply(void 0, digits.map(function (digit) {
          return digit === QUESTION_MARK ? ZERO : digit;
        })), 16);
        var end = parseInt(fromCodePoint$1.apply(void 0, digits.map(function (digit) {
          return digit === QUESTION_MARK ? F : digit;
        })), 16);
        return {
          type: 30 /* UNICODE_RANGE_TOKEN */,
          start: start_1,
          end: end
        };
      }
      var start = parseInt(fromCodePoint$1.apply(void 0, digits), 16);
      if (this.peekCodePoint(0) === HYPHEN_MINUS && isHex(this.peekCodePoint(1))) {
        this.consumeCodePoint();
        codePoint = this.consumeCodePoint();
        var endDigits = [];
        while (isHex(codePoint) && endDigits.length < 6) {
          endDigits.push(codePoint);
          codePoint = this.consumeCodePoint();
        }
        var end = parseInt(fromCodePoint$1.apply(void 0, endDigits), 16);
        return {
          type: 30 /* UNICODE_RANGE_TOKEN */,
          start: start,
          end: end
        };
      } else {
        return {
          type: 30 /* UNICODE_RANGE_TOKEN */,
          start: start,
          end: start
        };
      }
    };
    Tokenizer.prototype.consumeIdentLikeToken = function () {
      var value = this.consumeName();
      if (value.toLowerCase() === 'url' && this.peekCodePoint(0) === LEFT_PARENTHESIS) {
        this.consumeCodePoint();
        return this.consumeUrlToken();
      } else if (this.peekCodePoint(0) === LEFT_PARENTHESIS) {
        this.consumeCodePoint();
        return {
          type: 19 /* FUNCTION_TOKEN */,
          value: value
        };
      }
      return {
        type: 20 /* IDENT_TOKEN */,
        value: value
      };
    };
    Tokenizer.prototype.consumeUrlToken = function () {
      var value = [];
      this.consumeWhiteSpace();
      if (this.peekCodePoint(0) === EOF) {
        return {
          type: 22 /* URL_TOKEN */,
          value: ''
        };
      }
      var next = this.peekCodePoint(0);
      if (next === APOSTROPHE || next === QUOTATION_MARK) {
        var stringToken = this.consumeStringToken(this.consumeCodePoint());
        if (stringToken.type === 0 /* STRING_TOKEN */) {
          this.consumeWhiteSpace();
          if (this.peekCodePoint(0) === EOF || this.peekCodePoint(0) === RIGHT_PARENTHESIS) {
            this.consumeCodePoint();
            return {
              type: 22 /* URL_TOKEN */,
              value: stringToken.value
            };
          }
        }
        this.consumeBadUrlRemnants();
        return BAD_URL_TOKEN;
      }
      while (true) {
        var codePoint = this.consumeCodePoint();
        if (codePoint === EOF || codePoint === RIGHT_PARENTHESIS) {
          return {
            type: 22 /* URL_TOKEN */,
            value: fromCodePoint$1.apply(void 0, value)
          };
        } else if (isWhiteSpace(codePoint)) {
          this.consumeWhiteSpace();
          if (this.peekCodePoint(0) === EOF || this.peekCodePoint(0) === RIGHT_PARENTHESIS) {
            this.consumeCodePoint();
            return {
              type: 22 /* URL_TOKEN */,
              value: fromCodePoint$1.apply(void 0, value)
            };
          }
          this.consumeBadUrlRemnants();
          return BAD_URL_TOKEN;
        } else if (codePoint === QUOTATION_MARK || codePoint === APOSTROPHE || codePoint === LEFT_PARENTHESIS || isNonPrintableCodePoint(codePoint)) {
          this.consumeBadUrlRemnants();
          return BAD_URL_TOKEN;
        } else if (codePoint === REVERSE_SOLIDUS) {
          if (isValidEscape(codePoint, this.peekCodePoint(0))) {
            value.push(this.consumeEscapedCodePoint());
          } else {
            this.consumeBadUrlRemnants();
            return BAD_URL_TOKEN;
          }
        } else {
          value.push(codePoint);
        }
      }
    };
    Tokenizer.prototype.consumeWhiteSpace = function () {
      while (isWhiteSpace(this.peekCodePoint(0))) {
        this.consumeCodePoint();
      }
    };
    Tokenizer.prototype.consumeBadUrlRemnants = function () {
      while (true) {
        var codePoint = this.consumeCodePoint();
        if (codePoint === RIGHT_PARENTHESIS || codePoint === EOF) {
          return;
        }
        if (isValidEscape(codePoint, this.peekCodePoint(0))) {
          this.consumeEscapedCodePoint();
        }
      }
    };
    Tokenizer.prototype.consumeStringSlice = function (count) {
      var SLICE_STACK_SIZE = 50000;
      var value = '';
      while (count > 0) {
        var amount = Math.min(SLICE_STACK_SIZE, count);
        value += fromCodePoint$1.apply(void 0, this._value.splice(0, amount));
        count -= amount;
      }
      this._value.shift();
      return value;
    };
    Tokenizer.prototype.consumeStringToken = function (endingCodePoint) {
      var value = '';
      var i = 0;
      do {
        var codePoint = this._value[i];
        if (codePoint === EOF || codePoint === undefined || codePoint === endingCodePoint) {
          value += this.consumeStringSlice(i);
          return {
            type: 0 /* STRING_TOKEN */,
            value: value
          };
        }
        if (codePoint === LINE_FEED) {
          this._value.splice(0, i);
          return BAD_STRING_TOKEN;
        }
        if (codePoint === REVERSE_SOLIDUS) {
          var next = this._value[i + 1];
          if (next !== EOF && next !== undefined) {
            if (next === LINE_FEED) {
              value += this.consumeStringSlice(i);
              i = -1;
              this._value.shift();
            } else if (isValidEscape(codePoint, next)) {
              value += this.consumeStringSlice(i);
              value += fromCodePoint$1(this.consumeEscapedCodePoint());
              i = -1;
            }
          }
        }
        i++;
      } while (true);
    };
    Tokenizer.prototype.consumeNumber = function () {
      var repr = [];
      var type = FLAG_INTEGER;
      var c1 = this.peekCodePoint(0);
      if (c1 === PLUS_SIGN || c1 === HYPHEN_MINUS) {
        repr.push(this.consumeCodePoint());
      }
      while (isDigit(this.peekCodePoint(0))) {
        repr.push(this.consumeCodePoint());
      }
      c1 = this.peekCodePoint(0);
      var c2 = this.peekCodePoint(1);
      if (c1 === FULL_STOP && isDigit(c2)) {
        repr.push(this.consumeCodePoint(), this.consumeCodePoint());
        type = FLAG_NUMBER;
        while (isDigit(this.peekCodePoint(0))) {
          repr.push(this.consumeCodePoint());
        }
      }
      c1 = this.peekCodePoint(0);
      c2 = this.peekCodePoint(1);
      var c3 = this.peekCodePoint(2);
      if ((c1 === E || c1 === e) && ((c2 === PLUS_SIGN || c2 === HYPHEN_MINUS) && isDigit(c3) || isDigit(c2))) {
        repr.push(this.consumeCodePoint(), this.consumeCodePoint());
        type = FLAG_NUMBER;
        while (isDigit(this.peekCodePoint(0))) {
          repr.push(this.consumeCodePoint());
        }
      }
      return [stringToNumber(repr), type];
    };
    Tokenizer.prototype.consumeNumericToken = function () {
      var _a = this.consumeNumber(),
        number = _a[0],
        flags = _a[1];
      var c1 = this.peekCodePoint(0);
      var c2 = this.peekCodePoint(1);
      var c3 = this.peekCodePoint(2);
      if (isIdentifierStart(c1, c2, c3)) {
        var unit = this.consumeName();
        return {
          type: 15 /* DIMENSION_TOKEN */,
          number: number,
          flags: flags,
          unit: unit
        };
      }
      if (c1 === PERCENTAGE_SIGN) {
        this.consumeCodePoint();
        return {
          type: 16 /* PERCENTAGE_TOKEN */,
          number: number,
          flags: flags
        };
      }
      return {
        type: 17 /* NUMBER_TOKEN */,
        number: number,
        flags: flags
      };
    };
    Tokenizer.prototype.consumeEscapedCodePoint = function () {
      var codePoint = this.consumeCodePoint();
      if (isHex(codePoint)) {
        var hex = fromCodePoint$1(codePoint);
        while (isHex(this.peekCodePoint(0)) && hex.length < 6) {
          hex += fromCodePoint$1(this.consumeCodePoint());
        }
        if (isWhiteSpace(this.peekCodePoint(0))) {
          this.consumeCodePoint();
        }
        var hexCodePoint = parseInt(hex, 16);
        if (hexCodePoint === 0 || isSurrogateCodePoint(hexCodePoint) || hexCodePoint > 0x10ffff) {
          return REPLACEMENT_CHARACTER;
        }
        return hexCodePoint;
      }
      if (codePoint === EOF) {
        return REPLACEMENT_CHARACTER;
      }
      return codePoint;
    };
    Tokenizer.prototype.consumeName = function () {
      var result = '';
      while (true) {
        var codePoint = this.consumeCodePoint();
        if (isNameCodePoint(codePoint)) {
          result += fromCodePoint$1(codePoint);
        } else if (isValidEscape(codePoint, this.peekCodePoint(0))) {
          result += fromCodePoint$1(this.consumeEscapedCodePoint());
        } else {
          this.reconsumeCodePoint(codePoint);
          return result;
        }
      }
    };
    return Tokenizer;
  }();
  var Parser = /** @class */function () {
    function Parser(tokens) {
      this._tokens = tokens;
    }
    Parser.create = function (value) {
      var tokenizer = new Tokenizer();
      tokenizer.write(value);
      return new Parser(tokenizer.read());
    };
    Parser.parseValue = function (value) {
      return Parser.create(value).parseComponentValue();
    };
    Parser.parseValues = function (value) {
      return Parser.create(value).parseComponentValues();
    };
    Parser.prototype.parseComponentValue = function () {
      var token = this.consumeToken();
      while (token.type === 31 /* WHITESPACE_TOKEN */) {
        token = this.consumeToken();
      }
      if (token.type === 32 /* EOF_TOKEN */) {
        throw new SyntaxError("Error parsing CSS component value, unexpected EOF");
      }
      this.reconsumeToken(token);
      var value = this.consumeComponentValue();
      do {
        token = this.consumeToken();
      } while (token.type === 31 /* WHITESPACE_TOKEN */);
      if (token.type === 32 /* EOF_TOKEN */) {
        return value;
      }
      throw new SyntaxError("Error parsing CSS component value, multiple values found when expecting only one");
    };
    Parser.prototype.parseComponentValues = function () {
      var values = [];
      while (true) {
        var value = this.consumeComponentValue();
        if (value.type === 32 /* EOF_TOKEN */) {
          return values;
        }
        values.push(value);
        values.push();
      }
    };
    Parser.prototype.consumeComponentValue = function () {
      var token = this.consumeToken();
      switch (token.type) {
        case 11 /* LEFT_CURLY_BRACKET_TOKEN */:
        case 28 /* LEFT_SQUARE_BRACKET_TOKEN */:
        case 2 /* LEFT_PARENTHESIS_TOKEN */:
          return this.consumeSimpleBlock(token.type);
        case 19 /* FUNCTION_TOKEN */:
          return this.consumeFunction(token);
      }
      return token;
    };
    Parser.prototype.consumeSimpleBlock = function (type) {
      var block = {
        type: type,
        values: []
      };
      var token = this.consumeToken();
      while (true) {
        if (token.type === 32 /* EOF_TOKEN */ || isEndingTokenFor(token, type)) {
          return block;
        }
        this.reconsumeToken(token);
        block.values.push(this.consumeComponentValue());
        token = this.consumeToken();
      }
    };
    Parser.prototype.consumeFunction = function (functionToken) {
      var cssFunction = {
        name: functionToken.value,
        values: [],
        type: 18 /* FUNCTION */
      };

      while (true) {
        var token = this.consumeToken();
        if (token.type === 32 /* EOF_TOKEN */ || token.type === 3 /* RIGHT_PARENTHESIS_TOKEN */) {
          return cssFunction;
        }
        this.reconsumeToken(token);
        cssFunction.values.push(this.consumeComponentValue());
      }
    };
    Parser.prototype.consumeToken = function () {
      var token = this._tokens.shift();
      return typeof token === 'undefined' ? EOF_TOKEN : token;
    };
    Parser.prototype.reconsumeToken = function (token) {
      this._tokens.unshift(token);
    };
    return Parser;
  }();
  var isDimensionToken = function isDimensionToken(token) {
    return token.type === 15 /* DIMENSION_TOKEN */;
  };
  var isNumberToken = function isNumberToken(token) {
    return token.type === 17 /* NUMBER_TOKEN */;
  };
  var isIdentToken = function isIdentToken(token) {
    return token.type === 20 /* IDENT_TOKEN */;
  };
  var isStringToken = function isStringToken(token) {
    return token.type === 0 /* STRING_TOKEN */;
  };
  var isIdentWithValue = function isIdentWithValue(token, value) {
    return isIdentToken(token) && token.value === value;
  };
  var nonWhiteSpace = function nonWhiteSpace(token) {
    return token.type !== 31 /* WHITESPACE_TOKEN */;
  };
  var nonFunctionArgSeparator = function nonFunctionArgSeparator(token) {
    return token.type !== 31 /* WHITESPACE_TOKEN */ && token.type !== 4 /* COMMA_TOKEN */;
  };

  var parseFunctionArgs = function parseFunctionArgs(tokens) {
    var args = [];
    var arg = [];
    tokens.forEach(function (token) {
      if (token.type === 4 /* COMMA_TOKEN */) {
        if (arg.length === 0) {
          throw new Error("Error parsing function args, zero tokens for arg");
        }
        args.push(arg);
        arg = [];
        return;
      }
      if (token.type !== 31 /* WHITESPACE_TOKEN */) {
        arg.push(token);
      }
    });
    if (arg.length) {
      args.push(arg);
    }
    return args;
  };
  var isEndingTokenFor = function isEndingTokenFor(token, type) {
    if (type === 11 /* LEFT_CURLY_BRACKET_TOKEN */ && token.type === 12 /* RIGHT_CURLY_BRACKET_TOKEN */) {
      return true;
    }
    if (type === 28 /* LEFT_SQUARE_BRACKET_TOKEN */ && token.type === 29 /* RIGHT_SQUARE_BRACKET_TOKEN */) {
      return true;
    }
    return type === 2 /* LEFT_PARENTHESIS_TOKEN */ && token.type === 3 /* RIGHT_PARENTHESIS_TOKEN */;
  };

  var isLength = function isLength(token) {
    return token.type === 17 /* NUMBER_TOKEN */ || token.type === 15 /* DIMENSION_TOKEN */;
  };

  var isLengthPercentage = function isLengthPercentage(token) {
    return token.type === 16 /* PERCENTAGE_TOKEN */ || isLength(token);
  };
  var parseLengthPercentageTuple = function parseLengthPercentageTuple(tokens) {
    return tokens.length > 1 ? [tokens[0], tokens[1]] : [tokens[0]];
  };
  var ZERO_LENGTH = {
    type: 17 /* NUMBER_TOKEN */,
    number: 0,
    flags: FLAG_INTEGER
  };
  var FIFTY_PERCENT = {
    type: 16 /* PERCENTAGE_TOKEN */,
    number: 50,
    flags: FLAG_INTEGER
  };
  var HUNDRED_PERCENT = {
    type: 16 /* PERCENTAGE_TOKEN */,
    number: 100,
    flags: FLAG_INTEGER
  };
  var getAbsoluteValueForTuple = function getAbsoluteValueForTuple(tuple, width, height) {
    var x = tuple[0],
      y = tuple[1];
    return [getAbsoluteValue(x, width), getAbsoluteValue(typeof y !== 'undefined' ? y : x, height)];
  };
  var getAbsoluteValue = function getAbsoluteValue(token, parent) {
    if (token.type === 16 /* PERCENTAGE_TOKEN */) {
      return token.number / 100 * parent;
    }
    if (isDimensionToken(token)) {
      switch (token.unit) {
        case 'rem':
        case 'em':
          return 16 * token.number;
        // TODO use correct font-size
        case 'px':
        default:
          return token.number;
      }
    }
    return token.number;
  };
  var DEG = 'deg';
  var GRAD = 'grad';
  var RAD = 'rad';
  var TURN = 'turn';
  var angle = {
    name: 'angle',
    parse: function parse(_context, value) {
      if (value.type === 15 /* DIMENSION_TOKEN */) {
        switch (value.unit) {
          case DEG:
            return Math.PI * value.number / 180;
          case GRAD:
            return Math.PI / 200 * value.number;
          case RAD:
            return value.number;
          case TURN:
            return Math.PI * 2 * value.number;
        }
      }
      throw new Error("Unsupported angle type");
    }
  };
  var isAngle = function isAngle(value) {
    if (value.type === 15 /* DIMENSION_TOKEN */) {
      if (value.unit === DEG || value.unit === GRAD || value.unit === RAD || value.unit === TURN) {
        return true;
      }
    }
    return false;
  };
  var parseNamedSide = function parseNamedSide(tokens) {
    var sideOrCorner = tokens.filter(isIdentToken).map(function (ident) {
      return ident.value;
    }).join(' ');
    switch (sideOrCorner) {
      case 'to bottom right':
      case 'to right bottom':
      case 'left top':
      case 'top left':
        return [ZERO_LENGTH, ZERO_LENGTH];
      case 'to top':
      case 'bottom':
        return deg(0);
      case 'to bottom left':
      case 'to left bottom':
      case 'right top':
      case 'top right':
        return [ZERO_LENGTH, HUNDRED_PERCENT];
      case 'to right':
      case 'left':
        return deg(90);
      case 'to top left':
      case 'to left top':
      case 'right bottom':
      case 'bottom right':
        return [HUNDRED_PERCENT, HUNDRED_PERCENT];
      case 'to bottom':
      case 'top':
        return deg(180);
      case 'to top right':
      case 'to right top':
      case 'left bottom':
      case 'bottom left':
        return [HUNDRED_PERCENT, ZERO_LENGTH];
      case 'to left':
      case 'right':
        return deg(270);
    }
    return 0;
  };
  var deg = function deg(_deg) {
    return Math.PI * _deg / 180;
  };
  var color$1 = {
    name: 'color',
    parse: function parse(context, value) {
      if (value.type === 18 /* FUNCTION */) {
        var colorFunction = SUPPORTED_COLOR_FUNCTIONS[value.name];
        if (typeof colorFunction === 'undefined') {
          throw new Error("Attempting to parse an unsupported color function \"" + value.name + "\"");
        }
        return colorFunction(context, value.values);
      }
      if (value.type === 5 /* HASH_TOKEN */) {
        if (value.value.length === 3) {
          var r = value.value.substring(0, 1);
          var g = value.value.substring(1, 2);
          var b = value.value.substring(2, 3);
          return pack(parseInt(r + r, 16), parseInt(g + g, 16), parseInt(b + b, 16), 1);
        }
        if (value.value.length === 4) {
          var r = value.value.substring(0, 1);
          var g = value.value.substring(1, 2);
          var b = value.value.substring(2, 3);
          var a = value.value.substring(3, 4);
          return pack(parseInt(r + r, 16), parseInt(g + g, 16), parseInt(b + b, 16), parseInt(a + a, 16) / 255);
        }
        if (value.value.length === 6) {
          var r = value.value.substring(0, 2);
          var g = value.value.substring(2, 4);
          var b = value.value.substring(4, 6);
          return pack(parseInt(r, 16), parseInt(g, 16), parseInt(b, 16), 1);
        }
        if (value.value.length === 8) {
          var r = value.value.substring(0, 2);
          var g = value.value.substring(2, 4);
          var b = value.value.substring(4, 6);
          var a = value.value.substring(6, 8);
          return pack(parseInt(r, 16), parseInt(g, 16), parseInt(b, 16), parseInt(a, 16) / 255);
        }
      }
      if (value.type === 20 /* IDENT_TOKEN */) {
        var namedColor = COLORS[value.value.toUpperCase()];
        if (typeof namedColor !== 'undefined') {
          return namedColor;
        }
      }
      return COLORS.TRANSPARENT;
    }
  };
  var isTransparent = function isTransparent(color) {
    return (0xff & color) === 0;
  };
  var asString = function asString(color) {
    var alpha = 0xff & color;
    var blue = 0xff & color >> 8;
    var green = 0xff & color >> 16;
    var red = 0xff & color >> 24;
    return alpha < 255 ? "rgba(" + red + "," + green + "," + blue + "," + alpha / 255 + ")" : "rgb(" + red + "," + green + "," + blue + ")";
  };
  var pack = function pack(r, g, b, a) {
    return (r << 24 | g << 16 | b << 8 | Math.round(a * 255) << 0) >>> 0;
  };
  var getTokenColorValue = function getTokenColorValue(token, i) {
    if (token.type === 17 /* NUMBER_TOKEN */) {
      return token.number;
    }
    if (token.type === 16 /* PERCENTAGE_TOKEN */) {
      var max = i === 3 ? 1 : 255;
      return i === 3 ? token.number / 100 * max : Math.round(token.number / 100 * max);
    }
    return 0;
  };
  var rgb = function rgb(_context, args) {
    var tokens = args.filter(nonFunctionArgSeparator);
    if (tokens.length === 3) {
      var _a = tokens.map(getTokenColorValue),
        r = _a[0],
        g = _a[1],
        b = _a[2];
      return pack(r, g, b, 1);
    }
    if (tokens.length === 4) {
      var _b = tokens.map(getTokenColorValue),
        r = _b[0],
        g = _b[1],
        b = _b[2],
        a = _b[3];
      return pack(r, g, b, a);
    }
    return 0;
  };
  function hue2rgb(t1, t2, hue) {
    if (hue < 0) {
      hue += 1;
    }
    if (hue >= 1) {
      hue -= 1;
    }
    if (hue < 1 / 6) {
      return (t2 - t1) * hue * 6 + t1;
    } else if (hue < 1 / 2) {
      return t2;
    } else if (hue < 2 / 3) {
      return (t2 - t1) * 6 * (2 / 3 - hue) + t1;
    } else {
      return t1;
    }
  }
  var hsl = function hsl(context, args) {
    var tokens = args.filter(nonFunctionArgSeparator);
    var hue = tokens[0],
      saturation = tokens[1],
      lightness = tokens[2],
      alpha = tokens[3];
    var h = (hue.type === 17 /* NUMBER_TOKEN */ ? deg(hue.number) : angle.parse(context, hue)) / (Math.PI * 2);
    var s = isLengthPercentage(saturation) ? saturation.number / 100 : 0;
    var l = isLengthPercentage(lightness) ? lightness.number / 100 : 0;
    var a = typeof alpha !== 'undefined' && isLengthPercentage(alpha) ? getAbsoluteValue(alpha, 1) : 1;
    if (s === 0) {
      return pack(l * 255, l * 255, l * 255, 1);
    }
    var t2 = l <= 0.5 ? l * (s + 1) : l + s - l * s;
    var t1 = l * 2 - t2;
    var r = hue2rgb(t1, t2, h + 1 / 3);
    var g = hue2rgb(t1, t2, h);
    var b = hue2rgb(t1, t2, h - 1 / 3);
    return pack(r * 255, g * 255, b * 255, a);
  };
  var SUPPORTED_COLOR_FUNCTIONS = {
    hsl: hsl,
    hsla: hsl,
    rgb: rgb,
    rgba: rgb
  };
  var parseColor = function parseColor(context, value) {
    return color$1.parse(context, Parser.create(value).parseComponentValue());
  };
  var COLORS = {
    ALICEBLUE: 0xf0f8ffff,
    ANTIQUEWHITE: 0xfaebd7ff,
    AQUA: 0x00ffffff,
    AQUAMARINE: 0x7fffd4ff,
    AZURE: 0xf0ffffff,
    BEIGE: 0xf5f5dcff,
    BISQUE: 0xffe4c4ff,
    BLACK: 0x000000ff,
    BLANCHEDALMOND: 0xffebcdff,
    BLUE: 0x0000ffff,
    BLUEVIOLET: 0x8a2be2ff,
    BROWN: 0xa52a2aff,
    BURLYWOOD: 0xdeb887ff,
    CADETBLUE: 0x5f9ea0ff,
    CHARTREUSE: 0x7fff00ff,
    CHOCOLATE: 0xd2691eff,
    CORAL: 0xff7f50ff,
    CORNFLOWERBLUE: 0x6495edff,
    CORNSILK: 0xfff8dcff,
    CRIMSON: 0xdc143cff,
    CYAN: 0x00ffffff,
    DARKBLUE: 0x00008bff,
    DARKCYAN: 0x008b8bff,
    DARKGOLDENROD: 0xb886bbff,
    DARKGRAY: 0xa9a9a9ff,
    DARKGREEN: 0x006400ff,
    DARKGREY: 0xa9a9a9ff,
    DARKKHAKI: 0xbdb76bff,
    DARKMAGENTA: 0x8b008bff,
    DARKOLIVEGREEN: 0x556b2fff,
    DARKORANGE: 0xff8c00ff,
    DARKORCHID: 0x9932ccff,
    DARKRED: 0x8b0000ff,
    DARKSALMON: 0xe9967aff,
    DARKSEAGREEN: 0x8fbc8fff,
    DARKSLATEBLUE: 0x483d8bff,
    DARKSLATEGRAY: 0x2f4f4fff,
    DARKSLATEGREY: 0x2f4f4fff,
    DARKTURQUOISE: 0x00ced1ff,
    DARKVIOLET: 0x9400d3ff,
    DEEPPINK: 0xff1493ff,
    DEEPSKYBLUE: 0x00bfffff,
    DIMGRAY: 0x696969ff,
    DIMGREY: 0x696969ff,
    DODGERBLUE: 0x1e90ffff,
    FIREBRICK: 0xb22222ff,
    FLORALWHITE: 0xfffaf0ff,
    FORESTGREEN: 0x228b22ff,
    FUCHSIA: 0xff00ffff,
    GAINSBORO: 0xdcdcdcff,
    GHOSTWHITE: 0xf8f8ffff,
    GOLD: 0xffd700ff,
    GOLDENROD: 0xdaa520ff,
    GRAY: 0x808080ff,
    GREEN: 0x008000ff,
    GREENYELLOW: 0xadff2fff,
    GREY: 0x808080ff,
    HONEYDEW: 0xf0fff0ff,
    HOTPINK: 0xff69b4ff,
    INDIANRED: 0xcd5c5cff,
    INDIGO: 0x4b0082ff,
    IVORY: 0xfffff0ff,
    KHAKI: 0xf0e68cff,
    LAVENDER: 0xe6e6faff,
    LAVENDERBLUSH: 0xfff0f5ff,
    LAWNGREEN: 0x7cfc00ff,
    LEMONCHIFFON: 0xfffacdff,
    LIGHTBLUE: 0xadd8e6ff,
    LIGHTCORAL: 0xf08080ff,
    LIGHTCYAN: 0xe0ffffff,
    LIGHTGOLDENRODYELLOW: 0xfafad2ff,
    LIGHTGRAY: 0xd3d3d3ff,
    LIGHTGREEN: 0x90ee90ff,
    LIGHTGREY: 0xd3d3d3ff,
    LIGHTPINK: 0xffb6c1ff,
    LIGHTSALMON: 0xffa07aff,
    LIGHTSEAGREEN: 0x20b2aaff,
    LIGHTSKYBLUE: 0x87cefaff,
    LIGHTSLATEGRAY: 0x778899ff,
    LIGHTSLATEGREY: 0x778899ff,
    LIGHTSTEELBLUE: 0xb0c4deff,
    LIGHTYELLOW: 0xffffe0ff,
    LIME: 0x00ff00ff,
    LIMEGREEN: 0x32cd32ff,
    LINEN: 0xfaf0e6ff,
    MAGENTA: 0xff00ffff,
    MAROON: 0x800000ff,
    MEDIUMAQUAMARINE: 0x66cdaaff,
    MEDIUMBLUE: 0x0000cdff,
    MEDIUMORCHID: 0xba55d3ff,
    MEDIUMPURPLE: 0x9370dbff,
    MEDIUMSEAGREEN: 0x3cb371ff,
    MEDIUMSLATEBLUE: 0x7b68eeff,
    MEDIUMSPRINGGREEN: 0x00fa9aff,
    MEDIUMTURQUOISE: 0x48d1ccff,
    MEDIUMVIOLETRED: 0xc71585ff,
    MIDNIGHTBLUE: 0x191970ff,
    MINTCREAM: 0xf5fffaff,
    MISTYROSE: 0xffe4e1ff,
    MOCCASIN: 0xffe4b5ff,
    NAVAJOWHITE: 0xffdeadff,
    NAVY: 0x000080ff,
    OLDLACE: 0xfdf5e6ff,
    OLIVE: 0x808000ff,
    OLIVEDRAB: 0x6b8e23ff,
    ORANGE: 0xffa500ff,
    ORANGERED: 0xff4500ff,
    ORCHID: 0xda70d6ff,
    PALEGOLDENROD: 0xeee8aaff,
    PALEGREEN: 0x98fb98ff,
    PALETURQUOISE: 0xafeeeeff,
    PALEVIOLETRED: 0xdb7093ff,
    PAPAYAWHIP: 0xffefd5ff,
    PEACHPUFF: 0xffdab9ff,
    PERU: 0xcd853fff,
    PINK: 0xffc0cbff,
    PLUM: 0xdda0ddff,
    POWDERBLUE: 0xb0e0e6ff,
    PURPLE: 0x800080ff,
    REBECCAPURPLE: 0x663399ff,
    RED: 0xff0000ff,
    ROSYBROWN: 0xbc8f8fff,
    ROYALBLUE: 0x4169e1ff,
    SADDLEBROWN: 0x8b4513ff,
    SALMON: 0xfa8072ff,
    SANDYBROWN: 0xf4a460ff,
    SEAGREEN: 0x2e8b57ff,
    SEASHELL: 0xfff5eeff,
    SIENNA: 0xa0522dff,
    SILVER: 0xc0c0c0ff,
    SKYBLUE: 0x87ceebff,
    SLATEBLUE: 0x6a5acdff,
    SLATEGRAY: 0x708090ff,
    SLATEGREY: 0x708090ff,
    SNOW: 0xfffafaff,
    SPRINGGREEN: 0x00ff7fff,
    STEELBLUE: 0x4682b4ff,
    TAN: 0xd2b48cff,
    TEAL: 0x008080ff,
    THISTLE: 0xd8bfd8ff,
    TOMATO: 0xff6347ff,
    TRANSPARENT: 0x00000000,
    TURQUOISE: 0x40e0d0ff,
    VIOLET: 0xee82eeff,
    WHEAT: 0xf5deb3ff,
    WHITE: 0xffffffff,
    WHITESMOKE: 0xf5f5f5ff,
    YELLOW: 0xffff00ff,
    YELLOWGREEN: 0x9acd32ff
  };
  var backgroundClip = {
    name: 'background-clip',
    initialValue: 'border-box',
    prefix: false,
    type: 1 /* LIST */,
    parse: function parse(_context, tokens) {
      return tokens.map(function (token) {
        if (isIdentToken(token)) {
          switch (token.value) {
            case 'padding-box':
              return 1 /* PADDING_BOX */;
            case 'content-box':
              return 2 /* CONTENT_BOX */;
          }
        }

        return 0 /* BORDER_BOX */;
      });
    }
  };

  var backgroundColor = {
    name: "background-color",
    initialValue: 'transparent',
    prefix: false,
    type: 3 /* TYPE_VALUE */,
    format: 'color'
  };
  var parseColorStop = function parseColorStop(context, args) {
    var color = color$1.parse(context, args[0]);
    var stop = args[1];
    return stop && isLengthPercentage(stop) ? {
      color: color,
      stop: stop
    } : {
      color: color,
      stop: null
    };
  };
  var processColorStops = function processColorStops(stops, lineLength) {
    var first = stops[0];
    var last = stops[stops.length - 1];
    if (first.stop === null) {
      first.stop = ZERO_LENGTH;
    }
    if (last.stop === null) {
      last.stop = HUNDRED_PERCENT;
    }
    var processStops = [];
    var previous = 0;
    for (var i = 0; i < stops.length; i++) {
      var stop_1 = stops[i].stop;
      if (stop_1 !== null) {
        var absoluteValue = getAbsoluteValue(stop_1, lineLength);
        if (absoluteValue > previous) {
          processStops.push(absoluteValue);
        } else {
          processStops.push(previous);
        }
        previous = absoluteValue;
      } else {
        processStops.push(null);
      }
    }
    var gapBegin = null;
    for (var i = 0; i < processStops.length; i++) {
      var stop_2 = processStops[i];
      if (stop_2 === null) {
        if (gapBegin === null) {
          gapBegin = i;
        }
      } else if (gapBegin !== null) {
        var gapLength = i - gapBegin;
        var beforeGap = processStops[gapBegin - 1];
        var gapValue = (stop_2 - beforeGap) / (gapLength + 1);
        for (var g = 1; g <= gapLength; g++) {
          processStops[gapBegin + g - 1] = gapValue * g;
        }
        gapBegin = null;
      }
    }
    return stops.map(function (_a, i) {
      var color = _a.color;
      return {
        color: color,
        stop: Math.max(Math.min(1, processStops[i] / lineLength), 0)
      };
    });
  };
  var getAngleFromCorner = function getAngleFromCorner(corner, width, height) {
    var centerX = width / 2;
    var centerY = height / 2;
    var x = getAbsoluteValue(corner[0], width) - centerX;
    var y = centerY - getAbsoluteValue(corner[1], height);
    return (Math.atan2(y, x) + Math.PI * 2) % (Math.PI * 2);
  };
  var calculateGradientDirection = function calculateGradientDirection(angle, width, height) {
    var radian = typeof angle === 'number' ? angle : getAngleFromCorner(angle, width, height);
    var lineLength = Math.abs(width * Math.sin(radian)) + Math.abs(height * Math.cos(radian));
    var halfWidth = width / 2;
    var halfHeight = height / 2;
    var halfLineLength = lineLength / 2;
    var yDiff = Math.sin(radian - Math.PI / 2) * halfLineLength;
    var xDiff = Math.cos(radian - Math.PI / 2) * halfLineLength;
    return [lineLength, halfWidth - xDiff, halfWidth + xDiff, halfHeight - yDiff, halfHeight + yDiff];
  };
  var distance = function distance(a, b) {
    return Math.sqrt(a * a + b * b);
  };
  var findCorner = function findCorner(width, height, x, y, closest) {
    var corners = [[0, 0], [0, height], [width, 0], [width, height]];
    return corners.reduce(function (stat, corner) {
      var cx = corner[0],
        cy = corner[1];
      var d = distance(x - cx, y - cy);
      if (closest ? d < stat.optimumDistance : d > stat.optimumDistance) {
        return {
          optimumCorner: corner,
          optimumDistance: d
        };
      }
      return stat;
    }, {
      optimumDistance: closest ? Infinity : -Infinity,
      optimumCorner: null
    }).optimumCorner;
  };
  var calculateRadius = function calculateRadius(gradient, x, y, width, height) {
    var rx = 0;
    var ry = 0;
    switch (gradient.size) {
      case 0 /* CLOSEST_SIDE */:
        // The ending shape is sized so that that it exactly meets the side of the gradient box closest to the gradient’s center.
        // If the shape is an ellipse, it exactly meets the closest side in each dimension.
        if (gradient.shape === 0 /* CIRCLE */) {
          rx = ry = Math.min(Math.abs(x), Math.abs(x - width), Math.abs(y), Math.abs(y - height));
        } else if (gradient.shape === 1 /* ELLIPSE */) {
          rx = Math.min(Math.abs(x), Math.abs(x - width));
          ry = Math.min(Math.abs(y), Math.abs(y - height));
        }
        break;
      case 2 /* CLOSEST_CORNER */:
        // The ending shape is sized so that that it passes through the corner of the gradient box closest to the gradient’s center.
        // If the shape is an ellipse, the ending shape is given the same aspect-ratio it would have if closest-side were specified.
        if (gradient.shape === 0 /* CIRCLE */) {
          rx = ry = Math.min(distance(x, y), distance(x, y - height), distance(x - width, y), distance(x - width, y - height));
        } else if (gradient.shape === 1 /* ELLIPSE */) {
          // Compute the ratio ry/rx (which is to be the same as for "closest-side")
          var c = Math.min(Math.abs(y), Math.abs(y - height)) / Math.min(Math.abs(x), Math.abs(x - width));
          var _a = findCorner(width, height, x, y, true),
            cx = _a[0],
            cy = _a[1];
          rx = distance(cx - x, (cy - y) / c);
          ry = c * rx;
        }
        break;
      case 1 /* FARTHEST_SIDE */:
        // Same as closest-side, except the ending shape is sized based on the farthest side(s)
        if (gradient.shape === 0 /* CIRCLE */) {
          rx = ry = Math.max(Math.abs(x), Math.abs(x - width), Math.abs(y), Math.abs(y - height));
        } else if (gradient.shape === 1 /* ELLIPSE */) {
          rx = Math.max(Math.abs(x), Math.abs(x - width));
          ry = Math.max(Math.abs(y), Math.abs(y - height));
        }
        break;
      case 3 /* FARTHEST_CORNER */:
        // Same as closest-corner, except the ending shape is sized based on the farthest corner.
        // If the shape is an ellipse, the ending shape is given the same aspect ratio it would have if farthest-side were specified.
        if (gradient.shape === 0 /* CIRCLE */) {
          rx = ry = Math.max(distance(x, y), distance(x, y - height), distance(x - width, y), distance(x - width, y - height));
        } else if (gradient.shape === 1 /* ELLIPSE */) {
          // Compute the ratio ry/rx (which is to be the same as for "farthest-side")
          var c = Math.max(Math.abs(y), Math.abs(y - height)) / Math.max(Math.abs(x), Math.abs(x - width));
          var _b = findCorner(width, height, x, y, false),
            cx = _b[0],
            cy = _b[1];
          rx = distance(cx - x, (cy - y) / c);
          ry = c * rx;
        }
        break;
    }
    if (Array.isArray(gradient.size)) {
      rx = getAbsoluteValue(gradient.size[0], width);
      ry = gradient.size.length === 2 ? getAbsoluteValue(gradient.size[1], height) : rx;
    }
    return [rx, ry];
  };
  var linearGradient = function linearGradient(context, tokens) {
    var angle$1 = deg(180);
    var stops = [];
    parseFunctionArgs(tokens).forEach(function (arg, i) {
      if (i === 0) {
        var firstToken = arg[0];
        if (firstToken.type === 20 /* IDENT_TOKEN */ && firstToken.value === 'to') {
          angle$1 = parseNamedSide(arg);
          return;
        } else if (isAngle(firstToken)) {
          angle$1 = angle.parse(context, firstToken);
          return;
        }
      }
      var colorStop = parseColorStop(context, arg);
      stops.push(colorStop);
    });
    return {
      angle: angle$1,
      stops: stops,
      type: 1 /* LINEAR_GRADIENT */
    };
  };

  var prefixLinearGradient = function prefixLinearGradient(context, tokens) {
    var angle$1 = deg(180);
    var stops = [];
    parseFunctionArgs(tokens).forEach(function (arg, i) {
      if (i === 0) {
        var firstToken = arg[0];
        if (firstToken.type === 20 /* IDENT_TOKEN */ && ['top', 'left', 'right', 'bottom'].indexOf(firstToken.value) !== -1) {
          angle$1 = parseNamedSide(arg);
          return;
        } else if (isAngle(firstToken)) {
          angle$1 = (angle.parse(context, firstToken) + deg(270)) % deg(360);
          return;
        }
      }
      var colorStop = parseColorStop(context, arg);
      stops.push(colorStop);
    });
    return {
      angle: angle$1,
      stops: stops,
      type: 1 /* LINEAR_GRADIENT */
    };
  };

  var webkitGradient = function webkitGradient(context, tokens) {
    var angle = deg(180);
    var stops = [];
    var type = 1 /* LINEAR_GRADIENT */;
    var shape = 0 /* CIRCLE */;
    var size = 3 /* FARTHEST_CORNER */;
    var position = [];
    parseFunctionArgs(tokens).forEach(function (arg, i) {
      var firstToken = arg[0];
      if (i === 0) {
        if (isIdentToken(firstToken) && firstToken.value === 'linear') {
          type = 1 /* LINEAR_GRADIENT */;
          return;
        } else if (isIdentToken(firstToken) && firstToken.value === 'radial') {
          type = 2 /* RADIAL_GRADIENT */;
          return;
        }
      }
      if (firstToken.type === 18 /* FUNCTION */) {
        if (firstToken.name === 'from') {
          var color = color$1.parse(context, firstToken.values[0]);
          stops.push({
            stop: ZERO_LENGTH,
            color: color
          });
        } else if (firstToken.name === 'to') {
          var color = color$1.parse(context, firstToken.values[0]);
          stops.push({
            stop: HUNDRED_PERCENT,
            color: color
          });
        } else if (firstToken.name === 'color-stop') {
          var values = firstToken.values.filter(nonFunctionArgSeparator);
          if (values.length === 2) {
            var color = color$1.parse(context, values[1]);
            var stop_1 = values[0];
            if (isNumberToken(stop_1)) {
              stops.push({
                stop: {
                  type: 16 /* PERCENTAGE_TOKEN */,
                  number: stop_1.number * 100,
                  flags: stop_1.flags
                },
                color: color
              });
            }
          }
        }
      }
    });
    return type === 1 /* LINEAR_GRADIENT */ ? {
      angle: (angle + deg(180)) % deg(360),
      stops: stops,
      type: type
    } : {
      size: size,
      shape: shape,
      stops: stops,
      position: position,
      type: type
    };
  };
  var CLOSEST_SIDE = 'closest-side';
  var FARTHEST_SIDE = 'farthest-side';
  var CLOSEST_CORNER = 'closest-corner';
  var FARTHEST_CORNER = 'farthest-corner';
  var CIRCLE = 'circle';
  var ELLIPSE = 'ellipse';
  var COVER = 'cover';
  var CONTAIN = 'contain';
  var radialGradient = function radialGradient(context, tokens) {
    var shape = 0 /* CIRCLE */;
    var size = 3 /* FARTHEST_CORNER */;
    var stops = [];
    var position = [];
    parseFunctionArgs(tokens).forEach(function (arg, i) {
      var isColorStop = true;
      if (i === 0) {
        var isAtPosition_1 = false;
        isColorStop = arg.reduce(function (acc, token) {
          if (isAtPosition_1) {
            if (isIdentToken(token)) {
              switch (token.value) {
                case 'center':
                  position.push(FIFTY_PERCENT);
                  return acc;
                case 'top':
                case 'left':
                  position.push(ZERO_LENGTH);
                  return acc;
                case 'right':
                case 'bottom':
                  position.push(HUNDRED_PERCENT);
                  return acc;
              }
            } else if (isLengthPercentage(token) || isLength(token)) {
              position.push(token);
            }
          } else if (isIdentToken(token)) {
            switch (token.value) {
              case CIRCLE:
                shape = 0 /* CIRCLE */;
                return false;
              case ELLIPSE:
                shape = 1 /* ELLIPSE */;
                return false;
              case 'at':
                isAtPosition_1 = true;
                return false;
              case CLOSEST_SIDE:
                size = 0 /* CLOSEST_SIDE */;
                return false;
              case COVER:
              case FARTHEST_SIDE:
                size = 1 /* FARTHEST_SIDE */;
                return false;
              case CONTAIN:
              case CLOSEST_CORNER:
                size = 2 /* CLOSEST_CORNER */;
                return false;
              case FARTHEST_CORNER:
                size = 3 /* FARTHEST_CORNER */;
                return false;
            }
          } else if (isLength(token) || isLengthPercentage(token)) {
            if (!Array.isArray(size)) {
              size = [];
            }
            size.push(token);
            return false;
          }
          return acc;
        }, isColorStop);
      }
      if (isColorStop) {
        var colorStop = parseColorStop(context, arg);
        stops.push(colorStop);
      }
    });
    return {
      size: size,
      shape: shape,
      stops: stops,
      position: position,
      type: 2 /* RADIAL_GRADIENT */
    };
  };

  var prefixRadialGradient = function prefixRadialGradient(context, tokens) {
    var shape = 0 /* CIRCLE */;
    var size = 3 /* FARTHEST_CORNER */;
    var stops = [];
    var position = [];
    parseFunctionArgs(tokens).forEach(function (arg, i) {
      var isColorStop = true;
      if (i === 0) {
        isColorStop = arg.reduce(function (acc, token) {
          if (isIdentToken(token)) {
            switch (token.value) {
              case 'center':
                position.push(FIFTY_PERCENT);
                return false;
              case 'top':
              case 'left':
                position.push(ZERO_LENGTH);
                return false;
              case 'right':
              case 'bottom':
                position.push(HUNDRED_PERCENT);
                return false;
            }
          } else if (isLengthPercentage(token) || isLength(token)) {
            position.push(token);
            return false;
          }
          return acc;
        }, isColorStop);
      } else if (i === 1) {
        isColorStop = arg.reduce(function (acc, token) {
          if (isIdentToken(token)) {
            switch (token.value) {
              case CIRCLE:
                shape = 0 /* CIRCLE */;
                return false;
              case ELLIPSE:
                shape = 1 /* ELLIPSE */;
                return false;
              case CONTAIN:
              case CLOSEST_SIDE:
                size = 0 /* CLOSEST_SIDE */;
                return false;
              case FARTHEST_SIDE:
                size = 1 /* FARTHEST_SIDE */;
                return false;
              case CLOSEST_CORNER:
                size = 2 /* CLOSEST_CORNER */;
                return false;
              case COVER:
              case FARTHEST_CORNER:
                size = 3 /* FARTHEST_CORNER */;
                return false;
            }
          } else if (isLength(token) || isLengthPercentage(token)) {
            if (!Array.isArray(size)) {
              size = [];
            }
            size.push(token);
            return false;
          }
          return acc;
        }, isColorStop);
      }
      if (isColorStop) {
        var colorStop = parseColorStop(context, arg);
        stops.push(colorStop);
      }
    });
    return {
      size: size,
      shape: shape,
      stops: stops,
      position: position,
      type: 2 /* RADIAL_GRADIENT */
    };
  };

  var isLinearGradient = function isLinearGradient(background) {
    return background.type === 1 /* LINEAR_GRADIENT */;
  };

  var isRadialGradient = function isRadialGradient(background) {
    return background.type === 2 /* RADIAL_GRADIENT */;
  };

  var image = {
    name: 'image',
    parse: function parse(context, value) {
      if (value.type === 22 /* URL_TOKEN */) {
        var image_1 = {
          url: value.value,
          type: 0 /* URL */
        };
        context.cache.addImage(value.value);
        return image_1;
      }
      if (value.type === 18 /* FUNCTION */) {
        var imageFunction = SUPPORTED_IMAGE_FUNCTIONS[value.name];
        if (typeof imageFunction === 'undefined') {
          throw new Error("Attempting to parse an unsupported image function \"" + value.name + "\"");
        }
        return imageFunction(context, value.values);
      }
      throw new Error("Unsupported image type " + value.type);
    }
  };
  function isSupportedImage(value) {
    return !(value.type === 20 /* IDENT_TOKEN */ && value.value === 'none') && (value.type !== 18 /* FUNCTION */ || !!SUPPORTED_IMAGE_FUNCTIONS[value.name]);
  }
  var SUPPORTED_IMAGE_FUNCTIONS = {
    'linear-gradient': linearGradient,
    '-moz-linear-gradient': prefixLinearGradient,
    '-ms-linear-gradient': prefixLinearGradient,
    '-o-linear-gradient': prefixLinearGradient,
    '-webkit-linear-gradient': prefixLinearGradient,
    'radial-gradient': radialGradient,
    '-moz-radial-gradient': prefixRadialGradient,
    '-ms-radial-gradient': prefixRadialGradient,
    '-o-radial-gradient': prefixRadialGradient,
    '-webkit-radial-gradient': prefixRadialGradient,
    '-webkit-gradient': webkitGradient
  };
  var backgroundImage = {
    name: 'background-image',
    initialValue: 'none',
    type: 1 /* LIST */,
    prefix: false,
    parse: function parse(context, tokens) {
      if (tokens.length === 0) {
        return [];
      }
      var first = tokens[0];
      if (first.type === 20 /* IDENT_TOKEN */ && first.value === 'none') {
        return [];
      }
      return tokens.filter(function (value) {
        return nonFunctionArgSeparator(value) && isSupportedImage(value);
      }).map(function (value) {
        return image.parse(context, value);
      });
    }
  };
  var backgroundOrigin = {
    name: 'background-origin',
    initialValue: 'border-box',
    prefix: false,
    type: 1 /* LIST */,
    parse: function parse(_context, tokens) {
      return tokens.map(function (token) {
        if (isIdentToken(token)) {
          switch (token.value) {
            case 'padding-box':
              return 1 /* PADDING_BOX */;
            case 'content-box':
              return 2 /* CONTENT_BOX */;
          }
        }

        return 0 /* BORDER_BOX */;
      });
    }
  };

  var backgroundPosition = {
    name: 'background-position',
    initialValue: '0% 0%',
    type: 1 /* LIST */,
    prefix: false,
    parse: function parse(_context, tokens) {
      return parseFunctionArgs(tokens).map(function (values) {
        return values.filter(isLengthPercentage);
      }).map(parseLengthPercentageTuple);
    }
  };
  var backgroundRepeat = {
    name: 'background-repeat',
    initialValue: 'repeat',
    prefix: false,
    type: 1 /* LIST */,
    parse: function parse(_context, tokens) {
      return parseFunctionArgs(tokens).map(function (values) {
        return values.filter(isIdentToken).map(function (token) {
          return token.value;
        }).join(' ');
      }).map(parseBackgroundRepeat);
    }
  };
  var parseBackgroundRepeat = function parseBackgroundRepeat(value) {
    switch (value) {
      case 'no-repeat':
        return 1 /* NO_REPEAT */;
      case 'repeat-x':
      case 'repeat no-repeat':
        return 2 /* REPEAT_X */;
      case 'repeat-y':
      case 'no-repeat repeat':
        return 3 /* REPEAT_Y */;
      case 'repeat':
      default:
        return 0 /* REPEAT */;
    }
  };

  var BACKGROUND_SIZE;
  (function (BACKGROUND_SIZE) {
    BACKGROUND_SIZE["AUTO"] = "auto";
    BACKGROUND_SIZE["CONTAIN"] = "contain";
    BACKGROUND_SIZE["COVER"] = "cover";
  })(BACKGROUND_SIZE || (BACKGROUND_SIZE = {}));
  var backgroundSize = {
    name: 'background-size',
    initialValue: '0',
    prefix: false,
    type: 1 /* LIST */,
    parse: function parse(_context, tokens) {
      return parseFunctionArgs(tokens).map(function (values) {
        return values.filter(isBackgroundSizeInfoToken);
      });
    }
  };
  var isBackgroundSizeInfoToken = function isBackgroundSizeInfoToken(value) {
    return isIdentToken(value) || isLengthPercentage(value);
  };
  var borderColorForSide = function borderColorForSide(side) {
    return {
      name: "border-" + side + "-color",
      initialValue: 'transparent',
      prefix: false,
      type: 3 /* TYPE_VALUE */,
      format: 'color'
    };
  };
  var borderTopColor = borderColorForSide('top');
  var borderRightColor = borderColorForSide('right');
  var borderBottomColor = borderColorForSide('bottom');
  var borderLeftColor = borderColorForSide('left');
  var borderRadiusForSide = function borderRadiusForSide(side) {
    return {
      name: "border-radius-" + side,
      initialValue: '0 0',
      prefix: false,
      type: 1 /* LIST */,
      parse: function parse(_context, tokens) {
        return parseLengthPercentageTuple(tokens.filter(isLengthPercentage));
      }
    };
  };
  var borderTopLeftRadius = borderRadiusForSide('top-left');
  var borderTopRightRadius = borderRadiusForSide('top-right');
  var borderBottomRightRadius = borderRadiusForSide('bottom-right');
  var borderBottomLeftRadius = borderRadiusForSide('bottom-left');
  var borderStyleForSide = function borderStyleForSide(side) {
    return {
      name: "border-" + side + "-style",
      initialValue: 'solid',
      prefix: false,
      type: 2 /* IDENT_VALUE */,
      parse: function parse(_context, style) {
        switch (style) {
          case 'none':
            return 0 /* NONE */;
          case 'dashed':
            return 2 /* DASHED */;
          case 'dotted':
            return 3 /* DOTTED */;
          case 'double':
            return 4 /* DOUBLE */;
        }

        return 1 /* SOLID */;
      }
    };
  };

  var borderTopStyle = borderStyleForSide('top');
  var borderRightStyle = borderStyleForSide('right');
  var borderBottomStyle = borderStyleForSide('bottom');
  var borderLeftStyle = borderStyleForSide('left');
  var borderWidthForSide = function borderWidthForSide(side) {
    return {
      name: "border-" + side + "-width",
      initialValue: '0',
      type: 0 /* VALUE */,
      prefix: false,
      parse: function parse(_context, token) {
        if (isDimensionToken(token)) {
          return token.number;
        }
        return 0;
      }
    };
  };
  var borderTopWidth = borderWidthForSide('top');
  var borderRightWidth = borderWidthForSide('right');
  var borderBottomWidth = borderWidthForSide('bottom');
  var borderLeftWidth = borderWidthForSide('left');
  var color = {
    name: "color",
    initialValue: 'transparent',
    prefix: false,
    type: 3 /* TYPE_VALUE */,
    format: 'color'
  };
  var direction = {
    name: 'direction',
    initialValue: 'ltr',
    prefix: false,
    type: 2 /* IDENT_VALUE */,
    parse: function parse(_context, direction) {
      switch (direction) {
        case 'rtl':
          return 1 /* RTL */;
        case 'ltr':
        default:
          return 0 /* LTR */;
      }
    }
  };

  var display = {
    name: 'display',
    initialValue: 'inline-block',
    prefix: false,
    type: 1 /* LIST */,
    parse: function parse(_context, tokens) {
      return tokens.filter(isIdentToken).reduce(function (bit, token) {
        return bit | parseDisplayValue(token.value);
      }, 0 /* NONE */);
    }
  };

  var parseDisplayValue = function parseDisplayValue(display) {
    switch (display) {
      case 'block':
      case '-webkit-box':
        return 2 /* BLOCK */;
      case 'inline':
        return 4 /* INLINE */;
      case 'run-in':
        return 8 /* RUN_IN */;
      case 'flow':
        return 16 /* FLOW */;
      case 'flow-root':
        return 32 /* FLOW_ROOT */;
      case 'table':
        return 64 /* TABLE */;
      case 'flex':
      case '-webkit-flex':
        return 128 /* FLEX */;
      case 'grid':
      case '-ms-grid':
        return 256 /* GRID */;
      case 'ruby':
        return 512 /* RUBY */;
      case 'subgrid':
        return 1024 /* SUBGRID */;
      case 'list-item':
        return 2048 /* LIST_ITEM */;
      case 'table-row-group':
        return 4096 /* TABLE_ROW_GROUP */;
      case 'table-header-group':
        return 8192 /* TABLE_HEADER_GROUP */;
      case 'table-footer-group':
        return 16384 /* TABLE_FOOTER_GROUP */;
      case 'table-row':
        return 32768 /* TABLE_ROW */;
      case 'table-cell':
        return 65536 /* TABLE_CELL */;
      case 'table-column-group':
        return 131072 /* TABLE_COLUMN_GROUP */;
      case 'table-column':
        return 262144 /* TABLE_COLUMN */;
      case 'table-caption':
        return 524288 /* TABLE_CAPTION */;
      case 'ruby-base':
        return 1048576 /* RUBY_BASE */;
      case 'ruby-text':
        return 2097152 /* RUBY_TEXT */;
      case 'ruby-base-container':
        return 4194304 /* RUBY_BASE_CONTAINER */;
      case 'ruby-text-container':
        return 8388608 /* RUBY_TEXT_CONTAINER */;
      case 'contents':
        return 16777216 /* CONTENTS */;
      case 'inline-block':
        return 33554432 /* INLINE_BLOCK */;
      case 'inline-list-item':
        return 67108864 /* INLINE_LIST_ITEM */;
      case 'inline-table':
        return 134217728 /* INLINE_TABLE */;
      case 'inline-flex':
        return 268435456 /* INLINE_FLEX */;
      case 'inline-grid':
        return 536870912 /* INLINE_GRID */;
    }

    return 0 /* NONE */;
  };

  var float = {
    name: 'float',
    initialValue: 'none',
    prefix: false,
    type: 2 /* IDENT_VALUE */,
    parse: function parse(_context, float) {
      switch (float) {
        case 'left':
          return 1 /* LEFT */;
        case 'right':
          return 2 /* RIGHT */;
        case 'inline-start':
          return 3 /* INLINE_START */;
        case 'inline-end':
          return 4 /* INLINE_END */;
      }

      return 0 /* NONE */;
    }
  };

  var letterSpacing = {
    name: 'letter-spacing',
    initialValue: '0',
    prefix: false,
    type: 0 /* VALUE */,
    parse: function parse(_context, token) {
      if (token.type === 20 /* IDENT_TOKEN */ && token.value === 'normal') {
        return 0;
      }
      if (token.type === 17 /* NUMBER_TOKEN */) {
        return token.number;
      }
      if (token.type === 15 /* DIMENSION_TOKEN */) {
        return token.number;
      }
      return 0;
    }
  };
  var LINE_BREAK;
  (function (LINE_BREAK) {
    LINE_BREAK["NORMAL"] = "normal";
    LINE_BREAK["STRICT"] = "strict";
  })(LINE_BREAK || (LINE_BREAK = {}));
  var lineBreak = {
    name: 'line-break',
    initialValue: 'normal',
    prefix: false,
    type: 2 /* IDENT_VALUE */,
    parse: function parse(_context, lineBreak) {
      switch (lineBreak) {
        case 'strict':
          return LINE_BREAK.STRICT;
        case 'normal':
        default:
          return LINE_BREAK.NORMAL;
      }
    }
  };
  var lineHeight = {
    name: 'line-height',
    initialValue: 'normal',
    prefix: false,
    type: 4 /* TOKEN_VALUE */
  };

  var computeLineHeight = function computeLineHeight(token, fontSize) {
    if (isIdentToken(token) && token.value === 'normal') {
      return 1.2 * fontSize;
    } else if (token.type === 17 /* NUMBER_TOKEN */) {
      return fontSize * token.number;
    } else if (isLengthPercentage(token)) {
      return getAbsoluteValue(token, fontSize);
    }
    return fontSize;
  };
  var listStyleImage = {
    name: 'list-style-image',
    initialValue: 'none',
    type: 0 /* VALUE */,
    prefix: false,
    parse: function parse(context, token) {
      if (token.type === 20 /* IDENT_TOKEN */ && token.value === 'none') {
        return null;
      }
      return image.parse(context, token);
    }
  };
  var listStylePosition = {
    name: 'list-style-position',
    initialValue: 'outside',
    prefix: false,
    type: 2 /* IDENT_VALUE */,
    parse: function parse(_context, position) {
      switch (position) {
        case 'inside':
          return 0 /* INSIDE */;
        case 'outside':
        default:
          return 1 /* OUTSIDE */;
      }
    }
  };

  var listStyleType = {
    name: 'list-style-type',
    initialValue: 'none',
    prefix: false,
    type: 2 /* IDENT_VALUE */,
    parse: function parse(_context, type) {
      switch (type) {
        case 'disc':
          return 0 /* DISC */;
        case 'circle':
          return 1 /* CIRCLE */;
        case 'square':
          return 2 /* SQUARE */;
        case 'decimal':
          return 3 /* DECIMAL */;
        case 'cjk-decimal':
          return 4 /* CJK_DECIMAL */;
        case 'decimal-leading-zero':
          return 5 /* DECIMAL_LEADING_ZERO */;
        case 'lower-roman':
          return 6 /* LOWER_ROMAN */;
        case 'upper-roman':
          return 7 /* UPPER_ROMAN */;
        case 'lower-greek':
          return 8 /* LOWER_GREEK */;
        case 'lower-alpha':
          return 9 /* LOWER_ALPHA */;
        case 'upper-alpha':
          return 10 /* UPPER_ALPHA */;
        case 'arabic-indic':
          return 11 /* ARABIC_INDIC */;
        case 'armenian':
          return 12 /* ARMENIAN */;
        case 'bengali':
          return 13 /* BENGALI */;
        case 'cambodian':
          return 14 /* CAMBODIAN */;
        case 'cjk-earthly-branch':
          return 15 /* CJK_EARTHLY_BRANCH */;
        case 'cjk-heavenly-stem':
          return 16 /* CJK_HEAVENLY_STEM */;
        case 'cjk-ideographic':
          return 17 /* CJK_IDEOGRAPHIC */;
        case 'devanagari':
          return 18 /* DEVANAGARI */;
        case 'ethiopic-numeric':
          return 19 /* ETHIOPIC_NUMERIC */;
        case 'georgian':
          return 20 /* GEORGIAN */;
        case 'gujarati':
          return 21 /* GUJARATI */;
        case 'gurmukhi':
          return 22 /* GURMUKHI */;
        case 'hebrew':
          return 22 /* HEBREW */;
        case 'hiragana':
          return 23 /* HIRAGANA */;
        case 'hiragana-iroha':
          return 24 /* HIRAGANA_IROHA */;
        case 'japanese-formal':
          return 25 /* JAPANESE_FORMAL */;
        case 'japanese-informal':
          return 26 /* JAPANESE_INFORMAL */;
        case 'kannada':
          return 27 /* KANNADA */;
        case 'katakana':
          return 28 /* KATAKANA */;
        case 'katakana-iroha':
          return 29 /* KATAKANA_IROHA */;
        case 'khmer':
          return 30 /* KHMER */;
        case 'korean-hangul-formal':
          return 31 /* KOREAN_HANGUL_FORMAL */;
        case 'korean-hanja-formal':
          return 32 /* KOREAN_HANJA_FORMAL */;
        case 'korean-hanja-informal':
          return 33 /* KOREAN_HANJA_INFORMAL */;
        case 'lao':
          return 34 /* LAO */;
        case 'lower-armenian':
          return 35 /* LOWER_ARMENIAN */;
        case 'malayalam':
          return 36 /* MALAYALAM */;
        case 'mongolian':
          return 37 /* MONGOLIAN */;
        case 'myanmar':
          return 38 /* MYANMAR */;
        case 'oriya':
          return 39 /* ORIYA */;
        case 'persian':
          return 40 /* PERSIAN */;
        case 'simp-chinese-formal':
          return 41 /* SIMP_CHINESE_FORMAL */;
        case 'simp-chinese-informal':
          return 42 /* SIMP_CHINESE_INFORMAL */;
        case 'tamil':
          return 43 /* TAMIL */;
        case 'telugu':
          return 44 /* TELUGU */;
        case 'thai':
          return 45 /* THAI */;
        case 'tibetan':
          return 46 /* TIBETAN */;
        case 'trad-chinese-formal':
          return 47 /* TRAD_CHINESE_FORMAL */;
        case 'trad-chinese-informal':
          return 48 /* TRAD_CHINESE_INFORMAL */;
        case 'upper-armenian':
          return 49 /* UPPER_ARMENIAN */;
        case 'disclosure-open':
          return 50 /* DISCLOSURE_OPEN */;
        case 'disclosure-closed':
          return 51 /* DISCLOSURE_CLOSED */;
        case 'none':
        default:
          return -1 /* NONE */;
      }
    }
  };

  var marginForSide = function marginForSide(side) {
    return {
      name: "margin-" + side,
      initialValue: '0',
      prefix: false,
      type: 4 /* TOKEN_VALUE */
    };
  };

  var marginTop = marginForSide('top');
  var marginRight = marginForSide('right');
  var marginBottom = marginForSide('bottom');
  var marginLeft = marginForSide('left');
  var overflow = {
    name: 'overflow',
    initialValue: 'visible',
    prefix: false,
    type: 1 /* LIST */,
    parse: function parse(_context, tokens) {
      return tokens.filter(isIdentToken).map(function (overflow) {
        switch (overflow.value) {
          case 'hidden':
            return 1 /* HIDDEN */;
          case 'scroll':
            return 2 /* SCROLL */;
          case 'clip':
            return 3 /* CLIP */;
          case 'auto':
            return 4 /* AUTO */;
          case 'visible':
          default:
            return 0 /* VISIBLE */;
        }
      });
    }
  };

  var overflowWrap = {
    name: 'overflow-wrap',
    initialValue: 'normal',
    prefix: false,
    type: 2 /* IDENT_VALUE */,
    parse: function parse(_context, overflow) {
      switch (overflow) {
        case 'break-word':
          return "break-word" /* BREAK_WORD */;
        case 'normal':
        default:
          return "normal" /* NORMAL */;
      }
    }
  };

  var paddingForSide = function paddingForSide(side) {
    return {
      name: "padding-" + side,
      initialValue: '0',
      prefix: false,
      type: 3 /* TYPE_VALUE */,
      format: 'length-percentage'
    };
  };
  var paddingTop = paddingForSide('top');
  var paddingRight = paddingForSide('right');
  var paddingBottom = paddingForSide('bottom');
  var paddingLeft = paddingForSide('left');
  var textAlign = {
    name: 'text-align',
    initialValue: 'left',
    prefix: false,
    type: 2 /* IDENT_VALUE */,
    parse: function parse(_context, textAlign) {
      switch (textAlign) {
        case 'right':
          return 2 /* RIGHT */;
        case 'center':
        case 'justify':
          return 1 /* CENTER */;
        case 'left':
        default:
          return 0 /* LEFT */;
      }
    }
  };

  var position = {
    name: 'position',
    initialValue: 'static',
    prefix: false,
    type: 2 /* IDENT_VALUE */,
    parse: function parse(_context, position) {
      switch (position) {
        case 'relative':
          return 1 /* RELATIVE */;
        case 'absolute':
          return 2 /* ABSOLUTE */;
        case 'fixed':
          return 3 /* FIXED */;
        case 'sticky':
          return 4 /* STICKY */;
      }

      return 0 /* STATIC */;
    }
  };

  var textShadow = {
    name: 'text-shadow',
    initialValue: 'none',
    type: 1 /* LIST */,
    prefix: false,
    parse: function parse(context, tokens) {
      if (tokens.length === 1 && isIdentWithValue(tokens[0], 'none')) {
        return [];
      }
      return parseFunctionArgs(tokens).map(function (values) {
        var shadow = {
          color: COLORS.TRANSPARENT,
          offsetX: ZERO_LENGTH,
          offsetY: ZERO_LENGTH,
          blur: ZERO_LENGTH
        };
        var c = 0;
        for (var i = 0; i < values.length; i++) {
          var token = values[i];
          if (isLength(token)) {
            if (c === 0) {
              shadow.offsetX = token;
            } else if (c === 1) {
              shadow.offsetY = token;
            } else {
              shadow.blur = token;
            }
            c++;
          } else {
            shadow.color = color$1.parse(context, token);
          }
        }
        return shadow;
      });
    }
  };
  var textTransform = {
    name: 'text-transform',
    initialValue: 'none',
    prefix: false,
    type: 2 /* IDENT_VALUE */,
    parse: function parse(_context, textTransform) {
      switch (textTransform) {
        case 'uppercase':
          return 2 /* UPPERCASE */;
        case 'lowercase':
          return 1 /* LOWERCASE */;
        case 'capitalize':
          return 3 /* CAPITALIZE */;
      }

      return 0 /* NONE */;
    }
  };

  var transform$1 = {
    name: 'transform',
    initialValue: 'none',
    prefix: true,
    type: 0 /* VALUE */,
    parse: function parse(_context, token) {
      if (token.type === 20 /* IDENT_TOKEN */ && token.value === 'none') {
        return null;
      }
      if (token.type === 18 /* FUNCTION */) {
        var transformFunction = SUPPORTED_TRANSFORM_FUNCTIONS[token.name];
        if (typeof transformFunction === 'undefined') {
          throw new Error("Attempting to parse an unsupported transform function \"" + token.name + "\"");
        }
        return transformFunction(token.values);
      }
      return null;
    }
  };
  var matrix = function matrix(args) {
    var values = args.filter(function (arg) {
      return arg.type === 17 /* NUMBER_TOKEN */;
    }).map(function (arg) {
      return arg.number;
    });
    return values.length === 6 ? values : null;
  };
  // doesn't support 3D transforms at the moment
  var matrix3d = function matrix3d(args) {
    var values = args.filter(function (arg) {
      return arg.type === 17 /* NUMBER_TOKEN */;
    }).map(function (arg) {
      return arg.number;
    });
    var a1 = values[0],
      b1 = values[1];
    values[2];
    values[3];
    var a2 = values[4],
      b2 = values[5];
    values[6];
    values[7];
    values[8];
    values[9];
    values[10];
    values[11];
    var a4 = values[12],
      b4 = values[13];
    values[14];
    values[15];
    return values.length === 16 ? [a1, b1, a2, b2, a4, b4] : null;
  };
  var SUPPORTED_TRANSFORM_FUNCTIONS = {
    matrix: matrix,
    matrix3d: matrix3d
  };
  var DEFAULT_VALUE = {
    type: 16 /* PERCENTAGE_TOKEN */,
    number: 50,
    flags: FLAG_INTEGER
  };
  var DEFAULT = [DEFAULT_VALUE, DEFAULT_VALUE];
  var transformOrigin = {
    name: 'transform-origin',
    initialValue: '50% 50%',
    prefix: true,
    type: 1 /* LIST */,
    parse: function parse(_context, tokens) {
      var origins = tokens.filter(isLengthPercentage);
      if (origins.length !== 2) {
        return DEFAULT;
      }
      return [origins[0], origins[1]];
    }
  };
  var visibility = {
    name: 'visible',
    initialValue: 'none',
    prefix: false,
    type: 2 /* IDENT_VALUE */,
    parse: function parse(_context, visibility) {
      switch (visibility) {
        case 'hidden':
          return 1 /* HIDDEN */;
        case 'collapse':
          return 2 /* COLLAPSE */;
        case 'visible':
        default:
          return 0 /* VISIBLE */;
      }
    }
  };

  var WORD_BREAK;
  (function (WORD_BREAK) {
    WORD_BREAK["NORMAL"] = "normal";
    WORD_BREAK["BREAK_ALL"] = "break-all";
    WORD_BREAK["KEEP_ALL"] = "keep-all";
  })(WORD_BREAK || (WORD_BREAK = {}));
  var wordBreak = {
    name: 'word-break',
    initialValue: 'normal',
    prefix: false,
    type: 2 /* IDENT_VALUE */,
    parse: function parse(_context, wordBreak) {
      switch (wordBreak) {
        case 'break-all':
          return WORD_BREAK.BREAK_ALL;
        case 'keep-all':
          return WORD_BREAK.KEEP_ALL;
        case 'normal':
        default:
          return WORD_BREAK.NORMAL;
      }
    }
  };
  var zIndex = {
    name: 'z-index',
    initialValue: 'auto',
    prefix: false,
    type: 0 /* VALUE */,
    parse: function parse(_context, token) {
      if (token.type === 20 /* IDENT_TOKEN */) {
        return {
          auto: true,
          order: 0
        };
      }
      if (isNumberToken(token)) {
        return {
          auto: false,
          order: token.number
        };
      }
      throw new Error("Invalid z-index number parsed");
    }
  };
  var time = {
    name: 'time',
    parse: function parse(_context, value) {
      if (value.type === 15 /* DIMENSION_TOKEN */) {
        switch (value.unit.toLowerCase()) {
          case 's':
            return 1000 * value.number;
          case 'ms':
            return value.number;
        }
      }
      throw new Error("Unsupported time type");
    }
  };
  var opacity = {
    name: 'opacity',
    initialValue: '1',
    type: 0 /* VALUE */,
    prefix: false,
    parse: function parse(_context, token) {
      if (isNumberToken(token)) {
        return token.number;
      }
      return 1;
    }
  };
  var textDecorationColor = {
    name: "text-decoration-color",
    initialValue: 'transparent',
    prefix: false,
    type: 3 /* TYPE_VALUE */,
    format: 'color'
  };
  var textDecorationLine = {
    name: 'text-decoration-line',
    initialValue: 'none',
    prefix: false,
    type: 1 /* LIST */,
    parse: function parse(_context, tokens) {
      return tokens.filter(isIdentToken).map(function (token) {
        switch (token.value) {
          case 'underline':
            return 1 /* UNDERLINE */;
          case 'overline':
            return 2 /* OVERLINE */;
          case 'line-through':
            return 3 /* LINE_THROUGH */;
          case 'none':
            return 4 /* BLINK */;
        }

        return 0 /* NONE */;
      }).filter(function (line) {
        return line !== 0 /* NONE */;
      });
    }
  };

  var fontFamily = {
    name: "font-family",
    initialValue: '',
    prefix: false,
    type: 1 /* LIST */,
    parse: function parse(_context, tokens) {
      var accumulator = [];
      var results = [];
      tokens.forEach(function (token) {
        switch (token.type) {
          case 20 /* IDENT_TOKEN */:
          case 0 /* STRING_TOKEN */:
            accumulator.push(token.value);
            break;
          case 17 /* NUMBER_TOKEN */:
            accumulator.push(token.number.toString());
            break;
          case 4 /* COMMA_TOKEN */:
            results.push(accumulator.join(' '));
            accumulator.length = 0;
            break;
        }
      });
      if (accumulator.length) {
        results.push(accumulator.join(' '));
      }
      return results.map(function (result) {
        return result.indexOf(' ') === -1 ? result : "'" + result + "'";
      });
    }
  };
  var fontSize = {
    name: "font-size",
    initialValue: '0',
    prefix: false,
    type: 3 /* TYPE_VALUE */,
    format: 'length'
  };
  var fontWeight = {
    name: 'font-weight',
    initialValue: 'normal',
    type: 0 /* VALUE */,
    prefix: false,
    parse: function parse(_context, token) {
      if (isNumberToken(token)) {
        return token.number;
      }
      if (isIdentToken(token)) {
        switch (token.value) {
          case 'bold':
            return 700;
          case 'normal':
          default:
            return 400;
        }
      }
      return 400;
    }
  };
  var fontVariant = {
    name: 'font-variant',
    initialValue: 'none',
    type: 1 /* LIST */,
    prefix: false,
    parse: function parse(_context, tokens) {
      return tokens.filter(isIdentToken).map(function (token) {
        return token.value;
      });
    }
  };
  var fontStyle = {
    name: 'font-style',
    initialValue: 'normal',
    prefix: false,
    type: 2 /* IDENT_VALUE */,
    parse: function parse(_context, overflow) {
      switch (overflow) {
        case 'oblique':
          return "oblique" /* OBLIQUE */;
        case 'italic':
          return "italic" /* ITALIC */;
        case 'normal':
        default:
          return "normal" /* NORMAL */;
      }
    }
  };

  var contains = function contains(bit, value) {
    return (bit & value) !== 0;
  };
  var content = {
    name: 'content',
    initialValue: 'none',
    type: 1 /* LIST */,
    prefix: false,
    parse: function parse(_context, tokens) {
      if (tokens.length === 0) {
        return [];
      }
      var first = tokens[0];
      if (first.type === 20 /* IDENT_TOKEN */ && first.value === 'none') {
        return [];
      }
      return tokens;
    }
  };
  var counterIncrement = {
    name: 'counter-increment',
    initialValue: 'none',
    prefix: true,
    type: 1 /* LIST */,
    parse: function parse(_context, tokens) {
      if (tokens.length === 0) {
        return null;
      }
      var first = tokens[0];
      if (first.type === 20 /* IDENT_TOKEN */ && first.value === 'none') {
        return null;
      }
      var increments = [];
      var filtered = tokens.filter(nonWhiteSpace);
      for (var i = 0; i < filtered.length; i++) {
        var counter = filtered[i];
        var next = filtered[i + 1];
        if (counter.type === 20 /* IDENT_TOKEN */) {
          var increment = next && isNumberToken(next) ? next.number : 1;
          increments.push({
            counter: counter.value,
            increment: increment
          });
        }
      }
      return increments;
    }
  };
  var counterReset = {
    name: 'counter-reset',
    initialValue: 'none',
    prefix: true,
    type: 1 /* LIST */,
    parse: function parse(_context, tokens) {
      if (tokens.length === 0) {
        return [];
      }
      var resets = [];
      var filtered = tokens.filter(nonWhiteSpace);
      for (var i = 0; i < filtered.length; i++) {
        var counter = filtered[i];
        var next = filtered[i + 1];
        if (isIdentToken(counter) && counter.value !== 'none') {
          var reset = next && isNumberToken(next) ? next.number : 0;
          resets.push({
            counter: counter.value,
            reset: reset
          });
        }
      }
      return resets;
    }
  };
  var duration = {
    name: 'duration',
    initialValue: '0s',
    prefix: false,
    type: 1 /* LIST */,
    parse: function parse(context, tokens) {
      return tokens.filter(isDimensionToken).map(function (token) {
        return time.parse(context, token);
      });
    }
  };
  var quotes = {
    name: 'quotes',
    initialValue: 'none',
    prefix: true,
    type: 1 /* LIST */,
    parse: function parse(_context, tokens) {
      if (tokens.length === 0) {
        return null;
      }
      var first = tokens[0];
      if (first.type === 20 /* IDENT_TOKEN */ && first.value === 'none') {
        return null;
      }
      var quotes = [];
      var filtered = tokens.filter(isStringToken);
      if (filtered.length % 2 !== 0) {
        return null;
      }
      for (var i = 0; i < filtered.length; i += 2) {
        var open_1 = filtered[i].value;
        var close_1 = filtered[i + 1].value;
        quotes.push({
          open: open_1,
          close: close_1
        });
      }
      return quotes;
    }
  };
  var getQuote = function getQuote(quotes, depth, open) {
    if (!quotes) {
      return '';
    }
    var quote = quotes[Math.min(depth, quotes.length - 1)];
    if (!quote) {
      return '';
    }
    return open ? quote.open : quote.close;
  };
  var boxShadow = {
    name: 'box-shadow',
    initialValue: 'none',
    type: 1 /* LIST */,
    prefix: false,
    parse: function parse(context, tokens) {
      if (tokens.length === 1 && isIdentWithValue(tokens[0], 'none')) {
        return [];
      }
      return parseFunctionArgs(tokens).map(function (values) {
        var shadow = {
          color: 0x000000ff,
          offsetX: ZERO_LENGTH,
          offsetY: ZERO_LENGTH,
          blur: ZERO_LENGTH,
          spread: ZERO_LENGTH,
          inset: false
        };
        var c = 0;
        for (var i = 0; i < values.length; i++) {
          var token = values[i];
          if (isIdentWithValue(token, 'inset')) {
            shadow.inset = true;
          } else if (isLength(token)) {
            if (c === 0) {
              shadow.offsetX = token;
            } else if (c === 1) {
              shadow.offsetY = token;
            } else if (c === 2) {
              shadow.blur = token;
            } else {
              shadow.spread = token;
            }
            c++;
          } else {
            shadow.color = color$1.parse(context, token);
          }
        }
        return shadow;
      });
    }
  };
  var paintOrder = {
    name: 'paint-order',
    initialValue: 'normal',
    prefix: false,
    type: 1 /* LIST */,
    parse: function parse(_context, tokens) {
      var DEFAULT_VALUE = [0 /* FILL */, 1 /* STROKE */, 2 /* MARKERS */];
      var layers = [];
      tokens.filter(isIdentToken).forEach(function (token) {
        switch (token.value) {
          case 'stroke':
            layers.push(1 /* STROKE */);
            break;
          case 'fill':
            layers.push(0 /* FILL */);
            break;
          case 'markers':
            layers.push(2 /* MARKERS */);
            break;
        }
      });
      DEFAULT_VALUE.forEach(function (value) {
        if (layers.indexOf(value) === -1) {
          layers.push(value);
        }
      });
      return layers;
    }
  };
  var webkitTextStrokeColor = {
    name: "-webkit-text-stroke-color",
    initialValue: 'currentcolor',
    prefix: false,
    type: 3 /* TYPE_VALUE */,
    format: 'color'
  };
  var webkitTextStrokeWidth = {
    name: "-webkit-text-stroke-width",
    initialValue: '0',
    type: 0 /* VALUE */,
    prefix: false,
    parse: function parse(_context, token) {
      if (isDimensionToken(token)) {
        return token.number;
      }
      return 0;
    }
  };
  var CSSParsedDeclaration = /** @class */function () {
    function CSSParsedDeclaration(context, declaration) {
      var _a, _b;
      this.animationDuration = parse(context, duration, declaration.animationDuration);
      this.backgroundClip = parse(context, backgroundClip, declaration.backgroundClip);
      this.backgroundColor = parse(context, backgroundColor, declaration.backgroundColor);
      this.backgroundImage = parse(context, backgroundImage, declaration.backgroundImage);
      this.backgroundOrigin = parse(context, backgroundOrigin, declaration.backgroundOrigin);
      this.backgroundPosition = parse(context, backgroundPosition, declaration.backgroundPosition);
      this.backgroundRepeat = parse(context, backgroundRepeat, declaration.backgroundRepeat);
      this.backgroundSize = parse(context, backgroundSize, declaration.backgroundSize);
      this.borderTopColor = parse(context, borderTopColor, declaration.borderTopColor);
      this.borderRightColor = parse(context, borderRightColor, declaration.borderRightColor);
      this.borderBottomColor = parse(context, borderBottomColor, declaration.borderBottomColor);
      this.borderLeftColor = parse(context, borderLeftColor, declaration.borderLeftColor);
      this.borderTopLeftRadius = parse(context, borderTopLeftRadius, declaration.borderTopLeftRadius);
      this.borderTopRightRadius = parse(context, borderTopRightRadius, declaration.borderTopRightRadius);
      this.borderBottomRightRadius = parse(context, borderBottomRightRadius, declaration.borderBottomRightRadius);
      this.borderBottomLeftRadius = parse(context, borderBottomLeftRadius, declaration.borderBottomLeftRadius);
      this.borderTopStyle = parse(context, borderTopStyle, declaration.borderTopStyle);
      this.borderRightStyle = parse(context, borderRightStyle, declaration.borderRightStyle);
      this.borderBottomStyle = parse(context, borderBottomStyle, declaration.borderBottomStyle);
      this.borderLeftStyle = parse(context, borderLeftStyle, declaration.borderLeftStyle);
      this.borderTopWidth = parse(context, borderTopWidth, declaration.borderTopWidth);
      this.borderRightWidth = parse(context, borderRightWidth, declaration.borderRightWidth);
      this.borderBottomWidth = parse(context, borderBottomWidth, declaration.borderBottomWidth);
      this.borderLeftWidth = parse(context, borderLeftWidth, declaration.borderLeftWidth);
      this.boxShadow = parse(context, boxShadow, declaration.boxShadow);
      this.color = parse(context, color, declaration.color);
      this.direction = parse(context, direction, declaration.direction);
      this.display = parse(context, display, declaration.display);
      this.float = parse(context, float, declaration.cssFloat);
      this.fontFamily = parse(context, fontFamily, declaration.fontFamily);
      this.fontSize = parse(context, fontSize, declaration.fontSize);
      this.fontStyle = parse(context, fontStyle, declaration.fontStyle);
      this.fontVariant = parse(context, fontVariant, declaration.fontVariant);
      this.fontWeight = parse(context, fontWeight, declaration.fontWeight);
      this.letterSpacing = parse(context, letterSpacing, declaration.letterSpacing);
      this.lineBreak = parse(context, lineBreak, declaration.lineBreak);
      this.lineHeight = parse(context, lineHeight, declaration.lineHeight);
      this.listStyleImage = parse(context, listStyleImage, declaration.listStyleImage);
      this.listStylePosition = parse(context, listStylePosition, declaration.listStylePosition);
      this.listStyleType = parse(context, listStyleType, declaration.listStyleType);
      this.marginTop = parse(context, marginTop, declaration.marginTop);
      this.marginRight = parse(context, marginRight, declaration.marginRight);
      this.marginBottom = parse(context, marginBottom, declaration.marginBottom);
      this.marginLeft = parse(context, marginLeft, declaration.marginLeft);
      this.opacity = parse(context, opacity, declaration.opacity);
      var overflowTuple = parse(context, overflow, declaration.overflow);
      this.overflowX = overflowTuple[0];
      this.overflowY = overflowTuple[overflowTuple.length > 1 ? 1 : 0];
      this.overflowWrap = parse(context, overflowWrap, declaration.overflowWrap);
      this.paddingTop = parse(context, paddingTop, declaration.paddingTop);
      this.paddingRight = parse(context, paddingRight, declaration.paddingRight);
      this.paddingBottom = parse(context, paddingBottom, declaration.paddingBottom);
      this.paddingLeft = parse(context, paddingLeft, declaration.paddingLeft);
      this.paintOrder = parse(context, paintOrder, declaration.paintOrder);
      this.position = parse(context, position, declaration.position);
      this.textAlign = parse(context, textAlign, declaration.textAlign);
      this.textDecorationColor = parse(context, textDecorationColor, (_a = declaration.textDecorationColor) !== null && _a !== void 0 ? _a : declaration.color);
      this.textDecorationLine = parse(context, textDecorationLine, (_b = declaration.textDecorationLine) !== null && _b !== void 0 ? _b : declaration.textDecoration);
      this.textShadow = parse(context, textShadow, declaration.textShadow);
      this.textTransform = parse(context, textTransform, declaration.textTransform);
      this.transform = parse(context, transform$1, declaration.transform);
      this.transformOrigin = parse(context, transformOrigin, declaration.transformOrigin);
      this.visibility = parse(context, visibility, declaration.visibility);
      this.webkitTextStrokeColor = parse(context, webkitTextStrokeColor, declaration.webkitTextStrokeColor);
      this.webkitTextStrokeWidth = parse(context, webkitTextStrokeWidth, declaration.webkitTextStrokeWidth);
      this.wordBreak = parse(context, wordBreak, declaration.wordBreak);
      this.zIndex = parse(context, zIndex, declaration.zIndex);
    }
    CSSParsedDeclaration.prototype.isVisible = function () {
      return this.display > 0 && this.opacity > 0 && this.visibility === 0 /* VISIBLE */;
    };

    CSSParsedDeclaration.prototype.isTransparent = function () {
      return isTransparent(this.backgroundColor);
    };
    CSSParsedDeclaration.prototype.isTransformed = function () {
      return this.transform !== null;
    };
    CSSParsedDeclaration.prototype.isPositioned = function () {
      return this.position !== 0 /* STATIC */;
    };

    CSSParsedDeclaration.prototype.isPositionedWithZIndex = function () {
      return this.isPositioned() && !this.zIndex.auto;
    };
    CSSParsedDeclaration.prototype.isFloating = function () {
      return this.float !== 0 /* NONE */;
    };

    CSSParsedDeclaration.prototype.isInlineLevel = function () {
      return contains(this.display, 4 /* INLINE */) || contains(this.display, 33554432 /* INLINE_BLOCK */) || contains(this.display, 268435456 /* INLINE_FLEX */) || contains(this.display, 536870912 /* INLINE_GRID */) || contains(this.display, 67108864 /* INLINE_LIST_ITEM */) || contains(this.display, 134217728 /* INLINE_TABLE */);
    };

    return CSSParsedDeclaration;
  }();
  var CSSParsedPseudoDeclaration = /** @class */function () {
    function CSSParsedPseudoDeclaration(context, declaration) {
      this.content = parse(context, content, declaration.content);
      this.quotes = parse(context, quotes, declaration.quotes);
    }
    return CSSParsedPseudoDeclaration;
  }();
  var CSSParsedCounterDeclaration = /** @class */function () {
    function CSSParsedCounterDeclaration(context, declaration) {
      this.counterIncrement = parse(context, counterIncrement, declaration.counterIncrement);
      this.counterReset = parse(context, counterReset, declaration.counterReset);
    }
    return CSSParsedCounterDeclaration;
  }();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var parse = function parse(context, descriptor, style) {
    var tokenizer = new Tokenizer();
    var value = style !== null && typeof style !== 'undefined' ? style.toString() : descriptor.initialValue;
    tokenizer.write(value);
    var parser = new Parser(tokenizer.read());
    switch (descriptor.type) {
      case 2 /* IDENT_VALUE */:
        var token = parser.parseComponentValue();
        return descriptor.parse(context, isIdentToken(token) ? token.value : descriptor.initialValue);
      case 0 /* VALUE */:
        return descriptor.parse(context, parser.parseComponentValue());
      case 1 /* LIST */:
        return descriptor.parse(context, parser.parseComponentValues());
      case 4 /* TOKEN_VALUE */:
        return parser.parseComponentValue();
      case 3 /* TYPE_VALUE */:
        switch (descriptor.format) {
          case 'angle':
            return angle.parse(context, parser.parseComponentValue());
          case 'color':
            return color$1.parse(context, parser.parseComponentValue());
          case 'image':
            return image.parse(context, parser.parseComponentValue());
          case 'length':
            var length_1 = parser.parseComponentValue();
            return isLength(length_1) ? length_1 : ZERO_LENGTH;
          case 'length-percentage':
            var value_1 = parser.parseComponentValue();
            return isLengthPercentage(value_1) ? value_1 : ZERO_LENGTH;
          case 'time':
            return time.parse(context, parser.parseComponentValue());
        }
        break;
    }
  };
  var elementDebuggerAttribute = 'data-html2canvas-debug';
  var getElementDebugType = function getElementDebugType(element) {
    var attribute = element.getAttribute(elementDebuggerAttribute);
    switch (attribute) {
      case 'all':
        return 1 /* ALL */;
      case 'clone':
        return 2 /* CLONE */;
      case 'parse':
        return 3 /* PARSE */;
      case 'render':
        return 4 /* RENDER */;
      default:
        return 0 /* NONE */;
    }
  };

  var isDebugging = function isDebugging(element, type) {
    var elementType = getElementDebugType(element);
    return elementType === 1 /* ALL */ || type === elementType;
  };
  var ElementContainer = /** @class */function () {
    function ElementContainer(context, element) {
      this.context = context;
      this.textNodes = [];
      this.elements = [];
      this.flags = 0;
      if (isDebugging(element, 3 /* PARSE */)) {
        debugger;
      }
      this.styles = new CSSParsedDeclaration(context, window.getComputedStyle(element, null));
      if (isHTMLElementNode(element)) {
        if (this.styles.animationDuration.some(function (duration) {
          return duration > 0;
        })) {
          element.style.animationDuration = '0s';
        }
        if (this.styles.transform !== null) {
          // getBoundingClientRect takes transforms into account
          element.style.transform = 'none';
        }
      }
      this.bounds = parseBounds(this.context, element);
      if (isDebugging(element, 4 /* RENDER */)) {
        this.flags |= 16 /* DEBUG_RENDER */;
      }
    }

    return ElementContainer;
  }();

  /*
   * text-segmentation 1.0.3 <https://github.com/niklasvh/text-segmentation>
   * Copyright (c) 2022 Niklas von Hertzen <https://hertzen.com>
   * Released under MIT License
   */
  var base64 = 'AAAAAAAAAAAAEA4AGBkAAFAaAAACAAAAAAAIABAAGAAwADgACAAQAAgAEAAIABAACAAQAAgAEAAIABAACAAQAAgAEAAIABAAQABIAEQATAAIABAACAAQAAgAEAAIABAAVABcAAgAEAAIABAACAAQAGAAaABwAHgAgACIAI4AlgAIABAAmwCjAKgAsAC2AL4AvQDFAMoA0gBPAVYBWgEIAAgACACMANoAYgFkAWwBdAF8AX0BhQGNAZUBlgGeAaMBlQGWAasBswF8AbsBwwF0AcsBYwHTAQgA2wG/AOMBdAF8AekB8QF0AfkB+wHiAHQBfAEIAAMC5gQIAAsCEgIIAAgAFgIeAggAIgIpAggAMQI5AkACygEIAAgASAJQAlgCYAIIAAgACAAKBQoFCgUTBRMFGQUrBSsFCAAIAAgACAAIAAgACAAIAAgACABdAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACABoAmgCrwGvAQgAbgJ2AggAHgEIAAgACADnAXsCCAAIAAgAgwIIAAgACAAIAAgACACKAggAkQKZAggAPADJAAgAoQKkAqwCsgK6AsICCADJAggA0AIIAAgACAAIANYC3gIIAAgACAAIAAgACABAAOYCCAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAkASoB+QIEAAgACAA8AEMCCABCBQgACABJBVAFCAAIAAgACAAIAAgACAAIAAgACABTBVoFCAAIAFoFCABfBWUFCAAIAAgACAAIAAgAbQUIAAgACAAIAAgACABzBXsFfQWFBYoFigWKBZEFigWKBYoFmAWfBaYFrgWxBbkFCAAIAAgACAAIAAgACAAIAAgACAAIAMEFCAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAMgFCADQBQgACAAIAAgACAAIAAgACAAIAAgACAAIAO4CCAAIAAgAiQAIAAgACABAAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAD0AggACAD8AggACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIANYFCAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAMDvwAIAAgAJAIIAAgACAAIAAgACAAIAAgACwMTAwgACAB9BOsEGwMjAwgAKwMyAwsFYgE3A/MEPwMIAEUDTQNRAwgAWQOsAGEDCAAIAAgACAAIAAgACABpAzQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFIQUoBSwFCAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACABtAwgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACABMAEwACAAIAAgACAAIABgACAAIAAgACAC/AAgACAAyAQgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACACAAIAAwAAgACAAIAAgACAAIAAgACAAIAAAARABIAAgACAAIABQASAAIAAgAIABwAEAAjgCIABsAqAC2AL0AigDQAtwC+IJIQqVAZUBWQqVAZUBlQGVAZUBlQGrC5UBlQGVAZUBlQGVAZUBlQGVAXsKlQGVAbAK6wsrDGUMpQzlDJUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAfAKAAuZA64AtwCJALoC6ADwAAgAuACgA/oEpgO6AqsD+AAIAAgAswMIAAgACAAIAIkAuwP5AfsBwwPLAwgACAAIAAgACADRA9kDCAAIAOED6QMIAAgACAAIAAgACADuA/YDCAAIAP4DyQAIAAgABgQIAAgAXQAOBAgACAAIAAgACAAIABMECAAIAAgACAAIAAgACAD8AAQBCAAIAAgAGgQiBCoECAExBAgAEAEIAAgACAAIAAgACAAIAAgACAAIAAgACAA4BAgACABABEYECAAIAAgATAQYAQgAVAQIAAgACAAIAAgACAAIAAgACAAIAFoECAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgAOQEIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAB+BAcACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAEABhgSMBAgACAAIAAgAlAQIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAwAEAAQABAADAAMAAwADAAQABAAEAAQABAAEAAQABHATAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgAdQMIAAgACAAIAAgACAAIAMkACAAIAAgAfQMIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACACFA4kDCAAIAAgACAAIAOcBCAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAIcDCAAIAAgACAAIAAgACAAIAAgACAAIAJEDCAAIAAgACADFAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACABgBAgAZgQIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgAbAQCBXIECAAIAHkECAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACABAAJwEQACjBKoEsgQIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAC6BMIECAAIAAgACAAIAAgACABmBAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgAxwQIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAGYECAAIAAgAzgQIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgAigWKBYoFigWKBYoFigWKBd0FXwUIAOIF6gXxBYoF3gT5BQAGCAaKBYoFigWKBYoFigWKBYoFigWKBYoFigXWBIoFigWKBYoFigWKBYoFigWKBYsFEAaKBYoFigWKBYoFigWKBRQGCACKBYoFigWKBQgACAAIANEECAAIABgGigUgBggAJgYIAC4GMwaKBYoF0wQ3Bj4GigWKBYoFigWKBYoFigWKBYoFigWKBYoFigUIAAgACAAIAAgACAAIAAgAigWKBYoFigWKBYoFigWKBYoFigWKBYoFigWKBYoFigWKBYoFigWKBYoFigWKBYoFigWKBYoFigWKBYoFigWLBf///////wQABAAEAAQABAAEAAQABAAEAAQAAwAEAAQAAgAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAQADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAUAAAAFAAUAAAAFAAUAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAEAAQABAAEAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUAAQAAAAUABQAFAAUABQAFAAAAAAAFAAUAAAAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAFAAUAAQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABwAFAAUABQAFAAAABwAHAAcAAAAHAAcABwAFAAEAAAAAAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcABwAFAAUABQAFAAcABwAFAAUAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAAAAQABAAAAAAAAAAAAAAAFAAUABQAFAAAABwAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAHAAcABwAHAAcAAAAHAAcAAAAAAAUABQAHAAUAAQAHAAEABwAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABwABAAUABQAFAAUAAAAAAAAAAAAAAAEAAQABAAEAAQABAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABwAFAAUAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUAAQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQABQANAAQABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQABAAEAAQABAAEAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAEAAQABAAEAAQABAAEAAQABAAEAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAQABAAEAAQABAAEAAQABAAAAAAAAAAAAAAAAAAAAAAABQAHAAUABQAFAAAAAAAAAAcABQAFAAUABQAFAAQABAAEAAQABAAEAAQABAAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUAAAAFAAUABQAFAAUAAAAFAAUABQAAAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAAAAAAAAAAAAUABQAFAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAHAAUAAAAHAAcABwAFAAUABQAFAAUABQAFAAUABwAHAAcABwAFAAcABwAAAAUABQAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABwAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAUABwAHAAUABQAFAAUAAAAAAAcABwAAAAAABwAHAAUAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAABQAFAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAAABwAHAAcABQAFAAAAAAAAAAAABQAFAAAAAAAFAAUABQAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAFAAUABQAFAAUAAAAFAAUABwAAAAcABwAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAFAAUABwAFAAUABQAFAAAAAAAHAAcAAAAAAAcABwAFAAAAAAAAAAAAAAAAAAAABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAcABwAAAAAAAAAHAAcABwAAAAcABwAHAAUAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAABQAHAAcABwAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABwAHAAcABwAAAAUABQAFAAAABQAFAAUABQAAAAAAAAAAAAAAAAAAAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAcABQAHAAcABQAHAAcAAAAFAAcABwAAAAcABwAFAAUAAAAAAAAAAAAAAAAAAAAFAAUAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAcABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAAAAUABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAFAAcABwAFAAUABQAAAAUAAAAHAAcABwAHAAcABwAHAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAHAAUABQAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAAABwAFAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAUAAAAFAAAAAAAAAAAABwAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABwAFAAUABQAFAAUAAAAFAAUAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABwAFAAUABQAFAAUABQAAAAUABQAHAAcABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcABQAFAAAAAAAAAAAABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAcABQAFAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAHAAUABQAFAAUABQAFAAUABwAHAAcABwAHAAcABwAHAAUABwAHAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABwAHAAcABwAFAAUABwAHAAcAAAAAAAAAAAAHAAcABQAHAAcABwAHAAcABwAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAcABwAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABQAHAAUABQAFAAUABQAFAAUAAAAFAAAABQAAAAAABQAFAAUABQAFAAUABQAFAAcABwAHAAcABwAHAAUABQAFAAUABQAFAAUABQAFAAUAAAAAAAUABQAFAAUABQAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUABwAFAAcABwAHAAcABwAFAAcABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAUABQAFAAUABwAHAAUABQAHAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAcABQAFAAcABwAHAAUABwAFAAUABQAHAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAHAAcABwAHAAcABwAHAAUABQAFAAUABQAFAAUABQAHAAcABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUAAAAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAcABQAFAAUABQAFAAUABQAAAAAAAAAAAAUAAAAAAAAAAAAAAAAABQAAAAAABwAFAAUAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAAABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUAAAAFAAUABQAFAAUABQAFAAUABQAFAAAAAAAAAAAABQAAAAAAAAAFAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAHAAUABQAHAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABwAHAAcABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUABQAFAAUABQAHAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAcABwAFAAUABQAFAAcABwAFAAUABwAHAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAcABwAFAAUABwAHAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAFAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAFAAUABQAAAAAABQAFAAAAAAAAAAAAAAAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABQAFAAcABwAAAAAAAAAAAAAABwAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABwAFAAcABwAFAAcABwAAAAcABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAAAAAAAAAAAAAAAAAFAAUABQAAAAUABQAAAAAAAAAAAAAABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAAAAAAAAAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABQAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABwAFAAUABQAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAHAAcABQAFAAUABQAFAAUABQAFAAUABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcABwAFAAUABQAHAAcABQAHAAUABQAAAAAAAAAAAAAAAAAFAAAABwAHAAcABQAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABwAHAAcABwAAAAAABwAHAAAAAAAHAAcABwAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAHAAAAAAAFAAUABQAFAAUABQAFAAAAAAAAAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcABwAFAAUABQAFAAUABQAFAAUABwAHAAUABQAFAAcABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAHAAcABQAFAAUABQAFAAUABwAFAAcABwAFAAcABQAFAAcABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAHAAcABQAFAAUABQAAAAAABwAHAAcABwAFAAUABwAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABwAHAAUABQAFAAUABQAFAAUABQAHAAcABQAHAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABwAFAAcABwAFAAUABQAFAAUABQAHAAUAAAAAAAAAAAAAAAAAAAAAAAcABwAFAAUABQAFAAcABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcABwAFAAUABQAFAAUABQAFAAUABQAHAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcABwAFAAUABQAFAAAAAAAFAAUABwAHAAcABwAFAAAAAAAAAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABwAHAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABQAFAAUABQAFAAUABQAAAAUABQAFAAUABQAFAAcABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAAAHAAUABQAFAAUABQAFAAUABwAFAAUABwAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUAAAAAAAAABQAAAAUABQAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcABwAHAAcAAAAFAAUAAAAHAAcABQAHAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABwAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAAAAAAAAAAAAAAAAAAABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAAAAUABQAFAAAAAAAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAAAAAAAAAAABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAAAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABQAAAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAAABQAFAAUABQAFAAUABQAAAAUABQAAAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAFAAUABQAFAAUADgAOAA4ADgAOAA4ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAAAAAAAAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAMAAwADAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkAAAAAAAAAAAAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAAAAAAAAAAAAsADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwACwAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAOAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4ADgAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAA4ADgAOAA4ADgAOAA4ADgAOAAAAAAAAAAAADgAOAA4AAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAA4ADgAAAA4ADgAOAA4ADgAOAAAADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4AAAAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4AAAAAAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAAAA4AAAAOAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAADgAAAAAAAAAAAA4AAAAOAAAAAAAAAAAADgAOAA4AAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAOAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4ADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4ADgAOAA4ADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAADgAOAA4ADgAOAA4ADgAOAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAAAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAA4ADgAOAA4ADgAOAA4ADgAOAAAADgAOAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4AAAAAAAAAAAAAAAAADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAA4ADgAOAA4ADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAA4ADgAOAA4AAAAAAAAAAAAAAAAAAAAAAA4ADgAOAA4ADgAOAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4AAAAOAA4ADgAOAA4ADgAAAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4AAAAAAAAAAAA=';

  /*
   * utrie 1.0.2 <https://github.com/niklasvh/utrie>
   * Copyright (c) 2022 Niklas von Hertzen <https://hertzen.com>
   * Released under MIT License
   */
  var chars$1 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  // Use a lookup table to find the index.
  var lookup$1 = typeof Uint8Array === 'undefined' ? [] : new Uint8Array(256);
  for (var i$1 = 0; i$1 < chars$1.length; i$1++) {
    lookup$1[chars$1.charCodeAt(i$1)] = i$1;
  }
  var decode = function decode(base64) {
    var bufferLength = base64.length * 0.75,
      len = base64.length,
      i,
      p = 0,
      encoded1,
      encoded2,
      encoded3,
      encoded4;
    if (base64[base64.length - 1] === '=') {
      bufferLength--;
      if (base64[base64.length - 2] === '=') {
        bufferLength--;
      }
    }
    var buffer = typeof ArrayBuffer !== 'undefined' && typeof Uint8Array !== 'undefined' && typeof Uint8Array.prototype.slice !== 'undefined' ? new ArrayBuffer(bufferLength) : new Array(bufferLength);
    var bytes = Array.isArray(buffer) ? buffer : new Uint8Array(buffer);
    for (i = 0; i < len; i += 4) {
      encoded1 = lookup$1[base64.charCodeAt(i)];
      encoded2 = lookup$1[base64.charCodeAt(i + 1)];
      encoded3 = lookup$1[base64.charCodeAt(i + 2)];
      encoded4 = lookup$1[base64.charCodeAt(i + 3)];
      bytes[p++] = encoded1 << 2 | encoded2 >> 4;
      bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
      bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
    }
    return buffer;
  };
  var polyUint16Array = function polyUint16Array(buffer) {
    var length = buffer.length;
    var bytes = [];
    for (var i = 0; i < length; i += 2) {
      bytes.push(buffer[i + 1] << 8 | buffer[i]);
    }
    return bytes;
  };
  var polyUint32Array = function polyUint32Array(buffer) {
    var length = buffer.length;
    var bytes = [];
    for (var i = 0; i < length; i += 4) {
      bytes.push(buffer[i + 3] << 24 | buffer[i + 2] << 16 | buffer[i + 1] << 8 | buffer[i]);
    }
    return bytes;
  };

  /** Shift size for getting the index-2 table offset. */
  var UTRIE2_SHIFT_2 = 5;
  /** Shift size for getting the index-1 table offset. */
  var UTRIE2_SHIFT_1 = 6 + 5;
  /**
   * Shift size for shifting left the index array values.
   * Increases possible data size with 16-bit index values at the cost
   * of compactability.
   * This requires data blocks to be aligned by UTRIE2_DATA_GRANULARITY.
   */
  var UTRIE2_INDEX_SHIFT = 2;
  /**
   * Difference between the two shift sizes,
   * for getting an index-1 offset from an index-2 offset. 6=11-5
   */
  var UTRIE2_SHIFT_1_2 = UTRIE2_SHIFT_1 - UTRIE2_SHIFT_2;
  /**
   * The part of the index-2 table for U+D800..U+DBFF stores values for
   * lead surrogate code _units_ not code _points_.
   * Values for lead surrogate code _points_ are indexed with this portion of the table.
   * Length=32=0x20=0x400>>UTRIE2_SHIFT_2. (There are 1024=0x400 lead surrogates.)
   */
  var UTRIE2_LSCP_INDEX_2_OFFSET = 0x10000 >> UTRIE2_SHIFT_2;
  /** Number of entries in a data block. 32=0x20 */
  var UTRIE2_DATA_BLOCK_LENGTH = 1 << UTRIE2_SHIFT_2;
  /** Mask for getting the lower bits for the in-data-block offset. */
  var UTRIE2_DATA_MASK = UTRIE2_DATA_BLOCK_LENGTH - 1;
  var UTRIE2_LSCP_INDEX_2_LENGTH = 0x400 >> UTRIE2_SHIFT_2;
  /** Count the lengths of both BMP pieces. 2080=0x820 */
  var UTRIE2_INDEX_2_BMP_LENGTH = UTRIE2_LSCP_INDEX_2_OFFSET + UTRIE2_LSCP_INDEX_2_LENGTH;
  /**
   * The 2-byte UTF-8 version of the index-2 table follows at offset 2080=0x820.
   * Length 32=0x20 for lead bytes C0..DF, regardless of UTRIE2_SHIFT_2.
   */
  var UTRIE2_UTF8_2B_INDEX_2_OFFSET = UTRIE2_INDEX_2_BMP_LENGTH;
  var UTRIE2_UTF8_2B_INDEX_2_LENGTH = 0x800 >> 6; /* U+0800 is the first code point after 2-byte UTF-8 */
  /**
   * The index-1 table, only used for supplementary code points, at offset 2112=0x840.
   * Variable length, for code points up to highStart, where the last single-value range starts.
   * Maximum length 512=0x200=0x100000>>UTRIE2_SHIFT_1.
   * (For 0x100000 supplementary code points U+10000..U+10ffff.)
   *
   * The part of the index-2 table for supplementary code points starts
   * after this index-1 table.
   *
   * Both the index-1 table and the following part of the index-2 table
   * are omitted completely if there is only BMP data.
   */
  var UTRIE2_INDEX_1_OFFSET = UTRIE2_UTF8_2B_INDEX_2_OFFSET + UTRIE2_UTF8_2B_INDEX_2_LENGTH;
  /**
   * Number of index-1 entries for the BMP. 32=0x20
   * This part of the index-1 table is omitted from the serialized form.
   */
  var UTRIE2_OMITTED_BMP_INDEX_1_LENGTH = 0x10000 >> UTRIE2_SHIFT_1;
  /** Number of entries in an index-2 block. 64=0x40 */
  var UTRIE2_INDEX_2_BLOCK_LENGTH = 1 << UTRIE2_SHIFT_1_2;
  /** Mask for getting the lower bits for the in-index-2-block offset. */
  var UTRIE2_INDEX_2_MASK = UTRIE2_INDEX_2_BLOCK_LENGTH - 1;
  var slice16 = function slice16(view, start, end) {
    if (view.slice) {
      return view.slice(start, end);
    }
    return new Uint16Array(Array.prototype.slice.call(view, start, end));
  };
  var slice32 = function slice32(view, start, end) {
    if (view.slice) {
      return view.slice(start, end);
    }
    return new Uint32Array(Array.prototype.slice.call(view, start, end));
  };
  var createTrieFromBase64 = function createTrieFromBase64(base64, _byteLength) {
    var buffer = decode(base64);
    var view32 = Array.isArray(buffer) ? polyUint32Array(buffer) : new Uint32Array(buffer);
    var view16 = Array.isArray(buffer) ? polyUint16Array(buffer) : new Uint16Array(buffer);
    var headerLength = 24;
    var index = slice16(view16, headerLength / 2, view32[4] / 2);
    var data = view32[5] === 2 ? slice16(view16, (headerLength + view32[4]) / 2) : slice32(view32, Math.ceil((headerLength + view32[4]) / 4));
    return new Trie(view32[0], view32[1], view32[2], view32[3], index, data);
  };
  var Trie = /** @class */function () {
    function Trie(initialValue, errorValue, highStart, highValueIndex, index, data) {
      this.initialValue = initialValue;
      this.errorValue = errorValue;
      this.highStart = highStart;
      this.highValueIndex = highValueIndex;
      this.index = index;
      this.data = data;
    }
    /**
     * Get the value for a code point as stored in the Trie.
     *
     * @param codePoint the code point
     * @return the value
     */
    Trie.prototype.get = function (codePoint) {
      var ix;
      if (codePoint >= 0) {
        if (codePoint < 0x0d800 || codePoint > 0x0dbff && codePoint <= 0x0ffff) {
          // Ordinary BMP code point, excluding leading surrogates.
          // BMP uses a single level lookup.  BMP index starts at offset 0 in the Trie2 index.
          // 16 bit data is stored in the index array itself.
          ix = this.index[codePoint >> UTRIE2_SHIFT_2];
          ix = (ix << UTRIE2_INDEX_SHIFT) + (codePoint & UTRIE2_DATA_MASK);
          return this.data[ix];
        }
        if (codePoint <= 0xffff) {
          // Lead Surrogate Code Point.  A Separate index section is stored for
          // lead surrogate code units and code points.
          //   The main index has the code unit data.
          //   For this function, we need the code point data.
          // Note: this expression could be refactored for slightly improved efficiency, but
          //       surrogate code points will be so rare in practice that it's not worth it.
          ix = this.index[UTRIE2_LSCP_INDEX_2_OFFSET + (codePoint - 0xd800 >> UTRIE2_SHIFT_2)];
          ix = (ix << UTRIE2_INDEX_SHIFT) + (codePoint & UTRIE2_DATA_MASK);
          return this.data[ix];
        }
        if (codePoint < this.highStart) {
          // Supplemental code point, use two-level lookup.
          ix = UTRIE2_INDEX_1_OFFSET - UTRIE2_OMITTED_BMP_INDEX_1_LENGTH + (codePoint >> UTRIE2_SHIFT_1);
          ix = this.index[ix];
          ix += codePoint >> UTRIE2_SHIFT_2 & UTRIE2_INDEX_2_MASK;
          ix = this.index[ix];
          ix = (ix << UTRIE2_INDEX_SHIFT) + (codePoint & UTRIE2_DATA_MASK);
          return this.data[ix];
        }
        if (codePoint <= 0x10ffff) {
          return this.data[this.highValueIndex];
        }
      }
      // Fall through.  The code point is outside of the legal range of 0..0x10ffff.
      return this.errorValue;
    };
    return Trie;
  }();

  /*
   * base64-arraybuffer 1.0.2 <https://github.com/niklasvh/base64-arraybuffer>
   * Copyright (c) 2022 Niklas von Hertzen <https://hertzen.com>
   * Released under MIT License
   */
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  // Use a lookup table to find the index.
  var lookup = typeof Uint8Array === 'undefined' ? [] : new Uint8Array(256);
  for (var i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }
  var Prepend = 1;
  var CR = 2;
  var LF = 3;
  var Control = 4;
  var Extend = 5;
  var SpacingMark = 7;
  var L = 8;
  var V = 9;
  var T = 10;
  var LV = 11;
  var LVT = 12;
  var ZWJ = 13;
  var Extended_Pictographic = 14;
  var RI = 15;
  var toCodePoints = function toCodePoints(str) {
    var codePoints = [];
    var i = 0;
    var length = str.length;
    while (i < length) {
      var value = str.charCodeAt(i++);
      if (value >= 0xd800 && value <= 0xdbff && i < length) {
        var extra = str.charCodeAt(i++);
        if ((extra & 0xfc00) === 0xdc00) {
          codePoints.push(((value & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000);
        } else {
          codePoints.push(value);
          i--;
        }
      } else {
        codePoints.push(value);
      }
    }
    return codePoints;
  };
  var fromCodePoint = function fromCodePoint() {
    var codePoints = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      codePoints[_i] = arguments[_i];
    }
    if (String.fromCodePoint) {
      return String.fromCodePoint.apply(String, codePoints);
    }
    var length = codePoints.length;
    if (!length) {
      return '';
    }
    var codeUnits = [];
    var index = -1;
    var result = '';
    while (++index < length) {
      var codePoint = codePoints[index];
      if (codePoint <= 0xffff) {
        codeUnits.push(codePoint);
      } else {
        codePoint -= 0x10000;
        codeUnits.push((codePoint >> 10) + 0xd800, codePoint % 0x400 + 0xdc00);
      }
      if (index + 1 === length || codeUnits.length > 0x4000) {
        result += String.fromCharCode.apply(String, codeUnits);
        codeUnits.length = 0;
      }
    }
    return result;
  };
  var UnicodeTrie = createTrieFromBase64(base64);
  var BREAK_NOT_ALLOWED = '×';
  var BREAK_ALLOWED = '÷';
  var codePointToClass = function codePointToClass(codePoint) {
    return UnicodeTrie.get(codePoint);
  };
  var _graphemeBreakAtIndex = function _graphemeBreakAtIndex(_codePoints, classTypes, index) {
    var prevIndex = index - 2;
    var prev = classTypes[prevIndex];
    var current = classTypes[index - 1];
    var next = classTypes[index];
    // GB3 Do not break between a CR and LF
    if (current === CR && next === LF) {
      return BREAK_NOT_ALLOWED;
    }
    // GB4 Otherwise, break before and after controls.
    if (current === CR || current === LF || current === Control) {
      return BREAK_ALLOWED;
    }
    // GB5
    if (next === CR || next === LF || next === Control) {
      return BREAK_ALLOWED;
    }
    // Do not break Hangul syllable sequences.
    // GB6
    if (current === L && [L, V, LV, LVT].indexOf(next) !== -1) {
      return BREAK_NOT_ALLOWED;
    }
    // GB7
    if ((current === LV || current === V) && (next === V || next === T)) {
      return BREAK_NOT_ALLOWED;
    }
    // GB8
    if ((current === LVT || current === T) && next === T) {
      return BREAK_NOT_ALLOWED;
    }
    // GB9 Do not break before extending characters or ZWJ.
    if (next === ZWJ || next === Extend) {
      return BREAK_NOT_ALLOWED;
    }
    // Do not break before SpacingMarks, or after Prepend characters.
    // GB9a
    if (next === SpacingMark) {
      return BREAK_NOT_ALLOWED;
    }
    // GB9a
    if (current === Prepend) {
      return BREAK_NOT_ALLOWED;
    }
    // GB11 Do not break within emoji modifier sequences or emoji zwj sequences.
    if (current === ZWJ && next === Extended_Pictographic) {
      while (prev === Extend) {
        prev = classTypes[--prevIndex];
      }
      if (prev === Extended_Pictographic) {
        return BREAK_NOT_ALLOWED;
      }
    }
    // GB12 Do not break within emoji flag sequences.
    // That is, do not break between regional indicator (RI) symbols
    // if there is an odd number of RI characters before the break point.
    if (current === RI && next === RI) {
      var countRI = 0;
      while (prev === RI) {
        countRI++;
        prev = classTypes[--prevIndex];
      }
      if (countRI % 2 === 0) {
        return BREAK_NOT_ALLOWED;
      }
    }
    return BREAK_ALLOWED;
  };
  var GraphemeBreaker = function GraphemeBreaker(str) {
    var codePoints = toCodePoints(str);
    var length = codePoints.length;
    var index = 0;
    var lastEnd = 0;
    var classTypes = codePoints.map(codePointToClass);
    return {
      next: function next() {
        if (index >= length) {
          return {
            done: true,
            value: null
          };
        }
        var graphemeBreak = BREAK_NOT_ALLOWED;
        while (index < length && (graphemeBreak = _graphemeBreakAtIndex(codePoints, classTypes, ++index)) === BREAK_NOT_ALLOWED) {}
        if (graphemeBreak !== BREAK_NOT_ALLOWED || index === length) {
          var value = fromCodePoint.apply(null, codePoints.slice(lastEnd, index));
          lastEnd = index;
          return {
            value: value,
            done: false
          };
        }
        return {
          done: true,
          value: null
        };
      }
    };
  };
  var splitGraphemes = function splitGraphemes(str) {
    var breaker = GraphemeBreaker(str);
    var graphemes = [];
    var bk;
    while (!(bk = breaker.next()).done) {
      if (bk.value) {
        graphemes.push(bk.value.slice());
      }
    }
    return graphemes;
  };
  var testRangeBounds = function testRangeBounds(document) {
    var TEST_HEIGHT = 123;
    if (document.createRange) {
      var range = document.createRange();
      if (range.getBoundingClientRect) {
        var testElement = document.createElement('boundtest');
        testElement.style.height = TEST_HEIGHT + "px";
        testElement.style.display = 'block';
        document.body.appendChild(testElement);
        range.selectNode(testElement);
        var rangeBounds = range.getBoundingClientRect();
        var rangeHeight = Math.round(rangeBounds.height);
        document.body.removeChild(testElement);
        if (rangeHeight === TEST_HEIGHT) {
          return true;
        }
      }
    }
    return false;
  };
  var testIOSLineBreak = function testIOSLineBreak(document) {
    var testElement = document.createElement('boundtest');
    testElement.style.width = '50px';
    testElement.style.display = 'block';
    testElement.style.fontSize = '12px';
    testElement.style.letterSpacing = '0px';
    testElement.style.wordSpacing = '0px';
    document.body.appendChild(testElement);
    var range = document.createRange();
    testElement.innerHTML = typeof ''.repeat === 'function' ? '&#128104;'.repeat(10) : '';
    var node = testElement.firstChild;
    var textList = toCodePoints$1(node.data).map(function (i) {
      return fromCodePoint$1(i);
    });
    var offset = 0;
    var prev = {};
    // ios 13 does not handle range getBoundingClientRect line changes correctly #2177
    var supports = textList.every(function (text, i) {
      range.setStart(node, offset);
      range.setEnd(node, offset + text.length);
      var rect = range.getBoundingClientRect();
      offset += text.length;
      var boundAhead = rect.x > prev.x || rect.y > prev.y;
      prev = rect;
      if (i === 0) {
        return true;
      }
      return boundAhead;
    });
    document.body.removeChild(testElement);
    return supports;
  };
  var testCORS = function testCORS() {
    return typeof new Image().crossOrigin !== 'undefined';
  };
  var testResponseType = function testResponseType() {
    return typeof new XMLHttpRequest().responseType === 'string';
  };
  var testSVG = function testSVG(document) {
    var img = new Image();
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    if (!ctx) {
      return false;
    }
    img.src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'></svg>";
    try {
      ctx.drawImage(img, 0, 0);
      canvas.toDataURL();
    } catch (e) {
      return false;
    }
    return true;
  };
  var isGreenPixel = function isGreenPixel(data) {
    return data[0] === 0 && data[1] === 255 && data[2] === 0 && data[3] === 255;
  };
  var testForeignObject = function testForeignObject(document) {
    var canvas = document.createElement('canvas');
    var size = 100;
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext('2d');
    if (!ctx) {
      return Promise.reject(false);
    }
    ctx.fillStyle = 'rgb(0, 255, 0)';
    ctx.fillRect(0, 0, size, size);
    var img = new Image();
    var greenImageSrc = canvas.toDataURL();
    img.src = greenImageSrc;
    var svg = createForeignObjectSVG(size, size, 0, 0, img);
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, size, size);
    return loadSerializedSVG$1(svg).then(function (img) {
      ctx.drawImage(img, 0, 0);
      var data = ctx.getImageData(0, 0, size, size).data;
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, size, size);
      var node = document.createElement('div');
      node.style.backgroundImage = "url(" + greenImageSrc + ")";
      node.style.height = size + "px";
      // Firefox 55 does not render inline <img /> tags
      return isGreenPixel(data) ? loadSerializedSVG$1(createForeignObjectSVG(size, size, 0, 0, node)) : Promise.reject(false);
    }).then(function (img) {
      ctx.drawImage(img, 0, 0);
      // Edge does not render background-images
      return isGreenPixel(ctx.getImageData(0, 0, size, size).data);
    }).catch(function () {
      return false;
    });
  };
  var createForeignObjectSVG = function createForeignObjectSVG(width, height, x, y, node) {
    var xmlns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(xmlns, 'svg');
    var foreignObject = document.createElementNS(xmlns, 'foreignObject');
    svg.setAttributeNS(null, 'width', width.toString());
    svg.setAttributeNS(null, 'height', height.toString());
    foreignObject.setAttributeNS(null, 'width', '100%');
    foreignObject.setAttributeNS(null, 'height', '100%');
    foreignObject.setAttributeNS(null, 'x', x.toString());
    foreignObject.setAttributeNS(null, 'y', y.toString());
    foreignObject.setAttributeNS(null, 'externalResourcesRequired', 'true');
    svg.appendChild(foreignObject);
    foreignObject.appendChild(node);
    return svg;
  };
  var loadSerializedSVG$1 = function loadSerializedSVG$1(svg) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        return resolve(img);
      };
      img.onerror = reject;
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(svg));
    });
  };
  var FEATURES = {
    get SUPPORT_RANGE_BOUNDS() {
      var value = testRangeBounds(document);
      Object.defineProperty(FEATURES, 'SUPPORT_RANGE_BOUNDS', {
        value: value
      });
      return value;
    },
    get SUPPORT_WORD_BREAKING() {
      var value = FEATURES.SUPPORT_RANGE_BOUNDS && testIOSLineBreak(document);
      Object.defineProperty(FEATURES, 'SUPPORT_WORD_BREAKING', {
        value: value
      });
      return value;
    },
    get SUPPORT_SVG_DRAWING() {
      var value = testSVG(document);
      Object.defineProperty(FEATURES, 'SUPPORT_SVG_DRAWING', {
        value: value
      });
      return value;
    },
    get SUPPORT_FOREIGNOBJECT_DRAWING() {
      var value = typeof Array.from === 'function' && typeof window.fetch === 'function' ? testForeignObject(document) : Promise.resolve(false);
      Object.defineProperty(FEATURES, 'SUPPORT_FOREIGNOBJECT_DRAWING', {
        value: value
      });
      return value;
    },
    get SUPPORT_CORS_IMAGES() {
      var value = testCORS();
      Object.defineProperty(FEATURES, 'SUPPORT_CORS_IMAGES', {
        value: value
      });
      return value;
    },
    get SUPPORT_RESPONSE_TYPE() {
      var value = testResponseType();
      Object.defineProperty(FEATURES, 'SUPPORT_RESPONSE_TYPE', {
        value: value
      });
      return value;
    },
    get SUPPORT_CORS_XHR() {
      var value = ('withCredentials' in new XMLHttpRequest());
      Object.defineProperty(FEATURES, 'SUPPORT_CORS_XHR', {
        value: value
      });
      return value;
    },
    get SUPPORT_NATIVE_TEXT_SEGMENTATION() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      var value = !!(typeof Intl !== 'undefined' && Intl.Segmenter);
      Object.defineProperty(FEATURES, 'SUPPORT_NATIVE_TEXT_SEGMENTATION', {
        value: value
      });
      return value;
    }
  };
  var TextBounds = /** @class */function () {
    function TextBounds(text, bounds) {
      this.text = text;
      this.bounds = bounds;
    }
    return TextBounds;
  }();
  var parseTextBounds = function parseTextBounds(context, value, styles, node) {
    var textList = breakText(value, styles);
    var textBounds = [];
    var offset = 0;
    textList.forEach(function (text) {
      if (styles.textDecorationLine.length || text.trim().length > 0) {
        if (FEATURES.SUPPORT_RANGE_BOUNDS) {
          var clientRects = createRange(node, offset, text.length).getClientRects();
          if (clientRects.length > 1) {
            var subSegments = segmentGraphemes(text);
            var subOffset_1 = 0;
            subSegments.forEach(function (subSegment) {
              textBounds.push(new TextBounds(subSegment, Bounds.fromDOMRectList(context, createRange(node, subOffset_1 + offset, subSegment.length).getClientRects())));
              subOffset_1 += subSegment.length;
            });
          } else {
            textBounds.push(new TextBounds(text, Bounds.fromDOMRectList(context, clientRects)));
          }
        } else {
          var replacementNode = node.splitText(text.length);
          textBounds.push(new TextBounds(text, getWrapperBounds(context, node)));
          node = replacementNode;
        }
      } else if (!FEATURES.SUPPORT_RANGE_BOUNDS) {
        node = node.splitText(text.length);
      }
      offset += text.length;
    });
    return textBounds;
  };
  var getWrapperBounds = function getWrapperBounds(context, node) {
    var ownerDocument = node.ownerDocument;
    if (ownerDocument) {
      var wrapper = ownerDocument.createElement('html2canvaswrapper');
      wrapper.appendChild(node.cloneNode(true));
      var parentNode = node.parentNode;
      if (parentNode) {
        parentNode.replaceChild(wrapper, node);
        var bounds = parseBounds(context, wrapper);
        if (wrapper.firstChild) {
          parentNode.replaceChild(wrapper.firstChild, wrapper);
        }
        return bounds;
      }
    }
    return Bounds.EMPTY;
  };
  var createRange = function createRange(node, offset, length) {
    var ownerDocument = node.ownerDocument;
    if (!ownerDocument) {
      throw new Error('Node has no owner document');
    }
    var range = ownerDocument.createRange();
    range.setStart(node, offset);
    range.setEnd(node, offset + length);
    return range;
  };
  var segmentGraphemes = function segmentGraphemes(value) {
    if (FEATURES.SUPPORT_NATIVE_TEXT_SEGMENTATION) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      var segmenter = new Intl.Segmenter(void 0, {
        granularity: 'grapheme'
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return Array.from(segmenter.segment(value)).map(function (segment) {
        return segment.segment;
      });
    }
    return splitGraphemes(value);
  };
  var segmentWords = function segmentWords(value, styles) {
    if (FEATURES.SUPPORT_NATIVE_TEXT_SEGMENTATION) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      var segmenter = new Intl.Segmenter(void 0, {
        granularity: 'word'
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return Array.from(segmenter.segment(value)).map(function (segment) {
        return segment.segment;
      });
    }
    return breakWords(value, styles);
  };
  var breakText = function breakText(value, styles) {
    return styles.letterSpacing !== 0 ? segmentGraphemes(value) : segmentWords(value, styles);
  };
  // https://drafts.csswg.org/css-text/#word-separator
  var wordSeparators = [0x0020, 0x00a0, 0x1361, 0x10100, 0x10101, 0x1039, 0x1091];
  var breakWords = function breakWords(str, styles) {
    var breaker = LineBreaker(str, {
      lineBreak: styles.lineBreak,
      wordBreak: styles.overflowWrap === "break-word" /* BREAK_WORD */ ? 'break-word' : styles.wordBreak
    });
    var words = [];
    var bk;
    var _loop_1 = function _loop_1() {
      if (bk.value) {
        var value = bk.value.slice();
        var codePoints = toCodePoints$1(value);
        var word_1 = '';
        codePoints.forEach(function (codePoint) {
          if (wordSeparators.indexOf(codePoint) === -1) {
            word_1 += fromCodePoint$1(codePoint);
          } else {
            if (word_1.length) {
              words.push(word_1);
            }
            words.push(fromCodePoint$1(codePoint));
            word_1 = '';
          }
        });
        if (word_1.length) {
          words.push(word_1);
        }
      }
    };
    while (!(bk = breaker.next()).done) {
      _loop_1();
    }
    return words;
  };
  var TextContainer = /** @class */function () {
    function TextContainer(context, node, styles) {
      this.text = transform(node.data, styles.textTransform);
      this.textBounds = parseTextBounds(context, this.text, styles, node);
    }
    return TextContainer;
  }();
  var transform = function transform(text, _transform) {
    switch (_transform) {
      case 1 /* LOWERCASE */:
        return text.toLowerCase();
      case 3 /* CAPITALIZE */:
        return text.replace(CAPITALIZE, capitalize);
      case 2 /* UPPERCASE */:
        return text.toUpperCase();
      default:
        return text;
    }
  };
  var CAPITALIZE = /(^|\s|:|-|\(|\))([a-z])/g;
  var capitalize = function capitalize(m, p1, p2) {
    if (m.length > 0) {
      return p1 + p2.toUpperCase();
    }
    return m;
  };
  var ImageElementContainer = /** @class */function (_super) {
    __extends(ImageElementContainer, _super);
    function ImageElementContainer(context, img) {
      var _this = _super.call(this, context, img) || this;
      _this.src = img.currentSrc || img.src;
      _this.intrinsicWidth = img.naturalWidth;
      _this.intrinsicHeight = img.naturalHeight;
      _this.context.cache.addImage(_this.src);
      return _this;
    }
    return ImageElementContainer;
  }(ElementContainer);
  var CanvasElementContainer = /** @class */function (_super) {
    __extends(CanvasElementContainer, _super);
    function CanvasElementContainer(context, canvas) {
      var _this = _super.call(this, context, canvas) || this;
      _this.canvas = canvas;
      _this.intrinsicWidth = canvas.width;
      _this.intrinsicHeight = canvas.height;
      return _this;
    }
    return CanvasElementContainer;
  }(ElementContainer);
  var SVGElementContainer = /** @class */function (_super) {
    __extends(SVGElementContainer, _super);
    function SVGElementContainer(context, img) {
      var _this = _super.call(this, context, img) || this;
      var s = new XMLSerializer();
      var bounds = parseBounds(context, img);
      img.setAttribute('width', bounds.width + "px");
      img.setAttribute('height', bounds.height + "px");
      _this.svg = "data:image/svg+xml," + encodeURIComponent(s.serializeToString(img));
      _this.intrinsicWidth = img.width.baseVal.value;
      _this.intrinsicHeight = img.height.baseVal.value;
      _this.context.cache.addImage(_this.svg);
      return _this;
    }
    return SVGElementContainer;
  }(ElementContainer);
  var LIElementContainer = /** @class */function (_super) {
    __extends(LIElementContainer, _super);
    function LIElementContainer(context, element) {
      var _this = _super.call(this, context, element) || this;
      _this.value = element.value;
      return _this;
    }
    return LIElementContainer;
  }(ElementContainer);
  var OLElementContainer = /** @class */function (_super) {
    __extends(OLElementContainer, _super);
    function OLElementContainer(context, element) {
      var _this = _super.call(this, context, element) || this;
      _this.start = element.start;
      _this.reversed = typeof element.reversed === 'boolean' && element.reversed === true;
      return _this;
    }
    return OLElementContainer;
  }(ElementContainer);
  var CHECKBOX_BORDER_RADIUS = [{
    type: 15 /* DIMENSION_TOKEN */,
    flags: 0,
    unit: 'px',
    number: 3
  }];
  var RADIO_BORDER_RADIUS = [{
    type: 16 /* PERCENTAGE_TOKEN */,
    flags: 0,
    number: 50
  }];
  var reformatInputBounds = function reformatInputBounds(bounds) {
    if (bounds.width > bounds.height) {
      return new Bounds(bounds.left + (bounds.width - bounds.height) / 2, bounds.top, bounds.height, bounds.height);
    } else if (bounds.width < bounds.height) {
      return new Bounds(bounds.left, bounds.top + (bounds.height - bounds.width) / 2, bounds.width, bounds.width);
    }
    return bounds;
  };
  var getInputValue = function getInputValue(node) {
    var value = node.type === PASSWORD ? new Array(node.value.length + 1).join("\u2022") : node.value;
    return value.length === 0 ? node.placeholder || '' : value;
  };
  var CHECKBOX = 'checkbox';
  var RADIO = 'radio';
  var PASSWORD = 'password';
  var INPUT_COLOR = 0x2a2a2aff;
  var InputElementContainer = /** @class */function (_super) {
    __extends(InputElementContainer, _super);
    function InputElementContainer(context, input) {
      var _this = _super.call(this, context, input) || this;
      _this.type = input.type.toLowerCase();
      _this.checked = input.checked;
      _this.value = getInputValue(input);
      if (_this.type === CHECKBOX || _this.type === RADIO) {
        _this.styles.backgroundColor = 0xdededeff;
        _this.styles.borderTopColor = _this.styles.borderRightColor = _this.styles.borderBottomColor = _this.styles.borderLeftColor = 0xa5a5a5ff;
        _this.styles.borderTopWidth = _this.styles.borderRightWidth = _this.styles.borderBottomWidth = _this.styles.borderLeftWidth = 1;
        _this.styles.borderTopStyle = _this.styles.borderRightStyle = _this.styles.borderBottomStyle = _this.styles.borderLeftStyle = 1 /* SOLID */;
        _this.styles.backgroundClip = [0 /* BORDER_BOX */];
        _this.styles.backgroundOrigin = [0 /* BORDER_BOX */];
        _this.bounds = reformatInputBounds(_this.bounds);
      }
      switch (_this.type) {
        case CHECKBOX:
          _this.styles.borderTopRightRadius = _this.styles.borderTopLeftRadius = _this.styles.borderBottomRightRadius = _this.styles.borderBottomLeftRadius = CHECKBOX_BORDER_RADIUS;
          break;
        case RADIO:
          _this.styles.borderTopRightRadius = _this.styles.borderTopLeftRadius = _this.styles.borderBottomRightRadius = _this.styles.borderBottomLeftRadius = RADIO_BORDER_RADIUS;
          break;
      }
      return _this;
    }
    return InputElementContainer;
  }(ElementContainer);
  var SelectElementContainer = /** @class */function (_super) {
    __extends(SelectElementContainer, _super);
    function SelectElementContainer(context, element) {
      var _this = _super.call(this, context, element) || this;
      var option = element.options[element.selectedIndex || 0];
      _this.value = option ? option.text || '' : '';
      return _this;
    }
    return SelectElementContainer;
  }(ElementContainer);
  var TextareaElementContainer = /** @class */function (_super) {
    __extends(TextareaElementContainer, _super);
    function TextareaElementContainer(context, element) {
      var _this = _super.call(this, context, element) || this;
      _this.value = element.value;
      return _this;
    }
    return TextareaElementContainer;
  }(ElementContainer);
  var IFrameElementContainer = /** @class */function (_super) {
    __extends(IFrameElementContainer, _super);
    function IFrameElementContainer(context, iframe) {
      var _this = _super.call(this, context, iframe) || this;
      _this.src = iframe.src;
      _this.width = parseInt(iframe.width, 10) || 0;
      _this.height = parseInt(iframe.height, 10) || 0;
      _this.backgroundColor = _this.styles.backgroundColor;
      try {
        if (iframe.contentWindow && iframe.contentWindow.document && iframe.contentWindow.document.documentElement) {
          _this.tree = parseTree(context, iframe.contentWindow.document.documentElement);
          // http://www.w3.org/TR/css3-background/#special-backgrounds
          var documentBackgroundColor = iframe.contentWindow.document.documentElement ? parseColor(context, getComputedStyle(iframe.contentWindow.document.documentElement).backgroundColor) : COLORS.TRANSPARENT;
          var bodyBackgroundColor = iframe.contentWindow.document.body ? parseColor(context, getComputedStyle(iframe.contentWindow.document.body).backgroundColor) : COLORS.TRANSPARENT;
          _this.backgroundColor = isTransparent(documentBackgroundColor) ? isTransparent(bodyBackgroundColor) ? _this.styles.backgroundColor : bodyBackgroundColor : documentBackgroundColor;
        }
      } catch (e) {}
      return _this;
    }
    return IFrameElementContainer;
  }(ElementContainer);
  var LIST_OWNERS = ['OL', 'UL', 'MENU'];
  var parseNodeTree = function parseNodeTree(context, node, parent, root) {
    for (var childNode = node.firstChild, nextNode = void 0; childNode; childNode = nextNode) {
      nextNode = childNode.nextSibling;
      if (isTextNode(childNode) && childNode.data.trim().length > 0) {
        parent.textNodes.push(new TextContainer(context, childNode, parent.styles));
      } else if (isElementNode(childNode)) {
        if (isSlotElement(childNode) && childNode.assignedNodes) {
          childNode.assignedNodes().forEach(function (childNode) {
            return parseNodeTree(context, childNode, parent, root);
          });
        } else {
          var container = createContainer(context, childNode);
          if (container.styles.isVisible()) {
            if (createsRealStackingContext(childNode, container, root)) {
              container.flags |= 4 /* CREATES_REAL_STACKING_CONTEXT */;
            } else if (createsStackingContext(container.styles)) {
              container.flags |= 2 /* CREATES_STACKING_CONTEXT */;
            }

            if (LIST_OWNERS.indexOf(childNode.tagName) !== -1) {
              container.flags |= 8 /* IS_LIST_OWNER */;
            }

            parent.elements.push(container);
            childNode.slot;
            if (childNode.shadowRoot) {
              parseNodeTree(context, childNode.shadowRoot, container, root);
            } else if (!isTextareaElement(childNode) && !isSVGElement(childNode) && !isSelectElement(childNode)) {
              parseNodeTree(context, childNode, container, root);
            }
          }
        }
      }
    }
  };
  var createContainer = function createContainer(context, element) {
    if (isImageElement(element)) {
      return new ImageElementContainer(context, element);
    }
    if (isCanvasElement(element)) {
      return new CanvasElementContainer(context, element);
    }
    if (isSVGElement(element)) {
      return new SVGElementContainer(context, element);
    }
    if (isLIElement(element)) {
      return new LIElementContainer(context, element);
    }
    if (isOLElement(element)) {
      return new OLElementContainer(context, element);
    }
    if (isInputElement(element)) {
      return new InputElementContainer(context, element);
    }
    if (isSelectElement(element)) {
      return new SelectElementContainer(context, element);
    }
    if (isTextareaElement(element)) {
      return new TextareaElementContainer(context, element);
    }
    if (isIFrameElement(element)) {
      return new IFrameElementContainer(context, element);
    }
    return new ElementContainer(context, element);
  };
  var parseTree = function parseTree(context, element) {
    var container = createContainer(context, element);
    container.flags |= 4 /* CREATES_REAL_STACKING_CONTEXT */;
    parseNodeTree(context, element, container, container);
    return container;
  };
  var createsRealStackingContext = function createsRealStackingContext(node, container, root) {
    return container.styles.isPositionedWithZIndex() || container.styles.opacity < 1 || container.styles.isTransformed() || isBodyElement(node) && root.styles.isTransparent();
  };
  var createsStackingContext = function createsStackingContext(styles) {
    return styles.isPositioned() || styles.isFloating();
  };
  var isTextNode = function isTextNode(node) {
    return node.nodeType === Node.TEXT_NODE;
  };
  var isElementNode = function isElementNode(node) {
    return node.nodeType === Node.ELEMENT_NODE;
  };
  var isHTMLElementNode = function isHTMLElementNode(node) {
    return isElementNode(node) && typeof node.style !== 'undefined' && !isSVGElementNode(node);
  };
  var isSVGElementNode = function isSVGElementNode(element) {
    return _typeof(element.className) === 'object';
  };
  var isLIElement = function isLIElement(node) {
    return node.tagName === 'LI';
  };
  var isOLElement = function isOLElement(node) {
    return node.tagName === 'OL';
  };
  var isInputElement = function isInputElement(node) {
    return node.tagName === 'INPUT';
  };
  var isHTMLElement = function isHTMLElement(node) {
    return node.tagName === 'HTML';
  };
  var isSVGElement = function isSVGElement(node) {
    return node.tagName === 'svg';
  };
  var isBodyElement = function isBodyElement(node) {
    return node.tagName === 'BODY';
  };
  var isCanvasElement = function isCanvasElement(node) {
    return node.tagName === 'CANVAS';
  };
  var isVideoElement = function isVideoElement(node) {
    return node.tagName === 'VIDEO';
  };
  var isImageElement = function isImageElement(node) {
    return node.tagName === 'IMG';
  };
  var isIFrameElement = function isIFrameElement(node) {
    return node.tagName === 'IFRAME';
  };
  var isStyleElement = function isStyleElement(node) {
    return node.tagName === 'STYLE';
  };
  var isScriptElement = function isScriptElement(node) {
    return node.tagName === 'SCRIPT';
  };
  var isTextareaElement = function isTextareaElement(node) {
    return node.tagName === 'TEXTAREA';
  };
  var isSelectElement = function isSelectElement(node) {
    return node.tagName === 'SELECT';
  };
  var isSlotElement = function isSlotElement(node) {
    return node.tagName === 'SLOT';
  };
  // https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
  var isCustomElement = function isCustomElement(node) {
    return node.tagName.indexOf('-') > 0;
  };
  var CounterState = /** @class */function () {
    function CounterState() {
      this.counters = {};
    }
    CounterState.prototype.getCounterValue = function (name) {
      var counter = this.counters[name];
      if (counter && counter.length) {
        return counter[counter.length - 1];
      }
      return 1;
    };
    CounterState.prototype.getCounterValues = function (name) {
      var counter = this.counters[name];
      return counter ? counter : [];
    };
    CounterState.prototype.pop = function (counters) {
      var _this = this;
      counters.forEach(function (counter) {
        return _this.counters[counter].pop();
      });
    };
    CounterState.prototype.parse = function (style) {
      var _this = this;
      var counterIncrement = style.counterIncrement;
      var counterReset = style.counterReset;
      var canReset = true;
      if (counterIncrement !== null) {
        counterIncrement.forEach(function (entry) {
          var counter = _this.counters[entry.counter];
          if (counter && entry.increment !== 0) {
            canReset = false;
            if (!counter.length) {
              counter.push(1);
            }
            counter[Math.max(0, counter.length - 1)] += entry.increment;
          }
        });
      }
      var counterNames = [];
      if (canReset) {
        counterReset.forEach(function (entry) {
          var counter = _this.counters[entry.counter];
          counterNames.push(entry.counter);
          if (!counter) {
            counter = _this.counters[entry.counter] = [];
          }
          counter.push(entry.reset);
        });
      }
      return counterNames;
    };
    return CounterState;
  }();
  var ROMAN_UPPER = {
    integers: [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1],
    values: ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I']
  };
  var ARMENIAN = {
    integers: [9000, 8000, 7000, 6000, 5000, 4000, 3000, 2000, 1000, 900, 800, 700, 600, 500, 400, 300, 200, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    values: ['Ք', 'Փ', 'Ւ', 'Ց', 'Ր', 'Տ', 'Վ', 'Ս', 'Ռ', 'Ջ', 'Պ', 'Չ', 'Ո', 'Շ', 'Ն', 'Յ', 'Մ', 'Ճ', 'Ղ', 'Ձ', 'Հ', 'Կ', 'Ծ', 'Խ', 'Լ', 'Ի', 'Ժ', 'Թ', 'Ը', 'Է', 'Զ', 'Ե', 'Դ', 'Գ', 'Բ', 'Ա']
  };
  var HEBREW = {
    integers: [10000, 9000, 8000, 7000, 6000, 5000, 4000, 3000, 2000, 1000, 400, 300, 200, 100, 90, 80, 70, 60, 50, 40, 30, 20, 19, 18, 17, 16, 15, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    values: ['י׳', 'ט׳', 'ח׳', 'ז׳', 'ו׳', 'ה׳', 'ד׳', 'ג׳', 'ב׳', 'א׳', 'ת', 'ש', 'ר', 'ק', 'צ', 'פ', 'ע', 'ס', 'נ', 'מ', 'ל', 'כ', 'יט', 'יח', 'יז', 'טז', 'טו', 'י', 'ט', 'ח', 'ז', 'ו', 'ה', 'ד', 'ג', 'ב', 'א']
  };
  var GEORGIAN = {
    integers: [10000, 9000, 8000, 7000, 6000, 5000, 4000, 3000, 2000, 1000, 900, 800, 700, 600, 500, 400, 300, 200, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    values: ['ჵ', 'ჰ', 'ჯ', 'ჴ', 'ხ', 'ჭ', 'წ', 'ძ', 'ც', 'ჩ', 'შ', 'ყ', 'ღ', 'ქ', 'ფ', 'ჳ', 'ტ', 'ს', 'რ', 'ჟ', 'პ', 'ო', 'ჲ', 'ნ', 'მ', 'ლ', 'კ', 'ი', 'თ', 'ჱ', 'ზ', 'ვ', 'ე', 'დ', 'გ', 'ბ', 'ა']
  };
  var createAdditiveCounter = function createAdditiveCounter(value, min, max, symbols, fallback, suffix) {
    if (value < min || value > max) {
      return createCounterText(value, fallback, suffix.length > 0);
    }
    return symbols.integers.reduce(function (string, integer, index) {
      while (value >= integer) {
        value -= integer;
        string += symbols.values[index];
      }
      return string;
    }, '') + suffix;
  };
  var createCounterStyleWithSymbolResolver = function createCounterStyleWithSymbolResolver(value, codePointRangeLength, isNumeric, resolver) {
    var string = '';
    do {
      if (!isNumeric) {
        value--;
      }
      string = resolver(value) + string;
      value /= codePointRangeLength;
    } while (value * codePointRangeLength >= codePointRangeLength);
    return string;
  };
  var createCounterStyleFromRange = function createCounterStyleFromRange(value, codePointRangeStart, codePointRangeEnd, isNumeric, suffix) {
    var codePointRangeLength = codePointRangeEnd - codePointRangeStart + 1;
    return (value < 0 ? '-' : '') + (createCounterStyleWithSymbolResolver(Math.abs(value), codePointRangeLength, isNumeric, function (codePoint) {
      return fromCodePoint$1(Math.floor(codePoint % codePointRangeLength) + codePointRangeStart);
    }) + suffix);
  };
  var createCounterStyleFromSymbols = function createCounterStyleFromSymbols(value, symbols, suffix) {
    if (suffix === void 0) {
      suffix = '. ';
    }
    var codePointRangeLength = symbols.length;
    return createCounterStyleWithSymbolResolver(Math.abs(value), codePointRangeLength, false, function (codePoint) {
      return symbols[Math.floor(codePoint % codePointRangeLength)];
    }) + suffix;
  };
  var CJK_ZEROS = 1 << 0;
  var CJK_TEN_COEFFICIENTS = 1 << 1;
  var CJK_TEN_HIGH_COEFFICIENTS = 1 << 2;
  var CJK_HUNDRED_COEFFICIENTS = 1 << 3;
  var createCJKCounter = function createCJKCounter(value, numbers, multipliers, negativeSign, suffix, flags) {
    if (value < -9999 || value > 9999) {
      return createCounterText(value, 4 /* CJK_DECIMAL */, suffix.length > 0);
    }
    var tmp = Math.abs(value);
    var string = suffix;
    if (tmp === 0) {
      return numbers[0] + string;
    }
    for (var digit = 0; tmp > 0 && digit <= 4; digit++) {
      var coefficient = tmp % 10;
      if (coefficient === 0 && contains(flags, CJK_ZEROS) && string !== '') {
        string = numbers[coefficient] + string;
      } else if (coefficient > 1 || coefficient === 1 && digit === 0 || coefficient === 1 && digit === 1 && contains(flags, CJK_TEN_COEFFICIENTS) || coefficient === 1 && digit === 1 && contains(flags, CJK_TEN_HIGH_COEFFICIENTS) && value > 100 || coefficient === 1 && digit > 1 && contains(flags, CJK_HUNDRED_COEFFICIENTS)) {
        string = numbers[coefficient] + (digit > 0 ? multipliers[digit - 1] : '') + string;
      } else if (coefficient === 1 && digit > 0) {
        string = multipliers[digit - 1] + string;
      }
      tmp = Math.floor(tmp / 10);
    }
    return (value < 0 ? negativeSign : '') + string;
  };
  var CHINESE_INFORMAL_MULTIPLIERS = '十百千萬';
  var CHINESE_FORMAL_MULTIPLIERS = '拾佰仟萬';
  var JAPANESE_NEGATIVE = 'マイナス';
  var KOREAN_NEGATIVE = '마이너스';
  var createCounterText = function createCounterText(value, type, appendSuffix) {
    var defaultSuffix = appendSuffix ? '. ' : '';
    var cjkSuffix = appendSuffix ? '、' : '';
    var koreanSuffix = appendSuffix ? ', ' : '';
    var spaceSuffix = appendSuffix ? ' ' : '';
    switch (type) {
      case 0 /* DISC */:
        return '•' + spaceSuffix;
      case 1 /* CIRCLE */:
        return '◦' + spaceSuffix;
      case 2 /* SQUARE */:
        return '◾' + spaceSuffix;
      case 5 /* DECIMAL_LEADING_ZERO */:
        var string = createCounterStyleFromRange(value, 48, 57, true, defaultSuffix);
        return string.length < 4 ? "0" + string : string;
      case 4 /* CJK_DECIMAL */:
        return createCounterStyleFromSymbols(value, '〇一二三四五六七八九', cjkSuffix);
      case 6 /* LOWER_ROMAN */:
        return createAdditiveCounter(value, 1, 3999, ROMAN_UPPER, 3 /* DECIMAL */, defaultSuffix).toLowerCase();
      case 7 /* UPPER_ROMAN */:
        return createAdditiveCounter(value, 1, 3999, ROMAN_UPPER, 3 /* DECIMAL */, defaultSuffix);
      case 8 /* LOWER_GREEK */:
        return createCounterStyleFromRange(value, 945, 969, false, defaultSuffix);
      case 9 /* LOWER_ALPHA */:
        return createCounterStyleFromRange(value, 97, 122, false, defaultSuffix);
      case 10 /* UPPER_ALPHA */:
        return createCounterStyleFromRange(value, 65, 90, false, defaultSuffix);
      case 11 /* ARABIC_INDIC */:
        return createCounterStyleFromRange(value, 1632, 1641, true, defaultSuffix);
      case 12 /* ARMENIAN */:
      case 49 /* UPPER_ARMENIAN */:
        return createAdditiveCounter(value, 1, 9999, ARMENIAN, 3 /* DECIMAL */, defaultSuffix);
      case 35 /* LOWER_ARMENIAN */:
        return createAdditiveCounter(value, 1, 9999, ARMENIAN, 3 /* DECIMAL */, defaultSuffix).toLowerCase();
      case 13 /* BENGALI */:
        return createCounterStyleFromRange(value, 2534, 2543, true, defaultSuffix);
      case 14 /* CAMBODIAN */:
      case 30 /* KHMER */:
        return createCounterStyleFromRange(value, 6112, 6121, true, defaultSuffix);
      case 15 /* CJK_EARTHLY_BRANCH */:
        return createCounterStyleFromSymbols(value, '子丑寅卯辰巳午未申酉戌亥', cjkSuffix);
      case 16 /* CJK_HEAVENLY_STEM */:
        return createCounterStyleFromSymbols(value, '甲乙丙丁戊己庚辛壬癸', cjkSuffix);
      case 17 /* CJK_IDEOGRAPHIC */:
      case 48 /* TRAD_CHINESE_INFORMAL */:
        return createCJKCounter(value, '零一二三四五六七八九', CHINESE_INFORMAL_MULTIPLIERS, '負', cjkSuffix, CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS | CJK_HUNDRED_COEFFICIENTS);
      case 47 /* TRAD_CHINESE_FORMAL */:
        return createCJKCounter(value, '零壹貳參肆伍陸柒捌玖', CHINESE_FORMAL_MULTIPLIERS, '負', cjkSuffix, CJK_ZEROS | CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS | CJK_HUNDRED_COEFFICIENTS);
      case 42 /* SIMP_CHINESE_INFORMAL */:
        return createCJKCounter(value, '零一二三四五六七八九', CHINESE_INFORMAL_MULTIPLIERS, '负', cjkSuffix, CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS | CJK_HUNDRED_COEFFICIENTS);
      case 41 /* SIMP_CHINESE_FORMAL */:
        return createCJKCounter(value, '零壹贰叁肆伍陆柒捌玖', CHINESE_FORMAL_MULTIPLIERS, '负', cjkSuffix, CJK_ZEROS | CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS | CJK_HUNDRED_COEFFICIENTS);
      case 26 /* JAPANESE_INFORMAL */:
        return createCJKCounter(value, '〇一二三四五六七八九', '十百千万', JAPANESE_NEGATIVE, cjkSuffix, 0);
      case 25 /* JAPANESE_FORMAL */:
        return createCJKCounter(value, '零壱弐参四伍六七八九', '拾百千万', JAPANESE_NEGATIVE, cjkSuffix, CJK_ZEROS | CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS);
      case 31 /* KOREAN_HANGUL_FORMAL */:
        return createCJKCounter(value, '영일이삼사오육칠팔구', '십백천만', KOREAN_NEGATIVE, koreanSuffix, CJK_ZEROS | CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS);
      case 33 /* KOREAN_HANJA_INFORMAL */:
        return createCJKCounter(value, '零一二三四五六七八九', '十百千萬', KOREAN_NEGATIVE, koreanSuffix, 0);
      case 32 /* KOREAN_HANJA_FORMAL */:
        return createCJKCounter(value, '零壹貳參四五六七八九', '拾百千', KOREAN_NEGATIVE, koreanSuffix, CJK_ZEROS | CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS);
      case 18 /* DEVANAGARI */:
        return createCounterStyleFromRange(value, 0x966, 0x96f, true, defaultSuffix);
      case 20 /* GEORGIAN */:
        return createAdditiveCounter(value, 1, 19999, GEORGIAN, 3 /* DECIMAL */, defaultSuffix);
      case 21 /* GUJARATI */:
        return createCounterStyleFromRange(value, 0xae6, 0xaef, true, defaultSuffix);
      case 22 /* GURMUKHI */:
        return createCounterStyleFromRange(value, 0xa66, 0xa6f, true, defaultSuffix);
      case 22 /* HEBREW */:
        return createAdditiveCounter(value, 1, 10999, HEBREW, 3 /* DECIMAL */, defaultSuffix);
      case 23 /* HIRAGANA */:
        return createCounterStyleFromSymbols(value, 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわゐゑをん');
      case 24 /* HIRAGANA_IROHA */:
        return createCounterStyleFromSymbols(value, 'いろはにほへとちりぬるをわかよたれそつねならむうゐのおくやまけふこえてあさきゆめみしゑひもせす');
      case 27 /* KANNADA */:
        return createCounterStyleFromRange(value, 0xce6, 0xcef, true, defaultSuffix);
      case 28 /* KATAKANA */:
        return createCounterStyleFromSymbols(value, 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヰヱヲン', cjkSuffix);
      case 29 /* KATAKANA_IROHA */:
        return createCounterStyleFromSymbols(value, 'イロハニホヘトチリヌルヲワカヨタレソツネナラムウヰノオクヤマケフコエテアサキユメミシヱヒモセス', cjkSuffix);
      case 34 /* LAO */:
        return createCounterStyleFromRange(value, 0xed0, 0xed9, true, defaultSuffix);
      case 37 /* MONGOLIAN */:
        return createCounterStyleFromRange(value, 0x1810, 0x1819, true, defaultSuffix);
      case 38 /* MYANMAR */:
        return createCounterStyleFromRange(value, 0x1040, 0x1049, true, defaultSuffix);
      case 39 /* ORIYA */:
        return createCounterStyleFromRange(value, 0xb66, 0xb6f, true, defaultSuffix);
      case 40 /* PERSIAN */:
        return createCounterStyleFromRange(value, 0x6f0, 0x6f9, true, defaultSuffix);
      case 43 /* TAMIL */:
        return createCounterStyleFromRange(value, 0xbe6, 0xbef, true, defaultSuffix);
      case 44 /* TELUGU */:
        return createCounterStyleFromRange(value, 0xc66, 0xc6f, true, defaultSuffix);
      case 45 /* THAI */:
        return createCounterStyleFromRange(value, 0xe50, 0xe59, true, defaultSuffix);
      case 46 /* TIBETAN */:
        return createCounterStyleFromRange(value, 0xf20, 0xf29, true, defaultSuffix);
      case 3 /* DECIMAL */:
      default:
        return createCounterStyleFromRange(value, 48, 57, true, defaultSuffix);
    }
  };
  var IGNORE_ATTRIBUTE = 'data-html2canvas-ignore';
  var DocumentCloner = /** @class */function () {
    function DocumentCloner(context, element, options) {
      this.context = context;
      this.options = options;
      this.scrolledElements = [];
      this.referenceElement = element;
      this.counters = new CounterState();
      this.quoteDepth = 0;
      if (!element.ownerDocument) {
        throw new Error('Cloned element does not have an owner document');
      }
      this.documentElement = this.cloneNode(element.ownerDocument.documentElement, false);
    }
    DocumentCloner.prototype.toIFrame = function (ownerDocument, windowSize) {
      var _this = this;
      var iframe = createIFrameContainer(ownerDocument, windowSize);
      if (!iframe.contentWindow) {
        return Promise.reject("Unable to find iframe window");
      }
      var scrollX = ownerDocument.defaultView.pageXOffset;
      var scrollY = ownerDocument.defaultView.pageYOffset;
      var cloneWindow = iframe.contentWindow;
      var documentClone = cloneWindow.document;
      /* Chrome doesn't detect relative background-images assigned in inline <style> sheets when fetched through getComputedStyle
       if window url is about:blank, we can assign the url to current by writing onto the document
       */
      var iframeLoad = iframeLoader(iframe).then(function () {
        return __awaiter(_this, void 0, void 0, function () {
          var onclone, referenceElement;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                this.scrolledElements.forEach(restoreNodeScroll);
                if (cloneWindow) {
                  cloneWindow.scrollTo(windowSize.left, windowSize.top);
                  if (/(iPad|iPhone|iPod)/g.test(navigator.userAgent) && (cloneWindow.scrollY !== windowSize.top || cloneWindow.scrollX !== windowSize.left)) {
                    this.context.logger.warn('Unable to restore scroll position for cloned document');
                    this.context.windowBounds = this.context.windowBounds.add(cloneWindow.scrollX - windowSize.left, cloneWindow.scrollY - windowSize.top, 0, 0);
                  }
                }
                onclone = this.options.onclone;
                referenceElement = this.clonedReferenceElement;
                if (typeof referenceElement === 'undefined') {
                  return [2 /*return*/, Promise.reject("Error finding the " + this.referenceElement.nodeName + " in the cloned document")];
                }
                if (!(documentClone.fonts && documentClone.fonts.ready)) return [3 /*break*/, 2];
                return [4 /*yield*/, documentClone.fonts.ready];
              case 1:
                _a.sent();
                _a.label = 2;
              case 2:
                if (!/(AppleWebKit)/g.test(navigator.userAgent)) return [3 /*break*/, 4];
                return [4 /*yield*/, imagesReady(documentClone)];
              case 3:
                _a.sent();
                _a.label = 4;
              case 4:
                if (typeof onclone === 'function') {
                  return [2 /*return*/, Promise.resolve().then(function () {
                    return onclone(documentClone, referenceElement);
                  }).then(function () {
                    return iframe;
                  })];
                }
                return [2 /*return*/, iframe];
            }
          });
        });
      });
      documentClone.open();
      documentClone.write(serializeDoctype(document.doctype) + "<html></html>");
      // Chrome scrolls the parent document for some reason after the write to the cloned window???
      restoreOwnerScroll(this.referenceElement.ownerDocument, scrollX, scrollY);
      documentClone.replaceChild(documentClone.adoptNode(this.documentElement), documentClone.documentElement);
      documentClone.close();
      return iframeLoad;
    };
    DocumentCloner.prototype.createElementClone = function (node) {
      if (isDebugging(node, 2 /* CLONE */)) {
        debugger;
      }
      if (isCanvasElement(node)) {
        return this.createCanvasClone(node);
      }
      if (isVideoElement(node)) {
        return this.createVideoClone(node);
      }
      if (isStyleElement(node)) {
        return this.createStyleClone(node);
      }
      var clone = node.cloneNode(false);
      if (isImageElement(clone)) {
        if (isImageElement(node) && node.currentSrc && node.currentSrc !== node.src) {
          clone.src = node.currentSrc;
          clone.srcset = '';
        }
        if (clone.loading === 'lazy') {
          clone.loading = 'eager';
        }
      }
      if (isCustomElement(clone)) {
        return this.createCustomElementClone(clone);
      }
      return clone;
    };
    DocumentCloner.prototype.createCustomElementClone = function (node) {
      var clone = document.createElement('html2canvascustomelement');
      copyCSSStyles(node.style, clone);
      return clone;
    };
    DocumentCloner.prototype.createStyleClone = function (node) {
      try {
        var sheet = node.sheet;
        if (sheet && sheet.cssRules) {
          var css = [].slice.call(sheet.cssRules, 0).reduce(function (css, rule) {
            if (rule && typeof rule.cssText === 'string') {
              return css + rule.cssText;
            }
            return css;
          }, '');
          var style = node.cloneNode(false);
          style.textContent = css;
          return style;
        }
      } catch (e) {
        // accessing node.sheet.cssRules throws a DOMException
        this.context.logger.error('Unable to access cssRules property', e);
        if (e.name !== 'SecurityError') {
          throw e;
        }
      }
      return node.cloneNode(false);
    };
    DocumentCloner.prototype.createCanvasClone = function (canvas) {
      var _a;
      if (this.options.inlineImages && canvas.ownerDocument) {
        var img = canvas.ownerDocument.createElement('img');
        try {
          img.src = canvas.toDataURL();
          return img;
        } catch (e) {
          this.context.logger.info("Unable to inline canvas contents, canvas is tainted", canvas);
        }
      }
      var clonedCanvas = canvas.cloneNode(false);
      try {
        clonedCanvas.width = canvas.width;
        clonedCanvas.height = canvas.height;
        var ctx = canvas.getContext('2d');
        var clonedCtx = clonedCanvas.getContext('2d');
        if (clonedCtx) {
          if (!this.options.allowTaint && ctx) {
            clonedCtx.putImageData(ctx.getImageData(0, 0, canvas.width, canvas.height), 0, 0);
          } else {
            var gl = (_a = canvas.getContext('webgl2')) !== null && _a !== void 0 ? _a : canvas.getContext('webgl');
            if (gl) {
              var attribs = gl.getContextAttributes();
              if ((attribs === null || attribs === void 0 ? void 0 : attribs.preserveDrawingBuffer) === false) {
                this.context.logger.warn('Unable to clone WebGL context as it has preserveDrawingBuffer=false', canvas);
              }
            }
            clonedCtx.drawImage(canvas, 0, 0);
          }
        }
        return clonedCanvas;
      } catch (e) {
        this.context.logger.info("Unable to clone canvas as it is tainted", canvas);
      }
      return clonedCanvas;
    };
    DocumentCloner.prototype.createVideoClone = function (video) {
      var canvas = video.ownerDocument.createElement('canvas');
      canvas.width = video.offsetWidth;
      canvas.height = video.offsetHeight;
      var ctx = canvas.getContext('2d');
      try {
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          if (!this.options.allowTaint) {
            ctx.getImageData(0, 0, canvas.width, canvas.height);
          }
        }
        return canvas;
      } catch (e) {
        this.context.logger.info("Unable to clone video as it is tainted", video);
      }
      var blankCanvas = video.ownerDocument.createElement('canvas');
      blankCanvas.width = video.offsetWidth;
      blankCanvas.height = video.offsetHeight;
      return blankCanvas;
    };
    DocumentCloner.prototype.appendChildNode = function (clone, child, copyStyles) {
      if (!isElementNode(child) || !isScriptElement(child) && !child.hasAttribute(IGNORE_ATTRIBUTE) && (typeof this.options.ignoreElements !== 'function' || !this.options.ignoreElements(child))) {
        if (!this.options.copyStyles || !isElementNode(child) || !isStyleElement(child)) {
          clone.appendChild(this.cloneNode(child, copyStyles));
        }
      }
    };
    DocumentCloner.prototype.cloneChildNodes = function (node, clone, copyStyles) {
      var _this = this;
      for (var child = node.shadowRoot ? node.shadowRoot.firstChild : node.firstChild; child; child = child.nextSibling) {
        if (isElementNode(child) && isSlotElement(child) && typeof child.assignedNodes === 'function') {
          var assignedNodes = child.assignedNodes();
          if (assignedNodes.length) {
            assignedNodes.forEach(function (assignedNode) {
              return _this.appendChildNode(clone, assignedNode, copyStyles);
            });
          }
        } else {
          this.appendChildNode(clone, child, copyStyles);
        }
      }
    };
    DocumentCloner.prototype.cloneNode = function (node, copyStyles) {
      if (isTextNode(node)) {
        return document.createTextNode(node.data);
      }
      if (!node.ownerDocument) {
        return node.cloneNode(false);
      }
      var window = node.ownerDocument.defaultView;
      if (window && isElementNode(node) && (isHTMLElementNode(node) || isSVGElementNode(node))) {
        var clone = this.createElementClone(node);
        clone.style.transitionProperty = 'none';
        var style = window.getComputedStyle(node);
        var styleBefore = window.getComputedStyle(node, ':before');
        var styleAfter = window.getComputedStyle(node, ':after');
        if (this.referenceElement === node && isHTMLElementNode(clone)) {
          this.clonedReferenceElement = clone;
        }
        if (isBodyElement(clone)) {
          createPseudoHideStyles(clone);
        }
        var counters = this.counters.parse(new CSSParsedCounterDeclaration(this.context, style));
        var before = this.resolvePseudoContent(node, clone, styleBefore, PseudoElementType.BEFORE);
        if (isCustomElement(node)) {
          copyStyles = true;
        }
        if (!isVideoElement(node)) {
          this.cloneChildNodes(node, clone, copyStyles);
        }
        if (before) {
          clone.insertBefore(before, clone.firstChild);
        }
        var after = this.resolvePseudoContent(node, clone, styleAfter, PseudoElementType.AFTER);
        if (after) {
          clone.appendChild(after);
        }
        this.counters.pop(counters);
        if (style && (this.options.copyStyles || isSVGElementNode(node)) && !isIFrameElement(node) || copyStyles) {
          copyCSSStyles(style, clone);
        }
        if (node.scrollTop !== 0 || node.scrollLeft !== 0) {
          this.scrolledElements.push([clone, node.scrollLeft, node.scrollTop]);
        }
        if ((isTextareaElement(node) || isSelectElement(node)) && (isTextareaElement(clone) || isSelectElement(clone))) {
          clone.value = node.value;
        }
        return clone;
      }
      return node.cloneNode(false);
    };
    DocumentCloner.prototype.resolvePseudoContent = function (node, clone, style, pseudoElt) {
      var _this = this;
      if (!style) {
        return;
      }
      var value = style.content;
      var document = clone.ownerDocument;
      if (!document || !value || value === 'none' || value === '-moz-alt-content' || style.display === 'none') {
        return;
      }
      this.counters.parse(new CSSParsedCounterDeclaration(this.context, style));
      var declaration = new CSSParsedPseudoDeclaration(this.context, style);
      var anonymousReplacedElement = document.createElement('html2canvaspseudoelement');
      copyCSSStyles(style, anonymousReplacedElement);
      declaration.content.forEach(function (token) {
        if (token.type === 0 /* STRING_TOKEN */) {
          anonymousReplacedElement.appendChild(document.createTextNode(token.value));
        } else if (token.type === 22 /* URL_TOKEN */) {
          var img = document.createElement('img');
          img.src = token.value;
          img.style.opacity = '1';
          anonymousReplacedElement.appendChild(img);
        } else if (token.type === 18 /* FUNCTION */) {
          if (token.name === 'attr') {
            var attr = token.values.filter(isIdentToken);
            if (attr.length) {
              anonymousReplacedElement.appendChild(document.createTextNode(node.getAttribute(attr[0].value) || ''));
            }
          } else if (token.name === 'counter') {
            var _a = token.values.filter(nonFunctionArgSeparator),
              counter = _a[0],
              counterStyle = _a[1];
            if (counter && isIdentToken(counter)) {
              var counterState = _this.counters.getCounterValue(counter.value);
              var counterType = counterStyle && isIdentToken(counterStyle) ? listStyleType.parse(_this.context, counterStyle.value) : 3 /* DECIMAL */;
              anonymousReplacedElement.appendChild(document.createTextNode(createCounterText(counterState, counterType, false)));
            }
          } else if (token.name === 'counters') {
            var _b = token.values.filter(nonFunctionArgSeparator),
              counter = _b[0],
              delim = _b[1],
              counterStyle = _b[2];
            if (counter && isIdentToken(counter)) {
              var counterStates = _this.counters.getCounterValues(counter.value);
              var counterType_1 = counterStyle && isIdentToken(counterStyle) ? listStyleType.parse(_this.context, counterStyle.value) : 3 /* DECIMAL */;
              var separator = delim && delim.type === 0 /* STRING_TOKEN */ ? delim.value : '';
              var text = counterStates.map(function (value) {
                return createCounterText(value, counterType_1, false);
              }).join(separator);
              anonymousReplacedElement.appendChild(document.createTextNode(text));
            }
          } else ;
        } else if (token.type === 20 /* IDENT_TOKEN */) {
          switch (token.value) {
            case 'open-quote':
              anonymousReplacedElement.appendChild(document.createTextNode(getQuote(declaration.quotes, _this.quoteDepth++, true)));
              break;
            case 'close-quote':
              anonymousReplacedElement.appendChild(document.createTextNode(getQuote(declaration.quotes, --_this.quoteDepth, false)));
              break;
            default:
              // safari doesn't parse string tokens correctly because of lack of quotes
              anonymousReplacedElement.appendChild(document.createTextNode(token.value));
          }
        }
      });
      anonymousReplacedElement.className = PSEUDO_HIDE_ELEMENT_CLASS_BEFORE + " " + PSEUDO_HIDE_ELEMENT_CLASS_AFTER;
      var newClassName = pseudoElt === PseudoElementType.BEFORE ? " " + PSEUDO_HIDE_ELEMENT_CLASS_BEFORE : " " + PSEUDO_HIDE_ELEMENT_CLASS_AFTER;
      if (isSVGElementNode(clone)) {
        clone.className.baseValue += newClassName;
      } else {
        clone.className += newClassName;
      }
      return anonymousReplacedElement;
    };
    DocumentCloner.destroy = function (container) {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
        return true;
      }
      return false;
    };
    return DocumentCloner;
  }();
  var PseudoElementType;
  (function (PseudoElementType) {
    PseudoElementType[PseudoElementType["BEFORE"] = 0] = "BEFORE";
    PseudoElementType[PseudoElementType["AFTER"] = 1] = "AFTER";
  })(PseudoElementType || (PseudoElementType = {}));
  var createIFrameContainer = function createIFrameContainer(ownerDocument, bounds) {
    var cloneIframeContainer = ownerDocument.createElement('iframe');
    cloneIframeContainer.className = 'html2canvas-container';
    cloneIframeContainer.style.visibility = 'hidden';
    cloneIframeContainer.style.position = 'fixed';
    cloneIframeContainer.style.left = '-10000px';
    cloneIframeContainer.style.top = '0px';
    cloneIframeContainer.style.border = '0';
    cloneIframeContainer.width = bounds.width.toString();
    cloneIframeContainer.height = bounds.height.toString();
    cloneIframeContainer.scrolling = 'no'; // ios won't scroll without it
    cloneIframeContainer.setAttribute(IGNORE_ATTRIBUTE, 'true');
    ownerDocument.body.appendChild(cloneIframeContainer);
    return cloneIframeContainer;
  };
  var imageReady = function imageReady(img) {
    return new Promise(function (resolve) {
      if (img.complete) {
        resolve();
        return;
      }
      if (!img.src) {
        resolve();
        return;
      }
      img.onload = resolve;
      img.onerror = resolve;
    });
  };
  var imagesReady = function imagesReady(document) {
    return Promise.all([].slice.call(document.images, 0).map(imageReady));
  };
  var iframeLoader = function iframeLoader(iframe) {
    return new Promise(function (resolve, reject) {
      var cloneWindow = iframe.contentWindow;
      if (!cloneWindow) {
        return reject("No window assigned for iframe");
      }
      var documentClone = cloneWindow.document;
      cloneWindow.onload = iframe.onload = function () {
        cloneWindow.onload = iframe.onload = null;
        var interval = setInterval(function () {
          if (documentClone.body.childNodes.length > 0 && documentClone.readyState === 'complete') {
            clearInterval(interval);
            resolve(iframe);
          }
        }, 50);
      };
    });
  };
  var ignoredStyleProperties = ['all', 'd', 'content' // Safari shows pseudoelements if content is set
  ];

  var copyCSSStyles = function copyCSSStyles(style, target) {
    // Edge does not provide value for cssText
    for (var i = style.length - 1; i >= 0; i--) {
      var property = style.item(i);
      if (ignoredStyleProperties.indexOf(property) === -1) {
        target.style.setProperty(property, style.getPropertyValue(property));
      }
    }
    return target;
  };
  var serializeDoctype = function serializeDoctype(doctype) {
    var str = '';
    if (doctype) {
      str += '<!DOCTYPE ';
      if (doctype.name) {
        str += doctype.name;
      }
      if (doctype.internalSubset) {
        str += doctype.internalSubset;
      }
      if (doctype.publicId) {
        str += "\"" + doctype.publicId + "\"";
      }
      if (doctype.systemId) {
        str += "\"" + doctype.systemId + "\"";
      }
      str += '>';
    }
    return str;
  };
  var restoreOwnerScroll = function restoreOwnerScroll(ownerDocument, x, y) {
    if (ownerDocument && ownerDocument.defaultView && (x !== ownerDocument.defaultView.pageXOffset || y !== ownerDocument.defaultView.pageYOffset)) {
      ownerDocument.defaultView.scrollTo(x, y);
    }
  };
  var restoreNodeScroll = function restoreNodeScroll(_a) {
    var element = _a[0],
      x = _a[1],
      y = _a[2];
    element.scrollLeft = x;
    element.scrollTop = y;
  };
  var PSEUDO_BEFORE = ':before';
  var PSEUDO_AFTER = ':after';
  var PSEUDO_HIDE_ELEMENT_CLASS_BEFORE = '___html2canvas___pseudoelement_before';
  var PSEUDO_HIDE_ELEMENT_CLASS_AFTER = '___html2canvas___pseudoelement_after';
  var PSEUDO_HIDE_ELEMENT_STYLE = "{\n    content: \"\" !important;\n    display: none !important;\n}";
  var createPseudoHideStyles = function createPseudoHideStyles(body) {
    createStyles(body, "." + PSEUDO_HIDE_ELEMENT_CLASS_BEFORE + PSEUDO_BEFORE + PSEUDO_HIDE_ELEMENT_STYLE + "\n         ." + PSEUDO_HIDE_ELEMENT_CLASS_AFTER + PSEUDO_AFTER + PSEUDO_HIDE_ELEMENT_STYLE);
  };
  var createStyles = function createStyles(body, styles) {
    var document = body.ownerDocument;
    if (document) {
      var style = document.createElement('style');
      style.textContent = styles;
      body.appendChild(style);
    }
  };
  var CacheStorage = /** @class */function () {
    function CacheStorage() {}
    CacheStorage.getOrigin = function (url) {
      var link = CacheStorage._link;
      if (!link) {
        return 'about:blank';
      }
      link.href = url;
      link.href = link.href; // IE9, LOL! - http://jsfiddle.net/niklasvh/2e48b/
      return link.protocol + link.hostname + link.port;
    };
    CacheStorage.isSameOrigin = function (src) {
      return CacheStorage.getOrigin(src) === CacheStorage._origin;
    };
    CacheStorage.setContext = function (window) {
      CacheStorage._link = window.document.createElement('a');
      CacheStorage._origin = CacheStorage.getOrigin(window.location.href);
    };
    CacheStorage._origin = 'about:blank';
    return CacheStorage;
  }();
  var Cache = /** @class */function () {
    function Cache(context, _options) {
      this.context = context;
      this._options = _options;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this._cache = {};
    }
    Cache.prototype.addImage = function (src) {
      var result = Promise.resolve();
      if (this.has(src)) {
        return result;
      }
      if (isBlobImage(src) || isRenderable(src)) {
        (this._cache[src] = this.loadImage(src)).catch(function () {
          // prevent unhandled rejection
        });
        return result;
      }
      return result;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Cache.prototype.match = function (src) {
      return this._cache[src];
    };
    Cache.prototype.loadImage = function (key) {
      return __awaiter(this, void 0, void 0, function () {
        var isSameOrigin, useCORS, useProxy, src;
        var _this = this;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              isSameOrigin = CacheStorage.isSameOrigin(key);
              useCORS = !isInlineImage(key) && this._options.useCORS === true && FEATURES.SUPPORT_CORS_IMAGES && !isSameOrigin;
              useProxy = !isInlineImage(key) && !isSameOrigin && !isBlobImage(key) && typeof this._options.proxy === 'string' && FEATURES.SUPPORT_CORS_XHR && !useCORS;
              if (!isSameOrigin && this._options.allowTaint === false && !isInlineImage(key) && !isBlobImage(key) && !useProxy && !useCORS) {
                return [2 /*return*/];
              }

              src = key;
              if (!useProxy) return [3 /*break*/, 2];
              return [4 /*yield*/, this.proxy(src)];
            case 1:
              src = _a.sent();
              _a.label = 2;
            case 2:
              this.context.logger.debug("Added image " + key.substring(0, 256));
              return [4 /*yield*/, new Promise(function (resolve, reject) {
                var img = new Image();
                img.onload = function () {
                  return resolve(img);
                };
                img.onerror = reject;
                //ios safari 10.3 taints canvas with data urls unless crossOrigin is set to anonymous
                if (isInlineBase64Image(src) || useCORS) {
                  img.crossOrigin = 'anonymous';
                }
                img.src = src;
                if (img.complete === true) {
                  // Inline XML images may fail to parse, throwing an Error later on
                  setTimeout(function () {
                    return resolve(img);
                  }, 500);
                }
                if (_this._options.imageTimeout > 0) {
                  setTimeout(function () {
                    return reject("Timed out (" + _this._options.imageTimeout + "ms) loading image");
                  }, _this._options.imageTimeout);
                }
              })];
            case 3:
              return [2 /*return*/, _a.sent()];
          }
        });
      });
    };
    Cache.prototype.has = function (key) {
      return typeof this._cache[key] !== 'undefined';
    };
    Cache.prototype.keys = function () {
      return Promise.resolve(Object.keys(this._cache));
    };
    Cache.prototype.proxy = function (src) {
      var _this = this;
      var proxy = this._options.proxy;
      if (!proxy) {
        throw new Error('No proxy defined');
      }
      var key = src.substring(0, 256);
      return new Promise(function (resolve, reject) {
        var responseType = FEATURES.SUPPORT_RESPONSE_TYPE ? 'blob' : 'text';
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
          if (xhr.status === 200) {
            if (responseType === 'text') {
              resolve(xhr.response);
            } else {
              var reader_1 = new FileReader();
              reader_1.addEventListener('load', function () {
                return resolve(reader_1.result);
              }, false);
              reader_1.addEventListener('error', function (e) {
                return reject(e);
              }, false);
              reader_1.readAsDataURL(xhr.response);
            }
          } else {
            reject("Failed to proxy resource " + key + " with status code " + xhr.status);
          }
        };
        xhr.onerror = reject;
        var queryString = proxy.indexOf('?') > -1 ? '&' : '?';
        xhr.open('GET', "" + proxy + queryString + "url=" + encodeURIComponent(src) + "&responseType=" + responseType);
        if (responseType !== 'text' && xhr instanceof XMLHttpRequest) {
          xhr.responseType = responseType;
        }
        if (_this._options.imageTimeout) {
          var timeout_1 = _this._options.imageTimeout;
          xhr.timeout = timeout_1;
          xhr.ontimeout = function () {
            return reject("Timed out (" + timeout_1 + "ms) proxying " + key);
          };
        }
        xhr.send();
      });
    };
    return Cache;
  }();
  var INLINE_SVG = /^data:image\/svg\+xml/i;
  var INLINE_BASE64 = /^data:image\/.*;base64,/i;
  var INLINE_IMG = /^data:image\/.*/i;
  var isRenderable = function isRenderable(src) {
    return FEATURES.SUPPORT_SVG_DRAWING || !isSVG(src);
  };
  var isInlineImage = function isInlineImage(src) {
    return INLINE_IMG.test(src);
  };
  var isInlineBase64Image = function isInlineBase64Image(src) {
    return INLINE_BASE64.test(src);
  };
  var isBlobImage = function isBlobImage(src) {
    return src.substr(0, 4) === 'blob';
  };
  var isSVG = function isSVG(src) {
    return src.substr(-3).toLowerCase() === 'svg' || INLINE_SVG.test(src);
  };
  var Vector = /** @class */function () {
    function Vector(x, y) {
      this.type = 0 /* VECTOR */;
      this.x = x;
      this.y = y;
    }
    Vector.prototype.add = function (deltaX, deltaY) {
      return new Vector(this.x + deltaX, this.y + deltaY);
    };
    return Vector;
  }();
  var lerp = function lerp(a, b, t) {
    return new Vector(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
  };
  var BezierCurve = /** @class */function () {
    function BezierCurve(start, startControl, endControl, end) {
      this.type = 1 /* BEZIER_CURVE */;
      this.start = start;
      this.startControl = startControl;
      this.endControl = endControl;
      this.end = end;
    }
    BezierCurve.prototype.subdivide = function (t, firstHalf) {
      var ab = lerp(this.start, this.startControl, t);
      var bc = lerp(this.startControl, this.endControl, t);
      var cd = lerp(this.endControl, this.end, t);
      var abbc = lerp(ab, bc, t);
      var bccd = lerp(bc, cd, t);
      var dest = lerp(abbc, bccd, t);
      return firstHalf ? new BezierCurve(this.start, ab, abbc, dest) : new BezierCurve(dest, bccd, cd, this.end);
    };
    BezierCurve.prototype.add = function (deltaX, deltaY) {
      return new BezierCurve(this.start.add(deltaX, deltaY), this.startControl.add(deltaX, deltaY), this.endControl.add(deltaX, deltaY), this.end.add(deltaX, deltaY));
    };
    BezierCurve.prototype.reverse = function () {
      return new BezierCurve(this.end, this.endControl, this.startControl, this.start);
    };
    return BezierCurve;
  }();
  var isBezierCurve = function isBezierCurve(path) {
    return path.type === 1 /* BEZIER_CURVE */;
  };

  var BoundCurves = /** @class */function () {
    function BoundCurves(element) {
      var styles = element.styles;
      var bounds = element.bounds;
      var _a = getAbsoluteValueForTuple(styles.borderTopLeftRadius, bounds.width, bounds.height),
        tlh = _a[0],
        tlv = _a[1];
      var _b = getAbsoluteValueForTuple(styles.borderTopRightRadius, bounds.width, bounds.height),
        trh = _b[0],
        trv = _b[1];
      var _c = getAbsoluteValueForTuple(styles.borderBottomRightRadius, bounds.width, bounds.height),
        brh = _c[0],
        brv = _c[1];
      var _d = getAbsoluteValueForTuple(styles.borderBottomLeftRadius, bounds.width, bounds.height),
        blh = _d[0],
        blv = _d[1];
      var factors = [];
      factors.push((tlh + trh) / bounds.width);
      factors.push((blh + brh) / bounds.width);
      factors.push((tlv + blv) / bounds.height);
      factors.push((trv + brv) / bounds.height);
      var maxFactor = Math.max.apply(Math, factors);
      if (maxFactor > 1) {
        tlh /= maxFactor;
        tlv /= maxFactor;
        trh /= maxFactor;
        trv /= maxFactor;
        brh /= maxFactor;
        brv /= maxFactor;
        blh /= maxFactor;
        blv /= maxFactor;
      }
      var topWidth = bounds.width - trh;
      var rightHeight = bounds.height - brv;
      var bottomWidth = bounds.width - brh;
      var leftHeight = bounds.height - blv;
      var borderTopWidth = styles.borderTopWidth;
      var borderRightWidth = styles.borderRightWidth;
      var borderBottomWidth = styles.borderBottomWidth;
      var borderLeftWidth = styles.borderLeftWidth;
      var paddingTop = getAbsoluteValue(styles.paddingTop, element.bounds.width);
      var paddingRight = getAbsoluteValue(styles.paddingRight, element.bounds.width);
      var paddingBottom = getAbsoluteValue(styles.paddingBottom, element.bounds.width);
      var paddingLeft = getAbsoluteValue(styles.paddingLeft, element.bounds.width);
      this.topLeftBorderDoubleOuterBox = tlh > 0 || tlv > 0 ? getCurvePoints(bounds.left + borderLeftWidth / 3, bounds.top + borderTopWidth / 3, tlh - borderLeftWidth / 3, tlv - borderTopWidth / 3, CORNER.TOP_LEFT) : new Vector(bounds.left + borderLeftWidth / 3, bounds.top + borderTopWidth / 3);
      this.topRightBorderDoubleOuterBox = tlh > 0 || tlv > 0 ? getCurvePoints(bounds.left + topWidth, bounds.top + borderTopWidth / 3, trh - borderRightWidth / 3, trv - borderTopWidth / 3, CORNER.TOP_RIGHT) : new Vector(bounds.left + bounds.width - borderRightWidth / 3, bounds.top + borderTopWidth / 3);
      this.bottomRightBorderDoubleOuterBox = brh > 0 || brv > 0 ? getCurvePoints(bounds.left + bottomWidth, bounds.top + rightHeight, brh - borderRightWidth / 3, brv - borderBottomWidth / 3, CORNER.BOTTOM_RIGHT) : new Vector(bounds.left + bounds.width - borderRightWidth / 3, bounds.top + bounds.height - borderBottomWidth / 3);
      this.bottomLeftBorderDoubleOuterBox = blh > 0 || blv > 0 ? getCurvePoints(bounds.left + borderLeftWidth / 3, bounds.top + leftHeight, blh - borderLeftWidth / 3, blv - borderBottomWidth / 3, CORNER.BOTTOM_LEFT) : new Vector(bounds.left + borderLeftWidth / 3, bounds.top + bounds.height - borderBottomWidth / 3);
      this.topLeftBorderDoubleInnerBox = tlh > 0 || tlv > 0 ? getCurvePoints(bounds.left + borderLeftWidth * 2 / 3, bounds.top + borderTopWidth * 2 / 3, tlh - borderLeftWidth * 2 / 3, tlv - borderTopWidth * 2 / 3, CORNER.TOP_LEFT) : new Vector(bounds.left + borderLeftWidth * 2 / 3, bounds.top + borderTopWidth * 2 / 3);
      this.topRightBorderDoubleInnerBox = tlh > 0 || tlv > 0 ? getCurvePoints(bounds.left + topWidth, bounds.top + borderTopWidth * 2 / 3, trh - borderRightWidth * 2 / 3, trv - borderTopWidth * 2 / 3, CORNER.TOP_RIGHT) : new Vector(bounds.left + bounds.width - borderRightWidth * 2 / 3, bounds.top + borderTopWidth * 2 / 3);
      this.bottomRightBorderDoubleInnerBox = brh > 0 || brv > 0 ? getCurvePoints(bounds.left + bottomWidth, bounds.top + rightHeight, brh - borderRightWidth * 2 / 3, brv - borderBottomWidth * 2 / 3, CORNER.BOTTOM_RIGHT) : new Vector(bounds.left + bounds.width - borderRightWidth * 2 / 3, bounds.top + bounds.height - borderBottomWidth * 2 / 3);
      this.bottomLeftBorderDoubleInnerBox = blh > 0 || blv > 0 ? getCurvePoints(bounds.left + borderLeftWidth * 2 / 3, bounds.top + leftHeight, blh - borderLeftWidth * 2 / 3, blv - borderBottomWidth * 2 / 3, CORNER.BOTTOM_LEFT) : new Vector(bounds.left + borderLeftWidth * 2 / 3, bounds.top + bounds.height - borderBottomWidth * 2 / 3);
      this.topLeftBorderStroke = tlh > 0 || tlv > 0 ? getCurvePoints(bounds.left + borderLeftWidth / 2, bounds.top + borderTopWidth / 2, tlh - borderLeftWidth / 2, tlv - borderTopWidth / 2, CORNER.TOP_LEFT) : new Vector(bounds.left + borderLeftWidth / 2, bounds.top + borderTopWidth / 2);
      this.topRightBorderStroke = tlh > 0 || tlv > 0 ? getCurvePoints(bounds.left + topWidth, bounds.top + borderTopWidth / 2, trh - borderRightWidth / 2, trv - borderTopWidth / 2, CORNER.TOP_RIGHT) : new Vector(bounds.left + bounds.width - borderRightWidth / 2, bounds.top + borderTopWidth / 2);
      this.bottomRightBorderStroke = brh > 0 || brv > 0 ? getCurvePoints(bounds.left + bottomWidth, bounds.top + rightHeight, brh - borderRightWidth / 2, brv - borderBottomWidth / 2, CORNER.BOTTOM_RIGHT) : new Vector(bounds.left + bounds.width - borderRightWidth / 2, bounds.top + bounds.height - borderBottomWidth / 2);
      this.bottomLeftBorderStroke = blh > 0 || blv > 0 ? getCurvePoints(bounds.left + borderLeftWidth / 2, bounds.top + leftHeight, blh - borderLeftWidth / 2, blv - borderBottomWidth / 2, CORNER.BOTTOM_LEFT) : new Vector(bounds.left + borderLeftWidth / 2, bounds.top + bounds.height - borderBottomWidth / 2);
      this.topLeftBorderBox = tlh > 0 || tlv > 0 ? getCurvePoints(bounds.left, bounds.top, tlh, tlv, CORNER.TOP_LEFT) : new Vector(bounds.left, bounds.top);
      this.topRightBorderBox = trh > 0 || trv > 0 ? getCurvePoints(bounds.left + topWidth, bounds.top, trh, trv, CORNER.TOP_RIGHT) : new Vector(bounds.left + bounds.width, bounds.top);
      this.bottomRightBorderBox = brh > 0 || brv > 0 ? getCurvePoints(bounds.left + bottomWidth, bounds.top + rightHeight, brh, brv, CORNER.BOTTOM_RIGHT) : new Vector(bounds.left + bounds.width, bounds.top + bounds.height);
      this.bottomLeftBorderBox = blh > 0 || blv > 0 ? getCurvePoints(bounds.left, bounds.top + leftHeight, blh, blv, CORNER.BOTTOM_LEFT) : new Vector(bounds.left, bounds.top + bounds.height);
      this.topLeftPaddingBox = tlh > 0 || tlv > 0 ? getCurvePoints(bounds.left + borderLeftWidth, bounds.top + borderTopWidth, Math.max(0, tlh - borderLeftWidth), Math.max(0, tlv - borderTopWidth), CORNER.TOP_LEFT) : new Vector(bounds.left + borderLeftWidth, bounds.top + borderTopWidth);
      this.topRightPaddingBox = trh > 0 || trv > 0 ? getCurvePoints(bounds.left + Math.min(topWidth, bounds.width - borderRightWidth), bounds.top + borderTopWidth, topWidth > bounds.width + borderRightWidth ? 0 : Math.max(0, trh - borderRightWidth), Math.max(0, trv - borderTopWidth), CORNER.TOP_RIGHT) : new Vector(bounds.left + bounds.width - borderRightWidth, bounds.top + borderTopWidth);
      this.bottomRightPaddingBox = brh > 0 || brv > 0 ? getCurvePoints(bounds.left + Math.min(bottomWidth, bounds.width - borderLeftWidth), bounds.top + Math.min(rightHeight, bounds.height - borderBottomWidth), Math.max(0, brh - borderRightWidth), Math.max(0, brv - borderBottomWidth), CORNER.BOTTOM_RIGHT) : new Vector(bounds.left + bounds.width - borderRightWidth, bounds.top + bounds.height - borderBottomWidth);
      this.bottomLeftPaddingBox = blh > 0 || blv > 0 ? getCurvePoints(bounds.left + borderLeftWidth, bounds.top + Math.min(leftHeight, bounds.height - borderBottomWidth), Math.max(0, blh - borderLeftWidth), Math.max(0, blv - borderBottomWidth), CORNER.BOTTOM_LEFT) : new Vector(bounds.left + borderLeftWidth, bounds.top + bounds.height - borderBottomWidth);
      this.topLeftContentBox = tlh > 0 || tlv > 0 ? getCurvePoints(bounds.left + borderLeftWidth + paddingLeft, bounds.top + borderTopWidth + paddingTop, Math.max(0, tlh - (borderLeftWidth + paddingLeft)), Math.max(0, tlv - (borderTopWidth + paddingTop)), CORNER.TOP_LEFT) : new Vector(bounds.left + borderLeftWidth + paddingLeft, bounds.top + borderTopWidth + paddingTop);
      this.topRightContentBox = trh > 0 || trv > 0 ? getCurvePoints(bounds.left + Math.min(topWidth, bounds.width + borderLeftWidth + paddingLeft), bounds.top + borderTopWidth + paddingTop, topWidth > bounds.width + borderLeftWidth + paddingLeft ? 0 : trh - borderLeftWidth + paddingLeft, trv - (borderTopWidth + paddingTop), CORNER.TOP_RIGHT) : new Vector(bounds.left + bounds.width - (borderRightWidth + paddingRight), bounds.top + borderTopWidth + paddingTop);
      this.bottomRightContentBox = brh > 0 || brv > 0 ? getCurvePoints(bounds.left + Math.min(bottomWidth, bounds.width - (borderLeftWidth + paddingLeft)), bounds.top + Math.min(rightHeight, bounds.height + borderTopWidth + paddingTop), Math.max(0, brh - (borderRightWidth + paddingRight)), brv - (borderBottomWidth + paddingBottom), CORNER.BOTTOM_RIGHT) : new Vector(bounds.left + bounds.width - (borderRightWidth + paddingRight), bounds.top + bounds.height - (borderBottomWidth + paddingBottom));
      this.bottomLeftContentBox = blh > 0 || blv > 0 ? getCurvePoints(bounds.left + borderLeftWidth + paddingLeft, bounds.top + leftHeight, Math.max(0, blh - (borderLeftWidth + paddingLeft)), blv - (borderBottomWidth + paddingBottom), CORNER.BOTTOM_LEFT) : new Vector(bounds.left + borderLeftWidth + paddingLeft, bounds.top + bounds.height - (borderBottomWidth + paddingBottom));
    }
    return BoundCurves;
  }();
  var CORNER;
  (function (CORNER) {
    CORNER[CORNER["TOP_LEFT"] = 0] = "TOP_LEFT";
    CORNER[CORNER["TOP_RIGHT"] = 1] = "TOP_RIGHT";
    CORNER[CORNER["BOTTOM_RIGHT"] = 2] = "BOTTOM_RIGHT";
    CORNER[CORNER["BOTTOM_LEFT"] = 3] = "BOTTOM_LEFT";
  })(CORNER || (CORNER = {}));
  var getCurvePoints = function getCurvePoints(x, y, r1, r2, position) {
    var kappa = 4 * ((Math.sqrt(2) - 1) / 3);
    var ox = r1 * kappa; // control point offset horizontal
    var oy = r2 * kappa; // control point offset vertical
    var xm = x + r1; // x-middle
    var ym = y + r2; // y-middle
    switch (position) {
      case CORNER.TOP_LEFT:
        return new BezierCurve(new Vector(x, ym), new Vector(x, ym - oy), new Vector(xm - ox, y), new Vector(xm, y));
      case CORNER.TOP_RIGHT:
        return new BezierCurve(new Vector(x, y), new Vector(x + ox, y), new Vector(xm, ym - oy), new Vector(xm, ym));
      case CORNER.BOTTOM_RIGHT:
        return new BezierCurve(new Vector(xm, y), new Vector(xm, y + oy), new Vector(x + ox, ym), new Vector(x, ym));
      case CORNER.BOTTOM_LEFT:
      default:
        return new BezierCurve(new Vector(xm, ym), new Vector(xm - ox, ym), new Vector(x, y + oy), new Vector(x, y));
    }
  };
  var calculateBorderBoxPath = function calculateBorderBoxPath(curves) {
    return [curves.topLeftBorderBox, curves.topRightBorderBox, curves.bottomRightBorderBox, curves.bottomLeftBorderBox];
  };
  var calculateContentBoxPath = function calculateContentBoxPath(curves) {
    return [curves.topLeftContentBox, curves.topRightContentBox, curves.bottomRightContentBox, curves.bottomLeftContentBox];
  };
  var calculatePaddingBoxPath = function calculatePaddingBoxPath(curves) {
    return [curves.topLeftPaddingBox, curves.topRightPaddingBox, curves.bottomRightPaddingBox, curves.bottomLeftPaddingBox];
  };
  var TransformEffect = /** @class */function () {
    function TransformEffect(offsetX, offsetY, matrix) {
      this.offsetX = offsetX;
      this.offsetY = offsetY;
      this.matrix = matrix;
      this.type = 0 /* TRANSFORM */;
      this.target = 2 /* BACKGROUND_BORDERS */ | 4 /* CONTENT */;
    }

    return TransformEffect;
  }();
  var ClipEffect = /** @class */function () {
    function ClipEffect(path, target) {
      this.path = path;
      this.target = target;
      this.type = 1 /* CLIP */;
    }

    return ClipEffect;
  }();
  var OpacityEffect = /** @class */function () {
    function OpacityEffect(opacity) {
      this.opacity = opacity;
      this.type = 2 /* OPACITY */;
      this.target = 2 /* BACKGROUND_BORDERS */ | 4 /* CONTENT */;
    }

    return OpacityEffect;
  }();
  var isTransformEffect = function isTransformEffect(effect) {
    return effect.type === 0 /* TRANSFORM */;
  };

  var isClipEffect = function isClipEffect(effect) {
    return effect.type === 1 /* CLIP */;
  };
  var isOpacityEffect = function isOpacityEffect(effect) {
    return effect.type === 2 /* OPACITY */;
  };

  var equalPath = function equalPath(a, b) {
    if (a.length === b.length) {
      return a.some(function (v, i) {
        return v === b[i];
      });
    }
    return false;
  };
  var transformPath = function transformPath(path, deltaX, deltaY, deltaW, deltaH) {
    return path.map(function (point, index) {
      switch (index) {
        case 0:
          return point.add(deltaX, deltaY);
        case 1:
          return point.add(deltaX + deltaW, deltaY);
        case 2:
          return point.add(deltaX + deltaW, deltaY + deltaH);
        case 3:
          return point.add(deltaX, deltaY + deltaH);
      }
      return point;
    });
  };
  var StackingContext = /** @class */function () {
    function StackingContext(container) {
      this.element = container;
      this.inlineLevel = [];
      this.nonInlineLevel = [];
      this.negativeZIndex = [];
      this.zeroOrAutoZIndexOrTransformedOrOpacity = [];
      this.positiveZIndex = [];
      this.nonPositionedFloats = [];
      this.nonPositionedInlineLevel = [];
    }
    return StackingContext;
  }();
  var ElementPaint = /** @class */function () {
    function ElementPaint(container, parent) {
      this.container = container;
      this.parent = parent;
      this.effects = [];
      this.curves = new BoundCurves(this.container);
      if (this.container.styles.opacity < 1) {
        this.effects.push(new OpacityEffect(this.container.styles.opacity));
      }
      if (this.container.styles.transform !== null) {
        var offsetX = this.container.bounds.left + this.container.styles.transformOrigin[0].number;
        var offsetY = this.container.bounds.top + this.container.styles.transformOrigin[1].number;
        var matrix = this.container.styles.transform;
        this.effects.push(new TransformEffect(offsetX, offsetY, matrix));
      }
      if (this.container.styles.overflowX !== 0 /* VISIBLE */) {
        var borderBox = calculateBorderBoxPath(this.curves);
        var paddingBox = calculatePaddingBoxPath(this.curves);
        if (equalPath(borderBox, paddingBox)) {
          this.effects.push(new ClipEffect(borderBox, 2 /* BACKGROUND_BORDERS */ | 4 /* CONTENT */));
        } else {
          this.effects.push(new ClipEffect(borderBox, 2 /* BACKGROUND_BORDERS */));
          this.effects.push(new ClipEffect(paddingBox, 4 /* CONTENT */));
        }
      }
    }

    ElementPaint.prototype.getEffects = function (target) {
      var inFlow = [2 /* ABSOLUTE */, 3 /* FIXED */].indexOf(this.container.styles.position) === -1;
      var parent = this.parent;
      var effects = this.effects.slice(0);
      while (parent) {
        var croplessEffects = parent.effects.filter(function (effect) {
          return !isClipEffect(effect);
        });
        if (inFlow || parent.container.styles.position !== 0 /* STATIC */ || !parent.parent) {
          effects.unshift.apply(effects, croplessEffects);
          inFlow = [2 /* ABSOLUTE */, 3 /* FIXED */].indexOf(parent.container.styles.position) === -1;
          if (parent.container.styles.overflowX !== 0 /* VISIBLE */) {
            var borderBox = calculateBorderBoxPath(parent.curves);
            var paddingBox = calculatePaddingBoxPath(parent.curves);
            if (!equalPath(borderBox, paddingBox)) {
              effects.unshift(new ClipEffect(paddingBox, 2 /* BACKGROUND_BORDERS */ | 4 /* CONTENT */));
            }
          }
        } else {
          effects.unshift.apply(effects, croplessEffects);
        }
        parent = parent.parent;
      }
      return effects.filter(function (effect) {
        return contains(effect.target, target);
      });
    };
    return ElementPaint;
  }();
  var parseStackTree = function parseStackTree(parent, stackingContext, realStackingContext, listItems) {
    parent.container.elements.forEach(function (child) {
      var treatAsRealStackingContext = contains(child.flags, 4 /* CREATES_REAL_STACKING_CONTEXT */);
      var createsStackingContext = contains(child.flags, 2 /* CREATES_STACKING_CONTEXT */);
      var paintContainer = new ElementPaint(child, parent);
      if (contains(child.styles.display, 2048 /* LIST_ITEM */)) {
        listItems.push(paintContainer);
      }
      var listOwnerItems = contains(child.flags, 8 /* IS_LIST_OWNER */) ? [] : listItems;
      if (treatAsRealStackingContext || createsStackingContext) {
        var parentStack = treatAsRealStackingContext || child.styles.isPositioned() ? realStackingContext : stackingContext;
        var stack = new StackingContext(paintContainer);
        if (child.styles.isPositioned() || child.styles.opacity < 1 || child.styles.isTransformed()) {
          var order_1 = child.styles.zIndex.order;
          if (order_1 < 0) {
            var index_1 = 0;
            parentStack.negativeZIndex.some(function (current, i) {
              if (order_1 > current.element.container.styles.zIndex.order) {
                index_1 = i;
                return false;
              } else if (index_1 > 0) {
                return true;
              }
              return false;
            });
            parentStack.negativeZIndex.splice(index_1, 0, stack);
          } else if (order_1 > 0) {
            var index_2 = 0;
            parentStack.positiveZIndex.some(function (current, i) {
              if (order_1 >= current.element.container.styles.zIndex.order) {
                index_2 = i + 1;
                return false;
              } else if (index_2 > 0) {
                return true;
              }
              return false;
            });
            parentStack.positiveZIndex.splice(index_2, 0, stack);
          } else {
            parentStack.zeroOrAutoZIndexOrTransformedOrOpacity.push(stack);
          }
        } else {
          if (child.styles.isFloating()) {
            parentStack.nonPositionedFloats.push(stack);
          } else {
            parentStack.nonPositionedInlineLevel.push(stack);
          }
        }
        parseStackTree(paintContainer, stack, treatAsRealStackingContext ? stack : realStackingContext, listOwnerItems);
      } else {
        if (child.styles.isInlineLevel()) {
          stackingContext.inlineLevel.push(paintContainer);
        } else {
          stackingContext.nonInlineLevel.push(paintContainer);
        }
        parseStackTree(paintContainer, stackingContext, realStackingContext, listOwnerItems);
      }
      if (contains(child.flags, 8 /* IS_LIST_OWNER */)) {
        processListItems(child, listOwnerItems);
      }
    });
  };
  var processListItems = function processListItems(owner, elements) {
    var numbering = owner instanceof OLElementContainer ? owner.start : 1;
    var reversed = owner instanceof OLElementContainer ? owner.reversed : false;
    for (var i = 0; i < elements.length; i++) {
      var item = elements[i];
      if (item.container instanceof LIElementContainer && typeof item.container.value === 'number' && item.container.value !== 0) {
        numbering = item.container.value;
      }
      item.listValue = createCounterText(numbering, item.container.styles.listStyleType, true);
      numbering += reversed ? -1 : 1;
    }
  };
  var parseStackingContexts = function parseStackingContexts(container) {
    var paintContainer = new ElementPaint(container, null);
    var root = new StackingContext(paintContainer);
    var listItems = [];
    parseStackTree(paintContainer, root, root, listItems);
    processListItems(paintContainer.container, listItems);
    return root;
  };
  var parsePathForBorder = function parsePathForBorder(curves, borderSide) {
    switch (borderSide) {
      case 0:
        return createPathFromCurves(curves.topLeftBorderBox, curves.topLeftPaddingBox, curves.topRightBorderBox, curves.topRightPaddingBox);
      case 1:
        return createPathFromCurves(curves.topRightBorderBox, curves.topRightPaddingBox, curves.bottomRightBorderBox, curves.bottomRightPaddingBox);
      case 2:
        return createPathFromCurves(curves.bottomRightBorderBox, curves.bottomRightPaddingBox, curves.bottomLeftBorderBox, curves.bottomLeftPaddingBox);
      case 3:
      default:
        return createPathFromCurves(curves.bottomLeftBorderBox, curves.bottomLeftPaddingBox, curves.topLeftBorderBox, curves.topLeftPaddingBox);
    }
  };
  var parsePathForBorderDoubleOuter = function parsePathForBorderDoubleOuter(curves, borderSide) {
    switch (borderSide) {
      case 0:
        return createPathFromCurves(curves.topLeftBorderBox, curves.topLeftBorderDoubleOuterBox, curves.topRightBorderBox, curves.topRightBorderDoubleOuterBox);
      case 1:
        return createPathFromCurves(curves.topRightBorderBox, curves.topRightBorderDoubleOuterBox, curves.bottomRightBorderBox, curves.bottomRightBorderDoubleOuterBox);
      case 2:
        return createPathFromCurves(curves.bottomRightBorderBox, curves.bottomRightBorderDoubleOuterBox, curves.bottomLeftBorderBox, curves.bottomLeftBorderDoubleOuterBox);
      case 3:
      default:
        return createPathFromCurves(curves.bottomLeftBorderBox, curves.bottomLeftBorderDoubleOuterBox, curves.topLeftBorderBox, curves.topLeftBorderDoubleOuterBox);
    }
  };
  var parsePathForBorderDoubleInner = function parsePathForBorderDoubleInner(curves, borderSide) {
    switch (borderSide) {
      case 0:
        return createPathFromCurves(curves.topLeftBorderDoubleInnerBox, curves.topLeftPaddingBox, curves.topRightBorderDoubleInnerBox, curves.topRightPaddingBox);
      case 1:
        return createPathFromCurves(curves.topRightBorderDoubleInnerBox, curves.topRightPaddingBox, curves.bottomRightBorderDoubleInnerBox, curves.bottomRightPaddingBox);
      case 2:
        return createPathFromCurves(curves.bottomRightBorderDoubleInnerBox, curves.bottomRightPaddingBox, curves.bottomLeftBorderDoubleInnerBox, curves.bottomLeftPaddingBox);
      case 3:
      default:
        return createPathFromCurves(curves.bottomLeftBorderDoubleInnerBox, curves.bottomLeftPaddingBox, curves.topLeftBorderDoubleInnerBox, curves.topLeftPaddingBox);
    }
  };
  var parsePathForBorderStroke = function parsePathForBorderStroke(curves, borderSide) {
    switch (borderSide) {
      case 0:
        return createStrokePathFromCurves(curves.topLeftBorderStroke, curves.topRightBorderStroke);
      case 1:
        return createStrokePathFromCurves(curves.topRightBorderStroke, curves.bottomRightBorderStroke);
      case 2:
        return createStrokePathFromCurves(curves.bottomRightBorderStroke, curves.bottomLeftBorderStroke);
      case 3:
      default:
        return createStrokePathFromCurves(curves.bottomLeftBorderStroke, curves.topLeftBorderStroke);
    }
  };
  var createStrokePathFromCurves = function createStrokePathFromCurves(outer1, outer2) {
    var path = [];
    if (isBezierCurve(outer1)) {
      path.push(outer1.subdivide(0.5, false));
    } else {
      path.push(outer1);
    }
    if (isBezierCurve(outer2)) {
      path.push(outer2.subdivide(0.5, true));
    } else {
      path.push(outer2);
    }
    return path;
  };
  var createPathFromCurves = function createPathFromCurves(outer1, inner1, outer2, inner2) {
    var path = [];
    if (isBezierCurve(outer1)) {
      path.push(outer1.subdivide(0.5, false));
    } else {
      path.push(outer1);
    }
    if (isBezierCurve(outer2)) {
      path.push(outer2.subdivide(0.5, true));
    } else {
      path.push(outer2);
    }
    if (isBezierCurve(inner2)) {
      path.push(inner2.subdivide(0.5, true).reverse());
    } else {
      path.push(inner2);
    }
    if (isBezierCurve(inner1)) {
      path.push(inner1.subdivide(0.5, false).reverse());
    } else {
      path.push(inner1);
    }
    return path;
  };
  var paddingBox = function paddingBox(element) {
    var bounds = element.bounds;
    var styles = element.styles;
    return bounds.add(styles.borderLeftWidth, styles.borderTopWidth, -(styles.borderRightWidth + styles.borderLeftWidth), -(styles.borderTopWidth + styles.borderBottomWidth));
  };
  var contentBox = function contentBox(element) {
    var styles = element.styles;
    var bounds = element.bounds;
    var paddingLeft = getAbsoluteValue(styles.paddingLeft, bounds.width);
    var paddingRight = getAbsoluteValue(styles.paddingRight, bounds.width);
    var paddingTop = getAbsoluteValue(styles.paddingTop, bounds.width);
    var paddingBottom = getAbsoluteValue(styles.paddingBottom, bounds.width);
    return bounds.add(paddingLeft + styles.borderLeftWidth, paddingTop + styles.borderTopWidth, -(styles.borderRightWidth + styles.borderLeftWidth + paddingLeft + paddingRight), -(styles.borderTopWidth + styles.borderBottomWidth + paddingTop + paddingBottom));
  };
  var calculateBackgroundPositioningArea = function calculateBackgroundPositioningArea(backgroundOrigin, element) {
    if (backgroundOrigin === 0 /* BORDER_BOX */) {
      return element.bounds;
    }
    if (backgroundOrigin === 2 /* CONTENT_BOX */) {
      return contentBox(element);
    }
    return paddingBox(element);
  };
  var calculateBackgroundPaintingArea = function calculateBackgroundPaintingArea(backgroundClip, element) {
    if (backgroundClip === 0 /* BORDER_BOX */) {
      return element.bounds;
    }
    if (backgroundClip === 2 /* CONTENT_BOX */) {
      return contentBox(element);
    }
    return paddingBox(element);
  };
  var calculateBackgroundRendering = function calculateBackgroundRendering(container, index, intrinsicSize) {
    var backgroundPositioningArea = calculateBackgroundPositioningArea(getBackgroundValueForIndex(container.styles.backgroundOrigin, index), container);
    var backgroundPaintingArea = calculateBackgroundPaintingArea(getBackgroundValueForIndex(container.styles.backgroundClip, index), container);
    var backgroundImageSize = calculateBackgroundSize(getBackgroundValueForIndex(container.styles.backgroundSize, index), intrinsicSize, backgroundPositioningArea);
    var sizeWidth = backgroundImageSize[0],
      sizeHeight = backgroundImageSize[1];
    var position = getAbsoluteValueForTuple(getBackgroundValueForIndex(container.styles.backgroundPosition, index), backgroundPositioningArea.width - sizeWidth, backgroundPositioningArea.height - sizeHeight);
    var path = calculateBackgroundRepeatPath(getBackgroundValueForIndex(container.styles.backgroundRepeat, index), position, backgroundImageSize, backgroundPositioningArea, backgroundPaintingArea);
    var offsetX = Math.round(backgroundPositioningArea.left + position[0]);
    var offsetY = Math.round(backgroundPositioningArea.top + position[1]);
    return [path, offsetX, offsetY, sizeWidth, sizeHeight];
  };
  var isAuto = function isAuto(token) {
    return isIdentToken(token) && token.value === BACKGROUND_SIZE.AUTO;
  };
  var hasIntrinsicValue = function hasIntrinsicValue(value) {
    return typeof value === 'number';
  };
  var calculateBackgroundSize = function calculateBackgroundSize(size, _a, bounds) {
    var intrinsicWidth = _a[0],
      intrinsicHeight = _a[1],
      intrinsicProportion = _a[2];
    var first = size[0],
      second = size[1];
    if (!first) {
      return [0, 0];
    }
    if (isLengthPercentage(first) && second && isLengthPercentage(second)) {
      return [getAbsoluteValue(first, bounds.width), getAbsoluteValue(second, bounds.height)];
    }
    var hasIntrinsicProportion = hasIntrinsicValue(intrinsicProportion);
    if (isIdentToken(first) && (first.value === BACKGROUND_SIZE.CONTAIN || first.value === BACKGROUND_SIZE.COVER)) {
      if (hasIntrinsicValue(intrinsicProportion)) {
        var targetRatio = bounds.width / bounds.height;
        return targetRatio < intrinsicProportion !== (first.value === BACKGROUND_SIZE.COVER) ? [bounds.width, bounds.width / intrinsicProportion] : [bounds.height * intrinsicProportion, bounds.height];
      }
      return [bounds.width, bounds.height];
    }
    var hasIntrinsicWidth = hasIntrinsicValue(intrinsicWidth);
    var hasIntrinsicHeight = hasIntrinsicValue(intrinsicHeight);
    var hasIntrinsicDimensions = hasIntrinsicWidth || hasIntrinsicHeight;
    // If the background-size is auto or auto auto:
    if (isAuto(first) && (!second || isAuto(second))) {
      // If the image has both horizontal and vertical intrinsic dimensions, it's rendered at that size.
      if (hasIntrinsicWidth && hasIntrinsicHeight) {
        return [intrinsicWidth, intrinsicHeight];
      }
      // If the image has no intrinsic dimensions and has no intrinsic proportions,
      // it's rendered at the size of the background positioning area.
      if (!hasIntrinsicProportion && !hasIntrinsicDimensions) {
        return [bounds.width, bounds.height];
      }
      // TODO If the image has no intrinsic dimensions but has intrinsic proportions, it's rendered as if contain had been specified instead.
      // If the image has only one intrinsic dimension and has intrinsic proportions, it's rendered at the size corresponding to that one dimension.
      // The other dimension is computed using the specified dimension and the intrinsic proportions.
      if (hasIntrinsicDimensions && hasIntrinsicProportion) {
        var width_1 = hasIntrinsicWidth ? intrinsicWidth : intrinsicHeight * intrinsicProportion;
        var height_1 = hasIntrinsicHeight ? intrinsicHeight : intrinsicWidth / intrinsicProportion;
        return [width_1, height_1];
      }
      // If the image has only one intrinsic dimension but has no intrinsic proportions,
      // it's rendered using the specified dimension and the other dimension of the background positioning area.
      var width_2 = hasIntrinsicWidth ? intrinsicWidth : bounds.width;
      var height_2 = hasIntrinsicHeight ? intrinsicHeight : bounds.height;
      return [width_2, height_2];
    }
    // If the image has intrinsic proportions, it's stretched to the specified dimension.
    // The unspecified dimension is computed using the specified dimension and the intrinsic proportions.
    if (hasIntrinsicProportion) {
      var width_3 = 0;
      var height_3 = 0;
      if (isLengthPercentage(first)) {
        width_3 = getAbsoluteValue(first, bounds.width);
      } else if (isLengthPercentage(second)) {
        height_3 = getAbsoluteValue(second, bounds.height);
      }
      if (isAuto(first)) {
        width_3 = height_3 * intrinsicProportion;
      } else if (!second || isAuto(second)) {
        height_3 = width_3 / intrinsicProportion;
      }
      return [width_3, height_3];
    }
    // If the image has no intrinsic proportions, it's stretched to the specified dimension.
    // The unspecified dimension is computed using the image's corresponding intrinsic dimension,
    // if there is one. If there is no such intrinsic dimension,
    // it becomes the corresponding dimension of the background positioning area.
    var width = null;
    var height = null;
    if (isLengthPercentage(first)) {
      width = getAbsoluteValue(first, bounds.width);
    } else if (second && isLengthPercentage(second)) {
      height = getAbsoluteValue(second, bounds.height);
    }
    if (width !== null && (!second || isAuto(second))) {
      height = hasIntrinsicWidth && hasIntrinsicHeight ? width / intrinsicWidth * intrinsicHeight : bounds.height;
    }
    if (height !== null && isAuto(first)) {
      width = hasIntrinsicWidth && hasIntrinsicHeight ? height / intrinsicHeight * intrinsicWidth : bounds.width;
    }
    if (width !== null && height !== null) {
      return [width, height];
    }
    throw new Error("Unable to calculate background-size for element");
  };
  var getBackgroundValueForIndex = function getBackgroundValueForIndex(values, index) {
    var value = values[index];
    if (typeof value === 'undefined') {
      return values[0];
    }
    return value;
  };
  var calculateBackgroundRepeatPath = function calculateBackgroundRepeatPath(repeat, _a, _b, backgroundPositioningArea, backgroundPaintingArea) {
    var x = _a[0],
      y = _a[1];
    var width = _b[0],
      height = _b[1];
    switch (repeat) {
      case 2 /* REPEAT_X */:
        return [new Vector(Math.round(backgroundPositioningArea.left), Math.round(backgroundPositioningArea.top + y)), new Vector(Math.round(backgroundPositioningArea.left + backgroundPositioningArea.width), Math.round(backgroundPositioningArea.top + y)), new Vector(Math.round(backgroundPositioningArea.left + backgroundPositioningArea.width), Math.round(height + backgroundPositioningArea.top + y)), new Vector(Math.round(backgroundPositioningArea.left), Math.round(height + backgroundPositioningArea.top + y))];
      case 3 /* REPEAT_Y */:
        return [new Vector(Math.round(backgroundPositioningArea.left + x), Math.round(backgroundPositioningArea.top)), new Vector(Math.round(backgroundPositioningArea.left + x + width), Math.round(backgroundPositioningArea.top)), new Vector(Math.round(backgroundPositioningArea.left + x + width), Math.round(backgroundPositioningArea.height + backgroundPositioningArea.top)), new Vector(Math.round(backgroundPositioningArea.left + x), Math.round(backgroundPositioningArea.height + backgroundPositioningArea.top))];
      case 1 /* NO_REPEAT */:
        return [new Vector(Math.round(backgroundPositioningArea.left + x), Math.round(backgroundPositioningArea.top + y)), new Vector(Math.round(backgroundPositioningArea.left + x + width), Math.round(backgroundPositioningArea.top + y)), new Vector(Math.round(backgroundPositioningArea.left + x + width), Math.round(backgroundPositioningArea.top + y + height)), new Vector(Math.round(backgroundPositioningArea.left + x), Math.round(backgroundPositioningArea.top + y + height))];
      default:
        return [new Vector(Math.round(backgroundPaintingArea.left), Math.round(backgroundPaintingArea.top)), new Vector(Math.round(backgroundPaintingArea.left + backgroundPaintingArea.width), Math.round(backgroundPaintingArea.top)), new Vector(Math.round(backgroundPaintingArea.left + backgroundPaintingArea.width), Math.round(backgroundPaintingArea.height + backgroundPaintingArea.top)), new Vector(Math.round(backgroundPaintingArea.left), Math.round(backgroundPaintingArea.height + backgroundPaintingArea.top))];
    }
  };
  var SMALL_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  var SAMPLE_TEXT = 'Hidden Text';
  var FontMetrics = /** @class */function () {
    function FontMetrics(document) {
      this._data = {};
      this._document = document;
    }
    FontMetrics.prototype.parseMetrics = function (fontFamily, fontSize) {
      var container = this._document.createElement('div');
      var img = this._document.createElement('img');
      var span = this._document.createElement('span');
      var body = this._document.body;
      container.style.visibility = 'hidden';
      container.style.fontFamily = fontFamily;
      container.style.fontSize = fontSize;
      container.style.margin = '0';
      container.style.padding = '0';
      container.style.whiteSpace = 'nowrap';
      body.appendChild(container);
      img.src = SMALL_IMAGE;
      img.width = 1;
      img.height = 1;
      img.style.margin = '0';
      img.style.padding = '0';
      img.style.verticalAlign = 'baseline';
      span.style.fontFamily = fontFamily;
      span.style.fontSize = fontSize;
      span.style.margin = '0';
      span.style.padding = '0';
      span.appendChild(this._document.createTextNode(SAMPLE_TEXT));
      container.appendChild(span);
      container.appendChild(img);
      var baseline = img.offsetTop - span.offsetTop + 2;
      container.removeChild(span);
      container.appendChild(this._document.createTextNode(SAMPLE_TEXT));
      container.style.lineHeight = 'normal';
      img.style.verticalAlign = 'super';
      var middle = img.offsetTop - container.offsetTop + 2;
      body.removeChild(container);
      return {
        baseline: baseline,
        middle: middle
      };
    };
    FontMetrics.prototype.getMetrics = function (fontFamily, fontSize) {
      var key = fontFamily + " " + fontSize;
      if (typeof this._data[key] === 'undefined') {
        this._data[key] = this.parseMetrics(fontFamily, fontSize);
      }
      return this._data[key];
    };
    return FontMetrics;
  }();
  var Renderer = /** @class */function () {
    function Renderer(context, options) {
      this.context = context;
      this.options = options;
    }
    return Renderer;
  }();
  var MASK_OFFSET = 10000;
  var CanvasRenderer = /** @class */function (_super) {
    __extends(CanvasRenderer, _super);
    function CanvasRenderer(context, options) {
      var _this = _super.call(this, context, options) || this;
      _this._activeEffects = [];
      _this.canvas = options.canvas ? options.canvas : document.createElement('canvas');
      _this.ctx = _this.canvas.getContext('2d');
      if (!options.canvas) {
        _this.canvas.width = Math.floor(options.width * options.scale);
        _this.canvas.height = Math.floor(options.height * options.scale);
        _this.canvas.style.width = options.width + "px";
        _this.canvas.style.height = options.height + "px";
      }
      _this.fontMetrics = new FontMetrics(document);
      _this.ctx.scale(_this.options.scale, _this.options.scale);
      _this.ctx.translate(-options.x, -options.y);
      _this.ctx.textBaseline = 'bottom';
      _this._activeEffects = [];
      _this.context.logger.debug("Canvas renderer initialized (" + options.width + "x" + options.height + ") with scale " + options.scale);
      return _this;
    }
    CanvasRenderer.prototype.applyEffects = function (effects) {
      var _this = this;
      while (this._activeEffects.length) {
        this.popEffect();
      }
      effects.forEach(function (effect) {
        return _this.applyEffect(effect);
      });
    };
    CanvasRenderer.prototype.applyEffect = function (effect) {
      this.ctx.save();
      if (isOpacityEffect(effect)) {
        this.ctx.globalAlpha = effect.opacity;
      }
      if (isTransformEffect(effect)) {
        this.ctx.translate(effect.offsetX, effect.offsetY);
        this.ctx.transform(effect.matrix[0], effect.matrix[1], effect.matrix[2], effect.matrix[3], effect.matrix[4], effect.matrix[5]);
        this.ctx.translate(-effect.offsetX, -effect.offsetY);
      }
      if (isClipEffect(effect)) {
        this.path(effect.path);
        this.ctx.clip();
      }
      this._activeEffects.push(effect);
    };
    CanvasRenderer.prototype.popEffect = function () {
      this._activeEffects.pop();
      this.ctx.restore();
    };
    CanvasRenderer.prototype.renderStack = function (stack) {
      return __awaiter(this, void 0, void 0, function () {
        var styles;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              styles = stack.element.container.styles;
              if (!styles.isVisible()) return [3 /*break*/, 2];
              return [4 /*yield*/, this.renderStackContent(stack)];
            case 1:
              _a.sent();
              _a.label = 2;
            case 2:
              return [2 /*return*/];
          }
        });
      });
    };

    CanvasRenderer.prototype.renderNode = function (paint) {
      return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (contains(paint.container.flags, 16 /* DEBUG_RENDER */)) {
                debugger;
              }
              if (!paint.container.styles.isVisible()) return [3 /*break*/, 3];
              return [4 /*yield*/, this.renderNodeBackgroundAndBorders(paint)];
            case 1:
              _a.sent();
              return [4 /*yield*/, this.renderNodeContent(paint)];
            case 2:
              _a.sent();
              _a.label = 3;
            case 3:
              return [2 /*return*/];
          }
        });
      });
    };

    CanvasRenderer.prototype.renderTextWithLetterSpacing = function (text, letterSpacing, baseline) {
      var _this = this;
      if (letterSpacing === 0) {
        this.ctx.fillText(text.text, text.bounds.left, text.bounds.top + baseline);
      } else {
        var letters = segmentGraphemes(text.text);
        letters.reduce(function (left, letter) {
          _this.ctx.fillText(letter, left, text.bounds.top + baseline);
          return left + _this.ctx.measureText(letter).width;
        }, text.bounds.left);
      }
    };
    CanvasRenderer.prototype.createFontStyle = function (styles) {
      var fontVariant = styles.fontVariant.filter(function (variant) {
        return variant === 'normal' || variant === 'small-caps';
      }).join('');
      var fontFamily = fixIOSSystemFonts(styles.fontFamily).join(', ');
      var fontSize = isDimensionToken(styles.fontSize) ? "" + styles.fontSize.number + styles.fontSize.unit : styles.fontSize.number + "px";
      return [[styles.fontStyle, fontVariant, styles.fontWeight, fontSize, fontFamily].join(' '), fontFamily, fontSize];
    };
    CanvasRenderer.prototype.renderTextNode = function (text, styles) {
      return __awaiter(this, void 0, void 0, function () {
        var _a, font, fontFamily, fontSize, _b, baseline, middle, paintOrder;
        var _this = this;
        return __generator(this, function (_c) {
          _a = this.createFontStyle(styles), font = _a[0], fontFamily = _a[1], fontSize = _a[2];
          this.ctx.font = font;
          this.ctx.direction = styles.direction === 1 /* RTL */ ? 'rtl' : 'ltr';
          this.ctx.textAlign = 'left';
          this.ctx.textBaseline = 'alphabetic';
          _b = this.fontMetrics.getMetrics(fontFamily, fontSize), baseline = _b.baseline, middle = _b.middle;
          paintOrder = styles.paintOrder;
          text.textBounds.forEach(function (text) {
            paintOrder.forEach(function (paintOrderLayer) {
              switch (paintOrderLayer) {
                case 0 /* FILL */:
                  _this.ctx.fillStyle = asString(styles.color);
                  _this.renderTextWithLetterSpacing(text, styles.letterSpacing, baseline);
                  var textShadows = styles.textShadow;
                  if (textShadows.length && text.text.trim().length) {
                    textShadows.slice(0).reverse().forEach(function (textShadow) {
                      _this.ctx.shadowColor = asString(textShadow.color);
                      _this.ctx.shadowOffsetX = textShadow.offsetX.number * _this.options.scale;
                      _this.ctx.shadowOffsetY = textShadow.offsetY.number * _this.options.scale;
                      _this.ctx.shadowBlur = textShadow.blur.number;
                      _this.renderTextWithLetterSpacing(text, styles.letterSpacing, baseline);
                    });
                    _this.ctx.shadowColor = '';
                    _this.ctx.shadowOffsetX = 0;
                    _this.ctx.shadowOffsetY = 0;
                    _this.ctx.shadowBlur = 0;
                  }
                  if (styles.textDecorationLine.length) {
                    _this.ctx.fillStyle = asString(styles.textDecorationColor || styles.color);
                    styles.textDecorationLine.forEach(function (textDecorationLine) {
                      switch (textDecorationLine) {
                        case 1 /* UNDERLINE */:
                          // Draws a line at the baseline of the font
                          // TODO As some browsers display the line as more than 1px if the font-size is big,
                          // need to take that into account both in position and size
                          _this.ctx.fillRect(text.bounds.left, Math.round(text.bounds.top + baseline), text.bounds.width, 1);
                          break;
                        case 2 /* OVERLINE */:
                          _this.ctx.fillRect(text.bounds.left, Math.round(text.bounds.top), text.bounds.width, 1);
                          break;
                        case 3 /* LINE_THROUGH */:
                          // TODO try and find exact position for line-through
                          _this.ctx.fillRect(text.bounds.left, Math.ceil(text.bounds.top + middle), text.bounds.width, 1);
                          break;
                      }
                    });
                  }
                  break;
                case 1 /* STROKE */:
                  if (styles.webkitTextStrokeWidth && text.text.trim().length) {
                    _this.ctx.strokeStyle = asString(styles.webkitTextStrokeColor);
                    _this.ctx.lineWidth = styles.webkitTextStrokeWidth;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    _this.ctx.lineJoin = !!window.chrome ? 'miter' : 'round';
                    _this.ctx.strokeText(text.text, text.bounds.left, text.bounds.top + baseline);
                  }
                  _this.ctx.strokeStyle = '';
                  _this.ctx.lineWidth = 0;
                  _this.ctx.lineJoin = 'miter';
                  break;
              }
            });
          });
          return [2 /*return*/];
        });
      });
    };

    CanvasRenderer.prototype.renderReplacedElement = function (container, curves, image) {
      if (image && container.intrinsicWidth > 0 && container.intrinsicHeight > 0) {
        var box = contentBox(container);
        var path = calculatePaddingBoxPath(curves);
        this.path(path);
        this.ctx.save();
        this.ctx.clip();
        this.ctx.drawImage(image, 0, 0, container.intrinsicWidth, container.intrinsicHeight, box.left, box.top, box.width, box.height);
        this.ctx.restore();
      }
    };
    CanvasRenderer.prototype.renderNodeContent = function (paint) {
      return __awaiter(this, void 0, void 0, function () {
        var container, curves, styles, _i, _a, child, image, image, iframeRenderer, canvas, size, _b, fontFamily, fontSize, baseline, bounds, x, textBounds, img, image, url, fontFamily, bounds;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              this.applyEffects(paint.getEffects(4 /* CONTENT */));
              container = paint.container;
              curves = paint.curves;
              styles = container.styles;
              _i = 0, _a = container.textNodes;
              _c.label = 1;
            case 1:
              if (!(_i < _a.length)) return [3 /*break*/, 4];
              child = _a[_i];
              return [4 /*yield*/, this.renderTextNode(child, styles)];
            case 2:
              _c.sent();
              _c.label = 3;
            case 3:
              _i++;
              return [3 /*break*/, 1];
            case 4:
              if (!(container instanceof ImageElementContainer)) return [3 /*break*/, 8];
              _c.label = 5;
            case 5:
              _c.trys.push([5, 7,, 8]);
              return [4 /*yield*/, this.context.cache.match(container.src)];
            case 6:
              image = _c.sent();
              this.renderReplacedElement(container, curves, image);
              return [3 /*break*/, 8];
            case 7:
              _c.sent();
              this.context.logger.error("Error loading image " + container.src);
              return [3 /*break*/, 8];
            case 8:
              if (container instanceof CanvasElementContainer) {
                this.renderReplacedElement(container, curves, container.canvas);
              }
              if (!(container instanceof SVGElementContainer)) return [3 /*break*/, 12];
              _c.label = 9;
            case 9:
              _c.trys.push([9, 11,, 12]);
              return [4 /*yield*/, this.context.cache.match(container.svg)];
            case 10:
              image = _c.sent();
              this.renderReplacedElement(container, curves, image);
              return [3 /*break*/, 12];
            case 11:
              _c.sent();
              this.context.logger.error("Error loading svg " + container.svg.substring(0, 255));
              return [3 /*break*/, 12];
            case 12:
              if (!(container instanceof IFrameElementContainer && container.tree)) return [3 /*break*/, 14];
              iframeRenderer = new CanvasRenderer(this.context, {
                scale: this.options.scale,
                backgroundColor: container.backgroundColor,
                x: 0,
                y: 0,
                width: container.width,
                height: container.height
              });
              return [4 /*yield*/, iframeRenderer.render(container.tree)];
            case 13:
              canvas = _c.sent();
              if (container.width && container.height) {
                this.ctx.drawImage(canvas, 0, 0, container.width, container.height, container.bounds.left, container.bounds.top, container.bounds.width, container.bounds.height);
              }
              _c.label = 14;
            case 14:
              if (container instanceof InputElementContainer) {
                size = Math.min(container.bounds.width, container.bounds.height);
                if (container.type === CHECKBOX) {
                  if (container.checked) {
                    this.ctx.save();
                    this.path([new Vector(container.bounds.left + size * 0.39363, container.bounds.top + size * 0.79), new Vector(container.bounds.left + size * 0.16, container.bounds.top + size * 0.5549), new Vector(container.bounds.left + size * 0.27347, container.bounds.top + size * 0.44071), new Vector(container.bounds.left + size * 0.39694, container.bounds.top + size * 0.5649), new Vector(container.bounds.left + size * 0.72983, container.bounds.top + size * 0.23), new Vector(container.bounds.left + size * 0.84, container.bounds.top + size * 0.34085), new Vector(container.bounds.left + size * 0.39363, container.bounds.top + size * 0.79)]);
                    this.ctx.fillStyle = asString(INPUT_COLOR);
                    this.ctx.fill();
                    this.ctx.restore();
                  }
                } else if (container.type === RADIO) {
                  if (container.checked) {
                    this.ctx.save();
                    this.ctx.beginPath();
                    this.ctx.arc(container.bounds.left + size / 2, container.bounds.top + size / 2, size / 4, 0, Math.PI * 2, true);
                    this.ctx.fillStyle = asString(INPUT_COLOR);
                    this.ctx.fill();
                    this.ctx.restore();
                  }
                }
              }
              if (isTextInputElement(container) && container.value.length) {
                _b = this.createFontStyle(styles), fontFamily = _b[0], fontSize = _b[1];
                baseline = this.fontMetrics.getMetrics(fontFamily, fontSize).baseline;
                this.ctx.font = fontFamily;
                this.ctx.fillStyle = asString(styles.color);
                this.ctx.textBaseline = 'alphabetic';
                this.ctx.textAlign = canvasTextAlign(container.styles.textAlign);
                bounds = contentBox(container);
                x = 0;
                switch (container.styles.textAlign) {
                  case 1 /* CENTER */:
                    x += bounds.width / 2;
                    break;
                  case 2 /* RIGHT */:
                    x += bounds.width;
                    break;
                }
                textBounds = bounds.add(x, 0, 0, -bounds.height / 2 + 1);
                this.ctx.save();
                this.path([new Vector(bounds.left, bounds.top), new Vector(bounds.left + bounds.width, bounds.top), new Vector(bounds.left + bounds.width, bounds.top + bounds.height), new Vector(bounds.left, bounds.top + bounds.height)]);
                this.ctx.clip();
                this.renderTextWithLetterSpacing(new TextBounds(container.value, textBounds), styles.letterSpacing, baseline);
                this.ctx.restore();
                this.ctx.textBaseline = 'alphabetic';
                this.ctx.textAlign = 'left';
              }
              if (!contains(container.styles.display, 2048 /* LIST_ITEM */)) return [3 /*break*/, 20];
              if (!(container.styles.listStyleImage !== null)) return [3 /*break*/, 19];
              img = container.styles.listStyleImage;
              if (!(img.type === 0 /* URL */)) return [3 /*break*/, 18];
              image = void 0;
              url = img.url;
              _c.label = 15;
            case 15:
              _c.trys.push([15, 17,, 18]);
              return [4 /*yield*/, this.context.cache.match(url)];
            case 16:
              image = _c.sent();
              this.ctx.drawImage(image, container.bounds.left - (image.width + 10), container.bounds.top);
              return [3 /*break*/, 18];
            case 17:
              _c.sent();
              this.context.logger.error("Error loading list-style-image " + url);
              return [3 /*break*/, 18];
            case 18:
              return [3 /*break*/, 20];
            case 19:
              if (paint.listValue && container.styles.listStyleType !== -1 /* NONE */) {
                fontFamily = this.createFontStyle(styles)[0];
                this.ctx.font = fontFamily;
                this.ctx.fillStyle = asString(styles.color);
                this.ctx.textBaseline = 'middle';
                this.ctx.textAlign = 'right';
                bounds = new Bounds(container.bounds.left, container.bounds.top + getAbsoluteValue(container.styles.paddingTop, container.bounds.width), container.bounds.width, computeLineHeight(styles.lineHeight, styles.fontSize.number) / 2 + 1);
                this.renderTextWithLetterSpacing(new TextBounds(paint.listValue, bounds), styles.letterSpacing, computeLineHeight(styles.lineHeight, styles.fontSize.number) / 2 + 2);
                this.ctx.textBaseline = 'bottom';
                this.ctx.textAlign = 'left';
              }
              _c.label = 20;
            case 20:
              return [2 /*return*/];
          }
        });
      });
    };

    CanvasRenderer.prototype.renderStackContent = function (stack) {
      return __awaiter(this, void 0, void 0, function () {
        var _i, _a, child, _b, _c, child, _d, _e, child, _f, _g, child, _h, _j, child, _k, _l, child, _m, _o, child;
        return __generator(this, function (_p) {
          switch (_p.label) {
            case 0:
              if (contains(stack.element.container.flags, 16 /* DEBUG_RENDER */)) {
                debugger;
              }
              // https://www.w3.org/TR/css-position-3/#painting-order
              // 1. the background and borders of the element forming the stacking context.
              return [4 /*yield*/, this.renderNodeBackgroundAndBorders(stack.element)];
            case 1:
              // https://www.w3.org/TR/css-position-3/#painting-order
              // 1. the background and borders of the element forming the stacking context.
              _p.sent();
              _i = 0, _a = stack.negativeZIndex;
              _p.label = 2;
            case 2:
              if (!(_i < _a.length)) return [3 /*break*/, 5];
              child = _a[_i];
              return [4 /*yield*/, this.renderStack(child)];
            case 3:
              _p.sent();
              _p.label = 4;
            case 4:
              _i++;
              return [3 /*break*/, 2];
            case 5:
              // 3. For all its in-flow, non-positioned, block-level descendants in tree order:
              return [4 /*yield*/, this.renderNodeContent(stack.element)];
            case 6:
              // 3. For all its in-flow, non-positioned, block-level descendants in tree order:
              _p.sent();
              _b = 0, _c = stack.nonInlineLevel;
              _p.label = 7;
            case 7:
              if (!(_b < _c.length)) return [3 /*break*/, 10];
              child = _c[_b];
              return [4 /*yield*/, this.renderNode(child)];
            case 8:
              _p.sent();
              _p.label = 9;
            case 9:
              _b++;
              return [3 /*break*/, 7];
            case 10:
              _d = 0, _e = stack.nonPositionedFloats;
              _p.label = 11;
            case 11:
              if (!(_d < _e.length)) return [3 /*break*/, 14];
              child = _e[_d];
              return [4 /*yield*/, this.renderStack(child)];
            case 12:
              _p.sent();
              _p.label = 13;
            case 13:
              _d++;
              return [3 /*break*/, 11];
            case 14:
              _f = 0, _g = stack.nonPositionedInlineLevel;
              _p.label = 15;
            case 15:
              if (!(_f < _g.length)) return [3 /*break*/, 18];
              child = _g[_f];
              return [4 /*yield*/, this.renderStack(child)];
            case 16:
              _p.sent();
              _p.label = 17;
            case 17:
              _f++;
              return [3 /*break*/, 15];
            case 18:
              _h = 0, _j = stack.inlineLevel;
              _p.label = 19;
            case 19:
              if (!(_h < _j.length)) return [3 /*break*/, 22];
              child = _j[_h];
              return [4 /*yield*/, this.renderNode(child)];
            case 20:
              _p.sent();
              _p.label = 21;
            case 21:
              _h++;
              return [3 /*break*/, 19];
            case 22:
              _k = 0, _l = stack.zeroOrAutoZIndexOrTransformedOrOpacity;
              _p.label = 23;
            case 23:
              if (!(_k < _l.length)) return [3 /*break*/, 26];
              child = _l[_k];
              return [4 /*yield*/, this.renderStack(child)];
            case 24:
              _p.sent();
              _p.label = 25;
            case 25:
              _k++;
              return [3 /*break*/, 23];
            case 26:
              _m = 0, _o = stack.positiveZIndex;
              _p.label = 27;
            case 27:
              if (!(_m < _o.length)) return [3 /*break*/, 30];
              child = _o[_m];
              return [4 /*yield*/, this.renderStack(child)];
            case 28:
              _p.sent();
              _p.label = 29;
            case 29:
              _m++;
              return [3 /*break*/, 27];
            case 30:
              return [2 /*return*/];
          }
        });
      });
    };

    CanvasRenderer.prototype.mask = function (paths) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(this.canvas.width, 0);
      this.ctx.lineTo(this.canvas.width, this.canvas.height);
      this.ctx.lineTo(0, this.canvas.height);
      this.ctx.lineTo(0, 0);
      this.formatPath(paths.slice(0).reverse());
      this.ctx.closePath();
    };
    CanvasRenderer.prototype.path = function (paths) {
      this.ctx.beginPath();
      this.formatPath(paths);
      this.ctx.closePath();
    };
    CanvasRenderer.prototype.formatPath = function (paths) {
      var _this = this;
      paths.forEach(function (point, index) {
        var start = isBezierCurve(point) ? point.start : point;
        if (index === 0) {
          _this.ctx.moveTo(start.x, start.y);
        } else {
          _this.ctx.lineTo(start.x, start.y);
        }
        if (isBezierCurve(point)) {
          _this.ctx.bezierCurveTo(point.startControl.x, point.startControl.y, point.endControl.x, point.endControl.y, point.end.x, point.end.y);
        }
      });
    };
    CanvasRenderer.prototype.renderRepeat = function (path, pattern, offsetX, offsetY) {
      this.path(path);
      this.ctx.fillStyle = pattern;
      this.ctx.translate(offsetX, offsetY);
      this.ctx.fill();
      this.ctx.translate(-offsetX, -offsetY);
    };
    CanvasRenderer.prototype.resizeImage = function (image, width, height) {
      var _a;
      if (image.width === width && image.height === height) {
        return image;
      }
      var ownerDocument = (_a = this.canvas.ownerDocument) !== null && _a !== void 0 ? _a : document;
      var canvas = ownerDocument.createElement('canvas');
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);
      var ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
      return canvas;
    };
    CanvasRenderer.prototype.renderBackgroundImage = function (container) {
      return __awaiter(this, void 0, void 0, function () {
        var index, _loop_1, this_1, _i, _a, backgroundImage;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              index = container.styles.backgroundImage.length - 1;
              _loop_1 = function _loop_1(backgroundImage) {
                var image, url, _c, path, x, y, width, height, pattern, _d, path, x, y, width, height, _e, lineLength, x0, x1, y0, y1, canvas, ctx, gradient_1, pattern, _f, path, left, top_1, width, height, position, x, y, _g, rx, ry, radialGradient_1, midX, midY, f, invF;
                return __generator(this, function (_h) {
                  switch (_h.label) {
                    case 0:
                      if (!(backgroundImage.type === 0 /* URL */)) return [3 /*break*/, 5];
                      image = void 0;
                      url = backgroundImage.url;
                      _h.label = 1;
                    case 1:
                      _h.trys.push([1, 3,, 4]);
                      return [4 /*yield*/, this_1.context.cache.match(url)];
                    case 2:
                      image = _h.sent();
                      return [3 /*break*/, 4];
                    case 3:
                      _h.sent();
                      this_1.context.logger.error("Error loading background-image " + url);
                      return [3 /*break*/, 4];
                    case 4:
                      if (image) {
                        _c = calculateBackgroundRendering(container, index, [image.width, image.height, image.width / image.height]), path = _c[0], x = _c[1], y = _c[2], width = _c[3], height = _c[4];
                        pattern = this_1.ctx.createPattern(this_1.resizeImage(image, width, height), 'repeat');
                        this_1.renderRepeat(path, pattern, x, y);
                      }
                      return [3 /*break*/, 6];
                    case 5:
                      if (isLinearGradient(backgroundImage)) {
                        _d = calculateBackgroundRendering(container, index, [null, null, null]), path = _d[0], x = _d[1], y = _d[2], width = _d[3], height = _d[4];
                        _e = calculateGradientDirection(backgroundImage.angle, width, height), lineLength = _e[0], x0 = _e[1], x1 = _e[2], y0 = _e[3], y1 = _e[4];
                        canvas = document.createElement('canvas');
                        canvas.width = width;
                        canvas.height = height;
                        ctx = canvas.getContext('2d');
                        gradient_1 = ctx.createLinearGradient(x0, y0, x1, y1);
                        processColorStops(backgroundImage.stops, lineLength).forEach(function (colorStop) {
                          return gradient_1.addColorStop(colorStop.stop, asString(colorStop.color));
                        });
                        ctx.fillStyle = gradient_1;
                        ctx.fillRect(0, 0, width, height);
                        if (width > 0 && height > 0) {
                          pattern = this_1.ctx.createPattern(canvas, 'repeat');
                          this_1.renderRepeat(path, pattern, x, y);
                        }
                      } else if (isRadialGradient(backgroundImage)) {
                        _f = calculateBackgroundRendering(container, index, [null, null, null]), path = _f[0], left = _f[1], top_1 = _f[2], width = _f[3], height = _f[4];
                        position = backgroundImage.position.length === 0 ? [FIFTY_PERCENT] : backgroundImage.position;
                        x = getAbsoluteValue(position[0], width);
                        y = getAbsoluteValue(position[position.length - 1], height);
                        _g = calculateRadius(backgroundImage, x, y, width, height), rx = _g[0], ry = _g[1];
                        if (rx > 0 && ry > 0) {
                          radialGradient_1 = this_1.ctx.createRadialGradient(left + x, top_1 + y, 0, left + x, top_1 + y, rx);
                          processColorStops(backgroundImage.stops, rx * 2).forEach(function (colorStop) {
                            return radialGradient_1.addColorStop(colorStop.stop, asString(colorStop.color));
                          });
                          this_1.path(path);
                          this_1.ctx.fillStyle = radialGradient_1;
                          if (rx !== ry) {
                            midX = container.bounds.left + 0.5 * container.bounds.width;
                            midY = container.bounds.top + 0.5 * container.bounds.height;
                            f = ry / rx;
                            invF = 1 / f;
                            this_1.ctx.save();
                            this_1.ctx.translate(midX, midY);
                            this_1.ctx.transform(1, 0, 0, f, 0, 0);
                            this_1.ctx.translate(-midX, -midY);
                            this_1.ctx.fillRect(left, invF * (top_1 - midY) + midY, width, height * invF);
                            this_1.ctx.restore();
                          } else {
                            this_1.ctx.fill();
                          }
                        }
                      }
                      _h.label = 6;
                    case 6:
                      index--;
                      return [2 /*return*/];
                  }
                });
              };

              this_1 = this;
              _i = 0, _a = container.styles.backgroundImage.slice(0).reverse();
              _b.label = 1;
            case 1:
              if (!(_i < _a.length)) return [3 /*break*/, 4];
              backgroundImage = _a[_i];
              return [5 /*yield**/, _loop_1(backgroundImage)];
            case 2:
              _b.sent();
              _b.label = 3;
            case 3:
              _i++;
              return [3 /*break*/, 1];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    };

    CanvasRenderer.prototype.renderSolidBorder = function (color, side, curvePoints) {
      return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
          this.path(parsePathForBorder(curvePoints, side));
          this.ctx.fillStyle = asString(color);
          this.ctx.fill();
          return [2 /*return*/];
        });
      });
    };

    CanvasRenderer.prototype.renderDoubleBorder = function (color, width, side, curvePoints) {
      return __awaiter(this, void 0, void 0, function () {
        var outerPaths, innerPaths;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!(width < 3)) return [3 /*break*/, 2];
              return [4 /*yield*/, this.renderSolidBorder(color, side, curvePoints)];
            case 1:
              _a.sent();
              return [2 /*return*/];
            case 2:
              outerPaths = parsePathForBorderDoubleOuter(curvePoints, side);
              this.path(outerPaths);
              this.ctx.fillStyle = asString(color);
              this.ctx.fill();
              innerPaths = parsePathForBorderDoubleInner(curvePoints, side);
              this.path(innerPaths);
              this.ctx.fill();
              return [2 /*return*/];
          }
        });
      });
    };

    CanvasRenderer.prototype.renderNodeBackgroundAndBorders = function (paint) {
      return __awaiter(this, void 0, void 0, function () {
        var styles, hasBackground, borders, backgroundPaintingArea, side, _i, borders_1, border;
        var _this = this;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              this.applyEffects(paint.getEffects(2 /* BACKGROUND_BORDERS */));
              styles = paint.container.styles;
              hasBackground = !isTransparent(styles.backgroundColor) || styles.backgroundImage.length;
              borders = [{
                style: styles.borderTopStyle,
                color: styles.borderTopColor,
                width: styles.borderTopWidth
              }, {
                style: styles.borderRightStyle,
                color: styles.borderRightColor,
                width: styles.borderRightWidth
              }, {
                style: styles.borderBottomStyle,
                color: styles.borderBottomColor,
                width: styles.borderBottomWidth
              }, {
                style: styles.borderLeftStyle,
                color: styles.borderLeftColor,
                width: styles.borderLeftWidth
              }];
              backgroundPaintingArea = calculateBackgroundCurvedPaintingArea(getBackgroundValueForIndex(styles.backgroundClip, 0), paint.curves);
              if (!(hasBackground || styles.boxShadow.length)) return [3 /*break*/, 2];
              this.ctx.save();
              this.path(backgroundPaintingArea);
              this.ctx.clip();
              if (!isTransparent(styles.backgroundColor)) {
                this.ctx.fillStyle = asString(styles.backgroundColor);
                this.ctx.fill();
              }
              return [4 /*yield*/, this.renderBackgroundImage(paint.container)];
            case 1:
              _a.sent();
              this.ctx.restore();
              styles.boxShadow.slice(0).reverse().forEach(function (shadow) {
                _this.ctx.save();
                var borderBoxArea = calculateBorderBoxPath(paint.curves);
                var maskOffset = shadow.inset ? 0 : MASK_OFFSET;
                var shadowPaintingArea = transformPath(borderBoxArea, -maskOffset + (shadow.inset ? 1 : -1) * shadow.spread.number, (shadow.inset ? 1 : -1) * shadow.spread.number, shadow.spread.number * (shadow.inset ? -2 : 2), shadow.spread.number * (shadow.inset ? -2 : 2));
                if (shadow.inset) {
                  _this.path(borderBoxArea);
                  _this.ctx.clip();
                  _this.mask(shadowPaintingArea);
                } else {
                  _this.mask(borderBoxArea);
                  _this.ctx.clip();
                  _this.path(shadowPaintingArea);
                }
                _this.ctx.shadowOffsetX = shadow.offsetX.number + maskOffset;
                _this.ctx.shadowOffsetY = shadow.offsetY.number;
                _this.ctx.shadowColor = asString(shadow.color);
                _this.ctx.shadowBlur = shadow.blur.number;
                _this.ctx.fillStyle = shadow.inset ? asString(shadow.color) : 'rgba(0,0,0,1)';
                _this.ctx.fill();
                _this.ctx.restore();
              });
              _a.label = 2;
            case 2:
              side = 0;
              _i = 0, borders_1 = borders;
              _a.label = 3;
            case 3:
              if (!(_i < borders_1.length)) return [3 /*break*/, 13];
              border = borders_1[_i];
              if (!(border.style !== 0 /* NONE */ && !isTransparent(border.color) && border.width > 0)) return [3 /*break*/, 11];
              if (!(border.style === 2 /* DASHED */)) return [3 /*break*/, 5];
              return [4 /*yield*/, this.renderDashedDottedBorder(border.color, border.width, side, paint.curves, 2 /* DASHED */)];
            case 4:
              _a.sent();
              return [3 /*break*/, 11];
            case 5:
              if (!(border.style === 3 /* DOTTED */)) return [3 /*break*/, 7];
              return [4 /*yield*/, this.renderDashedDottedBorder(border.color, border.width, side, paint.curves, 3 /* DOTTED */)];
            case 6:
              _a.sent();
              return [3 /*break*/, 11];
            case 7:
              if (!(border.style === 4 /* DOUBLE */)) return [3 /*break*/, 9];
              return [4 /*yield*/, this.renderDoubleBorder(border.color, border.width, side, paint.curves)];
            case 8:
              _a.sent();
              return [3 /*break*/, 11];
            case 9:
              return [4 /*yield*/, this.renderSolidBorder(border.color, side, paint.curves)];
            case 10:
              _a.sent();
              _a.label = 11;
            case 11:
              side++;
              _a.label = 12;
            case 12:
              _i++;
              return [3 /*break*/, 3];
            case 13:
              return [2 /*return*/];
          }
        });
      });
    };

    CanvasRenderer.prototype.renderDashedDottedBorder = function (color, width, side, curvePoints, style) {
      return __awaiter(this, void 0, void 0, function () {
        var strokePaths, boxPaths, startX, startY, endX, endY, length, dashLength, spaceLength, useLineDash, multiplier, numberOfDashes, minSpace, maxSpace, path1, path2, path1, path2;
        return __generator(this, function (_a) {
          this.ctx.save();
          strokePaths = parsePathForBorderStroke(curvePoints, side);
          boxPaths = parsePathForBorder(curvePoints, side);
          if (style === 2 /* DASHED */) {
            this.path(boxPaths);
            this.ctx.clip();
          }
          if (isBezierCurve(boxPaths[0])) {
            startX = boxPaths[0].start.x;
            startY = boxPaths[0].start.y;
          } else {
            startX = boxPaths[0].x;
            startY = boxPaths[0].y;
          }
          if (isBezierCurve(boxPaths[1])) {
            endX = boxPaths[1].end.x;
            endY = boxPaths[1].end.y;
          } else {
            endX = boxPaths[1].x;
            endY = boxPaths[1].y;
          }
          if (side === 0 || side === 2) {
            length = Math.abs(startX - endX);
          } else {
            length = Math.abs(startY - endY);
          }
          this.ctx.beginPath();
          if (style === 3 /* DOTTED */) {
            this.formatPath(strokePaths);
          } else {
            this.formatPath(boxPaths.slice(0, 2));
          }
          dashLength = width < 3 ? width * 3 : width * 2;
          spaceLength = width < 3 ? width * 2 : width;
          if (style === 3 /* DOTTED */) {
            dashLength = width;
            spaceLength = width;
          }
          useLineDash = true;
          if (length <= dashLength * 2) {
            useLineDash = false;
          } else if (length <= dashLength * 2 + spaceLength) {
            multiplier = length / (2 * dashLength + spaceLength);
            dashLength *= multiplier;
            spaceLength *= multiplier;
          } else {
            numberOfDashes = Math.floor((length + spaceLength) / (dashLength + spaceLength));
            minSpace = (length - numberOfDashes * dashLength) / (numberOfDashes - 1);
            maxSpace = (length - (numberOfDashes + 1) * dashLength) / numberOfDashes;
            spaceLength = maxSpace <= 0 || Math.abs(spaceLength - minSpace) < Math.abs(spaceLength - maxSpace) ? minSpace : maxSpace;
          }
          if (useLineDash) {
            if (style === 3 /* DOTTED */) {
              this.ctx.setLineDash([0, dashLength + spaceLength]);
            } else {
              this.ctx.setLineDash([dashLength, spaceLength]);
            }
          }
          if (style === 3 /* DOTTED */) {
            this.ctx.lineCap = 'round';
            this.ctx.lineWidth = width;
          } else {
            this.ctx.lineWidth = width * 2 + 1.1;
          }
          this.ctx.strokeStyle = asString(color);
          this.ctx.stroke();
          this.ctx.setLineDash([]);
          // dashed round edge gap
          if (style === 2 /* DASHED */) {
            if (isBezierCurve(boxPaths[0])) {
              path1 = boxPaths[3];
              path2 = boxPaths[0];
              this.ctx.beginPath();
              this.formatPath([new Vector(path1.end.x, path1.end.y), new Vector(path2.start.x, path2.start.y)]);
              this.ctx.stroke();
            }
            if (isBezierCurve(boxPaths[1])) {
              path1 = boxPaths[1];
              path2 = boxPaths[2];
              this.ctx.beginPath();
              this.formatPath([new Vector(path1.end.x, path1.end.y), new Vector(path2.start.x, path2.start.y)]);
              this.ctx.stroke();
            }
          }
          this.ctx.restore();
          return [2 /*return*/];
        });
      });
    };

    CanvasRenderer.prototype.render = function (element) {
      return __awaiter(this, void 0, void 0, function () {
        var stack;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (this.options.backgroundColor) {
                this.ctx.fillStyle = asString(this.options.backgroundColor);
                this.ctx.fillRect(this.options.x, this.options.y, this.options.width, this.options.height);
              }
              stack = parseStackingContexts(element);
              return [4 /*yield*/, this.renderStack(stack)];
            case 1:
              _a.sent();
              this.applyEffects([]);
              return [2 /*return*/, this.canvas];
          }
        });
      });
    };
    return CanvasRenderer;
  }(Renderer);
  var isTextInputElement = function isTextInputElement(container) {
    if (container instanceof TextareaElementContainer) {
      return true;
    } else if (container instanceof SelectElementContainer) {
      return true;
    } else if (container instanceof InputElementContainer && container.type !== RADIO && container.type !== CHECKBOX) {
      return true;
    }
    return false;
  };
  var calculateBackgroundCurvedPaintingArea = function calculateBackgroundCurvedPaintingArea(clip, curves) {
    switch (clip) {
      case 0 /* BORDER_BOX */:
        return calculateBorderBoxPath(curves);
      case 2 /* CONTENT_BOX */:
        return calculateContentBoxPath(curves);
      case 1 /* PADDING_BOX */:
      default:
        return calculatePaddingBoxPath(curves);
    }
  };
  var canvasTextAlign = function canvasTextAlign(textAlign) {
    switch (textAlign) {
      case 1 /* CENTER */:
        return 'center';
      case 2 /* RIGHT */:
        return 'right';
      case 0 /* LEFT */:
      default:
        return 'left';
    }
  };
  // see https://github.com/niklasvh/html2canvas/pull/2645
  var iOSBrokenFonts = ['-apple-system', 'system-ui'];
  var fixIOSSystemFonts = function fixIOSSystemFonts(fontFamilies) {
    return /iPhone OS 15_(0|1)/.test(window.navigator.userAgent) ? fontFamilies.filter(function (fontFamily) {
      return iOSBrokenFonts.indexOf(fontFamily) === -1;
    }) : fontFamilies;
  };
  var ForeignObjectRenderer = /** @class */function (_super) {
    __extends(ForeignObjectRenderer, _super);
    function ForeignObjectRenderer(context, options) {
      var _this = _super.call(this, context, options) || this;
      _this.canvas = options.canvas ? options.canvas : document.createElement('canvas');
      _this.ctx = _this.canvas.getContext('2d');
      _this.options = options;
      _this.canvas.width = Math.floor(options.width * options.scale);
      _this.canvas.height = Math.floor(options.height * options.scale);
      _this.canvas.style.width = options.width + "px";
      _this.canvas.style.height = options.height + "px";
      _this.ctx.scale(_this.options.scale, _this.options.scale);
      _this.ctx.translate(-options.x, -options.y);
      _this.context.logger.debug("EXPERIMENTAL ForeignObject renderer initialized (" + options.width + "x" + options.height + " at " + options.x + "," + options.y + ") with scale " + options.scale);
      return _this;
    }
    ForeignObjectRenderer.prototype.render = function (element) {
      return __awaiter(this, void 0, void 0, function () {
        var svg, img;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              svg = createForeignObjectSVG(this.options.width * this.options.scale, this.options.height * this.options.scale, this.options.scale, this.options.scale, element);
              return [4 /*yield*/, loadSerializedSVG(svg)];
            case 1:
              img = _a.sent();
              if (this.options.backgroundColor) {
                this.ctx.fillStyle = asString(this.options.backgroundColor);
                this.ctx.fillRect(0, 0, this.options.width * this.options.scale, this.options.height * this.options.scale);
              }
              this.ctx.drawImage(img, -this.options.x * this.options.scale, -this.options.y * this.options.scale);
              return [2 /*return*/, this.canvas];
          }
        });
      });
    };
    return ForeignObjectRenderer;
  }(Renderer);
  var loadSerializedSVG = function loadSerializedSVG(svg) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        resolve(img);
      };
      img.onerror = reject;
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(svg));
    });
  };
  var Logger = /** @class */function () {
    function Logger(_a) {
      var id = _a.id,
        enabled = _a.enabled;
      this.id = id;
      this.enabled = enabled;
      this.start = Date.now();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Logger.prototype.debug = function () {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      if (this.enabled) {
        // eslint-disable-next-line no-console
        if (typeof window !== 'undefined' && window.console && typeof console.debug === 'function') {
          // eslint-disable-next-line no-console
          console.debug.apply(console, __spreadArray([this.id, this.getTime() + "ms"], args));
        } else {
          this.info.apply(this, args);
        }
      }
    };
    Logger.prototype.getTime = function () {
      return Date.now() - this.start;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Logger.prototype.info = function () {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      if (this.enabled) {
        // eslint-disable-next-line no-console
        if (typeof window !== 'undefined' && window.console && typeof console.info === 'function') {
          // eslint-disable-next-line no-console
          console.info.apply(console, __spreadArray([this.id, this.getTime() + "ms"], args));
        }
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Logger.prototype.warn = function () {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      if (this.enabled) {
        // eslint-disable-next-line no-console
        if (typeof window !== 'undefined' && window.console && typeof console.warn === 'function') {
          // eslint-disable-next-line no-console
          console.warn.apply(console, __spreadArray([this.id, this.getTime() + "ms"], args));
        } else {
          this.info.apply(this, args);
        }
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Logger.prototype.error = function () {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      if (this.enabled) {
        // eslint-disable-next-line no-console
        if (typeof window !== 'undefined' && window.console && typeof console.error === 'function') {
          // eslint-disable-next-line no-console
          console.error.apply(console, __spreadArray([this.id, this.getTime() + "ms"], args));
        } else {
          this.info.apply(this, args);
        }
      }
    };
    Logger.instances = {};
    return Logger;
  }();
  var Context = /** @class */function () {
    function Context(options, windowBounds) {
      var _a;
      this.windowBounds = windowBounds;
      this.instanceName = "#" + Context.instanceCount++;
      this.logger = new Logger({
        id: this.instanceName,
        enabled: options.logging
      });
      this.cache = (_a = options.cache) !== null && _a !== void 0 ? _a : new Cache(this, options);
    }
    Context.instanceCount = 1;
    return Context;
  }();
  var html2canvas = function html2canvas(element, options) {
    if (options === void 0) {
      options = {};
    }
    return renderElement(element, options);
  };
  if (typeof window !== 'undefined') {
    CacheStorage.setContext(window);
  }
  var renderElement = function renderElement(element, opts) {
    return __awaiter(void 0, void 0, void 0, function () {
      var ownerDocument, defaultView, resourceOptions, contextOptions, windowOptions, windowBounds, context, foreignObjectRendering, cloneOptions, documentCloner, clonedElement, container, _a, width, height, left, top, backgroundColor, renderOptions, canvas, renderer, root, renderer;
      var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
      return __generator(this, function (_u) {
        switch (_u.label) {
          case 0:
            if (!element || _typeof(element) !== 'object') {
              return [2 /*return*/, Promise.reject('Invalid element provided as first argument')];
            }
            ownerDocument = element.ownerDocument;
            if (!ownerDocument) {
              throw new Error("Element is not attached to a Document");
            }
            defaultView = ownerDocument.defaultView;
            if (!defaultView) {
              throw new Error("Document is not attached to a Window");
            }
            resourceOptions = {
              allowTaint: (_b = opts.allowTaint) !== null && _b !== void 0 ? _b : false,
              imageTimeout: (_c = opts.imageTimeout) !== null && _c !== void 0 ? _c : 15000,
              proxy: opts.proxy,
              useCORS: (_d = opts.useCORS) !== null && _d !== void 0 ? _d : false
            };
            contextOptions = _assign({
              logging: (_e = opts.logging) !== null && _e !== void 0 ? _e : true,
              cache: opts.cache
            }, resourceOptions);
            windowOptions = {
              windowWidth: (_f = opts.windowWidth) !== null && _f !== void 0 ? _f : defaultView.innerWidth,
              windowHeight: (_g = opts.windowHeight) !== null && _g !== void 0 ? _g : defaultView.innerHeight,
              scrollX: (_h = opts.scrollX) !== null && _h !== void 0 ? _h : defaultView.pageXOffset,
              scrollY: (_j = opts.scrollY) !== null && _j !== void 0 ? _j : defaultView.pageYOffset
            };
            windowBounds = new Bounds(windowOptions.scrollX, windowOptions.scrollY, windowOptions.windowWidth, windowOptions.windowHeight);
            context = new Context(contextOptions, windowBounds);
            foreignObjectRendering = (_k = opts.foreignObjectRendering) !== null && _k !== void 0 ? _k : false;
            cloneOptions = {
              allowTaint: (_l = opts.allowTaint) !== null && _l !== void 0 ? _l : false,
              onclone: opts.onclone,
              ignoreElements: opts.ignoreElements,
              inlineImages: foreignObjectRendering,
              copyStyles: foreignObjectRendering
            };
            context.logger.debug("Starting document clone with size " + windowBounds.width + "x" + windowBounds.height + " scrolled to " + -windowBounds.left + "," + -windowBounds.top);
            documentCloner = new DocumentCloner(context, element, cloneOptions);
            clonedElement = documentCloner.clonedReferenceElement;
            if (!clonedElement) {
              return [2 /*return*/, Promise.reject("Unable to find element in cloned iframe")];
            }
            return [4 /*yield*/, documentCloner.toIFrame(ownerDocument, windowBounds)];
          case 1:
            container = _u.sent();
            _a = isBodyElement(clonedElement) || isHTMLElement(clonedElement) ? parseDocumentSize(clonedElement.ownerDocument) : parseBounds(context, clonedElement), width = _a.width, height = _a.height, left = _a.left, top = _a.top;
            backgroundColor = parseBackgroundColor(context, clonedElement, opts.backgroundColor);
            renderOptions = {
              canvas: opts.canvas,
              backgroundColor: backgroundColor,
              scale: (_o = (_m = opts.scale) !== null && _m !== void 0 ? _m : defaultView.devicePixelRatio) !== null && _o !== void 0 ? _o : 1,
              x: ((_p = opts.x) !== null && _p !== void 0 ? _p : 0) + left,
              y: ((_q = opts.y) !== null && _q !== void 0 ? _q : 0) + top,
              width: (_r = opts.width) !== null && _r !== void 0 ? _r : Math.ceil(width),
              height: (_s = opts.height) !== null && _s !== void 0 ? _s : Math.ceil(height)
            };
            if (!foreignObjectRendering) return [3 /*break*/, 3];
            context.logger.debug("Document cloned, using foreign object rendering");
            renderer = new ForeignObjectRenderer(context, renderOptions);
            return [4 /*yield*/, renderer.render(clonedElement)];
          case 2:
            canvas = _u.sent();
            return [3 /*break*/, 5];
          case 3:
            context.logger.debug("Document cloned, element located at " + left + "," + top + " with size " + width + "x" + height + " using computed rendering");
            context.logger.debug("Starting DOM parsing");
            root = parseTree(context, clonedElement);
            if (backgroundColor === root.styles.backgroundColor) {
              root.styles.backgroundColor = COLORS.TRANSPARENT;
            }
            context.logger.debug("Starting renderer for element at " + renderOptions.x + "," + renderOptions.y + " with size " + renderOptions.width + "x" + renderOptions.height);
            renderer = new CanvasRenderer(context, renderOptions);
            return [4 /*yield*/, renderer.render(root)];
          case 4:
            canvas = _u.sent();
            _u.label = 5;
          case 5:
            if ((_t = opts.removeContainer) !== null && _t !== void 0 ? _t : true) {
              if (!DocumentCloner.destroy(container)) {
                context.logger.error("Cannot detach cloned iframe as it is not in the DOM anymore");
              }
            }
            context.logger.debug("Finished rendering");
            return [2 /*return*/, canvas];
        }
      });
    });
  };
  var parseBackgroundColor = function parseBackgroundColor(context, element, backgroundColorOverride) {
    var ownerDocument = element.ownerDocument;
    // http://www.w3.org/TR/css3-background/#special-backgrounds
    var documentBackgroundColor = ownerDocument.documentElement ? parseColor(context, getComputedStyle(ownerDocument.documentElement).backgroundColor) : COLORS.TRANSPARENT;
    var bodyBackgroundColor = ownerDocument.body ? parseColor(context, getComputedStyle(ownerDocument.body).backgroundColor) : COLORS.TRANSPARENT;
    var defaultBackgroundColor = typeof backgroundColorOverride === 'string' ? parseColor(context, backgroundColorOverride) : backgroundColorOverride === null ? COLORS.TRANSPARENT : 0xffffffff;
    return element === ownerDocument.documentElement ? isTransparent(documentBackgroundColor) ? isTransparent(bodyBackgroundColor) ? defaultBackgroundColor : bodyBackgroundColor : documentBackgroundColor : defaultBackgroundColor;
  };
  return html2canvas;
});
},{}],"scripts/index.js":[function(require,module,exports) {
"use strict";

var _heatmap = _interopRequireWildcard(require("heatmap.js"));
require("regenerator-runtime/runtime");
var _easySeeso = _interopRequireDefault(require("seeso/easy-seeso"));
var _showGaze = _interopRequireDefault(require("../showGaze"));
var _html2canvas = _interopRequireDefault(require("html2canvas"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, defineProperty = Object.defineProperty || function (obj, key, desc) { obj[key] = desc.value; }, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) }), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; defineProperty(this, "_invoke", { value: function value(method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; } function maybeInvokeDelegate(delegate, context) { var methodName = context.method, method = delegate.iterator[methodName]; if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator.return && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel; var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), defineProperty(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (val) { var object = Object(val), keys = []; for (var key in object) keys.push(key); return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, catch: function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
var licenseKey = "dev_fbpjqcqmqji0bq6asinisgv2tzv6ybwaikbnzlw4";
var dataset = [];
var heatmapInstance = _heatmap.default.create({
  container: document.getElementById("heatMap"),
  gradient: {
    ".25": "blue",
    ".5": "green",
    ".75": "yellow",
    ".9": "red"
  }
});
function createHeatmap(gazeInfo) {
  // console.log(gazeInfo);
  heatmapInstance.setDataMax(100);
  if (gazeInfo.trackingState < 2 && gazeInfo.eyemovementState < 3) {
    dataset.push({
      x: gazeInfo.x,
      y: gazeInfo.y,
      value: 25
    });
  }
}
function createHM(gazeInfo) {
  heatmapInstance.setDataMax(100);
  // if(gazeInfo.trackingState === 0 && gazeInfo.eyemovementState != 3){
  //   console.log(gazeInfo);
  //   heatmapInstance.addData({
  //     x: gazeInfo.x,
  //     y: gazeInfo.y,
  //     value: 25,
  //   });
  // }
  heatmapInstance.addData({
    x: gazeInfo.x,
    y: gazeInfo.y,
    value: 25
  });
}
function onClickCalibrationBtn() {
  var userId = "YOUR_USER_ID";
  // Next Page after calibration
  var redirectUrl = "http://localhost:8082";
  var calibrationPoint = 5;
  _easySeeso.default.openCalibrationPage(licenseKey, userId, redirectUrl, calibrationPoint);
}
function onClickNextBtn() {
  console.log(dataset);
  heatmapInstance.setData({
    max: 100,
    min: 10,
    data: dataset
  });
  // Show Btn
  document.getElementById("finBtn").style.display = "none";
  document.getElementById("saveBtn").style.display = "block";
  document.getElementById("compBtn").style.display = "block";
}
function onClickSave() {
  var screenshot = document.getElementById("heatMap");
  (0, _html2canvas.default)(screenshot).then(function (canvas) {
    var a = document.createElement("a");
    a.href = canvas.toDataURL();
    a.download = "heatmap_" + new Date().toJSON().slice(0, 10) + "_screenshot.jpg";
    a.click();
  });
}
function onClickComp() {
  location.href = "../";
}

// in redirected page
function parseCalibrationDataInQueryString() {
  var href = window.location.href;
  var decodedURI = decodeURI(href);
  var queryString = decodedURI.split("?")[1];
  if (!queryString) return undefined;
  var jsonString = queryString.slice("calibrationData=".length, queryString.length);
  return jsonString;
}

// gaze callback.
function onGaze(gazeInfo) {
  // do something with gaze info.
  (0, _showGaze.default)(gazeInfo);
  createHM(gazeInfo);
  createHeatmap(gazeInfo);
}

// debug callback.
function onDebug(FPS, latency_min, latency_max, latency_avg) {
  // do something with debug info.
}
function main() {
  return _main.apply(this, arguments);
}
function _main() {
  _main = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
    var calibrationData, seeSo, finButton, calibrationButton, saveButton, compButton;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          calibrationData = parseCalibrationDataInQueryString();
          if (!calibrationData) {
            _context3.next = 9;
            break;
          }
          seeSo = new _easySeeso.default();
          _context3.next = 5;
          return seeSo.init(licenseKey, /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
            return _regeneratorRuntime().wrap(function _callee2$(_context2) {
              while (1) switch (_context2.prev = _context2.next) {
                case 0:
                  _context2.next = 2;
                  return seeSo.setCalibrationData(calibrationData);
                case 2:
                  _context2.next = 4;
                  return seeSo.startTracking(onGaze, onDebug);
                case 4:
                case "end":
                  return _context2.stop();
              }
            }, _callee2);
          })),
          // callback when init succeeded.
          function () {
            return console.log("callback when init failed.");
          } // callback when init failed.
          );
        case 5:
          finButton = document.getElementById("finBtn");
          finButton.addEventListener("click", function () {
            console.log("stop tracking");
            onClickNextBtn();
            seeSo.stopTracking();
          });
          _context3.next = 12;
          break;
        case 9:
          console.log("No calibration data given.");
          calibrationButton = document.getElementById("calibrationButton");
          calibrationButton.addEventListener("click", onClickCalibrationBtn);
        case 12:
          saveButton = document.getElementById("saveBtn");
          saveButton.addEventListener("click", onClickSave);
          compButton = document.getElementById("compBtn");
          compButton.addEventListener("click", onClickComp);
        case 16:
        case "end":
          return _context3.stop();
      }
    }, _callee3);
  }));
  return _main.apply(this, arguments);
}
_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
  return _regeneratorRuntime().wrap(function _callee$(_context) {
    while (1) switch (_context.prev = _context.next) {
      case 0:
        _context.next = 2;
        return main();
      case 2:
      case "end":
        return _context.stop();
    }
  }, _callee);
}))();
},{"heatmap.js":"../../node_modules/heatmap.js/build/heatmap.js","regenerator-runtime/runtime":"../../node_modules/regenerator-runtime/runtime.js","seeso/easy-seeso":"../../node_modules/seeso/easy-seeso.js","../showGaze":"showGaze.js","html2canvas":"../../node_modules/html2canvas/dist/html2canvas.js"}],"../../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;
function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}
module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "51459" + '/');
  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);
    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);
          if (didAccept) {
            handled = true;
          }
        }
      });

      // Enable HMR for CSS by default.
      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });
      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }
    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      };
    }
    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }
    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}
function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
}
function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;

  // html encode message and stack trace
  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}
function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }
  var parents = [];
  var k, d, dep;
  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }
  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }
  return parents;
}
function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }
  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}
function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }
  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }
  if (checkedAssets[id]) {
    return;
  }
  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }
  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}
function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};
  if (cached) {
    cached.hot.data = bundle.hotData;
  }
  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }
  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });
    return true;
  }
}
},{}]},{},["../../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","scripts/index.js"], null)
//# sourceMappingURL=/scripts.bcf3243b.js.map