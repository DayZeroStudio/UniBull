"use strict";
module.exports = {
    "timing test": function(t) {
        t.plan(2);

        t.equal(typeof Date.now, "function");
        var start = Date.now();

        setTimeout(function() {
            t.ok((Date.now() - start - 100) < 10, "setTimeout called with 10% tolerance");
        }, 100);
    }
};
