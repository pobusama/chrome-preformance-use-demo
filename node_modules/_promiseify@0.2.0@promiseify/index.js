'use strict';

/**
 * promiseify
 * @param {function} method function
 * @param {object} ctx optional ctx for method
 */
function promiseify(method, ctx) {

  return function() {

    var args = [].slice.call(arguments);
    return new Promise(function(resolve, reject) {

      args.push(function(err) {
        if (err) {
          return reject(err);
        }
        var arg = [].slice.call(arguments);
        if (arg.length === 2) {
          resolve.call(this, arg[1]);
        } else {
          resolve.call(this, arg.slice(1));
        }
      });

      try {
        method.apply(ctx, args);
      } catch (err) {
        reject(new TypeError(String(method) + ' is not a function'));
      }
    });
  };
}

module.exports = promiseify;
