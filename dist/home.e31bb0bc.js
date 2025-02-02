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
})({"../../../node_modules/regenerator-runtime/runtime.js":[function(require,module,exports) {
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

},{}],"../../../node_modules/seeso/dist/seeso.js":[function(require,module,exports) {
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
},{}],"../../../node_modules/seeso/easy-seeso.js":[function(require,module,exports) {
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
},{"seeso":"../../../node_modules/seeso/dist/seeso.js"}],"../showGaze.js":[function(require,module,exports) {
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
  var canvas = document.getElementById("output");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = '#FF0000';
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.arc(gazeInfo.x, gazeInfo.y, 10, 0, Math.PI * 2, true);
  ctx.fill();
}
function showGaze(gazeInfo) {
  showGazeInfoOnDom(gazeInfo);
  showGazeDotOnDom(gazeInfo);
}
var _default = showGaze;
exports.default = _default;
},{}],"index.js":[function(require,module,exports) {
"use strict";

require("regenerator-runtime/runtime");
var _easySeeso = _interopRequireDefault(require("seeso/easy-seeso"));
var _showGaze = _interopRequireDefault(require("../showGaze"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, defineProperty = Object.defineProperty || function (obj, key, desc) { obj[key] = desc.value; }, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) }), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; defineProperty(this, "_invoke", { value: function value(method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; } function maybeInvokeDelegate(delegate, context) { var methodName = context.method, method = delegate.iterator[methodName]; if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator.return && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel; var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), defineProperty(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (val) { var object = Object(val), keys = []; for (var key in object) keys.push(key); return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, catch: function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
var licenseKey = "dev_fbpjqcqmqji0bq6asinisgv2tzv6ybwaikbnzlw4";
function onClickCalibrationBtn() {
  var userId = "YOUR_USER_ID";
  // Next Page after calibration
  var redirectUrl = "http://localhost:8082/evaluate";
  var calibrationPoint = 1;
  _easySeeso.default.openCalibrationPage(licenseKey, userId, redirectUrl, calibrationPoint);
}
function onClickNextBtn() {
  window.location.replace('../evaluation/index.html');
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
    var calibrationData, seeSo, nextButton, calibrationButton;
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
                  return seeSo.startTracking(onGaze, onDebug);
                case 2:
                  _context2.next = 4;
                  return seeSo.setCalibrationData(calibrationData);
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
          nextButton = document.getElementById("nextButton");
          nextButton.addEventListener("click", onClickNextBtn);
          _context3.next = 12;
          break;
        case 9:
          console.log("No calibration data given.");
          calibrationButton = document.getElementById("calibrationButton");
          calibrationButton.addEventListener("click", onClickCalibrationBtn);
        case 12:
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
},{"regenerator-runtime/runtime":"../../../node_modules/regenerator-runtime/runtime.js","seeso/easy-seeso":"../../../node_modules/seeso/easy-seeso.js","../showGaze":"../showGaze.js"}],"../../../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "57932" + '/');
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
},{}]},{},["../../../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/home.e31bb0bc.js.map