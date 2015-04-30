#!/usr/local/bin/node
"use strict";

var readline = require("readline");
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function isSubsetOf(subset, superset) {
    if (!subset) {
        return true;
    }
    return subset.replace(" ", "").split(",").every(function(v) {
        return superset.indexOf(v) >= 0;
    });
}

rl.on("line", function(line) {
    if (line.charAt(0) !== "{") {
        return;
    }
    var parsedLine = JSON.parse(line);
    var tags = parsedLine.tags || [];
    if (isSubsetOf(process.argv[2], tags)) {
        delete parsedLine.tags;
        console.log(JSON.stringify(parsedLine));
    }
}).on("close", function() {
    process.exit(0);
});
