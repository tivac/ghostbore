"use strict";

var assert = require("assert");

module.exports = function wrapper(fn) {
    return function(error) {
        assert.ifError(error);

        fn.apply(null, Array.prototype.slice.call(arguments).slice(1));
    }
};
