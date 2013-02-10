var ga = require('../index');

var graph = {1:[2,3], 2:[4], 4:[6], 3:[1,5], 5:[4]};

function later(which) {
    var self = this, args = [].slice.call(arguments, 1);
    setTimeout(function() {
        if (which) which.apply(self, args);
    }, Math.random() * 1);
}

var moves = function(depth, n, cb) { 
    if (depth > 20) 
        return later(cb, null, []);
    return later(cb, null, graph[n]); 
};

var goal = function(g) { return function(n, cb) { return cb(null, g == n); } };

function makeTest(g, exp, text) {
    return function(t) {
        t.expect(1);
        ga.bfs(1, moves, goal(g), function(e, res) {
            t.deepEqual(res, exp, text);
            t.done();
        });
    };
}

exports["start = end"] = makeTest(1, [1], "start is end"); 
exports["standard route"] = makeTest(6, [1,2,4,6], "stanrard route"); 
exports["no path"] = makeTest(7, null, "not found");
