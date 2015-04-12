var exp_fjs = (function () {
    "use strict";

    var fjs = {};

    fjs.life = function() {
        return "drøle";
    };

    return fjs;
})();

if (typeof (exports) !== "undefined") {
    if (typeof (module) !== "undefined" && module.exports) {
        exports = module.exports = exp_fjs;
    }
    exports.fjs = exp_fjs;
}
